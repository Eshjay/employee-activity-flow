
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "employee" | "ceo" | "developer";
  department: string;
}

// Clean up auth state utility (move to top-level)
export const cleanupAuthState = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {}
};

// Helper to assert the role is correct
const parseRole = (input: any): "employee" | "ceo" | "developer" => {
  if (input === "employee" || input === "ceo" || input === "developer") {
    return input;
  }
  // fallback if roles ever come as number (legacy or seed data), just default to "employee"
  return "employee";
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      if (profileData) {
        // Make sure role is a string literal (never a number)
        return {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: parseRole(profileData.role),
          department: profileData.department,
        } as AuthUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const updateLastLogin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('update_last_login', {
        user_uuid: userId
      });
      if (error) {
        console.error('Error updating last login:', error);
      }
    } catch (error) {
      console.error('Error calling update_last_login function:', error);
    }
  };

  useEffect(() => {
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetching and last login update to avoid deadlocks
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
            await updateLastLogin(session.user.id);
          }, 0);
        } else if (!session?.user) {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Only after listener is set, check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setLoading(false);
          await updateLastLogin(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch {}
      setUser(null);
      setSession(null);
      setProfile(null);
      window.location.href = "/auth";
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
    isAuthenticated: !!session
  };
};

// No need to re-export cleanupAuthState; it's already exported at definition.

