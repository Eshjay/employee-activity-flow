
-- First, drop the duplicate RLS policies on the messages table
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update received messages" ON public.messages;

-- Recreate clean, consistent policies
CREATE POLICY "messages_select_policy" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "messages_insert_policy" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_policy" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);
