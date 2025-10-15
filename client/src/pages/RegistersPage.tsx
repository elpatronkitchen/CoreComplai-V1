import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, AlertTriangle, Download, Search, Filter, Eye, Edit, CheckCircle, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useObligationsStore, Obligation } from '@/store/obligationsSlice';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import PayrollRiskRegister from '@/components/PayrollRiskRegister';
import HRRiskRegister from '@/components/HRRiskRegister';
import FinanceRiskRegister from '@/components/FinanceRiskRegister';
import GovernanceRiskRegister from '@/components/GovernanceRiskRegister';
import AppShell from '@/components/AppShell';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Compliant':
      return <Badge variant="default" className="bg-green-600" data-testid={`badge-status-${status.toLowerCase()}`}><CheckCircle className="h-3 w-3 mr-1" />{status}</Badge>;
    case 'Gap':
      return <Badge variant="destructive" data-testid={`badge-status-${status.toLowerCase()}`}><AlertTriangle className="h-3 w-3 mr-1" />{status}</Badge>;
    case 'Pending':
      return <Badge variant="secondary" data-testid={`badge-status-${status.toLowerCase()}`}><Clock className="h-3 w-3 mr-1" />{status}</Badge>;
    default:
      return <Badge variant="outline" data-testid={`badge-status-${status.toLowerCase()}`}>{status}</Badge>;
  }
};

