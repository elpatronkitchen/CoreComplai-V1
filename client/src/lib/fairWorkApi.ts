// Fair Work Commission API integration for payroll compliance
// Based on Modern Awards Pay Database API (MAPD API)
import type { Notification } from '@shared/schema';

interface FairWorkAward {
  id: string;
  name: string;
  code: string;
  effectiveDate: string;
  rates: FairWorkRate[];
}

interface FairWorkRate {
  classification: string;
  level: string;
  minimumRate: number;
  effectiveDate: string;
  currency: 'AUD';
}

interface ComplianceEvent {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  type: 'wage_review' | 'award_update' | 'minimum_wage' | 'penalty_rate';
  source: 'fair_work';
  priority: 'critical' | 'high' | 'medium';
  affectedAwards?: string[];
}

// Mock Fair Work API responses (in production, these would be real API calls)
export class FairWorkApiService {
  private static readonly API_BASE = 'https://developer.fwc.gov.au';
  
  // Mock API key - in production, this would be managed through Replit secrets
  private static readonly API_KEY = 'mock_fair_work_api_key';

  static async getAwards(): Promise<FairWorkAward[]> {
    // Mock response - simulates Fair Work Commission awards data
    return [
      {
        id: 'MA000001',
        name: 'Black Coal Mining Industry Award 2020',
        code: 'MA000001',
        effectiveDate: '2024-07-01',
        rates: [
          {
            classification: 'Mining production employee level 1',
            level: 'Level 1',
            minimumRate: 24.10,
            effectiveDate: '2024-07-01',
            currency: 'AUD'
          }
        ]
      },
      {
        id: 'MA000003',
        name: 'Building and Construction General On-site Award 2020',
        code: 'MA000003',
        effectiveDate: '2024-07-01',
        rates: [
          {
            classification: 'Construction worker level 1',
            level: 'Level 1',
            minimumRate: 25.45,
            effectiveDate: '2024-07-01',
            currency: 'AUD'
          }
        ]
      }
    ];
  }

  static async getCurrentMinimumWage(): Promise<{ rate: number; effectiveDate: string }> {
    // Mock current national minimum wage
    return {
      rate: 24.10, // Current as of July 1, 2024
      effectiveDate: '2024-07-01'
    };
  }

  static async getUpcomingComplianceEvents(): Promise<ComplianceEvent[]> {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: 'fw-2025-wage-review',
        title: 'Annual Wage Review 2025',
        description: 'New minimum wage rates take effect. Update all payroll systems and employee contracts.',
        eventDate: new Date(currentYear, 6, 1), // July 1
        type: 'wage_review',
        source: 'fair_work',
        priority: 'critical',
        affectedAwards: ['MA000001', 'MA000003', 'MA000010']
      },
      {
        id: 'fw-2025-penalty-rates',
        title: 'Penalty Rates Update',
        description: 'Updated penalty rates for weekend and public holiday work.',
        eventDate: new Date(currentYear, 6, 1),
        type: 'penalty_rate',
        source: 'fair_work',
        priority: 'high',
        affectedAwards: ['MA000003']
      },
      {
        id: 'fw-award-ma000001-update',
        title: 'Black Coal Mining Award Update',
        description: 'Classification changes and new allowances for mining industry.',
        eventDate: new Date(currentYear, 8, 1), // September 1
        type: 'award_update',
        source: 'fair_work',
        priority: 'medium',
        affectedAwards: ['MA000001']
      }
    ];
  }

  static async getPayrollComplianceTasks(): Promise<any[]> {
    // Generate payroll compliance tasks based on Fair Work requirements
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return [
      {
        id: 'fw-wage-compliance-check',
        title: 'Verify Award Rate Compliance',
        description: 'Check all employee rates against current Fair Work award minimums',
        dueDate: new Date(currentYear, currentMonth, 25), // 25th of each month
        type: 'compliance',
        priority: 'critical',
        category: 'pre_payroll',
        source: 'fair_work',
        recurring: { frequency: 'monthly' },
        metadata: {
          awardTypes: ['MA000001', 'MA000003'],
          checkType: 'minimum_wage_compliance'
        }
      },
      {
        id: 'fw-penalty-rates-calc',
        title: 'Calculate Weekend/Holiday Penalty Rates',
        description: 'Apply correct penalty rates for weekend and public holiday work',
        dueDate: new Date(currentYear, currentMonth, 26),
        type: 'payroll',
        priority: 'high',
        category: 'pre_payroll',
        source: 'fair_work',
        recurring: { frequency: 'monthly' }
      },
      {
        id: 'fw-allowances-check',
        title: 'Apply Required Allowances',
        description: 'Ensure all applicable allowances are included in pay calculation',
        dueDate: new Date(currentYear, currentMonth, 27),
        type: 'payroll',
        priority: 'medium',
        category: 'pre_payroll',
        source: 'fair_work',
        recurring: { frequency: 'monthly' }
      }
    ];
  }

  // Mock method to check for award updates
  static async checkForUpdates(): Promise<{ hasUpdates: boolean; updates: any[] }> {
    // In production, this would check for recent changes in awards/rates
    const mockUpdates = [];
    
    // Simulate checking if there are recent updates
    const lastCheck = localStorage.getItem('last_fair_work_check');
    const now = new Date().getTime();
    
    if (!lastCheck || (now - parseInt(lastCheck)) > 24 * 60 * 60 * 1000) { // 24 hours
      mockUpdates.push({
        type: 'rate_update',
        message: 'Minimum wage rates updated for July 2024',
        date: '2024-07-01',
        affectedAwards: ['MA000001', 'MA000003']
      });
      
      localStorage.setItem('last_fair_work_check', now.toString());
    }

    return {
      hasUpdates: mockUpdates.length > 0,
      updates: mockUpdates
    };
  }
}

