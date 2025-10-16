/**
 * Secret Provider
 * 
 * Azure Mode (STACK_PROVIDER=azure):
 *   Uses Azure Key Vault via DefaultAzureCredential (Managed Identity in prod)
 *   Requires: @azure/keyvault-secrets, @azure/identity
 *   Env: AZURE_KEYVAULT_URI
 * 
 * Local Mode (STACK_PROVIDER=local):
 *   Reads from process.env
 */

interface SecretCache {
  value: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, SecretCache>();
const stackProvider = process.env.STACK_PROVIDER || "local";

// Azure SDK client (lazy-loaded)
let azureSecretClient: any = null;

async function initAzureClient() {
  if (azureSecretClient) return azureSecretClient;

  try {
    // Dynamic import to handle optional Azure SDK dependency
    const { SecretClient } = await import("@azure/keyvault-secrets");
    const { DefaultAzureCredential } = await import("@azure/identity");

    const vaultUri = process.env.AZURE_KEYVAULT_URI;
    if (!vaultUri) {
      throw new Error("AZURE_KEYVAULT_URI environment variable is required for Azure secret provider");
    }

    const credential = new DefaultAzureCredential();
    azureSecretClient = new SecretClient(vaultUri, credential);
    return azureSecretClient;
  } catch (error) {
    throw new Error(`Failed to initialize Azure Key Vault client: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getSecret(name: string): Promise<string> {
  // Check cache first
  const cachedValue = cache.get(name);
  if (cachedValue && cachedValue.expiresAt > Date.now()) {
    return cachedValue.value;
  }

  let value: string;

  if (stackProvider === "azure") {
    try {
      const client = await initAzureClient();
      const secret = await client.getSecret(name);
      
      if (!secret.value) {
        throw new Error(`Secret ${name} exists in Key Vault but has no value`);
      }
      
      value = secret.value;
    } catch (error) {
      throw new Error(`Failed to retrieve secret '${name}' from Azure Key Vault: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Local mode: read from environment
    value = process.env[name] || "";
    
    if (!value) {
      console.warn(`Secret '${name}' not found in environment variables`);
    }
  }

  // Cache the value
  cache.set(name, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return value;
}

export async function setSecret(name: string, value: string): Promise<void> {
  if (stackProvider === "azure") {
    try {
      const client = await initAzureClient();
      await client.setSecret(name, value);
      cache.delete(name);
    } catch (error) {
      throw new Error(`Failed to set secret '${name}' in Azure Key Vault: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Local mode: update process.env (note: this only affects current process)
    process.env[name] = value;
    cache.delete(name);
  }
}

export function clearSecretCache(): void {
  cache.clear();
}
