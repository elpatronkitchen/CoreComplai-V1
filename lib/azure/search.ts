// Azure AI Search Provider Implementation
import type { RAGProvider, RAGDocument, RAGSearchResult } from '../types/azure';

export class AzureSearchProvider implements RAGProvider {
  private endpoint: string;
  private apiKey: string;
  private indexName: string;
  private apiVersion: string;

  constructor() {
    this.endpoint = process.env.AZURE_SEARCH_ENDPOINT || '';
    this.apiKey = process.env.AZURE_SEARCH_API_KEY || '';
    this.indexName = process.env.AZURE_SEARCH_INDEX || 'compliance-docs';
    this.apiVersion = '2024-05-01-preview';
  }

  async search(query: string, filters?: Record<string, any>): Promise<RAGSearchResult[]> {
    const url = `${this.endpoint}/indexes/${this.indexName}/docs/search?api-version=${this.apiVersion}`;

    const body: any = {
      search: query,
      top: 10,
      select: 'id,content,metadata',
      queryType: 'semantic',
      semanticConfiguration: 'default',
    };

    if (filters) {
      const filterStrings: string[] = [];
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          filterStrings.push(`search.in(${key}, '${value.join('|')}')`);
        } else {
          filterStrings.push(`${key} eq '${value}'`);
        }
      }
      if (filterStrings.length > 0) {
        body.filter = filterStrings.join(' and ');
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Azure AI Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.value.map((result: any) => ({
      id: result.id,
      content: result.content,
      score: result['@search.score'] || 0,
      metadata: result.metadata || {},
    }));
  }

  async index(documents: RAGDocument[]): Promise<void> {
    const url = `${this.endpoint}/indexes/${this.indexName}/docs/index?api-version=${this.apiVersion}`;

    const batch = {
      value: documents.map(doc => ({
        '@search.action': 'upload',
        id: doc.id,
        content: doc.content,
        metadata: JSON.stringify(doc.metadata),
      })),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error(`Azure AI Search indexing error: ${response.statusText}`);
    }
  }
}
