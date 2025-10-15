export interface XeroEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  startDate: string;
  employmentType: string;
}

export interface XeroPayrun {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  status: string;
}

export async function getXeroEmployees(): Promise<XeroEmployee[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: "xe-001",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      startDate: "2023-01-15",
      employmentType: "FULLTIME",
    },
    {
      id: "xe-002",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      startDate: "2023-06-01",
      employmentType: "PARTTIME",
    },
  ];
}

export async function getXeroPayruns(fromDate: string, toDate: string): Promise<XeroPayrun[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: "pr-xero-001",
      payPeriodStart: "2025-01-01",
      payPeriodEnd: "2025-01-15",
      paymentDate: "2025-01-15",
      status: "Posted",
    },
    {
      id: "pr-xero-002",
      payPeriodStart: "2025-01-16",
      payPeriodEnd: "2025-01-31",
      paymentDate: "2025-01-31",
      status: "Posted",
    },
  ];
}
