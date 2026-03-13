CREATE TABLE IF NOT EXISTS wrapped_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period, start_date)
);
ALTER TABLE wrapped_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wrapped reports" ON wrapped_reports
  FOR ALL USING (auth.uid() = user_id);
