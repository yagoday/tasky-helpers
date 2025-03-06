
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus } from "@/types/task";

interface TaskState {
  tasks: Task[];
  filter: TaskStatus;
  addTask: (title: string, dueDate: Date | null) => void;
  toggleTask: (id: string) => void;
  updateTaskDueDate: (id: string, dueDate: Date | null) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: TaskStatus) => void;
  filteredTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: "all",
      
      addTask: (title, dueDate) => {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          completed: false,
          dueDate,
          createdAt: new Date(),
        };
        
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },
      
      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        }));
      },
      
      updateTaskDueDate: (id, dueDate) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, dueDate } : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        }));
      },
      
      setFilter: (filter) => {
        set({ filter });
      },
      
      filteredTasks: () => {
        const { tasks, filter } = get();
        
        switch (filter) {
          case "active":
            return tasks.filter((task) => !task.completed);
          case "completed":
            return tasks.filter((task) => task.completed);
          default:
            return tasks;
        }
      },
    }),
    {
      name: "task-store",
    }
  )
);
