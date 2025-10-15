import { create } from 'zustand';

export type AuditStatus = 'draft' | 'in-progress' | 'review' | 'completed' | 'archived';
export type EvidenceSource = 'system' | 'manual' | 'missing';
export type FindingStatus = 'compliant' | 'issue' | 'pending';

export interface Entity {
  id: string;
  name: string;
  abn: string;
  states: string[];
  sites: string[];
  contactName: string;
  contactEmail: string;
}

export interface AuditScope {
  entities: string[];
  states: string[];
  startDate: string;
  endDate: string;
  population: 'all' | 'department' | 'specific';
  departments?: string[];
  employeeIds?: string[];
  instruments: string[];
}

export interface ChecklistItem {
  id: string;
  category: string;
  document: string;
  source: EvidenceSource;
  provided: boolean;
  periodCovered?: string;
  link?: string;
  notes?: string;
}

export interface Finding {
  id: string;
  employeeId: string;
  category: string;
  obligation: string;
  status: FindingStatus;
  evidenceLinks: string[];
  notes: string;
  clauseReference?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditEmployee {
  id: string;
  name: string;
  entity: string;
  site: string;
  state: string;
  instrument: string;
  classification: string;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'in-progress' | 'reviewed' | 'issues' | 'cleared';
  issuesCount: number;
  completeness: number;
}

export interface AuditRequest {
  id: string;
  name: string;
  status: AuditStatus;
  scope: AuditScope;
  owner: string;
  auditor?: string;
  createdDate: string;
  completeness: number;
  employeeCount: number;
  issuesCount: number;
  employees: AuditEmployee[];
  checklist: ChecklistItem[];
  findings: Finding[];
}

export interface Integration {
  id: string;
  name: string;
  category: 'payroll' | 'time' | 'hr' | 'tax' | 'super' | 'document';
  connected: boolean;
  description: string;
  checklistCategories: string[];
}

interface AuditRequestState {
  audits: AuditRequest[];
  integrations: Integration[];
  currentAudit: AuditRequest | null;
  currentEmployee: AuditEmployee | null;
  
  // Actions
  addAudit: (audit: AuditRequest) => void;
  updateAudit: (id: string, updates: Partial<AuditRequest>) => void;
  deleteAudit: (id: string) => void;
  setCurrentAudit: (auditId: string | null) => void;
  setCurrentEmployee: (employeeId: string | null) => void;
  
