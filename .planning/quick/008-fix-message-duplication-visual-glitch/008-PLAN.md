---
phase: quick-008
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/page.tsx
autonomous: true

must_haves:
  truths:
    - "AI replies appear exactly once when sent"
    - "No visual duplication during message delivery"
    - "Messages transition smoothly from optimistic to real"
  artifacts:
    - path: "app/page.tsx"
      provides: "Fixed message handling with temp-prefixed assistant messages"
      contains: "temp-assistant-"
  key_links:
    - from: "handleSendMessage tempAssistantMsg"
      to: "real-time subscription filter"
      via: "temp- prefix pattern"
      pattern: "m.id.startsWith\\(\"temp-\"\\)"
---

<objective>
Fix message duplication visual glitch where AI replies render twice before resolving to single message.

Purpose: User reports seeing duplicate AI responses momentarily - both the webhook response AND the Supabase real-time update display simultaneously before one disappears.

Output: Clean message flow with no visual duplication.
</objective>

<execution_context>
@/Users/MSIModern14/.claude/get-shit-done/workflows/execute-plan.md
@/Users/MSIModern14/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@app/page.tsx (lines 960-1030 for real-time subscription, lines 1340-1465 for handleSendMessage)
</context>

<root_cause>
Race condition between THREE message sources:

1. **Webhook Response (line 1447)**: After webhook returns, `tempAssistantMsg` is added with `crypto.randomUUID()` (NOT temp-prefixed)
2. **Real-time Subscription (lines 974-984)**: Supabase fires when message saved to DB, adds with database UUID
3. **loadConversations (line 1449)**: 1 second later, replaces all messages from database

The deduplication logic (line 976-980) filters `temp-` prefixed messages, but the webhook response uses a regular UUID. Result: Both messages briefly display until loadConversations replaces everything.

The existing pattern for USER messages correctly uses `temp-user-${uuid}` (line 1349), but ASSISTANT messages don't follow this pattern.
</root_cause>

<tasks>

<task type="auto">
  <name>Task 1: Fix assistant message ID to use temp- prefix</name>
  <files>app/page.tsx</files>
  <action>
In handleSendMessage function (around line 1440-1447), change the tempAssistantMsg ID from:
```typescript
id: crypto.randomUUID(),
```
to:
```typescript
id: `temp-assistant-${crypto.randomUUID()}`,
```

This matches the existing pattern used for user messages (line 1349: `temp-user-${crypto.randomUUID()}`).

The real-time subscription (line 976) already filters out temp- prefixed messages:
```typescript
const filtered = prev.filter(m => !m.id.startsWith("temp-"))
```

So when the real message arrives via real-time subscription, the temp assistant message will be properly removed.
  </action>
  <verify>
1. Send a message in the chat
2. Observe AI response appears exactly once (no duplication)
3. Check browser console for message flow:
   - "[v0] Webhook raw response:" appears
   - "[v0] Real-time: New message received assistant" appears
   - No duplicate messages in UI
  </verify>
  <done>AI replies render once without duplication visual glitch</done>
</task>

<task type="auto">
  <name>Task 2: Add same pattern to error messages</name>
  <files>app/page.tsx</files>
  <action>
In the catch block (around line 1454-1461), the error message also uses a regular UUID. Update:
```typescript
id: crypto.randomUUID(),
```
to:
```typescript
id: `temp-error-${crypto.randomUUID()}`,
```

This ensures consistency and prevents potential duplication if error handling changes in the future.
  </action>
  <verify>
1. Simulate network error (disconnect network, send message)
2. Error message appears once without duplication
  </verify>
  <done>Error messages also use temp- prefix pattern for consistency</done>
</task>

</tasks>

<verification>
1. Send multiple messages in quick succession - no duplicates
2. Check voice message flow still works (uses same real-time pattern)
3. Navigate between threads - messages load correctly from DB
4. Error states display single error message
</verification>

<success_criteria>
- AI replies appear exactly once when user sends message
- No visual "flash" of duplicate messages
- Messages transition smoothly: temp message shown -> real-time delivers -> temp filtered out
- Error messages follow same pattern
</success_criteria>

<output>
After completion, create `.planning/quick/008-fix-message-duplication-visual-glitch/008-SUMMARY.md`
</output>
