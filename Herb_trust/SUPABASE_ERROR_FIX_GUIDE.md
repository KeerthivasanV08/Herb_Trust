# SUPABASE SIGNUP ERROR FIX GUIDE

## Problem
Signup returns 500 error: "Database error saving new user"

## Root Cause
The `handle_new_user()` trigger tries to insert a profile row with `role = 'farmer'` during `auth.users` insert, but:
1. At that moment, no user is authenticated yet (session created after)
2. RLS policy `insert own profile` requires `auth.uid() = id`
3. Trigger insert fails RLS check → 500 error

## Solution

### Step 1: Update Supabase Trigger (SQL Editor)

Run this SQL in Supabase SQL Editor:

```sql
-- FIX: Update trigger to insert minimal profile without role
-- This allows the frontend upsert to set the role chosen during signup

create or replace function public.handle_new_user()
returns trigger 
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql;

-- Recreate trigger (in case it wasn't already created)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

**What Changed:**
- Function is now `SECURITY DEFINER` → bypasses RLS
- Only inserts `id` and `email` (no `role`)
- Frontend upsert adds `name` and `role` after user is authenticated

### Step 2: Verify RLS Policies

Ensure these policies exist on `public.profiles`:

```sql
-- Allow users to select their own profile
create policy "select own profile"
on public.profiles for select
using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- Allow users to update their own profile (needed for upsert)
create policy "update own profile"
on public.profiles for update
using (auth.uid() = id);
```

### Step 3: Check Supabase Auth Settings

In Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL**: Set to your frontend URL (e.g., `http://localhost:5173`)
2. **Redirect URLs**: Add your frontend auth callback (e.g., `http://localhost:5173/auth`)
3. **Email Confirmations**: Disable for testing:
   - Go to Authentication → Providers → Email
   - Uncheck "Confirm email"

### Step 4: Test Signup Flow

1. Clear browser localStorage and cookies
2. Try signing up with a new email
3. Check Supabase Dashboard:
   - **Authentication → Users**: New user should appear
   - **Table Editor → profiles**: Profile should have `email`, `name`, and `role`

### Step 5: Debug Checklist

If signup still fails:

1. **Check Supabase Logs** (Dashboard → Logs → Postgres Logs)
   - Look for errors during trigger execution
   - Common: "permission denied" or "violates check constraint"

2. **Verify Role Values**:
   ```sql
   select * from public.profiles where role is null;
   ```
   - Should be empty after successful signup

3. **Test RLS Policies**:
   ```sql
   -- Run as authenticated user (use JWT from browser)
   select * from public.profiles where id = auth.uid();
   ```

4. **Console Errors**: Open browser DevTools → Console
   - Look for "Profile upsert failed" or "Database error"

## Expected Behavior After Fix

1. User signs up with email/password/name/role
2. `auth.users` insert triggers `handle_new_user()`
3. Trigger creates minimal profile (id, email)
4. Frontend receives session + access token
5. Frontend upserts profile with name + role
6. User is logged in and redirected to role-specific dashboard

## Environment Variables Required

Create `.env.local` in `frontend/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**Never commit these to git!** Add to `.gitignore`:
```
.env.local
.env
```

## Security Notes

- ✅ Trigger uses `security definer` to bypass RLS (safe for auto-creation)
- ✅ RLS policies prevent users from reading/updating other profiles
- ✅ Frontend validates email format before API call
- ✅ Access tokens stored in localStorage, cleared on logout
- ⚠️ Do NOT expose service role key in frontend code

## Rollback Plan

If you need to revert:

```sql
-- Restore old trigger (inserted default role)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'farmer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
```

But this will only work for 'farmer' signups!

## Additional Resources

- Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- Auth Triggers: https://supabase.com/docs/guides/auth/managing-user-data#using-triggers
