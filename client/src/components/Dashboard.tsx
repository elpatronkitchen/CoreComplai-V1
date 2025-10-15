import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  Users,
  Shield
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import StatusBadge from './StatusBadge';
import { t } from '@/lib/i18n';

export default function Dashboard() {
  const { currentUser, dashboardData, controls, policies } = useAppStore();

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Loading Dashboard...</div>
          <div className="text-sm text-muted-foreground">Preparing compliance overview</div>
        </div>
      </div>
    );
  }

  const myControls = controls.filter(c => c.owner === currentUser?.name);
  const totalControls = controls.length;
  const compliantControls = controls.filter(c => c.status === 'Compliant').length;
  const inProgressControls = controls.filter(c => c.status === 'In Progress').length;
  const pendingControls = controls.filter(c => c.status === 'Evidence Pending').length;

  const quickActions = [
    {
      title: 'My Controls',
      description: `${myControls.length} assigned to you`,
      icon: Shield,
      action: () => console.log('Navigate to my controls'),
      permission: 'view_controls' as const,
      testId: 'quick-action-my-controls'
    },
    {
      title: 'Pending Evidence',
      description: `${pendingControls} items need evidence`,
      icon: FileText,
      action: () => console.log('Navigate to pending evidence'),
      permission: 'view_evidence' as const,
      testId: 'quick-action-pending-evidence'
    },
    {
      title: 'Start Audit',
      description: 'Begin internal audit session',
      icon: Users,
      action: () => console.log('Start audit'),
      permission: 'run_internal_audits' as const,
      testId: 'quick-action-start-audit'
    },
    {
      title: 'Export Report',
      description: 'Generate compliance report',
      icon: BarChart3,
      action: () => console.log('Export report'),
      permission: 'export_reports' as const,
      testId: 'quick-action-export-report'
    },
  ];

  const visibleActions = quickActions.filter(action => hasPermission(currentUser, action.permission));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('nav.dashboard')}</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.name}. Here's your compliance overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.compliancePercent}%</div>
            <Progress value={dashboardData.compliancePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {compliantControls} of {totalControls} controls compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Controls</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalControls}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressControls} in progress, {pendingControls} pending evidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myControls.length}</div>
            <p className="text-xs text-muted-foreground">
              Controls assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.deadlines.length}</div>
            <p className="text-xs text-muted-foreground">
              Items due this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
            <CardDescription>Latest updates across your compliance framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="text-sm font-medium">{activity.type}</div>
                    <div className="text-sm text-muted-foreground">{activity.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.actor} • {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Control Status Distribution</CardTitle>
            <CardDescription>Current state of all compliance controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dashboardData.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((count / totalControls) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.upcoming_deadlines')}</CardTitle>
          <CardDescription>Important dates and milestones approaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.deadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{deadline.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Due: {new Date(deadline.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={deadline.priority === 'high' ? 'destructive' : deadline.priority === 'medium' ? 'default' : 'secondary'}>
                    {deadline.priority}
                  </Badge>
                  <Badge variant="outline">{deadline.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {visibleActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
            <CardDescription>Common tasks and workflows for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={action.action}
                  data-testid={action.testId}
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}