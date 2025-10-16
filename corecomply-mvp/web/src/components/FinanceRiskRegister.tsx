import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Plus, Eye, Edit, Trash2, Calendar, User, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useRisks, useCreateRisk, useUpdateRisk, useDeleteRisk } from '@/hooks/useRisks';
import { calculateRiskRating, getRiskRatingColor, getStatusColor, type Risk, type CreateRiskRequest, type UpdateRiskRequest } from '@/types/risk';
import { format } from 'date-fns';

export default function FinanceRiskRegister() {
  const { hasPermission } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<UpdateRiskRequest>>({
    title: '',
    description: '',
    category: 'financial',
    likelihood: 'medium',
    impact: 'medium',
    status: 'open',
    owner: '',
    mitigation: ''
  });

  const { data: risks = [], isLoading } = useRisks({ category: 'financial' });
  const createMutation = useCreateRisk();
  const updateMutation = useUpdateRisk();
  const deleteMutation = useDeleteRisk();

  const canManage = hasPermission('manage_finance_risks');
  const canView = hasPermission('view_finance_risks');

  const filteredRisks = risks.filter(risk =>
    risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (risk.mitigation && risk.mitigation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleView = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description,
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      status: risk.status,
      owner: risk.owner,
      reviewDate: risk.reviewDate || undefined,
      mitigation: risk.mitigation || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!canManage) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to delete risks',
        variant: 'destructive',
      });
      return;
    }

    if (confirm('Are you sure you want to delete this risk?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: 'Risk Deleted',
            description: 'The risk has been deleted successfully',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to delete risk',
            variant: 'destructive',
          });
        }
      });
    }
  };

  const handleCreateSubmit = () => {
    if (!canManage) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to create risks',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.owner) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const createRequest: CreateRiskRequest = {
      title: formData.title,
      description: formData.description,
      category: formData.category || 'financial',
      likelihood: formData.likelihood || 'medium',
      impact: formData.impact || 'medium',
      owner: formData.owner,
      reviewDate: formData.reviewDate || null
    };

    createMutation.mutate(createRequest, {
      onSuccess: () => {
        toast({
          title: 'Risk Created',
          description: 'The risk has been created successfully',
        });
        setIsAddDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          category: 'financial',
          likelihood: 'medium',
          impact: 'medium',
          status: 'open',
          owner: '',
          mitigation: ''
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create risk',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUpdateSubmit = () => {
    if (!canManage || !selectedRisk) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to update risks',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.owner) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const updateRequest: UpdateRiskRequest = {
      title: formData.title!,
      description: formData.description!,
      category: formData.category!,
      likelihood: formData.likelihood!,
      impact: formData.impact!,
      status: formData.status!,
      owner: formData.owner!,
      reviewDate: formData.reviewDate || null,
      mitigation: formData.mitigation || null
    };

    updateMutation.mutate({ id: selectedRisk.id, data: updateRequest }, {
      onSuccess: () => {
        toast({
          title: 'Risk Updated',
          description: 'The risk has been updated successfully',
        });
        setIsEditDialogOpen(false);
        setSelectedRisk(null);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update risk',
          variant: 'destructive',
        });
      }
    });
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Finance Risk Register</h2>
          <p className="text-muted-foreground">
            Manage and monitor financial risks including cash flow, currency, and credit risks
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-finance-risk">
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
              {risks.filter(r => r.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">Open Risks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {risks.filter(r => r.status === 'mitigating').length}
            </div>
            <p className="text-xs text-muted-foreground">Mitigating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {risks.filter(r => r.status === 'closed').length}
            </div>
            <p className="text-xs text-muted-foreground">Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search risks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-finance-risks"
          />
        </div>
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
              {filteredRisks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No risks found matching your search' : 'No risks registered yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRisks.map((risk) => {
                  const riskRating = calculateRiskRating(risk.likelihood, risk.impact);
                  return (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium">{risk.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{risk.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskRatingColor(riskRating)}>
                          {riskRating}
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
                          <span className="text-sm">{risk.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {risk.reviewDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(risk.reviewDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(risk)}
                            data-testid={`button-view-${risk.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(risk)}
                                data-testid={`button-edit-${risk.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(risk.id)}
                                data-testid={`button-delete-${risk.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Risk Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Risk Details</DialogTitle>
          </DialogHeader>
          {selectedRisk && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm text-muted-foreground">{selectedRisk.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <p className="text-sm text-muted-foreground">{selectedRisk.owner}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm"><Badge variant="outline">{selectedRisk.category}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-medium">Likelihood</label>
                  <p className="text-sm"><Badge variant="outline">{selectedRisk.likelihood}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-medium">Impact</label>
                  <p className="text-sm"><Badge variant="outline">{selectedRisk.impact}</Badge></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Risk Rating</label>
                  <p className="text-sm">
                    <Badge variant={getRiskRatingColor(calculateRiskRating(selectedRisk.likelihood, selectedRisk.impact))}>
                      {calculateRiskRating(selectedRisk.likelihood, selectedRisk.impact)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm">
                    <Badge variant={getStatusColor(selectedRisk.status)}>
                      {selectedRisk.status}
                    </Badge>
                  </p>
                </div>
              </div>

              {selectedRisk.reviewDate && (
                <div>
                  <label className="text-sm font-medium">Review Date</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedRisk.reviewDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}

              {selectedRisk.mitigation && (
                <div>
                  <label className="text-sm font-medium">Mitigation Strategy</label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRisk.mitigation}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Risk Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Risk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Risk title"
                data-testid="input-risk-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description"
                rows={3}
                data-testid="input-risk-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-risk-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Owner *</label>
                <Input
                  value={formData.owner || ''}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Risk owner"
                  data-testid="input-risk-owner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Likelihood</label>
                <Select
                  value={formData.likelihood}
                  onValueChange={(value) => setFormData({ ...formData, likelihood: value })}
                >
                  <SelectTrigger data-testid="select-risk-likelihood">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Impact</label>
                <Select
                  value={formData.impact}
                  onValueChange={(value) => setFormData({ ...formData, impact: value })}
                >
                  <SelectTrigger data-testid="select-risk-impact">
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
            </div>

            <div>
              <label className="text-sm font-medium">Review Date</label>
              <Input
                type="date"
                value={formData.reviewDate || ''}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                data-testid="input-risk-review-date"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={createMutation.isPending}
              data-testid="button-save-risk"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Risk'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Risk Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Risk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Risk title"
                data-testid="input-edit-risk-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description"
                rows={3}
                data-testid="input-edit-risk-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-edit-risk-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Owner *</label>
                <Input
                  value={formData.owner || ''}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Risk owner"
                  data-testid="input-edit-risk-owner"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Likelihood</label>
                <Select
                  value={formData.likelihood}
                  onValueChange={(value) => setFormData({ ...formData, likelihood: value })}
                >
                  <SelectTrigger data-testid="select-edit-risk-likelihood">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Impact</label>
                <Select
                  value={formData.impact}
                  onValueChange={(value) => setFormData({ ...formData, impact: value })}
                >
                  <SelectTrigger data-testid="select-edit-risk-impact">
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
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-edit-risk-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="mitigating">Mitigating</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Review Date</label>
              <Input
                type="date"
                value={formData.reviewDate || ''}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                data-testid="input-edit-risk-review-date"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mitigation Strategy</label>
              <Textarea
                value={formData.mitigation || ''}
                onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                placeholder="Describe mitigation strategies (one per line)"
                rows={4}
                data-testid="input-edit-risk-mitigation"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubmit}
              disabled={updateMutation.isPending}
              data-testid="button-update-risk"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Risk'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
