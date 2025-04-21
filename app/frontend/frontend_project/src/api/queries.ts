import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from './service';
import { 
  TransactionStats, 
  AnalysisResult, 
  IsolationForestParams,
  RandomForestParams 
} from './types';

// Hook to fetch transaction statistics
export const useTransactionStats = () => {
  return useQuery<TransactionStats>({
    queryKey: ['transactionStats'],
    queryFn: apiService.fetchTransactionStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

// Hook for Isolation Forest analysis
export const useIsolationForestAnalysis = () => {
  return useMutation<AnalysisResult, Error, IsolationForestParams>({
    mutationFn: apiService.runIsolationForest,
    onError: (error) => {
      console.error('Isolation Forest analysis failed:', error);
    }
  });
};

// Hook for Random Forest analysis
export const useRandomForestAnalysis = () => {
  return useMutation<AnalysisResult, Error, RandomForestParams>({
    mutationFn: apiService.runRandomForest,
    onError: (error) => {
      console.error('Random Forest analysis failed:', error);
    }
  });
};