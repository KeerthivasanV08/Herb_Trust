# Debug Steps for Supabase Signup Error

## Step 1: Check Supabase Logs

1. Go to Supabase Dashboard → **Logs** → **Postgres Logs**
2. Look for entries from the last few minutes
3. Find error messages related to `profiles` table or RLS
4. Share the exact error message

## Step 2: Verify Trigger Was Updated

Run this in SQL Editor to check current trigger:

```sql
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

**Expected result:** Should show `insert into public.profiles (id, email)` WITHOUT role

**If it still shows role:** Run the fix again

## Step 3: Temporary Fix - Disable Trigger

If logs show trigger errors, temporarily disable it:

```sql
-- Disable trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

Then try signup again. If it works, the issue is the trigger.

## Step 4: Check RLS Policies

```sql
-- List all policies on profiles table
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Make sure you have:
- `select own profile` - SELECT with `auth.uid() = id`
- `insert own profile` - INSERT with `auth.uid() = id`  
- `update own profile` - UPDATE with `auth.uid() = id`

## Step 5: Nuclear Option - Recreate Everything

```sql
-- Remove everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP POLICY IF EXISTS "select own profile" ON public.profiles;
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "delete own profile" ON public.profiles;

-- Recreate RLS policies
CREATE POLICY "select own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Recreate trigger (minimal version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 6: If Still Failing - No Trigger Approach

Completely remove trigger and let frontend handle everything:

```sql
-- Remove trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

Frontend will create profile via upsert (already implemented).
