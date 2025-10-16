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
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  FileText,
  Target
} from "lucide-react";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import AppShell from "@/components/AppShell";

interface CompetencyAssessment {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  competencyArea: string;
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  assessmentDate: string;
  nextReviewDate: string;
  status: 'Proficient' | 'Developing' | 'Gap Identified';
}

// Competency Store
interface CompetencyStore {
  assessments: CompetencyAssessment[];
  addAssessment: (assessment: Omit<CompetencyAssessment, 'id'>) => void;
  updateAssessment: (id: string, updates: Partial<CompetencyAssessment>) => void;
  deleteAssessment: (id: string) => void;
}

const mockAssessments: CompetencyAssessment[] = [
  {
    id: 'CA-001',
    employeeId: 'EMP-0042',
    employeeName: 'Leo Carter',
    position: 'Payroll Officer',
    competencyArea: 'Award Interpretation',
    requiredLevel: 4,
    currentLevel: 5,
    gap: 0,
    assessmentDate: '2024-09-15',
    nextReviewDate: '2025-03-15',
    status: 'Proficient'
  },
  {
    id: 'CA-002',
    employeeId: 'EMP-0042',
    employeeName: 'Leo Carter',
    position: 'Payroll Officer',
    competencyArea: 'Payroll Processing',
    requiredLevel: 5,
    currentLevel: 5,
    gap: 0,
    assessmentDate: '2024-09-15',
    nextReviewDate: '2025-03-15',
    status: 'Proficient'
  },
  {
    id: 'CA-003',
    employeeId: 'EMP-0042',
    employeeName: 'Leo Carter',
    position: 'Payroll Officer',
    competencyArea: 'Compliance Documentation',
    requiredLevel: 4,
    currentLevel: 3,
    gap: 1,
    assessmentDate: '2024-09-15',
    nextReviewDate: '2024-12-15',
    status: 'Developing'
  },
  {
    id: 'CA-004',
    employeeId: 'EMP-0043',
    employeeName: 'Mia Nguyen',
    position: 'HR Manager',
    competencyArea: 'Policy Development',
    requiredLevel: 5,
    currentLevel: 5,
    gap: 0,
    assessmentDate: '2024-08-20',
    nextReviewDate: '2025-02-20',
    status: 'Proficient'
  },
  {
    id: 'CA-005',
    employeeId: 'EMP-0043',
    employeeName: 'Mia Nguyen',
    position: 'HR Manager',
    competencyArea: 'Risk Assessment',
    requiredLevel: 4,
    currentLevel: 4,
    gap: 0,
    assessmentDate: '2024-08-20',
    nextReviewDate: '2025-02-20',
    status: 'Proficient'
  },
  {
    id: 'CA-006',
    employeeId: 'EMP-0044',
    employeeName: 'Oliver Brooks',
    position: 'Operations Director',
    competencyArea: 'Governance Strategy',
    requiredLevel: 5,
    currentLevel: 3,
    gap: 2,
    assessmentDate: '2024-07-10',
    nextReviewDate: '2024-11-10',
    status: 'Gap Identified'
  },
  {
    id: 'CA-007',
    employeeId: 'EMP-0045',
    employeeName: 'Ella Thompson',
    position: 'Finance Manager',
    competencyArea: 'Financial Controls',
    requiredLevel: 5,
    currentLevel: 5,
    gap: 0,
    assessmentDate: '2024-09-01',
    nextReviewDate: '2025-03-01',
    status: 'Proficient'
  },
  {
    id: 'CA-008',
    employeeId: 'EMP-0045',
    employeeName: 'Ella Thompson',
    position: 'Finance Manager',
    competencyArea: 'Audit Coordination',
    requiredLevel: 4,
    currentLevel: 3,
    gap: 1,
    assessmentDate: '2024-09-01',
    nextReviewDate: '2024-12-01',
    status: 'Developing'
  }
];