  // Checklist actions
  updateChecklistItem: (auditId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  
  // Integration actions
  toggleIntegration: (integrationId: string) => void;
  
  // Finding actions
  addFinding: (auditId: string, finding: Finding) => void;
  updateFinding: (auditId: string, findingId: string, updates: Partial<Finding>) => void;
}

// Mock data
const mockIntegrations: Integration[] = [
  {
    id: 'int-1',
    name: 'Xero Payroll',
    category: 'payroll',
    connected: false,
    description: 'Import payslips, pay runs, leave balances, and super contributions',
    checklistCategories: ['Payroll Data', 'Superannuation', 'Leave & Holidays']
  },
  {
    id: 'int-2',
    name: 'Employment Hero',
    category: 'hr',
    connected: false,
    description: 'Import employment contracts, onboarding documents, and employee records',
    checklistCategories: ['Employment Records', 'Onboarding', 'Pay & Conditions']
  },
  {
    id: 'int-3',
    name: 'Deputy',
    category: 'time',
    connected: false,
    description: 'Import timesheets, rosters, time & attendance records',
    checklistCategories: ['Timekeeping & Rosters']
  },
  {
    id: 'int-4',
    name: 'ATO STP',
    category: 'tax',
    connected: false,
    description: 'Retrieve STP Phase 2 reporting data and finalisation events',
    checklistCategories: ['Tax & Reporting']
  }
];

const mockChecklist: ChecklistItem[] = [
  // Corporate & Entity Setup
  { id: 'ch-1', category: 'Corporate & Entity Setup', document: 'ABN Registration', source: 'missing', provided: false },
  { id: 'ch-2', category: 'Corporate & Entity Setup', document: 'Entity Structure Chart', source: 'missing', provided: false },
  { id: 'ch-3', category: 'Corporate & Entity Setup', document: 'Registered Office Details', source: 'missing', provided: false },
  
  // Pay & Conditions
  { id: 'ch-4', category: 'Pay & Conditions', document: 'Modern Award Coverage', source: 'missing', provided: false },
  { id: 'ch-5', category: 'Pay & Conditions', document: 'Enterprise Agreement (if applicable)', source: 'missing', provided: false },
  { id: 'ch-6', category: 'Pay & Conditions', document: 'Pay Policy Document', source: 'missing', provided: false },
  { id: 'ch-7', category: 'Pay & Conditions', document: 'Overtime & Penalty Rates Policy', source: 'missing', provided: false },
  
  // Employment Records
  { id: 'ch-8', category: 'Employment Records', document: 'Employee Register (Current)', source: 'missing', provided: false },
  { id: 'ch-9', category: 'Employment Records', document: 'Employment Contracts (All in scope)', source: 'missing', provided: false },
  { id: 'ch-10', category: 'Employment Records', document: 'Position Descriptions', source: 'missing', provided: false },
  { id: 'ch-11', category: 'Employment Records', document: 'Job Classification Records', source: 'missing', provided: false },
  
  // Onboarding
  { id: 'ch-12', category: 'Onboarding', document: 'Fair Work Information Statement (FWIS)', source: 'missing', provided: false },
  { id: 'ch-13', category: 'Onboarding', document: 'Tax File Number Declarations', source: 'missing', provided: false },
  { id: 'ch-14', category: 'Onboarding', document: 'Superannuation Choice Forms', source: 'missing', provided: false },
  { id: 'ch-15', category: 'Onboarding', document: 'Bank Account Details', source: 'missing', provided: false },
  
  // Timekeeping & Rosters
  { id: 'ch-16', category: 'Timekeeping & Rosters', document: 'Timesheets (Audit period)', source: 'missing', provided: false },
  { id: 'ch-17', category: 'Timekeeping & Rosters', document: 'Rosters (Audit period)', source: 'missing', provided: false },
  { id: 'ch-18', category: 'Timekeeping & Rosters', document: 'Overtime Records', source: 'missing', provided: false },
  { id: 'ch-19', category: 'Timekeeping & Rosters', document: 'Time & Attendance System Reports', source: 'missing', provided: false },
  
  // Payroll Data
  { id: 'ch-20', category: 'Payroll Data', document: 'Payslips (Audit period)', source: 'missing', provided: false },
  { id: 'ch-21', category: 'Payroll Data', document: 'Pay Run Summary Reports', source: 'missing', provided: false },
  { id: 'ch-22', category: 'Payroll Data', document: 'Rate of Pay History', source: 'missing', provided: false },
  { id: 'ch-23', category: 'Payroll Data', document: 'Allowances Register', source: 'missing', provided: false },
  
  // Leave & Holidays
  { id: 'ch-24', category: 'Leave & Holidays', document: 'Annual Leave Balances', source: 'missing', provided: false },
  { id: 'ch-25', category: 'Leave & Holidays', document: 'Personal/Sick Leave Records', source: 'missing', provided: false },
  { id: 'ch-26', category: 'Leave & Holidays', document: 'Long Service Leave Entitlements', source: 'missing', provided: false },
  { id: 'ch-27', category: 'Leave & Holidays', document: 'Leave Loading Calculations', source: 'missing', provided: false },
  
  // Tax & Reporting
  { id: 'ch-28', category: 'Tax & Reporting', document: 'PAYG Withholding Reports', source: 'missing', provided: false },
  { id: 'ch-29', category: 'Tax & Reporting', document: 'STP Phase 2 Lodgements', source: 'missing', provided: false },
  { id: 'ch-30', category: 'Tax & Reporting', document: 'Payment Summary Annual Reports', source: 'missing', provided: false },
  
  // Superannuation
  { id: 'ch-31', category: 'Superannuation', document: 'Super Guarantee Calculations', source: 'missing', provided: false },
  { id: 'ch-32', category: 'Superannuation', document: 'Super Payment Records', source: 'missing', provided: false },
  { id: 'ch-33', category: 'Superannuation', document: 'Fund Choice Evidence', source: 'missing', provided: false },
  { id: 'ch-34', category: 'Superannuation', document: 'Stapled Fund Searches', source: 'missing', provided: false },
  
  // Payroll Tax
  { id: 'ch-35', category: 'Payroll Tax', document: 'Payroll Tax Returns (by state)', source: 'missing', provided: false },
  { id: 'ch-36', category: 'Payroll Tax', document: 'Grouping Registrations', source: 'missing', provided: false },
  
  // Workers' Compensation
  { id: 'ch-37', category: 'Workers\' Compensation', document: 'Workers\' Comp Policy Documents', source: 'missing', provided: false },
  { id: 'ch-38', category: 'Workers\' Compensation', document: 'Premium Declarations by State', source: 'missing', provided: false },
  
  // Systems & Controls
  { id: 'ch-39', category: 'Systems & Controls', document: 'Payroll System Configuration', source: 'missing', provided: false },
  { id: 'ch-40', category: 'Systems & Controls', document: 'Access Control & Segregation of Duties', source: 'missing', provided: false },
  { id: 'ch-41', category: 'Systems & Controls', document: 'Payroll Process Documentation', source: 'missing', provided: false }
];

const mockEmployees: AuditEmployee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    entity: 'CoreComply Pty Ltd',
    site: 'Melbourne Office',
    state: 'VIC',
    instrument: 'Clerks Award',
    classification: 'Level 3',
    startDate: '2020-03-15',
    status: 'pending',
    issuesCount: 0,
    completeness: 0
  },
  {
    id: 'emp-2',
    name: 'Michael O\'Brien',
    entity: 'CoreComply Pty Ltd',
    site: 'Sydney Office',
    state: 'NSW',
    instrument: 'IT Award',
    classification: 'Level 5',
    startDate: '2019-07-01',
    status: 'pending',
    issuesCount: 0,
    completeness: 0
  },
  {
    id: 'emp-3',
    name: 'Emma Wilson',
    entity: 'CoreComply Pty Ltd',
    site: 'Brisbane Office',
    state: 'QLD',
    instrument: 'Clerks Award',
    classification: 'Level 2',
    startDate: '2021-11-22',
    status: 'pending',
    issuesCount: 0,
    completeness: 0
  }
];

