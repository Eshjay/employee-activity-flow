
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSessionValidation = (
  session: Session | null, 
  onSessionExpiry: () => Promise<void>
) => {
  // Set up periodic session validation (every 30 minutes instead of 5 to reduce load)
  useEffect(() => {
    if (!session?.user) return;

    const intervalId = setInterval(async () => {
      try {
        // Check if the current session is still valid with Supabase
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.log('Session validation failed - session expired');
          await onSessionExpiry();
          return;
        }

        // Check if the session is close to expiring (within 5 minutes)
        const expiresAt = currentSession.expires_at;
        if (expiresAt) {
          const expirationTime = expiresAt * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const timeUntilExpiry = expirationTime - currentTime;
          
          // If session expires in less than 5 minutes, try to refresh
          if (timeUntilExpiry < 5 * 60 * 1000) {
            console.log('Session expiring soon, attempting refresh...');
            const { error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.log('Session refresh failed:', refreshError);
              await onSessionExpiry();
            }
          }
        }
      } catch (error) {
        console.error('Error during session validation:', error);
        // Don't automatically log out on validation errors - could be network issues
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(intervalId);
  }, [session?.user?.id, onSessionExpiry]);
};
