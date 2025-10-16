import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';

export interface AuditFinding {
  id: number;
  auditId: number;
  controlId?: number | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  assignedTo?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface FindingFilters {
  auditId?: number;
  severity?: string;
  status?: string;
}

export function useFindings(filters?: FindingFilters) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/findings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.auditId) params.append('auditId', filters.auditId.toString());
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);
      
      const url = `/api/findings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<AuditFinding[]>(url);
      return response.data;
    }
  });
}

export function useFinding(id: number) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/findings', id],
    queryFn: async () => {
      const response = await apiClient.get<AuditFinding>(`/api/findings/${id}`);
      return response.data;
    },
    enabled: !!id
  });
}

export function useCreateFinding() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async (finding: Partial<AuditFinding>) => {
      const response = await apiClient.post<AuditFinding>('/api/findings', finding);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/findings'] });
    }
  });
}

export function useUpdateFinding() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AuditFinding> }) => {
      const response = await apiClient.put<AuditFinding>(`/api/findings/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/findings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/findings', variables.id] });
    }
  });
}

export function useDeleteFinding() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/findings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/findings'] });
    }
  });
}

export function useUpdateFindingStatus() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiClient.put(`/api/findings/${id}/status`, status);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/findings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/findings', variables.id] });
    }
  });
}
