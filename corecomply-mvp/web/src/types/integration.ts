export interface Integration {
  id: number;
  name: string;
  type: string;
  status: string;
  lastSync?: string | null;
  configuration?: string | null;
  apiKey?: string | null;
  endpoint?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateIntegrationRequest {
  name: string;
  type: string;
  configuration?: string | null;
  apiKey?: string | null;
  endpoint?: string | null;
}

export interface UpdateIntegrationRequest {
  name: string;
  type: string;
  status: string;
  configuration?: string | null;
  apiKey?: string | null;
  endpoint?: string | null;
}

export interface SyncResponse {
  message: string;
  lastSync: string;
}
