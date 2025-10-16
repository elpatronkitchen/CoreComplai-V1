import { useState, useEffect } from 'react';
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { 
  Search,
  Shield,
  FileText,
  BarChart3,
  Users,
  Settings,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<any>;
  action: () => void;
  group: string;
  permission?: string;
  keywords?: string[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAppStore();

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View compliance overview',
      icon: BarChart3,
      action: () => console.log('Navigate to dashboard'),
      group: 'Navigation',
      keywords: ['home', 'overview']
    },
    {
      id: 'nav-controls',
      label: 'Go to Controls',
      description: 'Manage compliance controls',
      icon: Shield,
      action: () => console.log('Navigate to controls'),
      group: 'Navigation',
      permission: 'view_controls'
    },
    {
      id: 'nav-policies',
      label: 'Go to Policies',
      description: 'Manage policies and procedures',
      icon: FileText,
      action: () => console.log('Navigate to policies'),
      group: 'Navigation',
      permission: 'view_policies'
    },
    {
      id: 'nav-audits',
      label: 'Go to Audits',
      description: 'View and manage audits',
      icon: Users,
      action: () => console.log('Navigate to audits'),
      group: 'Navigation',
      permission: 'view_audits'
    },
    {
      id: 'nav-reports',
      label: 'Go to Reports',
      description: 'Generate compliance reports',
      icon: BarChart3,
      action: () => console.log('Navigate to reports'),
      group: 'Navigation',
      permission: 'view_reports'
    },
    {
      id: 'nav-admin',
      label: 'Go to Admin',
      description: 'System administration',
      icon: Settings,
      action: () => console.log('Navigate to admin'),
      group: 'Navigation',
      permission: 'manage_users'
    },

    // Actions
    {
      id: 'action-new-control',
      label: 'Create New Control',
      description: 'Add a new compliance control',
      icon: Plus,
      action: () => console.log('Create new control'),
      group: 'Actions',
      permission: 'manage_controls',
      keywords: ['add', 'create', 'new']
    },
    {
      id: 'action-new-policy',
      label: 'Create New Policy',
      description: 'Draft a new policy',
      icon: Plus,
      action: () => console.log('Create new policy'),
      group: 'Actions',
      permission: 'manage_policies',
      keywords: ['add', 'create', 'new']
    },
    {
      id: 'action-upload-evidence',
      label: 'Upload Evidence',
      description: 'Upload supporting documentation',
      icon: Upload,
      action: () => console.log('Upload evidence'),
      group: 'Actions',
      permission: 'upload_evidence',
      keywords: ['upload', 'attach', 'document']
    },
    {
      id: 'action-start-audit',
      label: 'Start Internal Audit',
      description: 'Begin new audit session',
      icon: Search,
      action: () => console.log('Start audit'),
      group: 'Actions',
      permission: 'run_internal_audits',
      keywords: ['audit', 'review', 'inspect']
    },
    {
      id: 'action-export-gap',
      label: 'Export Gap Analysis',
      description: 'Download gap analysis report',
      icon: Download,
      action: () => console.log('Export gap analysis'),
      group: 'Actions',
      permission: 'export_reports',
      keywords: ['export', 'download', 'gap', 'analysis']
    },
    {
      id: 'action-export-compliance',
      label: 'Export Compliance Report',
      description: 'Download compliance summary',
      icon: Download,
      action: () => console.log('Export compliance report'),
      group: 'Actions',
      permission: 'export_reports',
      keywords: ['export', 'download', 'compliance', 'report']
    },
  ];

  // Filter commands based on permissions
  const visibleCommands = commands.filter(cmd => 
    !cmd.permission || hasPermission(currentUser, cmd.permission as any)
  );

  // Group commands
  const groupedCommands = visibleCommands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleSelect = (command: CommandItem) => {
    setOpen(false);
    command.action();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {Object.entries(groupedCommands).map(([group, items], index) => (
          <div key={group}>
            <CommandGroup heading={group}>
              {items.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => handleSelect(command)}
                  data-testid={`command-${command.id}`}
                >
                  <command.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{command.label}</span>
                    {command.description && (
                      <span className="text-xs text-muted-foreground">
                        {command.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {index < Object.keys(groupedCommands).length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}