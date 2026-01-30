-- Migration 012: Add Ad Monitoring Columns to Competitors Table
-- Phase: 04-01 Database Foundation
-- Date: 2026-01-30
-- Purpose: Enable ad monitoring cron workflow and platform tracking

-- Task 1.1: Add monitor_ads column (enables cron to check this competitor)
ALTER TABLE competitors
ADD COLUMN IF NOT EXISTS monitor_ads BOOLEAN DEFAULT false;

-- Add last_ads_status column (tracks previous state for change detection)
ALTER TABLE competitors
ADD COLUMN IF NOT EXISTS last_ads_status BOOLEAN DEFAULT null;

-- Add index for efficient cron queries (only indexes rows where monitor_ads = true)
CREATE INDEX IF NOT EXISTS idx_competitors_monitor_ads
ON competitors(monitor_ads)
WHERE monitor_ads = true;

-- Task 1.2: Platform Field Migration (optional - migrate existing data)
-- Infer platform from URL for existing entries
UPDATE competitors
SET platform = CASE
  WHEN url LIKE '%tiktok.com%' THEN 'tiktok'
  WHEN url LIKE '%facebook.com%' THEN 'facebook'
  ELSE 'facebook'  -- default to facebook for legacy entries
END
WHERE platform IS NULL
   OR platform NOT IN ('facebook', 'tiktok')
   OR platform IN ('Software', 'Restaurant', 'E-commerce', 'Service');  -- legacy category values

-- Verification queries
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'competitors'
-- AND column_name IN ('monitor_ads', 'last_ads_status', 'platform');

-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'competitors'
-- AND indexname = 'idx_competitors_monitor_ads';
