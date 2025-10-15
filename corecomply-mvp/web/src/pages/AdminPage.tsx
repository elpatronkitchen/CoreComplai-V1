import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Settings, 
  Activity,
  Plus,
  Search,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
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
import type { AdminUser, AccessLog, SystemSetting } from '@/types/admin';

const getRoleBadgeVariant = (role: string) => {
  if (role.includes('Admin')) return 'default';
  if (role.includes('Owner')) return 'default';
  if (role.includes('Auditor')) return 'secondary';
  return 'outline';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">Active</Badge>;
    case 'Inactive':
      return <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">Inactive</Badge>;
    case 'Locked':
      return <Badge variant="destructive">Locked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AdminPage() {
  const apiClient = useApiClient();
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const canAccess = hasPermission('manage_users');

  // Fetch users
  const { 
    data: users = [], 
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers 
  } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/users');
      return response.data;
    },
    enabled: canAccess,
  });

  // Fetch access logs
  const { 
    data: accessLogs = [], 
    isLoading: logsLoading 
  } = useQuery<AccessLog[]>({
    queryKey: ['/api/admin/access-logs'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/access-logs');
      return response.data;
    },
    enabled: canAccess,
  });

  // Fetch system settings
  const { 
    data: settings = [], 
    isLoading: settingsLoading 
  } = useQuery<SystemSetting[]>({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/settings');
      return response.data;
    },
    enabled: canAccess,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.delete(`/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'], exact: false });
      toast({
        title: 'Success',
        description: 'User has been deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  });

  if (!canAccess) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access system administration. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      return fullName.includes(searchLower) ||
             user.email.toLowerCase().includes(searchLower) ||
             user.role.toLowerCase().includes(searchLower);
    });
  }, [users, searchQuery]);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    recentLogs: accessLogs.length,
    settingsCount: settings.length,
  };

  if (usersLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading admin data...</span>
        </div>
      </AppShell>
    );
  }

  if (usersError) {
    return (
      <AppShell>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load admin data. Please try again.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchUsers()}
              data-testid="button-retry-admin"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

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
        <Card data-testid="card-stat-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active users in system</p>
            <p className="text-xs text-primary mt-1">{stats.activeUsers} active</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-access-logs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-access-logs">{stats.recentLogs}</div>
            <p className="text-xs text-muted-foreground mt-1">Recent activity logs</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-settings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-settings">{stats.settingsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Configuration items</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-active-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-active-users">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Activity className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
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
                  <Plus className="h-4 w-4 mr-2" />
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
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.status)}
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card data-testid="card-audit-logs">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>System activity and access logs</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      accessLogs.slice(0, 10).map((log) => (
                        <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{log.userName}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.ipAddress}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.details || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card data-testid="card-system-settings">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No settings configured</p>
                  ) : (
                    settings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`setting-${setting.id}`}>
                        <div>
                          <div className="font-medium">{setting.key}</div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                          <Badge variant="outline" className="mt-1">{setting.category}</Badge>
                        </div>
                        <div className="text-sm font-mono">{setting.value}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppShell>
  );
}
