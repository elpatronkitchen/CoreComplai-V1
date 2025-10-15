import { useState } from "react";
import { create } from 'zustand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  TrendingUp
} from "lucide-react";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import AppShell from "@/components/AppShell";

interface TrainingCourse {
  id: string;
  title: string;
  category: 'Compliance' | 'Technical' | 'Governance' | 'Wage Theft';
  description: string;
  duration: string;
  mandatory: boolean;
  status: 'Active' | 'Draft' | 'Archived';
  enrollments: number;
  completions: number;
  completionRate: number;
}

interface TrainingAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  courseId: string;
  courseTitle: string;
  assignedDate: string;
  dueDate: string;
  completedDate: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  score?: number;
}

// Training Store
interface TrainingStore {
  courses: TrainingCourse[];
  assignments: TrainingAssignment[];
  addCourse: (course: Omit<TrainingCourse, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<TrainingCourse>) => void;
  deleteCourse: (id: string) => void;
  addAssignment: (assignment: Omit<TrainingAssignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<TrainingAssignment>) => void;
}

const mockCourses: TrainingCourse[] = [
  {
    id: 'TRN-001',
    title: 'Australian Wage Theft Prevention',
    category: 'Wage Theft',
    description: 'Mandatory training on wage theft laws, Fair Work Act compliance, and penalties',
    duration: '45 minutes',
    mandatory: true,
    status: 'Active',
    enrollments: 12,
    completions: 12,
    completionRate: 100
  },
  {
    id: 'TRN-002',
    title: 'Modern Awards Interpretation',
    category: 'Compliance',
    description: 'Understanding and applying modern awards in payroll processing',
    duration: '2 hours',
    mandatory: true,
    status: 'Active',
    enrollments: 8,
    completions: 7,
    completionRate: 88
  },
  {
    id: 'TRN-003',
    title: 'APGF Framework Implementation',
    category: 'Governance',
    description: 'Complete guide to implementing Australian Payroll Governance Framework',
    duration: '3 hours',
    mandatory: true,
    status: 'Active',
    enrollments: 6,
    completions: 4,
    completionRate: 67
  },
  {
    id: 'TRN-004',
    title: 'Payroll System Security',
    category: 'Technical',
    description: 'Access controls, data integrity, and security best practices',
    duration: '1.5 hours',
    mandatory: true,
    status: 'Active',
    enrollments: 5,
    completions: 5,
    completionRate: 100
  },
  {
    id: 'TRN-005',
    title: 'Evidence Management & Retention',
    category: 'Compliance',
    description: 'Compliance documentation, audit trails, and 7-year retention requirements',
    duration: '1 hour',
    mandatory: false,
    status: 'Active',
    enrollments: 10,
    completions: 8,
    completionRate: 80
  },
  {
    id: 'TRN-006',
    title: 'Risk Assessment Fundamentals',
    category: 'Governance',
    description: 'Identifying, assessing, and mitigating payroll compliance risks',
    duration: '2 hours',
    mandatory: false,
    status: 'Active',
    enrollments: 7,
    completions: 6,
    completionRate: 86
  }
];

