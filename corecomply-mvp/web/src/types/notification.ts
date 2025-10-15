export interface Notification {
  id: number;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  userId: string;
  taskId?: string;
  auditId?: string;
  controlId?: string;
  dueDate?: string;
  actionUrl?: string;
}
