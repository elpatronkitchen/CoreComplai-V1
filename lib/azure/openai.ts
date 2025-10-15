// Azure OpenAI Provider Implementation
import type { LLMProvider } from '../types/azure';

export class AzureOpenAIProvider implements LLMProvider {
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;
  private apiVersion: string;

  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    this.apiKey = process.env.AZURE_OPENAI_API_KEY || '';
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    this.apiVersion = '2024-02-15-preview';
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async embed(text: string): Promise<number[]> {
    const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002';
    const url = `${this.endpoint}/openai/deployments/${embeddingDeployment}/embeddings?api-version=${this.apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0]?.embedding || [];
  }
}
