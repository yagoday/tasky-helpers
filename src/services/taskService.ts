
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

export const TaskService = {
  addTask: async (task: Task) => {
    return await supabase
      .from('tasks')
      .insert([{ 
        id: task.id,
        title: task.title,
        completed: task.completed,
        due_date: task.dueDate,
        created_at: task.createdAt,
        user_id: task.userId,
        labels: task.labels
      }]);
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    return await supabase
      .from('tasks')
      .update(data)
      .eq('id', id);
  },

  deleteTask: async (id: string) => {
    return await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
  },

  getTasks: async (userId: string) => {
    return await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
  }
};
