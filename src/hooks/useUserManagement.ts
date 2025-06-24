
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmailManagement } from "./useEmailManagement";
import { useAuth } from "./useAuth";
import type { Profile } from "@/types/user";

export const useUserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { sendUserInvitation } = useEmailManagement();
  const { profile } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (newUser: {
    name: string;
    email: string;
    role: "employee" | "ceo" | "developer";
    department: string;
  }) => {
    try {
      console.log('Adding new user via invitation:', newUser);

      if (!profile?.id) {
        toast({
          title: "Error",
          description: "Unable to determine current user",
          variant: "destructive",
        });
        return false;
      }

      // Send invitation email instead of creating user directly
      const success = await sendUserInvitation(
        newUser.email,
        newUser.name,
        newUser.role,
        newUser.department,
        profile.id
      );

      if (success) {
        toast({
          title: "Success",
          description: `Invitation sent to ${newUser.email}. They will receive an email to complete their registration.`,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to send user invitation",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUser = async (updatedUser: Profile) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          status: updatedUser.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedUser.id);

      if (error) {
        console.error("Error updating user:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update user",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error in updateUser:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete user",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error in deleteUser:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};
