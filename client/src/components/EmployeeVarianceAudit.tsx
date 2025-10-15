import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  DollarSign,
  FileText,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayrollAuditStore } from "../store/payrollAuditSlice";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import { format, parseISO } from "date-fns";
import { useState } from "react";

export default function EmployeeVarianceAudit() {
  const { currentUser } = useAppStore();
  const { 
    employeeRecords, 
    selectedEmployeeId, 
    setSelectedEmployee, 
    filters,
    setFilters,
    findings 
  } = usePayrollAuditStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "variance" | "department">("variance");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "high" | "medium" | "low">("all");

  const canView = hasPermission(currentUser, 'manage_audit_findings');
  const canManage = hasPermission(currentUser, 'manage_audit_findings');

  const selectedEmployee = employeeRecords.find(emp => emp.employeeId === selectedEmployeeId);

  // Filter and sort employees
  const filteredEmployees = employeeRecords
    .filter(emp => {
      if (!canView) return false;
      
      // Search filter
      if (searchTerm && !emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !emp.department.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Severity filter
      if (filterSeverity !== "all") {
        const absVariance = Math.abs(emp.varianceAmount);
        if (filterSeverity === "high" && absVariance < 500) return false;
        if (filterSeverity === "medium" && (absVariance < 100 || absVariance >= 500)) return false;
        if (filterSeverity === "low" && absVariance >= 100) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.employeeName.localeCompare(b.employeeName);
        case "variance":
          return Math.abs(b.varianceAmount) - Math.abs(a.varianceAmount);
        case "department":
          return a.department.localeCompare(b.department);
        default:
          return 0;
      }
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getVarianceIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="w-4 h-4 text-orange-600" />;
    if (amount < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getVarianceSeverity = (amount: number) => {
    const abs = Math.abs(amount);
    if (abs >= 500) return { label: "High", variant: "destructive" as const };
    if (abs >= 100) return { label: "Medium", variant: "secondary" as const };
    return { label: "Low", variant: "outline" as const };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Terminated':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'On Leave':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getExceptionBadge = (exception: string) => {
    const badges = {
      'MISSING_TS': { label: 'Missing TS', variant: 'destructive' as const },
      'POST_TERM_PAY': { label: 'Post-term Pay', variant: 'destructive' as const },
      'OT_PAID_NO_TS': { label: 'OT Paid/No TS', variant: 'secondary' as const },
      'PH_PENALTY_MISSING': { label: 'PH Penalty Missing', variant: 'secondary' as const },
      'STP_ERROR': { label: 'STP Error', variant: 'destructive' as const },
      'UNPAID_BREAK': { label: 'Unpaid Break', variant: 'outline' as const },
      'MANUAL_TS_ENTRY': { label: 'Manual Entry', variant: 'outline' as const }
    };

    const config = badges[exception as keyof typeof badges];
    if (!config) return null;

    return (
      <Badge key={exception} variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const renderEmployeeCard = (employee: any) => {
    const severity = getVarianceSeverity(employee.varianceAmount);
    const isSelected = selectedEmployeeId === employee.employeeId;
    
    return (
      <Card 
        key={employee.employeeId}
        className={cn(
          "cursor-pointer transition-all hover-elevate",
          isSelected && "ring-2 ring-primary border-primary"
        )}
        onClick={() => setSelectedEmployee(employee.employeeId)}
        data-testid={`card-employee-${employee.employeeId}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{employee.employeeName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{employee.department}</span>
                {getStatusIcon(employee.status)}
                <span className="text-xs text-muted-foreground">{employee.status}</span>
              </div>
            </div>
            <Badge variant={severity.variant} className="text-xs">
              {severity.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Variance Summary */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              {getVarianceIcon(employee.varianceAmount)}
              <span className="text-sm font-medium">Variance</span>
            </div>
            <div className="text-right">
              <div className={cn(
                "font-mono text-sm font-medium",
                employee.varianceHours > 0 && "text-orange-600",
                employee.varianceHours < 0 && "text-red-600",
                employee.varianceHours === 0 && "text-green-600"
              )}>
                {employee.varianceHours > 0 ? '+' : ''}{employee.varianceHours.toFixed(1)}h
              </div>
              <div className={cn(
                "font-mono text-xs",
                employee.varianceAmount > 0 && "text-orange-600",
                employee.varianceAmount < 0 && "text-red-600",
                employee.varianceAmount === 0 && "text-green-600"
              )}>
                {formatCurrency(employee.varianceAmount)}
              </div>
            </div>
          </div>
          
          {/* Employee Details */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Cost Centre: {employee.costCentre}</div>
            <div>Award: {employee.award}</div>
            <div>Type: {employee.employmentType}</div>
            <div>Base Rate: {formatCurrency(employee.baseRate)}/hr</div>
          </div>
          
          {/* Exceptions */}
          {employee.exceptions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {employee.exceptions.map((exception: string) => getExceptionBadge(exception))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTimeline = () => {
    if (!selectedEmployee) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select an employee to view their variance timeline</p>
        </div>
      );
    }

    const employeeFindings = findings.filter(f => f.employeeId === selectedEmployee.employeeId);

    return (
      <div className="space-y-6">
        {/* Employee Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {selectedEmployee.employeeName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedEmployee.department} • {selectedEmployee.employmentType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedEmployee.status)}
                <span className="text-sm">{selectedEmployee.status}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedEmployee.timesheets.length}</div>
                <div className="text-sm text-muted-foreground">Timesheets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedEmployee.payslips.length}</div>
                <div className="text-sm text-muted-foreground">Payslips</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  selectedEmployee.varianceHours > 0 && "text-orange-600",
                  selectedEmployee.varianceHours < 0 && "text-red-600",
                  selectedEmployee.varianceHours === 0 && "text-green-600"
                )}>
                  {selectedEmployee.varianceHours > 0 ? '+' : ''}{selectedEmployee.varianceHours.toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">Hour Variance</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  selectedEmployee.varianceAmount > 0 && "text-orange-600",
                  selectedEmployee.varianceAmount < 0 && "text-red-600",
                  selectedEmployee.varianceAmount === 0 && "text-green-600"
                )}>
                  {formatCurrency(selectedEmployee.varianceAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Amount Variance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timesheets Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timesheet History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEmployee.timesheets.length > 0 ? (
              <div className="space-y-2">
                {selectedEmployee.timesheets.map((timesheet, index) => (
                  <div 
                    key={timesheet.id}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg",
                      index % 2 === 0 ? "bg-muted/30" : "bg-background"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">{timesheet.date}</div>
                      <div className="text-sm text-muted-foreground">
                        {timesheet.startTime} - {timesheet.endTime}
                      </div>
                      {timesheet.isManual && (
                        <Badge variant="outline" className="text-xs">Manual</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono">{timesheet.hours}h</div>
                      <Badge variant="outline" className="text-xs">{timesheet.source}</Badge>
                      {timesheet.approvedBy ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No timesheets found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payslips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payslip History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEmployee.payslips.length > 0 ? (
              <div className="space-y-4">
                {selectedEmployee.payslips.map((payslip) => (
                  <div key={payslip.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">Payrun: {payslip.payrunId}</div>
                        <div className="text-sm text-muted-foreground">
                          {payslip.periodStart} to {payslip.periodEnd}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{payslip.source}</Badge>
                        {payslip.stpStatus === 'Success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {payslip.stpStatus === 'Error' && <XCircle className="w-4 h-4 text-red-600" />}
                        {payslip.stpStatus === 'Pending' && <Clock className="w-4 h-4 text-amber-600" />}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Gross Pay</div>
                        <div className="font-medium">{formatCurrency(payslip.grossPay)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Tax</div>
                        <div>{formatCurrency(payslip.tax)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Super</div>
                        <div>{formatCurrency(payslip.superannuation)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Net Pay</div>
                        <div className="font-medium">{formatCurrency(payslip.netPay)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No payslips found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Findings */}
        {employeeFindings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audit Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeFindings.map((finding) => (
                  <div key={finding.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">{finding.title}</div>
                        <div className="text-sm text-muted-foreground">Code: {finding.code}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          finding.severity === 'critical' ? 'destructive' : 
                          finding.severity === 'warn' ? 'secondary' : 'outline'
                        }>
                          {finding.severity}
                        </Badge>
                        <Badge variant={finding.status === 'Resolved' ? 'outline' : 'secondary'}>
                          {finding.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {finding.notes.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <div className="font-medium mb-1">Latest Note:</div>
                        <div>{finding.notes[finding.notes.length - 1].text}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">You don't have permission to view audit findings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Left Pane: Employee List */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Employees with Variances</span>
              <Badge variant="secondary">{filteredEmployees.length}</Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-employees"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="variance">Sort by Variance</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="department">Sort by Department</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterSeverity} onValueChange={(value: any) => setFilterSeverity(value)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High ({'>'}$500)</SelectItem>
                    <SelectItem value="medium">Medium ($100-$500)</SelectItem>
                    <SelectItem value="low">Low ({'<'}$100)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Cards */}
        <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
          {filteredEmployees.map(employee => renderEmployeeCard(employee))}
          
          {filteredEmployees.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No employees match your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Pane: Employee Timeline */}
      <div className="lg:col-span-2">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderTimeline()}
        </div>
      </div>
    </div>
  );
}