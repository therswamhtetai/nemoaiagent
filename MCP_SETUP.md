# MCP_SETUP.md - n8n MCP Server Configuration

## 🔧 MCP Server Setup for Claude Code

This document explains how to set up n8n-mcp for building NemoAI workflows.

---

## 📦 Required MCP Servers

### 1. n8n-mcp (Workflow Knowledge)
**Repository**: https://github.com/czlonkowski/n8n-mcp.git
**Purpose**: Node documentation, properties, validation

### 2. n8n-skills (Best Practices)
**Repository**: https://github.com/czlonkowski/n8n-skills.git
**Purpose**: Skills for building production-ready workflows

### 3. Supabase MCP (Already Connected)
**Purpose**: Database operations

---

## 🚀 Installation Steps

### Step 1: Install n8n-mcp

**Option A: Global NPM Install (Recommended)**
```bash
npm install -g n8n-mcp
```

**Option B: From Source**
```bash
git clone https://github.com/czlonkowski/n8n-mcp.git
cd n8n-mcp
npm install
npm run build
```

### Step 2: Install n8n-skills

**Option A: Plugin Installation (Recommended for Claude Code)**
```bash
# In Claude Code
/plugin install czlonkowski/n8n-skills
```

**Option B: Manual Installation**
```bash
git clone https://github.com/czlonkowski/n8n-skills.git
cp -r n8n-skills/skills/* ~/.claude/skills/
```

---

## ⚙️ Configuration

### Claude Code MCP Configuration

Add to your `.mcp.json` or Claude Code settings:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--streamableHttp",
        "https://admin.orcadigital.online/mcp-server/http",
        "--header",
        "authorization:Bearer <YOUR_MCP_TOKEN>"
      ]
    }
  }
}
```

### Supabase REST API

```
Endpoint: See NEXT_PUBLIC_SUPABASE_URL in .env.local
Anon Key: See NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
```

### n8n REST API

```
URL: https://admin.orcadigital.online
API Key: See N8N_API_KEY in .env.local (do NOT commit!)

---



### Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `MCP_MODE` | `stdio` | Communication mode |
| `LOG_LEVEL` | `error` | Reduce noise |
| `DISABLE_CONSOLE_OUTPUT` | `true` | Cleaner output |
| `N8N_API_URL` | `https://admin.orcadigital.online` | Your n8n instance |
| `N8N_API_KEY` | `<YOUR_KEY>` | API authentication |

---

## 🛠️ Available MCP Tools

### Node Documentation Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `search_nodes` | Find nodes by name/category | `search_nodes("webhook")` |
| `get_node_info` | Get detailed node docs | `get_node_info("n8n-nodes-base.webhook")` |
| `get_node_essentials` | Get essential properties only | `get_node_essentials("n8n-nodes-base.supabase")` |
| `validate_node_config` | Validate node configuration | `validate_node_config({...})` |
| `list_nodes` | List all available nodes | `list_nodes()` |
| `get_examples` | Get real-world examples | `get_examples("n8n-nodes-base.httpRequest")` |

### Workflow Management Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `n8n_list_workflows` | List all workflows | `n8n_list_workflows()` |
| `n8n_get_workflow` | Get workflow by ID | `n8n_get_workflow("o5t83JWF11dsSfyi")` |
| `n8n_create_workflow` | Create new workflow | `n8n_create_workflow({...})` |
| `n8n_update_workflow` | Update existing workflow | `n8n_update_workflow("id", {...})` |
| `n8n_update_partial_workflow` | Partial update with operations | `n8n_update_partial_workflow("id", [...])` |
| `n8n_activate_workflow` | Activate/deactivate | `n8n_activate_workflow("id", true)` |
| `n8n_execute_workflow` | Trigger execution | `n8n_execute_workflow("id")` |

---

## 📐 n8n-skills Reference

### Skill 1: n8n Expression Syntax
**Activates when**: Writing expressions, using `{{}}` syntax

**Key Patterns**:
```javascript
// Access current node data
{{ $json.fieldName }}

// Access data from specific node
{{ $('Node Name').item.json.fieldName }}

// Access first item
{{ $('Node Name').first().json.fieldName }}

// Current timestamp
{{ $now.toISO() }}

// Timezone conversion
{{ $now.setZone('Asia/Yangon').toFormat('h:mm a') }}
```

