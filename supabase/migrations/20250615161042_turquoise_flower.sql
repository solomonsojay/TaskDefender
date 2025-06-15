/*
  # TaskDefender Initial Database Schema

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
    - `tasks` - Main task management table
    - `teams` - Team management for collaboration
    - `team_members` - Team membership relationships
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

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  goals TEXT[] DEFAULT '{}',
  work_style TEXT DEFAULT 'focused' CHECK (work_style IN ('focused', 'flexible', 'collaborative')),
  integrity_score INTEGER DEFAULT 100 CHECK (integrity_score >= 0 AND integrity_score <= 100),
  streak INTEGER DEFAULT 0,
  wallet_address TEXT,
  team_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Tasks table
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

-- Work patterns table
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

-- Time blocks table
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

-- Focus sessions table
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

-- Daily summaries table
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

-- Sarcastic prompts history table
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

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Team members can read their teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can update their teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid());

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Team members policies
CREATE POLICY "Team members can read team membership"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Tasks policies
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team members can read team tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Work patterns policies
CREATE POLICY "Users can read work patterns for their tasks"
  ON work_patterns
  FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage work patterns for their tasks"
  ON work_patterns
  FOR ALL
  TO authenticated
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
CREATE POLICY "Users can read time blocks for their tasks"
  ON time_blocks
  FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage time blocks for their tasks"
  ON time_blocks
  FOR ALL
  TO authenticated
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
CREATE POLICY "Users can read own focus sessions"
  ON focus_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own focus sessions"
  ON focus_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Daily summaries policies
CREATE POLICY "Users can read own daily summaries"
  ON daily_summaries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own daily summaries"
  ON daily_summaries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Sarcastic prompts policies
CREATE POLICY "Users can read own prompts"
  ON sarcastic_prompts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own prompts"
  ON sarcastic_prompts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Functions
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

-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
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