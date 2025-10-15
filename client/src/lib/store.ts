import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { get, set } from 'idb-keyval';
import type { 
  User, Control, Policy, Evidence, AuditSession, AuditFinding, 
  Certification, AccessLog, Framework, DashboardData, Notification,
  CompanyProfile 
} from '@shared/schema';

// Subscription & Billing State
interface SubscriptionState {
  plan: 'annual' | 'monthly';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}

// App State
interface AppState {
  // Auth & Session
  currentUser: User | null;
  activeFramework: string | null;
  
  // Billing & Subscriptions
  subscription: SubscriptionState | null;
  purchasedFrameworks: string[]; // framework IDs that user has purchased
  
  // Data
  users: User[];
  controls: Control[];
  policies: Policy[];
  evidence: Evidence[];
  auditSessions: AuditSession[];
  auditFindings: AuditFinding[];
  certifications: Certification[];
  accessLogs: AccessLog[];
  frameworks: Framework[];
  dashboardData: DashboardData | null;
  notifications: Notification[];
  companyProfile: CompanyProfile | null;
  
  // UI State
  sidebarOpen: boolean;
  darkMode: boolean;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setActiveFramework: (framework: string) => void;
  ensureValidActiveFramework: () => void;
  purchaseFramework: (frameworkId: string) => void;
  purchaseBundle: () => void;
  updateSubscription: (plan: 'annual' | 'monthly') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  addAccessLog: (log: Omit<AccessLog, 'id' | 'timestamp'>) => void;
  updateControl: (id: string, updates: Partial<Control>) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  addEvidence: (evidence: Omit<Evidence, 'id' | 'uploadedAt'>) => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  resetData: () => void;
}

// IDB Storage adapter
const storage = {
  getItem: async (name: string) => {
    return await get(name);
  },
  setItem: async (name: string, value: any) => {
    await set(name, value);
  },
  removeItem: async (name: string) => {
    await set(name, undefined);
  },
};

