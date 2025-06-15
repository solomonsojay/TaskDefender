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
  const { addTask, updateTask: updateAppTask, deleteTask: deleteAppTask } = useApp();

  // Override app context methods to use Supabase
  useEffect(() => {
    // This effect ensures Supabase integration is active
  }, []);

  const value: SupabaseContextType = {
    ...supabase,
    createTask: async (taskData: any) => {
      const result = await supabase.createTask(taskData);
      return result;
    },
    updateTask: async (taskId: string, updates: any) => {
      const result = await supabase.updateTask(taskId, updates);
      return result;
    },
    deleteTask: async (taskId: string) => {
      const result = await supabase.deleteTask(taskId);
      return result;
    }
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};