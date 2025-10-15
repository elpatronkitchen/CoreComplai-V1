// Azure-specific types for Classification & Comprehensive Audit system

export type StackProvider = 'azure' | 'local';
export type AuthProvider = 'entra' | 'mock';
export type RagBackend = 'azure-search' | 'local';

export interface AzureConfig {
  stackProvider: StackProvider;
  authProvider: AuthProvider;
  ragBackend: RagBackend;
  region: string;
}

export interface ClassificationCandidate {
  id: string;
  awardKey: string;
  level: string;
  title: string;
  confidence: number;
  snippets: string[];
  vetoes: string[];
  priorDecisions?: string[];
}

export interface EvidenceArtifact {
  id: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  type: string; // 'payslip', 'contract', 'STP', 'SG', 'BAS', etc.
  period?: { from: string; to: string };
  matches: EvidenceMatch[];
  status: 'pending' | 'accepted' | 'rejected';
  redacted: boolean;
  sasUrl?: string;
}

export interface EvidenceMatch {
  type: 'obligation' | 'control' | 'audit_item';
  id: string;
  confidence: number;
  reason: string;
}

export interface ReviewItem {
  id: string;
  type: 'classification' | 'audit_item' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  snippets: string[];
  evidencePackSize: number;
  status: 'my_queue' | 'awaiting_approval' | 'returned' | 'auto_ready' | 'completed';
  assignedTo: string;
  dueDate: string;
  slaStatus: 'on_time' | 'at_risk' | 'overdue';
  touchTimeSeconds?: number;
  loopCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnomalyDetection {
  id: string;
  type: 'sg_mismatch' | 'stp_recon' | 'payslip_sla';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedEmployees: string[];
  period: { from: string; to: string };
  linkedArtifacts: string[];
  why: string;
  suggestedAction: string;
  status: 'open' | 'in_review' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ReviewerMetrics {
  itemsToday: number;
  itemsCompleted: number;
  medianTimeSeconds: number;
  firstPassRate: number;
  autoReadyRate: number;
  returnLoopCount: number;
  hoursAvoided: number;
  dollarsSaved: number;
}

export interface LegalBrief {
  id: string;
  title: string;
  facts: string[];
  snippets: Array<{ text: string; source: string }>;
  citations: Array<{ text: string; url: string }>;
  generatedAt: string;
  generatedBy: string;
}

export interface CopilotMemo {
  id: string;
  obligationId?: string;
  controlId?: string;
  period: { from: string; to: string };
  content: string;
  citations: Array<{ text: string; source: string; internal: boolean }>;
  generatedAt: string;
}

// Provider interfaces
export interface LLMProvider {
  chat(messages: Array<{ role: string; content: string }>): Promise<string>;
  embed(text: string): Promise<number[]>;
}

export interface RAGProvider {
  search(query: string, filters?: Record<string, any>): Promise<RAGSearchResult[]>;
  index(documents: RAGDocument[]): Promise<void>;
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

export interface RAGSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export interface StorageProvider {
  getUploadUrl(filename: string, contentType: string): Promise<{ url: string; sasToken: string }>;
  getReadUrl(filename: string, ttlMinutes: number): Promise<string>;
  deleteFile(filename: string): Promise<void>;
}

export interface SecretProvider {
  getSecret(name: string): Promise<string>;
  setSecret(name: string, value: string): Promise<void>;
}
