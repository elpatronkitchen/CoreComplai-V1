import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Plus, Eye, Edit, Trash2, Calendar, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import type { RiskEntry, RiskImpact, RiskLikelihood, RiskStatus, RiskCategory } from '@shared/schema';

// Mock finance risk data
const mockFinanceRisks: RiskEntry[] = [
  {
    id: 'FN001',
    riskId: 'FN001',
    title: 'Cash Flow Management',
    description: 'Risk of inadequate cash flow management leading to liquidity issues and inability to meet financial obligations',
    category: 'Financial',
    impact: 'Critical',
    likelihood: 'Possible',
    riskRating: 'High',
    owner: 'Finance Manager',
    assignedTo: 'Emma Finance',
    status: 'In Progress',
    mitigationStrategies: [
      'Implement comprehensive cash flow forecasting',
      'Establish credit facilities and backup funding sources',
      'Regular monitoring of accounts receivable and payable',
      'Maintain appropriate cash reserves'
    ],
    controlMeasures: [
      'Daily cash position reporting',
      'Weekly cash flow forecasts',
      'Monthly financial reporting',
      'Quarterly budget reviews'
    ],
    reviewDate: '2024-04-15',
    notes: 'Critical for business continuity. Monthly reviews required.',
    registerType: 'Finance',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'system',
    lastUpdatedBy: 'emma.finance'
  },
  {
    id: 'FN002',
    riskId: 'FN002',
    title: 'Foreign Exchange Rate Fluctuations',
    description: 'Risk of adverse foreign exchange rate movements affecting international transactions and financial performance',
    category: 'Financial',
    impact: 'Medium',
    likelihood: 'Likely',
    riskRating: 'Medium-High',
    owner: 'Treasury Manager',
    assignedTo: 'David Treasury',
    status: 'Open',
    mitigationStrategies: [
      'Implement hedging strategies for major exposures',
      'Natural hedging through operational adjustments',
      'Regular monitoring of exchange rate movements',
      'Use of forward contracts and options'
    ],
    controlMeasures: [
      'Monthly FX exposure reporting',
      'Hedging committee reviews',
      'FX risk policy compliance',
      'Regular market analysis'
    ],
    reviewDate: '2024-03-30',
    notes: 'Quarterly hedge effectiveness testing required',
    registerType: 'Finance',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
    createdBy: 'system',
    lastUpdatedBy: 'david.treasury'
  },
  {
    id: 'FN003',
    riskId: 'FN003',
    title: 'Credit Risk - Customer Defaults',
    description: 'Risk of customer defaults leading to bad debts and impact on cash flow and profitability',
    category: 'Financial',
    impact: 'High',
    likelihood: 'Possible',
    riskRating: 'Medium-High',
    owner: 'Credit Manager',
    assignedTo: 'Sarah Credit',
    status: 'Open',
    mitigationStrategies: [
      'Comprehensive credit assessment procedures',
      'Regular review of customer credit limits',
      'Diversification of customer base',
      'Credit insurance for major exposures'
    ],
    controlMeasures: [
      'Credit scoring system',
      'Regular aged debtors analysis',
      'Credit committee approvals',
      'Bad debt provisioning'
    ],
    reviewDate: '2024-05-01',
    notes: 'Focus on large exposure customers. Regular monitoring required.',
    registerType: 'Finance',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-20'),
    createdBy: 'system',
    lastUpdatedBy: 'sarah.credit'
  },
  {
    id: 'FN004',
    riskId: 'FN004',
    title: 'Financial Reporting Errors',
    description: 'Risk of material errors in financial statements leading to regulatory issues and stakeholder concerns',
    category: 'Compliance',
    impact: 'High',
    likelihood: 'Unlikely',
    riskRating: 'Medium',
    owner: 'Financial Controller',
    assignedTo: 'Michael Controller',
    status: 'Mitigated',
    mitigationStrategies: [
      'Implementation of robust month-end procedures',
      'Independent review and approval processes',
      'Regular reconciliations and variance analysis',
      'External audit firm engagement'
    ],
    controlMeasures: [
      'Monthly financial close procedures',
      'Independent review checklist',
      'Management review meetings',
      'External audit recommendations'
    ],
    reviewDate: '2024-06-30',
    notes: 'Strong controls in place. Annual external audit planned.',
    registerType: 'Finance',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-02-25'),
    createdBy: 'system',
    lastUpdatedBy: 'michael.controller'
  },
  {
    id: 'FN005',
    riskId: 'FN005',
    title: 'Tax Compliance Risk',
    description: 'Risk of non-compliance with tax obligations leading to penalties, interest, and reputational damage',
    category: 'Compliance',
    impact: 'Medium',
    likelihood: 'Possible',
    riskRating: 'Medium',
    owner: 'Tax Manager',
    assignedTo: 'Lisa Tax',
    status: 'In Progress',
    mitigationStrategies: [
      'Regular review of tax law changes',
      'External tax advisor consultation',
      'Comprehensive tax compliance calendar',
      'Regular training for finance staff'
    ],
    controlMeasures: [
      'Tax compliance checklist',
      'Monthly tax accrual reviews',
      'Quarterly tax advisor meetings',
      'Annual tax health check'
    ],
    reviewDate: '2024-04-30',
    notes: 'GST and income tax focus areas. BAS lodgments on track.',
    registerType: 'Finance',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-05'),
    createdBy: 'system',
    lastUpdatedBy: 'lisa.tax'
  }
];

