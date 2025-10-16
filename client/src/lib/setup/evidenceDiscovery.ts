import type { Evidence, EvidenceSource } from './evidenceStore';
import { useEvidenceStore } from './evidenceStore';

export type Period = {
  start: Date;
  end: Date;
};

export type IntegrationAdapter = {
  source: EvidenceSource;
  name: string;
  fetch: (period: Period, footprint: { states: string[] }) => Promise<MockEvidence[]>;
};

type MockEvidence = {
  title: string;
  period: Period;
  tags: string[];
  integrationRef?: string;
};

// Mock integration adapters
export const integrationAdapters: IntegrationAdapter[] = [
  {
    source: 'STP',
    name: 'Single Touch Payroll',
    fetch: async (period, footprint) => {
      // Mock STP receipts
      return [
        {
          title: 'STP Phase 2 Submission Receipt',
          period,
          tags: ['STP', 'payroll', 'tax', 'ATO'],
          integrationRef: 'STP-20250101-001'
        },
        {
          title: 'STP Finalisation Declaration',
          period: { start: new Date(2024, 6, 1), end: new Date(2024, 6, 14) },
          tags: ['STP', 'finalisation', 'tax', 'ATO'],
          integrationRef: 'STP-FIN-2024'
        }
      ];
    }
  },
  {
    source: 'SuperStream',
    name: 'SuperStream Confirmations',
    fetch: async (period, footprint) => {
      return [
        {
          title: 'SuperStream Payment Confirmation Q1',
          period,
          tags: ['superannuation', 'SG', 'superstream'],
          integrationRef: 'SS-Q1-2025'
        },
        {
          title: 'SuperStream Payment Confirmation Q2',
          period: { start: new Date(2024, 9, 1), end: new Date(2024, 11, 31) },
          tags: ['superannuation', 'SG', 'superstream'],
          integrationRef: 'SS-Q2-2024'
        }
      ];
    }
  },
  {
    source: 'BAS',
    name: 'Business Activity Statement',
    fetch: async (period, footprint) => {
      return [
        {
          title: 'BAS Lodgement Q3 2024',
          period: { start: new Date(2024, 6, 1), end: new Date(2024, 8, 30) },
          tags: ['BAS', 'tax', 'GST', 'PAYG', 'ATO'],
          integrationRef: 'BAS-Q3-2024'
        },
        {
          title: 'BAS Lodgement Q4 2024',
          period: { start: new Date(2024, 9, 1), end: new Date(2024, 11, 31) },
          tags: ['BAS', 'tax', 'GST', 'PAYG', 'ATO'],
          integrationRef: 'BAS-Q4-2024'
        }
      ];
    }
  },
  {
    source: 'PayrollTax',
    name: 'State Payroll Tax',
    fetch: async (period, footprint) => {
      // Generate payroll tax records for each state in footprint
      return footprint.states.flatMap(state => [
        {
          title: `Payroll Tax Return ${state} - January`,
          period: { start: new Date(2025, 0, 1), end: new Date(2025, 0, 31) },
          tags: ['payroll-tax', state, 'state-obligation'],
          integrationRef: `PT-${state}-JAN-2025`
        },
        {
          title: `Payroll Tax Return ${state} - December`,
          period: { start: new Date(2024, 11, 1), end: new Date(2024, 11, 31) },
          tags: ['payroll-tax', state, 'state-obligation'],
          integrationRef: `PT-${state}-DEC-2024`
        }
      ]);
    }
  },
  {
    source: 'WorkersComp',
    name: 'Workers Compensation',
    fetch: async (period, footprint) => {
      return footprint.states.flatMap(state => [
        {
          title: `Workers Comp Policy ${state}`,
          period: { start: new Date(2024, 6, 1), end: new Date(2025, 5, 30) },
          tags: ['workers-comp', state, 'insurance', 'WHS'],
          integrationRef: `WC-${state}-2024-25`
        }
      ]);
    }
  },
  {
    source: 'LSL',
    name: 'Long Service Leave',
    fetch: async (period, footprint) => {
      // LSL is state-specific
      return footprint.states
        .filter(state => ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].includes(state))
        .map(state => ({
          title: `Long Service Leave Register ${state}`,
          period,
          tags: ['LSL', 'leave', state],
          integrationRef: `LSL-${state}-2024`
        }));
    }
  },
  {
    source: 'VEVO',
    name: 'Visa Entitlement Verification',
    fetch: async (period, footprint) => {
      return [
        {
          title: 'VEVO Visa Verification Report',
          period,
          tags: ['VEVO', 'visa', 'immigration', 'compliance'],
          integrationRef: 'VEVO-2025-Q1'
        }
      ];
    }
  },
  {
    source: 'Stapled',
    name: 'Stapled Super Fund',
    fetch: async (period, footprint) => {
      return [
        {
          title: 'Stapled Super Fund Request Records',
          period,
          tags: ['stapled', 'superannuation', 'SG', 'choice'],
          integrationRef: 'STAPLED-2024-2025'
        }
      ];
    }
  },
  {
    source: 'Payslip',
    name: 'Payslip Sample',
    fetch: async (period, footprint) => {
      return [
        {
          title: 'Payslip Sample - January 2025',
          period: { start: new Date(2025, 0, 1), end: new Date(2025, 0, 31) },
          tags: ['payslip', 'payroll', 'wages'],
          integrationRef: 'PAYSLIP-JAN-2025'
        },
        {
          title: 'Payslip Sample - December 2024',
          period: { start: new Date(2024, 11, 1), end: new Date(2024, 11, 31) },
          tags: ['payslip', 'payroll', 'wages'],
          integrationRef: 'PAYSLIP-DEC-2024'
        }
      ];
    }
  }
];

