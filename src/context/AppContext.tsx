import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Task, User, Theme, FocusSession, Team, TeamMember, TaskDefenseSystem, AppError, TaskReminderSettings } from '../types';
import { smartInterventionService } from '../services/SmartInterventionService';
import { generateSecureId, validateUserData, validateTaskData } from '../utils/validation';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { userActionService } from '../services/UserActionService';
import { enhancedSchedulerService } from '../services/EnhancedSchedulerService';

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  startFocusSession: (taskId: string) => void;
  endFocusSession: () => void;
  createTeam: (team: Omit<Team, 'id' | 'createdAt' | 'inviteCode'>) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  triggerDefense: (taskId: string, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
  signOut: () => Promise<void>;
  errors: AppError[];
  clearError: (errorId: string) => void;
  isLoading: boolean;
  moveTaskToInProgress: (taskId: string) => Promise<void>;
  setTaskReminder: (taskId: string, settings: TaskReminderSettings) => void;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'START_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'END_FOCUS_SESSION' }
  | { type: 'CREATE_TEAM'; payload: Team }
  | { type: 'JOIN_TEAM'; payload: Team }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'START_ONBOARDING' }
  | { type: 'UPDATE_DEFENSE_SYSTEM'; payload: Partial<TaskDefenseSystem> }
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  user: null,
  tasks: [],
  teams: [],
  currentTeam: null,
  focusSession: null,
  theme: 'light',
  isOnboarding: false,
  defenseSystem: {
    isActive: true,
    monitoringTasks: [],
    defenseLevel: 'active',
    interventionHistory: [],
    successRate: 0
  }
};

