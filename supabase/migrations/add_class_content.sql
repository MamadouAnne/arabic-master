-- ============================================================
-- Teacher Class Content Migration
-- Adds lesson / quiz / poll message types authored in group chat,
-- their JSONB payload, and tracked student responses.
-- ============================================================

-- 1. Extend group_messages -------------------------------------
ALTER TABLE group_messages
  ADD COLUMN IF NOT EXISTS class_content JSONB;  -- lesson blocks / quiz questions / poll config

-- Expand type constraint to include the class-content kinds.
ALTER TABLE group_messages DROP CONSTRAINT IF EXISTS group_messages_type_check;
ALTER TABLE group_messages ADD CONSTRAINT group_messages_type_check
  CHECK (type IN ('chat', 'system', 'milestone', 'voice', 'image', 'shared', 'lesson', 'quiz', 'poll'));

-- 2. Tracked responses (quiz answers, poll votes) --------------
CREATE TABLE IF NOT EXISTS class_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES group_messages(id) ON DELETE CASCADE NOT NULL,
  group_id   UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name  TEXT NOT NULL,
  response   JSONB NOT NULL,      -- quiz: {answers:{qId:answer}} · poll: {choices:[idx]}
  is_correct BOOLEAN,             -- quiz only
  score      INT,                 -- quiz only (0..100)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_responses_message ON class_responses(message_id);

ALTER TABLE class_responses ENABLE ROW LEVEL SECURITY;

-- Anyone in the group can read responses (poll tallies + teacher results view).
DROP POLICY IF EXISTS "Anyone can read class responses" ON class_responses;
CREATE POLICY "Anyone can read class responses" ON class_responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can submit own response" ON class_responses;
CREATE POLICY "Users can submit own response" ON class_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own response" ON class_responses;
CREATE POLICY "Users can update own response" ON class_responses
  FOR UPDATE USING (auth.uid() = user_id);
