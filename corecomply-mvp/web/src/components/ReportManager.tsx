import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Loader2,
  Activity,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useApiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import DataTable, { type Column } from './DataTable';
import type { Report, ReportTemplate, GenerateReportRequest } from '@/types/report';

export default function ReportManager() {
  const apiClient = useApiClient();
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canView = hasPermission('view_reports');
  const canGenerate = hasPermission('generate_reports');
  const canExport = hasPermission('export_reports');

  // Fetch reports
  const { 
    data: reports = [], 
    isLoading: loadingReports,
    isError: errorReports,
    refetch: refetchReports
  } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
    queryFn: async () => {
      const response = await apiClient.get('/api/reports');
      return response.data;
    },
    enabled: canView,
  });

  // Fetch templates
  const { 
    data: templates = [],
    isLoading: loadingTemplates
  } = useQuery<ReportTemplate[]>({
    queryKey: ['/api/reports/templates'],
    queryFn: async () => {
      const response = await apiClient.get('/api/reports/templates');
      return response.data;
    },
    enabled: canView,
  });

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: async (request: GenerateReportRequest) => {
      const response = await apiClient.post('/api/reports/generate', request);
      return response.data;
    },
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'], exact: false });
      toast({
        title: 'Report Generated',
        description: `${request.name} has been generated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: 'destructive',
      });
    }
  });

  // Export report mutation
  const exportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response: { data: Blob } = await apiClient.get<Blob>(`/api/reports/${reportId}/export`);
      return { blob: response.data, reportId };
    },
    onSuccess: (data) => {
      // Create download link and trigger download
      const url = window.URL.createObjectURL(data.blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from report data
      const report = reports.find(r => r.id === data.reportId);
      const fileName = report ? `${report.name}.${report.format || 'pdf'}` : `report_${data.reportId}.pdf`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Complete',
        description: 'Report downloaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export report',
        variant: 'destructive',
      });
    }
  });

  // Delete report mutation
  const deleteMutation = useMutation({
    mutationFn: async (reportId: number) => {
      await apiClient.delete(`/api/reports/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'], exact: false });
      toast({
        title: 'Report Deleted',
        description: 'Report has been removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete report',
        variant: 'destructive',
      });
    }
  });

  if (!canView) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to view reports. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filterType !== 'all' && report.type !== filterType) return false;
      if (searchTerm && !report.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [reports, filterType, searchTerm]);

  const handleGenerateReport = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (!report || !canGenerate) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to generate reports',
        variant: 'destructive',
      });
      return;
    }

    generateMutation.mutate({
      name: report.name,
      type: report.type,
      description: report.description ?? undefined,
      format: report.format,
      framework: report.framework ?? undefined,
      parameters: report.parameters ? JSON.parse(report.parameters) : undefined
    });
  };

  const handleDownloadReport = (reportId: number) => {
    if (!canExport) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to export reports',
        variant: 'destructive',
      });
      return;
    }

    exportMutation.mutate(reportId);
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
            <div className="font-medium" data-testid={`text-report-name-${row.id}`}>{value}</div>
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
          <span className={`text-sm font-medium ${getStatusColor(value)}`} data-testid={`text-report-status-${value}`}>
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
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'createdBy',
      label: 'Created By',
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
            disabled={row.status === 'generating' || !canExport || exportMutation.isPending}
            data-testid={`button-download-${value}`}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => handleGenerateReport(value)}
            disabled={row.status === 'generating' || !canGenerate || generateMutation.isPending}
            data-testid={`button-regenerate-${value}`}
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
  };

  if (loadingReports || loadingTemplates) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading reports...</span>
      </div>
    );
  }

  if (errorReports) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load reports. Please try again.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchReports()}
            data-testid="button-retry-reports"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-reports">Compliance Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage compliance reports
          </p>
        </div>
        {canGenerate && (
          <div className="flex gap-2">
            <Button data-testid="button-new-report">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-reports">{reportStats.total}</div>
            <p className="text-sm text-muted-foreground">Available reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-ready-reports">{reportStats.ready}</div>
            <p className="text-sm text-muted-foreground">Ready to download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Generating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-generating-reports">{reportStats.generating}</div>
            <p className="text-sm text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-reports" data-testid="tab-all-reports">
            <FileText className="h-4 w-4 mr-2" />
            All Reports
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <BarChart3 className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* All Reports Tab */}
        <TabsContent value="all-reports" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Generated Reports</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search reports..."
                      className="pl-10 w-80"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-reports"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={filteredReports}
                columns={columns}
                getRowId={(row) => row.id.toString()}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Pre-configured report templates for quick generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} data-testid={`card-template-${template.id}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getTypeIcon(template.type)}
                          {template.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <Badge variant="outline">{template.category}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No templates available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
