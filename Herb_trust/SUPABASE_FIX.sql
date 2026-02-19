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
