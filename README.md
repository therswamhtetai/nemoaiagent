# NemoAI Personal Assistant

A personal AI assistant system built with n8n workflows, Next.js frontend, and Supabase database.

## System Overview

NemoAI is a production AI assistant system with:
- **Chat Interface**: Natural language task management and queries
- **Task Management**: Create, update, and track tasks via chat
- **Business Intelligence**: Market research and competitor analysis
- **Memory System**: Long-term knowledge storage with vector embeddings
- **Push Notifications**: Scheduled briefings and reminders via ntfy

## Architecture

```
Frontend (Next.js) → Webhooks → n8n Workflows → Supabase
                                     ↓
                               AI Agent (Gemini)
                                     ↓
                               Tool Workflows
```

## Key Workflows

| Workflow | Purpose |
|----------|---------|
| Web API Router | Main brain - routes user messages |
| Ops Secretary | Task management CRUD |
| Business Strategist | Business analysis |
| Market Intel Agent | Web search |
| Daily Briefing | Scheduled task summaries |
| Social Scout | Facebook page scraping |

## Recent Optimization

**Response Speed Optimization** (January 2026)
- Reduced context window from 10 to 6 turns
- Improved response time

## Development

See `CLAUDE.md` for development guidelines and workflow patterns.

## Configuration

- n8n instance: `https://admin.orcadigital.online`
- Database: Supabase (see `.env.local`)
- Notifications: ntfy

---

*Project Owner: Ther Swam Htet*
*System: NemoAI Personal Assistant*
