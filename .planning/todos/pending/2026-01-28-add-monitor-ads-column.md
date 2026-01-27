---
created: 2026-01-28T03:55
title: Add monitor_ads column to competitors table
area: database
priority: high
depends_on: []
files:
  - Supabase table: competitors
---

## Problem

No way to flag which competitors should be monitored for ad activity changes. The ad monitoring cron workflow needs to know which competitors to check.

## Solution

Add `monitor_ads` boolean column to the competitors table:

### SQL Migration

```sql
-- Add monitor_ads column
ALTER TABLE competitors 
ADD COLUMN monitor_ads BOOLEAN DEFAULT false;

-- Add index for cron query performance
CREATE INDEX idx_competitors_monitor_ads 
ON competitors(monitor_ads) 
WHERE monitor_ads = true;

-- Optional: Add last_ads_status to track changes
ALTER TABLE competitors
ADD COLUMN last_ads_status BOOLEAN DEFAULT null;
```

### Schema After Migration

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| user_id | UUID | - | FK to users |
| name | VARCHAR(255) | - | Competitor name |
| url | VARCHAR | - | Profile/page URL |
| platform | VARCHAR | - | 'facebook' or 'tiktok' |
| last_scraped_at | TIMESTAMP | - | Last scrape time |
| monitor_ads | BOOLEAN | false | **NEW: Enable ad monitoring** |
| last_ads_status | BOOLEAN | null | **NEW: Previous ads_running value** |
| created_at | TIMESTAMP | NOW() | - |

### Frontend Consideration

The Market Intelligence tab may need a toggle switch to enable/disable monitoring per competitor. This is a separate frontend todo.

## Verification

- [ ] SQL migration executed successfully
- [ ] monitor_ads column exists with default false
- [ ] Index created for query performance
- [ ] last_ads_status column added (optional)
- [ ] Existing competitors unaffected (default false)
