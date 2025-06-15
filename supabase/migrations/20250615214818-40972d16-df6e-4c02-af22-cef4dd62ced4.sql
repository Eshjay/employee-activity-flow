
-- Update the user with email 'admin@allurecv.com' to have the role 'developer'
UPDATE public.profiles
SET role = 'developer'
WHERE email = 'admin@allurecv.com'
  AND role <> 'developer';

-- Optionally, you can log the updated profile to check the change
-- SELECT * FROM public.profiles WHERE email = 'admin@allurecv.com';

