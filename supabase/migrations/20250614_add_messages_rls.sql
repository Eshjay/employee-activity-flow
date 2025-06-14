
-- Enable Row Level Security on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages they sent or received
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Policy: Users can send messages (create new messages where they are the sender)
CREATE POLICY "Users can send messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- No delete policy needed for messages (keep message history)
