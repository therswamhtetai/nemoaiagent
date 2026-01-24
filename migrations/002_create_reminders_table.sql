-- Reminders Table for NemoAI
-- Run this in Supabase SQL Editor

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,  -- Optional link to task
  title VARCHAR(255) NOT NULL,
  description TEXT,
  remind_at TIMESTAMPTZ NOT NULL,
  channel VARCHAR(50) DEFAULT 'ntfy',
  is_sent BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient cron queries (pending reminders)
CREATE INDEX IF NOT EXISTS idx_reminders_pending
  ON reminders(remind_at, is_sent, is_cancelled)
  WHERE is_sent = false AND is_cancelled = false;

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- For API access (anon key with user_id filter)
CREATE POLICY "API access with user_id" ON reminders
  FOR ALL USING (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_reminders_updated_at ON reminders;
CREATE TRIGGER trigger_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_reminders_updated_at();
