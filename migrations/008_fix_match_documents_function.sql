-- Migration: Fix match_documents function for knowledge_base table
-- Issues Fixed:
--   1. Return type mismatch: Function returned bigint but table uses UUID for id column
--   2. user_id filtering: user_id is stored as a direct column, not in metadata
--   3. Vector dimensions: Updated to 3072 for gemini-embedding-001 model
-- Date: 2026-01-29
-- Debug Session: .planning/debug/supabase-function-type-mismatch.md

-- Drop existing function if it exists (required when changing return types)
DROP FUNCTION IF EXISTS match_documents(vector, int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(768), int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(3072), int, jsonb);

-- Create the corrected match_documents function
-- Key changes:
--   - Returns "id uuid" instead of "id bigint" to match knowledge_base.id type
--   - Uses VECTOR(3072) for gemini-embedding-001 embeddings
--   - Filters by knowledge_base.user_id column (not metadata->>'user_id')
--   - Returns embedding as jsonb (required by LangChain)

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(3072),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id uuid,                    -- FIXED: Changed from bigint to uuid
  content text,
  metadata jsonb,
  embedding jsonb,            -- LangChain expects embedding as jsonb
  similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    id,
    content,
    metadata,
    (embedding::text)::jsonb as embedding,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  FROM knowledge_base
  WHERE 
    -- Handle user_id filter: check both direct column and metadata for compatibility
    (
      filter->>'user_id' IS NULL 
      OR knowledge_base.user_id::text = filter->>'user_id'
    )
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION match_documents(vector(3072), int, jsonb) IS 
'Vector similarity search function for knowledge_base table.
Used by n8n Memory Retrieval workflow via LangChain SupabaseVectorStore.
- Embedding model: gemini-embedding-001 (3072 dimensions)
- Filters by user_id column (not metadata)
- Returns UUID for id column (not bigint)
Last updated: 2026-01-29';

-- Verify function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'match_documents'
  ) THEN
    RAISE NOTICE 'SUCCESS: match_documents function created/updated successfully';
  ELSE
    RAISE EXCEPTION 'FAILED: match_documents function was not created';
  END IF;
END $$;
