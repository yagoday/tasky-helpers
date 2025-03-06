
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
  userId?: string;
  labels: string[];
}

export type TaskStatus = 'all' | 'active' | 'completed';

export interface Label {
  id: string;
  name: string;
  color: string;
}
