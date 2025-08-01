import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthUser } from '../useAuth';

export const useSimpleAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const updateAuthState = (
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
  };

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
    setAuthError(null);
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
    setLoading,
    setAuthError,
    updateAuthState,
    clearAuthState
  };
};