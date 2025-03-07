
import { TaskState } from "../taskStore";
import { StateCreator } from "zustand";
import { Label } from "@/types/task";
import { supabase } from "../useAuth";
import { toast } from "sonner";

export const createLabelOperations = (
  set: StateCreator<TaskState, [], [], TaskState>["setState"] extends never 
    ? (partial: TaskState | Partial<TaskState> | ((state: TaskState) => TaskState | Partial<TaskState>), replace?: boolean) => void
    : StateCreator<TaskState, [], [], TaskState>["setState"],
  get: () => TaskState
) => ({
  addLabel: async (name: string, color: string) => {
    try {
      set({ isLoading: true });
      
      // Get current user id
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || crypto.randomUUID();
      
      const newLabel: Label = {
        id: crypto.randomUUID(),
        name,
        color,
      };
    
      const { error } = await supabase
        .from('labels')
        .insert([
          { 
            id: newLabel.id,
            name: newLabel.name,
            color: newLabel.color,
            user_id: userId
          }
        ]);

      if (error) {
        console.error("Supabase insert error:", error);
        console.log("Using local storage only");
      }
      
      set((state) => ({
        labels: [...(Array.isArray(state.labels) ? state.labels : []), newLabel],
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
      
      const { error } = await supabase
        .from('labels')
        .update({ name, color })
        .eq('id', id);
        
      if (error) {
        console.error("Supabase update error:", error);
        console.log("Using local storage only");
      }
      
      set((state) => ({
        labels: (Array.isArray(state.labels) ? state.labels : []).map((label) =>
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
      
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Supabase delete error:", error);
        console.log("Using local storage only");
      }
      
      set((state) => {
        // Ensure tasks and labels are arrays
        const tasksArray = Array.isArray(state.tasks) ? state.tasks : [];
        const labelsArray = Array.isArray(state.labels) ? state.labels : [];
        
        // Update tasks and labels
        return {
          tasks: tasksArray.map((task) => ({
            ...task,
            labels: Array.isArray(task.labels) ? task.labels.filter((labelId) => labelId !== id) : []
          })),
          labels: labelsArray.filter((label) => label.id !== id),
          labelFilter: state.labelFilter === id ? null : state.labelFilter,
          isLoading: false
        };
      });
      
      toast.success("Label deleted successfully");
    } catch (error) {
      console.error("Error deleting label:", error);
      toast.error("Failed to delete label");
      set({ isLoading: false });
    }
  }
});
