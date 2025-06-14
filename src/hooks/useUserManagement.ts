
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/user";

export const useUserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedUsers: Profile[] = (data || []).map(user => ({
        ...user,
        role: user.role as "employee" | "ceo" | "developer"
      }));
      
      setUsers(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: { name: string; email: string; role: string; department: string }) => {
    if (!userData.name || !userData.email || !userData.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    try {
      toast({
        title: "User Invitation",
        description: `Please ask ${userData.name} to sign up at the authentication page with email: ${userData.email}`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUser = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: "User Updated",
        description: `${user.name} has been updated successfully.`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "User Deleted",
        description: "User has been removed from the system.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser
  };
};
