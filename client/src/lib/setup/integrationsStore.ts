import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IntegrationKey = 'm365' | 'payroll' | 'hris' | 'accounting' | 'super';

export type IntegrationConnection = {
  connected: boolean;
  connectedAt?: Date;
  tenantId?: string;
  displayName?: string;
  error?: string;
};

interface IntegrationsState {
  connections: Record<IntegrationKey, IntegrationConnection>;
  
  // Actions
  connect: (key: IntegrationKey, tenantId?: string, displayName?: string) => void;
  disconnect: (key: IntegrationKey) => void;
  setError: (key: IntegrationKey, error: string) => void;
  isAnyConnected: () => boolean;
}

const defaultConnection: IntegrationConnection = {
  connected: false
};

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set, get) => ({
      connections: {
        m365: { ...defaultConnection },
        payroll: { ...defaultConnection },
        hris: { ...defaultConnection },
        accounting: { ...defaultConnection },
        super: { ...defaultConnection }
      },
      
      connect: (key, tenantId, displayName) => {
        set(state => ({
          connections: {
            ...state.connections,
            [key]: {
              connected: true,
              connectedAt: new Date(),
              tenantId,
              displayName,
              error: undefined
            }
          }
        }));
      },
      
      disconnect: (key) => {
        set(state => ({
          connections: {
            ...state.connections,
            [key]: { ...defaultConnection }
          }
        }));
      },
      
      setError: (key, error) => {
        set(state => ({
          connections: {
            ...state.connections,
            [key]: {
              ...state.connections[key],
              error
            }
          }
        }));
      },
      
      isAnyConnected: () => {
        return Object.values(get().connections).some(c => c.connected);
      }
    }),
    {
      name: 'corecomply-integrations'
    }
  )
);
