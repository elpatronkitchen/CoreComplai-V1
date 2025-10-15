import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmployeeClassification {
  employeeId: string;
  employeeName: string;
  currentClassification?: {
    award: string;
    level: string;
    approvedBy: string;
    approvedDate: string;
    confidence: number;
  };
  precedents: Array<{
    award: string;
    level: string;
    note: string;
    createdAt: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
}

interface ClassificationAuditStore {
  employeeClassifications: EmployeeClassification[];
  totalEmployees: number;
  
  setTotalEmployees: (count: number) => void;
  
  setClassification: (
    employeeId: string,
    employeeName: string,
    award: string,
    level: string,
    approvedBy: string
  ) => void;
  
  addPrecedent: (
    employeeId: string,
    award: string,
    level: string,
    note: string
  ) => void;
  
  updateStatus: (
    employeeId: string,
    status: EmployeeClassification['status']
  ) => void;
  
  getCoveragePercentage: () => number;
  
  getApprovedCount: () => number;
  
  getClassificationByEmployee: (employeeId: string) => EmployeeClassification | undefined;
  
  clearAll: () => void;
}

export const useClassificationAuditStore = create<ClassificationAuditStore>()(
  persist(
    (set, get) => ({
      employeeClassifications: [],
      totalEmployees: 0,
      
      setTotalEmployees: (count) => set({ totalEmployees: count }),
      
      setClassification: (employeeId, employeeName, award, level, approvedBy) => {
        const { employeeClassifications } = get();
        const existing = employeeClassifications.find(ec => ec.employeeId === employeeId);
        
        if (existing) {
          set({
            employeeClassifications: employeeClassifications.map(ec =>
              ec.employeeId === employeeId
                ? {
                    ...ec,
                    currentClassification: {
                      award,
                      level,
                      approvedBy,
                      approvedDate: new Date().toISOString(),
                      confidence: 95,
                    },
                    status: 'approved' as const,
                  }
                : ec
            ),
          });
        } else {
          set({
            employeeClassifications: [
              ...employeeClassifications,
              {
                employeeId,
                employeeName,
                currentClassification: {
                  award,
                  level,
                  approvedBy,
                  approvedDate: new Date().toISOString(),
                  confidence: 95,
                },
                precedents: [],
                status: 'approved',
              },
            ],
          });
        }
      },
      
      addPrecedent: (employeeId, award, level, note) => {
        const { employeeClassifications } = get();
        
        set({
          employeeClassifications: employeeClassifications.map(ec =>
            ec.employeeId === employeeId
              ? {
                  ...ec,
                  precedents: [
                    ...ec.precedents,
                    {
                      award,
                      level,
                      note,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : ec
          ),
        });
      },
      
      updateStatus: (employeeId, status) => {
        const { employeeClassifications } = get();
        
        set({
          employeeClassifications: employeeClassifications.map(ec =>
            ec.employeeId === employeeId
              ? { ...ec, status }
              : ec
          ),
        });
      },
      
      getCoveragePercentage: () => {
        const { employeeClassifications, totalEmployees } = get();
        
        if (totalEmployees === 0) return 0;
        
        const approvedCount = employeeClassifications.filter(
          ec => ec.status === 'approved' && ec.currentClassification
        ).length;
        
        return Math.floor((approvedCount / totalEmployees) * 100);
      },
      
      getApprovedCount: () => {
        const { employeeClassifications } = get();
        return employeeClassifications.filter(
          ec => ec.status === 'approved' && ec.currentClassification
        ).length;
      },
      
      getClassificationByEmployee: (employeeId) => {
        const { employeeClassifications } = get();
        return employeeClassifications.find(ec => ec.employeeId === employeeId);
      },
      
      clearAll: () => set({ employeeClassifications: [], totalEmployees: 0 }),
    }),
    {
      name: 'classification-audit-storage',
    }
  )
);
