
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
      
      // Batch state updates to prevent multiple re-renders
      if (event === 'SIGNED_OUT' || !session?.user) {
        updateAuthState(session, null, false, null);
      } else {
        updateAuthState(session, profile, true, null);
        
        // Defer profile fetching to prevent blocking
        if (event === 'SIGNED_IN') {
          setTimeout(async () => {
            if (!mounted.current) return;
            
            try {
              const { fetchProfile, updateLastLogin } = await import('./useProfileManagement');
              const profileMgmt = { fetchProfile: fetchProfile(), updateLastLogin: updateLastLogin() };
              
              const profileData = await profileMgmt.fetchProfile(session.user.id, session.user.email || '');
              
              if (mounted.current) {
                updateAuthState(session, profileData, false, null);
                
                // Background task for last login update
                profileMgmt.updateLastLogin(session.user.id).catch(console.warn);
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

      // Start with session but show loading for profile
      updateAuthState(session, null, true, null);
      
      try {
        const { fetchProfile, updateLastLogin } = await import('./useProfileManagement');
        const profileMgmt = { fetchProfile: fetchProfile(), updateLastLogin: updateLastLogin() };
        
        const profileData = await profileMgmt.fetchProfile(session.user.id, session.user.email || '');
        
        if (mounted.current) {
          updateAuthState(session, profileData, false, null);
          
          // Background task for last login update
          profileMgmt.updateLastLogin(session.user.id).catch(console.warn);
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
