# WORKFLOW_STRUCTURE.md - NemoAI Workflow Reference

## 📊 Current Workflow Hierarchy

```
                        ┌─────────────────────────────────────┐
                        │         ENTRY POINTS                │
                        └─────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│   Frontend    │              │    Voice      │              │   Schedule    │
│   Webhook     │              │   Webhook     │              │   Triggers    │
│ /webhook/chat │              │/webhook/voice │              │   (Cron)      │
└───────┬───────┘              └───────┬───────┘              └───────┬───────┘
        │                               │                               │
        │                               ▼                               │
        │                      ┌───────────────┐                        │
        │                      │    Voice      │                        │
        │                      │   Pipeline    │                        │
        │                      │ (Transcribe)  │                        │
        │                      └───────┬───────┘                        │
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        │
                                        ▼
                        ┌─────────────────────────────────────┐
                        │      WEB API ROUTER                 │
                        │      (Main Brain)                   │
                        │      ID: o5t83JWF11dsSfyi           │
                        └─────────────────┬───────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
            ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
            │    AI       │       │   Memory    │       │  Database   │
            │   Tools     │       │   Tools     │       │   Tools     │
            └─────┬───────┘       └─────┬───────┘       └─────┬───────┘
                  │                     │                     │
    ┌─────────────┼─────────────┐       │       ┌─────────────┼─────────────┐
    │             │             │       │       │             │             │
    ▼             ▼             ▼       ▼       ▼             ▼             ▼
┌───────┐   ┌───────┐   ┌───────┐ ┌───────┐ ┌───────┐   ┌───────┐   ┌───────┐
│  Ops  │   │Market │   │Business│ │Memory │ │Memory │   │Contact│   │ Idea  │
│ Secy  │   │ Intel │   │Strateg │ │ Save  │ │Retriev│   │Manager│   │Manager│
└───┬───┘   └───────┘   └───────┘ └───────┘ └───────┘   └───────┘   └───────┘
    │
    ▼
┌───────────────┐
│  Task         │
│  Manager      │
└───────────────┘
```

---

## 📁 Workflow Details

### 1. WEB API ROUTER (Main Brain)
**ID**: `o5t83JWF11dsSfyi`
**Type**: Main orchestrator
**Triggers**: Webhook, Execute Workflow

**Nodes**:
- `Webhook` - Receives POST /webhook/chat
- `When Executed by Another Workflow` - For internal calls
- `Merge User` - Normalizes input data
- `Get Thread Name` - Retrieves conversation name
- `Find Name Logic` - Processes thread info
- `Save User Msg` - Stores user message
- `Jarvis Brain` - AI Agent (main reasoning)
- `Simple Memory` - Buffer memory (10 messages)
- `Save to Long-term Memory` - Vector storage
- `Clean Response` - Removes tool logs
- `Save AI Msg` - Stores AI response
- `Respond to Webhook` - Returns response

**Connected Tools (8)**:
| Tool Name | Workflow ID | Purpose |
|-----------|-------------|---------|
| ops_secretary | M9qgqvtsa5nuHUQ3 | Task management |
| analyze_business | DvvZiJ0n2HvbkAax | Business analysis |
| research_market | Td29kBFdqAqSxBpo | Web search |
| search_memory | volKVoT9R96UigzM | Memory retrieval |
| manage_preferences | 7g0eMB0yVqi8yMmQ | User preferences |
| manage_contact | M61NswfHOOsFxrL6 | Contact CRUD |
| manage_ideas | rk_RR1SePy-TNVo68mZRu | Ideas CRUD |
| social_scout | HCV-51qLaCdcxHGx2yBcO | Facebook scraping |

---

### 2. OPS SECRETARY
**ID**: `M9qgqvtsa5nuHUQ3`
**Type**: Sub-workflow (Tool)
**Called by**: Web API Router

**Purpose**: Intelligent task management with status tracking

