"""
Check the generated grid against a fresh run of the original algorithms.

Guards two things the site depends on:
  1. every manifest entry resolves to a file with a self-consistent
     confusion matrix, and
  2. the precomputed isolation-forest threshold sweep matches what
     detect_anomalies actually produces, since that is what lets the
     threshold slider stay continuous client-side.

Usage:  python static-site/tools/validate_data.py
"""

import json
import os
import random
import sys
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "app" / "backend"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")

import django  # noqa: E402

django.setup()

from isolation_forest.algorithm import IsolationForest  # noqa: E402
from random_forest.algorithm import RandomForestAnalyzer  # noqa: E402

DATA = REPO / "static-site" / "web" / "public" / "data"


def main():
    manifest = json.loads((DATA / "manifest.json").read_text())
    features, labels, _ = RandomForestAnalyzer.prepare_data()
    n = len(labels)
    n_rows = len(json.loads((DATA / "rows.json").read_text()))
    failures = []

    # --- structural checks over every grid point ------------------------
    checked = 0
    for entry in manifest["random_forest"]:
        d = json.loads((DATA / "rf" / f"{entry['key']}.json").read_text())
        cm = d["confusion_matrix"]
        total = sum(cm.values())
        if total != n:
            failures.append(f"rf/{entry['key']}: confusion matrix sums to {total}, expected {n}")
        if cm["true_positives"] + cm["false_positives"] != d["fraud_count"]:
            failures.append(f"rf/{entry['key']}: fraud_count disagrees with confusion matrix")
        if len(d["pred"]) != n_rows:
            failures.append(f"rf/{entry['key']}: {len(d['pred'])} predictions, expected {n_rows}")
        if sum(d["hourly"]["fraud"]) + sum(d["hourly"]["non_fraud"]) != n:
            failures.append(f"rf/{entry['key']}: hourly bins do not cover all rows")
        checked += 1

    for entry in manifest["isolation_forest"]:
        d = json.loads((DATA / "if" / f"{entry['key']}.json").read_text())
        if len(d["scores"]) != n_rows:
            failures.append(f"if/{entry['key']}: {len(d['scores'])} scores, expected {n_rows}")
        if len(d["sweep"]) != len(manifest["thresholds"]):
            failures.append(f"if/{entry['key']}: {len(d['sweep'])} thresholds, "
                            f"expected {len(manifest['thresholds'])}")
        for th in manifest["thresholds"]:
            key = f"{th:.2f}"
            if key not in d["sweep"]:
                failures.append(f"if/{entry['key']}: missing threshold {key}")
                continue
            cm = d["sweep"][key]["confusion_matrix"]
            if sum(cm.values()) != n:
                failures.append(f"if/{entry['key']} @ {key}: confusion matrix sums to "
                                f"{sum(cm.values())}, expected {n}")
        checked += 1

    print(f"structural: checked {checked} grid points, {len(failures)} problem(s)")

    # --- retrain one isolation forest and compare the sweep -------------
    entry = manifest["isolation_forest"][0]
    stored = json.loads((DATA / "if" / f"{entry['key']}.json").read_text())
    np.random.seed(42)
    random.seed(42)
    model = IsolationForest(tree_count=entry["tree_count"], sample_size=entry["sample_size"])
    model.plant_forest(features)

    mismatches = 0
    for th in (0.30, 0.45, 0.55, 0.65, 0.80):
        # Straight through the original code path, not a reimplementation.
        pred = model.detect_anomalies(features, threshold=th)
        tp = int(((pred == 1) & (labels == 1)).sum())
        fp = int(((pred == 1) & (labels == 0)).sum())
        cm = stored["sweep"][f"{th:.2f}"]["confusion_matrix"]
        ok = (cm["true_positives"] == tp and cm["false_positives"] == fp)
        if not ok:
            mismatches += 1
            failures.append(f"if/{entry['key']} @ {th:.2f}: stored tp/fp "
                            f"{cm['true_positives']}/{cm['false_positives']} "
                            f"but detect_anomalies gives {tp}/{fp}")
        print(f"  threshold {th:.2f}: stored tp={cm['true_positives']:5d} "
              f"fp={cm['false_positives']:6d} | live tp={tp:5d} fp={fp:6d} "
              f"{'ok' if ok else 'MISMATCH'}")

    print()
    if failures:
        print(f"FAILED with {len(failures)} problem(s):")
        for f in failures[:20]:
            print(f"  - {f}")
        sys.exit(1)
    print("all checks passed")


if __name__ == "__main__":
    main()
