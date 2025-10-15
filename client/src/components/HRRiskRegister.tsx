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

// Mock HR risk data
const mockHRRisks: RiskEntry[] = [
  {
    id: 'HR001',
    riskId: 'HR001',
    title: 'Workplace Harassment and Discrimination',
    description: 'Risk of workplace harassment or discrimination claims leading to legal action and reputational damage',
    category: 'Legal',
    impact: 'Critical',
    likelihood: 'Possible',
    riskRating: 'High',
    owner: 'HR Manager',
    assignedTo: 'Emma HR',
    status: 'In Progress',
    mitigationStrategies: [
      'Comprehensive anti-harassment policy and training',
      'Anonymous reporting system',
      'Regular workplace culture surveys',
      'Swift investigation procedures'
    ],
    controlMeasures: [
      'Annual harassment prevention training',
      'Confidential reporting hotline',
      'Regular policy reviews',
      'Third-party investigation services'
    ],
    reviewDate: '2024-03-30',
    notes: 'High priority - ongoing training program implementation required',
    registerType: 'HR',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'system',
    lastUpdatedBy: 'emma.hr'
  },
  {
    id: 'HR002',
    riskId: 'HR002',
    title: 'Non-compliance with Employment Law',
    description: 'Risk of breaching employment laws regarding contracts, terminations, and employee rights',
    category: 'Compliance',
    impact: 'High',
    likelihood: 'Possible',
    riskRating: 'Medium-High',
    owner: 'Legal Counsel',
    assignedTo: 'David Legal',
    status: 'Open',
    mitigationStrategies: [
      'Regular employment law training for HR staff',
      'Legal review of all employment contracts',
      'Standardized termination procedures',
      'External legal counsel on retainer'
    ],
    controlMeasures: [
      'Contract template reviews',
      'Termination checklist procedures',
      'Regular legal updates briefings',
      'Employment law compliance audits'
    ],
    reviewDate: '2024-04-15',
    notes: 'Requires immediate attention due to recent changes in employment legislation',
    registerType: 'HR',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-10'),
    createdBy: 'system',
    lastUpdatedBy: 'david.legal'
  },
  {
    id: 'HR003',
    riskId: 'HR003',
    title: 'High Employee Turnover',
    description: 'Risk of excessive employee turnover leading to increased recruitment costs and knowledge loss',
    category: 'Operational',
    impact: 'Medium',
    likelihood: 'Likely',
    riskRating: 'Medium-High',
    owner: 'HR Director',
    assignedTo: 'Sarah Recruitment',
    status: 'Under Review',
    mitigationStrategies: [
      'Enhanced employee engagement programs',
      'Competitive compensation reviews',
      'Career development opportunities',
      'Improved onboarding processes'
    ],
    controlMeasures: [
      'Monthly turnover analytics',
      'Exit interview analysis',
      'Employee satisfaction surveys',
      'Retention bonus programs'
    ],
    reviewDate: '2024-05-01',
    notes: 'Currently analyzing turnover trends and implementing retention strategies',
    registerType: 'HR',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-20'),
    createdBy: 'system',
    lastUpdatedBy: 'sarah.recruitment'
  },
  {
    id: 'HR004',
    riskId: 'HR004',
    title: 'Data Privacy Breaches (Employee Records)',
    description: 'Risk of unauthorized access to employee personal information and confidential HR records',
    category: 'Technology',
    impact: 'High',
    likelihood: 'Unlikely',
    riskRating: 'Medium',
    owner: 'Data Protection Officer',
    assignedTo: 'Mike Security',
    status: 'Mitigated',
    mitigationStrategies: [
      'Implementation of role-based access controls',
      'Regular security training for HR staff',
      'Data encryption and secure storage',
      'Privacy impact assessments'
    ],
    controlMeasures: [
      'Access logging and monitoring',
      'Regular security audits',
      'Data retention policies',
      'Incident response procedures'
    ],
    reviewDate: '2024-06-01',
    notes: 'Controls implemented successfully. Regular monitoring and training ongoing.',
    registerType: 'HR',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-25'),
    createdBy: 'system',
    lastUpdatedBy: 'mike.security'
  },
  {
    id: 'HR005',
    riskId: 'HR005',
    title: 'Inadequate Performance Management',
    description: 'Risk of poor performance management leading to unfair dismissal claims and reduced productivity',
    category: 'Operational',
    impact: 'Medium',
    likelihood: 'Possible',
    riskRating: 'Medium',
    owner: 'HR Manager',
    assignedTo: 'Lisa Performance',
    status: 'Open',
    mitigationStrategies: [
      'Standardized performance review processes',
      'Manager training on performance discussions',
      'Clear performance improvement plans',
      'Regular check-in procedures'
    ],
    controlMeasures: [
      'Performance review templates',
      'Manager training programs',
      'Performance metrics tracking',
      'Legal review of improvement plans'
    ],
    reviewDate: '2024-04-30',
    notes: 'New performance management system implementation in progress',
    registerType: 'HR',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-18'),
    createdBy: 'system',
    lastUpdatedBy: 'lisa.performance'
  },
  {
    id: 'HR006',
    riskId: 'HR006',
    title: 'Workplace Health and Safety Violations',
    description: 'Risk of workplace injuries and safety violations leading to regulatory penalties and claims',
    category: 'Compliance',
    impact: 'High',
    likelihood: 'Unlikely',
    riskRating: 'Medium',
    owner: 'Safety Officer',
    assignedTo: 'Tom Safety',
    status: 'In Progress',
    mitigationStrategies: [
      'Regular safety training and awareness programs',
      'Workplace hazard assessments',
      'Emergency response procedures',
      'Safety equipment provision and maintenance'
    ],
    controlMeasures: [
      'Monthly safety inspections',
      'Incident reporting system',
      'Safety training records',
      'Emergency drill procedures'
    ],
    reviewDate: '2024-05-15',
    notes: 'Annual safety audit scheduled. Emergency procedures update required.',
    registerType: 'HR',
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-02-22'),
    createdBy: 'system',
    lastUpdatedBy: 'tom.safety'
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

export default function HRRiskRegister() {
  const { currentUser } = useAppStore();
  const [risks, setRisks] = useState<RiskEntry[]>(mockHRRisks);
  const [selectedRisk, setSelectedRisk] = useState<RiskEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const canManageRisks = hasPermission(currentUser, 'manage_hr_risks');
  const canViewRisks = hasPermission(currentUser, 'view_hr_risks');

  if (!canViewRisks) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to view the HR risk register.
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
          <h2 className="text-2xl font-bold">HR Risk Register</h2>
          <p className="text-muted-foreground">
            Manage and monitor human resources risks including employment law, workplace safety, and employee relations
          </p>
        </div>
        {canManageRisks && (
          <Button data-testid="button-add-hr-risk">
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