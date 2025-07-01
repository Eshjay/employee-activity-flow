
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
      const { data: todosData, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch task details separately for todos that have task_id
      const taskIds = todosData?.filter(todo => todo.task_id).map(todo => todo.task_id!) || [];
      
      let tasksMap = new Map();
      if (taskIds.length > 0) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, assigned_by')
          .in('id', taskIds);

        if (tasksError) throw tasksError;
        tasksMap = new Map(tasksData?.map(task => [task.id, task]) || []);
      }

      const formattedTodos: Todo[] = todosData?.map(todo => ({
        ...todo,
        priority: todo.priority as Todo['priority'],
        task: todo.task_id ? tasksMap.get(todo.task_id) : undefined
      })) || [];

      setTodos(formattedTodos);
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
        .insert([{
          user_id: profile.id,
          title: todoData.title!,
          description: todoData.description,
          task_id: todoData.task_id,
          priority: todoData.priority || 'medium',
          due_date: todoData.due_date,
          is_completed: todoData.is_completed || false
        }])
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
        .update({
          title: updates.title,
          description: updates.description,
          is_completed: updates.is_completed,
          priority: updates.priority,
          due_date: updates.due_date,
          completed_at: updates.completed_at
        })
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
