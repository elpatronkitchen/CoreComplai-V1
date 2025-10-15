import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import {
  useFindings,
  useCreateFinding,
  useUpdateFindingStatus
} from "@/hooks/useFindings";
import { format } from "date-fns";

export default function FindingsWorkflow() {
  const { hasPermission } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "low" | "medium" | "high" | "critical">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "investigating" | "resolved">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"severity" | "status" | "created">("created");

  // Create Finding form state
  const [newFinding, setNewFinding] = useState({
    title: "",
    description: "",
    severity: "medium",
    status: "open",
    assignedTo: ""
  });

  const { data: findings = [], isLoading } = useFindings({
    severity: filterSeverity !== "all" ? filterSeverity : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined
  });
  const createMutation = useCreateFinding();
  const updateStatusMutation = useUpdateFindingStatus();

  const canCreate = hasPermission('create_audit_findings');
  const canManage = hasPermission('manage_audit_findings');

  // Filter and sort findings
  const filteredFindings = findings
    .filter(finding => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!finding.title.toLowerCase().includes(searchLower) &&
            !finding.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "severity":
          const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        case "status":
          return a.status.localeCompare(b.status);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const getSeverityIcon = (severity: string) => {
    const normalizedSeverity = severity?.toLowerCase();
    switch (normalizedSeverity) {
      case 'critical':
      case 'high':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "destructive" | "secondary" | "outline" => {
    const normalizedSeverity = severity?.toLowerCase();
    switch (normalizedSeverity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'investigating':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const handleCreateFinding = () => {
    if (!canCreate) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create findings',
        variant: 'destructive',
      });
      return;
    }

    if (!newFinding.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Finding title is required',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate(
      {
        ...newFinding,
        auditId: 1, // Default audit ID - in real app this would come from context
      },
      {
        onSuccess: () => {
          toast({
            title: 'Finding Created',
            description: 'Audit finding has been created successfully',
          });
          setShowCreateDialog(false);
          setNewFinding({
            title: "",
            description: "",
            severity: "medium",
            status: "open",
            assignedTo: ""
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create finding',
            variant: 'destructive',
          });
        }
      }
    );
  };

  const handleUpdateStatus = (findingId: number, newStatus: string) => {
    if (!canManage) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to update findings',
        variant: 'destructive',
      });
      return;
    }

    updateStatusMutation.mutate(
      { id: findingId, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status Updated',
            description: 'Finding status has been updated',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update status',
            variant: 'destructive',
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!canManage && !canCreate) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">You don't have permission to view findings</p>
        </CardContent>
      </Card>
    );
  }

  if (findings.length === 0 && !canCreate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Findings & Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No findings found. Create findings to track audit issues.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Findings & Workflow</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track and manage audit findings
              </p>
            </div>
            {canCreate && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                data-testid="button-create-finding"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Finding
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search findings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-findings"
              />
            </div>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Sort by Date</SelectItem>
                <SelectItem value="severity">Sort by Severity</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={(value: any) => setFilterSeverity(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Findings Table */}
          {filteredFindings.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No findings match your filters. {canCreate && "Create a new finding to get started."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Finding</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFindings.map((finding) => (
                    <TableRow key={finding.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{finding.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {finding.description}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(finding.severity)}
                          <Badge variant={getSeverityBadgeVariant(finding.severity)}>
                            {finding.severity}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(finding.status)}
                          <span className="text-sm capitalize">{finding.status}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">{finding.assignedTo || 'Unassigned'}</span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(finding.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        {canManage && finding.status !== 'resolved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(finding.id, 'resolved')}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-resolve-${finding.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Finding Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Audit Finding</DialogTitle>
            <DialogDescription>
              Document a new finding from the payroll audit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newFinding.title}
                onChange={(e) => setNewFinding({ ...newFinding, title: e.target.value })}
                placeholder="Brief description of the finding"
                data-testid="input-finding-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newFinding.description}
                onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                placeholder="Detailed description of the finding..."
                rows={3}
                data-testid="input-finding-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select 
                  value={newFinding.severity} 
                  onValueChange={(value) => setNewFinding({ ...newFinding, severity: value })}
                >
                  <SelectTrigger data-testid="select-finding-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Input
                  value={newFinding.assignedTo}
                  onChange={(e) => setNewFinding({ ...newFinding, assignedTo: e.target.value })}
                  placeholder="Email or name"
                  data-testid="input-finding-assignee"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFinding}
              disabled={createMutation.isPending}
              data-testid="button-save-finding"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Finding'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
