import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  Download,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface EvidenceArtifact {
  id: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  type: string;
  period?: { from: string; to: string };
  matches: Array<{
    type: string;
    id: string;
    confidence: number;
    reason: string;
  }>;
  status: 'pending' | 'accepted' | 'rejected';
  redacted: boolean;
  downloadUrl: string;
}

export default function EvidencePage() {
  const { toast } = useToast();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch evidence artifacts
  const { data: evidenceData, isLoading } = useQuery({
    queryKey: ['/api/evidence', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/evidence${params}`);
      return response.json();
    }
  });

  const artifacts: EvidenceArtifact[] = evidenceData?.artifacts || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      
      // Step 1: Get upload URL
      const urlResponse = await apiRequest('POST', '/api/evidence/upload-url', {
        filename: file.name,
        contentType: file.type,
      });

      const { evidenceId, uploadUrl } = await urlResponse.json();

      // Step 2: Simulate upload (in production, would upload to Azure Blob)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Complete upload and trigger AI matching
      const completeResponse = await apiRequest('POST', `/api/evidence/${evidenceId}/complete`, {
        period: {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      });

      return await completeResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evidence'] });
      setUploadFile(null);
      setIsUploading(false);
      toast({
        title: 'Evidence Uploaded',
        description: 'AI matching completed successfully',
      });
    },
    onError: () => {
      setIsUploading(false);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload evidence',
        variant: 'destructive',
      });
    },
  });

  const handleUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'STP': 'bg-blue-500',
      'SG': 'bg-green-500',
      'payslip': 'bg-purple-500',
      'BAS': 'bg-orange-500',
      'other': 'bg-gray-500',
    };
    return colors[type] || colors.other;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      accepted: { color: 'bg-green-500', icon: Check },
      rejected: { color: 'bg-red-500', icon: X },
      pending: { color: 'bg-amber-500', icon: AlertCircle },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <AppShell>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-evidence">
              Evidence Management
            </h1>
            <p className="text-muted-foreground">
              Upload and manage compliance evidence with AI-powered matching
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                disabled={isUploading}
                data-testid="input-file-upload"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || isUploading}
              data-testid="button-upload-evidence"
            >
              {isUploading ? 'Uploading & Matching...' : 'Upload & Match'}
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            data-testid="filter-all"
          >
            All ({artifacts.length})
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
            data-testid="filter-pending"
          >
            Pending ({artifacts.filter(a => a.status === 'pending').length})
          </Button>
          <Button
            variant={statusFilter === 'accepted' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('accepted')}
            data-testid="filter-accepted"
          >
            Accepted ({artifacts.filter(a => a.status === 'accepted').length})
          </Button>
        </div>

        {/* Evidence List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p>Loading evidence...</p>
              </CardContent>
            </Card>
          ) : artifacts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No evidence found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload files to start AI-powered matching
                </p>
              </CardContent>
            </Card>
          ) : (
            artifacts.map((artifact) => (
              <Card key={artifact.id} className="hover-elevate" data-testid={`artifact-${artifact.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{artifact.filename}</h3>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(artifact.uploadedAt).toLocaleDateString()} by {artifact.uploadedBy}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(artifact.type)}>{artifact.type}</Badge>
                          {getStatusBadge(artifact.status)}
                          {artifact.redacted && (
                            <Badge variant="outline">
                              <Shield className="h-3 w-3 mr-1" />
                              Redacted
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* AI Matches */}
                      {artifact.matches.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            AI Matches ({artifact.matches.length})
                          </p>
                          <div className="space-y-1">
                            {artifact.matches.map((match, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm bg-muted/50 rounded p-2"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {match.type}
                                  </Badge>
                                  <span className="font-mono text-xs">{match.id}</span>
                                  <span className="text-muted-foreground">{match.reason}</span>
                                </div>
                                <Badge variant="secondary">
                                  {(match.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-download-${artifact.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        {artifact.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              data-testid={`button-accept-${artifact.id}`}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              data-testid={`button-reject-${artifact.id}`}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
