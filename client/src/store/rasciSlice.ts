import { create } from 'zustand';

export interface RasciProcess {
  processArea: string;
  obligation: string;
  sourceDriver: string;
  responsible: string;
  accountable: string;
  support: string;
  consulted: string;
  informed: string;
  evidence: string;
  controlRef: string;
}

export interface RasciPersonAssignment {
  processArea: string;
  obligation: string;
  role: 'R' | 'A' | 'S' | 'C' | 'I';
  roleName: string;
  assignedPersonId: string | null;
  assignedPersonName: string | null;
}

interface RasciState {
  processes: RasciProcess[];
  assignments: RasciPersonAssignment[];
  updateAssignment: (processArea: string, obligation: string, role: 'R' | 'A' | 'S' | 'C' | 'I', personId: string, personName: string) => void;
  getAssignment: (processArea: string, obligation: string, role: 'R' | 'A' | 'S' | 'C' | 'I') => RasciPersonAssignment | undefined;
}

// Real Australian Payroll Governance Management System Framework (APGF-MS) compliance matrix processes
const apgfProcesses: RasciProcess[] = [
  { processArea: "Workforce planning & hiring", obligation: "Define position, employment basis & award coverage", sourceDriver: "FWA/NES; Modern Award", responsible: "HR Officer", accountable: "Compliance Owner", support: "Legal/IR", consulted: "Line Manager", informed: "CEO/Board", evidence: "Role description; award map; approval", controlRef: "APGF-MS 2.1" },
  { processArea: "Workforce planning & hiring", obligation: "Right-to-work check (VEVO/citizen proof)", sourceDriver: "Migration Act; Home Affairs", responsible: "HR Officer", accountable: "Compliance Owner", support: "Legal/IR", consulted: "Line Manager", informed: "Payroll Officer", evidence: "VEVO log; ID record", controlRef: "APGF-MS 5.2" },
  { processArea: "Workforce planning & hiring", obligation: "Offer letter & contract (terms, award/EA ref, FWA clauses)", sourceDriver: "FWA; Award/EA", responsible: "HR Officer", accountable: "Legal/IR", support: "Compliance Owner", consulted: "Line Manager", informed: "Payroll Officer", evidence: "Signed contract; EA/Award link", controlRef: "APGF-MS 2.3" },
  { processArea: "Workforce planning & hiring", obligation: "Fixed-term contract limits & FTC Information Statement", sourceDriver: "Closing Loopholes; FWO FTCIS", responsible: "HR Officer", accountable: "Compliance Owner", support: "Legal/IR", consulted: "Line Manager", informed: "Payroll Officer", evidence: "FTCIS issue log; contract duration tracker", controlRef: "APGF-MS 5.3" },
  { processArea: "Workforce planning & hiring", obligation: "Casual conversion assessment & notices", sourceDriver: "FWA; FWO guidelines", responsible: "HR Officer", accountable: "Compliance Owner", support: "Legal/IR", consulted: "Line Manager", informed: "Payroll Officer", evidence: "Assessment log; notices", controlRef: "APGF-MS 6.4" },
  { processArea: "Onboarding", obligation: "Collect new starter forms (TFND, Super Choice) & privacy consent", sourceDriver: "ATO; TFN Rule; Privacy Act", responsible: "HR Officer", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Legal/IR", informed: "IT/InfoSec", evidence: "TFND receipt; choice form; consent", controlRef: "APGF-MS 4.4" },
  { processArea: "Onboarding", obligation: "Stapled super fund check", sourceDriver: "ATO stapled fund", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Legal/IR", informed: "Employee", evidence: "Stapled fund search evidence", controlRef: "APGF-MS 5.6" },
  { processArea: "Onboarding", obligation: "Provide Fair Work Information Statement (FWIS/CEIS)", sourceDriver: "FWO", responsible: "HR Officer", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Line Manager", informed: "Employee", evidence: "FWIS/CEIS issue log", controlRef: "APGF-MS 4.2" },
  { processArea: "Onboarding", obligation: "Policy acknowledgements (Code, Leave, Payroll, Privacy)", sourceDriver: "Company policy; Privacy Act", responsible: "HR Officer", accountable: "Compliance Owner", support: "IT/InfoSec", consulted: "Legal/IR", informed: "Line Manager", evidence: "Signed acknowledgements", controlRef: "APGF-MS 4.1" },
  { processArea: "Time & attendance", obligation: "Define ordinary hours/rostering, breaks, span of hours", sourceDriver: "Award/EA; NES", responsible: "Line Manager", accountable: "Compliance Owner", support: "HR Officer", consulted: "Payroll Officer", informed: "Employees", evidence: "Roster; policy; system config", controlRef: "APGF-MS 5.1" },
  { processArea: "Time & attendance", obligation: "Capture time/attendance and approvals (incl. remote/overtime)", sourceDriver: "Award/EA", responsible: "Line Manager", accountable: "Compliance Owner", support: "HR Officer", consulted: "Payroll Officer", informed: "Employees", evidence: "Timesheets; approval trail", controlRef: "APGF-MS 5.1" },
  { processArea: "Time & attendance", obligation: "Annualised wage recordkeeping & outer limits", sourceDriver: "Award clauses", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Line Manager", informed: "Employees", evidence: "Outer limit config; recon log", controlRef: "APGF-MS 6.2" },
  { processArea: "Pay configuration", obligation: "Classification to award level & pay guide versioning", sourceDriver: "FWO pay guides", responsible: "HR Officer", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Line Manager", informed: "Legal/IR", evidence: "Classification record; pay guide ref", controlRef: "APGF-MS 5.5" },
  { processArea: "Pay configuration", obligation: "Allowances, penalties, loadings rules mapped", sourceDriver: "Award/EA", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Line Manager", informed: "Legal/IR", evidence: "Rule set doc; test cases", controlRef: "APGF-MS 5.5" },
  { processArea: "Pay configuration", obligation: "Superannuation SG rate & eligibility rules", sourceDriver: "SG Act; ATO", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Finance Manager", informed: "Employee", evidence: "SG config; exceptions", controlRef: "APGF-MS 5.6" },
  { processArea: "Pay configuration", obligation: "Tax scales, HELP/Trade support, WHM rates", sourceDriver: "ATO", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Finance Manager", informed: "Employee", evidence: "Tax table config; TFND data", controlRef: "APGF-MS 5.7" },
  { processArea: "Payroll processing", obligation: "Run payroll; issue payslips within 1 working day", sourceDriver: "FWA Regs", responsible: "Payroll Officer", accountable: "Finance Manager", support: "HR Officer", consulted: "Compliance Owner", informed: "Employees", evidence: "Payslip samples; timing report", controlRef: "APGF-MS 5.8" },
  { processArea: "Payroll processing", obligation: "Single Touch Payroll (STP Phase 2) lodgement per pay event", sourceDriver: "ATO STP", responsible: "Payroll Officer", accountable: "Finance Manager", support: "HR Officer", consulted: "Compliance Owner", informed: "CEO/Board", evidence: "STP receipt; error resolution log", controlRef: "APGF-MS 6.1" },
  { processArea: "Payroll processing", obligation: "Child Support deductions & remittance", sourceDriver: "Services Australia", responsible: "Payroll Officer", accountable: "Finance Manager", support: "HR Officer", consulted: "Compliance Owner", informed: "Employee", evidence: "Deduction calc; remittance proof", controlRef: "APGF-MS 5.10" },
  { processArea: "Payroll processing", obligation: "Portable LSL (industry schemes) contributions", sourceDriver: "State schemes", responsible: "Payroll Officer", accountable: "Finance Manager", support: "HR Officer", consulted: "Compliance Owner", informed: "Line Manager", evidence: "Scheme return; payment proof", controlRef: "APGF-MS 5.11" },
  { processArea: "Superannuation", obligation: "SG calculation & quarterly payment by due dates", sourceDriver: "ATO SG", responsible: "Payroll Officer", accountable: "Finance Manager", support: "HR Officer", consulted: "Compliance Owner", informed: "Employee", evidence: "Payment file; SuperStream proof", controlRef: "APGF-MS 6.3" },
  { processArea: "Superannuation", obligation: "Super choice changes & default MySuper compliance", sourceDriver: "SG Act", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Finance Manager", informed: "Employee", evidence: "Choice records; default fund docs", controlRef: "APGF-MS 5.6" },
  { processArea: "Tax & reporting", obligation: "PAYG-W reporting on BAS/IAS", sourceDriver: "ATO", responsible: "Finance Manager", accountable: "CEO/Board", support: "Payroll Officer", consulted: "Compliance Owner", informed: "External Accountant", evidence: "BAS/IAS copies; payments", controlRef: "APGF-MS 6.5" },
  { processArea: "Tax & reporting", obligation: "Reportable Fringe Benefits Amounts (RFBA) via STP", sourceDriver: "FBT Act; ATO", responsible: "Finance Manager", accountable: "CEO/Board", support: "Payroll Officer", consulted: "Compliance Owner", informed: "External Accountant", evidence: "RFBA workpapers; STP finalisation", controlRef: "APGF-MS 6.6" },
  { processArea: "Tax & reporting", obligation: "Year-end STP finalisation (income statements)", sourceDriver: "ATO STP", responsible: "Payroll Officer", accountable: "Finance Manager", support: "HR Officer", consulted: "Compliance Owner", informed: "Employees", evidence: "Finalisation event; comms", controlRef: "APGF-MS 6.1" },
  { processArea: "Leave & benefits", obligation: "NES leave accruals & balances (annual, personal, etc.)", sourceDriver: "NES; FWA", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Line Manager", informed: "Employees", evidence: "Accrual proofs; policy link", controlRef: "APGF-MS 5.4" },
  { processArea: "Leave & benefits", obligation: "FDV leave handling (privacy on payslips)", sourceDriver: "FWO guidance", responsible: "HR Officer", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Legal/IR", informed: "IT/InfoSec", evidence: "Masked payslip; restricted access", controlRef: "APGF-MS 4.5" },
  { processArea: "Leave & benefits", obligation: "Parental Leave (Services Australia vs employer-paid)", sourceDriver: "PPL Act", responsible: "HR Officer", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Finance Manager", informed: "Employee", evidence: "PPL correspondence; pay config", controlRef: "APGF-MS 5.12" },
  { processArea: "Remuneration changes", obligation: "Annual wage reviews & increments per award/EA", sourceDriver: "FWO; EA", responsible: "HR Officer", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Line Manager", informed: "Finance Manager", evidence: "Change log; approval", controlRef: "APGF-MS 5.5" },
  { processArea: "Remuneration changes", obligation: "Promotions/reclassifications & backpay rules", sourceDriver: "Award/EA", responsible: "HR Officer", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Line Manager", informed: "Finance Manager", evidence: "Reclass approval; calc evidence", controlRef: "APGF-MS 5.5" },
  { processArea: "End of employment", obligation: "Notice/redundancy/ETP tax calc; final pay timing", sourceDriver: "NES; ATO", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Line Manager", informed: "Finance Manager", evidence: "Final pay calc; ETP summary", controlRef: "APGF-MS 5.9" },
  { processArea: "End of employment", obligation: "STP cessation codes; super/leave pay-outs", sourceDriver: "ATO STP; Award/EA", responsible: "Payroll Officer", accountable: "Finance Manager", support: "HR Officer", consulted: "Compliance Owner", informed: "Employee", evidence: "STP cessation event; remittance", controlRef: "APGF-MS 6.1" },
  { processArea: "End of employment", obligation: "Return of property & access removal", sourceDriver: "Security policy", responsible: "IT/InfoSec", accountable: "Compliance Owner", support: "HR Officer", consulted: "Line Manager", informed: "Payroll Officer", evidence: "Deprovision log", controlRef: "APGF-MS 7.3" },
  { processArea: "State obligations", obligation: "Payroll tax registration, returns & annual recon", sourceDriver: "State revenue", responsible: "Finance Manager", accountable: "CEO/Board", support: "Payroll Officer", consulted: "Compliance Owner", informed: "External Accountant", evidence: "Returns; grouping analysis", controlRef: "APGF-MS 6.7" },
  { processArea: "State obligations", obligation: "Workers' compensation policy & annual wage declaration", sourceDriver: "State insurers", responsible: "HR Officer", accountable: "CEO/Board", support: "Payroll Officer", consulted: "Compliance Owner", informed: "Finance Manager", evidence: "Policy certificate; wage dec", controlRef: "APGF-MS 6.8" },
  { processArea: "State obligations", obligation: "Long Service Leave (state-based) accrual & payment", sourceDriver: "State LSL Acts", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Finance Manager", informed: "Employees", evidence: "Accrual calc; payment proof", controlRef: "APGF-MS 5.13" },
  { processArea: "Governance & audit", obligation: "Internal payroll control testing (SoD, approvals, logs)", sourceDriver: "APGF-MS; ISO style", responsible: "Compliance Owner", accountable: "CEO/Board", support: "Internal Audit", consulted: "Finance Manager", informed: "HR Officer", evidence: "Test plans; findings; actions", controlRef: "APGF-MS 9.1" },
  { processArea: "Governance & audit", obligation: "Annualised wages reconciliation & make-good", sourceDriver: "Award clauses", responsible: "Payroll Officer", accountable: "Compliance Owner", support: "HR Officer", consulted: "Line Manager", informed: "Employees", evidence: "Reconciliation report; make-good", controlRef: "APGF-MS 6.2" },
  { processArea: "Governance & audit", obligation: "External audit/assurance & regulator liaison", sourceDriver: "Company policy", responsible: "Compliance Owner", accountable: "CEO/Board", support: "Finance Manager", consulted: "Payroll Officer", informed: "Legal/IR", evidence: "Audit engagement; responses", controlRef: "APGF-MS 9.2" },
  { processArea: "Governance & audit", obligation: "Regulatory change monitoring & register updates", sourceDriver: "FWO/ATO/State updates", responsible: "Compliance Owner", accountable: "CEO/Board", support: "Legal/IR", consulted: "Payroll Officer", informed: "HR Officer", evidence: "Change log; versioned register", controlRef: "APGF-MS 10.1" },
  { processArea: "Privacy & security", obligation: "TFN Rule compliance & secure storage/destruction", sourceDriver: "OAIC TFN Rule", responsible: "IT/InfoSec", accountable: "Compliance Owner", support: "Payroll Officer", consulted: "Legal/IR", informed: "HR Officer", evidence: "Access logs; disposal cert", controlRef: "APGF-MS 7.2" },
  { processArea: "Privacy & security", obligation: "Data breach response (NDB scheme) incl. payroll data", sourceDriver: "OAIC NDB", responsible: "IT/InfoSec", accountable: "Compliance Owner", support: "Legal/IR", consulted: "CEO/Board", informed: "Payroll Officer", evidence: "IR plan; drills; notifications", controlRef: "APGF-MS 7.4" },
  { processArea: "Privacy & security", obligation: "Segregation of duties (preparer/reviewer/approver)", sourceDriver: "APGF-MS policy", responsible: "Compliance Owner", accountable: "CEO/Board", support: "Finance Manager", consulted: "Payroll Officer", informed: "Internal Audit", evidence: "SoD matrix; workflow config", controlRef: "APGF-MS 7.1" },
];

// Initialize assignments for all processes and all 5 RASCI roles
const initialAssignments: RasciPersonAssignment[] = apgfProcesses.flatMap((process) => [
  { processArea: process.processArea, obligation: process.obligation, role: 'R' as const, roleName: process.responsible, assignedPersonId: null, assignedPersonName: null },
  { processArea: process.processArea, obligation: process.obligation, role: 'A' as const, roleName: process.accountable, assignedPersonId: null, assignedPersonName: null },
  { processArea: process.processArea, obligation: process.obligation, role: 'S' as const, roleName: process.support, assignedPersonId: null, assignedPersonName: null },
  { processArea: process.processArea, obligation: process.obligation, role: 'C' as const, roleName: process.consulted, assignedPersonId: null, assignedPersonName: null },
  { processArea: process.processArea, obligation: process.obligation, role: 'I' as const, roleName: process.informed, assignedPersonId: null, assignedPersonName: null },
]);

export const useRasciStore = create<RasciState>((set, get) => ({
  processes: apgfProcesses,
  assignments: initialAssignments,

  updateAssignment: (processArea: string, obligation: string, role: 'R' | 'A' | 'S' | 'C' | 'I', personId: string, personName: string) => {
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        assignment.processArea === processArea && assignment.obligation === obligation && assignment.role === role
          ? { ...assignment, assignedPersonId: personId, assignedPersonName: personName }
          : assignment
      ),
    }));
  },

  getAssignment: (processArea: string, obligation: string, role: 'R' | 'A' | 'S' | 'C' | 'I') => {
    return get().assignments.find(
      (assignment) => assignment.processArea === processArea && assignment.obligation === obligation && assignment.role === role
    );
  },
}));
