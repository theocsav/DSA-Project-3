import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from './service';
import type { TransactionStats, AnalysisResult } from './types';

export const useTransactionStats = () => {
  return useQuery<TransactionStats>({
    queryKey: ['transactionStats'],
    queryFn: apiService.fetchTransactionStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

export const useIsolationForestAnalysis = () => {
  return useMutation<AnalysisResult, Error, Record<string, number>>({
    mutationFn: apiService.runIsolationForest
  });
};

export const useRandomForestAnalysis = () => {
  return useMutation<AnalysisResult, Error, Record<string, number>>({
    mutationFn: apiService.runRandomForest
  });
};
