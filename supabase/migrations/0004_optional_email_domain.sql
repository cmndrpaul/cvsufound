-- OPTIONAL: only let CvSU emails sign up.
-- Run this ONLY if you want to restrict signups. The website already checks the
-- email on the form, but a form check can be bypassed. This database rule is the
-- real lock.
--
-- 1. Change 'cvsu.edu.ph' below if your school uses a different email domain.
-- 2. Make sure you can still create your admin account BEFORE running this
--    (or use an email with the allowed domain).
-- 3. Remember to set NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN in .env.local to match.

create or replace function public.enforce_email_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(new.email) not like '%@cvsu.edu.ph' then
    raise exception 'Only @cvsu.edu.ph email addresses can sign up.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_email_domain_trigger on auth.users;
create trigger enforce_email_domain_trigger
  before insert on auth.users
  for each row execute function public.enforce_email_domain();

-- To remove the restriction later:
-- drop trigger if exists enforce_email_domain_trigger on auth.users;
