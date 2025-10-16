import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Database, 
  Shield, 
  AlertCircle, 
  Loader2,
  Search
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import type { Asset } from '@/types/asset';

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'retired':
      return 'outline';
    default:
      return 'outline';
  }
}

function getClassificationColor(classification: string) {
  switch (classification.toLowerCase()) {
    case 'public':
      return 'outline';
    case 'internal':
      return 'default';
    case 'confidential':
      return 'secondary';
    case 'restricted':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function AssetsPage() {
  const apiClient = useApiClient();
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canManageAssets = hasPermission('manage_assets');
  const canViewAssets = hasPermission('view_assets');

  // Fetch assets
  const {
    data: assets = [],
    isLoading,
    isError,
    refetch
  } = useQuery<Asset[]>({
    queryKey: ['/api/assets', filterType, filterClassification],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterClassification !== 'all') params.append('classification', filterClassification);
      
      const url = `/api/assets${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: canViewAssets,
  });

  // Delete asset mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetId: number) => {
      await apiClient.delete(`/api/assets/${assetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'], exact: false });
      toast({
        title: 'Asset Deleted',
        description: 'Asset has been removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete asset',
        variant: 'destructive',
      });
    }
  });

  if (!canViewAssets) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You don't have permission to access assets.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Filter assets by search term
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (searchTerm && !asset.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [assets, searchTerm]);

  // Calculate stats
  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    hardware: assets.filter(a => a.type === 'hardware').length,
    software: assets.filter(a => a.type === 'software').length,
    data: assets.filter(a => a.type === 'data').length,
    confidential: assets.filter(a => a.classification === 'confidential' || a.classification === 'restricted').length,
  };

  const handleDelete = (assetId: number) => {
    if (!canManageAssets) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete assets',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('Are you sure you want to delete this asset?')) {
      deleteMutation.mutate(assetId);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading assets...</span>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load assets. Please try again.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              data-testid="button-retry-assets"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-assets">Asset Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor organizational assets
            </p>
          </div>
          {canManageAssets && (
            <Button data-testid="button-add-asset">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-assets">{stats.total}</div>
              <p className="text-sm text-muted-foreground">{stats.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-data-assets">{stats.data}</div>
              <p className="text-sm text-muted-foreground">Information assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Confidential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-confidential-assets">{stats.confidential}</div>
              <p className="text-sm text-muted-foreground">High classification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-system-assets">{stats.hardware + stats.software}</div>
              <p className="text-sm text-muted-foreground">Hardware & software</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all-assets" className="w-full">
          <TabsList>
            <TabsTrigger value="all-assets" data-testid="tab-all-assets">
              <FileText className="h-4 w-4 mr-2" />
              All Assets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-assets" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Assets Inventory</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="data">Data</SelectItem>
                        <SelectItem value="facility">Facility</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterClassification} onValueChange={setFilterClassification}>
                      <SelectTrigger className="w-[180px]" data-testid="select-filter-classification">
                        <SelectValue placeholder="Filter by classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classifications</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search assets..."
                        className="pl-10 w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="input-search-assets"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAssets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset) => (
                        <TableRow key={asset.id} data-testid={`row-asset-${asset.id}`}>
                          <TableCell className="font-medium">
                            <div>
                              <div data-testid={`text-asset-name-${asset.id}`}>{asset.name}</div>
                              {asset.description && (
                                <div className="text-sm text-muted-foreground">{asset.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{asset.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getClassificationColor(asset.classification)} className="capitalize">
                              {asset.classification}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.owner}</TableCell>
                          <TableCell>{asset.location}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(asset.status)} className="capitalize">
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {asset.value ? `$${asset.value.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-view-${asset.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canManageAssets && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    data-testid={`button-edit-${asset.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(asset.id)}
                                    disabled={deleteMutation.isPending}
                                    data-testid={`button-delete-${asset.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No assets found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
