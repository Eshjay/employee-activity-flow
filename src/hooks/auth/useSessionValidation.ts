
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { validateAndRefreshSession } from '@/utils/sessionUtils';

export const useSessionValidation = (
  session: Session | null, 
  onSessionExpiry: () => Promise<void>
) => {
  // Set up periodic session validation (every 5 minutes)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (session?.user) {
        const isValid = await validateAndRefreshSession();
        if (!isValid) {
          await onSessionExpiry();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [session, onSessionExpiry]);
};
