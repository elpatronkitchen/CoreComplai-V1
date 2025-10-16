import type { User } from '../contexts/UserContext';

export type Permission = 
  | 'view_dashboard'
  | 'manage_frameworks'
  | 'select_active_framework'
  | 'view_frameworks'
  | 'manage_controls'
  | 'view_controls'
  | 'manage_policies'
  | 'view_policies'
  | 'upload_evidence'
  | 'view_evidence'
  | 'run_internal_audits'
  | 'run_external_audits'
  | 'view_audits'
  | 'run_payroll_audits'
  | 'create_audit_findings'
  | 'manage_audit_findings'
  | 'annotate_audit_findings'
  | 'export_audit_evidence'
  | 'export_reports'
  | 'generate_reports'
  | 'view_reports'
  | 'manage_users'
  | 'view_access_logs'
  | 'manage_company_profile'
  | 'view_risk_registers'
  | 'manage_payroll_risks'
  | 'view_payroll_risks'
  | 'manage_hr_risks'
  | 'view_hr_risks'
  | 'manage_finance_risks'
  | 'view_finance_risks'
  | 'view_assets'
  | 'manage_assets'
  | 'view_integrations'
  | 'manage_integrations'
  | 'view_people'
  | 'manage_people'
  | 'reset_demo_data';

const rolePermissions: Record<string, Permission[]> = {
  system_admin: [
    'view_dashboard',
    'manage_frameworks',
    'select_active_framework',
    'view_frameworks',
    'manage_controls',
    'view_controls',
    'manage_policies',
    'view_policies',
    'upload_evidence',
    'view_evidence',
    'run_internal_audits',
    'run_external_audits',
    'view_audits',
    'run_payroll_audits',
    'create_audit_findings',
    'manage_audit_findings',
    'annotate_audit_findings',
    'export_audit_evidence',
    'export_reports',
    'generate_reports',
    'view_reports',
    'manage_users',
    'view_access_logs',
    'manage_integrations',
    'manage_company_profile',
    'view_risk_registers',
    'manage_payroll_risks',
    'view_payroll_risks',
    'manage_hr_risks',
    'view_hr_risks',
    'manage_finance_risks',
    'view_finance_risks',
    'view_assets',
    'manage_assets',
    'view_integrations',
    'manage_integrations',
    'view_people',
    'manage_people',
    'reset_demo_data'
  ],
  compliance_owner: [
    'view_dashboard',
    'select_active_framework',
    'view_frameworks',
    'manage_controls',
    'view_controls',
    'manage_policies',
    'view_policies',
    'upload_evidence',
    'view_evidence',
    'view_audits',
    'run_payroll_audits',
    'create_audit_findings',
    'manage_audit_findings',
    'annotate_audit_findings',
    'export_audit_evidence',
    'export_reports',
    'generate_reports',
    'view_reports',
    'view_access_logs',
    'manage_company_profile',
    'view_risk_registers',
    'manage_payroll_risks',
    'view_payroll_risks',
    'manage_hr_risks',
    'view_hr_risks',
    'manage_finance_risks',
    'view_finance_risks',
    'view_assets',
    'manage_assets',
    'view_integrations',
    'view_people',
    'manage_people'
  ],
  payroll_officer: [
    'view_dashboard',
    'view_frameworks',
    'view_controls',
    'view_policies',
    'upload_evidence',
    'view_evidence',
    'view_audits',
    'run_payroll_audits',
    'annotate_audit_findings',
    'view_reports',
    'view_risk_registers',
    'manage_payroll_risks',
    'view_payroll_risks',
    'view_assets',
    'view_integrations',
    'view_people'
  ],
  hr_officer: [
    'view_dashboard',
    'view_frameworks',
    'view_controls',
    'view_policies',
    'upload_evidence',
    'view_evidence',
    'view_audits',
    'run_payroll_audits',
    'annotate_audit_findings',
    'view_reports',
    'view_risk_registers',
    'manage_hr_risks',
    'view_hr_risks',
    'view_assets',
    'view_integrations',
    'view_people',
    'manage_people'
  ],
  finance_manager: [
    'view_dashboard',
    'view_frameworks',
    'view_controls',
    'view_policies',
    'upload_evidence',
    'view_evidence',
    'view_audits',
    'run_payroll_audits',
    'view_reports',
    'view_risk_registers',
    'manage_finance_risks',
    'view_finance_risks'
  ],
  executive: [
    'view_dashboard',
    'view_frameworks',
    'view_controls',
    'view_policies',
    'view_evidence',
    'view_audits',
    'run_payroll_audits',
    'export_audit_evidence',
    'view_reports',
    'view_risk_registers',
    'view_finance_risks'
  ],
  internal_auditor: [
    'view_dashboard',
    'view_frameworks',
    'view_controls',
    'view_policies',
    'view_evidence',
    'run_internal_audits',
    'view_audits',
    'run_payroll_audits',
    'create_audit_findings',
    'annotate_audit_findings',
    'export_audit_evidence',
    'export_reports',
    'generate_reports',
    'view_reports',
    'view_risk_registers',
    'view_finance_risks'
  ],
  external_auditor: [
    'view_dashboard',
    'view_frameworks',
    'view_controls',
    'view_policies',
    'view_evidence',
    'run_external_audits',
    'view_audits',
    'run_payroll_audits',
    'create_audit_findings',
    'annotate_audit_findings',
    'export_audit_evidence',
    'export_reports',
    'generate_reports',
    'view_reports',
    'view_risk_registers',
    'view_finance_risks'
  ],
  reviewer: [
    'view_dashboard',
    'view_frameworks',
    'view_controls',
    'view_policies',
    'view_evidence',
    'view_audits',
    'run_payroll_audits',
    'export_audit_evidence',
    'export_reports',
    'generate_reports',
    'view_reports',
    'view_risk_registers',
    'view_finance_risks'
  ]
};

export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  const permissions = rolePermissions[user.role];
  return permissions?.includes(permission) ?? false;
};

export const getUserPermissions = (user: User | null): Permission[] => {
  if (!user) return [];
  return rolePermissions[user.role] ?? [];
};

export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    system_admin: 'System Administrator',
    compliance_owner: 'Compliance Owner',
    payroll_officer: 'Payroll Officer',
    hr_officer: 'HR Officer',
    finance_manager: 'Finance Manager',
    executive: 'Executive/Director',
    internal_auditor: 'Internal Auditor',
    external_auditor: 'External Auditor',
    reviewer: 'Reviewer'
  };
  return roleMap[role] ?? role;
};