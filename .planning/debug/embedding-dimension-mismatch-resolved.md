# Debug Session: Embedding Dimension Mismatch
**Status:** RESOLVED
**Date:** 2026-01-28

## Issue
Supabase error: "expected 768 dimensions, not 3072" when Save to Memory Tool runs

## Root Cause Discovery
1. Initial diagnosis: LIVE workflow used `gemini-embedding-001` (3072d) while DB expected 768d
2. Attempted fix: Reverted to `embedding-001` - **FAILED** (404 - model deprecated)
3. User clarified: `text-embedding-004` also returns 404 - not available in their API
4. Only working model: `gemini-embedding-001` (produces 3072 dimensions)

## Final Solution
Since only `gemini-embedding-001` works and it produces 3072 dimensions:

1. **Alter database schema** to accept 3072 dimensions
2. **Update both workflows** to use `gemini-embedding-001` consistently

## Changes Applied

### Database (User must run in Supabase SQL Editor)
```sql
ALTER TABLE knowledge_base ALTER COLUMN embedding TYPE VECTOR(3072);
```

Migration file created: `migrations/007_update_embedding_dimensions.sql`

### n8n Workflows
1. **Save to Memory Tool** (`wNgClCaTC4qSw4er`)
   - URL: `models/gemini-embedding-001:embedContent`
   - Model body: `models/gemini-embedding-001`
   
2. **Memory Retrieval Tool** (`volKVoT9R96UigzM`)
   - modelName: `models/gemini-embedding-001`

### Local Exports Updated
- `workflows/exports/nemo-save-to-memory-tool_wNgClCaTC4qSw4er.json`
- `workflows/exports/nemo-memory-retrieval-tool_volKVoT9R96UigzM.json`

### Documentation Updated
- `CLAUDE.md`: Changed `VECTOR(768)` to `VECTOR(3072)`
- `WORKFLOW_STRUCTURE.md`: Changed model reference to `gemini-embedding-001 (3072 dimensions)`

## Action Required
User must run the database migration in Supabase SQL Editor:
```sql
ALTER TABLE knowledge_base ALTER COLUMN embedding TYPE VECTOR(3072);
```

## Model Compatibility Summary
| Model | Status | Dimensions |
|-------|--------|------------|
| `embedding-001` | 404 (deprecated) | 768 |
| `text-embedding-004` | 404 (not available) | 768 |
| `gemini-embedding-001` | Works | 3072 |