const mockAssignments: TrainingAssignment[] = [
  {
    id: 'TA-001',
    employeeId: 'EMP-0042',
    employeeName: 'Leo Carter',
    courseId: 'TRN-001',
    courseTitle: 'Australian Wage Theft Prevention',
    assignedDate: '2024-10-01',
    dueDate: '2024-10-15',
    completedDate: '2024-10-10',
    status: 'Completed',
    score: 95
  },
  {
    id: 'TA-002',
    employeeId: 'EMP-0042',
    employeeName: 'Leo Carter',
    courseId: 'TRN-002',
    courseTitle: 'Modern Awards Interpretation',
    assignedDate: '2024-09-15',
    dueDate: '2024-10-15',
    completedDate: null,
    status: 'In Progress'
  },
  {
    id: 'TA-003',
    employeeId: 'EMP-0043',
    employeeName: 'Mia Nguyen',
    courseId: 'TRN-001',
    courseTitle: 'Australian Wage Theft Prevention',
    assignedDate: '2024-10-01',
    dueDate: '2024-10-15',
    completedDate: '2024-10-08',
    status: 'Completed',
    score: 100
  },
  {
    id: 'TA-004',
    employeeId: 'EMP-0043',
    employeeName: 'Mia Nguyen',
    courseId: 'TRN-003',
    courseTitle: 'APGF Framework Implementation',
    assignedDate: '2024-09-20',
    dueDate: '2024-10-20',
    completedDate: null,
    status: 'In Progress'
  },
  {
    id: 'TA-005',
    employeeId: 'EMP-0044',
    employeeName: 'Oliver Brooks',
    courseId: 'TRN-001',
    courseTitle: 'Australian Wage Theft Prevention',
    assignedDate: '2024-10-01',
    dueDate: '2024-09-30',
    completedDate: null,
    status: 'Overdue'
  },
  {
    id: 'TA-006',
    employeeId: 'EMP-0045',
    employeeName: 'Ella Thompson',
    courseId: 'TRN-004',
    courseTitle: 'Payroll System Security',
    assignedDate: '2024-09-25',
    dueDate: '2024-10-10',
    completedDate: '2024-10-05',
    status: 'Completed',
    score: 92
  }
];

