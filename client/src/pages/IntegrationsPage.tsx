import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PlugZap, 
  RefreshCw, 
  Settings, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Key,
  Eye,
  Zap,
  Database,
  Calendar
} from "lucide-react";
import { useIntegrationsStore } from "../store/integrationsSlice";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import AppShell from "@/components/AppShell";
import { SetupNudge } from "@/components/SetupNudge";
import type { IntegrationCategory, IntegrationStatus } from "../types/integrations";

const getStatusIcon = (status: IntegrationStatus) => {
  switch (status) {
    case "Connected":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "Auth Required":
      return <Key className="h-4 w-4 text-yellow-600" />;
    case "Error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "Disabled":
      return <Clock className="h-4 w-4 text-gray-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: IntegrationStatus) => {
  const variants = {
    "Connected": "default",
    "Auth Required": "secondary",
    "Error": "destructive",
    "Disabled": "outline"
  } as const;
  
  return (
    <Badge variant={variants[status]} className="flex items-center gap-1">
      {getStatusIcon(status)}
      {status}
    </Badge>
  );
};

const getCategoryIcon = (category: IntegrationCategory) => {
  switch (category) {
    case "Identity":
      return <Shield className="h-4 w-4" />;
    case "HRIS":
      return <Database className="h-4 w-4" />;
    case "Payroll":
      return <Calendar className="h-4 w-4" />;
    case "Time & Attendance":
      return <Clock className="h-4 w-4" />;
    case "Tax & Super":
      return <Activity className="h-4 w-4" />;
    case "Documents":
      return <PlugZap className="h-4 w-4" />;
    case "Quality":
      return <CheckCircle className="h-4 w-4" />;
    case "Security":
      return <Shield className="h-4 w-4" />;
    case "IT Management":
      return <Settings className="h-4 w-4" />;
    default:
      return <PlugZap className="h-4 w-4" />;
  }
};

export default function IntegrationsPage() {
  const { currentUser } = useAppStore();
  const { 
    connections, 
    mappings, 
    syncLogs, 
    settings, 
    securityConfigs,
    updateConnectionStatus,
    triggerSync,
    updateMappings,
    updateSettings
  } = useIntegrationsStore();
  
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | "All">("All");
  
  const canManage = hasPermission(currentUser, 'manage_integrations');
  const canView = hasPermission(currentUser, 'view_integrations');

  if (!canView) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view integrations. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const filteredConnections = selectedCategory === "All" 
    ? connections 
    : connections.filter(conn => conn.category === selectedCategory);

  const categories = ["All", ...Array.from(new Set(connections.map(c => c.category)))];

  return (
    <AppShell>
      <div className="space-y-6">
        <SetupNudge 
          stepKey="integrations" 
          message="Connect your integrations to auto-sync employee data, payroll information, and compliance evidence."
        />
        
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-integrations">Integrations</h1>
          <p className="text-muted-foreground">
            Central hub for all payroll, HR, T&A, identity, tax & super data flows
          </p>
        </div>
        {canManage && (
          <Button data-testid="button-sync-all">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        )}
      </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="connections" data-testid="tab-connections">
            <PlugZap className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="mappings" data-testid="tab-mappings">
            <Activity className="h-4 w-4 mr-2" />
            Mappings
          </TabsTrigger>
          <TabsTrigger value="sync-health" data-testid="tab-sync-health">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync & Health
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="h-4 w-4 mr-2" />
            Access & Security
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <div className="flex items-center gap-4">
            <Label>Filter by category:</Label>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as IntegrationCategory | "All")}>
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredConnections.map((connection) => (
              <Card key={connection.key} data-testid={`card-integration-${connection.key}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(connection.category)}
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{connection.category}</Badge>
                          <Badge variant="outline">{connection.env}</Badge>
                          {connection.frameworks.map(fw => (
                            <Badge 
                              key={fw} 
                              variant="secondary"
                              className={
                                fw === "All" ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100" :
                                fw === "APGF-MS" ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100" :
                                fw === "ISO 9001" ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100" :
                                fw === "ISO 27001" ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100" :
                                ""
                              }
                            >
                              {fw}
                            </Badge>
                          ))}
                          <span>Owner: {connection.owner}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(connection.status)}
                      {canManage && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => triggerSync(connection.key)}
                            data-testid={`button-sync-${connection.key}`}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-configure-${connection.key}`}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-view-logs-${connection.key}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Last Sync:</span>
                      <div className="text-muted-foreground">
                        {connection.lastSync 
                          ? new Date(connection.lastSync).toLocaleString()
                          : "Never"
                        }
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Provides:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {connection.provides.map(item => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Scopes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {connection.scopes.map(scope => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      {connection.errorMsg && (
                        <div>
                          <span className="font-medium text-red-600">Error:</span>
                          <div className="text-red-600 text-xs">{connection.errorMsg}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mappings Tab */}
        <TabsContent value="mappings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mappings</CardTitle>
              <CardDescription>
                Configure how data fields are mapped between systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Employee ID Mapping</Label>
                <Input 
                  value={mappings.employeeId}
                  disabled={!canManage}
                  data-testid="input-employee-id-mapping"
                />
              </div>
              <div className="space-y-2">
                <Label>Cost Centre Mapping</Label>
                <Input 
                  value={mappings.costCentre}
                  disabled={!canManage}
                  data-testid="input-cost-centre-mapping"
                />
              </div>
              <div className="space-y-2">
                <Label>Period Alignment</Label>
                <Input 
                  value={mappings.periodAlignment}
                  disabled={!canManage}
                  data-testid="input-period-alignment"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pay Item Mappings</CardTitle>
              <CardDescription>
                Map payroll pay items to award classifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payroll Code</TableHead>
                    <TableHead>Award Reference</TableHead>
                    {canManage && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.payItems.map((item, index) => (
                    <TableRow key={index} data-testid={`row-pay-item-${index}`}>
                      <TableCell>
                        <Badge variant="outline">{item.payroll}</Badge>
                      </TableCell>
                      <TableCell>{item.awardRef}</TableCell>
                      {canManage && (
                        <TableCell>
                          <Button size="sm" variant="ghost" data-testid={`button-edit-pay-item-${index}`}>
                            Edit
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {canManage && (
                <div className="mt-4">
                  <Button variant="outline" data-testid="button-add-pay-item-mapping">
                    Add Pay Item Mapping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync & Health Tab */}
        <TabsContent value="sync-health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-active-connections">
                  {connections.filter(c => c.status === "Connected").length}
                </div>
                <p className="text-sm text-muted-foreground">
                  of {connections.length} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sync Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-sync-errors">
                  {syncLogs.filter(log => log.result === "error").length}
                </div>
                <p className="text-sm text-muted-foreground">
                  in last 10 syncs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Auth Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-auth-required">
                  {connections.filter(c => c.status === "Auth Required").length}
                </div>
                <p className="text-sm text-muted-foreground">
                  connections need attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Sync Activity</CardTitle>
                  <CardDescription>Last 10 synchronization attempts</CardDescription>
                </div>
                {canManage && (
                  <Button variant="outline" size="sm" data-testid="button-clear-sync-logs">
                    Clear Logs
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Objects</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.slice(0, 10).map((log) => (
                    <TableRow key={log.id} data-testid={`row-sync-log-${log.id}`}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell>{log.objectsFetched}</TableCell>
                      <TableCell>{log.duration}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.result === "success" ? "default" :
                            log.result === "warning" ? "secondary" : "destructive"
                          }
                        >
                          {log.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.message || log.errorDetails}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access & Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(securityConfigs).map(([key, config]) => {
              const connection = connections.find(c => c.key === key);
              if (!connection) return null;
              
              return (
                <Card key={key} data-testid={`card-security-${key}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {config.rotationReminders && (
                          <Badge variant="secondary">
                            <Key className="h-3 w-3 mr-1" />
                            Auto-rotate
                          </Badge>
                        )}
                        {config.nextRotationDue && new Date(config.nextRotationDue) < new Date() && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Rotation Due
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Last Key Rotation:</span>
                        <div className="text-muted-foreground">
                          {config.lastKeyRotation 
                            ? new Date(config.lastKeyRotation).toLocaleDateString()
                            : "Never"
                          }
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Next Rotation Due:</span>
                        <div className="text-muted-foreground">
                          {config.nextRotationDue 
                            ? new Date(config.nextRotationDue).toLocaleDateString()
                            : "Not scheduled"
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Current Scopes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.actualScopes.map(scope => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Least Privilege Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.leastPrivilegeNotes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Configure synchronization preferences and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Pay Cycle</Label>
                  <Select 
                    value={settings.defaultPayCycle} 
                    disabled={!canManage}
                    data-testid="select-default-pay-cycle"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="fortnightly">Fortnightly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    disabled={!canManage}
                    data-testid="select-timezone"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                      <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                      <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                      <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                      <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Variance Thresholds</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Payroll Hours (%)</Label>
                    <Input 
                      type="number" 
                      value={settings.varianceThresholds.payrollHours}
                      disabled={!canManage}
                      data-testid="input-payroll-hours-threshold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timesheet Discrepancy (hrs)</Label>
                    <Input 
                      type="number" 
                      value={settings.varianceThresholds.timesheetDiscrepancy}
                      disabled={!canManage}
                      data-testid="input-timesheet-discrepancy-threshold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Centre Variance (%)</Label>
                    <Input 
                      type="number" 
                      value={settings.varianceThresholds.costCentreVariance}
                      disabled={!canManage}
                      data-testid="input-cost-centre-variance-threshold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Evidence Hashing</Label>
                    <Switch 
                      checked={settings.evidenceHashing}
                      disabled={!canManage}
                      data-testid="switch-evidence-hashing"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Reconciliation</Label>
                    <Switch 
                      checked={settings.autoReconciliation}
                      disabled={!canManage}
                      data-testid="switch-auto-reconciliation"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Sync Errors</Label>
                    <Switch 
                      checked={settings.notificationSettings.syncErrors}
                      disabled={!canManage}
                      data-testid="switch-sync-errors-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auth Expiry</Label>
                    <Switch 
                      checked={settings.notificationSettings.authExpiry}
                      disabled={!canManage}
                      data-testid="switch-auth-expiry-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Data Variances</Label>
                    <Switch 
                      checked={settings.notificationSettings.dataVariances}
                      disabled={!canManage}
                      data-testid="switch-data-variances-notifications"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppShell>
  );
}