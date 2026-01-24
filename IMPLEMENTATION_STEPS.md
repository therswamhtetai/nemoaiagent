# IMPLEMENTATION_STEPS.md - NemoAI Upgrade Plan

## 📋 Overview

This document provides step-by-step implementation guides for the three priority improvements:
- **A) Response Speed Optimization**
- **C) Daily Briefing Integration**
- **D) Reminder System**

---

## 🚀 PRIORITY A: Response Speed Optimization

### Current State
- Average response time: 10-20 seconds
- Memory save blocks every response
- No pre-classification for simple queries

### Target State
- Average response time: 3-5 seconds
- Memory save runs asynchronously
- Simple queries bypass AI reasoning

---

### Step A1: Make Memory Save Async

**Location**: Web API Router (`o5t83JWF11dsSfyi`)

**Current Flow**:
```
Jarvis Brain → Save to Long-term Memory (WAIT) → Clean Response → Respond
```

**New Flow**:
```
Jarvis Brain → Clean Response → Respond
     ↓
Save to Long-term Memory (ASYNC - no wait)
```

**Implementation**:

1. Find the "Save to Long-term Memory" node in Web API Router
2. Change `waitForSubWorkflow` from `true` to `false`:

```json
{
  "parameters": {
    "workflowId": {
      "__rl": true,
      "value": "wNgClCaTC4qSw4er",
      "mode": "list"
    },
    "workflowInputs": {
      // ... existing config
    },
    "options": {
      "waitForSubWorkflow": false  // ← CHANGE THIS
    }
  },
  "type": "n8n-nodes-base.executeWorkflow",
  "name": "Save to Long-term Memory"
}
```

3. Move the connection so it branches from Jarvis Brain:
```
Jarvis Brain ─┬─→ Clean Response → Save AI Msg → Respond
              │
              └─→ Save to Long-term Memory (async)
```

**Expected Impact**: -3 to -5 seconds response time

---

### Step A2: Add Pre-Classification Switch

**Purpose**: Route simple commands directly without AI thinking

**New Node to Add** (before Jarvis Brain):

```json
{
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "conditions": [
              {
                "leftValue": "={{ $json.final_message.toLowerCase() }}",
                "rightValue": "task|to-do|remind|schedule",
                "operator": {
                  "type": "string",
                  "operation": "regex"
                }
              }
            ]
          },
          "outputKey": "tasks"
        },
        {
          "conditions": {
            "conditions": [
              {
                "leftValue": "={{ $json.final_message.toLowerCase() }}",
                "rightValue": "gold|dollar|exchange|price",
                "operator": {
                  "type": "string",
                  "operation": "regex"
                }
              }
            ]
          },
          "outputKey": "market"
        },
        {
          "conditions": {
            "conditions": [
              {
                "leftValue": "={{ $json.final_message.toLowerCase() }}",
                "rightValue": "briefing|summary|today",
                "operator": {
                  "type": "string",
                  "operation": "regex"
                }
              }
            ]
          },
          "outputKey": "briefing"
        }
      ],
      "fallbackOutput": "default"
    }
  },
  "type": "n8n-nodes-base.switch",
  "name": "Quick Route"
}
```

**New Flow**:
```
Save User Msg → Quick Route ─┬─→ [tasks] → ops_secretary (direct)
                             ├─→ [market] → research_market (direct)
                             ├─→ [briefing] → daily_briefing (direct)
                             └─→ [default] → Jarvis Brain (full AI)
```

**Expected Impact**: -5 seconds for simple queries

---

### Step A3: Reduce Context Window

**Location**: Simple Memory node in Web API Router

**Change**:
```json
{
  "parameters": {
    "sessionIdType": "customKey",
    "sessionKey": "={{ $('Merge User').first().json.id }}",
    "contextWindowLength": 6  // ← REDUCE from 10 to 6
  },
  "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  "name": "Simple Memory"
}
```

**Expected Impact**: Faster AI processing, slightly less context

---

## 📅 PRIORITY C: Daily Briefing Integration

