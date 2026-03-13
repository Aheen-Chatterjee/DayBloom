-- DayBloom Phase 2 Migrations
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- Migration 1: Add mood analysis columns to journal_entries
-- ============================================================
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS primary_sentiment TEXT,
  ADD COLUMN IF NOT EXISTS sentiment_score FLOAT,
  ADD COLUMN IF NOT EXISTS energy_level TEXT,
  ADD COLUMN IF NOT EXISTS key_themes TEXT[],
  ADD COLUMN IF NOT EXISTS one_line_summary TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS analysed_at TIMESTAMPTZ;

-- ============================================================
-- Migration 2: Create wrapped_reports table
-- ============================================================
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
