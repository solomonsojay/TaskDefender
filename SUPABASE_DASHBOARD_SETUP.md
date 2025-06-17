# TaskDefender Database Setup via Supabase Dashboard

## Step 1: Access Your Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Click on your **TaskDefender** project

## Step 2: Navigate to Table Editor
1. In the left sidebar, click on **"Table Editor"**
2. You'll see the table creation interface

## Step 3: Create Tables in This Order

### Table 1: profiles (User Profiles)
1. Click **"Create a new table"**
2. **Table name**: `profiles`
3. **Description**: "User profile information"
4. **Enable Row Level Security (RLS)**: ✅ Check this box

**Add these columns:**

| Column Name | Type | Default Value | Primary | Nullable | Unique |
|-------------|------|---------------|---------|----------|--------|
| id | uuid | | ✅ | ❌ | ✅ |
| name | text | | ❌ | ❌ | ❌ |
| email | text | | ❌ | ❌ | ✅ |
| username | text | | ❌ | ✅ | ✅ |
| role | text | 'user' | ❌ | ❌ | ❌ |
| goals | text[] | '{}' | ❌ | ❌ | ❌ |
| work_style | text | 'focused' | ❌ | ❌ | ❌ |
| integrity_score | int4 | 100 | ❌ | ❌ | ❌ |
| streak | int4 | 0 | ❌ | ❌ | ❌ |
| wallet_address | text | | ❌ | ✅ | ❌ |
| organization_name | text | | ❌ | ✅ | ❌ |
| organization_type | text | | ❌ | ✅ | ❌ |
| organization_industry | text | | ❌ | ✅ | ❌ |
| organization_size | text | | ❌ | ✅ | ❌ |
| user_role_in_org | text | | ❌ | ✅ | ❌ |
| organization_website | text | | ❌ | ✅ | ❌ |
| organization_description | text | | ❌ | ✅ | ❌ |
| created_at | timestamptz | now() | ❌ | ❌ | ❌ |
| updated_at | timestamptz | now() | ❌ | ❌ | ❌ |

4. Click **"Save"**

### Table 2: teams
1. Click **"Create a new table"**
2. **Table name**: `teams`
3. **Enable RLS**: ✅

**Add these columns:**

| Column Name | Type | Default Value | Primary | Nullable | Unique |
|-------------|------|---------------|---------|----------|--------|
| id | uuid | gen_random_uuid() | ✅ | ❌ | ✅ |
| name | text | | ❌ | ❌ | ❌ |
| description | text | | ❌ | ✅ | ❌ |
| admin_id | uuid | | ❌ | ❌ | ❌ |
| invite_code | text | | ❌ | ❌ | ✅ |
| created_at | timestamptz | now() | ❌ | ❌ | ❌ |
| updated_at | timestamptz | now() | ❌ | ❌ | ❌ |

4. Click **"Save"**

### Table 3: team_members
1. Click **"Create a new table"**
2. **Table name**: `team_members`
3. **Enable RLS**: ✅

**Add these columns:**

| Column Name | Type | Default Value | Primary | Nullable | Unique |
|-------------|------|---------------|---------|----------|--------|
| id | uuid | gen_random_uuid() | ✅ | ❌ | ✅ |
| team_id | uuid | | ❌ | ❌ | ❌ |
| user_id | uuid | | ❌ | ❌ | ❌ |
| role | text | 'member' | ❌ | ❌ | ❌ |
| joined_at | timestamptz | now() | ❌ | ❌ | ❌ |

4. Click **"Save"**

### Table 4: tasks
1. Click **"Create a new table"**
2. **Table name**: `tasks`
3. **Enable RLS**: ✅

**Add these columns:**

| Column Name | Type | Default Value | Primary | Nullable | Unique |
|-------------|------|---------------|---------|----------|--------|
| id | uuid | gen_random_uuid() | ✅ | ❌ | ✅ |
| title | text | | ❌ | ❌ | ❌ |
| description | text | | ❌ | ✅ | ❌ |
| priority | text | 'medium' | ❌ | ❌ | ❌ |
| status | text | 'todo' | ❌ | ❌ | ❌ |
| due_date | timestamptz | | ❌ | ✅ | ❌ |
| start_date | timestamptz | | ❌ | ✅ | ❌ |
| estimated_time | int4 | | ❌ | ✅ | ❌ |
| actual_time | int4 | | ❌ | ✅ | ❌ |
| tags | text[] | '{}' | ❌ | ❌ | ❌ |
| user_id | uuid | | ❌ | ❌ | ❌ |
| team_id | uuid | | ❌ | ✅ | ❌ |
| honestly_completed | bool | true | ❌ | ❌ | ❌ |
| created_at | timestamptz | now() | ❌ | ❌ | ❌ |
| completed_at | timestamptz | | ❌ | ✅ | ❌ |
| updated_at | timestamptz | now() | ❌ | ❌ | ❌ |

