import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Plus, Eye, Edit, Trash2, Calendar, FileText, Database, Shield, AlertCircle, Settings, Archive } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAppStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';

// Mock data for Employee Records Register
const mockEmployeeRecords = [
  {
    id: 'EMP-001',
    name: 'Mia Nguyen',
    employeeId: 'EMP-0042',
    department: 'People & Culture',
    status: 'Active',
    startDate: '2023-02-12',
    retentionDate: '2033-02-12',
    recordTypes: ['Contract', 'TFN Declaration', 'Super Choice', 'ID Verification'],
    complianceScore: 95,
    lastAudit: '2024-09-15',
    location: 'NSW'
  },
  {
    id: 'EMP-002',
    name: 'Leo Carter',
    employeeId: 'EMP-0043',
    department: 'Finance',
    status: 'Active',
    startDate: '2022-08-15',
    retentionDate: '2032-08-15',
    recordTypes: ['Contract', 'TFN Declaration', 'Super Choice', 'Police Check'],
    complianceScore: 98,
    lastAudit: '2024-09-10',
    location: 'VIC'
  },
  {
    id: 'EMP-003',
    name: 'Harper Lane',
    employeeId: 'EMP-0044',
    department: 'IT',
    status: 'Terminated',
    startDate: '2021-03-10',
    endDate: '2024-08-30',
    retentionDate: '2031-08-30',
    recordTypes: ['Contract', 'TFN Declaration', 'Super Choice', 'Termination Package'],
    complianceScore: 88,
    lastAudit: '2024-08-30',
    location: 'VIC'
  }
];

// Mock data for Payroll Systems Inventory
const mockPayrollSystems = [
  {
    id: 'SYS-001',
    name: 'Xero Payroll',
    type: 'Payroll Engine',
    vendor: 'Xero Limited',
    version: '2024.3',
    owner: 'Finance Team',
    criticalityLevel: 'High',
    lastUpdate: '2024-09-01',
    complianceStatus: 'Compliant',
    integrations: ['ATO STP', 'SuperStream', 'Fair Work Awards'],
    dataRetention: '7 years',
    backupFrequency: 'Daily'
  },
  {
    id: 'SYS-002',
    name: 'Workday HCM',
    type: 'HRIS Platform',
    vendor: 'Workday Inc.',
    version: '2024.R2',
    owner: 'HR Team',
    criticalityLevel: 'High',
    lastUpdate: '2024-08-15',
    complianceStatus: 'Compliant',
    integrations: ['Payroll Systems', 'Learning Management', 'Performance Management'],
    dataRetention: '7 years',
    backupFrequency: 'Daily'
  },
  {
    id: 'SYS-003',
    name: 'Deputy Time & Attendance',
    type: 'Time Tracking',
    vendor: 'Deputy Technologies',
    version: '5.2.1',
    owner: 'Operations Team',
    criticalityLevel: 'Medium',
    lastUpdate: '2024-09-20',
    complianceStatus: 'Compliant',
    integrations: ['Payroll Systems', 'Rostering'],
    dataRetention: '7 years',
    backupFrequency: 'Daily'
  }
];

// Mock data for Compliance Documents
const mockComplianceDocuments = [
  {
    id: 'DOC-001',
    title: 'Clerks—Private Sector Award 2020',
    type: 'Award',
    category: 'Industrial Relations',
    version: 'MA000002',
    effectiveDate: '2020-01-01',
    reviewDate: '2025-06-30',
    status: 'Current',
    owner: 'HR Team',
    accessLevel: 'All Staff',
    lastUpdate: '2024-07-01'
  },
  {
    id: 'DOC-002',
    title: 'Enterprise Agreement 2024',
    type: 'Agreement',
    category: 'Industrial Relations',
    version: 'EA-2024-001',
    effectiveDate: '2024-01-01',
    reviewDate: '2027-01-01',
    status: 'Current',
    owner: 'Legal Team',
    accessLevel: 'Management',
    lastUpdate: '2024-01-01'
  },
  {
    id: 'DOC-003',
    title: 'Fair Work Act Compliance Policy',
    type: 'Policy',
    category: 'Compliance',
    version: 'v3.2',
    effectiveDate: '2024-07-01',
    reviewDate: '2025-07-01',
    status: 'Current',
    owner: 'Compliance Team',
    accessLevel: 'HR & Payroll',
    lastUpdate: '2024-07-01'
  }
];

