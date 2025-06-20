export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  integrityScore: number;
  streak: number;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: Date;
  estimatedTime?: number;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  userId: string;
  honestlyCompleted?: boolean;
}

export interface FocusSession {
  id: string;
  taskId: string;
  duration: number;
  completed: boolean;
  distractions: number;
  userId: string;
  createdAt: Date;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  user: User | null;
  tasks: Task[];
  focusSession: FocusSession | null;
  theme: Theme;
}