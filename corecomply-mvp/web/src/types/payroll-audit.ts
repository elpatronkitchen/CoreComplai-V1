export interface PayrollAuditKPIs {
  id: number;
  totalExceptions: number;
  varianceAmount: number;
  employeesAffected: number;
  successRate: number;
  lastSyncTime: string;
  createdAt: string;
}

export interface AuditSession {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  auditor: string;
  startDate: string;
  endDate: string;
  scope: string;
  findingIds: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateAuditSessionRequest {
  title: string;
  description: string;
  type: string;
  status: string;
  auditor: string;
  startDate: string;
  endDate: string;
  scope?: string;
  findingIds?: string;
  createdBy: string;
}

export interface IntegrationHealth {
  id: number;
  payrollSourceName: string;
  payrollSourceStatus: string;
  payrollLastSync?: string | null;
  taaSourceName: string;
  taaSourceStatus: string;
  taaLastSync?: string | null;
  updatedAt: string;
}

export interface PayrunValidation {
  id: number;
  payrunId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  status: string;
  totalEmployees: number;
  exceptionCount: number;
  totalAmount: number;
  createdAt: string;
}

export interface EmployeeVariance {
  id: number;
  employeeId: string;
  employeeName: string;
  varianceType: string;
  expectedAmount: number;
  actualAmount: number;
  varianceAmount: number;
  severity: string;
  status: string;
  detectedAt: string;
}

export interface ExportRequest {
  format: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ExportResponse {
  message: string;
  format: string;
  timestamp: string;
}