type Obligation = {
  id: string;
  title: string;
  controlRef?: string;
  tags: string[];
};

// Confidence scoring algorithm
export function calculateConfidence(
  evidence: MockEvidence,
  obligation: Obligation
): number {
  let score = 0;
  
  // +0.50: Obligation ID or controlRef match
  if (obligation.controlRef && evidence.tags.some(tag => 
    obligation.controlRef?.toLowerCase().includes(tag.toLowerCase())
  )) {
    score += 0.50;
  }
  
  // +0.20: Evidence term match (keyword/tag overlap)
  const evidenceTags = evidence.tags.map(t => t.toLowerCase());
  const obligationTags = obligation.tags.map(t => t.toLowerCase());
  const obligationTitle = obligation.title.toLowerCase();
  
  const tagMatches = evidenceTags.filter(tag => 
    obligationTags.includes(tag) || obligationTitle.includes(tag)
  ).length;
  
  if (tagMatches > 0) {
    score += Math.min(0.20, tagMatches * 0.05);
  }
  
  // +0.15: Period overlap
  const now = new Date();
  const isRecent = evidence.period.end >= new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  if (isRecent) {
    score += 0.15;
  }
  
  // +0.10: Integration type relevance
  const relevantSources: Record<string, string[]> = {
    'STP': ['payroll', 'tax', 'ato'],
    'SuperStream': ['superannuation', 'sg'],
    'BAS': ['bas', 'gst', 'payg', 'tax'],
    'PayrollTax': ['payroll-tax', 'state'],
    'WorkersComp': ['workers-comp', 'whs', 'insurance'],
    'LSL': ['lsl', 'leave'],
    'VEVO': ['vevo', 'visa', 'immigration'],
    'Stapled': ['stapled', 'choice', 'superannuation'],
    'Payslip': ['payslip', 'payroll', 'wages']
  };
  
  const sourceKeywords = relevantSources[evidence.integrationRef?.split('-')[0] || ''] || [];
  const sourceMatch = sourceKeywords.some(keyword =>
    evidenceTags.includes(keyword) || obligationTags.includes(keyword)
  );
  
  if (sourceMatch) {
    score += 0.10;
  }
  
  // +0.05: Recency bonus (within last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  if (evidence.period.end >= threeMonthsAgo) {
    score += 0.05;
  }
  
  return Math.min(1, score);
}

