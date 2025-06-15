
import { supabase } from "@/integrations/supabase/client";

// Optimized session validation with caching
let lastSessionCheck = 0;
const SESSION_CHECK_INTERVAL = 30000; // 30 seconds

export const validateAndRefreshSession = async (): Promise<boolean> => {
  try {
    // Throttle session checks to reduce database load
    const now = Date.now();
    if (now - lastSessionCheck < SESSION_CHECK_INTERVAL) {
      return true; // Assume valid if checked recently
    }
    lastSessionCheck = now;

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

// Simplified legacy functions for backward compatibility
export const checkSessionExpiration = async (userId: string): Promise<boolean> => {
  return false; // Always return false to prevent loops
};

export const clearExpiredSession = async (userId: string) => {
  console.log('Session cleanup skipped - handled by Supabase');
};
