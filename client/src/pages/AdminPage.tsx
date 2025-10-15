import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  Shield, 
  Bell,
  Database,
  Activity,
  Lock,
  Mail,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  UserPlus
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { User } from '@shared/schema';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppShell from '@/components/AppShell';

export default function AdminPage() {
  const { users } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((user: User) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    if (role.includes('Admin')) return 'default';
    if (role.includes('Owner')) return 'default';
    if (role.includes('Auditor')) return 'secondary';
    return 'outline';
  };

  const systemStats = [
    {
      icon: Users,
      title: 'Total Users',
      value: users.length.toString(),
      description: 'Active users in system',
      trend: '+2 this week',
    },
    {
      icon: Shield,
      title: 'Active Sessions',
      value: '12',
      description: 'Currently logged in',
      trend: 'Normal activity',
    },
    {
      icon: Activity,
      title: 'System Health',
      value: '99.9%',
      description: 'Uptime this month',
      trend: 'All systems operational',
    },
    {
      icon: Database,
      title: 'Storage Used',
      value: '2.4 GB',
      description: 'Of 100 GB available',
      trend: '2.4% capacity',
    },
  ];

  const securitySettings = [
    {
      title: 'Two-Factor Authentication',
      description: 'Require 2FA for all users',
      enabled: true,
    },
    {
      title: 'Password Expiry',
      description: 'Force password change every 90 days',
      enabled: true,
    },
    {
      title: 'Session Timeout',
      description: 'Auto-logout after 30 minutes of inactivity',
      enabled: true,
    },
    {
      title: 'IP Whitelisting',
      description: 'Restrict access to approved IP addresses',
      enabled: false,
    },
  ];

  const auditLogs = [
    { timestamp: '2025-09-30 14:32', user: 'John Smith', action: 'Created new framework', status: 'success' },
    { timestamp: '2025-09-30 14:15', user: 'Sarah Johnson', action: 'Updated control CON-001', status: 'success' },
    { timestamp: '2025-09-30 13:58', user: 'Michael Chen', action: 'Uploaded evidence document', status: 'success' },
    { timestamp: '2025-09-30 13:45', user: 'Emma Wilson', action: 'Failed login attempt', status: 'warning' },
    { timestamp: '2025-09-30 13:22', user: 'David Brown', action: 'Approved policy POL-023', status: 'success' },
  ];

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-admin">System Administration</h1>
        <p className="text-muted-foreground">
          Manage users, security settings, and system configuration
        </p>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {systemStats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <p className="text-xs text-primary mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Activity className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card data-testid="card-user-management">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                </div>
                <Button data-testid="button-add-user">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-users"
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-user-menu-${user.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deactivate User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card data-testid="card-security-settings">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure authentication and access control policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {securitySettings.map((setting) => (
                <div key={setting.title} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`setting-${setting.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="space-y-1">
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Badge variant={setting.enabled ? 'default' : 'secondary'}>
                    {setting.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-role-permissions">
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure permissions for each user role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" data-testid="button-manage-permissions">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Role Permissions
                </Button>
                <p className="text-sm text-muted-foreground px-2">
                  Define what each role can view and do within the system
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card data-testid="card-email-settings">
            <CardHeader>
              <CardTitle>Email & Notifications</CardTitle>
              <CardDescription>Configure email and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP Server</label>
                <Input placeholder="smtp.example.com" defaultValue="smtp.corecomply.com.au" data-testid="input-smtp-server" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">From Email Address</label>
                <Input placeholder="noreply@example.com" defaultValue="noreply@corecomply.com.au" data-testid="input-from-email" />
              </div>
              <Button data-testid="button-test-email">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-integration-settings">
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Manage external system integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-api-keys">
                <Lock className="h-4 w-4 mr-2" />
                Manage API Keys
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-webhooks">
                <Bell className="h-4 w-4 mr-2" />
                Configure Webhooks
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-backup">
                <Database className="h-4 w-4 mr-2" />
                Backup & Restore
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card data-testid="card-audit-logs">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View system activity and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log, index) => (
                      <TableRow key={index} data-testid={`row-audit-${index}`}>
                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              log.status === 'success' 
                                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" data-testid="button-export-logs">
                  Export Audit Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AppShell>
  );
}
