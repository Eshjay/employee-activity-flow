import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "../useAuth";

// Helper to assert the role is correct
const parseRole = (input: any): "employee" | "ceo" | "developer" => {
  if (input === "employee" || input === "ceo" || input === "developer") {
    return input;
  }
  return "employee";
};

// Cache for profile data to reduce database calls
const profileCache = new Map<string, { profile: AuthUser; timestamp: number; cacheKey: string }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to build a cache key from user properties (id + role)
const buildCacheKey = (profile: { id: string; role: string }) => `${profile.id}:${profile.role}`;

export const useProfileManagement = () => {
  const createMissingProfile = async (
    userId: string, 
    email: string, 
    roleHint?: string
  ): Promise<AuthUser | null> => {
    try {
      console.log('Creating missing profile for user:', userId, 'with role hint:', roleHint);
      
      const role = parseRole(roleHint);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: email.split('@')[0],
          email: email,
          role: role,
          department: role === 'developer' ? 'IT' : 'General',
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      const profile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: parseRole(data.role),
        department: data.department,
      } as AuthUser;

      // Cache the newly created profile with new cacheKey
      profileCache.set(userId, { profile, timestamp: Date.now(), cacheKey: buildCacheKey(profile) });
      console.log('Successfully created and cached profile:', data);
      
      return profile;
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
      return null;
    }
  };

  /**
   * Fetches a user's profile.
   * - Always bypasses cache if forceFresh is true, or if role has changed, or if cache expired.
   */
  const fetchProfile = async (
    userId: string, 
    email: string, 
    options: { forceFresh?: boolean; expectedRole?: string } = {}
  ): Promise<AuthUser | null> => {
    try {
      const { forceFresh = false, expectedRole } = options;

      let cached = profileCache.get(userId);
      const isCacheValid = cached &&
        Date.now() - cached.timestamp < CACHE_DURATION &&
        (!expectedRole || cached.profile.role === expectedRole);

      // If not forceFresh, and cache is valid and role hasn't changed, use cache
      if (!forceFresh && isCacheValid) {
        console.log('Using cached profile for user:', userId);
        return cached!.profile;
      }

      // Always force refetch if forceFresh=true or expectedRole and roles don't match
      console.log('Fetching fresh profile for user:', userId);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!profileData) {
        console.log('Profile not found, checking user metadata for role information');
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const roleFromMetadata = user?.user_metadata?.role;
          
          console.log('Creating new profile with role from metadata:', roleFromMetadata);
          return await createMissingProfile(userId, email, roleFromMetadata);
        } catch (metadataError) {
          console.warn('Could not fetch user metadata, creating default profile:', metadataError);
          return await createMissingProfile(userId, email, 'employee');
        }
      }

      const profile = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: parseRole(profileData.role),
        department: profileData.department,
      } as AuthUser;

      // Always update cache now with correct cacheKey based on fetched profile
      profileCache.set(userId, { profile, timestamp: Date.now(), cacheKey: buildCacheKey(profile) });
      
      return profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      
      // Always return a fallback profile instead of null to prevent loading loops
      const fallbackProfile = {
        id: userId,
        name: email.split('@')[0],
        email: email,
        role: 'employee' as const,
        department: 'General',
      };
      
      // Cache fallback profile briefly
      profileCache.set(userId, { profile: fallbackProfile, timestamp: Date.now(), cacheKey: buildCacheKey(fallbackProfile) });
      console.log('Returning and caching fallback profile due to error');
      
      return fallbackProfile;
    }
  };

  const updateLastLogin = async (userId: string) => {
    // Run as background task to avoid blocking UI
    setTimeout(async () => {
      try {
        const { error } = await supabase.rpc('update_last_login', {
          user_uuid: userId
        });
        if (error) {
          console.error('Error updating last login:', error);
        } else {
          console.log('Successfully updated last login for user:', userId);
          
          // Invalidate cache to ensure fresh data on next fetch
          profileCache.delete(userId);
        }
      } catch (error) {
        console.error('Error calling update_last_login function:', error);
      }
    }, 100);
  };

  /**
   * Helper to manually bust a user's profile cache (for example, after an admin role change)
   */
  const bustProfileCache = (userId: string) => {
    profileCache.delete(userId);
  };

  return {
    fetchProfile,
    updateLastLogin,
    bustProfileCache,
  };
};
