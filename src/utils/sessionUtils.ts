
import { supabase } from "@/integrations/supabase/client";

export const validateAndRefreshSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return false;
    }
    
    if (!session?.user) {
      console.log('No active session found');
      return false;
    }

    // Check if session is close to expiring and refresh if needed
    if (session.expires_at) {
      const expirationTime = session.expires_at * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // If session expires in less than 10 minutes, refresh it
      if (timeUntilExpiry < 10 * 60 * 1000) {
        console.log('Session expiring soon, refreshing...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          return false;
        }
        
        console.log('Session refreshed successfully');
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

// Legacy function kept for backward compatibility but simplified
export const checkSessionExpiration = async (userId: string): Promise<boolean> => {
  // Always return false (not expired) to prevent the infinite loop
  // Let Supabase handle session expiration natively
  return false;
};

// Legacy function kept for backward compatibility but simplified
export const clearExpiredSession = async (userId: string) => {
  // Do nothing - let Supabase handle session cleanup
  console.log('Session cleanup skipped - handled by Supabase');
};
