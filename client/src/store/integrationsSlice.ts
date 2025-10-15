import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  IntegrationsState, 
  IntegrationConnection, 
  IntegrationMappings, 
  SyncConfig, 
  SyncLogEntry, 
  SecurityConfig, 
  IntegrationSettings,
  IntegrationKey 
} from '../types/integrations';

// Mock data for Australian payroll/HR integrations
const mockConnections: IntegrationConnection[] = [
  {
    key: "M365",
    name: "Microsoft 365 / Azure AD",
    category: "Identity",
    frameworks: ["All"],
    status: "Connected",
    lastSync: "2025-09-29T14:05:00+10:00",
    env: "Production",
    owner: "System Administrator",
    scopes: ["User.Read.All", "Directory.Read.All"],
    provides: ["users", "status"]
  },
  {
    key: "Workday",
    name: "Workday HCM",
    category: "HRIS",
    frameworks: ["APGF-MS", "ISO 9001"],
    status: "Connected",
    lastSync: "2025-09-29T14:02:00+10:00",
    env: "Production",
    owner: "HR Officer",
    scopes: ["workers.read", "documents.read"],
    provides: ["employment", "roles", "leave", "training"]
  },
  {
    key: "EmploymentHeroHR",
    name: "Employment Hero (HR)",
    category: "HRIS",
    frameworks: ["APGF-MS"],
    status: "Auth Required",
    env: "Production",
    owner: "HR Officer",
    scopes: ["employees.read"],
    provides: ["employees"]
  },
  {
    key: "EmploymentHeroPayroll",
    name: "Employment Hero (Payroll)",
    category: "Payroll",
    frameworks: ["APGF-MS"],
    status: "Connected",
    lastSync: "2025-09-29T14:01:00+10:00",
    env: "Production",
    owner: "Payroll Officer",
    scopes: ["payruns.read", "payslips.read", "stp.read", "super.read"],
    provides: ["payruns", "payslips", "stp", "super"]
  },
  {
    key: "Xero",
    name: "Xero Payroll",
    category: "Payroll",
    frameworks: ["APGF-MS"],
    status: "Disabled",
    env: "Sandbox",
    owner: "Payroll Officer",
    scopes: ["payruns.read"],
    provides: ["payruns"]
  },
  {
    key: "MYOB",
    name: "MYOB Advanced Payroll",
    category: "Payroll",
    frameworks: ["APGF-MS"],
    status: "Disabled",
    env: "Sandbox",
    owner: "Payroll Officer",
    scopes: ["payruns.read"],
    provides: ["payruns"]
  },
  {
    key: "EmploymentHeroTA",
    name: "Employment Hero (T&A)",
    category: "Time & Attendance",
    frameworks: ["APGF-MS"],
    status: "Connected",
    lastSync: "2025-09-29T13:59:00+10:00",
    env: "Production",
    owner: "Ops Manager",
    scopes: ["timesheets.read", "rosters.read"],
    provides: ["timesheets", "approvals"]
  },
  {
    key: "Deputy",
    name: "Deputy",
    category: "Time & Attendance",
    frameworks: ["APGF-MS"],
    status: "Connected",
    lastSync: "2025-09-29T13:58:00+10:00",
    env: "Production",
    owner: "Ops Manager",
    scopes: ["timesheets.read"],
    provides: ["timesheets"]
  },
  {
    key: "Humanforce",
    name: "Humanforce",
    category: "Time & Attendance",
    frameworks: ["APGF-MS"],
    status: "Error",
    lastSync: "2025-09-29T12:41:00+10:00",
    env: "Production",
    owner: "Ops Manager",
    scopes: ["timesheets.read"],
    provides: ["timesheets"],
    errorMsg: "401 token expired"
  },
  {
    key: "ATO_STP2",
    name: "ATO STP Phase 2 (via payroll)",
    category: "Tax & Super",
    frameworks: ["APGF-MS"],
    status: "Connected",
    lastSync: "2025-09-29T14:01:05+10:00",
    env: "Production",
    owner: "Finance Manager",
    scopes: ["stp.read"],
    provides: ["lodgementStatus"]
  },
  {
    key: "SuperStream",
    name: "SuperStream (Beam)",
    category: "Tax & Super",
    frameworks: ["APGF-MS"],
    status: "Connected",
    lastSync: "2025-09-29T13:50:00+10:00",
    env: "Production",
    owner: "Finance Manager",
    scopes: ["contributions.read"],
    provides: ["superContributions"]
  },
  {
    key: "DocuSign",
    name: "DocuSign",
    category: "Documents",
    frameworks: ["All"],
    status: "Connected",
    lastSync: "2025-09-29T13:20:00+10:00",
    env: "Production",
    owner: "HR Officer",
    scopes: ["envelopes.read"],
    provides: ["contracts", "evidence"]
  },
  {
    key: "QualityManagementSoftware",
    name: "QMS Platform (ISO 9001)",
    category: "Quality",
    frameworks: ["ISO 9001"],
    status: "Connected",
    lastSync: "2025-09-29T14:00:00+10:00",
    env: "Production",
    owner: "Quality Manager",
    scopes: ["ncr.read", "capa.read", "audits.read"],
    provides: ["nonconformities", "corrective-actions", "audit-findings"]
  },
  {
    key: "SupplierPortal",
    name: "Supplier Evaluation Portal",
    category: "Quality",
    frameworks: ["ISO 9001"],
    status: "Connected",
    lastSync: "2025-09-29T13:45:00+10:00",
    env: "Production",
    owner: "Supplier Quality Owner",
    scopes: ["suppliers.read", "evaluations.read"],
    provides: ["supplier-performance", "quality-scores"]
  },
  {
    key: "CustomerFeedbackSystem",
    name: "Customer Feedback System",
    category: "Quality",
    frameworks: ["ISO 9001"],
    status: "Connected",
    lastSync: "2025-09-29T13:30:00+10:00",
    env: "Production",
    owner: "Customer Feedback Owner",
    scopes: ["feedback.read", "complaints.read"],
    provides: ["customer-satisfaction", "complaints"]
  },
  {
    key: "SIEM",
    name: "Security Information & Event Management",
    category: "Security",
    frameworks: ["ISO 27001"],
    status: "Connected",
    lastSync: "2025-09-29T14:10:00+10:00",
    env: "Production",
    owner: "ISMS Manager",
    scopes: ["events.read", "alerts.read"],
    provides: ["security-events", "incidents", "alerts"]
  },
  {
    key: "VulnerabilityScanner",
    name: "Vulnerability Management Platform",
    category: "Security",
    frameworks: ["ISO 27001"],
    status: "Connected",
    lastSync: "2025-09-29T13:55:00+10:00",
    env: "Production",
    owner: "Vulnerability Manager",
    scopes: ["vulnerabilities.read", "scans.read"],
    provides: ["vulnerabilities", "scan-results", "remediation-status"]
  },
  {
    key: "AssetManagement",
    name: "IT Asset Management System",
    category: "IT Management",
    frameworks: ["ISO 27001"],
    status: "Connected",
    lastSync: "2025-09-29T13:40:00+10:00",
    env: "Production",
    owner: "Information Asset Owner",
    scopes: ["assets.read", "inventory.read"],
    provides: ["it-assets", "software-inventory", "hardware-inventory"]
  },
  {
    key: "BackupSolution",
    name: "Enterprise Backup Solution",
    category: "IT Management",
    frameworks: ["ISO 27001"],
    status: "Connected",
    lastSync: "2025-09-29T14:05:00+10:00",
    env: "Production",
    owner: "BC/DR Owner",
    scopes: ["backups.read", "recovery.read"],
    provides: ["backup-status", "recovery-points", "test-results"]
  }
];