const useCompetencyStore = create<CompetencyStore>((set) => ({
  assessments: mockAssessments,
  addAssessment: (assessment) => set((state) => ({
    assessments: [
      ...state.assessments,
      {
        ...assessment,
        id: `CA-${String(state.assessments.length + 1).padStart(3, '0')}`
      }
    ]
  })),
  updateAssessment: (id, updates) => set((state) => ({
    assessments: state.assessments.map(a =>
      a.id === id ? { ...a, ...updates } : a
    )
  })),
  deleteAssessment: (id) => set((state) => ({
    assessments: state.assessments.filter(a => a.id !== id)
  }))
}));

const competencyMatrix = [
  {
    area: 'Award Interpretation',
    description: 'Understanding and applying modern awards and enterprise agreements',
    levels: [
      '1: Basic awareness of award existence',
      '2: Can locate and read relevant award clauses',
      '3: Can interpret common award provisions correctly',
      '4: Can handle complex award interpretations independently',
      '5: Expert - can provide guidance and handle disputes'
    ],
    requiredFor: ['Payroll Officer', 'HR Manager', 'Compliance Officer']
  },
  {
    area: 'Payroll Processing',
    description: 'Accurate calculation and processing of employee payments',
    levels: [
      '1: Basic understanding of payroll concepts',
      '2: Can process standard pay runs with supervision',
      '3: Can process complex pay runs independently',
      '4: Can handle exceptions and resolve discrepancies',
      '5: Expert - can optimize processes and train others'
    ],
    requiredFor: ['Payroll Officer', 'Finance Manager']
  },
  {
    area: 'Compliance Documentation',
    description: 'Maintaining accurate compliance records and evidence',
    levels: [
      '1: Basic document filing and retrieval',
      '2: Can create standard compliance documents',
      '3: Can maintain comprehensive audit trails',
      '4: Can design documentation frameworks',
      '5: Expert - can establish organizational standards'
    ],
    requiredFor: ['Payroll Officer', 'Compliance Officer', 'Internal Auditor']
  },
  {
    area: 'Risk Assessment',
    description: 'Identifying and evaluating compliance risks',
    levels: [
      '1: Basic risk awareness',
      '2: Can identify obvious risks',
      '3: Can conduct structured risk assessments',
      '4: Can develop risk mitigation strategies',
      '5: Expert - can establish risk frameworks'
    ],
    requiredFor: ['HR Manager', 'Compliance Officer', 'Finance Manager']
  },
  {
    area: 'Policy Development',
    description: 'Creating and maintaining organizational policies',
    levels: [
      '1: Basic policy awareness',
      '2: Can review and provide feedback on policies',
      '3: Can draft policies with templates',
      '4: Can develop comprehensive policy frameworks',
      '5: Expert - can establish policy governance'
    ],
    requiredFor: ['HR Manager', 'Compliance Officer']
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Proficient':
      return 'default';
    case 'Developing':
      return 'secondary';
    case 'Gap Identified':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Proficient':
      return <CheckCircle className="h-3 w-3" />;
    case 'Developing':
      return <TrendingUp className="h-3 w-3" />;
    case 'Gap Identified':
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return null;
  }
};

