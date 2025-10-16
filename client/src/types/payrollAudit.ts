// Payroll Audit types for Australian compliance management
export type FindingSeverity = "info" | "warn" | "critical";
export type FindingStatus = "Open" | "Resolved" | "Won't Fix";

export interface EvidenceRef {
  id: string;
  type: "pdf" | "json" | "doc";
  title: string;
  source: string;
  hashSha256?: string;
  collectedAt: string;
}

export interface Finding {
  id: string;
  employeeId?: string;
  payrunId?: string;
  periodStart?: string;
  periodEnd?: string;
  code: string;                  // e.g., MISSING_TS, POST_TERM_PAY
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceRef[];
  notes: { at: string; author: string; text: string }[];
}

export interface PayrollAuditFilters {
  paySource: "EmploymentHero" | "Xero" | "MYOB";
  taaSource: "EmploymentHero" | "Deputy" | "Humanforce";
  payruns: string[];
  employeeIds?: string[];
  varianceOnly: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PayrollAuditKPIs {
  employees: number;
  periodsReconciled: number;
  varianceHours: number;
  stpExceptions: number;
}

export interface PayrollAuditSession {
  id: string;
  filters: PayrollAuditFilters;
  kpis: PayrollAuditKPIs;
  findings: Finding[];
  startedAt: string;
  endedAt?: string;
}

// Supporting types for payroll reconciliation
export interface TimesheetEntry {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  hours: number;
  approvedBy?: string;
  source: string;
  isManual: boolean;
  status: "approved" | "pending" | "rejected";
}

export interface PayslipLine {
  code: string;
  label: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PayslipEntry {
  id: string;
  employeeId: string;
  payrunId: string;
  periodStart: string;
  periodEnd: string;
  lines: PayslipLine[];
  grossPay: number;
  tax: number;
  superannuation: number;
  netPay: number;
  source: string;
  stpStatus: "Success" | "Pending" | "Error";
  stpEventId?: string;
}

export interface EmployeeAuditRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  costCentre: string;
  award: string;
  employmentType: "Full-time" | "Part-time" | "Casual" | "Contract";
  status: "Active" | "Terminated" | "On Leave";
  baseRate: number;
  timesheets: TimesheetEntry[];
  payslips: PayslipEntry[];
  varianceHours: number;
  varianceAmount: number;
  exceptions: string[];
}

export interface PayrunValidationRow {
  employee: {
    id: string;
    name: string;
    department: string;
    costCentre: string;
    award: string;
  };
  payruns: string[];
  taaHours: number;
  paidHours: number;
  varianceHours: number;
  estimatedVarianceAmount: number;
  stpStatus: "Success" | "Pending" | "Error";
  exceptions: string[];
  timesheets: TimesheetEntry[];
  payslips: PayslipEntry[];
}

export interface VarianceExplanation {
  id: string;
  employeeId: string;
  payrunId: string;
  reason: "Unpaid break" | "Rounding" | "Public holiday" | "Manual adjustment" | "Other";
  explanation: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditNote {
  id: string;
  employeeId?: string;
  payrunId?: string;
  type: "reconcile" | "variance" | "general";
  content: string;
  createdBy: string;
  createdAt: string;
  evidence: EvidenceRef[];
}

// Integration health status for audit reliability
export interface AuditIntegrationHealth {
  payrollSource: {
    name: string;
    status: "Connected" | "Auth Required" | "Error" | "Disabled";
    lastSync?: string;
  };
  taaSource: {
    name: string;
    status: "Connected" | "Auth Required" | "Error" | "Disabled";
    lastSync?: string;
  };
  reliability: "High" | "Medium" | "Low";
  warnings: string[];
}