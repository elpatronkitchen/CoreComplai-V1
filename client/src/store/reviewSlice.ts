// Review Store - manages reviewer queue, metrics, and validation workflow
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReviewItem, ReviewerMetrics } from '../../../lib/types/azure';

interface ReviewState {
  items: ReviewItem[];
  metrics: ReviewerMetrics;
  activeTimers: Map<string, number>; // itemId -> startTime
  
  // Actions
  addReviewItem: (item: Omit<ReviewItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReviewItem: (id: string, updates: Partial<ReviewItem>) => void;
  startTimer: (itemId: string) => void;
  stopTimer: (itemId: string) => void;
  validateItem: (itemId: string, approved: boolean, notes?: string) => void;
  batchValidate: (itemIds: string[], approved: boolean) => void;
  returnItem: (itemId: string, reason: string) => void;
  calculateMetrics: () => void;
}

// Baseline costs for ROI calculation (from spec)
const LEGAL_RATE_PER_HOUR = 450; // AUD
const BASELINE_MINS_PER_CLASSIFICATION = 30;
const BASELINE_MINS_PER_AUDIT_ITEM = 45;

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      items: [],
      metrics: {
        itemsToday: 0,
        itemsCompleted: 0,
        medianTimeSeconds: 0,
        firstPassRate: 0,
        autoReadyRate: 0,
        returnLoopCount: 0,
        hoursAvoided: 0,
        dollarsSaved: 0,
      },
      activeTimers: new Map(),

      addReviewItem: (item) => {
        const newItem: ReviewItem = {
          ...item,
          id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateReviewItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      startTimer: (itemId) => {
        set((state) => {
          const newTimers = new Map(state.activeTimers);
          newTimers.set(itemId, Date.now());
          return { activeTimers: newTimers };
        });
      },

      stopTimer: (itemId) => {
        const state = get();
        const startTime = state.activeTimers.get(itemId);
        
        if (startTime) {
          const touchTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
          state.updateReviewItem(itemId, { touchTimeSeconds });
          
          set((state) => {
            const newTimers = new Map(state.activeTimers);
            newTimers.delete(itemId);
            return { activeTimers: newTimers };
          });
        }
      },

      validateItem: (itemId, approved, notes) => {
        const state = get();
        state.stopTimer(itemId);
        
        state.updateReviewItem(itemId, {
          status: approved ? 'completed' : 'returned',
        });
        
        state.calculateMetrics();
      },

      batchValidate: (itemIds, approved) => {
        const state = get();
        
        itemIds.forEach((itemId) => {
          state.stopTimer(itemId);
          state.updateReviewItem(itemId, {
            status: approved ? 'completed' : 'returned',
          });
        });
        
        state.calculateMetrics();
      },

      returnItem: (itemId, reason) => {
        const state = get();
        const item = state.items.find((i) => i.id === itemId);
        
        if (item) {
          state.stopTimer(itemId);
          state.updateReviewItem(itemId, {
            status: 'returned',
            loopCount: item.loopCount + 1,
          });
          
          // In real system, would create a task for the original preparer
          console.log(`Item ${itemId} returned: ${reason}`);
        }
        
        state.calculateMetrics();
      },

      calculateMetrics: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Filter items from today
        const todayItems = state.items.filter((item) =>
          item.createdAt.startsWith(today)
        );
        
        const completedItems = state.items.filter(
          (item) => item.status === 'completed'
        );
        
        // Calculate median time
        const times = completedItems
          .map((item) => item.touchTimeSeconds || 0)
          .filter((t) => t > 0)
          .sort((a, b) => a - b);
        
        const medianTimeSeconds =
          times.length > 0
            ? times[Math.floor(times.length / 2)]
            : 0;
        
        // First pass rate (completed without returns)
        const firstPassItems = completedItems.filter(
          (item) => item.loopCount === 0
        );
        const firstPassRate =
          completedItems.length > 0
            ? firstPassItems.length / completedItems.length
            : 0;
        
        // Auto-ready rate (items with confidence >= 0.85 or auto-attached evidence)
        const autoReadyItems = state.items.filter(
          (item) =>
            item.status === 'auto_ready' ||
            (item.confidence >= 0.85 && item.type === 'classification')
        );
        const autoReadyRate =
          state.items.length > 0
            ? autoReadyItems.length / state.items.length
            : 0;
        
        // Return loop count (average returns per item)
        const totalLoops = state.items.reduce(
          (sum, item) => sum + item.loopCount,
          0
        );
        const returnLoopCount =
          state.items.length > 0 ? totalLoops / state.items.length : 0;
        
        // Calculate time saved
        let totalMinutesSaved = 0;
        completedItems.forEach((item) => {
          const baselineMinutes =
            item.type === 'classification'
              ? BASELINE_MINS_PER_CLASSIFICATION
              : BASELINE_MINS_PER_AUDIT_ITEM;
          
          const actualMinutes = (item.touchTimeSeconds || 0) / 60;
          const savedMinutes = Math.max(0, baselineMinutes - actualMinutes);
          totalMinutesSaved += savedMinutes;
        });
        
        const hoursAvoided = totalMinutesSaved / 60;
        const dollarsSaved = hoursAvoided * LEGAL_RATE_PER_HOUR;
        
        set({
          metrics: {
            itemsToday: todayItems.length,
            itemsCompleted: completedItems.length,
            medianTimeSeconds,
            firstPassRate,
            autoReadyRate,
            returnLoopCount,
            hoursAvoided,
            dollarsSaved,
          },
        });
      },
    }),
    {
      name: 'review-storage',
      // Don't persist timers
      partialize: (state) => ({
        items: state.items,
        metrics: state.metrics,
      }),
    }
  )
);
