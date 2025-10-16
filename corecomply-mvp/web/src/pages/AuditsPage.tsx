import AuditManager from '@/components/AuditManager';
import PayrollAuditPage from './PayrollAuditPage';
import AppShell from '@/components/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function AuditsPage() {
  const { currentUser } = useAppStore();
  
  const canViewFrameworkAudits = hasPermission(currentUser, 'view_audits');
  const canRunPayrollAudits = hasPermission(currentUser, 'run_payroll_audits');

  // If user can't view either type of audit, show access restriction
  if (!canViewFrameworkAudits && !canRunPayrollAudits) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view audits. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-audits">Audits</h1>
          <p className="text-muted-foreground">
            Manage framework compliance audits and payroll reconciliation
          </p>
        </div>

        <Tabs defaultValue="payroll" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="framework" 
              disabled={!canViewFrameworkAudits}
              data-testid="tab-framework-audit"
            >
              Framework Audit
            </TabsTrigger>
            <TabsTrigger 
              value="payroll" 
              disabled={!canRunPayrollAudits}
              data-testid="tab-payroll-audit"
            >
              Payroll Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="framework" className="space-y-4">
            {canViewFrameworkAudits ? (
              <AuditManager />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to view framework audits. Please contact your administrator.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            {canRunPayrollAudits ? (
              <PayrollAuditPage />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to run payroll audits. Please contact your administrator.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}