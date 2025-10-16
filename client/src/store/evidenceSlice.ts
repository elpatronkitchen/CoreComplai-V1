// Evidence Store - manages evidence artifacts and matching
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EvidenceArtifact, EvidenceMatch } from '../../../lib/types/azure';

interface EvidenceState {
  artifacts: EvidenceArtifact[];
  
  // Actions
  addArtifact: (artifact: Omit<EvidenceArtifact, 'id' | 'uploadedAt' | 'matches' | 'status' | 'redacted'>) => void;
  updateArtifact: (id: string, updates: Partial<EvidenceArtifact>) => void;
  addMatch: (artifactId: string, match: EvidenceMatch) => void;
  acceptMatch: (artifactId: string, matchId: string) => void;
  rejectMatch: (artifactId: string, matchId: string) => void;
  deleteArtifact: (id: string) => void;
  getCoverageScore: (obligationIds: string[]) => number;
}

export const useEvidenceStore = create<EvidenceState>()(
  persist(
    (set, get) => ({
      artifacts: [],

      addArtifact: (artifact) => {
        const newArtifact: EvidenceArtifact = {
          ...artifact,
          id: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uploadedAt: new Date().toISOString(),
          matches: [],
          status: 'pending',
          redacted: true, // Default to redacted for safety
        };
        
        set((state) => ({
          artifacts: [...state.artifacts, newArtifact],
        }));
      },

      updateArtifact: (id, updates) => {
        set((state) => ({
          artifacts: state.artifacts.map((artifact) =>
            artifact.id === id ? { ...artifact, ...updates } : artifact
          ),
        }));
      },

      addMatch: (artifactId, match) => {
        set((state) => ({
          artifacts: state.artifacts.map((artifact) =>
            artifact.id === artifactId
              ? { ...artifact, matches: [...artifact.matches, match] }
              : artifact
          ),
        }));
      },

      acceptMatch: (artifactId, matchId) => {
        const state = get();
        const artifact = state.artifacts.find((a) => a.id === artifactId);
        
        if (artifact) {
          // Auto-accept if confidence >= 0.75
          const match = artifact.matches.find((m) => m.id === matchId);
          if (match && match.confidence >= 0.75) {
            state.updateArtifact(artifactId, { status: 'accepted' });
          }
        }
      },

      rejectMatch: (artifactId, matchId) => {
        set((state) => ({
          artifacts: state.artifacts.map((artifact) =>
            artifact.id === artifactId
              ? {
                  ...artifact,
                  matches: artifact.matches.filter((m) => m.id !== matchId),
                  status: 'rejected',
                }
              : artifact
          ),
        }));
      },

      deleteArtifact: (id) => {
        set((state) => ({
          artifacts: state.artifacts.filter((artifact) => artifact.id !== id),
        }));
      },

      getCoverageScore: (obligationIds) => {
        const state = get();
        const acceptedArtifacts = state.artifacts.filter(
          (a) => a.status === 'accepted'
        );
        
        const coveredObligations = new Set<string>();
        acceptedArtifacts.forEach((artifact) => {
          artifact.matches.forEach((match) => {
            if (match.type === 'obligation' && match.confidence >= 0.75) {
              coveredObligations.add(match.id);
            }
          });
        });
        
        const coverage = obligationIds.filter((id) =>
          coveredObligations.has(id)
        ).length;
        
        return obligationIds.length > 0 ? coverage / obligationIds.length : 0;
      },
    }),
    {
      name: 'evidence-storage',
    }
  )
);
