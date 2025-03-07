
import { TaskState } from "../taskStore";
import { StateCreator } from "zustand";
import { toast } from "sonner";
import { supabase } from "../useAuth";

export const createDbOperations = (
  set: StateCreator<TaskState, [], [], TaskState>["setState"] extends never 
    ? (partial: TaskState | Partial<TaskState> | ((state: TaskState) => TaskState | Partial<TaskState>), replace?: boolean) => void
    : StateCreator<TaskState, [], [], TaskState>["setState"],
  get: () => TaskState
) => ({
  initializeTables: async (userId: string) => {
    try {
      const { error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (tasksError && tasksError.code === '42P01') {
        console.log("Creating tasks table");
      }

      const { error: labelsError } = await supabase
        .from('labels')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (labelsError && labelsError.code === '42P01') {
        console.log("Creating labels table");
      }

      set({ tablesInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Error initializing tables:", error);
      set({ tablesInitialized: true, isLoading: false });
    }
  },

  syncWithSupabase: async (userId: string = "123e4567-e89b-12d3-a456-426614174000") => {
    try {
      console.log("Syncing with Supabase for userId:", userId);
      set({ isLoading: true });

      if (!get().tablesInitialized) {
        await get().initializeTables(userId);
      }

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

      if (taskError) {
        console.error("Error fetching tasks:", taskError);
      } else {
        const tasks = taskData?.map((task: any) => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          createdAt: new Date(task.created_at),
          userId: task.user_id,
          labels: task.labels || []
        })) || [];

        if (tasks.length > 0) {
          set({ tasks });
        }
      }

      const { data: labelData, error: labelError } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', userId);

      if (labelError) {
        console.error("Error fetching labels:", labelError);
      } else {
        const labels = labelData?.map((label: any) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        })) || [];

        if (labels.length > 0) {
          set({ labels });
        }
      }

      console.log("Sync with Supabase successful");
      set({ isLoading: false });
    } catch (error) {
      console.error("Error syncing with Supabase:", error);
      set({ isLoading: false });
    }
  }
});