const mockMappings: IntegrationMappings = {
  employeeId: "Workday.workerId → EH/Payroll.employeeId → M365.userPrincipalName (email)",
  costCentre: "Workday.costCenter → Payroll.costCentre → Reports.costCentre",
  payItems: [
    { payroll: "BASE", awardRef: "Base Hourly" },
    { payroll: "OT15", awardRef: "Overtime 1.5x" },
    { payroll: "MEAL_ALLOW", awardRef: "Meal Allowance" }
  ],
  periodAlignment: "T&A week/fortnight → Payroll pay period (by company setting)"
};

const mockSyncConfig: SyncConfig = {
  schedule: {
    identity: "15m",
    hris: "30m",
    payroll: "hourly",
    taa: "15m",
    docs: "daily"
  },
  webhooks: {
    EmploymentHeroPayroll: true,
    EmploymentHeroTA: true,
    Deputy: true
  }
};

const mockSyncLogs: SyncLogEntry[] = [
  {
    id: "sync-001",
    timestamp: "2025-09-29T14:05:00+10:00",
    source: "Microsoft 365",
    objectsFetched: 247,
    duration: "2.3s",
    result: "success"
  },
  {
    id: "sync-002",
    timestamp: "2025-09-29T14:02:00+10:00",
    source: "Workday HCM",
    objectsFetched: 189,
    duration: "4.1s",
    result: "success"
  },
  {
    id: "sync-003",
    timestamp: "2025-09-29T14:01:00+10:00",
    source: "Employment Hero (Payroll)",
    objectsFetched: 156,
    duration: "3.2s",
    result: "success"
  },
  {
    id: "sync-004",
    timestamp: "2025-09-29T13:59:00+10:00",
    source: "Employment Hero (T&A)",
    objectsFetched: 324,
    duration: "1.8s",
    result: "success"
  },
  {
    id: "sync-005",
    timestamp: "2025-09-29T13:58:00+10:00",
    source: "Deputy",
    objectsFetched: 98,
    duration: "1.2s",
    result: "warning",
    message: "Some timesheets missing manager approval"
  },
  {
    id: "sync-006",
    timestamp: "2025-09-29T12:41:00+10:00",
    source: "Humanforce",
    objectsFetched: 0,
    duration: "0.5s",
    result: "error",
    message: "Authentication failed",
    errorDetails: "401 token expired - refresh required"
  }
];

