#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import mimetypes
import os
import re
import shutil
import time
import zipfile
from collections import deque
from pathlib import Path
from typing import Optional
from urllib.parse import unquote, urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup

TIMESTAMP = "20250914214303"
PAGE_URL = "https://pickle.com/whisper"
ARCHIVE_PREFIX = f"https://web.archive.org/web/{TIMESTAMP}id_/"
OUT_ROOT = Path("output")
SITE_DIR = OUT_ROOT / "pickle-whisper-wayback-20250914214303"
ZIP_PATH = OUT_ROOT / "pickle-whisper-wayback-20250914214303.zip"
MAX_ASSETS = 1500
MAX_TOTAL_BYTES = 900 * 1024 * 1024
REQUEST_DELAY = 0.08

ASSET_EXTENSIONS = {
    ".js", ".mjs", ".cjs", ".css", ".json", ".map", ".wasm",
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp4", ".webm", ".mov", ".m4v", ".mp3", ".wav", ".ogg",
    ".pdf", ".xml", ".txt",
}

CONTENT_TYPE_EXT = {
    "text/css": ".css",
    "application/javascript": ".js",
    "text/javascript": ".js",
    "application/json": ".json",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "image/x-icon": ".ico",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
    "font/ttf": ".ttf",
    "font/otf": ".otf",
    "application/wasm": ".wasm",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "application/pdf": ".pdf",
}

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
    "Accept": "*/*",
})

manifest: list[dict] = []
url_to_local: dict[str, Path] = {}
queue: deque[tuple[str, Optional[Path], str]] = deque()
queued: set[str] = set()
total_bytes = 0

