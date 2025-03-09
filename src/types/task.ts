export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
  userId: string;
  labels: string[];
}

export type TaskStatus = "all" | "active" | "completed";

export interface TaskState {
  tasks: Task[];
  filter: TaskStatus;
  isLoading: boolean;
  addTask: (title: string, dueDate: Date | null, labels?: string[]) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTaskDueDate: (id: string, dueDate: Date | null) => Promise<void>;
  updateTaskLabels: (id: string, labels: string[]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  setFilter: (filter: TaskStatus) => void;
  filteredTasks: () => Task[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
}