const mockSecurityConfigs: Record<IntegrationKey, SecurityConfig> = {
  M365: {
    rotationReminders: true,
    lastKeyRotation: "2025-07-15T00:00:00+10:00",
    nextRotationDue: "2025-10-15T00:00:00+10:00",
    requiredScopes: ["User.Read.All", "Directory.Read.All"],
    actualScopes: ["User.Read.All", "Directory.Read.All"],
    leastPrivilegeNotes: "Read-only access to user directory for identity sync"
  },
  Workday: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-01T00:00:00+10:00",
    nextRotationDue: "2025-11-01T00:00:00+10:00",
    requiredScopes: ["workers.read", "documents.read"],
    actualScopes: ["workers.read", "documents.read"],
    leastPrivilegeNotes: "Employee data and document access only"
  },
  EmploymentHeroHR: {
    rotationReminders: false,
    requiredScopes: ["employees.read"],
    actualScopes: [],
    leastPrivilegeNotes: "Auth required - no current access"
  },
  EmploymentHeroPayroll: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-20T00:00:00+10:00",
    nextRotationDue: "2025-11-20T00:00:00+10:00",
    requiredScopes: ["payruns.read", "payslips.read", "stp.read", "super.read"],
    actualScopes: ["payruns.read", "payslips.read", "stp.read", "super.read"],
    leastPrivilegeNotes: "Full payroll read access for compliance reporting"
  },
  Xero: {
    rotationReminders: false,
    requiredScopes: ["payruns.read"],
    actualScopes: [],
    leastPrivilegeNotes: "Disabled - sandbox testing only"
  },
  MYOB: {
    rotationReminders: false,
    requiredScopes: ["payruns.read"],
    actualScopes: [],
    leastPrivilegeNotes: "Disabled - sandbox testing only"
  },
  EmploymentHeroTA: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-20T00:00:00+10:00",
    nextRotationDue: "2025-11-20T00:00:00+10:00",
    requiredScopes: ["timesheets.read", "rosters.read"],
    actualScopes: ["timesheets.read", "rosters.read"],
    leastPrivilegeNotes: "Time tracking and roster data for payroll reconciliation"
  },
  Deputy: {
    rotationReminders: true,
    lastKeyRotation: "2025-07-30T00:00:00+10:00",
    nextRotationDue: "2025-10-30T00:00:00+10:00",
    requiredScopes: ["timesheets.read"],
    actualScopes: ["timesheets.read"],
    leastPrivilegeNotes: "Timesheet data only for backup T&A source"
  },
  Humanforce: {
    rotationReminders: true,
    lastKeyRotation: "2025-06-15T00:00:00+10:00",
    nextRotationDue: "2025-09-15T00:00:00+10:00",
    requiredScopes: ["timesheets.read"],
    actualScopes: [],
    leastPrivilegeNotes: "Token expired - requires re-authentication"
  },
  ATO_STP2: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-01T00:00:00+10:00",
    nextRotationDue: "2025-11-01T00:00:00+10:00",
    requiredScopes: ["stp.read"],
    actualScopes: ["stp.read"],
    leastPrivilegeNotes: "Read-only STP lodgement status via payroll platform"
  },
  SuperStream: {
    rotationReminders: true,
    lastKeyRotation: "2025-07-25T00:00:00+10:00",
    nextRotationDue: "2025-10-25T00:00:00+10:00",
    requiredScopes: ["contributions.read"],
    actualScopes: ["contributions.read"],
    leastPrivilegeNotes: "Super contribution confirmation only"
  },
  DocuSign: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-10T00:00:00+10:00",
    nextRotationDue: "2025-11-10T00:00:00+10:00",
    requiredScopes: ["envelopes.read"],
    actualScopes: ["envelopes.read"],
    leastPrivilegeNotes: "Document signature status for evidence trails"
  },
  AdobeSign: {
    rotationReminders: false,
    requiredScopes: ["agreements.read"],
    actualScopes: [],
    leastPrivilegeNotes: "Not configured - DocuSign is primary e-sign platform"
  },
  QualityManagementSoftware: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-01T00:00:00+10:00",
    nextRotationDue: "2025-11-01T00:00:00+10:00",
    requiredScopes: ["ncr.read", "capa.read", "audits.read"],
    actualScopes: ["ncr.read", "capa.read", "audits.read"],
    leastPrivilegeNotes: "Read access to nonconformities, corrective actions, and audit findings"
  },
  SupplierPortal: {
    rotationReminders: true,
    lastKeyRotation: "2025-07-15T00:00:00+10:00",
    nextRotationDue: "2025-10-15T00:00:00+10:00",
    requiredScopes: ["suppliers.read", "evaluations.read"],
    actualScopes: ["suppliers.read", "evaluations.read"],
    leastPrivilegeNotes: "Supplier performance and quality evaluation data access"
  },
  CustomerFeedbackSystem: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-10T00:00:00+10:00",
    nextRotationDue: "2025-11-10T00:00:00+10:00",
    requiredScopes: ["feedback.read", "complaints.read"],
    actualScopes: ["feedback.read", "complaints.read"],
    leastPrivilegeNotes: "Customer satisfaction and complaint data for quality improvement"
  },
  SIEM: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-20T00:00:00+10:00",
    nextRotationDue: "2025-11-20T00:00:00+10:00",
    requiredScopes: ["events.read", "alerts.read"],
    actualScopes: ["events.read", "alerts.read"],
    leastPrivilegeNotes: "Security event and alert monitoring for ISMS compliance"
  },
  VulnerabilityScanner: {
    rotationReminders: true,
    lastKeyRotation: "2025-07-25T00:00:00+10:00",
    nextRotationDue: "2025-10-25T00:00:00+10:00",
    requiredScopes: ["vulnerabilities.read", "scans.read"],
    actualScopes: ["vulnerabilities.read", "scans.read"],
    leastPrivilegeNotes: "Vulnerability scan results and remediation tracking"
  },
  AssetManagement: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-05T00:00:00+10:00",
    nextRotationDue: "2025-11-05T00:00:00+10:00",
    requiredScopes: ["assets.read", "inventory.read"],
    actualScopes: ["assets.read", "inventory.read"],
    leastPrivilegeNotes: "IT asset inventory and software/hardware tracking for ISO 27001"
  },
  BackupSolution: {
    rotationReminders: true,
    lastKeyRotation: "2025-08-15T00:00:00+10:00",
    nextRotationDue: "2025-11-15T00:00:00+10:00",
    requiredScopes: ["backups.read", "recovery.read"],
    actualScopes: ["backups.read", "recovery.read"],
    leastPrivilegeNotes: "Backup status and recovery point monitoring for business continuity"
  }
};

