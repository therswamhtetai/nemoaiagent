---
created: 2026-01-28T03:55
title: Update competitors table platform field for TikTok
area: database
priority: low
depends_on:
  - 2026-01-28-add-platform-detection-normalize-input.md
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
  - Node: Update a row (0b84b603-e8f4-49bd-883d-1d223978a846)
  - Supabase table: competitors
---

## Problem

The `platform` field in the `competitors` table currently gets populated from Facebook categories (e.g., "Software", "Restaurant"). It should store the actual platform name ('facebook' or 'tiktok') for proper filtering and display.

## Solution

### 1. Update the "Update a row" Supabase Node

Current configuration sets platform from Facebook data:
```javascript
platform: $json.categories[1]  // Gets Facebook category
```

Updated configuration:
```javascript
platform: $('Normalize Input').item.json.platform  // Gets 'facebook' or 'tiktok'
```

### Node Update

```json
{
  "parameters": {
    "operation": "update",
    "tableId": "competitors",
    "filters": {
      "conditions": [{
        "keyName": "id",
        "condition": "eq",
        "keyValue": "={{ $('Code: Merge ID').item.json.competitor_id }}"
      }]
    },
    "fieldsUi": {
      "fieldValues": [
        { "fieldId": "name", "fieldValue": "={{ $json.title || $json.authorMeta?.nickName || $json.authorMeta?.name }}" },
        { "fieldId": "last_scraped_at", "fieldValue": "={{ $now.toISO() }}" },
        { "fieldId": "platform", "fieldValue": "={{ $('Normalize Input').item.json.platform }}" },
        { "fieldId": "url", "fieldValue": "={{ $json.pageUrl || $json.authorMeta?.profileUrl || $('Normalize Input').item.json.target }}" }
      ]
    }
  }
}
```

### 2. Handle Both Facebook and TikTok Data Structures

The update node needs to handle different field names:

| Field | Facebook Source | TikTok Source |
|-------|-----------------|---------------|
| name | `$json.title` | `$json.authorMeta.nickName` |
| url | `$json.pageUrl` | `$json.authorMeta.profileUrl` |
| platform | 'facebook' | 'tiktok' |

### 3. Migration for Existing Data (Optional)

```sql
-- Update existing entries with inferred platform
UPDATE competitors
SET platform = 'facebook'
WHERE platform IS NULL OR platform NOT IN ('facebook', 'tiktok');

-- Or infer from URL
UPDATE competitors
SET platform = CASE 
  WHEN url LIKE '%tiktok.com%' THEN 'tiktok'
  ELSE 'facebook'
END
WHERE platform IS NULL OR platform NOT IN ('facebook', 'tiktok');
```

## Verification

- [ ] Update a row node modified with new platform logic
- [ ] Handles TikTok authorMeta structure for name
- [ ] Handles TikTok authorMeta structure for url
- [ ] Platform field correctly set to 'facebook' or 'tiktok'
- [ ] Existing data migrated (optional)
- [ ] Frontend Market Intelligence displays correct platform
- [ ] Workflow validated in n8n
