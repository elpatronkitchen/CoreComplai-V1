export interface Asset {
  id: number;
  name: string;
  type: string;
  classification: string;
  owner: string;
  location: string;
  status: string;
  purchaseDate?: string | null;
  value?: number | null;
  description?: string | null;
  createdAt: string;
}

export interface CreateAssetRequest {
  name: string;
  type: string;
  classification?: string;
  owner: string;
  location: string;
  status?: string;
  purchaseDate?: string | null;
  value?: number | null;
  description?: string | null;
}

export interface UpdateAssetRequest {
  name: string;
  type: string;
  classification: string;
  owner: string;
  location: string;
  status: string;
  purchaseDate?: string | null;
  value?: number | null;
  description?: string | null;
}
