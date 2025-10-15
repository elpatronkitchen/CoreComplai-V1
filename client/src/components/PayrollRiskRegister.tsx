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

// Mock payroll risk data
const mockPayrollRisks: RiskEntry[] = [
  {
    id: 'PR001',
    riskId: 'PR001',
    title: 'Incorrect Salary Calculations',
    description: 'Risk of errors in salary calculations due to manual processes or system failures',
    category: 'Operational',
    impact: 'High',
    likelihood: 'Possible',
    riskRating: 'Medium-High',
    owner: 'Payroll Manager',
    assignedTo: 'John Payroll',
    status: 'Open',
    mitigationStrategies: [
      'Implement automated payroll system with validation checks',
      'Regular reconciliation of payroll data',
      'Dual approval process for payroll runs'
    ],
    controlMeasures: [
      'Monthly payroll audit',
      'System access controls',
      'Error reporting procedures'
    ],
    reviewDate: '2024-03-15',
    notes: 'High priority due to potential financial impact and employee satisfaction',
    registerType: 'Payroll',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
    createdBy: 'system',
    lastUpdatedBy: 'john.payroll'
  },
  {
    id: 'PR002',
    riskId: 'PR002',
    title: 'Non-compliance with Fair Work Act',
    description: 'Risk of breaching Fair Work Act requirements for minimum wages, overtime, and leave entitlements',
    category: 'Compliance',
    impact: 'Critical',
    likelihood: 'Possible',
    riskRating: 'High',
    owner: 'Compliance Officer',
    assignedTo: 'Sarah Compliance',
    status: 'In Progress',
    mitigationStrategies: [
      'Regular review of Fair Work Act updates',
      'Implementation of automated award interpretation',
      'Regular compliance audits'
    ],
    controlMeasures: [
      'Award interpretation system',
      'Regular compliance training',
      'External legal review'
    ],
    reviewDate: '2024-04-01',
    notes: 'Critical risk requiring immediate attention and ongoing monitoring',
    registerType: 'Payroll',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-20'),
    createdBy: 'system',
    lastUpdatedBy: 'sarah.compliance'
  },
  {
    id: 'PR003',
    riskId: 'PR003',
    title: 'Payroll Data Breach',
    description: 'Risk of unauthorized access to sensitive payroll information including personal and financial data',
    category: 'Technology',
    impact: 'Critical',
    likelihood: 'Unlikely',
    riskRating: 'Medium-High',
    owner: 'IT Security Manager',
    assignedTo: 'Mike Security',
    status: 'Mitigated',
    mitigationStrategies: [
      'Implementation of multi-factor authentication',
      'Regular security audits and penetration testing',
      'Employee security awareness training'
    ],
    controlMeasures: [
      'Encryption of payroll data',
      'Access control and monitoring',
      'Incident response procedures'
    ],
    reviewDate: '2024-06-01',
    notes: 'Controls implemented and tested. Regular monitoring required.',
    registerType: 'Payroll',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-25'),
    createdBy: 'system',
    lastUpdatedBy: 'mike.security'
  },
  {
    id: 'PR004',
    riskId: 'PR004',
    title: 'Superannuation Payment Delays',
    description: 'Risk of late or incorrect superannuation payments leading to regulatory penalties',
    category: 'Compliance',
    impact: 'Medium',
    likelihood: 'Possible',
    riskRating: 'Medium',
    owner: 'Payroll Officer',
    assignedTo: 'Lisa Payroll',
    status: 'Open',
    mitigationStrategies: [
      'Automated superannuation calculations',
      'Early payment scheduling',
      'Regular monitoring of payment deadlines'
    ],
    controlMeasures: [
      'Payment tracking system',
      'Deadline alerts and reminders',
      'Quarterly compliance reviews'
    ],
    reviewDate: '2024-05-15',
    notes: 'Monitoring required for quarterly superannuation guarantee periods',
    registerType: 'Payroll',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'system',
    lastUpdatedBy: 'lisa.payroll'
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
    case 'under review':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export default function PayrollRiskRegister() {
  const { currentUser } = useAppStore();
  const [risks, setRisks] = useState<RiskEntry[]>(mockPayrollRisks);
  const [selectedRisk, setSelectedRisk] = useState<RiskEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const canManageRisks = hasPermission(currentUser, 'manage_payroll_risks');
  const canViewRisks = hasPermission(currentUser, 'view_payroll_risks');

  if (!canViewRisks) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to view the payroll risk register.
          </p>
        </CardContent>
      </Card>
    );
  }

  const viewRisk = (risk: RiskEntry) => {
    setSelectedRisk(risk);
    setIsViewDialogOpen(true);
  };

  const editRisk = (risk: RiskEntry) => {
    setSelectedRisk(risk);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Risk Register</h2>
          <p className="text-muted-foreground">
            Manage and monitor payroll-related risks and their mitigation strategies
          </p>
        </div>
        {canManageRisks && (
          <Button data-testid="button-add-payroll-risk">
            <Plus className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
        )}
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{risks.length}</div>
            <p className="text-xs text-muted-foreground">Total Risks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {risks.filter(r => r.status === 'Open').length}
            </div>
            <p className="text-xs text-muted-foreground">Open Risks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {risks.filter(r => r.status === 'In Progress').length}
            </div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {risks.filter(r => r.status === 'Mitigated').length}
            </div>
            <p className="text-xs text-muted-foreground">Mitigated</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Entries</CardTitle>
        </CardHeader>
        <CardContent>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-medium">{risk.riskId}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{risk.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{risk.category}</Badge>
                  </TableCell>
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
                  <TableCell>{risk.owner}</TableCell>
                  <TableCell>{risk.reviewDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => viewRisk(risk)}
                        data-testid={`button-view-risk-${risk.riskId}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManageRisks && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => editRisk(risk)}
                            data-testid={`button-edit-risk-${risk.riskId}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-delete-risk-${risk.riskId}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm text-muted-foreground">{selectedRisk.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-muted-foreground">{selectedRisk.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Impact</label>
                  <Badge variant="outline">{selectedRisk.impact}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Likelihood</label>
                  <Badge variant="outline">{selectedRisk.likelihood}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Risk Rating</label>
                  <Badge variant={getRiskRatingColor(selectedRisk.riskRating)}>
                    {selectedRisk.riskRating}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={getStatusColor(selectedRisk.status)}>
                    {selectedRisk.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p className="text-sm text-muted-foreground">{selectedRisk.owner}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <p className="text-sm text-muted-foreground">{selectedRisk.assignedTo || 'Unassigned'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRisk.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Mitigation Strategies</label>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                  {selectedRisk.mitigationStrategies.map((strategy, index) => (
                    <li key={index}>{strategy}</li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="text-sm font-medium">Control Measures</label>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                  {selectedRisk.controlMeasures.map((measure, index) => (
                    <li key={index}>{measure}</li>
                  ))}
                </ul>
              </div>

              {selectedRisk.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRisk.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}