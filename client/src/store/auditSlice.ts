import { create } from 'zustand';

export type EvidenceArtifact = {
  id: string;
  title: string;
  type: 'file' | 'link' | 'record' | 'integration';
  pathOrUrl?: string;
  integration?: 'STP' | 'SuperStream' | 'BAS' | 'PayrollTax' | 'WorkersComp' | 'LSL' | 'VEVO' | 'Stapled' | 'Payslip' | 'Other';
  tags: string[];
  obligationIds?: string[];
  controlRefs?: string[];
  period?: { from: string; to: string };
  createdAt: string;
  confidence?: number;
  notes?: string;
};

export type AuditItem = {
  id: string;
  title: string;
  description: string;
  obligationIds: string[];
  controlRefs: string[];
  expectedEvidence: string[];
  autoArtifacts: EvidenceArtifact[];
  status: 'Unstarted' | 'Auto-Populated' | 'Needs Review' | 'Ready' | 'Complete' | 'N/A';
  rasci: {
    R?: string;
    A?: string;
    S?: string[];
    C?: string[];
    I?: string[];
  };
  taskId?: string;
  due?: string;
  reviewers?: string[];
  comments?: string;
  coverageScore: number;
  section?: string;
};

export type AuditChecklist = {
  id: string;
  name: 'Comprehensive Payroll Audit';
  scope: 'Entity' | 'BusinessUnit' | 'Site' | 'EmployeeSubset';
  period: { from: string; to: string };
  items: AuditItem[];
  status: 'Draft' | 'In Progress' | 'Ready for Signoff' | 'Closed';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
};

export type Task = {
  id: string;
  title: string;
  auditItemId: string;
  evidenceRequired: string[];
  assignee: string;
  approver: string;
  watchers: string[];
  due: string;
  status: 'Open' | 'Blocked' | 'In Review' | 'Done';
  slaDays: number;
  escalatesTo?: string;
  createdAt: string;
  completedAt?: string;
  sodWarning?: boolean;
};

interface AuditState {
  checklists: AuditChecklist[];
  evidenceArtifacts: EvidenceArtifact[];
  addChecklist: (checklist: AuditChecklist) => void;
  updateChecklist: (id: string, updates: Partial<AuditChecklist>) => void;
  deleteChecklist: (id: string) => void;
  updateAuditItem: (checklistId: string, itemId: string, updates: Partial<AuditItem>) => void;
  addAuditItem: (checklistId: string, item: AuditItem) => void;
  deleteAuditItem: (checklistId: string, itemId: string) => void;
  addEvidenceArtifact: (artifact: EvidenceArtifact) => void;
  attachArtifactToItem: (checklistId: string, itemId: string, artifactId: string) => void;
  detachArtifactFromItem: (checklistId: string, itemId: string, artifactId: string) => void;
  updateItemCoverage: (checklistId: string, itemId: string) => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  checklists: [],
  evidenceArtifacts: [],

  addChecklist: (checklist) => set((state) => ({
    checklists: [...state.checklists, checklist]
  })),

  updateChecklist: (id, updates) => set((state) => ({
    checklists: state.checklists.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    )
  })),

  deleteChecklist: (id) => set((state) => ({
    checklists: state.checklists.filter(c => c.id !== id)
  })),

  updateAuditItem: (checklistId, itemId, updates) => set((state) => ({
    checklists: state.checklists.map(c =>
      c.id === checklistId
        ? {
            ...c,
            items: c.items.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
            updatedAt: new Date().toISOString()
          }
        : c
    )
  })),

  addAuditItem: (checklistId, item) => set((state) => ({
    checklists: state.checklists.map(c =>
      c.id === checklistId
        ? { ...c, items: [...c.items, item], updatedAt: new Date().toISOString() }
        : c
    )
  })),

  deleteAuditItem: (checklistId, itemId) => set((state) => ({
    checklists: state.checklists.map(c =>
      c.id === checklistId
        ? {
            ...c,
            items: c.items.filter(i => i.id !== itemId),
            updatedAt: new Date().toISOString()
          }
        : c
    )
  })),

  addEvidenceArtifact: (artifact) => set((state) => ({
    evidenceArtifacts: [...state.evidenceArtifacts, artifact]
  })),

  attachArtifactToItem: (checklistId, itemId, artifactId) => set((state) => {
    const artifact = state.evidenceArtifacts.find(a => a.id === artifactId);
    if (!artifact) return state;

    return {
      checklists: state.checklists.map(c =>
        c.id === checklistId
          ? {
              ...c,
              items: c.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      autoArtifacts: [...item.autoArtifacts, artifact]
                    }
                  : item
              )
            }
          : c
      )
    };
  }),

  detachArtifactFromItem: (checklistId, itemId, artifactId) => set((state) => ({
    checklists: state.checklists.map(c =>
      c.id === checklistId
        ? {
            ...c,
            items: c.items.map(item =>
              item.id === itemId
                ? {
                    ...item,
                    autoArtifacts: item.autoArtifacts.filter(a => a.id !== artifactId)
                  }
                : item
            )
          }
        : c
    )
  })),

  updateItemCoverage: (checklistId, itemId) => set((state) => {
    const checklist = state.checklists.find(c => c.id === checklistId);
    const item = checklist?.items.find(i => i.id === itemId);
    
    if (!item) return state;

    const coverageScore = Math.min(
      Math.floor((item.autoArtifacts.length / Math.max(item.expectedEvidence.length, 1)) * 100),
      100
    );

    const status = item.autoArtifacts.some(a => (a.confidence || 0) >= 0.75)
      ? 'Auto-Populated'
      : item.autoArtifacts.length > 0
      ? 'Needs Review'
      : 'Unstarted';

    return {
      checklists: state.checklists.map(c =>
        c.id === checklistId
          ? {
              ...c,
              items: c.items.map(i =>
                i.id === itemId
                  ? { ...i, coverageScore, status }
                  : i
              )
            }
          : c
      )
    };
  })
}));