function ObligationsTab() {
  const { currentUser } = useAppStore();
  const { obligations, updateObligation, setStatus, linkEvidence } = useObligationsStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("All");
  const [controlRefFilter, setControlRefFilter] = useState("All");
  
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [editForm, setEditForm] = useState<Partial<Obligation>>({});
  const [newEvidenceLink, setNewEvidenceLink] = useState("");

  const canManage = hasPermission(currentUser, 'manage_frameworks');

  // Get unique values for filters
  const categories = ["All", ...Array.from(new Set(obligations.map(o => o.category)))];
  const jurisdictions = ["All", ...Array.from(new Set(obligations.map(o => o.jurisdiction)))];
  const controlRefs = ["All", ...Array.from(new Set(obligations.map(o => o.controlRef)))];
  const statuses = ["All", "Compliant", "Gap", "Pending"];

  // Filter obligations
  const filteredObligations = obligations.filter(obl => {
    const matchesSearch = 
      obl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obl.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || obl.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || obl.status === statusFilter;
    const matchesJurisdiction = jurisdictionFilter === "All" || obl.jurisdiction === jurisdictionFilter;
    const matchesControlRef = controlRefFilter === "All" || obl.controlRef === controlRefFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesJurisdiction && matchesControlRef;
  });

  // Summary stats
  const compliantCount = obligations.filter(o => o.status === 'Compliant').length;
  const gapCount = obligations.filter(o => o.status === 'Gap').length;
  const pendingCount = obligations.filter(o => o.status === 'Pending').length;

  const handleViewDetails = (obligation: Obligation) => {
    setSelectedObligation(obligation);
    setEditForm(obligation);
    setEditMode(false);
    setIsDetailOpen(true);
  };

  const handleEdit = () => {
    if (selectedObligation) {
      setEditForm(selectedObligation);
      setEditMode(true);
    }
  };

  const handleSave = () => {
    if (selectedObligation && editForm) {
      updateObligation(selectedObligation.id, editForm);
      setSelectedObligation({ ...selectedObligation, ...editForm });
      setEditMode(false);
    }
  };

  const handleStatusChange = (status: 'Compliant' | 'Gap' | 'Pending') => {
    if (selectedObligation && canManage) {
      setStatus(selectedObligation.id, status);
      setSelectedObligation({ ...selectedObligation, status });
      setEditForm({ ...editForm, status });
    }
  };

  const handleAddEvidenceLink = () => {
    if (selectedObligation && newEvidenceLink && canManage) {
      linkEvidence(selectedObligation.id, [], [newEvidenceLink]);
      const updatedObligation = {
        ...selectedObligation,
        evidenceLinks: [...(selectedObligation.evidenceLinks || []), newEvidenceLink]
      };
      setSelectedObligation(updatedObligation);
      setNewEvidenceLink("");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Obligation ID", "Category", "Title", "Description", "Source/Driver", "Jurisdiction",
      "Trigger/Frequency", "Responsible (R)", "Accountable (A)", "Support (S)", "Consulted (C)",
      "Informed (I)", "Evidence/Records Required", "APGF-MS Control Ref", "Status",
      "Last Reviewed", "Next Review Due", "Notes"
    ];
    
    const rows = filteredObligations.map(obl => [
      obl.id,
      obl.category,
      obl.title,
      obl.description,
      obl.source,
      obl.jurisdiction,
      obl.trigger,
      obl.roles.R,
      obl.roles.A,
      obl.roles.S,
      obl.roles.C,
      obl.roles.I,
      obl.evidence,
      obl.controlRef,
      obl.status,
      obl.lastReviewed || "",
      obl.nextReviewDue || "",
      obl.notes || ""
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'APGF-MS_Obligations_Register.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Obligations Register</h2>
          <p className="text-sm text-muted-foreground">
            Australian Payroll Governance Management System Framework (APGF-MS) - Compliance Obligations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Obligations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{obligations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{gapCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search obligations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-obligations"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jurisdiction</Label>
              <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
                <SelectTrigger data-testid="select-jurisdiction-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map(jur => (
                    <SelectItem key={jur} value={jur}>{jur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Control Ref</Label>
              <Select value={controlRefFilter} onValueChange={setControlRefFilter}>
                <SelectTrigger data-testid="select-controlref-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {controlRefs.map(ref => (
                    <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Obligations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Obligations</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {filteredObligations.length} of {obligations.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">ID</TableHead>
                  <TableHead className="w-40">Category</TableHead>
                  <TableHead className="min-w-80">Title</TableHead>
                  <TableHead className="w-32">Jurisdiction</TableHead>
                  <TableHead className="w-32">Control Ref</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObligations.map((obligation) => (
                  <TableRow key={obligation.id} data-testid={`row-obligation-${obligation.id}`}>
                    <TableCell className="font-mono text-xs">{obligation.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{obligation.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{obligation.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{obligation.jurisdiction}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        {obligation.controlRef}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(obligation.status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(obligation)}
                        data-testid={`button-view-${obligation.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedObligation && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle>{selectedObligation.title}</SheetTitle>
                    <SheetDescription className="font-mono text-xs mt-1">
                      {selectedObligation.id}
                    </SheetDescription>
                  </div>
                  {canManage && !editMode && (
                    <Button size="sm" variant="outline" onClick={handleEdit} data-testid="button-edit-obligation">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label>Category</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedObligation.category}</Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    {editMode ? (
                      <Textarea
                        value={editForm.description || ""}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        data-testid="textarea-description"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedObligation.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Source/Driver</Label>
                      <p className="text-sm mt-1">{selectedObligation.source}</p>
                    </div>
                    <div>
                      <Label>Jurisdiction</Label>
                      <div className="mt-1">
                        <Badge variant="secondary">{selectedObligation.jurisdiction}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Trigger/Frequency</Label>
                    <p className="text-sm mt-1">{selectedObligation.trigger}</p>
                  </div>

                  <div>
                    <Label>APGF-MS Control Reference</Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        {selectedObligation.controlRef}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Compliance Status</Label>
                  {canManage && editMode ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={editForm.status === 'Compliant' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange('Compliant')}
                        data-testid="button-status-compliant"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Compliant
                      </Button>
                      <Button
                        size="sm"
                        variant={editForm.status === 'Gap' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange('Gap')}
                        data-testid="button-status-gap"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Gap
                      </Button>
                      <Button
                        size="sm"
                        variant={editForm.status === 'Pending' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange('Pending')}
                        data-testid="button-status-pending"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                      </Button>
                    </div>
                  ) : (
                    <div>{getStatusBadge(selectedObligation.status)}</div>
                  )}
                </div>

                {/* RASCI Roles */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>RASCI Roles</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 w-6 text-center">R</Badge>
                      <span className="text-sm">{selectedObligation.roles.R}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600 w-6 text-center">A</Badge>
                      <span className="text-sm">{selectedObligation.roles.A}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 w-6 text-center">S</Badge>
                      <span className="text-sm">{selectedObligation.roles.S}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-600 w-6 text-center">C</Badge>
                      <span className="text-sm">{selectedObligation.roles.C}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-600 w-6 text-center">I</Badge>
                      <span className="text-sm">{selectedObligation.roles.I}</span>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Required Evidence/Records</Label>
                  <p className="text-sm">{selectedObligation.evidence}</p>
                </div>

                {editMode && canManage && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSave} data-testid="button-save-changes">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)} data-testid="button-cancel-edit">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RisksTab() {
  const { currentUser } = useAppStore();
  
  const canViewPayrollRisks = hasPermission(currentUser, 'view_payroll_risks');
  const canViewHRRisks = hasPermission(currentUser, 'view_hr_risks');
  const canViewFinanceRisks = hasPermission(currentUser, 'view_finance_risks');
  const canViewGovernanceRisks = hasPermission(currentUser, 'view_risk_registers');

  // Determine which tabs to show
  const availableTabs = [];
  if (canViewPayrollRisks) {
    availableTabs.push({ id: 'payroll', label: 'Payroll Risks', component: PayrollRiskRegister });
  }
  if (canViewHRRisks) {
    availableTabs.push({ id: 'hr', label: 'HR Risks', component: HRRiskRegister });
  }
  if (canViewFinanceRisks) {
    availableTabs.push({ id: 'finance', label: 'Finance Risks', component: FinanceRiskRegister });
  }
  if (canViewGovernanceRisks) {
    availableTabs.push({ id: 'governance', label: 'Executive & Board', component: GovernanceRiskRegister });
  }

  // Default to first available tab
  const defaultTab = availableTabs[0]?.id || 'payroll';

  // If only one tab is available, don't show sub-tabs
  if (availableTabs.length === 1) {
    const SingleComponent = availableTabs[0].component;
    return <SingleComponent />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Risk Registers</h2>
        <p className="text-sm text-muted-foreground">
          Identify, assess, and manage compliance and operational risks
        </p>
      </div>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl gap-2" style={{gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))`}}>
          {availableTabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              data-testid={`tab-${tab.id}-risks`}
              className="px-6"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {availableTabs.map((tab) => {
          const TabComponent = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <TabComponent />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export default function RegistersPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Registers</h1>
          <p className="text-muted-foreground mt-1">
            Manage compliance obligations and risk registers
          </p>
        </div>

        <Tabs defaultValue="obligations" className="w-full">
          <TabsList data-testid="tabs-registers">
            <TabsTrigger value="obligations" data-testid="tab-obligations">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Obligations
            </TabsTrigger>
            <TabsTrigger value="risks" data-testid="tab-risks">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="obligations" className="mt-6">
            <ObligationsTab />
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <RisksTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
