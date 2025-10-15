import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api-client';
import { useUser } from '@/contexts/UserContext';
import { formatRole } from '@/lib/permissions';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface Framework {
  id: number;
  name: string;
  code: string;
  description: string;
  version: string;
  status: string;
}

export default function OnboardingPage() {
  const apiClient = useApiClient();
  const { hasPermission, user } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const canSelectFramework = hasPermission('select_active_framework');

  // Fetch frameworks
  const { 
    data: frameworks = [], 
    isLoading: isLoadingFrameworks,
    isError: isFrameworksError,
    error: frameworksError,
    refetch: refetchFrameworks
  } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: async () => {
      const response = await apiClient.get<Framework[]>('/api/frameworks');
      return response.data;
    }
  });

  // Get active framework
  const activeFramework = frameworks.find(f => f.status === 'active');

  // Activate framework mutation
  const activateMutation = useMutation({
    mutationFn: async (frameworkId: number) => {
      const response = await apiClient.patch(`/api/frameworks/${frameworkId}/activate`);
      return response.data;
    },
    onSuccess: (_, frameworkId) => {
      const selectedFramework = frameworks.find(f => f.id === frameworkId);
      queryClient.invalidateQueries({ queryKey: ['/api/frameworks'], exact: false });
      toast({
        title: 'Framework Selected',
        description: `${selectedFramework?.name} is now the active framework`,
      });
      // Redirect to dashboard after successful activation
      setTimeout(() => setLocation('/'), 1000);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to activate framework',
        variant: 'destructive',
      });
    }
  });

  const handleFrameworkSelect = (frameworkId: number) => {
    if (!canSelectFramework) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to select the active framework',
        variant: 'destructive',
      });
      return;
    }

    activateMutation.mutate(frameworkId);
  };

  if (isLoadingFrameworks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isFrameworksError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to Load Frameworks</CardTitle>
            <CardDescription>
              There was a problem loading the compliance frameworks. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Error: {frameworksError instanceof Error ? frameworksError.message : 'Unknown error'}
            </div>
            <Button 
              onClick={() => refetchFrameworks()} 
              className="w-full"
              data-testid="button-retry-frameworks"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeFramework) {
    const selectedFramework = activeFramework;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Setup Complete</h1>
            <p className="text-muted-foreground">
              {selectedFramework?.name} has been configured as your active compliance framework
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Framework</CardTitle>
              <CardDescription>Your organization is now using the following framework</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{selectedFramework?.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedFramework?.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">Version {selectedFramework?.version}</div>
                </div>
                <Badge>Active</Badge>
              </div>
              
              <div className="mt-6">
                <Button className="w-full" data-testid="button-continue-dashboard" onClick={() => setLocation('/')}>
                  Continue to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Welcome to CoreComply</h1>
          <p className="text-muted-foreground">
            Let's get started by selecting your compliance framework
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Compliance Framework</CardTitle>
            <CardDescription>
              Choose the framework that best matches your organization's compliance requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canSelectFramework ? (
              <div className="text-center py-8">
                <div className="text-lg font-medium mb-2">Framework Selection Required</div>
                <p className="text-muted-foreground mb-4">
                  A compliance framework must be selected before you can proceed. 
                  Please contact your Compliance Owner or System Administrator.
                </p>
                <div className="text-sm text-muted-foreground">
                  Current role: <Badge variant="outline">{formatRole(user?.role || '')}</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {frameworks.map((framework) => (
                  <Button
                    key={framework.id}
                    variant="outline"
                    className="w-full h-auto p-4 justify-start text-left"
                    onClick={() => handleFrameworkSelect(framework.id)}
                    disabled={activateMutation.isPending}
                    data-testid={`button-framework-${framework.code}`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">{framework.name}</div>
                      <div className="text-sm text-muted-foreground">{framework.description}</div>
                      <div className="text-xs text-muted-foreground">Version {framework.version}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {canSelectFramework && (
          <div className="text-center text-sm text-muted-foreground">
            <p>This selection can be changed later in the Frameworks section</p>
          </div>
        )}
      </div>
    </div>
  );
}