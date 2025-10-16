import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

// Pages
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";
import ControlsPage from "@/pages/ControlsPage";
import PoliciesPage from "@/pages/PoliciesPage";
import FrameworksPage from "@/pages/FrameworksPage";
import ReportsPage from "@/pages/ReportsPage";
import AuditsPage from "@/pages/AuditsPage";
import PayrollAuditPage from "@/pages/PayrollAuditPage";
import ComprehensiveAuditPage from "@/pages/ComprehensiveAuditPage";
import CalendarPage from "@/pages/CalendarPage";
import RiskRegisterPage from "@/pages/RiskRegisterPage";
import AssetsPage from "@/pages/AssetsPage";
import PeoplePage from "@/pages/PeoplePage";
import PositionDescriptionsPage from "@/pages/PositionDescriptionsPage";
import CompetencyPage from "@/pages/CompetencyPage";
import TrainingPage from "@/pages/TrainingPage";
import ObligationsPage from "@/pages/ObligationsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import CompanyProfilePage from "@/pages/CompanyProfilePage";
import SupportPage from "@/pages/SupportPage";
import AdminPage from "@/pages/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage";
import SetupWizard from "@/pages/SetupWizard";
import RegistersPage from "@/pages/RegistersPage";
import SuppliersPage from "@/pages/SuppliersPage";
import NCCapaPage from "@/pages/NCCapaPage";
import KeyPersonnelPage from "@/pages/KeyPersonnelPage";
import ISO9001StarterPage from "@/pages/ISO9001StarterPage";
import ISO27001StarterPage from "@/pages/ISO27001StarterPage";
import BillingPage from "@/pages/BillingPage";

// Components
import CommandPalette from "@/components/CommandPalette";
import CopilotWidget from "@/components/CopilotWidget";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, purchasedFrameworks } = useAppStore();
  
  // Force update purchasedFrameworks for clickable prototype
  useEffect(() => {
    const requiredFrameworks = ['apgf-ms', 'iso-9001', 'iso-27001'];
    const hasAllFrameworks = requiredFrameworks.every(fw => purchasedFrameworks.includes(fw));
    
    if (!hasAllFrameworks) {
      useAppStore.setState({ purchasedFrameworks: requiredFrameworks });
    }
  }, [purchasedFrameworks]);
  
  if (!currentUser) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { activeFramework } = useAppStore();
  
  if (!activeFramework) {
    return <OnboardingPage />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding">
        <AuthGuard>
          <OnboardingPage />
        </AuthGuard>
      </Route>
      <Route path="/setup">
        <AuthGuard>
          <SetupWizard />
        </AuthGuard>
      </Route>
      <Route path="/">
        <AuthGuard>
          <OnboardingGuard>
            <DashboardPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/calendar">
        <AuthGuard>
          <OnboardingGuard>
            <CalendarPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/controls">
        <AuthGuard>
          <OnboardingGuard>
            <ControlsPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/policies">
        <AuthGuard>
          <OnboardingGuard>
            <PoliciesPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/frameworks">
        <AuthGuard>
          <OnboardingGuard>
            <FrameworksPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/frameworks/iso9001/starter">
        <AuthGuard>
          <OnboardingGuard>
            <ISO9001StarterPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/frameworks/iso27001/starter">
        <AuthGuard>
          <OnboardingGuard>
            <ISO27001StarterPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/audits/comprehensive">
        <AuthGuard>
          <OnboardingGuard>
            <ComprehensiveAuditPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/audits/payroll">
        <AuthGuard>
          <OnboardingGuard>
            <PayrollAuditPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/audits">
        <AuthGuard>
          <OnboardingGuard>
            <AuditsPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/registers">
        <AuthGuard>
          <OnboardingGuard>
            <RegistersPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/risks">
        <AuthGuard>
          <OnboardingGuard>
            <RiskRegisterPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/assets">
        <AuthGuard>
          <OnboardingGuard>
            <AssetsPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/people">
        <AuthGuard>
          <OnboardingGuard>
            <PeoplePage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/people/key-personnel">
        <AuthGuard>
          <OnboardingGuard>
            <KeyPersonnelPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/positions">
        <AuthGuard>
          <OnboardingGuard>
            <PositionDescriptionsPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/competency">
        <AuthGuard>
          <OnboardingGuard>
            <CompetencyPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/training">
        <AuthGuard>
          <OnboardingGuard>
            <TrainingPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/obligations">
        <AuthGuard>
          <OnboardingGuard>
            <ObligationsPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/suppliers">
        <AuthGuard>
          <OnboardingGuard>
            <SuppliersPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/nc-capa">
        <AuthGuard>
          <OnboardingGuard>
            <NCCapaPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/integrations">
        <AuthGuard>
          <OnboardingGuard>
            <IntegrationsPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/reports">
        <AuthGuard>
          <OnboardingGuard>
            <ReportsPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/admin">
        <AuthGuard>
          <OnboardingGuard>
            <AdminPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/company-profile">
        <AuthGuard>
          <OnboardingGuard>
            <CompanyProfilePage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/billing">
        <AuthGuard>
          <OnboardingGuard>
            <BillingPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route path="/support">
        <AuthGuard>
          <OnboardingGuard>
            <SupportPage />
          </OnboardingGuard>
        </AuthGuard>
      </Route>
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default function App() {
  const { darkMode } = useAppStore();

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <CommandPalette />
        <CopilotWidget />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}