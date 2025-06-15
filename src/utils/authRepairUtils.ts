
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
      
      // Create missing profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'employee',
          department: 'General',
          status: 'active'
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return { success: false, message: 'Failed to create profile' };
      }

      console.log('Successfully created missing profile');
      return { success: true, message: 'Profile created successfully' };
    }

    console.log('Profile already exists, no repair needed');
    return { success: true, message: 'Profile already exists' };
    
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
    }

    return { consistent: issues.length === 0, issues };
  } catch (error) {
    return { consistent: false, issues: [`Unexpected error: ${error}`] };
  }
};
