// Risk entity types matching backend CoreComply.Api.Domain.Entities.Risk

export interface Risk {
  id: number;
  title: string;
  description: string;
  category: string; // operational, financial, compliance, strategic
  likelihood: string; // low, medium, high
  impact: string; // low, medium, high, critical
  status: string; // open, mitigating, closed
  owner: string;
  identifiedDate: string;
  reviewDate?: string | null;
  mitigation?: string | null;
  createdAt: string;
}

export interface CreateRiskRequest {
  title: string;
  description: string;
  category: string;
  likelihood: string;
  impact: string;
  owner: string;
  reviewDate?: string | null;
}

export interface UpdateRiskRequest {
  title: string;
  description: string;
  category: string;
  likelihood: string;
  impact: string;
  status: string;
  owner: string;
  reviewDate?: string | null;
  mitigation?: string | null;
}

// Helper function to calculate risk rating from likelihood and impact
export function calculateRiskRating(likelihood: string, impact: string): string {
  const likelihoodScore: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3
  };

  const impactScore: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  const lScore = likelihoodScore[likelihood.toLowerCase()] || 2;
  const iScore = impactScore[impact.toLowerCase()] || 2;
  const total = lScore * iScore;

  if (total >= 9) return 'Critical';
  if (total >= 6) return 'High';
  if (total >= 4) return 'Medium';
  return 'Low';
}

// Helper function to get risk rating color for badges
export function getRiskRatingColor(rating: string): "default" | "destructive" | "secondary" | "outline" {
  switch (rating.toLowerCase()) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
}

// Helper function to get status color for badges
export function getStatusColor(status: string): "default" | "destructive" | "secondary" | "outline" {
  switch (status.toLowerCase()) {
    case 'open':
      return 'destructive';
    case 'mitigating':
      return 'secondary';
    case 'closed':
      return 'outline';
    default:
      return 'secondary';
  }
}
