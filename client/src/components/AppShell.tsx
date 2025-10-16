import { Search, Settings, User, Menu, Sun, Moon, ChevronDown } from 'lucide-react';
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
import ActiveFrameworkDropdown from '@/components/ActiveFrameworkDropdown';
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
import { useAppStore } from '@/lib/store';
import { hasPermission, formatRole } from '@/lib/permissions';
import { t } from '@/lib/i18n';
import { Link, useLocation } from 'wouter';
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
  Users,
  ClipboardCheck,
  FileCheck,
  Rocket,
  ListTodo,
  Upload,
  Sparkles,
  CreditCard,
  Award
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useSetupStore } from '@/lib/setup/setupStore';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  permission: 'view_dashboard' | 'manage_company_profile' | 'view_people' | 'view_frameworks' | 'view_controls' | 'view_policies' | 'view_audits' | 'view_assets' | 'view_reports' | 'manage_users' | 'view_integrations';
  showBadge?: boolean;
  frameworks?: string[]; // If undefined, shows for all frameworks. If array, shows only for those frameworks.
}

const navigationItems: NavigationItem[] = [
  // Universal items (show for all frameworks)
  { title: 'Get Started', url: '/setup', icon: Rocket, permission: 'view_dashboard', showBadge: true },
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, permission: 'view_dashboard' },
  { title: 'Company Profile', url: '/company-profile', icon: Building, permission: 'manage_company_profile' },
  { title: 'Billing', url: '/billing', icon: CreditCard, permission: 'view_dashboard' },
  { title: 'People', url: '/people', icon: Users, permission: 'view_people' },
  { title: 'Frameworks', url: '/frameworks', icon: Shield, permission: 'view_frameworks' },
  
  // APGF-MS specific items
  { title: 'RASCI Matrix', url: '/people?tab=rasci', icon: ClipboardCheck, permission: 'view_people', frameworks: ['apgf-ms'] },
  { title: 'Payroll Audit', url: '/audits', icon: SearchIcon, permission: 'view_audits', frameworks: ['apgf-ms'] },
  
  // ISO 9001 specific items
  { title: 'QMS Setup', url: '/frameworks/iso9001/starter', icon: Award, permission: 'view_frameworks', frameworks: ['iso-9001'] },
  { title: 'Internal Quality Audit', url: '/audits', icon: SearchIcon, permission: 'view_audits', frameworks: ['iso-9001'] },
  { title: 'NC/CAPA', url: '/nc-capa', icon: AlertTriangle, permission: 'view_audits', frameworks: ['iso-9001'] },
  
  // ISO 27001 specific items
  { title: 'ISMS Setup', url: '/frameworks/iso27001/starter', icon: Shield, permission: 'view_frameworks', frameworks: ['iso-27001'] },
  { title: 'Statement of Applicability', url: '/soa', icon: FileCheck, permission: 'view_frameworks', frameworks: ['iso-27001'] },
  { title: 'Security Audit', url: '/audits', icon: SearchIcon, permission: 'view_audits', frameworks: ['iso-27001'] },
  
  // Items that filter by active framework
  { title: 'Registers', url: '/registers', icon: ClipboardCheck, permission: 'view_frameworks' },
  { title: 'Controls', url: '/controls', icon: CheckSquare, permission: 'view_controls' },
  { title: 'Policies', url: '/policies', icon: FileText, permission: 'view_policies' },
  { title: 'Tasks', url: '/calendar', icon: ListTodo, permission: 'view_dashboard' },
  { title: 'Assets', url: '/assets', icon: Database, permission: 'view_assets' },
  { title: 'Reports', url: '/reports', icon: BarChart3, permission: 'view_reports' },
  { title: 'Admin', url: '/admin', icon: SettingsIcon, permission: 'manage_users' },
  { title: 'Integrations', url: '/integrations', icon: Zap, permission: 'view_integrations' },
  { title: 'Support', url: '/support', icon: HelpCircle, permission: 'view_dashboard' },
];

function TopBar() {
  const { currentUser, darkMode, toggleDarkMode, setCurrentUser, activeFramework, setActiveFramework, frameworks, purchasedFrameworks } = useAppStore();

  const handleCommand = () => {
    // Command palette will be implemented separately
    console.log('Command palette triggered');
  };

  // Get available frameworks (only purchased ones)
  const availableFrameworks = frameworks.filter(f => purchasedFrameworks.includes(f.id));
  const currentFramework = frameworks.find(f => f.id === activeFramework);

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        {/* Framework Selector */}
        <div className="hidden lg:flex flex-col gap-1">
          <ActiveFrameworkDropdown
            value={activeFramework || undefined}
            onChange={(id) => setActiveFramework(id)}
            items={availableFrameworks}
            label="Active Framework"
          />
          <p className="text-[10px] text-muted-foreground">Select active compliance framework</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col gap-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search controls, policies..."
              className="pl-10 w-80 h-10"
              onFocus={handleCommand}
              data-testid="input-global-search"
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-right">For quick command access use Ctrl+K or ⌘+K</p>
        </div>

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
                <AvatarImage src="" />
                <AvatarFallback>{currentUser?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{currentUser?.name}</div>
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
            <DropdownMenuItem onClick={() => setCurrentUser(null)} data-testid="menuitem-logout">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AppSidebar() {
  const { currentUser, activeFramework, purchasedFrameworks } = useAppStore();
  const [location] = useLocation();
  const { completion } = useSetupStore();

  const visibleItems = navigationItems.filter(item => {
    // Check permission
    if (!hasPermission(currentUser, item.permission)) {
      return false;
    }
    
    // Check framework filter
    if (item.frameworks) {
      // Item has framework restrictions - only show if:
      // 1. Active framework matches one of the item's frameworks AND
      // 2. User has purchased that active framework
      if (activeFramework && item.frameworks.includes(activeFramework) && purchasedFrameworks.includes(activeFramework)) {
        return true;
      }
      return false;
    }
    
    // Item has no framework restriction - show for all frameworks
    return true;
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4 mb-2">
            <Link href="/" aria-label="Go to dashboard" className="flex items-center justify-start">
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
                    isActive={location === item.url || (item.url !== '/' && location.startsWith(item.url))}
                  >
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2 w-full">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.showBadge && completion < 100 && (
                        <Badge variant="secondary" className="ml-auto" data-testid="badge-setup-completion">
                          {completion}%
                        </Badge>
                      )}
                      {item.showBadge && completion >= 100 && (
                        <Badge variant="default" className="ml-auto" data-testid="badge-setup-complete">
                          Done
                        </Badge>
                      )}
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