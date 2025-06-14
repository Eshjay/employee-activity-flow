
-- Create a table for storing reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Daily Report', 'Weekly Summary')),
  date DATE NOT NULL,
  employees_submitted INTEGER NOT NULL DEFAULT 0,
  total_employees INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  email_sent BOOLEAN NOT NULL DEFAULT false,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Add Row Level Security (RLS) to the reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for the reports table
-- Allow all authenticated users to view reports
CREATE POLICY "All authenticated users can view reports" 
  ON public.reports 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert reports
CREATE POLICY "All authenticated users can create reports" 
  ON public.reports 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only developers can delete reports
CREATE POLICY "Only developers can delete reports" 
  ON public.reports 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'developer'
    )
  );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reports_updated_at();

-- Insert some sample data to replace the mock data
INSERT INTO public.reports (type, date, employees_submitted, total_employees, status, email_sent, created_by) VALUES
('Daily Report', '2024-06-12', 9, 12, 'completed', true, (SELECT id FROM auth.users LIMIT 1)),
('Weekly Summary', '2024-06-10', 12, 12, 'completed', true, (SELECT id FROM auth.users LIMIT 1)),
('Daily Report', '2024-06-11', 11, 12, 'completed', true, (SELECT id FROM auth.users LIMIT 1));
