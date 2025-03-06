
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
  userId?: string;
}

export type TaskStatus = 'all' | 'active' | 'completed';
