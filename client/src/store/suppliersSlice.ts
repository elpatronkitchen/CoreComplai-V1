import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Supplier {
  id: string;
  name: string;
  type: 'Material' | 'Service' | 'Equipment' | 'Subcontractor';
  status: 'Approved' | 'Conditional' | 'Suspended' | 'Under Evaluation';
  approvalDate?: string;
  nextReEvaluationDate?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  products: string[];
  criticalSupplier: boolean;
  evaluationScore?: number;
  evaluations: SupplierEvaluation[];
  linkedControls: string[];
  linkedObligations: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierEvaluation {
  id: string;
  supplierId: string;
  evaluationDate: string;
  evaluator: string;
  criteria: EvaluationCriteria[];
  overallScore: number;
  recommendation: 'Approve' | 'Conditional Approval' | 'Reject' | 'Re-evaluate';
  comments?: string;
  nextReviewDate?: string;
}

export interface EvaluationCriteria {
  criterion: string;
  weight: number;
  score: number;
  comments?: string;
}

interface SuppliersState {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'evaluations'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addEvaluation: (supplierId: string, evaluation: Omit<SupplierEvaluation, 'id' | 'supplierId'>) => void;
  getSupplierById: (id: string) => Supplier | undefined;
}

export const useSuppliersStore = create<SuppliersState>()(
  persist(
    (set, get) => ({
  suppliers: [],
  
  addSupplier: (supplierData) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `SUP-${Date.now()}`,
      evaluations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      suppliers: [...state.suppliers, newSupplier],
    }));
  },
  
  updateSupplier: (id, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      ),
    }));
  },
  
  deleteSupplier: (id) => {
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
  },
  
  addEvaluation: (supplierId, evaluationData) => {
    const evaluation: SupplierEvaluation = {
      ...evaluationData,
      id: `EVAL-${Date.now()}`,
      supplierId,
    };
    
    set((state) => ({
      suppliers: state.suppliers.map((s) => {
        if (s.id === supplierId) {
          const updatedEvaluations = [...s.evaluations, evaluation];
          
          const calculatedNextReview = evaluation.nextReviewDate || (() => {
            const evaluationDate = new Date(evaluation.evaluationDate);
            const monthsToAdd = s.criticalSupplier ? 6 : 12;
            evaluationDate.setMonth(evaluationDate.getMonth() + monthsToAdd);
            return evaluationDate.toISOString().split('T')[0];
          })();
          
          return {
            ...s,
            evaluations: updatedEvaluations,
            evaluationScore: evaluation.overallScore,
            status: evaluation.recommendation === 'Approve' ? 'Approved' : 
                    evaluation.recommendation === 'Conditional Approval' ? 'Conditional' :
                    evaluation.recommendation === 'Reject' ? 'Suspended' : 'Under Evaluation',
            nextReEvaluationDate: calculatedNextReview,
            approvalDate: evaluation.recommendation === 'Approve' ? evaluation.evaluationDate : s.approvalDate,
            updatedAt: new Date(),
          };
        }
        return s;
      }),
    }));
  },
  
  getSupplierById: (id) => {
    return get().suppliers.find((s) => s.id === id);
  },
}),
    {
      name: 'suppliers-storage',
    }
  )
);
