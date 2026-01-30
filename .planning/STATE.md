# GSD Project State

## Current Status
- **Project**: NemoAI Personal AI Assistant
- **Phase**: 04 - TikTok & Viral Analysis for Social Scout
- **Status**: Phase 04 COMPLETE - All 5 waves delivered
- **Last activity**: 2026-01-30 - Completed quick task 007: Market Analyst card layout fix

Progress: ██████████ 100%

## Project Overview
NemoAI personal AI assistant system - adding multi-platform competitor intelligence with TikTok support and viral content analysis.

## Phase 04: TikTok & Viral Analysis for Social Scout

### Wave Status
- [x] **04-01**: Database Foundation (monitor_ads columns) ✓
- [x] **04-02**: Platform Detection & Routing ✓
- [x] **04-03**: Scrapers (TikTok + FB Posts) ✓
- [x] **04-04**: AI Analysis Updates + Viral Analysis ✓
- [x] **04-05**: Ad Monitoring Cron Workflow ✓

### Scope
- 10 todos from `.planning/todos/pending/`
- 1 existing workflow to modify (Social Scout)
- 1 new workflow to create (Ad Monitor)
- 2 database columns to add

## Previous Phase: Voice Message Flow ✓ COMPLETE

### Key Decisions (Phase 04)

| Phase | Decision | Rationale |
|-------|----------|-----------|
| 04-01 | Combined Tasks 1.1 and 1.2 into single migration | Both tasks modify competitors table - atomic execution reduces complexity |
| 04-01 | Used partial index for monitor_ads column | Most competitors won't be monitored - partial index saves space and improves cron query performance |
| 04-01 | Migrated platform field from category to platform values | Normalized 'Software', 'Restaurant' values to 'facebook'/'tiktok' for multi-platform routing |
| 04-02 | Extended URL pattern detection | Added /share/p/, /share/v/, /share/r/ patterns for Facebook share URLs |
| 04-02 | Two-level routing architecture | Platform Router → FB Post Router enables granular scraper selection |
| 04-04 | Viral Analysis only for TikTok videos | Profile analysis doesn't need deep hook/structure analysis |
| 04-04 | Shared Gemini model across LLM chains | Reduces credential complexity, consistent behavior |
| 04-05 | 30-minute schedule interval | Balanced frequency for timely notifications without excessive API calls |
| 04-05 | Change detection logic (false → true only) | Notify only when competitors START running ads to prevent spam |
| 04-05 | Manual activation required | n8n API limitation - active field is read-only |

### Key Decisions (Phase 03)

| Phase | Decision | Rationale |
|-------|----------|-----------|
| 03-01 | Removed isPushToTalk flag | Redundant with isRecording - single source of truth |
| 03-01 | Thread creation before recording | Prevents "no thread" errors during upload |
| 03-01 | Trust Supabase real-time subscription | Removed polling - faster updates, less server load |
| 03-01 | 30s timeout fallback | Handles real-time subscription failures |
| 03-01 | Single temp message pattern | Consistent loading state across voice flow |
| 03-02 | Retry with 2s backoff | Automatic recovery from transient failures |
| 03-02 | Specific error messages | User understands what went wrong and how to fix |
| 03-02 | 60s timeout with 30s warning | Prevents infinite loading states |
| 03-03 | Removed red orb | User preference - simpler "I'm listening..." text |
| 03-03 | Processing as user message | Shows "Processing voice message..." with spinner |
| 03-03 | Hide container during load | Prevents flash/teleport when entering threads |
| 03-03 | Real-time includes all roles | Voice transcriptions are user messages from n8n |
| 03-03 | temp- prefix for optimistic msgs | Enables deduplication when real message arrives |
| 03-03 | No animation for user messages | Prevents flicker from double animation |

## Completed Changes
- [x] Voice recording state machine fixed (isPushToTalk removed)
- [x] Thread creation timing fixed (before recording starts)
- [x] Polling removed (trust real-time subscription)
- [x] Temp message handling simplified (single "temp-voice" message)
- [x] Thread title auto-update from transcription
- [x] Retry logic for voice upload (3 attempts)
- [x] Error states with specific messages
- [x] Timeout handling (30s/60s)
- [x] Visual state indicators (simplified)
- [x] Message rendering optimized
- [x] Thread scroll instant (no animation)
- [x] Loading indicator added
- [x] Duplicate text messages fixed
- [x] Message flicker fixed

