
import { create } from "zustand";
import { Task, TaskStatus, Label } from "@/types/task";
import { toast } from "sonner";
// Importing supabase but not using it actively
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

// Mock user ID for development
const MOCK_USER_ID = "mock-user-id";

// Initial demo data
const INITIAL_TASKS: Task[] = [
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
];

const INITIAL_LABELS: Label[] = [
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
];

// Create the store without any persistence
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: INITIAL_TASKS,
  labels: INITIAL_LABELS,
  filter: "all" as TaskStatus,
  labelFilter: null,
  isLoading: false,
  tablesInitialized: true, // Always true in offline mode

  initializeTables: async (userId: string) => {
    console.log("Offline mode: Using local storage only, no Supabase interactions");
    set({ tablesInitialized: true, isLoading: false });
  },

  addTask: async (title: string, dueDate: Date | null, labels: string[] = []) => {
    try {
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
  
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  },

  toggleTask: async (id: string) => {
    try {
      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ),
      }));
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error("Failed to update task");
    }
  },

  updateTaskLabels: async (id: string, labels: string[]) => {
    try {
      set((state: TaskState) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, labels } : task
        ),
      }));
      
      toast.success("Task labels updated successfully");
    } catch (error) {
      console.error("Error updating task labels:", error);
      toast.error("Failed to update task labels");
    }
  },

  updateTaskDueDate: async (id: string, dueDate: Date | null) => {
    try {
      set((state: TaskState) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, dueDate } : task
        ),
      }));
      
      toast.success("Due date updated successfully");
    } catch (error) {
      console.error("Error updating due date:", error);
      toast.error("Failed to update due date");
    }
  },

  deleteTask: async (id: string) => {
    try {
      set((state: TaskState) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
      
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  },

  clearCompleted: async () => {
    try {
      set((state: TaskState) => ({
        tasks: state.tasks.filter((task) => !task.completed),
      }));
      
      toast.success("Completed tasks cleared successfully");
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
      toast.error("Failed to clear completed tasks");
    }
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
    console.log("Offline mode: No Supabase syncing needed");
    set({ isLoading: false });
    return;
  },

  addLabel: async (name: string, color: string) => {
    try {
      const newLabel: Label = {
        id: crypto.randomUUID(),
        name,
        color,
      };
  
      set((state: TaskState) => ({
        labels: [...state.labels, newLabel],
      }));
      
      toast.success("Label added successfully");
    } catch (error) {
      console.error("Error adding label:", error);
      toast.error("Failed to add label");
    }
  },

  updateLabel: async (id: string, name: string, color: string) => {
    try {
      set((state: TaskState) => ({
        labels: state.labels.map((label) =>
          label.id === id ? { ...label, name, color } : label
        ),
      }));
      
      toast.success("Label updated successfully");
    } catch (error) {
      console.error("Error updating label:", error);
      toast.error("Failed to update label");
    }
  },

  deleteLabel: async (id: string) => {
    try {
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
      
      toast.success("Label deleted successfully");
    } catch (error) {
      console.error("Error deleting label:", error);
      toast.error("Failed to delete label");
    }
  }
}));