const appReducer = (state: AppState & { errors: AppError[]; isLoading: boolean }, action: AppAction): AppState & { errors: AppError[]; isLoading: boolean } => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'START_FOCUS_SESSION':
      return { ...state, focusSession: action.payload };
    case 'END_FOCUS_SESSION':
      return { ...state, focusSession: null };
    case 'CREATE_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    case 'JOIN_TEAM':
      return { 
        ...state, 
        teams: [...state.teams, action.payload],
        currentTeam: action.payload 
      };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, isOnboarding: false };
    case 'START_ONBOARDING':
      return { ...state, isOnboarding: true };
    case 'UPDATE_DEFENSE_SYSTEM':
      return { 
        ...state, 
        defenseSystem: { ...state.defenseSystem, ...action.payload } 
      };
    case 'ADD_ERROR':
      return { ...state, errors: [...state.errors, action.payload] };
    case 'CLEAR_ERROR':
      return { ...state, errors: state.errors.filter(e => e.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, { 
    ...initialState, 
    errors: [], 
    isLoading: false 
  });

  // Error handling helper
  const addError = (type: AppError['type'], message: string, context?: any) => {
    const error: AppError = {
      id: generateSecureId(),
      type,
      message,
      timestamp: new Date(),
      context
    };
    dispatch({ type: 'ADD_ERROR', payload: error });
  };

  const clearError = (errorId: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: errorId });
  };

  // Load theme from localStorage with error handling
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('taskdefender_theme') as Theme;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      addError('storage', 'Failed to load theme preferences');
    }
  }, []);

  // Apply theme with error handling
  useEffect(() => {
    try {
      localStorage.setItem('taskdefender_theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      addError('storage', 'Failed to save theme preferences');
    }
  }, [state.theme]);

  // Load tasks from localStorage when user changes with validation
  useEffect(() => {
    if (state.user) {
      try {
        const savedTasks = localStorage.getItem(`taskdefender_tasks_${state.user.id}`);
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            expectedCompletionTime: task.expectedCompletionTime ? new Date(task.expectedCompletionTime) : undefined,
            scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : undefined
          }));
          
          // Validate tasks before setting
          const validTasks = tasks.filter((task: Task) => {
            const validation = validateTaskData(task);
            if (!validation.isValid) {
              console.warn('Invalid task data:', validation.errors);
              return false;
            }
            return true;
          });
          
          dispatch({ type: 'SET_TASKS', payload: validTasks });
        }
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
        addError('storage', 'Failed to load tasks');
      }
    } else {
      dispatch({ type: 'SET_TASKS', payload: [] });
    }
  }, [state.user]);

  // Debounced save tasks to localStorage to prevent flickering
  useEffect(() => {
    if (state.user && state.tasks.length >= 0) {
      // Use a timeout to debounce the save operation
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(`taskdefender_tasks_${state.user.id}`, JSON.stringify(state.tasks));
        } catch (error) {
          console.error('Failed to save tasks:', error);
          addError('storage', 'Failed to save tasks');
        }
      }, 100); // 100ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [state.tasks, state.user]);

  // Load teams with error handling
  useEffect(() => {
    if (state.user) {
      try {
        const savedTeams = localStorage.getItem(`taskdefender_teams_${state.user.id}`);
        if (savedTeams) {
          const teams = JSON.parse(savedTeams).map((team: any) => ({
            ...team,
            createdAt: new Date(team.createdAt),
            updatedAt: team.updatedAt ? new Date(team.updatedAt) : undefined,
            members: team.members.map((member: any) => ({
              ...member,
              joinedAt: new Date(member.joinedAt)
            }))
          }));
          dispatch({ type: 'SET_TEAMS', payload: teams });
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
        addError('storage', 'Failed to load teams');
      }
    }
  }, [state.user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    if (!state.user) {
      addError('auth', 'User must be logged in to add tasks');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const task: Task = {
        ...taskData,
        id: generateSecureId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: state.user.id,
        isDefenseActive: true,
        defenseLevel: taskData.priority === 'urgent' ? 'critical' : 
                     taskData.priority === 'high' ? 'high' : 'medium',
        procrastinationCount: 0,
        focusSessionsCount: 0,
        totalFocusTime: 0
      };

      // Validate task data
      const validation = validateTaskData(task);
      if (!validation.isValid) {
        addError('validation', `Invalid task data: ${validation.errors.join(', ')}`);
        return;
      }

      // Add task to state immediately to prevent flickering
      dispatch({ type: 'ADD_TASK', payload: task });
      
      // Log user action asynchronously
      setTimeout(() => {
        userActionService.logAction(state.user!.id, 'task_created', task.id, {
          priority: task.priority,
          hasDueDate: !!task.dueDate
        });
      }, 0);

    } catch (error) {
      console.error('Failed to add task:', error);
      addError('unknown', 'Failed to add task');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const currentTask = state.tasks.find(t => t.id === id);
      if (!currentTask || !state.user) return;

      const updatedTask = { ...updates, updatedAt: new Date() };
      
      // Update task in state immediately to prevent flickering
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates: updatedTask } });
      
      // Handle completion logic asynchronously
      setTimeout(() => {
        if (updates.status === 'done' && currentTask.status !== 'done') {
          const integrityImpact = updates.honestlyCompleted === false ? -5 : +2;
          
          userActionService.logAction(
            state.user!.id, 
            updates.honestlyCompleted === false ? 'dishonest_completion' : 'honest_completion',
            id,
            {
              completionTime: currentTask.actualTime || 0,
              priority: currentTask.priority,
              wasOverdue: currentTask.dueDate ? new Date() > currentTask.dueDate : false
            },
            integrityImpact
          );

          // Clear task reminders
          enhancedSchedulerService.clearTaskReminders(id);
        }

        // Log status changes
        if (updates.status && updates.status !== currentTask.status) {
          userActionService.logAction(state.user!.id, 'task_completed', id, {
            fromStatus: currentTask.status,
            toStatus: updates.status
          });
        }
        
        // Clear interventions if task is completed
        if (updates.status === 'done') {
          smartInterventionService.clearInterventionForTask(id);
        }
        
        // Update user stats
        if (updates.status === 'done' && state.user) {
          const completedTasks = state.tasks.filter(t => t.status === 'done').length + 1;
          const honestTasks = state.tasks.filter(t => t.status === 'done' && t.honestlyCompleted !== false).length + (updates.honestlyCompleted !== false ? 1 : 0);
          const integrityScore = Math.round((honestTasks / completedTasks) * 100);
          
          // Update streak using user action service
          const streakData = userActionService.getStreakData(state.user.id);
          
          const updatedUser = { 
            ...state.user, 
            integrityScore,
            streak: streakData.currentStreak,
            totalTasksCompleted: (state.user.totalTasksCompleted || 0) + 1,
            lastActiveDate: new Date(),
            updatedAt: new Date()
          };
          
          dispatch({ type: 'SET_USER', payload: updatedUser });
          
          // Persist user updates
          try {
            localStorage.setItem('taskdefender_current_user', JSON.stringify(updatedUser));
          } catch (error) {
            addError('storage', 'Failed to save user updates');
          }
        }
      }, 0);
    } catch (error) {
      console.error('Failed to update task:', error);
      addError('unknown', 'Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Clear any active interventions for this task
      smartInterventionService.clearInterventionForTask(id);
      
      // Clear task reminders
      enhancedSchedulerService.clearTaskReminders(id);
      
      // Delete task from state immediately
      dispatch({ type: 'DELETE_TASK', payload: id });
      
      // Log user action asynchronously
      setTimeout(() => {
        if (state.user) {
          userActionService.logAction(state.user.id, 'task_deleted', id);
        }
      }, 0);
    } catch (error) {
      console.error('Failed to delete task:', error);
      addError('unknown', 'Failed to delete task');
    }
  };

  const moveTaskToInProgress = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'in-progress' });
    } catch (error) {
      console.error('Failed to move task to in-progress:', error);
      addError('unknown', 'Failed to move task to in-progress');
    }
  };

  const setTaskReminder = (taskId: string, settings: TaskReminderSettings) => {
    try {
      // Update task with reminder settings
      updateTask(taskId, { reminderSettings: settings });
      
      // Set up the actual reminder
      if (settings.enabled) {
        enhancedSchedulerService.setTaskReminder(taskId, settings);
      } else {
        enhancedSchedulerService.clearTaskReminders(taskId);
      }
    } catch (error) {
      console.error('Failed to set task reminder:', error);
      addError('unknown', 'Failed to set task reminder');
    }
  };

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const startFocusSession = (taskId: string) => {
    if (!state.user) return;

    const session: FocusSession = {
      id: generateSecureId(),
      taskId,
      duration: 0,
      completed: false,
      distractions: 0,
      userId: state.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      defenseTriggered: false,
      interventionCount: 0,
      actualFocusTime: 0,
      startTime: new Date()
    };

    dispatch({ type: 'START_FOCUS_SESSION', payload: session });
    
    // Log user action asynchronously
    setTimeout(() => {
      userActionService.logAction(state.user!.id, 'focus_started', taskId, {
        sessionId: session.id
      });
    }, 0);
  };

  const endFocusSession = () => {
    if (state.focusSession && state.user) {
      const session = state.focusSession;
      const endTime = new Date();
      const duration = endTime.getTime() - (session.startTime?.getTime() || session.createdAt.getTime());
      const durationMinutes = Math.round(duration / 60000);

      // Log focus completion asynchronously
      setTimeout(() => {
        userActionService.logAction(state.user!.id, 'focus_completed', session.taskId, {
          duration: durationMinutes,
          distractions: session.distractions,
          completed: session.completed
        });

        // Update task focus stats
        const task = state.tasks.find(t => t.id === session.taskId);
        if (task) {
          updateTask(task.id, {
            focusSessionsCount: (task.focusSessionsCount || 0) + 1,
            totalFocusTime: (task.totalFocusTime || 0) + durationMinutes,
            actualTime: (task.actualTime || 0) + durationMinutes
          });
        }

        // Update user total focus time
        const updatedUser = {
          ...state.user!,
          totalFocusTime: (state.user!.totalFocusTime || 0) + durationMinutes,
          lastActiveDate: new Date()
        };
        
        dispatch({ type: 'SET_USER', payload: updatedUser });
        localStorage.setItem('taskdefender_current_user', JSON.stringify(updatedUser));
      }, 0);
    }

    dispatch({ type: 'END_FOCUS_SESSION' });
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'inviteCode'>) => {
    if (!state.user) {
      addError('auth', 'User must be logged in to create teams');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const team: Team = {
        ...teamData,
        id: generateSecureId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        inviteCode: generateSecureId().substring(0, 8).toUpperCase(),
      };
      
      dispatch({ type: 'CREATE_TEAM', payload: team });
      
      // Save to localStorage
      const currentTeams = state.teams;
      const updatedTeams = [...currentTeams, team];
      localStorage.setItem(`taskdefender_teams_${state.user.id}`, JSON.stringify(updatedTeams));
    } catch (error) {
      console.error('Failed to create team:', error);
      addError('unknown', 'Failed to create team');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const joinTeam = async (inviteCode: string) => {
    if (!state.user) {
      addError('auth', 'User must be logged in to join teams');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // In a real app, this would make an API call
      // For now, we'll simulate finding a team by invite code
      const allTeams = JSON.parse(localStorage.getItem('taskdefender_all_teams') || '[]');
      const teamToJoin = allTeams.find((team: Team) => team.inviteCode === inviteCode);
      
      if (!teamToJoin) {
        addError('validation', 'Invalid invite code');
        return;
      }
      
      // Add user to team members
      const newMember: TeamMember = {
        userId: state.user.id,
        name: state.user.name,
        email: state.user.email,
        role: 'member',
        joinedAt: new Date()
      };
      
      const updatedTeam = {
        ...teamToJoin,
        members: [...teamToJoin.members, newMember],
        updatedAt: new Date()
      };
      
      dispatch({ type: 'JOIN_TEAM', payload: updatedTeam });
      
      // Save to localStorage
      const currentTeams = state.teams;
      const updatedTeams = [...currentTeams, updatedTeam];
      localStorage.setItem(`taskdefender_teams_${state.user.id}`, JSON.stringify(updatedTeams));
    } catch (error) {
      console.error('Failed to join team:', error);
      addError('unknown', 'Failed to join team');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) {
      addError('auth', 'User must be logged in to update profile');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Only validate if workStyle is being set (not null)
      if (updates.workStyle !== null && updates.workStyle !== undefined) {
        const validation = validateUserData({ ...state.user, ...updates });
        if (!validation.isValid) {
          addError('validation', `Invalid profile data: ${validation.errors.join(', ')}`);
          return;
        }
      }
      
      const updatedUser = { 
        ...state.user, 
        ...updates, 
        updatedAt: new Date() 
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      // Persist to localStorage
      localStorage.setItem('taskdefender_current_user', JSON.stringify(updatedUser));
      
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      addError('storage', 'Failed to save profile updates');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const triggerDefense = (taskId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    smartInterventionService.triggerManualDefense(taskId, severity);
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Import AuthService dynamically to avoid circular dependencies
      const { AuthService } = await import('../services/authService');
      await AuthService.signOut();
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_TEAMS', payload: [] });
    } catch (error) {
      console.error('Error signing out:', error);
      addError('auth', 'Failed to sign out');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    ...state,
    dispatch,
    addTask,
    updateTask,
    deleteTask,
    setUser,
    setTheme,
    startFocusSession,
    endFocusSession,
    createTeam,
    joinTeam,
    updateProfile,
    triggerDefense,
    signOut,
    clearError,
    moveTaskToInProgress,
    setTaskReminder,
  }), [state]);

  return (
    <AppContext.Provider value={contextValue}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AppContext.Provider>
  );
};