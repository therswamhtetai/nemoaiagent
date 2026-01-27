---
created: 2026-01-28T03:12
title: Integrate Google services for AI assistant
area: integration
files:
  - n8n workflows (Auth System, Web API Router)
  - frontend auth components
---

## Problem

NemoAI needs to function as a full personal assistant with access to user's Google ecosystem. Currently, users cannot:
- Sign up/sign in using Google accounts
- Have the AI access their Gmail, Calendar, Drive, Sheets, or Docs
- Execute actions like "send an email to John Smith" through natural conversation

This integration is critical for the personal assistant vision. The AI agent should:
1. Handle Google OAuth2 authentication seamlessly
2. Access user's Google services data (Emails, Calendar, Drive, Sheets, Docs)
3. Perform actions on behalf of the user (send emails, create events, etc.)
4. Support two-way conversation flow with confirmations before executing actions

Example use case: User says "send an email to John Smith" → Agent retrieves contact from Google Contacts → Drafts email → Asks for confirmation → Sends on approval.

## Solution

TBD - Technical implementation details to be researched. Key areas to explore:

1. **Authentication Flow**
   - Google OAuth2 integration for sign up/sign in
   - Token storage and refresh handling
   - Scope management for various Google services

2. **Google APIs Integration**
   - Gmail API (read/send emails)
   - Google Calendar API (read/create events)
   - Google Drive API (file access)
   - Google Sheets API (read/write spreadsheets)
   - Google Docs API (document access)
   - Google People API (contacts)

3. **Conversational Flow**
   - Confirmation patterns before destructive/sending actions
   - Context gathering when information is missing
   - Error handling and user feedback

4. **n8n Workflow Architecture**
   - New tool workflows for each Google service
   - Integration with existing Web API Router
   - Token management within n8n