4. Click **"Save"**

### Table 5: focus_sessions
1. Click **"Create a new table"**
2. **Table name**: `focus_sessions`
3. **Enable RLS**: ✅

**Add these columns:**

| Column Name | Type | Default Value | Primary | Nullable | Unique |
|-------------|------|---------------|---------|----------|--------|
| id | uuid | gen_random_uuid() | ✅ | ❌ | ✅ |
| task_id | uuid | | ❌ | ❌ | ❌ |
| user_id | uuid | | ❌ | ❌ | ❌ |
| duration | int4 | 0 | ❌ | ❌ | ❌ |
| completed | bool | false | ❌ | ❌ | ❌ |
| distractions | int4 | 0 | ❌ | ❌ | ❌ |
| session_type | text | 'work' | ❌ | ❌ | ❌ |
| created_at | timestamptz | now() | ❌ | ❌ | ❌ |
| ended_at | timestamptz | | ❌ | ✅ | ❌ |

4. Click **"Save"**

## Step 4: Set Up Foreign Key Relationships

After creating all tables, we need to set up relationships:

### For profiles table:
1. Click on **profiles** table
2. Click **"Add foreign key"**
3. **Local column**: `id`
4. **Reference schema**: `auth`
5. **Reference table**: `users`
6. **Reference column**: `id`
7. **On delete**: `CASCADE`

### For teams table:
1. Click on **teams** table
2. Click **"Add foreign key"**
3. **Local column**: `admin_id`
4. **Reference schema**: `public`
5. **Reference table**: `profiles`
6. **Reference column**: `id`
7. **On delete**: `CASCADE`

### For team_members table:
1. Add foreign key for `team_id`:
   - **Local column**: `team_id`
   - **Reference table**: `teams`
   - **Reference column**: `id`
   - **On delete**: `CASCADE`

2. Add foreign key for `user_id`:
   - **Local column**: `user_id`
   - **Reference table**: `profiles`
   - **Reference column**: `id`
   - **On delete**: `CASCADE`

### For tasks table:
1. Add foreign key for `user_id`:
   - **Local column**: `user_id`
   - **Reference table**: `profiles`
   - **Reference column**: `id`
   - **On delete**: `CASCADE`

2. Add foreign key for `team_id`:
   - **Local column**: `team_id`
   - **Reference table**: `teams`
   - **Reference column**: `id`
   - **On delete**: `SET NULL`

### For focus_sessions table:
1. Add foreign key for `task_id`:
   - **Local column**: `task_id`
   - **Reference table**: `tasks`
   - **Reference column**: `id`
   - **On delete**: `CASCADE`

2. Add foreign key for `user_id`:
   - **Local column**: `user_id`
   - **Reference table**: `profiles`
   - **Reference column**: `id`
   - **On delete**: `CASCADE`

## Step 5: Set Up Row Level Security (RLS) Policies

1. Go to **Authentication** → **Policies** in the left sidebar
2. For each table, click **"New Policy"**

### Profiles Policies:
**Policy 1**: "Users can read own profile"
- **Policy name**: `Users can read own profile`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: `auth.uid() = id`

**Policy 2**: "Users can update own profile"
- **Policy name**: `Users can update own profile`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `auth.uid() = id`

**Policy 3**: "Users can insert own profile"
- **Policy name**: `Users can insert own profile`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `auth.uid() = id`

### Tasks Policies:
**Policy 1**: "Users can read own tasks"
- **Policy name**: `Users can read own tasks`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: `user_id = auth.uid()`

**Policy 2**: "Users can manage own tasks"
- **Policy name**: `Users can manage own tasks`
- **Allowed operation**: `ALL`
- **Target roles**: `authenticated`
- **USING expression**: `user_id = auth.uid()`
- **WITH CHECK expression**: `user_id = auth.uid()`

### Focus Sessions Policies:
**Policy 1**: "Users can read own focus sessions"
- **Policy name**: `Users can read own focus sessions`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: `user_id = auth.uid()`

**Policy 2**: "Users can manage own focus sessions"
- **Policy name**: `Users can manage own focus sessions`
- **Allowed operation**: `ALL`
- **Target roles**: `authenticated`
- **USING expression**: `user_id = auth.uid()`
- **WITH CHECK expression**: `user_id = auth.uid()`

## Step 6: Create Database Functions

1. Go to **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'))
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
  
  UPDATE profiles
  SET integrity_score = score
  WHERE id = user_uuid;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. Click **"Run"** to execute the SQL

## Step 7: Test Your Setup

1. Go to **Authentication** → **Users**
2. Create a test user or use your existing account
3. Go back to **Table Editor**
4. Check that a profile was automatically created in the `profiles` table

## Next Steps

Once your database is set up:

1. Update your `.env` file with your Supabase credentials
2. Test the connection in your app
3. Start using the TaskDefender features!

Your database is now ready for the TaskDefender application! 🎉