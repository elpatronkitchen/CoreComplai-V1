import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useSuppliersStore, Supplier, SupplierEvaluation, EvaluationCriteria } from "@/store/suppliersSlice";
import { useAppStore } from "@/lib/store";
import { hasPermission } from "@/lib/permissions";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Star,
  Calendar,
  Filter,
} from "lucide-react";

const getStatusBadge = (status: Supplier['status']) => {
  switch (status) {
    case 'Approved':
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'Conditional':
      return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Conditional</Badge>;
    case 'Suspended':
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
    case 'Under Evaluation':
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Under Evaluation</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeIcon = (type: Supplier['type']) => {
  return <Package className="h-4 w-4 mr-1" />;
};

export default function SuppliersPage() {
  const { currentUser } = useAppStore();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, addEvaluation, getSupplierById } = useSuppliersStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [criticalFilter, setCriticalFilter] = useState<"All" | "Critical" | "Standard">("All");
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({
    name: "",
    type: "Service",
    status: "Under Evaluation",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    products: [],
    criticalSupplier: false,
    linkedControls: [],
    linkedObligations: [],
    notes: "",
  });
  
  const [productInput, setProductInput] = useState("");
  
  const [evaluationForm, setEvaluationForm] = useState<{
    evaluationDate: string;
    evaluator: string;
    criteria: EvaluationCriteria[];
    recommendation: SupplierEvaluation['recommendation'];
    comments: string;
    nextReviewDate: string;
  }>({
    evaluationDate: new Date().toISOString().split('T')[0],
    evaluator: currentUser?.name || "",
    criteria: [
      { criterion: "Quality", weight: 30, score: 0, comments: "" },
      { criterion: "Delivery Performance", weight: 25, score: 0, comments: "" },
      { criterion: "Price Competitiveness", weight: 20, score: 0, comments: "" },
      { criterion: "Responsiveness", weight: 15, score: 0, comments: "" },
      { criterion: "Compliance", weight: 10, score: 0, comments: "" },
    ],
    recommendation: "Approve",
    comments: "",
    nextReviewDate: "",
  });

  const canManage = hasPermission(currentUser, 'manage_frameworks');
  const canView = hasPermission(currentUser, 'view_frameworks');

  if (!canView) {
    return (
      <AppShell>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view suppliers. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(sup => {
    const matchesSearch = 
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sup.contactPerson && sup.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "All" || sup.type === typeFilter;
    const matchesStatus = statusFilter === "All" || sup.status === statusFilter;
    const matchesCritical = criticalFilter === "All" || 
      (criticalFilter === "Critical" && sup.criticalSupplier) ||
      (criticalFilter === "Standard" && !sup.criticalSupplier);
    
    return matchesSearch && matchesType && matchesStatus && matchesCritical;
  });

  // Summary stats
  const approvedCount = suppliers.filter(s => s.status === 'Approved').length;
  const criticalCount = suppliers.filter(s => s.criticalSupplier).length;
  const dueForReEval = suppliers.filter(s => {
    if (!s.nextReEvaluationDate) return false;
    const dueDate = new Date(s.nextReEvaluationDate);
    const today = new Date();
    const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil >= 0;
  }).length;

  const suppliersWithScores = suppliers.filter(s => s.evaluationScore !== undefined);
  const avgEvaluationScore = suppliersWithScores.length > 0
    ? suppliersWithScores.reduce((sum, s) => sum + (s.evaluationScore || 0), 0) / suppliersWithScores.length
    : 0;

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailOpen(true);
  };

  const handleAddNew = () => {
    setEditMode(false);
    setSupplierForm({
      name: "",
      type: "Service",
      status: "Under Evaluation",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      products: [],
      criticalSupplier: false,
      linkedControls: [],
      linkedObligations: [],
      notes: "",
    });
    setProductInput("");
    setIsAddEditOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditMode(true);
    setSupplierForm(supplier);
    setProductInput("");
    setIsAddEditOpen(true);
  };

  const handleSaveSupplier = () => {
    if (!supplierForm.name?.trim()) {
      alert("Please enter a supplier name");
      return;
    }
    
    if (!supplierForm.type) {
      alert("Please select a supplier type");
      return;
    }
    
    if (!supplierForm.contactPerson?.trim()) {
      alert("Please enter a contact person");
      return;
    }
    
    if (!supplierForm.email?.trim()) {
      alert("Please enter an email address");
      return;
    }
    
    if (!supplierForm.products || supplierForm.products.length === 0) {
      alert("Please add at least one product or service");
      return;
    }

    if (editMode && supplierForm.id) {
      updateSupplier(supplierForm.id, supplierForm);
    } else {
      addSupplier(supplierForm as Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'evaluations'>);
    }
    
    setIsAddEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplier(id);
      if (selectedSupplier?.id === id) {
        setIsDetailOpen(false);
      }
    }
  };

  const handleAddProduct = () => {
    if (productInput.trim() && supplierForm.products) {
      setSupplierForm({
        ...supplierForm,
        products: [...supplierForm.products, productInput.trim()],
      });
      setProductInput("");
    }
  };

  const handleRemoveProduct = (index: number) => {
    if (supplierForm.products) {
      setSupplierForm({
        ...supplierForm,
        products: supplierForm.products.filter((_, i) => i !== index),
      });
    }
  };

  const handleAddEvaluation = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEvaluationForm({
      evaluationDate: new Date().toISOString().split('T')[0],
      evaluator: currentUser?.name || "",
      criteria: [
        { criterion: "Quality", weight: 30, score: 0, comments: "" },
        { criterion: "Delivery Performance", weight: 25, score: 0, comments: "" },
        { criterion: "Price Competitiveness", weight: 20, score: 0, comments: "" },
        { criterion: "Responsiveness", weight: 15, score: 0, comments: "" },
        { criterion: "Compliance", weight: 10, score: 0, comments: "" },
      ],
      recommendation: "Approve",
      comments: "",
      nextReviewDate: "",
    });
    setIsEvaluationOpen(true);
  };

  const handleSaveEvaluation = () => {
    if (!selectedSupplier) return;

    if (!evaluationForm.evaluator?.trim()) {
      alert("Please enter evaluator name");
      return;
    }

    const totalWeight = evaluationForm.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      alert("Evaluation criteria weights must total 100%");
      return;
    }

    const overallScore = evaluationForm.criteria.reduce((sum, c) => 
      sum + (c.score * c.weight / 100), 0
    );

    let nextReviewDate = evaluationForm.nextReviewDate;
    
    if (!nextReviewDate) {
      const evalDate = new Date(evaluationForm.evaluationDate);
      const monthsToAdd = selectedSupplier.criticalSupplier ? 6 : 12;
      evalDate.setMonth(evalDate.getMonth() + monthsToAdd);
      nextReviewDate = evalDate.toISOString().split('T')[0];
    }

    addEvaluation(selectedSupplier.id, {
      evaluationDate: evaluationForm.evaluationDate,
      evaluator: evaluationForm.evaluator,
      criteria: evaluationForm.criteria,
      overallScore,
      recommendation: evaluationForm.recommendation,
      comments: evaluationForm.comments,
      nextReviewDate,
    });

    setIsEvaluationOpen(false);
    setIsDetailOpen(false);
  };

  const updateCriterion = (index: number, field: keyof EvaluationCriteria, value: any) => {
    const newCriteria = [...evaluationForm.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setEvaluationForm({ ...evaluationForm, criteria: newCriteria });
  };

  const totalWeight = evaluationForm.criteria.reduce((sum, c) => sum + c.weight, 0);
  const calculatedScore = evaluationForm.criteria.reduce((sum, c) => 
    sum + (c.score * c.weight / 100), 0
  );

  return (
    <AppShell>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-suppliers">Supplier Management</h1>
            <p className="text-muted-foreground">ISO 9001:2015 Clause 8.4 - Control of Externally Provided Processes, Products and Services</p>
          </div>
          {canManage && (
            <Button onClick={handleAddNew} data-testid="button-add-supplier">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-suppliers">{suppliers.length}</div>
              <p className="text-xs text-muted-foreground">{approvedCount} approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium">Critical Suppliers</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-critical-suppliers">{criticalCount}</div>
              <p className="text-xs text-muted-foreground">Require close monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium">Due for Re-evaluation</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-due-reeval">{dueForReEval}</div>
              <p className="text-xs text-muted-foreground">Within next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-score">{avgEvaluationScore.toFixed(1)}/100</div>
              <p className="text-xs text-muted-foreground">Overall evaluation score</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter" data-testid="select-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Conditional">Conditional</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Under Evaluation">Under Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="critical-filter">Criticality</Label>
                <Select value={criticalFilter} onValueChange={(v) => setCriticalFilter(v as any)}>
                  <SelectTrigger id="critical-filter" data-testid="select-critical-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Critical">Critical Only</SelectItem>
                    <SelectItem value="Standard">Standard Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Supplier List</CardTitle>
            <CardDescription>
              {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Next Re-eval</TableHead>
                  <TableHead>Critical</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} data-testid={`row-supplier-${supplier.id}`}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeIcon(supplier.type)}
                          {supplier.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>
                        {supplier.evaluationScore ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{supplier.evaluationScore.toFixed(0)}/100</span>
                            <Progress value={supplier.evaluationScore} className="w-16 h-2" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not evaluated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {supplier.nextReEvaluationDate ? (
                          <span className={
                            new Date(supplier.nextReEvaluationDate) < new Date()
                              ? "text-red-600"
                              : new Date(supplier.nextReEvaluationDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
                              ? "text-orange-600"
                              : ""
                          }>
                            {supplier.nextReEvaluationDate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {supplier.criticalSupplier ? (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Standard</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(supplier)}
                            data-testid={`button-view-${supplier.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAddEvaluation(supplier)}
                                data-testid={`button-evaluate-${supplier.id}`}
                              >
                                <ClipboardCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(supplier)}
                                data-testid={`button-edit-${supplier.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(supplier.id)}
                                data-testid={`button-delete-${supplier.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Sheet */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Supplier Details</SheetTitle>
              <SheetDescription>
                View supplier information and evaluation history
              </SheetDescription>
            </SheetHeader>

            {selectedSupplier && (
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSupplier.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(selectedSupplier.status)}
                      <Badge variant="outline">{selectedSupplier.type}</Badge>
                      {selectedSupplier.criticalSupplier && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Critical
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Contact Person</Label>
                      <p className="font-medium">{selectedSupplier.contactPerson || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedSupplier.email || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedSupplier.phone || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Approval Date</Label>
                      <p className="font-medium">{selectedSupplier.approvalDate || "Not approved"}</p>
                    </div>
                  </div>

                  {selectedSupplier.address && (
                    <div>
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium">{selectedSupplier.address}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-muted-foreground">Products/Services</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSupplier.products.map((product, idx) => (
                        <Badge key={idx} variant="secondary">{product}</Badge>
                      ))}
                    </div>
                  </div>

                  {selectedSupplier.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm">{selectedSupplier.notes}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Evaluation History</h4>
                    {canManage && (
                      <Button
                        size="sm"
                        onClick={() => handleAddEvaluation(selectedSupplier)}
                        data-testid="button-add-evaluation-detail"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Evaluation
                      </Button>
                    )}
                  </div>

                  {selectedSupplier.evaluations.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No evaluations recorded</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedSupplier.evaluations.map((evaluation) => (
                        <Card key={evaluation.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">
                                Evaluation - {evaluation.evaluationDate}
                              </CardTitle>
                              <Badge variant="secondary">
                                Score: {evaluation.overallScore.toFixed(0)}/100
                              </Badge>
                            </div>
                            <CardDescription>
                              Evaluated by {evaluation.evaluator}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Recommendation</Label>
                              <p className="font-medium">{evaluation.recommendation}</p>
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">Criteria Scores</Label>
                              <div className="space-y-2 mt-2">
                                {evaluation.criteria.map((criterion, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span>{criterion.criterion}</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={criterion.score} className="w-20 h-2" />
                                      <span className="font-medium w-10 text-right">{criterion.score}/100</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {evaluation.comments && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Comments</Label>
                                <p className="text-sm">{evaluation.comments}</p>
                              </div>
                            )}

                            {evaluation.nextReviewDate && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Next Review</Label>
                                <p className="text-sm">{evaluation.nextReviewDate}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editMode ? "Update supplier information" : "Add a new supplier to the approved list"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="Enter supplier name"
                    data-testid="input-supplier-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={supplierForm.type}
                    onValueChange={(value: Supplier['type']) => setSupplierForm({ ...supplierForm, type: value })}
                  >
                    <SelectTrigger id="type" data-testid="select-supplier-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={supplierForm.status}
                    onValueChange={(value: Supplier['status']) => setSupplierForm({ ...supplierForm, status: value })}
                  >
                    <SelectTrigger id="status" data-testid="select-supplier-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Conditional">Conditional</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Under Evaluation">Under Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input
                    id="contact"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    placeholder="Contact name"
                    data-testid="input-contact-person"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="email@example.com"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="Phone number"
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    placeholder="Full address"
                    rows={2}
                    data-testid="input-address"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Products/Services Provided</Label>
                  <div className="flex gap-2">
                    <Input
                      value={productInput}
                      onChange={(e) => setProductInput(e.target.value)}
                      placeholder="Add product or service"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProduct())}
                      data-testid="input-product"
                    />
                    <Button type="button" onClick={handleAddProduct} data-testid="button-add-product">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {supplierForm.products?.map((product, idx) => (
                      <Badge key={idx} variant="secondary">
                        {product}
                        <button
                          className="ml-2 hover:text-destructive"
                          onClick={() => handleRemoveProduct(idx)}
                          data-testid={`button-remove-product-${idx}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="critical"
                      checked={supplierForm.criticalSupplier}
                      onCheckedChange={(checked) => 
                        setSupplierForm({ ...supplierForm, criticalSupplier: checked as boolean })
                      }
                      data-testid="checkbox-critical"
                    />
                    <Label htmlFor="critical" className="cursor-pointer">
                      Mark as Critical Supplier (requires re-evaluation every 6 months)
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={supplierForm.notes}
                    onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    data-testid="input-notes"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEditOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleSaveSupplier} data-testid="button-save-supplier">
                {editMode ? "Update" : "Add"} Supplier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Evaluation Dialog */}
        <Dialog open={isEvaluationOpen} onOpenChange={setIsEvaluationOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Supplier Evaluation</DialogTitle>
              <DialogDescription>
                Evaluate {selectedSupplier?.name} against defined criteria
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eval-date">Evaluation Date *</Label>
                  <Input
                    id="eval-date"
                    type="date"
                    value={evaluationForm.evaluationDate}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluationDate: e.target.value })}
                    data-testid="input-eval-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evaluator">Evaluator *</Label>
                  <Input
                    id="evaluator"
                    value={evaluationForm.evaluator}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluator: e.target.value })}
                    data-testid="input-evaluator"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Evaluation Criteria</Label>
                  <div className="text-sm">
                    Total Weight: <span className={totalWeight === 100 ? "text-green-600" : "text-red-600"}>{totalWeight}%</span>
                  </div>
                </div>

                {evaluationForm.criteria.map((criterion, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{criterion.criterion}</h4>
                        <Badge variant="outline">Weight: {criterion.weight}%</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Score (0-100)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={criterion.score}
                            onChange={(e) => updateCriterion(idx, 'score', parseInt(e.target.value) || 0)}
                            data-testid={`input-score-${idx}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Weight (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={criterion.weight}
                            onChange={(e) => updateCriterion(idx, 'weight', parseInt(e.target.value) || 0)}
                            data-testid={`input-weight-${idx}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Comments</Label>
                        <Textarea
                          value={criterion.comments}
                          onChange={(e) => updateCriterion(idx, 'comments', e.target.value)}
                          placeholder="Notes for this criterion..."
                          rows={2}
                          data-testid={`input-criterion-comments-${idx}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>Overall Score</Label>
                  <span className="text-2xl font-bold">{calculatedScore.toFixed(1)}/100</span>
                </div>
                <Progress value={calculatedScore} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recommendation">Recommendation *</Label>
                  <Select
                    value={evaluationForm.recommendation}
                    onValueChange={(value: SupplierEvaluation['recommendation']) => 
                      setEvaluationForm({ ...evaluationForm, recommendation: value })
                    }
                  >
                    <SelectTrigger id="recommendation" data-testid="select-recommendation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approve">Approve</SelectItem>
                      <SelectItem value="Conditional Approval">Conditional Approval</SelectItem>
                      <SelectItem value="Reject">Reject</SelectItem>
                      <SelectItem value="Re-evaluate">Re-evaluate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next-review">Next Review Date</Label>
                  <Input
                    id="next-review"
                    type="date"
                    value={evaluationForm.nextReviewDate}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, nextReviewDate: e.target.value })}
                    data-testid="input-next-review"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to auto-calculate based on criticality
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eval-comments">Overall Comments</Label>
                <Textarea
                  id="eval-comments"
                  value={evaluationForm.comments}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, comments: e.target.value })}
                  placeholder="Summary comments for this evaluation..."
                  rows={4}
                  data-testid="input-eval-comments"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEvaluationOpen(false)} data-testid="button-cancel-eval">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEvaluation}
                disabled={totalWeight !== 100}
                data-testid="button-save-eval"
              >
                Save Evaluation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
