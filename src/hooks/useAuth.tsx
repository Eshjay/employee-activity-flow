
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from './auth/useAuthCleanup';
import { useAuthState } from './auth/useAuthState';

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
    setLoading,
    handleAuthStateChange,
    handleInitialSession
  } = useAuthState();

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    console.log('useAuth: Initializing auth state');

    // Create the actual handler functions by calling the factory functions with mounted ref
    const authStateChangeHandler = handleAuthStateChange(mounted);
    const initialSessionHandler = handleInitialSession(mounted);

    // Set up the auth state listener
    console.log('useAuth: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(authStateChangeHandler);

    // Check for existing session
    console.log('useAuth: Checking for existing session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('useAuth: Initial session found:', !!session);
      await initialSessionHandler(session);
    }).catch(error => {
      console.error('useAuth: Error getting initial session:', error);
      // Ensure loading is set to false even if initial session check fails
      if (mounted.current) {
        setLoading(false);
      }
    });

    return () => {
      console.log('useAuth: Cleanup');
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, handleInitialSession]);

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear auth state first
      cleanupAuthState();
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);
      setLoading(false);
      
      // Attempt Supabase sign out (don't block on errors)
      try {
        await supabase.auth.signOut({ scope: "global" });
        console.log('Supabase sign out successful');
      } catch (e) {
        console.warn('Supabase sign out error (continuing anyway):', e);
      }
      
      // Redirect to auth page with a slight delay to ensure state is cleared
      setTimeout(() => {
        window.location.href = "/auth";
      }, 100);
      
    } catch (error) {
      console.error("Error during sign out:", error);
      // Even if there's an error, redirect to auth page
      window.location.href = "/auth";
    }
  };

  // More resilient authentication check
  const isAuthenticated = !!session && !!profile;
  
  console.log('useAuth state:', {
    hasSession: !!session,
    hasProfile: !!profile,
    isAuthenticated,
    loading,
    authError
  });

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated,
    authError
  };
};
