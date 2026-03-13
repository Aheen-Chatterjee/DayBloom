-- Add requires_proof flag to habits (default true = all existing habits keep proof requirement)
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS requires_proof BOOLEAN NOT NULL DEFAULT true;
