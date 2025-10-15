export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requestedBy: string;
  assignedTo?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  resolution?: string | null;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string | null;
  resolution?: string | null;
}

export interface KnowledgeBaseArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
  updatedAt?: string | null;
}
