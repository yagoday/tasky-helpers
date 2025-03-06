
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus } from "@/types/task";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

interface TaskState {
  tasks: Task[];
  filter: TaskStatus;
  isLoading: boolean;
  addTask: (title: string, dueDate: Date | null) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTaskDueDate: (id: string, dueDate: Date | null) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  setFilter: (filter: TaskStatus) => void;
  filteredTasks: () => Task[];
  syncWithSupabase: (userId: string | undefined) => Promise<void>;
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
      filter: "all",
      isLoading: false,
      
      addTask: async (title, dueDate) => {
        const { data } = await supabase.auth.getUser();
        
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          completed: false,
          dueDate,
          createdAt: new Date(),
          userId: data.user?.id,
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
      
      filteredTasks: () => {
        const { tasks, filter } = get();
        
        switch (filter) {
          case "active":
            return tasks.filter((task) => !task.completed);
          case "completed":
            return tasks.filter((task) => task.completed);
          default:
            return tasks;
        }
      },
      
      syncWithSupabase: async (userId) => {
        if (!userId) return;
        
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
            
          if (error) throw error;
          
          const formattedTasks: Task[] = data.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            dueDate: task.due_date ? new Date(task.due_date) : null,
            createdAt: new Date(task.created_at),
            userId: task.user_id,
          }));
          
          set({ tasks: formattedTasks });
        } catch (error) {
          console.error("Error fetching tasks from Supabase:", error);
          toast.error("Failed to fetch your tasks");
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