// Mock data for Vulnerabilities/Gaps
const mockVulnerabilities = [
  {
    id: 'GAP-001',
    title: 'Missing TFN Declarations (5 employees)',
    category: 'Documentation',
    severity: 'High',
    description: 'Five casual employees have not provided TFN declarations, affecting tax withholding compliance',
    impact: 'ATO penalties, incorrect tax withholding',
    affectedEmployees: 5,
    discoveredDate: '2024-09-20',
    targetResolution: '2024-10-05',
    owner: 'Payroll Officer',
    status: 'Open'
  },
  {
    id: 'GAP-002',
    title: 'Incomplete Timesheet Approvals',
    category: 'Time & Attendance',
    severity: 'Medium',
    description: 'Several timesheets from previous pay period lack manager approval',
    impact: 'Potential overpayment, audit findings',
    affectedEmployees: 12,
    discoveredDate: '2024-09-18',
    targetResolution: '2024-09-30',
    owner: 'HR Officer',
    status: 'In Progress'
  },
  {
    id: 'GAP-003',
    title: 'Super Fund Details Update Required',
    category: 'Superannuation',
    severity: 'Medium',
    description: 'Some employees have outdated superannuation fund details affecting contribution accuracy',
    impact: 'Incorrect super contributions, employee dissatisfaction',
    affectedEmployees: 8,
    discoveredDate: '2024-09-15',
    targetResolution: '2024-10-15',
    owner: 'Payroll Officer',
    status: 'Open'
  }
];

// Mock data for Data Retention & Archives
const mockRetentionSchedule = [
  {
    id: 'RET-001',
    assetType: 'Employee Personnel Files',
    legalBasis: 'Fair Work Act 2009 s.535',
    jurisdiction: 'Commonwealth',
    retentionPeriod: '7 years post-termination',
    owner: 'HR Team',
    nextDisposal: '2031-08-30',
    dispositionMethod: 'Secure Destruction',
    status: 'Active'
  },
  {
    id: 'RET-002',
    assetType: 'Payroll Records',
    legalBasis: 'Income Tax Assessment Act 1997',
    jurisdiction: 'Commonwealth',
    retentionPeriod: '7 years from tax year end',
    owner: 'Finance Team',
    nextDisposal: '2032-06-30',
    dispositionMethod: 'Secure Destruction',
    status: 'Active'
  },
  {
    id: 'RET-003',
    assetType: 'Time and Attendance Records',
    legalBasis: 'Fair Work Act 2009 s.535',
    jurisdiction: 'Commonwealth',
    retentionPeriod: '7 years',
    owner: 'Operations Team',
    nextDisposal: '2031-12-31',
    dispositionMethod: 'Digital Archive',
    status: 'Active'
  },
  {
    id: 'RET-004',
    assetType: 'Superannuation Records',
    legalBasis: 'Superannuation Guarantee (Administration) Act 1992',
    jurisdiction: 'Commonwealth',
    retentionPeriod: '7 years',
    owner: 'Payroll Team',
    nextDisposal: '2031-06-30',
    dispositionMethod: 'Secure Destruction',
    status: 'Active'
  },
  {
    id: 'RET-005',
    assetType: 'Workers Compensation Records',
    legalBasis: 'Workers Compensation Act 1987 (NSW)',
    jurisdiction: 'NSW',
    retentionPeriod: '7 years after claim closure',
    owner: 'HR Team',
    nextDisposal: '2030-03-15',
    dispositionMethod: 'Secure Destruction',
    status: 'Active'
  }
];

