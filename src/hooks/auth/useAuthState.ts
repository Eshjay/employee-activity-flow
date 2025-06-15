
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '../useAuth';
import { useProfileManagement } from './useProfileManagement';
import { checkSessionExpiration, clearExpiredSession } from '@/utils/sessionUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const { fetchProfile, updateLastLogin } = useProfileManagement();

  const handleAuthStateChange = async (event: string, session: Session | null, mounted: React.MutableRefObject<boolean>) => {
    if (!mounted.current) return;

    console.log('Auth state change:', event, session?.user?.id);
    setSession(session);
    setUser(session?.user ?? null);
    setAuthError(null);

    if (event === 'SIGNED_IN' && session?.user) {
      // Defer profile fetching to avoid deadlocks
      setTimeout(async () => {
        if (!mounted.current) return;

        try {
          // Check if session is expired before proceeding
          const isExpired = await checkSessionExpiration(session.user.id);
          
          if (isExpired) {
            console.log('Session expired during sign-in, clearing session');
            await clearExpiredSession(session.user.id);
            await supabase.auth.signOut({ scope: 'global' });
            if (mounted.current) {
              setProfile(null);
              setLoading(false);
            }
            return;
          }

          const profileData = await fetchProfile(session.user.id, session.user.email || '');
          if (mounted.current) {
            setProfile(profileData);
            setLoading(false);
            if (profileData) {
              await updateLastLogin(session.user.id);
            }
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          if (mounted.current) {
            setAuthError('Authentication error occurred');
            setLoading(false);
          }
        }
      }, 100);
    } else if (!session?.user) {
      if (mounted.current) {
        setProfile(null);
        setLoading(false);
      }
    }
  };

  const handleInitialSession = async (session: Session | null, mounted: React.MutableRefObject<boolean>) => {
    if (!mounted.current) return;

    console.log('Initial session check:', session?.user?.id);
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      setTimeout(async () => {
        if (!mounted.current) return;

        try {
          // Check if existing session is expired
          const isExpired = await checkSessionExpiration(session.user.id);
          
          if (isExpired) {
            console.log('Existing session expired, clearing session');
            await clearExpiredSession(session.user.id);
            await supabase.auth.signOut({ scope: 'global' });
            if (mounted.current) {
              setProfile(null);
              setLoading(false);
            }
            return;
          }

          const profileData = await fetchProfile(session.user.id, session.user.email || '');
          if (mounted.current) {
            setProfile(profileData);
            setLoading(false);
            if (profileData) {
              await updateLastLogin(session.user.id);
            }
          }
        } catch (error) {
          console.error('Error in initial session check:', error);
          if (mounted.current) {
            setAuthError('Failed to load user session');
            setLoading(false);
          }
        }
      }, 100);
    } else {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    authError,
    setUser,
    setSession,
    setProfile,
    setAuthError,
    handleAuthStateChange,
    handleInitialSession
  };
};
