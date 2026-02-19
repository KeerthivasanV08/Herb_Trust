# LOGIN INFINITE LOADING FIX

## Immediate Steps

### 1. Open Browser Console
- Press **F12** → **Console** tab
- Clear previous logs
- Try to login again
- Look for these messages:
  - "Attempting login for: [email]"
  - "Auth successful, user ID: [id]"
  - "Fetching user profile..."
  - "Profile fetched: [data]"

### 2. Check Console Output

**If you see**: `Profile fetched: null`
- **Problem**: User has no profile in the database
- **Fix**: Run SQL query 1 below

**If you see**: `Profile role missing or invalid`
- **Problem**: Profile exists but role is NULL or invalid
- **Fix**: Run SQL query 2 below

**If you see**: `Error fetching user profile`
- **Problem**: RLS policy blocking profile read
- **Fix**: Run SQL query 3 below

## SQL Fixes

### Query 1: Check Users and Profiles
```sql
SELECT 
  au.id,
  au.email,
  p.name,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
```

Look for rows where `name` or `role` is NULL.

### Query 2: Fix Missing Profiles
For each user missing a profile, run:
```sql
INSERT INTO public.profiles (id, email, name, role)
VALUES 
  ('paste-user-id-here', 'user@email.com', 'User Name', 'farmer')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
```

### Query 3: Fix RLS Policies
```sql
-- Ensure select policy allows reading own profile
DROP POLICY IF EXISTS "select own profile" ON public.profiles;

CREATE POLICY "select own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);
```

### Query 4: Clean Slate (Delete Test Users)
```sql
-- WARNING: Deletes all test users!
DELETE FROM auth.users 
WHERE email IN ('abc@gmail.com', 'test@gmail.com');
-- Add any test emails you used
```

## Quick Test

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **Delete all test users**
3. **Go to Table Editor** → **profiles**
4. **Delete all rows**
5. **Go back to your app**
6. **Sign up with a new email** (not one you used before)
7. **Check Console** - should see "Login successful"
8. **Should redirect** to dashboard

## If Still Stuck

Share the **full console output** when you try to login, including all red errors.
