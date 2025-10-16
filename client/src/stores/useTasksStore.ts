import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  approverId?: string;
  delegatedTo?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  framework?: string;
  processId?: string;
  tags?: string[];
  evidenceIds?: string[];
}

interface TasksState {
  tasks: Task[];
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  assignDelegate: (taskId: string, delegateId: string) => void;
  clearDelegate: (taskId: string) => void;
  getTasksByOwner: (ownerId: string) => Task[];
  getTasksByDelegate: (delegateId: string) => Task[];
  getTasksByFramework: (framework: string) => Task[];
  getOverdueTasks: () => Task[];
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (task) => {
        const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTask: Task = {
          ...task,
          id,
          createdAt: new Date().toISOString()
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
        return id;
      },
      
      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
      },
      
      deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
      },
      
      completeTask: (id) => {
        get().updateTask(id, {
          status: 'completed',
          completedAt: new Date().toISOString()
        });
      },
      
      assignDelegate: (taskId, delegateId) => {
        get().updateTask(taskId, { delegatedTo: delegateId });
      },
      
      clearDelegate: (taskId) => {
        get().updateTask(taskId, { delegatedTo: undefined });
      },
      
      getTasksByOwner: (ownerId) => {
        return get().tasks.filter(t => t.ownerId === ownerId);
      },
      
      getTasksByDelegate: (delegateId) => {
        return get().tasks.filter(t => t.delegatedTo === delegateId);
      },
      
      getTasksByFramework: (framework) => {
        return get().tasks.filter(t => t.framework === framework);
      },
      
      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false;
          return new Date(t.dueDate) < now;
        });
      }
    }),
    {
      name: 'corecomply-tasks'
    }
  )
);
