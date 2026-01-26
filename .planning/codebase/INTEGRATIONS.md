# External Integrations

**Analysis Date:** 2026-01-27

## APIs & External Services

**AI/LLM Services:**
- Google Gemini - LLM provider for AI agent responses
  - SDK/Client: googlePalmApi credential in n8n workflows
  - Auth: Google OAuth via n8n

**Search Services:**
- Tavily - Web search API for market intelligence
  - SDK/Client: Integrated in market-intel workflow
  - Auth: API key via n8n credential

**Social Media/Scraping:**
- Apify - Facebook page scraping for competitor analysis
  - SDK/Client: apifyApi in n8n workflows
  - Auth: API token via n8n credential

**Calendar Services:**
- Google Calendar - Calendar management and scheduling
  - SDK/Client: Google OAuth
  - Auth: Calendar OAuth credential in n8n

## Data Storage

**Databases:**
- Supabase (PostgreSQL) - Primary database for all application data
  - Connection: REST API via @supabase/supabase-js
  - Client: Both browser and server-side clients configured
  - Tables: users, tasks, ideas, contacts, competitors, social_stats, conversations, knowledge_base, user_preferences, quick_prompts, notifications, push_subscriptions, chat-attachments, market_intelligence

**File Storage:**
- Supabase Storage - File uploads and static assets
  - Connection: Integrated with Supabase client
  - Usage: Chat attachments, image analysis uploads

**Caching:**
- None detected - No dedicated caching layer implemented

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication with Supabase
  - Implementation: Custom session management using jose library for token signing/verification
  - User session handling via Next.js middleware
  - Login validation via n8n workflow authentication

## Monitoring & Observability

**Error Tracking:**
- Basic console logging - No dedicated error tracking service

**Logs:**
- Console-based logging throughout application
- No centralized logging or monitoring dashboard

## CI/CD & Deployment

**Hosting:**
- Vercel - Production deployment platform
  - Analytics integration via @vercel/analytics
  - Progressive Web App support via next-pwa

**CI Pipeline:**
- Not detected - No explicit CI/CD configuration found in codebase

## Environment Configuration

**Required env vars:**
- NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key
- N8N webhooks and authentication keys
- VAPID keys for web push notifications
- Other service credential keys

**Secrets location:**
- Environment variables - Stored in .env.local (development) and Vercel env vars (production)

## Webhooks & Callbacks

**Incoming:**
- n8n workflow webhooks - https://admin.orcadigital.online/webhook/* endpoints
- Authentication webhooks from n8n for user validation
- Voice/transcription pipelines

**Outgoing:**
- Push notifications via ntfy (handled by n8n workflows)
- Real-time updates via Supabase subscriptions (client-side)
- No explicit outgoing webhooks in frontend code

---

*Integration audit: 2026-01-27*