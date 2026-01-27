---
created: 2026-01-28T03:55
title: Add Switch node to route Facebook vs TikTok in Social Scout
area: integration
priority: high
depends_on:
  - 2026-01-28-add-platform-detection-normalize-input.md
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
---

## Problem

After detecting the platform in Normalize Input, the workflow needs to route to different Apify actors based on whether the URL is Facebook or TikTok.

## Solution

Add a Switch node after `Code: Merge ID` node to route based on platform:

### Node Configuration

```json
{
  "parameters": {
    "rules": {
      "values": [
        {
          "conditions": {
            "conditions": [{
              "leftValue": "={{ $('Normalize Input').item.json.platform }}",
              "rightValue": "tiktok",
              "operator": { 
                "type": "string", 
                "operation": "equals" 
              }
            }],
            "combinator": "and"
          },
          "outputKey": "tiktok"
        }
      ]
    },
    "options": { 
      "fallbackOutput": "extra" 
    }
  },
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3.2,
  "position": [500, -80],
  "id": "GENERATE_NEW_UUID",
  "name": "Platform Router"
}
```

### Connection Updates

- `Code: Merge ID` → `Platform Router`
- `Platform Router` (output 0: tiktok) → `Apify TikTok` (new node)
- `Platform Router` (fallback: facebook) → `Apify` (existing Facebook node)

## Verification

- [ ] Switch node added with correct position
- [ ] Routes to TikTok Apify for tiktok.com URLs
- [ ] Falls back to Facebook Apify for all other URLs
- [ ] Connections properly wired
- [ ] Workflow validated in n8n