const mockArchivesLog = [
  {
    id: 'ARC-001',
    itemDescription: 'Personnel Files - 2016 Terminated Employees (15 files)',
    assetType: 'Employee Personnel Files',
    disposedDate: '2024-08-15',
    dispositionMethod: 'Secure Destruction',
    approver: 'Sarah Compliance',
    evidenceLink: 'CERT-2024-08-15-001',
    legalBasis: 'Fair Work Act retention period expired',
    quantity: 15
  },
  {
    id: 'ARC-002',
    itemDescription: 'Payroll Records - FY2016 Tax Year',
    assetType: 'Payroll Records',
    disposedDate: '2024-07-01',
    dispositionMethod: 'Digital Archive to Cold Storage',
    approver: 'Leo Carter',
    evidenceLink: 'ARCH-2024-07-01-002',
    legalBasis: 'ATO retention period completed',
    quantity: 1200
  },
  {
    id: 'ARC-003',
    itemDescription: 'Time & Attendance Records - 2016 Calendar Year',
    assetType: 'Time and Attendance Records',
    disposedDate: '2024-06-30',
    dispositionMethod: 'Digital Archive',
    approver: 'Emma HR',
    evidenceLink: 'ARCH-2024-06-30-003',
    legalBasis: 'Fair Work Act retention period completed',
    quantity: 850
  }
];

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
    case 'current':
    case 'compliant':
      return 'default';
    case 'terminated':
    case 'expired':
      return 'secondary';
    case 'non-compliant':
    case 'open':
      return 'destructive';
    case 'in progress':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default function AssetsPage() {
  const { currentUser, activeFramework, frameworks } = useAppStore();
  const [frameworkFilter, setFrameworkFilter] = useState<string>(activeFramework || "apgf-ms");
  const canManageAssets = hasPermission(currentUser, 'manage_assets');
  const canViewAssets = hasPermission(currentUser, 'view_assets');

  if (!canViewAssets) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You don't have permission to access assets.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Determine page title and description based on active framework
  const getPageInfo = () => {
    switch (frameworkFilter) {
      case 'iso-27001':
        return {
          title: 'Assets - Information Security',
          description: 'Manage information assets, IT systems, data classification, and security controls'
        };
      case 'iso-9001':
        return {
          title: 'Assets - Quality Management',
          description: 'Manage quality-related assets, equipment, processes, and documentation'
        };
      default: // apgf-ms
        return {
          title: 'Assets - Payroll & HR Records',
          description: 'Manage and monitor critical payroll and HR data assets, systems, and compliance documents'
        };
    }
  };

  const pageInfo = getPageInfo();

  // Show ISO 27001 content
  if (frameworkFilter === 'iso-27001') {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{pageInfo.title}</h1>
              <p className="text-muted-foreground">{pageInfo.description}</p>
            </div>
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-48" data-testid="select-framework">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map(framework => (
                  <SelectItem key={framework.id} value={framework.id}>
                    {framework.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" data-testid="tab-assets-overview">Overview</TabsTrigger>
              <TabsTrigger value="information-assets" data-testid="tab-information-assets">Information Assets</TabsTrigger>
              <TabsTrigger value="it-systems" data-testid="tab-it-systems">IT Systems</TabsTrigger>
              <TabsTrigger value="data-classification" data-testid="tab-data-classification">Data Classification</TabsTrigger>
              <TabsTrigger value="security-controls" data-testid="tab-security-controls">Security Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-xs text-muted-foreground">Information Assets</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-xs text-muted-foreground">IT Systems</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">93</div>
                    <p className="text-xs text-muted-foreground">Security Controls</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-amber-600">8</div>
                    <p className="text-xs text-muted-foreground">High Risk Assets</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ISO 27001 Asset Register</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Track information assets, IT systems, data classification, and security controls for your Information Security Management System (ISMS).
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Information Assets</h4>
                        <p className="text-sm text-muted-foreground">Databases, files, intellectual property, and business-critical information</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">IT Systems</h4>
                        <p className="text-sm text-muted-foreground">Hardware, software, network infrastructure, and cloud services</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Data Classification</h4>
                        <p className="text-sm text-muted-foreground">Confidential, internal, and public data categories with handling requirements</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Security Controls</h4>
                        <p className="text-sm text-muted-foreground">Physical, technical, and administrative controls protecting assets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="information-assets" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Information Assets</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Databases, documents, intellectual property, and business-critical information</p>
                    </div>
                    {canManageAssets && (
                      <Button data-testid="button-add-info-asset">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Asset
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure your information asset register from the ISO 27001 Starter Guide at <a href="/frameworks/iso27001/starter" className="text-primary underline">/frameworks/iso27001/starter</a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="it-systems" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>IT Systems</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Hardware, software, network devices, and cloud infrastructure</p>
                    </div>
                    {canManageAssets && (
                      <Button data-testid="button-add-it-system">
                        <Plus className="mr-2 h-4 w-4" />
                        Add System
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure your IT systems inventory from the ISO 27001 Starter Guide at <a href="/frameworks/iso27001/starter" className="text-primary underline">/frameworks/iso27001/starter</a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data-classification" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Data Classification</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Classify and label data based on sensitivity and handling requirements</p>
                    </div>
                    {canManageAssets && (
                      <Button data-testid="button-add-classification">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Classification
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Define data classification levels and handling procedures as part of your ISMS implementation.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security-controls" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Security Controls</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">93 Annex A controls protecting information assets</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View all 93 Annex A security controls on the <a href="/controls" className="text-primary underline">Controls page</a> (select ISO 27001 framework filter).
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    );
  }

  // Show ISO 9001 content
  if (frameworkFilter === 'iso-9001') {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{pageInfo.title}</h1>
              <p className="text-muted-foreground">{pageInfo.description}</p>
            </div>
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-48" data-testid="select-framework">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map(framework => (
                  <SelectItem key={framework.id} value={framework.id}>
                    {framework.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="equipment">Equipment & Tools</TabsTrigger>
              <TabsTrigger value="processes">Process Assets</TabsTrigger>
              <TabsTrigger value="documents">QMS Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ISO 9001 Quality Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Track quality management system assets including equipment, processes, procedures, and quality documentation.
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Equipment & Tools</h4>
                        <p className="text-sm text-muted-foreground">Calibrated equipment, measurement tools, and production assets</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Process Documentation</h4>
                        <p className="text-sm text-muted-foreground">Procedures, work instructions, and process maps</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Quality Records</h4>
                        <p className="text-sm text-muted-foreground">Inspection records, test results, and quality reports</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Training Materials</h4>
                        <p className="text-sm text-muted-foreground">Competency matrices, training records, and qualification evidence</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Equipment & Tools Register</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Calibrated equipment and measurement tools</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure your equipment register from the ISO 9001 Starter Guide at <a href="/frameworks/iso9001/starter" className="text-primary underline">/frameworks/iso9001/starter</a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="processes" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Process Assets</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Core QMS processes and documentation</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configure your process assets from the ISO 9001 Starter Guide at <a href="/frameworks/iso9001/starter" className="text-primary underline">/frameworks/iso9001/starter</a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>QMS Documents</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Quality manual, procedures, and controlled documents</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View all quality documentation on the <a href="/policies" className="text-primary underline">Policies page</a> (select ISO 9001 framework filter).
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    );
  }

  // Default APGF-MS content
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{pageInfo.title}</h1>
            <p className="text-muted-foreground">{pageInfo.description}</p>
          </div>
          <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
            <SelectTrigger className="w-48" data-testid="select-framework">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map(framework => (
                <SelectItem key={framework.id} value={framework.id}>
                  {framework.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" data-testid="tab-assets-overview">Overview</TabsTrigger>
            <TabsTrigger value="employee-records" data-testid="tab-employee-records">Employee Records</TabsTrigger>
            <TabsTrigger value="systems" data-testid="tab-payroll-systems">Systems</TabsTrigger>
            <TabsTrigger value="retention" data-testid="tab-data-retention">Data Retention</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-compliance-docs">Documents</TabsTrigger>
            <TabsTrigger value="vulnerabilities" data-testid="tab-vulnerabilities">Gaps</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-asset-settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{mockEmployeeRecords.length}</div>
                    <p className="text-xs text-muted-foreground">Employee Records</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{mockPayrollSystems.length}</div>
                    <p className="text-xs text-muted-foreground">Active Systems</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{mockComplianceDocuments.filter(d => d.status === 'Current').length}</div>
                    <p className="text-xs text-muted-foreground">Current Documents</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{mockVulnerabilities.filter(v => v.status === 'Open').length}</div>
                    <p className="text-xs text-muted-foreground">Open Gaps</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Recent Vulnerabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockVulnerabilities.slice(0, 3).map((vulnerability) => (
                        <div key={vulnerability.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{vulnerability.title}</div>
                            <div className="text-sm text-muted-foreground">{vulnerability.category}</div>
                          </div>
                          <Badge variant={getSeverityColor(vulnerability.severity)}>
                            {vulnerability.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPayrollSystems.map((system) => (
                        <div key={system.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{system.name}</div>
                            <div className="text-sm text-muted-foreground">{system.type}</div>
                          </div>
                          <Badge variant={getStatusColor(system.complianceStatus)}>
                            {system.complianceStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employee-records" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Employee Records Register</h2>
                  <p className="text-muted-foreground">
                    Centralized list of current and historical employee records, aligned with Fair Work Act retention obligations
                  </p>
                </div>
                {canManageAssets && (
                  <Button data-testid="button-add-employee-record">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                )}
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Retention Until</TableHead>
                        <TableHead>Compliance Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEmployeeRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell>{record.employeeId}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.startDate}</TableCell>
                          <TableCell>{record.retentionDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm">{record.complianceScore}%</div>
                              <div className={`w-2 h-2 rounded-full ${record.complianceScore >= 95 ? 'bg-green-500' : record.complianceScore >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" data-testid={`button-view-record-${record.employeeId}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canManageAssets && (
                                <Button size="sm" variant="outline" data-testid={`button-edit-record-${record.employeeId}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="systems" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Payroll Systems Inventory</h2>
                  <p className="text-muted-foreground">
                    List of payroll engines, HRIS platforms, time/attendance tools, superannuation gateways
                  </p>
                </div>
                {canManageAssets && (
                  <Button data-testid="button-add-system">
                    <Plus className="mr-2 h-4 w-4" />
                    Add System
                  </Button>
                )}
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>System Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Criticality</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayrollSystems.map((system) => (
                        <TableRow key={system.id}>
                          <TableCell className="font-medium">{system.name}</TableCell>
                          <TableCell>{system.type}</TableCell>
                          <TableCell>{system.vendor}</TableCell>
                          <TableCell>{system.version}</TableCell>
                          <TableCell>{system.owner}</TableCell>
                          <TableCell>
                            <Badge variant={system.criticalityLevel === 'High' ? 'destructive' : 'secondary'}>
                              {system.criticalityLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(system.complianceStatus)}>
                              {system.complianceStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" data-testid={`button-view-system-${system.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canManageAssets && (
                                <Button size="sm" variant="outline" data-testid={`button-edit-system-${system.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Data Retention & Archives</h2>
                  <p className="text-muted-foreground">
                    Tracking of payslips, time sheets, contracts, and leave records to meet 7-year statutory requirements
                  </p>
                </div>
                {canManageAssets && (
                  <Button data-testid="button-add-retention-schedule">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Schedule
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Retention Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Active Retention Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset Type</TableHead>
                          <TableHead>Legal Basis</TableHead>
                          <TableHead>Retention Period</TableHead>
                          <TableHead>Next Disposal</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockRetentionSchedule.slice(0, 5).map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell className="font-medium">{schedule.assetType}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{schedule.legalBasis.split(' ')[0]}</div>
                                <div className="text-muted-foreground">{schedule.jurisdiction}</div>
                              </div>
                            </TableCell>
                            <TableCell>{schedule.retentionPeriod}</TableCell>
                            <TableCell>{schedule.nextDisposal}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" data-testid={`button-view-schedule-${schedule.id}`}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                                {canManageAssets && (
                                  <Button size="sm" variant="outline" data-testid={`button-edit-schedule-${schedule.id}`}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Archives Log */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Archives Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Disposed Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockArchivesLog.map((archive) => (
                          <TableRow key={archive.id}>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{archive.itemDescription.split(' - ')[1] || archive.itemDescription}</div>
                                <div className="text-muted-foreground">{archive.assetType}</div>
                              </div>
                            </TableCell>
                            <TableCell>{archive.disposedDate}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {archive.dispositionMethod.includes('Destruction') ? 'Destroyed' : 'Archived'}
                              </Badge>
                            </TableCell>
                            <TableCell>{archive.quantity}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" data-testid={`button-view-archive-${archive.id}`}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Full Retention Schedule Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Retention Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Schedule ID</TableHead>
                        <TableHead>Asset Type</TableHead>
                        <TableHead>Legal Basis</TableHead>
                        <TableHead>Jurisdiction</TableHead>
                        <TableHead>Retention Period</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Next Disposal</TableHead>
                        <TableHead>Disposition Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRetentionSchedule.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.id}</TableCell>
                          <TableCell>{schedule.assetType}</TableCell>
                          <TableCell>{schedule.legalBasis}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{schedule.jurisdiction}</Badge>
                          </TableCell>
                          <TableCell>{schedule.retentionPeriod}</TableCell>
                          <TableCell>{schedule.owner}</TableCell>
                          <TableCell>{schedule.nextDisposal}</TableCell>
                          <TableCell>{schedule.dispositionMethod}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(schedule.status)}>
                              {schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" data-testid={`button-view-retention-${schedule.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canManageAssets && (
                                <>
                                  <Button size="sm" variant="outline" data-testid={`button-edit-retention-${schedule.id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" data-testid={`button-archive-retention-${schedule.id}`}>
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
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Compliance Documents</h2>
                  <p className="text-muted-foreground">
                    Awards, enterprise agreements, company policies, Fair Work determinations
                  </p>
                </div>
                {canManageAssets && (
                  <Button data-testid="button-add-document">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Document
                  </Button>
                )}
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Review Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockComplianceDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.title}</TableCell>
                          <TableCell>{document.type}</TableCell>
                          <TableCell>{document.category}</TableCell>
                          <TableCell>{document.version}</TableCell>
                          <TableCell>{document.effectiveDate}</TableCell>
                          <TableCell>{document.reviewDate}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(document.status)}>
                              {document.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" data-testid={`button-view-document-${document.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canManageAssets && (
                                <Button size="sm" variant="outline" data-testid={`button-edit-document-${document.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Vulnerabilities / Gaps</h2>
                  <p className="text-muted-foreground">
                    Identified weaknesses in record-keeping and compliance gaps
                  </p>
                </div>
                {canManageAssets && (
                  <Button data-testid="button-add-vulnerability">
                    <Plus className="mr-2 h-4 w-4" />
                    Report Gap
                  </Button>
                )}
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gap ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Affected Employees</TableHead>
                        <TableHead>Discovered</TableHead>
                        <TableHead>Target Resolution</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockVulnerabilities.map((vulnerability) => (
                        <TableRow key={vulnerability.id}>
                          <TableCell className="font-medium">{vulnerability.id}</TableCell>
                          <TableCell>{vulnerability.title}</TableCell>
                          <TableCell>{vulnerability.category}</TableCell>
                          <TableCell>
                            <Badge variant={getSeverityColor(vulnerability.severity)}>
                              {vulnerability.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>{vulnerability.affectedEmployees}</TableCell>
                          <TableCell>{vulnerability.discoveredDate}</TableCell>
                          <TableCell>{vulnerability.targetResolution}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(vulnerability.status)}>
                              {vulnerability.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" data-testid={`button-view-vulnerability-${vulnerability.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canManageAssets && (
                                <Button size="sm" variant="outline" data-testid={`button-edit-vulnerability-${vulnerability.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Asset Settings</h2>
                <p className="text-muted-foreground">
                  Configure retention policies, evidence collection, and links to controls and audits
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Retention Policy Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Commonwealth Legislation</label>
                      <div className="text-sm text-muted-foreground">Fair Work Act, Income Tax Assessment Act, SG Act</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State-Specific Requirements</label>
                      <div className="text-sm text-muted-foreground">NSW Workers Compensation, VIC OHS Records</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Disposal Automation</label>
                      <div className="text-sm text-muted-foreground">Auto-calculate disposal dates from start/end dates</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Active Policies</label>
                      <div className="text-sm text-muted-foreground">{mockRetentionSchedule.length} retention schedules configured</div>
                    </div>
                    {canManageAssets && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" data-testid="button-configure-retention">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure Policies
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-generate-disposal-schedule">
                          <Archive className="mr-2 h-4 w-4" />
                          Generate Disposal Schedule
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Evidence Collection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Automatic Evidence Collection</label>
                      <div className="text-sm text-muted-foreground">Enabled for payroll systems</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hash Verification</label>
                      <div className="text-sm text-muted-foreground">SHA-256 for document integrity</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Audit Trail</label>
                      <div className="text-sm text-muted-foreground">Full access and modification logs</div>
                    </div>
                    {canManageAssets && (
                      <Button variant="outline" size="sm" data-testid="button-configure-evidence">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure Collection
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}