import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockFileUpload } from '@/lib/mockApi';
import { useAppStore } from '@/lib/store';
import { EvidenceType } from '@shared/schema';
import type { z } from 'zod';

interface FileUploaderProps {
  controlId: string;
  onUploadComplete?: (evidence: any) => void;
  className?: string;
}

interface EvidenceMetadata {
  type: z.infer<typeof EvidenceType>;
  description: string;
  period: string;
  tags: string[];
  // Finance-specific metadata
  reportType?: string;
  financialPeriod?: string;
  reference?: string;
}

export default function FileUploader({ controlId, onUploadComplete, className }: FileUploaderProps) {
  const { currentUser, addEvidence, addAccessLog, addNotification } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState<EvidenceMetadata>({
    type: 'General' as z.infer<typeof EvidenceType>,
    description: '',
    period: '',
    tags: [],
    reportType: '',
    financialPeriod: '',
    reference: ''
  });

  const isFinanceManager = currentUser?.role === 'finance_manager';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;

    setIsUploading(true);
    try {
      const uploadResult = await mockFileUpload(selectedFile, metadata);
      
      const evidence = {
        controlId,
        filename: uploadResult.filename,
        type: metadata.type,
        description: metadata.description,
        period: metadata.period,
        tags: [
          ...metadata.tags,
          ...(isFinanceManager && metadata.type === 'Finance' ? ['finance'] : []),
          ...(metadata.reportType ? [metadata.reportType] : []),
        ],
        hash: uploadResult.hash,
        uploadedBy: currentUser.name,
      };

      addEvidence(evidence);
      
      addAccessLog({
        entityType: 'evidence',
        entityId: uploadResult.id,
        action: 'create',
        actor: currentUser.name,
        metadata: { controlId, filename: uploadResult.filename }
      });

      addNotification({
        title: 'Evidence Uploaded',
        message: `${uploadResult.filename} has been uploaded successfully`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });

      onUploadComplete?.(evidence);
      setIsOpen(false);
      setSelectedFile(null);
      setMetadata({
        type: 'General' as z.infer<typeof EvidenceType>,
        description: '',
        period: '',
        tags: [],
        reportType: '',
        financialPeriod: '',
        reference: ''
      });
    } catch (error) {
      console.error('Upload failed:', error);
      addNotification({
        title: 'Upload Failed',
        message: 'Failed to upload evidence. Please try again.',
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("gap-2", className)}
          data-testid="button-upload-evidence"
        >
          <Upload className="h-4 w-4" />
          Upload Evidence
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Evidence</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Selection */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              selectedFile ? "bg-muted/50" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <File className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  data-testid="button-remove-file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop a file here, or click to browse
                </p>
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  className="max-w-xs mx-auto"
                  data-testid="input-file-upload"
                />
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="evidence-type">Evidence Type</Label>
              <Select value={metadata.type} onValueChange={(value) => setMetadata({ ...metadata, type: value as z.infer<typeof EvidenceType> })}>
                <SelectTrigger data-testid="select-evidence-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={metadata.period}
                onChange={(e) => setMetadata({ ...metadata, period: e.target.value })}
                placeholder="e.g., Q4 2023, Jan 2024"
                data-testid="input-evidence-period"
              />
            </div>
          </div>

          {/* Finance-specific fields */}
          {isFinanceManager && metadata.type === 'Finance' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={metadata.reportType} onValueChange={(value) => setMetadata({ ...metadata, reportType: value })}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial-statement">Financial Statement</SelectItem>
                    <SelectItem value="superannuation-proof">Superannuation Proof</SelectItem>
                    <SelectItem value="tax-reconciliation">Tax Reconciliation</SelectItem>
                    <SelectItem value="payroll-summary">Payroll Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="financial-period">Financial Period</Label>
                <Input
                  id="financial-period"
                  value={metadata.financialPeriod}
                  onChange={(e) => setMetadata({ ...metadata, financialPeriod: e.target.value })}
                  placeholder="e.g., FY2023-Q4"
                  data-testid="input-financial-period"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={metadata.reference}
                  onChange={(e) => setMetadata({ ...metadata, reference: e.target.value })}
                  placeholder="e.g., REF-FIN-2024-001"
                  data-testid="input-reference"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              placeholder="Describe the evidence and its relevance to the control"
              rows={3}
              data-testid="textarea-evidence-description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} data-testid="button-cancel-upload">
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              data-testid="button-confirm-upload"
            >
              {isUploading ? 'Uploading...' : 'Upload Evidence'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}