### Current State
- Separate node chains for each user (hardcoded)
- Not callable from chat
- Only schedule-triggered

### Target State
- Single dynamic workflow with Loop
- Callable via "Today briefing" in chat
- Both scheduled and on-demand

---

### Step C1: Create New Dynamic Daily Briefing Workflow

**New Workflow: `Nemo - Daily Briefing v2`**

```json
{
  "name": "Nemo - Daily Briefing v2",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "triggerAtHour": 8 }]
        }
      },
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [0, 0],
      "id": "schedule-trigger",
      "name": "Morning Trigger (8 AM)"
    },
    {
      "parameters": {
        "workflowInputs": {
          "values": [
            { "name": "user_id" },
            { "name": "trigger_type" }
          ]
        }
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "position": [0, 200],
      "id": "on-demand-trigger",
      "name": "On-Demand Trigger"
    },
    {
      "parameters": {
        "mode": "chooseBranch",
        "output": "all"
      },
      "type": "n8n-nodes-base.merge",
      "position": [200, 100],
      "id": "merge-triggers",
      "name": "Merge Triggers"
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{ $json.user_id }}",
              "rightValue": "",
              "operator": { "type": "string", "operation": "notEmpty" }
            }
          ]
        }
      },
      "type": "n8n-nodes-base.if",
      "position": [400, 100],
      "id": "check-single-user",
      "name": "Single User or All?"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "users",
        "returnAll": true,
        "filters": {
          "conditions": [
            { "keyName": "is_active", "condition": "eq", "keyValue": "true" }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "position": [600, 200],
      "id": "get-all-users",
      "name": "Get All Active Users",
      "credentials": { "supabaseApi": { "id": "JbItbwVcQiGCLFAC" } }
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "type": "n8n-nodes-base.splitInBatches",
      "position": [800, 100],
      "id": "loop-users",
      "name": "Loop Each User"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "tasks",
        "returnAll": true,
        "filters": {
          "conditions": [
            { "keyName": "user_id", "condition": "eq", "keyValue": "={{ $json.id }}" },
            { "keyName": "status", "condition": "neq", "keyValue": "completed" },
            { "keyName": "status", "condition": "neq", "keyValue": "archived" }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "position": [1000, 100],
      "id": "get-user-tasks",
      "name": "Get User Tasks",
      "credentials": { "supabaseApi": { "id": "JbItbwVcQiGCLFAC" } }
    },
    {
      "parameters": {
        "jsCode": "// Task categorization code (same as existing)\nconst tasks = $input.all().map(i => i.json);\nconst now = new Date();\n// ... (use existing Code Node logic from Daily Briefing)\nreturn { json: { /* categorized data */ } };"
      },
      "type": "n8n-nodes-base.code",
      "position": [1200, 100],
      "id": "categorize-tasks",
      "name": "Categorize Tasks"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Generate briefing for user {{ $json.user_name }}...",
        "messages": { "messageValues": [{ "message": "..." }] }
      },
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "position": [1400, 100],
      "id": "generate-briefing",
      "name": "Generate Briefing"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://ntfy.sh/{{ $json.ntfy_topic }}",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "title", "value": "🌅 NemoAI Daily Briefing" },
            { "name": "message", "value": "={{ $json.briefing }}" }
          ]
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "position": [1600, 100],
      "id": "send-ntfy",
      "name": "Send via ntfy"
    }
  ],
  "connections": {
    "Morning Trigger (8 AM)": { "main": [[{ "node": "Merge Triggers", "type": "main", "index": 0 }]] },
    "On-Demand Trigger": { "main": [[{ "node": "Merge Triggers", "type": "main", "index": 1 }]] },
    "Merge Triggers": { "main": [[{ "node": "Check Single User or All?", "type": "main", "index": 0 }]] },
    "Check Single User or All?": {
      "main": [
        [{ "node": "Loop Each User", "type": "main", "index": 0 }],
        [{ "node": "Get All Active Users", "type": "main", "index": 0 }]
      ]
    },
    "Get All Active Users": { "main": [[{ "node": "Loop Each User", "type": "main", "index": 0 }]] },
    "Loop Each User": { "main": [[{ "node": "Get User Tasks", "type": "main", "index": 0 }]] },
    "Get User Tasks": { "main": [[{ "node": "Categorize Tasks", "type": "main", "index": 0 }]] },
    "Categorize Tasks": { "main": [[{ "node": "Generate Briefing", "type": "main", "index": 0 }]] },
    "Generate Briefing": { "main": [[{ "node": "Send via ntfy", "type": "main", "index": 0 }]] }
  }
}
```

