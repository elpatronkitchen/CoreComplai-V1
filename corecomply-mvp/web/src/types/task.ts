export interface ComplianceTask {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  type: 'payroll' | 'compliance' | 'evidence' | 'audit' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignee?: string;
  assignedBy?: string;
  category: 'pre_payroll' | 'post_payroll' | 'monthly' | 'quarterly' | 'annual' | 'ongoing';
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  nextDue?: string;
  source?: 'fair_work' | 'ato' | 'internal' | 'compliance';
  payrollCycle?: string;
  awardType?: string;
  submissionType?: string;
  amount?: number;
  createdAt: string;
  completedAt?: string;
}