const mockAudits: AuditRequest[] = [
  {
    id: 'audit-1',
    name: 'FY24 Comprehensive Payroll Audit',
    status: 'in-progress',
    scope: {
      entities: ['CoreComply Pty Ltd'],
      states: ['VIC', 'NSW', 'QLD'],
      startDate: '2023-07-01',
      endDate: '2024-06-30',
      population: 'all',
      instruments: ['Clerks Award', 'IT Award']
    },
    owner: 'Sophie Anderson',
    auditor: 'Jane Williams',
    createdDate: '2024-09-01',
    completeness: 35,
    employeeCount: 3,
    issuesCount: 2,
    employees: mockEmployees,
    checklist: mockChecklist,
    findings: []
  }
];

export const useAuditRequestStore = create<AuditRequestState>((set, get) => ({
  audits: mockAudits,
  integrations: mockIntegrations,
  currentAudit: null,
  currentEmployee: null,
  
  addAudit: (audit) =>
    set((state) => ({
      audits: [...state.audits, audit]
    })),
  
  updateAudit: (id, updates) =>
    set((state) => ({
      audits: state.audits.map((audit) =>
        audit.id === id ? { ...audit, ...updates } : audit
      )
    })),
  
  deleteAudit: (id) =>
    set((state) => ({
      audits: state.audits.filter((audit) => audit.id !== id)
    })),
  
  setCurrentAudit: (auditId) =>
    set((state) => ({
      currentAudit: auditId
        ? state.audits.find((a) => a.id === auditId) || null
        : null
    })),
  
  setCurrentEmployee: (employeeId) =>
    set((state) => {
      if (!state.currentAudit || !employeeId) {
        return { currentEmployee: null };
      }
      return {
        currentEmployee:
          state.currentAudit.employees.find((e) => e.id === employeeId) || null
      };
    }),
  
  updateChecklistItem: (auditId, itemId, updates) =>
    set((state) => {
      const updatedAudits = state.audits.map((audit) =>
        audit.id === auditId
          ? {
              ...audit,
              checklist: audit.checklist.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : audit
      );
      return {
        audits: updatedAudits,
        currentAudit: state.currentAudit 
          ? updatedAudits.find(a => a.id === state.currentAudit?.id) || null 
          : null
      };
    }),
  
  toggleIntegration: (integrationId) =>
    set((state) => {
      const integration = state.integrations.find((i) => i.id === integrationId);
      if (!integration) return state;
      
      const newConnectedStatus = !integration.connected;
      
      // Update integration
      const updatedIntegrations = state.integrations.map((i) =>
        i.id === integrationId ? { ...i, connected: newConnectedStatus } : i
      );
      
      // If connecting, auto-populate matching checklist items
      let updatedAudits = state.audits;
      if (newConnectedStatus && state.currentAudit) {
        updatedAudits = state.audits.map((audit) => {
          if (audit.id !== state.currentAudit?.id) return audit;
          
          const updatedChecklist = audit.checklist.map((item) => {
            if (integration.checklistCategories.includes(item.category)) {
              return {
                ...item,
                source: 'system' as EvidenceSource,
                provided: true,
                link: `${integration.name}-${item.id}`
              };
            }
            return item;
          });
          
          return { ...audit, checklist: updatedChecklist };
        });
      }
      
      return {
        integrations: updatedIntegrations,
        audits: updatedAudits,
        currentAudit: state.currentAudit 
          ? updatedAudits.find(a => a.id === state.currentAudit?.id) || null 
          : null
      };
    }),
  
  addFinding: (auditId, finding) =>
    set((state) => {
      const updatedAudits = state.audits.map((audit) =>
        audit.id === auditId
          ? {
              ...audit,
              findings: [...audit.findings, finding],
              issuesCount: audit.issuesCount + 1
            }
          : audit
      );
      return {
        audits: updatedAudits,
        currentAudit: state.currentAudit 
          ? updatedAudits.find(a => a.id === state.currentAudit?.id) || null 
          : null
      };
    }),
  
  updateFinding: (auditId, findingId, updates) =>
    set((state) => {
      const updatedAudits = state.audits.map((audit) =>
        audit.id === auditId
          ? {
              ...audit,
              findings: audit.findings.map((finding) =>
                finding.id === findingId ? { ...finding, ...updates } : finding
              )
            }
          : audit
      );
      return {
        audits: updatedAudits,
        currentAudit: state.currentAudit 
          ? updatedAudits.find(a => a.id === state.currentAudit?.id) || null 
          : null
      };
    })
}));
