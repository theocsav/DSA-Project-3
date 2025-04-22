import { getApiBase } from './constants';
import { 
  TransactionStats, 
  AnalysisResult,
  IsolationForestParams,
  RandomForestParams
} from './types';

// Construct endpoints to make them harder to extract
const getEndpoints = () => {
  const base = getApiBase();
  const paths = {
    stats: 'transactions/stats/',
    isoForest: 'isolation-forest/analyze/',
    randForest: 'random-forest/analyze/'
  };
  
  return {
    getStats: () => `${base}/${paths.stats}`,
    runIsolationForest: () => `${base}/${paths.isoForest}`,
    runRandomForest: () => `${base}/${paths.randForest}`
  };
};

// Handle API response errors
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

// API service with typed methods
export const apiService = {
  // Fetch transaction statistics
  fetchTransactionStats: async (): Promise<TransactionStats> => {
    const response = await fetch(getEndpoints().getStats());
    return handleResponse<TransactionStats>(response);
  },
  
  // Run Isolation Forest analysis
  runIsolationForest: async (params: IsolationForestParams): Promise<AnalysisResult> => {
    const url = new URL(getEndpoints().runIsolationForest());
    
    // Add parameters to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(url.toString());
    return handleResponse<AnalysisResult>(response);
  },
  
  // Run Random Forest analysis
  runRandomForest: async (params: RandomForestParams): Promise<AnalysisResult> => {
    const url = new URL(getEndpoints().runRandomForest());
    
    // Add parameters to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(url.toString());
    return handleResponse<AnalysisResult>(response);
  }
};