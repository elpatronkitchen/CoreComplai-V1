import { useState } from 'react';
import { Search, Settings, User, Menu, Sun, Moon } from 'lucide-react';
import logoImage from '@assets/corecomplylogo_1759201557823.jpg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { useUser } from '@/contexts/UserContext';
import { hasPermission, formatRole } from '@/lib/permissions';
import { t } from '@/lib/i18n';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  FileText, 
  Search as SearchIcon, 
  BarChart3, 
  Settings as SettingsIcon, 
  HelpCircle,
  CheckSquare,
  Calendar as CalendarIcon,
  Building,
  AlertTriangle,
  Database,
  Zap,
  Users
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

interface AppShellProps {
  children: React.ReactNode;
}

const navigationItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, permission: 'view_dashboard' as const },
  { title: 'Calendar', url: '/calendar', icon: CalendarIcon, permission: 'view_dashboard' as const },
  { title: 'Controls', url: '/controls', icon: CheckSquare, permission: 'view_controls' as const },
  { title: 'Policies', url: '/policies', icon: FileText, permission: 'view_policies' as const },
  { title: 'Frameworks', url: '/frameworks', icon: Shield, permission: 'view_frameworks' as const },
  { title: 'Audits', url: '/audits', icon: SearchIcon, permission: 'view_audits' as const },
  { title: 'Risk Registers', url: '/risks', icon: AlertTriangle, permission: 'view_risk_registers' as const },
  { title: 'Assets', url: '/assets', icon: Database, permission: 'view_assets' as const },
  { title: 'People', url: '/people', icon: Users, permission: 'view_people' as const },
  { title: 'Integrations', url: '/integrations', icon: Zap, permission: 'view_integrations' as const },
  { title: 'Reports', url: '/reports', icon: BarChart3, permission: 'view_reports' as const },
  { title: 'Company Profile', url: '/company-profile', icon: Building, permission: 'manage_company_profile' as const },
  { title: 'Admin', url: '/admin', icon: SettingsIcon, permission: 'manage_users' as const },
  { title: 'Support', url: '/support', icon: HelpCircle, permission: 'view_dashboard' as const },
];

function TopBar() {
  const { user: currentUser, logout } = useUser();
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleCommand = () => {
    // Command palette will be implemented separately
    console.log('Command palette triggered');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search controls, policies..."
              className="pl-10 w-64"
              onFocus={handleCommand}
              data-testid="input-global-search"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="outline" className="text-xs">⌘K</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          data-testid="button-theme-toggle"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{currentUser?.firstName} {currentUser?.lastName}</div>
                <div className="text-xs text-muted-foreground">{currentUser && formatRole(currentUser.role)}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} data-testid="menuitem-logout">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AppSidebar() {
  const { user: currentUser } = useUser();
  const location = useLocation();
  const pathname = location.pathname;

  const visibleItems = navigationItems.filter(item => 
    hasPermission(currentUser, item.permission)
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4 mb-2">
            <Link to="/" aria-label="Go to dashboard" className="flex items-center justify-start">
              <img 
                src={logoImage} 
                alt="CoreComply" 
                className="h-12 w-auto object-contain"
                data-testid="logo-sidebar"
              />
            </Link>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url))}
                  >
                    <Link to={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const { darkMode } = useAppStore();

  // Apply dark mode class to document
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', darkMode);
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}