import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import type {
  PayrollAuditKPIs,
  IntegrationHealth,
  AuditSession,
  PayrunValidation,
  EmployeeVariance,
  ExportRequest
} from '@/types/payrollAudit';

export function usePayrollKPIs() {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/payroll-audit/kpis'],
    queryFn: async () => {
      const response = await apiClient.get<PayrollAuditKPIs>('/api/payroll-audit/kpis');
      return response.data;
    }
  });
}

export function useIntegrationHealth() {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/payroll-audit/integration-health'],
    queryFn: async () => {
      const response = await apiClient.get<IntegrationHealth>('/api/payroll-audit/integration-health');
      return response.data;
    }
  });
}

export function useAuditSessions() {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/payroll-audit/sessions'],
    queryFn: async () => {
      const response = await apiClient.get<AuditSession[]>('/api/payroll-audit/sessions');
      return response.data;
    }
  });
}

export function usePayrunValidations() {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/payroll-audit/payrun-validations'],
    queryFn: async () => {
      const response = await apiClient.get<PayrunValidation[]>('/api/payroll-audit/payrun-validations');
      return response.data;
    }
  });
}

export function useEmployeeVariances(filters?: { severity?: string; status?: string }) {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: ['/api/payroll-audit/employee-variances', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);
      
      const url = `/api/payroll-audit/employee-variances${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<EmployeeVariance[]>(url);
      return response.data;
    }
  });
}

export function useStartAuditSession() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async (session: Partial<AuditSession>) => {
      const response = await apiClient.post<AuditSession>('/api/payroll-audit/sessions', session);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-audit/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-audit/kpis'] });
    }
  });
}

export function useExportAuditData() {
  const apiClient = useApiClient();
  
  return useMutation({
    mutationFn: async (request: ExportRequest) => {
      const response = await apiClient.post('/api/payroll-audit/export', request);
      return response.data;
    }
  });
}
