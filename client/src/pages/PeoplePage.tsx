import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  FileText,
  Calendar,
  Building,
  DollarSign,
  Shield,
  Network
} from "lucide-react";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import { useRasciStore } from "../store/rasciSlice";
import AppShell from "@/components/AppShell";
import { SetupNudge } from "@/components/SetupNudge";

// Mock employee data (this would come from integrations in real implementation)
const mockEmployees = [
  {
    id: 'EMP-001',
    name: 'Mia Nguyen',
    email: 'mia.nguyen@company.com',
    employeeId: 'EMP-0042',
    department: 'People & Culture',
    position: 'HR Manager',
    status: 'Active',
    startDate: '2023-02-12',
    manager: 'Sarah Johnson',
    payrollId: 'PR-0042',
    location: 'Sydney, NSW',
    workType: 'Full-time',
    complianceScore: 95,
    lastReview: '2024-09-15',
    documents: ['Contract', 'TFN Declaration', 'Super Choice', 'ID Verification'],
    integrationStatus: {
      workday: 'Connected',
      payroll: 'Connected',
      timeAndAttendance: 'Connected'
    }
  },
  {
    id: 'EMP-002',
    name: 'Leo Carter',
    email: 'leo.carter@company.com',
    employeeId: 'EMP-0043',
    department: 'Finance',
    position: 'Payroll Officer',
    status: 'Active',
    startDate: '2022-08-15',
    manager: 'Emma Wilson',
    payrollId: 'PR-0043',
    location: 'Melbourne, VIC',
    workType: 'Full-time',
    complianceScore: 98,
    lastReview: '2024-09-10',
    documents: ['Contract', 'TFN Declaration', 'Super Choice', 'Police Check'],
    integrationStatus: {
      workday: 'Connected',
      payroll: 'Connected',
      timeAndAttendance: 'Connected'
    }
  },
  {
    id: 'EMP-003',
    name: 'Harper Lane',
    email: 'harper.lane@company.com',
    employeeId: 'EMP-0044',
    department: 'IT',
    position: 'System Administrator',
    status: 'Terminated',
    startDate: '2021-03-10',
    endDate: '2024-08-30',
    manager: 'David Chen',
    payrollId: 'PR-0044',
    location: 'Melbourne, VIC',
    workType: 'Full-time',
    complianceScore: 88,
    lastReview: '2024-08-30',
    documents: ['Contract', 'TFN Declaration', 'Super Choice', 'Termination Package'],
    integrationStatus: {
      workday: 'Terminated',
      payroll: 'Terminated',
      timeAndAttendance: 'Terminated'
    }
  },
  {
    id: 'EMP-004',
    name: 'Ella Thompson',
    email: 'ella.thompson@company.com',
    employeeId: 'EMP-0045',
    department: 'Finance',
    position: 'Finance Manager',
    status: 'Active',
    startDate: '2020-11-22',
    manager: 'Robert Kim',
    payrollId: 'PR-0045',
    location: 'Brisbane, QLD',
    workType: 'Full-time',
    complianceScore: 92,
    lastReview: '2024-09-01',
    documents: ['Contract', 'TFN Declaration', 'Super Choice', 'Qualification Verification'],
    integrationStatus: {
      workday: 'Connected',
      payroll: 'Auth Required',
      timeAndAttendance: 'Connected'
    }
  },
  {
    id: 'EMP-005',
    name: 'Oliver Brooks',
    email: 'oliver.brooks@company.com',
    employeeId: 'EMP-0046',
    department: 'Operations',
    position: 'Operations Director',
    status: 'Active',
    startDate: '2019-06-03',
    manager: 'CEO',
    payrollId: 'PR-0046',
    location: 'Sydney, NSW',
    workType: 'Full-time',
    complianceScore: 100,
    lastReview: '2024-08-25',
    documents: ['Contract', 'TFN Declaration', 'Super Choice', 'Executive Agreement'],
    integrationStatus: {
      workday: 'Connected',
      payroll: 'Connected',
      timeAndAttendance: 'Connected'
    }
  }
];

const getStatusBadge = (status: string) => {
  const variants = {
    "Active": "default",
    "Terminated": "secondary",
    "On Leave": "outline",
    "Probation": "destructive"
  } as const;
  
  const icons = {
    "Active": <CheckCircle className="h-3 w-3" />,
    "Terminated": <Clock className="h-3 w-3" />,
    "On Leave": <Calendar className="h-3 w-3" />,
    "Probation": <AlertTriangle className="h-3 w-3" />
  };
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"} className="flex items-center gap-1">
      {icons[status as keyof typeof icons]}
      {status}
    </Badge>
  );
};

