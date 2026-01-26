# CLAUDE.md - NemoAI Workflow Development Guide

## 🎯 PROJECT OVERVIEW

You are working on **NemoAI**, a personal AI assistant system built with n8n workflows. This is a production system with real users.

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              (TypeScript/React - Already Built)              │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │   Chat   │ │  Tasks   │ │  Ideas   │ │ Competitors  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
└───────┼────────────┼────────────┼──────────────┼────────────┘
        │            │            │              │
        ▼            ▼            ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    WEBHOOK ENDPOINTS                         │
│         https://admin.orcadigital.online/webhook/*          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                   N8N WORKFLOWS (BACKEND)                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            WEB API ROUTER (Main Brain)               │   │
│  │         "Jarvis Brain" - AI Agent with Tools         │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                    │
│    ┌────────────────────┼────────────────────┐              │
│    ▼                    ▼                    ▼              │
│ ┌──────────┐     ┌──────────┐        ┌──────────┐          │
│ │   Ops    │     │ Business │        │  Market  │          │
│ │Secretary │     │Strategist│        │  Intel   │          │
│ └────┬─────┘     └──────────┘        └──────────┘          │
│      │                                                       │
│      ▼                                                       │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │  Task    │  │ Calendar │  │ Contact  │  │Preference│    │
│ │ Manager  │  │ Manager  │  │ Manager  │  │ Manager  │    │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │  Idea    │  │  Memory  │  │  Memory  │  │  Social  │    │
│ │ Manager  │  │   Save   │  │ Retrieve │  │  Scout   │    │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │            DAILY BRIEFING (Standalone)               │    │
│ │           Schedule Trigger → ntfy Push               │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                       │
│                                                              │
│  Tables: users, tasks, ideas, contacts, competitors,        │
│          user_preferences, knowledge_base, social_stats,    │
│          conversations, quick_prompts                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 CREDENTIALS & API ACCESS

### n8n Self-Hosted Instance
- **API URL**: `https://admin.orcadigital.online`
- **API Key**: See `.env.local` or contact admin

### Supabase
- **REST Endpoint**: See `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- **Anon Public Key**: See `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- **Tables**: users, tasks, ideas, contacts, competitors, social_stats, conversations, quick_prompts, user_preferences, knowledge_base, documents, decisions, market_trends

### n8n MCP (via Supergateway)
```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": [
        "-y", "supergateway", "--streamableHttp",
        "https://admin.orcadigital.online/mcp-server/http",
        "--header", "authorization:Bearer <MCP_TOKEN>"
      ]
    }
  }
}
```

### External Services (Already Configured in n8n)
- **Google Gemini**: LLM provider (models/gemini-3-flash-preview)
- **Google Calendar**: Calendar integration
- **Apify**: Facebook page scraping
- **Tavily**: Web search API
- **ntfy**: Push notifications

---

## 🔧 N8N MCP & SKILLS SETUP

### n8n-mcp (MCP Server)
**Repository**: https://github.com/czlonkowski/n8n-mcp.git
**Purpose**: Provides MCP tools for n8n workflow management

**Key Tools:**
| Tool | Purpose |
|------|---------|
| `search_nodes` | Find nodes by name/category |
| `get_node` | Get detailed node documentation |
| `validate_node` | Validate node configuration |
| `n8n_create_workflow` | Create new workflow |
| `n8n_update_partial_workflow` | Update existing workflow |
| `n8n_validate_workflow` | Validate complete workflow |
| `n8n_deploy_template` | Deploy template to n8n |

### n8n-skills (Skills Repository)
**Repository**: https://github.com/czlonkowski/n8n-skills.git
**Location**: `./n8n-skills/`
**Purpose**: 7 complementary skills for building production-ready n8n workflows

**Skills:**
1. **n8n Expression Syntax** - Correct {{}} patterns, $json, $node, $now
2. **n8n MCP Tools Expert** - How to use n8n-mcp tools effectively
3. **n8n Workflow Patterns** - 5 proven patterns (webhook, HTTP, database, AI, scheduled)
4. **n8n Validation Expert** - Interpret validation errors and fix them
5. **n8n Node Configuration** - Operation-aware node setup
6. **n8n Code JavaScript** - Write JavaScript in Code nodes
7. **n8n Code Python** - Write Python in Code nodes

### Workflow Development
Use slash command `/n8n-workflow` to access the complete workflow guide for creating n8n workflows.

**Quick Reference:**
- nodeType format (search/validate): `nodes-base.webhook`
- nodeType format (workflow JSON): `n8n-nodes-base.webhook`
- Always validate before activating workflows
- Use `intent` parameter in updates for better AI responses

---

## 📁 EXISTING WORKFLOWS

### Core Workflows (DO NOT DELETE)

