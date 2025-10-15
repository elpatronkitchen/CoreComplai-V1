import { create } from 'zustand';

export interface ManagementReview {
  id: string;
  reviewNumber: string;
  title: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  chairman: string;
  attendees: string[];
  
  inputs: {
    processPerformance?: string;
    customerFeedback?: string;
    ncCapaStatus?: string;
    auditResults?: string;
    supplierPerformance?: string;
    resourceAdequacy?: string;
    risksOpportunities?: string;
    improvementOpportunities?: string;
    previousActionStatus?: string;
  };
  
  decisions: ManagementDecision[];
  actions: ManagementAction[];
  
  minutesApproved: boolean;
  minutesApprovedBy?: string;
  minutesApprovedDate?: string;
  
  nextReviewDate?: string;
  evidenceIds: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagementDecision {
  id: string;
  category: 'Quality Objectives' | 'Resources' | 'Process Changes' | 'Policy' | 'Risk Treatment' | 'Other';
  decision: string;
  rationale?: string;
  owner?: string;
}

export interface ManagementAction {
  id: string;
  action: string;
  owner: string;
  targetDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Overdue';
  completedDate?: string;
  verification?: string;
}

interface ManagementReviewState {
  managementReviews: ManagementReview[];
  addMR: (mr: Omit<ManagementReview, 'id' | 'reviewNumber' | 'decisions' | 'actions' | 'createdAt' | 'updatedAt'>) => string;
  updateMR: (id: string, updates: Partial<ManagementReview>) => void;
  deleteMR: (id: string) => void;
  addDecision: (mrId: string, decision: Omit<ManagementDecision, 'id'>) => void;
  addAction: (mrId: string, action: Omit<ManagementAction, 'id'>) => void;
  updateAction: (mrId: string, actionId: string, updates: Partial<ManagementAction>) => void;
  approveMinutes: (id: string, approvedBy: string) => void;
  getMRById: (id: string) => ManagementReview | undefined;
}

export const useManagementReviewStore = create<ManagementReviewState>((set, get) => ({
  managementReviews: [],
  
  addMR: (mrData) => {
    const reviewNumber = `MR-${new Date().getFullYear()}-${String(get().managementReviews.length + 1).padStart(2, '0')}`;
    const newMR: ManagementReview = {
      ...mrData,
      id: `mr-${Date.now()}`,
      reviewNumber,
      decisions: [],
      actions: [],
      minutesApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      managementReviews: [...state.managementReviews, newMR],
    }));
    return newMR.id;
  },
  
  updateMR: (id, updates) => {
    set((state) => ({
      managementReviews: state.managementReviews.map((mr) =>
        mr.id === id ? { ...mr, ...updates, updatedAt: new Date() } : mr
      ),
    }));
  },
  
  deleteMR: (id) => {
    set((state) => ({
      managementReviews: state.managementReviews.filter((mr) => mr.id !== id),
    }));
  },
  
  addDecision: (mrId, decisionData) => {
    const decision: ManagementDecision = {
      ...decisionData,
      id: `dec-${Date.now()}`,
    };
    
    set((state) => ({
      managementReviews: state.managementReviews.map((mr) =>
        mr.id === mrId
          ? {
              ...mr,
              decisions: [...mr.decisions, decision],
              updatedAt: new Date(),
            }
          : mr
      ),
    }));
  },
  
  addAction: (mrId, actionData) => {
    const action: ManagementAction = {
      ...actionData,
      id: `mra-${Date.now()}`,
      status: 'Open',
    };
    
    set((state) => ({
      managementReviews: state.managementReviews.map((mr) =>
        mr.id === mrId
          ? {
              ...mr,
              actions: [...mr.actions, action],
              updatedAt: new Date(),
            }
          : mr
      ),
    }));
  },
  
  updateAction: (mrId, actionId, updates) => {
    set((state) => ({
      managementReviews: state.managementReviews.map((mr) => {
        if (mr.id === mrId) {
          return {
            ...mr,
            actions: mr.actions.map((a) =>
              a.id === actionId ? { ...a, ...updates } : a
            ),
            updatedAt: new Date(),
          };
        }
        return mr;
      }),
    }));
  },
  
  approveMinutes: (id, approvedBy) => {
    set((state) => ({
      managementReviews: state.managementReviews.map((mr) =>
        mr.id === id
          ? {
              ...mr,
              minutesApproved: true,
              minutesApprovedBy: approvedBy,
              minutesApprovedDate: new Date().toISOString().split('T')[0],
              updatedAt: new Date(),
            }
          : mr
      ),
    }));
  },
  
  getMRById: (id) => {
    return get().managementReviews.find((mr) => mr.id === id);
  },
}));
