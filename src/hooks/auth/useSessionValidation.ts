
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

export const useSessionValidation = (
  session: Session | null, 
  onSessionExpiry: () => Promise<void>
) => {
  // Simplified session validation - only check if session actually expires
  useEffect(() => {
    if (!session?.user) return;

    // Only set up a timeout if the session has an expiration time
    if (!session.expires_at) return;

    const expirationTime = session.expires_at * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Only set up expiry check if session will actually expire soon
    if (timeUntilExpiry <= 0) {
      console.log('Session already expired');
      onSessionExpiry();
      return;
    }

    // Set timeout for when session will actually expire (with 1 minute buffer)
    const timeoutId = setTimeout(() => {
      console.log('Session expired - logging out');
      onSessionExpiry();
    }, Math.max(timeUntilExpiry - 60000, 0)); // 1 minute before expiry

    return () => clearTimeout(timeoutId);
  }, [session?.expires_at, onSessionExpiry]);
};
