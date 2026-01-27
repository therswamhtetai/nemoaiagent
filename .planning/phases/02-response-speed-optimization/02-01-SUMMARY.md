---
phase: 02-response-speed-optimization
plan: 01
subsystem: workflows
tags: [n8n, optimization, context-window, expression-fix]

requires:
  - phase: 01-daily-briefing-v2
    provides: working Web API Router baseline

provides:
  - reduced context window (6 turns)
  - fixed expression syntax in Save to Long-term Memory
  - validated sequential workflow flow

affects: [web-api-router, chat-response-time, user-experience]

tech-stack:
  added: []
  patterns: [sequential-io]

key-files:
  created:
    - workflows/web-api-router-backup.json
  modified:
    - workflows/web-api-router.json

key-decisions:
  - "Reverted async pattern - incompatible with frontend architecture"
  - "Frontend reads messages from Supabase, not webhook response"
  - "Context window set to 6 (balance between quality and speed)"
  - "Sequential DB saves required for frontend compatibility"

patterns-established:
  - "Frontend-aware optimization: understand data flow before optimizing"

duration: 15min
completed: 2026-01-28
---

# Phase 02 Plan 01: Response Speed Optimization Summary

**Context window reduced to 6 turns; async pattern reverted due to frontend architecture constraints**

## Performance

- **Duration:** 15 min (including debugging and fix iteration)
- **Completed:** 2026-01-28
- **Tasks:** 6 (original 5 + fix iteration)
- **Files modified:** 1

## Final Accomplishments

- ✓ Reduced context window from 10 to 6 turns for faster token processing
- ✓ Fixed Save to Long-term Memory expression: `.item.json` → `.first().json`
- ✓ Verified complete sequential flow integrity
- ✗ Async I/O pattern reverted (incompatible with frontend)
- ✗ Pre-classification removed (requires DB save before response)

## Task Commits

1. **Initial optimization attempt** - `1a75d25` (async I/O + pre-classification)
2. **Fix iteration** - `8d6614c` (reverted async, fixed expressions, restored sequential flow)

## Files Modified

- `workflows/web-api-router.json` - Optimized workflow with context window = 6
- `workflows/web-api-router-backup.json` - Backup of original workflow

## Decisions Made

1. **Reverted async pattern** - Frontend reads AI messages from Supabase, not webhook response. Async saves caused messages to not appear in chat (race condition).

2. **Removed pre-classification** - Fast path would require saving to Supabase before responding, adding complexity without significant benefit.

3. **Context window = 6** - Reduced from 10 to balance conversation quality with processing speed. This is the only safe optimization that doesn't affect data flow.

4. **Fixed expression syntax** - Save to Long-term Memory used `.item.json` which is incorrect n8n syntax. Changed to `.first().json`.

## Deviations from Plan

### Major Architectural Discovery

**[Rule 4 - Architecture] Frontend reads from Supabase, not webhook**

- **Found during:** User testing after initial deployment
- **Issue:** Async "Save AI Msg" pattern caused race condition - webhook responded before message was saved to Supabase, so frontend couldn't display the message
- **Root cause:** Misunderstanding of frontend architecture. Frontend uses Supabase for message display, webhook only triggers skeleton loader dismissal
- **Resolution:** Reverted to sequential flow: `Clean Response → Save AI Msg → Respond to Webhook`
- **Impact:** Async optimization not possible with current frontend architecture

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed expression syntax in Save to Long-term Memory**
- **Issue:** Used `.item.json` instead of `.first().json`
- **Fix:** Changed to correct n8n expression syntax
- **Committed in:** 8d6614c

**2. [Rule 3 - Blocking] Broken workflow connections**
- **Issue:** Pre-Classification node broke the flow after Merge User
- **Fix:** Restored original connection: `Merge User → Get Thread Name`
- **Committed in:** 8d6614c

---

**Total deviations:** 1 architectural discovery, 2 bug fixes
**Impact on plan:** Async optimization reverted. Only context window optimization retained.

## Issues Encountered

1. **Async pattern incompatible with frontend** - Discovered during user testing
2. **Broken workflow flow** - Pre-Classification node disconnected main flow
3. **JSON response in chat** - Simple Response output format was wrong
4. **Expression syntax error** - `.item.json` incorrect for n8n

All issues resolved by reverting to backup and applying only safe optimizations.

## Verified Flow

```
Webhook → Merge User → Get Thread Name → Find Name Logic → Save User Msg → Jarvis Brain → Clean Response → Save AI Msg → Respond to Webhook
```

## Optimization Retained

| Optimization | Status | Impact |
|-------------|--------|--------|
| Context window 10→6 | ✓ Applied | Reduces token processing time |
| Async Save User Msg | ✗ Reverted | Incompatible with frontend |
| Async Save AI Msg | ✗ Reverted | Incompatible with frontend |
| Pre-classification | ✗ Removed | Requires DB save for frontend |

## Lessons Learned

1. **Understand frontend architecture first** - The async optimization assumed webhook response displays in chat, but frontend actually reads from Supabase
2. **Test with real frontend** - JSON validation alone doesn't catch data flow issues
3. **Keep backups** - `web-api-router-backup.json` saved the day

## Next Phase Readiness

- Workflow deployed and verified working
- Context window optimization active
- For further speed improvements, consider:
  - LLM model optimization (faster model)
  - Caching common queries at n8n level
  - Frontend-side optimizations (optimistic UI)

---
*Phase: 02-response-speed-optimization*
*Completed: 2026-01-28*
