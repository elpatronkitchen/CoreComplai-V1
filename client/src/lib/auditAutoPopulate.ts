import { EvidenceArtifact, AuditItem } from '@/store/auditSlice';

// Mock integration adapters
export async function fetchStpReceipts(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `stp-${Date.now()}-1`,
      title: `STP Pay Event Receipt - ${period.from} to ${period.to}`,
      type: 'integration',
      integration: 'STP',
      tags: ['STP', 'pay-event', 'ATO'],
      obligationIds: ['OBL-ATO-003'],
      controlRefs: ['6.1'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'Automated STP Phase 2 pay event submission receipt'
    },
    {
      id: `stp-${Date.now()}-2`,
      title: `STP Finalisation Declaration - FY${new Date(period.to).getFullYear()}`,
      type: 'integration',
      integration: 'STP',
      tags: ['STP', 'finalisation', 'ATO'],
      obligationIds: ['OBL-ATO-003'],
      controlRefs: ['6.1'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'STP finalisation lodged with ATO'
    }
  ];
}

export async function fetchSuperStream(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `super-${Date.now()}`,
      title: `SuperStream Contribution File - ${period.from}`,
      type: 'integration',
      integration: 'SuperStream',
      tags: ['SuperStream', 'SG', 'superannuation'],
      obligationIds: ['OBL-SUP-001', 'OBL-SUP-003'],
      controlRefs: ['6.3'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'SuperStream contribution lodgement confirmation'
    }
  ];
}

export async function fetchBas(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `bas-${Date.now()}`,
      title: `BAS PAYG-W Lodgement - ${period.from}`,
      type: 'integration',
      integration: 'BAS',
      tags: ['BAS', 'PAYG-W', 'withholding', 'ATO'],
      obligationIds: ['OBL-ATO-001'],
      controlRefs: ['6.5'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'Business Activity Statement lodged with PAYG-W'
    }
  ];
}

export async function fetchPayrollTaxReturns(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  const states = ['NSW', 'VIC', 'QLD'];
  return states.map((state, index) => ({
    id: `ptx-${Date.now()}-${index}`,
    title: `${state} Payroll Tax Return - ${period.from}`,
    type: 'integration',
    integration: 'PayrollTax',
    tags: ['payroll-tax', state, 'state-revenue'],
    obligationIds: [`OBL-PTX-00${index + 1}`],
    controlRefs: ['6.7'],
    period,
    createdAt: new Date().toISOString(),
    notes: `${state} payroll tax monthly return`
  }));
}

export async function fetchWorkersComp(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `wc-${Date.now()}`,
      title: `Workers Comp Wage Declaration - ${period.from}`,
      type: 'integration',
      integration: 'WorkersComp',
      tags: ['workers-comp', 'wage-declaration', 'insurance'],
      obligationIds: ['OBL-WC-001'],
      controlRefs: ['6.8'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'Workers compensation wage declaration submitted'
    }
  ];
}

export async function fetchLslReturns(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `lsl-${Date.now()}`,
      title: `Portable LSL Return - ${period.from}`,
      type: 'integration',
      integration: 'LSL',
      tags: ['LSL', 'portable', 'long-service-leave'],
      obligationIds: ['OBL-PLSL-001'],
      controlRefs: ['5.11', '5.13'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'Portable long service leave quarterly return'
    }
  ];
}

export async function fetchVevoLogs(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `vevo-${Date.now()}`,
      title: `VEVO Check Log - ${period.from} to ${period.to}`,
      type: 'integration',
      integration: 'VEVO',
      tags: ['VEVO', 'right-to-work', 'visa-check'],
      obligationIds: ['OBL-VEVO-001'],
      controlRefs: ['5.2'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'Automated VEVO visa verification checks'
    }
  ];
}

export async function fetchStapledChecks(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `stapled-${Date.now()}`,
      title: `Stapled Super Search Log - ${period.from} to ${period.to}`,
      type: 'integration',
      integration: 'Stapled',
      tags: ['stapled-super', 'ATO', 'superannuation'],
      obligationIds: ['OBL-SUP-002'],
      controlRefs: ['5.6'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'ATO stapled superannuation fund searches'
    }
  ];
}

export async function fetchPayslipSamples(period: { from: string; to: string }): Promise<EvidenceArtifact[]> {
  return [
    {
      id: `payslip-${Date.now()}`,
      title: `Payslip Samples & Issuance Report - ${period.from} to ${period.to}`,
      type: 'integration',
      integration: 'Payslip',
      tags: ['payslip', 'record-keeping', 'compliance'],
      obligationIds: ['OBL-FW-004', 'OBL-FW-005'],
      controlRefs: ['5.8', '7.2'],
      period,
      createdAt: new Date().toISOString(),
      notes: 'Payslip template samples and issuance timestamp report'
    }
  ];
}

