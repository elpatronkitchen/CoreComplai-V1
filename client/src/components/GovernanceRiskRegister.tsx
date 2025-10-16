import { useState, useMemo } from 'react';
import { useRiskStore, Risk } from '@/store/riskSlice';
import { useObligationsStore } from '@/store/obligationsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  TrendingUp,
  Download,
  Link as LinkIcon,
  Users,
  FileCheck,
  Shield,
  Search,
  Plus,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'Low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Low-Med':
      return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Med-High':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'High':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Very High':
      return 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getKRIColor = (status: string) => {
  switch (status) {
    case 'green':
      return 'bg-green-500';
    case 'amber':
      return 'bg-amber-500';
    case 'red':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

export default function GovernanceRiskRegister() {
  const { risks, linkObligation, unlinkObligation, adoptRasciFromObligations } = useRiskStore();
  const { obligations } = useObligationsStore();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLinkObligationsOpen, setIsLinkObligationsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObligations, setSelectedObligations] = useState<string[]>([]);

  const governanceRisks = risks;

  const filteredRisks = useMemo(() => {
    return governanceRisks.filter((risk) => {
      const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter;
      const matchesSearch =
        risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [governanceRisks, categoryFilter, searchTerm]);

  const groupedRisks = useMemo(() => {
    const groups: Record<string, Risk[]> = {};
    filteredRisks.forEach((risk) => {
      if (!groups[risk.category]) {
        groups[risk.category] = [];
      }
      groups[risk.category].push(risk);
    });
    return groups;
  }, [filteredRisks]);

  const handleViewDetails = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsDetailOpen(true);
  };

  const handleLinkObligations = (risk: Risk) => {
    setSelectedRisk(risk);
    setSelectedObligations(risk.linkedObligations);
    setIsLinkObligationsOpen(true);
  };

  const handleSaveLinkObligations = () => {
    if (!selectedRisk) return;

    const currentLinked = selectedRisk.linkedObligations;
    const toAdd = selectedObligations.filter((id) => !currentLinked.includes(id));
    const toRemove = currentLinked.filter((id) => !selectedObligations.includes(id));

    toAdd.forEach((id) => linkObligation(selectedRisk.id, id));
    toRemove.forEach((id) => unlinkObligation(selectedRisk.id, id));

    setIsLinkObligationsOpen(false);
  };

  const handleAdoptRasci = () => {
    if (!selectedRisk) return;
    adoptRasciFromObligations(selectedRisk.id);
  };

  const exportBoardPack = () => {
    const boardRisks = risks.filter((r) => r.category === 'Board/Director');

    const csvContent = [
      ['Risk ID', 'Title', 'Inherent Risk', 'Residual Risk', 'Owner', 'Treatment Plan', 'KRIs', 'Status'],
      ...boardRisks.map((r) => [
        r.id,
        r.title,
        r.inherentRisk,
        r.residualRisk,
        r.owner,
        r.treatmentPlan,
        r.kris.map((k) => `${k.metric}: ${k.current}${k.unit || ''}`).join('; '),
        r.status || 'Open',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const mdContent = `# Board Risk Pack - ${new Date().toLocaleDateString()}

## Executive Summary
${boardRisks.length} Board & Director oversight risks identified

## Risk Register

${boardRisks
  .map(
    (r) => `### ${r.id}: ${r.title}

**Category:** ${r.category}  
**Inherent Risk:** ${r.inherentRisk}  
**Residual Risk:** ${r.residualRisk}  
**Owner:** ${r.owner}

**Description:** ${r.description}

**Linked Obligations:** ${r.linkedObligations.join(', ')}

**Existing Controls:** ${r.existingControls}

**Treatment Plan:** ${r.treatmentPlan}

**Early Warning Indicators:**
${r.earlyWarnings.map((ew) => `- ${ew}`).join('\n')}

**KRIs:**
${r.kris.map((k) => `- ${k.metric}: ${k.current}${k.unit || ''} (Threshold: ${k.threshold}${k.unit || ''}) - ${k.status.toUpperCase()}`).join('\n')}

**RASCI:**
- R (Responsible): ${r.rasci.R}
- A (Accountable): ${r.rasci.A}
- S (Support): ${r.rasci.S}
- C (Consulted): ${r.rasci.C}
- I (Informed): ${r.rasci.I}

---
`
  )
  .join('\n')}

## Certification

☐ I certify that the above risks have been reviewed and treatment plans are appropriate.

**Board Audit & Risk Committee Chair:** _________________  
**Date:** _________________
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board_pack_${new Date().toISOString().split('T')[0]}.md`;
    a.click();

    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvA = document.createElement('a');
    csvA.href = csvUrl;
    csvA.download = `board_pack_${new Date().toISOString().split('T')[0]}.csv`;
    csvA.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-governance-risks-title">Executive & Board Risks</h2>
          <p className="text-muted-foreground mt-1">
            Governance, Leadership & Oversight Risk Register
          </p>
        </div>
        <Button onClick={exportBoardPack} data-testid="button-export-board-pack">
          <Download className="w-4 h-4 mr-2" />
          Export Board Pack
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-summary-total">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{governanceRisks.length}</div>
            <p className="text-xs text-muted-foreground">
              {governanceRisks.filter((r) => r.domain === 'Executive').length} Executive,{' '}
              {governanceRisks.filter((r) => r.domain === 'Board/Director').length} Board,{' '}
              {governanceRisks.filter((r) => r.domain === 'Payroll' || r.domain === 'HR' || r.domain === 'Finance' || r.domain === 'Technology').length} Operational
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-summary-high">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Inherent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {governanceRisks.filter((r) => r.inherentRisk === 'High' || r.inherentRisk === 'Very High').length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring treatment</p>
          </CardContent>
        </Card>

        <Card data-testid="card-summary-kri-red">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">KRI Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {governanceRisks.reduce((acc, r) => acc + r.kris.filter((k) => k.status === 'red').length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {governanceRisks.reduce((acc, r) => acc + r.kris.filter((k) => k.status === 'amber').length, 0)} amber
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-summary-in-progress">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {governanceRisks.filter((r) => r.status === 'In Progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Active treatments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search risks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-risks"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[250px]" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Governance">Governance</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Financial">Financial</SelectItem>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Strategic">Strategic</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Cyber">Cyber</SelectItem>
              <SelectItem value="Regulatory">Regulatory</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {Object.entries(groupedRisks).map(([category, categoryRisks]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category === 'Executive Leadership' && <TrendingUp className="w-5 h-5" />}
              {category === 'Board/Director' && <Shield className="w-5 h-5" />}
              {category} ({categoryRisks.length})
            </CardTitle>
            <CardDescription>
              {category === 'Executive Leadership'
                ? 'Executive accountability, resourcing, tone, and delivery'
                : "Directors' duties, assurance, and certifications"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Inherent</TableHead>
                  <TableHead>Residual</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>KRIs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryRisks.map((risk) => (
                  <TableRow key={risk.id} data-testid={`row-risk-${risk.id}`}>
                    <TableCell className="font-mono text-sm">{risk.id}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-medium">{risk.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {risk.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskLevelColor(risk.inherentRisk)} variant="outline">
                        {risk.inherentRisk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskLevelColor(risk.residualRisk)} variant="outline">
                        {risk.residualRisk}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{risk.owner}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {risk.kris.map((kri, i) => (
                          <div
                            key={i}
                            className={`w-2 h-6 rounded ${getKRIColor(kri.status)}`}
                            title={`${kri.metric}: ${kri.status}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{risk.status || 'Open'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(risk)}
                        data-testid={`button-view-${risk.id}`}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {selectedRisk?.id}: {selectedRisk?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedRisk?.category} Risk - {selectedRisk?.domain} Domain
            </DialogDescription>
          </DialogHeader>

          {selectedRisk && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Inherent Risk</Label>
                  <Badge className={`${getRiskLevelColor(selectedRisk.inherentRisk)} mt-1`}>
                    {selectedRisk.inherentRisk}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Residual Risk</Label>
                  <Badge className={`${getRiskLevelColor(selectedRisk.residualRisk)} mt-1`}>
                    {selectedRisk.residualRisk}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-semibold">Description & Causes</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRisk.description}</p>
                {selectedRisk.causes && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedRisk.causes}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Linked Obligations ({selectedRisk.linkedObligations.length})
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRisk.linkedObligations.map((oblId) => (
                    <Badge key={oblId} variant="secondary">
                      {oblId}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleLinkObligations(selectedRisk)}
                  data-testid="button-link-obligations"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Link Obligations
                </Button>
              </div>

              <div>
                <Label className="text-sm font-semibold">Control References</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRisk.controlRefs.map((ref) => (
                    <Badge key={ref} variant="outline">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Existing Controls</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRisk.existingControls}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  RASCI Matrix
                </Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {Object.entries(selectedRisk.rasci).map(([role, person]) => (
                    <div key={role} className="p-2 bg-muted rounded">
                      <div className="text-xs font-bold text-muted-foreground">{role}</div>
                      <div className="text-sm mt-1">{person}</div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAdoptRasci}
                  data-testid="button-adopt-rasci"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Adopt RASCI from Obligations
                </Button>
              </div>

              <div>
                <Label className="text-sm font-semibold">Treatment Plan</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRisk.treatmentPlan}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Early Warning Indicators</Label>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                  {selectedRisk.earlyWarnings.map((ew, i) => (
                    <li key={i}>{ew}</li>
                  ))}
                </ul>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Key Risk Indicators (KRIs)
                </Label>
                <div className="space-y-2 mt-2">
                  {selectedRisk.kris.map((kri, i) => (
                    <div key={i} className="p-3 bg-muted rounded flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{kri.metric}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Current: {kri.current}
                          {kri.unit} | Threshold: {kri.threshold}
                          {kri.unit}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getKRIColor(kri.status)}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                <Button variant="default" data-testid="button-create-assurance">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Create Assurance Test
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkObligationsOpen} onOpenChange={setIsLinkObligationsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link Obligations to {selectedRisk?.id}</DialogTitle>
            <DialogDescription>Select obligations to link to this risk</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {obligations.map((obl) => {
              const isLinked = selectedObligations.includes(obl.id);
              return (
                <div
                  key={obl.id}
                  className={`p-3 border rounded cursor-pointer hover-elevate ${
                    isLinked ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => {
                    if (isLinked) {
                      setSelectedObligations(selectedObligations.filter((id) => id !== obl.id));
                    } else {
                      setSelectedObligations([...selectedObligations, obl.id]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{obl.id}: {obl.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{obl.source}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsLinkObligationsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLinkObligations} data-testid="button-save-link-obligations">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
