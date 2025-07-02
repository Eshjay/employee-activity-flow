
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  time_started?: string;
  time_ended?: string;
  comments?: string;
  created_at?: string;
  duration_minutes?: number;
  is_time_tracked?: boolean;
  todo_source_id?: string;
}

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user activities.",
        variant: "destructive",
      });
      return [];
    }
  };

  const createActivity = async (activityData: Partial<Activity>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .insert([{
          user_id: user.id,
          title: activityData.title!,
          description: activityData.description || '',
          date: activityData.date || new Date().toISOString().split('T')[0],
          time_started: activityData.time_started,
          time_ended: activityData.time_ended,
          comments: activityData.comments,
          duration_minutes: activityData.duration_minutes,
          is_time_tracked: activityData.is_time_tracked || false,
          todo_source_id: activityData.todo_source_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity created successfully",
      });

      fetchActivities();
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
      return null;
    }
  };

  const getTodaySubmissions = () => {
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(activity => activity.date === today);
  };

  const getWeeklySubmissions = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return activities.filter(activity => new Date(activity.date) >= oneWeekAgo);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    isLoading: loading, // Add alias for compatibility
    fetchActivities,
    fetchUserActivities,
    createActivity,
    getTodaySubmissions,
    getWeeklySubmissions,
  };
};
