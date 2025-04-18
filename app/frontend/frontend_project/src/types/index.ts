export interface TransactionData {
  id: number;
  amt: number;
  distance_km: number;
  age: number;
  trans_hour: number;
  is_fraud: boolean;
}

export interface AlgorithmResult {
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
  algorithm: string;
  data_structure: string;
  parameters: Record<string, any>;
}
