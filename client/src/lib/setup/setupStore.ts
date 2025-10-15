import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SetupStepKey } from './steps';
import { calculateCompletion } from './steps';

interface SetupState {
  completion: number;
  visited: Set<SetupStepKey>;
  lastStep?: SetupStepKey;
  
  // Actions
  visitStep: (step: SetupStepKey) => void;
  recalcCompletion: () => void;
  reset: () => void;
}

export const useSetupStore = create<SetupState>()(
  persist(
    (set, get) => ({
      completion: 0,
      visited: new Set(),
      lastStep: undefined,
      
      visitStep: (step) => {
        set(state => ({
          visited: new Set(Array.from(state.visited).concat(step)),
          lastStep: step
        }));
        get().recalcCompletion();
      },
      
      recalcCompletion: () => {
        const completion = calculateCompletion();
        set({ completion });
      },
      
      reset: () => {
        set({
          completion: 0,
          visited: new Set(),
          lastStep: undefined
        });
      }
    }),
    {
      name: 'corecomply-setup',
      partialize: (state) => ({
        completion: state.completion,
        visited: Array.from(state.visited),
        lastStep: state.lastStep
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Set
          state.visited = new Set(state.visited as any);
          state.recalcCompletion();
        }
      }
    }
  )
);
