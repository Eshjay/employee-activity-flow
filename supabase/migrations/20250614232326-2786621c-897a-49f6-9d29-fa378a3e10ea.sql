
-- Check if policies exist first and create only the missing ones for reports table
DO $$
BEGIN
    -- Add policy for viewing reports if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'reports' 
        AND policyname = 'All authenticated users can view reports'
    ) THEN
        EXECUTE 'CREATE POLICY "All authenticated users can view reports" 
                 ON public.reports 
                 FOR SELECT 
                 TO authenticated
                 USING (true)';
    END IF;

    -- Add policy for creating reports if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'reports' 
        AND policyname = 'All authenticated users can create reports'
    ) THEN
        EXECUTE 'CREATE POLICY "All authenticated users can create reports" 
                 ON public.reports 
                 FOR INSERT 
                 TO authenticated
                 WITH CHECK (auth.uid() = created_by)';
    END IF;

    -- Add policy for deleting reports if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'reports' 
        AND policyname = 'Only developers can delete reports'
    ) THEN
        EXECUTE 'CREATE POLICY "Only developers can delete reports" 
                 ON public.reports 
                 FOR DELETE 
                 TO authenticated
                 USING (
                   EXISTS (
                     SELECT 1 FROM public.profiles 
                     WHERE id = auth.uid() AND role = ''developer''
                   )
                 )';
    END IF;
END $$;

-- Check if policies exist first and create only the missing ones for messages table
DO $$
BEGIN
    -- Add policy for viewing messages if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'messages' 
        AND policyname = 'Users can view their own messages'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view their own messages" 
                 ON public.messages 
                 FOR SELECT 
                 USING (
                   auth.uid() = sender_id OR auth.uid() = recipient_id
                 )';
    END IF;

    -- Add policy for sending messages if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'messages' 
        AND policyname = 'Users can send messages'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can send messages" 
                 ON public.messages 
                 FOR INSERT 
                 WITH CHECK (auth.uid() = sender_id)';
    END IF;

    -- Add policy for updating messages if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'messages' 
        AND policyname = 'Users can update received messages'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update received messages" 
                 ON public.messages 
                 FOR UPDATE 
                 USING (auth.uid() = recipient_id)';
    END IF;
END $$;
