import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, userData: { name: string; username?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  checkEmailExists: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single()
      
      if (error && error.code === 'PGRST116') {
        // No rows returned, email doesn't exist
        return false
      }
      
      if (error) {
        throw error
      }
      
      return !!data
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  },

  checkUsernameAvailability: async (username: string) => {
    try {
      const { data, error } = await supabase.rpc('check_username_availability', {
        username_input: username
      })
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Profiles
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Tasks
  getTasks: async (userId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        work_patterns(*),
        time_blocks(*),
        focus_sessions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createTask: async (task: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()
    return { data, error }
  },

  updateTask: async (taskId: string, updates: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    return { data, error }
  },

  deleteTask: async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    return { error }
  },

  // Teams
  getTeams: async (userId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        teams(
          *,
          team_members(
            *,
            profiles(name, email)
          )
        )
      `)
      .eq('user_id', userId)
    return { data, error }
  },

  createTeam: async (team: any) => {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single()
    return { data, error }
  },

  joinTeam: async (inviteCode: string, userId: string) => {
    // First find the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()

    if (teamError || !team) {
      return { data: null, error: teamError || new Error('Team not found') }
    }

    // Then add the user to the team
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'member'
      })
      .select()
      .single()

    return { data, error }
  },

  // Focus Sessions
  createFocusSession: async (session: any) => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert(session)
      .select()
      .single()
    return { data, error }
  },

  updateFocusSession: async (sessionId: string, updates: any) => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },

  // Work Patterns
  updateWorkPattern: async (taskId: string, pattern: any) => {
    const { data, error } = await supabase
      .from('work_patterns')
      .upsert({
        task_id: taskId,
        ...pattern
      })
      .select()
      .single()
    return { data, error }
  },

  // Daily Summaries
  getDailySummary: async (userId: string, date: string) => {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    return { data, error }
  },

  upsertDailySummary: async (summary: any) => {
    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert(summary)
      .select()
      .single()
    return { data, error }
  },

  // Utility functions
  calculateIntegrityScore: async (userId: string) => {
    const { data, error } = await supabase
      .rpc('calculate_integrity_score', { user_uuid: userId })
    return { data, error }
  },

  updateUserStreak: async (userId: string) => {
    const { data, error } = await supabase
      .rpc('update_user_streak', { user_uuid: userId })
    return { data, error }
  }
}