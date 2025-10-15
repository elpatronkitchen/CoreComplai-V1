import { AuditItem, Task } from '@/store/auditSlice';
import { nanoid } from 'nanoid';

interface RasciRole {
  R?: string;
  A?: string;
  S?: string[];
  C?: string[];
  I?: string[];
}

// Helper to get business days in the future
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

// Check for Segregation of Duties violations
function checkSodViolation(assignee: string | undefined, approver: string | undefined): boolean {
  if (!assignee || !approver) return false;
  return assignee === approver;
}

// Determine assignee from RASCI (prefer R, fallback to first available)
function determineAssignee(rasci: RasciRole): string {
  if (rasci.R) return rasci.R;
  if (rasci.A) return rasci.A;
  if (rasci.S && rasci.S.length > 0) return rasci.S[0];
  if (rasci.C && rasci.C.length > 0) return rasci.C[0];
  if (rasci.I && rasci.I.length > 0) return rasci.I[0];
  return 'Unassigned';
}

// Determine approver from RASCI
function determineApprover(rasci: RasciRole): string {
  if (rasci.A) return rasci.A;
  if (rasci.S && rasci.S.length > 0) return rasci.S[0];
  return 'Compliance Owner';
}

// Suggest alternate approver if SoD violation detected
function suggestAlternateApprover(rasci: RasciRole, assignee: string): string {
  // Try S roles first
  if (rasci.S && rasci.S.length > 0) {
    const alternate = rasci.S.find(s => s !== assignee);
    if (alternate) return alternate;
  }
  
  // Try C roles next
  if (rasci.C && rasci.C.length > 0) {
    const alternate = rasci.C.find(c => c !== assignee);
    if (alternate) return alternate;
  }
  
  // Fallback
  return 'Compliance Owner';
}

// Determine watchers from RASCI
function determineWatchers(rasci: RasciRole, assignee: string, approver: string): string[] {
  const watchers = new Set<string>();
  
  if (rasci.S) rasci.S.forEach(s => watchers.add(s));
  if (rasci.C) rasci.C.forEach(c => watchers.add(c));
  if (rasci.I) rasci.I.forEach(i => watchers.add(i));
  
  // Remove assignee and approver from watchers
  watchers.delete(assignee);
  watchers.delete(approver);
  
  return Array.from(watchers);
}

// Calculate due date based on statutory timetable or default
export function calculateDueDate(
  auditItem: AuditItem,
  auditWindowEnd: Date,
  createdAt: Date = new Date()
): Date {
  const obligationStatutoryDates: Record<string, number> = {
    'OBL-SUP-001': 28, // SG quarterly due - 28 days after quarter end
    'OBL-SUP-003': 28, // SuperStream - 28 days after quarter end
    'OBL-ATO-001': 21, // BAS - 21 days after quarter end (monthly/quarterly)
    'OBL-ATO-003': 14, // STP finalisation - 14 July
    'OBL-PTX-001': 7,  // Payroll tax - 7 days after month end
    'OBL-PTX-002': 7,
    'OBL-PTX-003': 7,
    'OBL-PTX-004': 7,
    'OBL-PTX-005': 7,
    'OBL-PTX-006': 7,
    'OBL-PTX-007': 7,
    'OBL-PTX-008': 7
  };

  // Check if any obligation has a statutory date
  for (const oblId of auditItem.obligationIds) {
    if (obligationStatutoryDates[oblId]) {
      const daysBeforeDue = obligationStatutoryDates[oblId];
      // Provide 3 business days buffer before statutory due date
      const statutoryDue = addBusinessDays(auditWindowEnd, daysBeforeDue - 3);
      return statutoryDue;
    }
  }

  // Default: 10 business days from creation
  return addBusinessDays(createdAt, 10);
}

// Generate task from audit item
export function generateTaskFromAuditItem(
  auditItem: AuditItem,
  auditWindowEnd: Date,
  createdBy: string = 'System'
): Task {
  const assignee = determineAssignee(auditItem.rasci);
  let approver = determineApprover(auditItem.rasci);
  
  // Check for SoD violation
  const hasSodViolation = checkSodViolation(assignee, approver);
  if (hasSodViolation) {
    approver = suggestAlternateApprover(auditItem.rasci, assignee);
  }
  
  const watchers = determineWatchers(auditItem.rasci, assignee, approver);
  const dueDate = calculateDueDate(auditItem, auditWindowEnd);
  
  // Calculate SLA days (business days between now and due date)
  const now = new Date();
  let slaDays = 0;
  let currentDate = new Date(now);
  while (currentDate < dueDate) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      slaDays++;
    }
  }
  
  // Determine evidence still required (missing from auto-artifacts)
  const collectedEvidence = auditItem.autoArtifacts.map(a => a.title.toLowerCase());
  const missingEvidence = auditItem.expectedEvidence.filter(expected => {
    const expectedLower = expected.toLowerCase();
    return !collectedEvidence.some(collected => 
      collected.includes(expectedLower) || expectedLower.includes(collected)
    );
  });

  const task: Task = {
    id: nanoid(),
    title: `[Audit] Provide evidence: ${auditItem.title}`,
    auditItemId: auditItem.id,
    evidenceRequired: missingEvidence.length > 0 ? missingEvidence : auditItem.expectedEvidence,
    assignee,
    approver,
    watchers,
    due: dueDate.toISOString(),
    status: 'Open',
    slaDays,
    escalatesTo: auditItem.rasci.A || 'Compliance Owner',
    createdAt: new Date().toISOString(),
    sodWarning: hasSodViolation
  };
  
  // Log SoD warning for auditability
  if (hasSodViolation) {
    console.warn(`SoD violation detected for audit item ${auditItem.id}: ${assignee} is both assignee and approver. Alternate approver assigned: ${approver}`);
  }

  return task;
}

// Bulk generate tasks for all items with coverage < 100%
export function generateTasksForAudit(
  auditItems: AuditItem[],
  auditWindowEnd: Date,
  createdBy: string = 'System'
): Task[] {
  return auditItems
    .filter(item => item.coverageScore < 100 && item.status !== 'N/A')
    .map(item => generateTaskFromAuditItem(item, auditWindowEnd, createdBy));
}
