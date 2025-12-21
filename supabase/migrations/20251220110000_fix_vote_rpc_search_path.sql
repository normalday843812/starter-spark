-- Fix vote RPC functions that have broken search_path
-- The previous migration set search_path = '' which prevents finding tables
-- Change to search_path = 'public' so the functions can actually work

-- Fix update_post_upvotes
CREATE OR REPLACE FUNCTION update_post_upvotes(p_post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.posts
  SET upvotes = COALESCE((
    SELECT SUM(vote_type)::integer
    FROM public.post_votes
    WHERE post_id = p_post_id
  ), 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix update_comment_upvotes
CREATE OR REPLACE FUNCTION update_comment_upvotes(p_comment_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.comments
  SET upvotes = COALESCE((
    SELECT SUM(vote_type)::integer
    FROM public.comment_votes
    WHERE comment_id = p_comment_id
  ), 0)
  WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION update_post_upvotes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_comment_upvotes(uuid) TO authenticated;

-- Also ensure the tables are fully qualified in case search_path ever changes
COMMENT ON FUNCTION update_post_upvotes IS 'Recalculates upvotes for a post from post_votes table';
COMMENT ON FUNCTION update_comment_upvotes IS 'Recalculates upvotes for a comment from comment_votes table';