// Generate mock data
const generateMockData = () => {
  const users: User[] = [
    { id: '1', name: 'Harper Lane', email: 'harper@corecomply.com', role: 'system_admin', createdAt: new Date() },
    { id: '2', name: 'Ava Morgan', email: 'ava@corecomply.com', role: 'compliance_owner', createdAt: new Date() },
    { id: '3', name: 'Leo Carter', email: 'leo@corecomply.com', role: 'payroll_officer', createdAt: new Date() },
    { id: '4', name: 'Mia Nguyen', email: 'mia@corecomply.com', role: 'hr_officer', createdAt: new Date() },
    { id: '5', name: 'Ella Thompson', email: 'ella@corecomply.com', role: 'finance_manager', createdAt: new Date() },
    { id: '6', name: 'Oliver Brooks', email: 'oliver@corecomply.com', role: 'executive', createdAt: new Date() },
    { id: '7', name: 'Noah Patel', email: 'noah@corecomply.com', role: 'internal_auditor', createdAt: new Date() },
    { id: '8', name: 'Isla Bennett', email: 'isla@corecomply.com', role: 'external_auditor', createdAt: new Date() },
    { id: '9', name: 'Jordan Smith', email: 'jordan@corecomply.com', role: 'reviewer', createdAt: new Date() },
    { id: '10', name: 'Sophia Chen', email: 'sophia@corecomply.com', role: 'compliance_owner', createdAt: new Date() },
    { id: '11', name: 'Liam Rodriguez', email: 'liam@corecomply.com', role: 'system_admin', createdAt: new Date() },
    { id: '12', name: 'Emma Wilson', email: 'emma@corecomply.com', role: 'internal_auditor', createdAt: new Date() },
    { id: '13', name: 'Mason Taylor', email: 'mason@corecomply.com', role: 'compliance_owner', createdAt: new Date() },
    { id: '14', name: 'Charlotte Davis', email: 'charlotte@corecomply.com', role: 'hr_officer', createdAt: new Date() },
    { id: '15', name: 'Ethan Martinez', email: 'ethan@corecomply.com', role: 'executive', createdAt: new Date() },
    { id: '16', name: 'Amelia Brown', email: 'amelia@corecomply.com', role: 'compliance_owner', createdAt: new Date() },
    { id: '17', name: 'Lucas Anderson', email: 'lucas@corecomply.com', role: 'internal_auditor', createdAt: new Date() },
  ];

  const frameworks: Framework[] = [
    { id: 'apgf-ms', name: 'APGF-MS', description: 'Australian Payroll Governance Framework - Management System', version: '2024.1' },
    { id: 'iso-9001', name: 'ISO 9001', description: 'Quality Management Systems', version: '2015' },
    { id: 'iso-27001', name: 'ISO 27001', description: 'Information Security Management System', version: '2022' },
  ];

  const controls: Control[] = [
    // APGF-MS Payroll Processing Controls
    { id: 'APGF-PAY-001', title: 'Payroll Calculation Accuracy', description: 'Verify payroll calculations comply with awards, agreements, and legislation', category: 'Payroll Processing', owner: 'Leo Carter', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Award rates verified', 'Calculation rules documented', 'Monthly testing completed'] },
    { id: 'APGF-PAY-002', title: 'Pay Run Authorization Controls', description: 'Ensure proper authorization and approval of pay runs before processing', category: 'Payroll Processing', owner: 'Leo Carter', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Approval matrix defined', 'Dual authorization implemented', 'Audit trail maintained'] },
    { id: 'APGF-PAY-003', title: 'Payment Reconciliation', description: 'Reconcile payroll payments with bank statements and general ledger', category: 'Payroll Processing', owner: 'Ella Thompson', status: 'In Progress', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['Reconciliation procedures documented', 'Monthly reconciliation in progress', 'Variance investigation pending'] },
    { id: 'APGF-PAY-004', title: 'Payslip Generation and Distribution', description: 'Ensure timely and accurate payslip delivery to all employees', category: 'Payroll Processing', owner: 'Leo Carter', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Payslip template approved', 'Secure distribution channel', 'Employee access confirmed'] },
    { id: 'APGF-PAY-005', title: 'Overtime and Penalty Rate Calculation', description: 'Accurately calculate overtime and penalty rates per modern awards', category: 'Payroll Processing', owner: 'Leo Carter', status: 'Evidence Pending', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Award interpretation documented', 'Calculation rules configured', 'Testing evidence required'] },
    
    // APGF-MS Tax Compliance Controls
    { id: 'APGF-TAX-001', title: 'PAYG Withholding Accuracy', description: 'Ensure correct calculation and withholding of PAYG tax', category: 'Tax Compliance', owner: 'Ella Thompson', status: 'Compliant', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['ATO tax tables implemented', 'Tax calculations verified', 'Monthly PAYG reconciliation'] },
    { id: 'APGF-TAX-002', title: 'Single Touch Payroll (STP) Reporting', description: 'Submit accurate and timely STP reports to ATO', category: 'Tax Compliance', owner: 'Leo Carter', status: 'Compliant', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['STP Phase 2 compliant', 'Real-time reporting operational', 'Error handling procedures'] },
    { id: 'APGF-TAX-003', title: 'Tax File Number (TFN) Collection', description: 'Collect and securely store employee TFNs per privacy requirements', category: 'Tax Compliance', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-DATA-001', updatedAt: new Date(), checklist: ['TFN declaration forms managed', 'Secure storage implemented', 'Privacy compliance verified'] },
    { id: 'APGF-TAX-004', title: 'Fringe Benefits Tax (FBT) Calculation', description: 'Calculate and report FBT obligations accurately', category: 'Tax Compliance', owner: 'Ella Thompson', status: 'In Progress', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['FBT assessment completed', 'Calculation methodology documented', 'Annual return preparation'] },
    { id: 'APGF-TAX-005', title: 'Payment Summary Annual Report (PSAR)', description: 'Generate and lodge annual payment summaries', category: 'Tax Compliance', owner: 'Ella Thompson', status: 'Audit Ready', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['PSAR reconciled', 'Evidence uploaded', 'Ready for lodgment'] },
    
    // APGF-MS Superannuation Controls
    { id: 'APGF-SUP-001', title: 'Superannuation Guarantee Calculation', description: 'Calculate and pay superannuation guarantee obligations', category: 'Superannuation', owner: 'Leo Carter', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['SG rate applied correctly', 'OTE calculation verified', 'Quarterly payments made'] },
    { id: 'APGF-SUP-002', title: 'Superannuation Choice of Fund', description: 'Provide employees choice of superannuation fund', category: 'Superannuation', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Choice forms provided', 'Fund details captured', 'Default fund registered'] },
    { id: 'APGF-SUP-003', title: 'Superannuation Clearing House Processing', description: 'Process superannuation payments through clearing house', category: 'Superannuation', owner: 'Leo Carter', status: 'In Progress', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['Clearing house connected', 'Payment files generated', 'Processing verification pending'] },
    { id: 'APGF-SUP-004', title: 'Superannuation Guarantee Charge (SGC)', description: 'Monitor and prevent SGC liability through timely payments', category: 'Superannuation', owner: 'Ella Thompson', status: 'Compliant', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['Payment deadlines tracked', 'Late payment monitoring', 'SGC risk minimized'] },
    
    // APGF-MS Leave Management Controls
    { id: 'APGF-LEA-001', title: 'Annual Leave Accrual and Payment', description: 'Accurately calculate and manage annual leave entitlements', category: 'Leave Management', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Accrual rates configured', 'Leave balances verified', 'Leave loading applied'] },
    { id: 'APGF-LEA-002', title: 'Personal/Sick Leave Entitlements', description: 'Manage personal and sick leave per NES and awards', category: 'Leave Management', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['NES entitlements implemented', 'Leave balances tracked', 'Evidence requirements documented'] },
    { id: 'APGF-LEA-003', title: 'Long Service Leave Compliance', description: 'Calculate and manage LSL per state-based legislation', category: 'Leave Management', owner: 'Mia Nguyen', status: 'Evidence Pending', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['State LSL rules configured', 'Accrual calculations verified', 'Testing evidence required'] },
    { id: 'APGF-LEA-004', title: 'Parental Leave Compliance', description: 'Manage parental leave entitlements per Fair Work Act', category: 'Leave Management', owner: 'Mia Nguyen', status: 'In Progress', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Parental leave policy published', 'PPL scheme integrated', 'Implementation ongoing'] },
    
    // APGF-MS Time & Attendance Controls
    { id: 'APGF-TIM-001', title: 'Timesheet Approval Process', description: 'Ensure all timesheets are approved before payroll processing', category: 'Time & Attendance', owner: 'Leo Carter', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Approval workflow implemented', 'Manager approval required', 'Exception handling documented'] },
    { id: 'APGF-TIM-002', title: 'Roster Management and Compliance', description: 'Manage rosters in compliance with awards and agreements', category: 'Time & Attendance', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Roster rules configured', 'Break requirements enforced', 'Shift penalties calculated'] },
    { id: 'APGF-TIM-003', title: 'Time Clock Data Integration', description: 'Integrate time and attendance systems with payroll', category: 'Time & Attendance', owner: 'Leo Carter', status: 'In Progress', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Integration configured', 'Data validation rules', 'Testing in progress'] },
    
    // APGF-MS Employee Data Controls
    { id: 'APGF-EMP-001', title: 'Employee Master Data Accuracy', description: 'Maintain accurate and complete employee records', category: 'Employee Data', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-DATA-001', updatedAt: new Date(), checklist: ['Data quality rules defined', 'Regular data audits', 'Update procedures documented'] },
    { id: 'APGF-EMP-002', title: 'Right to Work Verification', description: 'Verify and document employee right to work in Australia', category: 'Employee Data', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['VEVO checks implemented', 'Documentation retained', 'Expiry monitoring'] },
    { id: 'APGF-EMP-003', title: 'Fair Work Information Statement', description: 'Provide FWIS to all new employees', category: 'Employee Data', owner: 'Mia Nguyen', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Current FWIS version', 'Delivery confirmation', 'Record retention'] },
    { id: 'APGF-EMP-004', title: 'Employee Privacy and Data Protection', description: 'Protect employee personal information per Privacy Act', category: 'Employee Data', owner: 'Ava Morgan', status: 'Evidence Pending', policyId: 'POL-DATA-001', updatedAt: new Date(), checklist: ['Privacy policy published', 'Access controls implemented', 'Breach response plan testing required'] },
    
    // APGF-MS Access Control & Security
    { id: 'APGF-SEC-001', title: 'Payroll System Access Control', description: 'Implement role-based access control for payroll systems', category: 'Access Control', owner: 'Ava Morgan', status: 'Compliant', policyId: 'POL-ACCESS-001', updatedAt: new Date(), checklist: ['RBAC matrix defined', 'User access reviews', 'Segregation of duties'] },
    { id: 'APGF-SEC-002', title: 'Multi-Factor Authentication (MFA)', description: 'Enforce MFA for payroll system access', category: 'Access Control', owner: 'Ava Morgan', status: 'Compliant', policyId: 'POL-ACCESS-001', updatedAt: new Date(), checklist: ['MFA enabled for all users', 'Enrollment process documented', 'Exception handling'] },
    { id: 'APGF-SEC-003', title: 'User Access Provisioning and Deprovisioning', description: 'Manage timely provisioning and removal of user access', category: 'Access Control', owner: 'Ava Morgan', status: 'Evidence Pending', policyId: 'POL-ACCESS-001', updatedAt: new Date(), checklist: ['Provisioning workflow defined', 'Deprovisioning triggers', 'Evidence required'] },
    { id: 'APGF-SEC-004', title: 'Audit Trail and Logging', description: 'Maintain comprehensive audit trails of payroll transactions', category: 'Access Control', owner: 'Ava Morgan', status: 'Compliant', policyId: 'POL-ACCESS-001', updatedAt: new Date(), checklist: ['Logging enabled', 'Log retention policy', 'Regular log reviews'] },
    
    // APGF-MS Governance Controls
    { id: 'APGF-GOV-001', title: 'Payroll Governance Framework', description: 'Establish comprehensive payroll governance framework', category: 'Governance', owner: 'Ava Morgan', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Framework documented', 'Approved by board', 'Communicated to staff'] },
    { id: 'APGF-GOV-002', title: 'Segregation of Duties', description: 'Implement segregation of duties in payroll processes', category: 'Governance', owner: 'Ava Morgan', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['SoD matrix defined', 'Conflicts identified', 'Compensating controls'] },
    { id: 'APGF-GOV-003', title: 'Change Management Process', description: 'Manage changes to payroll systems and processes', category: 'Governance', owner: 'Ava Morgan', status: 'In Progress', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Change process documented', 'Testing requirements', 'Approval workflow'] },
    { id: 'APGF-GOV-004', title: 'Business Continuity and Disaster Recovery', description: 'Maintain payroll business continuity capabilities', category: 'Governance', owner: 'Ava Morgan', status: 'Evidence Pending', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['BCP documented', 'Recovery time objectives', 'Testing evidence required'] },
    
    // APGF-MS State Obligations
    { id: 'APGF-STA-001', title: 'Payroll Tax Compliance (Multi-State)', description: 'Calculate and pay payroll tax per state requirements', category: 'State Obligations', owner: 'Ella Thompson', status: 'Compliant', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['State tax rates configured', 'Monthly returns lodged', 'Reconciliations completed'] },
    { id: 'APGF-STA-002', title: 'Workers Compensation Insurance', description: 'Maintain workers compensation coverage per state laws', category: 'State Obligations', owner: 'Ella Thompson', status: 'Compliant', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['Policies current', 'Premium calculations', 'Annual reconciliation'] },
    { id: 'APGF-STA-003', title: 'Long Service Leave (Portable Schemes)', description: 'Contribute to portable LSL schemes where applicable', category: 'State Obligations', owner: 'Ella Thompson', status: 'In Progress', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['Applicable schemes identified', 'Contribution calculations', 'Implementation ongoing'] },
    
    // ISO 9001 Quality Management Controls
    { id: 'ISO-QMS-001', title: 'Quality Management System Documentation', description: 'Maintain comprehensive QMS documentation', category: 'Quality Management', owner: 'Oliver Brooks', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['QMS manual current', 'Procedures documented', 'Document control process'] },
    { id: 'ISO-QMS-002', title: 'Internal Audit Program', description: 'Conduct regular internal audits of QMS', category: 'Quality Management', owner: 'Noah Patel', status: 'In Progress', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Audit schedule defined', 'Auditor training', 'Q1 audits in progress'] },
    { id: 'ISO-QMS-003', title: 'Management Review Process', description: 'Conduct periodic management reviews of QMS effectiveness', category: 'Quality Management', owner: 'Oliver Brooks', status: 'Audit Ready', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Review schedule established', 'KPIs defined', 'Ready for review'] },
    { id: 'ISO-QMS-004', title: 'Corrective and Preventive Actions (CAPA)', description: 'Manage non-conformances through CAPA process', category: 'Quality Management', owner: 'Noah Patel', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['CAPA process defined', 'Root cause analysis', 'Effectiveness verification'] },
    { id: 'ISO-QMS-005', title: 'Customer Satisfaction Measurement', description: 'Monitor and measure customer satisfaction', category: 'Quality Management', owner: 'Oliver Brooks', status: 'In Progress', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Measurement methods defined', 'Survey framework', 'Analysis in progress'] },
    { id: 'ISO-QMS-006', title: 'Supplier Quality Management', description: 'Evaluate and monitor supplier performance', category: 'Quality Management', owner: 'Ella Thompson', status: 'Evidence Pending', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['Supplier criteria defined', 'Evaluation process', 'Evidence required'] },
    { id: 'ISO-QMS-007', title: 'Continuous Improvement Process', description: 'Drive continuous improvement across the organization', category: 'Quality Management', owner: 'Oliver Brooks', status: 'Compliant', policyId: 'POL-GOV-001', updatedAt: new Date(), checklist: ['Improvement initiatives tracked', 'Benefits measured', 'Regular reviews'] },
    
    // Additional Compliance Controls
    { id: 'COMP-FIN-001', title: 'Financial Controls Assessment', description: 'Quarterly financial controls review', category: 'Financial', owner: 'Ella Thompson', status: 'Audit Ready', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['Assessment completed', 'Evidence uploaded', 'Ready for audit'] },
    { id: 'COMP-FIN-002', title: 'Chart of Accounts Management', description: 'Maintain and manage chart of accounts structure', category: 'Financial', owner: 'Ella Thompson', status: 'Compliant', policyId: 'POL-FIN-001', updatedAt: new Date(), checklist: ['CoA documented', 'Mapping verified', 'Regular reviews'] },
    { id: 'COMP-DAT-001', title: 'Data Classification Scheme', description: 'Implement data classification methodology', category: 'Data Management', owner: 'Leo Carter', status: 'In Progress', policyId: 'POL-DATA-001', updatedAt: new Date(), checklist: ['Classification scheme defined', 'Training completed', 'Implementation ongoing'] },
    { id: 'COMP-DAT-002', title: 'Data Backup and Recovery', description: 'Ensure regular data backups and recovery capabilities', category: 'Data Management', owner: 'Ava Morgan', status: 'Compliant', policyId: 'POL-DATA-001', updatedAt: new Date(), checklist: ['Backup schedule defined', 'Recovery testing', 'Offsite storage'] },
    { id: 'COMP-DAT-003', title: 'Data Retention and Disposal', description: 'Manage data retention per legal and regulatory requirements', category: 'Data Management', owner: 'Ava Morgan', status: 'Evidence Pending', policyId: 'POL-DATA-001', updatedAt: new Date(), checklist: ['Retention schedule defined', 'Disposal procedures', 'Evidence required'] },
  ];

  const policies: Policy[] = [
    // APGF-MS Core Payroll Policies
    { id: 'POL-PAY-001', title: 'Payroll Processing and Administration Policy', description: 'Comprehensive payroll processing procedures, calculation methodologies, and approval workflows', owner: 'Leo Carter', status: 'Published', version: '3.2', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-PAY-001-V3.1', tags: ['payroll', 'processing', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-11-15') },
    { id: 'POL-TAX-001', title: 'Tax Compliance and Reporting Policy', description: 'PAYG withholding, STP reporting, TFN management, and ATO compliance requirements', owner: 'Ella Thompson', status: 'Published', version: '2.5', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-TAX-001-V2.4', tags: ['tax', 'ato', 'compliance', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-01') },
    { id: 'POL-SUP-001', title: 'Superannuation Management Policy', description: 'Superannuation guarantee obligations, choice of fund, clearing house processing, and SGC management', owner: 'Leo Carter', status: 'Published', version: '2.1', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-SUP-001-V2.0', tags: ['superannuation', 'sg', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-11-20') },
    { id: 'POL-LEA-001', title: 'Leave and Entitlements Policy', description: 'Annual leave, personal/sick leave, long service leave, and parental leave management per NES and awards', owner: 'Mia Nguyen', status: 'Published', version: '3.0', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-LEA-001-V2.9', tags: ['leave', 'entitlements', 'nes', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-10') },
    { id: 'POL-TIM-001', title: 'Time and Attendance Policy', description: 'Timesheet approval, roster management, overtime calculation, and time clock integration', owner: 'Leo Carter', status: 'Published', version: '1.8', effectiveFrom: new Date('2024-01-15'), supersedesId: 'POL-TIM-001-V1.7', tags: ['time', 'attendance', 'timesheets', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-20') },
    { id: 'POL-EMP-001', title: 'Employee Records and Privacy Policy', description: 'Employee data management, right to work verification, FWIS provision, and privacy protection per Privacy Act', owner: 'Mia Nguyen', status: 'Published', version: '2.3', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-EMP-001-V2.2', tags: ['employee', 'privacy', 'vevo', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-11-25') },
    { id: 'POL-FWA-001', title: 'Fair Work Act Compliance Policy', description: 'Fair Work Act compliance including minimum wages, working hours, casual conversion, and workplace rights', owner: 'Mia Nguyen', status: 'Published', version: '1.5', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['fairwork', 'fwa', 'compliance', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-05') },
    { id: 'POL-AWD-001', title: 'Award and Agreement Compliance Policy', description: 'Modern award interpretation, enterprise agreement compliance, penalty rates, and allowances', owner: 'Leo Carter', status: 'Published', version: '2.0', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-AWD-001-V1.9', tags: ['awards', 'agreements', 'penalties', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-11-30') },
    { id: 'POL-STA-001', title: 'State Obligations Policy', description: 'Multi-state payroll tax, workers compensation, long service leave schemes, and portable LSL compliance', owner: 'Ella Thompson', status: 'Published', version: '1.6', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-STA-001-V1.5', tags: ['state', 'payroll-tax', 'workers-comp', 'lsl', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-15') },
    
    // Governance and Security Policies
    { id: 'POL-GOV-001', title: 'Payroll Governance and Risk Management Policy', description: 'Comprehensive payroll governance framework, risk management, segregation of duties, and change management', owner: 'Ava Morgan', status: 'Published', version: '2.1', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-GOV-001-V2.0', tags: ['governance', 'risk', 'sod', 'apgf-ms'], frameworkId: 'apgf-ms', createdAt: new Date('2023-11-10') },
    { id: 'POL-ACCESS-001', title: 'Access Control and Security Policy', description: 'Role-based access control, MFA requirements, user provisioning, and audit trail management', owner: 'Ava Morgan', status: 'Published', version: '1.5', effectiveFrom: new Date('2024-02-01'), supersedesId: null, tags: ['access', 'security', 'rbac', 'mfa'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-01') },
    { id: 'POL-DATA-001', title: 'Data Management and Protection Policy', description: 'Data classification, backup and recovery, retention schedules, and secure disposal procedures', owner: 'Ava Morgan', status: 'Published', version: '1.8', effectiveFrom: new Date('2024-01-01'), supersedesId: 'POL-DATA-001-V1.7', tags: ['data', 'classification', 'backup', 'retention'], frameworkId: 'apgf-ms', createdAt: new Date('2023-11-18') },
    { id: 'POL-BCP-001', title: 'Business Continuity and Disaster Recovery Policy', description: 'Payroll business continuity planning, disaster recovery procedures, and testing requirements', owner: 'Ava Morgan', status: 'Published', version: '1.2', effectiveFrom: new Date('2024-01-15'), supersedesId: null, tags: ['bcp', 'dr', 'continuity', 'recovery'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-08') },
    
    // Financial Policies
    { id: 'POL-FIN-001', title: 'Financial Controls and Reconciliation Policy', description: 'Financial controls, bank reconciliation, general ledger mapping, and audit requirements', owner: 'Ella Thompson', status: 'Published', version: '3.0', effectiveFrom: new Date('2024-03-01'), supersedesId: null, tags: ['financial', 'controls', 'reconciliation'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-12') },
    
    // ISO 9001 Quality Management Policies
    { id: 'POL-QMS-001', title: 'Quality Management System Policy', description: 'ISO 9001 quality management framework, internal audits, management reviews, and continuous improvement', owner: 'Oliver Brooks', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['quality', 'iso-9001', 'qms', 'audits'], frameworkId: 'iso-9001', createdAt: new Date('2023-11-22') },
    { id: 'POL-QMS-002', title: 'Document Control Policy', description: 'Document and data control procedures per ISO 9001 clause 7.5', owner: 'Sofia Chen', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['quality', 'iso-9001', 'documents'], frameworkId: 'iso-9001', createdAt: new Date('2023-11-25') },
    { id: 'POL-QMS-003', title: 'Nonconformity and Corrective Action Policy', description: 'NC/CAPA process and continuous improvement per ISO 9001 clause 10', owner: 'Noah Patel', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['quality', 'iso-9001', 'capa'], frameworkId: 'iso-9001', createdAt: new Date('2023-12-01') },
    { id: 'POL-QMS-004', title: 'Supplier Quality Management Policy', description: 'Supplier evaluation, monitoring, and performance management', owner: 'Ella Thompson', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['quality', 'iso-9001', 'suppliers'], frameworkId: 'iso-9001', createdAt: new Date('2023-12-05') },
    
    // ISO 27001 Information Security Policies
    { id: 'POL-ISMS-001', title: 'Information Security Management System Policy', description: 'ISO 27001 ISMS framework, scope, and management commitment', owner: 'Raj Kapoor', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['security', 'iso-27001', 'isms'], frameworkId: 'iso-27001', createdAt: new Date('2023-11-20') },
    { id: 'POL-ISMS-002', title: 'Risk Assessment and Treatment Policy', description: 'Information security risk assessment methodology and treatment plan', owner: 'Raj Kapoor', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['security', 'iso-27001', 'risk'], frameworkId: 'iso-27001', createdAt: new Date('2023-11-22') },
    { id: 'POL-ISMS-003', title: 'Access Control Policy', description: 'User access management, authentication, and authorization controls', owner: 'Priya Sharma', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['security', 'iso-27001', 'access'], frameworkId: 'iso-27001', createdAt: new Date('2023-11-25') },
    { id: 'POL-ISMS-004', title: 'Incident Response Policy', description: 'Information security incident management and response procedures', owner: 'Raj Kapoor', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['security', 'iso-27001', 'incidents'], frameworkId: 'iso-27001', createdAt: new Date('2023-12-01') },
    { id: 'POL-ISMS-005', title: 'Business Continuity and Disaster Recovery Policy', description: 'BC/DR planning for information security per ISO 27001', owner: 'Raj Kapoor', status: 'Published', version: '1.0', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['security', 'iso-27001', 'bcdr'], frameworkId: 'iso-27001', createdAt: new Date('2023-12-05') },
    
    // General Audit and Compliance Policies
    { id: 'POL-AUD-001', title: 'Internal Audit and Compliance Review Policy', description: 'Internal audit program, compliance reviews, CAPA process, and audit evidence management', owner: 'Noah Patel', status: 'Published', version: '1.3', effectiveFrom: new Date('2024-01-01'), supersedesId: null, tags: ['audit', 'compliance', 'capa', 'review'], frameworkId: 'apgf-ms', createdAt: new Date('2023-12-03') },
    
    // Draft and In-Review Policies
    { id: 'POL-WHS-001', title: 'Workplace Health and Safety Policy', description: 'WHS compliance, incident reporting, and workplace safety procedures', owner: 'Mia Nguyen', status: 'In Review', version: '0.9', effectiveFrom: new Date('2024-03-01'), supersedesId: null, tags: ['whs', 'safety', 'incidents'], frameworkId: 'apgf-ms', createdAt: new Date('2024-01-10') },
    { id: 'POL-TRN-001', title: 'Training and Competency Policy', description: 'Staff training requirements, competency assessments, and wage theft awareness programs', owner: 'Mia Nguyen', status: 'Draft', version: '0.5', effectiveFrom: new Date('2024-04-01'), supersedesId: null, tags: ['training', 'competency', 'wage-theft'], frameworkId: 'apgf-ms', createdAt: new Date('2024-01-12') },
    { id: 'POL-CHG-001', title: 'Change Management Policy', description: 'System change management, testing requirements, and deployment approval processes', owner: 'Ava Morgan', status: 'In Review', version: '0.8', effectiveFrom: new Date('2024-02-15'), supersedesId: null, tags: ['change', 'deployment', 'testing'], frameworkId: 'apgf-ms', createdAt: new Date('2024-01-08') },
  ];

  const dashboardData: DashboardData = {
    compliancePercent: 73,
    statusBreakdown: {
      'Compliant': 28,
      'In Progress': 10,
      'Evidence Pending': 7,
      'Not Started': 0,
      'Audit Ready': 3
    },
    recentActivity: [
      { id: '1', type: 'Control Updated', description: 'APGF-TAX-005 status changed to Audit Ready', timestamp: '2024-01-15T10:30:00Z', actor: 'Ella Thompson' },
      { id: '2', type: 'Policy Published', description: 'Payroll Processing and Administration Policy v3.2 published', timestamp: '2024-01-15T09:45:00Z', actor: 'Leo Carter' },
      { id: '3', type: 'Evidence Uploaded', description: 'STP compliance evidence uploaded', timestamp: '2024-01-15T09:15:00Z', actor: 'Leo Carter' },
      { id: '4', type: 'Control Updated', description: 'APGF-PAY-001 payroll calculation testing completed', timestamp: '2024-01-14T16:45:00Z', actor: 'Leo Carter' },
      { id: '5', type: 'Policy Published', description: 'Tax Compliance and Reporting Policy v2.5 published', timestamp: '2024-01-14T15:30:00Z', actor: 'Ella Thompson' },
      { id: '6', type: 'Policy Published', description: 'Payroll Governance and Risk Management Policy v2.1 published', timestamp: '2024-01-14T14:20:00Z', actor: 'Ava Morgan' },
      { id: '7', type: 'Control Updated', description: 'ISO-QMS-003 management review prepared', timestamp: '2024-01-14T11:15:00Z', actor: 'Oliver Brooks' },
      { id: '8', type: 'Policy In Review', description: 'Change Management Policy submitted for review', timestamp: '2024-01-13T16:00:00Z', actor: 'Ava Morgan' },
    ],
    deadlines: [
      { id: '1', title: 'Q1 2024 Compliance Review', dueDate: '2024-03-31', type: 'Review', priority: 'high' },
      { id: '2', title: 'Training and Competency Policy Approval', dueDate: '2024-02-28', type: 'Policy', priority: 'high' },
      { id: '3', title: 'Superannuation Quarterly Payment', dueDate: '2024-01-28', type: 'Payment', priority: 'high' },
      { id: '4', title: 'Change Management Policy Review', dueDate: '2024-02-15', type: 'Policy', priority: 'medium' },
      { id: '5', title: 'Annual Leave Accruals Review', dueDate: '2024-02-15', type: 'Review', priority: 'medium' },
    ]
  };

  return { users, frameworks, controls, policies, dashboardData };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      activeFramework: 'apgf-ms', // Default framework to APGF-MS
      ...generateMockData(),
      evidence: [],
      auditSessions: [],
      auditFindings: [],
      certifications: [],
      accessLogs: [],
      notifications: [],
      companyProfile: null,
      sidebarOpen: true,
      darkMode: false,

      // Billing state - 15 day trial
      subscription: {
        plan: 'monthly',
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        currentPeriodEnd: null,
      },
      purchasedFrameworks: ['apgf-ms', 'iso-9001', 'iso-27001'], // All frameworks for clickable prototype

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setActiveFramework: (framework) => set({ activeFramework: framework }),
      
      // Ensure active framework is always valid
      ensureValidActiveFramework: () => {
        const state = get();
        if (!state.activeFramework || !state.purchasedFrameworks.includes(state.activeFramework)) {
          // Set to first purchased framework
          const firstPurchased = state.purchasedFrameworks[0];
          if (firstPurchased) {
            set({ activeFramework: firstPurchased });
          }
        }
      },
      
      purchaseFramework: (frameworkId) => {
        // Validate frameworkId
        if (!frameworkId) {
          console.error('purchaseFramework requires a valid frameworkId');
          return;
        }
        
        set(state => ({
          purchasedFrameworks: Array.from(new Set([...state.purchasedFrameworks, frameworkId]))
        }));
        
        // Show success notification
        const framework = get().frameworks.find(f => f.id === frameworkId);
        get().addNotification({
          title: 'Framework Purchased',
          message: `${framework?.name || 'Framework'} unlocked for $1,499 AUD`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
        });
      },
      
      purchaseBundle: () => {
        set({
          purchasedFrameworks: ['apgf-ms', 'iso-9001', 'iso-27001']
        });
        
        get().addNotification({
          title: 'Bundle Purchased',
          message: `All 3 frameworks unlocked for $3,000 AUD (save $1,497!)`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
        });
      },
      
      updateSubscription: (plan) => {
        set(state => ({
          subscription: state.subscription ? {
            ...state.subscription,
            plan,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + (plan === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
          } : null,
        }));
        
        get().addNotification({
          title: 'Subscription Updated',
          message: `Switched to ${plan} plan - ${plan === 'annual' ? '$10,000 AUD/year' : '$1,000 AUD/month'}`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
        });
      },
      
      addNotification: (notification) => {
        const id = Date.now().toString();
        set(state => ({ 
          notifications: [{ ...notification, id, read: false, timestamp: new Date().toISOString() }, ...state.notifications] 
        }));
      },
      
      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));
      },
      
      clearNotifications: () => set({ notifications: [] }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
      
      addAccessLog: (log) => {
        const id = Date.now().toString();
        set(state => ({
          accessLogs: [{ ...log, id, timestamp: new Date() }, ...state.accessLogs]
        }));
      },
      
      updateControl: (id, updates) => {
        set(state => ({
          controls: state.controls.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)
        }));
      },
      
      updatePolicy: (id, updates) => {
        set(state => ({
          policies: state.policies.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
      },
      
      addEvidence: (evidence) => {
        const id = Date.now().toString();
        set(state => ({
          evidence: [{ ...evidence, id, uploadedAt: new Date() }, ...state.evidence]
        }));
      },

      updateCompanyProfile: (profileUpdates) => {
        set(state => {
          const currentProfile = state.companyProfile;
          const updatedProfile: CompanyProfile = currentProfile 
            ? { ...currentProfile, ...profileUpdates, updatedAt: new Date() }
            : {
                id: Date.now().toString(),
                companyName: '',
                industry: '',
                businessStructure: 'company',
                address: {
                  street: '',
                  suburb: '',
                  state: '',
                  postcode: '',
                  country: 'Australia'
                },
                contactDetails: {
                  phone: '',
                  email: ''
                },
                keyPersonnel: {},
                businessDetails: {
                  employeeCount: 0,
                  operatingStates: ['NSW'],
                  hasOverseasOperations: false,
                  primaryActivities: []
                },
                regulatoryInfo: {
                  licences: [],
                  registrations: [],
                  complianceFrameworks: []
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: state.currentUser?.name || 'System',
                lastUpdatedBy: state.currentUser?.name || 'System',
                ...profileUpdates
              };
          
          return { companyProfile: updatedProfile };
        });
      },
      
      resetData: () => {
        set({ ...generateMockData(), notifications: [], accessLogs: [] });
      },
    }),
    {
      name: 'corecomply-storage-v3', // Changed name to force fresh start
      version: 1,
      storage,
      partialize: (state) => {
        // Convert dates to ISO strings for serialization
        const serializeData = (obj: any): any => {
          if (obj instanceof Date) {
            return obj.toISOString();
          }
          if (Array.isArray(obj)) {
            return obj.map(serializeData);
          }
          if (obj && typeof obj === 'object') {
            const result: any = {};
            for (const key in obj) {
              if (typeof obj[key] !== 'function') {
                result[key] = serializeData(obj[key]);
              }
            }
            return result;
          }
          return obj;
        };

        return {
          // Only persist data, not functions
          currentUser: serializeData(state.currentUser),
          activeFramework: state.activeFramework,
          subscription: serializeData(state.subscription),
          purchasedFrameworks: state.purchasedFrameworks,
          users: serializeData(state.users),
          controls: serializeData(state.controls),
          policies: serializeData(state.policies),
          evidence: serializeData(state.evidence),
          auditSessions: serializeData(state.auditSessions),
          auditFindings: serializeData(state.auditFindings),
          certifications: serializeData(state.certifications),
          accessLogs: serializeData(state.accessLogs),
          frameworks: serializeData(state.frameworks),
          dashboardData: serializeData(state.dashboardData),
          notifications: serializeData(state.notifications),
          sidebarOpen: state.sidebarOpen,
          darkMode: state.darkMode,
        };
      },
      onRehydrateStorage: () => (state) => {
        // Convert ISO strings back to dates on rehydration
        const deserializeData = (obj: any): any => {
          if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
            return new Date(obj);
          }
          if (Array.isArray(obj)) {
            return obj.map(deserializeData);
          }
          if (obj && typeof obj === 'object') {
            const result: any = {};
            for (const key in obj) {
              result[key] = deserializeData(obj[key]);
            }
            return result;
          }
          return obj;
        };

        if (state) {
          state.currentUser = deserializeData(state.currentUser);
          state.subscription = deserializeData(state.subscription);
          state.users = deserializeData(state.users);
          state.controls = deserializeData(state.controls);
          state.policies = deserializeData(state.policies);
          state.evidence = deserializeData(state.evidence);
          state.auditSessions = deserializeData(state.auditSessions);
          state.auditFindings = deserializeData(state.auditFindings);
          state.certifications = deserializeData(state.certifications);
          state.accessLogs = deserializeData(state.accessLogs);
          state.frameworks = deserializeData(state.frameworks);
          state.dashboardData = deserializeData(state.dashboardData);
          state.notifications = deserializeData(state.notifications);
        }
      },
    }
  )
);