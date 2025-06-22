import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Task, User, Theme, FocusSession, Team, TaskDefenseSystem } from '../types';
import { taskDefenseService } from '../services/TaskDefenseService';
import { FirestoreService } from '../services/firestoreService';
import { AuthService } from '../services/authService';

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

  // Subscribe to user's tasks when user changes
  useEffect(() => {
    if (state.user) {
      const unsubscribe = FirestoreService.subscribeToUserTasks(
        state.user.id,
        (tasks) => {
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }
      );

      return () => unsubscribe();
    } else {
      dispatch({ type: 'SET_TASKS', payload: [] });
    }
  }, [state.user]);

  // Load user's teams
  useEffect(() => {
    if (state.user) {
      FirestoreService.getUserTeams(state.user.id)
        .then(teams => {
          dispatch({ type: 'SET_TEAMS', payload: teams });
        })
        .catch(error => {
          console.error('Error loading teams:', error);
        });
    }
  }, [state.user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    if (!state.user) return;

    const task: Task = {
      ...taskData,
      id: '', // Will be set by Firestore
      createdAt: new Date(),
      userId: state.user.id,
      isDefenseActive: true,
      defenseLevel: taskData.priority === 'urgent' ? 'critical' : 
                   taskData.priority === 'high' ? 'high' : 'medium',
      procrastinationCount: 0
    };

    try {
      const taskId = await FirestoreService.addTask(task, state.user.id);
      const newTask = { ...task, id: taskId };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await FirestoreService.updateTask(id, updates);
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
        
        await AuthService.updateUser(state.user.id, { integrityScore, streak });
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await FirestoreService.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const startFocusSession = async (taskId: string) => {
    if (!state.user) return;

    const session: FocusSession = {
      id: '', // Will be set by Firestore
      taskId,
      duration: 0,
      completed: false,
      distractions: 0,
      userId: state.user.id,
      createdAt: new Date(),
      defenseTriggered: false,
      interventionCount: 0
    };

    try {
      const sessionId = await FirestoreService.addFocusSession(session);
      const newSession = { ...session, id: sessionId };
      dispatch({ type: 'START_FOCUS_SESSION', payload: newSession });
    } catch (error) {
      console.error('Error starting focus session:', error);
    }
  };

  const endFocusSession = () => {
    dispatch({ type: 'END_FOCUS_SESSION' });
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'inviteCode'>) => {
    if (!state.user) return;

    const team: Team = {
      ...teamData,
      id: '', // Will be set by Firestore
      createdAt: new Date(),
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    try {
      const teamId = await FirestoreService.createTeam(team);
      const newTeam = { ...team, id: teamId };
      dispatch({ type: 'CREATE_TEAM', payload: newTeam });
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const joinTeam = (inviteCode: string) => {
    // Mock team joining - would need proper implementation
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

  const updateProfile = async (updates: Partial<User>) => {
    if (state.user) {
      try {
        await AuthService.updateUser(state.user.id, updates);
        const updatedUser = { ...state.user, ...updates };
        dispatch({ type: 'SET_USER', payload: updatedUser });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const triggerDefense = (taskId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    taskDefenseService.triggerManualDefense(taskId, severity);
  };

  const signOut = async () => {
    try {
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