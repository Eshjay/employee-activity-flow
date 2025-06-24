
-- Create email_invitations table to track user invitations
CREATE TABLE public.email_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on email_invitations
ALTER TABLE public.email_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for email_invitations (only developers can manage invitations)
CREATE POLICY "Developers can view invitations"
  ON public.email_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  );

CREATE POLICY "Developers can create invitations"
  ON public.email_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  );

CREATE POLICY "Developers can update invitations"
  ON public.email_invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  );

-- Create email_change_requests table to track email change requests
CREATE TABLE public.email_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  old_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  verification_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  verified_at TIMESTAMPTZ NULL,
  applied_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on email_change_requests
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;

-- Policies for email_change_requests
CREATE POLICY "Users can view their own email change requests"
  ON public.email_change_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Developers can view all email change requests"
  ON public.email_change_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  );

-- Function to cleanup expired invitations and email change requests
CREATE OR REPLACE FUNCTION public.cleanup_expired_email_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired invitations
  DELETE FROM public.email_invitations 
  WHERE expires_at < now() AND used_at IS NULL;
  
  -- Clean up expired email change requests
  DELETE FROM public.email_change_requests 
  WHERE expires_at < now() AND verified_at IS NULL;
END;
$$;

-- Add email verification status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMPTZ NULL;

-- Function to handle successful user signup and send invitation email
CREATE OR REPLACE FUNCTION public.handle_user_signup_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the invitation as used if it exists
  UPDATE public.email_invitations 
  SET used_at = now(), updated_at = now()
  WHERE email = NEW.email AND used_at IS NULL;
  
  -- Mark email as verified if user signed up successfully
  UPDATE public.profiles 
  SET email_verified = true, updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for signup invitation handling
DROP TRIGGER IF EXISTS on_user_signup_invitation ON auth.users;
CREATE TRIGGER on_user_signup_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_signup_invitation();
