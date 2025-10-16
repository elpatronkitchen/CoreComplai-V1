import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import type { Risk, CreateRiskRequest, UpdateRiskRequest } from '@/types/risk';

export interface RiskFilters {
  category?: string;
  status?: string;
}

export function useRisks(filters?: RiskFilters) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/risks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      
      const url = `/api/risks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<Risk[]>(url);
      return response.data;
    }
  });
}

export function useRisk(id: number) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/risks', id],
    queryFn: async () => {
      const response = await apiClient.get<Risk>(`/api/risks/${id}`);
      return response.data;
    },
    enabled: !!id && id > 0
  });
}

export function useCreateRisk() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async (request: CreateRiskRequest) => {
      const response = await apiClient.post<Risk>('/api/risks', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/risks'] });
    }
  });
}

export function useUpdateRisk() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRiskRequest }) => {
      const response = await apiClient.put(`/api/risks/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/risks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/risks', variables.id] });
    }
  });
}

export function useDeleteRisk() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/risks/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/risks'] });
    }
  });
}
