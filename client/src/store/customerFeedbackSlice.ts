import { create } from 'zustand';

export interface CustomerFeedback {
  id: string;
  feedbackNumber: string;
  type: 'Complaint' | 'Compliment' | 'Suggestion' | 'Survey Response' | 'Other';
  source: 'Email' | 'Phone' | 'In Person' | 'Survey' | 'Social Media' | 'Website' | 'Other';
  status: 'Open' | 'Under Investigation' | 'Action Required' | 'Resolved' | 'Closed';
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  
  customerName?: string;
  customerContact?: string;
  dateReceived: string;
  receivedBy: string;
  
  description: string;
  product?: string;
  process?: string;
  
  investigation?: {
    investigatedBy: string;
    investigationDate: string;
    findings: string;
    rootCause?: string;
  };
  
  response?: {
    responseBy: string;
    responseDate: string;
    responseText: string;
    customerNotified: boolean;
  };
  
  linkedNCId?: string;
  linkedControls: string[];
  linkedObligations: string[];
  
  satisfactionRating?: number;
  
  closedDate?: string;
  closedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSurvey {
  id: string;
  surveyName: string;
  period: string;
  responseCount: number;
  averageRating: number;
  npsScore?: number;
  responses: SurveyResponse[];
  createdAt: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  customerName?: string;
  rating: number;
  comments?: string;
  responseDate: string;
}

interface CustomerFeedbackState {
  feedback: CustomerFeedback[];
  surveys: CustomerSurvey[];
  
  addFeedback: (fb: Omit<CustomerFeedback, 'id' | 'feedbackNumber' | 'createdAt' | 'updatedAt'>) => string;
  updateFeedback: (id: string, updates: Partial<CustomerFeedback>) => void;
  deleteFeedback: (id: string) => void;
  addInvestigation: (id: string, investigation: CustomerFeedback['investigation']) => void;
  addResponse: (id: string, response: CustomerFeedback['response']) => void;
  closeFeedback: (id: string, closedBy: string) => void;
  
  addSurvey: (survey: Omit<CustomerSurvey, 'id' | 'createdAt'>) => void;
  addSurveyResponse: (surveyId: string, response: Omit<SurveyResponse, 'id' | 'surveyId'>) => void;
  