**Nodes**:
- `Execute Workflow Trigger` - Input handler
- `AI Agent` - Task reasoning
- `Simple Memory` - Conversation context
- `check_task` - Supabase tool (getAll)
- `manage_task` - Calls Task Manager
- `complete_task` - Supabase tool (update)
- `delete_task` - Supabase tool (delete)
- `Edit Fields` - Output formatting

**Key Logic**:
- MUST check_task before any update
- Extracts: title, description, priority, due_date
- Confirms deletion before executing

---

### 3. TASK MANAGER
**ID**: `JWwLi4Zo4Zqh7igS`
**Type**: Sub-workflow (Simple CRUD)
**Called by**: Ops Secretary

**Nodes**:
- `Task Input` - Receives task data
- `Create a row` - Supabase insert

**Input Fields**:
- title (required)
- description
- priority (low/medium/high)
- due_date (ISO timestamp)
- user_id (required)

---

### 4. BUSINESS STRATEGIST
**ID**: `DvvZiJ0n2HvbkAax`
**Type**: Sub-workflow (Tool)
**Called by**: Web API Router

**Purpose**: Business analysis, SWOT, ROI calculations

**Nodes**:
- `Strategy Request` - Input handler
- `Business Strategist` - AI Agent
- `search_memory` - Tool for context
- `Format Output` - JSON output

**Output Format**:
```json
{
  "analysis_type": "Strategy / SWOT / ROI",
  "summary": "One sentence summary",
  "data": { "point_1": "...", "point_2": "..." },
  "recommendation": "Key action step",
  "confidence_score": 0.95
}
```

---

### 5. MARKET INTEL AGENT
**ID**: `Td29kBFdqAqSxBpo`
**Type**: Sub-workflow (Tool)
**Called by**: Web API Router

**Purpose**: Real-time web search for prices, news

**Nodes**:
- `When Executed by Another Workflow` - Input
- `The Researcher` - AI Agent
- `web_search` - Tavily API tool
- `Edit Fields` - Output formatting

**Uses**: Tavily API for web search

---

### 6. CALENDAR MANAGER
**ID**: `GTRv70JqhEekrbLN`
**Type**: Sub-workflow
**Status**: NOT connected to Router (missing tool)

**Actions**:
- `check` - Get events in time range
- `schedule` - Create new event

**Nodes**:
- `Execute Workflow Trigger` - Input
- `Switch` - Route by action
- `Get many events` - Google Calendar
- `Create an event` - Google Calendar
- `Summary` - Format output

---

### 7. CONTACT MANAGER
**ID**: `M61NswfHOOsFxrL6`
**Type**: Sub-workflow (Tool)
**Called by**: Web API Router

**Actions**:
- `search` - Find contact by name
- `save` - AI extracts and saves contact

**Nodes**:
- `Execute Workflow Trigger` - Input
- `Switch` - Route by action
- `Get many rows` - Search contacts
- `AI Agent` - Extract contact info
- `Create a row` - Save to Supabase

---

### 8. PREFERENCE MANAGER
**ID**: `7g0eMB0yVqi8yMmQ`
**Type**: Sub-workflow (Tool)
**Called by**: Web API Router

**Actions**:
- `save` - Store user preference
- `get` - Retrieve all preferences

**Logic**:
- AI extracts key/value from text
- Upsert logic (update if exists)

---

### 9. SAVE TO MEMORY TOOL
**ID**: `wNgClCaTC4qSw4er`
**Type**: Sub-workflow
**Called by**: Web API Router (after every response)

**Purpose**: Vector embedding for long-term memory

**Nodes**:
- `Memory Save Input` - Input
- `Prepare Request` - Clean content
- `Generate Embedding` - Google Embedding API
- `Create a row` - Supabase knowledge_base

**Model**: `models/embedding-001` (768 dimensions)

---

### 10. MEMORY RETRIEVAL TOOL
**ID**: `volKVoT9R96UigzM`
**Type**: Sub-workflow (Tool)
**Called by**: Web API Router, Business Strategist

**Purpose**: Semantic search in vector store

