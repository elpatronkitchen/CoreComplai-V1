import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  CheckSquare
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api-client';
import { useUser } from '@/contexts/UserContext';
import { queryClient } from '@/lib/queryClient';
import DataTable, { type Column } from './DataTable';
import StatusBadge from './StatusBadge';
import type { Control } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

export default function ControlsManager() {
  const { hasPermission } = useUser();
  const api = useApiClient();
  const { toast } = useToast();
  
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');

  // Fetch controls
  const { data: controls = [], isLoading, isError } = useQuery<Control[]>({
    queryKey: ['/api/controls'],
    queryFn: () => api.get<Control[]>('/controls'),
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ controlIds, status }: { controlIds: string[]; status: string }) => {
      await Promise.all(
        controlIds.map(id => 
          api.put(`/controls/${id}`, { status })
        )
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/controls'] });
      toast({
        title: 'Controls Updated',
        description: `${variables.controlIds.length} controls updated to ${variables.status}`,
      });
      setSelectedControls([]);
      setBulkStatus('');
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update controls. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter controls based on filters
  const filteredControls = controls.filter(control => {
    if (filterStatus !== 'all' && control.status !== filterStatus) return false;
    if (filterOwner !== 'all' && control.owner !== filterOwner) return false;
    return true;
  });

  // Get unique owners for filter
  const uniqueOwners = Array.from(new Set(controls.map(c => c.owner).filter(Boolean)));

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedControls.length === 0) return;
    bulkUpdateMutation.mutate({ controlIds: selectedControls, status: bulkStatus });
  };

  const handleExportSelected = async () => {
    const selectedData = controls.filter(c => selectedControls.includes(c.id));
    try {
      const csv = selectedData.map(c => Object.values(c).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `controls-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: `${selectedData.length} controls exported successfully`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export controls. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const columns: Column<Control>[] = [
    {
      key: 'id',
      label: 'Control ID',
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
          <div className="text-sm text-muted-foreground">{row.description}</div>
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
            {value ? value.split(' ').map((n: string) => n[0]).join('') : '?'}
          </div>
          <span>{value || 'Unassigned'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />
    }
  ];

  const statusCounts = {
    total: controls.length,
    compliant: controls.filter(c => c.status === 'Compliant').length,
    inProgress: controls.filter(c => c.status === 'In Progress').length,
    pending: controls.filter(c => c.status === 'Evidence Pending').length,
    notStarted: controls.filter(c => c.status === 'Not Started').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Loading Controls...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CheckSquare className="h-12 w-12 text-destructive mx-auto mb-4" />
          <div className="text-lg font-medium">Failed to load controls</div>
          <div className="text-sm text-muted-foreground mb-4">Unable to connect to the server</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/controls'] })}>
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
          <h1 className="text-3xl font-bold" data-testid="heading-controls">Controls Management</h1>
          <p className="text-muted-foreground">
            Manage compliance controls, track progress, and upload evidence
          </p>
        </div>
        {hasPermission('manage_controls') && (
          <Button data-testid="button-create-control">
            <Plus className="mr-2 h-4 w-4" />
            New Control
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card data-testid="card-total-controls">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">Total Controls</p>
          </CardContent>
        </Card>
        <Card data-testid="card-compliant-controls">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{statusCounts.compliant}</div>
            <p className="text-xs text-muted-foreground">Compliant</p>
          </CardContent>
        </Card>
        <Card data-testid="card-inprogress-controls">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card data-testid="card-pending-controls">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">Pending Evidence</p>
          </CardContent>
        </Card>
        <Card data-testid="card-notstarted-controls">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.notStarted}</div>
            <p className="text-xs text-muted-foreground">Not Started</p>
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
              <SelectItem value="Compliant">Compliant</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Evidence Pending">Evidence Pending</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Audit Ready">Audit Ready</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterOwner} onValueChange={setFilterOwner}>
            <SelectTrigger className="w-40" data-testid="filter-owner">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {uniqueOwners.map(owner => (
                <SelectItem key={owner} value={owner!}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedControls.length > 0 && hasPermission('manage_controls') && (
          <div className="flex items-center gap-2">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-40" data-testid="bulk-status-select">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compliant">Compliant</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Evidence Pending">Evidence Pending</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="Audit Ready">Audit Ready</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus || bulkUpdateMutation.isPending}
              data-testid="button-bulk-update"
            >
              {bulkUpdateMutation.isPending ? 'Updating...' : `Update ${selectedControls.length} controls`}
            </Button>
          </div>
        )}
      </div>

      {/* Export Actions */}
      {selectedControls.length > 0 && hasPermission('export_reports') && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportSelected}
            data-testid="button-export-selected"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Selected ({selectedControls.length})
          </Button>
        </div>
      )}

      {/* Controls Table */}
      <DataTable
        data={filteredControls}
        columns={columns}
        getRowId={(row) => row.id}
        selectable={hasPermission('manage_controls')}
        onSelectionChange={setSelectedControls}
        onRowClick={(control) => console.log('Navigate to control detail:', control.id)}
        emptyState={
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <h3 className="text-lg font-medium">No controls found</h3>
              <p className="text-muted-foreground">
                {filterStatus !== 'all' || filterOwner !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first control'
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
