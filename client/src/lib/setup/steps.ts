export type SetupStepKey =
  | 'integrations'        // connect M365/Entra, Payroll, HRIS, Accounting, Super
  | 'companyProfile'      // entities/ABNs, sites/states, awards footprint
  | 'people'              // synced users → Key Personnel (roles below)
  | 'rasci'               // adopt Key Personnel into default R/A/S/C/I by control domain
  | 'obligationsSeed'     // seed APGF obligations; show coverage
  | 'timetable'           // build statutory calendar (PAYG/BAS, SG, STP finalisation, payroll tax, WC, PLSL)
  | 'evidenceDiscovery'   // auto-collect STP receipts, SuperStream confirms, payslip samples, BAS, etc.
  | 'review'              // summary; optional trigger of Comprehensive Payroll Audit
;

export type SetupStep = {
  key: SetupStepKey;
  title: string;
  description: string;
  routeToScreen: string;       // deep-link into native screen
  complete: () => boolean;      // read from stores
  hardBlock?: boolean;          // keep false for all steps (we never hard block)
  dependsOn?: SetupStepKey[];   // for nudges (not blocking)
  manualFallback?: string;      // description of manual option
};

export type RoleKey =
  | 'CEO'
  | 'BoardChair'
  | 'AuditRiskChair'
  | 'ComplianceOwner'
  | 'PayrollOfficer'
  | 'PayrollManager'
  | 'HROfficer'
  | 'HRManager'
  | 'FinanceManager'
  | 'CFO'
  | 'ITSecurity'
  | 'InternalAudit'
  | 'ExternalAccountant';

export type RoleDirectory = Record<RoleKey, string | undefined>; // userId or undefined

export const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  CEO: 'Chief Executive Officer - Overall accountability',
  BoardChair: 'Board Chair - Governance oversight',
  AuditRiskChair: 'Audit & Risk Committee Chair - Risk and compliance oversight',
  ComplianceOwner: 'Compliance Owner - Primary compliance responsibility',
  PayrollOfficer: 'Payroll Officer - Day-to-day payroll processing',
  PayrollManager: 'Payroll Manager - Payroll function management',
  HROfficer: 'HR Officer - HR administration',
  HRManager: 'HR Manager - HR function management',
  FinanceManager: 'Finance Manager - Financial management',
  CFO: 'Chief Financial Officer - Financial oversight',
  ITSecurity: 'IT Security - Information security',
  InternalAudit: 'Internal Audit - Internal audit function',
  ExternalAccountant: 'External Accountant - External accounting support'
};

import { useIntegrationsStore } from './integrationsStore';
import { useCompanyStore } from './companyStore';
import { usePeopleStore } from './peopleStore';
import { useRasciStore } from './rasciStore';
import { useTimetableStore } from './timetableStore';
import { useEvidenceStore } from './evidenceStore';

// Dynamically check stores for completion
export const setupSteps: SetupStep[] = [
  {
    key: 'integrations',
    title: 'Connect Integrations',
    description: 'Connect M365/Entra, Payroll, HRIS, Accounting, and Super systems to auto-sync data',
    routeToScreen: '/integrations',
    complete: () => useIntegrationsStore.getState().isAnyConnected(),
    dependsOn: [],
    manualFallback: 'Upload CSV files manually for people, payroll, and accounting data'
  },
  {
    key: 'companyProfile',
    title: 'Company Profile',
    description: 'Set up entities, ABNs, sites/states, awards footprint, and select framework (APGF-MS)',
    routeToScreen: '/company-profile',
    complete: () => useCompanyStore.getState().isConfigured(),
    dependsOn: [],
    manualFallback: 'Enter company details manually'
  },
  {
    key: 'people',
    title: 'People & Key Personnel',
    description: 'Sync people from integrations and assign Key Personnel roles (CEO, Compliance Owner, etc.)',
    routeToScreen: '/people',
    complete: () => usePeopleStore.getState().hasKeyPersonnel(),
    dependsOn: ['integrations'],
    manualFallback: 'Add people manually and assign roles'
  },
  {
    key: 'rasci',
    title: 'Adopt RASCI',
    description: 'Apply Key Personnel assignments to default RASCI matrix for all control domains',
    routeToScreen: '/setup?step=rasci',
    complete: () => useRasciStore.getState().adopted,
    dependsOn: ['people'],
    manualFallback: 'Configure RASCI manually for each control'
  },
  {
    key: 'obligationsSeed',
    title: 'Seed Obligations',
    description: 'Load APGF-MS obligations based on your framework selection and footprint',
    routeToScreen: '/obligations',
    complete: () => {
      // Check if obligations exist in the obligations store (from existing system)
      // For now, this will be considered complete if framework is selected
      return !!useCompanyStore.getState().selectedFramework;
    },
    dependsOn: ['companyProfile'],
    manualFallback: 'Import obligations from CSV'
  },
  {
    key: 'timetable',
    title: 'Statutory Timetable',
    description: 'Generate compliance calendar with BAS, PAYG, SG, payroll tax, and other statutory deadlines',
    routeToScreen: '/calendar',
    complete: () => useTimetableStore.getState().isConfigured(),
    dependsOn: ['companyProfile', 'obligationsSeed'],
    manualFallback: 'Add key dates manually'
  },
  {
    key: 'evidenceDiscovery',
    title: 'Evidence Discovery',
    description: 'Auto-collect evidence from integrations (STP, SuperStream, BAS, payslips) and match to obligations',
    routeToScreen: '/setup?step=evidenceDiscovery',
    complete: () => useEvidenceStore.getState().hasEvidence(),
    dependsOn: ['integrations', 'obligationsSeed'],
    manualFallback: 'Upload evidence files manually'
  },
  {
    key: 'review',
    title: 'Review & Finish',
    description: 'Review setup completion and optionally start Comprehensive Payroll Audit',
    routeToScreen: '/setup?step=review',
    complete: () => false, // Always false - this is the final review step
    dependsOn: ['companyProfile', 'people', 'obligationsSeed'],
    manualFallback: undefined
  }
];

export function getStep(key: SetupStepKey): SetupStep | undefined {
  return setupSteps.find(s => s.key === key);
}

export function getStepIndex(key: SetupStepKey): number {
  return setupSteps.findIndex(s => s.key === key);
}

export function calculateCompletion(): number {
  const completableSteps = setupSteps.filter(s => s.key !== 'review');
  const completedCount = completableSteps.filter(s => s.complete()).length;
  return Math.round((completedCount / completableSteps.length) * 100);
}
