---
created: 2026-01-28T03:29
title: Implement Skills System with User Gating
area: integration
files:
  - app/page.tsx:78
  - lib/services/api.ts
  - /api/chat
  - /api/monitor
  - /api/skills
---

## Problem

NemoAI needs a skills/permissions system to gate premium features per user. Currently all users have access to all modules. Need to:

1. Control which users can access which features (Market Intelligence, CRM, Social Scout, etc.)
2. Show locked state in UI with unlock prompts
3. Enforce access at both API and n8n workflow levels
4. Allow admin to activate/deactivate skills per user

This is a monetization and access control feature spanning database, frontend, API, and n8n workflows.

## Solution

7-phase implementation plan with 15 tasks:

### Phase 1: Database Foundation (High Priority)
- skill-1: Create `skills` and `user_skills` tables with migration
- skill-2: Seed 6 initial skills: market_intel, social_scout, business_analyst, task_manager, idea_manager, crm

### Phase 2: Frontend - Skills Tab (High Priority)
- skill-3: Add "Skills" module to sidebar (modules array at app/page.tsx:78)
- skill-4: Create Skills view with grid cards (active = colored + checkmark, locked = gray + lock)
- skill-5: Add FetchUserSkills() in lib/services/api.ts

### Phase 3: Frontend - Gating (Medium Priority)
- skill-6: Add lock overlay on premium tabs when user lacks skill
- skill-7: Create modal with unlock prompt ("Contact admin to unlock this skill")

### Phase 4: Backend Enforcement (High Priority - Security Critical)
- skill-8: Create /api/skills route to fetch user's active skills
- skill-9: Middleware in /api/chat to check skill before forwarding to n8n
- skill-10: Same check in /api/monitor for Social Scout

### Phase 5: N8N Workflow Changes (Medium Priority)
- skill-11: Create "Skill Access Checker" sub-workflow querying user_skills
- skill-12: Modify Web API Router to call checker and return friendly error if locked

### Phase 6: Database Security (Medium Priority)
- skill-13: Add RLS policies to prevent direct database access for locked skills

### Phase 7: Admin & Testing (Lower Priority)
- skill-14: Create SQL script or admin UI to activate/deactivate skills
- skill-15: End-to-end testing of complete flow

### Key Architecture Decisions
- Double enforcement: Frontend for UX, backend for security
- Consider free tier: task_manager and idea_manager free by default
- Schema includes expires_at for time-limited access support
