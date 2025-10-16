import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search,
  Plus,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  Activity,
  Eye
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import DataTable, { type Column } from './DataTable';
import StatusBadge from './StatusBadge';
import type { AuditSession, AuditFinding } from '@shared/schema';

interface AuditSessionExtended {
  id: string;
  title: string;
  description: string;
  type: 'internal' | 'external';
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed';
  auditor: string;
  startDate: Date;
  endDate: Date;
  scope: string[];
  findings: string[];
  createdAt: Date;
  findingsCount?: number;
  completionPercentage?: number;
}

interface AuditFindingExtended {
  id: string;
  auditSessionId: string;
  controlId: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  status: 'open' | 'in_progress' | 'resolved';
  assignee: string;
  dueDate: Date;
  createdAt: Date;
  evidence: string[];
}

export default function AuditManager() {
  const { 
    auditSessions,
    auditFindings,
    currentUser, 
    controls,
    addNotification, 
    addAccessLog 
  } = useAppStore();
  
  const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock audit sessions data
  const mockAuditSessions: AuditSessionExtended[] = [
    {
      id: 'AUD-001',
      title: 'Q1 2024 Internal Audit',
      description: 'Quarterly internal compliance audit',
      type: 'internal',
      status: 'in_progress',
      auditor: 'Noah Patel',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      scope: ['APGF-REQ-001', 'APGF-REQ-002', 'APGF-REQ-003'],
      findings: ['FND-001', 'FND-002'],
      createdAt: new Date('2024-01-10'),
      findingsCount: 3,
      completionPercentage: 65
    },
    {
      id: 'AUD-002',
      title: 'ISO 9001 External Audit',
      description: 'Annual external certification audit',
      type: 'external',
      status: 'scheduled',
      auditor: 'Isla Bennett',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-15'),
      scope: ['ISO-001', 'ISO-002'],
      findings: [],
      createdAt: new Date('2024-01-05'),
      findingsCount: 0,
      completionPercentage: 0
    },
    {
      id: 'AUD-003',
      title: 'Financial Controls Review',
      description: 'Specialized audit of financial controls',
      type: 'internal',
      status: 'completed',
      auditor: 'Noah Patel',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-31'),
      scope: ['APGF-REQ-004'],
      findings: ['FND-003', 'FND-004'],
      createdAt: new Date('2023-11-25'),
      findingsCount: 2,
      completionPercentage: 100
    },
    {
      id: 'AUD-004',
      title: 'Data Privacy Assessment',
      description: 'Comprehensive data privacy compliance review',
      type: 'internal',
      status: 'draft',
      auditor: 'Noah Patel',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28'),
      scope: ['APGF-REQ-001', 'APGF-REQ-002'],
      findings: [],
      createdAt: new Date('2024-01-20'),
      findingsCount: 0,
      completionPercentage: 0
    }
  ];

  // Mock audit findings data
  const mockAuditFindings: AuditFindingExtended[] = [
    {
      id: 'FND-001',
      auditSessionId: 'AUD-001',
      controlId: 'APGF-REQ-001',
      title: 'Incomplete Privacy Framework Documentation',
      description: 'Privacy governance framework documentation is missing several required sections',
      severity: 'Medium',
      status: 'open',
      assignee: 'Ava Morgan',
      dueDate: new Date('2024-02-28'),
      createdAt: new Date('2024-01-18'),
      evidence: []
    },
    {
      id: 'FND-002',
      auditSessionId: 'AUD-001',
      controlId: 'APGF-REQ-002',
      title: 'Data Classification Implementation Gap',
      description: 'Data classification scheme has been defined but not fully implemented across all systems',
      severity: 'High',
      status: 'in_progress',
      assignee: 'Leo Carter',
      dueDate: new Date('2024-02-15'),
      createdAt: new Date('2024-01-20'),
      evidence: []
    },
    {
      id: 'FND-003',
      auditSessionId: 'AUD-003',
      controlId: 'APGF-REQ-004',
      title: 'Financial Control Documentation',
      description: 'Financial controls documentation needs updating to reflect current processes',
      severity: 'Low',
      status: 'resolved',
      assignee: 'Ella Thompson',
      dueDate: new Date('2024-01-15'),
      createdAt: new Date('2023-12-15'),
      evidence: []
    }
  ];

  // Filter audits
  const filteredAudits = mockAuditSessions.filter(audit => {
    if (filterStatus !== 'all' && audit.status !== filterStatus) return false;
    if (filterType !== 'all' && audit.type !== filterType) return false;
    if (searchTerm && !audit.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleStartAudit = async (auditId: string) => {
    const audit = mockAuditSessions.find(a => a.id === auditId);
    if (!audit) return;

    try {
      addNotification({
        title: 'Audit Started',
        message: `${audit.title} has been started`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });

      addAccessLog({
        entityType: 'audit',
        entityId: auditId,
        action: 'start',
        actor: currentUser?.name || 'Unknown',
        metadata: { auditTitle: audit.title, auditType: audit.type }
      });
    } catch (error) {
      console.error('Failed to start audit:', error);
    }
  };

  const handleCompleteAudit = async (auditId: string) => {
    const audit = mockAuditSessions.find(a => a.id === auditId);
    if (!audit) return;

    try {
      addNotification({
        title: 'Audit Completed',
        message: `${audit.title} has been marked as completed`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });

      addAccessLog({
        entityType: 'audit',
        entityId: auditId,
        action: 'complete',
        actor: currentUser?.name || 'Unknown',
        metadata: { auditTitle: audit.title }
      });
    } catch (error) {
      console.error('Failed to complete audit:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low':
      case 'Info':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const auditColumns: Column<AuditSessionExtended>[] = [
    {
      key: 'title',
      label: 'Audit',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            {getStatusIcon(row.status)}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'external' ? 'default' : 'secondary'} className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <StatusBadge status={value} />
        </div>
      )
    },
    {
      key: 'auditor',
      label: 'Auditor',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
            {value.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'findingsCount',
      label: 'Findings',
      render: (value) => (
        <div className="text-center">
          <span className="text-sm font-medium">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'completionPercentage',
      label: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${value || 0}%` }}
            ></div>
          </div>
          <span className="text-xs text-muted-foreground">{value || 0}%</span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'draft' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStartAudit(value)}
              data-testid={`button-start-${value}`}
            >
              Start
            </Button>
          )}
          {row.status === 'in_progress' && hasPermission(currentUser, 'run_internal_audits') && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleCompleteAudit(value)}
              data-testid={`button-complete-${value}`}
            >
              Complete
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => console.log('View audit details:', value)}
            data-testid={`button-view-${value}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>
      )
    }
  ];

  const findingColumns: Column<AuditFindingExtended>[] = [
    {
      key: 'title',
      label: 'Finding',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.description}</div>
        </div>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (value) => (
        <Badge className={getSeverityColor(value)} variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'assignee',
      label: 'Assignee',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
            {value.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Calculate audit stats
  const auditStats = {
    total: mockAuditSessions.length,
    inProgress: mockAuditSessions.filter(a => a.status === 'in_progress').length,
    completed: mockAuditSessions.filter(a => a.status === 'completed').length,
    scheduled: mockAuditSessions.filter(a => a.status === 'scheduled').length,
    findings: {
      total: mockAuditFindings.length,
      open: mockAuditFindings.filter(f => f.status === 'open').length,
      inProgress: mockAuditFindings.filter(f => f.status === 'in_progress').length,
      resolved: mockAuditFindings.filter(f => f.status === 'resolved').length
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Management</h1>
          <p className="text-muted-foreground">
            Plan, conduct, and track compliance audits and findings
          </p>
        </div>
        {hasPermission(currentUser, 'run_internal_audits') && (
          <Button data-testid="button-create-audit">
            <Plus className="mr-2 h-4 w-4" />
            New Audit
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{auditStats.total}</div>
            <p className="text-xs text-muted-foreground">Total Audits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{auditStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{auditStats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{auditStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Overview</CardTitle>
          <CardDescription>Current audit activities and findings summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Active Audits</h4>
              <div className="space-y-2">
                {mockAuditSessions.filter(a => a.status === 'in_progress').map(audit => (
                  <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{audit.title}</div>
                      <div className="text-xs text-muted-foreground">{audit.auditor}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{audit.completionPercentage}%</div>
                      <div className="text-xs text-muted-foreground">{audit.findingsCount} findings</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Findings Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-red-600">{auditStats.findings.open}</div>
                  <div className="text-xs text-muted-foreground">Open</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{auditStats.findings.inProgress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-green-600">{auditStats.findings.resolved}</div>
                  <div className="text-xs text-muted-foreground">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Audits and Findings */}
      <Tabs defaultValue="audits" className="w-full">
        <TabsList>
          <TabsTrigger value="audits">Audit Sessions</TabsTrigger>
          <TabsTrigger value="findings">Audit Findings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="audits" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search audits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="input-audit-search"
            />
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40" data-testid="filter-audit-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40" data-testid="filter-audit-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audits Table */}
          <DataTable
            data={filteredAudits}
            columns={auditColumns}
            getRowId={(row) => row.id}
            selectable={hasPermission(currentUser, 'run_internal_audits')}
            onSelectionChange={setSelectedAudits}
            onRowClick={(audit) => console.log('Navigate to audit detail:', audit.id)}
            emptyState={
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <h3 className="text-lg font-medium">No audits found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first audit'
                    }
                  </p>
                </div>
              </div>
            }
          />
        </TabsContent>
        
        <TabsContent value="findings" className="space-y-4">
          {/* Findings Table */}
          <DataTable
            data={mockAuditFindings}
            columns={findingColumns}
            getRowId={(row) => row.id}
            selectable={false}
            onRowClick={(finding) => console.log('Navigate to finding detail:', finding.id)}
            emptyState={
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <h3 className="text-lg font-medium">No findings</h3>
                  <p className="text-muted-foreground">
                    No audit findings have been recorded yet
                  </p>
                </div>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Findings
                </Button>
              </div>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}