  getFeedbackById: (id: string) => CustomerFeedback | undefined;
  getTrendsByType: (startDate?: string, endDate?: string) => Record<string, number>;
  getTrendsBySeverity: (startDate?: string, endDate?: string) => Record<string, number>;
  getAverageSatisfactionRating: (startDate?: string, endDate?: string) => number;
  getComplaintResolutionTime: () => { average: number; median: number };
}

export const useCustomerFeedbackStore = create<CustomerFeedbackState>((set, get) => ({
  feedback: [],
  surveys: [],
  
  addFeedback: (fbData) => {
    const feedbackNumber = `FB-${String(get().feedback.length + 1).padStart(4, '0')}`;
    const newFB: CustomerFeedback = {
      ...fbData,
      id: `fb-${Date.now()}`,
      feedbackNumber,
      linkedControls: fbData.linkedControls || [],
      linkedObligations: fbData.linkedObligations || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      feedback: [...state.feedback, newFB],
    }));
    return newFB.id;
  },
  
  updateFeedback: (id, updates) => {
    set((state) => ({
      feedback: state.feedback.map((fb) =>
        fb.id === id ? { ...fb, ...updates, updatedAt: new Date() } : fb
      ),
    }));
  },
  
  deleteFeedback: (id) => {
    set((state) => ({
      feedback: state.feedback.filter((fb) => fb.id !== id),
    }));
  },
  
  addInvestigation: (id, investigation) => {
    set((state) => ({
      feedback: state.feedback.map((fb) =>
        fb.id === id
          ? { ...fb, investigation, status: 'Under Investigation', updatedAt: new Date() }
          : fb
      ),
    }));
  },
  
  addResponse: (id, response) => {
    set((state) => ({
      feedback: state.feedback.map((fb) =>
        fb.id === id
          ? { ...fb, response, status: 'Resolved', updatedAt: new Date() }
          : fb
      ),
    }));
  },
  
  closeFeedback: (id, closedBy) => {
    set((state) => ({
      feedback: state.feedback.map((fb) =>
        fb.id === id
          ? {
              ...fb,
              status: 'Closed',
              closedDate: new Date().toISOString().split('T')[0],
              closedBy,
              updatedAt: new Date(),
            }
          : fb
      ),
    }));
  },
  
  addSurvey: (surveyData) => {
    const newSurvey: CustomerSurvey = {
      ...surveyData,
      id: `survey-${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({
      surveys: [...state.surveys, newSurvey],
    }));
  },
  
  addSurveyResponse: (surveyId, responseData) => {
    const response: SurveyResponse = {
      ...responseData,
      id: `resp-${Date.now()}`,
      surveyId,
    };
    
    set((state) => ({
      surveys: state.surveys.map((s) => {
        if (s.id === surveyId) {
          const updatedResponses = [...s.responses, response];
          const avgRating = updatedResponses.reduce((sum, r) => sum + r.rating, 0) / updatedResponses.length;
          return {
            ...s,
            responses: updatedResponses,
            responseCount: updatedResponses.length,
            averageRating: avgRating,
          };
        }
        return s;
      }),
    }));
  },
  
  getFeedbackById: (id) => {
    return get().feedback.find((fb) => fb.id === id);
  },
  
  getTrendsByType: (startDate, endDate) => {
    const filtered = get().feedback.filter((fb) => {
      if (!startDate && !endDate) return true;
      const fbDate = new Date(fb.dateReceived);
      if (startDate && fbDate < new Date(startDate)) return false;
      if (endDate && fbDate > new Date(endDate)) return false;
      return true;
    });
    
    return filtered.reduce((acc, fb) => {
      acc[fb.type] = (acc[fb.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },
  
  getTrendsBySeverity: (startDate, endDate) => {
    const filtered = get().feedback.filter((fb) => {
      if (!fb.severity) return false;
      if (!startDate && !endDate) return true;
      const fbDate = new Date(fb.dateReceived);
      if (startDate && fbDate < new Date(startDate)) return false;
      if (endDate && fbDate > new Date(endDate)) return false;
      return true;
    });
    
    return filtered.reduce((acc, fb) => {
      if (fb.severity) {
        acc[fb.severity] = (acc[fb.severity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  },
  
  getAverageSatisfactionRating: (startDate, endDate) => {
    const filtered = get().feedback.filter((fb) => {
      if (fb.satisfactionRating === undefined) return false;
      if (!startDate && !endDate) return true;
      const fbDate = new Date(fb.dateReceived);
      if (startDate && fbDate < new Date(startDate)) return false;
      if (endDate && fbDate > new Date(endDate)) return false;
      return true;
    });
    
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, fb) => acc + (fb.satisfactionRating || 0), 0);
    return sum / filtered.length;
  },
  
  getComplaintResolutionTime: () => {
    const resolved = get().feedback.filter((fb) => 
      fb.type === 'Complaint' && fb.closedDate && fb.status === 'Closed'
    );
    
    if (resolved.length === 0) return { average: 0, median: 0 };
    
    const resolutionTimes = resolved.map((fb) => {
      const received = new Date(fb.dateReceived);
      const closed = new Date(fb.closedDate!);
      return Math.floor((closed.getTime() - received.getTime()) / (1000 * 60 * 60 * 24));
    });
    
    const average = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
    
    resolutionTimes.sort((a, b) => a - b);
    const median = resolutionTimes.length % 2 === 0
      ? (resolutionTimes[resolutionTimes.length / 2 - 1] + resolutionTimes[resolutionTimes.length / 2]) / 2
      : resolutionTimes[Math.floor(resolutionTimes.length / 2)];
    
    return { average, median };
  },
}));
