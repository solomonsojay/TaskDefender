export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  goals: string[];
  workStyle: 'focused' | 'flexible' | 'collaborative' | null; // Allow null for new users
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
  updatedAt?: Date;
  socialAccounts?: SocialAccount[];
  profilePicture?: string | null;
  emailVerified?: boolean;
  totalFocusTime?: number;
  totalTasksCompleted?: number;
  lastActiveDate?: Date;
}

export interface SocialAccount {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'devto';
  connected: boolean;
  username?: string;
  profileUrl?: string;
  accessToken?: string;
  refreshToken?: string;
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
  updatedAt?: Date;
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
  reminderSettings?: TaskReminderSettings;
  focusSessionsCount?: number;
  totalFocusTime?: number;
}

export interface TaskReminderSettings {
  enabled: boolean;
  interval: number; // minutes
  useVoice: boolean;
  useTone: boolean;
  selectedTone?: string;
  character?: string;
  snoozeOptions: number[]; // [5, 10, 15] minutes
  lastReminder?: Date;
  snoozedUntil?: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: TeamMember[];
  inviteCode: string;
  createdAt: Date;
  updatedAt?: Date;
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
  updatedAt?: Date;
  defenseTriggered?: boolean;
  interventionCount?: number;
  actualFocusTime?: number;
  startTime?: Date;
  endTime?: Date;
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
  enableCalls: boolean;
  callFrequency: 'low' | 'normal' | 'high';
  selectedCharacter: string;
  customCharacterName: string;
  customPrompts: string[];
  customVoiceBlob: Blob | null;
  selectedVoice: string;
  callInterval: number;
  defenseMode?: boolean;
  emergencyCallThreshold?: number;
}

export interface ReminderTone {
  id: string;
  name: string;
  description: string;
  frequency: number; // Hz
  duration: number; // ms
  pattern: 'single' | 'double' | 'triple' | 'continuous';
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
  toneEnabled: boolean;
  selectedTone?: string;
  interval: number;
  defenseLevel?: 'low' | 'medium' | 'high' | 'critical';
  isDefenseAction?: boolean;
  snoozeOptions: number[];
  lastTriggered?: Date;
  snoozedUntil?: Date;
  reminderCount?: number;
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
  actionType: 'voice_call' | 'notification' | 'intervention' | 'emergency_call' | 'tone_reminder';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: Date;
  successful?: boolean;
  userResponse?: 'acknowledged' | 'dismissed' | 'completed_task' | 'snoozed';
  snoozeTime?: number;
}

export interface TaskDefenseSystem {
  isActive: boolean;
  monitoringTasks: string[];
  defenseLevel: 'passive' | 'active' | 'aggressive' | 'emergency';
  lastAction?: DefenseAction;
  interventionHistory: DefenseAction[];
  successRate: number;
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
  integrityScore: number;
  streak: number;
  totalFocusMinutes: number;
  averageTaskCompletionTime: number;
  procrastinationEvents: number;
}

export interface UserAction {
  id: string;
  userId: string;
  action: 'task_created' | 'task_completed' | 'task_deleted' | 'focus_started' | 'focus_completed' | 'procrastination_detected' | 'honest_completion' | 'dishonest_completion';
  timestamp: Date;
  taskId?: string;
  metadata?: any;
  integrityImpact?: number;
}

export interface NotificationSettings {
  taskReminders: boolean;
  focusMode: boolean;
  dailySummary: boolean;
  teamUpdates: boolean;
  voiceCalls: boolean;
  defenseSystem: boolean;
  toneReminders: boolean;
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
  currentTeam: Team | null;
  focusSession: FocusSession | null;
  theme: Theme;
  isOnboarding: boolean;
  defenseSystem: TaskDefenseSystem;
}

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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AppError {
  id: string;
  type: 'validation' | 'network' | 'storage' | 'auth' | 'unknown';
  message: string;
  timestamp: Date;
  context?: any;
}