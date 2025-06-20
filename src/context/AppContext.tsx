import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Task, User, Theme, FocusSession } from '../types';

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  startFocusSession: (taskId: string) => void;
  endFocusSession: () => void;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'START_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'END_FOCUS_SESSION' };

const initialState: AppState = {
  user: {
    id: 'default-user',
    name: 'Productivity Warrior',
    email: 'warrior@taskdefender.com',
    username: 'warrior',
    role: 'user',
    integrityScore: 100,
    streak: 0,
    createdAt: new Date(),
  },
  tasks: [],
  focusSession: null,
  theme: 'light',
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskdefender_tasks');
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedUser = localStorage.getItem('taskdefender_user');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    }

    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
        dispatch({ type: 'SET_TASKS', payload: tasks });
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }

    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Persist data to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('taskdefender_user', JSON.stringify(state.user));
    }
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem('taskdefender_tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);

  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    const task: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId: state.user?.id || 'default-user',
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
      userId: state.user?.id || 'default-user',
      createdAt: new Date(),
    };
    dispatch({ type: 'START_FOCUS_SESSION', payload: session });
  };

  const endFocusSession = () => {
    dispatch({ type: 'END_FOCUS_SESSION' });
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};