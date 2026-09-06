"""
Precompute the analysis grid that the static site serves.

The original app retrained a forest on every API call, which measured at 58.6s
and a 20.4MB response for the default parameters. Here the same algorithm code
runs once per grid point offline and the results are written as JSON.

Isolation Forest thresholds are not part of the grid: the threshold is applied
to already-computed scores (isolation_forest/algorithm.py, detect_anomalies),
so every threshold the slider can produce is precomputed exactly from a single
trained model.

Usage:  python static-site/tools/generate_data.py [--quick]
"""

import argparse
import json
import math
import os
import random
import sys
import time
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "app" / "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")

import django  # noqa: E402

django.setup()

from isolation_forest.algorithm import IsolationForest  # noqa: E402
from random_forest.algorithm import CustomRandomForest, RandomForestAnalyzer  # noqa: E402

OUT = REPO / "static-site" / "web" / "public" / "data"

# Slider stops. These become the tick marks in ModelSettingsDialog, so every
# position the user can select has an exact precomputed result behind it.
RF_TREES = [10, 50, 100, 250]
RF_DEPTH = [5, 10, 20]
RF_SPLIT = [10, 100]

IF_TREES = [10, 50, 120, 250]
IF_SAMPLE = [64, 256, 512]

# ModelSettingsDialog uses step=0.01 over the [0.1, 0.9] range.
THRESHOLDS = [round(0.10 + 0.01 * i, 2) for i in range(81)]

SCATTER_N = 5000
DISPLAY_FIELDS = ["id", "merchant", "category", "amt", "gender", "age", "job",
                  "distance_km", "unix_time", "trans_hour", "is_fraud"]


def metrics(pred, truth):
    tp = int(((pred == 1) & (truth == 1)).sum())
    fp = int(((pred == 1) & (truth == 0)).sum())
    fn = int(((pred == 0) & (truth == 1)).sum())
    tn = int(((pred == 0) & (truth == 0)).sum())
    acc = (tp + tn) / len(truth)
    prec = tp / (tp + fp) if tp + fp else 0.0
    rec = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": {
            "true_positives": tp, "false_positives": fp,
            "false_negatives": fn, "true_negatives": tn,
        },
        "fraud_count": tp + fp,
        "fraud_percentage": round((tp + fp) / len(truth) * 100, 2),
    }


def hourly(pred, hours, amounts):
    # Called 81 times per isolation-forest grid point, so it stays vectorised.
    # TransactionTimeline plots either counts or summed amounts, so both are
    # precomputed over the full 100k rows rather than estimated from a sample.
    mask = pred == 1
    return {
        "fraud": np.bincount(hours[mask], minlength=24).tolist(),
        "non_fraud": np.bincount(hours[~mask], minlength=24).tolist(),
        "fraud_amount": np.round(
            np.bincount(hours[mask], weights=amounts[mask], minlength=24), 2).tolist(),
        "non_fraud_amount": np.round(
            np.bincount(hours[~mask], weights=amounts[~mask], minlength=24), 2).tolist(),
    }


def rows(df, idx):
    out = []
    for i in idx:
        rec = df.iloc[int(i)]
        out.append({k: (int(rec[k]) if k not in ("amt", "age", "distance_km")
                        else round(float(rec[k]), 2))
                    for k in DISPLAY_FIELDS if k in df.columns})
    return out


