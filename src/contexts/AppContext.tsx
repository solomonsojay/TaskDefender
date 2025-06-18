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
  signUp: (email: string, password: string, userData: { name: string; username?: string }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  updateProfile: (updates: any) => Promise<{ data: any; error: any }>;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('taskdefender_user');
    const savedTasks = localStorage.getItem('taskdefender_tasks');
    const savedTeams = localStorage.getItem('taskdefender_teams');
    const savedTheme = localStorage.getItem('theme') as Theme;

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'COMPLETE_ONBOARDING' });
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
          startDate: task.startDate ? new Date(task.startDate) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
        dispatch({ type: 'SET_TASKS', payload: tasks });
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }

    if (savedTeams) {
      try {
        const teams = JSON.parse(savedTeams).map((team: any) => ({
          ...team,
          createdAt: new Date(team.createdAt),
          members: team.members.map((member: any) => ({
            ...member,
            joinedAt: new Date(member.joinedAt)
          }))
        }));
        dispatch({ type: 'SET_TASKS', payload: teams });
      } catch (error) {
        console.error('Failed to load teams:', error);
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
    localStorage.setItem('taskdefender_teams', JSON.stringify(state.teams));
  }, [state.teams]);

  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Mock authentication functions
  const signUp = async (email: string, password: string, userData: { name: string; username?: string }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const existingUsers = JSON.parse(localStorage.getItem('taskdefender_users') || '[]');
      if (existingUsers.find((u: any) => u.email === email)) {
        return { data: null, error: new Error('Email already exists') };
      }

      // Check username availability
      if (userData.username) {
        const isAvailable = await checkUsernameAvailability(userData.username);
        if (!isAvailable) {
          return { data: null, error: new Error('Username is not available') };
        }
      }

      const user: User = {
        id: Date.now().toString(),
        name: userData.name,
        email,
        username: userData.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        role: 'user',
        goals: [],
        workStyle: 'focused',
        integrityScore: 100,
        streak: 0,
        createdAt: new Date()
      };

      // Save user to localStorage
      existingUsers.push(user);
      localStorage.setItem('taskdefender_users', JSON.stringify(existingUsers));
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'COMPLETE_ONBOARDING' });

      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUsers = JSON.parse(localStorage.getItem('taskdefender_users') || '[]');
      const user = existingUsers.find((u: any) => u.email === email);
      
      if (!user) {
        return { data: null, error: new Error('Invalid email or password') };
      }

      // Convert dates back to Date objects
      const userWithDates = {
        ...user,
        createdAt: new Date(user.createdAt)
      };

      dispatch({ type: 'SET_USER', payload: userWithDates });
      dispatch({ type: 'COMPLETE_ONBOARDING' });

      return { data: { user: userWithDates }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_TASKS', payload: [] });
      localStorage.removeItem('taskdefender_user');
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUsers = JSON.parse(localStorage.getItem('taskdefender_users') || '[]');
      const userExists = existingUsers.find((u: any) => u.email === email);
      
      if (!userExists) {
        return { data: null, error: new Error('Email not found') };
      }

      // In a real app, this would send an email
      return { data: { message: 'Password reset email sent' }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('taskdefender_users') || '[]');
      return existingUsers.some((u: any) => u.email === email);
    } catch (error) {
      return false;
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      if (!username || username.length < 3 || username.length > 20) {
        return false;
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return false;
      }
      
      const existingUsers = JSON.parse(localStorage.getItem('taskdefender_users') || '[]');
      return !existingUsers.some((u: any) => u.username === username.toLowerCase());
    } catch (error) {
      return false;
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!state.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const updatedUser = { ...state.user, ...updates };
      dispatch({ type: 'SET_USER', payload: updatedUser });

      // Update in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('taskdefender_users') || '[]');
      const userIndex = existingUsers.findIndex((u: any) => u.id === state.user.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = updatedUser;
        localStorage.setItem('taskdefender_users', JSON.stringify(existingUsers));
      }

      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Task management functions
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
    
    // Update integrity score if task was completed
    if (updates.status === 'done' && state.user) {
      const completedTasks = state.tasks.filter(t => t.status === 'done').length + 1;
      const honestTasks = state.tasks.filter(t => t.status === 'done' && t.honestlyCompleted !== false).length + (updates.honestlyCompleted !== false ? 1 : 0);
      const integrityScore = Math.round((honestTasks / completedTasks) * 100);
      
      const updatedUser = { ...state.user, integrityScore };
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
    signUp,
    signIn,
    signOut,
    resetPassword,
    checkEmailExists,
    checkUsernameAvailability,
    updateProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};