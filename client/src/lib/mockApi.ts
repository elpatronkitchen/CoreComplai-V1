// Mock API layer with configurable latency and error simulation
export interface MockApiConfig {
  latencyMin: number;
  latencyMax: number;
  errorRate: number; // 0-1, probability of random errors
}

const defaultConfig: MockApiConfig = {
  latencyMin: 400,
  latencyMax: 900,
  errorRate: 0.05 // 5% chance of errors
};

let config = { ...defaultConfig };

export const setMockApiConfig = (newConfig: Partial<MockApiConfig>) => {
  config = { ...config, ...newConfig };
};

export const getMockApiConfig = () => ({ ...config });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getRandomDelay = () => {
  const min = config.latencyMin;
  const max = config.latencyMax;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shouldSimulateError = () => Math.random() < config.errorRate;

export class MockApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'MOCK_ERROR'
  ) {
    super(message);
    this.name = 'MockApiError';
  }
}

export const mockApiCall = async <T>(
  operation: () => T | Promise<T>,
  operationName: string = 'operation'
): Promise<T> => {
  // Add random delay
  await delay(getRandomDelay());
  
  // Simulate random errors
  if (shouldSimulateError()) {
    const errors = [
      new MockApiError('Network timeout', 408, 'TIMEOUT'),
      new MockApiError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE'),
      new MockApiError('Rate limit exceeded', 429, 'RATE_LIMIT'),
    ];
    throw errors[Math.floor(Math.random() * errors.length)];
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error(`Mock API error in ${operationName}:`, error);
    throw error;
  }
};

export const generateMockHash = (input: string): string => {
  // Simple mock SHA-256 hash generator for demo purposes
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(8).substring(0, 64);
};

// Mock file operations
export const mockFileUpload = async (file: File, metadata: any): Promise<{
  id: string;
  filename: string;
  hash: string;
  size: number;
}> => {
  return mockApiCall(async () => {
    // Simulate file processing
    const hash = generateMockHash(file.name + file.size + Date.now());
    
    return {
      id: Date.now().toString(),
      filename: file.name,
      hash,
      size: file.size,
    };
  }, 'fileUpload');
};

export const mockCsvExport = async (data: any[], filename: string): Promise<string> => {
  return mockApiCall(async () => {
    // Simple CSV generation
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    return filename;
  }, 'csvExport');
};

export const mockPdfExport = async (reportType: string): Promise<string> => {
  return mockApiCall(async () => {
    // Create a placeholder PDF file
    const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(CoreComply ${reportType} Report) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
395
%%EOF`;

    const blob = new Blob([content], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType.toLowerCase().replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    
    return link.download;
  }, 'pdfExport');
};