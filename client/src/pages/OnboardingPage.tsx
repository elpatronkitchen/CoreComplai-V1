import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission, formatRole } from '@/lib/permissions';

export default function OnboardingPage() {
  const { currentUser, activeFramework, frameworks, setActiveFramework, addNotification } = useAppStore();

  const canSelectFramework = hasPermission(currentUser, 'select_active_framework');

  const handleFrameworkSelect = (frameworkId: string) => {
    if (!canSelectFramework) {
      addNotification({
        title: 'Access Denied',
        message: 'You do not have permission to select the active framework',
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      });
      return;
    }

    setActiveFramework(frameworkId);
    addNotification({
      title: 'Framework Selected',
      message: `${frameworks.find(f => f.id === frameworkId)?.name} is now the active framework`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    });
  };

  if (activeFramework) {
    const selectedFramework = frameworks.find(f => f.id === activeFramework);
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
                <Button className="w-full" onClick={() => window.location.href = '/'}>
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
                  Current role: <Badge variant="outline">{formatRole(currentUser?.role || '')}</Badge>
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
                    data-testid={`framework-${framework.id}`}
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