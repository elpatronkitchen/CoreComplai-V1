import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const getStatusVariant = (status: string) => {
  const statusLower = status.toLowerCase().replace(/\s+/g, '_');
  
  switch (statusLower) {
    case 'compliant':
    case 'published':
    case 'certified':
      return 'default bg-compliance-compliant text-white';
    case 'in_progress':
    case 'in progress':
      return 'default bg-compliance-in-progress text-white';
    case 'evidence_pending':
    case 'evidence pending':
    case 'conditionally_certified':
    case 'conditionally certified':
      return 'default bg-compliance-evidence-pending text-white';
    case 'not_started':
    case 'not started':
    case 'not_certified':
    case 'not certified':
      return 'secondary';
    case 'audit_ready':
    case 'audit ready':
      return 'default bg-compliance-audit-ready text-white';
    case 'draft':
      return 'outline';
    case 'archived':
      return 'secondary';
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default bg-severity-high text-white';
    case 'medium':
      return 'default bg-severity-medium text-white';
    case 'low':
      return 'default bg-severity-low text-white';
    case 'info':
      return 'default bg-severity-info text-white';
    default:
      return 'secondary';
  }
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = getStatusVariant(status);
  
  return (
    <Badge 
      className={cn(variant.includes('bg-') ? variant : '', className)}
      variant={variant.includes('bg-') ? 'default' : variant as any}
      data-testid={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {status}
    </Badge>
  );
}