import AuditManager from '@/components/AuditManager';
import PayrollAuditPage from './PayrollAuditPage';
import ComprehensiveAuditPage from './ComprehensiveAuditPage';
import ClassificationAuditPage from './ClassificationAuditPage';
import AppShell from '@/components/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function AuditsPage() {
  const { currentUser, activeFramework, frameworks } = useAppStore();
  
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

  // Use activeFramework instead of local state
  const frameworkFilter = activeFramework || 'apgf-ms';

  // Get framework name for display
  const selectedFramework = frameworks.find(f => f.id === frameworkFilter);
  const frameworkName = selectedFramework?.name || "APGF-MS";
  const frameworkDesc = selectedFramework?.description || "Australian Payroll Governance Management System Framework";

  // Determine which tabs to show based on active framework
  const showPayrollTabs = frameworkFilter === "apgf-ms";
  const showQMSTabs = frameworkFilter === "iso-9001";
  const showISMSTabs = frameworkFilter === "iso-27001";

  // Determine default tab based on framework
  const defaultTab = showPayrollTabs ? "comprehensive-payroll" : "framework";

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-audits">Audits</h1>
          <p className="text-muted-foreground">
            {frameworkDesc} ({frameworkName}) - Audit Management
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full gap-2" style={{gridTemplateColumns: showPayrollTabs ? 'repeat(4, minmax(0, 1fr))' : showQMSTabs || showISMSTabs ? 'repeat(3, minmax(0, 1fr))' : '1fr'}}>
            <TabsTrigger 
              value="framework" 
              disabled={!canViewFrameworkAudits}
              data-testid="tab-framework-audit"
            >
              Framework Audit
            </TabsTrigger>
            
            {/* APGF-MS specific tabs */}
            {showPayrollTabs && (
              <>
                <TabsTrigger 
                  value="variance" 
                  disabled={!canRunPayrollAudits}
                  data-testid="tab-variance-report"
                >
                  Payroll Variance Audit
                </TabsTrigger>
                <TabsTrigger 
                  value="classification"
                  disabled={!canRunPayrollAudits}
                  data-testid="tab-classification-audit"
                >
                  Payroll Classification Audit
                </TabsTrigger>
                <TabsTrigger 
                  value="comprehensive-payroll"
                  disabled={!canRunPayrollAudits}
                  data-testid="tab-comprehensive-payroll"
                >
                  Comprehensive Payroll Audit
                </TabsTrigger>
              </>
            )}

            {/* ISO 9001 specific tabs */}
            {showQMSTabs && (
              <>
                <TabsTrigger value="internal-quality" data-testid="tab-internal-quality">
                  Internal Quality Audit
                </TabsTrigger>
                <TabsTrigger value="management-review" data-testid="tab-management-review">
                  Management Review
                </TabsTrigger>
              </>
            )}

            {/* ISO 27001 specific tabs */}
            {showISMSTabs && (
              <>
                <TabsTrigger value="internal-security" data-testid="tab-internal-security">
                  Internal Security Audit
                </TabsTrigger>
                <TabsTrigger value="risk-assessment" data-testid="tab-risk-assessment">
                  Risk Assessment Audit
                </TabsTrigger>
              </>
            )}
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

          <TabsContent value="classification" className="space-y-4">
            {canRunPayrollAudits ? (
              <ClassificationAuditPage />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to run classification audits. Please contact your administrator.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="comprehensive-payroll" className="space-y-4">
            {canRunPayrollAudits ? (
              <ComprehensiveAuditPage />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to run comprehensive payroll audits. Please contact your administrator.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="variance" className="space-y-4">
            {canRunPayrollAudits ? (
              <PayrollAuditPage />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to run variance reports. Please contact your administrator.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* ISO 9001 specific tabs content */}
          <TabsContent value="internal-quality" className="space-y-4">
            <Alert>
              <AlertDescription>
                Internal Quality Audit functionality for ISO 9001 is coming soon. This will include quality management system audits, process effectiveness assessments, and non-conformance tracking.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="management-review" className="space-y-4">
            <Alert>
              <AlertDescription>
                Management Review audit functionality for ISO 9001 is coming soon. This will include performance review, improvement opportunities, and strategic planning assessments.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* ISO 27001 specific tabs content */}
          <TabsContent value="internal-security" className="space-y-4">
            <Alert>
              <AlertDescription>
                Internal Security Audit functionality for ISO 27001 is coming soon. This will include information security controls assessment, vulnerability analysis, and compliance verification.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="risk-assessment" className="space-y-4">
            <Alert>
              <AlertDescription>
                Risk Assessment Audit functionality for ISO 27001 is coming soon. This will include threat identification, vulnerability assessment, and risk treatment evaluation.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}