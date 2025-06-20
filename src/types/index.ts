import { ComponentType } from 'react';

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
  organizationName?: string;
  organizationType?: string;
  organizationIndustry?: string;
  organizationSize?: string;
  userRoleInOrg?: string;
  organizationWebsite?: string;
  organizationDescription?: string;
  createdAt: Date;
  socialAccounts?: SocialAccount[];
}

export interface SocialAccount {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'devto';
  connected: boolean;
  username?: string;
  profileUrl?: string;
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
  teamId?: string;
  honestlyCompleted?: boolean;
  expectedCompletionTime?: Date;
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
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  actions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  message: string;
  icon: ComponentType<any>;
  category: 'help' | 'action' | 'navigation';
}

export interface VoiceSettings {
  selectedVoice: string;
  enableCalls: boolean;
  callFrequency: 'low' | 'normal' | 'high';
  selectedCharacter: string;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'nudge' | 'deadline' | 'celebration';
  scheduledFor: Date;
  recurring: 'none' | 'daily' | 'weekly' | 'workdays';
  isActive: boolean;
  taskId?: string;
  character: string;
  voiceEnabled: boolean;
  interval: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  earnedAt?: Date;
}

export interface AnalyticsData {
  tasksCompleted: number;
  totalTasks: number;
  focusTime: number;
  productivity: number;
  consistency: number;
  growth: number;
  topDay: string;
  achievements: number;
}

export interface NotificationSettings {
  taskReminders: boolean;
  focusMode: boolean;
  dailySummary: boolean;
  teamUpdates: boolean;
  voiceCalls: boolean;
}

export interface AppSettings {
  theme: Theme;
  notifications: NotificationSettings;
  voice: VoiceSettings;
  privacy: PrivacySettings;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  allowTeamInvites: boolean;
  publicProfile: boolean;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  user: User | null;
  tasks: Task[];
  teams: Team[];
  currentTeam?: Team | null;
  focusSession: FocusSession | null;
  theme: Theme;
  isOnboarding: boolean;
}

// Component Props Types
export interface HeaderProps {
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'tasks' | 'focus' | 'teams' | 'analytics' | 'achievements' | 'scheduler') => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onStartFocus: (taskId: string) => void;
}

export interface TeamCardProps {
  team: Team;
  isAdmin: boolean;
  onJoin?: (teamId: string) => void;
  onLeave?: (teamId: string) => void;
}