import { randomUUID } from "crypto";

export interface STPReconResult {
  id: string;
  payRunId: string;
  payRunDate: string;
  stpReportedDate: string;
  daysLate: number;
  employeeCount: number;
}

export async function detectSTPDelays(): Promise<STPReconResult[]> {
  const mockResults: STPReconResult[] = [
    {
      id: randomUUID(),
      payRunId: "pr-0115",
      payRunDate: "2025-01-15",
      stpReportedDate: "2025-01-18",
      daysLate: 3,
      employeeCount: 45,
    },
    {
      id: randomUUID(),
      payRunId: "pr-0129",
      payRunDate: "2025-01-29",
      stpReportedDate: "2025-01-29",
      daysLate: 0,
      employeeCount: 45,
    },
  ];

  return mockResults.filter((r) => r.daysLate > 0);
}
