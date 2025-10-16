import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus,
  Download,
  FileText,
  Clock,
  CheckCircle,
  Archive
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api-client';
import { useUser } from '@/contexts/UserContext';
import { queryClient } from '@/lib/queryClient';
import DataTable, { type Column } from './DataTable';
import StatusBadge from './StatusBadge';
import type { Policy } from '@/types/policy';
import { useToast } from '@/hooks/use-toast';

export default function PolicyManager() {
  const { hasPermission } = useUser();
  const api = useApiClient();
  const { toast } = useToast();
  
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');

  // Fetch policies
  const { data: policies = [], isLoading, isError } = useQuery<Policy[]>({
    queryKey: ['/api/policies'],
    queryFn: () => api.get<Policy[]>('/policies'),
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ policyIds, status }: { policyIds: string[]; status: string }) => {
      await Promise.all(
        policyIds.map(id => 
          api.put(`/policies/${id}`, { status })
        )
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/policies'] });
      toast({
        title: 'Policies Updated',
        description: `${variables.policyIds.length} policies updated to ${variables.status}`,
      });
      setSelectedPolicies([]);
      setBulkStatus('');
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update policies. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter policies based on filters
  const filteredPolicies = policies.filter(policy => {
    if (filterStatus !== 'all' && policy.status !== filterStatus) return false;
    if (filterOwner !== 'all' && policy.owner !== filterOwner) return false;
    return true;
  });

  // Get unique owners for filter
  const uniqueOwners = Array.from(new Set(policies.map(p => p.owner)));

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedPolicies.length === 0) return;
    bulkUpdateMutation.mutate({ policyIds: selectedPolicies, status: bulkStatus });
  };

  const handleExportSelected = async () => {
    const selectedData = policies.filter(p => selectedPolicies.includes(p.id));
    try {
      const csv = selectedData.map(p => Object.values(p).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `policies-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: `${selectedData.length} policies exported successfully`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export policies. Please try again.',
        variant: 'destructive',
      });
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

  const statusCounts = {
    total: policies.length,
    published: policies.filter(p => p.status === 'Published').length,
    draft: policies.filter(p => p.status === 'Draft').length,
    archived: policies.filter(p => p.status === 'Archived').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Loading Policies...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
          <div className="text-lg font-medium">Failed to load policies</div>
          <div className="text-sm text-muted-foreground mb-4">Unable to connect to the server</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/policies'] })}>
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
          <h1 className="text-3xl font-bold" data-testid="heading-policies">Policy Management</h1>
          <p className="text-muted-foreground">
            Manage organizational policies, track versions, and control publication
          </p>
        </div>
        {hasPermission('manage_policies') && (
          <Button data-testid="button-create-policy">
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-policies">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">Total Policies</p>
          </CardContent>
        </Card>
        <Card data-testid="card-published-policies">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{statusCounts.published}</div>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card data-testid="card-draft-policies">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.draft}</div>
            <p className="text-xs text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card data-testid="card-archived-policies">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.archived}</div>
            <p className="text-xs text-muted-foreground">Archived</p>
          </CardContent>
        </Card>
      </div>

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

        {selectedPolicies.length > 0 && hasPermission('manage_policies') && (
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
              disabled={!bulkStatus || bulkUpdateMutation.isPending}
              data-testid="button-bulk-update"
            >
              {bulkUpdateMutation.isPending ? 'Updating...' : `Update ${selectedPolicies.length} policies`}
            </Button>
          </div>
        )}
      </div>

      {/* Export Actions */}
      {selectedPolicies.length > 0 && hasPermission('export_reports') && (
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
        selectable={hasPermission('manage_policies')}
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
            <Button variant="outline" size="sm" data-testid="button-export-all">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        }
      />
    </div>
  );
}
