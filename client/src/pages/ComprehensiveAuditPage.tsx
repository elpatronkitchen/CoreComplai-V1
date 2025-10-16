import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useAuditStore, AuditChecklist, AuditItem } from '@/store/auditSlice';
import { useTaskStore } from '@/store/taskSlice';
import { useObligationsStore } from '@/store/obligationsSlice';
import { useClassificationAuditStore } from '@/stores/useClassificationAuditStore';
import { useReviewStore } from '@/store/reviewSlice';
import { autoPopulateAuditChecklist } from '@/lib/auditAutoPopulate';
import { generateTasksForAudit } from '@/lib/taskGeneration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Plus, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  FileCheck,
  Link2,
  Database,
  Download,
  AlertTriangle,
  ExternalLink,
  Users,
  TrendingUp,
  DollarSign,
  Timer,
  Zap,
  Target
} from 'lucide-react';
import { nanoid } from 'nanoid';
import template from '../../../data/Audit_Comprehensive_Template.json';
import { useIntegrationsStore } from '@/lib/setup/integrationsStore';
import { useCompanyStore } from '@/lib/setup/companyStore';
import { usePeopleStore } from '@/lib/setup/peopleStore';
import { setupSteps } from '@/lib/setup/steps';

// Mock employee data from 365 integration (matches Company Profile data)
const mockEmployees = [
  { id: 'EMP-001', name: 'Mia Nguyen', position: 'HR Manager', status: 'Active' },
  { id: 'EMP-002', name: 'Leo Carter', position: 'Payroll Officer', status: 'Active' },
  { id: 'EMP-003', name: 'Harper Lane', position: 'System Administrator', status: 'Terminated' },
  { id: 'EMP-004', name: 'Ella Thompson', position: 'Finance Manager', status: 'Active' },
  { id: 'EMP-005', name: 'Ava Morgan', position: 'Compliance Owner', status: 'Active' },
  { id: 'EMP-006', name: 'Oliver Brown', position: 'IT Security Specialist', status: 'Active' },
  { id: 'EMP-007', name: 'Sophia Davis', position: 'Privacy Officer', status: 'Active' },
  { id: 'EMP-008', name: 'Lucas Martinez', position: 'Data Protection Officer', status: 'Active' },
  { id: 'EMP-009', name: 'Emma Wilson', position: 'CFO', status: 'Active' },
  { id: 'EMP-010', name: 'Noah Anderson', position: 'CEO', status: 'Active' },
];

// Initial state for audit creation form (prevents undefined state bugs)
const initialAuditState = {
  scope: 'Entity' as 'Entity' | 'BusinessUnit' | 'Site' | 'EmployeeSubset',
  periodFrom: '',
  periodTo: '',
  selectedEmployees: [] as string[]
};

