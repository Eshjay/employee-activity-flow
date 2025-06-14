
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Report {
  id: string;
  type: string;
  date: string;
  employees_submitted: number;
  total_employees: number;
  status: string;
  email_sent: boolean;
  file_path?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('useReports: Fetching reports');
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useReports: Error fetching reports:', error);
        throw error;
      }

      console.log('useReports: Successfully fetched reports:', data?.length || 0);
      setReports(data || []);
    } catch (error) {
      console.error('useReports: Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (reportData: {
    type: string;
    date: string;
    employees_submitted: number;
    total_employees: number;
    status?: string;
    email_sent?: boolean;
  }) => {
    try {
      console.log('useReports: Adding report for user:', profile?.id);
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          ...reportData,
          created_by: profile?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('useReports: Error adding report:', error);
        throw error;
      }

      console.log('useReports: Report added successfully');
      await fetchReports(); // Refresh the list
      toast({
        title: "Report Created",
        description: "The report has been created successfully.",
      });
      return data;
    } catch (error) {
      console.error('useReports: Error adding report:', error);
      toast({
        title: "Error",
        description: "Failed to create report.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      console.log('useReports: Attempting to delete report:', reportId);
      console.log('useReports: Current user profile:', profile);
      
      // Check if user is developer before attempting delete
      if (profile?.role !== 'developer') {
        console.log('useReports: User is not a developer, role:', profile?.role);
        toast({
          title: "Access Denied",
          description: "Only developers can delete reports.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('useReports: Error deleting report:', error);
        toast({
          title: "Error",
          description: `Failed to delete report: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('useReports: Report deleted successfully');
      await fetchReports(); // Refresh the list
      toast({
        title: "Report Deleted",
        description: "The report has been deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error('useReports: Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    fetchReports,
    addReport,
    deleteReport
  };
};
