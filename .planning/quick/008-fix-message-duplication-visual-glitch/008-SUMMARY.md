# Quick Task 008: Fix Message Duplication Visual Glitch

## Result: SUCCESS

**Date:** 2026-01-31
**Commit:** 83c8d53

## Problem

AI replies appeared duplicated momentarily - two messages would render, then one would quickly disappear. User suspected both Webhook response and Supabase real-time updates were displaying simultaneously.

## Root Cause

Race condition between THREE message sources:

1. **Webhook Response (line 1447)**: Added `tempAssistantMsg` with `crypto.randomUUID()` - NOT temp-prefixed
2. **Real-time Subscription (lines 974-984)**: Added same message with database UUID when it arrived in Supabase
3. **loadConversations (line 1449)**: Replaced all messages 1 second later

The deduplication logic (line 976) filters `temp-` prefixed messages, but the webhook assistant message used a regular UUID. Result: Both messages briefly displayed.

## Solution

Changed message IDs to use `temp-` prefix pattern:

| Message Type | Before | After |
|--------------|--------|-------|
| Assistant | `crypto.randomUUID()` | `temp-assistant-${crypto.randomUUID()}` |
| Error | `crypto.randomUUID()` | `temp-error-${crypto.randomUUID()}` |

This matches the existing pattern for user messages (`temp-user-${uuid}`) and allows the real-time subscription filter to properly deduplicate.

## Files Modified

- `app/page.tsx` - Updated handleSendMessage function (lines 1441, 1455)

## Verification

1. Send message in chat - AI reply appears exactly once
2. No visual "flash" of duplicate messages
3. Smooth transition: temp message shown → real-time delivers → temp filtered out
