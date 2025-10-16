import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleKey, RoleDirectory } from './steps';
import type { User } from '@shared/schema';

interface PeopleState {
  syncedUsers: User[];
  keyPersonnel: RoleDirectory;
  
  // Actions
  setSyncedUsers: (users: User[]) => void;
  assignRole: (roleKey: RoleKey, userId: string) => void;
  unassignRole: (roleKey: RoleKey) => void;
  hasKeyPersonnel: () => boolean;
  getAssignedUser: (roleKey: RoleKey) => User | undefined;
}

export const usePeopleStore = create<PeopleState>()(
  persist(
    (set, get) => ({
      syncedUsers: [],
      keyPersonnel: {} as RoleDirectory,
      
      setSyncedUsers: (users) => {
        set({ syncedUsers: users });
      },
      
      assignRole: (roleKey, userId) => {
        set(state => ({
          keyPersonnel: {
            ...state.keyPersonnel,
            [roleKey]: userId
          }
        }));
      },
      
      unassignRole: (roleKey) => {
        set(state => {
          const newKeyPersonnel = { ...state.keyPersonnel };
          delete newKeyPersonnel[roleKey];
          return { keyPersonnel: newKeyPersonnel };
        });
      },
      
      hasKeyPersonnel: () => {
        const personnel = get().keyPersonnel;
        // Consider configured if at least CEO, Compliance Owner, and Payroll Manager are assigned
        return !!(personnel.CEO && personnel.ComplianceOwner && personnel.PayrollManager);
      },
      
      getAssignedUser: (roleKey) => {
        const userId = get().keyPersonnel[roleKey];
        if (!userId) return undefined;
        return get().syncedUsers.find(u => u.id === userId);
      }
    }),
    {
      name: 'corecomply-people'
    }
  )
);
