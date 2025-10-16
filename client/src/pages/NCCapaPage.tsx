import { useState } from "react";
import { useNCStore, type Nonconformity, type CorrectiveAction } from "@/store/ncCapaSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Eye, AlertTriangle, CheckCircle2, 
  Clock, FileText, Trash2, TrendingUp 
} from "lucide-react";

export default function NCCapaPage() {
  const { 
    nonconformities, 
    addNC, 
    updateNC, 
    deleteNC,
    addContainment,
    addRCA,
    addCorrectiveAction,
    updateCorrectiveAction,
    addEffectivenessCheck,
    closeNC 
  } = useNCStore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNC, setSelectedNC] = useState<Nonconformity | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [ncForm, setNcForm] = useState({
    title: "",
    description: "",
    source: "Internal Audit" as Nonconformity['source'],
    severity: "Minor" as Nonconformity['severity'],
    detectedDate: new Date().toISOString().split('T')[0],
    detectedBy: "",
    process: "",
    product: "",
    status: "Open" as Nonconformity['status'],
    linkedClauses: [] as string[],
    linkedControls: [] as string[],
    linkedObligations: [] as string[],
    evidenceIds: [] as string[],
  });
  
  const [containmentForm, setContainmentForm] = useState({
    action: "",
    implementedBy: "",
    implementedDate: new Date().toISOString().split('T')[0],
    effectiveness: "Pending" as "Effective" | "Not Effective" | "Pending",
  });
  
  const [rcaForm, setRcaForm] = useState({
    method: "5-Whys" as "5-Whys" | "Fishbone" | "Fault Tree" | "Other",
    why1: "",
    why2: "",
    why3: "",
    why4: "",
    why5: "",
    rootCause: "",
    analysisDate: new Date().toISOString().split('T')[0],
    analysedBy: "",
  });
  
  const [caForm, setCaForm] = useState({
    action: "",
    owner: "",
    targetDate: "",
    status: "Open" as CorrectiveAction['status'],
  });
  
  const [effectivenessForm, setEffectivenessForm] = useState({
    plannedDate: "",
    actualDate: "",
    checkedBy: "",
    result: "Effective" as "Effective" | "Not Effective" | "Partially Effective",
    comments: "",
  });
  
  const filteredNCs = nonconformities.filter(nc => {
    const matchesSearch = nc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nc.ncNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === "all" || nc.source === sourceFilter;
    const matchesSeverity = severityFilter === "all" || nc.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || nc.status === statusFilter;
    return matchesSearch && matchesSource && matchesSeverity && matchesStatus;
  });
  
  const openCount = nonconformities.filter(nc => nc.status !== 'Closed').length;
  const criticalCount = nonconformities.filter(nc => nc.severity === 'Critical').length;
  const overdueCACount = nonconformities.reduce((count, nc) => {
    const overdueActions = nc.correctiveActions.filter(ca => {
      const targetDate = new Date(ca.targetDate);
      return targetDate < new Date() && ca.status !== 'Completed';
    });
    return count + overdueActions.length;
  }, 0);
  
  const closedLast30Days = nonconformities.filter(nc => {
    if (!nc.closedDate) return false;
    const closedDate = new Date(nc.closedDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return closedDate >= thirtyDaysAgo;
  }).length;
  
  const handleAddNC = () => {
    if (!ncForm.title?.trim()) {
      alert("Please enter a title");
      return;
    }
    
    if (!ncForm.description?.trim()) {
      alert("Please enter a description");
      return;
    }
    
    if (!ncForm.detectedBy?.trim()) {
      alert("Please enter who detected the nonconformity");
      return;
    }
    
    addNC(ncForm);
    setNcForm({
      title: "",
      description: "",
      source: "Internal Audit",
      severity: "Minor",
      detectedDate: new Date().toISOString().split('T')[0],
      detectedBy: "",
      process: "",
      product: "",
      status: "Open",
      linkedClauses: [],
      linkedControls: [],
      linkedObligations: [],
      evidenceIds: [],
    });
    setIsAddOpen(false);
  };
  
  const handleViewDetails = (nc: Nonconformity) => {
    setSelectedNC(nc);
    setIsDetailOpen(true);
  };
  
  const handleAddContainment = () => {
    if (!selectedNC) return;
    
    if (!containmentForm.action?.trim()) {
      alert("Please enter the containment action");
      return;
    }
    
    if (!containmentForm.implementedBy?.trim()) {
      alert("Please enter who implemented the containment");
      return;
    }
    
    addContainment(selectedNC.id, containmentForm);
    
    setContainmentForm({
      action: "",
      implementedBy: "",
      implementedDate: new Date().toISOString().split('T')[0],
      effectiveness: "Pending",
    });
    
    const updatedNC = useNCStore.getState().getNCById(selectedNC.id);
    if (updatedNC) setSelectedNC(updatedNC);
  };
  
  const handleAddRCA = () => {
    if (!selectedNC) return;
    
    if (!rcaForm.rootCause?.trim()) {
      alert("Please enter the root cause");
      return;
    }
    
    if (!rcaForm.analysedBy?.trim()) {
      alert("Please enter who performed the analysis");
      return;
    }
    
    if (rcaForm.method === "5-Whys" && !rcaForm.why1?.trim()) {
      alert("Please complete at least the first 'Why' question");
      return;
    }
    
    addRCA(selectedNC.id, rcaForm);
    
    setRcaForm({
      method: "5-Whys",
      why1: "",
      why2: "",
      why3: "",
      why4: "",
      why5: "",
      rootCause: "",
      analysisDate: new Date().toISOString().split('T')[0],
      analysedBy: "",
    });
    
    const updatedNC = useNCStore.getState().getNCById(selectedNC.id);
    if (updatedNC) setSelectedNC(updatedNC);
  };
  
  const handleAddCA = () => {
    if (!selectedNC) return;
    
    if (!caForm.action?.trim()) {
      alert("Please enter the corrective action");
      return;
    }
    
    if (!caForm.owner?.trim()) {
      alert("Please enter the action owner");
      return;
    }
    
    if (!caForm.targetDate) {
      alert("Please set a target date");
      return;
    }
    
    addCorrectiveAction(selectedNC.id, caForm);
    
    setCaForm({
      action: "",
      owner: "",
      targetDate: "",
      status: "Open",
    });
    
    const updatedNC = useNCStore.getState().getNCById(selectedNC.id);
    if (updatedNC) setSelectedNC(updatedNC);
  };
  
  const handleUpdateCA = (actionId: string, updates: Partial<CorrectiveAction>) => {
    if (!selectedNC) return;
    
    updateCorrectiveAction(selectedNC.id, actionId, updates);
    
    const updatedNC = useNCStore.getState().getNCById(selectedNC.id);
    if (updatedNC) setSelectedNC(updatedNC);
  };
  
  const handleAddEffectiveness = () => {
    if (!selectedNC) return;
    
    if (!effectivenessForm.actualDate) {
      alert("Please enter the actual check date");
      return;
    }
    
    if (!effectivenessForm.checkedBy?.trim()) {
      alert("Please enter who performed the check");
      return;
    }
    
    addEffectivenessCheck(selectedNC.id, effectivenessForm);
    
    setEffectivenessForm({
      plannedDate: "",
      actualDate: "",
      checkedBy: "",
      result: "Effective",
      comments: "",
    });
    
    const updatedNC = useNCStore.getState().getNCById(selectedNC.id);
    if (updatedNC) setSelectedNC(updatedNC);
  };
  
  const handleCloseNC = () => {
    if (!selectedNC) return;
    
    if (!selectedNC.effectivenessCheck) {
      alert("Cannot close NC without an effectiveness check");
      return;
    }
    
    if (selectedNC.effectivenessCheck.result !== "Effective") {
      if (!confirm("The effectiveness check is not marked as 'Effective'. Are you sure you want to close this NC?")) {
        return;
      }
    }
    
    const closedBy = prompt("Enter your name to close this NC:");
    if (!closedBy?.trim()) return;
    
    closeNC(selectedNC.id, closedBy);
    setIsDetailOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this nonconformity?")) {
      deleteNC(id);
    }
  };
  
  const getSeverityBadge = (severity: Nonconformity['severity']) => {
    const variants = {
      'Minor': 'secondary',
      'Major': 'default',
      'Critical': 'destructive',
    } as const;
    
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };
  
  const getStatusBadge = (status: Nonconformity['status']) => {
    const variants = {
      'Open': 'secondary',
      'Containment': 'default',
      'RCA': 'default',
      'Corrective Action': 'default',
      'Effectiveness Check': 'default',
      'Closed': 'outline',
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 data-testid="heading-nc-capa" className="text-3xl font-bold">Nonconformities & CAPA</h1>
          <p className="text-muted-foreground mt-1">
            ISO 9001:2015 Clause 10.2 - Nonconformity and Corrective Action
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-nc">
              <Plus className="w-4 h-4 mr-2" />
              Report NC
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Nonconformity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nc-title">Title *</Label>
                  <Input
                    id="nc-title"
                    data-testid="input-nc-title"
                    value={ncForm.title}
                    onChange={(e) => setNcForm({ ...ncForm, title: e.target.value })}
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="nc-description">Description *</Label>
                  <Textarea
                    id="nc-description"
                    data-testid="input-nc-description"
                    value={ncForm.description}
                    onChange={(e) => setNcForm({ ...ncForm, description: e.target.value })}
                    placeholder="Detailed description of the nonconformity"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nc-source">Source *</Label>
                  <Select
                    value={ncForm.source}
                    onValueChange={(value) => setNcForm({ ...ncForm, source: value as Nonconformity['source'] })}
                  >
                    <SelectTrigger id="nc-source" data-testid="select-nc-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal Audit">Internal Audit</SelectItem>
                      <SelectItem value="External Audit">External Audit</SelectItem>
                      <SelectItem value="Customer Complaint">Customer Complaint</SelectItem>
                      <SelectItem value="Process Monitoring">Process Monitoring</SelectItem>
                      <SelectItem value="Management Review">Management Review</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="nc-severity">Severity *</Label>
                  <Select
                    value={ncForm.severity}
                    onValueChange={(value) => setNcForm({ ...ncForm, severity: value as Nonconformity['severity'] })}
                  >
                    <SelectTrigger id="nc-severity" data-testid="select-nc-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minor">Minor</SelectItem>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="nc-date">Detected Date *</Label>
                  <Input
                    id="nc-date"
                    data-testid="input-nc-date"
                    type="date"
                    value={ncForm.detectedDate}
                    onChange={(e) => setNcForm({ ...ncForm, detectedDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nc-detected-by">Detected By *</Label>
                  <Input
                    id="nc-detected-by"
                    data-testid="input-nc-detected-by"
                    value={ncForm.detectedBy}
                    onChange={(e) => setNcForm({ ...ncForm, detectedBy: e.target.value })}
                    placeholder="Name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nc-process">Related Process</Label>
                  <Input
                    id="nc-process"
                    data-testid="input-nc-process"
                    value={ncForm.process}
                    onChange={(e) => setNcForm({ ...ncForm, process: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nc-product">Related Product</Label>
                  <Input
                    id="nc-product"
                    data-testid="input-nc-product"
                    value={ncForm.product}
                    onChange={(e) => setNcForm({ ...ncForm, product: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button data-testid="button-save-nc" onClick={handleAddNC}>Report NC</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open NCs</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div data-testid="text-open-ncs" className="text-2xl font-bold">{openCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical NCs</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div data-testid="text-critical-ncs" className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">High priority</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue CAs</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div data-testid="text-overdue-cas" className="text-2xl font-bold">{overdueCACount}</div>
            <p className="text-xs text-muted-foreground mt-1">Past target date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed (30d)</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div data-testid="text-closed-30d" className="text-2xl font-bold">{closedLast30Days}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                data-testid="input-search"
                placeholder="NC number or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="source-filter">Source</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger id="source-filter" data-testid="select-source-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Internal Audit">Internal Audit</SelectItem>
                  <SelectItem value="External Audit">External Audit</SelectItem>
                  <SelectItem value="Customer Complaint">Customer Complaint</SelectItem>
                  <SelectItem value="Process Monitoring">Process Monitoring</SelectItem>
                  <SelectItem value="Management Review">Management Review</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="severity-filter">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger id="severity-filter" data-testid="select-severity-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Major">Major</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Containment">Containment</SelectItem>
                  <SelectItem value="RCA">RCA</SelectItem>
                  <SelectItem value="Corrective Action">Corrective Action</SelectItem>
                  <SelectItem value="Effectiveness Check">Effectiveness Check</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NC Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNCs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No nonconformities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredNCs.map((nc) => (
                  <TableRow key={nc.id} data-testid={`row-nc-${nc.id}`}>
                    <TableCell className="font-medium">{nc.ncNumber}</TableCell>
                    <TableCell>{nc.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{nc.source}</Badge>
                    </TableCell>
                    <TableCell>{getSeverityBadge(nc.severity)}</TableCell>
                    <TableCell>{getStatusBadge(nc.status)}</TableCell>
                    <TableCell>{new Date(nc.detectedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-view-${nc.id}`}
                          onClick={() => handleViewDetails(nc)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-delete-${nc.id}`}
                          onClick={() => handleDelete(nc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedNC?.ncNumber} - {selectedNC?.title}</SheetTitle>
          </SheetHeader>
          
          {selectedNC && (
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="containment">Containment</TabsTrigger>
                <TabsTrigger value="rca">RCA</TabsTrigger>
                <TabsTrigger value="capa">CAPA</TabsTrigger>
                <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedNC.status)}</div>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <div className="mt-1">{getSeverityBadge(selectedNC.severity)}</div>
                  </div>
                  <div>
                    <Label>Source</Label>
                    <div className="mt-1"><Badge variant="outline">{selectedNC.source}</Badge></div>
                  </div>
                  <div>
                    <Label>Detected Date</Label>
                    <p className="text-sm mt-1">{new Date(selectedNC.detectedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Detected By</Label>
                    <p className="text-sm mt-1">{selectedNC.detectedBy}</p>
                  </div>
                  {selectedNC.process && (
                    <div>
                      <Label>Process</Label>
                      <p className="text-sm mt-1">{selectedNC.process}</p>
                    </div>
                  )}
                  {selectedNC.product && (
                    <div>
                      <Label>Product</Label>
                      <p className="text-sm mt-1">{selectedNC.product}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedNC.description}</p>
                </div>
                {selectedNC.closedDate && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label>Closed Date</Label>
                      <p className="text-sm mt-1">{new Date(selectedNC.closedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label>Closed By</Label>
                      <p className="text-sm mt-1">{selectedNC.closedBy}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="containment" className="space-y-4">
                {selectedNC.containment ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Containment Action</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Action</Label>
                        <p className="text-sm mt-1">{selectedNC.containment.action}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Implemented By</Label>
                          <p className="text-sm mt-1">{selectedNC.containment.implementedBy}</p>
                        </div>
                        <div>
                          <Label>Implementation Date</Label>
                          <p className="text-sm mt-1">{new Date(selectedNC.containment.implementedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Effectiveness</Label>
                        <div className="mt-1">
                          <Badge variant={selectedNC.containment.effectiveness === "Effective" ? "default" : "secondary"}>
                            {selectedNC.containment.effectiveness}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">No containment action recorded. Add immediate containment to prevent further issues.</p>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="containment-action">Containment Action *</Label>
                        <Textarea
                          id="containment-action"
                          data-testid="input-containment-action"
                          value={containmentForm.action}
                          onChange={(e) => setContainmentForm({ ...containmentForm, action: e.target.value })}
                          placeholder="Describe the immediate action taken"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="containment-by">Implemented By *</Label>
                          <Input
                            id="containment-by"
                            data-testid="input-containment-by"
                            value={containmentForm.implementedBy}
                            onChange={(e) => setContainmentForm({ ...containmentForm, implementedBy: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="containment-date">Implementation Date *</Label>
                          <Input
                            id="containment-date"
                            data-testid="input-containment-date"
                            type="date"
                            value={containmentForm.implementedDate}
                            onChange={(e) => setContainmentForm({ ...containmentForm, implementedDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="containment-effectiveness">Effectiveness</Label>
                        <Select
                          value={containmentForm.effectiveness}
                          onValueChange={(value) => setContainmentForm({ ...containmentForm, effectiveness: value as typeof containmentForm.effectiveness })}
                        >
                          <SelectTrigger id="containment-effectiveness" data-testid="select-containment-effectiveness">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Effective">Effective</SelectItem>
                            <SelectItem value="Not Effective">Not Effective</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button data-testid="button-save-containment" onClick={handleAddContainment}>
                        Save Containment
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="rca" className="space-y-4">
                {selectedNC.rootCauseAnalysis ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Root Cause Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Method</Label>
                        <div className="mt-1"><Badge>{selectedNC.rootCauseAnalysis.method}</Badge></div>
                      </div>
                      {selectedNC.rootCauseAnalysis.method === "5-Whys" && (
                        <div className="space-y-2">
                          {selectedNC.rootCauseAnalysis.why1 && <div><Label>Why 1:</Label><p className="text-sm">{selectedNC.rootCauseAnalysis.why1}</p></div>}
                          {selectedNC.rootCauseAnalysis.why2 && <div><Label>Why 2:</Label><p className="text-sm">{selectedNC.rootCauseAnalysis.why2}</p></div>}
                          {selectedNC.rootCauseAnalysis.why3 && <div><Label>Why 3:</Label><p className="text-sm">{selectedNC.rootCauseAnalysis.why3}</p></div>}
                          {selectedNC.rootCauseAnalysis.why4 && <div><Label>Why 4:</Label><p className="text-sm">{selectedNC.rootCauseAnalysis.why4}</p></div>}
                          {selectedNC.rootCauseAnalysis.why5 && <div><Label>Why 5:</Label><p className="text-sm">{selectedNC.rootCauseAnalysis.why5}</p></div>}
                        </div>
                      )}
                      <div>
                        <Label>Root Cause</Label>
                        <p className="text-sm mt-1">{selectedNC.rootCauseAnalysis.rootCause}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Analysis Date</Label>
                          <p className="text-sm mt-1">{new Date(selectedNC.rootCauseAnalysis.analysisDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label>Analysed By</Label>
                          <p className="text-sm mt-1">{selectedNC.rootCauseAnalysis.analysedBy}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">No root cause analysis recorded. Identify the underlying cause of this nonconformity.</p>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="rca-method">Analysis Method *</Label>
                        <Select
                          value={rcaForm.method}
                          onValueChange={(value) => setRcaForm({ ...rcaForm, method: value as typeof rcaForm.method })}
                        >
                          <SelectTrigger id="rca-method" data-testid="select-rca-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5-Whys">5-Whys</SelectItem>
                            <SelectItem value="Fishbone">Fishbone Diagram</SelectItem>
                            <SelectItem value="Fault Tree">Fault Tree Analysis</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {rcaForm.method === "5-Whys" && (
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="why1">Why 1? *</Label>
                            <Input
                              id="why1"
                              data-testid="input-why1"
                              value={rcaForm.why1}
                              onChange={(e) => setRcaForm({ ...rcaForm, why1: e.target.value })}
                              placeholder="Why did this happen?"
                            />
                          </div>
                          <div>
                            <Label htmlFor="why2">Why 2?</Label>
                            <Input
                              id="why2"
                              data-testid="input-why2"
                              value={rcaForm.why2}
                              onChange={(e) => setRcaForm({ ...rcaForm, why2: e.target.value })}
                              placeholder="Why did that happen?"
                            />
                          </div>
                          <div>
                            <Label htmlFor="why3">Why 3?</Label>
                            <Input
                              id="why3"
                              data-testid="input-why3"
                              value={rcaForm.why3}
                              onChange={(e) => setRcaForm({ ...rcaForm, why3: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="why4">Why 4?</Label>
                            <Input
                              id="why4"
                              data-testid="input-why4"
                              value={rcaForm.why4}
                              onChange={(e) => setRcaForm({ ...rcaForm, why4: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="why5">Why 5?</Label>
                            <Input
                              id="why5"
                              data-testid="input-why5"
                              value={rcaForm.why5}
                              onChange={(e) => setRcaForm({ ...rcaForm, why5: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="root-cause">Root Cause *</Label>
                        <Textarea
                          id="root-cause"
                          data-testid="input-root-cause"
                          value={rcaForm.rootCause}
                          onChange={(e) => setRcaForm({ ...rcaForm, rootCause: e.target.value })}
                          placeholder="Identified root cause"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="rca-date">Analysis Date *</Label>
                          <Input
                            id="rca-date"
                            data-testid="input-rca-date"
                            type="date"
                            value={rcaForm.analysisDate}
                            onChange={(e) => setRcaForm({ ...rcaForm, analysisDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="rca-by">Analysed By *</Label>
                          <Input
                            id="rca-by"
                            data-testid="input-rca-by"
                            value={rcaForm.analysedBy}
                            onChange={(e) => setRcaForm({ ...rcaForm, analysedBy: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <Button data-testid="button-save-rca" onClick={handleAddRCA}>
                        Save RCA
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="capa" className="space-y-4">
                <div className="space-y-3">
                  {selectedNC.correctiveActions.length > 0 && (
                    <div className="space-y-2">
                      {selectedNC.correctiveActions.map((ca) => (
                        <Card key={ca.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-medium">{ca.action}</p>
                                <Badge variant={ca.status === "Completed" ? "default" : ca.status === "Overdue" ? "destructive" : "secondary"}>
                                  {ca.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <Label className="text-xs">Owner</Label>
                                  <p>{ca.owner}</p>
                                </div>
                                <div>
                                  <Label className="text-xs">Target Date</Label>
                                  <p>{new Date(ca.targetDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              {ca.completedDate && (
                                <div>
                                  <Label className="text-xs">Completed</Label>
                                  <p className="text-sm">{new Date(ca.completedDate).toLocaleDateString()}</p>
                                </div>
                              )}
                              {ca.status !== "Completed" && (
                                <Button
                                  size="sm"
                                  data-testid={`button-complete-ca-${ca.id}`}
                                  onClick={() => handleUpdateCA(ca.id, {
                                    status: "Completed",
                                    completedDate: new Date().toISOString().split('T')[0]
                                  })}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add Corrective Action</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ca-action">Action *</Label>
                        <Textarea
                          id="ca-action"
                          data-testid="input-ca-action"
                          value={caForm.action}
                          onChange={(e) => setCaForm({ ...caForm, action: e.target.value })}
                          placeholder="Describe the corrective action"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="ca-owner">Owner *</Label>
                          <Input
                            id="ca-owner"
                            data-testid="input-ca-owner"
                            value={caForm.owner}
                            onChange={(e) => setCaForm({ ...caForm, owner: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="ca-target">Target Date *</Label>
                          <Input
                            id="ca-target"
                            data-testid="input-ca-target"
                            type="date"
                            value={caForm.targetDate}
                            onChange={(e) => setCaForm({ ...caForm, targetDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button data-testid="button-add-ca" onClick={handleAddCA}>
                        Add Corrective Action
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="effectiveness" className="space-y-4">
                {selectedNC.effectivenessCheck ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Effectiveness Check</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Planned Date</Label>
                          <p className="text-sm mt-1">{selectedNC.effectivenessCheck.plannedDate ? new Date(selectedNC.effectivenessCheck.plannedDate).toLocaleDateString() : 'Not set'}</p>
                        </div>
                        <div>
                          <Label>Actual Date</Label>
                          <p className="text-sm mt-1">{selectedNC.effectivenessCheck.actualDate ? new Date(selectedNC.effectivenessCheck.actualDate).toLocaleDateString() : 'Pending'}</p>
                        </div>
                      </div>
                      {selectedNC.effectivenessCheck.checkedBy && (
                        <div>
                          <Label>Checked By</Label>
                          <p className="text-sm mt-1">{selectedNC.effectivenessCheck.checkedBy}</p>
                        </div>
                      )}
                      {selectedNC.effectivenessCheck.result && (
                        <div>
                          <Label>Result</Label>
                          <div className="mt-1">
                            <Badge variant={selectedNC.effectivenessCheck.result === "Effective" ? "default" : "secondary"}>
                              {selectedNC.effectivenessCheck.result}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {selectedNC.effectivenessCheck.comments && (
                        <div>
                          <Label>Comments</Label>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{selectedNC.effectivenessCheck.comments}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">No effectiveness check recorded. Verify that corrective actions have prevented recurrence.</p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="eff-planned">Planned Check Date</Label>
                          <Input
                            id="eff-planned"
                            data-testid="input-eff-planned"
                            type="date"
                            value={effectivenessForm.plannedDate}
                            onChange={(e) => setEffectivenessForm({ ...effectivenessForm, plannedDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="eff-actual">Actual Check Date *</Label>
                          <Input
                            id="eff-actual"
                            data-testid="input-eff-actual"
                            type="date"
                            value={effectivenessForm.actualDate}
                            onChange={(e) => setEffectivenessForm({ ...effectivenessForm, actualDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="eff-by">Checked By *</Label>
                        <Input
                          id="eff-by"
                          data-testid="input-eff-by"
                          value={effectivenessForm.checkedBy}
                          onChange={(e) => setEffectivenessForm({ ...effectivenessForm, checkedBy: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eff-result">Result *</Label>
                        <Select
                          value={effectivenessForm.result}
                          onValueChange={(value) => setEffectivenessForm({ ...effectivenessForm, result: value as typeof effectivenessForm.result })}
                        >
                          <SelectTrigger id="eff-result" data-testid="select-eff-result">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Effective">Effective</SelectItem>
                            <SelectItem value="Partially Effective">Partially Effective</SelectItem>
                            <SelectItem value="Not Effective">Not Effective</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="eff-comments">Comments</Label>
                        <Textarea
                          id="eff-comments"
                          data-testid="input-eff-comments"
                          value={effectivenessForm.comments}
                          onChange={(e) => setEffectivenessForm({ ...effectivenessForm, comments: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <Button data-testid="button-save-effectiveness" onClick={handleAddEffectiveness}>
                        Save Effectiveness Check
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
            
          {selectedNC && selectedNC.status !== 'Closed' && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  data-testid="button-close-nc"
                  onClick={handleCloseNC}
                  variant="default"
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Close Nonconformity
                </Button>
              </div>
            )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
