/*
  # TaskDefender Database Schema - Fixed Version
  
  This creates all tables in the correct order to avoid foreign key constraint errors.
  
  1. New Tables (in dependency order)
    - `profiles` - User profile information (no foreign keys initially)
    - `teams` - Team management 
    - `team_members` - Team membership relationships
    - `tasks` - Main task management table
    - `focus_sessions` - Pomodoro and focus tracking
    - `work_patterns` - User productivity analytics
    - `time_blocks` - Scheduled time blocks for tasks
    - `daily_summaries` - Daily productivity summaries
    - `sarcastic_prompts` - AI prompt history and effectiveness

  2. Security
    - Enable RLS on all tables
    - User-specific access policies
    - Team-based access for collaborative features
    - Admin-only access for team management

  3. Functions
    - Update user integrity score
    - Calculate productivity metrics
    - Generate team invite codes
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (extends Supabase auth.users) - NO foreign keys initially
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  goals TEXT[] DEFAULT '{}',
  work_style TEXT DEFAULT 'focused' CHECK (work_style IN ('focused', 'flexible', 'collaborative')),
  integrity_score INTEGER DEFAULT 100 CHECK (integrity_score >= 0 AND integrity_score <= 100),
  streak INTEGER DEFAULT 0,
  wallet_address TEXT,
  -- Organization details for admin users
  organization_name TEXT,
  organization_type TEXT CHECK (organization_type IN ('startup', 'sme', 'enterprise', 'non-profit', 'government', 'other')),
  organization_industry TEXT,
  organization_size TEXT CHECK (organization_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  user_role_in_org TEXT,
  organization_website TEXT,
  organization_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'blocked', 'done')),
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  estimated_time INTEGER, -- minutes
  actual_time INTEGER, -- minutes
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  honestly_completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Work patterns table
CREATE TABLE IF NOT EXISTS work_patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  total_time_spent INTEGER DEFAULT 0, -- minutes
  sessions_count INTEGER DEFAULT 0,
  average_session_length INTEGER DEFAULT 0, -- minutes
  productive_hours INTEGER[] DEFAULT '{}', -- hours of day (0-23)
  procrastination_score INTEGER DEFAULT 0 CHECK (procrastination_score >= 0 AND procrastination_score <= 100),
  consistency_score INTEGER DEFAULT 100 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  last_worked_on TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Time blocks table
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  is_scheduled BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- minutes
  completed BOOLEAN DEFAULT FALSE,
  distractions INTEGER DEFAULT 0,
  session_type TEXT DEFAULT 'work' CHECK (session_type IN ('work', 'short-break', 'long-break')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 8. Daily summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_planned INTEGER DEFAULT 0,
  focus_time INTEGER DEFAULT 0, -- minutes
  integrity_score INTEGER DEFAULT 100,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 9. Sarcastic prompts history table
CREATE TABLE IF NOT EXISTS sarcastic_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('nudge', 'roast', 'motivation', 'completion', 'deadline-warning', 'pattern-analysis')),
  severity TEXT NOT NULL CHECK (severity IN ('gentle', 'medium', 'savage')),
  persona TEXT NOT NULL DEFAULT 'default',
  message TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sarcastic_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Team members can read their teams" ON teams
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update their teams" ON teams
  FOR UPDATE TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Team members policies
CREATE POLICY "Team members can read team membership" ON team_members
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage members" ON team_members
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams" ON team_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Tasks policies
CREATE POLICY "Users can read own tasks" ON tasks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team members can read team tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Work patterns policies
CREATE POLICY "Users can read work patterns for their tasks" ON work_patterns
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage work patterns for their tasks" ON work_patterns
  FOR ALL TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  );

-- Time blocks policies
CREATE POLICY "Users can read time blocks for their tasks" ON time_blocks
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage time blocks for their tasks" ON time_blocks
  FOR ALL TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  );

-- Focus sessions policies
CREATE POLICY "Users can read own focus sessions" ON focus_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own focus sessions" ON focus_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Daily summaries policies
CREATE POLICY "Users can read own daily summaries" ON daily_summaries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own daily summaries" ON daily_summaries
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Sarcastic prompts policies
CREATE POLICY "Users can read own prompts" ON sarcastic_prompts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own prompts" ON sarcastic_prompts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Utility Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_work_patterns_updated_at
  BEFORE UPDATE ON work_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_time_blocks_updated_at
  BEFORE UPDATE ON time_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to generate unique username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email_input TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username part from email and clean it
  base_username := lower(regexp_replace(split_part(email_input, '@', 1), '[^a-z0-9]', '', 'g'));
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  -- Ensure maximum length
  IF length(base_username) > 15 THEN
    base_username := left(base_username, 15);
  END IF;
  
  final_username := base_username;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS(SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
    
    -- Prevent infinite loop
    IF counter > 9999 THEN
      final_username := base_username || extract(epoch from now())::INTEGER::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email
  generated_username := generate_username_from_email(NEW.email);
  
  INSERT INTO profiles (id, name, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    generated_username
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to calculate integrity score
CREATE OR REPLACE FUNCTION calculate_integrity_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  honest_tasks INTEGER;
  score INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tasks
  FROM tasks
  WHERE user_id = user_uuid AND status = 'done';
  
  IF total_tasks = 0 THEN
    RETURN 100;
  END IF;
  
  SELECT COUNT(*) INTO honest_tasks
  FROM tasks
  WHERE user_id = user_uuid AND status = 'done' AND honestly_completed = TRUE;
  
  score := ROUND((honest_tasks::FLOAT / total_tasks::FLOAT) * 100);
  
  -- Update the user's integrity score
  UPDATE profiles
  SET integrity_score = score
  WHERE id = user_uuid;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_activity BOOLEAN;
BEGIN
  -- Check each day backwards from today
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM tasks
      WHERE user_id = user_uuid
      AND DATE(completed_at) = check_date
      AND status = 'done'
    ) INTO has_activity;
    
    IF NOT has_activity THEN
      EXIT;
    END IF;
    
    current_streak := current_streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  -- Update the user's streak
  UPDATE profiles
  SET streak = current_streak
  WHERE id = user_uuid;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check username availability
CREATE OR REPLACE FUNCTION check_username_availability(username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if username meets requirements
  IF length(username_input) < 3 OR length(username_input) > 20 THEN
    RETURN FALSE;
  END IF;
  
  -- Check if username contains only alphanumeric characters and underscores
  IF username_input !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if username is available
  RETURN NOT EXISTS(SELECT 1 FROM profiles WHERE username = username_input);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;