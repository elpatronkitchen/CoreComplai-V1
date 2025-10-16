import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Users, 
  Plus, 
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  FileText,
  TrendingUp,
  DollarSign,
  Timer,
  BarChart3,
  Upload,
  Download,
  ChevronDown,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReviewStore } from '@/store/reviewSlice';

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

// Initial state for audit creation form
const initialAuditState = {
  scope: 'Entity' as 'Entity' | 'BusinessUnit' | 'Site' | 'EmployeeSubset',
  periodFrom: '',
  periodTo: '',
  selectedEmployees: [] as string[]
};

// Mock audits for demonstration
const mockAudits = [
  {
    id: 'CA-001',
    name: 'Q1 2024 Classification Review',
    scope: 'Entity',
    period: { from: '2024-01-01', to: '2024-03-31' },
    status: 'Complete',
    employeesReviewed: 45,
    issuesFound: 3,
    createdAt: '2024-03-15',
  },
  {
    id: 'CA-002',
    name: 'Annual Remuneration Audit 2023',
    scope: 'Entity',
    period: { from: '2023-01-01', to: '2023-12-31' },
    status: 'Complete',
    employeesReviewed: 42,
    issuesFound: 1,
    createdAt: '2024-01-10',
  },
];

export default function ClassificationAuditPage() {
  const [audits] = useState(mockAudits);
  const [newAudit, setNewAudit] = useState({ ...initialAuditState });
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mainTab, setMainTab] = useState('overview');
  const { toast } = useToast();

  // Reviewer inbox state
  const { items, metrics, addReviewItem, validateItem, batchValidate, returnItem, calculateMetrics } = useReviewStore();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [reviewTab, setReviewTab] = useState('my_queue');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState<string | null>(null);

  // Get active employees for selection
  const activeEmployees = mockEmployees.filter(emp => emp.status === 'Active');

  // Calculate metrics on mount
  useMemo(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  // Filter review items by tab
  const filteredReviewItems = useMemo(() => {
    return items.filter((item) => {
      if (reviewTab === 'all') return true;
      return item.status === reviewTab;
    });
  }, [items, reviewTab]);

  const handleCreateAudit = async () => {
    if (!newAudit.periodFrom || !newAudit.periodTo) return;

    setIsCreating(true);

    try {
      // Simulate audit creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Classification Audit Created',
        description: 'Your classification audit has been initiated successfully.',
      });

      setNewAudit({ ...initialAuditState });
      setDialogOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBatchValidate = (approved: boolean) => {
    batchValidate(Array.from(selectedItems), approved);
    setSelectedItems(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Pending': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      my_queue: { color: 'bg-blue-500', label: 'My Queue' },
      awaiting_approval: { color: 'bg-amber-500', label: 'Awaiting Approval' },
      returned: { color: 'bg-red-500', label: 'Returned' },
      auto_ready: { color: 'bg-green-500', label: 'Auto-Ready' },
      completed: { color: 'bg-gray-400', label: 'Completed' },
    };
    return variants[status] || variants.my_queue;
  };

  const getSLABadge = (slaStatus: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      on_time: { color: 'bg-green-500', label: 'On Time' },
      at_risk: { color: 'bg-amber-500', label: 'At Risk' },
      overdue: { color: 'bg-red-500', label: 'Overdue' },
    };
    return variants[slaStatus] || variants.on_time;
  };

  // Seed review data on first load
  useEffect(() => {
    if (items.length === 0) {
      const mockItems = [
        {
          type: 'classification' as const,
          title: 'Administrative Officer - Level 3 Classification',
          description: 'Review position PA-2024-003 for award compliance under Clerks Private Sector Award 2020',
          confidence: 0.87,
          snippets: ['Clause 13.3: Level 3 classification criteria', 'Routine administrative duties', 'Limited supervision'],
          evidencePackSize: 4,
          status: 'my_queue' as const,
          assignedTo: 'current-user',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'on_time' as const,
          loopCount: 0,
        },
        {
          type: 'audit_item' as const,
          title: 'Q2 2024 Superannuation Guarantee Compliance',
          description: 'Verify SG calculations and payment timelines for all employees',
          confidence: 0.92,
          snippets: ['11.5% SG rate applied', 'Payment within 28 days', '42 employees verified'],
          evidencePackSize: 12,
          status: 'auto_ready' as const,
          assignedTo: 'current-user',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'on_time' as const,
          loopCount: 0,
        },
        {
          type: 'anomaly' as const,
          title: 'Payslip SLA Breach - 3 Employees',
          description: 'Payslips issued 2 days after payday, exceeding 1 business day requirement',
          confidence: 0.95,
          snippets: ['Fair Work Regulations breach', '3 affected employees', 'System processing delay'],
          evidencePackSize: 6,
          status: 'my_queue' as const,
          assignedTo: 'current-user',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'at_risk' as const,
          loopCount: 0,
        },
        {
          type: 'classification' as const,
          title: 'Senior Payroll Officer - Reclassification Request',
          description: 'Employee requested reclassification from Level 4 to Level 5 based on expanded duties',
          confidence: 0.72,
          snippets: ['Duty expansion documented', 'Supervisory responsibilities added', 'Requires legal review'],
          evidencePackSize: 8,
          status: 'awaiting_approval' as const,
          assignedTo: 'compliance-manager',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'on_time' as const,
          loopCount: 1,
        },
      ];

      mockItems.forEach((item) => {
        addReviewItem(item);
      });
    }
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-classification-audit">Classification Audit</h1>
          <p className="text-muted-foreground">
            Verify employee classifications and remuneration compliance
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-classification-audit">
              <Plus className="h-4 w-4 mr-2" />
              Create New Audit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Classification Audit</DialogTitle>
              <DialogDescription>
                Define the audit scope and period to review employee classifications and remuneration.
              </DialogDescription>
            </DialogHeader>
            
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950" data-testid="alert-legal-disclaimer">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                This tool provides guidance only. Please engage with your legal team to ensure accurate classification and compliance with applicable awards and legislation.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scope</label>
                <Select 
                  value={newAudit.scope} 
                  onValueChange={(value: any) => setNewAudit({ ...newAudit, scope: value })}
                >
                  <SelectTrigger data-testid="select-classification-audit-scope">
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
                            id={`class-${employee.id}`}
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
                            data-testid={`checkbox-classification-employee-${employee.id}`}
                          />
                          <label
                            htmlFor={`class-${employee.id}`}
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
                  data-testid="input-classification-period-from"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Period To</label>
                <Input
                  type="date"
                  value={newAudit.periodTo}
                  onChange={(e) => setNewAudit({ ...newAudit, periodTo: e.target.value })}
                  data-testid="input-classification-period-to"
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
                data-testid="button-create-classification-audit-submit"
              >
                {isCreating ? 'Creating...' : 'Create Classification Audit'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="reviewer-inbox" data-testid="tab-reviewer-inbox">
            Reviewer Inbox ({items.filter((i) => i.status === 'my_queue').length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{audits.length}</div>
                <p className="text-xs text-muted-foreground">
                  Classification reviews conducted
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees Reviewed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {audits.reduce((sum, a) => sum + a.employeesReviewed, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all audits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {audits.reduce((sum, a) => sum + a.issuesFound, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Classification discrepancies
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95.4%</div>
                <p className="text-xs text-muted-foreground">
                  Correct classifications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Audit History */}
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <CardDescription>
                Recent classification and remuneration audits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer"
                    data-testid={`audit-item-${audit.id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{audit.name}</h3>
                        <Badge className={getStatusColor(audit.status)}>
                          {audit.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {audit.period.from} to {audit.period.to}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {audit.employeesReviewed} employees
                        </span>
                        {audit.issuesFound > 0 && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            {audit.issuesFound} {audit.issuesFound === 1 ? 'issue' : 'issues'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(audit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviewer Inbox Tab */}
        <TabsContent value="reviewer-inbox" className="space-y-6">
          {/* ROI Metrics Bar */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Reviewer Performance & ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Items Today</p>
                  <p className="text-2xl font-bold">{metrics.itemsToday}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.itemsCompleted}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Median Time</p>
                  <p className="text-2xl font-bold">{Math.floor(metrics.medianTimeSeconds / 60)}m</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">First Pass</p>
                  <p className="text-2xl font-bold">{(metrics.firstPassRate * 100).toFixed(0)}%</p>
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
                    $ Saved
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${metrics.dollarsSaved.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Actions */}
          {selectedItems.size > 0 && (
            <Card className="border-primary">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItems(new Set())}
                      data-testid="button-clear-selection"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleBatchValidate(false)}
                      data-testid="button-batch-return"
                    >
                      Return All
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleBatchValidate(true)}
                      data-testid="button-batch-validate"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Validate All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Queue Tabs */}
          <Tabs value={reviewTab} onValueChange={setReviewTab}>
            <TabsList>
              <TabsTrigger value="my_queue" data-testid="tab-my-queue">
                My Queue ({items.filter((i) => i.status === 'my_queue').length})
              </TabsTrigger>
              <TabsTrigger value="auto_ready" data-testid="tab-auto-ready">
                Auto-Ready ({items.filter((i) => i.status === 'auto_ready').length})
              </TabsTrigger>
              <TabsTrigger value="awaiting_approval" data-testid="tab-awaiting-approval">
                Awaiting Approval ({items.filter((i) => i.status === 'awaiting_approval').length})
              </TabsTrigger>
              <TabsTrigger value="returned" data-testid="tab-returned">
                Returned ({items.filter((i) => i.status === 'returned').length})
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({items.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={reviewTab} className="space-y-4 mt-4">
              {filteredReviewItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No items in this queue</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Items will appear here when assigned for review
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviewItems.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  const slaBadge = getSLABadge(item.slaStatus);
                  
                  return (
                    <Card key={item.id} className="hover-elevate" data-testid={`review-item-${item.id}`}>
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          {/* Selection Checkbox */}
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                            data-testid={`checkbox-review-item-${item.id}`}
                          />

                          {/* Item Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                <Badge className={slaBadge.color}>{slaBadge.label}</Badge>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                Confidence: {(item.confidence * 100).toFixed(0)}%
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {item.snippets.length} snippets
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Evidence pack: {item.evidencePackSize} items
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Evidence Section */}
                            <Collapsible
                              open={expandedItem === item.id}
                              onOpenChange={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  data-testid={`button-toggle-evidence-${item.id}`}
                                >
                                  {expandedItem === item.id ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                                  Evidence ({item.evidencePackSize})
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pt-2 space-y-3">
                                {/* Upload New Evidence */}
                                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Upload Supporting Evidence</p>
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <Input
                                    type="file"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setUploadingEvidence(item.id);
                                        await new Promise(resolve => setTimeout(resolve, 1500));
                                        setUploadingEvidence(null);
                                        toast({
                                          title: 'Evidence Uploaded',
                                          description: `${file.name} linked to ${item.title}`,
                                        });
                                      }
                                    }}
                                    disabled={uploadingEvidence === item.id}
                                    data-testid={`input-upload-evidence-${item.id}`}
                                  />
                                  {uploadingEvidence === item.id && (
                                    <p className="text-xs text-muted-foreground">Uploading and matching...</p>
                                  )}
                                </div>

                                {/* Existing Evidence - Mock Data */}
                                {item.evidencePackSize > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Linked Evidence</p>
                                    {[...Array(Math.min(item.evidencePackSize, 3))].map((_, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-muted/30 rounded border"
                                      >
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <div>
                                            <p className="text-sm font-medium">
                                              {idx === 0 ? 'Position_Description_PA-2024.pdf' : 
                                               idx === 1 ? 'Award_Classification_Guide.pdf' :
                                               'Employee_Contract.pdf'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Uploaded {new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Badge variant="secondary" className="text-xs">
                                            {idx === 0 ? '92%' : idx === 1 ? '87%' : '78%'} match
                                          </Badge>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            data-testid={`button-download-evidence-${item.id}-${idx}`}
                                          >
                                            <Download className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CollapsibleContent>
                            </Collapsible>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              {item.status !== 'completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                      validateItem(item.id, true);
                                    }}
                                    data-testid={`button-validate-${item.id}`}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Validate
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      returnItem(item.id, 'Requires additional review');
                                    }}
                                    data-testid={`button-return-${item.id}`}
                                  >
                                    Return
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
