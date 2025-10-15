// Australian Payroll Statutory Timetable Helper

interface StatutoryDue {
  obligation: string;
  name: string;
  frequency: 'Pay Run' | 'Monthly' | 'Quarterly' | 'Annual';
  daysAfterPeriod: number;
  description: string;
}

export const STATUTORY_TIMETABLE: StatutoryDue[] = [
  {
    obligation: 'OBL-ATO-003',
    name: 'STP Pay Events',
    frequency: 'Pay Run',
    daysAfterPeriod: 0,
    description: 'STP pay events must be reported on or before pay day'
  },
  {
    obligation: 'OBL-ATO-003',
    name: 'STP Finalisation',
    frequency: 'Annual',
    daysAfterPeriod: 14,
    description: 'STP finalisation due by 14 July following financial year end'
  },
  {
    obligation: 'OBL-SUP-001',
    name: 'Superannuation Guarantee',
    frequency: 'Quarterly',
    daysAfterPeriod: 28,
    description: 'SG contributions due 28 days after quarter end'
  },
  {
    obligation: 'OBL-SUP-003',
    name: 'SuperStream Lodgement',
    frequency: 'Quarterly',
    daysAfterPeriod: 28,
    description: 'SuperStream contributions due 28 days after quarter end'
  },
  {
    obligation: 'OBL-ATO-001',
    name: 'BAS PAYG-W (Monthly)',
    frequency: 'Monthly',
    daysAfterPeriod: 21,
    description: 'Monthly BAS due 21 days after month end'
  },
  {
    obligation: 'OBL-ATO-001',
    name: 'BAS PAYG-W (Quarterly)',
    frequency: 'Quarterly',
    daysAfterPeriod: 28,
    description: 'Quarterly BAS due 28 days after quarter end'
  },
  {
    obligation: 'OBL-PTX-001',
    name: 'NSW Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'NSW payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-PTX-002',
    name: 'VIC Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'VIC payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-PTX-003',
    name: 'QLD Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'QLD payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-PTX-004',
    name: 'WA Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'WA payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-PTX-005',
    name: 'SA Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'SA payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-PTX-006',
    name: 'TAS Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'TAS payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-PTX-007',
    name: 'ACT Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'ACT payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-PTX-008',
    name: 'NT Payroll Tax',
    frequency: 'Monthly',
    daysAfterPeriod: 7,
    description: 'NT payroll tax due 7 days after month end'
  },
  {
    obligation: 'OBL-WC-001',
    name: 'Workers Comp Declaration',
    frequency: 'Quarterly',
    daysAfterPeriod: 14,
    description: 'Workers comp wage declaration due 14 days after quarter end'
  },
  {
    obligation: 'OBL-PLSL-001',
    name: 'Portable LSL Return',
    frequency: 'Quarterly',
    daysAfterPeriod: 14,
    description: 'Portable LSL return due 14 days after quarter end'
  },
  {
    obligation: 'OBL-FW-004',
    name: 'Payslip Issuance',
    frequency: 'Pay Run',
    daysAfterPeriod: 1,
    description: 'Payslips must be issued within 1 working day of payment'
  }
];

// Get quarter end dates for a given year
export function getQuarterEndDates(year: number): Date[] {
  return [
    new Date(year, 8, 30),   // 30 Sep
    new Date(year, 11, 31),  // 31 Dec
    new Date(year + 1, 2, 31), // 31 Mar
    new Date(year + 1, 5, 30)  // 30 Jun
  ];
}

// Get month end date
export function getMonthEndDate(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

// Calculate statutory due date for an obligation
export function getStatutoryDueDate(
  obligationId: string,
  periodEnd: Date
): Date | null {
  const statutory = STATUTORY_TIMETABLE.find(s => s.obligation === obligationId);
  if (!statutory) return null;

  const dueDate = new Date(periodEnd);
  dueDate.setDate(dueDate.getDate() + statutory.daysAfterPeriod);
  
  return dueDate;
}

// Get next due date for obligation (forward-looking)
export function getNextDueDate(
  obligationId: string,
  fromDate: Date = new Date()
): Date | null {
  const statutory = STATUTORY_TIMETABLE.find(s => s.obligation === obligationId);
  if (!statutory) return null;

  const year = fromDate.getFullYear();
  
  if (statutory.frequency === 'Quarterly') {
    const quarters = getQuarterEndDates(year);
    for (const quarterEnd of quarters) {
      const dueDate = getStatutoryDueDate(obligationId, quarterEnd);
      if (dueDate && dueDate > fromDate) {
        return dueDate;
      }
    }
    // If no quarter found this year, return first quarter of next year
    const nextYearQ1 = getQuarterEndDates(year + 1)[0];
    return getStatutoryDueDate(obligationId, nextYearQ1);
  }
  
  if (statutory.frequency === 'Monthly') {
    const currentMonth = fromDate.getMonth();
    const monthEnd = getMonthEndDate(year, currentMonth);
    const dueDate = getStatutoryDueDate(obligationId, monthEnd);
    if (dueDate && dueDate > fromDate) {
      return dueDate;
    }
    // Next month
    const nextMonthEnd = getMonthEndDate(year, currentMonth + 1);
    return getStatutoryDueDate(obligationId, nextMonthEnd);
  }
  
  if (statutory.frequency === 'Annual') {
    // Australian financial year ends 30 June
    const fyEnd = new Date(year, 5, 30);
    const dueDate = getStatutoryDueDate(obligationId, fyEnd);
    if (dueDate && dueDate > fromDate) {
      return dueDate;
    }
    // Next FY
    const nextFyEnd = new Date(year + 1, 5, 30);
    return getStatutoryDueDate(obligationId, nextFyEnd);
  }
  
  return null;
}

// Get all upcoming due dates within a period
export function getUpcomingDueDates(
  fromDate: Date,
  toDate: Date
): Array<{ obligation: string; name: string; dueDate: Date; description: string }> {
  const upcoming: Array<{ obligation: string; name: string; dueDate: Date; description: string }> = [];
  
  STATUTORY_TIMETABLE.forEach(statutory => {
    const nextDue = getNextDueDate(statutory.obligation, fromDate);
    if (nextDue && nextDue <= toDate) {
      upcoming.push({
        obligation: statutory.obligation,
        name: statutory.name,
        dueDate: nextDue,
        description: statutory.description
      });
    }
  });
  
  return upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