// Confidence scoring heuristics
export function calculateConfidence(
  artifact: EvidenceArtifact,
  auditItem: AuditItem
): number {
  let score = 0;

  // +0.50 exact obligationId or controlRef match
  const hasObligationMatch = artifact.obligationIds?.some(id => 
    auditItem.obligationIds.includes(id)
  );
  const hasControlMatch = artifact.controlRefs?.some(ref => 
    auditItem.controlRefs.includes(ref)
  );
  if (hasObligationMatch || hasControlMatch) {
    score += 0.50;
  }

  // +0.20 expectedEvidence term match in title/tags
  const evidenceTerms = auditItem.expectedEvidence
    .flatMap(e => e.toLowerCase().split(/\s+/))
    .filter(term => term.length > 3);
  
  const artifactText = [
    artifact.title.toLowerCase(),
    ...artifact.tags.map(t => t.toLowerCase())
  ].join(' ');

  const termMatches = evidenceTerms.filter(term => 
    artifactText.includes(term)
  ).length;
  
  if (termMatches > 0) {
    score += Math.min(0.20, termMatches * 0.05);
  }

  // +0.15 period overlap
  if (artifact.period && auditItem.due) {
    const artifactEnd = new Date(artifact.period.to);
    const itemDue = new Date(auditItem.due);
    if (artifactEnd <= itemDue) {
      score += 0.15;
    }
  }

  // +0.10 correct integration source type
  const integrationKeywords: Record<string, string[]> = {
    'STP': ['stp', 'phase 2', 'ato', 'finalisation'],
    'SuperStream': ['superstream', 'sg', 'super', 'clearing house'],
    'BAS': ['bas', 'payg-w', 'withholding'],
    'PayrollTax': ['payroll tax', 'state revenue'],
    'WorkersComp': ['workers comp', 'wage declaration'],
    'LSL': ['lsl', 'long service', 'portable'],
    'VEVO': ['vevo', 'right to work', 'visa'],
    'Stapled': ['stapled', 'super', 'ato'],
    'Payslip': ['payslip', 'record keeping']
  };

  if (artifact.integration) {
    const keywords = integrationKeywords[artifact.integration] || [];
    const itemText = [
      auditItem.title.toLowerCase(),
      auditItem.description.toLowerCase()
    ].join(' ');
    
    const hasKeywordMatch = keywords.some(kw => itemText.includes(kw));
    if (hasKeywordMatch) {
      score += 0.10;
    }
  }

  // +0.05 newest file preference
  const artifactAge = Date.now() - new Date(artifact.createdAt).getTime();
  const daysSinceCreation = artifactAge / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 30) {
    score += 0.05;
  }

  return Math.min(score, 1.0);
}

// Main auto-population function
export async function autoPopulateAuditChecklist(
  auditItems: AuditItem[],
  period: { from: string; to: string },
  existingArtifacts: EvidenceArtifact[] = []
): Promise<{ items: AuditItem[]; artifacts: EvidenceArtifact[] }> {
  
  // Fetch evidence from all integrations
  const [
    stpReceipts,
    superStream,
    bas,
    payrollTax,
    workersComp,
    lsl,
    vevo,
    stapled,
    payslips
  ] = await Promise.all([
    fetchStpReceipts(period),
    fetchSuperStream(period),
    fetchBas(period),
    fetchPayrollTaxReturns(period),
    fetchWorkersComp(period),
    fetchLslReturns(period),
    fetchVevoLogs(period),
    fetchStapledChecks(period),
    fetchPayslipSamples(period)
  ]);

  const allArtifacts = [
    ...existingArtifacts,
    ...stpReceipts,
    ...superStream,
    ...bas,
    ...payrollTax,
    ...workersComp,
    ...lsl,
    ...vevo,
    ...stapled,
    ...payslips
  ];

  // Match artifacts to items and calculate confidence
  const populatedItems = auditItems.map(item => {
    const scoredArtifacts = allArtifacts
      .map(artifact => {
        const confidence = calculateConfidence(artifact, item);
        return {
          ...artifact,
          confidence
        };
      })
      .filter(artifact => artifact.confidence && artifact.confidence > 0.3)
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

    const hasHighConfidence = scoredArtifacts.some(a => (a.confidence || 0) >= 0.75);
    const status = hasHighConfidence 
      ? 'Auto-Populated' as const
      : scoredArtifacts.length > 0 
      ? 'Needs Review' as const
      : 'Unstarted' as const;

    const coverageScore = Math.min(
      Math.floor((scoredArtifacts.length / Math.max(item.expectedEvidence.length, 1)) * 100),
      100
    );

    return {
      ...item,
      autoArtifacts: scoredArtifacts,
      status,
      coverageScore
    };
  });

  return {
    items: populatedItems,
    artifacts: allArtifacts
  };
}
