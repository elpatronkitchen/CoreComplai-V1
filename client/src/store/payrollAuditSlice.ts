import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PayrollAuditSession,
  PayrollAuditFilters,
  PayrollAuditKPIs,
  Finding,
  EmployeeAuditRecord,
  PayrunValidationRow,
  VarianceExplanation,
  AuditNote,
  AuditIntegrationHealth,
  TimesheetEntry,
  PayslipEntry,
  EvidenceRef
} from '../types/payrollAudit';

// Mock data generators
const generateMockTimesheet = (employeeId: string, date: string, isManual = false): TimesheetEntry => ({
  id: `ts-${employeeId}-${date}-${Math.random().toString(36).substr(2, 9)}`,
  employeeId,
  date,
  startTime: '09:00',
  endTime: '17:30',
  breakMinutes: 30,
  hours: 8,
  approvedBy: isManual ? undefined : 'supervisor@company.com.au',
  source: 'Employment Hero',
  isManual,
  status: 'approved'
});

const generateMockPayslip = (employeeId: string, payrunId: string): PayslipEntry => ({
  id: `ps-${employeeId}-${payrunId}`,
  employeeId,
  payrunId,
  periodStart: '2024-09-16',
  periodEnd: '2024-09-29',
  lines: [
    { code: 'ORD', label: 'Ordinary Hours', quantity: 80, rate: 32.50, amount: 2600.00 },
    { code: 'OT1.5', label: 'Overtime 1.5x', quantity: 4, rate: 48.75, amount: 195.00 },
    { code: 'SUPER', label: 'Superannuation', quantity: 1, rate: 306.25, amount: 306.25 }
  ],
  grossPay: 2795.00,
  tax: 558.00,
  superannuation: 306.25,
  netPay: 2237.00,
  source: 'Employment Hero',
  stpStatus: 'Success',
  stpEventId: 'stp-2024-09-29-001'
});

const generateMockEvidenceRef = (type: 'pdf' | 'json' | 'doc', title: string): EvidenceRef => ({
  id: `ev-${Math.random().toString(36).substr(2, 9)}`,
  type,
  title,
  source: 'Employment Hero',
  hashSha256: `sha256-${Math.random().toString(36).substr(2, 16)}`,
  collectedAt: new Date().toISOString()
});

// Mock employee data with realistic Australian payroll scenarios
const mockEmployeeAuditRecords: EmployeeAuditRecord[] = [
  {
    employeeId: 'emp-001',
    employeeName: 'Sarah Chen',
    department: 'Marketing',
    costCentre: 'MKT-001',
    award: 'Clerks - Private Sector Award 2020',
    employmentType: 'Full-time',
    status: 'Active',
    baseRate: 32.50,
    timesheets: [
      generateMockTimesheet('emp-001', '2024-09-16'),
      generateMockTimesheet('emp-001', '2024-09-17'),
      generateMockTimesheet('emp-001', '2024-09-18'),
      generateMockTimesheet('emp-001', '2024-09-19'),
      generateMockTimesheet('emp-001', '2024-09-20')
    ],
    payslips: [generateMockPayslip('emp-001', 'PR-0925')],
    varianceHours: -2.5, // Paid less than timesheets show
    varianceAmount: -81.25,
    exceptions: ['UNPAID_BREAK']
  },
  {
    employeeId: 'emp-002',
    employeeName: 'David Kim',
    department: 'Engineering',
    costCentre: 'ENG-001',
    award: 'Professional Employees Award 2020',
    employmentType: 'Full-time',
    status: 'Active',
    baseRate: 45.00,
    timesheets: [
      generateMockTimesheet('emp-002', '2024-09-16'),
      generateMockTimesheet('emp-002', '2024-09-17'),
      generateMockTimesheet('emp-002', '2024-09-18'),
      generateMockTimesheet('emp-002', '2024-09-19'),
      generateMockTimesheet('emp-002', '2024-09-20')
    ],
    payslips: [generateMockPayslip('emp-002', 'PR-0925')],
    varianceHours: 4.0, // Overtime paid but not in timesheets
    varianceAmount: 270.00,
    exceptions: ['OT_PAID_NO_TS']
  },
  {
    employeeId: 'emp-003',
    employeeName: 'Jessica Wong',
    department: 'Finance',
    costCentre: 'FIN-001',
    award: 'Banking, Finance and Insurance Award 2020',
    employmentType: 'Part-time',
    status: 'Terminated',
    baseRate: 38.75,
    timesheets: [],
    payslips: [generateMockPayslip('emp-003', 'PR-0925')],
    varianceHours: 40.0, // Paid after termination
    varianceAmount: 1550.00,
    exceptions: ['POST_TERM_PAY', 'MISSING_TS']
  },
  {
    employeeId: 'emp-004',
    employeeName: 'Michael Rodriguez',
    department: 'Operations',
    costCentre: 'OPS-001',
    award: 'General Retail Industry Award 2020',
    employmentType: 'Casual',
    status: 'Active',
    baseRate: 29.85,
    timesheets: [
      generateMockTimesheet('emp-004', '2024-09-16'),
      generateMockTimesheet('emp-004', '2024-09-17', true), // Manual entry
      generateMockTimesheet('emp-004', '2024-09-18'),
      generateMockTimesheet('emp-004', '2024-09-19'),
      generateMockTimesheet('emp-004', '2024-09-20')
    ],
    payslips: [generateMockPayslip('emp-004', 'PR-0925')],
    varianceHours: 0.0,
    varianceAmount: 0.00,
    exceptions: ['MANUAL_TS_ENTRY']
  }
];

