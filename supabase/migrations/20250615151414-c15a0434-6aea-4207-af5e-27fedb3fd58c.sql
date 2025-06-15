
-- Add session tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN session_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN session_expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to check if session is expired
CREATE OR REPLACE FUNCTION public.is_session_expired(user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND (session_expires_at IS NULL OR session_expires_at < now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update the existing update_last_login function to also set session expiration
CREATE OR REPLACE FUNCTION public.update_last_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    last_login = CURRENT_DATE,
    session_created_at = now(),
    session_expires_at = now() + interval '7 days'
  WHERE id = user_uuid;
END;
$$;

-- Create function to clear expired sessions
CREATE OR REPLACE FUNCTION public.clear_expired_session(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    session_created_at = NULL,
    session_expires_at = NULL
  WHERE id = user_uuid;
END;
$$;
