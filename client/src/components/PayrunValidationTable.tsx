import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Download, 
  Edit3,
  ExternalLink,
  FileText,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayrollAuditStore } from "../store/payrollAuditSlice";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import type { PayrunValidationRow, TimesheetEntry, PayslipEntry } from "../types/payrollAudit";

interface PayrunValidationTableProps {
  data: PayrunValidationRow[];
}

export default function PayrunValidationTable({ data }: PayrunValidationTableProps) {
  const { currentUser } = useAppStore();
  const { 
    expandedRowId, 
    setExpandedRow, 
    createFinding, 
    createVarianceExplanation, 
    addAuditNote,
    exportEvidencePack 
  } = usePayrollAuditStore();

  const [varianceDialog, setVarianceDialog] = useState<{open: boolean; employeeId?: string; payrunId?: string}>({open: false});
  const [varianceReason, setVarianceReason] = useState<string>("");
  const [varianceExplanation, setVarianceExplanation] = useState<string>("");

  const canCreate = hasPermission(currentUser, 'create_audit_findings');
  const canAnnotate = hasPermission(currentUser, 'annotate_audit_findings');
  const canExport = hasPermission(currentUser, 'export_audit_evidence');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'Error':
        return <XCircle className="w-4 h-4 text-red-600" />;
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

  const handleReconcile = (employeeId: string, payrunId: string) => {
    if (!canCreate) return;

    createFinding({
      employeeId,
      payrunId,
      code: 'RECONCILE',
      title: 'Payroll reconciliation review',
      severity: 'info',
      status: 'Open',
      evidence: [],
      notes: [{
        at: new Date().toISOString(),
        author: currentUser?.email || 'Unknown',
        text: 'Reconciliation review initiated from payrun validation table'
      }]
    });
  };

  const handleExplainVariance = () => {
    if (!canAnnotate || !varianceDialog.employeeId || !varianceDialog.payrunId) return;

    createVarianceExplanation({
      employeeId: varianceDialog.employeeId,
      payrunId: varianceDialog.payrunId,
      reason: varianceReason as any,
      explanation: varianceExplanation,
      createdBy: currentUser?.email || 'Unknown'
    });

    setVarianceDialog({open: false});
    setVarianceReason("");
    setVarianceExplanation("");
  };

  const handleExportEvidence = async (employeeId: string, payrunId: string) => {
    if (!canExport) return;
    
    try {
      const packUrl = await exportEvidencePack(employeeId, payrunId);
      // In a real app, this would trigger a download
      console.log('Evidence pack generated:', packUrl);
    } catch (error) {
      console.error('Failed to export evidence:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const renderTimesheetRow = (timesheet: TimesheetEntry, index: number) => (
    <div key={timesheet.id} className={cn(
      "grid grid-cols-7 gap-2 p-2 text-sm border-b",
      index % 2 === 0 ? "bg-muted/30" : "bg-background"
    )}>
      <div>{timesheet.date}</div>
      <div className="flex items-center gap-1">
        {timesheet.startTime}
        {timesheet.isManual && <Edit3 className="w-3 h-3 text-amber-600" />}
      </div>
      <div>{timesheet.endTime}</div>
      <div>{timesheet.breakMinutes}min</div>
      <div className="flex items-center gap-1">
        {timesheet.approvedBy ? (
          <>
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-xs text-muted-foreground">{timesheet.approvedBy.split('@')[0]}</span>
          </>
        ) : (
          <Clock className="w-3 h-3 text-amber-600" />
        )}
      </div>
      <div className="font-medium">{timesheet.hours}h</div>
      <div>
        <Badge variant="outline" className="text-xs">{timesheet.source}</Badge>
      </div>
    </div>
  );

  const renderPayslipRow = (line: any, index: number) => (
    <div key={index} className={cn(
      "grid grid-cols-5 gap-2 p-2 text-sm border-b",
      index % 2 === 0 ? "bg-muted/30" : "bg-background"
    )}>
      <div className="font-medium">{line.code}</div>
      <div>{line.label}</div>
      <div className="text-right">{line.quantity}</div>
      <div className="text-right">{formatCurrency(line.rate)}</div>
      <div className="text-right font-medium">{formatCurrency(line.amount)}</div>
    </div>
  );

  const renderExpandedRow = (row: PayrunValidationRow) => (
    <TableRow>
      <TableCell colSpan={8} className="p-0">
        <div className="border-t bg-muted/20 p-6">
          {/* Header Chips */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">Cost Centre: {row.employee.costCentre}</Badge>
            <Badge variant="secondary">Award: {row.employee.award}</Badge>
            <Badge variant="secondary">Pay Cycle: Fortnightly</Badge>
          </div>

          {/* Side-by-side Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Timesheets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timesheets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  {/* Header */}
                  <div className="grid grid-cols-7 gap-2 p-3 bg-muted text-sm font-medium border-b">
                    <div>Date</div>
                    <div>Start</div>
                    <div>End</div>
                    <div>Break</div>
                    <div>Approved</div>
                    <div>Hours</div>
                    <div>Source</div>
                  </div>
                  
                  {row.timesheets.length > 0 ? (
                    row.timesheets.map((timesheet, index) => renderTimesheetRow(timesheet, index))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No timesheets found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right: Payslips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Payslip
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  {row.payslips.length > 0 ? (
                    row.payslips.map((payslip) => (
                      <div key={payslip.id}>
                        {/* Payslip Lines Header */}
                        <div className="grid grid-cols-5 gap-2 p-3 bg-muted text-sm font-medium border-b">
                          <div>Code</div>
                          <div>Description</div>
                          <div className="text-right">Qty</div>
                          <div className="text-right">Rate</div>
                          <div className="text-right">Amount</div>
                        </div>
                        
                        {/* Payslip Lines */}
                        {payslip.lines.map((line, index) => renderPayslipRow(line, index))}
                        
                        {/* Totals */}
                        <div className="p-3 bg-muted/50 border-t">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Gross Pay:</span>
                                <span className="font-medium">{formatCurrency(payslip.grossPay)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>{formatCurrency(payslip.tax)}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Super:</span>
                                <span>{formatCurrency(payslip.superannuation)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Net Pay:</span>
                                <span>{formatCurrency(payslip.netPay)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* STP Status */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(payslip.stpStatus)}
                              <span className="text-sm">STP: {payslip.stpStatus}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{payslip.source}</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No payslips found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t">
            {canCreate && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleReconcile(row.employee.id, row.payruns[0])}
                data-testid="button-reconcile"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Reconcile
              </Button>
            )}
            
            {canAnnotate && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setVarianceDialog({
                  open: true, 
                  employeeId: row.employee.id, 
                  payrunId: row.payruns[0]
                })}
                data-testid="button-explain-variance"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Explain Variance
              </Button>
            )}
            
            {canAnnotate && (
              <Button 
                size="sm" 
                variant="outline"
                data-testid="button-annotate"
              >
                <FileText className="w-4 h-4 mr-2" />
                Annotate
              </Button>
            )}
            
            {canExport && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleExportEvidence(row.employee.id, row.payruns[0])}
                data-testid="button-export-evidence"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Evidence Pack
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              data-testid="button-open-staff-file"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Staff File
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payrun Validation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Reconcile timesheet hours against payslip hours and identify variances
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Payrun(s)</TableHead>
                  <TableHead className="text-right">T&A Hours</TableHead>
                  <TableHead className="text-right">Paid Hours</TableHead>
                  <TableHead className="text-right">Var (h)</TableHead>
                  <TableHead className="text-right">$ Est Var</TableHead>
                  <TableHead className="text-center">STP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <>
                    <TableRow 
                      key={row.employee.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedRow(
                        expandedRowId === row.employee.id ? null : row.employee.id
                      )}
                    >
                      <TableCell>
                        {expandedRowId === row.employee.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">{row.employee.name}</div>
                          <div className="text-sm text-muted-foreground">{row.employee.department}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {row.exceptions.map((exception) => getExceptionBadge(exception))}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.payruns.map((payrun) => (
                            <Badge key={payrun} variant="outline" className="text-xs">
                              {payrun}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right font-mono">
                        {row.taaHours.toFixed(1)}h
                      </TableCell>
                      
                      <TableCell className="text-right font-mono">
                        {row.paidHours.toFixed(1)}h
                      </TableCell>
                      
                      <TableCell className={cn(
                        "text-right font-mono font-medium",
                        row.varianceHours > 0 && "text-orange-600",
                        row.varianceHours < 0 && "text-red-600",
                        row.varianceHours === 0 && "text-green-600"
                      )}>
                        {row.varianceHours > 0 ? '+' : ''}{row.varianceHours.toFixed(1)}h
                      </TableCell>
                      
                      <TableCell className={cn(
                        "text-right font-mono",
                        row.estimatedVarianceAmount > 0 && "text-orange-600",
                        row.estimatedVarianceAmount < 0 && "text-red-600",
                        row.estimatedVarianceAmount === 0 && "text-green-600"
                      )}>
                        {formatCurrency(row.estimatedVarianceAmount)}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {getStatusIcon(row.stpStatus)}
                      </TableCell>
                    </TableRow>
                    
                    {expandedRowId === row.employee.id && renderExpandedRow(row)}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Variance Explanation Dialog */}
      <Dialog open={varianceDialog.open} onOpenChange={(open) => setVarianceDialog({open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Explain Variance</DialogTitle>
            <DialogDescription>
              Provide an explanation for the payroll variance detected
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Select value={varianceReason} onValueChange={setVarianceReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid break">Unpaid break</SelectItem>
                  <SelectItem value="Rounding">Rounding</SelectItem>
                  <SelectItem value="Public holiday">Public holiday</SelectItem>
                  <SelectItem value="Manual adjustment">Manual adjustment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Explanation</label>
              <Textarea
                value={varianceExplanation}
                onChange={(e) => setVarianceExplanation(e.target.value)}
                placeholder="Provide additional details about this variance..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVarianceDialog({open: false})}>
                Cancel
              </Button>
              <Button 
                onClick={handleExplainVariance}
                disabled={!varianceReason || !varianceExplanation}
              >
                Save Explanation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}