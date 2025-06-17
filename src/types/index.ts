export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  goals: string[];
  workStyle: 'focused' | 'flexible' | 'collaborative';
  integrityScore: number;
  streak: number;
  teamId?: string;
  walletAddress?: string;
  // Organization details (for admin users)
  organizationName?: string;
  organizationType?: 'startup' | 'sme' | 'enterprise' | 'non-profit' | 'government' | 'other';
  organizationIndustry?: string;
  organizationSize?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  userRoleInOrg?: string;
  organizationWebsite?: string;
  organizationDescription?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  dueDate?: Date;
  startDate?: Date;
  estimatedTime?: number;
  actualTime?: number;
  timeBlocks?: TimeBlock[];
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  userId: string;
  teamId?: string;
  honestlyCompleted?: boolean;
  workPattern?: WorkPattern;
}

export interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  isScheduled: boolean;
  isCompleted: boolean;
  notes?: string;
}

export interface WorkPattern {
  totalTimeSpent: number; // minutes
  sessionsCount: number;
  averageSessionLength: number;
  productiveHours: number[]; // hours of day when most productive
  procrastinationScore: number; // 0-100, higher = more procrastination
  consistencyScore: number; // 0-100, higher = more consistent
  lastWorkedOn?: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: TeamMember[];
  inviteCode: string;
  createdAt: Date;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  joinedAt: Date;
}

export interface FocusSession {
  id: string;
  taskId: string;
  duration: number;
  completed: boolean;
  distractions: number;
  userId: string;
  createdAt: Date;
  timeBlockId?: string;
}

export interface DailySummary {
  date: Date;
  tasksCompleted: number;
  tasksPlanned: number;
  focusTime: number;
  integrityScore: number;
  mood?: number;
  reflection?: string;
  userId: string;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  user: User | null;
  tasks: Task[];
  teams: Team[];
  currentTeam: Team | null;
  focusSession: FocusSession | null;
  theme: Theme;
  isOnboarding: boolean;
}