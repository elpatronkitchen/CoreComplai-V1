import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Framework = 'APGF' | 'ISO9001' | 'ISO27001';

export interface Person {
  id: string;
  displayName: string;
  email: string;
  title?: string;
  department?: string;
  legalEntities?: string[];
  states?: string[];
  location?: string;
  phone?: string;
  managerId?: string;
  avatarUrl?: string;
  roles: string[];
  competencies?: string[];
  claims?: Record<string, any>;
  active: boolean;
  ooo?: {
    fromISO: string;
    toISO: string;
    delegateId?: string;
  };
}

export interface RoleBinding {
  id: string;
  role: string;
  personId: string;
  rasci?: ('R' | 'A' | 'S' | 'C' | 'I')[];
  scope?: {
    framework?: Framework;
    processId?: string;
    entityId?: string;
  };
}

interface PeopleState {
  people: Person[];
  roleBindings: RoleBinding[];
  
  // Actions
  addPerson: (person: Omit<Person, 'id'>) => string;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  assignRole: (binding: Omit<RoleBinding, 'id'>) => string;
  removeRole: (bindingId: string) => void;
  setOOO: (personId: string, ooo: Person['ooo']) => void;
  setDelegate: (personId: string, delegateId: string) => void;
  clearOOO: (personId: string) => void;
  getPerson: (id: string) => Person | undefined;
  getPersonByEmail: (email: string) => Person | undefined;
  getBindingsForPerson: (personId: string) => RoleBinding[];
  getBindingsForRole: (role: string, framework?: Framework) => RoleBinding[];
  importPeople: (people: Person[]) => void;
  getCoverageByFramework: (framework: Framework, requiredRoles: string[]) => number;
}

export const usePeopleStore = create<PeopleState>()(
  persist(
    (set, get) => ({
      people: [],
      roleBindings: [],
      
      addPerson: (person) => {
        const id = `person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newPerson: Person = { ...person, id };
        set(state => ({ people: [...state.people, newPerson] }));
        return id;
      },
      
      updatePerson: (id, updates) => {
        set(state => ({
          people: state.people.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
      },
      
      deletePerson: (id) => {
        set(state => ({
          people: state.people.filter(p => p.id !== id),
          roleBindings: state.roleBindings.filter(rb => rb.personId !== id)
        }));
      },
      
      assignRole: (binding) => {
        const id = `binding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newBinding: RoleBinding = { ...binding, id };
        set(state => ({ roleBindings: [...state.roleBindings, newBinding] }));
        
        // Also update person's roles array
        const person = get().getPerson(binding.personId);
        if (person && !person.roles.includes(binding.role)) {
          get().updatePerson(binding.personId, {
            roles: [...person.roles, binding.role]
          });
        }
        
        return id;
      },
      
      removeRole: (bindingId) => {
        const binding = get().roleBindings.find(rb => rb.id === bindingId);
        set(state => ({
          roleBindings: state.roleBindings.filter(rb => rb.id !== bindingId)
        }));
        
        // Update person's roles array
        if (binding) {
          const remainingBindings = get().roleBindings.filter(rb => 
            rb.personId === binding.personId && rb.role === binding.role
          );
          if (remainingBindings.length === 0) {
            const person = get().getPerson(binding.personId);
            if (person) {
              get().updatePerson(binding.personId, {
                roles: person.roles.filter(r => r !== binding.role)
              });
            }
          }
        }
      },
      
      setOOO: (personId, ooo) => {
        get().updatePerson(personId, { ooo });
      },
      
      setDelegate: (personId, delegateId) => {
        const person = get().getPerson(personId);
        if (person?.ooo) {
          get().updatePerson(personId, {
            ooo: { ...person.ooo, delegateId }
          });
        }
      },
      
      clearOOO: (personId) => {
        get().updatePerson(personId, { ooo: undefined });
      },
      
      getPerson: (id) => {
        return get().people.find(p => p.id === id);
      },
      
      getPersonByEmail: (email) => {
        return get().people.find(p => p.email === email);
      },
      
      getBindingsForPerson: (personId) => {
        return get().roleBindings.filter(rb => rb.personId === personId);
      },
      
      getBindingsForRole: (role, framework) => {
        return get().roleBindings.filter(rb => {
          if (rb.role !== role) return false;
          if (framework && rb.scope?.framework !== framework) return false;
          return true;
        });
      },
      
      importPeople: (people) => {
        set(state => {
          const existingEmails = new Set(state.people.map(p => p.email));
          const newPeople = people.filter(p => !existingEmails.has(p.email));
          const updatedPeople = people.filter(p => existingEmails.has(p.email));
          
          const merged = state.people.map(existing => {
            const update = updatedPeople.find(p => p.email === existing.email);
            return update ? { ...existing, ...update, id: existing.id } : existing;
          });
          
          return { people: [...merged, ...newPeople] };
        });
      },
      
      getCoverageByFramework: (framework, requiredRoles) => {
        const bindings = get().roleBindings.filter(rb => rb.scope?.framework === framework);
        const coveredRoles = new Set(bindings.map(rb => rb.role));
        const covered = requiredRoles.filter(role => coveredRoles.has(role)).length;
        return requiredRoles.length > 0 ? (covered / requiredRoles.length) * 100 : 0;
      }
    }),
    {
      name: 'corecomply-people-v2'
    }
  )
);