const getComplianceScoreBadge = (score: number) => {
  if (score >= 95) return <Badge variant="default" className="bg-green-600">{score}%</Badge>;
  if (score >= 85) return <Badge variant="secondary">{score}%</Badge>;
  return <Badge variant="destructive">{score}%</Badge>;
};

const getIntegrationStatusIcon = (status: string) => {
  switch (status) {
    case 'Connected':
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    case 'Auth Required':
      return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
    case 'Terminated':
      return <Clock className="h-3 w-3 text-gray-600" />;
    default:
      return <AlertTriangle className="h-3 w-3 text-red-600" />;
  }
};

export default function PeoplePage() {
  const { currentUser } = useAppStore();
  const { processes, assignments, updateAssignment, getAssignment } = useRasciStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  
  const canManage = hasPermission(currentUser, 'manage_people');
  const canView = hasPermission(currentUser, 'view_people');

  if (!canView) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view people records. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === "All" || employee.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get active employees for RASCI assignment dropdowns
  const activeEmployees = mockEmployees.filter(e => e.status === 'Active');

  // Group processes by process area
  const processAreas = Array.from(new Set(processes.map(p => p.processArea)));

  // Helper function to render RASCI role cell with person dropdown
  const renderRasciRoleCell = (processArea: string, obligation: string, role: 'R' | 'A' | 'S' | 'C' | 'I') => {
    const assignment = getAssignment(processArea, obligation, role);
    if (!assignment) return null;

    const roleColors = {
      'R': 'bg-blue-600',
      'A': 'bg-purple-600',
      'S': 'bg-green-600',
      'C': 'bg-orange-600',
      'I': 'bg-gray-600',
    };

    return (
      <div className="flex flex-col items-start gap-1 p-2 min-w-[140px]">
        <div className="flex items-center gap-2 w-full">
          <Badge variant="default" className={`${roleColors[role]} text-xs`}>
            {role}
          </Badge>
          <span className="text-xs font-medium">{assignment.roleName}</span>
        </div>
        {canManage && assignment.roleName !== 'Employees' && assignment.roleName !== 'Employee' && (
          <Select
            value={assignment.assignedPersonId || ""}
            onValueChange={(value) => {
              const person = activeEmployees.find(e => e.id === value);
              if (person) {
                updateAssignment(processArea, obligation, role, person.id, person.name);
              }
            }}
          >
            <SelectTrigger className="w-full h-7 text-xs" data-testid={`select-${processArea.toLowerCase().replace(/\s/g, '-')}-${obligation.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}-${role}`}>
              <SelectValue placeholder="Assign..." />
            </SelectTrigger>
            <SelectContent>
              {activeEmployees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {!canManage && assignment.assignedPersonName && (
          <div className="text-xs text-muted-foreground">{assignment.assignedPersonName}</div>
        )}
      </div>
    );
  };

  const departments = ["All", ...Array.from(new Set(mockEmployees.map(e => e.department)))];
  const statuses = ["All", "Active", "Terminated", "On Leave", "Probation"];

  const stats = {
    total: mockEmployees.length,
    active: mockEmployees.filter(e => e.status === "Active").length,
    avgComplianceScore: Math.round(mockEmployees.reduce((sum, e) => sum + e.complianceScore, 0) / mockEmployees.length),
    needsAttention: mockEmployees.filter(e => e.complianceScore < 90 || Object.values(e.integrationStatus).includes('Auth Required')).length
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <SetupNudge 
          stepKey="people" 
          message="Assign Key Personnel roles to enable automatic RASCI matrix generation and task routing."
        />
        
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-people">People</h1>
          <p className="text-muted-foreground">
            Manage employee records, compliance, and integration status
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-import-people">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" data-testid="button-export-people">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button data-testid="button-add-person">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-employees">{stats.total}</div>
            <p className="text-sm text-muted-foreground">{stats.active} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Avg Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-avg-compliance">{stats.avgComplianceScore}%</div>
            <p className="text-sm text-muted-foreground">across all employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-needs-attention">{stats.needsAttention}</div>
            <p className="text-sm text-muted-foreground">compliance or integration issues</p>
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
            <div className="text-2xl font-bold" data-testid="text-departments">{departments.length - 1}</div>
            <p className="text-sm text-muted-foreground">across organization</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="directory" data-testid="tab-directory">
            <Users className="h-4 w-4 mr-2" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">
            <CheckCircle className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="rasci" data-testid="tab-rasci">
            <Network className="h-4 w-4 mr-2" />
            RASCI Matrix
          </TabsTrigger>
        </TabsList>

        {/* Directory Tab */}
        <TabsContent value="directory" className="space-y-6">
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
                      placeholder="Search by name, email, or employee ID..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-people"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

          {/* Employee Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Employee Directory</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredEmployees.length} of {mockEmployees.length} employees
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Compliance</TableHead>
                    {canManage && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} data-testid={`row-employee-${employee.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.email}</div>
                            <div className="text-xs text-muted-foreground">ID: {employee.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.position}</div>
                          <div className="text-sm text-muted-foreground">{employee.manager}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(employee.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(employee.startDate).toLocaleDateString()}
                        </div>
                        {employee.endDate && (
                          <div className="text-xs text-muted-foreground">
                            Ended: {new Date(employee.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getComplianceScoreBadge(employee.complianceScore)}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            data-testid={`button-view-employee-${employee.id}`}
                          >
                            View
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} data-testid={`card-compliance-${employee.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <CardDescription>{employee.position} • {employee.department}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getComplianceScoreBadge(employee.complianceScore)}
                      {getStatusBadge(employee.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Required Documents</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {employee.documents.map(doc => (
                          <Badge key={doc} variant="secondary" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Review</Label>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(employee.lastReview).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} data-testid={`card-integrations-${employee.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <CardDescription>{employee.position} • {employee.department}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(employee.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      {getIntegrationStatusIcon(employee.integrationStatus.workday)}
                      <div>
                        <div className="font-medium text-sm">Workday HCM</div>
                        <div className="text-xs text-muted-foreground">{employee.integrationStatus.workday}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getIntegrationStatusIcon(employee.integrationStatus.payroll)}
                      <div>
                        <div className="font-medium text-sm">Payroll System</div>
                        <div className="text-xs text-muted-foreground">{employee.integrationStatus.payroll}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getIntegrationStatusIcon(employee.integrationStatus.timeAndAttendance)}
                      <div>
                        <div className="font-medium text-sm">Time & Attendance</div>
                        <div className="text-xs text-muted-foreground">{employee.integrationStatus.timeAndAttendance}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* RASCI Matrix Tab */}
        <TabsContent value="rasci" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Australian Payroll Governance Management System Framework (APGF-MS) - RASCI Matrix</CardTitle>
              <CardDescription>
                Complete RASCI assignments for all 44 APGF-MS compliance processes across 13 process areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 text-sm flex-wrap">
                  <Badge variant="default" className="bg-blue-600">R - Responsible</Badge>
                  <Badge variant="default" className="bg-purple-600">A - Accountable</Badge>
                  <Badge variant="default" className="bg-green-600">S - Support</Badge>
                  <Badge variant="default" className="bg-orange-600">C - Consulted</Badge>
                  <Badge variant="default" className="bg-gray-600">I - Informed</Badge>
                </div>

                {!canManage && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      You can view RASCI assignments, but only users with manager permissions can assign people to roles.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Accordion type="multiple" className="w-full">
                  {processAreas.map((processArea) => {
                    const areaProcesses = processes.filter(p => p.processArea === processArea);
                    return (
                      <AccordionItem key={processArea} value={processArea}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold">{processArea}</span>
                            <Badge variant="outline">{areaProcesses.length} processes</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            {areaProcesses.map((process) => (
                              <Card key={`${processArea}-${process.obligation}`} className="border-l-4 border-l-primary/30">
                                <CardHeader className="pb-3">
                                  <div className="space-y-2">
                                    <CardTitle className="text-base">{process.obligation}</CardTitle>
                                    <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                                      <div className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        <span>{process.sourceDriver}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        <span>{process.controlRef}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                                      {renderRasciRoleCell(processArea, process.obligation, 'R')}
                                      {renderRasciRoleCell(processArea, process.obligation, 'A')}
                                      {renderRasciRoleCell(processArea, process.obligation, 'S')}
                                      {renderRasciRoleCell(processArea, process.obligation, 'C')}
                                      {renderRasciRoleCell(processArea, process.obligation, 'I')}
                                    </div>
                                    <div className="text-xs text-muted-foreground pt-2 border-t">
                                      <strong>Evidence:</strong> {process.evidence}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>

                <Alert>
                  <Network className="h-4 w-4" />
                  <AlertDescription>
                    This RASCI matrix implements comprehensive segregation of duties (SoD) for Australian payroll compliance.
                    <strong> R</strong>=Responsible for execution, 
                    <strong> A</strong>=Accountable (final authority), 
                    <strong> S</strong>=Support (provides resources), 
                    <strong> C</strong>=Consulted (provides input), 
                    <strong> I</strong>=Informed (receives updates).
                    {canManage && <> Use the dropdowns to assign actual staff members to each role.</>}
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