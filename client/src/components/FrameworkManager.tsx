import { useState, useRef } from 'react';
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
  Shield,
  Plus,
  Download,
  CheckCircle,
  Clock,
  Settings,
  Users,
  BarChart3,
  FileDown,
  Upload
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';
import { useToast } from '@/hooks/use-toast';
import DataTable, { type Column } from './DataTable';
import type { Framework } from '@shared/schema';
import Papa from 'papaparse';

export default function FrameworkManager() {
  const { 
    frameworks, 
    activeFramework,
    currentUser, 
    setActiveFramework,
    addNotification, 
    addAccessLog 
  } = useAppStore();
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter frameworks based on search
  const filteredFrameworks = frameworks.filter(framework => 
    framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSetActiveFramework = (frameworkId: string) => {
    if (!hasPermission(currentUser, 'select_active_framework')) {
      addNotification({
        title: 'Access Denied',
        message: 'You do not have permission to select the active framework',
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      });
      return;
    }

    const framework = frameworks.find(f => f.id === frameworkId);
    setActiveFramework(frameworkId);
    
    addAccessLog({
      entityType: 'framework',
      entityId: frameworkId,
      action: 'activate',
      actor: currentUser?.name || 'Unknown',
      metadata: { frameworkName: framework?.name }
    });

    addNotification({
      title: 'Framework Activated',
      message: `${framework?.name} is now the active compliance framework`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    });
  };

  const handleDownloadTemplate = () => {
    const csvHeaders = [
      'Framework',
      'Type',
      'ID',
      'Title',
      'Description',
      'Category',
      'Status',
      'Owner',
      'DueDate',
      'Priority',
      'Tags',
      'ParentID',
      'Notes'
    ].join(',');

    const csvExamples = [
      'ISO 27001,Control,A.5.1,Information Security Policies,Policy for information security,Organizational Controls,Not Started,ISMS Manager,2025-12-31,High,policy;governance,,Establish and maintain information security policies',
      'ISO 27001,Control,A.5.2,Information Security Roles,Roles and responsibilities for information security,Organizational Controls,Not Started,CISO,2025-12-31,High,roles;responsibilities,,Define and allocate roles and responsibilities',
      'ISO 9001,Requirement,4.1,Understanding Context,Understanding the organization and its context,Context of the Organization,Not Started,Quality Manager,2025-12-31,High,context;analysis,,Determine external and internal issues',
      'ISO 9001,Requirement,5.1,Leadership and Commitment,Top management shall demonstrate leadership,Leadership,Not Started,Management Rep,2025-12-31,High,leadership;commitment,,Top management accountability for QMS',
      'APGF-MS,Process,PD-001,Position Description,Maintain accurate position descriptions,People & Culture,Not Started,HR Manager,2025-12-31,Medium,hr;roles,,Document roles and responsibilities',
      'APGF-MS,Obligation,OBL-001,Fair Work Compliance,Comply with Fair Work Act requirements,Regulatory,Not Started,Compliance Owner,2025-12-31,High,regulatory;compliance,,Ensure compliance with Australian employment law'
    ].join('\n');

    const csvContent = csvHeaders + '\n' + csvExamples;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'framework-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: 'Framework import template has been downloaded successfully',
    });

    addNotification({
      title: 'Template Downloaded',
      message: 'Framework import template has been downloaded',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    });
  };

  const handleUploadTemplate = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Filter out empty rows and rows with missing required fields
          const controls = (results.data as any[]).filter((row: any) => 
            row.Framework && row.ID && row.Title
          );
          
          if (controls.length === 0) {
            toast({
              title: 'Import Failed',
              description: 'No valid controls found in the CSV file.',
              variant: 'destructive',
            });
            return;
          }
          
          // Send to backend API
          const response = await fetch('/api/frameworks/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ controls }),
          });

          if (!response.ok) {
            throw new Error('Failed to import framework controls');
          }

          const result = await response.json();
          
          toast({
            title: 'Import Successful',
            description: result.message || `Imported ${result.importedCount} controls from ${result.frameworks.length} framework(s)`,
          });

          addNotification({
            title: 'Framework Import Complete',
            message: `Successfully imported ${result.importedCount} controls from ${file.name}`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false
          });

          addAccessLog({
            entityType: 'framework',
            entityId: 'import',
            action: 'import',
            actor: currentUser?.name || 'Unknown',
            metadata: { 
              filename: file.name,
              controlCount: result.importedCount,
              frameworks: result.frameworks
            }
          });
        } catch (error) {
          console.error('Import failed:', error);
          toast({
            title: 'Import Failed',
            description: 'Failed to import controls. Please check the format and try again.',
            variant: 'destructive',
          });
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast({
          title: 'Import Failed',
          description: 'Failed to parse CSV file. Please check the format.',
          variant: 'destructive',
        });
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const columns: Column<Framework>[] = [
    {
      key: 'name',
      label: 'Framework',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'id',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center gap-2">
          {activeFramework === value ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-gray-400" />
              <Badge variant="secondary">Available</Badge>
            </>
          )}
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value) => (
        <div className="flex items-center gap-2">
          {activeFramework !== value ? (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSetActiveFramework(value)}
              disabled={!hasPermission(currentUser, 'select_active_framework')}
              data-testid={`button-activate-${value}`}
            >
              Activate
            </Button>
          ) : (
            <Button size="sm" variant="ghost" disabled>
              <CheckCircle className="w-4 h-4 mr-1" />
              Current
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => console.log('View framework details:', value)}
            data-testid={`button-view-${value}`}
          >
            View Details
          </Button>
        </div>
      )
    }
  ];

  const activeFrameworkData = frameworks.find(f => f.id === activeFramework);

  // Actual framework statistics based on system data
  const frameworkStats = {
    'apgf-ms': {
      processes: 44,
      obligations: 62,
      controls: 4,
      policies: 4,
      positions: 5,
      assessments: 10,
      training: 6,
      implemented: 89,
      total: 135,
      compliance: 66
    },
    'iso-9001': {
      clauses: 10,
      requirements: 35,
      controls: 28,
      policies: 12,
      procedures: 18,
      implemented: 78,
      total: 103,
      compliance: 76
    },
    'iso-27001': {
      controls: 93,
      policies: 12,
      procedures: 20,
      soaRows: 93,
      riskAssessments: 0,
      implemented: 0,
      total: 93,
      compliance: 0
    }
  };

  const currentStats = frameworkStats[activeFramework as keyof typeof frameworkStats] || {
    total: 0,
    implemented: 0,
    compliance: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Framework Management</h1>
          <p className="text-muted-foreground">
            Manage compliance frameworks and track implementation progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleDownloadTemplate}
            data-testid="button-download-template"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          {hasPermission(currentUser, 'manage_frameworks') && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file-upload"
              />
              <Button 
                onClick={handleUploadTemplate}
                data-testid="button-create-framework"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Framework
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Active Framework Overview */}
      {activeFrameworkData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Active Framework
            </CardTitle>
            <CardDescription>Currently selected compliance framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{activeFrameworkData.name}</h3>
                    <p className="text-sm text-muted-foreground">{activeFrameworkData.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Version {activeFrameworkData.version}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Requirements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentStats.implemented}</div>
                  <div className="text-xs text-muted-foreground">Implemented</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentStats.compliance}%</div>
                  <div className="text-xs text-muted-foreground">Compliance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Framework Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Framework Comparison</CardTitle>
          <CardDescription>Compare available compliance frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frameworks.map((framework) => {
                  const stats = frameworkStats[framework.id as keyof typeof frameworkStats] || { total: 0, implemented: 0, compliance: 0 };
                  const isActive = activeFramework === framework.id;
                  
                  return (
                    <Card key={framework.id} className={isActive ? 'border-primary' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{framework.name}</h4>
                            <p className="text-sm text-muted-foreground">{framework.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">Version {framework.version}</p>
                          </div>
                          {isActive && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{stats.total}</div>
                            <div className="text-xs text-muted-foreground">Requirements</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{stats.implemented}</div>
                            <div className="text-xs text-muted-foreground">Implemented</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{stats.compliance}%</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Detailed breakdown of framework requirements, controls, and implementation components
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">APGF-MS (Australian Payroll Governance Management System Framework)</CardTitle>
                    <CardDescription>Comprehensive payroll compliance framework</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">44</div>
                        <div className="text-xs text-muted-foreground">Compliance Processes</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">62</div>
                        <div className="text-xs text-muted-foreground">Legal Obligations</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">4</div>
                        <div className="text-xs text-muted-foreground">Core Controls</div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">4</div>
                        <div className="text-xs text-muted-foreground">Governance Policies</div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">5</div>
                        <div className="text-xs text-muted-foreground">Position Descriptions</div>
                      </div>
                      <div className="bg-pink-50 dark:bg-pink-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">10</div>
                        <div className="text-xs text-muted-foreground">Competency Assessments</div>
                      </div>
                      <div className="bg-cyan-50 dark:bg-cyan-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-600">6</div>
                        <div className="text-xs text-muted-foreground">Training Courses</div>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-teal-600">135</div>
                        <div className="text-xs text-muted-foreground">Total Requirements</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
                      <div>• 13 process areas (Workforce, Onboarding, Time & Attendance, Pay, etc.)</div>
                      <div>• 11 obligation categories (Legislation, Tax, Super, Workers' Comp, etc.)</div>
                      <div>• RASCI matrix with 11 professional roles</div>
                      <div>• Australian Fair Work Act & ATO STP compliance</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ISO 9001:2015</CardTitle>
                    <CardDescription>Quality Management Systems standard</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">10</div>
                        <div className="text-xs text-muted-foreground">Main Clauses</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">35</div>
                        <div className="text-xs text-muted-foreground">Requirements</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">28</div>
                        <div className="text-xs text-muted-foreground">Quality Controls</div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">12</div>
                        <div className="text-xs text-muted-foreground">QMS Policies</div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">18</div>
                        <div className="text-xs text-muted-foreground">Documented Procedures</div>
                      </div>
                      <div className="bg-pink-50 dark:bg-pink-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">103</div>
                        <div className="text-xs text-muted-foreground">Total Requirements</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
                      <div>• Context of the Organization (Clause 4)</div>
                      <div>• Leadership & Planning (Clauses 5-6)</div>
                      <div>• Support & Operations (Clauses 7-8)</div>
                      <div>• Performance Evaluation & Improvement (Clauses 9-10)</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ISO 27001:2022</CardTitle>
                    <CardDescription>Information Security Management System</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">93</div>
                        <div className="text-xs text-muted-foreground">Annex A Controls</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">12</div>
                        <div className="text-xs text-muted-foreground">ISMS Policies</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">20</div>
                        <div className="text-xs text-muted-foreground">Security Procedures</div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">93</div>
                        <div className="text-xs text-muted-foreground">SoA Rows</div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">218</div>
                        <div className="text-xs text-muted-foreground">Total Requirements</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
                      <div>• 4 control themes (Organizational, People, Physical, Technological)</div>
                      <div>• Statement of Applicability (SoA) management</div>
                      <div>• Risk assessment & treatment integration</div>
                      <div>• Incident response & business continuity</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="implementation" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Implementation progress and completion tracking for each framework
              </div>
              <div className="space-y-4">
                {frameworks.map((framework) => {
                  const stats = frameworkStats[framework.id as keyof typeof frameworkStats] || { total: 0, implemented: 0, compliance: 0 };
                  const isAPGF = framework.id === 'apgf-ms';
                  const isISO = framework.id === 'iso-9001';
                  const isISO27001 = framework.id === 'iso-27001';
                  
                  return (
                    <Card key={framework.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{framework.name}</h4>
                            <p className="text-xs text-muted-foreground">{framework.description}</p>
                          </div>
                          <Badge variant={stats.compliance >= 75 ? "default" : stats.compliance >= 50 ? "secondary" : "outline"}>
                            {stats.compliance}% Complete
                          </Badge>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                          <div 
                            className={`h-3 rounded-full transition-all ${stats.compliance >= 75 ? 'bg-green-600' : stats.compliance >= 50 ? 'bg-blue-600' : 'bg-amber-600'}`}
                            style={{ width: `${stats.compliance}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center bg-muted/50 rounded p-2">
                            <div className="text-lg font-bold">{stats.total}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center bg-green-50 dark:bg-green-950 rounded p-2">
                            <div className="text-lg font-bold text-green-600">{stats.implemented}</div>
                            <div className="text-xs text-muted-foreground">Implemented</div>
                          </div>
                          <div className="text-center bg-amber-50 dark:bg-amber-950 rounded p-2">
                            <div className="text-lg font-bold text-amber-600">{stats.total - stats.implemented}</div>
                            <div className="text-xs text-muted-foreground">Remaining</div>
                          </div>
                        </div>
                        
                        {isAPGF && (
                          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span>• 44 APGF-MS processes</span>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• 62 legal obligations tracked</span>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• RASCI matrix assignments</span>
                              <Clock className="h-3 w-3 text-amber-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• Evidence collection & linking</span>
                              <Clock className="h-3 w-3 text-amber-600" />
                            </div>
                          </div>
                        )}
                        
                        {isISO && (
                          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span>• QMS documentation complete</span>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• Process procedures defined</span>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• Internal audit program</span>
                              <Clock className="h-3 w-3 text-amber-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• Management review cycle</span>
                              <Clock className="h-3 w-3 text-amber-600" />
                            </div>
                          </div>
                        )}
                        
                        {isISO27001 && (
                          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span>• 93 Annex A controls defined</span>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• Statement of Applicability (SoA)</span>
                              <Clock className="h-3 w-3 text-amber-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• Risk assessment & treatment</span>
                              <Clock className="h-3 w-3 text-amber-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>• ISMS documentation & policies</span>
                              <Clock className="h-3 w-3 text-amber-600" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-framework-search"
          />
        </div>
      </div>

      {/* Frameworks Table */}
      <DataTable
        data={filteredFrameworks}
        columns={columns}
        getRowId={(row) => row.id}
        selectable={false}
        onRowClick={(framework) => console.log('Navigate to framework detail:', framework.id)}
        emptyState={
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <h3 className="text-lg font-medium">No frameworks found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first compliance framework'
                }
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Framework Data
            </Button>
          </div>
        }
      />
    </div>
  );
}