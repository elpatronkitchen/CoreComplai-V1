import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { llmProvider } from "../lib/providers/llm";
import { ragProvider } from "../lib/providers/rag";
import { storageProvider } from "../lib/providers/storage";
import classificationRoutes from "./src/routes/classification";
import evidenceRoutes from "./src/routes/evidence";
import auditRoutes from "./src/routes/audit";
import aiRoutes from "./src/routes/ai";
import searchRoutes from "./src/routes/search";
import reviewRoutes from "./src/routes/review";
import { insertROIValidationSchema } from "@shared/schema";

// Mock data generators
function generateClassificationCandidates(duties: string[]): any[] {
  const dutyText = duties.join(' ').toLowerCase();
  
  const candidates = [
    {
      id: 'cand-001',
      awardKey: 'clerks-private-sector-2020',
      level: 'Level 3',
      title: 'Administrative Officer Level 3',
      confidence: 0.87,
      snippets: [
        'Performs routine administrative duties with limited supervision',
        'Uses standard office software packages',
        'Maintains records and databases'
      ],
      vetoes: [],
      priorDecisions: ['PA-2024-001: Similar role classified as Level 3']
    },
    {
      id: 'cand-002',
      awardKey: 'clerks-private-sector-2020',
      level: 'Level 4',
      title: 'Administrative Officer Level 4',
      confidence: 0.65,
      snippets: [
        'May supervise Level 2-3 employees',
        'Exercise initiative in administrative tasks'
      ],
      vetoes: ['Insufficient supervision indicators'],
      priorDecisions: []
    }
  ];

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

function generateReviewItems(): any[] {
  return [
    {
      id: 'rev-001',
      type: 'classification',
      title: 'Senior Payroll Officer Classification Review',
      description: 'AI classification suggests Level 5, requires compliance review',
      confidence: 0.89,
      snippets: [
        'Manages payroll processing for 200+ employees',
        'Supervises 2 payroll officers',
        'Reconciles SG and payroll tax'
      ],
      evidencePackSize: 4,
      status: 'my_queue',
      assignedTo: 'current-user',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      slaStatus: 'on_time',
      touchTimeSeconds: 0,
      loopCount: 0,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rev-002',
      type: 'audit_item',
      title: 'Q2 2024 SG Contribution Verification',
      description: 'Auto-populated with 8 evidence artifacts, 92% confidence',
      confidence: 0.92,
      snippets: [
        'SuperStream confirmation receipts matched',
        'OTE calculations verified',
        'Payment dates within statutory deadline'
      ],
      evidencePackSize: 8,
      status: 'auto_ready',
      assignedTo: 'current-user',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      slaStatus: 'on_time',
      touchTimeSeconds: 45,
      loopCount: 0,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rev-003',
      type: 'anomaly',
      title: 'Payslip SLA Breach Detected',
      description: '3 employees did not receive payslips within 1 business day',
      confidence: 0.95,
      snippets: [
        'Pay date: 15 June 2024',
        'Payslip delivery: 18 June 2024',
        '3 business days delay'
      ],
      evidencePackSize: 3,
      status: 'my_queue',
      assignedTo: 'current-user',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      slaStatus: 'at_risk',
      touchTimeSeconds: 0,
      loopCount: 1,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function generateEvidenceArtifacts(): any[] {
  return [
    {
      id: 'ev-001',
      filename: 'STP_Q2_2024.xml',
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'Payroll Officer',
      type: 'STP',
      period: { from: '2024-04-01', to: '2024-06-30' },
      matches: [
        { type: 'obligation', id: 'OBL-STP-001', confidence: 0.95, reason: 'STP Phase 2 filing obligation - period match' },
        { type: 'control', id: 'CTRL-TAX-002', confidence: 0.88, reason: 'Tax compliance control - evidence type match' }
      ],
      status: 'accepted',
      redacted: false,
      downloadUrl: '/api/mock-download/STP_Q2_2024.xml'
    },
    {
      id: 'ev-002',
      filename: 'SuperStream_Receipts_June2024.pdf',
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'Payroll Officer',
      type: 'SG',
      period: { from: '2024-06-01', to: '2024-06-30' },
      matches: [
        { type: 'obligation', id: 'OBL-SG-001', confidence: 0.92, reason: 'SG contribution obligation - period + type match' },
        { type: 'audit_item', id: 'AUD-SG-Q2', confidence: 0.87, reason: 'Q2 SG audit item - evidence match' }
      ],
      status: 'pending',
      redacted: false,
      downloadUrl: '/api/mock-download/SuperStream_Receipts_June2024.pdf'
    },
    {
      id: 'ev-003',
      filename: 'Payslips_June2024.zip',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'Payroll Officer',
      type: 'payslip',
      period: { from: '2024-06-01', to: '2024-06-30' },
      matches: [
        { type: 'obligation', id: 'OBL-PAY-001', confidence: 0.89, reason: 'Payslip delivery obligation - type match' },
        { type: 'control', id: 'CTRL-PAY-003', confidence: 0.85, reason: 'Payroll processing control' }
      ],
      status: 'pending',
      redacted: true,
      downloadUrl: '/api/mock-download/Payslips_June2024.zip'
    }
  ];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== New Classification Audit Routes ====================
  app.use('/api/classification', classificationRoutes);
  app.use('/api/evidence', evidenceRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/review', reviewRoutes);

  // ==================== AI Classification ====================
  app.post('/api/ai/classify', async (req, res) => {
    const { positionTitle, duties, qualifications, experience } = req.body;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const candidates = generateClassificationCandidates(duties || []);
    
    res.json({
      candidates,
      processedAt: new Date().toISOString()
    });
  });

  // ==================== Evidence Management ====================
  app.post('/api/evidence/upload-url', async (req, res) => {
    const { filename, contentType, period, tags } = req.body;
    
    // Generate mock upload URL using storage provider
    const { url, sasToken } = await storageProvider.getUploadUrl(filename, contentType);
    
    const evidenceId = `ev-${Date.now()}`;
    
    res.json({
      evidenceId,
      uploadUrl: url,
      sasToken
    });
  });

  app.post('/api/evidence/:evidenceId/complete', async (req, res) => {
    const { evidenceId } = req.params;
    
    // Simulate AI matching delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate AI matches
    const artifact = {
      id: evidenceId,
      filename: 'uploaded_file.pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      type: 'other',
      period: req.body.period,
      matches: [
        { type: 'obligation', id: 'OBL-GEN-001', confidence: 0.78, reason: 'General compliance obligation match' }
      ],
      status: 'pending',
      redacted: false,
      downloadUrl: `/api/mock-download/${evidenceId}`
    };
    
    res.json(artifact);
  });

  app.get('/api/evidence', async (req, res) => {
    const { status, type, period } = req.query;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let artifacts = generateEvidenceArtifacts();
    
    // Apply filters
    if (status) {
      artifacts = artifacts.filter(a => a.status === status);
    }
    if (type) {
      artifacts = artifacts.filter(a => a.type === type);
    }
    
    res.json({
      artifacts,
      total: artifacts.length
    });
  });

  app.get('/api/evidence/:evidenceId/matches', async (req, res) => {
    const { evidenceId } = req.params;
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const matches = [
      { type: 'obligation', id: 'OBL-001', confidence: 0.92, reason: 'Period and type alignment' },
      { type: 'control', id: 'CTRL-002', confidence: 0.85, reason: 'Control requirement match' },
      { type: 'audit_item', id: 'AUD-003', confidence: 0.78, reason: 'Audit checklist item match' }
    ];
    
    res.json(matches);
  });

  // ==================== Reviewer Inbox ====================
  app.get('/api/reviewer/inbox', async (req, res) => {
    const { status, type } = req.query;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let items = generateReviewItems();
    
    // Apply filters
    if (status) {
      items = items.filter(i => i.status === status);
    }
    if (type) {
      items = items.filter(i => i.type === type);
    }
    
    res.json({
      items,
      total: items.length
    });
  });

  app.get('/api/reviewer/metrics', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const metrics = {
      itemsToday: 12,
      itemsCompleted: 8,
      medianTimeSeconds: 180,
      firstPassRate: 0.87,
      autoReadyRate: 0.65,
      returnLoopCount: 0.3,
      hoursAvoided: 12.5,
      dollarsSaved: 1875.00
    };
    
    res.json(metrics);
  });

  app.post('/api/reviewer/items/:itemId/action', async (req, res) => {
    const { itemId } = req.params;
    const { action, notes, returnReason } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const items = generateReviewItems();
    const item = items.find(i => i.id === itemId) || items[0];
    
    // Update status based on action
    if (action === 'approve') {
      item.status = 'completed';
    } else if (action === 'return') {
      item.status = 'returned';
      item.loopCount += 1;
    } else if (action === 'escalate') {
      item.status = 'awaiting_approval';
    }
    
    item.updatedAt = new Date().toISOString();
    
    res.json(item);
  });

  // ==================== Anomaly Detection ====================
  app.get('/api/anomalies', async (req, res) => {
    const { severity, status } = req.query;
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const anomalies = [
      {
        id: 'anom-001',
        type: 'sg_mismatch',
        severity: 'high',
        title: 'Superannuation Guarantee Calculation Error',
        description: 'OTE calculation excluded salary packaging amounts',
        affectedEmployees: ['EMP-001', 'EMP-002', 'EMP-003'],
        period: { from: '2024-04-01', to: '2024-06-30' },
        linkedArtifacts: ['ev-002'],
        why: 'Payroll system configuration did not include salary packaging in OTE base for SG calculation',
        suggestedAction: 'Recalculate SG including salary packaging, lodge shortfall with interest, update payroll rules',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'anom-002',
        type: 'payslip_sla',
        severity: 'medium',
        title: 'Payslip Delivery SLA Breach',
        description: 'Payslips delivered 3 business days after pay date',
        affectedEmployees: ['EMP-004', 'EMP-005', 'EMP-006'],
        period: { from: '2024-06-15', to: '2024-06-18' },
        linkedArtifacts: ['ev-003'],
        why: 'Email delivery system experienced delays due to server maintenance',
        suggestedAction: 'Implement redundant delivery system, add monitoring alerts, communicate with affected employees',
        status: 'in_review',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    let filtered = anomalies;
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    
    res.json({
      anomalies: filtered,
      total: filtered.length
    });
  });

  app.get('/api/anomalies/:anomalyId', async (req, res) => {
    const { anomalyId } = req.params;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const anomaly = {
      id: anomalyId,
      type: 'sg_mismatch',
      severity: 'high',
      title: 'Superannuation Guarantee Calculation Error',
      description: 'OTE calculation excluded salary packaging amounts',
      affectedEmployees: ['EMP-001', 'EMP-002', 'EMP-003'],
      period: { from: '2024-04-01', to: '2024-06-30' },
      linkedArtifacts: ['ev-002'],
      why: 'Payroll system configuration did not include salary packaging in OTE base for SG calculation',
      suggestedAction: 'Recalculate SG including salary packaging, lodge shortfall with interest, update payroll rules',
      status: 'open',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    res.json(anomaly);
  });

  // ==================== People & Roles ====================
  app.get('/api/people', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return mock people data
    const people = [
      {
        id: 'p1',
        displayName: 'Harper Lane',
        email: 'harper@corecomply.com',
        title: 'CEO',
        department: 'Executive',
        location: 'Sydney',
        roles: ['CEO'],
        active: true
      },
      {
        id: 'p2',
        displayName: 'Ava Morgan',
        email: 'ava@corecomply.com',
        title: 'Compliance Manager',
        department: 'Compliance',
        location: 'Melbourne',
        roles: ['ComplianceOwner'],
        active: true
      }
    ];
    
    res.json(people);
  });

  app.post('/api/people', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const person = { ...req.body, id: `p-${Date.now()}` };
    res.json(person);
  });

  app.patch('/api/people/:id', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { id } = req.params;
    res.json({ ...req.body, id });
  });

  app.post('/api/people/import/m365', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockM365Users = [
      {
        id: 'm365-1',
        displayName: 'Emma Wilson',
        email: 'emma.wilson@corecomply.com',
        title: 'Payroll Manager',
        department: 'Finance',
        location: 'Sydney',
        phone: '+61 2 8765 4321',
        managerId: 'p1',
        roles: [],
        active: true
      },
      {
        id: 'm365-2',
        displayName: 'Liam Chen',
        email: 'liam.chen@corecomply.com',
        title: 'Quality Manager',
        department: 'Quality',
        location: 'Melbourne',
        phone: '+61 3 9876 5432',
        managerId: 'p1',
        roles: [],
        active: true
      },
      {
        id: 'm365-3',
        displayName: 'Sophia Patel',
        email: 'sophia.patel@corecomply.com',
        title: 'CISO',
        department: 'IT Security',
        location: 'Brisbane',
        phone: '+61 7 3456 7890',
        managerId: 'p1',
        roles: [],
        active: true
      }
    ];
    
    res.json({ 
      users: mockM365Users,
      summary: {
        total: mockM365Users.length,
        new: mockM365Users.length,
        updated: 0,
        skipped: 0
      }
    });
  });

  app.post('/api/people/suggest', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { role, framework } = req.body;
    
    // Mock suggestion logic based on role heuristics
    const suggestions = [
      {
        personId: 'm365-2',
        score: 0.92,
        reasons: ['Title matches role', 'Department aligns with responsibilities']
      },
      {
        personId: 'p2',
        score: 0.75,
        reasons: ['Experience in related area']
      }
    ];
    
    res.json({ suggestions });
  });

  app.get('/api/roles', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Import role catalog
    const fs = await import('fs/promises');
    const path = await import('path');
    const catalogPath = path.join(process.cwd(), 'server/data/roles/catalog.json');
    
    try {
      const catalogData = await fs.readFile(catalogPath, 'utf-8');
      const catalog = JSON.parse(catalogData);
      res.json(catalog);
    } catch (error) {
      res.json({ roles: [] });
    }
  });

  app.post('/api/assignments/validate', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { assignments, rules } = req.body;
    
    // Mock SoD validation
    const violations: any[] = [];
    res.json({ valid: true, violations });
  });

  // ==================== Framework Controls ====================
  app.get('/api/controls/iso9001', async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const PapaModule = await import('papaparse');
      const Papa = PapaModule.default;
      
      const csvPath = path.join(process.cwd(), 'server/data/iso9001/iso9001_obligations.csv');
      const csvData = await fs.readFile(csvPath, 'utf-8');
      
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      const obligations = parsed.data.map((row: any, index: number) => ({
        id: row.ObligationId || `ISO9001-${index}`,
        controlId: row.ControlRef || row.ObligationId,
        title: row.Title,
        description: row.Description,
        clause: row.Clause,
        category: row.Clause?.split('.')[0] || 'General',
        framework: 'ISO9001',
        status: 'not_started',
        owner: null,
        requiredRecords: row.RequiredRecords?.split('|') || [],
        evidenceHint: row.PrimaryEvidenceHint
      }));
      
      res.json(obligations);
    } catch (error) {
      console.error('Failed to load ISO 9001 obligations:', error);
      res.status(500).json({ error: 'Failed to load ISO 9001 controls' });
    }
  });

  app.get('/api/controls/iso27001', async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const jsonPath = path.join(process.cwd(), 'server/data/iso27001/annexA_2022.json');
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const annexAControls = JSON.parse(jsonData);
      
      const controls = annexAControls.map((control: any) => ({
        id: control.id,
        controlId: control.id,
        title: control.title,
        description: control.description || `ISO 27001:2022 Annex A - ${control.title}`,
        theme: control.theme,
        category: control.theme || 'General',
        framework: 'ISO27001',
        status: 'not_started',
        owner: null
      }));
      
      res.json(controls);
    } catch (error) {
      console.error('Failed to load ISO 27001 controls:', error);
      res.status(500).json({ error: 'Failed to load ISO 27001 controls' });
    }
  });

  // ==================== Framework Import ====================
  app.post('/api/frameworks/import', async (req, res) => {
    try {
      const controls = req.body.controls || [];
      
      // In a real implementation, this would save to database
      // For now, we'll just acknowledge the import
      console.log(`Importing ${controls.length} controls`);
      
      // Group by framework
      const frameworks = new Set(controls.map((c: any) => c.Framework));
      
      res.json({
        success: true,
        importedCount: controls.length,
        frameworks: Array.from(frameworks),
        message: `Successfully imported ${controls.length} controls from ${frameworks.size} framework(s)`
      });
    } catch (error) {
      console.error('Framework import failed:', error);
      res.status(500).json({ error: 'Failed to import framework controls' });
    }
  });

  app.get('/api/controls', async (req, res) => {
    try {
      const { framework } = req.query;
      
      if (framework === 'ISO9001') {
        return res.redirect('/api/controls/iso9001');
      } else if (framework === 'ISO27001') {
        return res.redirect('/api/controls/iso27001');
      }
      
      // Return APGF controls by default or all controls
      // For now, just return an empty array - APGF controls are in the store
      res.json([]);
    } catch (error) {
      console.error('Failed to load controls:', error);
      res.status(500).json({ error: 'Failed to load controls' });
    }
  });

  // ==================== Starter Guides ====================
  app.post('/api/starter/iso9001/bootstrap', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = {
      success: true,
      created: {
        controls: 25,
        policies: 8,
        processes: 12,
        obligations: 15
      },
      message: 'ISO 9001 framework bootstrapped successfully'
    };
    
    res.json(result);
  });

  app.post('/api/starter/iso27001/bootstrap', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = {
      success: true,
      created: {
        controls: 93,
        policies: 12,
        soaRows: 93,
        obligations: 20
      },
      message: 'ISO 27001 framework bootstrapped successfully'
    };
    
    res.json(result);
  });

  app.post('/api/starter/export-plan', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { framework, format } = req.body;
    
    const plan = {
      framework,
      generatedAt: new Date().toISOString(),
      tasks: req.body.tasks || [],
      assignments: req.body.assignments || []
    };
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${framework}-starter-plan.csv"`);
      res.send('Task,Owner,Due Date,Status\n');
    } else {
      res.json(plan);
    }
  });

  // ==================== ROI Tracking ====================
  app.post('/api/roi/track-validation', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const { itemId, itemType, actualMins } = req.body;
    
    // Mock validation tracking - would persist in real implementation
    res.json({
      success: true,
      tracked: {
        itemId,
        itemType,
        actualMins,
        timestamp: new Date().toISOString()
      }
    });
  });

  app.get('/api/roi/summary', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock ROI summary data
    res.json({
      currency: 'AUD',
      totalHoursAvoided: 47.5,
      totalDollarsSaved: 21375,
      totalValidations: 156,
      averageTimeSaved: 18.2,
      byItemType: {
        classification: {
          count: 89,
          hoursAvoided: 28.3,
          dollarsSaved: 12735
        },
        audit_item: {
          count: 52,
          hoursAvoided: 15.8,
          dollarsSaved: 7110
        },
        evidence_review: {
          count: 15,
          hoursAvoided: 3.4,
          dollarsSaved: 1530
        }
      }
    });
  });

  // ==================== AI Copilot ====================
  app.post('/api/copilot/chat', async (req, res) => {
    const { query, context } = req.body;
    
    // Use LLM provider for AI response
    const messages = [
      { role: 'system', content: 'You are a compliance expert assistant specializing in Australian payroll and award classifications.' },
      { role: 'user', content: query }
    ];
    
    const content = await llmProvider.chat(messages);
    
    // Use RAG provider for citations
    const ragResults = await ragProvider.search(query);
    const citations = ragResults.slice(0, 3).map(r => ({
      text: r.content.substring(0, 100) + '...',
      source: r.metadata.type || 'compliance',
      url: `/docs/${r.id}`,
      internal: true
    }));
    
    res.json({
      id: `memo-${Date.now()}`,
      content,
      citations,
      generatedAt: new Date().toISOString()
    });
  });

  app.post('/api/copilot/brief', async (req, res) => {
    const { classificationId } = req.body;
    
    // Generate legal brief using LLM
    const briefPrompt = 'Generate a legal brief for position classification including facts, award analysis, and recommendation';
    const messages = [
      { role: 'system', content: 'You are a legal counsel specializing in employment law and award classifications.' },
      { role: 'user', content: briefPrompt }
    ];
    
    const content = await llmProvider.chat(messages);
    
    // Extract structured data from content
    const brief = {
      id: `brief-${Date.now()}`,
      title: 'Classification Legal Brief',
      facts: [
        'Role involves routine administrative tasks with limited supervision',
        'Employee uses standard MS Office suite',
        'Handles level 1-2 customer inquiries',
        'Maintains departmental filing systems'
      ],
      snippets: [
        { text: 'Level 3 - Administrative Officer definition', source: 'Clerks Award 2020, Clause 13.3' }
      ],
      citations: [
        { text: 'Clerks Private Sector Award 2020', url: 'https://www.fwc.gov.au/awards/MA000002', internal: false },
        { text: 'Position Classification Policy', url: '/policies/classification', internal: true }
      ],
      generatedAt: new Date().toISOString(),
      generatedBy: 'AI Copilot'
    };
    
    res.json(brief);
  });

  // ROI Validation Tracking API
  app.post('/api/roi/track-validation', async (req, res) => {
    try {
      // Validate request body using Zod schema
      const parseResult = insertROIValidationSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: parseResult.error.issues 
        });
      }
      
      const validation = await storage.trackROIValidation(parseResult.data);
      res.json(validation);
    } catch (error) {
      console.error('Error tracking ROI validation:', error);
      res.status(500).json({ error: 'Failed to track validation' });
    }
  });

  app.get('/api/roi/summary', async (req, res) => {
    try {
      const summary = await storage.getROISummary();
      res.json(summary);
    } catch (error) {
      console.error('Error getting ROI summary:', error);
      res.status(500).json({ error: 'Failed to get ROI summary' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
