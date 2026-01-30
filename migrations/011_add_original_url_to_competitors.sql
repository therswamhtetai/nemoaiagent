-- Migration: Add original_url column to competitors table
-- Purpose: Preserve the original target URL (post/video link) while allowing 'url' to store the canonical page URL
-- This ensures refresh operations always use the correct URL for scraping

-- Step 1: Add the original_url column
ALTER TABLE competitors 
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- Step 2: Backfill existing data - copy url to original_url for all existing records
-- This preserves the current URL as the original for existing records
UPDATE competitors 
SET original_url = url 
WHERE original_url IS NULL;

-- Step 3: Add a comment to document the column purpose
COMMENT ON COLUMN competitors.original_url IS 'The original URL submitted by the user (post/video link). Used for refresh operations to ensure correct scraper is used.';
