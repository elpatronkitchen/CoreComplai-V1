import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  Edit3,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayrollAuditStore } from "../store/payrollAuditSlice";
import { hasPermission } from "../lib/permissions";
import { useAppStore } from "../lib/store";
import { format, parseISO } from "date-fns";
import type { Finding, FindingSeverity, FindingStatus, EvidenceRef } from "../types/payrollAudit";

interface FindingsWorkflowProps {}

export default function FindingsWorkflow({}: FindingsWorkflowProps) {
  const { currentUser } = useAppStore();
  const { 
    findings, 
    employeeRecords,
    createFinding, 
    updateFinding, 
    addFindingNote,
    filters 
  } = usePayrollAuditStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<"all" | FindingSeverity>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | FindingStatus>("all");
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState<{open: boolean; findingId?: string}>({open: false});
  const [showViewNotesDialog, setShowViewNotesDialog] = useState<{open: boolean; findingId?: string}>({open: false});
  const [sortBy, setSortBy] = useState<"severity" | "status" | "updated" | "employee">("updated");

  // Create Finding form state
  const [newFinding, setNewFinding] = useState({
    employeeId: "",
    payrunId: "",
    code: "",
    title: "",
    severity: "info" as FindingSeverity,
    assignee: ""
  });

  // Note form state
  const [newNote, setNewNote] = useState("");

  const canCreate = hasPermission(currentUser, 'create_audit_findings');
  const canManage = hasPermission(currentUser, 'manage_audit_findings');
  const canAnnotate = hasPermission(currentUser, 'annotate_audit_findings');

  // Filter and sort findings
  const filteredFindings = findings
    .filter(finding => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const employeeName = employeeRecords.find(emp => emp.employeeId === finding.employeeId)?.employeeName || "";
        if (!finding.title.toLowerCase().includes(searchLower) &&
            !finding.code.toLowerCase().includes(searchLower) &&
            !employeeName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Severity filter
      if (filterSeverity !== "all" && finding.severity !== filterSeverity) {
        return false;
      }
      
      // Status filter
      if (filterStatus !== "all" && finding.status !== filterStatus) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "severity":
          const severityOrder = { critical: 3, warn: 2, info: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case "status":
          return a.status.localeCompare(b.status);
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "employee":
          const aEmployee = employeeRecords.find(emp => emp.employeeId === a.employeeId)?.employeeName || "";
          const bEmployee = employeeRecords.find(emp => emp.employeeId === b.employeeId)?.employeeName || "";
          return aEmployee.localeCompare(bEmployee);
        default:
          return 0;
      }
    });

  const getSeverityIcon = (severity: FindingSeverity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: FindingSeverity) => {
    const config = {
      critical: { variant: 'destructive' as const, label: 'Critical' },
      warn: { variant: 'secondary' as const, label: 'Warning' },
      info: { variant: 'outline' as const, label: 'Info' }
    };
    return config[severity];
  };

  const getStatusBadge = (status: FindingStatus) => {
    const config = {
      'Open': { variant: 'secondary' as const, label: 'Open' },
      'Resolved': { variant: 'outline' as const, label: 'Resolved' },
      "Won't Fix": { variant: 'outline' as const, label: "Won't Fix" }
    };
    return config[status];
  };

  const handleCreateFinding = () => {
    if (!canCreate || !newFinding.title || !newFinding.code) return;

    createFinding({
      employeeId: newFinding.employeeId || undefined,
      payrunId: newFinding.payrunId || undefined,
      code: newFinding.code,
      title: newFinding.title,
      severity: newFinding.severity,
      status: 'Open',
      assignee: newFinding.assignee || undefined,
      evidence: [],
      notes: []
    });

    // Reset form
    setNewFinding({
      employeeId: "",
      payrunId: "",
      code: "",
      title: "",
      severity: "info",
      assignee: ""
    });
    setShowCreateDialog(false);
  };

  const handleUpdateStatus = (findingId: string, status: FindingStatus) => {
    if (!canManage) return;
    updateFinding(findingId, { status });
  };

  const handleAssignTo = (findingId: string, assignee: string) => {
    if (!canManage) return;
    updateFinding(findingId, { assignee });
  };

  const handleAddNote = () => {
    if (!canAnnotate || !showNoteDialog.findingId || !newNote.trim()) return;

    addFindingNote(showNoteDialog.findingId, {
      author: currentUser?.email || 'Unknown',
      text: newNote.trim()
    });

    setNewNote("");
    setShowNoteDialog({open: false});
  };

  const handleBulkStatusUpdate = (status: FindingStatus) => {
    if (!canManage || selectedFindings.length === 0) return;
    
    selectedFindings.forEach(findingId => {
      updateFinding(findingId, { status });
    });
    setSelectedFindings([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFindings(filteredFindings.map(f => f.id));
    } else {
      setSelectedFindings([]);
    }
  };

  const handleSelectFinding = (findingId: string, checked: boolean) => {
    if (checked) {
      setSelectedFindings([...selectedFindings, findingId]);
    } else {
      setSelectedFindings(selectedFindings.filter(id => id !== findingId));
    }
  };

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return "System";
    return employeeRecords.find(emp => emp.employeeId === employeeId)?.employeeName || `Employee ${employeeId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Findings & Workflow
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage audit findings with severity tracking and workflow
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{filteredFindings.length} findings</Badge>
              {canCreate && (
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  size="sm"
                  data-testid="button-create-finding"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Finding
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search findings, codes, employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-findings"
              />
            </div>
            
            <Select value={filterSeverity} onValueChange={(value: any) => setFilterSeverity(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Won't Fix">Won't Fix</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Sort by Updated</SelectItem>
                <SelectItem value="severity">Sort by Severity</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
                <SelectItem value="employee">Sort by Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bulk Actions */}
          {selectedFindings.length > 0 && canManage && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedFindings.length} finding(s) selected
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('Resolved')}
                  data-testid="button-bulk-resolve"
                >
                  Mark Resolved
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('Open')}
                  data-testid="button-bulk-reopen"
                >
                  Reopen
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedFindings([])}
                  data-testid="button-clear-selection"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Findings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedFindings.length === filteredFindings.length && filteredFindings.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={!canManage}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFindings.map((finding) => (
                  <TableRow key={finding.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedFindings.includes(finding.id)}
                        onCheckedChange={(checked) => handleSelectFinding(finding.id, !!checked)}
                        disabled={!canManage}
                        data-testid={`checkbox-finding-${finding.id}`}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{finding.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {finding.code}
                          {finding.payrunId && ` • Payrun: ${finding.payrunId}`}
                        </div>
                        {finding.notes.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <MessageSquare className="w-3 h-3 text-muted-foreground" />
                            <button
                              onClick={() => setShowViewNotesDialog({open: true, findingId: finding.id})}
                              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                              data-testid={`button-view-notes-${finding.id}`}
                            >
                              {finding.notes.length} note(s)
                            </button>
                          </div>
                        )}
                        {finding.evidence.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Paperclip className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {finding.evidence.length} evidence
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{getEmployeeName(finding.employeeId)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(finding.severity)}
                        <Badge variant={getSeverityBadge(finding.severity).variant}>
                          {getSeverityBadge(finding.severity).label}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Select 
                        value={finding.status} 
                        onValueChange={(status) => handleUpdateStatus(finding.id, status as FindingStatus)}
                        disabled={!canManage}
                      >
                        <SelectTrigger className="w-auto border-none shadow-none">
                          <Badge variant={getStatusBadge(finding.status).variant}>
                            {getStatusBadge(finding.status).label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Won't Fix">Won't Fix</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <Select 
                        value={finding.assignee || "unassigned"} 
                        onValueChange={(assignee) => handleAssignTo(finding.id, assignee === "unassigned" ? "" : assignee)}
                        disabled={!canManage}
                      >
                        <SelectTrigger className="w-auto border-none shadow-none text-sm">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          <SelectItem value="compliance@company.com.au">Compliance Team</SelectItem>
                          <SelectItem value="payroll@company.com.au">Payroll Team</SelectItem>
                          <SelectItem value="hr@company.com.au">HR Team</SelectItem>
                          <SelectItem value="auditor@company.com.au">Internal Auditor</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(finding.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {canAnnotate && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowNoteDialog({open: true, findingId: finding.id})}
                          data-testid={`button-add-note-${finding.id}`}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredFindings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No findings match your filters</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Finding Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Finding</DialogTitle>
            <DialogDescription>
              Add a new audit finding to track compliance issues
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Employee</label>
              <Select value={newFinding.employeeId || "none"} onValueChange={(value) => 
                setNewFinding({...newFinding, employeeId: value === "none" ? "" : value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific employee</SelectItem>
                  {employeeRecords.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Payrun ID</label>
              <Input
                value={newFinding.payrunId}
                onChange={(e) => setNewFinding({...newFinding, payrunId: e.target.value})}
                placeholder="PR-XXXX (optional)"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Code *</label>
              <Input
                value={newFinding.code}
                onChange={(e) => setNewFinding({...newFinding, code: e.target.value})}
                placeholder="e.g., MISSING_TS, POST_TERM_PAY"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newFinding.title}
                onChange={(e) => setNewFinding({...newFinding, title: e.target.value})}
                placeholder="Brief description of the finding"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Select value={newFinding.severity} onValueChange={(value: FindingSeverity) => 
                setNewFinding({...newFinding, severity: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <Select value={newFinding.assignee || "unassigned"} onValueChange={(value) => 
                setNewFinding({...newFinding, assignee: value === "unassigned" ? "" : value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="compliance@company.com.au">Compliance Team</SelectItem>
                  <SelectItem value="payroll@company.com.au">Payroll Team</SelectItem>
                  <SelectItem value="hr@company.com.au">HR Team</SelectItem>
                  <SelectItem value="auditor@company.com.au">Internal Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateFinding}
                disabled={!newFinding.title || !newFinding.code}
              >
                Create Finding
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog.open} onOpenChange={(open) => setShowNoteDialog({open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a comment or update to this finding
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              rows={4}
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog({open: false})}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Notes Dialog */}
      <Dialog open={showViewNotesDialog.open} onOpenChange={(open) => setShowViewNotesDialog({open})}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notes</DialogTitle>
            <DialogDescription>
              View all notes for this finding
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {showViewNotesDialog.findingId && (() => {
              const finding = findings.find(f => f.id === showViewNotesDialog.findingId);
              return finding?.notes.map((note, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium">{note.author}</span>
                    <span>{format(parseISO(note.at), 'MMM d, yyyy • h:mm a')}</span>
                  </div>
                  <p className="text-sm">{note.text}</p>
                </div>
              )) || <p className="text-muted-foreground">No notes found.</p>;
            })()}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowViewNotesDialog({open: false})}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}