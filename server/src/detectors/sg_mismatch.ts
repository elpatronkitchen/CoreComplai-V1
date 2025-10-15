import { randomUUID } from "crypto";

export interface SGMismatchResult {
  id: string;
  employeeId: string;
  employeeName: string;
  expectedSG: number;
  actualSG: number;
  variance: number;
  variancePercent: number;
  period: string;
}

export async function detectSGMismatches(): Promise<SGMismatchResult[]> {
  const mockResults: SGMismatchResult[] = [
    {
      id: randomUUID(),
      employeeId: "emp-1234",
      employeeName: "John Smith",
      expectedSG: 1200,
      actualSG: 1150,
      variance: -50,
      variancePercent: -4.17,
      period: "2025-Q2",
    },
    {
      id: randomUUID(),
      employeeId: "emp-5678",
      employeeName: "Jane Doe",
      expectedSG: 2500,
      actualSG: 2450,
      variance: -50,
      variancePercent: -2.0,
      period: "2025-Q2",
    },
  ];

  return mockResults.filter((r) => Math.abs(r.variancePercent) > 2.0);
}
