import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus, Label } from "@/types/task";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

interface TaskState {
  tasks: Task[];
  labels: Label[];
  filter: TaskStatus;
  labelFilter: string | null;
  isLoading: boolean;
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
}

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      labels: [],
      filter: "all",
      labelFilter: null,
      isLoading: false,
      
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
              labels: newTask.labels,
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
              labels,
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
                labels: task.labels,
              }).eq("id", task.id).eq("user_id", data.user.id);
            }
          } catch (error) {
            console.error("Error deleting label from Supabase:", error);
            toast.error("Failed to delete label on the server");
          }
        }
      },
      
      syncWithSupabase: async (userId) => {
        if (!userId) return;
        
        set({ isLoading: true });
        
        try {
          const { data: tasksData, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
            
          if (tasksError) throw tasksError;
          
          const formattedTasks: Task[] = tasksData.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            dueDate: task.due_date ? new Date(task.due_date) : null,
            createdAt: new Date(task.created_at),
            userId: task.user_id,
            labels: task.labels || [],
          }));
          
          const { data: labelsData, error: labelsError } = await supabase
            .from("labels")
            .select("*")
            .eq("user_id", userId);
            
          if (labelsError) throw labelsError;
          
          const formattedLabels: Label[] = labelsData.map(label => ({
            id: label.id,
            name: label.name,
            color: label.color,
          }));
          
          set({ 
            tasks: formattedTasks,
            labels: formattedLabels
          });
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
