import { create } from "zustand";
import { TaskService } from "@/services/taskService";
import { LabelService } from "@/services/labelService";
import { handleStoreError } from "@/utils/errorHandling";
import { useTaskStore } from "./taskStore";
import { useLabelStore } from "./labelStore";
import { Task } from "@/types/task";
import { Label } from "@/types/label";

interface SyncState {
  isLoading: boolean;
  tablesInitialized: boolean;
  initializeTables: (userId: string) => Promise<void>;
  syncWithSupabase: (userId: string) => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isLoading: false,
  tablesInitialized: false,

  initializeTables: async (userId: string) => {
    try {
      const { error: tasksError } = await TaskService.getTasks(userId);
      if (tasksError && tasksError.code === '42P01') {
        console.log("Creating tasks table");
      }

      const { error: labelsError } = await LabelService.getLabels(userId);
      if (labelsError && labelsError.code === '42P01') {
        console.log("Creating labels table");
      }

      set({ tablesInitialized: true, isLoading: false });
    } catch (error) {
      handleStoreError(error, "initialize tables");
      set({ tablesInitialized: true, isLoading: false });
    }
  },

  syncWithSupabase: async (userId: string) => {
    try {
      console.log("Syncing with Supabase for userId:", userId);
      set({ isLoading: true });

      if (!get().tablesInitialized) {
        await get().initializeTables(userId);
      }

      // Sync tasks
      const { data: taskData, error: taskError } = await TaskService.getTasks(userId);
      if (taskError) {
        throw taskError;
      }

      if (taskData) {
        const tasks: Task[] = taskData.map((task: any) => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          createdAt: new Date(task.created_at),
          userId: task.user_id,
          labels: task.labels || []
        }));

        useTaskStore.setState({ tasks });
      }

      // Sync labels
      const { data: labelData, error: labelError } = await LabelService.getLabels(userId);
      if (labelError) {
        throw labelError;
      }

      if (labelData) {
        const labels: Label[] = labelData.map((label: any) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        }));

        useLabelStore.setState({ labels });
      }

      console.log("Sync with Supabase successful");
      set({ isLoading: false });
    } catch (error) {
      handleStoreError(error, "sync with Supabase");
      set({ isLoading: false });
    }
  }
})); 