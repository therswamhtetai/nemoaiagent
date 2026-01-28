---
status: resolved
trigger: "supabase-function-type-mismatch - Memory Retrieval workflow fails with 'Returned type bigint does not match expected type uuid in column 1'"
created: 2026-01-29T09:00:00Z
updated: 2026-01-29T10:15:00Z
resolved: 2026-01-29T10:15:00Z
---

## Current Focus

hypothesis: PostgREST is caching old function definition with bigint return type
test: Migration 009 succeeded (1 function exists), but original bigint error returned
expecting: PostgREST schema reload will fix the mismatch
next_action: Run diagnostic SQL queries to verify function definition, then reload PostgREST schema

## Symptoms

expected: Memory Retrieval workflow (volKVoT9R96UigzM) retrieves relevant context from knowledge_base using vector similarity search
actual: Error 42804 - "structure of query does not match function result type. Returned type bigint does not match expected type uuid in column 1"
errors:
  - PostgreSQL error code 42804 (datatype_mismatch)
  - SupabaseVectorStore._searchSupabase throws error
  - Stack trace shows @langchain/community/src/vectorstores/supabase.ts:310
reproduction: Ask the AI assistant about past conversations (triggers memory retrieval)
started: After updates made yesterday (related to embedding dimension mismatch fix)

## Eliminated

(none)

## Evidence

- timestamp: 2026-01-29T09:01:00Z
  checked: Previous debug session embedding-dimension-mismatch-resolved.md
  found: |
    Yesterday's fix:
    1. Changed embedding column from VECTOR(768) to VECTOR(3072)
    2. Updated workflows to use gemini-embedding-001 model
    3. Migration file 007_update_embedding_dimensions.sql was created
    4. Migration mentions "match_documents function" but only adds a comment
  implication: The match function itself was not updated, may have wrong return types

- timestamp: 2026-01-29T09:05:00Z
  checked: Memory Retrieval workflow (volKVoT9R96UigzM)
  found: |
    Uses vectorStoreSupabase node with:
    - tableName: knowledge_base
    - queryName: match_documents
    - Filters by user_id in metadata
  implication: Workflow calls match_documents RPC, which must return (id UUID, content TEXT, metadata JSONB, similarity FLOAT)

- timestamp: 2026-01-29T09:07:00Z
  checked: All migration files in /migrations/*.sql
  found: |
    No match_documents function definition exists in any migration file.
    All table definitions use UUID for primary keys (users, documents, reminders, notifications).
    CLAUDE.md documents knowledge_base.id as UUID PRIMARY KEY.
  implication: match_documents function was likely created outside migrations, possibly with default bigint type from older docs

- timestamp: 2026-01-29T09:09:00Z
  checked: Web research on LangChain Supabase vector store error 42804
  found: |
    This is a known issue when match_documents function uses "RETURNS TABLE (id bigint, ...)"
    but the actual table uses UUID for the id column.
    
    Supabase's older documentation used bigint for IDs, but LangChain and modern setups use UUID.
    The function MUST return the same types as the actual table columns.
  implication: CONFIRMED ROOT CAUSE - match_documents function needs to be recreated with "id uuid" return type

- timestamp: 2026-01-29T09:20:00Z
  checked: User ran migration 008, reported new error
  found: |
    UUID error is FIXED, but NEW error appeared:
    PGRST203: Could not choose the best candidate function between:
    - public.match_documents(query_embedding => public.vector, match_count => integer, filter => jsonb)
    - public.match_documents(query_embedding => public.vector, match_threshold => double precision, match_count => integer, filter => jsonb)
    
    There are TWO overloaded versions of match_documents in the database:
    1. The new 3-param version we just created (vector, int, jsonb)
    2. An OLD 4-param version with match_threshold (vector, double precision, int, jsonb)
  implication: |
    Migration 008 only dropped 3-param signatures but NOT the 4-param match_threshold version.
    PostgREST can't determine which overload to call when LangChain invokes the RPC.
    Must drop ALL overloads before creating the canonical function.

- timestamp: 2026-01-29T09:30:00Z
  checked: User ran migration 009 (drop all overloads + recreate)
  found: |
    Migration 009 SUCCEEDED:
    - Saw "SUCCESS: Exactly 1 match_documents function exists"
    - Query showed only 1 function in public schema
    
    BUT the ORIGINAL error RETURNED:
    Error 42804: structure of query does not match function result type
    "Returned type bigint does not match expected type uuid in column 1"
    
    This is paradoxical - the function is defined with UUID but error says bigint.
  implication: |
    Possible causes:
    1. PostgREST schema cache not refreshed (most likely)
    2. Function exists in a DIFFERENT schema (extensions, vector, etc.)
    3. knowledge_base.id column is actually bigint (verify)
    4. n8n workflow calling different function name
    5. Supabase API endpoint returning stale data

## Resolution

root_cause: |
  CONFIRMED: The knowledge_base.id column is actually BIGINT (not UUID as documented in CLAUDE.md).
  
  The match_documents function was created with `RETURNS TABLE (id uuid, ...)` 
  but the actual table column is bigint. PostgreSQL error 42804 occurs when 
  the function's declared return type doesn't match the actual column type.
  
  Timeline of fixes:
  1. Migration 008: Fixed uuid return type (worked but revealed function overload issue)
  2. Migration 009: Dropped all overloads (PGRST203 fixed, but bigint error returned)
  3. Diagnostic query confirmed: knowledge_base.id is BIGINT (column_name: id, data_type: bigint, udt_name: int8)
  4. Final fix: Changed function return type from `id uuid` to `id bigint`

fix: |
  Final SQL executed in Supabase SQL Editor:
  
  ```sql
  DROP FUNCTION IF EXISTS match_documents(vector(3072), int, jsonb);
  
  CREATE OR REPLACE FUNCTION match_documents (
    query_embedding vector(3072),
    match_count int DEFAULT null,
    filter jsonb DEFAULT '{}'
  )
  RETURNS TABLE (
    id bigint,    -- FIXED: Changed from uuid to bigint to match actual table
    content text,
    metadata jsonb,
    embedding jsonb,
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
      (
        filter->>'user_id' IS NULL 
        OR knowledge_base.user_id::text = filter->>'user_id'
      )
    ORDER BY knowledge_base.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$;
  ```

verification: PASSED - Memory Retrieval workflow now works correctly
files_changed:
  - CLAUDE.md (updated knowledge_base schema: id UUID -> id BIGINT)
