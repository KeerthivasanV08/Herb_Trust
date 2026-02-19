-- QUICKEST FIX: Remove trigger, let frontend create profiles

-- 1. Drop trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Ensure RLS policies exist
DROP POLICY IF EXISTS "select own profile" ON public.profiles;
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;

CREATE POLICY "select own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. Test signup - frontend will create profile via upsert
