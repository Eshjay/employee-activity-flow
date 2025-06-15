
import { Session } from '@supabase/supabase-js';
import { useSessionManager } from './useSessionManager';

export const useAuthEventHandlers = () => {
  const { processSession } = useSessionManager();

  const handleAuthStateChange = async (
    event: string,
    session: Session | null,
    mounted: React.MutableRefObject<boolean>,
    setters: {
      setSession: (session: Session | null) => void;
      setUser: (user: any) => void;
      setAuthError: (error: string | null) => void;
      setProfile: (profile: any) => void;
      setLoading: (loading: boolean) => void;
    }
  ) => {
    if (!mounted.current) {
      console.log('handleAuthStateChange: Component unmounted, skipping');
      return;
    }

    console.log('Auth state change:', event, 'user ID:', session?.user?.id);
    setters.setSession(session);
    setters.setUser(session?.user ?? null);
    setters.setAuthError(null);

    if (event === 'SIGNED_IN' && session?.user) {
      console.log('Processing sign in event');
      // Process session with improved error handling
      await processSession(session, mounted, {
        setProfile: setters.setProfile,
        setLoading: setters.setLoading,
        setAuthError: setters.setAuthError
      });
    } else if (!session?.user) {
      console.log('No user in session, clearing profile and stopping loading');
      if (mounted.current) {
        setters.setProfile(null);
        setters.setLoading(false);
      }
    }
  };

  const handleInitialSession = async (
    session: Session | null,
    mounted: React.MutableRefObject<boolean>,
    setters: {
      setSession: (session: Session | null) => void;
      setUser: (user: any) => void;
      setProfile: (profile: any) => void;
      setLoading: (loading: boolean) => void;
      setAuthError: (error: string | null) => void;
    }
  ) => {
    if (!mounted.current) {
      console.log('handleInitialSession: Component unmounted, skipping');
      return;
    }

    console.log('Initial session check:', session?.user?.id);
    setters.setSession(session);
    setters.setUser(session?.user ?? null);

    if (session?.user) {
      console.log('Processing initial session');
      // Process session with improved error handling
      await processSession(session, mounted, {
        setProfile: setters.setProfile,
        setLoading: setters.setLoading,
        setAuthError: setters.setAuthError
      });
    } else {
      console.log('No initial session, stopping loading');
      if (mounted.current) {
        setters.setLoading(false);
      }
    }
  };

  return {
    handleAuthStateChange,
    handleInitialSession
  };
};
