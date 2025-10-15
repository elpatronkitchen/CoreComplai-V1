// Storage Provider - abstracts Azure Blob Storage and local mock
import type { StorageProvider } from '../types/azure';
import { config } from './config';

// Mock implementation for clickable prototype
class MockStorageProvider implements StorageProvider {
  async getUploadUrl(filename: string, contentType: string): Promise<{ url: string; sasToken: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock SAS URL
    const mockUrl = `/api/mock-upload/${encodeURIComponent(filename)}`;
    const mockSasToken = `sv=2024-01-01&ss=b&srt=co&sp=rwac&se=${new Date(Date.now() + 20 * 60 * 1000).toISOString()}&st=${new Date().toISOString()}&sig=MOCK_SIGNATURE`;
    
    return {
      url: mockUrl,
      sasToken: mockSasToken
    };
  }

  async getReadUrl(filename: string, ttlMinutes: number): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const expiryTime = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
    return `/api/mock-download/${encodeURIComponent(filename)}?expires=${expiryTime}`;
  }

  async deleteFile(filename: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`[Mock Storage] Deleted file: ${filename}`);
  }
}

// Azure Blob Storage implementation (stub)
class AzureBlobStorageProvider implements StorageProvider {
  async getUploadUrl(filename: string, contentType: string): Promise<{ url: string; sasToken: string }> {
    // Will be implemented when Azure packages are installed
    // Uses user-delegation SAS for enhanced security
    throw new Error('Azure Blob Storage provider requires @azure packages - use STACK_PROVIDER=local for prototype');
  }

  async getReadUrl(filename: string, ttlMinutes: number): Promise<string> {
    throw new Error('Azure Blob Storage provider requires @azure packages - use STACK_PROVIDER=local for prototype');
  }

  async deleteFile(filename: string): Promise<void> {
    throw new Error('Azure Blob Storage provider requires @azure packages - use STACK_PROVIDER=local for prototype');
  }
}

// Provider factory
function createStorageProvider(): StorageProvider {
  if (config.stackProvider === 'azure') {
    return new AzureBlobStorageProvider();
  }
  return new MockStorageProvider();
}

export const storageProvider = createStorageProvider();