---

## Current System State

### Architecture Overview
- **Frontend:** Next.js with TypeScript and Tailwind CSS
- **Backend:** n8n workflows hosted at https://admin.orcadigital.online  
- **Database:** Supabase with PostgreSQL
- **Authentication:** JWT-based system
- **Notifications:** PWA push notifications

### Active Workflows
- **Web API Router (Main Brain):** ID `o5t83JWF11dsSfyi` - Routes user messages (OPTIMIZED)
- **Ops Secretary:** ID `M9qgqvtsa5nuHUQ3` - Task management
- **Business Strategist:** ID `DvvZiJ0n2HvbkAax` - Business analysis
- **Market Intel Agent:** ID `Td29kBFdqAqSxBpo` - Web search (Tavily + Exa.ai deep search)
- **Daily Briefing:** ID `mBFd8G3ujZjK7-N` - Scheduled task summaries
- **Task Manager:** ID `JWwLi4Zo4Zqh7igS` - Task CRUD operations
- **Calendar Manager:** ID `GTRv70JqhEekrbLN` - Google Calendar integration
- **Contact Manager:** ID `M61NswfHOOsFxrL6` - Contact operations
- **Preference Manager:** ID `7g0eMB0yVqi8yMmQ` - User preferences
- **Memory Tools:** Save and Retrieve knowledge
- **Social Scout:** ID `HCV-51qLaCdcxHGx2yBcO` - Multi-platform scraping (FB + TikTok)
- **Competitor Ad Monitor:** ID `dKGN8ZoDSqtPCqEq` - Automated ad monitoring (requires manual activation)
- **Voice Pipeline:** ID `JuKoBjeKk5F-e6KNVtR4t` - Audio processing
- **Auth System:** ID `OPF7ii_KCDkOlZiJqT-BE` - User validation
- **Idea Manager:** ID `rk_RR1SePy-TNVo68mZRu` - Ideas CRUD

---

## Accumulated Context

### Pending Todos
- 0 items in `.planning/todos/pending/` for Phase 04 (all complete)
- 2 items in `.planning/todos/pending/` (Skills system, Google services - deferred)

---

## Quick Tasks Completed

| Task | Date | Description |
|------|------|-------------|
| 001 | 2026-01-28 | Fixed router message saving issues |
| 002 | 2026-01-28 | Notification font size + modal popup |
| 003 | 2026-01-28 | Green confetti on task completion |
| 005 | 2026-01-29 | Added Exa.ai deep search to Market Intel Agent |
| 006 | 2026-01-29 | Added Recent Posts grid to Market Intel modal |
| 007 | 2026-01-30 | Market Analyst card layout - moved Monitor/ADS to footer |

---

## Lessons Learned

### Voice Message Flow Insights
1. **State machine simplicity** - Fewer state flags = fewer race conditions
2. **Thread creation timing** - Create BEFORE async operations to prevent errors
3. **Trust real-time subscriptions** - Polling creates duplicate updates and server load
4. **Timeout fallbacks** - Essential for reliability when WebSocket fails
5. **Optimistic UI pattern** - Use temp- prefix for easy filtering
6. **Animation considerations** - User messages should be instant (no animation)
7. **Container visibility** - Hide during async load to prevent visual artifacts

### Previous Optimization Insights
1. **Understand frontend architecture first** - async optimization failed because frontend reads from Supabase
2. **Test with real frontend** - JSON validation doesn't catch data flow issues
3. **Keep backups** - workflow backup enabled quick recovery

### Phase 04 Insights
1. **n8n API limitations** - Active field is read-only; workflows must be manually activated in UI
2. **Change detection patterns** - Track previous state to detect meaningful changes (false → true)
3. **Scheduled workflows** - 30-minute intervals balance timeliness with API cost efficiency
4. **Multi-platform architecture** - Router → Platform Router → Scraper enables extensible design

---

*State Updated: January 30, 2026*
