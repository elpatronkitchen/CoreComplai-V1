import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttestationReceipt {
  id: string;
  userId: string;
  userName: string;
  status: 'Pending' | 'Attested' | 'Declined';
  attestedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  remindedAt?: string;
}

export interface AttestationCampaign {
  id: string;
  policyId: string;
  policyCode: string;
  policyTitle: string;
  audienceRoles: string[];
  audienceScope: 'All' | 'Location' | 'Department';
  scopeValue?: string;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  receipts: AttestationReceipt[];
  status: 'Active' | 'Completed' | 'Expired';
}

interface AttestationState {
  campaigns: AttestationCampaign[];
  
  // Actions
  createCampaign: (campaign: AttestationCampaign) => void;
  updateCampaign: (id: string, updates: Partial<AttestationCampaign>) => void;
  deleteCampaign: (id: string) => void;
  
  // Receipts
  attestReceipt: (campaignId: string, userId: string) => void;
  declineReceipt: (campaignId: string, userId: string, reason: string) => void;
  sendReminder: (campaignId: string, userId: string) => void;
  sendBulkReminders: (campaignId: string) => void;
  
  // Query
  getCampaignsByPolicy: (policyId: string) => AttestationCampaign[];
  getPendingReceipts: (campaignId: string) => AttestationReceipt[];
}

export const useAttestationStore = create<AttestationState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      
      createCampaign: (campaign) => set((state) => ({
        campaigns: [...state.campaigns, campaign]
      })),
      
      updateCampaign: (id, updates) => set((state) => ({
        campaigns: state.campaigns.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      
      deleteCampaign: (id) => set((state) => ({
        campaigns: state.campaigns.filter(c => c.id !== id)
      })),
      
      attestReceipt: (campaignId, userId) => set((state) => ({
        campaigns: state.campaigns.map(c =>
          c.id === campaignId
            ? {
                ...c,
                receipts: c.receipts.map(r =>
                  r.userId === userId
                    ? { ...r, status: 'Attested' as const, attestedAt: new Date().toISOString() }
                    : r
                )
              }
            : c
        )
      })),
      
      declineReceipt: (campaignId, userId, reason) => set((state) => ({
        campaigns: state.campaigns.map(c =>
          c.id === campaignId
            ? {
                ...c,
                receipts: c.receipts.map(r =>
                  r.userId === userId
                    ? {
                        ...r,
                        status: 'Declined' as const,
                        declinedAt: new Date().toISOString(),
                        declineReason: reason
                      }
                    : r
                )
              }
            : c
        )
      })),
      
      sendReminder: (campaignId, userId) => set((state) => ({
        campaigns: state.campaigns.map(c =>
          c.id === campaignId
            ? {
                ...c,
                receipts: c.receipts.map(r =>
                  r.userId === userId && r.status === 'Pending'
                    ? { ...r, remindedAt: new Date().toISOString() }
                    : r
                )
              }
            : c
        )
      })),
      
      sendBulkReminders: (campaignId) => set((state) => ({
        campaigns: state.campaigns.map(c =>
          c.id === campaignId
            ? {
                ...c,
                receipts: c.receipts.map(r =>
                  r.status === 'Pending'
                    ? { ...r, remindedAt: new Date().toISOString() }
                    : r
                )
              }
            : c
        )
      })),
      
      getCampaignsByPolicy: (policyId) => {
        return get().campaigns.filter(c => c.policyId === policyId);
      },
      
      getPendingReceipts: (campaignId) => {
        const campaign = get().campaigns.find(c => c.id === campaignId);
        return campaign?.receipts.filter(r => r.status === 'Pending') || [];
      }
    }),
    {
      name: 'attestation-storage'
    }
  )
);
