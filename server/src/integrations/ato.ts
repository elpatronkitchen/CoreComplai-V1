export interface STPPayEvent {
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  tax: number;
  superannuation: number;
}

export interface STPResponse {
  success: boolean;
  receiptId?: string;
  error?: string;
}

export async function submitSTPEvent(event: STPPayEvent): Promise<STPResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    receiptId: `STP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export async function getSTPreceiptStatus(receiptId: string): Promise<{ status: string; processedAt?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    status: "processed",
    processedAt: new Date().toISOString(),
  };
}