const mockSettings: IntegrationSettings = {
  varianceThresholds: {
    payrollHours: 5, // 5% variance tolerance
    timesheetDiscrepancy: 2, // 2 hour discrepancy tolerance
    costCentreVariance: 10 // 10% cost centre variance tolerance
  },
  defaultPayCycle: "fortnightly",
  timezone: "Australia/Sydney",
  evidenceHashing: true,
  autoReconciliation: false,
  notificationSettings: {
    syncErrors: true,
    authExpiry: true,
    dataVariances: true
  }
};

interface IntegrationsActions {
  // Connection management
  updateConnectionStatus: (key: IntegrationKey, status: IntegrationsState['connections'][0]['status']) => void;
  triggerSync: (key: IntegrationKey) => void;
  
  // Mapping management
  updateMappings: (mappings: Partial<IntegrationMappings>) => void;
  
  // Sync & Health
  addSyncLog: (entry: SyncLogEntry) => void;
  clearSyncLogs: () => void;
  
  // Settings
  updateSettings: (settings: Partial<IntegrationSettings>) => void;
  
  // Security
  updateSecurityConfig: (key: IntegrationKey, config: Partial<SecurityConfig>) => void;
  
  // Reset to defaults
  resetToDefaults: () => void;
}

export const useIntegrationsStore = create<IntegrationsState & IntegrationsActions>()(
  persist(
    (set, get) => ({
      // Initial state
      connections: mockConnections,
      mappings: mockMappings,
      syncConfig: mockSyncConfig,
      syncLogs: mockSyncLogs,
      securityConfigs: mockSecurityConfigs,
      settings: mockSettings,

      // Actions
      updateConnectionStatus: (key, status) => {
        set((state) => ({
          connections: state.connections.map(conn =>
            conn.key === key 
              ? { 
                  ...conn, 
                  status,
                  lastSync: status === 'Connected' ? new Date().toISOString() : conn.lastSync,
                  errorMsg: status === 'Error' ? conn.errorMsg : undefined
                }
              : conn
          )
        }));
      },

      triggerSync: (key) => {
        const connection = get().connections.find(conn => conn.key === key);
        if (!connection) return;

        // Simulate sync
        const newLogEntry: SyncLogEntry = {
          id: `sync-${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: connection.name,
          objectsFetched: Math.floor(Math.random() * 300) + 50,
          duration: `${(Math.random() * 5 + 1).toFixed(1)}s`,
          result: Math.random() > 0.9 ? 'error' : 'success'
        };

        set((state) => ({
          connections: state.connections.map(conn =>
            conn.key === key 
              ? { ...conn, lastSync: new Date().toISOString() }
              : conn
          ),
          syncLogs: [newLogEntry, ...state.syncLogs.slice(0, 19)] // Keep last 20
        }));
      },

      updateMappings: (mappings) => {
        set((state) => ({
          mappings: { ...state.mappings, ...mappings }
        }));
      },

      addSyncLog: (entry) => {
        set((state) => ({
          syncLogs: [entry, ...state.syncLogs.slice(0, 19)] // Keep last 20
        }));
      },

      clearSyncLogs: () => {
        set({ syncLogs: [] });
      },

      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings }
        }));
      },

      updateSecurityConfig: (key, config) => {
        set((state) => ({
          securityConfigs: {
            ...state.securityConfigs,
            [key]: { ...state.securityConfigs[key], ...config }
          }
        }));
      },

      resetToDefaults: () => {
        set({
          connections: mockConnections,
          mappings: mockMappings,
          syncConfig: mockSyncConfig,
          syncLogs: mockSyncLogs,
          securityConfigs: mockSecurityConfigs,
          settings: mockSettings
        });
      }
    }),
    {
      name: 'integrations-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);