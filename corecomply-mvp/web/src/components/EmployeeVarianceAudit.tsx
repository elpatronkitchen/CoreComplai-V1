import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { useEmployeeVariances } from "@/hooks/usePayrollAudit";
import { useState } from "react";
import { format } from "date-fns";

export default function EmployeeVarianceAudit() {
  const { hasPermission } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"variance" | "name" | "type">("variance");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "low" | "medium" | "high" | "critical">("all");
  const [selectedVarianceId, setSelectedVarianceId] = useState<number | null>(null);

  const { data: variances = [], isLoading } = useEmployeeVariances({
    severity: filterSeverity !== "all" ? filterSeverity : undefined
  });
  const canView = hasPermission('manage_audit_findings');

  // Filter and sort variances
  const filteredVariances = variances
    .filter(variance => {
      if (!canView) return false;
      
      // Search filter
      if (searchTerm && 
          !variance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !variance.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.employeeName.localeCompare(b.employeeName);
        case "variance":
          return Math.abs(b.varianceAmount) - Math.abs(a.varianceAmount);
        case "type":
          return a.varianceType.localeCompare(b.varianceType);
        default:
          return 0;
      }
    });

  const selectedVariance = filteredVariances.find(v => v.id === selectedVarianceId);

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

  const getSeverityBadgeVariant = (severity: string): "default" | "destructive" | "secondary" | "outline" => {
    const normalizedSeverity = severity?.toLowerCase();
    switch (normalizedSeverity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'resolved':
        return 'outline';
      case 'investigating':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const renderVarianceCard = (variance: typeof variances[0]) => {
    const isSelected = selectedVarianceId === variance.id;
    
    return (
      <Card 
        key={variance.id}
        className={cn(
          "cursor-pointer transition-all hover-elevate",
          isSelected && "ring-2 ring-primary border-primary"
        )}
        onClick={() => setSelectedVarianceId(variance.id)}
        data-testid={`card-variance-${variance.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{variance.employeeName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{variance.employeeId}</span>
                <Badge variant={getSeverityBadgeVariant(variance.severity)} className="text-xs">
                  {variance.severity}
                </Badge>
              </div>
            </div>
            {getVarianceIcon(variance.varianceAmount)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Variance Summary */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <div className="text-sm font-medium">{variance.varianceType}</div>
            <div className="text-right">
              <div className={cn(
                "font-mono text-sm font-medium",
                variance.varianceAmount > 0 && "text-orange-600",
                variance.varianceAmount < 0 && "text-red-600",
                variance.varianceAmount === 0 && "text-green-600"
              )}>
                {formatCurrency(variance.varianceAmount)}
              </div>
            </div>
          </div>
          
          {/* Amounts */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Expected: {formatCurrency(variance.expectedAmount)}</div>
            <div className="text-right">Actual: {formatCurrency(variance.actualAmount)}</div>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge variant={getStatusBadgeVariant(variance.status)} className="text-xs">
              {variance.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(variance.detectedAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVarianceDetails = () => {
    if (!selectedVariance) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a variance to view details</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Variance Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getVarianceIcon(selectedVariance.varianceAmount)}
                  {selectedVariance.employeeName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedVariance.employeeId} • {selectedVariance.varianceType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getSeverityBadgeVariant(selectedVariance.severity)}>
                  {selectedVariance.severity}
                </Badge>
                <Badge variant={getStatusBadgeVariant(selectedVariance.status)}>
                  {selectedVariance.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(selectedVariance.expectedAmount)}</div>
                <div className="text-sm text-muted-foreground">Expected Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(selectedVariance.actualAmount)}</div>
                <div className="text-sm text-muted-foreground">Actual Amount</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  selectedVariance.varianceAmount > 0 && "text-orange-600",
                  selectedVariance.varianceAmount < 0 && "text-red-600",
                  selectedVariance.varianceAmount === 0 && "text-green-600"
                )}>
                  {formatCurrency(selectedVariance.varianceAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Variance Amount</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              Detected on {format(new Date(selectedVariance.detectedAt), 'MMMM dd, yyyy')}
            </div>
          </CardContent>
        </Card>
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (variances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Variance Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No employee variances found. Start an audit session to detect variances.
            </AlertDescription>
          </Alert>
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
              <span>Employee Variances</span>
              <Badge variant="secondary">{filteredVariances.length}</Badge>
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
                    <SelectItem value="type">Sort by Type</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterSeverity} onValueChange={(value: any) => setFilterSeverity(value)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variance Cards */}
        <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
          {filteredVariances.map(variance => renderVarianceCard(variance))}
          
          {filteredVariances.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No variances match your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right Pane: Variance Details */}
      <div className="lg:col-span-2">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderVarianceDetails()}
        </div>
      </div>
    </div>
  );
}
