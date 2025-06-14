
-- Create function to update last login timestamp
CREATE OR REPLACE FUNCTION public.update_last_login(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login = CURRENT_DATE 
  WHERE id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_last_login(UUID) TO authenticated;
