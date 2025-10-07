import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ListItem } from '../lib/api';

export function useList(type: 'block' | 'allow') {
  return useQuery({
    queryKey: ['lists', type],
    queryFn: () => (type === 'block' ? api.listBlocklist() : api.listAllowlist())
  });
}

interface ListPayload {
  url: string;
  reason?: string;
}

export function useCreateListEntry(type: 'block' | 'allow') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ListPayload) => api.createListEntry(type, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', type] });
    }
  });
}

export function useDeleteListEntry(type: 'block' | 'allow') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ListItem['id']) => api.deleteListEntry(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', type] });
    }
  });
}