---

### Step C2: Add daily_briefing Tool to Web API Router

**Add to Jarvis Brain's tools**:

```json
{
  "parameters": {
    "description": "Generate daily briefing with task summary. Use when user asks for 'briefing', 'today summary', 'what's on my plate', etc.",
    "workflowId": {
      "__rl": true,
      "value": "NEW_BRIEFING_WORKFLOW_ID",
      "mode": "list",
      "cachedResultName": "Nemo - Daily Briefing v2"
    },
    "workflowInputs": {
      "mappingMode": "defineBelow",
      "value": {
        "user_id": "={{ $('Merge User').first().json.id }}",
        "trigger_type": "on_demand"
      }
    }
  },
  "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
  "name": "daily_briefing"
}
```

**Update Jarvis Brain System Prompt** (add to tool descriptions):
```
9. daily_briefing (Your Schedule)
   - Use for: "Today's briefing", "What's on my plate?", "Summary"
   - Logic: Returns categorized tasks with AI commentary.
```

---

## 🔔 PRIORITY D: Reminder System

### Overview
Users can say: "Remind me to call John at 3 PM tomorrow"
System will push notification at exactly that time.

---

### Step D1: Create Database Table

**Run this SQL in Supabase**:

```sql
-- Create reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  channel VARCHAR(50) DEFAULT 'ntfy',
  channel_config JSONB DEFAULT '{}',
  is_sent BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_reminders_pending ON reminders(remind_at, is_sent, is_cancelled)
WHERE is_sent = false AND is_cancelled = false;

-- Create index for user lookups
CREATE INDEX idx_reminders_user ON reminders(user_id);

-- Add RLS (Row Level Security) if needed
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
```

---

### Step D2: Create Reminder Manager Workflow

**New Workflow: `Nemo - Reminder Manager`**

