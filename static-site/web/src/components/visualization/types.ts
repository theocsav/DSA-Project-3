// Common types for tree visualization components

// Tree node structure for visualization
export interface TreeNode {
  id: string;
  depth: number;
  x: number;
  y: number;
  samples: number;
  fraudRatio: number; // Ratio of fraud samples in this node
  parent?: TreeNode;
  left?: TreeNode;
  right?: TreeNode;
  feature?: string; // Feature used for splitting at this node
  splitValue?: number; // Value used for splitting
  data?: any[]; // Original data samples in this node (optional)
}

// Props for tree visualization components
export interface TreeVisualizationProps {
  onComplete?: () => void;
  autoStart?: boolean;
  thresholds: {
    tree_count: number;
    sample_size: number;
    max_tree_depth: number;
    threshold: number;
  };
  width?: number;
  height?: number;
}

// API response types
export interface ConfusionMatrix {
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  true_negatives: number;
}

export interface ModelParameters {
  [key: string]: any;
  tree_count?: number;
  sample_size?: number;
  threshold?: number;
  n_trees?: number;
  max_depth?: number;
  min_samples_split?: number;
}

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
  parameters: ModelParameters;
}

export interface TransactionStats {
  total_transactions: number;
  fraud_count: number;
  fraud_percentage: number;
  sample_transactions: any[];
  category_distribution: {
    [key: string]: number;
  };
}

// Colors for visualization
export const COLORS = {
  FRAUD: '#e53935',    // Red
  NORMAL: '#3f51b5',   // Blue
  MIXED: '#ffcdd2',    // Light Red  
  HIGHLIGHT: '#4caf50', // Green - for highlighting text, not circles
  NODE_STROKE: '#333',
  CONNECTION: '#aaa',
  SPLIT_LINE: '#4caf50', // Green - for split lines
  SPLIT_TEXT: '#ffffff',  // White - for split text
  SCATTER_POINT: '#8884d8', // Purple - for scatter plot points
  SCATTER_FRAUD: '#e53935', // Red - for fraudulent transactions
  SCATTER_NORMAL: '#3f51b5', // Blue - for normal transactions
  GRID: 'rgba(255,255,255,0.15)' // Grid lines for charts
};

// Constants for tree rendering
export const TREE_CONSTANTS = {
  NODE_RADIUS: 9, // Increased from 6 for better visibility
  LEVEL_HEIGHT: 50, // Increased from 40 to give more space
  MAX_DEPTH: 5, // Default max depth
  TEXT_SIZE: 11, // Base text size for node counts
  FEATURE_TEXT_SIZE: 10 // Text size for feature split labels
};