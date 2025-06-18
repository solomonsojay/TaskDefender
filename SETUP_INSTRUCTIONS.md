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

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire content from `supabase/migrations/create_taskdefender_schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** to execute

This will create:
- ✅ All necessary tables (profiles, tasks, teams, etc.)
- ✅ Row Level Security policies
- ✅ Database functions for user management
- ✅ Triggers for automatic profile creation
- ✅ Indexes for optimal performance

## Step 4: Enable Email Authentication

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email templates if desired
4. **Disable email confirmation** for development (optional)

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Check the **Table Editor** to see if a profile was created automatically

## Database Schema Overview

### Core Tables:
- **profiles** - User information and settings
- **tasks** - Main task management
- **teams** - Team collaboration
- **focus_sessions** - Pomodoro tracking
- **work_patterns** - Productivity analytics

### Security Features:
- 🔒 Row Level Security on all tables
- 🔐 User-specific data access
- 👥 Team-based permissions
- 🛡️ Admin-only team management

## Troubleshooting

### Common Issues:
1. **"relation does not exist"** - Make sure you ran the SQL migration
2. **"permission denied"** - Check RLS policies are properly set
3. **"invalid credentials"** - Verify your .env file has correct values

### Verify Setup:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Your TaskDefender database is now ready! 🚀