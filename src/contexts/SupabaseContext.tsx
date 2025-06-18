import React, { createContext, useContext, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useApp } from './AppContext';

interface SupabaseContextType {
  user: any;
  loading: boolean;
  signUp: (email: string, password: string, userData: { name: string }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  createTask: (taskData: any) => Promise<any>;
  updateTask: (taskId: string, updates: any) => Promise<any>;
  deleteTask: (taskId: string) => Promise<any>;
  createFocusSession: (taskId: string) => Promise<any>;
  updateFocusSession: (sessionId: string, updates: any) => Promise<any>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useSupabase();
  const { setUser, dispatch } = useApp();

  // Sync Supabase auth state with app state
  useEffect(() => {
    const syncUserData = async () => {
      if (supabase.user) {
        // Load user profile and sync with app state
        const { data: userProfile } = await supabase.loadUserProfile(supabase.user.id);
        if (userProfile) {
          setUser(userProfile);
          dispatch({ type: 'COMPLETE_ONBOARDING' });
        }

        // Load user tasks and sync with app state
        const { data: tasks } = await supabase.loadUserTasks(supabase.user.id);
        if (tasks) {
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }
      } else {
        // User signed out, clear app state
        setUser(null);
        dispatch({ type: 'SET_TASKS', payload: [] });
      }
    };

    syncUserData();
  }, [supabase.user, setUser, dispatch, supabase]);

  const value: SupabaseContextType = {
    ...supabase,
    createTask: async (taskData: any) => {
      const result = await supabase.createTask(taskData);
      
      // Reload tasks after creation
      if (!result.error && supabase.user) {
        const { data: tasks } = await supabase.loadUserTasks(supabase.user.id);
        if (tasks) {
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }
      }
      
      return result;
    },
    updateTask: async (taskId: string, updates: any) => {
      const result = await supabase.updateTask(taskId, updates);
      
      // Reload tasks and profile after update
      if (!result.error && supabase.user) {
        const { data: tasks } = await supabase.loadUserTasks(supabase.user.id);
        if (tasks) {
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }
        
        // If task was completed, reload profile for updated scores
        if (updates.status === 'done') {
          const { data: userProfile } = await supabase.loadUserProfile(supabase.user.id);
          if (userProfile) {
            setUser(userProfile);
          }
        }
      }
      
      return result;
    },
    deleteTask: async (taskId: string) => {
      const result = await supabase.deleteTask(taskId);
      
      // Reload tasks after deletion
      if (!result.error && supabase.user) {
        const { data: tasks } = await supabase.loadUserTasks(supabase.user.id);
        if (tasks) {
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }
      }
      
      return result;
    }
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};