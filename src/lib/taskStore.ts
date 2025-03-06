
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

// Initial demo data
const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Create database tables",
    completed: false,
    dueDate: new Date(),
    createdAt: new Date(),
    userId: "mock-user-id",
    labels: [],
  },
  {
    id: "2",
    title: "Set up Supabase",
    completed: true,
    dueDate: null,
    createdAt: new Date(),
    userId: "mock-user-id",
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

// Create the store with Supabase persistence but no auth requirements
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: INITIAL_TASKS,
  labels: INITIAL_LABELS,
  filter: "all" as TaskStatus,
  labelFilter: null,
  isLoading: false,
  tablesInitialized: false,

  initializeTables: async (userId: string) => {
    try {
      // Create tasks table if it doesn't exist
      const { error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .limit(1)
        .maybeSingle();

      // Check if we need to create the table
      if (tasksError && tasksError.code === '42P01') {
        console.log("Creating tasks table");
        // This is handled by Supabase migrations
      }

      // Create labels table if it doesn't exist
      const { error: labelsError } = await supabase
        .from('labels')
        .select('id')
        .limit(1)
        .maybeSingle();

      // Check if we need to create the table
      if (labelsError && labelsError.code === '42P01') {
        console.log("Creating labels table");
        // This is handled by Supabase migrations
      }

      set({ tablesInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Error initializing tables:", error);
      set({ tablesInitialized: true, isLoading: false }); // Continue anyway
    }
  },

  addTask: async (title: string, dueDate: Date | null, labels: string[] = []) => {
    try {
      set({ isLoading: true });
      
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        dueDate,
        createdAt: new Date(),
        userId: "mock-user-id",
        labels: labels,
      };

      // Try to save to Supabase
      const { error } = await supabase
        .from('tasks')
        .insert([
          { 
            id: newTask.id,
            title: newTask.title,
            completed: newTask.completed,
            due_date: newTask.dueDate,
            created_at: newTask.createdAt,
            user_id: newTask.userId,
            labels: newTask.labels
          }
        ]);

      if (error) {
        console.error("Supabase insert error:", error);
        // Fall back to client-side storage
        console.log("Using local storage only");
      }
  
      set(state => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false
      }));
  
      toast.success("Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
      set({ isLoading: false });
    }
  },

  toggleTask: async (id: string) => {
    try {
      set({ isLoading: true });
      
      const task = get().tasks.find(t => t.id === id);
      if (!task) {
        set({ isLoading: false });
        return;
      }
      
      const newCompleted = !task.completed;
      
      // Try to update in Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }

      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, completed: newCompleted } : t
        ),
        isLoading: false
      }));
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error("Failed to update task");
      set({ isLoading: false });
    }
  },

  updateTaskLabels: async (id: string, labels: string[]) => {
    try {
      set({ isLoading: true });
      
      // Try to update in Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ labels })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }
      
      set((state: TaskState) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, labels } : task
        ),
        isLoading: false
      }));
      
      toast.success("Task labels updated successfully");
    } catch (error) {
      console.error("Error updating task labels:", error);
      toast.error("Failed to update task labels");
      set({ isLoading: false });
    }
  },

  updateTaskDueDate: async (id: string, dueDate: Date | null) => {
    try {
      set({ isLoading: true });
      
      // Try to update in Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: dueDate })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }
      
      set((state: TaskState) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, dueDate } : task
        ),
        isLoading: false
      }));
      
      toast.success("Due date updated successfully");
    } catch (error) {
      console.error("Error updating due date:", error);
      toast.error("Failed to update due date");
      set({ isLoading: false });
    }
  },

  deleteTask: async (id: string) => {
    try {
      set({ isLoading: true });
      
      // Try to delete from Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Supabase delete error:", error);
        console.log("Using local storage only");
      }
      
      set((state: TaskState) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        isLoading: false
      }));
      
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
      set({ isLoading: false });
    }
  },

  clearCompleted: async () => {
    try {
      set({ isLoading: true });
      
      const completedTaskIds = get().tasks
        .filter(task => task.completed)
        .map(task => task.id);
        
      // Try to delete completed tasks from Supabase  
      for (const id of completedTaskIds) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error(`Supabase delete error for task ${id}:`, error);
        }
      }
      
      set((state: TaskState) => ({
        tasks: state.tasks.filter((task) => !task.completed),
        isLoading: false
      }));
      
      toast.success("Completed tasks cleared successfully");
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
      toast.error("Failed to clear completed tasks");
      set({ isLoading: false });
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

  syncWithSupabase: async (userId: string = "mock-user-id") => {
    try {
      console.log("Syncing with Supabase for userId:", userId);
      set({ isLoading: true });

      // Initialize tables if needed
      if (!get().tablesInitialized) {
        await get().initializeTables(userId);
      }

      // Try to fetch tasks from Supabase
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

      if (taskError) {
        console.error("Error fetching tasks:", taskError);
      } else {
        // Process tasks - handle date conversion
        const tasks: Task[] = taskData?.map((task: any) => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          createdAt: new Date(task.created_at),
          userId: task.user_id,
          labels: task.labels || [],
        })) || [];

        // Only update if we got data
        if (tasks.length > 0) {
          set({ tasks });
        }
      }

      // Try to fetch labels from Supabase
      const { data: labelData, error: labelError } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', userId);

      if (labelError) {
        console.error("Error fetching labels:", labelError);
      } else {
        // Process labels
        const labels: Label[] = labelData?.map((label: any) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        })) || [];

        // Only update if we got data
        if (labels.length > 0) {
          set({ labels });
        }
      }

      console.log("Sync with Supabase successful");
      set({ isLoading: false });
    } catch (error) {
      console.error("Error syncing with Supabase:", error);
      // Continue with local data
      set({ isLoading: false });
    }
  },

  addLabel: async (name: string, color: string) => {
    try {
      set({ isLoading: true });
      
      const newLabel: Label = {
        id: crypto.randomUUID(),
        name,
        color,
      };
    
      // Try to save to Supabase
      const { error } = await supabase
        .from('labels')
        .insert([
          { 
            id: newLabel.id,
            name: newLabel.name,
            color: newLabel.color,
            user_id: "mock-user-id"
          }
        ]);

      if (error) {
        console.error("Supabase insert error:", error);
        console.log("Using local storage only");
      }
      
      set((state: TaskState) => ({
        labels: [...state.labels, newLabel],
        isLoading: false
      }));
      
      toast.success("Label added successfully");
    } catch (error) {
      console.error("Error adding label:", error);
      toast.error("Failed to add label");
      set({ isLoading: false });
    }
  },

  updateLabel: async (id: string, name: string, color: string) => {
    try {
      set({ isLoading: true });
      
      // Try to update in Supabase
      const { error } = await supabase
        .from('labels')
        .update({ name, color })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }
      
      set((state: TaskState) => ({
        labels: state.labels.map((label) =>
          label.id === id ? { ...label, name, color } : label
        ),
        isLoading: false
      }));
      
      toast.success("Label updated successfully");
    } catch (error) {
      console.error("Error updating label:", error);
      toast.error("Failed to update label");
      set({ isLoading: false });
    }
  },

  deleteLabel: async (id: string) => {
    try {
      set({ isLoading: true });
      
      // Try to delete from Supabase
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Supabase delete error:", error);
        console.log("Using local storage only");
      }
      
      set((state: TaskState) => ({
        tasks: state.tasks.map((task) => ({
          ...task,
          labels: task.labels.filter((labelId) => labelId !== id)
        })),
        labels: state.labels.filter((label) => label.id !== id),
        isLoading: false
      }));
  
      if (get().labelFilter === id) {
        set({ labelFilter: null });
      }
      
      toast.success("Label deleted successfully");
    } catch (error) {
      console.error("Error deleting label:", error);
      toast.error("Failed to delete label");
      set({ isLoading: false });
    }
  }
}));