```json
{
  "name": "Nemo - Reminder Manager",
  "nodes": [
    {
      "parameters": {
        "workflowInputs": {
          "values": [
            { "name": "action" },
            { "name": "user_id" },
            { "name": "title" },
            { "name": "remind_at" },
            { "name": "task_id" }
          ]
        }
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "position": [0, 0],
      "id": "reminder-input",
      "name": "Reminder Input"
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "conditions": [
                  { "leftValue": "={{ $json.action }}", "rightValue": "create", "operator": { "type": "string", "operation": "equals" } }
                ]
              },
              "outputKey": "create"
            },
            {
              "conditions": {
                "conditions": [
                  { "leftValue": "={{ $json.action }}", "rightValue": "list", "operator": { "type": "string", "operation": "equals" } }
                ]
              },
              "outputKey": "list"
            },
            {
              "conditions": {
                "conditions": [
                  { "leftValue": "={{ $json.action }}", "rightValue": "cancel", "operator": { "type": "string", "operation": "equals" } }
                ]
              },
              "outputKey": "cancel"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.switch",
      "position": [200, 0],
      "id": "action-switch",
      "name": "Action Switch"
    },
    {
      "parameters": {
        "tableId": "reminders",
        "fieldsUi": {
          "fieldValues": [
            { "fieldId": "user_id", "fieldValue": "={{ $('Reminder Input').item.json.user_id }}" },
            { "fieldId": "title", "fieldValue": "={{ $('Reminder Input').item.json.title }}" },
            { "fieldId": "remind_at", "fieldValue": "={{ $('Reminder Input').item.json.remind_at }}" },
            { "fieldId": "task_id", "fieldValue": "={{ $('Reminder Input').item.json.task_id || null }}" }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "position": [400, -100],
      "id": "create-reminder",
      "name": "Create Reminder",
      "credentials": { "supabaseApi": { "id": "JbItbwVcQiGCLFAC" } }
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "reminders",
        "returnAll": true,
        "filters": {
          "conditions": [
            { "keyName": "user_id", "condition": "eq", "keyValue": "={{ $('Reminder Input').item.json.user_id }}" },
            { "keyName": "is_sent", "condition": "eq", "keyValue": "false" },
            { "keyName": "is_cancelled", "condition": "eq", "keyValue": "false" }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "position": [400, 0],
      "id": "list-reminders",
      "name": "List Reminders",
      "credentials": { "supabaseApi": { "id": "JbItbwVcQiGCLFAC" } }
    }
  ],
  "connections": {
    "Reminder Input": { "main": [[{ "node": "Action Switch", "type": "main", "index": 0 }]] },
    "Action Switch": {
      "main": [
        [{ "node": "Create Reminder", "type": "main", "index": 0 }],
        [{ "node": "List Reminders", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

---

### Step D3: Create Reminder Checker Workflow (Cron)

**New Workflow: `Nemo - Reminder Checker`**

```json
{
  "name": "Nemo - Reminder Checker",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "minutes", "minutesInterval": 5 }]
        }
      },
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [0, 0],
      "id": "cron-5min",
      "name": "Every 5 Minutes"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "reminders",
        "returnAll": true,
        "filters": {
          "conditions": [
            { "keyName": "is_sent", "condition": "eq", "keyValue": "false" },
            { "keyName": "is_cancelled", "condition": "eq", "keyValue": "false" },
            { "keyName": "remind_at", "condition": "lte", "keyValue": "={{ $now.toISO() }}" }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "position": [200, 0],
      "id": "get-due-reminders",
      "name": "Get Due Reminders",
      "credentials": { "supabaseApi": { "id": "JbItbwVcQiGCLFAC" } }
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            { "leftValue": "={{ $json.id }}", "rightValue": "", "operator": { "type": "string", "operation": "notEmpty" } }
          ]
        }
      },
      "type": "n8n-nodes-base.if",
      "position": [400, 0],
      "id": "has-reminders",
      "name": "Any Reminders?"
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "type": "n8n-nodes-base.splitInBatches",
      "position": [600, 0],
      "id": "loop-reminders",
      "name": "Loop Each Reminder"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "users",
        "limit": 1,
        "filters": {
          "conditions": [
            { "keyName": "id", "condition": "eq", "keyValue": "={{ $json.user_id }}" }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "position": [800, 0],
      "id": "get-user",
      "name": "Get User Info",
      "credentials": { "supabaseApi": { "id": "JbItbwVcQiGCLFAC" } }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://ntfy.sh/nemoai-{{ $json.username }}",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"topic\": \"nemoai-{{ $json.username }}\",\n  \"title\": \"⏰ Reminder\",\n  \"message\": \"{{ $('Loop Each Reminder').item.json.title }}\",\n  \"priority\": 4\n}"
      },
      "type": "n8n-nodes-base.httpRequest",
      "position": [1000, 0],
      "id": "send-ntfy",
      "name": "Send ntfy Notification"
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "reminders",
        "filters": {
          "conditions": [
            { "keyName": "id", "condition": "eq", "keyValue": "={{ $('Loop Each Reminder').item.json.id }}" }
          ]
        },
        "fieldsUi": {
          "fieldValues": [
            { "fieldId": "is_sent", "fieldValue": "true" }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "position": [1200, 0],
      "id": "mark-sent",
      "name": "Mark as Sent",
      "credentials": { "supabaseApi": { "id": "JbItbwVcQiGCLFAC" } }
    }
  ],
  "connections": {
    "Every 5 Minutes": { "main": [[{ "node": "Get Due Reminders", "type": "main", "index": 0 }]] },
    "Get Due Reminders": { "main": [[{ "node": "Any Reminders?", "type": "main", "index": 0 }]] },
    "Any Reminders?": { "main": [[{ "node": "Loop Each Reminder", "type": "main", "index": 0 }], []] },
    "Loop Each Reminder": { "main": [[{ "node": "Get User Info", "type": "main", "index": 0 }]] },
    "Get User Info": { "main": [[{ "node": "Send ntfy Notification", "type": "main", "index": 0 }]] },
    "Send ntfy Notification": { "main": [[{ "node": "Mark as Sent", "type": "main", "index": 0 }]] },
    "Mark as Sent": { "main": [[{ "node": "Loop Each Reminder", "type": "main", "index": 0 }]] }
  }
}
```

---

### Step D4: Add Reminder Tool to Ops Secretary

**Update ops_secretary system prompt**:

```
🛠️ REMINDER HANDLING:

When user mentions a specific reminder time:
1. Extract the exact datetime (e.g., "3 PM tomorrow" → "2026-01-25T15:00:00+06:30")
2. Call manage_reminder tool with action='create'
3. Confirm: "I'll remind you about [title] at [time]."

Examples:
- "Remind me to call John at 3 PM" → Create reminder for today 3 PM
- "Remind me about the meeting tomorrow morning" → Create reminder for tomorrow 9 AM
- "Set a reminder for Friday 5 PM to submit report" → Create reminder for Friday 5 PM
```

**Add new tool to ops_secretary**:

```json
{
  "parameters": {
    "description": "Create, list, or cancel reminders. Use action='create' with title and remind_at (ISO datetime).",
    "workflowId": {
      "__rl": true,
      "value": "REMINDER_MANAGER_WORKFLOW_ID",
      "mode": "list"
    },
    "workflowInputs": {
      "mappingMode": "defineBelow",
      "value": {
        "action": "={{ $fromAI('action', 'create, list, or cancel') }}",
        "user_id": "={{ $('Execute Workflow Trigger').item.json.user_id }}",
        "title": "={{ $fromAI('title', 'What to remind about') }}",
        "remind_at": "={{ $fromAI('remind_at', 'ISO datetime string') }}"
      }
    }
  },
  "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
  "name": "manage_reminder"
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Speed Optimization (Day 1)
- [ ] Make Memory Save async in Web API Router
- [ ] Reduce contextWindowLength to 6
- [ ] Test response times

### Phase 2: Pre-Classification (Day 1-2)
- [ ] Add Quick Route Switch node
- [ ] Create direct routes for common queries
- [ ] Test with various inputs

### Phase 3: Daily Briefing v2 (Day 2-3)
- [ ] Create new dynamic briefing workflow
- [ ] Add daily_briefing tool to Router
- [ ] Test scheduled + on-demand triggers
- [ ] Deactivate old Daily Briefing workflow

### Phase 4: Reminder System (Day 3-4)
- [ ] Create reminders table in Supabase
- [ ] Create Reminder Manager workflow
- [ ] Create Reminder Checker cron workflow
- [ ] Add manage_reminder tool to ops_secretary
- [ ] Test end-to-end reminder flow

### Phase 5: Frontend Integration (Day 4-5)
- [ ] Add Reminders tab to frontend
- [ ] Display upcoming reminders
- [ ] Allow manual reminder creation

---

## 🧪 TESTING CHECKLIST

### Speed Tests
```
Input: "check task"
Expected: Response < 5 seconds

Input: "gold price"
Expected: Response < 5 seconds

Input: "I'm thinking about starting a coffee shop business"
Expected: Response < 15 seconds (complex analysis)
```

### Daily Briefing Tests
```
Input: "Today briefing"
Expected: Returns categorized task summary

Input: (8 AM automatic trigger)
Expected: All active users receive ntfy notification
```

### Reminder Tests
```
Input: "Remind me to call John at 3 PM"
Expected: Confirmation message + reminder created

At 3 PM:
Expected: ntfy notification "⏰ Reminder: Call John"
```

---

*Document Version: 1.0*
*Last Updated: January 2026*