// Mock findings based on exceptions
const mockFindings: Finding[] = [
  {
    id: 'find-001',
    employeeId: 'emp-003',
    payrunId: 'PR-0925',
    periodStart: '2024-09-16',
    periodEnd: '2024-09-29',
    code: 'POST_TERM_PAY',
    title: 'Post-termination payment detected',
    severity: 'critical',
    status: 'Open',
    assignee: 'compliance@company.com.au',
    createdAt: '2024-09-30T10:15:00Z',
    updatedAt: '2024-09-30T10:15:00Z',
    evidence: [
      generateMockEvidenceRef('pdf', 'Payslip - Jessica Wong - PR-0925'),
      generateMockEvidenceRef('json', 'HR Termination Record - Jessica Wong'),
      generateMockEvidenceRef('doc', 'Employment Hero Export - Pay Events')
    ],
    notes: [
      {
        at: '2024-09-30T10:15:00Z',
        author: 'auditor@company.com.au',
        text: 'Employee was terminated on 2024-09-13 but received pay for period ending 2024-09-29. Requires investigation.'
      }
    ]
  },
  {
    id: 'find-002',
    employeeId: 'emp-002',
    payrunId: 'PR-0925',
    periodStart: '2024-09-16',
    periodEnd: '2024-09-29',
    code: 'OT_PAID_NO_TS',
    title: 'Overtime paid without timesheet evidence',
    severity: 'warn',
    status: 'Open',
    createdAt: '2024-09-30T10:20:00Z',
    updatedAt: '2024-09-30T10:20:00Z',
    evidence: [
      generateMockEvidenceRef('pdf', 'Payslip - David Kim - PR-0925'),
      generateMockEvidenceRef('json', 'Deputy Timesheet Export - David Kim')
    ],
    notes: [
      {
        at: '2024-09-30T10:20:00Z',
        author: 'auditor@company.com.au',
        text: 'Overtime 1.5x payment of 4 hours detected but no corresponding overtime entries in Deputy timesheets.'
      }
    ]
  },
  {
    id: 'find-003',
    employeeId: 'emp-001',
    payrunId: 'PR-0925',
    code: 'UNPAID_BREAK',
    title: 'Unpaid break adjustment variance',
    severity: 'info',
    status: 'Resolved',
    createdAt: '2024-09-30T10:25:00Z',
    updatedAt: '2024-10-01T14:30:00Z',
    evidence: [
      generateMockEvidenceRef('json', 'Employment Hero Timesheet - Sarah Chen')
    ],
    notes: [
      {
        at: '2024-09-30T10:25:00Z',
        author: 'auditor@company.com.au',
        text: 'Variance due to unpaid break policy - 30 minutes deducted from daily totals.'
      },
      {
        at: '2024-10-01T14:30:00Z',
        author: 'payroll@company.com.au',
        text: 'Confirmed - standard unpaid break deduction applied correctly per employment agreement.'
      }
    ]
  }
];

// Mock payrun validation rows
const mockPayrunValidation: PayrunValidationRow[] = mockEmployeeAuditRecords.map(record => ({
  employee: {
    id: record.employeeId,
    name: record.employeeName,
    department: record.department,
    costCentre: record.costCentre,
    award: record.award
  },
  payruns: ['PR-0925'],
  taaHours: record.timesheets.reduce((sum, ts) => sum + ts.hours, 0),
  paidHours: record.payslips.reduce((sum, ps) => sum + (ps.lines.find(l => l.code === 'ORD')?.quantity || 0), 0),
  varianceHours: record.varianceHours,
  estimatedVarianceAmount: record.varianceAmount,
  stpStatus: record.payslips[0]?.stpStatus || 'Pending',
  exceptions: record.exceptions,
  timesheets: record.timesheets,
  payslips: record.payslips
}));

// Mock integration health
const mockIntegrationHealth: AuditIntegrationHealth = {
  payrollSource: {
    name: 'Employment Hero',
    status: 'Connected',
    lastSync: '2024-09-30T08:30:00Z'
  },
  taaSource: {
    name: 'Deputy',
    status: 'Connected',
    lastSync: '2024-09-30T08:15:00Z'
  },
  reliability: 'High',
  warnings: []
};

interface PayrollAuditStore {
  // Current session
  currentSession: PayrollAuditSession | null;
  
  // Filters
  filters: PayrollAuditFilters;
  
  // Data
  employeeRecords: EmployeeAuditRecord[];
  payrunValidation: PayrunValidationRow[];
  findings: Finding[];
  varianceExplanations: VarianceExplanation[];
  auditNotes: AuditNote[];
  integrationHealth: AuditIntegrationHealth;
  
