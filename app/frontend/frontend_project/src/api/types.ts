// Transaction data type
export interface Transaction {
  id?: number;
  merchant: number;
  category: number;
  amt: number;
  gender: number;
  distance_km: number;
  job: number;
  unix_time: number;
  is_fraud: number;
  age: number;
  trans_hour: number;
}

// Transaction statistics response type
export interface TransactionStats {
  total_transactions: number;
  fraud_count: number;
  fraud_percentage: number;
  sample_transactions: Transaction[];
  category_distribution: {
    [key: string]: number;
  };
}

// Confusion matrix type
export interface ConfusionMatrix {
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  true_negatives: number;
}

// Algorithm parameters
export interface IsolationForestParams {
  trees?: number; // Number of trees
  sample_size?: number; // Sample size for each tree
  threshold?: number; // Anomaly score threshold
}

export interface RandomForestParams {
  n_trees?: number; // Number of trees
  max_depth?: number; // Maximum tree depth
  min_samples_split?: number; // Minimum samples required to split a node
  feature_subset_size?: number; // Number of features to consider for each split (optional)
}

// Algorithm results
export interface AnalysisResult {
  execution_time: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: ConfusionMatrix;
  data_points: number;
  features?: number[][];
  scores?: number[];
  predictions?: number[];
  algorithm: string;
  data_structure: string;
  parameters: {
    [key: string]: any;
  };
  model_save_status?: string; // For Random Forest only
}