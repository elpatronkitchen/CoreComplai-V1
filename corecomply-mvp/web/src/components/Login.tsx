import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatRole } from '@/lib/permissions';

export default function Login() {
  const { users, setCurrentUser } = useAppStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = () => {
    if (selectedUser) {
      const user = users.find(u => u.id === selectedUser);
      if (user) {
        setCurrentUser(user);
        console.log('Logged in as:', user.name);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">CoreComply</h1>
          <p className="text-muted-foreground">
            Compliance Management System - Select your role to continue
          </p>
        </div>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Role</CardTitle>
            <CardDescription>
              Choose a persona to explore CoreComply with different permissions and workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser === user.id ? "default" : "outline"}
                  className="h-auto p-4 justify-start gap-3"
                  onClick={() => setSelectedUser(user.id)}
                  data-testid={`role-card-${user.role}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatRole(user.role)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleLogin} 
                disabled={!selectedUser}
                className="w-full"
                data-testid="button-login"
              >
                Continue as {selectedUser && users.find(u => u.id === selectedUser)?.name}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This is a demo environment with mock data and simulated workflows</p>
        </div>
      </div>
    </div>
  );
}