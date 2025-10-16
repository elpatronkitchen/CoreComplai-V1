import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PolicyStatus = 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived';
export type PolicyCategory = 'Core' | 'Complex';
export type ReviewFrequency = 'Quarterly' | 'Annual' | 'On Change';

export interface PolicyVersion {
  id: string;
  v: string;
  author: string;
  createdAt: string;
  bodyMd: string;
  changeNote: string;
}

export interface PolicyException {
  id: string;
  reason: string;
  approvedBy?: string;
  approvedAt?: string;
  expiresAt?: string;
  scope: string;
  mitigation: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Expired';
}

export interface Policy {
  id: string;
  code: string;
  title: string;
  category: PolicyCategory;
  status: PolicyStatus;
  ownerId: string;
  rasci: {
    R?: string;
    A?: string;
    S?: string[];
    C?: string[];
    I?: string[];
  };
  review: {
    frequency: ReviewFrequency;
    nextReviewISO: string;
  };
  content: {
    currentVersionId: string;
    versions: PolicyVersion[];
  };
  mappings: {
    obligationIds: string[];
    controlRefs: string[];
  };
  evidenceIds: string[];
  exceptions: PolicyException[];
  attestations: {
    lastCampaignId?: string;
    requiredRoles: string[];
    scope: 'All' | 'Location' | 'Department';
  };
  createdAt: string;
  updatedAt: string;
}

interface PoliciesState {
  policies: Policy[];
  selectedPolicyId: string | null;
  
  // Actions
  setPolicies: (policies: Policy[]) => void;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  deletePolicy: (id: string) => void;
  setSelectedPolicy: (id: string | null) => void;
  
  // Version management
  addVersion: (policyId: string, version: PolicyVersion) => void;
  setCurrentVersion: (policyId: string, versionId: string) => void;
  
  // Status transitions
  submitForReview: (policyId: string) => void;
  approve: (policyId: string, approverId: string) => void;
  requestChanges: (policyId: string, reason: string) => void;
  publish: (policyId: string) => void;
  archive: (policyId: string) => void;
  unarchive: (policyId: string) => void;
  
  // Exceptions
  addException: (policyId: string, exception: PolicyException) => void;
  updateException: (policyId: string, exceptionId: string, updates: Partial<PolicyException>) => void;
  
  // Mappings
  addMapping: (policyId: string, type: 'obligation' | 'control', id: string) => void;
  removeMapping: (policyId: string, type: 'obligation' | 'control', id: string) => void;
  linkEvidence: (policyId: string, evidenceId: string) => void;
  unlinkEvidence: (policyId: string, evidenceId: string) => void;
}

export const usePoliciesStore = create<PoliciesState>()(
  persist(
    (set, get) => ({
      policies: [],
      selectedPolicyId: null,
      
      setPolicies: (policies) => set({ policies }),
      
      addPolicy: (policy) => set((state) => ({
        policies: [...state.policies, policy]
      })),
      
      updatePolicy: (id, updates) => set((state) => ({
        policies: state.policies.map(p => 
          p.id === id 
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        )
      })),
      
      deletePolicy: (id) => set((state) => ({
        policies: state.policies.filter(p => p.id !== id)
      })),
      
      setSelectedPolicy: (id) => set({ selectedPolicyId: id }),
      
      addVersion: (policyId, version) => set((state) => ({
        policies: state.policies.map(p => 
          p.id === policyId
            ? {
                ...p,
                content: {
                  ...p.content,
                  versions: [...p.content.versions, version],
                  currentVersionId: version.id
                },
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
      
      setCurrentVersion: (policyId, versionId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? {
                ...p,
                content: { ...p.content, currentVersionId: versionId },
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
      
      submitForReview: (policyId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? { ...p, status: 'In Review', updatedAt: new Date().toISOString() }
            : p
        )
      })),
      
      approve: (policyId, approverId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? { ...p, status: 'Approved', updatedAt: new Date().toISOString() }
            : p
        )
      })),
      
      requestChanges: (policyId, reason) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? { ...p, status: 'Draft', updatedAt: new Date().toISOString() }
            : p
        )
      })),
      
      publish: (policyId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId && p.status === 'Approved'
            ? { ...p, status: 'Published', updatedAt: new Date().toISOString() }
            : p
        )
      })),
      
      archive: (policyId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? { ...p, status: 'Archived', updatedAt: new Date().toISOString() }
            : p
        )
      })),
      
      unarchive: (policyId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId && p.status === 'Archived'
            ? { ...p, status: 'Draft', updatedAt: new Date().toISOString() }
            : p
        )
      })),
      
      addException: (policyId, exception) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? {
                ...p,
                exceptions: [...p.exceptions, exception],
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
      
      updateException: (policyId, exceptionId, updates) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? {
                ...p,
                exceptions: p.exceptions.map(e =>
                  e.id === exceptionId ? { ...e, ...updates } : e
                ),
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
      
      addMapping: (policyId, type, id) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? {
                ...p,
                mappings: type === 'obligation'
                  ? { ...p.mappings, obligationIds: [...p.mappings.obligationIds, id] }
                  : { ...p.mappings, controlRefs: [...p.mappings.controlRefs, id] },
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
      
      removeMapping: (policyId, type, id) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? {
                ...p,
                mappings: type === 'obligation'
                  ? { ...p.mappings, obligationIds: p.mappings.obligationIds.filter(oid => oid !== id) }
                  : { ...p.mappings, controlRefs: p.mappings.controlRefs.filter(ref => ref !== id) },
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
      
      linkEvidence: (policyId, evidenceId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? {
                ...p,
                evidenceIds: [...p.evidenceIds, evidenceId],
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
      
      unlinkEvidence: (policyId, evidenceId) => set((state) => ({
        policies: state.policies.map(p =>
          p.id === policyId
            ? {
                ...p,
                evidenceIds: p.evidenceIds.filter(eid => eid !== evidenceId),
                updatedAt: new Date().toISOString()
              }
            : p
        )
      })),
    }),
    {
      name: 'policies-storage'
    }
  )
);
