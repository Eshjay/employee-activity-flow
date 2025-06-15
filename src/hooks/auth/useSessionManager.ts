
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileManagement } from './useProfileManagement';
import { checkSessionExpiration, clearExpiredSession } from '@/utils/sessionUtils';

export const useSessionManager = () => {
  const { fetchProfile, updateLastLogin } = useProfileManagement();

  const processSession = async (
    session: Session | null,
    mounted: React.MutableRefObject<boolean>,
    setters: {
      setProfile: (profile: any) => void;
      setLoading: (loading: boolean) => void;
      setAuthError: (error: string | null) => void;
    }
  ) => {
    if (!mounted.current || !session?.user) {
      if (mounted.current) {
        setters.setProfile(null);
        setters.setLoading(false);
      }
      return;
    }

    try {
      // Check if session is expired
      const isExpired = await checkSessionExpiration(session.user.id);
      
      if (isExpired) {
        console.log('Session expired, clearing session');
        await clearExpiredSession(session.user.id);
        await supabase.auth.signOut({ scope: 'global' });
        if (mounted.current) {
          setters.setProfile(null);
          setters.setLoading(false);
        }
        return;
      }

      const profileData = await fetchProfile(session.user.id, session.user.email || '');
      if (mounted.current) {
        setters.setProfile(profileData);
        setters.setLoading(false);
        if (profileData) {
          await updateLastLogin(session.user.id);
        }
      }
    } catch (error) {
      console.error('Error processing session:', error);
      if (mounted.current) {
        setters.setAuthError('Authentication error occurred');
        setters.setLoading(false);
      }
    }
  };

  return { processSession };
};