| Workflow ID | Name | Purpose |
|------------|------|---------|
| `o5t83JWF11dsSfyi` | Web API Router | Main brain - routes user messages to appropriate tools |
| `M9qgqvtsa5nuHUQ3` | Ops Secretary | Task management (CRUD + status updates) |
| `DvvZiJ0n2HvbkAax` | Business Strategist | Business analysis, SWOT, ROI calculations |
| `Td29kBFdqAqSxBpo` | Market Intel Agent | Real-time web search for prices, news |
| `JWwLi4Zo4Zqh7igS` | Task Manager | Creates tasks in database |
| `GTRv70JqhEekrbLN` | Calendar Manager | Google Calendar check/schedule |
| `M61NswfHOOsFxrL6` | Contact Manager | Contact CRUD operations |
| `7g0eMB0yVqi8yMmQ` | Preference Manager | User preferences save/get |
| `wNgClCaTC4qSw4er` | Save to Memory Tool | Vector embedding + Supabase storage |
| `volKVoT9R96UigzM` | Memory Retrieval Tool | Semantic search via pgvector |
| `HCV-51qLaCdcxHGx2yBcO` | Social Scout | Facebook page scraping + analysis |
| `mBFd8G3ujZjK7-N` | Daily Briefing (Enhanced) | Dynamic user scheduling + on-demand briefings |
| `JuKoBjeKk5F-e6KNVtR4t` | Voice Pipeline | Audio transcription → Router |
| `OPF7ii_KCDkOlZiJqT-BE` | Auth System | User login validation |
| `rk_RR1SePy-TNVo68mZRu` | Idea Manager | Ideas CRUD operations |

---

## 🎯 CURRENT PRIORITIES (What to Build/Fix)

### Priority A: Response Speed Optimization
**Goal**: Reduce response time from 10-20 seconds to 3-5 seconds

**Problems Identified**:
1. Memory auto-save blocks response (adds 3-5 sec)
2. AI Agent classifies every message (even simple ones)
3. No caching for common queries

