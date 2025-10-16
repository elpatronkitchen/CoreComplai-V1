import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  PlugZap, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Key,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useApiClient } from '@/lib/api-client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import type { Integration, CreateIntegrationRequest } from '@/types/integration';

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'configuring':
      return <Key className="h-4 w-4 text-yellow-600" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'disconnected':
      return <Clock className="h-4 w-4 text-gray-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'connected':
      return 'default';
    case 'configuring':
      return 'secondary';
    case 'error':
      return 'destructive';
    case 'disconnected':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function IntegrationsPage() {
  const apiClient = useApiClient();
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<CreateIntegrationRequest & { status?: string }>({
    name: '',
    type: 'payroll',
    configuration: '',
    apiKey: '',
    endpoint: '',
  });

  const canManage = hasPermission('manage_integrations');
  const canView = hasPermission('view_integrations');

  // Fetch integrations
  const {
    data: integrations = [],
    isLoading,
    isError,
    refetch
  } = useQuery<Integration[]>({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      const response = await apiClient.get('/api/integrations');
      return response.data;
    },
  });

  // Create integration mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateIntegrationRequest) => {
      const response = await apiClient.post('/api/integrations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'], exact: false });
      toast({
        title: 'Success',
        description: 'Integration created successfully',
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create integration',
        variant: 'destructive',
      });
    },
  });

  // Update integration mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiClient.put(`/api/integrations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'], exact: false });
      toast({
        title: 'Success',
        description: 'Integration updated successfully',
      });
      setDialogOpen(false);
      setEditingIntegration(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update integration',
        variant: 'destructive',
      });
    },
  });

  // Delete integration mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'], exact: false });
      toast({
        title: 'Success',
        description: 'Integration deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete integration',
        variant: 'destructive',
      });
    },
  });

  // Sync integration mutation
  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/api/integrations/${id}/sync`, {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'], exact: false });
      toast({
        title: 'Sync Initiated',
        description: data.message || 'Integration sync started',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to sync integration',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'payroll',
      configuration: '',
      apiKey: '',
      endpoint: '',
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingIntegration(null);
    setDialogOpen(true);
  };

  const openEditDialog = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      status: integration.status,
      configuration: integration.configuration || '',
      apiKey: integration.apiKey || '',
      endpoint: integration.endpoint || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIntegration) {
      updateMutation.mutate({
        id: editingIntegration.id,
        data: {
          name: formData.name,
          type: formData.type,
          status: formData.status || 'disconnected',
          configuration: formData.configuration,
          apiKey: formData.apiKey,
          endpoint: formData.endpoint,
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        type: formData.type,
        configuration: formData.configuration,
        apiKey: formData.apiKey,
        endpoint: formData.endpoint,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSync = (id: number) => {
    syncMutation.mutate(id);
  };

  if (!canView) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view integrations. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const filteredIntegrations = integrations.filter(integration => {
    const typeMatch = filterType === 'all' || integration.type.toLowerCase() === filterType.toLowerCase();
    const statusMatch = filterStatus === 'all' || integration.status.toLowerCase() === filterStatus;
    return typeMatch && statusMatch;
  });

  const integrationTypes = Array.from(new Set(integrations.map(i => i.type)));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-integrations">Integrations</h1>
            <p className="text-muted-foreground">
              Manage payroll, HR, and data integrations
            </p>
          </div>
          {canManage && (
            <Button onClick={openCreateDialog} data-testid="button-create-integration">
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {integrationTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="disconnected">Disconnected</SelectItem>
              <SelectItem value="configuring">Configuring</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading integrations...</span>
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load integrations. Please try again.</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : filteredIntegrations.length > 0 ? (
          <div className="grid gap-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlugZap className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-integration-name-${integration.id}`}>
                          {integration.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{integration.type}</Badge>
                          {integration.lastSync && (
                            <span className="text-xs">
                              Last sync: {new Date(integration.lastSync).toLocaleString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(integration.status)} className="flex items-center gap-1">
                        {getStatusIcon(integration.status)}
                        {integration.status}
                      </Badge>
                      {canManage && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSync(integration.id)}
                            disabled={syncMutation.isPending}
                            data-testid={`button-sync-${integration.id}`}
                          >
                            <RefreshCw className={`h-3 w-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(integration)}
                            data-testid={`button-edit-${integration.id}`}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(integration.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${integration.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {integration.endpoint && (
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground">
                      Endpoint: {integration.endpoint}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PlugZap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No integrations found</p>
            {canManage && (
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Integration
              </Button>
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent data-testid="dialog-integration-form">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingIntegration ? 'Edit Integration' : 'Create Integration'}
                </DialogTitle>
                <DialogDescription>
                  {editingIntegration 
                    ? 'Update the integration configuration' 
                    : 'Add a new integration to connect external systems'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Employment Hero Payroll"
                    required
                    data-testid="input-integration-name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger data-testid="select-integration-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="accounting">Accounting</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingIntegration && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger data-testid="select-integration-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="connected">Connected</SelectItem>
                        <SelectItem value="disconnected">Disconnected</SelectItem>
                        <SelectItem value="configuring">Configuring</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint || ''}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    data-testid="input-integration-endpoint"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey || ''}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Enter API key"
                    data-testid="input-integration-apikey"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="configuration">Configuration (JSON)</Label>
                  <Input
                    id="configuration"
                    value={formData.configuration || ''}
                    onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                    placeholder='{"timeout": 30, "retries": 3}'
                    data-testid="input-integration-config"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingIntegration ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
