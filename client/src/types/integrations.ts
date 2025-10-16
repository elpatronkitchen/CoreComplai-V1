// Integration types for Australian payroll/HR compliance management
export type IntegrationKey =
  | "M365" 
  | "Workday" 
  | "EmploymentHeroHR" 
  | "EmploymentHeroPayroll" 
  | "EmploymentHeroTA"
  | "Xero" 
  | "MYOB" 
  | "Deputy" 
  | "Humanforce" 
  | "ATO_STP2" 
  | "SuperStream" 
  | "DocuSign" 
  | "AdobeSign"
  | "QualityManagementSoftware"
  | "SupplierPortal"
  | "CustomerFeedbackSystem"
  | "SIEM"
  | "VulnerabilityScanner"
  | "AssetManagement"
  | "BackupSolution";

export type IntegrationStatus = "Connected" | "Auth Required" | "Error" | "Disabled";

export type IntegrationCategory = "Identity" | "HRIS" | "Payroll" | "Time & Attendance" | "Tax & Super" | "Documents" | "Quality" | "Security" | "IT Management";

export type Framework = "APGF-MS" | "ISO 9001" | "ISO 27001" | "All";

export interface IntegrationConnection {
  key: IntegrationKey;
  name: string;
  category: IntegrationCategory;
  frameworks: Framework[];       // which frameworks this integration supports
  status: IntegrationStatus;
  lastSync?: string;             // ISO datetime
  nextSync?: string;             // ISO datetime
  env: "Production" | "Sandbox";
  owner: string;                 // role/person responsible
  scopes: string[];              // OAuth/API scopes (displayed only)
  provides: string[];            // data types it feeds (e.g., "payruns","timesheets")
  consumes?: string[];           // optional - data it receives
  errorMsg?: string;             // error message if status is "Error"
}

export interface FieldMapping {
  source: string;
  target: string;
  mapping: string;
}

export interface PayItemMapping {
  payroll: string;
  awardRef: string;
}

export interface IntegrationMappings {
  employeeId: string;
  costCentre: string;
  payItems: PayItemMapping[];
  periodAlignment: string;
}

export interface SyncSchedule {
  identity: string;
  hris: string;
  payroll: string;
  taa: string;
  docs: string;
}

export interface WebhookConfig {
  [key: string]: boolean;
}

export interface SyncConfig {
  schedule: SyncSchedule;
  webhooks: WebhookConfig;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  source: string;
  objectsFetched: number;
  duration: string;
  result: "success" | "warning" | "error";
  message?: string;
  errorDetails?: string;
}

export interface SecurityConfig {
  rotationReminders: boolean;
  lastKeyRotation?: string;
  nextRotationDue?: string;
  requiredScopes: string[];
  actualScopes: string[];
  leastPrivilegeNotes: string;
}

export interface IntegrationSettings {
  varianceThresholds: {
    payrollHours: number;
    timesheetDiscrepancy: number;
    costCentreVariance: number;
  };
  defaultPayCycle: "weekly" | "fortnightly" | "monthly";
  timezone: string;
  evidenceHashing: boolean;
  autoReconciliation: boolean;
  notificationSettings: {
    syncErrors: boolean;
    authExpiry: boolean;
    dataVariances: boolean;
  };
}

export interface IntegrationsState {
  connections: IntegrationConnection[];
  mappings: IntegrationMappings;
  syncConfig: SyncConfig;
  syncLogs: SyncLogEntry[];
  securityConfigs: Record<IntegrationKey, SecurityConfig>;
  settings: IntegrationSettings;
}