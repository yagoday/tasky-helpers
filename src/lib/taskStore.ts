import { create } from "zustand";
import { Task, TaskStatus, Label } from "@/types/task";
import { toast } from "sonner";
import { supabase } from "./useAuth";

interface TaskState {
  tasks: Task[];
  labels: Label[];
  filter: TaskStatus;
  labelFilter: string | null;
  isLoading: boolean;
  tablesInitialized: boolean;
  addTask: (title: string, dueDate: Date | null, labels?: string[]) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTaskDueDate: (id: string, dueDate: Date | null) => Promise<void>;
  updateTaskLabels: (id: string, labels: string[]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  setFilter: (filter: TaskStatus) => void;
  setLabelFilter: (labelId: string | null) => void;
  filteredTasks: () => Task[];
  syncWithSupabase: (userId: string | undefined) => Promise<void>;
  addLabel: (name: string, color: string) => Promise<void>;
  updateLabel: (id: string, name: string, color: string) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  initializeTables: (userId: string) => Promise<void>;
}

// Helper functions
const labelsToString = (labels: string[]): string => {
  return labels.join(',');
};

const stringToLabels = (labelsString: string | null): string[] => {
  if (!labelsString) return [];
  return labelsString.split(',').filter(id => id.trim() !== '');
};

// Mock user ID for development
const MOCK_USER_ID = "mock-user-id";

// Create the store without any persistence
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  labels: [],
  filter: "all" as TaskStatus,
  labelFilter: null,
  isLoading: false,
  tablesInitialized: false,

  initializeTables: async (userId: string) => {
    // For development, just set initialized to true
    console.log("Development mode: Skipping table initialization");
    set({ tablesInitialized: true, isLoading: false });
    
    // Populate with some mock data
    set({
      tasks: [
        {
          id: "1",
          title: "Create database tables",
          completed: false,
          dueDate: new Date(),
          createdAt: new Date(),
          userId: MOCK_USER_ID,
          labels: [],
        },
        {
          id: "2",
          title: "Set up Supabase",
          completed: true,
          dueDate: null,
          createdAt: new Date(),
          userId: MOCK_USER_ID,
          labels: [],
        }
      ],
      labels: [
        {
          id: "1",
          name: "High Priority",
          color: "#EF4444",
        },
        {
          id: "2",
          name: "Bug",
          color: "#F59E0B",
        }
      ]
    });
  },

  addTask: async (title: string, dueDate: Date | null, labels: string[] = []) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      dueDate,
      createdAt: new Date(),
      userId: MOCK_USER_ID,
      labels: labels,
    };

    set(state => ({
      tasks: [newTask, ...state.tasks],
    }));

    toast.success("Task added (offline mode)");
  },

  toggleTask: async (id: string) => {
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
    
    toast.success("Task updated (offline mode)");
  },

  updateTaskLabels: async (id: string, labels: string[]) => {
    set((state: TaskState) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, labels } : task
      ),
    }));
    
    toast.success("Task labels updated (offline mode)");
  },

  updateTaskDueDate: async (id: string, dueDate: Date | null) => {
    set((state: TaskState) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, dueDate } : task
      ),
    }));
    
    toast.success("Due date updated (offline mode)");
  },

  deleteTask: async (id: string) => {
    set((state: TaskState) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    
    toast.success("Task deleted (offline mode)");
  },

  clearCompleted: async () => {
    set((state: TaskState) => ({
      tasks: state.tasks.filter((task) => !task.completed),
    }));
    
    toast.success("Completed tasks cleared (offline mode)");
  },

  setFilter: (filter: TaskStatus) => {
    set({ filter });
  },

  setLabelFilter: (labelId: string | null) => {
    set({ labelFilter: labelId });
  },

  filteredTasks: () => {
    const state = get();
    let filtered = state.tasks;

    if (state.filter === "active") {
      filtered = filtered.filter((task: Task) => !task.completed);
    } else if (state.filter === "completed") {
      filtered = filtered.filter((task: Task) => task.completed);
    }

    if (state.labelFilter) {
      filtered = filtered.filter((task: Task) => task.labels.includes(state.labelFilter!));
    }

    return filtered;
  },

  syncWithSupabase: async (userId?: string) => {
    console.log("Development mode: Using mock data instead of syncing with Supabase");
    
    // Set some mock data for development
    if (get().tasks.length === 0) {
      await get().initializeTables(MOCK_USER_ID);
    }
    
    set({ isLoading: false });
  },

  addLabel: async (name: string, color: string) => {
    const newLabel: Label = {
      id: crypto.randomUUID(),
      name,
      color,
    };

    set((state: TaskState) => ({
      labels: [...state.labels, newLabel],
    }));
    
    toast.success("Label added (offline mode)");
  },

  updateLabel: async (id: string, name: string, color: string) => {
    set((state: TaskState) => ({
      labels: state.labels.map((label) =>
        label.id === id ? { ...label, name, color } : label
      ),
    }));
    
    toast.success("Label updated (offline mode)");
  },

  deleteLabel: async (id: string) => {
    set((state: TaskState) => ({
      tasks: state.tasks.map((task) => ({
        ...task,
        labels: task.labels.filter((labelId) => labelId !== id)
      })),
      labels: state.labels.filter((label) => label.id !== id),
    }));

    if (get().labelFilter === id) {
      set({ labelFilter: null });
    }
    
    toast.success("Label deleted (offline mode)");
  }
}));
