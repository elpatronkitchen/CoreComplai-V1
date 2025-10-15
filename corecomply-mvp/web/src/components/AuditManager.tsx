import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  FileText,
  Activity,
  Eye,
  Loader2
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DataTable, { type Column } from './DataTable';
import StatusBadge from './StatusBadge';
import type { Audit, AuditFinding, AuditStats } from '@/types/audit';

export default function AuditManager() {
  const { hasPermission } = useUser();
  const apiClient = useApiClient();
  const { toast } = useToast();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch audits
  const { data: audits = [], isLoading: auditsLoading, error: auditsError } = useQuery<Audit[]>({
    queryKey: ['/api/audits'],
    queryFn: async () => {
      const response = await apiClient.get('/api/audits');
      return response.data;
    }
  });

  // Fetch findings
  const { data: findings = [], isLoading: findingsLoading, error: findingsError } = useQuery<AuditFinding[]>({
    queryKey: ['/api/findings'],
    queryFn: async () => {
      const response = await apiClient.get('/api/findings');
      return response.data;
    }
  });

  // Start audit mutation
  const startAuditMutation = useMutation({
    mutationFn: async (auditId: number) => {
      // Fetch current audit state from API to ensure we have the latest data
      const response = await apiClient.get(`/api/audits/${auditId}`);
      const audit = response.data;
      
      // Update only the status field, excluding navigation properties and frontend-only fields
      await apiClient.put(`/api/audits/${auditId}`, {
        id: audit.id,
        auditType: audit.auditType || audit.type,  // backend uses auditType
        title: audit.title,
        status: 'in_progress',
        startDate: audit.startDate,
        endDate: audit.endDate,
        auditor: audit.auditor,
        scope: audit.scope,
        createdAt: audit.createdAt,
        createdBy: audit.createdBy || 'system'  // required by backend
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audits'], exact: false });
      toast({
        title: 'Success',
        description: 'Audit has been started',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start audit',
        variant: 'destructive',
      });
    }
  });

  // Complete audit mutation
  const completeAuditMutation = useMutation({
    mutationFn: async (auditId: number) => {
      // Fetch current audit state from API to ensure we have the latest data
      const response = await apiClient.get(`/api/audits/${auditId}`);
      const audit = response.data;
      
      // Update only the status field, excluding navigation properties and frontend-only fields
      await apiClient.put(`/api/audits/${auditId}`, {
        id: audit.id,
        auditType: audit.auditType || audit.type,  // backend uses auditType
        title: audit.title,
        status: 'completed',
        startDate: audit.startDate,
        endDate: audit.endDate,
        auditor: audit.auditor,
        scope: audit.scope,
        createdAt: audit.createdAt,
        createdBy: audit.createdBy || 'system'  // required by backend
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audits'], exact: false });
      toast({
        title: 'Success',
        description: 'Audit has been completed',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete audit',
        variant: 'destructive',
      });
    }
  });

  // Filter audits
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      if (filterStatus !== 'all' && audit.status !== filterStatus) return false;
      if (filterType !== 'all' && audit.type !== filterType) return false;
      if (searchTerm && !audit.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [audits, filterStatus, filterType, searchTerm]);

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

  const auditColumns: Column<Audit>[] = [
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
      render: (_value, row) => (
        <div className="text-center">
          <span className="text-sm font-medium">{row.findings?.length || 0}</span>
        </div>
      )
    },
    {
      key: 'completionPercentage',
      label: 'Progress',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${row.completionPercentage || 0}%` }}
            ></div>
          </div>
          <span className="text-xs text-muted-foreground">{row.completionPercentage || 0}%</span>
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
              onClick={() => startAuditMutation.mutate(value)}
              disabled={startAuditMutation.isPending || auditsLoading}
              data-testid={`button-start-${value}`}
            >
              Start
            </Button>
          )}
          {row.status === 'in_progress' && hasPermission('run_internal_audits') && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => completeAuditMutation.mutate(value)}
              disabled={completeAuditMutation.isPending || auditsLoading}
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

  const findingColumns: Column<AuditFinding>[] = [
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
  const auditStats: AuditStats = useMemo(() => ({
    total: audits.length,
    inProgress: audits.filter(a => a.status === 'in_progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
    scheduled: audits.filter(a => a.status === 'scheduled').length,
    findings: {
      total: findings.length,
      open: findings.filter(f => f.status === 'open').length,
      inProgress: findings.filter(f => f.status === 'in_progress').length,
      resolved: findings.filter(f => f.status === 'resolved').length
    }
  }), [audits, findings]);

  // Loading state
  if (auditsLoading || findingsLoading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-audits">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading audit data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (auditsError || findingsError) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="error-audits">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2">Failed to load audit data</h3>
          <p className="text-muted-foreground mb-4">
            {(auditsError as Error)?.message || (findingsError as Error)?.message || 'An error occurred'}
          </p>
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/audits'] });
              queryClient.invalidateQueries({ queryKey: ['/api/findings'] });
            }}
            data-testid="button-retry-audits"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
        {hasPermission('run_internal_audits') && (
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
            <div className="text-2xl font-bold" data-testid="stat-total-audits">{auditStats.total}</div>
            <p className="text-xs text-muted-foreground">Total Audits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-in-progress">{auditStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-completed">{auditStats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-scheduled">{auditStats.scheduled}</div>
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
                {audits.filter(a => a.status === 'in_progress').length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No active audits</p>
                ) : (
                  audits.filter(a => a.status === 'in_progress').map(audit => (
                    <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{audit.title}</div>
                        <div className="text-xs text-muted-foreground">{audit.auditor}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{audit.completionPercentage || 0}%</div>
                        <div className="text-xs text-muted-foreground">{audit.findings?.length || 0} findings</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Findings Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-red-600" data-testid="stat-findings-open">{auditStats.findings.open}</div>
                  <div className="text-xs text-muted-foreground">Open</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-blue-600" data-testid="stat-findings-in-progress">{auditStats.findings.inProgress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-green-600" data-testid="stat-findings-resolved">{auditStats.findings.resolved}</div>
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
            getRowId={(row) => String(row.id)}
            selectable={hasPermission('run_internal_audits')}
            onSelectionChange={() => {}}
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
            data={findings}
            columns={findingColumns}
            getRowId={(row) => String(row.id)}
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
