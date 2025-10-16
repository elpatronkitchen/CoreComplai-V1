export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLogin?: string;
  createdAt: string;
  createdBy: string;
}

export interface AccessLog {
  id: number;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  details?: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: string;
  category: string;
  description?: string;
}
