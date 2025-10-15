import { getSecret } from "./secret.provider";
import { embed } from "./llm.provider";

const ragBackend = process.env.RAG_BACKEND || "local";

export interface SearchFilter {
  docType?: "policy" | "obligation" | "evidence" | "precedent";
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  docType: string;
  score: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
}

export async function search(
  query: string,
  k: number = 5,
  filters?: SearchFilter
): Promise<SearchResponse> {
  if (ragBackend === "azure-search") {
    return await azureAISearch(query, k, filters);
  } else {
    return localBM25Search(query, k, filters);
  }
}

async function azureAISearch(
  query: string,
  k: number,
  filters?: SearchFilter
): Promise<SearchResponse> {
  const endpoint = process.env.AZURE_SEARCH_ENDPOINT || "";
  const apiKey = await getSecret("AZURE_SEARCH_API_KEY");
  const indexName = process.env.AZURE_SEARCH_INDEX || "cc-rag";
  const apiVersion = process.env.AZURE_SEARCH_API_VERSION || "2024-07-01-Preview";

  const embedResult = await embed([query]);
  const queryVector = embedResult.embeddings[0];

  const url = `${endpoint}/indexes/${indexName}/docs/search?api-version=${apiVersion}`;

  let filterExpression = "";
  if (filters?.docType) {
    filterExpression = `docType eq '${filters.docType}'`;
  }
  if (filters?.dateFrom) {
    filterExpression += filterExpression ? " and " : "";
    filterExpression += `date ge ${filters.dateFrom}`;
  }
  if (filters?.dateTo) {
    filterExpression += filterExpression ? " and " : "";
    filterExpression += `date le ${filters.dateTo}`;
  }

  const requestBody: any = {
    search: query,
    top: k,
    vectorQueries: [
      {
        kind: "vector",
        vector: queryVector,
        fields: "embedding",
        k: k,
      },
    ],
    select: "id,title,content,docType,metadata",
  };

  if (filterExpression) {
    requestBody.filter = filterExpression;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Azure AI Search failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    results: data.value.map((item: any) => ({
      id: item.id,
      title: item.title,
      snippet: item.content?.substring(0, 200) || "",
      docType: item.docType,
      score: item["@search.score"] || 0,
      metadata: item.metadata || {},
    })),
    totalCount: data["@odata.count"] || data.value.length,
  };
}

function localBM25Search(
  query: string,
  k: number,
  filters?: SearchFilter
): SearchResponse {
  const corpus = [
    {
      id: "pol-pay-001",
      title: "Payroll Processing Policy",
      content:
        "Casual employees receive 25% loading. Fixed-term contracts require documented end date. Classifications must align with Modern Awards.",
      docType: "policy",
      metadata: { version: "2.1", owner: "CFO" },
    },
    {
      id: "obl-sg-001",
      title: "Superannuation Guarantee Contributions",
      content:
        "11.5% employer contribution on ordinary time earnings. Due 28 days after quarter end. Applies to employees earning $450+ per month.",
      docType: "obligation",
      metadata: { jurisdiction: "Commonwealth", frequency: "Quarterly" },
    },
    {
      id: "obl-stp-001",
      title: "Single Touch Payroll Reporting",
      content:
        "Report payroll on or before payday. STP Phase 2 includes employment type, cessation reason, child support deductions.",
      docType: "obligation",
      metadata: { jurisdiction: "Commonwealth", frequency: "Per pay run" },
    },
    {
      id: "obl-fwa-001",
      title: "Fair Work Information Statement",
      content:
        "Provide Fair Work Information Statement to new employees before or as soon as practicable after employment commences.",
      docType: "obligation",
      metadata: { jurisdiction: "Commonwealth" },
    },
    {
      id: "pol-tax-002",
      title: "Tax Compliance Policy",
      content:
        "PAYG withholding per ATO tax tables. STP Phase 2 compliance mandatory. Monthly BAS reporting required.",
      docType: "policy",
      metadata: { version: "1.3", owner: "Finance Manager" },
    },
    {
      id: "prec-001",
      title: "Payroll Officer Classification Precedent",
      content:
        "Permanent full-time payroll officer classified under Clerks Award Level 3 based on processing responsibilities and compliance oversight.",
      docType: "precedent",
      metadata: { date: "2024-06-15", reviewer: "Legal Counsel" },
    },
  ];

  const queryLower = query.toLowerCase();
  const scored = corpus
    .filter((doc) => {
      if (filters?.docType && doc.docType !== filters.docType) return false;
      return true;
    })
    .map((doc) => {
      const contentLower = (doc.title + " " + doc.content).toLowerCase();
      const queryTerms = queryLower.split(/\s+/);
      let score = 0;

      queryTerms.forEach((term) => {
        const count = (contentLower.match(new RegExp(term, "g")) || []).length;
        score += count * Math.log(corpus.length / (count + 1));
      });

      return {
        id: doc.id,
        title: doc.title,
        snippet: doc.content.substring(0, 200),
        docType: doc.docType,
        score,
        metadata: doc.metadata,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return {
    results: scored,
    totalCount: scored.length,
  };
}
