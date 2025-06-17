export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          username: string | null
          role: 'user' | 'admin'
          goals: string[]
          work_style: 'focused' | 'flexible' | 'collaborative'
          integrity_score: number
          streak: number
          wallet_address: string | null
          team_id: string | null
          organization_name: string | null
          organization_type: 'startup' | 'sme' | 'enterprise' | 'non-profit' | 'government' | 'other' | null
          organization_industry: string | null
          organization_size: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | null
          user_role_in_org: string | null
          organization_website: string | null
          organization_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          username?: string | null
          role?: 'user' | 'admin'
          goals?: string[]
          work_style?: 'focused' | 'flexible' | 'collaborative'
          integrity_score?: number
          streak?: number
          wallet_address?: string | null
          team_id?: string | null
          organization_name?: string | null
          organization_type?: 'startup' | 'sme' | 'enterprise' | 'non-profit' | 'government' | 'other' | null
          organization_industry?: string | null
          organization_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | null
          user_role_in_org?: string | null
          organization_website?: string | null
          organization_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          username?: string | null
          role?: 'user' | 'admin'
          goals?: string[]
          work_style?: 'focused' | 'flexible' | 'collaborative'
          integrity_score?: number
          streak?: number
          wallet_address?: string | null
          team_id?: string | null
          organization_name?: string | null
          organization_type?: 'startup' | 'sme' | 'enterprise' | 'non-profit' | 'government' | 'other' | null
          organization_industry?: string | null
          organization_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | null
          user_role_in_org?: string | null
          organization_website?: string | null
          organization_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          admin_id: string
          invite_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          admin_id: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          admin_id?: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'member' | 'admin'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'member' | 'admin'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'member' | 'admin'
          joined_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'todo' | 'in-progress' | 'blocked' | 'done'
          due_date: string | null
          start_date: string | null
          estimated_time: number | null
          actual_time: number | null
          tags: string[]
          user_id: string
          team_id: string | null
          honestly_completed: boolean
          created_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in-progress' | 'blocked' | 'done'
          due_date?: string | null
          start_date?: string | null
          estimated_time?: number | null
          actual_time?: number | null
          tags?: string[]
          user_id: string
          team_id?: string | null
          honestly_completed?: boolean
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'todo' | 'in-progress' | 'blocked' | 'done'
          due_date?: string | null
          start_date?: string | null
          estimated_time?: number | null
          actual_time?: number | null
          tags?: string[]
          user_id?: string
          team_id?: string | null
          honestly_completed?: boolean
          created_at?: string
          completed_at?: string | null
          updated_at?: string
        }
      }
      work_patterns: {
        Row: {
          id: string
          task_id: string
          total_time_spent: number
          sessions_count: number
          average_session_length: number
          productive_hours: number[]
          procrastination_score: number
          consistency_score: number
          last_worked_on: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          total_time_spent?: number
          sessions_count?: number
          average_session_length?: number
          productive_hours?: number[]
          procrastination_score?: number
          consistency_score?: number
          last_worked_on?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          total_time_spent?: number
          sessions_count?: number
          average_session_length?: number
          productive_hours?: number[]
          procrastination_score?: number
          consistency_score?: number
          last_worked_on?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_blocks: {
        Row: {
          id: string
          task_id: string
          start_time: string
          end_time: string
          duration: number
          is_scheduled: boolean
          is_completed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          start_time: string
          end_time: string
          duration: number
          is_scheduled?: boolean
          is_completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          start_time?: string
          end_time?: string
          duration?: number
          is_scheduled?: boolean
          is_completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          task_id: string
          user_id: string
          time_block_id: string | null
          duration: number
          completed: boolean
          distractions: number
          session_type: 'work' | 'short-break' | 'long-break'
          created_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          time_block_id?: string | null
          duration?: number
          completed?: boolean
          distractions?: number
          session_type?: 'work' | 'short-break' | 'long-break'
          created_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          time_block_id?: string | null
          duration?: number
          completed?: boolean
          distractions?: number
          session_type?: 'work' | 'short-break' | 'long-break'
          created_at?: string
          ended_at?: string | null
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          date: string
          tasks_completed: number
          tasks_planned: number
          focus_time: number
          integrity_score: number
          mood: number | null
          reflection: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          tasks_completed?: number
          tasks_planned?: number
          focus_time?: number
          integrity_score?: number
          mood?: number | null
          reflection?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          tasks_completed?: number
          tasks_planned?: number
          focus_time?: number
          integrity_score?: number
          mood?: number | null
          reflection?: string | null
          created_at?: string
        }
      }
      sarcastic_prompts: {
        Row: {
          id: string
          user_id: string
          prompt_type: 'nudge' | 'roast' | 'motivation' | 'completion' | 'deadline-warning' | 'pattern-analysis'
          severity: 'gentle' | 'medium' | 'savage'
          persona: string
          message: string
          task_id: string | null
          effectiveness_rating: number | null
          dismissed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_type: 'nudge' | 'roast' | 'motivation' | 'completion' | 'deadline-warning' | 'pattern-analysis'
          severity: 'gentle' | 'medium' | 'savage'
          persona?: string
          message: string
          task_id?: string | null
          effectiveness_rating?: number | null
          dismissed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_type?: 'nudge' | 'roast' | 'motivation' | 'completion' | 'deadline-warning' | 'pattern-analysis'
          severity?: 'gentle' | 'medium' | 'savage'
          persona?: string
          message?: string
          task_id?: string | null
          effectiveness_rating?: number | null
          dismissed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_integrity_score: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      update_user_streak: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      check_username_availability: {
        Args: {
          username_input: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}