export default function ComprehensiveAuditPage() {
  const { checklists, addChecklist, updateChecklist, updateAuditItem, evidenceArtifacts } = useAuditStore();
  const { tasks, addTask } = useTaskStore();
  const { obligations } = useObligationsStore();
  const { getCoveragePercentage, totalEmployees } = useClassificationAuditStore();
  const { metrics } = useReviewStore();
  
  // Setup store access for readiness check
  const integrations = useIntegrationsStore();
  const company = useCompanyStore();
  const people = usePeopleStore();
  
  // Calculate classification coverage
  const coveragePercentage = getCoveragePercentage();
  const isOptimised = coveragePercentage >= 90;
  
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showReadinessAlert, setShowReadinessAlert] = useState(true);
  
  // New audit creation form
  const [newAudit, setNewAudit] = useState({ ...initialAuditState });

  // Get active employees for selection
  const activeEmployees = mockEmployees.filter(emp => emp.status === 'Active');

  // Readiness check: identify incomplete setup steps that would improve audit quality
  const readinessCheck = useMemo(() => {
    const checks = [];
    
    const integrationsStep = setupSteps.find(s => s.key === 'integrations');
    const companyStep = setupSteps.find(s => s.key === 'companyProfile');
    const peopleStep = setupSteps.find(s => s.key === 'people');
    
    if (integrationsStep && !integrationsStep.complete()) {
      checks.push({
        stepKey: 'integrations',
        label: 'Integrations',
        description: 'Connect STP, BAS, SuperStream for evidence auto-population',
        setupPath: '/setup'
      });
    }
    
    if (companyStep && !companyStep.complete()) {
      checks.push({
        stepKey: 'companyProfile',
        label: 'Company Profile',
        description: 'Complete company details for statutory timetable generation',
        setupPath: '/setup'
      });
    }
    
    if (peopleStep && !peopleStep.complete()) {
      checks.push({
        stepKey: 'people',
        label: 'Key Personnel',
        description: 'Assign roles for automatic RASCI matrix and task routing',
        setupPath: '/setup'
      });
    }
    
    return checks;
  }, [integrations, company, people]);

  const currentChecklist = useMemo(() => 
    checklists.find(c => c.id === selectedChecklist),
    [checklists, selectedChecklist]
  );

  const sections = useMemo(() => {
    if (!currentChecklist) return [];
    const sectionMap = new Map<string, AuditItem[]>();
    currentChecklist.items.forEach(item => {
      const section = item.section || 'Other';
      if (!sectionMap.has(section)) {
        sectionMap.set(section, []);
      }
      sectionMap.get(section)!.push(item);
    });
    return Array.from(sectionMap.entries());
  }, [currentChecklist]);

  const filteredItems = useMemo(() => {
    if (!currentChecklist) return [];
    return currentChecklist.items.filter(item => {
      const matchesSection = filterSection === 'all' || item.section === filterSection;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSection && matchesStatus;
    });
  }, [currentChecklist, filterSection, filterStatus]);

  const handleCreateAudit = async () => {
    if (!newAudit.periodFrom || !newAudit.periodTo) return;

    setIsCreating(true);

    try {
      // Create audit items from template
      const templateItems: AuditItem[] = template.map((t: any) => {
        // Get RASCI from obligations
        const rasci: any = { S: [], C: [], I: [] };
        t.obligationIds.forEach((oblId: string) => {
          const obl = obligations.find(o => o.id === oblId);
          if (obl) {
            if (obl.roles.R && !rasci.R) rasci.R = obl.roles.R;
            if (obl.roles.A && !rasci.A) rasci.A = obl.roles.A;
            if (obl.roles.S && !rasci.S.includes(obl.roles.S)) rasci.S.push(obl.roles.S);
            if (obl.roles.C && !rasci.C.includes(obl.roles.C)) rasci.C.push(obl.roles.C);
            if (obl.roles.I && !rasci.I.includes(obl.roles.I)) rasci.I.push(obl.roles.I);
          }
        });

        return {
          id: nanoid(),
          title: t.title,
          description: t.description,
          obligationIds: t.obligationIds,
          controlRefs: t.controlRefs,
          expectedEvidence: t.expectedEvidence,
          autoArtifacts: [],
          status: 'Unstarted' as const,
          rasci,
          coverageScore: 0,
          section: t.section
        };
      });

      // Auto-populate evidence
      const { items: populatedItems, artifacts } = await autoPopulateAuditChecklist(
        templateItems,
        { from: newAudit.periodFrom, to: newAudit.periodTo },
        evidenceArtifacts
      );

      // Persist new artifacts to global evidence store
      const newArtifacts = artifacts.filter(a => !evidenceArtifacts.some(ea => ea.id === a.id));
      newArtifacts.forEach(artifact => {
        useAuditStore.getState().addEvidenceArtifact(artifact);
      });

      // Create checklist
      const checklist: AuditChecklist = {
        id: nanoid(),
        name: 'Comprehensive Payroll Audit',
        scope: newAudit.scope,
        period: { from: newAudit.periodFrom, to: newAudit.periodTo },
        items: populatedItems,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        createdBy: 'Current User'
      };

      addChecklist(checklist);
      setSelectedChecklist(checklist.id);
      setNewAudit({ ...initialAuditState });
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateTasks = () => {
    if (!currentChecklist) return;

    const auditWindowEnd = new Date(currentChecklist.period.to);
    const newTasks = generateTasksForAudit(currentChecklist.items, auditWindowEnd);
    
    newTasks.forEach(task => {
      addTask(task);
      updateAuditItem(currentChecklist.id, task.auditItemId, { taskId: task.id });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-500';
      case 'Auto-Populated': return 'bg-blue-500';
      case 'Ready': return 'bg-green-400';
      case 'Needs Review': return 'bg-amber-500';
      case 'Unstarted': return 'bg-gray-400';
      case 'N/A': return 'bg-gray-300';
      default: return 'bg-gray-400';
    }
  };

  const getIntegrationIcon = (integration?: string) => {
    switch (integration) {
      case 'STP':
      case 'SuperStream':
      case 'BAS':
      case 'PayrollTax':
        return <Database className="h-4 w-4" />;
      case 'VEVO':
      case 'Stapled':
        return <Link2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!selectedChecklist) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-comprehensive-audit">Comprehensive Payroll Audit</h1>
            <p className="text-muted-foreground">
              Auto-build audit checklists from obligations with intelligent evidence matching
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="button-create-audit">
                <Plus className="h-4 w-4 mr-2" />
                Create New Audit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Comprehensive Payroll Audit</DialogTitle>
                <DialogDescription>
                  Define the audit scope and period. The system will auto-populate evidence from integrations.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scope</label>
                  <Select 
                    value={newAudit.scope} 
                    onValueChange={(value: any) => setNewAudit({ ...newAudit, scope: value })}
                  >
                    <SelectTrigger data-testid="select-audit-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entity">Entity</SelectItem>
                      <SelectItem value="BusinessUnit">Business Unit</SelectItem>
                      <SelectItem value="Site">Site</SelectItem>
                      <SelectItem value="EmployeeSubset">Employee Subset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Selection (shown when Employee Subset is selected) */}
                {newAudit.scope === 'EmployeeSubset' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Select Employees from Microsoft 365
                    </label>
                    <ScrollArea className="h-48 border rounded-md p-4">
                      <div className="space-y-3">
                        {activeEmployees.map((employee) => (
                          <div key={employee.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={employee.id}
                              checked={newAudit.selectedEmployees.includes(employee.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewAudit({
                                    ...newAudit,
                                    selectedEmployees: [...newAudit.selectedEmployees, employee.id]
                                  });
                                } else {
                                  setNewAudit({
                                    ...newAudit,
                                    selectedEmployees: newAudit.selectedEmployees.filter(id => id !== employee.id)
                                  });
                                }
                              }}
                              data-testid={`checkbox-employee-${employee.id}`}
                            />
                            <label
                              htmlFor={employee.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {employee.name} - {employee.position}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <p className="text-xs text-muted-foreground">
                      {newAudit.selectedEmployees.length} of {activeEmployees.length} employees selected
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Period From</label>
                  <Input
                    type="date"
                    value={newAudit.periodFrom}
                    onChange={(e) => setNewAudit({ ...newAudit, periodFrom: e.target.value })}
                    data-testid="input-period-from"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Period To</label>
                  <Input
                    type="date"
                    value={newAudit.periodTo}
                    onChange={(e) => setNewAudit({ ...newAudit, periodTo: e.target.value })}
                    data-testid="input-period-to"
                  />
                </div>
                <Button 
                  onClick={handleCreateAudit} 
                  disabled={
                    !newAudit.periodFrom || 
                    !newAudit.periodTo || 
                    (newAudit.scope === 'EmployeeSubset' && newAudit.selectedEmployees.length === 0) ||
                    isCreating
                  }
                  className="w-full"
                  data-testid="button-create-audit-submit"
                >
                  {isCreating ? 'Creating...' : 'Create Audit & Auto-Populate Evidence'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Readiness Alert */}
        {readinessCheck.length > 0 && showReadinessAlert && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950" data-testid="alert-audit-readiness">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
              Audit Readiness Check
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p className="text-amber-800 dark:text-amber-200">
                The following setup steps are incomplete. Completing them will improve evidence auto-population and task routing:
              </p>
              <div className="space-y-2">
                {readinessCheck.map((check) => (
                  <div key={check.stepKey} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-amber-900 dark:text-amber-100">{check.label}:</span>{' '}
                      <span className="text-amber-800 dark:text-amber-200">{check.description}</span>
                    </div>
                    <Link href={check.setupPath}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-shrink-0 border-amber-600 text-amber-900 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-100 dark:hover:bg-amber-900"
                        data-testid={`button-fix-${check.stepKey}`}
                      >
                        Jump to fix
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You can proceed without completing these steps, but audit quality may be reduced.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReadinessAlert(false)}
                  className="text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900"
                  data-testid="button-run-anyway"
                >
                  Run anyway
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Classification Coverage Soft Gate (90% threshold) */}
        {totalEmployees > 0 && coveragePercentage < 90 && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950" data-testid="alert-classification-gate">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
              Classification Coverage: {coveragePercentage}%
              <Badge variant="outline" className="ml-2 border-amber-500 text-amber-700 dark:text-amber-300">
                Manual-heavy
              </Badge>
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p className="text-blue-800 dark:text-blue-200">
                Your classification audit has covered {coveragePercentage}% of employees. Running the comprehensive audit now will require significant manual work.
              </p>
              <div className="bg-blue-100 dark:bg-blue-900 rounded-md p-3 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Recommendation:</p>
                <p>Complete classification for at least 90% of employees to enable optimised audit mode with AI-assisted evidence matching and reduced manual review time.</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Link href="/audit/classification">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="button-run-classification"
                    >
                      Run Classification Audit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-proceed-manual"
                  >
                    Proceed with Manual Mode
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Optimised Mode Badge */}
        {totalEmployees > 0 && coveragePercentage >= 90 && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-optimised-mode">
            <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
              Classification Coverage: {coveragePercentage}%
              <Badge variant="outline" className="ml-2 border-green-500 text-green-700 dark:text-green-300">
                Optimised
              </Badge>
            </AlertTitle>
            <AlertDescription>
              <p className="text-green-800 dark:text-green-200">
                Your audit is running in optimised mode with AI-assisted evidence matching and automated validation workflows enabled.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* ROI Summary Widget */}
        {metrics.itemsCompleted > 0 && (
          <Card className="bg-primary/5" data-testid="card-roi-summary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cumulative Time Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Items Validated</p>
                  <p className="text-2xl font-bold">{metrics.itemsCompleted}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Hours Saved
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.hoursAvoided.toFixed(1)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Dollar Savings
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${metrics.dollarsSaved.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Time/Item</p>
                  <p className="text-2xl font-bold">{Math.floor(metrics.medianTimeSeconds / 60)}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {checklists.map((checklist) => (
            <Card 
              key={checklist.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedChecklist(checklist.id)}
              data-testid={`card-checklist-${checklist.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{checklist.name}</CardTitle>
                    <CardDescription>
                      {checklist.scope} • {new Date(checklist.period.from).toLocaleDateString()} - {new Date(checklist.period.to).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={checklist.status === 'Closed' ? 'secondary' : 'default'}>
                    {checklist.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{checklist.items.length} items</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {checklists.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Audits Created</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first comprehensive payroll audit to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Audit Detail View
  const stats = {
    total: currentChecklist?.items.length || 0,
    autoPopulated: currentChecklist?.items.filter(i => i.status === 'Auto-Populated').length || 0,
    needsReview: currentChecklist?.items.filter(i => i.status === 'Needs Review').length || 0,
    complete: currentChecklist?.items.filter(i => i.status === 'Complete').length || 0,
    avgCoverage: currentChecklist 
      ? Math.round(currentChecklist.items.reduce((sum, i) => sum + i.coverageScore, 0) / currentChecklist.items.length)
      : 0
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedChecklist(null)}
              data-testid="button-back-to-list"
            >
              ← Back to Audits
            </Button>
            <div>
              <h2 className="text-xl font-bold">{currentChecklist?.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentChecklist?.scope} • {currentChecklist && new Date(currentChecklist.period.from).toLocaleDateString()} - {currentChecklist && new Date(currentChecklist.period.to).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-export-pack">
              <Download className="h-4 w-4 mr-2" />
              Export Audit Pack
            </Button>
            <Button 
              onClick={handleGenerateTasks}
              data-testid="button-generate-tasks"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Create Evidence Tasks
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.autoPopulated}</div>
              <p className="text-xs text-muted-foreground">Auto-Populated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-600">{stats.needsReview}</div>
              <p className="text-xs text-muted-foreground">Needs Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.avgCoverage}%</div>
              <p className="text-xs text-muted-foreground">Avg Coverage</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-[250px]" data-testid="select-filter-section">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map(([section]) => (
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Auto-Populated">Auto-Populated</SelectItem>
              <SelectItem value="Needs Review">Needs Review</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Complete">Complete</SelectItem>
              <SelectItem value="Unstarted">Unstarted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {sections.map(([section, items]) => {
            const visibleItems = items.filter(item => filteredItems.includes(item));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section} className="space-y-3">
                <h3 className="text-lg font-semibold sticky top-0 bg-background py-2">{section} ({visibleItems.length})</h3>
                <div className="space-y-2">
                  {visibleItems.map((item) => (
                    <Card 
                      key={item.id}
                      className="hover-elevate cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                      data-testid={`card-audit-item-${item.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{item.title}</h4>
                              <Badge className={getStatusColor(item.status)} variant="secondary">
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-muted-foreground">
                                Coverage: <span className="font-medium">{item.coverageScore}%</span>
                              </span>
                              <span className="text-muted-foreground">
                                Evidence: <span className="font-medium">{item.autoArtifacts.length}/{item.expectedEvidence.length}</span>
                              </span>
                              {item.rasci.R && (
                                <span className="text-muted-foreground">
                                  Owner: <span className="font-medium">{item.rasci.R}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {item.autoArtifacts.slice(0, 3).map((artifact) => (
                              <Badge key={artifact.id} variant="outline" className="text-xs">
                                {getIntegrationIcon(artifact.integration)}
                                <span className="ml-1">{artifact.integration || 'File'}</span>
                              </Badge>
                            ))}
                            {item.autoArtifacts.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{item.autoArtifacts.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Item Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedItem.title}</SheetTitle>
                <SheetDescription>{selectedItem.description}</SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Status & Coverage */}
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Coverage</span>
                      <span className="text-sm font-medium">{selectedItem.coverageScore}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${selectedItem.coverageScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* RASCI */}
                <div>
                  <h4 className="font-medium mb-3">Responsibilities (RASCI)</h4>
                  <div className="space-y-2 text-sm">
                    {selectedItem.rasci.R && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Responsible:</span>
                        <Badge variant="outline">{selectedItem.rasci.R}</Badge>
                      </div>
                    )}
                    {selectedItem.rasci.A && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Accountable:</span>
                        <Badge variant="outline">{selectedItem.rasci.A}</Badge>
                      </div>
                    )}
                    {selectedItem.rasci.S && selectedItem.rasci.S.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-24">Support:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.rasci.S.map((s, i) => (
                            <Badge key={i} variant="outline">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedItem.taskId && (
                    <div className="mt-3">
                      <AlertTriangle className="h-4 w-4 inline mr-2 text-amber-600" />
                      <span className="text-sm text-muted-foreground">Evidence task created</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Expected Evidence */}
                <div>
                  <h4 className="font-medium mb-3">Expected Evidence ({selectedItem.expectedEvidence.length})</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedItem.expectedEvidence.map((evidence, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Auto-Collected Evidence */}
                <div>
                  <h4 className="font-medium mb-3">
                    Auto-Collected Evidence ({selectedItem.autoArtifacts.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedItem.autoArtifacts.map((artifact) => (
                      <Card key={artifact.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getIntegrationIcon(artifact.integration)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h5 className="font-medium text-sm truncate">{artifact.title}</h5>
                                {artifact.confidence && (
                                  <Badge 
                                    variant={artifact.confidence >= 0.75 ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {Math.round(artifact.confidence * 100)}% match
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {artifact.tags.map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              {artifact.notes && (
                                <p className="text-xs text-muted-foreground">{artifact.notes}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedItem.autoArtifacts.length === 0 && (
                      <p className="text-sm text-muted-foreground">No evidence auto-collected. Evidence task may be required.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
