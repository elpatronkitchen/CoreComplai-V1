// Provider configuration - single source of truth for Azure vs Local
import type { AzureConfig } from '../types/azure';

function getConfig(): AzureConfig {
  return {
    stackProvider: (process.env.STACK_PROVIDER as any) || 'local',
    authProvider: (process.env.AUTH_PROVIDER as any) || 'mock',
    ragBackend: (process.env.RAG_BACKEND as any) || 'local',
    region: process.env.REGION || 'Australia East',
  };
}

export const config = getConfig();

export const isAzure = config.stackProvider === 'azure';
export const isLocal = config.stackProvider === 'local';
