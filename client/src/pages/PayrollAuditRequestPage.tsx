import { useState } from 'react';
import { useAuditRequestStore } from '../store/auditRequestSlice';
import type { AuditRequest, AuditEmployee, ChecklistItem } from '../store/auditRequestSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search,
  Plus,
  FolderOpen,
  Settings,
  Download,
  Link as LinkIcon,
  FileCheck,
  Plug,
  TrendingUp
} from 'lucide-react';
import { hasPermission } from '../lib/permissions';
import { useAppStore } from '../lib/store';

export default function PayrollAuditRequestPage() {
  const { audits, integrations, currentAudit, setCurrentAudit } = useAuditRequestStore();
  const { currentUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const canManage = hasPermission(currentUser, 'manage_frameworks');

  const filteredAudits = audits.filter(audit =>
    audit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setCurrentAudit(auditId);
  };

  if (selectedAuditId && currentAudit) {
    return <AuditWorkspace audit={currentAudit} onBack={() => {
      setSelectedAuditId(null);
      setCurrentAudit(null);
    }} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-payroll-audit-requests">
            Payroll Audit Requests
          </h2>
          <p className="text-muted-foreground">
            Scope audits, collect evidence, and manage employee audit files
          </p>
        </div>
        {canManage && (
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="button-new-audit">
                <Plus className="h-4 w-4 mr-2" />
                New Audit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Audit</DialogTitle>
                <DialogDescription>
                  Audit scoping wizard will be available in the full implementation
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-audits">{audits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-in-progress">
              {audits.filter(a => a.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-employees">
              {audits.reduce((sum, a) => sum + a.employeeCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-issues">
              {audits.reduce((sum, a) => sum + a.issuesCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            data-testid="input-search-audits"
          />
        </div>
      </div>

      {/* Audits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit List</CardTitle>
          <CardDescription>View and manage all payroll audit requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No audits found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAudits.map((audit) => (
                  <TableRow key={audit.id} data-testid={`row-audit-${audit.id}`}>
                    <TableCell className="font-medium">{audit.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          audit.status === 'completed' ? 'default' :
                          audit.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }
                        data-testid={`status-${audit.id}`}
                      >
                        {audit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{audit.owner}</TableCell>
                    <TableCell>{audit.auditor || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(audit.scope.startDate).toLocaleDateString()} - {new Date(audit.scope.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={audit.completeness} className="w-20" />
                        <span className="text-sm text-muted-foreground">{audit.completeness}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{audit.employeeCount}</TableCell>
                    <TableCell>
                      {audit.issuesCount > 0 ? (
                        <Badge variant="destructive">{audit.issuesCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAudit(audit.id)}
                        data-testid={`button-open-${audit.id}`}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface AuditWorkspaceProps {
  audit: AuditRequest;
  onBack: () => void;
}

function AuditWorkspace({ audit, onBack }: AuditWorkspaceProps) {
  const { updateChecklistItem, integrations, toggleIntegration } = useAuditRequestStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(audit.checklist.map(item => item.category)))];
  
  const filteredChecklist = selectedCategory === 'All'
    ? audit.checklist
    : audit.checklist.filter(item => item.category === selectedCategory);

  const providedCount = audit.checklist.filter(item => item.provided).length;
  const totalCount = audit.checklist.length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" onClick={onBack} className="p-0" data-testid="button-back">
          ← Back to Audits
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" data-testid="heading-audit-name">{audit.name}</h2>
        <p className="text-muted-foreground">
          {audit.scope.states.join(', ')} | {new Date(audit.scope.startDate).toLocaleDateString()} - {new Date(audit.scope.endDate).toLocaleDateString()}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist" data-testid="tab-checklist">Checklist</TabsTrigger>
          <TabsTrigger value="employees" data-testid="tab-employees">Employees</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Completeness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{audit.completeness}%</div>
                <Progress value={audit.completeness} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Documents Provided</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{providedCount}/{totalCount}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {totalCount - providedCount} missing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{audit.issuesCount}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Across {audit.employeeCount} employees
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-1">Owner</p>
                  <p className="text-muted-foreground">{audit.owner}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Auditor</p>
                  <p className="text-muted-foreground">{audit.auditor || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Entities</p>
                  <p className="text-muted-foreground">{audit.scope.entities.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Instruments</p>
                  <p className="text-muted-foreground">{audit.scope.instruments.join(', ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Filter by category:</p>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <ChecklistTable
            items={filteredChecklist}
            auditId={audit.id}
            onUpdate={(itemId, updates) => updateChecklistItem(audit.id, itemId, updates)}
          />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <EmployeeTable employees={audit.employees} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsPanel
            integrations={integrations}
            onToggle={toggleIntegration}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ChecklistTableProps {
  items: ChecklistItem[];
  auditId: string;
  onUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void;
}

function ChecklistTable({ items, auditId, onUpdate }: ChecklistTableProps) {
  const { currentUser } = useAppStore();
  const canManage = hasPermission(currentUser, 'manage_frameworks');

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>
              {categoryItems.filter(i => i.provided).length} of {categoryItems.length} provided
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryItems.map((item) => (
                  <TableRow key={item.id} data-testid={`checklist-${item.id}`}>
                    <TableCell>
                      <Checkbox
                        checked={item.provided}
                        onCheckedChange={(checked) =>
                          canManage && onUpdate(item.id, { provided: checked as boolean })
                        }
                        disabled={!canManage}
                        data-testid={`checkbox-${item.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.document}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.source === 'system' ? 'default' :
                          item.source === 'manual' ? 'secondary' :
                          'outline'
                        }
                      >
                        {item.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.periodCovered || '-'}
                    </TableCell>
                    <TableCell>
                      {item.link ? (
                        <Button variant="ghost" size="sm">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        canManage && (
                          <Button variant="ghost" size="sm" disabled={!canManage}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">{item.notes || '-'}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface EmployeeTableProps {
  employees: AuditEmployee[];
}

function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees in Scope</CardTitle>
        <CardDescription>Audit status for each employee</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Instrument</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} data-testid={`employee-${employee.id}`}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.entity}</TableCell>
                <TableCell>{employee.site}</TableCell>
                <TableCell>{employee.state}</TableCell>
                <TableCell>{employee.instrument}</TableCell>
                <TableCell>{employee.classification}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      employee.status === 'cleared' ? 'default' :
                      employee.status === 'issues' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {employee.issuesCount > 0 ? (
                    <Badge variant="destructive">{employee.issuesCount}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={employee.completeness} className="w-20" />
                    <span className="text-sm text-muted-foreground">{employee.completeness}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface IntegrationsPanelProps {
  integrations: any[];
  onToggle: (id: string) => void;
}

function IntegrationsPanel({ integrations, onToggle }: IntegrationsPanelProps) {
  const { currentUser } = useAppStore();
  const canManage = hasPermission(currentUser, 'manage_frameworks');

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                <CardTitle>{integration.name}</CardTitle>
              </div>
              <Badge variant={integration.connected ? 'default' : 'outline'}>
                {integration.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <CardDescription>{integration.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Auto-populates:</p>
                <div className="flex gap-2 flex-wrap">
                  {integration.checklistCategories.map((cat: string) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant={integration.connected ? 'outline' : 'default'}
                onClick={() => canManage && onToggle(integration.id)}
                disabled={!canManage}
                className="w-full"
                data-testid={`toggle-${integration.id}`}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
