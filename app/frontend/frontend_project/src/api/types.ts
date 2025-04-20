export interface TransactionStats {
  total_transactions: number;
  fraud_count: number;
  fraud_percentage: number;
  sample_transactions: Array<any>;
  category_distribution: Record<string, number>;
}

export interface AnalysisParams {
  [key: string]: number;
}

export interface AnalysisResult {
  execution_time: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    true_positives: number;
    false_positives: number;
    false_negatives: number;
    true_negatives: number;
  };
  data_points: number;
  features: number[][];
  scores: number[];
  predictions: number[];
  algorithm: string;
  data_structure: string;
  parameters: Record<string, any>;
}
