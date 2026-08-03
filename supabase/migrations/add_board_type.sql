-- ============================================================
-- Board (drawing canvas) content type
-- Boards are stored in group_messages.class_content (added by
-- add_class_content.sql); this only widens the type constraint.
-- ============================================================

ALTER TABLE group_messages DROP CONSTRAINT IF EXISTS group_messages_type_check;
ALTER TABLE group_messages ADD CONSTRAINT group_messages_type_check
  CHECK (type IN ('chat', 'system', 'milestone', 'voice', 'image', 'shared', 'lesson', 'quiz', 'poll', 'board'));
