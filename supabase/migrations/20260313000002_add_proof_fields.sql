-- Add proof fields to habit_completions
ALTER TABLE habit_completions
  ADD COLUMN IF NOT EXISTS proof_image_url TEXT,
  ADD COLUMN IF NOT EXISTS proof_verdict   TEXT;

-- Create private Storage bucket for proof images
INSERT INTO storage.buckets (id, name, public)
VALUES ('habit-proof', 'habit-proof', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can manage only files under their own user_id prefix
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users own their proof files'
  ) THEN
    CREATE POLICY "Users own their proof files"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id = 'habit-proof'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'habit-proof'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END;
$$;
