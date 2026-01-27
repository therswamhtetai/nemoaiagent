---
created: 2026-01-28T03:55
title: Create competitor ad monitoring cron workflow
area: integration
priority: high
depends_on:
  - 2026-01-28-add-monitor-ads-column.md
files:
  - New n8n workflow (to be created)
  - Push Notification Sender: OPqleYbWDbxnuHa6
  - Social Scout: HCV-51qLaCdcxHGx2yBcO
---

## Problem

No automated monitoring for competitor ad activity changes. Users want to be notified via PWA push when a competitor starts running ads.

## Solution

Create new n8n workflow: "Nemo - Competitor Ad Monitor"

### Workflow Structure

```
[Schedule Trigger] → [Get Monitored Competitors] → [Loop] →
  [Execute Social Scout] → [Get Previous Status] → [Compare] →
  [If Changed to TRUE] → [Send Push Notification] → [Update Status]
```

### Node Configurations

#### 1. Schedule Trigger
```json
{
  "parameters": {
    "rule": {
      "interval": [{ "field": "minutes", "minutesInterval": 30 }]
    }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "name": "Every 30 Minutes"
}
```

#### 2. Get Monitored Competitors (Supabase)
```json
{
  "parameters": {
    "operation": "getAll",
    "tableId": "competitors",
    "returnAll": true,
    "matchType": "allFilters",
    "filters": {
      "conditions": [{
        "keyName": "monitor_ads",
        "condition": "eq",
        "keyValue": "true"
      }]
    }
  },
  "type": "n8n-nodes-base.supabase",
  "credentials": {
    "supabaseApi": { "id": "JbItbwVcQiGCLFAC", "name": "NemoAIDatabase" }
  }
}
```

#### 3. Loop Through Competitors
```json
{
  "parameters": { "batchSize": 1 },
  "type": "n8n-nodes-base.splitInBatches",
  "name": "Loop Competitors"
}
```

#### 4. Execute Social Scout Sub-workflow
```json
{
  "parameters": {
    "source": "database",
    "workflowId": "HCV-51qLaCdcxHGx2yBcO",
    "mode": "each",
    "options": {},
    "workflowInputs": {
      "values": [
        { "name": "target ", "value": "={{ $json.url }}" },
        { "name": "user_id", "value": "={{ $json.user_id }}" }
      ]
    }
  },
  "type": "n8n-nodes-base.executeWorkflow",
  "name": "Run Social Scout"
}
```

#### 5. Compare Ad Status
```json
{
  "parameters": {
    "conditions": {
      "conditions": [{
        "leftValue": "={{ $json.json_output.ads_running }}",
        "rightValue": true,
        "operator": { "type": "boolean", "operation": "equals" }
      }, {
        "leftValue": "={{ $('Loop Competitors').item.json.last_ads_status }}",
        "rightValue": false,
        "operator": { "type": "boolean", "operation": "equals" }
      }],
      "combinator": "and"
    }
  },
  "type": "n8n-nodes-base.if",
  "name": "Ads Just Started?"
}
```

#### 6. Send Push Notification (Execute Workflow)
```json
{
  "parameters": {
    "source": "database",
    "workflowId": "OPqleYbWDbxnuHa6",
    "workflowInputs": {
      "values": [
        { "name": "user_id", "value": "={{ $('Loop Competitors').item.json.user_id }}" },
        { "name": "title", "value": "Competitor Alert" },
        { "name": "body", "value": "={{ $('Loop Competitors').item.json.name }} just started running Facebook ads!" }
      ]
    }
  },
  "type": "n8n-nodes-base.executeWorkflow",
  "name": "Send Push Notification"
}
```

#### 7. Update Last Status (Supabase)
```json
{
  "parameters": {
    "operation": "update",
    "tableId": "competitors",
    "filters": {
      "conditions": [{
        "keyName": "id",
        "condition": "eq",
        "keyValue": "={{ $('Loop Competitors').item.json.id }}"
      }]
    },
    "fieldsUi": {
      "fieldValues": [{
        "fieldId": "last_ads_status",
        "fieldValue": "={{ $json.json_output.ads_running }}"
      }]
    }
  },
  "type": "n8n-nodes-base.supabase"
}
```

## Verification

- [ ] Workflow created with correct ID
- [ ] Schedule trigger set to 30 minutes
- [ ] Queries only monitor_ads = true competitors
- [ ] Correctly calls Social Scout sub-workflow
- [ ] Compares current vs previous ad status
- [ ] Sends push notification only when ads START (false → true)
- [ ] Updates last_ads_status after each check
- [ ] Workflow activated
