// Secrets Provider - abstracts Azure Key Vault and environment variables
import type { SecretProvider } from '../types/azure';
import { config } from './config';

// Mock implementation using environment variables
class EnvSecretProvider implements SecretProvider {
  async getSecret(name: string): Promise<string> {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Secret ${name} not found in environment variables`);
    }
    return value;
  }

  async setSecret(name: string, value: string): Promise<void> {
    // Cannot set env vars at runtime - this is for dev only
    console.log(`[Mock Secrets] Would set ${name} (not implemented in env provider)`);
  }
}

// Azure Key Vault implementation (stub)
class AzureKeyVaultProvider implements SecretProvider {
  private cache = new Map<string, { value: string; expiresAt: number }>();
  private cacheTTL = 10 * 60 * 1000; // 10 minutes

  async getSecret(name: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(name);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // Will be implemented when Azure packages are installed
    // Uses DefaultAzureCredential (Managed Identity in production)
    throw new Error('Azure Key Vault provider requires @azure packages - use STACK_PROVIDER=local for prototype');
  }

  async setSecret(name: string, value: string): Promise<void> {
    throw new Error('Azure Key Vault provider requires @azure packages - use STACK_PROVIDER=local for prototype');
  }
}

// Provider factory
function createSecretProvider(): SecretProvider {
  if (config.stackProvider === 'azure') {
    return new AzureKeyVaultProvider();
  }
  return new EnvSecretProvider();
}

export const secretProvider = createSecretProvider();
