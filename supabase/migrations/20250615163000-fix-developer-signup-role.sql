
-- Fix the handle_new_user function to properly extract and use role from metadata
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Extract role from metadata, with proper fallback
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  
  -- Validate role is one of the allowed values
  IF user_role NOT IN ('employee', 'ceo', 'developer') THEN
    user_role := 'employee';
  END IF;
  
  -- Log the signup attempt for debugging
  RAISE LOG 'Creating profile for user % with role % from metadata: %', 
    NEW.id, user_role, NEW.raw_user_meta_data;

  INSERT INTO public.profiles (id, name, email, role, department, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'department', 'General'),
    'active'
  );
  
  RAISE LOG 'Successfully created profile for user % with role %', NEW.id, user_role;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
