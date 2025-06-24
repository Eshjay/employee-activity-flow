
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmailManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendUserInvitation = useCallback(async (
    email: string, 
    name: string, 
    role: 'employee' | 'ceo' | 'developer', 
    department: string,
    invitedBy: string
  ) => {
    setLoading(true);
    try {
      console.log('Sending user invitation:', { email, name, role, department });

      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: { email, name, role, department, invitedBy }
      });

      if (error) {
        console.error('Error sending invitation:', error);
        toast({
          title: 'Error',
          description: 'Failed to send invitation email',
          variant: 'destructive',
        });
        return false;
      }

      console.log('Invitation sent successfully:', data);
      toast({
        title: 'Success',
        description: `Invitation sent to ${email}`,
      });
      return true;
    } catch (error) {
      console.error('Error in sendUserInvitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verifyInvitation = useCallback(async (token: string, email: string) => {
    try {
      console.log('Verifying invitation:', { token, email });

      const { data, error } = await supabase.functions.invoke('verify-invitation', {
        body: { token, email }
      });

      if (error) {
        console.error('Error verifying invitation:', error);
        return { valid: false, error: 'Failed to verify invitation' };
      }

      console.log('Invitation verification result:', data);
      return data;
    } catch (error) {
      console.error('Error in verifyInvitation:', error);
      return { valid: false, error: 'Failed to verify invitation' };
    }
  }, []);

  const getInvitations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('email_invitations')
        .select(`
          *,
          invited_by_profile:profiles!email_invitations_invited_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvitations:', error);
      return [];
    }
  }, []);

  return {
    loading,
    sendUserInvitation,
    verifyInvitation,
    getInvitations
  };
};
