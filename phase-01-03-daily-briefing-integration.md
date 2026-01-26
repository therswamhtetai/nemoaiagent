# Phase 01-03: Daily Briefing Tool Integration

## Objective
Add the daily_briefing tool to the Web API Router (ID: o5t83JWF11dsSfyi) so users can trigger briefings on-demand from chat.

## Implementation Steps

### Step 1: Add toolWorkflow Node

Add this node to the Web API Router workflow:

```json
{
  "parameters": {
    "workflowId": "mBFd8G3ujZjK7-N",
    "name": "daily_briefing",
    "description": "Generate personalized daily briefing with task summaries",
    "options": {
      "executionTimeout": 300
    }
  },
  "type": "n8n-nodes-base.toolWorkflow",
  "id": "daily-briefing-tool-uuid",
  "name": "Daily Briefing Tool",
  "position": [800, 600]
}
```

### Step 2: Update AI Agent System Prompt

In the "Jarvis Brain" AI Agent, add this tool description:

```
- daily_briefing: Generate personalized daily briefing with task summaries, upcoming deadlines, and priority tasks
```

### Step 3: Deploy via n8n MCP

Use this n8n MCP command:

```bash
npx -y @n8n/mcp-server/cli n8n_update_partial_workflow \
  --id "o5t83JWF11dsSfyi" \
  --node '{"parameters": {"workflowId": "mBFd8G3ujZjK7-N", "name": "daily_briefing", "description": "Generate personalized daily briefing with task summaries", "options": {"executionTimeout": 300}}, "type": "n8n-nodes-base.toolWorkflow", "id": "daily-briefing-tool-uuid", "name": "Daily Briefing Tool", "position": [800, 600]}'
```

## Expected Result

After integration, users can trigger briefings by typing:
- "Give me today's briefing"
- "Generate my daily summary"
- "Show me my tasks for today"

The AI Agent will route this request to the daily_briefing tool, which will execute the enhanced workflow (ID: mBFd8G3ujZjK7-N) and return a personalized briefing.

## Testing Checklist

- [ ] Add toolWorkflow node to Web API Router
- [ ] Update AI Agent system prompt
- [ ] Deploy changes to n8n
- [ ] Test on-demand briefing from chat
- [ ] Verify scheduled briefings still work
- [ ] Check response time < 10 seconds

## Current Workflow Status

- **Daily Briefing**: ✅ Enhanced and deployed (ID: mBFd8G3ujZjK7-N)
- **Web API Router**: 🔄 Needs daily_briefing tool integration
- **Phase 01-03**: 🚧 In Progress