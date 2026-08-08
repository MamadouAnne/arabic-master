-- Maintain like_count on discussion_threads and discussion_replies automatically
-- from rows in discussion_likes.
--
-- Why this is needed: the client used to bump discussion_threads.like_count with a
-- direct UPDATE, but the "Users can update own threads" RLS policy only lets the
-- thread author update the row. Liking someone else's thread therefore matched 0
-- rows and the count never persisted. A SECURITY DEFINER trigger runs as the
-- function owner and bypasses RLS, so it works regardless of who likes.

CREATE OR REPLACE FUNCTION update_discussion_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE discussion_threads SET like_count = like_count + 1 WHERE id = NEW.thread_id;
    ELSIF NEW.reply_id IS NOT NULL THEN
      UPDATE discussion_replies SET like_count = like_count + 1 WHERE id = NEW.reply_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      UPDATE discussion_threads SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.thread_id;
    ELSIF OLD.reply_id IS NOT NULL THEN
      UPDATE discussion_replies SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.reply_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_discussion_like_count ON discussion_likes;
CREATE TRIGGER trg_discussion_like_count
AFTER INSERT OR DELETE ON discussion_likes
FOR EACH ROW EXECUTE FUNCTION update_discussion_like_count();

-- Optional: reconcile any counts that drifted while the direct-UPDATE path was
-- failing, so existing threads/replies show the correct totals immediately.
UPDATE discussion_threads t
SET like_count = COALESCE(c.cnt, 0)
FROM (
  SELECT thread_id, COUNT(*) AS cnt
  FROM discussion_likes
  WHERE thread_id IS NOT NULL
  GROUP BY thread_id
) c
WHERE t.id = c.thread_id;

UPDATE discussion_threads t
SET like_count = 0
WHERE NOT EXISTS (
  SELECT 1 FROM discussion_likes l WHERE l.thread_id = t.id
);

UPDATE discussion_replies r
SET like_count = COALESCE(c.cnt, 0)
FROM (
  SELECT reply_id, COUNT(*) AS cnt
  FROM discussion_likes
  WHERE reply_id IS NOT NULL
  GROUP BY reply_id
) c
WHERE r.id = c.reply_id;

UPDATE discussion_replies r
SET like_count = 0
WHERE NOT EXISTS (
  SELECT 1 FROM discussion_likes l WHERE l.reply_id = r.id
);
