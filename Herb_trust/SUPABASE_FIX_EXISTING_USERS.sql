-- FIX EXISTING USERS - Run this if login keeps loading

-- 1. Check which auth users don't have profiles
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  p.id as profile_id,
  p.email as profile_email,
  p.name,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 2. If you see users without profiles, create them manually:
-- Replace the values below with the actual user ID and data

-- Example: Create profile for orphaned auth user
-- INSERT INTO public.profiles (id, email, name, role)
-- VALUES 
--   ('user-uuid-here', 'user@email.com', 'User Name', 'farmer')
-- ON CONFLICT (id) DO NOTHING;

-- 3. Update profiles that are missing role:
-- UPDATE public.profiles
-- SET role = 'farmer'  -- or 'manufacturer' or 'auditor'
-- WHERE role IS NULL;

-- 4. Update profiles that are missing name:
-- UPDATE public.profiles
-- SET name = COALESCE(email, 'User')
-- WHERE name IS NULL;

-- 5. Clean slate option - Delete all test users and start fresh:
-- WARNING: This deletes ALL users!
-- DELETE FROM auth.users WHERE email LIKE '%@gmail.com';
-- (Profiles will cascade delete if you have ON DELETE CASCADE)
