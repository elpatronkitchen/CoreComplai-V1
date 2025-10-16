import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MoreHorizontal,
  Plus,
  Filter,
  Download,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  Archive
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import DataTable, { type Column } from './DataTable';
import StatusBadge from './StatusBadge';
import type { Policy } from '@shared/schema';
import { mockCsvExport } from '@/lib/mockApi';

export default function PolicyManager() {
  const { 
    policies, 
    currentUser, 
    updatePolicy, 
    addNotification, 
    addAccessLog,
    activeFramework
  } = useAppStore();
  
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');

  // First filter by active framework only
  const frameworkPolicies = policies.filter(policy => policy.frameworkId === activeFramework);
  
  // Then apply other filters
  const filteredPolicies = frameworkPolicies.filter(policy => {
    if (filterStatus !== 'all' && policy.status !== filterStatus) return false;
    if (filterOwner !== 'all' && policy.owner !== filterOwner) return false;
    return true;
  });

  // Get unique owners from framework-specific policies only
  const uniqueOwners = Array.from(new Set(frameworkPolicies.map(p => p.owner)));

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedPolicies.length === 0) return;

    try {
      selectedPolicies.forEach(policyId => {
        updatePolicy(policyId, { status: bulkStatus as any });
        addAccessLog({
          entityType: 'policy',
          entityId: policyId,
          action: 'update',
          actor: currentUser?.name || 'Unknown',
          metadata: { field: 'status', newValue: bulkStatus }
        });
      });

      addNotification({
        title: 'Policies Updated',
        message: `${selectedPolicies.length} policies updated to ${bulkStatus}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });

      setSelectedPolicies([]);
      setBulkStatus('');
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const handleExportSelected = async () => {
    const selectedData = policies.filter(p => selectedPolicies.includes(p.id));
    try {
      await mockCsvExport(selectedData, `policies-export-${new Date().toISOString().split('T')[0]}.csv`);
      addNotification({
        title: 'Export Complete',
        message: `${selectedData.length} policies exported successfully`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Published':
        return <CheckCircle className="w-4 h-4" />;
      case 'Draft':
        return <Clock className="w-4 h-4" />;
      case 'Archived':
        return <Archive className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const columns: Column<Policy>[] = [
    {
      key: 'id',
      label: 'Policy ID',
      sortable: true,
      width: 'w-32',
      render: (value) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">Version {row.version}</div>
        </div>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
            {value.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <span>{value}</span>
        </div>
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
      key: 'effectiveFrom',
      label: 'Effective Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      )
    }
  ];

  // Calculate status counts from framework-specific policies only
  const statusCounts = {
    total: frameworkPolicies.length,
    published: frameworkPolicies.filter(p => p.status === 'Published').length,
    draft: frameworkPolicies.filter(p => p.status === 'Draft').length,
    archived: frameworkPolicies.filter(p => p.status === 'Archived').length,
  };

  // Get framework name for display
  const frameworks = useAppStore(state => state.frameworks);
  const selectedFramework = frameworks.find(f => f.id === activeFramework);
  const frameworkName = selectedFramework?.name || "APGF-MS";
  const frameworkDesc = selectedFramework?.description || "Australian Payroll Governance Management System Framework";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Policy Management</h1>
          <p className="text-muted-foreground">
            {frameworkDesc} ({frameworkName}) - Policies
          </p>
        </div>
        {hasPermission(currentUser, 'manage_policies') && (
          <Button data-testid="button-create-policy">
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">Total Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{statusCounts.published}</div>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.draft}</div>
            <p className="text-xs text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.archived}</div>
            <p className="text-xs text-muted-foreground">Archived</p>
          </CardContent>
        </Card>
      </div>

      {/* Policy Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Lifecycle</CardTitle>
          <CardDescription>Track policies through their lifecycle stages</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Policies</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {statusCounts.published} published policies currently in effect
              </div>
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {statusCounts.draft} policies in draft status awaiting review
              </div>
            </TabsContent>
            <TabsContent value="archived" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {statusCounts.archived} archived policies for historical reference
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40" data-testid="filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterOwner} onValueChange={setFilterOwner}>
            <SelectTrigger className="w-40" data-testid="filter-owner">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {uniqueOwners.map(owner => (
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPolicies.length > 0 && hasPermission(currentUser, 'manage_policies') && (
          <div className="flex items-center gap-2">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-40" data-testid="bulk-status-select">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus}
              data-testid="button-bulk-update"
            >
              Update {selectedPolicies.length} policies
            </Button>
          </div>
        )}
      </div>

      {/* Export Actions */}
      {selectedPolicies.length > 0 && hasPermission(currentUser, 'view_policies') && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportSelected}
            data-testid="button-export-selected"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Selected ({selectedPolicies.length})
          </Button>
        </div>
      )}

      {/* Policies Table */}
      <DataTable
        data={filteredPolicies}
        columns={columns}
        getRowId={(row) => row.id}
        selectable={hasPermission(currentUser, 'manage_policies')}
        onSelectionChange={setSelectedPolicies}
        onRowClick={(policy) => console.log('Navigate to policy detail:', policy.id)}
        emptyState={
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <h3 className="text-lg font-medium">No policies found</h3>
              <p className="text-muted-foreground">
                {filterStatus !== 'all' || filterOwner !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first policy'
                }
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        }
      />
    </div>
  );
}