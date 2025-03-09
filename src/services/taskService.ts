
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

export const TaskService = {
  addTask: async (task: Task) => {
    // Convert the labels array to a JSON string before sending to Supabase
    return await supabase
      .from('tasks')
      .insert([{  // Use an array with one object
        id: task.id,
        title: task.title,
        completed: task.completed,
        due_date: task.dueDate,
        created_at: task.createdAt,
        user_id: task.userId,
        labels: JSON.stringify(task.labels) // Convert labels array to string
      }]);
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    // Create a properly formatted object for Supabase
    const supabaseData: Record<string, any> = {};
    
    if (data.title !== undefined) supabaseData.title = data.title;
    if (data.completed !== undefined) supabaseData.completed = data.completed;
    if (data.dueDate !== undefined) supabaseData.due_date = data.dueDate;
    if (data.userId !== undefined) supabaseData.user_id = data.userId;
    if (data.labels !== undefined) supabaseData.labels = JSON.stringify(data.labels);
    
    return await supabase
      .from('tasks')
      .update(supabaseData)
      .eq('id', id);
  },

  deleteTask: async (id: string) => {
    return await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
  },

  getTasks: async (userId: string) => {
    const response = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
      
    // Parse the labels JSON string back to an array for each task
    if (response.data) {
      response.data = response.data.map(task => ({
        ...task,
        labels: task.labels ? JSON.parse(task.labels) : []
      }));
    }
    
    return response;
  }
};
