import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SodRule {
  id: string;
  name: string;
  description: string;
  conflictingRoles: string[];
  framework?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation?: string;
}

export interface SodViolation {
  ruleId: string;
  personId: string;
  conflictingRoles: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  remediation?: string;
}

interface SodState {
  rules: SodRule[];
  
  // Actions
  addRule: (rule: Omit<SodRule, 'id'>) => string;
  removeRule: (id: string) => void;
  checkAssignment: (personId: string, newRole: string, existingRoles: string[]) => SodViolation[];
  checkPerson: (personId: string, roles: string[]) => SodViolation[];
  checkAllPeople: (people: Array<{ id: string; roles: string[] }>) => SodViolation[];
  initializeDefaultRules: () => void;
}

export const useSodStore = create<SodState>()(
  persist(
    (set, get) => ({
      rules: [],
      
      addRule: (rule) => {
        const id = `sod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newRule: SodRule = { ...rule, id };
        set(state => ({ rules: [...state.rules, newRule] }));
        return id;
      },
      
      removeRule: (id) => {
        set(state => ({ rules: state.rules.filter(r => r.id !== id) }));
      },
      
      checkAssignment: (personId, newRole, existingRoles) => {
        const allRoles = [...existingRoles, newRole];
        return get().checkPerson(personId, allRoles);
      },
      
      checkPerson: (personId, roles) => {
        const violations: SodViolation[] = [];
        const rules = get().rules;
        
        for (const rule of rules) {
          const hasConflict = rule.conflictingRoles.filter(role => roles.includes(role));
          if (hasConflict.length >= 2) {
            violations.push({
              ruleId: rule.id,
              personId,
              conflictingRoles: hasConflict,
              severity: rule.severity,
              message: `${rule.name}: Person has conflicting roles ${hasConflict.join(', ')}`,
              remediation: rule.remediation
            });
          }
        }
        
        return violations;
      },
      
      checkAllPeople: (people) => {
        const violations: SodViolation[] = [];
        for (const person of people) {
          violations.push(...get().checkPerson(person.id, person.roles));
        }
        return violations;
      },
      
      initializeDefaultRules: () => {
        const defaultRules: Omit<SodRule, 'id'>[] = [
          {
            name: 'Payroll Preparation vs Approval',
            description: 'Same person cannot both prepare and approve payroll',
            conflictingRoles: ['PayrollOfficer', 'PayrollManager'],
            framework: 'APGF',
            severity: 'critical',
            remediation: 'Assign PayrollManager role to a different person'
          },
          {
            name: 'Payment Authorization vs Reconciliation',
            description: 'Payment authorizer cannot perform reconciliation',
            conflictingRoles: ['PayrollManager', 'FinanceManager'],
            framework: 'APGF',
            severity: 'high',
            remediation: 'Separate payment authorization from reconciliation duties'
          },
          {
            name: 'Incident Response vs Approval',
            description: 'Incident manager cannot approve their own incident reports',
            conflictingRoles: ['IncidentManager', 'ISMSManager'],
            framework: 'ISO27001',
            severity: 'high',
            remediation: 'Assign separate approver for incident reports'
          },
          {
            name: 'Risk Owner vs Risk Approver',
            description: 'Risk owner cannot approve their own risk assessments',
            conflictingRoles: ['RiskOwner', 'ISMSManager'],
            framework: 'ISO27001',
            severity: 'medium',
            remediation: 'Assign different person as ISMS Manager for approval'
          },
          {
            name: 'Audit vs Operations',
            description: 'Internal auditor cannot audit their own operational area',
            conflictingRoles: ['InternalAuditLead', 'QualityManager'],
            framework: 'ISO9001',
            severity: 'critical',
            remediation: 'Ensure auditor independence from audited areas'
          },
          {
            name: 'NC/CAPA Creation vs Approval',
            description: 'Person raising NC cannot approve their own CAPA',
            conflictingRoles: ['NonconformityCAPAOwner', 'QualityManager'],
            framework: 'ISO9001',
            severity: 'medium',
            remediation: 'Separate NC/CAPA creation from approval'
          }
        ];
        
        // Only initialize if no rules exist
        if (get().rules.length === 0) {
          defaultRules.forEach(rule => get().addRule(rule));
        }
      }
    }),
    {
      name: 'corecomply-sod'
    }
  )
);
