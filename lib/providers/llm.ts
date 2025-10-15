// LLM Provider - abstracts Azure OpenAI and local mock
import type { LLMProvider } from '../types/azure';
import { config } from './config';

// Mock implementation for clickable prototype
class MockLLMProvider implements LLMProvider {
  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Generate contextual mock responses
    if (lastMessage.includes('classification') || lastMessage.includes('award')) {
      return `Based on the position description and duties, this role aligns with **Level 3 - Administrative Officer** under the Clerks Private Sector Award 2020.

**Key indicators:**
- Performs routine administrative duties with limited supervision
- Uses standard office software packages
- Handles basic customer inquiries
- Maintains records and databases

**Relevant award clauses:**
- Clause 13.3: Level 3 classification criteria
- Clause 14.1: Minimum wage rates
- Clause 15.2: Hours of work provisions

**Confidence: 0.87** - High confidence based on duty alignment with award descriptors.`;
    }
    
    if (lastMessage.includes('legal brief') || lastMessage.includes('memo')) {
      return `## Classification Review: Administrative Officer Position

**Summary:** Position PA-2024-003 has been reviewed for award classification compliance.

**Facts:**
1. Role involves routine administrative tasks with limited supervision
2. Employee uses standard MS Office suite
3. Handles level 1-2 customer inquiries
4. Maintains departmental filing systems

**Award Analysis:**
The Clerks Private Sector Award 2020, Clause 13.3 defines Level 3 as employees who perform work above and beyond Level 2, including:
- Work requiring certificate-level qualifications or equivalent experience
- Limited supervision requirement
- Standard office technology proficiency

**Recommendation:**
Classify as Level 3, minimum weekly rate $XXX.XX (current award rate).

**Supporting Evidence:**
- Position Description (PD-PA-2024-003.pdf)
- Training records showing Certificate III completion
- Supervisor attestation of autonomy level

---
*Generated ${new Date().toISOString()} - Internal use only*`;
    }
    
    if (lastMessage.includes('anomaly') || lastMessage.includes('mismatch')) {
      return `**Superannuation Guarantee Mismatch Detected**

**Issue:** Q2 2024 SG contributions show discrepancy for 3 employees.

**Details:**
- Calculated OTE: $42,500
- Required SG (11.5%): $4,887.50
- Actual contribution: $4,250.00
- Shortfall: $637.50

**Root Cause:** Salary packaging amounts were not included in OTE calculation for SG purposes.

**Recommendation:**
1. Recalculate OTE including salary packaging
2. Lodge shortfall contribution with interest
3. Update payroll calculation rules
4. Review Q1 2024 for same issue

**Risk:** ATO audit exposure, employee complaint, reputational damage.`;
    }
    
    // Default response
    return `I can help you with classification audits, legal briefs, and compliance analysis. Please provide specific details about your request.`;
  }

  async embed(text: string): Promise<number[]> {
    // Mock embedding - simple hash-based vector
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dim = 1536; // Standard embedding dimension
    const vector = new Array(dim).fill(0).map((_, i) => Math.sin(hash + i) * 0.1);
    return vector;
  }
}

// Azure OpenAI implementation (stub for now - needs @azure packages)
class AzureOpenAIProvider implements LLMProvider {
  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    // Will be implemented when Azure packages are installed
    // Uses process.env.AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_CHAT_DEPLOYMENT
    throw new Error('Azure OpenAI provider requires @azure packages - use STACK_PROVIDER=local for prototype');
  }

  async embed(text: string): Promise<number[]> {
    // Will be implemented when Azure packages are installed
    throw new Error('Azure OpenAI provider requires @azure packages - use STACK_PROVIDER=local for prototype');
  }
}

// Provider factory
function createLLMProvider(): LLMProvider {
  if (config.stackProvider === 'azure') {
    return new AzureOpenAIProvider();
  }
  return new MockLLMProvider();
}

export const llmProvider = createLLMProvider();
