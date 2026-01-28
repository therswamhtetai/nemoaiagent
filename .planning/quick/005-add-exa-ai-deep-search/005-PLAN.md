# Quick Task 005: Add Exa.ai Deep Search to Market Intel Agent

## Task Description
Integrate Exa.ai as a deep research tool alongside the existing Tavily integration in the Market Intel Agent workflow.

## Goals
1. Add Exa.ai as a second search tool for deep research
2. Keep Tavily for quick, surface-level searches
3. Let the AI Agent intelligently choose which tool based on query complexity

## Tasks

### Task 1: Create Exa.ai Credential
- **Status**: Completed
- Create HTTP Header Auth credential with `x-api-key` header
- Credential ID: `YUchDyQcNWeGiklx`

### Task 2: Add deep_search Node
- **Status**: Completed
- Add `httpRequestTool` node calling Exa.ai API
- Configuration:
  - URL: `https://api.exa.ai/search`
  - Type: `deep`
  - Results: 10
  - Contents: Highlights (3 sentences, 3 per URL)

### Task 3: Connect to AI Agent
- **Status**: Completed
- Wire `deep_search` as second `ai_tool` connection to "The Researcher"

### Task 4: Update System Prompt
- **Status**: Completed
- Add tool selection guidance
- Document when to use each tool

## Configuration Details

### Exa.ai Node Configuration
```json
{
  "name": "deep_search",
  "type": "n8n-nodes-base.httpRequestTool",
  "url": "https://api.exa.ai/search",
  "body": {
    "query": "{{ $fromAI('research_query', '...') }}",
    "type": "deep",
    "numResults": 10,
    "contents": {
      "highlights": {
        "numSentences": 3,
        "highlightsPerUrl": 3
      }
    }
  }
}
```

### Tool Selection Rules
| Tool | Use Case |
|------|----------|
| web_search (Tavily) | Quick prices, today's news, simple facts |
| deep_search (Exa.ai) | Market analysis, competitor research, industry trends |

## Dependencies
- Exa.ai API key: `2c4c2a25-bcc0-49be-babb-3a41e071fec7`
- n8n Credential ID: `YUchDyQcNWeGiklx`
