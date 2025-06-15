
-- First, let's check existing policies and only create the missing ones

-- For profiles table, only create policies that don't exist
DO $$
BEGIN
    -- Check if "Users can insert their own profile" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
    END IF;

    -- Check if "Users can update their own profile" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
    END IF;

    -- Check if "Developers can manage all profiles" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Developers can manage all profiles'
    ) THEN
        EXECUTE 'CREATE POLICY "Developers can manage all profiles" ON public.profiles FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = ''developer''
          )
        )';
    END IF;
END $$;

-- Enable RLS on activities table (this will not fail if already enabled)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- For activities table, only create policies that don't exist
DO $$
BEGIN
    -- Check if "Users can view all activities" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can view all activities'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view all activities" ON public.activities FOR SELECT USING (true)';
    END IF;

    -- Check if "Users can insert their own activities" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can insert their own activities'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;

    -- Check if "Users can update their own activities" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can update their own activities'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update their own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id)';
    END IF;

    -- Check if "Users can delete their own activities" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can delete their own activities'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can delete their own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id)';
    END IF;
END $$;
