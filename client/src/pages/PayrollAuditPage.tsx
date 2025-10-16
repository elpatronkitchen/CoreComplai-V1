import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Filter
} from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { usePayrollAuditStore } from "../store/payrollAuditSlice";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import PayrunValidationTable from "../components/PayrunValidationTable";
import EmployeeVarianceAudit from "../components/EmployeeVarianceAudit";
import FindingsWorkflow from "../components/FindingsWorkflow";

export default function PayrollAuditPage() {
  const { currentUser } = useAppStore();
  const {
    filters,
    setFilters,
    getKPIs,
    getFilteredData,
    integrationHealth,
    selectedView,
    setSelectedView,
    startAuditSession,
    currentSession
  } = usePayrollAuditStore();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 14)
  });
  const [showFilters, setShowFilters] = useState(false);

  const kpis = getKPIs();
  const filteredData = getFilteredData();
  const canManage = hasPermission(currentUser, 'manage_audit_findings');
  const canCreate = hasPermission(currentUser, 'create_audit_findings');
  const canExport = hasPermission(currentUser, 'export_audit_evidence');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Auth Required':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSyncStatusBadge = () => {
    const { payrollSource, taaSource } = integrationHealth;
    
    if (payrollSource.status === 'Error' || taaSource.status === 'Error') {
      return (
        <Badge variant="destructive" className="ml-2">
          <XCircle className="w-3 h-3 mr-1" />
          Sync Error
        </Badge>
      );
    }
    
    if (payrollSource.status === 'Auth Required' || taaSource.status === 'Auth Required') {
      return (
        <Badge variant="secondary" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Auth Required
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="ml-2 bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Synced
      </Badge>
    );
  };

  const handleStartAudit = () => {
    startAuditSession();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-payroll-audit">Payroll Variance Audit</h1>
          <p className="text-muted-foreground">
            Reconcile payruns vs time & attendance and surface exceptions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {getSyncStatusBadge()}
          
          {canExport && (
            <Button variant="outline" size="sm" data-testid="button-export-audit">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          
          <Button 
            onClick={handleStartAudit}
            disabled={!!currentSession}
            data-testid="button-start-audit"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {currentSession ? 'Audit Running' : 'Start Audit'}
          </Button>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>COMING SOON:</strong> An intelligent AI-based payroll audit tool is in development.
          <br />
          <span className="text-sm">Prototype reconciles T&A vs Payslips and flags exceptions. Source of truth: Integrations.</span>
        </AlertDescription>
      </Alert>

      {/* Filters Section (Sticky) */}
      <Card className="sticky top-4 z-10 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Audit Filters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pay Source */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pay Source</label>
                <Select 
                  value={filters.paySource} 
                  onValueChange={(value: any) => setFilters({ paySource: value })}
                >
                  <SelectTrigger data-testid="select-pay-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EmploymentHero">Employment Hero</SelectItem>
                    <SelectItem value="Xero">Xero</SelectItem>
                    <SelectItem value="MYOB">MYOB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* T&A Source */}
              <div className="space-y-2">
                <label className="text-sm font-medium">T&A Source</label>
                <Select 
                  value={filters.taaSource} 
                  onValueChange={(value: any) => setFilters({ taaSource: value })}
                >
                  <SelectTrigger data-testid="select-taa-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EmploymentHero">Employment Hero</SelectItem>
                    <SelectItem value="Deputy">Deputy</SelectItem>
                    <SelectItem value="Humanforce">Humanforce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Show</label>
                <Select 
                  value={filters.varianceOnly ? "variances" : "all"} 
                  onValueChange={(value) => setFilters({ varianceOnly: value === "variances" })}
                >
                  <SelectTrigger data-testid="select-show-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="variances">Variances Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                      data-testid="button-date-range"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange as any}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Payrun Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payrun(s)</label>
              <div className="flex flex-wrap gap-2">
                {filters.payruns.map((payrun) => (
                  <Badge key={payrun} variant="secondary" className="px-3 py-1">
                    {payrun}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setFilters({ 
                        payruns: filters.payruns.filter(p => p !== payrun) 
                      })}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Add payrun (e.g., PR-0925)"
                  className="w-48"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value && !filters.payruns.includes(value)) {
                        setFilters({ payruns: [...filters.payruns, value] });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  data-testid="input-add-payrun"
                />
              </div>
            </div>

            {/* Integration Health Warning */}
            {integrationHealth.warnings.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Data Source Warning:</strong> {integrationHealth.warnings.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{kpis.employees}</p>
              <p className="text-sm text-muted-foreground">Employees in Scope</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{kpis.periodsReconciled}</p>
              <p className="text-sm text-muted-foreground">Periods Reconciled</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{kpis.varianceHours.toFixed(1)}h</p>
              <p className="text-sm text-muted-foreground">Total Variance Hours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{kpis.stpExceptions}</p>
              <p className="text-sm text-muted-foreground">STP Exceptions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Views Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payrun-validation" data-testid="tab-payrun-validation">
            Payrun Validation
          </TabsTrigger>
          <TabsTrigger value="employee-variance" data-testid="tab-employee-variance">
            Employee Variance
          </TabsTrigger>
          <TabsTrigger value="findings" data-testid="tab-findings">
            Findings & Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payrun-validation" className="space-y-4">
          <PayrunValidationTable data={filteredData} />
        </TabsContent>

        <TabsContent value="employee-variance" className="space-y-4">
          <EmployeeVarianceAudit />
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <FindingsWorkflow />
        </TabsContent>
      </Tabs>
    </div>
  );
}