#!/usr/bin/env bash
set -u

STAMP="20250914214303"
URL="https://web.archive.org/web/${STAMP}/https://pickle.com/whisper"
NAME="pickle-whisper-wayback-${STAMP}-wget"
OUT="output/${NAME}"
MIRROR="${OUT}/mirror"
ZIP="output/${NAME}.zip"

rm -rf "$OUT" "$ZIP"
mkdir -p "$MIRROR"

# Standard offline-page mirror. Keep successful downloads even when an individual
# archived prerequisite is unavailable or Wayback returns a transient error.
set +e
wget \
  --page-requisites \
  --convert-links \
  --backup-converted \
  --adjust-extension \
  --span-hosts \
  --domains=web.archive.org,web-static.archive.org \
  --execute robots=off \
  --timeout=25 \
  --read-timeout=25 \
  --dns-timeout=15 \
  --connect-timeout=15 \
  --tries=2 \
  --waitretry=1 \
  --no-verbose \
  --directory-prefix="$MIRROR" \
  "$URL"
WGET_STATUS=$?
set -e

TARGET="$(find "$MIRROR" -type f \( -iname '*whisper*.html' -o -iname '*whisper*' -o -iname 'index.html' \) | head -n 1)"
if [[ -z "$TARGET" ]]; then
  TARGET="$(find "$MIRROR" -type f -iname '*.html' | head -n 1)"
fi
if [[ -z "$TARGET" ]]; then
  echo "No HTML page was downloaded." >&2
  exit 1
fi

REL_TARGET="${TARGET#${OUT}/}"
cat > "${OUT}/index.html" <<EOF
<!doctype html>
<meta charset="utf-8">
<title>Pickle Whisper Wayback snapshot</title>
<meta http-equiv="refresh" content="0; url=${REL_TARGET}">
<p>Opening the mirrored page. <a href="${REL_TARGET}">Click here if it does not open automatically.</a></p>
EOF

cat > "${OUT}/README.txt" <<EOF
Pickle Whisper — Wayback snapshot (wget mirror)

Snapshot: ${URL}

Open index.html, or run one of the included local-server scripts and visit:
http://localhost:8000

The mirror includes the HTML and every page prerequisite that Wayback returned to wget,
including linked CSS, JavaScript, images, fonts, and media. Some live APIs or files that
were not saved by Wayback may remain unavailable. wget exit status: ${WGET_STATUS}
EOF

cat > "${OUT}/serve.bat" <<'EOF'
@echo off
cd /d %~dp0
py -m http.server 8000 || python -m http.server 8000
EOF
cat > "${OUT}/serve.sh" <<'EOF'
#!/usr/bin/env sh
cd "$(dirname "$0")"
python3 -m http.server 8000
EOF
chmod +x "${OUT}/serve.sh"

find "$OUT" -type f -printf '%P\t%s bytes\n' | sort > "${OUT}/FILE-LIST.txt"
(
  cd output
  zip -r -q "${NAME}.zip" "$NAME"
)

echo "Downloaded files: $(find "$OUT" -type f | wc -l)"
echo "ZIP size: $(du -h "$ZIP" | cut -f1)"
