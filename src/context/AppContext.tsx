import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Task, User, Theme, FocusSession, Team, TeamMember, TaskDefenseSystem, AppError, TaskReminderSettings } from '../types';
import { smartInterventionService } from '../services/SmartInterventionService';
import { generateSecureId, validateUserData, validateTaskData } from '../utils/validation';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { userActionService } from '../services/UserActionService';
import { enhancedSchedulerService } from '../services/EnhancedSchedulerService';
import { FirestoreService } from '../services/firestoreService';
import { AuthService } from '../services/authService';

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
  const addError = useCallback((type: AppError['type'], message: string, context?: any) => {
    const error: AppError = {
      id: generateSecureId(),
      type,
      message,
      timestamp: new Date(),
      context
    };
    dispatch({ type: 'ADD_ERROR', payload: error });
  }, []);

  const clearError = useCallback((errorId: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: errorId });
  }, []);

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
  }, [addError]);

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
  }, [state.theme, addError]);

  // Set up Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userData = await AuthService.getCurrentUser();
          
          if (userData) {
            dispatch({ type: 'SET_USER', payload: userData });
            
            // Check if user needs onboarding
            if (!userData.workStyle) {
              dispatch({ type: 'START_ONBOARDING' });
            } else {
              dispatch({ type: 'COMPLETE_ONBOARDING' });
            }
            
            // Load user tasks from Firestore
            const tasks = await FirestoreService.getUserTasks(userData.id);
            dispatch({ type: 'SET_TASKS', payload: tasks });
            
            // Load user teams from Firestore
            const teams = await FirestoreService.getUserTeams(userData.id);
            dispatch({ type: 'SET_TEAMS', payload: teams });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          addError('auth', 'Failed to load user data');
        }
      } else {
        // No user is signed in, check for local user
        const localUser = AuthService.getCurrentUser();
        if (localUser) {
          dispatch({ type: 'SET_USER', payload: await localUser });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      }
    });

    return () => unsubscribe();
  }, [addError]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    if (!state.user) {
      addError('auth', 'User must be logged in to add tasks');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const task = await FirestoreService.createTask(state.user.id, {
        ...taskData,
        isDefenseActive: true,
        defenseLevel: taskData.priority === 'urgent' ? 'critical' : 
                     taskData.priority === 'high' ? 'high' : 'medium',
        procrastinationCount: 0,
        focusSessionsCount: 0,
        totalFocusTime: 0
      });

      // Add task to state
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
  }, [state.user, addError]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      if (!state.user) return;
      
      const currentTask = state.tasks.find(t => t.id === id);
      if (!currentTask) return;

      const updatedTask = { ...updates, updatedAt: new Date() };
      
      // Update task in state immediately
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates: updatedTask } });
      
      // Update in Firestore
      await FirestoreService.updateTask(state.user.id, id, updatedTask);
      
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
          
          // Update user in Firestore
          AuthService.updateUser(state.user.id, {
            integrityScore,
            streak: streakData.currentStreak,
            totalTasksCompleted: (state.user.totalTasksCompleted || 0) + 1,
            lastActiveDate: new Date()
          });
        }
      }, 0);
    } catch (error) {
      console.error('Failed to update task:', error);
      addError('unknown', 'Failed to update task');
    }
  }, [state.tasks, state.user, addError]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      if (!state.user) return;
      
      // Clear any active interventions for this task
      smartInterventionService.clearInterventionForTask(id);
      
      // Clear task reminders
      enhancedSchedulerService.clearTaskReminders(id);
      
      // Delete task from Firestore
      await FirestoreService.deleteTask(state.user.id, id);
      
      // Delete task from state
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
  }, [state.user, addError]);

  const moveTaskToInProgress = useCallback(async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'in-progress' });
    } catch (error) {
      console.error('Failed to move task to in-progress:', error);
      addError('unknown', 'Failed to move task to in-progress');
    }
  }, [updateTask, addError]);

  const setTaskReminder = useCallback((taskId: string, settings: TaskReminderSettings) => {
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
  }, [updateTask, addError]);

  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const startFocusSession = useCallback((taskId: string) => {
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
    
    // Create focus session in Firestore
    if (state.user) {
      FirestoreService.createFocusSession(session).catch(error => {
        console.error('Failed to save focus session:', error);
      });
    }
    
    // Log user action asynchronously
    setTimeout(() => {
      userActionService.logAction(state.user!.id, 'focus_started', taskId, {
        sessionId: session.id
      });
    }, 0);
  }, [state.user]);

  const endFocusSession = useCallback(() => {
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
        
        // Update user in Firestore
        AuthService.updateUser(state.user!.id, {
          totalFocusTime: (state.user!.totalFocusTime || 0) + durationMinutes,
          lastActiveDate: new Date()
        });
      }, 0);
    }

    dispatch({ type: 'END_FOCUS_SESSION' });
  }, [state.focusSession, state.user, state.tasks, updateTask]);

  const createTeam = useCallback(async (teamData: Omit<Team, 'id' | 'createdAt' | 'inviteCode'>) => {
    if (!state.user) {
      addError('auth', 'User must be logged in to create teams');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const team = await FirestoreService.createTeam({
        ...teamData,
        inviteCode: generateSecureId().substring(0, 8).toUpperCase()
      });
      
      dispatch({ type: 'CREATE_TEAM', payload: team });
    } catch (error) {
      console.error('Failed to create team:', error);
      addError('unknown', 'Failed to create team');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user, addError]);

  const joinTeam = useCallback(async (inviteCode: string) => {
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
    } catch (error) {
      console.error('Failed to join team:', error);
      addError('unknown', 'Failed to join team');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user, addError]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) {
      addError('auth', 'User must be logged in to update profile');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Update user in Firestore and localStorage
      const updatedUser = await AuthService.updateUser(state.user.id, updates);
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      addError('storage', 'Failed to save profile updates');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.user, addError]);

  const triggerDefense = useCallback((taskId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    smartInterventionService.triggerManualDefense(taskId, severity);
  }, []);

  const signOut = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
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
  }, [addError]);

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
  }), [
    state,
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
    setTaskReminder
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AppContext.Provider>
  );
};