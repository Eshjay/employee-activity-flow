
import { supabase } from "@/integrations/supabase/client";

export const checkSessionExpiration = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_session_expired', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('Error checking session expiration:', error);
      return true; // Default to expired on error for security
    }
    
    return data || false;
  } catch (error) {
    console.error('Error calling is_session_expired function:', error);
    return true; // Default to expired on error for security
  }
};

export const clearExpiredSession = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('clear_expired_session', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('Error clearing expired session:', error);
    }
  } catch (error) {
    console.error('Error calling clear_expired_session function:', error);
  }
};

export const validateAndRefreshSession = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const isExpired = await checkSessionExpiration(session.user.id);
    
    if (isExpired) {
      console.log('Session expired, clearing session and logging out');
      await clearExpiredSession(session.user.id);
      await supabase.auth.signOut({ scope: 'global' });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};
