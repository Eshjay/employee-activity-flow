
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/types/user';

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedProfiles: Profile[] = (data || []).map(profile => ({
        ...profile,
        role: profile.role as "employee" | "ceo" | "developer"
      }));
      
      setProfiles(typedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeStats = () => {
    const employees = profiles.filter(p => p.role === 'employee');
    const activeEmployees = employees.filter(p => p.status === 'active');
    
    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      departments: [...new Set(employees.map(e => e.department))].length,
    };
  };

  const getUsersByRole = (role: string) => {
    return profiles.filter(p => p.role === role);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    fetchProfiles,
    getEmployeeStats,
    getUsersByRole,
  };
};
