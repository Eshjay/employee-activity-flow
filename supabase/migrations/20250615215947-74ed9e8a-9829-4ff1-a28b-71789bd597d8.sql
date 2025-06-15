
-- 1. Create system_settings table for storing settings like CEO email, report timings, etc.
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- 2. Policies for system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only developers can view/update settings
CREATE POLICY "Developers can view settings"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  );

CREATE POLICY "Developers can update settings"
  ON public.system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  );

CREATE POLICY "Developers can insert settings"
  ON public.system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'developer'
    )
  );

-- 3. Schedule daily job (example: 4am UTC) to invoke the new edge function
-- (actual scheduling will use pg_cron syntax, which should be run after the function is created)

-- 4. Add a sample CEO email setting for easier testing
INSERT INTO public.system_settings (key, value, updated_by)
VALUES ('ceo_email', 'olushola.abiodun@gmail.com', (SELECT id FROM profiles WHERE role = 'developer' LIMIT 1))
ON CONFLICT (key) DO NOTHING;
