---
phase: quick
plan: 004
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/services/api.ts
  - app/page.tsx
autonomous: true

must_haves:
  truths:
    - "Voice recording stops -> Thread view appears immediately (no Home screen flash)"
    - "User sees 'Processing...' indicator until real messages arrive"
    - "Both transcribed user message AND AI response appear via real-time (no refresh needed)"
    - "No message flickering during voice processing"
  artifacts:
    - path: "lib/services/api.ts"
      provides: "Real-time subscription for both user and assistant messages"
    - path: "app/page.tsx"
      provides: "Voice processing state management, single temp message approach"
  key_links:
    - from: "SubscribeToConversations"
      to: "setMessages"
      via: "Real-time INSERT callback for ALL message roles"
    - from: "isVoiceProcessing state"
      to: "View rendering condition (line ~2858)"
      via: "Prevents fallback to Home when messages are being processed"
---

<objective>
Fix voice message UX: eliminate Home screen flashing, enable real-time updates for both user and assistant messages, and remove message flickering caused by conflicting temp messages and polling.

Purpose: Voice messages currently cause poor UX - users see Home screen flash, need to refresh to see their transcribed message, and experience flickering from competing update mechanisms.

Output: Smooth voice message flow where recording stop -> Thread view with "Processing..." -> Real-time updates replace temp message with actual user transcript and AI response.
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
@~/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@lib/services/api.ts (SubscribeToConversations - lines 9-48)
@app/page.tsx (handlePushToTalk - lines 1846-1900, sendAudioToN8n - lines 1902-2047, real-time subscription useEffect - lines 934-964, view condition - line 2858)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update real-time subscription to handle all message roles</name>
  <files>lib/services/api.ts</files>
  <action>
Modify `SubscribeToConversations` function (lines 9-48):

1. **Remove the role filter** - currently line 34 filters `if (newMessage.role === 'assistant')`, which ignores user's transcribed voice message
2. **Accept all message roles** - the callback should receive BOTH `user` and `assistant` messages from Supabase INSERT events
3. **Keep duplicate prevention in the caller** - page.tsx already checks `prev.some(m => m.id === newMessage.id)`

Change this (line 29-36):
```typescript
(payload) => {
    console.log('[Realtime] New message received:', payload.new)
    const newMessage = payload.new as Message
    // Only trigger callback for assistant messages (AI responses)
    // User messages are already shown optimistically
    if (newMessage.role === 'assistant') {
        onNewMessage(newMessage)
    }
}
```

To this:
```typescript
(payload) => {
    console.log('[Realtime] New message received:', payload.new)
    const newMessage = payload.new as Message
    // Trigger callback for all messages (both user transcripts and assistant responses)
    // Duplicate prevention is handled by the caller
    onNewMessage(newMessage)
}
```
  </action>
  <verify>
Check the modified function compiles:
```bash
cd /Users/MSIModern14/Downloads/nemo-ai-dashboard-setup && npx tsc lib/services/api.ts --noEmit --skipLibCheck 2>&1 | head -20
```
  </verify>
  <done>SubscribeToConversations callback fires for all message roles, not just 'assistant'</done>
</task>

<task type="auto">
  <name>Task 2: Add voice processing state and simplify message handling</name>
  <files>app/page.tsx</files>
  <action>
Make these changes to app/page.tsx:

**2A. Add `isVoiceProcessing` state** (near other state declarations, around line 160-200):
```typescript
const [isVoiceProcessing, setIsVoiceProcessing] = useState(false)
```

**2B. Update view rendering condition** (around line 2858):
Change from:
```typescript
{activeModule === "home" ? (
  messages.length === 0 ? (
```
To:
```typescript
{activeModule === "home" ? (
  messages.length === 0 && !isVoiceProcessing ? (
```
This prevents the Home/Orb screen from showing during voice processing.

**2C. Simplify handlePushToTalk** (lines 1846-1900):
When recording stops (the `else` branch starting line 1846):
- Set `setIsVoiceProcessing(true)` at the start of the stop-recording block
- REMOVE the conditional temp message creation (lines 1877-1894) - we'll handle this in sendAudioToN8n
- Keep the thread creation logic and `setLoading(true)`

**2D. Simplify sendAudioToN8n** (lines 1902-2047):
1. Add a SINGLE temp message at the start (replace both existing temp messages):
```typescript
const processingMsg: Message = {
  id: "temp-voice-processing",
  content: "Processing your voice...",
  role: "assistant",
  created_at: new Date().toISOString(),
  thread_id: activeThreadId || "temp",
}
setMessages([processingMsg]) // Replace all messages with just this one
```

2. **Remove the polling mechanism entirely** (lines 1965-2003) - real-time subscription will handle updates now that it accepts all roles

3. After 202 response, just log and return (keep loading state active):
```typescript
if (response.status === 202) {
  console.log("[v0] Voice command accepted (202). Real-time subscription will deliver updates.")
  // Loading state stays active, real-time subscription handles the rest
  return
}
```

