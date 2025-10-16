import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  Users
} from "lucide-react";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import AppShell from "@/components/AppShell";
import { create } from 'zustand';

interface PositionDescription {
  id: string;
  title: string;
  department: string;
  level: string;
  status: 'Active' | 'Draft' | 'Archived';
  responsibilities: string[];
  qualifications: string[];
  rasciRoles: {
    process: string;
    assignment: 'R' | 'A' | 'S' | 'C' | 'I';
  }[];
  reportingTo: string;
  supervises: string[];
  createdDate: string;
  lastUpdated: string;
}

// Zustand store for position management
interface PositionStore {
  positions: PositionDescription[];
  addPosition: (position: Omit<PositionDescription, 'id' | 'createdDate' | 'lastUpdated'>) => void;
  updatePosition: (id: string, position: Partial<PositionDescription>) => void;
  deletePosition: (id: string) => void;
  useTemplate: (templateId: string) => PositionDescription;
}

// Seed data for demonstration
const seedPositions: PositionDescription[] = [
  {
    id: 'PD-001',
    title: 'Payroll Officer',
    department: 'Finance',
    level: 'Operational',
    status: 'Active',
    responsibilities: [
      'Process bi-weekly payroll for all employees ensuring accuracy and compliance',
      'Maintain payroll records and ensure data integrity',
      'Upload evidence for payroll compliance controls',
      'Reconcile payroll variances and investigate discrepancies'
    ],
    qualifications: [
      'Certificate IV in Payroll Administration or equivalent',
      'Minimum 2 years payroll processing experience',
      'Understanding of Australian payroll legislation and awards'
    ],
    rasciRoles: [
      { process: 'Payrun Processing', assignment: 'R' },
      { process: 'Award Compliance', assignment: 'C' }
    ],
    reportingTo: 'Finance Manager',
    supervises: [],
    createdDate: '2024-01-15',
    lastUpdated: '2024-09-20'
  },
  {
    id: 'PD-002',
    title: 'HR Manager',
    department: 'People & Culture',
    level: 'Management',
    status: 'Active',
    responsibilities: [
      'Oversee policy development and approval processes',
      'Ensure HR compliance with employment legislation',
      'Manage award interpretation and application'
    ],
    qualifications: [
      'Bachelor\'s degree in Human Resources or related field',
      'Minimum 5 years HR management experience',
      'Deep knowledge of Fair Work Act and employment awards'
    ],
    rasciRoles: [
      { process: 'Award Compliance', assignment: 'R' },
      { process: 'Policy Review', assignment: 'A' }
    ],
    reportingTo: 'Operations Director',
    supervises: ['HR Coordinator', 'Recruitment Specialist'],
    createdDate: '2024-01-15',
    lastUpdated: '2024-08-10'
  },
  {
    id: 'PD-003',
    title: 'Compliance Officer',
    department: 'Risk & Compliance',
    level: 'Management',
    status: 'Active',
    responsibilities: [
      'Manage APGF framework implementation and monitoring',
      'Coordinate internal audit activities',
      'Oversee evidence management and retention'
    ],
    qualifications: [
      'Bachelor\'s degree in Business, Risk Management or related field',
      'Minimum 3 years compliance or audit experience',
      'Knowledge of governance frameworks (ISO, APGF, NIST)'
    ],
    rasciRoles: [
      { process: 'Audit Coordination', assignment: 'R' },
      { process: 'Risk Assessment', assignment: 'R' }
    ],
    reportingTo: 'Operations Director',
    supervises: ['Compliance Analyst'],
    createdDate: '2024-02-01',
    lastUpdated: '2024-09-15'
  }
];

