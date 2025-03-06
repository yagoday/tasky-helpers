
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
}

export type TaskStatus = 'all' | 'active' | 'completed';
