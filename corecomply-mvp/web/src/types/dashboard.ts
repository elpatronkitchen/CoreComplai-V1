export interface DashboardStats {
  compliancePercent: number;
  totalControls: number;
  compliantControls: number;
  inProgressControls: number;
  pendingControls: number;
  statusBreakdown: Record<string, number>;
  upcomingDeadlinesCount: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
}

export interface Control {
  id: string;
  code: string;
  title: string;
  description?: string;
  owner?: string;
  status: 'Compliant' | 'In Progress' | 'Evidence Pending' | 'Non-Compliant' | 'Not Started';
  frameworkId?: string;
}
