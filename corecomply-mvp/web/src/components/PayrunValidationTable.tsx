import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { usePayrunValidations } from "@/hooks/usePayrollAudit";
import { format } from "date-fns";

export default function PayrunValidationTable() {
  const { hasPermission } = useUser();
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const { data: validations = [], isLoading } = usePayrunValidations();
  const canExport = hasPermission('export_audit_evidence');

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'validated':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'validated':
      case 'success':
        return 'outline';
      case 'failed':
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const renderExpandedRow = (validation: typeof validations[0]) => (
    <TableRow>
      <TableCell colSpan={6} className="p-0">
        <div className="border-t bg-muted/20 p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Validation Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Pay Period</div>
                  <div className="font-medium">
                    {format(new Date(validation.payPeriodStart), 'MMM dd')} - {format(new Date(validation.payPeriodEnd), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Employees</div>
                  <div className="font-medium">{validation.totalEmployees}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Exception Count</div>
                  <div className={cn(
                    "font-medium",
                    validation.exceptionCount > 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {validation.exceptionCount}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Amount</div>
                  <div className="font-medium">{formatCurrency(validation.totalAmount)}</div>
                </div>
              </div>
            </div>

            {canExport && (
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  data-testid={`button-export-${validation.id}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Validation Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (validations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payrun Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No payrun validations found. Start an audit session to generate validation data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payrun Validation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Review payrun validations and identify exceptions
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Payrun ID</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Exceptions</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validations.map((validation) => (
                <>
                  <TableRow 
                    key={validation.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedRowId(
                      expandedRowId === validation.id ? null : validation.id
                    )}
                  >
                    <TableCell>
                      {expandedRowId === validation.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">{validation.payrunId}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(validation.totalAmount)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(validation.payPeriodStart), 'MMM dd')} - {format(new Date(validation.payPeriodEnd), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right font-mono">
                      {validation.totalEmployees}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Badge variant={validation.exceptionCount > 0 ? "destructive" : "outline"}>
                        {validation.exceptionCount}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(validation.status)}
                        <Badge variant={getStatusBadgeVariant(validation.status)}>
                          {validation.status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedRowId === validation.id && renderExpandedRow(validation)}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
