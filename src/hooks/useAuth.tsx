
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { clearExpiredSession } from '@/utils/sessionUtils';
import { cleanupAuthState } from './auth/useAuthCleanup';
import { useAuthState } from './auth/useAuthState';
import { useSessionValidation } from './auth/useSessionValidation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "employee" | "ceo" | "developer";
  department: string;
}

// Export cleanup utility for use in other components
export { cleanupAuthState };

export const useAuth = () => {
  const {
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
  } = useAuthState();

  const mounted = useRef(true);

  const handleSessionExpiry = async () => {
    console.log('Session expired - logging out user');
    await signOut();
  };

  // Use session validation hook
  useSessionValidation(session, handleSessionExpiry);

  useEffect(() => {
    mounted.current = true;

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleAuthStateChange(event, session, mounted);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleInitialSession(session, mounted);
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      if (user?.id) {
        await clearExpiredSession(user.id);
      }
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (e) {
        console.error('Error during sign out:', e);
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated: !!session && !!profile,
    authError
  };
};
