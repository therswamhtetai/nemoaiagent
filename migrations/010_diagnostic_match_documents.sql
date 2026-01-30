-- DIAGNOSTIC SCRIPT: Investigate match_documents bigint error after migration 009
-- Date: 2026-01-29
-- Debug Session: .planning/debug/supabase-function-type-mismatch.md
--
-- Run this in Supabase SQL Editor and share ALL output with Claude
-- ============================================================================

-- ============================================================================
-- DIAGNOSTIC 1: Check match_documents in ALL schemas (not just public)
-- ============================================================================
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents'
ORDER BY n.nspname;

-- ============================================================================
-- DIAGNOSTIC 2: Check EXACT return type details of public.match_documents
-- ============================================================================
SELECT 
  p.proname,
  pg_get_function_result(p.oid) as full_return_type,
  p.prorettype::regtype as return_type_oid,
  t.typname as type_name
FROM pg_proc p
JOIN pg_type t ON p.prorettype = t.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents' AND n.nspname = 'public';

-- ============================================================================
-- DIAGNOSTIC 3: Check knowledge_base.id column type
-- ============================================================================
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'knowledge_base' 
  AND column_name = 'id';

-- ============================================================================
-- DIAGNOSTIC 4: Check for similar function names
-- ============================================================================
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%match%' OR p.proname LIKE '%document%'
ORDER BY p.proname;

-- ============================================================================
-- DIAGNOSTIC 5: Get full function definition (source code)
-- ============================================================================
SELECT 
  p.proname,
  pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'match_documents' AND n.nspname = 'public';

-- ============================================================================
-- DIAGNOSTIC 6: Check if there's a VIEW named match_documents
-- ============================================================================
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'match_documents';

-- ============================================================================
-- DIAGNOSTIC 7: Test the function directly (bypassing PostgREST)
-- ============================================================================
-- This tests if PostgreSQL itself works correctly
-- If this returns results, the function is correct in PostgreSQL
-- If this fails with bigint error, the function definition is still wrong

SELECT id, content, similarity 
FROM match_documents(
  (SELECT embedding FROM knowledge_base LIMIT 1),  -- Use existing embedding as test
  5,  -- match_count
  '{}'::jsonb  -- no filter
)
LIMIT 1;

-- If above fails because no data, try this simpler test:
-- SELECT pg_typeof(id) FROM match_documents(
--   (SELECT embedding FROM knowledge_base LIMIT 1),
--   1,
--   '{}'::jsonb
-- );

-- ============================================================================
-- END OF DIAGNOSTICS - COPY ALL OUTPUT AND SHARE WITH CLAUDE
-- ============================================================================