// ATO API integration for tax compliance
export class ATOApiService {
  static async getComplianceDates(): Promise<any[]> {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: 'ato-bas-q1',
        title: 'BAS Lodgement - Q1',
        description: 'Business Activity Statement for Q1 due',
        dueDate: new Date(currentYear, 3, 28), // April 28
        type: 'compliance',
        priority: 'critical',
        source: 'ato',
        category: 'quarterly'
      },
      {
        id: 'ato-payg-monthly',
        title: 'PAYG Withholding',
        description: 'Monthly PAYG withholding payment due',
        dueDate: new Date(currentYear, new Date().getMonth(), 21), // 21st each month
        type: 'compliance',
        priority: 'critical',
        source: 'ato',
        category: 'monthly',
        recurring: { frequency: 'monthly' }
      },
      {
        id: 'ato-super-guarantee',
        title: 'Superannuation Guarantee',
        description: 'Quarterly superannuation guarantee contributions due',
        dueDate: new Date(currentYear, new Date().getMonth() + 1, 28), // 28th of month after quarter
        type: 'payroll',
        priority: 'critical',
        source: 'ato',
        category: 'quarterly',
        recurring: { frequency: 'quarterly' }
      },
      {
        id: 'ato-single-touch',
        title: 'Single Touch Payroll',
        description: 'Submit payroll information via Single Touch Payroll',
        dueDate: new Date(currentYear, new Date().getMonth(), 28), // Next pay day
        type: 'compliance',
        priority: 'high',
        source: 'ato',
        category: 'monthly',
        recurring: { frequency: 'monthly' }
      }
    ];
  }

  static async getTaxRateUpdates(): Promise<any[]> {
    return [
      {
        id: 'ato-tax-rate-2024',
        title: 'Tax Rate Changes 2024-25',
        description: 'Updated personal income tax rates and thresholds',
        effectiveDate: '2024-07-01',
        type: 'tax_rate_update',
        priority: 'critical'
      }
    ];
  }
}

// Task assignment service
export const TaskAssignmentService = {
  async assignTask(taskId: string, assigneeId: string, assignedBy: string): Promise<void> {
    // Mock task assignment - in production, this would update the database
    console.log(`Task ${taskId} assigned to ${assigneeId} by ${assignedBy}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async getMyAssignedTasks(userId: string): Promise<any[]> {
    // Mock assigned tasks - would fetch from database
    return [];
  },

  async createTaskAssignmentNotification(task: any, assignee: string): Promise<Omit<Notification, 'id'>> {
    return {
      title: 'New Task Assigned',
      message: `You have been assigned: ${task.title}`,
      type: 'info' as const,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: {
        taskId: task.id,
        taskType: task.type,
        dueDate: task.dueDate?.toISOString?.() || task.dueDate,
        priority: task.priority,
        assignedBy: task.assignedBy
      }
    };
  }
};