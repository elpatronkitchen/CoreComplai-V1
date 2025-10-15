import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EvidenceSource = 'STP' | 'SuperStream' | 'BAS' | 'PayrollTax' | 'WorkersComp' | 'LSL' | 'VEVO' | 'Stapled' | 'Payslip' | 'Manual';

export type Evidence = {
  id: string;
  title: string;
  source: EvidenceSource;
  period: { start: Date; end: Date };
  uploadedAt: Date;
  fileUrl?: string;
  integrationRef?: string;
  obligationRefs: string[];
  confidence?: number; // 0-1 score from auto-matching
  accepted?: boolean;
  tags: string[];
};

interface EvidenceState {
  artifacts: Evidence[];
  
  // Actions
  addArtifact: (artifact: Evidence) => void;
  removeArtifact: (id: string) => void;
  acceptArtifact: (id: string) => void;
  rejectArtifact: (id: string) => void;
  setConfidence: (id: string, confidence: number) => void;
  linkToObligation: (evidenceId: string, obligationRef: string) => void;
  hasEvidence: () => boolean;
}

export const useEvidenceStore = create<EvidenceState>()(
  persist(
    (set, get) => ({
      artifacts: [],
      
      addArtifact: (artifact) => {
        set(state => ({
          artifacts: [...state.artifacts, artifact]
        }));
      },
      
      removeArtifact: (id) => {
        set(state => ({
          artifacts: state.artifacts.filter(a => a.id !== id)
        }));
      },
      
      acceptArtifact: (id) => {
        set(state => ({
          artifacts: state.artifacts.map(a =>
            a.id === id ? { ...a, accepted: true } : a
          )
        }));
      },
      
      rejectArtifact: (id) => {
        set(state => ({
          artifacts: state.artifacts.map(a =>
            a.id === id ? { ...a, accepted: false } : a
          )
        }));
      },
      
      setConfidence: (id, confidence) => {
        set(state => ({
          artifacts: state.artifacts.map(a =>
            a.id === id ? { ...a, confidence } : a
          )
        }));
      },
      
      linkToObligation: (evidenceId, obligationRef) => {
        set(state => ({
          artifacts: state.artifacts.map(a =>
            a.id === evidenceId
              ? { ...a, obligationRefs: Array.from(new Set([...a.obligationRefs, obligationRef])) }
              : a
          )
        }));
      },
      
      hasEvidence: () => {
        return get().artifacts.length > 0;
      }
    }),
    {
      name: 'corecomply-evidence'
    }
  )
);
