export interface Report {
  id: number;
  name: string;
  type: string;
  description: string;
  lastGenerated?: string | null;
  status: string;
  schedule?: string | null;
  framework?: string | null;
  format: string;
  createdBy: string;
  createdAt: string;
  parameters?: string | null;
}

export interface ReportTemplate {
  id: number;
  name: string;
  type: string;
  description: string;
  category: string;
  defaultParameters?: string;
}

export interface GenerateReportRequest {
  name: string;
  type: string;
  description?: string;
  format: string;
  framework?: string;
  parameters?: Record<string, any>;
}