def write(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, separators=(",", ":")))
    return path.stat().st_size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true",
                    help="one grid point per model, for wiring up the frontend")
    args = ap.parse_args()

    rf_trees, rf_depth, rf_split = RF_TREES, RF_DEPTH, RF_SPLIT
    if_trees, if_sample = IF_TREES, IF_SAMPLE
    if args.quick:
        rf_trees, rf_depth, rf_split = [10], [10], [10]
        if_trees, if_sample = [10], [256]

    print("loading transactions from db.sqlite3 ...")
    features, labels, df = RandomForestAnalyzer.prepare_data()
    hours = df["trans_hour"].values.astype(np.int64) % 24
    amounts = df["amt"].values.astype(float)
    n = len(labels)
    print(f"  {n} rows, {int(labels.sum())} labelled fraud")

    # One fixed sample of real rows, shared by every grid point. ScatterPlot
    # filters on age/distance_km and TransactionsPanel renders whole records,
    # so these ship as full objects and each grid point only adds its own
    # prediction or score.
    rng = np.random.RandomState(42)
    scatter_idx = np.sort(rng.choice(n, min(SCATTER_N, n), replace=False))
    sample_rows = rows(df, scatter_idx)

    total = len(rf_trees) * len(rf_depth) * len(rf_split) + len(if_trees) * len(if_sample)
    done = 0
    manifest = {"random_forest": [], "isolation_forest": [],
                "thresholds": THRESHOLDS, "data_points": n}

    # ---- Random Forest -------------------------------------------------
    for t in rf_trees:
        for d in rf_depth:
            for s in rf_split:
                done += 1
                np.random.seed(42)
                random.seed(42)
                start = time.time()
                model = CustomRandomForest(n_trees=t, max_depth=d, min_samples_split=s)
                model.fit(features, labels)
                pred = model.predict(features)
                elapsed = time.time() - start

                m = metrics(pred, labels)
                fraud_idx = np.where(pred == 1)[0]
                payload = {
                    "algorithm": "custom_random_forest",
                    "data_structure": "binary_trees",
                    "data_points": n,
                    "execution_time": round(elapsed, 2),
                    "parameters": {"n_trees": t, "max_depth": d, "min_samples_split": s},
                    **m,
                    "hourly": hourly(pred, hours, amounts),
                    # Row fields live once in rows.json; only the prediction
                    # varies per grid point.
                    "pred": [int(pred[i]) for i in scatter_idx],
                }
                key = f"t{t}_d{d}_s{s}"
                size = write(OUT / "rf" / f"{key}.json", payload)
                manifest["random_forest"].append(
                    {"key": key, "n_trees": t, "max_depth": d, "min_samples_split": s})
                print(f"[{done}/{total}] rf {key:16s} {elapsed:6.1f}s "
                      f"f1={m['f1_score']:.3f} {size/1024:5.0f}KB")

    # ---- Isolation Forest ----------------------------------------------
    for t in if_trees:
        for s in if_sample:
            done += 1
            np.random.seed(42)
            random.seed(42)
            start = time.time()
            model = IsolationForest(tree_count=t, sample_size=s)
            model.plant_forest(features)
            scores = model.get_all_scores(features)
            elapsed = time.time() - start

            # Every threshold the slider can reach, computed exactly from the
            # one scores array. No retraining, no interpolation.
            sweep = {}
            for th in THRESHOLDS:
                pred = np.where(scores >= th, 1, 0)
                sweep[f"{th:.2f}"] = {**metrics(pred, labels),
                                      "hourly": hourly(pred, hours, amounts)}

            payload = {
                "algorithm": "custom_isolation_forest",
                "data_structure": "isolation_trees",
                "data_points": n,
                "execution_time": round(elapsed, 2),
                "parameters": {"tree_count": t, "sample_size": s},
                "sweep": sweep,
                # The threshold is applied client-side as score >= threshold,
                # which is exactly what detect_anomalies does server-side.
                # Row fields live once in rows.json.
                "scores": [round(float(scores[i]), 4) for i in scatter_idx],
            }
            key = f"t{t}_s{s}"
            size = write(OUT / "if" / f"{key}.json", payload)
            manifest["isolation_forest"].append(
                {"key": key, "tree_count": t, "sample_size": s})
            print(f"[{done}/{total}] if {key:16s} {elapsed:6.1f}s "
                  f"{size/1024:5.0f}KB")

    # ---- Dataset stats (replaces /api/transactions/stats/) --------------
    cats = {}
    for c in df["category"].unique():
        cats[str(int(c))] = int((df["category"] == c).sum())
    write(OUT / "stats.json", {
        "total_transactions": n,
        "fraud_count": int(labels.sum()),
        "fraud_percentage": round(float(labels.sum()) / n * 100, 2),
        "sample_transactions": rows(df, range(5)),
        "category_distribution": cats,
    })
    # The display sample is identical across grid points, so it ships once and
    # each grid point carries only its own predictions or scores. Switching
    # parameters then costs a small delta instead of a fresh copy of the rows.
    write(OUT / "rows.json", sample_rows)
    write(OUT / "manifest.json", manifest)

    total_bytes = sum(f.stat().st_size for f in OUT.rglob("*.json"))
    print(f"\nwrote {len(list(OUT.rglob('*.json')))} files, "
          f"{total_bytes/1e6:.1f}MB total, largest single load "
          f"{max(f.stat().st_size for f in OUT.rglob('*.json'))/1024:.0f}KB")


if __name__ == "__main__":
    main()
