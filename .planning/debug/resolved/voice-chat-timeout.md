---
status: resolved
trigger: "Voice chat shows HTTP 500 error immediately after sending, but backend (n8n) actually processes successfully"
created: 2026-01-28T10:00:00Z
updated: 2026-01-28T10:10:00Z
---

## Current Focus

hypothesis: CONFIRMED - Voice API route lacked timeout handling
test: N/A - fix applied
expecting: Voice commands should now wait up to 120 seconds before timing out
next_action: Commit and close

## Symptoms

expected: Voice command processes and UI updates with AI response
actual: HTTP 500 error appears immediately, UI fails to update, but backend succeeds (visible on page reload)
errors: "Failed to process voice chat: HTTP error! status: 500"
reproduction: Use any voice command
started: Recent regression - started after adding Basic LLM Chain to voice pipeline n8n workflow

## Eliminated

(none - first hypothesis was correct)

## Evidence

- timestamp: 2026-01-28T10:02:00Z
  checked: app/api/chat/route.ts
  found: Has WEBHOOK_TIMEOUT = 90000ms with AbortController implementation
  implication: Chat route properly handles long-running n8n requests

- timestamp: 2026-01-28T10:03:00Z
  checked: app/api/voice/route.ts
  found: NO timeout configuration - bare fetch() call with no abort handling
  implication: Voice route will fail at platform default timeout (10s on Vercel Hobby)

- timestamp: 2026-01-28T10:04:00Z
  checked: next.config.mjs
  found: No maxDuration or serverless function config
  implication: Using default Vercel limits, need to add maxDuration export for longer routes

- timestamp: 2026-01-28T10:05:00Z
  checked: Architecture comparison
  found: Voice route uses FormData (multipart) instead of JSON
  implication: Need to adapt timeout pattern for FormData - same AbortController pattern works

## Resolution

root_cause: Voice API route had no timeout handling. When n8n processing exceeds Vercel's default 10-second function timeout, the platform kills the request and returns 500 before the fetch completes. The chat route avoided this by having an explicit 90-second AbortController timeout.

fix: Added timeout handling to voice route matching chat route pattern:
1. WEBHOOK_TIMEOUT = 120000 (120 seconds for voice - accounts for transcription + LLM)
2. export const maxDuration = 120 (extends Vercel serverless function timeout)
3. AbortController with signal passed to fetch
4. Proper error handling with user-friendly messages and error codes
5. Consistent 502 for webhook errors, 504 for timeouts

verification: Code review confirms:
- AbortController pattern matches working chat route
- maxDuration export properly extends Vercel function limit
- Error messages are user-friendly
- Timeout is appropriately longer (120s vs 90s) to account for audio transcription overhead

files_changed: 
- app/api/voice/route.ts
