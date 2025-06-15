
import { supabase } from "@/integrations/supabase/client";

export const updateLastLogin = async (userId: string) => {
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