  // UI State
  selectedView: 'payrun-validation' | 'employee-variance' | 'findings';
  selectedEmployeeId: string | null;
  expandedRowId: string | null;
  
  // Actions
  setFilters: (filters: Partial<PayrollAuditFilters>) => void;
  startAuditSession: () => void;
  endAuditSession: () => void;
  setSelectedView: (view: 'payrun-validation' | 'employee-variance' | 'findings') => void;
  setSelectedEmployee: (employeeId: string | null) => void;
  setExpandedRow: (rowId: string | null) => void;
  createFinding: (finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  addFindingNote: (findingId: string, note: { author: string; text: string }) => void;
  createVarianceExplanation: (explanation: Omit<VarianceExplanation, 'id' | 'createdAt'>) => void;
  addAuditNote: (note: Omit<AuditNote, 'id' | 'createdAt'>) => void;
  exportEvidencePack: (employeeId: string, payrunId: string) => Promise<string>;
  getKPIs: () => PayrollAuditKPIs;
  getFilteredData: () => PayrunValidationRow[];
}

export const usePayrollAuditStore = create<PayrollAuditStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      filters: {
        paySource: 'EmploymentHero',
        taaSource: 'Deputy',
        payruns: ['PR-0925'],
        varianceOnly: false
      },
      employeeRecords: mockEmployeeAuditRecords,
      payrunValidation: mockPayrunValidation,
      findings: mockFindings,
      varianceExplanations: [],
      auditNotes: [],
      integrationHealth: mockIntegrationHealth,
      selectedView: 'payrun-validation',
      selectedEmployeeId: null,
      expandedRowId: null,

      // Actions
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      startAuditSession: () => {
        const session: PayrollAuditSession = {
          id: `audit-${Date.now()}`,
          filters: get().filters,
          kpis: get().getKPIs(),
          findings: [],
          startedAt: new Date().toISOString()
        };
        set({ currentSession: session });
      },

      endAuditSession: () => {
        const state = get();
        if (state.currentSession) {
          set({
            currentSession: {
              ...state.currentSession,
              endedAt: new Date().toISOString(),
              findings: state.findings
            }
          });
        }
      },

      setSelectedView: (view) => set({ selectedView: view }),
      
      setSelectedEmployee: (employeeId) => set({ selectedEmployeeId: employeeId }),
      
      setExpandedRow: (rowId) => set({ expandedRowId: rowId }),

      createFinding: (findingData) => {
        const finding: Finding = {
          ...findingData,
          id: `find-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({
          findings: [...state.findings, finding]
        }));
      },

      updateFinding: (id, updates) => {
        set((state) => ({
          findings: state.findings.map(finding =>
            finding.id === id
              ? { ...finding, ...updates, updatedAt: new Date().toISOString() }
              : finding
          )
        }));
      },

      addFindingNote: (findingId, note) => {
        const noteWithTimestamp = {
          ...note,
          at: new Date().toISOString()
        };
        set((state) => ({
          findings: state.findings.map(finding =>
            finding.id === findingId
              ? {
                ...finding,
                notes: [...finding.notes, noteWithTimestamp],
                updatedAt: new Date().toISOString()
              }
              : finding
          )
        }));
      },

      createVarianceExplanation: (explanationData) => {
        const explanation: VarianceExplanation = {
          ...explanationData,
          id: `var-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          varianceExplanations: [...state.varianceExplanations, explanation]
        }));
      },

      addAuditNote: (noteData) => {
        const note: AuditNote = {
          ...noteData,
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
          evidence: noteData.evidence || []
        };
        set((state) => ({
          auditNotes: [...state.auditNotes, note]
        }));
      },

      exportEvidencePack: async (employeeId, payrunId) => {
        // Mock export functionality - returns a reference/URL
        const timestamp = new Date().toISOString().slice(0, 10);
        const packId = `evidence-pack-${employeeId}-${payrunId}-${timestamp}`;
        return Promise.resolve(`/api/audit/evidence-packs/${packId}.zip`);
      },

      getKPIs: () => {
        const state = get();
        const filteredData = state.getFilteredData();
        
        return {
          employees: filteredData.length,
          periodsReconciled: state.filters.payruns.length,
          varianceHours: filteredData.reduce((sum, row) => sum + Math.abs(row.varianceHours), 0),
          stpExceptions: filteredData.filter(row => row.stpStatus === 'Error').length
        };
      },

      getFilteredData: () => {
        const state = get();
        let data = state.payrunValidation;

        // Apply filters
        if (state.filters.varianceOnly) {
          data = data.filter(row => row.varianceHours !== 0);
        }

        if (state.filters.employeeIds && state.filters.employeeIds.length > 0) {
          data = data.filter(row => state.filters.employeeIds!.includes(row.employee.id));
        }

        return data;
      }
    }),
    {
      name: 'payroll-audit-store',
      // Only persist filters and UI state, not the full data
      partialize: (state) => ({
        filters: state.filters,
        selectedView: state.selectedView,
        varianceExplanations: state.varianceExplanations,
        auditNotes: state.auditNotes
      })
    }
  )
);