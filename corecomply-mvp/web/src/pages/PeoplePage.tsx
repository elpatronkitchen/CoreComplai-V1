import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  FileText,
  Calendar as CalendarIcon,
  Building,
  Loader2
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AppShell from "@/components/AppShell";
import type { Person } from "@/types/person";

const getStatusBadge = (status: string) => {
  const variants = {
    "Active": "default",
    "Inactive": "secondary",
    "OnLeave": "outline",
  } as const;
  
  const icons = {
    "Active": <CheckCircle className="h-3 w-3" />,
    "Inactive": <Clock className="h-3 w-3" />,
    "OnLeave": <CalendarIcon className="h-3 w-3" />,
  };
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"} className="flex items-center gap-1">
      {icons[status as keyof typeof icons]}
      {status}
    </Badge>
  );
};

export default function PeoplePage() {
  const { hasPermission } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  
  const canManage = hasPermission('manage_people');
  const canView = hasPermission('view_people');

  // Fetch people
  const { 
    data: people = [], 
    isLoading: peopleLoading,
    isError: peopleError,
    refetch: refetchPeople 
  } = useQuery<Person[]>({
    queryKey: ['/api/people'],
    enabled: canView,
  });

  // Fetch departments
  const { data: departments = [] } = useQuery<string[]>({
    queryKey: ['/api/people/departments'],
    enabled: canView,
  });

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

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                           person.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || person.status === statusFilter;
      const matchesDepartment = departmentFilter === "All" || person.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [people, searchTerm, statusFilter, departmentFilter]);

  const allDepartments = ["All", ...departments];
  const statuses = ["All", "Active", "Inactive", "OnLeave"];

  const stats = {
    total: people.length,
    active: people.filter(p => p.status === "Active").length,
    departments: departments.length
  };

  if (peopleLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading people...</span>
        </div>
      </AppShell>
    );
  }

  if (peopleError) {
    return (
      <AppShell>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load people data. Please try again.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchPeople()}
              data-testid="button-retry-people"
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-people">People</h1>
          <p className="text-muted-foreground">
            Manage employee records and compliance
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <FileText className="h-4 w-4" />
              Active Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-active-records">{stats.active}</div>
            <p className="text-sm text-muted-foreground">employee records</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory" data-testid="tab-directory">
            <Users className="h-4 w-4 mr-2" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
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
                      placeholder="Search by name or email..."
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
                      {allDepartments.map(dept => (
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
                  Showing {filteredPeople.length} of {people.length} employees
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    {canManage && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeople.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} className="text-center text-muted-foreground py-8">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPeople.map((person) => (
                      <TableRow key={person.id} data-testid={`row-person-${person.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {person.avatarUrl ? (
                                <img src={person.avatarUrl} alt={`${person.firstName} ${person.lastName}`} className="w-8 h-8 rounded-full" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium" data-testid={`text-name-${person.id}`}>
                                {person.firstName} {person.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{person.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{person.jobTitle || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{person.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{person.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(person.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {person.startDate ? new Date(person.startDate).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              data-testid={`button-view-person-${person.id}`}
                            >
                              View
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover-elevate" data-testid="card-employee-report">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employee Report
                </CardTitle>
                <CardDescription>
                  Complete employee directory with all details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" data-testid="button-generate-employee-report">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-department-report">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department Report
                </CardTitle>
                <CardDescription>
                  Employee breakdown by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" data-testid="button-generate-department-report">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-status-report">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Status Report
                </CardTitle>
                <CardDescription>
                  Current status of all employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" data-testid="button-generate-status-report">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AppShell>
  );
}
