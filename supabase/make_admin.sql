-- Make yourself (or the claim desk staff) an admin.
-- 1. Sign up on the website first with the email you want to be admin.
-- 2. Replace the email below, then run this in Supabase -> SQL Editor.

update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
