import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Award, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePeopleStore } from '@/stores/usePeopleStore';
import { useTasksStore } from '@/stores/useTasksStore';

const STEPS = [
  { id: 1, name: 'Scope & Processes', description: 'Define QMS scope and key processes' },
  { id: 2, name: 'Key Roles', description: 'Assign quality management roles' },
  { id: 3, name: 'Bootstrap', description: 'Seed controls and obligations' },
  { id: 4, name: 'Policy Setup', description: 'Configure Quality Policy' },
  { id: 5, name: 'Internal Audit', description: 'Set up audit program' },
  { id: 6, name: 'NC/CAPA', description: 'Configure nonconformity workflow' },
  { id: 7, name: 'Supplier Quality', description: 'Set up supplier management' },
  { id: 8, name: 'Competence', description: 'Build competence matrix' },
  { id: 9, name: 'Management Review', description: 'Schedule management reviews' },
];

const REQUIRED_ROLES = [
  'QualityManager',
  'DocumentControlOwner',
  'InternalAuditLead',
  'ProcessOwner',
  'NonconformityCAPAOwner',
  'SupplierQualityOwner',
  'TrainingCompetenceOwner',
  'ManagementRep'
];

export default function ISO9001StarterPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [scope, setScope] = useState('');
  const [processes, setProcesses] = useState<string[]>([]);
  const [newProcess, setNewProcess] = useState('');
  const { roleBindings, assignRole, people, getCoverageByFramework } = usePeopleStore();
  const { addTask } = useTasksStore();

  const progress = (currentStep / STEPS.length) * 100;

  // Bootstrap mutation
  const bootstrapMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/starter/iso9001/bootstrap', {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'ISO 9001 Framework Bootstrapped',
        description: `Created ${data.created.controls} controls, ${data.created.policies} policies, ${data.created.processes} processes`
      });
      setCurrentStep(4);
    }
  });

  // Export plan mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/starter/export-plan', {
        framework: 'ISO9001',
        format: 'json',
        tasks: []
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Plan Exported',
        description: 'ISO 9001 starter plan has been exported'
      });
    }
  });

  const handleAddProcess = () => {
    if (newProcess.trim()) {
      setProcesses([...processes, newProcess.trim()]);
      setNewProcess('');
    }
  };

  const handleFinish = () => {
    // Create tasks for each role
    const assignedRoles = roleBindings.filter(rb => rb.scope?.framework === 'ISO9001');
    
    const tasks = [
      { title: 'Approve Quality Policy', ownerId: assignedRoles.find(r => r.role === 'QualityManager')?.personId || 'unassigned' },
      { title: 'Publish Document Control Procedure', ownerId: assignedRoles.find(r => r.role === 'DocumentControlOwner')?.personId || 'unassigned' },
      { title: 'Build Internal Audit Schedule', ownerId: assignedRoles.find(r => r.role === 'InternalAuditLead')?.personId || 'unassigned' },
      { title: 'Stand up NC/CAPA Workflow', ownerId: assignedRoles.find(r => r.role === 'NonconformityCAPAOwner')?.personId || 'unassigned' },
      { title: 'Seed Supplier Evaluation Criteria', ownerId: assignedRoles.find(r => r.role === 'SupplierQualityOwner')?.personId || 'unassigned' },
      { title: 'Build Competence Matrix', ownerId: assignedRoles.find(r => r.role === 'TrainingCompetenceOwner')?.personId || 'unassigned' },
      { title: 'Schedule Management Review', ownerId: assignedRoles.find(r => r.role === 'ManagementRep')?.personId || 'unassigned' }
    ];

    tasks.forEach(task => {
      if (task.ownerId !== 'unassigned') {
        addTask({
          ...task,
          status: 'pending',
          priority: 'high',
          framework: 'ISO9001',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    toast({
      title: 'ISO 9001 Starter Complete',
      description: `Created ${tasks.filter(t => t.ownerId !== 'unassigned').length} tasks`
    });
  };

  const coverage = getCoverageByFramework('ISO9001', REQUIRED_ROLES);
  const canProceed = currentStep === 2 ? coverage >= 75 : true;

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-iso9001-starter">
              <Award className="h-8 w-8 text-primary" />
              ISO 9001 Starter Guide
            </h1>
            <p className="text-muted-foreground">
              Guided setup for Quality Management System
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

        {/* Progress */}
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

        {/* Steps Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
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

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>QMS Scope</Label>
                  <Textarea
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="Describe the scope of your Quality Management System..."
                    data-testid="input-qms-scope"
                  />
                </div>
                <div>
                  <Label>Key Processes</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newProcess}
                      onChange={(e) => setNewProcess(e.target.value)}
                      placeholder="Enter process name"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddProcess()}
                      data-testid="input-process-name"
                    />
                    <Button onClick={handleAddProcess} data-testid="button-add-process">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {processes.map((proc, idx) => (
                      <Badge key={idx} variant="secondary" data-testid={`badge-process-${idx}`}>
                        {proc}
                      </Badge>
                    ))}
                  </div>
                </div>
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
                    {REQUIRED_ROLES.filter(r => roleBindings.some(rb => rb.role === r && rb.scope?.framework === 'ISO9001')).length} of {REQUIRED_ROLES.length} required roles assigned
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Please visit the <a href="/people/key-personnel" className="text-primary underline">Key Personnel</a> page to assign the following required roles:</p>
                  <ul className="mt-2 space-y-1">
                    {REQUIRED_ROLES.filter(r => !roleBindings.some(rb => rb.role === r && rb.scope?.framework === 'ISO9001')).map(role => (
                      <li key={role} className="ml-4">• {role}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This step will create default controls, obligations, policies, and processes for ISO 9001.
                </p>
                <Button
                  onClick={() => bootstrapMutation.mutate()}
                  disabled={bootstrapMutation.isPending}
                  data-testid="button-bootstrap"
                >
                  {bootstrapMutation.isPending ? 'Bootstrapping...' : 'Bootstrap ISO 9001 Framework'}
                </Button>
              </div>
            )}

            {currentStep >= 4 && currentStep <= 9 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">{STEPS[currentStep - 1].description}</p>
                <div className="bg-muted p-4 rounded">
                  <p className="text-sm">
                    This step creates tasks for the assigned role owner. Tasks will be created when you finish the wizard.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 10 && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                  <h3 className="font-semibold mb-2">Setup Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your ISO 9001 framework is ready. Tasks have been created for all assigned role owners.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
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
