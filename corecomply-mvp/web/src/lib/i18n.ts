// English UK translations
export const translations = {
  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.view': 'View',
  'common.create': 'Create',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.import': 'Import',
  'common.upload': 'Upload',
  'common.download': 'Download',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.warning': 'Warning',
  'common.info': 'Information',
  
  // Status
  'status.compliant': 'Compliant',
  'status.in_progress': 'In Progress',
  'status.evidence_pending': 'Evidence Pending',
  'status.not_started': 'Not Started',
  'status.audit_ready': 'Audit Ready',
  'status.draft': 'Draft',
  'status.published': 'Published',
  'status.archived': 'Archived',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.controls': 'Controls',
  'nav.policies': 'Policies',
  'nav.audits': 'Audits',
  'nav.reports': 'Reports',
  'nav.frameworks': 'Frameworks',
  'nav.admin': 'Admin',
  'nav.support': 'Support',
  
  // Dashboard
  'dashboard.compliance_overview': 'Compliance Overview',
  'dashboard.recent_activity': 'Recent Activity',
  'dashboard.upcoming_deadlines': 'Upcoming Deadlines',
  'dashboard.quick_actions': 'Quick Actions',
};

export const t = (key: string): string => {
  return (translations as any)[key] || key;
};