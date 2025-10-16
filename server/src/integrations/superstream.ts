export interface SuperContribution {
  employeeId: string;
  tfn: string;
  fundABN: string;
  amount: number;
  period: string;
}

export interface SuperStreamResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function submitSuperContributions(contributions: SuperContribution[]): Promise<SuperStreamResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    transactionId: `SS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export async function getSuperContributionStatus(transactionId: string): Promise<{ status: string; confirmations: number }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    status: "confirmed",
    confirmations: contributions.length || 1,
  };
}

const contributions: SuperContribution[] = [];
