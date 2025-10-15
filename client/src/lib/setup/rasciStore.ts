import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleDirectory, RoleKey } from './steps';

export type RasciRole = 'R' | 'A' | 'S' | 'C' | 'I';

export type RasciAssignment = {
  roleKey: RoleKey;
  rasciRole: RasciRole;
};

export type ControlDomain =
  | 'payroll-processing'
  | 'tax-compliance'
  | 'superannuation'
  | 'leave-management'
  | 'time-attendance'
  | 'employee-data'
  | 'access-control'
  | 'governance'
  | 'state-obligations'
  | 'quality-management'
  | 'financial-controls'
  | 'data-management';

interface RasciState {
  // Default RASCI assignments by control domain
  defaultAssignments: Record<string, RasciAssignment[]>; // controlRef -> assignments
  adopted: boolean;
  adoptedAt?: Date;
  
  // Actions
  adoptFromKeyPersonnel: (roleDirectory: RoleDirectory) => void;
  rasciFor: (controlRef: string) => { R: RoleKey[]; A: RoleKey[]; S: RoleKey[]; C: RoleKey[]; I: RoleKey[] };
  setControlRasci: (controlRef: string, assignments: RasciAssignment[]) => void;
  reset: () => void;
}

// Default RASCI templates by control domain
const getDefaultRasciTemplate = (domain: ControlDomain): Record<RoleKey, RasciRole[]> => {
  const templates: Record<ControlDomain, Record<string, RasciRole[]>> = {
    'payroll-processing': {
      PayrollOfficer: ['R'],
      PayrollManager: ['A'],
      HRManager: ['C'],
      FinanceManager: ['S'],
      ComplianceOwner: ['I']
    },
    'tax-compliance': {
      PayrollManager: ['R'],
      CFO: ['A'],
      ExternalAccountant: ['C'],
      ComplianceOwner: ['S']
    },
    'superannuation': {
      PayrollOfficer: ['R'],
      PayrollManager: ['A'],
      ExternalAccountant: ['C'],
      ComplianceOwner: ['S']
    },
    'leave-management': {
      HROfficer: ['R'],
      HRManager: ['A'],
      PayrollOfficer: ['S'],
      ComplianceOwner: ['I']
    },
    'time-attendance': {
      HROfficer: ['R'],
      HRManager: ['A'],
      PayrollManager: ['C']
    },
    'employee-data': {
      HROfficer: ['R'],
      HRManager: ['A'],
      ITSecurity: ['C'],
      ComplianceOwner: ['I']
    },
    'access-control': {
      ITSecurity: ['R', 'A'],
      HRManager: ['C'],
      ComplianceOwner: ['S']
    },
    'governance': {
      ComplianceOwner: ['R'],
      CEO: ['A'],
      BoardChair: ['C'],
      InternalAudit: ['I']
    },
    'state-obligations': {
      PayrollManager: ['R'],
      ComplianceOwner: ['A'],
      CFO: ['C'],
      ExternalAccountant: ['S']
    },
    'quality-management': {
      ComplianceOwner: ['R'],
      CEO: ['A'],
      InternalAudit: ['C']
    },
    'financial-controls': {
      FinanceManager: ['R'],
      CFO: ['A'],
      ComplianceOwner: ['C'],
      InternalAudit: ['I']
    },
    'data-management': {
      ITSecurity: ['R'],
      ComplianceOwner: ['A'],
      HRManager: ['C']
    }
  };
  
  return templates[domain] || {};
};

export const useRasciStore = create<RasciState>()(
  persist(
    (set, get) => ({
      defaultAssignments: {},
      adopted: false,
      adoptedAt: undefined,
      
      adoptFromKeyPersonnel: (roleDirectory) => {
        // Generate default RASCI assignments for all control domains
        const assignments: Record<string, RasciAssignment[]> = {};
        
        // Apply templates for each domain
        const domains: ControlDomain[] = [
          'payroll-processing',
          'tax-compliance',
          'superannuation',
          'leave-management',
          'time-attendance',
          'employee-data',
          'access-control',
          'governance',
          'state-obligations',
          'quality-management',
          'financial-controls',
          'data-management'
        ];
        
        domains.forEach(domain => {
          const template = getDefaultRasciTemplate(domain);
          const domainAssignments: RasciAssignment[] = [];
          
          Object.entries(template).forEach(([roleKey, rasciRoles]) => {
            // Only add if the role is assigned in the directory
            if (roleDirectory[roleKey as RoleKey]) {
              rasciRoles.forEach(rasciRole => {
                domainAssignments.push({
                  roleKey: roleKey as RoleKey,
                  rasciRole
                });
              });
            }
          });
          
          assignments[domain] = domainAssignments;
        });
        
        set({
          defaultAssignments: assignments,
          adopted: true,
          adoptedAt: new Date()
        });
      },
      
      rasciFor: (controlRef) => {
        const assignments = get().defaultAssignments[controlRef] || [];
        const result = { R: [], A: [], S: [], C: [], I: [] } as { R: RoleKey[]; A: RoleKey[]; S: RoleKey[]; C: RoleKey[]; I: RoleKey[] };
        
        assignments.forEach(assignment => {
          result[assignment.rasciRole].push(assignment.roleKey);
        });
        
        return result;
      },
      
      setControlRasci: (controlRef, assignments) => {
        set(state => ({
          defaultAssignments: {
            ...state.defaultAssignments,
            [controlRef]: assignments
          }
        }));
      },
      
      reset: () => {
        set({
          defaultAssignments: {},
          adopted: false,
          adoptedAt: undefined
        });
      }
    }),
    {
      name: 'corecomply-rasci'
    }
  )
);
