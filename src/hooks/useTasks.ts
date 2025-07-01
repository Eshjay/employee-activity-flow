
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_by: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  assignee_name?: string;
  assigner_name?: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile names separately to avoid join issues
      const userIds = [...new Set([
        ...tasksData.map(task => task.assigned_to),
        ...tasksData.map(task => task.assigned_by)
      ])];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || []);

      const formattedTasks: Task[] = tasksData.map(task => ({
        ...task,
        priority: task.priority as Task['priority'],
        status: task.status as Task['status'],
        assignee_name: profileMap.get(task.assigned_to),
        assigner_name: profileMap.get(task.assigned_by)
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title!,
          description: taskData.description,
          assigned_to: taskData.assigned_to!,
          assigned_by: taskData.assigned_by!,
          due_date: taskData.due_date,
          priority: taskData.priority || 'medium',
          status: taskData.status || 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      fetchTasks();
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          assigned_to: updates.assigned_to,
          assigned_by: updates.assigned_by,
          due_date: updates.due_date,
          priority: updates.priority,
          status: updates.status,
          completed_at: updates.completed_at
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      fetchTasks();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask
  };
};
