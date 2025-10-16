export interface CompanyProfile {
  id: number;
  name: string;
  industry: string;
  abn?: string | null;
  acn?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  employeeCount: number;
  establishedDate?: string | null;
  logoUrl?: string | null;
  updatedAt: string;
}

export interface UpdateCompanyProfileRequest {
  id?: number;
  name: string;
  industry: string;
  abn?: string | null;
  acn?: string | null;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  employeeCount: number;
  establishedDate?: string | null;
  logoUrl?: string | null;
}

export interface CompanySettings {
  id: number;
  key: string;
  value: string;
  category: string;
  description?: string | null;
}

export interface UpdateSettingsRequest {
  key: string;
  value: string;
  category?: string;
  description?: string | null;
}
