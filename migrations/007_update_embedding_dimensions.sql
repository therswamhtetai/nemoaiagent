-- Migration: Update embedding dimensions from 768 to 3072
-- Reason: Google deprecated embedding-001 (768d), only gemini-embedding-001 (3072d) works now
-- Date: 2026-01-28

-- Step 1: Alter the knowledge_base.embedding column to use 3072 dimensions
-- Note: This requires pgvector extension to be installed

-- Check if the column exists and alter it
DO $$
BEGIN
    -- Alter the embedding column type from VECTOR(768) to VECTOR(3072)
    ALTER TABLE knowledge_base ALTER COLUMN embedding TYPE VECTOR(3072);
    
    RAISE NOTICE 'Successfully updated embedding column to VECTOR(3072)';
EXCEPTION
    WHEN undefined_column THEN
        -- If embedding column doesn't exist, create it
        ALTER TABLE knowledge_base ADD COLUMN embedding VECTOR(3072);
        RAISE NOTICE 'Created new embedding column with VECTOR(3072)';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to alter embedding column: %', SQLERRM;
END $$;

-- Step 2: Update match_documents function if it exists to use the new dimensions
-- The function should work regardless of dimensions, but we update the comment

COMMENT ON COLUMN knowledge_base.embedding IS 'Vector embedding using gemini-embedding-001 model (3072 dimensions)';
