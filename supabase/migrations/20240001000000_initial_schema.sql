-- ============================================================
-- DayBloom v1.0 — Initial Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT        NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_demo      BOOLEAN     NOT NULL DEFAULT false
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ------------------------------------------------------------
-- journal_entries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_entries (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entry_date   DATE        NOT NULL,
    title        TEXT,
    body         TEXT        NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date
    ON journal_entries (user_id, entry_date DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal entries"
    ON journal_entries FOR ALL
    USING (user_id = auth.uid());


-- ------------------------------------------------------------
-- habits
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    description TEXT,
    emoticon    TEXT,
    color       TEXT,
    frequency   TEXT        NOT NULL DEFAULT 'daily'
                            CHECK (frequency IN ('daily', 'weekdays', 'custom')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON habits (user_id);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habits"
    ON habits FOR ALL
    USING (user_id = auth.uid());


-- ------------------------------------------------------------
-- habit_completions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_completions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id        UUID        NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    completion_date DATE        NOT NULL,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    note            TEXT,
    CONSTRAINT habit_completion_unique UNIQUE (habit_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date
    ON habit_completions (user_id, completion_date DESC);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date
    ON habit_completions (habit_id, completion_date DESC);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own completions"
    ON habit_completions FOR ALL
    USING (user_id = auth.uid());
