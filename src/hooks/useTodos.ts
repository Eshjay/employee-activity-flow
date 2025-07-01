
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Todo {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  converted_to_activity_id?: string;
  task?: {
    title: string;
    assigned_by: string;
  };
}

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchTodos = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select(`
          *,
          task:task_id (title, assigned_by)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: "Error",
        description: "Failed to load todos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData: Partial<Todo>) => {
    if (!profile?.id) return null;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ ...todoData, user_id: profile.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Todo created successfully",
      });

      fetchTodos();
      return data;
    } catch (error) {
      console.error('Error creating todo:', error);
      toast({
        title: "Error",
        description: "Failed to create todo",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Todo updated successfully",
      });

      fetchTodos();
      return true;
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
      return false;
    }
  };

  const convertTodoToActivity = async (
    todoId: string,
    timeStarted?: string,
    timeEnded?: string,
    additionalComments?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('convert_todo_to_activity', {
        todo_id: todoId,
        time_started: timeStarted || null,
        time_ended: timeEnded || null,
        additional_comments: additionalComments || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Todo converted to activity successfully",
      });

      fetchTodos();
      return data;
    } catch (error) {
      console.error('Error converting todo to activity:', error);
      toast({
        title: "Error",
        description: "Failed to convert todo to activity",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [profile?.id]);

  return {
    todos,
    loading,
    fetchTodos,
    createTodo,
    updateTodo,
    convertTodoToActivity
  };
};
