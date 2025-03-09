import { create } from "zustand";
import { Task, TaskState, TaskStatus } from "@/types/task";
import { TaskService } from "@/services/taskService";
import { handleStoreError, handleStoreSuccess } from "@/utils/errorHandling";
import { supabase } from "@/lib/useAuth";

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: "all" as TaskStatus,
  isLoading: false,

  addTask: async (title: string, dueDate: Date | null, labels: string[] = []) => {
    try {
      set({ isLoading: true });
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || crypto.randomUUID();
      
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        dueDate,
        createdAt: new Date(),
        userId,
        labels,
      };

      const { error } = await TaskService.addTask(newTask);
      if (error) throw error;

      set(state => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false
      }));
      
      handleStoreSuccess("Task added");
    } catch (error) {
      handleStoreError(error, "add task");
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
      const { error } = await TaskService.updateTask(id, { completed: newCompleted });
      if (error) throw error;

      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, completed: newCompleted } : t
        ),
        isLoading: false
      }));
      
      handleStoreSuccess("Task updated");
    } catch (error) {
      handleStoreError(error, "update task");
      set({ isLoading: false });
    }
  },

  updateTaskDueDate: async (id: string, dueDate: Date | null) => {
    try {
      set({ isLoading: true });
      
      const { error } = await TaskService.updateTask(id, { dueDate });
      if (error) throw error;
      
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, dueDate } : task
        ),
        isLoading: false
      }));
      
      handleStoreSuccess("Due date updated");
    } catch (error) {
      handleStoreError(error, "update due date");
      set({ isLoading: false });
    }
  },

  updateTaskLabels: async (id: string, labels: string[]) => {
    try {
      set({ isLoading: true });
      
      const { error } = await TaskService.updateTask(id, { labels });
      if (error) throw error;
      
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, labels } : task
        ),
        isLoading: false
      }));
      
      handleStoreSuccess("Task labels updated");
    } catch (error) {
      handleStoreError(error, "update task labels");
      set({ isLoading: false });
    }
  },

  deleteTask: async (id: string) => {
    try {
      set({ isLoading: true });
      
      const { error } = await TaskService.deleteTask(id);
      if (error) throw error;
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false
      }));
      
      handleStoreSuccess("Task deleted");
    } catch (error) {
      handleStoreError(error, "delete task");
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
        const { error } = await TaskService.deleteTask(id);
        if (error) throw error;
      }
      
      set(state => ({
        tasks: state.tasks.filter(task => !task.completed),
        isLoading: false
      }));
      
      handleStoreSuccess("Completed tasks cleared");
    } catch (error) {
      handleStoreError(error, "clear completed tasks");
      set({ isLoading: false });
    }
  },

  setFilter: (filter: TaskStatus) => {
    set({ filter });
  },

  filteredTasks: () => {
    const state = get();
    let filtered = state.tasks;

    if (state.filter === "active") {
      filtered = filtered.filter(task => !task.completed);
    } else if (state.filter === "completed") {
      filtered = filtered.filter(task => task.completed);
    }

    return filtered;
  }
})); 