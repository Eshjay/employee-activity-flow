
import { supabase } from "@/integrations/supabase/client";

export const repairAuthDataConsistency = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Starting auth data consistency repair...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'No authenticated user found' };
    }

    console.log('Checking profile for user:', user.id);
    console.log('User metadata:', user.user_metadata);
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
      return { success: false, message: 'Failed to check profile' };
    }

    if (!existingProfile) {
      console.log('Creating missing profile for user:', user.id);
      
      // Extract role from user metadata if available
      const roleFromMetadata = user.user_metadata?.role || 'employee';
      const nameFromMetadata = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const departmentFromMetadata = user.user_metadata?.department || 'General';
      
      console.log('Using metadata - role:', roleFromMetadata, 'name:', nameFromMetadata, 'department:', departmentFromMetadata);
      
      // Create missing profile with metadata information
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: nameFromMetadata,
          email: user.email || '',
          role: roleFromMetadata,
          department: departmentFromMetadata,
          status: 'active'
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return { success: false, message: 'Failed to create profile' };
      }

      console.log('Successfully created missing profile with role:', roleFromMetadata);
      return { success: true, message: `Profile created successfully with role: ${roleFromMetadata}` };
    }

    console.log('Profile already exists with role:', existingProfile.role);
    return { success: true, message: `Profile already exists with role: ${existingProfile.role}` };
    
  } catch (error) {
    console.error('Error in repairAuthDataConsistency:', error);
    return { success: false, message: 'Unexpected error during repair' };
  }
};

export const checkAuthConsistency = async (): Promise<{ consistent: boolean; issues: string[] }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const issues: string[] = [];

    if (!user) {
      issues.push('No authenticated user found');
      return { consistent: false, issues };
    }

    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      issues.push(`Error checking profile: ${error.message}`);
    }

    if (!profile) {
      issues.push('Profile missing for authenticated user');
    } else {
      // Check if role matches user metadata
      const metadataRole = user.user_metadata?.role;
      if (metadataRole && profile.role !== metadataRole) {
        issues.push(`Role mismatch: profile has '${profile.role}' but metadata has '${metadataRole}'`);
      }
    }

    return { consistent: issues.length === 0, issues };
  } catch (error) {
    return { consistent: false, issues: [`Unexpected error: ${error}`] };
  }
};