const useTrainingStore = create<TrainingStore>((set) => ({
  courses: mockCourses,
  assignments: mockAssignments,
  addCourse: (course) => set((state) => ({
    courses: [
      ...state.courses,
      {
        ...course,
        id: `TRN-${String(state.courses.length + 1).padStart(3, '0')}`
      }
    ]
  })),
  updateCourse: (id, updates) => set((state) => ({
    courses: state.courses.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),
  deleteCourse: (id) => set((state) => ({
    courses: state.courses.filter(c => c.id !== id)
  })),
  addAssignment: (assignment) => set((state) => ({
    assignments: [
      ...state.assignments,
      {
        ...assignment,
        id: `TA-${String(state.assignments.length + 1).padStart(3, '0')}`
      }
    ]
  })),
  updateAssignment: (id, updates) => set((state) => ({
    assignments: state.assignments.map(a =>
      a.id === id ? { ...a, ...updates } : a
    )
  }))
}));

const getStatusBadge = (status: string) => {
  const variants = {
    "Completed": "default",
    "In Progress": "secondary",
    "Not Started": "outline",
    "Overdue": "destructive"
  } as const;
  
  const icons = {
    "Completed": <CheckCircle className="h-3 w-3" />,
    "In Progress": <Clock className="h-3 w-3" />,
    "Not Started": <BookOpen className="h-3 w-3" />,
    "Overdue": <AlertTriangle className="h-3 w-3" />
  };
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"} className="flex items-center gap-1 w-fit">
      {icons[status as keyof typeof icons]}
      {status}
    </Badge>
  );
};

const getCategoryColor = (category: string) => {
  const colors = {
    'Compliance': 'bg-blue-600',
    'Technical': 'bg-purple-600',
    'Governance': 'bg-green-600',
    'Wage Theft': 'bg-red-600'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-600';
};

export default function TrainingPage() {
  const { currentUser } = useAppStore();
  const { courses, assignments, deleteCourse, updateAssignment } = useTrainingStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const canManage = hasPermission(currentUser, 'manage_people');
  const canView = hasPermission(currentUser, 'view_people');

  if (!canView) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view training modules. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || course.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const categories = ["All", "Compliance", "Technical", "Governance", "Wage Theft"];
  const statuses = ["All", "Completed", "In Progress", "Not Started", "Overdue"];

  const stats = {
    totalCourses: courses.length,
    mandatory: courses.filter(c => c.mandatory).length,
    totalAssignments: assignments.length,
    completed: assignments.filter(a => a.status === "Completed").length,
    overdue: assignments.filter(a => a.status === "Overdue").length,
    avgCompletion: Math.round(
      courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length
    )
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-training">Training & Education</h1>
            <p className="text-muted-foreground">
              Manage compliance training, course assignments, and wage theft awareness
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-training-reports">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button data-testid="button-new-course">
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-courses">{stats.totalCourses}</div>
              <p className="text-sm text-muted-foreground">{stats.mandatory} mandatory</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-assignments">{stats.totalAssignments}</div>
              <p className="text-sm text-muted-foreground">active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-completed">{stats.completed}</div>
              <p className="text-sm text-muted-foreground">assignments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-overdue">{stats.overdue}</div>
              <p className="text-sm text-muted-foreground">requiring action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Wage Theft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-wage-theft-completion">100%</div>
              <p className="text-sm text-muted-foreground">REQ-040 compliant</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-avg-completion">{stats.avgCompletion}%</div>
              <Progress value={stats.avgCompletion} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses" data-testid="tab-courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="assignments" data-testid="tab-assignments">
              <GraduationCap className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="wage-theft" data-testid="tab-wage-theft">
              <Shield className="h-4 w-4 mr-2" />
              Wage Theft Awareness
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
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
                        placeholder="Search courses..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="input-search-courses"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48" data-testid="select-category-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover-elevate" data-testid={`card-course-${course.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className={getCategoryColor(course.category)}>
                        {course.category}
                      </Badge>
                      {course.mandatory && (
                        <Badge variant="destructive" className="text-xs">
                          Mandatory
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Completion Rate:</span>
                          <span className="font-medium">{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{course.enrollments} enrolled</span>
                        <span>{course.completions} completed</span>
                      </div>
                      {canManage && (
                        <div className="flex gap-2">
                          <Button className="flex-1" size="sm" variant="outline" data-testid={`button-assign-${course.id}`}>
                            Assign Course
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete course: ${course.title}?`)) {
                                deleteCourse(course.id);
                              }
                            }}
                            data-testid={`button-delete-course-${course.id}`}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
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
                        placeholder="Search by employee or course..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="input-search-assignments"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48" data-testid="select-status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Training Assignments</CardTitle>
                <CardDescription>
                  Showing {filteredAssignments.length} of {mockAssignments.length} assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id} data-testid={`row-assignment-${assignment.id}`}>
                        <TableCell>
                          <div className="font-medium">{assignment.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{assignment.employeeId}</div>
                        </TableCell>
                        <TableCell>{assignment.courseTitle}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(assignment.assignedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(assignment.status)}
                        </TableCell>
                        <TableCell>
                          {assignment.score ? (
                            <Badge variant={assignment.score >= 80 ? "default" : "secondary"}>
                              {assignment.score}%
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wage Theft Awareness Tab */}
          <TabsContent value="wage-theft" className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                100% of decision-makers have completed mandatory wage theft compliance awareness training (APGF REQ-040).
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Australian Wage Theft Prevention Training</CardTitle>
                <CardDescription>
                  Mandatory compliance module covering Fair Work Act requirements, penalties, and prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Module Content</Label>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                        <li>Fair Work Act wage theft provisions and penalties</li>
                        <li>Employer obligations and employee rights</li>
                        <li>Common wage theft scenarios and prevention</li>
                        <li>Record keeping and audit trail requirements</li>
                        <li>Reporting procedures and compliance monitoring</li>
                      </ul>
                    </div>
                    <div>
                      <Label className="font-semibold">Training Statistics</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Enrolled:</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="font-medium text-green-600">12 (100%)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average Score:</span>
                          <span className="font-medium">96%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Next Review:</span>
                          <span className="font-medium">Q1 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="font-semibold">Decision-Maker Completion Status</Label>
                    <div className="mt-2 space-y-2">
                      {['Payroll Officer', 'HR Manager', 'Finance Manager', 'Operations Director', 'Compliance Officer'].map((role) => (
                        <div key={role} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm font-medium">{role}</span>
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
