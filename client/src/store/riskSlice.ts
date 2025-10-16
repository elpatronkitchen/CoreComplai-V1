import { create } from 'zustand';

export type RiskDomain = 
  | 'Executive'
  | 'Board/Director'
  | 'Governance' 
  | 'Payroll' 
  | 'HR' 
  | 'Finance' 
  | 'IT' 
  | 'Technology'
  | 'Privacy' 
  | 'State Taxes'
  | 'Operational'
  | 'Compliance'
  | 'Regulatory'
  | 'Strategic'
  | 'Cyber';

export type RiskCategory = 
  | 'Executive Leadership'
  | 'Board/Director' 
  | 'Legal'
  | 'Financial'
  | 'Governance'
  | 'Operational'
  | 'Strategic'
  | 'Compliance'
  | 'Technology'
  | 'Cyber'
  | 'Regulatory';

export type RiskLevel = 'Low' | 'Low-Med' | 'Low-Medium' | 'Medium' | 'Med-High' | 'Medium-High' | 'High' | 'High-Medium' | 'Very High';
export type Likelihood = 'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain';
export type Impact = 'Minimal' | 'Minor' | 'Moderate' | 'Major' | 'Severe';

export interface KRI {
  metric: string;
  current: number | string;
  threshold: number | string;
  status: 'green' | 'amber' | 'red';
  unit?: string;
}

export interface Risk {
  id: string;
  title: string;
  domain: RiskDomain;
  category: RiskCategory;
  description: string;
  causes?: string;
  linkedObligations: string[];
  controlRefs: string[];
  existingControls: string;
  rasci: {
    R: string;
    A: string;
    S: string;
    C: string;
    I: string;
  };
  likelihood: Likelihood;
  impact: Impact;
  inherentRisk: RiskLevel;
  treatmentPlan: string;
  residualRisk: RiskLevel;
  owner: string;
  earlyWarnings: string[];
  kris: KRI[];
  status?: 'Open' | 'In Progress' | 'Mitigated' | 'Accepted';
  lastReviewed?: string;
  nextReview?: string;
}

interface RiskState {
  risks: Risk[];
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  linkObligation: (riskId: string, obligationId: string) => void;
  unlinkObligation: (riskId: string, obligationId: string) => void;
  adoptRasciFromObligations: (riskId: string) => void;
  updateKRI: (riskId: string, kriIndex: number, kri: KRI) => void;
}