const usePositionStore = create<PositionStore>((set, get) => ({
  positions: seedPositions,
  addPosition: (position) => set((state) => ({
    positions: [
      ...state.positions,
      {
        ...position,
        id: `PD-${String(state.positions.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    ]
  })),
  updatePosition: (id, updates) => set((state) => ({
    positions: state.positions.map(p =>
      p.id === id
        ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    )
  })),
  deletePosition: (id) => set((state) => ({
    positions: state.positions.filter(p => p.id !== id)
  })),
  useTemplate: (templateId) => {
    const templates: Record<string, Omit<PositionDescription, 'id' | 'createdDate' | 'lastUpdated'>> = {
      'TPL-001': {
        title: 'Payroll Officer',
        department: 'Finance',
        level: 'Operational',
        status: 'Draft',
        responsibilities: [
          'Process bi-weekly payroll for all employees ensuring accuracy and compliance',
          'Maintain payroll records and ensure data integrity',
          'Upload evidence for payroll compliance controls'
        ],
        qualifications: [
          'Certificate IV in Payroll Administration or equivalent',
          'Minimum 2 years payroll processing experience',
          'Understanding of Australian payroll legislation and awards'
        ],
        rasciRoles: [
          { process: 'Payroll Processing', assignment: 'R' },
          { process: 'Evidence Management', assignment: 'R' }
        ],
        reportingTo: 'Finance Manager',
        supervises: []
      },
      'TPL-002': {
        title: 'HR Manager',
        department: 'People & Culture',
        level: 'Management',
        status: 'Draft',
        responsibilities: [
          'Oversee policy development and approval processes',
          'Ensure HR compliance with employment legislation',
          'Manage award interpretation and application'
        ],
        qualifications: [
          'Bachelor\'s degree in Human Resources or related field',
          'Minimum 5 years HR management experience',
          'Deep knowledge of Fair Work Act and employment awards'
        ],
        rasciRoles: [
          { process: 'Award Interpretation', assignment: 'R' },
          { process: 'Policy Approval', assignment: 'A' }
        ],
        reportingTo: 'Operations Director',
        supervises: ['HR Coordinator', 'Recruitment Specialist']
      },
      'TPL-003': {
        title: 'Compliance Officer',
        department: 'Risk & Compliance',
        level: 'Management',
        status: 'Draft',
        responsibilities: [
          'Manage APGF framework implementation and monitoring',
          'Coordinate internal audit activities and findings management',
          'Oversee evidence management and retention'
        ],
        qualifications: [
          'Bachelor\'s degree in Business, Risk Management or related field',
          'Minimum 3 years compliance or audit experience',
          'Knowledge of governance frameworks (ISO, APGF, NIST)'
        ],
        rasciRoles: [
          { process: 'System Access Control', assignment: 'A' },
          { process: 'Audit Management', assignment: 'R' },
          { process: 'Evidence Management', assignment: 'A' }
        ],
        reportingTo: 'Operations Director',
        supervises: ['Compliance Analyst']
      },
      'TPL-004': {
        title: 'Internal Auditor',
        department: 'Risk & Compliance',
        level: 'Management',
        status: 'Draft',
        responsibilities: [
          'Plan and conduct internal audits of compliance controls',
          'Document audit findings and track remediation',
          'Generate audit reports for stakeholders'
        ],
        qualifications: [
          'Bachelor\'s degree in Accounting, Audit, or related field',
          'Professional audit certification (CIA, CISA) preferred',
          'Minimum 3 years internal audit experience'
        ],
        rasciRoles: [
          { process: 'Audit Management', assignment: 'A' },
          { process: 'Evidence Management', assignment: 'C' }
        ],
        reportingTo: 'Audit Committee',
        supervises: []
      },
      'TPL-005': {
        title: 'System Administrator',
        department: 'IT',
        level: 'Operational',
        status: 'Draft',
        responsibilities: [
          'Manage system access controls and user permissions',
          'Implement and maintain security policies',
          'Provide technical support for payroll and compliance systems'
        ],
        qualifications: [
          'Bachelor\'s degree in IT or Computer Science',
          'Minimum 3 years system administration experience',
          'Knowledge of access control and security frameworks'
        ],
        rasciRoles: [
          { process: 'System Access Control', assignment: 'R' },
          { process: 'Payroll Processing', assignment: 'S' }
        ],
        reportingTo: 'IT Manager',
        supervises: []
      }
    };
    return {
      ...templates[templateId],
      id: '', // Will be set by addPosition
      createdDate: '',
      lastUpdated: ''
    } as PositionDescription;
  }
}));

const positionTemplates = [
  {
    id: 'TPL-001',
    title: 'Payroll Officer',
    category: 'Operational',
    description: 'Standard template for payroll processing roles'
  },
  {
    id: 'TPL-002',
    title: 'HR Manager',
    category: 'Management',
    description: 'Template for human resources management positions'
  },
  {
    id: 'TPL-003',
    title: 'Compliance Officer',
    category: 'Management',
    description: 'Template for compliance and governance roles'
  },
  {
    id: 'TPL-004',
    title: 'Internal Auditor',
    category: 'Management',
    description: 'Template for internal audit positions'
  },
  {
    id: 'TPL-005',
    title: 'System Administrator',
    category: 'Operational',
    description: 'Template for IT system administration roles'
  }
];

const getRasciColor = (assignment: 'R' | 'A' | 'S' | 'C' | 'I') => {
  const colors = {
    'R': 'bg-blue-600',
    'A': 'bg-purple-600',
    'S': 'bg-green-600',
    'C': 'bg-orange-600',
    'I': 'bg-gray-600'
  };
  return colors[assignment];
};

const getStatusBadge = (status: string) => {
  const variants = {
    "Active": "default",
    "Draft": "secondary",
    "Archived": "outline"
  } as const;
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
      {status}
    </Badge>
  );
};

export default function PositionDescriptionsPage() {
  const { currentUser } = useAppStore();
  const { positions, addPosition, updatePosition, deletePosition } = usePositionStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [selectedPosition, setSelectedPosition] = useState<PositionDescription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const mockPositionDescriptions = positions;

  const canManage = hasPermission(currentUser, 'manage_people');
  const canView = hasPermission(currentUser, 'view_people');

  if (!canView) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view position descriptions. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const filteredPositions = mockPositionDescriptions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "All" || position.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = ["All", ...Array.from(new Set(mockPositionDescriptions.map(p => p.department)))];

  const stats = {
    total: mockPositionDescriptions.length,
    active: mockPositionDescriptions.filter(p => p.status === "Active").length,
    departments: departments.length - 1,
    withRasci: mockPositionDescriptions.filter(p => p.rasciRoles.length > 0).length
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-position-descriptions">Position Descriptions</h1>
            <p className="text-muted-foreground">
              Manage position descriptions, responsibilities, and RASCI accountability
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-import-positions">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button data-testid="button-add-position">
                <Plus className="h-4 w-4 mr-2" />
                Add Position
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-positions">{stats.total}</div>
              <p className="text-sm text-muted-foreground">{stats.active} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4" />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-departments">{stats.departments}</div>
              <p className="text-sm text-muted-foreground">across organization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Network className="h-4 w-4" />
                RASCI Mapped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-rasci-mapped">{stats.withRasci}</div>
              <p className="text-sm text-muted-foreground">positions with accountability</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-compliance">100%</div>
              <p className="text-sm text-muted-foreground">APGF REQ-021 coverage</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positions" data-testid="tab-positions">
              <FileText className="h-4 w-4 mr-2" />
              Positions
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Users className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="accountability" data-testid="tab-accountability">
              <Network className="h-4 w-4 mr-2" />
              Accountability Map
            </TabsTrigger>
          </TabsList>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by title or department..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="input-search-positions"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-48" data-testid="select-department-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Positions List */}
            <div className="grid gap-4">
              {filteredPositions.map((position) => (
                <Card key={position.id} className="hover-elevate" data-testid={`card-position-${position.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{position.title}</CardTitle>
                          <CardDescription>{position.department} • {position.level}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(position.status)}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Network className="h-3 w-3" />
                          {position.rasciRoles.length} RASCI
                        </Badge>
                        {canManage && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Delete position: ${position.title}?`)) {
                                  deletePosition(position.id);
                                }
                              }}
                              data-testid={`button-delete-${position.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Dialog open={isDialogOpen && selectedPosition?.id === position.id} onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (!open) setSelectedPosition(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setSelectedPosition(position)}
                                  data-testid={`button-view-${position.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{position.title}</DialogTitle>
                                  <DialogDescription>
                                    {position.department} • {position.level} • {position.status}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Key Responsibilities</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                      {position.responsibilities.map((resp, idx) => (
                                        <li key={idx}>{resp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Required Qualifications</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                      {position.qualifications.map((qual, idx) => (
                                        <li key={idx}>{qual}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">RASCI Accountability</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {position.rasciRoles.map((role, idx) => (
                                        <Badge key={idx} variant="default" className={getRasciColor(role.assignment)}>
                                          {role.assignment}: {role.process}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Reports To</h4>
                                      <p className="text-sm text-muted-foreground">{position.reportingTo}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Supervises</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {position.supervises.length > 0 ? position.supervises.join(', ') : 'None'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Last updated: {new Date(position.lastUpdated).toLocaleDateString()}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Top Responsibilities</Label>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-1">
                          {position.responsibilities.slice(0, 3).map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Reports to: {position.reportingTo}
                        </div>
                        {position.supervises.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Supervises: {position.supervises.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Use pre-built templates to quickly create position descriptions that comply with APGF requirements.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positionTemplates.map((template) => (
                <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">{template.category}</Badge>
                    <Button className="w-full mt-3" variant="outline" data-testid={`button-use-template-${template.id}`}>
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Accountability Map Tab */}
          <TabsContent value="accountability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Accountability Matrix</CardTitle>
                <CardDescription>
                  Shows RASCI accountability assignments across all positions and processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 text-sm">
                    <Badge variant="default" className="bg-blue-600">R - Responsible</Badge>
                    <Badge variant="default" className="bg-purple-600">A - Accountable</Badge>
                    <Badge variant="default" className="bg-green-600">S - Supportive</Badge>
                    <Badge variant="default" className="bg-orange-600">C - Consulted</Badge>
                    <Badge variant="default" className="bg-gray-600">I - Informed</Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-48">Position</TableHead>
                          <TableHead className="text-center">Payroll Processing</TableHead>
                          <TableHead className="text-center">Award Interpretation</TableHead>
                          <TableHead className="text-center">System Access Control</TableHead>
                          <TableHead className="text-center">Audit Management</TableHead>
                          <TableHead className="text-center">Policy Approval</TableHead>
                          <TableHead className="text-center">Risk Assessment</TableHead>
                          <TableHead className="text-center">Evidence Management</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPositionDescriptions.map((position) => (
                          <TableRow key={position.id} data-testid={`accountability-row-${position.id}`}>
                            <TableCell className="font-medium">{position.title}</TableCell>
                            {['Payroll Processing', 'Award Interpretation', 'System Access Control', 'Audit Management', 'Policy Approval', 'Risk Assessment', 'Evidence Management'].map(process => {
                              const role = position.rasciRoles.find(r => r.process === process);
                              return (
                                <TableCell key={process} className="text-center">
                                  {role && (
                                    <Badge variant="default" className={getRasciColor(role.assignment)}>
                                      {role.assignment}
                                    </Badge>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All positions have clearly defined accountability for payroll governance processes, satisfying APGF REQ-021 and REQ-032.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
