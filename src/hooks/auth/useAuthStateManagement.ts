
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthUser } from '../useAuth';

export const useAuthStateManagement = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

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
    setAuthError
  };
};
