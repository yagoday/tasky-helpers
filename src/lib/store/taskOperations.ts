
import { TaskState } from "../taskStore";
import { StateCreator } from "zustand";
import { Task } from "@/types/task";
import { supabase } from "../useAuth";
import { toast } from "sonner";

export const createTaskOperations = (
  set: StateCreator<TaskState, [], [], TaskState>["setState"] extends never 
    ? (partial: TaskState | Partial<TaskState> | ((state: TaskState) => TaskState | Partial<TaskState>), replace?: boolean) => void
    : StateCreator<TaskState, [], [], TaskState>["setState"],
  get: () => TaskState
) => ({
  addTask: async (title: string, dueDate: Date | null, labels: string[] = []) => {
    try {
      set({ isLoading: true });
      
      // Get current user id
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || crypto.randomUUID();
      
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        dueDate,
        createdAt: new Date(),
        userId: userId,
        labels: labels,
      };

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
        console.log("Using local storage only");
      }
  
      set(state => ({
        tasks: [newTask, ...(Array.isArray(state.tasks) ? state.tasks : [])],
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
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompleted })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }

      set(state => ({
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).map(t =>
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
      
      const { error } = await supabase
        .from('tasks')
        .update({ labels: labels })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }
      
      set((state) => ({
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).map((task) =>
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
      
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: dueDate })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }
      
      set((state) => ({
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).map((task) =>
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
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Supabase delete error:", error);
        console.log("Using local storage only");
      }
      
      set((state) => ({
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).filter((task) => task.id !== id),
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
        
      for (const id of completedTaskIds) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error(`Supabase delete error for task ${id}:`, error);
        }
      }
      
      set((state) => ({
        tasks: (Array.isArray(state.tasks) ? state.tasks : []).filter((task) => !task.completed),
        isLoading: false
      }));
      
      toast.success("Completed tasks cleared successfully");
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
      toast.error("Failed to clear completed tasks");
      set({ isLoading: false });
    }
  }
});
