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
        return {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role as "employee" | "ceo" | "developer",
          department: profileData.department
        };
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
      } else {
        console.log('Last login updated successfully for user:', userId);
      }
    } catch (error) {
      console.error('Error calling update_last_login function:', error);
    }
  };

  const cleanupAuthState = () => {
    try {
      // Remove standard tokens & all supabase keys in localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          localStorage.removeItem(key);
        }
      });
      // Remove from sessionStorage as well
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore errors
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          // Clean up "limbo" state if any, per best practice
          cleanupAuthState();

          setTimeout(async () => {
            const profileData = await fetchProfile(session?.user?.id || "");
            setProfile(profileData);
            setLoading(false);
          }, 0);

          // Update last login but outside of setTimeout for ordering
          if (session?.user) {
            setTimeout(async () => {
              await updateLastLogin(session.user.id);
            }, 0);
          }
        } else if (!session?.user) {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session once at mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Clean up state on reload too, in case of "limbo"
        cleanupAuthState();

        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setLoading(false);
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
        // Attempt global sign out (ignore failures)
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {}
      setUser(null);
      setSession(null);
      setProfile(null);
      // Force reload to leave no stale state
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
