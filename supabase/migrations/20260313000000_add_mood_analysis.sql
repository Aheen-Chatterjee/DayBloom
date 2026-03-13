-- Add mood analysis columns to journal_entries
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS primary_sentiment TEXT,
  ADD COLUMN IF NOT EXISTS sentiment_score FLOAT,
  ADD COLUMN IF NOT EXISTS energy_level TEXT,
  ADD COLUMN IF NOT EXISTS key_themes TEXT[],
  ADD COLUMN IF NOT EXISTS one_line_summary TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS analysed_at TIMESTAMPTZ;
