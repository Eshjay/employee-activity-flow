
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "../useAuth";

// Helper to assert the role is correct
const parseRole = (input: any): "employee" | "ceo" | "developer" => {
  if (input === "employee" || input === "ceo" || input === "developer") {
    return input;
  }
  return "employee";
};

export const useProfileManagement = () => {
  const createMissingProfile = async (
    userId: string, 
    email: string, 
    roleHint?: string
  ): Promise<AuthUser | null> => {
    try {
      console.log('Creating missing profile for user:', userId, 'with role hint:', roleHint);
      
      // Use the role hint if provided and valid, otherwise default to employee
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

  const fetchProfile = async (userId: string, email: string): Promise<AuthUser | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist and it's a not found error, try to create one
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('Profile not found, attempting to create one');
          return await createMissingProfile(userId, email);
        }
        return null;
      }

      if (!profileData) {
        console.log('Profile not found, checking user metadata for role information');
        
        // Try to get the user's metadata to extract role information
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const roleFromMetadata = user?.user_metadata?.role;
          
          console.log('User metadata role:', roleFromMetadata);
          console.log('Creating new profile with role from metadata');
          
          const newProfile = await createMissingProfile(userId, email, roleFromMetadata);
          return newProfile;
        } catch (metadataError) {
          console.warn('Could not fetch user metadata, creating default profile:', metadataError);
          // Return a fallback profile
          return await createMissingProfile(userId, email, 'employee');
        }
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
      // Always return a fallback profile instead of null to prevent loading loops
      console.log('Returning fallback profile due to error');
      return {
        id: userId,
        name: email.split('@')[0],
        email: email,
        role: 'employee' as const,
        department: 'General',
      };
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
        console.log('Successfully updated last login for user:', userId);
      }
    } catch (error) {
      console.error('Error calling update_last_login function:', error);
    }
  };

  return {
    fetchProfile,
    updateLastLogin
  };
};
