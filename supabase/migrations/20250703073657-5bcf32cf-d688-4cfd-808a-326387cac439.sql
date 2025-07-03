
-- Drop the custom password_reset_tokens table since we'll use Supabase's native auth
DROP TABLE IF EXISTS public.password_reset_tokens;

-- Clean up any existing password reset tokens from edge functions
-- (This is handled by Supabase Auth natively)
