# Static build of the fraud detection dashboard

This folder is a self-contained, deployable version of the dashboard. Nothing in
`app/` was changed. The original Django backend and React frontend are untouched
and still run exactly as documented in the root README.

## Why this exists

The original site called a Django API that retrained a forest on every request.
Measured on the committed `db.sqlite3`, at the default parameters:

| | measured |
|---|---|
| Request time, `n_trees=100` | **58.6s** |
| Response size | **20.4 MB** |
| Peak backend memory | 216 MB |

Gunicorn's default worker timeout is 30s, and every serverless host caps
responses far below 20 MB, so the deployed site could not survive its own
default request. Render's free tier gives 0.1 CPU, which would make the same
request take roughly ten minutes.

Nothing about the hosting plan fixes that, because the cost is per request and
scales with the sliders. So the training moved offline.

## How it works

`tools/generate_data.py` imports the *same* algorithm classes from
`app/backend` and runs them once per grid point, writing results to
`web/public/data/`. The site then fetches JSON instead of computing.

Two kinds of parameter get different treatment:

- **`tree_count`, `sample_size`, `max_depth`, `min_samples_split`** change the
  trained model, so each combination is precomputed. The sliders are marked
  with the available stops and snap to them.
- **`threshold`** does not require retraining. `isolation_forest/algorithm.py`
  applies it as `scores >= threshold` after scoring, so all 81 values the
  slider can produce are precomputed from a single trained model. That slider
  stays fully continuous and every value on it is exact.

Result: the default view drops from a 20.4 MB, 58.6s request to a ~137 KB
gzipped fetch that resolves immediately.

## Regenerating the data

```bash
python -m venv venv
venv/Scripts/activate          # or: source venv/bin/activate
pip install django numpy pandas
python static-site/tools/generate_data.py
```

Use `--quick` for a single grid point when you only need to wire up the
frontend. The grid itself is defined at the top of `generate_data.py`; adding a
stop there adds a tick mark to the slider automatically via `manifest.json`.

## Running locally

```bash
cd static-site/web
npm install
npm run dev
```

## Deploying to Vercel

Import the repo as a new Vercel project and set:

| Setting | Value |
|---|---|
| Root Directory | `static-site/web` |
| Framework Preset | Vite |
| Build Command | `npm run build` (default) |
| Output Directory | `dist` (default) |

No environment variables. No backend. Nothing to keep awake.

Do not reuse the old `vercel.json` from the `dsaprojectdevelop` repo. That one
configures `@vercel/python` to build Django and routes `/api/*` at it, which is
what this build replaces.

## Changes to the copied frontend

Everything came from `app/frontend/frontend_project`, with these edits:

- `src/api/service.ts` rewritten to read the precomputed JSON. The exported
  `apiService` shape is unchanged, so `queries.ts` and `dashboard.tsx` did not
  need to change.
- `src/api/constants.ts` deleted, since there is no API base URL any more.
- `src/api/types.ts` gained `fraud_count`, `fraud_transactions`, `hourly` and
  friends, plus `tree_count` on `IsolationForestParams`.
- `src/components/Dashboard/ModelSettingsDialog.tsx` marks each slider with its
  precomputed stops and uses `step={null}` to snap to them.
- `src/components/Dashboard/TransactionTimeline.tsx` reads the precomputed
  hourly bins, which cover all 100k rows, rather than binning the 5k display
  sample.
- `src/components/Dashboard/TransactionsPanel.tsx` reports the true flagged
  count instead of the length of the display sample.

## Behaviour that changed

The CSV export covers the 5,000-row display sample rather than all 100,000
rows. Metrics, the confusion matrix and the hourly chart are still computed
over the full dataset, so only the exported row list is a sample.

That also sidesteps a performance problem: `handleExportResults` decides each
row's label with `fraudTransactions.includes(transaction)`, a linear scan per
row. At 100k rows that is billions of comparisons and would lock the tab.

## Fixed along the way

`dashboard.tsx` sent the isolation forest tree count as `trees`, but
`isolation_forest/views.py` read `tree_count`. The parameter never reached the
backend, so that slider did nothing and the model always used its default of
120 trees. The new service accepts both spellings and the slider now works.
