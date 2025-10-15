import { useState, useMemo, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  TrendingUp,
  DollarSign,
  Timer,
  BarChart3
} from 'lucide-react';
import { useReviewStore } from '@/store/reviewSlice';

export default function ReviewerInboxPage() {
  const { items, metrics, addReviewItem, startTimer, stopTimer, validateItem, batchValidate, returnItem, calculateMetrics } = useReviewStore();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('my_queue');

  // Calculate metrics on mount
  useMemo(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  // Filter items by tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'all') return true;
      return item.status === activeTab;
    });
  }, [items, activeTab]);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBatchValidate = (approved: boolean) => {
    batchValidate(Array.from(selectedItems), approved);
    setSelectedItems(new Set());
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      my_queue: { color: 'bg-blue-500', label: 'My Queue' },
      awaiting_approval: { color: 'bg-amber-500', label: 'Awaiting Approval' },
      returned: { color: 'bg-red-500', label: 'Returned' },
      auto_ready: { color: 'bg-green-500', label: 'Auto-Ready' },
      completed: { color: 'bg-gray-400', label: 'Completed' },
    };
    return variants[status] || variants.my_queue;
  };

  const getSLABadge = (slaStatus: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      on_time: { color: 'bg-green-500', label: 'On Time' },
      at_risk: { color: 'bg-amber-500', label: 'At Risk' },
      overdue: { color: 'bg-red-500', label: 'Overdue' },
    };
    return variants[slaStatus] || variants.on_time;
  };

  // Seed data on first load
  useEffect(() => {
    if (items.length === 0) {
      // Add some mock review items for demo
      const mockItems = [
        {
          type: 'classification' as const,
          title: 'Administrative Officer - Level 3 Classification',
          description: 'Review position PA-2024-003 for award compliance under Clerks Private Sector Award 2020',
          confidence: 0.87,
          snippets: ['Clause 13.3: Level 3 classification criteria', 'Routine administrative duties', 'Limited supervision'],
          evidencePackSize: 4,
          status: 'my_queue' as const,
          assignedTo: 'current-user',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'on_time' as const,
          loopCount: 0,
        },
        {
          type: 'audit_item' as const,
          title: 'Q2 2024 Superannuation Guarantee Compliance',
          description: 'Verify SG calculations and payment timelines for all employees',
          confidence: 0.92,
          snippets: ['11.5% SG rate applied', 'Payment within 28 days', '42 employees verified'],
          evidencePackSize: 12,
          status: 'auto_ready' as const,
          assignedTo: 'current-user',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'on_time' as const,
          loopCount: 0,
        },
        {
          type: 'anomaly' as const,
          title: 'Payslip SLA Breach - 3 Employees',
          description: 'Payslips issued 2 days after payday, exceeding 1 business day requirement',
          confidence: 0.95,
          snippets: ['Fair Work Regulations breach', '3 affected employees', 'System processing delay'],
          evidencePackSize: 6,
          status: 'my_queue' as const,
          assignedTo: 'current-user',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'at_risk' as const,
          loopCount: 0,
        },
        {
          type: 'classification' as const,
          title: 'Senior Payroll Officer - Reclassification Request',
          description: 'Employee requested reclassification from Level 4 to Level 5 based on expanded duties',
          confidence: 0.72,
          snippets: ['Duty expansion documented', 'Supervisory responsibilities added', 'Requires legal review'],
          evidencePackSize: 8,
          status: 'awaiting_approval' as const,
          assignedTo: 'compliance-manager',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          slaStatus: 'on_time' as const,
          loopCount: 1,
        },
      ];

      mockItems.forEach((item) => {
        addReviewItem(item);
      });
    }
  }, []);

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-reviewer-inbox">
            Reviewer Inbox
          </h1>
          <p className="text-muted-foreground">
            Validate classification and audit items with AI-assisted review
          </p>
        </div>
      </div>

      {/* ROI Metrics Bar */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Reviewer Performance & ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Items Today</p>
              <p className="text-2xl font-bold">{metrics.itemsToday}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{metrics.itemsCompleted}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Median Time</p>
              <p className="text-2xl font-bold">{Math.floor(metrics.medianTimeSeconds / 60)}m</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">First Pass</p>
              <p className="text-2xl font-bold">{(metrics.firstPassRate * 100).toFixed(0)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Hours Saved
              </p>
              <p className="text-2xl font-bold text-blue-600">{metrics.hoursAvoided.toFixed(1)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                $ Saved
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${metrics.dollarsSaved.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedItems.size > 0 && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItems(new Set())}
                  data-testid="button-clear-selection"
                >
                  Clear
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleBatchValidate(false)}
                  data-testid="button-batch-return"
                >
                  Return All
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleBatchValidate(true)}
                  data-testid="button-batch-validate"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Validate All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my_queue" data-testid="tab-my-queue">
            My Queue ({items.filter((i) => i.status === 'my_queue').length})
          </TabsTrigger>
          <TabsTrigger value="auto_ready" data-testid="tab-auto-ready">
            Auto-Ready ({items.filter((i) => i.status === 'auto_ready').length})
          </TabsTrigger>
          <TabsTrigger value="awaiting_approval" data-testid="tab-awaiting-approval">
            Awaiting Approval ({items.filter((i) => i.status === 'awaiting_approval').length})
          </TabsTrigger>
          <TabsTrigger value="returned" data-testid="tab-returned">
            Returned ({items.filter((i) => i.status === 'returned').length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All ({items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No items in this queue</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Items will appear here when assigned for review
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const statusBadge = getStatusBadge(item.status);
              const slaBadge = getSLABadge(item.slaStatus);
              
              return (
                <Card key={item.id} className="hover-elevate" data-testid={`review-item-${item.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                        data-testid={`checkbox-review-item-${item.id}`}
                      />

                      {/* Item Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                            <Badge className={slaBadge.color}>{slaBadge.label}</Badge>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            Confidence: {(item.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {item.snippets.length} snippets
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Evidence pack: {item.evidencePackSize} items
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              startTimer(item.id);
                              // Would navigate to detail view
                              console.log('Open item:', item.id);
                            }}
                            data-testid={`button-open-${item.id}`}
                          >
                            Open
                          </Button>
                          {item.status !== 'completed' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  validateItem(item.id, true);
                                }}
                                data-testid={`button-validate-${item.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Validate
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  returnItem(item.id, 'Requires additional review');
                                }}
                                data-testid={`button-return-${item.id}`}
                              >
                                Return
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
      </div>
    </AppShell>
  );
}
