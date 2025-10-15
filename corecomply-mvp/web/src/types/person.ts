export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  role: string;
  department: string;
  status: string;
  startDate?: string;
  lastLogin?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface PersonStats {
  total: number;
  active: number;
  avgComplianceScore: number;
  needsAttention: number;
}