**Nodes**:
- `Memory Query Input` - Input
- `Vector Search` - Supabase pgvector
- `Embeddings Google Gemini` - Query embedding
- `Format Results` - Structure output

**Query**: Uses `match_documents` function in Supabase

---

### 11. SOCIAL SCOUT
**ID**: `HCV-51qLaCdcxHGx2yBcO`
**Type**: Sub-workflow (Tool)
**Called by**: Web API Router

**Purpose**: Facebook page scraping and analysis

**Nodes**:
- `Execute Workflow Trigger` / `Webhook` - Input
- `Normalize Input` - Clean URL
- `Get Competitor` - Check if exists
- `Create Competitor` - Add if new
- `Apify` - Facebook scraper
- `Get Dataset` - Fetch results
- `Basic LLM Chain` - Analyze data
- `Parse JSON` - Structure output
- `Create a row1` - Save to social_stats

**Uses**: Apify Facebook Pages Scraper

---

### 12. DAILY BRIEFING
**ID**: `vyxpQ5_WIpneleTOCUKRX`
**Type**: Standalone (Scheduled)
**Triggers**: Schedule (8 AM, 9 AM per user)

**Current Problems**:
- Hardcoded user_ids (duplicate nodes per user)
- Not callable from chat
- ~30 nodes for 5 users

**Nodes per user**:
- `Schedule Trigger` - Time-based
- `Supabase` - Get tasks
- `Code Node` - Categorize tasks
- `Basic LLM Chain` - Generate briefing
- `HTTP Request` - Send via ntfy

---

### 13. VOICE PIPELINE
**ID**: `JuKoBjeKk5F-e6KNVtR4t`
**Type**: Entry point
**Trigger**: Webhook POST /webhook/voice-chat

**Nodes**:
- `Webhook` - Receives audio file
- `Transcribe a recording` - Google Gemini
- `Call 'Nemo - Web API Router'` - Forward to main
- `Respond to Webhook` - Return response

---

### 14. AUTH SYSTEM
**ID**: `OPF7ii_KCDkOlZiJqT-BE`
**Type**: Standalone
**Trigger**: Webhook GET /webhook/auth/login

**Purpose**: User login validation

**Nodes**:
- `Webhook` - Receives credentials
- `Get many rows` - Query users table
- `If` - Check if found
- `Code in JavaScript` - Format response
- `Respond to Webhook` - Return result

---

## 🔗 Connection Map

```
Frontend → Webhook → Web API Router
                           │
                           ├── ops_secretary ─── Task Manager
                           ├── analyze_business
                           ├── research_market
                           ├── search_memory
                           ├── manage_preferences
                           ├── manage_contact
                           ├── manage_ideas
                           ├── social_scout
                           │
                           └── [MISSING] daily_briefing
                           └── [MISSING] calendar_manager
                           └── [MISSING] manage_reminder

Voice → Voice Pipeline → Web API Router (same flow)

Schedule → Daily Briefing → ntfy (standalone)

Schedule → [NEW] Reminder Checker → ntfy
```

---

## 📝 Node Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| `Execute Workflow Trigger` | - | Sub-workflow entry point |
| `Switch` | - | Route by condition |
| `AI Agent` | Jarvis Brain | LLM with tools |
| `Basic LLM Chain` | - | Simple LLM call |
| `Code in JavaScript` | - | Data transformation |
| `Get many rows` | - | Supabase SELECT |
| `Create a row` | - | Supabase INSERT |
| `Update a row` | - | Supabase UPDATE |
| `Edit Fields` | Format Output | Set/rename fields |

---

## 🎨 Position Guidelines (n8n Canvas)

```
Standard horizontal flow:
[0, 0] → [200, 0] → [400, 0] → ...

Sub-nodes (tools, memory) below main:
Main: [200, 0]
Tool1: [200, 200]
Tool2: [400, 200]

Parallel branches:
Branch A: [400, -100]
Branch B: [400, 100]
```

---

*Document Version: 1.0*
*Last Updated: January 2026*
