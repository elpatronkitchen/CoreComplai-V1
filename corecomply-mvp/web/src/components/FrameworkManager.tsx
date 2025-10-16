import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  Plus,
  Download,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  Search,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import DataTable, { type Column } from './DataTable';
import type { Framework } from '@/types/framework';

export default function FrameworkManager() {
  const apiClient = useApiClient();
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFrameworkId, setActiveFrameworkId] = useState<number | null>(null);

  const canView = hasPermission('view_frameworks');
  const canManage = hasPermission('manage_frameworks');
  const canSelect = hasPermission('select_active_framework');

  // Fetch frameworks
  const { 
    data: frameworks = [], 
    isLoading,
    isError,
    refetch
  } = useQuery<Framework[]>({
    queryKey: ['/api/frameworks'],
    queryFn: async () => {
      const response = await apiClient.get('/api/frameworks');
      return response.data;
    },
    enabled: canView,
  });

  // Set active framework mutation
  const setActiveMutation = useMutation({
    mutationFn: async (frameworkId: number) => {
      // Fetch all frameworks fresh from API
      const allFrameworksResponse = await apiClient.get('/api/frameworks');
      const freshFrameworks: Framework[] = allFrameworksResponse.data;
      
      // Deactivate currently active frameworks using PATCH endpoint
      const activeFrameworks = freshFrameworks.filter(f => f.isActive && f.id !== frameworkId);
      for (const f of activeFrameworks) {
        await apiClient.patch(`/api/frameworks/${f.id}/deactivate`, {});
      }
      
      // Activate the selected framework using PATCH endpoint
      await apiClient.patch(`/api/frameworks/${frameworkId}/activate`, {});
      
      return frameworkId;
    },
    onSuccess: (frameworkId) => {
      // Only update local state after successful backend update
      setActiveFrameworkId(frameworkId);
      queryClient.invalidateQueries({ queryKey: ['/api/frameworks'], exact: false });
      const framework = frameworks.find(f => f.id === frameworkId);
      toast({
        title: 'Framework Activated',
        description: `${framework?.name} is now the active compliance framework`,
      });
    },
    onError: (error) => {
      // Don't update local state on error
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to activate framework',
        variant: 'destructive',
      });
    }
  });

  if (!canView) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to view frameworks. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter frameworks based on search
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(framework => 
      framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (framework.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  }, [frameworks, searchTerm]);

  // Set initial active framework from backend data
  useEffect(() => {
    if (activeFrameworkId === null && frameworks.length > 0) {
      const activeFramework = frameworks.find(f => f.isActive);
      if (activeFramework) {
        setActiveFrameworkId(activeFramework.id);
      }
    }
  }, [frameworks, activeFrameworkId]);

  const handleSetActiveFramework = (frameworkId: number) => {
    if (!canSelect) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to select the active framework',
        variant: 'destructive',
      });
      return;
    }

    setActiveMutation.mutate(frameworkId);
  };

  const columns: Column<Framework>[] = [
    {
      key: 'name',
      label: 'Framework',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-medium" data-testid={`text-framework-name-${row.id}`}>{value}</div>
            <div className="text-sm text-muted-foreground">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'id',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center gap-2">
          {activeFrameworkId === value ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 border-green-200" data-testid={`badge-active-${value}`}>
                Active
              </Badge>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-gray-400" />
              <Badge variant="secondary">Available</Badge>
            </>
          )}
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value) => (
        <div className="flex items-center gap-2">
          {activeFrameworkId !== value ? (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSetActiveFramework(value)}
              disabled={!canSelect || setActiveMutation.isPending}
              data-testid={`button-activate-${value}`}
            >
              Activate
            </Button>
          ) : (
            <Button size="sm" variant="ghost" disabled data-testid={`button-current-${value}`}>
              <CheckCircle className="w-4 w-4 mr-1" />
              Current
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => console.log('View framework details:', value)}
            data-testid={`button-view-${value}`}
          >
            View Details
          </Button>
        </div>
      )
    }
  ];

  const activeFrameworkData = frameworks.find(f => f.id === activeFrameworkId);

  const stats = {
    total: frameworks.length,
    active: frameworks.filter(f => f.isActive).length,
    available: frameworks.filter(f => !f.isActive).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading frameworks...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load frameworks. Please try again.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            data-testid="button-retry-frameworks"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-frameworks">Compliance Frameworks</h1>
          <p className="text-muted-foreground">
            Select and manage your compliance frameworks
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-export-frameworks">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button data-testid="button-add-framework">
              <Plus className="h-4 w-4 mr-2" />
              Add Framework
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Total Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-frameworks">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Available frameworks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-active-framework">
              {activeFrameworkData?.name || 'None'}
            </div>
            <p className="text-sm text-muted-foreground">Currently selected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-available-frameworks">{stats.available}</div>
            <p className="text-sm text-muted-foreground">Ready to activate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Shield className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="details" data-testid="tab-details">
            <Settings className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Frameworks</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search frameworks..."
                    className="pl-10 w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-frameworks"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={filteredFrameworks}
                columns={columns}
                getRowId={(row) => row.id.toString()}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {activeFrameworkData ? (
            <Card data-testid="card-framework-details">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {activeFrameworkData.name}
                </CardTitle>
                <CardDescription>
                  Version {activeFrameworkData.version} • Created {new Date(activeFrameworkData.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {activeFrameworkData.description || 'No description available'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Effective Date</h3>
                  <p className="text-muted-foreground">
                    {new Date(activeFrameworkData.effectiveDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Created By</h3>
                  <p className="text-muted-foreground">{activeFrameworkData.createdBy}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No active framework selected
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Framework Analytics</CardTitle>
              <CardDescription>
                Compliance metrics and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Analytics data will be available once controls are linked to frameworks
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