**Tasks**:
- [ ] Make "Save to Long-term Memory" async (don't wait for completion)
- [ ] Add pre-classification Switch node for simple commands
- [ ] Reduce `contextWindowLength` from 10 to 5-6
- [ ] Add caching for gold price, dollar rate queries (5 min cache)

### Priority C: Daily Briefing Integration
**Goal**: Dynamic briefing system that scales with users + on-demand trigger

**Current Problems**:
1. Hardcoded user_ids (5 users = 30+ duplicate nodes)
2. Not callable from main chat ("Today's briefing" doesn't work)
3. Single trigger time only

**Tasks**:
- [ ] Refactor to single dynamic workflow with Loop
- [ ] Add `daily_briefing` tool to Web API Router
- [ ] Support on-demand requests via chat

### Priority D: Reminder System (NEW FEATURE)
**Goal**: Users can set specific time reminders via chat

**Requirements**:
1. Database: Add `reminders` table or `reminder_time` column to tasks
2. New workflow: Reminder Checker (runs every 5 mins)
3. Integration: ops_secretary extracts reminder time from user message
4. Notification: Push via ntfy at specified time

**Database Schema**:
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),  -- Optional link
  title VARCHAR(255) NOT NULL,
  remind_at TIMESTAMP NOT NULL,
  channel VARCHAR(50) DEFAULT 'ntfy',
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🗄️ DATABASE SCHEMA (Supabase)

### users
```sql
id UUID PRIMARY KEY
telegram_id VARCHAR
username VARCHAR
full_name VARCHAR
email VARCHAR
password VARCHAR
language_code VARCHAR DEFAULT 'en'
is_active BOOLEAN DEFAULT true
created_at, updated_at TIMESTAMP
```

### tasks
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
title VARCHAR(255)
description TEXT
status VARCHAR(50) -- 'pending', 'in_progress', 'completed', 'archived'
priority VARCHAR(50) -- 'low', 'medium', 'high'
due_date TIMESTAMP
reminder_sent BOOLEAN DEFAULT false
created_at, updated_at TIMESTAMP
```

### ideas
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
title VARCHAR(255)
description TEXT
type VARCHAR(50) -- 'business', 'content', 'marketing', 'product'
status VARCHAR(50) -- 'draft', 'in_review', 'approved', 'archived'
tags JSONB
created_at, updated_at TIMESTAMP
```

### contacts
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
name VARCHAR(255)
email VARCHAR
phone VARCHAR
company VARCHAR
role VARCHAR
notes TEXT
created_at TIMESTAMP
```

### user_preferences
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
preference_key VARCHAR(255)
preference_value TEXT
created_at, updated_at TIMESTAMP
```

### knowledge_base (Vector Store)
```sql
id UUID PRIMARY KEY
user_id UUID
content TEXT
content_type VARCHAR -- 'conversation', 'note', 'idea'
embedding VECTOR(768)
metadata JSONB
created_at TIMESTAMP
```

### competitors
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
name VARCHAR(255)
platform VARCHAR
url VARCHAR
last_scraped_at TIMESTAMP
created_at TIMESTAMP
```

### social_stats
```sql
id UUID PRIMARY KEY
competitor_id UUID REFERENCES competitors(id)
follower_count INTEGER
viral_score INTEGER
summary_analysis TEXT
recent_posts JSONB
is_running_ads BOOLEAN
scraped_at TIMESTAMP DEFAULT NOW()
```

### conversations
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
thread_id UUID
thread_name VARCHAR
role VARCHAR -- 'user', 'assistant'
content TEXT
created_at TIMESTAMP
```

---

## 🛠️ N8N MCP TOOLS USAGE

### Available Tools (via n8n-mcp)
```
search_nodes      - Find nodes by name/category
get_node_info     - Get detailed node documentation
get_node_essentials - Get essential properties only
validate_node_config - Validate before deployment
list_nodes        - List all available nodes
get_examples      - Get real-world configuration examples
```

### Workflow Management Tools
```
n8n_list_workflows     - List all workflows
n8n_get_workflow       - Get workflow by ID
n8n_create_workflow    - Create new workflow
n8n_update_workflow    - Update existing workflow
n8n_activate_workflow  - Activate/deactivate workflow
n8n_execute_workflow   - Trigger workflow execution
```

### CRITICAL: Workflow JSON Structure
```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": { /* node-specific config */ },
      "type": "n8n-nodes-base.nodeName",
      "typeVersion": 1,
      "position": [x, y],
      "id": "unique-uuid",
      "name": "Node Display Name",
      "credentials": { /* if needed */ }
    }
  ],
  "connections": {
    "Source Node Name": {
      "main": [[
        {
          "node": "Target Node Name",
          "type": "main",
          "index": 0
        }
      ]]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  }
}
```

### CRITICAL: addConnection Syntax
```json
// ✅ CORRECT
{
  "type": "addConnection",
  "source": "node-id-string",
  "target": "target-node-id-string",
  "sourcePort": "main",
  "targetPort": "main"
}

// ❌ WRONG - Object format
{
  "type": "addConnection",
  "connection": { "source": {...}, "destination": {...} }
}
```

---

## 📐 WORKFLOW PATTERNS

### Pattern 1: Webhook → Process → Respond
```
Webhook → [Logic Nodes] → Respond to Webhook
```

### Pattern 2: Sub-workflow Tool
```
Execute Workflow Trigger → [Process] → Return Data
(Called by toolWorkflow node from main workflow)
```

### Pattern 3: Scheduled Task
```
Schedule Trigger → [Fetch Data] → [Process] → [Notify]
```

### Pattern 4: AI Agent with Tools
```
Input → AI Agent ← Multiple toolWorkflow connections
         ↓
    Output Processing
```

---

## 🚫 THINGS TO AVOID

1. **DO NOT** delete or modify core workflow IDs without backup
2. **DO NOT** hardcode user_ids - always use dynamic references
3. **DO NOT** use synchronous waits for non-critical operations
4. **DO NOT** forget to validate AI Agent tool descriptions
5. **DO NOT** create workflows without proper error handling

---

## ✅ VALIDATION CHECKLIST

Before deploying any workflow:

- [ ] All node IDs are unique UUIDs
- [ ] Connections reference correct node names
- [ ] Credentials are properly linked (use existing credential IDs)
- [ ] AI Agent system prompts follow ZERO MARKDOWN POLICY
- [ ] Sub-workflows have proper Execute Workflow Trigger inputs
- [ ] Database operations include user_id filtering
- [ ] Webhook endpoints have unique paths

---

## 📚 REFERENCE: Existing Credential IDs

```
supabaseApi: "JbItbwVcQiGCLFAC" (NemoAIDatabase)
googlePalmApi: "qJ3tJlGTxwiZCORz" (Google Gemini)
googleCalendarOAuth2Api: "Tg4EGHG42FxepYAW" (Google Calendar)
apifyApi: "nkDHhtz7koGci1VE" (Apify account)
```

---

## 🎯 STEP-BY-STEP: How to Work on This Project

### Step 1: Study Existing Workflows
```bash
# Use n8n MCP to fetch current workflow
n8n_get_workflow --id "o5t83JWF11dsSfyi"  # Web API Router
```

### Step 2: Study Frontend Integration
- Examine how frontend calls webhooks
- Check request/response formats
- Understand user_id and thread_id flow

### Step 3: Study Database Schema
- Use Supabase MCP to query tables
- Understand relationships between tables
- Check existing data patterns

### Step 4: Make Changes
1. Create workflow JSON locally
2. Validate with `validate_node_config`
3. Test in n8n UI first
4. Deploy via API when confirmed working

### Step 5: Document Changes
- Update this CLAUDE.md with any new workflows
- Note any new credential requirements
- Document any schema changes

---

## 📝 NOTES FOR FUTURE SESSIONS

- Owner prefers simple explanations (non-technical background)
- System uses Myanmar language for some user-facing content
- ntfy is the notification channel (not Telegram)
- Frontend is TypeScript-based, already built
- All workflows should maintain ZERO MARKDOWN POLICY in AI responses

---

*Last Updated: January 2026*
*Project Owner: Ther Swam Htet*
*System: NemoAI Personal Assistant*
