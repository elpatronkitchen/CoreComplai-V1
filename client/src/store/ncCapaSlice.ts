import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Nonconformity {
  id: string;
  ncNumber: string;
  title: string;
  description: string;
  source: 'Internal Audit' | 'External Audit' | 'Customer Complaint' | 'Process Monitoring' | 'Management Review' | 'Other';
  severity: 'Minor' | 'Major' | 'Critical';
  status: 'Open' | 'Containment' | 'RCA' | 'Corrective Action' | 'Effectiveness Check' | 'Closed';
  detectedDate: string;
  detectedBy: string;
  process?: string;
  product?: string;
  
  containment?: {
    action: string;
    implementedBy: string;
    implementedDate: string;
    effectiveness: 'Effective' | 'Not Effective' | 'Pending';
  };
  
  rootCauseAnalysis?: {
    method: '5-Whys' | 'Fishbone' | 'Fault Tree' | 'Other';
    why1?: string;
    why2?: string;
    why3?: string;
    why4?: string;
    why5?: string;
    rootCause: string;
    analysisDate: string;
    analysedBy: string;
  };
  
  correctiveActions: CorrectiveAction[];
  linkedClauses: string[];
  linkedControls: string[];
  linkedObligations: string[];
  evidenceIds: string[];
  
  effectivenessCheck?: {
    plannedDate: string;
    actualDate?: string;
    checkedBy?: string;
    result?: 'Effective' | 'Not Effective' | 'Partially Effective';
    comments?: string;
  };
  
  closedDate?: string;
  closedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CorrectiveAction {
  id: string;
  ncId: string;
  action: string;
  owner: string;
  targetDate: string;
  completedDate?: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Overdue';
  verification?: string;
}

interface NCCapaState {
  nonconformities: Nonconformity[];
  addNC: (nc: Omit<Nonconformity, 'id' | 'ncNumber' | 'correctiveActions' | 'createdAt' | 'updatedAt'>) => string;
  updateNC: (id: string, updates: Partial<Nonconformity>) => void;
  deleteNC: (id: string) => void;
  addContainment: (id: string, containment: Nonconformity['containment']) => void;
  addRCA: (id: string, rca: Nonconformity['rootCauseAnalysis']) => void;
  addCorrectiveAction: (ncId: string, action: Omit<CorrectiveAction, 'id' | 'ncId'>) => void;
  updateCorrectiveAction: (ncId: string, actionId: string, updates: Partial<CorrectiveAction>) => void;
  addEffectivenessCheck: (id: string, check: Nonconformity['effectivenessCheck']) => void;
  closeNC: (id: string, closedBy: string) => void;
  getNCById: (id: string) => Nonconformity | undefined;
}

export const useNCStore = create<NCCapaState>()(
  persist(
    (set, get) => ({
  nonconformities: [],
  
  addNC: (ncData) => {
    const ncNumber = `NC-${String(get().nonconformities.length + 1).padStart(4, '0')}`;
    const newNC: Nonconformity = {
      ...ncData,
      id: `nc-${Date.now()}`,
      ncNumber,
      correctiveActions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      nonconformities: [...state.nonconformities, newNC],
    }));
    return newNC.id;
  },
  
  updateNC: (id, updates) => {
    set((state) => ({
      nonconformities: state.nonconformities.map((nc) =>
        nc.id === id ? { ...nc, ...updates, updatedAt: new Date() } : nc
      ),
    }));
  },
  
  deleteNC: (id) => {
    set((state) => ({
      nonconformities: state.nonconformities.filter((nc) => nc.id !== id),
    }));
  },
  
  addContainment: (id, containment) => {
    set((state) => ({
      nonconformities: state.nonconformities.map((nc) =>
        nc.id === id
          ? { ...nc, containment, status: 'Containment', updatedAt: new Date() }
          : nc
      ),
    }));
  },
  
  addRCA: (id, rca) => {
    set((state) => ({
      nonconformities: state.nonconformities.map((nc) =>
        nc.id === id
          ? { ...nc, rootCauseAnalysis: rca, status: 'RCA', updatedAt: new Date() }
          : nc
      ),
    }));
  },
  
  addCorrectiveAction: (ncId, actionData) => {
    const action: CorrectiveAction = {
      ...actionData,
      id: `ca-${Date.now()}`,
      ncId,
      status: 'Open',
    };
    
    set((state) => ({
      nonconformities: state.nonconformities.map((nc) =>
        nc.id === ncId
          ? {
              ...nc,
              correctiveActions: [...nc.correctiveActions, action],
              status: 'Corrective Action',
              updatedAt: new Date(),
            }
          : nc
      ),
    }));
  },
  
  updateCorrectiveAction: (ncId, actionId, updates) => {
    set((state) => ({
      nonconformities: state.nonconformities.map((nc) => {
        if (nc.id === ncId) {
          return {
            ...nc,
            correctiveActions: nc.correctiveActions.map((ca) =>
              ca.id === actionId ? { ...ca, ...updates } : ca
            ),
            updatedAt: new Date(),
          };
        }
        return nc;
      }),
    }));
  },
  
  addEffectivenessCheck: (id, check) => {
    set((state) => ({
      nonconformities: state.nonconformities.map((nc) =>
        nc.id === id
          ? {
              ...nc,
              effectivenessCheck: check,
              status: 'Effectiveness Check',
              updatedAt: new Date(),
            }
          : nc
      ),
    }));
  },
  
  closeNC: (id, closedBy) => {
    set((state) => ({
      nonconformities: state.nonconformities.map((nc) =>
        nc.id === id
          ? {
              ...nc,
              status: 'Closed',
              closedDate: new Date().toISOString().split('T')[0],
              closedBy,
              updatedAt: new Date(),
            }
          : nc
      ),
    }));
  },
  
  getNCById: (id) => {
    return get().nonconformities.find((nc) => nc.id === id);
  },
    }),
    {
      name: 'nc-capa-storage',
    }
  )
);
