# Codebase Structure

**Analysis Date:** 2026-01-27

## Directory Layout

```
.
├── app/                   # Next.js App Router pages and API routes
├── components/           # React UI components  
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and clients
├── public/               # Static assets
├── workflows/            # n8n workflow exports
├── styles/               # Custom CSS styles
├── migrations/           # Database migrations
└── n8n-skills/          # n8n workflow skills repository
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router pages and server-side API integration
- Contains: page.tsx, layout.tsx, api/ subdirectory with route handlers
- Key files: `app/page.tsx`, `app/layout.tsx`, `app/api/chat/route.ts`

**components/:**
- Purpose: Reusable React components for the application interface  
- Contains: Feature-area View components, utility components
- Key files: `components/ChatView.tsx`, `components/TaskView.tsx`, `components/TaskView.tsx`

**hooks/:**
- Purpose: Custom React hooks for shared state and API logic
- Contains: useAuth.ts, potentially other hooks for common operations
- Key files: `hooks/useAuth.ts`

**lib/:**
- Purpose: Shared utility functions, external service clients, and configurations
- Contains: supabase.ts, mcp.ts, helper functions
- Key files: `lib/supabase.ts`, `lib/mcp.ts`

**public/:**
- Purpose: Static files served directly by Next.js at root URL
- Contains: Images, icons, manifest files
- Key files: Various asset files

**workflows/:**
- Purpose: Version-controlled n8n workflow definitions  
- Contains: JSON exports from n8n UI for each workflow
- Key files: Various workflow JSON files
- Generated: Exported manually from n8n interface
- Committed: Yes, to maintain version history

**styles/:**
- Purpose: Component-specific CSS stylesheets
- Contains: CSS files for styling
- Generated: Hand-authored styles
- Committed: Yes

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Main application entry point rendering the dashboard
- `app/layout.tsx`: Root layout component with providers

**Configuration:**
- `tsconfig.json`: TypeScript compiler configuration
- `next.config.mjs`: Next.js build and runtime configuration
- `package.json`: Project dependencies and scripts

**Core Logic:**
- UI components: `components/*.tsx`
- API handlers: `app/api/**/*.ts`
- Business logic workflows: `workflows/*.json`
- Utility functions: `lib/*.ts`

**Testing:**
- None identified (no test directory or files found)

## Naming Conventions

**Files:**
- React components: PascalCase (ChatView.tsx, TaskView.tsx)
- TypeScript files: camelCase (supabase.ts, useAuth.ts)
- Configuration files: kebab-case (next.config.mjs, tsconfig.json)

**Directories:**
- Use lowercase, singular nouns (app, components, hooks, lib, public)

## Where to Add New Code

**New Feature:**
- Create new directory under `app/` for the page route ( `app/new-feature/page.tsx`)
- Add corresponding API endpoints in `app/api/new-feature/route.ts`
- Implement UI components in `components/NewFeatureView.tsx`

**New Component/Module:**
- UI component: `components/NewComponent.tsx` (PascalCase filename)

**Utilities:**
- Shared functions: `lib/utilityName.ts`

## Special Directories

**workflows/:**
- Contains manually exported n8n workflow JSON files
- Generate by exporting from n8n UI
- Maintain version control by committing changes

**n8n-skills/:**
- Contains skills files for n8n workflow development
- Update by pulling from skills repository
- Reference for AI-assisted workflow creation

---

*Structure analysis: 2026-01-27*