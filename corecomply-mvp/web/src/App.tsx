import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import AppShell from './components/AppShell'
import CommandPalette from './components/CommandPalette'

// Pages
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ControlsPage from './pages/ControlsPage'
import PoliciesPage from './pages/PoliciesPage'
import FrameworksPage from './pages/FrameworksPage'
import ReportsPage from './pages/ReportsPage'
import AuditsPage from './pages/AuditsPage'
import PayrollAuditPage from './pages/PayrollAuditPage'
import CalendarPage from './pages/CalendarPage'
import RiskRegisterPage from './pages/RiskRegisterPage'
import AssetsPage from './pages/AssetsPage'
import PeoplePage from './pages/PeoplePage'
import IntegrationsPage from './pages/IntegrationsPage'
import CompanyProfilePage from './pages/CompanyProfilePage'
import SupportPage from './pages/SupportPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser()
  
  if (!isAuthenticated) {
    return <LoginPage />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          }
        />
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/calendar"
          element={
            <AuthGuard>
              <AppShell>
                <CalendarPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/controls"
          element={
            <AuthGuard>
              <AppShell>
                <ControlsPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/policies"
          element={
            <AuthGuard>
              <AppShell>
                <PoliciesPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/frameworks"
          element={
            <AuthGuard>
              <AppShell>
                <FrameworksPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/audits/payroll"
          element={
            <AuthGuard>
              <AppShell>
                <PayrollAuditPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/audits"
          element={
            <AuthGuard>
              <AppShell>
                <AuditsPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/risks"
          element={
            <AuthGuard>
              <AppShell>
                <RiskRegisterPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/assets"
          element={
            <AuthGuard>
              <AppShell>
                <AssetsPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/people"
          element={
            <AuthGuard>
              <AppShell>
                <PeoplePage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/integrations"
          element={
            <AuthGuard>
              <AppShell>
                <IntegrationsPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <AuthGuard>
              <AppShell>
                <ReportsPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/company-profile"
          element={
            <AuthGuard>
              <AppShell>
                <CompanyProfilePage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/support"
          element={
            <AuthGuard>
              <AppShell>
                <SupportPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AppShell>
                <AdminPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CommandPalette />
    </>
  )
}

export default App
