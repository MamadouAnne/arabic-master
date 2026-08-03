-- ============================================================
-- Group Chat Comprehensive Overhaul Migration
-- Adds: replies, @mentions, edit/delete, images, shared content,
--        read tracking (unread + seen-by).
-- Typing + online presence use Realtime presence/broadcast (no tables).
-- ============================================================

-- 1. Extend group_messages ---------------------------------------
ALTER TABLE group_messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES group_messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS edited_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_deleted  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url   TEXT,
  ADD COLUMN IF NOT EXISTS image_w     INT,
  ADD COLUMN IF NOT EXISTS image_h     INT,
  ADD COLUMN IF NOT EXISTS mentions    UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shared_content JSONB,
  ADD COLUMN IF NOT EXISTS waveform    REAL[];  -- normalized 0..1 amplitude samples for voice notes

-- Expand type constraint to include image + shared
ALTER TABLE group_messages DROP CONSTRAINT IF EXISTS group_messages_type_check;
ALTER TABLE group_messages ADD CONSTRAINT group_messages_type_check
  CHECK (type IN ('chat', 'system', 'milestone', 'voice', 'image', 'shared'));

CREATE INDEX IF NOT EXISTS idx_group_messages_reply ON group_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Allow authors to edit / soft-delete their own messages.
-- (An earlier migration created group_messages without UPDATE/DELETE policies.)
DROP POLICY IF EXISTS "Authors can update own messages" ON group_messages;
CREATE POLICY "Authors can update own messages" ON group_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Read tracking: group_reads ----------------------------------
CREATE TABLE IF NOT EXISTS group_reads (
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_reads_group ON group_reads(group_id);

ALTER TABLE group_reads ENABLE ROW LEVEL SECURITY;

-- Anyone in the group can read the markers (needed for "seen by")
DROP POLICY IF EXISTS "Anyone can read group reads" ON group_reads;
CREATE POLICY "Anyone can read group reads" ON group_reads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can upsert own read marker" ON group_reads;
CREATE POLICY "Users can upsert own read marker" ON group_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own read marker" ON group_reads;
CREATE POLICY "Users can update own read marker" ON group_reads
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Storage bucket for chat images ------------------------------
-- Public bucket, mirrors the existing 'voice-notes' bucket setup.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read chat images" ON storage.objects;
CREATE POLICY "Anyone can read chat images" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-images');

DROP POLICY IF EXISTS "Auth users can upload chat images" ON storage.objects;
CREATE POLICY "Auth users can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');
