import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateAndRefreshSession, checkSessionExpiration, clearExpiredSession } from '@/utils/sessionUtils';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "employee" | "ceo" | "developer";
  department: string;
}

// Clean up auth state utility
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
  } catch (e) {
    console.error('Error cleaning up auth state:', e);
  }
};

// Helper to assert the role is correct
const parseRole = (input: any): "employee" | "ceo" | "developer" => {
  if (input === "employee" || input === "ceo" || input === "developer") {
    return input;
  }
  return "employee";
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const createMissingProfile = async (userId: string, email: string) => {
    try {
      console.log('Creating missing profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: email.split('@')[0],
          email: email,
          role: 'employee',
          department: 'General',
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      console.log('Successfully created profile:', data);
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: parseRole(data.role),
        department: data.department,
      } as AuthUser;
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
      return null;
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setAuthError('Failed to fetch user profile');
        return null;
      }

      if (!profileData) {
        console.log('Profile not found, creating new profile');
        const newProfile = await createMissingProfile(userId, email);
        if (!newProfile) {
          setAuthError('Failed to create user profile');
          return null;
        }
        return newProfile;
      }

      return {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: parseRole(profileData.role),
        department: profileData.department,
      } as AuthUser;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setAuthError('Failed to load user data');
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

  const handleSessionExpiry = async () => {
    console.log('Session expired - logging out user');
    await signOut();
  };

  useEffect(() => {
    let mounted = true;

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setAuthError(null);

        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile fetching to avoid deadlocks
          setTimeout(async () => {
            if (!mounted) return;

            try {
              // Check if session is expired before proceeding
              const isExpired = await checkSessionExpiration(session.user.id);
              
              if (isExpired) {
                console.log('Session expired during sign-in, clearing session');
                await clearExpiredSession(session.user.id);
                await supabase.auth.signOut({ scope: 'global' });
                if (mounted) {
                  setProfile(null);
                  setLoading(false);
                }
                return;
              }

              const profileData = await fetchProfile(session.user.id, session.user.email || '');
              if (mounted) {
                setProfile(profileData);
                setLoading(false);
                if (profileData) {
                  await updateLastLogin(session.user.id);
                }
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
              if (mounted) {
                setAuthError('Authentication error occurred');
                setLoading(false);
              }
            }
          }, 100);
        } else if (!session?.user) {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          if (!mounted) return;

          try {
            // Check if existing session is expired
            const isExpired = await checkSessionExpiration(session.user.id);
            
            if (isExpired) {
              console.log('Existing session expired, clearing session');
              await clearExpiredSession(session.user.id);
              await supabase.auth.signOut({ scope: 'global' });
              if (mounted) {
                setProfile(null);
                setLoading(false);
              }
              return;
            }

            const profileData = await fetchProfile(session.user.id, session.user.email || '');
            if (mounted) {
              setProfile(profileData);
              setLoading(false);
              if (profileData) {
                await updateLastLogin(session.user.id);
              }
            }
          } catch (error) {
            console.error('Error in initial session check:', error);
            if (mounted) {
              setAuthError('Failed to load user session');
              setLoading(false);
            }
          }
        }, 100);
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Set up periodic session validation (every 5 minutes)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (session?.user) {
        const isValid = await validateAndRefreshSession();
        if (!isValid) {
          await handleSessionExpiry();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [session]);

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
      window.location.href = "/login";
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
