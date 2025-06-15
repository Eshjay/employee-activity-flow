
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
  const createMissingProfile = async (userId: string, email: string): Promise<AuthUser | null> => {
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
        return null;
      }

      if (!profileData) {
        console.log('Profile not found, creating new profile');
        const newProfile = await createMissingProfile(userId, email);
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

  return {
    fetchProfile,
    updateLastLogin
  };
};
