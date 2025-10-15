import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StatutoryEvent = {
  id: string;
  title: string;
  type: 'BAS' | 'PAYG' | 'SG' | 'STP' | 'PayrollTax' | 'WorkersComp' | 'LSL';
  dueDate: Date;
  jurisdiction: string;
  obligationRef?: string;
};

interface TimetableState {
  events: StatutoryEvent[];
  basCycle?: 'monthly' | 'quarterly';
  paygRemitterType?: 'small' | 'medium' | 'large';
  sgSchedule?: 'quarterly';
  
  // Actions
  setBasCycle: (cycle: 'monthly' | 'quarterly') => void;
  setPaygRemitterType: (type: 'small' | 'medium' | 'large') => void;
  generateEvents: (footprint: { states: string[] }) => void;
  addEvent: (event: StatutoryEvent) => void;
  removeEvent: (id: string) => void;
  isConfigured: () => boolean;
}

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set, get) => ({
      events: [],
      basCycle: undefined,
      paygRemitterType: undefined,
      sgSchedule: 'quarterly',
      
      setBasCycle: (cycle) => {
        set({ basCycle: cycle });
      },
      
      setPaygRemitterType: (type) => {
        set({ paygRemitterType: type });
      },
      
      generateEvents: (footprint) => {
        const { basCycle, paygRemitterType } = get();
        const events: StatutoryEvent[] = [];
        const now = new Date();
        const year = now.getFullYear();
        
        // Generate SG events (quarterly)
        const sgQuarters = [
          { month: 3, day: 28, quarter: 'Q3' },
          { month: 6, day: 28, quarter: 'Q4' },
          { month: 9, day: 28, quarter: 'Q1' },
          { month: 0, day: 28, quarter: 'Q2' } // January next year
        ];
        
        sgQuarters.forEach(q => {
          const dueDate = new Date(q.month === 0 ? year + 1 : year, q.month, q.day);
          events.push({
            id: `sg-${q.quarter}-${year}`,
            title: `Superannuation Guarantee ${q.quarter}`,
            type: 'SG',
            dueDate,
            jurisdiction: 'Commonwealth',
            obligationRef: 'SG-001'
          });
        });
        
        // Generate BAS events
        if (basCycle === 'quarterly') {
          const basQuarters = [
            { month: 3, day: 28, quarter: 'Q3' },
            { month: 6, day: 28, quarter: 'Q4' },
            { month: 9, day: 28, quarter: 'Q1' },
            { month: 0, day: 28, quarter: 'Q2' }
          ];
          
          basQuarters.forEach(q => {
            const dueDate = new Date(q.month === 0 ? year + 1 : year, q.month, q.day);
            events.push({
              id: `bas-${q.quarter}-${year}`,
              title: `BAS ${q.quarter}`,
              type: 'BAS',
              dueDate,
              jurisdiction: 'Commonwealth',
              obligationRef: 'BAS-001'
            });
          });
        } else if (basCycle === 'monthly') {
          for (let month = 0; month < 12; month++) {
            const dueDate = new Date(year, month + 1, 21);
            events.push({
              id: `bas-${year}-${month + 1}`,
              title: `BAS ${new Date(year, month).toLocaleString('default', { month: 'long' })}`,
              type: 'BAS',
              dueDate,
              jurisdiction: 'Commonwealth',
              obligationRef: 'BAS-001'
            });
          }
        }
        
        // Generate STP finalisation
        events.push({
          id: `stp-finalisation-${year}`,
          title: 'STP Phase 2 Finalisation',
          type: 'STP',
          dueDate: new Date(year, 6, 14), // July 14
          jurisdiction: 'Commonwealth',
          obligationRef: 'STP-001'
        });
        
        // Generate state-specific payroll tax (if applicable)
        footprint.states.forEach(state => {
          // Monthly payroll tax
          for (let month = 0; month < 12; month++) {
            const dueDate = new Date(year, month + 1, 7);
            events.push({
              id: `payroll-tax-${state}-${year}-${month + 1}`,
              title: `Payroll Tax - ${state}`,
              type: 'PayrollTax',
              dueDate,
              jurisdiction: state,
              obligationRef: `PT-${state}-001`
            });
          }
        });
        
        set({ events });
      },
      
      addEvent: (event) => {
        set(state => ({
          events: [...state.events, event]
        }));
      },
      
      removeEvent: (id) => {
        set(state => ({
          events: state.events.filter(e => e.id !== id)
        }));
      },
      
      isConfigured: () => {
        const state = get();
        return !!state.basCycle && !!state.paygRemitterType && state.events.length > 0;
      }
    }),
    {
      name: 'corecomply-timetable'
    }
  )
);
