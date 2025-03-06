
import { create } from "zustand";
import { persist } from "zustand/middleware";
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

// Helper function to convert array to comma-separated string
const labelsToString = (labels: string[]): string => {
  return labels.join(',');
};

// Helper function to convert comma-separated string to array
const stringToLabels = (labelsString: string | null): string[] => {
  if (!labelsString) return [];
  return labelsString.split(',').filter(id => id.trim() !== '');
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      labels: [],
      filter: "all",
      labelFilter: null,
      isLoading: false,
      tablesInitialized: false,
      
      initializeTables: async (userId) => {
        if (get().tablesInitialized) return;
        
        console.log("Checking and initializing tables for user:", userId);
        set({ isLoading: true });
        
        try {
          // Check if tasks table exists
          const { error: tasksCheckError } = await supabase
            .from("tasks")
            .select("count()")
            .limit(1);
            
          // Create tasks table if it doesn't exist
          if (tasksCheckError && tasksCheckError.code === "42P01") {
            console.log("Tasks table doesn't exist. Creating it now.");
            
            // Use RPC to create the table
            const { error: createTasksError } = await supabase.rpc('create_tasks_table');
            
            if (createTasksError) {
              console.error("Error creating tasks table:", createTasksError);
              toast.error("Failed to create tasks table", {
                description: "Please check your Supabase permissions or create it manually.",
                duration: 6000,
              });
            } else {
              console.log("Tasks table created successfully");
              toast.success("Tasks table created successfully");
            }
          }
          
          // Check if labels table exists
          const { error: labelsCheckError } = await supabase
            .from("labels")
            .select("count()")
            .limit(1);
            
          // Create labels table if it doesn't exist
          if (labelsCheckError && labelsCheckError.code === "42P01") {
            console.log("Labels table doesn't exist. Creating it now.");
            
            // Use RPC to create the table
            const { error: createLabelsError } = await supabase.rpc('create_labels_table');
            
            if (createLabelsError) {
              console.error("Error creating labels table:", createLabelsError);
              toast.error("Failed to create labels table", {
                description: "Please check your Supabase permissions or create it manually.",
                duration: 6000,
              });
            } else {
              console.log("Labels table created successfully");
              toast.success("Labels table created successfully");
            }
          }
          
          // Mark as initialized even if tables couldn't be created
          // This prevents repeated error messages
          set({ tablesInitialized: true });
        } catch (error) {
          console.error("Error checking/creating tables:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      addTask: async (title, dueDate, labels = []) => {
        const { data } = await supabase.auth.getUser();
        
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          completed: false,
          dueDate,
          createdAt: new Date(),
          userId: data.user?.id,
          labels: labels,
        };
        
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
        
        if (data.user) {
          try {
            await supabase.from("tasks").insert({
              id: newTask.id,
              title: newTask.title,
              completed: newTask.completed,
              due_date: newTask.dueDate,
              created_at: newTask.createdAt,
              user_id: data.user.id,
              labels_string: labelsToString(newTask.labels),
            });
          } catch (error) {
            console.error("Error saving task to Supabase:", error);
            toast.error("Failed to save task to the server");
          }
        }
      },
      
      toggleTask: async (id) => {
        const task = get().tasks.find(task => task.id === id);
        if (!task) return;
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        }));
        
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            await supabase.from("tasks").update({
              completed: !task.completed,
            }).eq("id", id).eq("user_id", data.user.id);
          } catch (error) {
            console.error("Error updating task in Supabase:", error);
            toast.error("Failed to update task on the server");
          }
        }
      },
      
      updateTaskLabels: async (id, labels) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, labels } : task
          ),
        }));
        
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            await supabase.from("tasks").update({
              labels_string: labelsToString(labels),
            }).eq("id", id).eq("user_id", data.user.id);
          } catch (error) {
            console.error("Error updating task labels in Supabase:", error);
            toast.error("Failed to update task labels on the server");
          }
        }
      },
      
      updateTaskDueDate: async (id, dueDate) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, dueDate } : task
          ),
        }));
        
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            await supabase.from("tasks").update({
              due_date: dueDate,
            }).eq("id", id).eq("user_id", data.user.id);
          } catch (error) {
            console.error("Error updating task due date in Supabase:", error);
            toast.error("Failed to update task due date on the server");
          }
        }
      },
      
      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
        
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            await supabase.from("tasks").delete().eq("id", id).eq("user_id", data.user.id);
          } catch (error) {
            console.error("Error deleting task in Supabase:", error);
            toast.error("Failed to delete task on the server");
          }
        }
      },
      
      clearCompleted: async () => {
        const completedTaskIds = get().tasks
          .filter(task => task.completed)
          .map(task => task.id);
        
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        }));
        
        const { data } = await supabase.auth.getUser();
        if (data.user && completedTaskIds.length > 0) {
          try {
            await supabase.from("tasks")
              .delete()
              .in("id", completedTaskIds)
              .eq("user_id", data.user.id);
          } catch (error) {
            console.error("Error clearing completed tasks in Supabase:", error);
            toast.error("Failed to clear completed tasks on the server");
          }
        }
      },
      
      setFilter: (filter) => {
        set({ filter });
      },
      
      setLabelFilter: (labelId) => {
        set({ labelFilter: labelId });
      },
      
      filteredTasks: () => {
        const { tasks, filter, labelFilter } = get();
        
        let filtered = tasks;
        
        if (filter === "active") {
          filtered = filtered.filter((task) => !task.completed);
        } else if (filter === "completed") {
          filtered = filtered.filter((task) => task.completed);
        }
        
        if (labelFilter) {
          filtered = filtered.filter((task) => task.labels.includes(labelFilter));
        }
        
        return filtered;
      },
      
      addLabel: async (name, color) => {
        const newLabel: Label = {
          id: crypto.randomUUID(),
          name,
          color,
        };
        
        set((state) => ({
          labels: [...state.labels, newLabel],
        }));
        
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            await supabase.from("labels").insert({
              id: newLabel.id,
              name: newLabel.name,
              color: newLabel.color,
              user_id: data.user.id,
            });
          } catch (error) {
            console.error("Error saving label to Supabase:", error);
            toast.error("Failed to save label to the server");
          }
        }
      },
      
      updateLabel: async (id, name, color) => {
        set((state) => ({
          labels: state.labels.map((label) =>
            label.id === id ? { ...label, name, color } : label
          ),
        }));
        
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            await supabase.from("labels").update({
              name,
              color,
            }).eq("id", id).eq("user_id", data.user.id);
          } catch (error) {
            console.error("Error updating label in Supabase:", error);
            toast.error("Failed to update label on the server");
          }
        }
      },
      
      deleteLabel: async (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => ({
            ...task,
            labels: task.labels.filter((labelId) => labelId !== id)
          })),
          labels: state.labels.filter((label) => label.id !== id),
        }));
        
        if (get().labelFilter === id) {
          set({ labelFilter: null });
        }
        
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            await supabase.from("labels").delete().eq("id", id).eq("user_id", data.user.id);
            
            const tasksToUpdate = get().tasks.filter(task => 
              task.labels.includes(id)
            );
            
            for (const task of tasksToUpdate) {
              await supabase.from("tasks").update({
                labels_string: labelsToString(task.labels),
              }).eq("id", task.id).eq("user_id", data.user.id);
            }
          } catch (error) {
            console.error("Error deleting label from Supabase:", error);
            toast.error("Failed to delete label on the server");
          }
        }
      },
      
      syncWithSupabase: async (userId) => {
        if (!userId) {
          console.log("No user ID provided for syncing");
          return;
        }
        
        await get().initializeTables(userId);
        
        console.log("Syncing with Supabase for user ID:", userId);
        set({ isLoading: true });
        
        try {
          const { data: tasksData, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId);
            
          if (tasksError) {
            if (tasksError.code !== "42P01") {
              console.error("Supabase tasks fetch error:", tasksError);
              toast.error("Failed to fetch tasks");
            }
          } else {
            console.log("Fetched tasks data:", tasksData);
            
            const formattedTasks: Task[] = tasksData.map(task => ({
              id: task.id,
              title: task.title,
              completed: task.completed,
              dueDate: task.due_date ? new Date(task.due_date) : null,
              createdAt: new Date(task.created_at),
              userId: task.user_id,
              labels: stringToLabels(task.labels_string),
            }));
            
            set({ tasks: formattedTasks });
          }
          
          const { data: labelsData, error: labelsError } = await supabase
            .from("labels")
            .select("*")
            .eq("user_id", userId);
            
          if (labelsError) {
            if (labelsError.code !== "42P01") {
              console.error("Supabase labels fetch error:", labelsError);
              toast.error("Failed to fetch labels");
            }
          } else {
            console.log("Fetched labels data:", labelsData);
            
            const formattedLabels: Label[] = labelsData.map(label => ({
              id: label.id,
              name: label.name,
              color: label.color,
            }));
            
            set({ labels: formattedLabels });
          }
        } catch (error) {
          console.error("Error fetching data from Supabase:", error);
          toast.error("Failed to fetch your data");
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "task-store",
    }
  )
);
