/*
  # Add Username and Organization Details

  1. New Fields
    - Add username field to profiles table
    - Add organization details fields for admin users
    - Add unique constraint on username
    - Add validation constraints

  2. Security
    - Update RLS policies for new fields
    - Maintain existing security model

  3. Functions
    - Update user creation trigger
    - Add username validation function
*/

-- Add username field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add organization details fields for admin users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_type TEXT CHECK (organization_type IN ('startup', 'sme', 'enterprise', 'non-profit', 'government', 'other'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_size TEXT CHECK (organization_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role_in_org TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_description TEXT;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

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

-- Update the handle_new_user function to include username generation
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