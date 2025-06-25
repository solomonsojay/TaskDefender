import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Task, User, Theme, FocusSession, Team, TaskDefenseSystem } from '../types';
import { taskDefenseService } from '../services/TaskDefenseService';

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  startFocusSession: (taskId: string) => void;
  endFocusSession: () => void;
  createTeam: (team: Omit<Team, 'id' | 'createdAt' | 'inviteCode'>) => void;
  joinTeam: (inviteCode: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  triggerDefense: (taskId: string, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
  signOut: () => void;
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
  | { type: 'UPDATE_DEFENSE_SYSTEM'; payload: Partial<TaskDefenseSystem> };

const initialState: AppState = {
  user: null,
  tasks: [],
  teams: [],
  currentTeam: null,
  focusSession: null,
  theme: 'light',
  isOnboarding: false, // Firebase auth handles this
  defenseSystem: {
    isActive: true,
    monitoringTasks: [],
    defenseLevel: 'active',
    interventionHistory: [],
    successRate: 0
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
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
            ? { ...task, ...action.payload.updates }
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
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Apply theme
  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Load tasks from localStorage when user changes (fallback for when Firebase is not available)
  useEffect(() => {
    if (state.user) {
      const savedTasks = localStorage.getItem(`taskdefender_tasks_${state.user.id}`);
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            expectedCompletionTime: task.expectedCompletionTime ? new Date(task.expectedCompletionTime) : undefined,
            scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : undefined
          }));
          dispatch({ type: 'SET_TASKS', payload: tasks });
        } catch (error) {
          console.error('Failed to load tasks from localStorage:', error);
        }
      }
    } else {
      dispatch({ type: 'SET_TASKS', payload: [] });
    }
  }, [state.user]);

  // Save tasks to localStorage
  useEffect(() => {
    if (state.user && state.tasks.length > 0) {
      localStorage.setItem(`taskdefender_tasks_${state.user.id}`, JSON.stringify(state.tasks));
    }
  }, [state.tasks, state.user]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    if (!state.user) return;

    const task: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId: state.user.id,
      isDefenseActive: true,
      defenseLevel: taskData.priority === 'urgent' ? 'critical' : 
                   taskData.priority === 'high' ? 'high' : 'medium',
      procrastinationCount: 0
    };

    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    
    // Update integrity score if task was completed
    if (updates.status === 'done' && state.user) {
      const completedTasks = state.tasks.filter(t => t.status === 'done').length + 1;
      const honestTasks = state.tasks.filter(t => t.status === 'done' && t.honestlyCompleted !== false).length + (updates.honestlyCompleted !== false ? 1 : 0);
      const integrityScore = Math.round((honestTasks / completedTasks) * 100);
      
      // Update streak if this is the first task completed today
      const today = new Date().toDateString();
      const completedToday = state.tasks.some(t => 
        t.status === 'done' && 
        t.completedAt && 
        new Date(t.completedAt).toDateString() === today
      );
      
      const streak = completedToday ? state.user.streak : state.user.streak + 1;
      
      const updatedUser = { 
        ...state.user, 
        integrityScore,
        streak
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
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
      id: Date.now().toString(),
      taskId,
      duration: 0,
      completed: false,
      distractions: 0,
      userId: state.user.id,
      createdAt: new Date(),
      defenseTriggered: false,
      interventionCount: 0
    };

    dispatch({ type: 'START_FOCUS_SESSION', payload: session });
  };

  const endFocusSession = () => {
    dispatch({ type: 'END_FOCUS_SESSION' });
  };

  const createTeam = (teamData: Omit<Team, 'id' | 'createdAt' | 'inviteCode'>) => {
    const team: Team = {
      ...teamData,
      id: Date.now().toString(),
      createdAt: new Date(),
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };
    dispatch({ type: 'CREATE_TEAM', payload: team });
  };

  const joinTeam = (inviteCode: string) => {
    // Mock team joining
    const mockTeam: Team = {
      id: Date.now().toString(),
      name: 'Sample Team',
      description: 'Joined via invite code',
      adminId: 'admin',
      members: [],
      inviteCode,
      createdAt: new Date(),
    };
    dispatch({ type: 'JOIN_TEAM', payload: mockTeam });
  };

  const updateProfile = (updates: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
  };

  const triggerDefense = (taskId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    taskDefenseService.triggerManualDefense(taskId, severity);
  };

  const signOut = async () => {
    try {
      // Import AuthService dynamically to avoid circular dependencies
      const { AuthService } = await import('../services/authService');
      await AuthService.signOut();
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_TEAMS', payload: [] });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AppContextType = {
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};