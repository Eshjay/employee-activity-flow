
-- Create tasks table for task assignment
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL,
  assigned_by UUID NOT NULL,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create todos table for employee todo lists
CREATE TABLE public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  converted_to_activity_id UUID
);

-- Create draft_activities table for auto-save functionality
CREATE TABLE public.draft_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  time_started TIME WITHOUT TIME ZONE,
  time_ended TIME WITHOUT TIME ZONE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add time tracking columns to activities table
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS is_time_tracked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS todo_source_id UUID;

-- Add enhanced report fields
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS preview_data JSONB,
ADD COLUMN IF NOT EXISTS report_config JSONB;

-- Enable RLS on all new tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasks table
CREATE POLICY "Users can view tasks assigned to them or created by them" 
  ON public.tasks 
  FOR SELECT 
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Users with appropriate role can create tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = assigned_by AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('ceo', 'developer')
  ));

CREATE POLICY "Task creators and assignees can update tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- RLS policies for todos table
CREATE POLICY "Users can view their own todos" 
  ON public.todos 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own todos" 
  ON public.todos 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own todos" 
  ON public.todos 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own todos" 
  ON public.todos 
  FOR DELETE 
  USING (user_id = auth.uid());

-- RLS policies for draft_activities table
CREATE POLICY "Users can view their own draft activities" 
  ON public.draft_activities 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own draft activities" 
  ON public.draft_activities 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own draft activities" 
  ON public.draft_activities 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own draft activities" 
  ON public.draft_activities 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON public.tasks(assigned_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
CREATE INDEX idx_todos_task_id ON public.todos(task_id);
CREATE INDEX idx_todos_completed ON public.todos(is_completed);
CREATE INDEX idx_draft_activities_user_id ON public.draft_activities(user_id);
CREATE INDEX idx_activities_todo_source ON public.activities(todo_source_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON public.todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_draft_activities_updated_at 
  BEFORE UPDATE ON public.draft_activities 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to convert todo to activity
CREATE OR REPLACE FUNCTION convert_todo_to_activity(
  todo_id UUID,
  time_started TIME DEFAULT NULL,
  time_ended TIME DEFAULT NULL,
  additional_comments TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  todo_record public.todos%ROWTYPE;
  activity_id UUID;
  calculated_duration INTEGER;
BEGIN
  -- Get the todo record
  SELECT * INTO todo_record FROM public.todos WHERE id = todo_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Todo not found or access denied';
  END IF;

  -- Calculate duration if both times provided
  IF time_started IS NOT NULL AND time_ended IS NOT NULL THEN
    calculated_duration := EXTRACT(EPOCH FROM (time_ended - time_started)) / 60;
  END IF;

  -- Create activity from todo
  INSERT INTO public.activities (
    user_id,
    title,
    description,
    time_started,
    time_ended,
    comments,
    date,
    duration_minutes,
    is_time_tracked,
    todo_source_id
  ) VALUES (
    todo_record.user_id,
    todo_record.title,
    todo_record.description,
    time_started,
    time_ended,
    COALESCE(additional_comments, ''),
    CURRENT_DATE,
    calculated_duration,
    (time_started IS NOT NULL AND time_ended IS NOT NULL),
    todo_id
  ) RETURNING id INTO activity_id;

  -- Update todo to mark as converted
  UPDATE public.todos 
  SET 
    is_completed = true,
    completed_at = now(),
    converted_to_activity_id = activity_id,
    updated_at = now()
  WHERE id = todo_id;

  RETURN activity_id;
END;
$$;
