import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthUser } from '../useAuth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Memoized setter to prevent unnecessary re-renders
  const updateAuthState = useCallback((
    newSession: Session | null,
    newProfile: AuthUser | null = null,
    isLoading: boolean = false,
    error: string | null = null
  ) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setProfile(newProfile);
    setLoading(isLoading);
    setAuthError(error);
  }, []);

  // Create factory functions for event handlers
  const createAuthStateChangeHandler = useCallback((mounted: React.MutableRefObject<boolean>) => {
    return async (event: string, session: Session | null) => {
      if (!mounted.current) return;

      console.log('Auth state change:', event, 'user ID:', session?.user?.id);

      if (event === 'SIGNED_OUT' || !session?.user) {
        updateAuthState(session, null, false, null);
      } else {
        // On SIGNED_IN or any session presence, always show loading while fetching
        updateAuthState(session, null, true, null);

        if (event === 'SIGNED_IN') {
          // Defer profile fetching (see deadlock avoidance doc)
          setTimeout(async () => {
            if (!mounted.current) return;
            try {
              const { useProfileManagement } = await import('./useProfileManagement');
              // Always force a fresh profile fetch after SIGNED_IN
              const { fetchProfile, updateLastLogin } = useProfileManagement();
              const profileData = await fetchProfile(session.user.id, session.user.email || '', { forceFresh: true });

              if (mounted.current) {
                updateAuthState(session, profileData, false, null);
                updateLastLogin(session.user.id);
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
              if (mounted.current) {
                const fallbackProfile = {
                  id: session.user.id,
                  name: session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: 'employee' as const,
                  department: 'General',
                };
                updateAuthState(session, fallbackProfile, false, null);
              }
            }
          }, 0);
        } else {
          // For all other session events (refresh, SESSION_RESTORED): also force fresh fetch
          setTimeout(async () => {
            if (!mounted.current) return;
            try {
              const { useProfileManagement } = await import('./useProfileManagement');
              const { fetchProfile } = useProfileManagement();
              const profileData = await fetchProfile(session.user.id, session.user.email || '', { forceFresh: true });
              if (mounted.current) {
                updateAuthState(session, profileData, false, null);
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
              if (mounted.current) {
                const fallbackProfile = {
                  id: session.user.id,
                  name: session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: 'employee' as const,
                  department: 'General',
                };
                updateAuthState(session, fallbackProfile, false, null);
              }
            }
          }, 0);
        }
      }
    };
  }, [updateAuthState, profile]);

  const createInitialSessionHandler = useCallback((mounted: React.MutableRefObject<boolean>) => {
    return async (session: Session | null) => {
      if (!mounted.current) return;

      console.log('Initial session check:', session?.user?.id);

      if (!session?.user) {
        updateAuthState(session, null, false, null);
        return;
      }

      updateAuthState(session, null, true, null);

      try {
        const { useProfileManagement } = await import('./useProfileManagement');
        // Always fetch a fresh profile on initial session restore
        const { fetchProfile, updateLastLogin } = useProfileManagement();
        const profileData = await fetchProfile(session.user.id, session.user.email || '', { forceFresh: true });

        if (mounted.current) {
          updateAuthState(session, profileData, false, null);
          updateLastLogin(session.user.id);
        }
      } catch (error) {
        console.error('Initial profile fetch error:', error);
        if (mounted.current) {
          const fallbackProfile = {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'employee' as const,
            department: 'General',
          };
          updateAuthState(session, fallbackProfile, false, null);
        }
      }
    };
  }, [updateAuthState]);

  return {
    user,
    session,
    profile,
    loading,
    authError,
    setUser,
    setSession,
    setProfile,
    setLoading,
    setAuthError,
    updateAuthState,
    handleAuthStateChange: createAuthStateChangeHandler,
    handleInitialSession: createInitialSessionHandler
  };
};
