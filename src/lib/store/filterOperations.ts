
import { TaskState } from "../taskStore";
import { StateCreator } from "zustand";
import { Task } from "@/types/task";
import { TaskStatus } from "@/types/task";

export const createFilterOperations = (
  set: StateCreator<TaskState, [], [], TaskState>["setState"] extends never 
    ? (partial: TaskState | Partial<TaskState> | ((state: TaskState) => TaskState | Partial<TaskState>), replace?: boolean) => void
    : StateCreator<TaskState, [], [], TaskState>["setState"],
  get: () => TaskState
) => ({
  setFilter: (filter: TaskStatus) => {
    set({ filter });
  },

  setLabelFilter: (labelId: string | null) => {
    set({ labelFilter: labelId });
  },

  filteredTasks: () => {
    const state = get();
    let filtered = state.tasks;

    if (state.filter === "active") {
      filtered = filtered.filter((task: Task) => !task.completed);
    } else if (state.filter === "completed") {
      filtered = filtered.filter((task: Task) => task.completed);
    }

    if (state.labelFilter) {
      filtered = filtered.filter((task: Task) => task.labels.includes(state.labelFilter!));
    }

    return filtered;
  }
});