WAYBACK_RE = re.compile(r"^https?://web\.archive\.org/web/\d+(?:[a-z_]+)?/(https?://.+)$", re.I)
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\()?\s*(['\"])(.*?)\1\s*\)?", re.I)
QUOTED_ASSET_RE = re.compile(
    r"(?P<q>['\"])(?P<u>(?:https?:)?//[^'\"\\\s]+|/[^'\"\\\s]+|\.{1,2}/[^'\"\\\s]+)(?P=q)",
    re.I,
)


def strip_fragment(url: str) -> str:
    p = urlparse(url)
    return urlunparse((p.scheme, p.netloc, p.path, p.params, p.query, ""))


def unwrap_wayback(url: str) -> str:
    m = WAYBACK_RE.match(url)
    return m.group(1) if m else url


def normalize_url(raw: str, base_url: str) -> Optional[str]:
    raw = (raw or "").strip()
    if not raw or raw.startswith(("#", "data:", "blob:", "javascript:", "mailto:", "tel:")):
        return None
    raw = unwrap_wayback(raw)
    if raw.startswith("//"):
        raw = "https:" + raw
    absolute = strip_fragment(urljoin(base_url, raw))
    p = urlparse(absolute)
    if p.scheme not in {"http", "https"} or not p.netloc:
        return None
    return absolute


def archived_url(original_url: str) -> str:
    return ARCHIVE_PREFIX + original_url


def sanitize_part(part: str) -> str:
    part = unquote(part)
    part = re.sub(r"[<>:\"|?*\\]", "_", part)
    part = part.strip(" .")
    return part or "_"


def guess_local_path(original_url: str, content_type: str = "") -> Path:
    p = urlparse(original_url)
    host = sanitize_part(p.netloc.lower())
    raw_parts = [sanitize_part(x) for x in p.path.split("/") if x]
    if not raw_parts or p.path.endswith("/"):
        raw_parts.append("index")
    filename = raw_parts[-1]
    suffix = Path(filename).suffix.lower()
    if not suffix:
        ctype = content_type.split(";", 1)[0].strip().lower()
        ext = CONTENT_TYPE_EXT.get(ctype) or mimetypes.guess_extension(ctype) or ""
        filename += ext
    if p.query:
        stem = Path(filename).stem
        suffix = Path(filename).suffix
        filename = f"{stem}__q_{hashlib.sha256(p.query.encode()).hexdigest()[:10]}{suffix}"
    raw_parts[-1] = filename
    return Path("assets") / host / Path(*raw_parts)


def relpath(from_file: Path, to_file: Path) -> str:
    return Path(os.path.relpath(to_file, from_file.parent)).as_posix()


def fetch(url: str, retries: int = 4) -> requests.Response:
    last_exc: Exception | None = None
    for attempt in range(retries):
        try:
            r = session.get(url, timeout=(20, 90), allow_redirects=True)
            if r.status_code in {429, 500, 502, 503, 504}:
                time.sleep(1.5 * (attempt + 1))
                continue
            r.raise_for_status()
            return r
        except Exception as exc:
            last_exc = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Failed after {retries} attempts: {url}: {last_exc}")


def enqueue(raw_url: str, base_url: str, referring_file: Optional[Path], kind: str) -> Optional[str]:
    url = normalize_url(raw_url, base_url)
    if not url:
        return None
    if url not in queued and url not in url_to_local and len(queued) < MAX_ASSETS:
        queue.append((url, referring_file, kind))
        queued.add(url)
    return url


def extract_srcset(value: str, base_url: str, referring_file: Optional[Path], kind: str) -> list[tuple[str, str]]:
    out = []
    for item in value.split(","):
        item = item.strip()
        if not item:
            continue
        parts = item.split()
        normalized = enqueue(parts[0], base_url, referring_file, kind)
        if normalized:
            out.append((normalized, " ".join(parts[1:])))
    return out


def extension_looks_like_asset(url: str) -> bool:
    path = urlparse(url).path.lower()
    return any(path.endswith(ext) for ext in ASSET_EXTENSIONS)


def discover_in_text(text: str, base_url: str, referring_file: Path, kind: str) -> None:
    for match in QUOTED_ASSET_RE.finditer(text):
        candidate = match.group("u")
        normalized = normalize_url(candidate, base_url)
        if normalized and extension_looks_like_asset(normalized):
            enqueue(candidate, base_url, referring_file, kind)


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def rewrite_css(text: str, css_url: str, css_file: Path) -> str:
    def repl_url(m: re.Match) -> str:
        raw = m.group(2).strip()
        normalized = enqueue(raw, css_url, css_file, "css-url")
        if not normalized:
            return m.group(0)
        local = url_to_local.get(normalized)
        return f"url('{relpath(css_file, local)}')" if local else m.group(0)

    def repl_import(m: re.Match) -> str:
        raw = m.group(2).strip()
        normalized = enqueue(raw, css_url, css_file, "css-import")
        if not normalized:
            return m.group(0)
        local = url_to_local.get(normalized)
        return f"@import '{relpath(css_file, local)}'" if local else m.group(0)

    return CSS_IMPORT_RE.sub(repl_import, CSS_URL_RE.sub(repl_url, text))


def download_asset(original_url: str, kind: str) -> Optional[Path]:
    global total_bytes
    if original_url in url_to_local:
        return url_to_local[original_url]
    if len(url_to_local) >= MAX_ASSETS or total_bytes >= MAX_TOTAL_BYTES:
        return None

    archive = archived_url(original_url)
    record = {"original_url": original_url, "archive_request": archive, "kind": kind}
    try:
        response = fetch(archive)
        content = response.content
        ctype = response.headers.get("content-type", "")
        local = guess_local_path(original_url, ctype)
        target = SITE_DIR / local
        if target.exists() and url_to_local.get(original_url) != local:
            digest = hashlib.sha256(original_url.encode()).hexdigest()[:10]
            target = target.with_name(f"{target.stem}__{digest}{target.suffix}")
            local = target.relative_to(SITE_DIR)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        url_to_local[original_url] = local
        total_bytes += len(content)
        record.update({
            "status": response.status_code,
            "final_archive_url": response.url,
            "content_type": ctype,
            "bytes": len(content),
            "local_path": local.as_posix(),
        })
        manifest.append(record)

        ctype_base = ctype.split(";", 1)[0].lower()
        suffix = target.suffix.lower()
        if ctype_base == "text/css" or suffix == ".css":
            text = content.decode(response.encoding or "utf-8", errors="replace")
            for m in CSS_URL_RE.finditer(text):
                enqueue(m.group(2), original_url, local, "css-url")
            for m in CSS_IMPORT_RE.finditer(text):
                enqueue(m.group(2), original_url, local, "css-import")
        elif suffix in {".js", ".mjs", ".cjs", ".json", ".map"} or ctype_base in {
            "application/javascript", "text/javascript", "application/json"
        }:
            text = content.decode(response.encoding or "utf-8", errors="replace")
            discover_in_text(text, original_url, local, "script-reference")
        time.sleep(REQUEST_DELAY)
        return local
    except Exception as exc:
        record.update({"status": "error", "error": str(exc)})
        manifest.append(record)
        return None


def process_html(html: str):
    soup = BeautifulSoup(html, "html.parser")
    single_refs: dict[tuple[int, str], str] = {}
    srcset_refs: dict[tuple[int, str], list[tuple[str, str]]] = {}

    attr_rules = {
        "script": ["src"], "img": ["src"], "source": ["src"],
        "video": ["src", "poster"], "audio": ["src"], "track": ["src"],
        "iframe": ["src"], "embed": ["src"], "object": ["data"], "input": ["src"],
    }
    for tag_name, attrs in attr_rules.items():
        for tag in soup.find_all(tag_name):
            for attr in attrs:
                if tag.get(attr):
                    normalized = enqueue(tag[attr], PAGE_URL, None, f"html-{tag_name}-{attr}")
                    if normalized:
                        single_refs[(id(tag), attr)] = normalized

    for tag in soup.find_all("link"):
        href = tag.get("href")
        rel = {x.lower() for x in (tag.get("rel") or [])}
        if href and rel.intersection({"stylesheet", "icon", "shortcut", "preload", "modulepreload", "manifest", "apple-touch-icon"}):
            normalized = enqueue(href, PAGE_URL, None, "html-link")
            if normalized:
                single_refs[(id(tag), "href")] = normalized

    for tag in soup.find_all(["img", "source"]):
        for attr in ("srcset", "imagesrcset"):
            if tag.get(attr):
                refs = extract_srcset(tag[attr], PAGE_URL, None, f"html-{attr}")
                if refs:
                    srcset_refs[(id(tag), attr)] = refs

    for tag in soup.find_all(style=True):
        for m in CSS_URL_RE.finditer(tag.get("style", "")):
            enqueue(m.group(2), PAGE_URL, None, "inline-style")
    for style_tag in soup.find_all("style"):
        if style_tag.string:
            for m in CSS_URL_RE.finditer(style_tag.string):
                enqueue(m.group(2), PAGE_URL, None, "style-tag")

    return soup, single_refs, srcset_refs


def rewrite_html(soup, single_refs, srcset_refs) -> str:
    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            key = (id(tag), attr)
            if key in single_refs:
                local = url_to_local.get(single_refs[key])
                if local:
                    tag[attr] = local.as_posix()
            elif key in srcset_refs:
                pieces = []
                for original, descriptor in srcset_refs[key]:
                    local = url_to_local.get(original)
                    if local:
                        pieces.append(local.as_posix() + ((" " + descriptor) if descriptor else ""))
                if pieces:
                    tag[attr] = ", ".join(pieces)

        if tag.get("style"):
            def inline_repl(m: re.Match) -> str:
                normalized = normalize_url(m.group(2), PAGE_URL)
                local = url_to_local.get(normalized or "")
                return f"url('{local.as_posix()}')" if local else m.group(0)
            tag["style"] = CSS_URL_RE.sub(inline_repl, tag["style"])

    for style_tag in soup.find_all("style"):
        if style_tag.string:
            def style_repl(m: re.Match) -> str:
                normalized = normalize_url(m.group(2), PAGE_URL)
                local = url_to_local.get(normalized or "")
                return f"url('{local.as_posix()}')" if local else m.group(0)
            style_tag.string.replace_with(CSS_URL_RE.sub(style_repl, style_tag.string))

    for selector in ["#wm-ipp-base", "#wm-ipp-print", "script[src*='archive.org/_static/']", "link[href*='archive.org/_static/']"]:
        for node in soup.select(selector):
            node.decompose()
    return str(soup)


def rewrite_downloaded_css() -> None:
    for original_url, local in list(url_to_local.items()):
        path = SITE_DIR / local
        if path.suffix.lower() != ".css" or not path.exists():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        path.write_text(rewrite_css(text, original_url, local), encoding="utf-8", newline="\n")


def main() -> None:
    if SITE_DIR.exists():
        shutil.rmtree(SITE_DIR)
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    SITE_DIR.mkdir(parents=True, exist_ok=True)

    page_archive_url = archived_url(PAGE_URL)
    print(f"Fetching page: {page_archive_url}")
    page_response = fetch(page_archive_url)
    raw_html = page_response.content.decode(page_response.encoding or "utf-8", errors="replace")
    write_text(SITE_DIR / "source-original.html", raw_html)

    soup, single_refs, srcset_refs = process_html(raw_html)
    print(f"Initial assets queued: {len(queue)}")

    while queue and len(url_to_local) < MAX_ASSETS and total_bytes < MAX_TOTAL_BYTES:
        url, _referrer, kind = queue.popleft()
        download_asset(url, kind)
        if len(url_to_local) % 25 == 0 and url_to_local:
            print(f"Downloaded {len(url_to_local)} assets, {total_bytes / 1024 / 1024:.1f} MiB")

    rewrite_downloaded_css()
    write_text(SITE_DIR / "index.html", rewrite_html(soup, single_refs, srcset_refs))

    readme = f"""Pickle Whisper — Wayback snapshot

Original page: {PAGE_URL}
Wayback timestamp: {TIMESTAMP}
Source snapshot: https://web.archive.org/web/{TIMESTAMP}/{PAGE_URL}

Files
-----
index.html            Localized page with archived asset paths rewritten locally.
source-original.html  Raw HTML returned by Wayback's identity replay.
assets/               Downloaded CSS, JavaScript, images, fonts, media, and related files.
manifest.json         Download status and source URL for every attempted asset.
serve.bat / serve.sh  Starts a local HTTP server on port 8000.

How to open
-----------
Windows: double-click serve.bat, then open http://localhost:8000
macOS/Linux: run ./serve.sh, then open http://localhost:8000

Important
---------
This is the fullest offline mirror recoverable from that Wayback capture. Any resource that
was never archived, was blocked during the original crawl, or depends on a live backend/API
may not work offline. The manifest records failed or missing requests.
"""
    write_text(SITE_DIR / "README.txt", readme)
    write_text(SITE_DIR / "serve.bat", "@echo off\ncd /d %~dp0\npy -m http.server 8000 || python -m http.server 8000\n")
    write_text(SITE_DIR / "serve.sh", "#!/usr/bin/env sh\ncd \"$(dirname \"$0\")\"\npython3 -m http.server 8000\n")
    os.chmod(SITE_DIR / "serve.sh", 0o755)

    summary = {
        "page_url": PAGE_URL,
        "timestamp": TIMESTAMP,
        "downloaded_assets": len(url_to_local),
        "attempted_assets": len(manifest),
        "downloaded_bytes": total_bytes,
        "errors": sum(1 for x in manifest if x.get("status") == "error"),
        "limits": {"max_assets": MAX_ASSETS, "max_total_bytes": MAX_TOTAL_BYTES},
        "files": manifest,
    }
    write_text(SITE_DIR / "manifest.json", json.dumps(summary, indent=2, ensure_ascii=False))

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for path in SITE_DIR.rglob("*"):
            if path.is_file():
                zf.write(path, arcname=Path(SITE_DIR.name) / path.relative_to(SITE_DIR))

    print(json.dumps({k: v for k, v in summary.items() if k != "files"}, indent=2))
    print(f"Created {ZIP_PATH} ({ZIP_PATH.stat().st_size / 1024 / 1024:.1f} MiB)")


if __name__ == "__main__":
    main()
