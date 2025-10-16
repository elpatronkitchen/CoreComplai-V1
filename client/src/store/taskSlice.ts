import { create } from 'zustand';
import { Task } from './auditSlice';

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByAuditItem: (auditItemId: string) => Task[];
  getTasksByAssignee: (assignee: string) => Task[];
  getTasksByApprover: (approver: string) => Task[];
  completeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === id ? { ...t, ...updates } : t
    )
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),

  getTasksByAuditItem: (auditItemId) => {
    return get().tasks.filter(t => t.auditItemId === auditItemId);
  },

  getTasksByAssignee: (assignee) => {
    return get().tasks.filter(t => t.assignee === assignee);
  },

  getTasksByApprover: (approver) => {
    return get().tasks.filter(t => t.approver === approver);
  },

  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === id
        ? {
            ...t,
            status: 'Done' as const,
            completedAt: new Date().toISOString()
          }
        : t
    )
  }))
}));
