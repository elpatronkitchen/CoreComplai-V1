import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Users,
  Download,
  Plus,
  Trash2,
  Calendar,
  UserPlus,
  Sparkles,
  Cloud,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { usePeopleStore, type Person, type Framework } from '@/stores/usePeopleStore';
import { useSodStore } from '@/stores/useSodStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RoleCatalog {
  roles: Array<{
    role: string;
    framework: string;
    displayName: string;
    required: boolean;
    sodConflictsWith: string[];
  }>;
}

export default function KeyPersonnelContent() {
  const { toast } = useToast();
  const { 
    people, 
    roleBindings, 
    addPerson,
    assignRole,
    removeRole, 
    setOOO,
    importPeople,
    getCoverageByFramework,
    updatePerson 
  } = usePeopleStore();
  const { rules, checkPerson, initializeDefaultRules } = useSodStore();
  
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [newRoleDialog, setNewRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<Framework>('APGF');
  const [oooDialogOpen, setOooDialogOpen] = useState(false);
  const [oooFrom, setOooFrom] = useState('');
  const [oooTo, setOooTo] = useState('');
  const [delegateId, setDelegateId] = useState('');
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);
  const [newPerson, setNewPerson] = useState({
    displayName: '',
    email: '',
    title: '',
    department: ''
  });

  // Initialize SoD rules on mount
  useEffect(() => {
    initializeDefaultRules();
  }, [initializeDefaultRules]);

  // Fetch role catalog
  const { data: roleCatalog } = useQuery<RoleCatalog>({
    queryKey: ['/api/roles'],
  });

  // M365 Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/people/import/m365', {});
      return await response.json();
    },
    onSuccess: (data) => {
      const newPeople: Person[] = data.users.map((u: any) => ({
        id: u.id,
        displayName: u.displayName,
        email: u.email,
        title: u.jobTitle,
        department: u.department,
        location: u.officeLocation,
        phone: u.mobilePhone || u.businessPhones?.[0],
        managerId: u.manager?.id,
        roles: u.roles || [],
        active: true
      }));
      
      importPeople(newPeople);
      toast({
        title: 'Import Successful',
        description: `Imported ${data.summary.new} people from Microsoft 365`
      });
    },
    onError: () => {
      toast({
        title: 'Import Failed',
        description: 'Could not import from Microsoft 365',
        variant: 'destructive'
      });
    }
  });

  // Role suggestion mutation
  const suggestMutation = useMutation({
    mutationFn: async (params: { role: string; framework: Framework }) => {
      const response = await apiRequest('POST', '/api/people/suggest', params);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.suggestions && data.suggestions.length > 0) {
        const topSuggestion = data.suggestions[0];
        toast({
          title: 'Suggestion Available',
          description: `Top candidate: ${people.find(p => p.id === topSuggestion.personId)?.displayName || 'Unknown'} (${Math.round(topSuggestion.score * 100)}% match)`
        });
      }
    }
  });

  // Calculate coverage
  const apgfRoles = roleCatalog?.roles.filter(r => r.framework === 'APGF' && r.required).map(r => r.role) || [];
  const iso9001Roles = roleCatalog?.roles.filter(r => r.framework === 'ISO9001' && r.required).map(r => r.role) || [];
  const iso27001Roles = roleCatalog?.roles.filter(r => r.framework === 'ISO27001' && r.required).map(r => r.role) || [];

  const apgfCoverage = getCoverageByFramework('APGF', apgfRoles);
  const iso9001Coverage = getCoverageByFramework('ISO9001', iso9001Roles);
  const iso27001Coverage = getCoverageByFramework('ISO27001', iso27001Roles);

  // Check SoD violations
  const allViolations = people.flatMap(person => 
    checkPerson(person.id, person.roles).map(v => ({ ...v, person }))
  );

  const handleAssignRole = () => {
    if (!selectedPerson || !selectedRole) return;

    // Check SoD before assigning
    const violations = checkPerson(selectedPerson.id, [...selectedPerson.roles, selectedRole]);
    if (violations.length > 0 && violations.some(v => v.severity === 'critical')) {
      toast({
        title: 'SoD Violation',
        description: violations[0].message,
        variant: 'destructive'
      });
      return;
    }

    assignRole({
      role: selectedRole,
      personId: selectedPerson.id,
      rasci: ['R'],
      scope: { framework: selectedFramework }
    });

    toast({
      title: 'Role Assigned',
      description: `${selectedRole} assigned to ${selectedPerson.displayName}`
    });

    setNewRoleDialog(false);
    setSelectedRole('');
  };

  const handleRemoveRole = (bindingId: string) => {
    removeRole(bindingId);
    toast({
      title: 'Role Removed',
      description: 'Role binding removed successfully'
    });
  };

  const handleSetOOO = () => {
    if (!selectedPerson || !oooFrom || !oooTo) return;

    setOOO(selectedPerson.id, {
      fromISO: oooFrom,
      toISO: oooTo,
      delegateId: delegateId || undefined
    });

    toast({
      title: 'Out of Office Set',
      description: `${selectedPerson.displayName} will be OOO from ${oooFrom} to ${oooTo}`
    });

    setOooDialogOpen(false);
    setOooFrom('');
    setOooTo('');
    setDelegateId('');
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Title', 'Department', 'Roles'].join(','),
      ...people.map(p => [
        p.displayName,
        p.email,
        p.title || '',
        p.department || '',
        p.roles.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'key-personnel.csv';
    a.click();

    toast({
      title: 'Export Complete',
      description: 'Key personnel data exported to CSV'
    });
  };

  const handleAddPerson = () => {
    if (!newPerson.displayName || !newPerson.email) {
      toast({
        title: 'Missing Information',
        description: 'Name and email are required',
        variant: 'destructive'
      });
      return;
    }

    const person: Person = {
      id: `manual-${Date.now()}`,
      displayName: newPerson.displayName,
      email: newPerson.email,
      title: newPerson.title || undefined,
      department: newPerson.department || undefined,
      roles: [],
      active: true
    };

    addPerson(person);
    
    toast({
      title: 'Person Added',
      description: `${person.displayName} has been added successfully`
    });

    setShowAddPersonDialog(false);
    setNewPerson({
      displayName: '',
      email: '',
      title: '',
      department: ''
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Key Personnel Functionality Explanation */}
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Key Personnel Mapping:</strong> The Key Personnel assignments below automatically map to all controls, policies, obligations, RASCI matrices, and audit workflows across the entire system. When someone leaves and you assign their replacement here, their successor is automatically assigned all their compliance responsibilities for seamless continuity.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-key-personnel">
              <Users className="h-8 w-8 text-primary" />
              Key Personnel
            </h1>
            <p className="text-muted-foreground">
              Single source of truth for people, roles, and responsibilities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddPersonDialog(true)}
              data-testid="button-add-person"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
            <Button
              variant="outline"
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending}
              data-testid="button-import-m365"
            >
              <Cloud className="h-4 w-4 mr-2" />
              {importMutation.isPending ? 'Importing...' : 'Connect Microsoft 365'}
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Coverage Meters */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-apgf-coverage">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">APGF Coverage</CardTitle>
              <Badge variant={apgfCoverage === 100 ? 'default' : 'secondary'}>
                {Math.round(apgfCoverage)}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apgfRoles.length} roles</div>
              <p className="text-xs text-muted-foreground">
                {apgfRoles.filter(r => roleBindings.some(rb => rb.role === r && rb.scope?.framework === 'APGF')).length} assigned
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-iso9001-coverage">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ISO 9001 Coverage</CardTitle>
              <Badge variant={iso9001Coverage === 100 ? 'default' : 'secondary'}>
                {Math.round(iso9001Coverage)}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{iso9001Roles.length} roles</div>
              <p className="text-xs text-muted-foreground">
                {iso9001Roles.filter(r => roleBindings.some(rb => rb.role === r && rb.scope?.framework === 'ISO9001')).length} assigned
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-iso27001-coverage">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ISO 27001 Coverage</CardTitle>
              <Badge variant={iso27001Coverage === 100 ? 'default' : 'secondary'}>
                {Math.round(iso27001Coverage)}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{iso27001Roles.length} roles</div>
              <p className="text-xs text-muted-foreground">
                {iso27001Roles.filter(r => roleBindings.some(rb => rb.role === r && rb.scope?.framework === 'ISO27001')).length} assigned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SoD Violations */}
        {allViolations.length > 0 && (
          <Alert variant="destructive" data-testid="alert-sod-violations">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Segregation of Duties Violations</AlertTitle>
            <AlertDescription>
              {allViolations.length} violation(s) detected:
              <ul className="mt-2 space-y-1">
                {allViolations.slice(0, 3).map((v, idx) => (
                  <li key={idx} className="text-sm">
                    • {v.person.displayName}: {v.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* People Table */}
        <Card>
          <CardHeader>
            <CardTitle>People & Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id} data-testid={`row-person-${person.id}`}>
                    <TableCell className="font-medium">{person.displayName}</TableCell>
                    <TableCell>{person.title || '-'}</TableCell>
                    <TableCell>{person.department || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {roleBindings
                          .filter(rb => rb.personId === person.id)
                          .map(binding => (
                            <Badge
                              key={binding.id}
                              variant="secondary"
                              className="gap-1"
                              data-testid={`badge-role-${binding.role}`}
                            >
                              {binding.role}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-3 w-3 p-0 hover:bg-transparent"
                                onClick={() => handleRemoveRole(binding.id)}
                                data-testid={`button-remove-role-${binding.id}`}
                              >
                                <Trash2 className="h-2 w-2" />
                              </Button>
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {person.ooo ? (
                        <Badge variant="outline" data-testid="badge-ooo">OOO</Badge>
                      ) : (
                        <Badge variant="default" data-testid="badge-active">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog open={newRoleDialog && selectedPerson?.id === person.id} onOpenChange={(open) => {
                          setNewRoleDialog(open);
                          if (open) setSelectedPerson(person);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-add-role-${person.id}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Role
                            </Button>
                          </DialogTrigger>
                          <DialogContent data-testid="dialog-add-role">
                            <DialogHeader>
                              <DialogTitle>Assign Role to {person.displayName}</DialogTitle>
                              <DialogDescription>
                                Select a role and framework to assign
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Framework</Label>
                                <Select value={selectedFramework} onValueChange={(v) => setSelectedFramework(v as Framework)}>
                                  <SelectTrigger data-testid="select-framework">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="APGF">APGF-MS</SelectItem>
                                    <SelectItem value="ISO9001">ISO 9001</SelectItem>
                                    <SelectItem value="ISO27001">ISO 27001</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Role</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                  <SelectTrigger data-testid="select-role">
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roleCatalog?.roles
                                      .filter(r => r.framework === selectedFramework)
                                      .map(role => (
                                        <SelectItem key={role.role} value={role.role}>
                                          {role.displayName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleAssignRole}
                                disabled={!selectedRole}
                                data-testid="button-confirm-assign"
                              >
                                Assign Role
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={oooDialogOpen && selectedPerson?.id === person.id} onOpenChange={(open) => {
                          setOooDialogOpen(open);
                          if (open) setSelectedPerson(person);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-set-ooo-${person.id}`}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              OOO
                            </Button>
                          </DialogTrigger>
                          <DialogContent data-testid="dialog-set-ooo">
                            <DialogHeader>
                              <DialogTitle>Set Out of Office</DialogTitle>
                              <DialogDescription>
                                Configure OOO period and delegate for {person.displayName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>From Date</Label>
                                <Input
                                  type="date"
                                  value={oooFrom}
                                  onChange={(e) => setOooFrom(e.target.value)}
                                  data-testid="input-ooo-from"
                                />
                              </div>
                              <div>
                                <Label>To Date</Label>
                                <Input
                                  type="date"
                                  value={oooTo}
                                  onChange={(e) => setOooTo(e.target.value)}
                                  data-testid="input-ooo-to"
                                />
                              </div>
                              <div>
                                <Label>Delegate (Optional)</Label>
                                <Select value={delegateId} onValueChange={setDelegateId}>
                                  <SelectTrigger data-testid="select-delegate">
                                    <SelectValue placeholder="Select delegate" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {people
                                      .filter(p => p.id !== person.id && p.active)
                                      .map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                          {p.displayName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleSetOOO}
                                disabled={!oooFrom || !oooTo}
                                data-testid="button-confirm-ooo"
                              >
                                Set OOO
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Catalog Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Role Catalog & Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['APGF', 'ISO9001', 'ISO27001'].map(framework => (
                <div key={framework}>
                  <h3 className="font-semibold mb-2">{framework === 'APGF' ? 'APGF-MS' : framework === 'ISO9001' ? 'ISO 9001' : 'ISO 27001'}</h3>
                  <div className="grid gap-2">
                    {roleCatalog?.roles
                      .filter(r => r.framework === framework && r.required)
                      .map(role => {
                        const binding = roleBindings.find(
                          rb => rb.role === role.role && rb.scope?.framework === framework
                        );
                        const assignedPerson = binding ? people.find(p => p.id === binding.personId) : null;
                        
                        return (
                          <div
                            key={role.role}
                            className="flex items-center justify-between gap-4 p-3 border rounded"
                            data-testid={`role-${role.role}`}
                          >
                            <div className="flex-1">
                              <div className="font-medium">{role.displayName}</div>
                              {role.required && (
                                <Badge variant="outline" className="mt-1 text-xs">Required</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={assignedPerson?.id || '_unassigned'}
                                onValueChange={(personId) => {
                                  if (personId && personId !== '_unassigned') {
                                    const person = people.find(p => p.id === personId);
                                    if (person) {
                                      // Check SoD before assigning
                                      const violations = checkPerson(personId, [...person.roles, role.role]);
                                      if (violations.length > 0 && violations.some(v => v.severity === 'critical')) {
                                        toast({
                                          title: 'SoD Violation',
                                          description: violations[0].message,
                                          variant: 'destructive'
                                        });
                                        return;
                                      }
                                      
                                      // Remove existing assignment if any
                                      if (binding) {
                                        removeRole(binding.id);
                                      }
                                      
                                      assignRole({
                                        role: role.role,
                                        personId: personId,
                                        rasci: ['R'],
                                        scope: { framework: framework as Framework }
                                      });
                                      
                                      toast({
                                        title: 'Role Assigned',
                                        description: `${role.displayName} assigned to ${person.displayName}`
                                      });
                                    }
                                  } else if (personId === '_unassigned' && binding) {
                                    // Unassign if unassigned value selected
                                    removeRole(binding.id);
                                    toast({
                                      title: 'Role Unassigned',
                                      description: `${role.displayName} unassigned`
                                    });
                                  }
                                }}
                                data-testid={`select-person-${role.role}`}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select person" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_unassigned">
                                    <span className="text-muted-foreground">Unassigned</span>
                                  </SelectItem>
                                  {people
                                    .filter(p => p.active)
                                    .map(p => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.displayName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => suggestMutation.mutate({ role: role.role, framework: framework as Framework })}
                                disabled={suggestMutation.isPending}
                                data-testid={`button-suggest-${role.role}`}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Suggest
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Person Dialog */}
        <Dialog open={showAddPersonDialog} onOpenChange={setShowAddPersonDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Person Manually</DialogTitle>
              <DialogDescription>
                Add a new person to the organization. You can also import from Microsoft 365.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="person-name">Name *</Label>
                <Input
                  id="person-name"
                  value={newPerson.displayName}
                  onChange={(e) => setNewPerson({ ...newPerson, displayName: e.target.value })}
                  placeholder="e.g., John Smith"
                  data-testid="input-person-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person-email">Email *</Label>
                <Input
                  id="person-email"
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  placeholder="e.g., john.smith@company.com"
                  data-testid="input-person-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person-title">Job Title</Label>
                <Input
                  id="person-title"
                  value={newPerson.title}
                  onChange={(e) => setNewPerson({ ...newPerson, title: e.target.value })}
                  placeholder="e.g., Compliance Manager"
                  data-testid="input-person-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person-department">Department</Label>
                <Input
                  id="person-department"
                  value={newPerson.department}
                  onChange={(e) => setNewPerson({ ...newPerson, department: e.target.value })}
                  placeholder="e.g., Compliance"
                  data-testid="input-person-department"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddPersonDialog(false)}
                data-testid="button-cancel-add-person"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPerson}
                data-testid="button-confirm-add-person"
              >
                Add Person
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
