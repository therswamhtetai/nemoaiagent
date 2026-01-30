---
created: 2026-01-30T19:29
title: Upgrade system prompt to ask clarifying questions
area: integration
files:
  - n8n workflow: Web API Router (o5t83JWF11dsSfyi)
---

## Problem

The AI agent currently guesses or hallucinates answers when uncertain instead of asking for clarification. This leads to incorrect responses and poor user experience.

User wants two behavioral changes:

1. **Ask clarifying questions instead of guessing**
   - When uncertain, ask "Are you referring to this or that?"
   - Don't assume or make up information
   - Admit uncertainty and seek clarification

2. **Confirmation step before task execution**
   - When a task is assigned, verify details first
   - Confirm specific person, email, or other details
   - Only proceed after user explicitly confirms with "OK"
   - Example: "You want me to email John Smith at john@example.com about the meeting. Is that correct?"

## Solution

- Update system prompt in Web API Router workflow
- Add explicit instructions for uncertainty handling
- Add confirmation protocol for actionable tasks
- Consider adding a "confidence threshold" concept
- May need to adjust tool descriptions to reinforce this behavior