### Skill 2: n8n MCP Tools Expert
**Activates when**: Searching for nodes, validating configs

**Best Practices**:
1. Always search before assuming node exists
2. Use `get_node_essentials` for quick reference
3. Validate configs before deployment
4. Check examples for complex nodes

### Skill 3: n8n Workflow Patterns
**Activates when**: Creating workflows, connecting nodes

**5 Core Patterns**:
1. **Webhook → Process → Respond** (API endpoints)
2. **Schedule → Fetch → Process → Store** (Data pipelines)
3. **Trigger → AI Agent → Tools** (AI workflows)
4. **Main → Sub-workflow** (Modular design)
5. **Loop → Process → Aggregate** (Batch processing)

### Skill 4: n8n Validation Expert
**Activates when**: Validation fails, debugging errors

**Common Fixes**:
- Missing required fields
- Wrong data types
- Invalid node references
- Connection syntax errors

### Skill 5: n8n Node Configuration
**Activates when**: Configuring specific nodes

**Key Nodes for NemoAI**:
- `supabase` - Database operations
- `httpRequest` - External API calls
- `code` - JavaScript transformations
- `switch` - Conditional routing
- `executeWorkflow` - Sub-workflow calls

### Skill 6: n8n Code JavaScript
**Activates when**: Writing Code node logic

**Template**:
```javascript
// Access input
const items = $input.all();

// Process
const results = items.map(item => {
  return {
    json: {
      processed: item.json.value * 2
    }
  };
});

// Return
return results;
```

### Skill 7: n8n Code Python
**Activates when**: Python Code node needed

**Note**: NemoAI uses JavaScript, not Python.

---

## 🔍 Common Operations

### Get Workflow Details
```
Use tool: n8n_get_workflow
Input: { "id": "o5t83JWF11dsSfyi" }
```

### Search for Nodes
```
Use tool: search_nodes
Input: { "query": "supabase", "includeExamples": true }
```

### Validate Configuration
```
Use tool: validate_node_config
Input: {
  "nodeType": "n8n-nodes-base.supabase",
  "config": {
    "operation": "getAll",
    "tableId": "tasks"
  }
}
```

### Update Workflow
```
Use tool: n8n_update_partial_workflow
Input: {
  "id": "workflow-id",
  "operations": [
    {
      "type": "addNode",
      "node": { ... }
    },
    {
      "type": "addConnection",
      "source": "node-id-1",
      "target": "node-id-2",
      "sourcePort": "main",
      "targetPort": "main"
    }
  ]
}
```

---

## ⚠️ Critical Reminders

### 1. Connection Syntax
```json
// ✅ CORRECT
{
  "type": "addConnection",
  "source": "node-id-string",
  "target": "target-node-id-string",
  "sourcePort": "main",
  "targetPort": "main"
}

// ❌ WRONG
{
  "type": "addConnection",
  "connection": { "source": {...}, "destination": {...} }
}
```

### 2. Batch Operations
```json
// ✅ GOOD - Single call with multiple operations
n8n_update_partial_workflow({
  id: "wf-123",
  operations: [
    { type: "addNode", node: {...} },
    { type: "addNode", node: {...} },
    { type: "addConnection", ... }
  ]
})

// ❌ BAD - Multiple separate calls
n8n_update_partial_workflow({id: "wf-123", operations: [{...}]})
n8n_update_partial_workflow({id: "wf-123", operations: [{...}]})
```

### 3. Node IDs
- Must be unique UUIDs
- Use `crypto.randomUUID()` or similar
- Don't reuse IDs across workflows

### 4. Credentials
- Use existing credential IDs from CLAUDE.md
- Don't create new credentials via API
- Reference by ID, not name

---

## 🧪 Testing MCP Connection

### Health Check
```bash
# If using HTTP mode
curl http://localhost:3000/health
```

### List Available Tools
```bash
# In Claude Code
/mcp list-tools
```

### Test Node Search
```
Use tool: search_nodes
Input: { "query": "webhook" }

Expected: List of webhook-related nodes
```

---

## 📚 Additional Resources

- n8n-mcp Documentation: https://github.com/czlonkowski/n8n-mcp
- n8n-skills Documentation: https://github.com/czlonkowski/n8n-skills
- n8n Official Docs: https://docs.n8n.io
- Supabase MCP: (Already configured in project)

---

*Document Version: 1.0*
*Last Updated: January 2026*
