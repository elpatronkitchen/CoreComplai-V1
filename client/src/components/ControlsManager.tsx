import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  MoreHorizontal,
  Plus,
  Filter,
  Download,
  Upload,
  CheckSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import DataTable, { type Column } from './DataTable';
import StatusBadge from './StatusBadge';
import FileUploader from './FileUploader';
import type { Control } from '@shared/schema';
import { mockCsvExport } from '@/lib/mockApi';

export default function ControlsManager() {
  const { 
    controls: apgfControls, 
    currentUser, 
    updateControl, 
    addNotification, 
    addAccessLog,
    activeFramework 
  } = useAppStore();
  
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');

  // Map activeFramework IDs to internal framework codes
  const selectedFramework = activeFramework === 'apgf-ms' ? 'APGF' :
                           activeFramework === 'iso-9001' ? 'ISO9001' :
                           activeFramework === 'iso-27001' ? 'ISO27001' :
                           'APGF';

  // Reset filters when framework changes
  useEffect(() => {
    setFilterStatus('all');
    setFilterOwner('all');
    setSelectedControls([]);
  }, [activeFramework]);

  // Fetch ISO 9001 controls
  const { data: iso9001Controls = [] } = useQuery<any[]>({
    queryKey: ['/api/controls/iso9001'],
    enabled: selectedFramework === 'ISO9001'
  });

  // Fetch ISO 27001 controls
  const { data: iso27001Controls = [] } = useQuery<any[]>({
    queryKey: ['/api/controls/iso27001'],
    enabled: selectedFramework === 'ISO27001'
  });

  // Combine controls based on active framework
  const allControls = selectedFramework === 'APGF' ? apgfControls :
                      selectedFramework === 'ISO9001' ? iso9001Controls :
                      selectedFramework === 'ISO27001' ? iso27001Controls :
                      apgfControls;

  // Filter controls based on filters
  const filteredControls = allControls.filter((control: any) => {
    if (filterStatus !== 'all' && control.status !== filterStatus) return false;
    if (filterOwner !== 'all' && control.owner !== filterOwner) return false;
    return true;
  });

  // Get unique owners for filter
  const uniqueOwners = Array.from(new Set(allControls.map((c: any) => c.owner)));

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedControls.length === 0) return;

    try {
      selectedControls.forEach(controlId => {
        updateControl(controlId, { status: bulkStatus as any });
        addAccessLog({
          entityType: 'control',
          entityId: controlId,
          action: 'update',
          actor: currentUser?.name || 'Unknown',
          metadata: { field: 'status', newValue: bulkStatus }
        });
      });

      addNotification({
        title: 'Controls Updated',
        message: `${selectedControls.length} controls updated to ${bulkStatus}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });

      setSelectedControls([]);
      setBulkStatus('');
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const handleExportSelected = async () => {
    const selectedData = allControls.filter((c: any) => selectedControls.includes(c.id));
    try {
      await mockCsvExport(selectedData, `controls-export-${new Date().toISOString().split('T')[0]}.csv`);
      addNotification({
        title: 'Export Complete',
        message: `${selectedData.length} controls exported successfully`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      console.error('Export failed:', error);
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
          <div className="text-sm text-muted-foreground">{row.category}</div>
        </div>
      )
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
            {value.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <span>{value}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Unassigned</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  const statusCounts = {
    total: allControls.length,
    compliant: allControls.filter((c: any) => c.status === 'Compliant').length,
    inProgress: allControls.filter((c: any) => c.status === 'In Progress').length,
    pending: allControls.filter((c: any) => c.status === 'Evidence Pending').length,
    notStarted: allControls.filter((c: any) => c.status === 'Not Started').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controls Management</h1>
          <p className="text-muted-foreground">
            Manage compliance controls, track progress, and upload evidence
          </p>
        </div>
        {hasPermission(currentUser, 'manage_controls') && (
          <Button data-testid="button-create-control">
            <Plus className="mr-2 h-4 w-4" />
            New Control
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">Total Controls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{statusCounts.compliant}</div>
            <p className="text-xs text-muted-foreground">Compliant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">Pending Evidence</p>
          </CardContent>
        </Card>
        <Card>
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
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedControls.length > 0 && hasPermission(currentUser, 'manage_controls') && (
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
              disabled={!bulkStatus}
              data-testid="button-bulk-update"
            >
              Update {selectedControls.length} controls
            </Button>
          </div>
        )}
      </div>

      {/* Export Actions */}
      {selectedControls.length > 0 && hasPermission(currentUser, 'export_reports') && (
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
        selectable={hasPermission(currentUser, 'manage_controls')}
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