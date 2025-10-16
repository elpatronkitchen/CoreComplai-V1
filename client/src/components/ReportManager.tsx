import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  BarChart3,
  Plus,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import DataTable, { type Column } from './DataTable';
import { mockCsvExport } from '@/lib/mockApi';

interface Report {
  id: string;
  name: string;
  type: 'compliance' | 'gap_analysis' | 'audit' | 'risk' | 'executive';
  description: string;
  lastGenerated: Date;
  status: 'ready' | 'generating' | 'scheduled';
  schedule?: string;
  framework?: string;
  generatedBy: string;
}

export default function ReportManager() {
  const { 
    currentUser, 
    controls,
    policies,
    activeFramework,
    frameworks,
    addNotification, 
    addAccessLog 
  } = useAppStore();
  
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Framework-specific reports
  const getReportsByFramework = () => {
    if (activeFramework === 'iso-27001') {
      return [
        {
          id: 'RPT-ISO27001-001',
          name: 'ISMS Summary Report',
          type: 'compliance' as const,
          description: 'Overall ISMS status including control implementation and compliance metrics',
          lastGenerated: new Date('2024-01-15'),
          status: 'ready' as const,
          schedule: 'Monthly',
          framework: 'iso-27001',
          generatedBy: 'ISMS Manager'
        },
        {
          id: 'RPT-ISO27001-002',
          name: 'Statement of Applicability (SoA)',
          type: 'compliance' as const,
          description: 'Complete SoA showing all 93 Annex A controls with justifications',
          lastGenerated: new Date('2024-01-10'),
          status: 'ready' as const,
          framework: 'iso-27001',
          generatedBy: 'SoA Owner'
        },
        {
          id: 'RPT-ISO27001-003',
          name: 'Information Security Risk Register',
          type: 'risk' as const,
          description: 'Identified risks, treatments, and residual risk levels',
          lastGenerated: new Date('2024-01-12'),
          status: 'ready' as const,
          schedule: 'Quarterly',
          framework: 'iso-27001',
          generatedBy: 'Risk Owner'
        },
        {
          id: 'RPT-ISO27001-004',
          name: 'Internal Audit Results',
          type: 'audit' as const,
          description: 'ISMS internal audit findings and nonconformities',
          lastGenerated: new Date('2024-01-08'),
          status: 'ready' as const,
          framework: 'iso-27001',
          generatedBy: 'Lead Auditor'
        },
        {
          id: 'RPT-ISO27001-005',
          name: 'Management Review Report',
          type: 'executive' as const,
          description: 'ISMS performance, improvement opportunities, and management decisions',
          lastGenerated: new Date('2024-01-05'),
          status: 'ready' as const,
          schedule: 'Quarterly',
          framework: 'iso-27001',
          generatedBy: 'ISMS Manager'
        },
        {
          id: 'RPT-ISO27001-006',
          name: 'Incident Response Summary',
          type: 'audit' as const,
          description: 'Security incidents, containment, and lessons learned',
          lastGenerated: new Date('2024-01-14'),
          status: 'ready' as const,
          schedule: 'Monthly',
          framework: 'iso-27001',
          generatedBy: 'Incident Manager'
        }
      ];
    }
    
    if (activeFramework === 'iso-9001') {
      return [
        {
          id: 'RPT-ISO9001-001',
          name: 'Quality Management System Summary',
          type: 'compliance' as const,
          description: 'QMS performance and compliance with ISO 9001 clauses',
          lastGenerated: new Date('2024-01-15'),
          status: 'ready' as const,
          schedule: 'Monthly',
          framework: 'iso-9001',
          generatedBy: 'Quality Manager'
        },
        {
          id: 'RPT-ISO9001-002',
          name: 'Nonconformity & CAPA Report',
          type: 'gap_analysis' as const,
          description: 'Identified nonconformities and corrective actions',
          lastGenerated: new Date('2024-01-10'),
          status: 'ready' as const,
          framework: 'iso-9001',
          generatedBy: 'Quality Manager'
        },
        {
          id: 'RPT-ISO9001-003',
          name: 'Internal Quality Audit Results',
          type: 'audit' as const,
          description: 'QMS audit findings and improvement opportunities',
          lastGenerated: new Date('2024-01-08'),
          status: 'ready' as const,
          framework: 'iso-9001',
          generatedBy: 'Lead Auditor'
        }
      ];
    }
    
    // APGF-MS reports (default)
    return [
      {
        id: 'RPT-001',
        name: 'Monthly Compliance Summary',
        type: 'compliance' as const,
        description: 'Overall compliance status across all controls',
        lastGenerated: new Date('2024-01-15'),
        status: 'ready' as const,
        schedule: 'Monthly',
        framework: 'apgf-ms',
        generatedBy: 'Ava Morgan'
      },
      {
        id: 'RPT-002', 
        name: 'Gap Analysis Report',
        type: 'gap_analysis' as const,
        description: 'Identification of compliance gaps and remediation plans',
        lastGenerated: new Date('2024-01-10'),
        status: 'ready' as const,
        framework: 'apgf-ms',
        generatedBy: 'Noah Patel'
      },
      {
        id: 'RPT-003',
        name: 'Internal Audit Findings',
        type: 'audit' as const,
        description: 'Results from recent internal audit activities',
        lastGenerated: new Date('2024-01-08'),
        status: 'ready' as const,
        generatedBy: 'Noah Patel'
      },
      {
        id: 'RPT-004',
        name: 'Risk Assessment Dashboard',
        type: 'risk' as const,
        description: 'Current risk posture and mitigation status',
        lastGenerated: new Date('2024-01-12'),
        status: 'generating' as const,
        generatedBy: 'Ava Morgan'
      },
      {
        id: 'RPT-005',
        name: 'Executive Summary',
        type: 'executive' as const,
        description: 'High-level compliance overview for leadership',
        lastGenerated: new Date('2024-01-14'),
        status: 'ready' as const,
        schedule: 'Weekly',
        generatedBy: 'Oliver Brooks'
      }
    ];
  };

  const reports = getReportsByFramework();

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (filterType !== 'all' && report.type !== filterType) return false;
    if (searchTerm && !report.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleGenerateReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // Simulate report generation
      addNotification({
        title: 'Report Generation Started',
        message: `Generating ${report.name}...`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      });

      addAccessLog({
        entityType: 'report',
        entityId: reportId,
        action: 'generate',
        actor: currentUser?.name || 'Unknown',
        metadata: { reportName: report.name, reportType: report.type }
      });

      // Simulate delay
      setTimeout(() => {
        addNotification({
          title: 'Report Ready',
          message: `${report.name} has been generated successfully`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false
        });
      }, 3000);

    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // Mock report data based on type
      let reportData;
      switch (report.type) {
        case 'compliance':
          reportData = controls.map(c => ({
            controlId: c.id,
            title: c.title,
            status: c.status,
            owner: c.owner,
            lastUpdated: c.updatedAt
          }));
          break;
        case 'gap_analysis':
          reportData = controls.filter(c => c.status !== 'Compliant').map(c => ({
            controlId: c.id,
            title: c.title,
            currentStatus: c.status,
            gap: 'Implementation needed',
            priority: 'Medium'
          }));
          break;
        default:
          reportData = [{ message: 'Report data not available in demo' }];
      }

      await mockCsvExport(reportData, `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      
      addNotification({
        title: 'Download Complete',
        message: `${report.name} downloaded successfully`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compliance':
        return <CheckCircle className="w-4 h-4" />;
      case 'gap_analysis':
        return <AlertTriangle className="w-4 h-4" />;
      case 'audit':
        return <Activity className="w-4 h-4" />;
      case 'risk':
        return <TrendingUp className="w-4 h-4" />;
      case 'executive':
        return <PieChart className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600';
      case 'generating':
        return 'text-blue-600';
      case 'scheduled':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const columns: Column<Report>[] = [
    {
      key: 'name',
      label: 'Report',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            {getTypeIcon(row.type)}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'generating' && <Clock className="w-4 h-4 animate-spin" />}
          <span className={`text-sm font-medium ${getStatusColor(value)}`}>
            {value === 'ready' ? 'Ready' : value === 'generating' ? 'Generating' : 'Scheduled'}
          </span>
        </div>
      )
    },
    {
      key: 'lastGenerated',
      label: 'Last Generated',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'generatedBy',
      label: 'Generated By',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
            {value.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleDownloadReport(value)}
            disabled={row.status === 'generating'}
            data-testid={`button-download-${value}`}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => handleGenerateReport(value)}
            disabled={row.status === 'generating'}
            data-testid={`button-generate-${value}`}
          >
            Regenerate
          </Button>
        </div>
      )
    }
  ];

  // Calculate report stats
  const reportStats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    generating: reports.filter(r => r.status === 'generating').length,
    scheduled: reports.filter(r => r.schedule).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and download compliance reports
          </p>
        </div>
        {hasPermission(currentUser, 'export_reports') && (
          <Button data-testid="button-create-report">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reportStats.total}</div>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{reportStats.ready}</div>
            <p className="text-xs text-muted-foreground">Ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{reportStats.generating}</div>
            <p className="text-xs text-muted-foreground">Generating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{reportStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>Generate commonly used reports instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start text-left"
              onClick={() => handleGenerateReport('RPT-001')}
              data-testid="button-quick-compliance"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-medium">Compliance Summary</div>
                  <div className="text-sm text-muted-foreground">Current compliance status</div>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start text-left"
              onClick={() => handleGenerateReport('RPT-002')}
              data-testid="button-quick-gap"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="font-medium">Gap Analysis</div>
                  <div className="text-sm text-muted-foreground">Identify compliance gaps</div>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start text-left"
              onClick={() => handleGenerateReport('RPT-005')}
              data-testid="button-quick-executive"
            >
              <div className="flex items-center gap-3">
                <PieChart className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="font-medium">Executive Summary</div>
                  <div className="text-sm text-muted-foreground">High-level overview</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* People Reports */}
      <Card>
        <CardHeader>
          <CardTitle>People Reports</CardTitle>
          <CardDescription>Employee and HR-related compliance reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover-elevate" data-testid="card-employee-report">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Employee Report
                </CardTitle>
                <CardDescription>
                  Complete employee directory with all details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" data-testid="button-generate-employee-report">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-compliance-report">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Compliance Report
                </CardTitle>
                <CardDescription>
                  Employee compliance scores and missing documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" data-testid="button-generate-compliance-report">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-integration-report">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Integration Status
                </CardTitle>
                <CardDescription>
                  Employee integration status across all systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" data-testid="button-generate-integration-report">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Browse available report templates by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compliance" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="executive">Executive</TabsTrigger>
              <TabsTrigger value="operational">Operational</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Control Status Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Detailed status of all compliance controls</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Policy Compliance Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Policy adherence and exceptions</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="audit" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Audit Findings Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Summary of audit findings and remediation</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Evidence Collection Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Status of evidence collection activities</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="risk" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Risk Assessment Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Current risk landscape and mitigation</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Risk Trend Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-3">Risk trends over time</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="executive" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Board Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Quarterly compliance summary for board</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Executive Dashboard</h4>
                  <p className="text-sm text-muted-foreground mb-3">Key metrics and KPIs</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="operational" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Team Performance Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Team compliance activities and performance</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Training Compliance Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">Training completion and requirements</p>
                  <Button size="sm" variant="outline">Generate</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          data-testid="input-report-search"
        />
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48" data-testid="filter-report-type">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="gap_analysis">Gap Analysis</SelectItem>
            <SelectItem value="audit">Audit</SelectItem>
            <SelectItem value="risk">Risk</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <DataTable
        data={filteredReports}
        columns={columns}
        getRowId={(row) => row.id}
        selectable={hasPermission(currentUser, 'export_reports')}
        onSelectionChange={setSelectedReports}
        onRowClick={(report) => console.log('View report details:', report.id)}
        emptyState={
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <h3 className="text-lg font-medium">No reports found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by generating your first report'
                }
              </p>
            </div>
          </div>
        }
        actions={
          selectedReports.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Selected ({selectedReports.length})
              </Button>
            </div>
          )
        }
      />
    </div>
  );
}