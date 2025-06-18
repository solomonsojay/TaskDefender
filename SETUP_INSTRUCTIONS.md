# TaskDefender Supabase Setup Instructions

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select your existing TaskDefender project
3. Go to **Settings** → **API**
4. Copy your:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 2: Configure Environment Variables

1. Open your `.env` file
2. Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 3: Create Database Tables

⚠️ **IMPORTANT**: Use the **FIXED** version to avoid foreign key errors!

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire content from `supabase/migrations/create_taskdefender_schema_fixed.sql`
4. Paste it into the SQL editor
5. Click **"Run"** to execute

This will create:
- ✅ All necessary tables (profiles, tasks, teams, etc.) in the correct order
- ✅ Row Level Security policies
- ✅ Database functions for user management
- ✅ Triggers for automatic profile creation
- ✅ Indexes for optimal performance
- ✅ Fixed foreign key relationships

## Step 4: Enable Email Authentication

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email templates if desired
4. **Disable email confirmation** for development (optional):
   - Go to **Authentication** → **Settings** → **Email Auth**
   - Turn OFF "Enable email confirmations"

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Check the **Table Editor** to see if a profile was created automatically
4. Verify you can create tasks and they appear in the database

## Database Schema Overview

### Core Tables (created in dependency order):
1. **profiles** - User information and settings
2. **teams** - Team collaboration
3. **team_members** - Team membership relationships
4. **tasks** - Main task management
5. **focus_sessions** - Pomodoro tracking
6. **work_patterns** - Productivity analytics
7. **time_blocks** - Scheduled time blocks
8. **daily_summaries** - Daily productivity summaries
9. **sarcastic_prompts** - AI prompt history

### Security Features:
- 🔒 Row Level Security on all tables
- 🔐 User-specific data access
- 👥 Team-based permissions
- 🛡️ Admin-only team management

### Automatic Features:
- 🤖 Auto-create user profiles on signup
- 📧 Generate usernames from email addresses
- 📊 Calculate integrity scores automatically
- 🔥 Track productivity streaks
- ⏰ Update timestamps automatically

## Troubleshooting

### Common Issues:

1. **"there is no unique constraint matching given keys"**
   - ✅ **FIXED**: Use the `create_taskdefender_schema_fixed.sql` file
   - This creates tables in the correct dependency order

2. **"relation does not exist"** 
   - Make sure you ran the SQL migration completely
   - Check that all tables were created in the Table Editor

3. **"permission denied"** 
   - Check RLS policies are properly set
   - Verify you're authenticated when testing

4. **"invalid credentials"** 
   - Verify your .env file has correct values
   - Make sure there are no extra spaces in the environment variables

### Verify Setup:
```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test user creation function
SELECT handle_new_user();
```

### Expected Tables:
After running the migration, you should see these tables:
- ✅ profiles
- ✅ teams  
- ✅ team_members
- ✅ tasks
- ✅ work_patterns
- ✅ time_blocks
- ✅ focus_sessions
- ✅ daily_summaries
- ✅ sarcastic_prompts

## Next Steps

Once your database is set up successfully:

1. **Test Authentication**: Try signing up and signing in
2. **Create Tasks**: Add some test tasks to verify functionality
3. **Check Team Features**: Test team creation if you're an admin user
4. **Explore Analytics**: Use the focus mode and check productivity tracking

Your TaskDefender database is now ready! 🚀

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Verify all environment variables are set correctly
3. Make sure you used the **fixed** SQL file
4. Test with a simple query in the SQL Editor first