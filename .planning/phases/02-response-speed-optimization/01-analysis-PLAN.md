---
phase: 02-response-speed-optimization
plan: 01
subsystem: workflows
tags: [n8n, optimization, async]
requires: []
provides: [optimized-router-workflow]
affects: [web-api-router]
tech-stack:
  added: []
  patterns: [async-io, pre-classification]
key-files:
  created: []
  modified: [workflows/web-api-router.json]
metrics:
  target_latency: "3-5s"
---

# Phase 02 Plan 01: Async Architecture & Optimization

## Objective
Refactor the `Web API Router` workflow to implement asynchronous I/O patterns and pre-classification, reducing end-to-end latency.

## Work Breakdown

### Step 1: Implement Async "Save User Msg"
**Goal:** Agent starts thinking immediately, not waiting for DB write.
1.  Locate `Find Name Logic` (or the node preceding `Save User Msg`).
2.  Remove connection: `Find Name Logic` → `Save User Msg` → `Jarvis Brain`.
3.  Add connection: `Find Name Logic` → `Jarvis Brain`.
4.  Add connection: `Find Name Logic` → `Save User Msg` (Parallel Branch).
5.  Ensure `Save User Msg` does *not* connect back to the main flow.

### Step 2: Implement Async "Save AI Msg"
**Goal:** Response sent to user immediately, not waiting for DB write.
1.  Locate `Clean Response`.
2.  Remove connection: `Clean Response` → `Save AI Msg` → `Respond to Webhook`.
3.  Add connection: `Clean Response` → `Respond to Webhook` (Direct).
4.  Add connection: `Clean Response` → `Save AI Msg` (Parallel Branch).
5.  Ensure `Save AI Msg` does *not* connect to `Respond to Webhook`.

### Step 3: Configure Context Window
**Goal:** Reduce token load.
1.  Locate `Simple Memory` node.
2.  Set `contextWindowLength` to `6`.

### Step 4: Implement Pre-Classification (Basic)
**Goal:** Handle "Ping" or "Hi" instantly.
1.  Insert `Switch` node after `Merge User`.
2.  **Rule 1 (Fast Path):** If text matches regex `^(hi|hello|hey|test|ping)$` (case-insensitive):
    *   Route to a new `Respond to Webhook` node with a static/simple LLM response.
3.  **Rule 2 (Default):** All other traffic goes to `Get Thread Name` (Main Flow).

### Step 5: Verification
1.  **Latency Check:** Measure time from Webhook trigger to Response.
2.  **Data Integrity:** Verify that messages are still saved to Supabase (even if async).
3.  **Chat Quality:** Verify context is maintained (Agent still sees history).

## Execution Strategy
- We will modify the local JSON file `workflows/web-api-router.json`.
- Since we cannot "Deploy" to n8n directly via API (failed earlier), the user will need to **Copy-Paste** the JSON back into n8n or we retry the API deployment if keys are fixed.

## Safety
- **Backup:** `workflows/web-api-router-backup.json` will be created before modification.