export default function CompetencyPage() {
  const { currentUser } = useAppStore();
  const { assessments, deleteAssessment } = useCompetencyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");

  const canManage = hasPermission(currentUser, 'manage_people');
  const canView = hasPermission(currentUser, 'view_people');

  if (!canView) {
    return (
      <AppShell>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view competency assessments. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.competencyArea.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || assessment.status === statusFilter;
    const matchesEmployee = employeeFilter === "All" || assessment.employeeName === employeeFilter;
    
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const employees = ["All", ...Array.from(new Set(assessments.map(a => a.employeeName)))];
  const statuses = ["All", "Proficient", "Developing", "Gap Identified"];

  const stats = {
    total: assessments.length,
    proficient: assessments.filter(a => a.status === "Proficient").length,
    developing: assessments.filter(a => a.status === "Developing").length,
    gaps: assessments.filter(a => a.status === "Gap Identified").length,
    avgProficiency: Math.round(
      (assessments.reduce((sum, a) => sum + (a.currentLevel / a.requiredLevel) * 100, 0) / assessments.length)
    )
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-competency">Competency Assessment</h1>
            <p className="text-muted-foreground">
              Track employee competencies and identify skill gaps for payroll governance
            </p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-assessment-framework">
                <FileText className="h-4 w-4 mr-2" />
                Framework
              </Button>
              <Button data-testid="button-new-assessment">
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-assessments">{stats.total}</div>
              <p className="text-sm text-muted-foreground">across all employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Proficient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-proficient">{stats.proficient}</div>
              <p className="text-sm text-muted-foreground">meeting requirements</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Developing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-developing">{stats.developing}</div>
              <p className="text-sm text-muted-foreground">in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-gaps">{stats.gaps}</div>
              <p className="text-sm text-muted-foreground">requiring attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Avg Proficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-avg-proficiency">{stats.avgProficiency}%</div>
              <Progress value={stats.avgProficiency} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assessments" data-testid="tab-assessments">
              <User className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="matrix" data-testid="tab-matrix">
              <FileText className="h-4 w-4 mr-2" />
              Competency Matrix
            </TabsTrigger>
            <TabsTrigger value="gaps" data-testid="tab-gaps">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Gap Analysis
            </TabsTrigger>
          </TabsList>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
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
                        placeholder="Search by employee or competency area..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="input-search-competency"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Employee</Label>
                    <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                      <SelectTrigger className="w-48" data-testid="select-employee-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>
              </CardContent>
            </Card>

            {/* Assessments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Competency Assessments</CardTitle>
                <CardDescription>
                  Showing {filteredAssessments.length} of {assessments.length} assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Competency Area</TableHead>
                      <TableHead className="text-center">Required Level</TableHead>
                      <TableHead className="text-center">Current Level</TableHead>
                      <TableHead className="text-center">Gap</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Review</TableHead>
                      {canManage && <TableHead className="w-20">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id} data-testid={`row-assessment-${assessment.id}`}>
                        <TableCell>
                          <div className="font-medium">{assessment.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{assessment.employeeId}</div>
                        </TableCell>
                        <TableCell>{assessment.position}</TableCell>
                        <TableCell>{assessment.competencyArea}</TableCell>
                        <TableCell className="text-center">{assessment.requiredLevel}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={assessment.gap === 0 ? "default" : "secondary"}>
                            {assessment.currentLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {assessment.gap > 0 ? (
                            <Badge variant="destructive">-{assessment.gap}</Badge>
                          ) : (
                            <Badge variant="outline">✓</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(assessment.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(assessment.status)}
                            {assessment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(assessment.nextReviewDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Delete assessment for ${assessment.employeeName}?`)) {
                                  deleteAssessment(assessment.id);
                                }
                              }}
                              data-testid={`button-delete-${assessment.id}`}
                            >
                              <AlertTriangle className="h-4 w-4" />
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

          {/* Competency Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Competency matrix defines required skill levels for payroll governance roles per APGF REQ-022/033.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {competencyMatrix.map((competency, idx) => (
                <Card key={idx} data-testid={`card-competency-${idx}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{competency.area}</CardTitle>
                    <CardDescription>{competency.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Competency Levels</Label>
                        <div className="space-y-1 mt-2">
                          {competency.levels.map((level, levelIdx) => (
                            <div key={levelIdx} className="text-sm text-muted-foreground pl-4">
                              • {level}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Required For</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {competency.requiredFor.map(role => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gap Analysis Tab */}
          <TabsContent value="gaps" className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {stats.gaps} competency gaps identified requiring training or development interventions.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {mockAssessments.filter(a => a.gap > 0).map((assessment) => (
                <Card key={assessment.id} className="hover-elevate" data-testid={`card-gap-${assessment.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{assessment.employeeName}</CardTitle>
                        <CardDescription>{assessment.position} • {assessment.competencyArea}</CardDescription>
                      </div>
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Gap: {assessment.gap} level{assessment.gap > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <Label className="text-sm">Required Level</Label>
                          <div className="text-2xl font-bold">{assessment.requiredLevel}</div>
                        </div>
                        <div className="text-2xl text-muted-foreground">→</div>
                        <div>
                          <Label className="text-sm">Current Level</Label>
                          <div className="text-2xl font-bold">{assessment.currentLevel}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" data-testid={`button-training-plan-${assessment.id}`}>
                          Create Training Plan
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-reassess-${assessment.id}`}>
                          Schedule Reassessment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
