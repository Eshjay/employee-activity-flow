import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuthState } from './useSimpleAuthState';
import { cleanupAuthState } from './useAuthCleanup';

export const useSimpleAuth = () => {
  const authState = useSimpleAuthState();
  const {
    user,
    session,
    profile,
    loading,
    authError,
    updateAuthState,
    clearAuthState
  } = authState;

  const mounted = useRef(true);
  const initialized = useRef(false);

  // Check if current session is a recovery session
  const isRecoverySession = Boolean(
    session?.access_token && 
    window.location.hash.includes('type=recovery') &&
    window.location.hash.includes('access_token')
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    mounted.current = true;

    console.log('useSimpleAuth: Initializing');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted.current) return;

        console.log('Auth state change:', event, 'user:', session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          clearAuthState();
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile loading to avoid blocking
          setTimeout(async () => {
            if (!mounted.current) return;
            
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (mounted.current && profileData) {
                updateAuthState(session, {
                  id: profileData.id,
                  name: profileData.name,
                  email: profileData.email,
                  role: profileData.role as "employee" | "ceo" | "developer",
                  department: profileData.department
                }, false, null);
              } else if (mounted.current) {
                // Fallback profile
                updateAuthState(session, {
                  id: session.user.id,
                  name: session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: 'employee' as const,
                  department: 'General'
                }, false, null);
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
              if (mounted.current) {
                // Still set session with fallback profile
                updateAuthState(session, {
                  id: session.user.id,
                  name: session.user.email?.split('@')[0] || 'User',
                  email: session.user.email || '',
                  role: 'employee' as const,
                  department: 'General'
                }, false, null);
              }
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted.current) return;
      
      console.log('Initial session:', !!session);
      
      if (session?.user) {
        // Trigger the same logic as sign in
        setTimeout(async () => {
          if (!mounted.current) return;
          
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (mounted.current && profileData) {
              updateAuthState(session, {
                id: profileData.id,
                name: profileData.name,
                email: profileData.email,
                role: profileData.role as "employee" | "ceo" | "developer",
                department: profileData.department
              }, false, null);
            } else if (mounted.current) {
              updateAuthState(session, {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'employee' as const,
                department: 'General'
              }, false, null);
            }
          } catch (error) {
            console.error('Initial profile fetch error:', error);
            if (mounted.current) {
              updateAuthState(session, {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'employee' as const,
                department: 'General'
              }, false, null);
            }
          }
        }, 0);
      } else {
        updateAuthState(null, null, false, null);
      }
    }).catch(error => {
      console.error('Initial session error:', error);
      if (mounted.current) {
        updateAuthState(null, null, false, 'Failed to load session');
      }
    });

    return () => {
      console.log('useSimpleAuth: Cleanup');
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Starting sign out...');
      
      // Clear local state first
      clearAuthState();
      
      // Cleanup auth state
      cleanupAuthState();
      
      // Supabase sign out
      await supabase.auth.signOut({ scope: "global" });
      
      // Redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      
    } catch (error) {
      console.error("Sign out error:", error);
      // Force redirect even on error
      window.location.href = "/";
    }
  };

  const isAuthenticated = !!session && !!profile;

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated,
    authError,
    isRecoverySession
  };
};