import { randomUUID } from "crypto";

export interface PayslipSLAResult {
  id: string;
  batchId: string;
  payDate: string;
  deliveredDate: string;
  hoursToDeliver: number;
  slaThresholdHours: number;
  breached: boolean;
}

export async function detectPayslipSLABreaches(): Promise<PayslipSLAResult[]> {
  const mockResults: PayslipSLAResult[] = [
    {
      id: randomUUID(),
      batchId: "batch-0122",
      payDate: "2025-01-22",
      deliveredDate: "2025-01-25T12:00:00Z",
      hoursToDeliver: 72,
      slaThresholdHours: 48,
      breached: true,
    },
    {
      id: randomUUID(),
      batchId: "batch-0205",
      payDate: "2025-02-05",
      deliveredDate: "2025-02-06T10:00:00Z",
      hoursToDeliver: 34,
      slaThresholdHours: 48,
      breached: false,
    },
  ];

  return mockResults.filter((r) => r.breached);
}
