import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import type { SetupStepKey } from '@/lib/setup/steps';
import { getStep } from '@/lib/setup/steps';

interface SetupNudgeProps {
  stepKey: SetupStepKey;
  message?: string;
}

export function SetupNudge({ stepKey, message }: SetupNudgeProps) {
  const [dismissed, setDismissed] = useState(false);
  const step = getStep(stepKey);
  
  if (!step || dismissed || step.complete()) {
    return null;
  }
  
  const defaultMessage = `Complete the "${step.title}" step in the setup wizard to unlock full functionality.`;
  
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{message || defaultMessage}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            asChild
            size="sm"
            variant="default"
            data-testid="button-setup-nudge-action"
          >
            <Link href="/setup">
              Complete Setup
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            data-testid="button-setup-nudge-dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