// Match evidence to obligations
export function matchEvidenceToObligations(
  mockEvidence: MockEvidence[],
  obligations: Obligation[]
): Array<Evidence & { matches: Array<{ obligationId: string; confidence: number }> }> {
  const results: Array<Evidence & { matches: Array<{ obligationId: string; confidence: number }> }> = [];
  
  mockEvidence.forEach(mock => {
    const matches: Array<{ obligationId: string; confidence: number }> = [];
    
    obligations.forEach(obligation => {
      const confidence = calculateConfidence(mock, obligation);
      
      // Only include matches with confidence >= 0.50 (50%)
      if (confidence >= 0.50) {
        matches.push({
          obligationId: obligation.id,
          confidence
        });
      }
    });
    
    // Sort matches by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Create evidence artifact
    const evidence: Evidence & { matches: typeof matches } = {
      id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: mock.title,
      source: 'Manual', // Will be set by adapter
      period: mock.period,
      uploadedAt: new Date(),
      integrationRef: mock.integrationRef,
      obligationRefs: matches.slice(0, 3).map(m => m.obligationId), // Top 3 matches
      confidence: matches.length > 0 ? matches[0].confidence : undefined,
      accepted: undefined,
      tags: mock.tags,
      matches
    };
    
    results.push(evidence);
  });
  
  return results;
}

// Run evidence discovery across all adapters
export async function runEvidenceDiscovery(
  period: Period,
  footprint: { states: string[] },
  obligations: Obligation[]
): Promise<void> {
  const { addArtifact } = useEvidenceStore.getState();
  
  // Run all adapters in parallel
  const results = await Promise.all(
    integrationAdapters.map(async adapter => {
      try {
        const mockEvidences = await adapter.fetch(period, footprint);
        const matched = matchEvidenceToObligations(mockEvidences, obligations);
        
        // Set correct source
        matched.forEach(evidence => {
          evidence.source = adapter.source;
        });
        
        return matched;
      } catch (error) {
        console.error(`Error fetching from ${adapter.name}:`, error);
        return [];
      }
    })
  );
  
  // Flatten results and add to store
  results.flat().forEach(evidence => {
    addArtifact(evidence);
  });
}

// Helper to get sample obligations for testing
export function getSampleObligations(): Obligation[] {
  return [
    {
      id: 'STP-001',
      title: 'Single Touch Payroll Phase 2 Reporting',
      controlRef: 'STP-001',
      tags: ['STP', 'payroll', 'tax', 'ATO', 'reporting']
    },
    {
      id: 'SG-001',
      title: 'Superannuation Guarantee Contributions',
      controlRef: 'SG-001',
      tags: ['superannuation', 'SG', 'contributions', 'payroll']
    },
    {
      id: 'BAS-001',
      title: 'Business Activity Statement Lodgement',
      controlRef: 'BAS-001',
      tags: ['BAS', 'tax', 'GST', 'PAYG', 'ATO']
    },
    {
      id: 'PT-001',
      title: 'State Payroll Tax Compliance',
      controlRef: 'PT-001',
      tags: ['payroll-tax', 'state-obligation', 'tax']
    },
    {
      id: 'WC-001',
      title: 'Workers Compensation Insurance',
      controlRef: 'WC-001',
      tags: ['workers-comp', 'insurance', 'WHS', 'state-obligation']
    },
    {
      id: 'LSL-001',
      title: 'Long Service Leave Register',
      controlRef: 'LSL-001',
      tags: ['LSL', 'leave', 'entitlements', 'state-obligation']
    },
    {
      id: 'VEVO-001',
      title: 'Visa Entitlement Verification',
      controlRef: 'VEVO-001',
      tags: ['VEVO', 'visa', 'immigration', 'compliance']
    },
    {
      id: 'CHOICE-001',
      title: 'Choice of Superannuation Fund',
      controlRef: 'CHOICE-001',
      tags: ['stapled', 'choice', 'superannuation', 'SG']
    },
    {
      id: 'PAYSLIP-001',
      title: 'Payslip Requirements Compliance',
      controlRef: 'PAYSLIP-001',
      tags: ['payslip', 'payroll', 'wages', 'fair-work']
    }
  ];
}
