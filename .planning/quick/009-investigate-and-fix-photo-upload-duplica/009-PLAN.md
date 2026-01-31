---
phase: quick-009
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/page.tsx
autonomous: true

must_haves:
  truths:
    - "Uploading a single photo shows exactly one user message and one assistant reply"
    - "Photo uploads no longer create duplicate assistant entries when real-time updates arrive"
    - "Attachment metadata (filename, URL) persists once without multiple inserts"
  artifacts:
    - path: "app/page.tsx"
      provides: "Upload flow with temp-prefixed placeholders and deduped assistant handling"
      contains: "submitFileUpload"
  key_links:
    - from: "submitFileUpload loading/skeleton message"
      to: "SubscribeToConversations dedupe filter"
      via: "id.startsWith(\"temp-\") pattern"
      pattern: "temp-upload|temp-assistant"
---

<objective>
Stop duplicate photo upload messages by aligning the upload placeholder IDs with the existing temp-prefixed deduplication so real-time inserts do not render twice.

Purpose: Users currently see duplicated messages when uploading images/photos because the upload flow uses non-temp IDs that bypass the real-time filter.
Output: Single, clean user+assistant message per photo upload with consistent attachment metadata.
</objective>

<execution_context>
@/Users/MSIModern14/.claude/get-shit-done/workflows/execute-plan.md
@/Users/MSIModern14/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@app/page.tsx (submitFileUpload around lines 1580-1835; real-time subscription around lines 960-1025)
</context>

<root_cause>
Photo uploads add a loading message with `loading-${Date.now()}` (not temp-prefixed). The webhook response mutates that placeholder to `msg-${Date.now()}` while the Supabase real-time insert later adds the persisted assistant row. Because the real-time filter only drops `temp-` IDs, both the locally-mutated message and the database message remain, producing duplicates.
</root_cause>

<tasks>

<task type="auto">
  <name>Task 1: Align upload placeholders with temp-prefixed dedupe</name>
  <files>app/page.tsx</files>
  <action>
  In `submitFileUpload`, change the upload assistant placeholder to use a `temp-` prefixed ID (e.g., `temp-upload-${Date.now()}`) and keep that prefix when updating its content so it is removable by the real-time filter. Ensure the user attachment message already using `temp-upload-` remains unchanged. Avoid introducing new state keys.
  </action>
  <verify>
  1) Upload a single image. 2) Confirm `console.log('[v0] Real-time: New message received', ...)` fires once for assistant. 3) UI shows one assistant message; no lingering placeholders.
  </verify>
  <done>Upload assistant placeholder uses temp-prefix and disappears when real-time assistant row arrives.</done>
</task>

<task type="auto">
  <name>Task 2: Guard against duplicate assistant insertion on upload</name>
  <files>app/page.tsx</files>
  <action>
  Update the upload flow so when real-time delivers the persisted assistant message, it replaces/removes any temp upload placeholder instead of appending a second message. Options: keep the temp ID and let the existing `id.startsWith("temp-")` filter drop it, or add an explicit check that prevents adding an assistant message if a non-temp upload response already exists for that thread/attachment. Ensure the replacement retains attachment metadata and timestamps from the persisted row.
  </action>
  <verify>
  1) Upload the same photo once; observe only one assistant message after real-time sync. 2) Inspect conversations table (latest rows) to confirm a single assistant insert for the upload. 3) Refresh page; messages stay singular.
  </verify>
  <done>Real-time assistant message replaces the placeholder without creating duplicates; persistence matches UI.</done>
</task>

</tasks>

<verification>
Upload one photo and one document: each flow shows exactly one user entry and one assistant reply both before and after refresh; console shows a single real-time assistant insert; conversations table reflects single rows for each role per upload.
</verification>

<success_criteria>
- Photo upload shows one user message and one assistant reply (no duplicates) in UI and DB
- Temp-prefixed upload placeholders are removed when real-time rows arrive
- Attachment metadata (filename/url/mime) is preserved in the final assistant message
</success_criteria>

<output>
After completion, create `.planning/quick/009-investigate-and-fix-photo-upload-duplica/009-SUMMARY.md`
</output>