**2E. Update real-time subscription handler** (lines 940-957):
When a real message arrives, clean up the temp message and voice processing state:
```typescript
(newMessage) => {
  console.log('[v0] Real-time: New message received:', newMessage.role)
  setMessages(prev => {
    // Check if message already exists (prevent duplicates)
    if (prev.some(m => m.id === newMessage.id)) {
      return prev
    }
    // Remove temp messages when real messages arrive
    const filtered = prev.filter(m => !m.id.startsWith("temp-"))
    return [...filtered, newMessage]
  })
  // Stop loading states when we get the assistant response
  if (newMessage.role === 'assistant') {
    setLoading(false)
    setIsProcessing(false)
    setIsVoiceProcessing(false)
  }
}
```
  </action>
  <verify>
1. Check TypeScript compiles:
```bash
cd /Users/MSIModern14/Downloads/nemo-ai-dashboard-setup && npm run build 2>&1 | tail -30
```

2. Test the voice flow manually:
   - Start on Home screen (no messages)
   - Tap mic to start recording
   - Tap mic to stop recording
   - Verify: Thread view shows immediately with "Processing your voice..."
   - Verify: User's transcribed message appears (via real-time)
   - Verify: AI response appears (via real-time)
   - Verify: No flickering, no return to Home screen
  </verify>
  <done>
    - Voice recording stop immediately shows Thread view (not Home)
    - Single temp "Processing..." message replaces all temp message handling
    - Polling removed, real-time is single source of truth
    - Both user transcript and AI response delivered via real-time subscription
  </done>
</task>

<task type="auto">
  <name>Task 3: Clean up window global and ensure proper state reset</name>
  <files>app/page.tsx</files>
  <action>
1. **Remove the window.__voicePollTimer global** (lines 2001-2003):
   Since we're removing polling, delete this code entirely:
   ```typescript
   if (typeof window !== 'undefined') {
     (window as any).__voicePollTimer = pollTimer
   }
   ```

2. **Add error recovery for voice processing**:
   In the catch block of sendAudioToN8n (around line 2038-2045), ensure isVoiceProcessing is reset:
   ```typescript
   } catch (err) {
     console.error("[v0] Error sending audio to n8n:", err)
     if (err instanceof Error && !err.message.includes('202')) {
       alert(`Failed to send voice command: ${err.message}. Please try again.`)
     }
     setLoading(false)
     setIsProcessing(false)
     setIsVoiceProcessing(false)  // Add this
     setMessages(prev => prev.filter(m => !m.id.startsWith("temp-")))
   }
   ```

3. **Handle real-time subscription timeout** (optional safety net):
   Add a 2-minute safety timeout in sendAudioToN8n after 202 return to reset states if real-time never delivers:
   ```typescript
   if (response.status === 202) {
     console.log("[v0] Voice command accepted (202). Real-time subscription will deliver updates.")
     // Safety timeout: if no real-time update in 2 minutes, reset states
     setTimeout(() => {
       setMessages(prev => {
         // Only reset if still showing temp message (no real updates received)
         if (prev.some(m => m.id === "temp-voice-processing")) {
           console.log("[v0] Voice processing timeout - resetting states")
           setLoading(false)
           setIsProcessing(false)
           setIsVoiceProcessing(false)
           return prev.filter(m => !m.id.startsWith("temp-"))
         }
         return prev
       })
     }, 120000) // 2 minutes
     return
   }
   ```
  </action>
  <verify>
```bash
cd /Users/MSIModern14/Downloads/nemo-ai-dashboard-setup && npm run build 2>&1 | tail -20
```
Verify no TypeScript errors and no references to __voicePollTimer remain.
  </verify>
  <done>
    - No window globals for poll timers
    - Error states properly reset isVoiceProcessing
    - Safety timeout prevents infinite loading if real-time fails
  </done>
</task>

</tasks>

<verification>
1. Build succeeds: `npm run build`
2. Manual test:
   - Fresh page load (no active thread) -> Home screen with Orb
   - Tap mic, speak, tap mic to stop
   - Thread view shows immediately with "Processing your voice..."
   - Within 5-15 seconds: User's transcribed message appears
   - Within another 5-15 seconds: AI response appears
   - No flickering, no Home screen flash
3. Check real-time subscription in browser console: Should see `[Realtime] New message received` for BOTH user and assistant messages
</verification>

<success_criteria>
- Voice recording stop -> Thread view appears immediately (no Home flash)
- Single "Processing your voice..." message shown during processing
- User's transcribed message appears via real-time (no polling, no refresh needed)
- AI response appears via real-time
- No message flickering during the entire flow
- Error states properly handled with state cleanup
</success_criteria>

<output>
After completion, create `.planning/quick/004-voice-message-ux-overhaul/004-SUMMARY.md`
</output>
