import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PolicyException } from './usePoliciesStore';

interface ExceptionState {
  // Derived from policies - kept separate for cross-policy queries
  getAllExceptions: () => PolicyException[];
  getExpiredExceptions: () => PolicyException[];
  getPendingExceptions: () => PolicyException[];
  
  // Auto-expiry check (would be a background job in production)
  checkAndExpireExceptions: () => void;
}

export const useExceptionStore = create<ExceptionState>()(
  persist(
    (set, get) => ({
      getAllExceptions: () => {
        // This would query from usePoliciesStore in practice
        return [];
      },
      
      getExpiredExceptions: () => {
        const now = new Date().toISOString();
        return get().getAllExceptions().filter(e => 
          e.expiresAt && e.expiresAt < now && e.status !== 'Expired'
        );
      },
      
      getPendingExceptions: () => {
        return get().getAllExceptions().filter(e => e.status === 'Requested');
      },
      
      checkAndExpireExceptions: () => {
        const expired = get().getExpiredExceptions();
        // Would update policies store here
        console.log(`Found ${expired.length} expired exceptions to process`);
      }
    }),
    {
      name: 'exception-storage'
    }
  )
);
