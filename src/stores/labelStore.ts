import { create } from "zustand";
import { Label, LabelState } from "@/types/label";
import { LabelService } from "@/services/labelService";
import { handleStoreError, handleStoreSuccess } from "@/utils/errorHandling";
import { supabase } from "@/lib/useAuth";

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  labelFilter: null,
  isLoading: false,

  addLabel: async (name: string, color: string) => {
    try {
      set({ isLoading: true });
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || crypto.randomUUID();
      
      const newLabel: Label = {
        id: crypto.randomUUID(),
        name,
        color,
      };
    
      const { error } = await LabelService.addLabel(newLabel, userId);
      if (error) throw error;
      
      set(state => ({
        labels: [...state.labels, newLabel],
        isLoading: false
      }));
      
      handleStoreSuccess("Label added");
    } catch (error) {
      handleStoreError(error, "add label");
      set({ isLoading: false });
    }
  },

  updateLabel: async (id: string, name: string, color: string) => {
    try {
      set({ isLoading: true });
      
      const { error } = await LabelService.updateLabel(id, { name, color });
      if (error) throw error;
      
      set(state => ({
        labels: state.labels.map(label =>
          label.id === id ? { ...label, name, color } : label
        ),
        isLoading: false
      }));
      
      handleStoreSuccess("Label updated");
    } catch (error) {
      handleStoreError(error, "update label");
      set({ isLoading: false });
    }
  },

  deleteLabel: async (id: string) => {
    try {
      set({ isLoading: true });
      
      const { error } = await LabelService.deleteLabel(id);
      if (error) throw error;
      
      set(state => ({
        labels: state.labels.filter(label => label.id !== id),
        isLoading: false
      }));

      if (get().labelFilter === id) {
        set({ labelFilter: null });
      }
      
      handleStoreSuccess("Label deleted");
    } catch (error) {
      handleStoreError(error, "delete label");
      set({ isLoading: false });
    }
  },

  setLabelFilter: (labelId: string | null) => {
    set({ labelFilter: labelId });
  }
})); 