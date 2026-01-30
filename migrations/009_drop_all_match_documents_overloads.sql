-- Migration: Drop ALL match_documents overloads and recreate single canonical function
-- Issue: PGRST203 - PostgREST cannot choose between multiple overloaded functions
-- Date: 2026-01-29
-- Debug Session: .planning/debug/supabase-function-type-mismatch.md
--
-- Background:
--   Migration 008 fixed the UUID return type but didn't drop the 4-parameter
--   match_threshold version. This migration drops ALL existing overloads and
--   creates a single canonical function that LangChain/SupabaseVectorStore expects.

-- ============================================================================
-- STEP 1: Drop ALL possible match_documents function overloads
-- ============================================================================

-- 3-parameter versions (the one we just created + any dimension variants)
DROP FUNCTION IF EXISTS match_documents(vector, int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(768), int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(1536), int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(3072), int, jsonb);

-- 4-parameter versions WITH match_threshold (the old version causing PGRST203)
DROP FUNCTION IF EXISTS match_documents(vector, double precision, int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(768), double precision, int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(1536), double precision, int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(3072), double precision, int, jsonb);

-- Alternative parameter orderings that might exist
DROP FUNCTION IF EXISTS match_documents(vector, int, double precision, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(3072), int, double precision, jsonb);

-- Versions without filter parameter
DROP FUNCTION IF EXISTS match_documents(vector, int);
DROP FUNCTION IF EXISTS match_documents(vector(768), int);
DROP FUNCTION IF EXISTS match_documents(vector(3072), int);
DROP FUNCTION IF EXISTS match_documents(vector, double precision, int);
DROP FUNCTION IF EXISTS match_documents(vector(3072), double precision, int);

-- ============================================================================
-- STEP 2: Verify all overloads are dropped
-- ============================================================================

DO $$
DECLARE
  overload_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO overload_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = 'match_documents'
    AND n.nspname = 'public';
  
  IF overload_count > 0 THEN
    RAISE NOTICE 'WARNING: % match_documents overload(s) still exist. Listing them:', overload_count;
    -- This will show what's left so we can add DROP statements
  ELSE
    RAISE NOTICE 'SUCCESS: All match_documents overloads dropped';
  END IF;
END $$;

-- List any remaining overloads (for debugging)
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents'
  AND n.nspname = 'public';

-- ============================================================================
-- STEP 3: Create the SINGLE canonical match_documents function
-- ============================================================================

-- This is the ONLY version that should exist
-- Matches what LangChain SupabaseVectorStore expects

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(3072),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id uuid,                    -- Matches knowledge_base.id type
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
    -- Handle user_id filter: check direct column
    (
      filter->>'user_id' IS NULL 
      OR knowledge_base.user_id::text = filter->>'user_id'
    )
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- STEP 4: Verify exactly ONE function exists now
-- ============================================================================

DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = 'match_documents'
    AND n.nspname = 'public';
  
  IF func_count = 1 THEN
    RAISE NOTICE 'SUCCESS: Exactly 1 match_documents function exists (no ambiguity)';
  ELSIF func_count = 0 THEN
    RAISE EXCEPTION 'FAILED: match_documents function was not created';
  ELSE
    RAISE EXCEPTION 'FAILED: % match_documents functions exist (should be 1)', func_count;
  END IF;
END $$;

-- Show final function signature
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents'
  AND n.nspname = 'public';

-- Add documentation
COMMENT ON FUNCTION match_documents(vector(3072), int, jsonb) IS 
'Vector similarity search for knowledge_base table.
Used by n8n Memory Retrieval workflow via LangChain SupabaseVectorStore.
- Embedding model: gemini-embedding-001 (3072 dimensions)
- Filters by user_id column
- Returns UUID for id column
- SINGLE CANONICAL VERSION (no overloads)
Last updated: 2026-01-29';
