import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Task, User, Team, Theme, FocusSession } from '../types';

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
  | { type: 'SET_CURRENT_TEAM'; payload: Team | null }
  | { type: 'COMPLETE_ONBOARDING' };

const initialState: AppState = {
  user: null,
  tasks: [],
  teams: [],
  currentTeam: null,
  focusSession: null,
  theme: 'light',
  isOnboarding: true,
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
    case 'SET_CURRENT_TEAM':
      return { ...state, currentTeam: action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, isOnboarding: false };
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

  // Persist theme changes
  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Local task management functions (fallback when Supabase is not available)
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    const task: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId: state.user?.id || '',
    };
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
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
    const session: FocusSession = {
      id: Date.now().toString(),
      taskId,
      duration: 0,
      completed: false,
      distractions: 0,
      userId: state.user?.id || '',
      createdAt: new Date(),
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
    // Mock team joining - in real app, this would be an API call
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};