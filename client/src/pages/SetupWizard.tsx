import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { Check, ChevronRight, AlertCircle, Upload, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setupSteps, getStep, type SetupStepKey } from '@/lib/setup/steps';
import { useSetupStore } from '@/lib/setup/setupStore';
import { useIntegrationsStore } from '@/lib/setup/integrationsStore';
import { useCompanyStore } from '@/lib/setup/companyStore';
import { usePeopleStore } from '@/lib/setup/peopleStore';
import { useRasciStore } from '@/lib/setup/rasciStore';
import { useTimetableStore } from '@/lib/setup/timetableStore';
import { useEvidenceStore } from '@/lib/setup/evidenceStore';

export default function SetupWizard() {
  const [, params] = useRoute('/setup');
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const currentStepKey = (searchParams.get('step') as SetupStepKey) || 'integrations';
  
  const { completion, visitStep, recalcCompletion } = useSetupStore();
  const currentStep = getStep(currentStepKey);
  
  useEffect(() => {
    if (currentStepKey) {
      visitStep(currentStepKey);
    }
  }, [currentStepKey, visitStep]);
  
  useEffect(() => {
    recalcCompletion();
  }, [recalcCompletion]);
  
  const handleStepClick = (stepKey: SetupStepKey) => {
    const step = getStep(stepKey);
    if (step?.routeToScreen.startsWith('/setup')) {
      navigate(`/setup?step=${stepKey}`);
    } else {
      // For non-wizard screens, open in current window
      navigate(step?.routeToScreen || '/setup');
    }
  };
  
  const getDependencyText = (step: typeof setupSteps[0]) => {
    if (!step.dependsOn || step.dependsOn.length === 0) return null;
    const depSteps = step.dependsOn.map(key => getStep(key)?.title).filter(Boolean);
    return `Recommended after: ${depSteps.join(', ')}`;
  };
  
  const getIncompleteSteps = () => {
    return setupSteps.filter(s => s.key !== 'review' && !s.complete());
  };
  
  return (
    <div className="flex h-full">
      {/* Left Sidebar - Step List */}
      <div className="w-80 border-r bg-muted/30 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Get Started</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Set up CoreComply in minutes
            </p>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" data-testid="progress-setup" />
          </div>
          
          {/* What's Left */}
          {completion < 100 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">What's left</p>
              <div className="flex flex-wrap gap-2">
                {getIncompleteSteps().map(step => (
                  <Badge
                    key={step.key}
                    variant="secondary"
                    className="cursor-pointer hover-elevate"
                    onClick={() => handleStepClick(step.key)}
                    data-testid={`badge-incomplete-${step.key}`}
                  >
                    {step.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Step List */}
          <div className="space-y-1">
            {setupSteps.map((step, index) => {
              const isComplete = step.complete();
              const isCurrent = step.key === currentStepKey;
              
              return (
                <button
                  key={step.key}
                  onClick={() => handleStepClick(step.key)}
                  className={`w-full text-left p-3 rounded-md transition-colors hover-elevate ${
                    isCurrent ? 'bg-accent' : ''
                  }`}
                  data-testid={`button-step-${step.key}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isComplete
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {isComplete && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{step.title}</p>
                        {isComplete && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="pt-4 border-t space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/dashboard')}
              data-testid="button-save-exit"
            >
              Save & Exit
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your progress is automatically saved
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Step Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {currentStep && (
          <StepPanel key={currentStep.key} step={currentStep} onNavigate={navigate} />
        )}
      </div>
    </div>
  );
}

function StepPanel({ step, onNavigate }: { step: typeof setupSteps[0]; onNavigate: (path: string) => void }) {
  const isComplete = step.complete();
  const dependencyText = step.dependsOn?.length
    ? `Recommended after: ${step.dependsOn.map(key => getStep(key)?.title).join(', ')}`
    : null;
  
  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{step.title}</h1>
          {isComplete && (
            <Badge variant="default" className="gap-1">
              <Check className="w-3 h-3" />
              Complete
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">{step.description}</p>
      </div>
      
      {/* Dependencies Alert */}
      {dependencyText && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{dependencyText}</AlertDescription>
        </Alert>
      )}
      
      {/* Step-specific Content */}
      {step.key === 'integrations' && <IntegrationsStep onNavigate={onNavigate} />}
      {step.key === 'companyProfile' && <CompanyProfileStep onNavigate={onNavigate} />}
      {step.key === 'people' && <PeopleStep onNavigate={onNavigate} />}
      {step.key === 'rasci' && <RasciStep />}
      {step.key === 'obligationsSeed' && <ObligationsSeedStep onNavigate={onNavigate} />}
      {step.key === 'timetable' && <TimetableStep onNavigate={onNavigate} />}
      {step.key === 'evidenceDiscovery' && <EvidenceDiscoveryStep />}
      {step.key === 'review' && <ReviewStep onNavigate={onNavigate} />}
      
      {/* Manual Fallback */}
      {step.manualFallback && !isComplete && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Manual Option
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{step.manualFallback}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {!step.routeToScreen.startsWith('/setup') && (
          <Button
            size="lg"
            onClick={() => onNavigate(step.routeToScreen)}
            data-testid={`button-goto-${step.key}`}
          >
            Go to {step.title}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Step-specific components (placeholders for now)
function IntegrationsStep({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { connections } = useIntegrationsStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Integrations</CardTitle>
        <CardDescription>Connect your systems to auto-sync data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {Object.entries(connections).map(([key, conn]: [string, any]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-sm text-muted-foreground">
                  {conn.connected ? `Connected${conn.displayName ? ` - ${conn.displayName}` : ''}` : 'Not connected'}
                </p>
              </div>
              <Badge variant={conn.connected ? 'default' : 'secondary'}>
                {conn.connected ? 'Connected' : 'Connect'}
              </Badge>
            </div>
          ))}
        </div>
        <Button className="w-full" onClick={() => onNavigate('/integrations')}>
          Manage Integrations
        </Button>
      </CardContent>
    </Card>
  );
}

function CompanyProfileStep({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { entities, sites, selectedFramework } = useCompanyStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Setup</CardTitle>
        <CardDescription>Configure your organization details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Status</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Entities: {entities.length} configured</p>
            <p>Sites: {sites.length} configured</p>
            <p>Framework: {selectedFramework || 'Not selected'}</p>
          </div>
        </div>
        <Button className="w-full" onClick={() => onNavigate('/company-profile')}>
          Configure Company Profile
        </Button>
      </CardContent>
    </Card>
  );
}

function PeopleStep({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { syncedUsers, keyPersonnel } = usePeopleStore();
  const assignedCount = Object.values(keyPersonnel).filter(Boolean).length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>People & Key Personnel</CardTitle>
        <CardDescription>Assign roles to your team</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Status</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Synced Users: {syncedUsers.length}</p>
            <p>Key Personnel Assigned: {assignedCount} of 13</p>
          </div>
        </div>
        <Button className="w-full" onClick={() => onNavigate('/people')}>
          Manage People
        </Button>
      </CardContent>
    </Card>
  );
}

function RasciStep() {
  const { adoptFromKeyPersonnel, adopted } = useRasciStore();
  const { keyPersonnel } = usePeopleStore();
  
  const handleAdopt = () => {
    adoptFromKeyPersonnel(keyPersonnel);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adopt RASCI Matrix</CardTitle>
        <CardDescription>Apply Key Personnel to default RASCI assignments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {adopted ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              RASCI matrix has been adopted. Default assignments are now active for all control domains.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              This will automatically assign Responsible, Accountable, Support, Consulted, and Informed roles
              based on your Key Personnel assignments across all control domains.
            </p>
            <Button
              className="w-full"
              onClick={handleAdopt}
              data-testid="button-adopt-rasci"
            >
              Adopt RASCI from Key Personnel
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ObligationsSeedStep({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { selectedFramework } = useCompanyStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Obligations</CardTitle>
        <CardDescription>Load compliance obligations for your framework</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Framework</p>
          <p className="text-sm text-muted-foreground">{selectedFramework || 'None selected'}</p>
        </div>
        {selectedFramework && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Obligations are already seeded from your framework selection.
            </AlertDescription>
          </Alert>
        )}
        <Button className="w-full" onClick={() => onNavigate('/obligations')}>
          View Obligations
        </Button>
      </CardContent>
    </Card>
  );
}

function TimetableStep({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { events, basCycle, paygRemitterType } = useTimetableStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statutory Timetable</CardTitle>
        <CardDescription>Generate compliance calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Status</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>BAS Cycle: {basCycle || 'Not set'}</p>
            <p>PAYG Type: {paygRemitterType || 'Not set'}</p>
            <p>Events: {events.length} generated</p>
          </div>
        </div>
        <Button className="w-full" onClick={() => onNavigate('/calendar')}>
          Configure Timetable
        </Button>
      </CardContent>
    </Card>
  );
}

function EvidenceDiscoveryStep() {
  const { artifacts } = useEvidenceStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Discovery</CardTitle>
        <CardDescription>Auto-collect evidence from integrations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Status</p>
          <p className="text-sm text-muted-foreground">
            Artifacts discovered: {artifacts.length}
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Evidence discovery will run automatically when integrations are connected and obligations are seeded.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function ReviewStep({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { completion } = useSetupStore();
  const incompleteSteps = setupSteps.filter(s => s.key !== 'review' && !s.complete());
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Setup Complete!</CardTitle>
          <CardDescription>Your CoreComply system is {completion}% configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {completion >= 80 ? (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Great job! You're ready to start using CoreComply. You can now run a Comprehensive Payroll Audit or explore the system.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Consider completing the remaining steps for the best experience: {incompleteSteps.map(s => s.title).join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-3">
        <Button size="lg" onClick={() => onNavigate('/audits/comprehensive')} data-testid="button-start-audit">
          Start Comprehensive Audit
        </Button>
        <Button size="lg" variant="outline" onClick={() => onNavigate('/dashboard')} data-testid="button-goto-dashboard">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
