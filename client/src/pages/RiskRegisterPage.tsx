import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PayrollRiskRegister from '@/components/PayrollRiskRegister';
import HRRiskRegister from '@/components/HRRiskRegister';
import FinanceRiskRegister from '@/components/FinanceRiskRegister';
import GovernanceRiskRegister from '@/components/GovernanceRiskRegister';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';

export default function RiskRegisterPage() {
  const { currentUser, activeFramework, frameworks } = useAppStore();
  
  const canViewPayrollRisks = hasPermission(currentUser, 'view_payroll_risks');
  const canViewHRRisks = hasPermission(currentUser, 'view_hr_risks');
  const canViewFinanceRisks = hasPermission(currentUser, 'view_finance_risks');
  const canViewGovernanceRisks = hasPermission(currentUser, 'view_risk_registers');
  const canViewRiskRegisters = hasPermission(currentUser, 'view_risk_registers');

  // Use activeFramework instead of local state
  const frameworkFilter = activeFramework || 'apgf-ms';

  // If user doesn't have general risk register access, deny access
  if (!canViewRiskRegisters) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You don't have permission to access risk registers.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // If user has general access but no specific register permissions
  if (!canViewPayrollRisks && !canViewHRRisks && !canViewFinanceRisks && !canViewGovernanceRisks) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Risk Registers Available</h3>
              <p className="text-muted-foreground">
                You don't have permission to view any specific risk registers.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Get framework name for display
  const selectedFramework = frameworks.find(f => f.id === frameworkFilter);
  const frameworkName = selectedFramework?.name || "APGF-MS";
  const frameworkDesc = selectedFramework?.description || "Australian Payroll Governance Management System Framework";

  // Determine which tabs to show based on framework
  const availableTabs = [];
  
  // Only show APGF-MS specific tabs when APGF-MS is selected
  if (frameworkFilter === 'apgf-ms') {
    if (canViewPayrollRisks) {
      availableTabs.push({ id: 'payroll', label: 'Payroll Risks', component: PayrollRiskRegister });
    }
    if (canViewHRRisks) {
      availableTabs.push({ id: 'hr', label: 'HR Risks', component: HRRiskRegister });
    }
    if (canViewFinanceRisks) {
      availableTabs.push({ id: 'finance', label: 'Finance Risks', component: FinanceRiskRegister });
    }
    if (canViewGovernanceRisks) {
      availableTabs.push({ id: 'governance', label: 'Executive & Board', component: GovernanceRiskRegister });
    }
  }

  // Default to first available tab
  const defaultTab = availableTabs[0]?.id || 'payroll';

  // If no tabs are available (non-APGF-MS framework selected), show placeholder
  if (availableTabs.length === 0) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Risk Management</h1>
            <p className="text-muted-foreground">
              {frameworkDesc} ({frameworkName}) - Risk Register
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Risk Register Coming Soon</h3>
                <p className="text-muted-foreground">
                  {frameworkName} risk register will be available in a future update. Switch to APGF-MS to view payroll, HR, finance, and governance risks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // If only one tab is available, don't show tabs
  if (availableTabs.length === 1) {
    const SingleComponent = availableTabs[0].component;
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Risk Management</h1>
            <p className="text-muted-foreground">
              {frameworkDesc} ({frameworkName}) - Risk Register
            </p>
          </div>
          <SingleComponent />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Risk Management</h1>
          <p className="text-muted-foreground">
            {frameworkDesc} ({frameworkName}) - Risk Register
          </p>
        </div>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl gap-2" style={{gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))`}}>
            {availableTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                data-testid={`tab-${tab.id}-risks`}
                className="px-6"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {availableTabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                <TabComponent />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </AppShell>
  );
}