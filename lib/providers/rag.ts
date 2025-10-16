// RAG Provider - abstracts Azure AI Search and local mock
import type { RAGProvider, RAGDocument, RAGSearchResult } from '../types/azure';
import { config } from './config';

// Mock RAG corpus for prototype
const mockCorpus: RAGDocument[] = [
  {
    id: 'doc-award-clerks-001',
    content: 'Clerks Private Sector Award 2020 - Level 3: An employee at this level performs work above and beyond Level 2, including duties requiring certificate-level qualifications or equivalent experience. Employees at this level work with limited supervision and use standard office technology.',
    metadata: {
      type: 'award',
      award: 'Clerks Private Sector Award 2020',
      clause: '13.3',
      level: 3,
    }
  },
  {
    id: 'doc-sg-ote-001',
    content: 'Superannuation Guarantee: OTE (Ordinary Time Earnings) includes all earnings for ordinary hours of work, including salary packaging amounts. Exclude overtime, bonuses, and certain fringe benefits. Current SG rate: 11.5% from July 2024.',
    metadata: {
      type: 'compliance',
      topic: 'superannuation',
      regulation: 'SG Act 1992',
    }
  },
  {
    id: 'doc-payslip-sla-001',
    content: 'Fair Work Regulations 2009: Payslips must be issued within 1 working day of pay day. Payslips must include: pay period, gross and net pay, deductions, super contributions, leave balances, employer ABN, and employee name.',
    metadata: {
      type: 'compliance',
      topic: 'payslips',
      regulation: 'FW Regs 2009',
    }
  },
  {
    id: 'doc-stp-recon-001',
    content: 'Single Touch Payroll Phase 2: YTD amounts must reconcile with payroll records. Common discrepancies: missing pay events, incorrect disaggregation codes, unreported cessations. STP finalisation due by 14 July.',
    metadata: {
      type: 'compliance',
      topic: 'STP',
      regulation: 'TAA 1953',
    }
  },
  {
    id: 'doc-classification-process-001',
    content: 'Position classification process: Review position description, identify key duties, map to award classification definitions, validate with similar roles, document rationale. Seek legal review if confidence <85%.',
    metadata: {
      type: 'process',
      topic: 'classification',
    }
  },
];

// Mock implementation using simple BM25-like scoring
class MockRAGProvider implements RAGProvider {
  async search(query: string, filters?: Record<string, any>): Promise<RAGSearchResult[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Score documents
    const scored = mockCorpus.map(doc => {
      let score = 0;
      const contentLower = doc.content.toLowerCase();
      
      queryTerms.forEach(term => {
        if (contentLower.includes(term)) {
          score += 1 / (1 + contentLower.indexOf(term) / 100); // Boost earlier matches
        }
      });
      
      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (doc.metadata[key] === value) {
            score *= 1.5; // Boost matching filters
          }
        });
      }
      
      return {
        ...doc,
        score,
      };
    });
    
    // Sort by score and return top results
    return scored
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  async index(documents: RAGDocument[]): Promise<void> {
    // Mock indexing - just log
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[Mock RAG] Indexed ${documents.length} documents`);
  }
}

// Azure AI Search implementation (stub)
class AzureSearchProvider implements RAGProvider {
  async search(query: string, filters?: Record<string, any>): Promise<RAGSearchResult[]> {
    // Will be implemented when Azure packages are installed
    // Uses hybrid vector + keyword search
    throw new Error('Azure AI Search provider requires @azure packages - use RAG_BACKEND=local for prototype');
  }

  async index(documents: RAGDocument[]): Promise<void> {
    throw new Error('Azure AI Search provider requires @azure packages - use RAG_BACKEND=local for prototype');
  }
}

// Provider factory
function createRAGProvider(): RAGProvider {
  if (config.ragBackend === 'azure-search') {
    return new AzureSearchProvider();
  }
  return new MockRAGProvider();
}

export const ragProvider = createRAGProvider();
