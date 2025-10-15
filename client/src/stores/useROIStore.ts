import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ValidationRecord {
  id: string;
  itemId: string;
  itemType: 'classification' | 'audit_item' | 'evidence_review' | 'control_validation';
  actualMins: number;
  baselineMins: number;
  timestamp: string;
  savedMins: number;
  savedDollars: number;
}

export interface ROISettings {
  currency: string;
  legal_rate_per_hour: number;
  baseline_mins_per_classification: number;
  baseline_mins_per_audit_item: number;
}

interface ROIStore {
  validationRecords: ValidationRecord[];
  settings: ROISettings;
  
  setSettings: (settings: ROISettings) => void;
  
  trackValidation: (
    itemId: string,
    itemType: ValidationRecord['itemType'],
    actualMins: number
  ) => void;
  
  getROISummary: () => {
    totalHoursAvoided: number;
    totalDollarsSaved: number;
    totalValidations: number;
    averageTimeSaved: number;
    byItemType: Record<string, {
      count: number;
      hoursAvoided: number;
      dollarsSaved: number;
    }>;
  };
  
  getRecentValidations: (limit?: number) => ValidationRecord[];
  clearRecords: () => void;
}

const DEFAULT_SETTINGS: ROISettings = {
  currency: 'AUD',
  legal_rate_per_hour: 450,
  baseline_mins_per_classification: 30,
  baseline_mins_per_audit_item: 45,
};

export const useROIStore = create<ROIStore>()(
  persist(
    (set, get) => ({
      validationRecords: [],
      settings: DEFAULT_SETTINGS,
      
      setSettings: (settings) => set({ settings }),
      
      trackValidation: (itemId, itemType, actualMins) => {
        const { settings, validationRecords } = get();
        
        const baselineMins = itemType === 'classification'
          ? settings.baseline_mins_per_classification
          : itemType === 'audit_item'
          ? settings.baseline_mins_per_audit_item
          : itemType === 'evidence_review'
          ? 20
          : 15;
        
        const savedMins = Math.max(0, baselineMins - actualMins);
        const savedHours = savedMins / 60;
        const savedDollars = savedHours * settings.legal_rate_per_hour;
        
        const record: ValidationRecord = {
          id: `roi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId,
          itemType,
          actualMins,
          baselineMins,
          timestamp: new Date().toISOString(),
          savedMins,
          savedDollars,
        };
        
        set({
          validationRecords: [...validationRecords, record],
        });
      },
      
      getROISummary: () => {
        const { validationRecords, settings } = get();
        
        if (validationRecords.length === 0) {
          return {
            totalHoursAvoided: 0,
            totalDollarsSaved: 0,
            totalValidations: 0,
            averageTimeSaved: 0,
            byItemType: {},
          };
        }
        
        const totalSavedMins = validationRecords.reduce(
          (sum, record) => sum + record.savedMins,
          0
        );
        const totalHoursAvoided = totalSavedMins / 60;
        const totalDollarsSaved = totalHoursAvoided * settings.legal_rate_per_hour;
        
        const byItemType: Record<string, { count: number; hoursAvoided: number; dollarsSaved: number }> = {};
        
        validationRecords.forEach((record) => {
          if (!byItemType[record.itemType]) {
            byItemType[record.itemType] = {
              count: 0,
              hoursAvoided: 0,
              dollarsSaved: 0,
            };
          }
          
          byItemType[record.itemType].count += 1;
          byItemType[record.itemType].hoursAvoided += record.savedMins / 60;
          byItemType[record.itemType].dollarsSaved += record.savedDollars;
        });
        
        return {
          totalHoursAvoided,
          totalDollarsSaved,
          totalValidations: validationRecords.length,
          averageTimeSaved: totalSavedMins / validationRecords.length,
          byItemType,
        };
      },
      
      getRecentValidations: (limit = 10) => {
        const { validationRecords } = get();
        return validationRecords
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      },
      
      clearRecords: () => set({ validationRecords: [] }),
    }),
    {
      name: 'roi-storage',
    }
  )
);
