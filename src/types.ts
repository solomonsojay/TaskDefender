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
  profilePicture?: string | null;
  emailVerified?: boolean;
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
  actualTime?: number;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  userId: string;
  teamId?: string;
  honestlyCompleted?: boolean;
  expectedCompletionTime?: Date;
  scheduledTime?: Date;
  isDefenseActive?: boolean;
  defenseLevel?: 'low' | 'medium' | 'high' | 'critical';
  lastDefenseAction?: Date;
  procrastinationCount?: number;
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
  defenseTriggered?: boolean;
  interventionCount?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface VoiceSettings {
  selectedVoice: string;
  enableCalls: boolean;
  callFrequency: 'low' | 'normal' | 'high';
  selectedCharacter: string;
  customCharacterName: string;
  customPrompts: string[];
  customVoiceBlob: Blob | null;
  callInterval: number;
  defenseMode?: boolean;
  emergencyCallThreshold?: number;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'nudge' | 'deadline' | 'celebration' | 'defense' | 'emergency';
  scheduledFor: Date;
  recurring: 'none' | 'daily' | 'weekly' | 'workdays';
  isActive: boolean;
  taskId?: string;
  character: string;
  voiceEnabled: boolean;
  interval: number;
  defenseLevel?: 'low' | 'medium' | 'high' | 'critical';
  isDefenseAction?: boolean;
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

export interface DefenseAction {
  id: string;
  taskId: string;
  actionType: 'voice_call' | 'notification' | 'intervention' | 'emergency_call';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: Date;
  successful?: boolean;
  userResponse?: 'acknowledged' | 'dismissed' | 'completed_task';
}

export interface TaskDefenseSystem {
  isActive: boolean;
  monitoringTasks: string[];
  defenseLevel: 'passive' | 'active' | 'aggressive' | 'emergency';
  lastAction?: DefenseAction;
  interventionHistory: DefenseAction[];
  successRate: number;
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
  defenseSystem: TaskDefenseSystem;
}