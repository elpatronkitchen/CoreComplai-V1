import { getSecret } from "./secret.provider";

const ragBackend = process.env.RAG_BACKEND || "local";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface EmbedResponse {
  embeddings: number[][];
  dimensions: number;
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ChatResponse> {
  if (ragBackend === "azure-search") {
    return await azureOpenAIChat(messages, options);
  } else {
    return localMockChat(messages, options);
  }
}

export async function embed(texts: string[]): Promise<EmbedResponse> {
  if (ragBackend === "azure-search") {
    return await azureOpenAIEmbed(texts);
  } else {
    return localMockEmbed(texts);
  }
}

async function azureOpenAIChat(
  messages: ChatMessage[],
  options: ChatOptions
): Promise<ChatResponse> {
  const endpoint = await getSecret("AZURE_OPENAI_ENDPOINT");
  const apiKey = await getSecret("AZURE_OPENAI_API_KEY");
  const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || "gpt-4o-chat";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-05-01-preview";

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI chat failed: ${response.statusText}`);
  }

  return await response.json();
}

async function azureOpenAIEmbed(texts: string[]): Promise<EmbedResponse> {
  const endpoint = await getSecret("AZURE_OPENAI_ENDPOINT");
  const apiKey = await getSecret("AZURE_OPENAI_API_KEY");
  const deployment = process.env.AZURE_OPENAI_EMBED_DEPLOYMENT || "text-embedding";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-05-01-preview";

  const url = `${endpoint}/openai/deployments/${deployment}/embeddings?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      input: texts,
    }),
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI embed failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    embeddings: data.data.map((item: any) => item.embedding),
    dimensions: data.data[0]?.embedding?.length || 0,
  };
}

function localMockChat(
  messages: ChatMessage[],
  options: ChatOptions
): ChatResponse {
  const lastMessage = messages[messages.length - 1];
  let mockContent = "";

  if (lastMessage.content.toLowerCase().includes("classification")) {
    mockContent =
      "Based on the position description and relevant Modern Award provisions, this role aligns with a permanent full-time classification under the Clerks Private Sector Award 2020, Level 3. Key factors include: requirement for payroll processing expertise, responsibility for compliance, and supervisory duties over junior staff.";
  } else if (lastMessage.content.toLowerCase().includes("legal brief")) {
    mockContent =
      "## Legal Brief: Senior Payroll Officer Classification\n\n**Position:** Senior Payroll Officer\n**Recommended Classification:** Clerks Private Sector Award 2020, Level 3\n\n### Relevant Provisions\n1. **Fair Work Act 2009** - Classification based on skill level and responsibilities\n2. **Modern Award Coverage** - Clerks Award applies to administrative and clerical roles\n3. **Classification Descriptors** - Level 3 encompasses payroll processing with compliance oversight\n\n### Supporting Evidence\n- Position requires application of payroll legislation knowledge\n- Supervisory responsibility indicated\n- Similar precedents: Smith v ABC Corp [2023], Johnson v XYZ Ltd [2022]\n\n### Compliance Notes\n- Ensure superannuation obligations met\n- Fair Work Information Statement provided\n- Classification reviewed annually";
  } else {
    mockContent =
      "This is a mock response from the local LLM provider. In production, this would be powered by Azure OpenAI.";
  }

  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: mockContent,
        },
        finishReason: "stop",
      },
    ],
    usage: {
      promptTokens: messages.reduce((sum, m) => sum + m.content.length / 4, 0),
      completionTokens: mockContent.length / 4,
      totalTokens: (messages.reduce((sum, m) => sum + m.content.length / 4, 0) + mockContent.length / 4),
    },
  };
}

function localMockEmbed(texts: string[]): EmbedResponse {
  const dimensions = 1536;
  const embeddings = texts.map(() =>
    Array.from({ length: dimensions }, () => Math.random() * 2 - 1)
  );

  return {
    embeddings,
    dimensions,
  };
}
