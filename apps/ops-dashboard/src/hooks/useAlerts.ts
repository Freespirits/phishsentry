import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAlerts(page = 1, pageSize = 25) {
  return useQuery({
    queryKey: ['alerts', page, pageSize],
    queryFn: () => api.listAlerts(page, pageSize)
  });
}

export function useAlertDetail(alertId?: string) {
  return useQuery({
    queryKey: ['alerts', alertId],
    queryFn: () => (alertId ? api.getAlert(alertId) : Promise.reject(new Error('Missing alert id'))),
    enabled: Boolean(alertId)
  });
}
