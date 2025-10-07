import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useFeedStats() {
  return useQuery({
    queryKey: ['feed-stats'],
    queryFn: () => api.getFeedStats()
  });
}

export function useModelMetrics() {
  return useQuery({
    queryKey: ['model-metrics'],
    queryFn: () => api.getModelMetrics()
  });
}
