import {
  TransactionStats,
  AnalysisResult,
  IsolationForestParams,
  RandomForestParams
} from './types';

/*
 * Static data service.
 *
 * The original version called a Django API that retrained a forest on every
 * request. That measured at 58.6s and a 20.4MB response for the default
 * parameters, which no free host will serve. Here the same algorithm code has
 * already run offline over a grid of parameter values and the results are
 * fetched as JSON.
 *
 * The public shape of apiService is unchanged, so queries.ts and dashboard.tsx
 * do not know the difference.
 */

const DATA = `${import.meta.env.BASE_URL}data`;

interface RfEntry { key: string; n_trees: number; max_depth: number; min_samples_split: number; }
interface IfEntry { key: string; tree_count: number; sample_size: number; }
interface Manifest {
  random_forest: RfEntry[];
  isolation_forest: IfEntry[];
  thresholds: number[];
  data_points: number;
}

const cache = new Map<string, Promise<any>>();

const load = <T>(path: string): Promise<T> => {
  if (!cache.has(path)) {
    cache.set(path, fetch(`${DATA}/${path}`).then(r => {
      if (!r.ok) throw new Error(`Could not load ${path}: ${r.status}`);
      return r.json();
    }));
  }
  return cache.get(path) as Promise<T>;
};

const manifest = () => load<Manifest>('manifest.json');

// The display sample is the same for every grid point, so it is fetched once
// and cached. Each grid point then only carries its own predictions.
const rowsBase = () => load<any[]>('rows.json');

/** Nearest available grid value. Sliders are marked with these stops. */
const snap = (want: number | undefined, options: number[], fallback: number): number => {
  const target = want ?? fallback;
  return options.reduce((best, o) =>
    Math.abs(o - target) < Math.abs(best - target) ? o : best, options[0]);
};

/** Split the shared row sample into the two arrays the components expect. */
const split = (rows: any[], flagged: (index: number) => boolean) => {
  const fraud: any[] = [];
  const nonFraud: any[] = [];
  rows.forEach((r, i) => (flagged(i) ? fraud : nonFraud).push(r));
  return { fraud_transactions: fraud, non_fraud_transactions: nonFraud };
};

export const apiService = {
  fetchTransactionStats: async (): Promise<TransactionStats> =>
    load<TransactionStats>('stats.json'),

  runIsolationForest: async (params: IsolationForestParams): Promise<AnalysisResult> => {
    const m = await manifest();
    // dashboard.tsx sends `trees`, while the old Django view read `tree_count`.
    // That mismatch meant the tree slider never reached the backend, so both
    // spellings are accepted here.
    const anyParams = params as Record<string, number | undefined>;
    const treeCount = snap(anyParams.trees ?? anyParams.tree_count,
      [...new Set(m.isolation_forest.map(e => e.tree_count))], 120);
    const sampleSize = snap(params.sample_size,
      [...new Set(m.isolation_forest.map(e => e.sample_size))], 256);

    const entry = m.isolation_forest.find(
      e => e.tree_count === treeCount && e.sample_size === sampleSize)!;
    const [data, rows] = await Promise.all([
      load<any>(`if/${entry.key}.json`), rowsBase()]);

    // Clamp to the precomputed threshold range, then read the exact result.
    const wanted = params.threshold ?? 0.55;
    const th = snap(wanted, m.thresholds, 0.55);
    const point = data.sweep[th.toFixed(2)];

    return {
      ...point,
      hourly: point.hourly,
      execution_time: data.execution_time,
      data_points: data.data_points,
      algorithm: data.algorithm,
      data_structure: data.data_structure,
      parameters: { tree_count: treeCount, sample_size: sampleSize, threshold: th },
      // score >= threshold is exactly what detect_anomalies does server-side.
      ...split(rows, (i: number) => data.scores[i] >= th),
    } as AnalysisResult;
  },

  runRandomForest: async (params: RandomForestParams): Promise<AnalysisResult> => {
    const m = await manifest();
    const nTrees = snap(params.n_trees,
      [...new Set(m.random_forest.map(e => e.n_trees))], 100);
    const maxDepth = snap(params.max_depth,
      [...new Set(m.random_forest.map(e => e.max_depth))], 10);
    const minSplit = snap(params.min_samples_split,
      [...new Set(m.random_forest.map(e => e.min_samples_split))], 10);

    const entry = m.random_forest.find(
      e => e.n_trees === nTrees && e.max_depth === maxDepth
        && e.min_samples_split === minSplit)!;
    const [data, rows] = await Promise.all([
      load<any>(`rf/${entry.key}.json`), rowsBase()]);

    const { pred, ...rest } = data;
    return {
      ...rest,
      ...split(rows, (i: number) => pred[i] === 1),
    } as AnalysisResult;
  }
};

/** Grid stops, so the settings dialog can mark exactly what is available. */
export const availableStops = async () => {
  const m = await manifest();
  const uniq = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);
  return {
    randomForest: {
      tree_count: uniq(m.random_forest.map(e => e.n_trees)),
      max_tree_depth: uniq(m.random_forest.map(e => e.max_depth)),
      sample_size: uniq(m.random_forest.map(e => e.min_samples_split)),
    },
    isolationForest: {
      tree_count: uniq(m.isolation_forest.map(e => e.tree_count)),
      sample_size: uniq(m.isolation_forest.map(e => e.sample_size)),
    },
    thresholds: m.thresholds,
  };
};
