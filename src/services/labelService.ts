
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/types/label";

export const LabelService = {
  addLabel: async (label: Label, userId: string) => {
    return await supabase
      .from('labels')
      .insert([{ 
        id: label.id,
        name: label.name,
        color: label.color,
        user_id: userId
      }]);
  },

  updateLabel: async (id: string, data: Partial<Label>) => {
    return await supabase
      .from('labels')
      .update(data)
      .eq('id', id);
  },

  deleteLabel: async (id: string) => {
    return await supabase
      .from('labels')
      .delete()
      .eq('id', id);
  },

  getLabels: async (userId: string) => {
    return await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId);
  }
};
