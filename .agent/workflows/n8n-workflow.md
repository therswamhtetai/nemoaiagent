---
description: How to create and manage n8n workflows using n8n-mcp and n8n-skills
---

# n8n Workflow Development Guide

This workflow uses the **n8n-mcp** MCP server and **n8n-skills** repository to build production-ready n8n workflows for NemoAI.

## Prerequisites

- n8n-mcp MCP server configured
- n8n-skills cloned to `./n8n-skills/`
- n8n API credentials from CLAUDE.md

## Step 1: Understand the Node/Tool Needed

1. Use `search_nodes` to find relevant nodes:
```
search_nodes({query: "webhook"})
search_nodes({query: "supabase"})
```

2. Get node details:
```
get_node({nodeType: "nodes-base.webhook"})
get_node({nodeType: "nodes-base.supabase", mode: "docs"})
```

## Step 2: Choose Workflow Pattern

Reference: `./n8n-skills/skills/n8n-workflow-patterns/SKILL.md`

**5 Core Patterns:**
1. **Webhook Processing**: Webhook → Process → Respond
2. **HTTP API Integration**: Trigger → HTTP → Transform → Store
3. **Database Operations**: Trigger → Query → Transform → Action
4. **AI Workflows**: Trigger → AI Agent ← Tools
5. **Scheduled Tasks**: Schedule → Fetch → Process → Notify

## Step 3: Build Workflow JSON

**Node Type Format:**
- Search/Validate: `nodes-base.webhook`
- Workflow JSON: `n8n-nodes-base.webhook`

**Basic Structure:**
```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": {},
      "type": "n8n-nodes-base.nodeName",
      "typeVersion": 1,
      "position": [x, y],
      "id": "unique-uuid",
      "name": "Node Display Name",
      "credentials": {}
    }
  ],
  "connections": {
    "Source Node": {
      "main": [[{
        "node": "Target Node",
        "type": "main",
        "index": 0
      }]]
    }
  },
  "active": false,
  "settings": { "executionOrder": "v1" }
}
```

## Step 4: Validate Configuration

1. Validate individual nodes:
```
validate_node({
  nodeType: "nodes-base.supabase",
  config: { operation: "getAll", tableId: "tasks" },
  profile: "runtime"
})
```

2. Fix errors and re-validate until clean.

## Step 5: Create/Update Workflow

// turbo-all
**Create:**
```
n8n_create_workflow({name: "My Workflow", nodes: [...], connections: {...}})
```

**Update existing:**
```
n8n_update_partial_workflow({
  id: "workflow-id",
  intent: "Add new node",
  operations: [
    { type: "addNode", node: {...} },
    { type: "addConnection", source: "node-id", target: "target-id", sourcePort: "main", targetPort: "main" }
  ]
})
```

## Step 6: Validate Complete Workflow

```
n8n_validate_workflow({id: "workflow-id"})
```

## Step 7: Activate Workflow

```
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [{ type: "activateWorkflow" }]
})
```

## Important References

| Resource | Location |
|----------|----------|
| n8n-skills | `./n8n-skills/` |
| Expression Syntax | `./n8n-skills/skills/n8n-expression-syntax/SKILL.md` |
| MCP Tools Expert | `./n8n-skills/skills/n8n-mcp-tools-expert/SKILL.md` |
| Workflow Patterns | `./n8n-skills/skills/n8n-workflow-patterns/SKILL.md` |
| Validation Expert | `./n8n-skills/skills/n8n-validation-expert/SKILL.md` |
| Node Configuration | `./n8n-skills/skills/n8n-node-configuration/SKILL.md` |
| Code (JavaScript) | `./n8n-skills/skills/n8n-code-javascript/SKILL.md` |
| Code (Python) | `./n8n-skills/skills/n8n-code-python/SKILL.md` |

## NemoAI Credentials

```
supabaseApi: "JbItbwVcQiGCLFAC"
googlePalmApi: "qJ3tJlGTxwiZCORz"
googleCalendarOAuth2Api: "Tg4EGHG42FxepYAW"
apifyApi: "nkDHhtz7koGci1VE"
```

## Common Patterns for NemoAI

### AI Agent Tool (Sub-workflow)
```json
{
  "parameters": {
    "workflowInputs": {
      "values": [
        { "name": "user_id" },
        { "name": "input_text" }
      ]
    }
  },
  "type": "n8n-nodes-base.executeWorkflowTrigger",
  "name": "Execute Workflow Trigger"
}
```

### Response Format
```json
{
  "parameters": {
    "respondWith": "text",
    "responseBody": "={{ $json.response }}"
  },
  "type": "n8n-nodes-base.respondToWebhook",
  "name": "Respond to Webhook"
}
```
