import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Shield, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePeopleStore } from '@/stores/usePeopleStore';
import { useTasksStore } from '@/stores/useTasksStore';

const STEPS = [
  { id: 1, name: 'ISMS Scope', description: 'Define information security scope' },
  { id: 2, name: 'Key Roles', description: 'Assign security roles' },
  { id: 3, name: 'Bootstrap', description: 'Seed Annex A controls and SoA' },
  { id: 4, name: 'SoA Matrix', description: 'Assign control owners' },
  { id: 5, name: 'Risk Method', description: 'Define risk assessment approach' },
  { id: 6, name: 'Incident Response', description: 'Set up IR workflow' },
  { id: 7, name: 'Supplier Security', description: 'Configure vendor assessment' },
  { id: 8, name: 'BC/DR', description: 'Business continuity planning' },
];

const REQUIRED_ROLES = [
  'ISMSManager',
  'CISO',
  'RiskOwner',
  'IncidentManager',
  'SoAOwner',
  'SupplierSecurityOwner',
  'BCDROwner',
  'LoggingMonitoringOwner'
];

export default function ISO27001StarterPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [scope, setScope] = useState('');
  const { roleBindings, getCoverageByFramework } = usePeopleStore();
  const { addTask } = useTasksStore();

  const progress = (currentStep / STEPS.length) * 100;

  const bootstrapMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/starter/iso27001/bootstrap', {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'ISO 27001 Framework Bootstrapped',
        description: `Created ${data.created.controls} Annex A controls, ${data.created.soaRows} SoA rows`
      });
      setCurrentStep(4);
    }
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/starter/export-plan', {
        framework: 'ISO27001',
        format: 'json',
        tasks: []
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Plan Exported',
        description: 'ISO 27001 starter plan has been exported'
      });
    }
  });

  const handleFinish = () => {
    const assignedRoles = roleBindings.filter((rb: any) => rb.scope?.framework === 'ISO27001');
    
    const tasks = [
      { title: 'Complete SoA justifications for A.5.*', ownerId: assignedRoles.find((r: any) => r.role === 'SoAOwner')?.personId || 'unassigned' },
      { title: 'Prepare ISMS Risk Method statement', ownerId: assignedRoles.find((r: any) => r.role === 'ISMSManager')?.personId || 'unassigned' },
      { title: 'Schedule risk workshop for top 5 assets', ownerId: assignedRoles.find((r: any) => r.role === 'RiskOwner')?.personId || 'unassigned' },
      { title: 'Publish Incident Response Plan', ownerId: assignedRoles.find((r: any) => r.role === 'IncidentManager')?.personId || 'unassigned' },
      { title: 'Configure logging baseline & alert triage', ownerId: assignedRoles.find((r: any) => r.role === 'LoggingMonitoringOwner')?.personId || 'unassigned' },
      { title: 'Launch supplier assessment cycle', ownerId: assignedRoles.find((r: any) => r.role === 'SupplierSecurityOwner')?.personId || 'unassigned' },
      { title: 'Draft BC/DR plans; schedule first test', ownerId: assignedRoles.find((r: any) => r.role === 'BCDROwner')?.personId || 'unassigned' }
    ];

    tasks.forEach(task => {
      if (task.ownerId !== 'unassigned') {
        addTask({
          ...task,
          status: 'pending',
          priority: 'high',
          framework: 'ISO27001',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    toast({
      title: 'ISO 27001 Starter Complete',
      description: `Created ${tasks.filter(t => t.ownerId !== 'unassigned').length} tasks`
    });
  };

  const coverage = getCoverageByFramework('ISO27001', REQUIRED_ROLES);
  const canProceed = currentStep === 2 ? coverage >= 75 : true;

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-iso27001-starter">
              <Shield className="h-8 w-8 text-primary" />
              ISO 27001 Starter Guide
            </h1>
            <p className="text-muted-foreground">
              Guided setup for Information Security Management System
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            data-testid="button-export-plan"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Plan
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} data-testid="progress-wizard" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-2 p-2 rounded cursor-pointer hover-elevate ${
                    currentStep === step.id ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                  data-testid={`step-nav-${step.id}`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="text-xs">
                    <div className="font-medium">{step.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
              <div>
                <Label>ISMS Scope</Label>
                <Textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Define the scope of your Information Security Management System..."
                  data-testid="input-isms-scope"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded">
                  <h3 className="font-semibold mb-2">Coverage Status</h3>
                  <div className="flex items-center gap-4">
                    <Progress value={coverage} className="flex-1" />
                    <span className="text-2xl font-bold">{Math.round(coverage)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {REQUIRED_ROLES.filter((r: any) => roleBindings.some((rb: any) => rb.role === r && rb.scope?.framework === 'ISO27001')).length} of {REQUIRED_ROLES.length} required roles assigned
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Please visit the <a href="/people/key-personnel" className="text-primary underline">Key Personnel</a> page to assign required roles.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This step will create 93 Annex A controls and Statement of Applicability template.
                </p>
                <Button
                  onClick={() => bootstrapMutation.mutate()}
                  disabled={bootstrapMutation.isPending}
                  data-testid="button-bootstrap"
                >
                  {bootstrapMutation.isPending ? 'Bootstrapping...' : 'Bootstrap ISO 27001 Framework'}
                </Button>
              </div>
            )}

            {currentStep >= 4 && currentStep < 8 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">{STEPS[currentStep - 1].description}</p>
                <div className="bg-muted p-4 rounded">
                  <p className="text-sm">
                    This step creates tasks for the assigned role owner. Tasks will be created when you finish the wizard.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            data-testid="button-back"
          >
            Back
          </Button>
          {currentStep < STEPS.length ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed}
              data-testid="button-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              data-testid="button-finish"
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
