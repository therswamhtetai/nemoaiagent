---
status: resolved
trigger: "embedding-dimension-mismatch - Supabase error 'expected 768 dimensions, not 3072'"
created: 2026-01-28T10:45:00Z
updated: 2026-01-29T10:30:00Z
resolved: 2026-01-29T10:30:00Z
---

## Current Focus

hypothesis: LIVE workflow uses `gemini-embedding-001` (3072d) instead of `embedding-001` (768d)
test: Compare local export vs live n8n API response for embedding model URL
expecting: Mismatch in model names between local/live
next_action: Document root cause and propose fix

## Symptoms

expected: Memory save/retrieval workflows store embeddings and retrieve context successfully
actual: Error 400 from Supabase: "expected 768 dimensions, not 3072"
errors:
  - NodeApiError at Supabase "Create a row" node
  - HTTP 400: {"code":"22000","message":"expected 768 dimensions, not 3072"}
reproduction: Use chat and trigger memory save (happens on each chat message)
started: After switching embedding model

## Eliminated

(none - first hypothesis was correct)

## Evidence

- timestamp: 2026-01-28T10:46:00Z
  checked: Local workflow export (nemo-save-to-memory-tool_wNgClCaTC4qSw4er.json)
  found: |
    URL: https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent
    Model: models/embedding-001
    Last updated: 2026-01-10T18:29:06.182Z
  implication: Local export uses embedding-001 (768 dimensions)

- timestamp: 2026-01-28T10:48:00Z
  checked: LIVE workflow via n8n API (GET /api/v1/workflows/wNgClCaTC4qSw4er)
  found: |
    URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent
    Model in body: models/gemini-embedding-001
    Last updated: 2026-01-28T03:20:21.662Z
    Active version: c147cd2e-1997-4247-adac-2c3806caeb2d (published 2026-01-28T02:47:29Z)
  implication: LIVE workflow uses gemini-embedding-001 (3072 dimensions)

- timestamp: 2026-01-28T10:49:00Z
  checked: Database schema in CLAUDE.md
  found: |
    knowledge_base.embedding is VECTOR(768)
  implication: Database expects 768 dimensions, cannot accept 3072

- timestamp: 2026-01-28T10:50:00Z
  checked: Memory Retrieval workflow (local export)
  found: |
    Uses embeddingsGoogleGemini node with modelName: "models/embedding-001"
  implication: Retrieval workflow still uses 768d model - would fail if DB had 3072d vectors

## Resolution

root_cause: |
  CONFIRMED: The LIVE Save to Memory workflow (wNgClCaTC4qSw4er) was modified on 2026-01-28T02:47:29Z
  to use `gemini-embedding-001` model instead of `embedding-001`.
  
  - `embedding-001` produces 768-dimensional vectors (what DB expects)
  - `gemini-embedding-001` produces 3072-dimensional vectors (what's being sent)
  
  The local export is STALE (from 2026-01-10), while the live workflow was updated 
  today (2026-01-28) with the wrong model name.
  
  Key discrepancy:
  - LOCAL: models/embedding-001 (768d) - CORRECT
  - LIVE:  models/gemini-embedding-001 (3072d) - WRONG

fix: |
  Option A (Recommended): Update LIVE workflow to use `embedding-001` instead of `gemini-embedding-001`
  - Change URL from: models/gemini-embedding-001:embedContent
  - To: models/embedding-001:embedContent
  - Also update body: "model": "models/embedding-001"
  
  Option B (Not recommended): Alter Supabase DB column to VECTOR(3072)
  - Would require clearing existing 768d embeddings
  - Would break Memory Retrieval workflow which uses embedding-001

verification: PASSED - Resolved during GSD session 2026-01-28. DB schema updated to VECTOR(3072) and workflows updated to use gemini-embedding-001 consistently.
files_changed:
  - n8n workflows: wNgClCaTC4qSw4er (Save to Memory), volKVoT9R96UigzM (Memory Retrieval)
  - migrations/007_update_embedding_dimensions.sql
  - CLAUDE.md (knowledge_base.embedding updated to VECTOR(3072))