function getRiskRatingColor(rating: string) {
  switch (rating.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'medium-high':
    case 'medium':
      return 'secondary';
    case 'low':
    case 'medium-low':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'open':
      return 'destructive';
    case 'in progress':
      return 'secondary';
    case 'mitigated':
      return 'default';
    case 'closed':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default function FinanceRiskRegister() {
  const { currentUser } = useAppStore();
  const [risks, setRisks] = useState<RiskEntry[]>(mockFinanceRisks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const canManage = hasPermission(currentUser, 'manage_finance_risks');
  const canView = hasPermission(currentUser, 'view_finance_risks');

  if (!canView) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to view finance risks.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredRisks = risks.filter(risk =>
    risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.riskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.mitigationStrategies.some(strategy => strategy.toLowerCase().includes(searchTerm.toLowerCase())) ||
    risk.controlMeasures.some(control => control.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (risk.notes && risk.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
    risk.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (risk.assignedTo && risk.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddRisk = (newRiskData: Partial<RiskEntry>) => {
    const newRisk: RiskEntry = {
      id: `FN${String(risks.length + 1).padStart(3, '0')}`,
      riskId: `FN${String(risks.length + 1).padStart(3, '0')}`,
      title: newRiskData.title || '',
      description: newRiskData.description || '',
      category: (newRiskData.category as any) || 'Financial',
      impact: (newRiskData.impact as any) || 'Medium',
      likelihood: (newRiskData.likelihood as any) || 'Possible',
      riskRating: newRiskData.riskRating || 'Medium',
      owner: newRiskData.owner || '',
      assignedTo: newRiskData.assignedTo || '',
      status: (newRiskData.status as any) || 'Open',
      mitigationStrategies: newRiskData.mitigationStrategies || [],
      controlMeasures: newRiskData.controlMeasures || [],
      reviewDate: newRiskData.reviewDate,
      notes: newRiskData.notes,
      registerType: 'Finance',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser?.email || 'unknown',
      lastUpdatedBy: currentUser?.email || 'unknown'
    };
    setRisks([...risks, newRisk]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateRisk = (updatedRisk: RiskEntry) => {
    setRisks(risks.map(risk => 
      risk.id === updatedRisk.id 
        ? { ...updatedRisk, updatedAt: new Date(), lastUpdatedBy: currentUser?.email || 'unknown' }
        : risk
    ));
    setIsEditDialogOpen(false);
    setSelectedRisk(null);
  };

  const handleDeleteRisk = (riskId: string) => {
    setRisks(risks.filter(risk => risk.id !== riskId));
  };

  // Summary stats
  const totalRisks = risks.length;
  const openRisks = risks.filter(r => r.status === 'Open').length;
  const inProgressRisks = risks.filter(r => r.status === 'In Progress').length;
  const mitigatedRisks = risks.filter(r => r.status === 'Mitigated').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-finance-risks-title">Finance Risks</h2>
          <p className="text-muted-foreground mt-1">
            Financial Risk Register
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRisks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openRisks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inProgressRisks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mitigatedRisks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Entries Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Entries
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor and manage financial risks across the organization
              </p>
            </div>
            {canManage && (
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-finance-risk">
                <Plus className="w-4 h-4 mr-2" />
                Add Risk
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search risks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="input-search-finance-risks"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Risk Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks.map((risk) => (
                  <TableRow key={risk.id} data-testid={`row-finance-risk-${risk.id}`}>
                    <TableCell className="font-medium">{risk.riskId}</TableCell>
                    <TableCell>{risk.title}</TableCell>
                    <TableCell>{risk.category}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskRatingColor(risk.riskRating)}>
                        {risk.riskRating}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(risk.status)}>
                        {risk.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {risk.owner}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {risk.reviewDate || 'Not set'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRisk(risk);
                            setIsViewDialogOpen(true);
                          }}
                          data-testid={`button-view-finance-risk-${risk.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRisk(risk);
                                setIsEditDialogOpen(true);
                              }}
                              data-testid={`button-edit-finance-risk-${risk.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRisk(risk.id)}
                              data-testid={`button-delete-finance-risk-${risk.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRisks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No finance risks found.</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search terms.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Risk Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Risk Details - {selectedRisk?.riskId}</DialogTitle>
          </DialogHeader>
          {selectedRisk && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedRisk.title}</div>
                    <div><strong>Category:</strong> {selectedRisk.category}</div>
                    <div><strong>Owner:</strong> {selectedRisk.owner}</div>
                    <div><strong>Assigned To:</strong> {selectedRisk.assignedTo}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Impact:</strong> {selectedRisk.impact}</div>
                    <div><strong>Likelihood:</strong> {selectedRisk.likelihood}</div>
                    <div><strong>Risk Rating:</strong> 
                      <Badge variant={getRiskRatingColor(selectedRisk.riskRating)} className="ml-2">
                        {selectedRisk.riskRating}
                      </Badge>
                    </div>
                    <div><strong>Status:</strong>
                      <Badge variant={getStatusColor(selectedRisk.status)} className="ml-2">
                        {selectedRisk.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Mitigation Strategies</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedRisk.mitigationStrategies.map((strategy, index) => (
                    <li key={index}>{strategy}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Control Measures</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedRisk.controlMeasures.map((control, index) => (
                    <li key={index}>{control}</li>
                  ))}
                </ul>
              </div>

              {selectedRisk.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedRisk.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Risk Dialogs would go here - simplified for now */}
    </div>
  );
}