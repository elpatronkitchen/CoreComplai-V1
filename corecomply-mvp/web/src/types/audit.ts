export interface Audit {
  id: number;
  title: string;
  description: string;
  type: 'internal' | 'external';
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed';
  auditor: string;
  startDate: string;
  endDate: string;
  scope: string[];
  findings: AuditFinding[];
  createdAt: string;
  findingsCount?: number;
  completionPercentage?: number;
}

export interface AuditFinding {
  id: number;
  auditId: number;
  controlId: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  status: 'open' | 'in_progress' | 'resolved';
  assignee: string;
  dueDate: string;
  createdAt: string;
  evidence: string[];
  audit?: Audit;
}

export interface AuditStats {
  total: number;
  inProgress: number;
  completed: number;
  scheduled: number;
  findings: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
}
