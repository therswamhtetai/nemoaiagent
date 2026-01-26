# Architecture

**Analysis Date:** 2026-01-27

## Pattern Overview

**Overall:** Layered architecture separating frontend presentation from external workflow processing

**Key Characteristics:**
- Reactive web application built with Next.js App Router
- API-driven design with external n8n workflow backend
- Database-first approach using Supabase
- TypeScript provides type safety across layers

## Layers

**Presentation Layer:**
- Purpose: User interface components and client-side state management
- Location: `app/`, `components/`
- Contains: React components, pages, UI logic
- Depends on: Application layer APIs
- Used by: End users through web browser

**Application Layer:**
- Purpose: HTTP request handling and integration with external services
- Location: `app/api/`
- Contains: API routes, request/response processing
- Depends on: n8n webhooks, Supabase client
- Used by: Presentation layer via AJAX calls

**Service Layer:**
- Purpose: Business logic execution and workflow orchestration
- Location: External n8n instance (files in `workflows/`)
- Contains: n8n workflow definitions for different features
- Depends on: Supabase, external APIs (Google Gemini, Calendar, Apify)
- Used by: Application layer via webhook calls

**Data Layer:**
- Purpose: Persistent data storage and retrieval services
- Location: Supabase (external database)
- Contains: Relational tables, vector embeddings for knowledge base
- Depends on: None (self-contained)
- Used by: Service layer workflows and direct API access

## Data Flow

**Chat Message Processing:**

1. **User Input**: User enters message in chat interface (`components/ChatView.tsx`)
2. **Frontend Request**: UI sends POST request to `/api/chat` endpoint
3. **API Gateway**: `app/api/chat/route.ts` processes request, forwards to n8n webhook
4. **Workflow Execution**: "Web API Router" workflow classifies message and routes to appropriate tool workflow (task manager, business strategist, etc.)
5. **Response Return**: Workflow streams JSON response back through API route to UI

**State Management:** React hooks and context providers handle local component state. Global state managed through providers like `SessionProvider` in `app/layout.tsx`

## Key Abstractions

**UI Views:**
- Purpose: Encapsulates full feature interfaces (chat, tasks, ideas, etc.)
- Examples: `components/ChatView.tsx`, `components/TaskView.tsx`, `components/TaskView.tsx`
- Pattern: PascalCase component names, focused on single feature areas

**Custom Hooks:**
- Purpose: Reusable logic for authentication and API interactions
- Examples: `hooks/useAuth.ts`
- Pattern: use[Feature] naming convention for hook functions

**Utility Libraries:**
- Purpose: Centralized clients and configurations for external services  
- Examples: `lib/supabase.ts`, `lib/mcp.ts`
- Pattern: Single files per service or domain concern

## Entry Points

**Web Application:**
- Location: `app/page.tsx`
- Triggers: User navigates to root URL or clicks navigation items
- Responsibilities: Render main dashboard interface, manage section switching

**API Endpoints:**
- Location: Files in `app/api/` (e.g., `app/api/chat/route.ts`)
- Triggers: Frontend HTTP requests
- Responsibilities: Handle specific feature operations, proxy to n8n workflows

**n8n Webhooks:**
- Location: External URLs configured in n8n workflows
- Triggers: HTTP POST/PUT/GET requests from Next.js API routes
- Responsibilities: Execute business logic workflows

## Error Handling

**Strategy:** Bubble errors up from API routes to frontend with user-friendly messages

**Patterns:**
- API routes wrap operations in try/catch blocks
- Throw standardized error objects with message and status code
- Frontend catches and displays appropriate UI feedback

## Cross-Cutting Concerns

**Logging:** Console.log output in development, middleware handles request logging

**Validation:** TypeScript compilation enforces type contracts, runtime validation in n8n workflows

**Authentication:** Auth middleware (`middleware.ts`) protects routes, JWT sessions managed by `app/api/auth/*` routes

**Security:** Environment variables for API keys, CORS policy, auth required for sensitive operations

---

*Architecture analysis: 2026-01-27*