const initialRisks: Risk[] = [
  // Executive Leadership Risks (EX001-EX005)
  {
    id: 'EX001',
    title: 'Tone at the top & resourcing failure',
    domain: 'Executive',
    category: 'Governance',
    description: 'Leaders fail to prioritise payroll compliance; under-resourced payroll; unrealistic deadlines.',
    linkedObligations: ['OBL-POL-001', 'OBL-AUD-001'],
    controlRefs: ['2.3', '9.1'],
    existingControls: 'Policy mandate; capacity planning; compliance OKRs.',
    rasci: {
      R: 'CEO/Exec',
      A: 'Board/Directors',
      S: 'Compliance Owner',
      C: 'HR Officer',
      I: 'All Managers'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Board dashboard; resource approvals; training budget; exec OKRs include compliance.',
    residualRisk: 'Medium',
    owner: 'CEO',
    earlyWarnings: ['Missed reviews', 'High overtime', 'Staff churn'],
    kris: [
      { metric: 'Training completion', current: '≥95%', threshold: '95%', status: 'green', unit: '%' },
      { metric: 'Open risks >60 days', current: 0, threshold: 0, status: 'green', unit: 'count' }
    ],
    status: 'In Progress',
    lastReviewed: '2025-09-15',
    nextReview: '2025-10-03'
  },
  {
    id: 'EX002',
    title: 'Inadequate stakeholder communication & change mgmt',
    domain: 'Executive',
    category: 'Governance',
    description: 'Poor cross-function coordination (HR/Payroll/Finance/IT/Legal); changes not socialised; evidence not captured.',
    linkedObligations: ['OBL-AUD-003'],
    controlRefs: ['10.1'],
    existingControls: 'RASCI embedded; change calendar; evidence gates.',
    rasci: {
      R: 'Compliance Owner',
      A: 'CEO/Board',
      S: 'HR/Payroll/Finance Leads',
      C: 'Legal/IR',
      I: 'Board'
    },
    likelihood: 'Possible',
    impact: 'Moderate',
    inherentRisk: 'Medium',
    treatmentPlan: 'Weekly change stand-up; comms templates; evidence field checks.',
    residualRisk: 'Low-Medium',
    owner: 'Compliance Owner',
    earlyWarnings: ['Un-notified change count', 'Failed hand-offs'],
    kris: [
      { metric: 'Change comms SLA', current: '≥95%', threshold: '95%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'EX003',
    title: 'Business continuity breakdown (cannot pay on time)',
    domain: 'Executive',
    category: 'Operational',
    description: 'Critical outage or dependency failure without effective DR/testing; no alternate payment method.',
    linkedObligations: ['OBL-AUD-001'],
    controlRefs: ['9.1'],
    existingControls: 'DR runbook & quarterly tests; bank template fallback; alternate authorisers.',
    rasci: {
      R: 'System Admin',
      A: 'Compliance Owner',
      S: 'Payroll Officer',
      C: 'Vendor/ITSec',
      I: 'CEO/Board'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'Medium-High',
    treatmentPlan: 'Rehearse DR quarterly; publish contact trees; simulate T+1 payroll.',
    residualRisk: 'Medium',
    owner: 'System Admin',
    earlyWarnings: ['Provider status red', 'Failed DR tests'],
    kris: [
      { metric: 'Payroll completed in DR', current: '≤T+1', threshold: 'T+1', status: 'green', unit: 'days' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'EX004',
    title: 'Regulatory change backlog (executive oversight)',
    domain: 'Executive',
    category: 'Strategic',
    description: 'Executive fails to sponsor timely implementation of new obligations.',
    linkedObligations: ['OBL-AUD-003'],
    controlRefs: ['10.1'],
    existingControls: 'Change forum; dedicated capacity; compliance sign-off gate.',
    rasci: {
      R: 'Compliance Owner',
      A: 'CEO/Board',
      S: 'HR/Payroll Leads',
      C: 'Legal/IR',
      I: 'Board'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Monthly backlog triage; regression test; release notes; PIR.',
    residualRisk: 'Medium',
    owner: 'CEO',
    earlyWarnings: ['Items aging >30d', 'Missed effective dates'],
    kris: [
      { metric: 'Missed effective dates', current: 0, threshold: 0, status: 'green', unit: 'count' },
      { metric: 'Update backlog', current: '≤30d', threshold: '30d', status: 'green', unit: 'days' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'EX005',
    title: 'Misaligned incentives (speed vs compliance)',
    domain: 'Executive',
    category: 'Governance',
    description: 'KPIs reward cycle-time/cost over compliance; shortcuts encouraged.',
    linkedObligations: ['OBL-POL-001'],
    controlRefs: ['2.3'],
    existingControls: 'PO governance; policy; AC in stories.',
    rasci: {
      R: 'PO/PM',
      A: 'CEO',
      S: 'Compliance Owner',
      C: 'HR',
      I: 'Board'
    },
    likelihood: 'Possible',
    impact: 'Moderate',
    inherentRisk: 'Medium',
    treatmentPlan: 'Add compliance weights to bonuses; pre-prod compliance checklist; AC required.',
    residualRisk: 'Low',
    owner: 'CEO',
    earlyWarnings: ['Rising exceptions post-release'],
    kris: [
      { metric: 'Features with compliance AC', current: '≥95%', threshold: '95%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },

  // Board/Director Risks (BD001-BD005)
  {
    id: 'BD001',
    title: 'Director liability for wage underpayment (wage theft)',
    domain: 'Board/Director',
    category: 'Legal',
    description: 'Systemic/intentional underpayment; poor oversight; criminal/personal exposures.',
    linkedObligations: ['OBL-FW-004', 'OBL-FW-008', 'OBL-FW-009'],
    controlRefs: ['2.3', '6.2', '5.5'],
    existingControls: 'Board oversight; independent reviews; whistleblower channel.',
    rasci: {
      R: 'Compliance Owner',
      A: 'Board/Directors',
      S: 'Internal Audit',
      C: 'Legal/IR',
      I: 'CEO/Exec'
    },
    likelihood: 'Unlikely',
    impact: 'Severe',
    inherentRisk: 'High',
    treatmentPlan: 'Quarterly board certification; external assurance on high-risk awards; remediation fund policy.',
    residualRisk: 'Medium',
    owner: 'Board Audit & Risk Chair',
    earlyWarnings: ['Regulatory inquiries', 'Surge in backpay'],
    kris: [
      { metric: 'Sanctions/penalties', current: 0, threshold: 0, status: 'green', unit: 'count' },
      { metric: 'Awards independently assured', current: 75, threshold: 80, status: 'amber', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'BD002',
    title: 'Director oversight failure on privacy/TFN & NDB',
    domain: 'Board/Director',
    category: 'Legal',
    description: 'Material payroll data breach; mishandled notifications.',
    linkedObligations: ['OBL-PRIV-001', 'OBL-PRIV-002'],
    controlRefs: ['7.2', '7.4'],
    existingControls: 'Privacy program; DLP/MFA; IR plan/tabletops.',
    rasci: {
      R: 'IT/InfoSec',
      A: 'Board/Directors',
      S: 'Compliance Owner',
      C: 'Legal/IR',
      I: 'CEO/Exec'
    },
    likelihood: 'Possible',
    impact: 'Severe',
    inherentRisk: 'Very High',
    treatmentPlan: 'Annual tabletop; external pen-test cadence; DLP reporting to board.',
    residualRisk: 'High-Medium',
    owner: 'Board Audit & Risk Chair',
    earlyWarnings: ['Security exceptions', 'DLP spikes', 'Overdue IR actions'],
    kris: [
      { metric: 'MFA coverage', current: 100, threshold: 100, status: 'green', unit: '%' },
      { metric: 'IR exercises per year', current: '1x', threshold: '1x', status: 'green', unit: '/yr' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'BD003',
    title: 'Financial reporting misstatements from payroll',
    domain: 'Board/Director',
    category: 'Financial',
    description: 'Incorrect accruals (leave/LSL), SG/FBT liabilities, payroll tax errors.',
    linkedObligations: ['OBL-SUP-001', 'OBL-ATO-004', 'OBL-PTX-NSW', 'OBL-PTX-VIC'],
    controlRefs: ['6.3', '6.6', '6.7'],
    existingControls: 'Reconciliations; external accountant review; variance analytics.',
    rasci: {
      R: 'Finance Manager',
      A: 'Board/Directors',
      S: 'Payroll Officer',
      C: 'External Auditor',
      I: 'CEO/Exec'
    },
    likelihood: 'Unlikely',
    impact: 'Major',
    inherentRisk: 'Medium-High',
    treatmentPlan: 'Close calendar; blackline-style checklists; materiality thresholds; KRIs.',
    residualRisk: 'Medium',
    owner: 'CFO / Finance Manager',
    earlyWarnings: ['Large unexplained variances', 'Audit adjustments'],
    kris: [
      { metric: 'Close cycle time', current: '≤5', threshold: '5', status: 'green', unit: 'days' },
      { metric: 'Material adjustments', current: 0, threshold: 0, status: 'green', unit: 'count' }
    ],
    status: 'Open',
    nextReview: '2025-10-03'
  },
  {
    id: 'BD004',
    title: 'Weak assurance (management attestations only)',
    domain: 'Board/Director',
    category: 'Governance',
    description: 'No independent testing; stale internal audit plan; blind coverage.',
    linkedObligations: ['OBL-AUD-001'],
    controlRefs: ['9.1'],
    existingControls: 'Assurance map (controls→tests→cadence).',
    rasci: {
      R: 'Internal Audit',
      A: 'Board/Directors',
      S: 'Compliance Owner',
      C: 'External Auditor',
      I: 'CEO/Exec'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Approve annual audit plan; quarterly completion reporting; findings follow-up.',
    residualRisk: 'Medium',
    owner: 'Board Audit & Risk Chair',
    earlyWarnings: ['Repeat issues', 'Overdue actions'],
    kris: [
      { metric: 'Key controls tested per quarter', current: 78, threshold: 85, status: 'amber', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'BD005',
    title: 'Directors\' knowledge gap on AU payroll risk',
    domain: 'Board/Director',
    category: 'Governance',
    description: 'Board lacks specific knowledge on STP/SG/Awards/privacy.',
    linkedObligations: ['OBL-POL-001', 'OBL-AUD-003'],
    controlRefs: ['2.3', '10.1'],
    existingControls: 'Annual board briefing; SME teach-ins.',
    rasci: {
      R: 'Compliance Owner',
      A: 'Board Chair',
      S: 'Legal/IR',
      C: 'External SME',
      I: 'Directors'
    },
    likelihood: 'Possible',
    impact: 'Moderate',
    inherentRisk: 'Medium',
    treatmentPlan: 'Annual academy; quiz; wage-trace case walkthroughs.',
    residualRisk: 'Low',
    owner: 'Board Chair',
    earlyWarnings: ['Low engagement', 'Missed questions'],
    kris: [
      { metric: 'Director training', current: '≥1x/yr', threshold: '1x/yr', status: 'green', unit: '/yr' },
      { metric: 'Quiz score', current: '≥80%', threshold: '80%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },

  // Payroll Risks (PR001-PR010)
  {
    id: 'PR001',
    title: 'Incorrect salary/wage calculations',
    domain: 'Payroll',
    category: 'Operational',
    description: 'Award/EA misclassification; outdated pay guides; rule misconfig; manual overrides.',
    linkedObligations: ['OBL-FW-009', 'OBL-REM-001', 'OBL-FW-008'],
    controlRefs: ['5.5', '6.2'],
    existingControls: 'Classification map; pay-guide versioning; maker-checker.',
    rasci: {
      R: 'Payroll Officer',
      A: 'Compliance Owner',
      S: 'HR Officer',
      C: 'Legal/IR',
      I: 'Employees'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Automated rule tests; dual approval on rate changes; quarterly sample audits.',
    residualRisk: 'Medium',
    owner: 'Payroll Manager',
    earlyWarnings: ['Off-cycle adjustments spike', 'Complaints'],
    kris: [
      { metric: 'Pays adjusted', current: '≤0.2%', threshold: '0.2%', status: 'green', unit: '%' },
      { metric: 'Rate-change approvals', current: '100%', threshold: '100%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR002',
    title: 'Non-compliant payslips/records',
    domain: 'Payroll',
    category: 'Compliance',
    description: 'Missing fields; not issued ≤1 business day; incomplete records.',
    linkedObligations: ['OBL-FW-004', 'OBL-FW-005'],
    controlRefs: ['5.8', '7.2'],
    existingControls: 'Payslip template; timestamp logging; retention schedule.',
    rasci: {
      R: 'Payroll Officer',
      A: 'Compliance Owner',
      S: 'HR Officer',
      C: 'Legal/IR',
      I: 'Internal/External Audit'
    },
    likelihood: 'Possible',
    impact: 'Moderate',
    inherentRisk: 'Medium-High',
    treatmentPlan: 'Automated template tests; issuance audit; retention reviews.',
    residualRisk: 'Medium',
    owner: 'Payroll Officer',
    earlyWarnings: ['Late issuance logs', 'Audit findings'],
    kris: [
      { metric: 'Payslip SLA', current: '≥99.5%', threshold: '99.5%', status: 'green', unit: '%' },
      { metric: 'Critical findings', current: 0, threshold: 0, status: 'green', unit: 'count' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR003',
    title: 'STP Phase 2 lodgement failure/errors',
    domain: 'Payroll',
    category: 'Regulatory',
    description: 'Late/failed pay-events; wrong codes; missed finalisation.',
    linkedObligations: ['OBL-ATO-003'],
    controlRefs: ['6.1'],
    existingControls: 'STP receipts; error queue; finalisation calendar.',
    rasci: {
      R: 'Payroll Officer',
      A: 'Finance Manager',
      S: 'HR Officer',
      C: 'Compliance Owner',
      I: 'CEO/Board'
    },
    likelihood: 'Unlikely',
    impact: 'Major',
    inherentRisk: 'Medium-High',
    treatmentPlan: 'Alerts; dry-run validation; year-end rehearsal; vendor escalation.',
    residualRisk: 'Medium',
    owner: 'Payroll Officer',
    earlyWarnings: ['ATO error codes', 'Failed events backlog'],
    kris: [
      { metric: 'STP success rate', current: '≥99.9%', threshold: '99.9%', status: 'green', unit: '%' },
      { metric: 'Finalised by 14 Jul', current: '100%', threshold: '100%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR004',
    title: 'Late/incorrect Superannuation Guarantee (SG)',
    domain: 'Payroll',
    category: 'Regulatory',
    description: 'SG rate misconfig; OTE base errors; late payment → SGC.',
    linkedObligations: ['OBL-SUP-001', 'OBL-SUP-003'],
    controlRefs: ['6.3'],
    existingControls: 'Quarterly SG calendar; SuperStream confirmations; recon.',
    rasci: {
      R: 'Payroll Officer',
      A: 'Finance Manager',
      S: 'HR Officer',
      C: 'Compliance Owner',
      I: 'Employee'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Automated SG calc tests; pre-due dashboard; CFO sign-off.',
    residualRisk: 'Medium',
    owner: 'Finance Manager',
    earlyWarnings: ['Missing SuperStream confirms', 'SG variance'],
    kris: [
      { metric: 'On-time SG', current: '≥99.5%', threshold: '99.5%', status: 'green', unit: '%' },
      { metric: 'SG variance', current: '≤0.1%', threshold: '0.1%', status: 'green', unit: '% OTE' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR005',
    title: 'PAYG-W & BAS/IAS errors',
    domain: 'Finance',
    category: 'Regulatory',
    description: 'Wrong remitter type; incorrect withholding; late lodgement/payment.',
    linkedObligations: ['OBL-ATO-001'],
    controlRefs: ['6.5'],
    existingControls: 'Calendarised BAS/IAS; CFO review; recon to payroll reports.',
    rasci: {
      R: 'Finance Manager',
      A: 'CEO/Board',
      S: 'Payroll Officer',
      C: 'External Accountant',
      I: 'Compliance Owner'
    },
    likelihood: 'Unlikely',
    impact: 'Major',
    inherentRisk: 'Medium-High',
    treatmentPlan: 'Automate BAS prep; variance analysis; backup signatory.',
    residualRisk: 'Medium',
    owner: 'Finance Manager',
    earlyWarnings: ['ATO reminders', 'Variance spikes'],
    kris: [
      { metric: 'On-time BAS/IAS', current: '100%', threshold: '100%', status: 'green', unit: '%' },
      { metric: 'PAYG variance', current: '≤0.2%', threshold: '0.2%', status: 'green', unit: '%' }
    ],
    status: 'Open',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR006',
    title: 'Child Support notice non-compliance',
    domain: 'Payroll',
    category: 'Regulatory',
    description: 'Failure to act on notices; wrong deductions; late remittances.',
    linkedObligations: ['OBL-SA-001'],
    controlRefs: ['5.10'],
    existingControls: 'Register; per-pay validation; remittance scheduler.',
    rasci: {
      R: 'Payroll Officer',
      A: 'Finance Manager',
      S: 'HR Officer',
      C: 'Compliance Owner',
      I: 'Employee'
    },
    likelihood: 'Possible',
    impact: 'Moderate',
    inherentRisk: 'Medium',
    treatmentPlan: 'Rules configured; monthly self-audit; liaison list.',
    residualRisk: 'Low-Medium',
    owner: 'Payroll Officer',
    earlyWarnings: ['New notices', 'Remittance backlog'],
    kris: [
      { metric: 'Late remittances', current: 0, threshold: 0, status: 'green', unit: 'count' },
      { metric: 'Correct deductions', current: '100%', threshold: '100%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR007',
    title: 'Payroll data breach (PII/TFN)',
    domain: 'IT/InfoSec',
    category: 'Technology',
    description: 'Phishing; credential theft; misdirected payslips; insecure TFN storage; vendor breach.',
    linkedObligations: ['OBL-PRIV-001', 'OBL-PRIV-002'],
    controlRefs: ['7.2', '7.4'],
    existingControls: 'MFA; least-privilege; encryption; DLP; IR plan & drills.',
    rasci: {
      R: 'IT/InfoSec',
      A: 'Compliance Owner',
      S: 'Payroll Officer',
      C: 'Legal/IR',
      I: 'CEO/Board'
    },
    likelihood: 'Possible',
    impact: 'Severe',
    inherentRisk: 'Very High',
    treatmentPlan: 'Harden access; phishing sims; vendor due diligence; playbooks tested.',
    residualRisk: 'Medium-High',
    owner: 'IT Security Manager',
    earlyWarnings: ['DLP alerts', 'Anomalous logins', 'Vendor advisories'],
    kris: [
      { metric: 'P1 breaches', current: 0, threshold: 0, status: 'green', unit: 'count' },
      { metric: 'MFA coverage', current: '100%', threshold: '100%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR008',
    title: 'Fraud/collusion (SoD failure)',
    domain: 'Payroll',
    category: 'Financial',
    description: 'Single person can create/approve changes & payments; ghost employees; bank detail manipulation.',
    linkedObligations: ['OBL-AUD-001'],
    controlRefs: ['7.1', '9.1'],
    existingControls: 'SoD; maker-checker; dual approval on bank file; JML controls.',
    rasci: {
      R: 'Payroll Officer',
      A: 'Compliance Owner',
      S: 'Finance Manager',
      C: 'Internal Audit',
      I: 'CEO/Board'
    },
    likelihood: 'Unlikely',
    impact: 'Severe',
    inherentRisk: 'High',
    treatmentPlan: 'RBAC review; ghost-employee sampling; velocity checks on bank changes.',
    residualRisk: 'Medium',
    owner: 'Compliance Owner',
    earlyWarnings: ['Spike in bank changes', 'New high-priv users'],
    kris: [
      { metric: 'Dual-approval adherence', current: '100%', threshold: '100%', status: 'green', unit: '%' },
      { metric: 'Ghost-employee audits', current: 'Quarterly', threshold: 'Quarterly', status: 'green', unit: '/qtr' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR009',
    title: 'Payroll provider/system outage',
    domain: 'Executive',
    category: 'Operational',
    description: 'SaaS outage; integration failure; export/import breaks; no DR.',
    linkedObligations: ['OBL-AUD-001'],
    controlRefs: ['9.1'],
    existingControls: 'Runbook for offline pay; exportable master data; provider SLA.',
    rasci: {
      R: 'System Admin',
      A: 'Compliance Owner',
      S: 'Payroll Officer',
      C: 'Vendor',
      I: 'CEO/Board'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'Medium-High',
    treatmentPlan: 'BCP tests; alternate payment method; contact trees.',
    residualRisk: 'Medium',
    owner: 'System Admin',
    earlyWarnings: ['Provider status red', 'Failed health checks'],
    kris: [
      { metric: 'Payroll completion in DR', current: '≤T+1', threshold: 'T+1', status: 'green', unit: 'days' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'PR010',
    title: 'Legislative change not implemented',
    domain: 'Executive',
    category: 'Strategic',
    description: 'FWO/ATO/state changes missed → systemic non-compliance.',
    linkedObligations: ['OBL-AUD-003'],
    controlRefs: ['10.1'],
    existingControls: 'Regulatory watch; change control; regression testing.',
    rasci: {
      R: 'Compliance Owner',
      A: 'CEO/Board',
      S: 'HR Officer',
      C: 'Legal/IR',
      I: 'Payroll Officer'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Monthly change forum; release notes; PIR.',
    residualRisk: 'Medium',
    owner: 'Compliance Owner',
    earlyWarnings: ['Unapplied updates aging', 'Audit findings'],
    kris: [
      { metric: 'Missed effective dates', current: 0, threshold: 0, status: 'green', unit: 'count' },
      { metric: 'Update backlog', current: '≤30d', threshold: '30d', status: 'green', unit: 'days' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },

  // HR Risks (HR001-HR002)
  {
    id: 'HR001',
    title: 'Right-to-work violations (VEVO)',
    domain: 'HR',
    category: 'Legal',
    description: 'Employing without valid work rights; visa condition breaches; missing periodic checks.',
    linkedObligations: ['OBL-VEVO-001'],
    controlRefs: ['5.2'],
    existingControls: 'VEVO checks on hire & periodic; expiry alerts; records.',
    rasci: {
      R: 'HR Officer',
      A: 'Compliance Owner',
      S: 'Payroll Officer',
      C: 'Legal/IR',
      I: 'Line Manager'
    },
    likelihood: 'Unlikely',
    impact: 'Major',
    inherentRisk: 'Medium',
    treatmentPlan: 'Automated reminders; monthly visa-holder audit; escalation.',
    residualRisk: 'Low-Medium',
    owner: 'HR Manager',
    earlyWarnings: ['Upcoming expiries', 'Failed checks'],
    kris: [
      { metric: 'VEVO on file', current: '100%', threshold: '100%', status: 'green', unit: '%' },
      { metric: 'Expiries passed', current: 0, threshold: 0, status: 'green', unit: 'count' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },
  {
    id: 'HR002',
    title: 'Whistleblower & grievance mishandling',
    domain: 'HR',
    category: 'Governance',
    description: 'Pay concerns handled poorly; retaliation; lack of anonymous channel; no trend analysis.',
    linkedObligations: ['OBL-POL-001'],
    controlRefs: ['2.3'],
    existingControls: 'Whistleblower channel; triage SLAs; trend dashboards; training.',
    rasci: {
      R: 'HR Officer',
      A: 'Board/Directors',
      S: 'Compliance Owner',
      C: 'Legal/IR',
      I: 'CEO/Exec'
    },
    likelihood: 'Possible',
    impact: 'Moderate',
    inherentRisk: 'Medium',
    treatmentPlan: 'Independent review route; board reporting cadence.',
    residualRisk: 'Low-Medium',
    owner: 'HR Manager',
    earlyWarnings: ['Low channel usage', 'Exit spikes'],
    kris: [
      { metric: 'Grievance SLA', current: '≥95%', threshold: '95%', status: 'green', unit: '%' },
      { metric: 'Retaliation findings', current: 0, threshold: 0, status: 'green', unit: 'count' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },

  // Finance Risks (FN001)
  {
    id: 'FN001',
    title: 'Cashflow constraints delaying statutory payments',
    domain: 'Finance',
    category: 'Financial',
    description: 'Liquidity issues cause late SG/BAS/Payroll tax or wages.',
    linkedObligations: ['OBL-SUP-001', 'OBL-ATO-001', 'OBL-PTX-NSW', 'OBL-PTX-VIC'],
    controlRefs: ['6.3', '6.5', '6.7'],
    existingControls: '12-week cashflow forecast; statutory calendar; fallback financing.',
    rasci: {
      R: 'Finance Manager',
      A: 'CEO/Board',
      S: 'Payroll Officer',
      C: 'External Accountant',
      I: 'Compliance Owner'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Treasury alerts; early approvals; alternate funding line.',
    residualRisk: 'Medium',
    owner: 'Finance Manager',
    earlyWarnings: ['Aged payables rising', 'Forecast breaches'],
    kris: [
      { metric: 'On-time statutory payments', current: '100%', threshold: '100%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  },

  // IT/Technology Risks (IT001)
  {
    id: 'IT001',
    title: 'Bank detail change fraud (BEC/vendor)',
    domain: 'Technology',
    category: 'Cyber',
    description: 'Email compromise → fraudulent bank change/fake vendor.',
    linkedObligations: ['OBL-PRIV-001'],
    controlRefs: ['7.2'],
    existingControls: 'Out-of-band verification; change velocity rules; SIEM alerts.',
    rasci: {
      R: 'Payroll Officer',
      A: 'Compliance Owner',
      S: 'IT/InfoSec',
      C: 'Finance Manager',
      I: 'Employees'
    },
    likelihood: 'Possible',
    impact: 'Major',
    inherentRisk: 'High',
    treatmentPlan: 'Call-back control; cooling-off for first payment; SIEM rules.',
    residualRisk: 'Medium',
    owner: 'IT Security Manager',
    earlyWarnings: ['Spike in bank changes', 'SIEM alerts', 'Supplier anomalies'],
    kris: [
      { metric: 'Fraud losses', current: 0, threshold: 0, status: 'green', unit: '$' },
      { metric: 'Call-back adherence', current: '100%', threshold: '100%', status: 'green', unit: '%' }
    ],
    status: 'In Progress',
    nextReview: '2025-10-03'
  }
];

export const useRiskStore = create<RiskState>((set, get) => ({
  risks: initialRisks,
  
  addRisk: (risk) => set((state) => ({
    risks: [...state.risks, risk]
  })),
  
  updateRisk: (id, updates) => set((state) => ({
    risks: state.risks.map(risk => 
      risk.id === id ? { ...risk, ...updates } : risk
    )
  })),
  
  deleteRisk: (id) => set((state) => ({
    risks: state.risks.filter(risk => risk.id !== id)
  })),
  
  linkObligation: (riskId, obligationId) => set((state) => ({
    risks: state.risks.map(risk => 
      risk.id === riskId 
        ? { ...risk, linkedObligations: [...new Set([...risk.linkedObligations, obligationId])] }
        : risk
    )
  })),
  
  unlinkObligation: (riskId, obligationId) => set((state) => ({
    risks: state.risks.map(risk => 
      risk.id === riskId 
        ? { ...risk, linkedObligations: risk.linkedObligations.filter(id => id !== obligationId) }
        : risk
    )
  })),
  
  adoptRasciFromObligations: (riskId) => {
    const risk = get().risks.find(r => r.id === riskId);
    if (!risk) return;
    
    // This would integrate with the obligations store to pull RASCI
    // For now, it's a placeholder for the integration
    console.log(`Adopting RASCI for risk ${riskId} from obligations:`, risk.linkedObligations);
  },
  
  updateKRI: (riskId, kriIndex, kri) => set((state) => ({
    risks: state.risks.map(risk => {
      if (risk.id !== riskId) return risk;
      
      const newKris = [...risk.kris];
      newKris[kriIndex] = kri;
      return { ...risk, kris: newKris };
    })
  }))
}));
