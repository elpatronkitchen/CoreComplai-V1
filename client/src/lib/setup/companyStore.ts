import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Entity = {
  id: string;
  name: string;
  abn: string;
  acn?: string;
};

export type Site = {
  id: string;
  name: string;
  state: string;
  address: string;
};

interface CompanyState {
  entities: Entity[];
  sites: Site[];
  awardsFootprint: string[];
  selectedFramework?: string;
  
  // Actions
  addEntity: (entity: Entity) => void;
  removeEntity: (id: string) => void;
  addSite: (site: Site) => void;
  removeSite: (id: string) => void;
  setAwardsFootprint: (awards: string[]) => void;
  setFramework: (framework: string) => void;
  isConfigured: () => boolean;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      entities: [],
      sites: [],
      awardsFootprint: [],
      selectedFramework: undefined,
      
      addEntity: (entity) => {
        set(state => ({
          entities: [...state.entities, entity]
        }));
      },
      
      removeEntity: (id) => {
        set(state => ({
          entities: state.entities.filter(e => e.id !== id)
        }));
      },
      
      addSite: (site) => {
        set(state => ({
          sites: [...state.sites, site]
        }));
      },
      
      removeSite: (id) => {
        set(state => ({
          sites: state.sites.filter(s => s.id !== id)
        }));
      },
      
      setAwardsFootprint: (awards) => {
        set({ awardsFootprint: awards });
      },
      
      setFramework: (framework) => {
        set({ selectedFramework: framework });
      },
      
      isConfigured: () => {
        const state = get();
        return state.entities.length > 0 && state.sites.length > 0 && !!state.selectedFramework;
      }
    }),
    {
      name: 'corecomply-company'
    }
  )
);
