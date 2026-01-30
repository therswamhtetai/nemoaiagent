---
phase: 04-social-scout-tiktok
plan: 03
subsystem: integration
tags: [apify, tiktok, facebook, scraping, n8n, multi-platform]

# Dependency graph
requires:
  - phase: 04-02
    provides: Platform Router switch node with TikTok/Facebook routing
provides:
  - TikTok profile and video scraping via Apify TikTok Scraper
  - Facebook individual post scraping via Apify FB Posts Scraper
  - Facebook sub-router for page vs post URL detection
  - Multi-platform database update handling both TikTok and Facebook data structures
affects: [04-04-ai-analysis, 04-05-ad-monitoring]

# Tech tracking
tech-stack:
  added:
    - Apify TikTok Scraper (clockworks/tiktok-scraper - GdWCkxBtKWOsKjdch)
    - Apify Facebook Posts Scraper (apify/facebook-posts-scraper - KoJrdxJCTtpon81KY)
  patterns:
    - Platform-specific scraper routing pattern
    - Unified data normalization from multiple scraper outputs
    - Fallback-based routing for nested platform detection (FB page vs post)

key-files:
  created: []
  modified:
    - Social Scout Workflow (HCV-51qLaCdcxHGx2yBcO) - Added TikTok and FB Posts scrapers

key-decisions:
  - "All scraper nodes route to single Get Dataset node for unified data handling"
  - "FB Post Router uses fallback output for pages, primary output for posts"
  - "Update Row node uses conditional expressions to handle both platform data structures"

patterns-established:
  - "Multi-platform scraper pattern: Platform Router → Scraper → Get Dataset → Update Row"
  - "Nested routing: Platform Router → FB Post Router for sub-platform detection"

# Metrics
duration: 5min
completed: 2026-01-30
---

# Phase 04 Plan 03: Scrapers Summary

**Multi-platform scraping with TikTok Scraper, Facebook Posts Scraper, and unified data flow handling both social platforms**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-30T09:50:05Z
- **Completed:** 2026-01-30T09:55:05Z
- **Tasks:** 4 (all verified as already implemented)
- **Files modified:** 0 (verification only)

## Accomplishments
- TikTok profile and video scraping integrated via Apify TikTok Scraper
- Facebook individual post scraping added via Apify FB Posts Scraper
- Facebook sub-router distinguishes between page and post URLs
- Multi-platform database updates handle both TikTok and Facebook data structures

## Task Verification

All tasks from plan 04-03 were found to be **already implemented** in the Social Scout workflow (version 90):

### Task 3.1: TikTok Scraper Apify Node ✅ VERIFIED
- **Node:** "Apify TikTok" exists
- **Node ID:** `b2c3d4e5-f678-9012-bcde-f23456789012`
- **Actor ID:** `GdWCkxBtKWOsKjdch` (clockworks/tiktok-scraper)
- **Configuration:**
  - Extracts profile username from TikTok URL
  - Handles both profile and post URLs via `is_post` flag
  - Fetches 5 latest videos with subtitles enabled
  - Memory: 4096 MB
- **Connection:** Platform Router (TikTok output) → Apify TikTok → Get Dataset

### Task 3.2: Facebook Posts Scraper Node ✅ VERIFIED
- **Node:** "Apify FB Posts" exists
- **Node ID:** `c3d4e5f6-7890-1234-cdef-345678901234`
- **Actor ID:** `KoJrdxJCTtpon81KY` (apify/facebook-posts-scraper)
- **Configuration:**
  - Accepts individual Facebook post URLs
  - Results limit: 1 post
  - Caption text extraction enabled
  - Memory: 4096 MB
- **Connection:** FB Post Router (post output) → Apify FB Posts → Get Dataset

### Task 3.3: Facebook Sub-Router ✅ VERIFIED
- **Node:** "FB Post Router" exists
- **Node ID:** `d4e5f678-9012-3456-def0-456789012345`
- **Type:** Switch node (n8n-nodes-base.switch v3.2)
- **Logic:**
  - Primary output (post): Routes when `is_post === true`
  - Fallback output (page): Routes for regular Facebook pages
- **Connections:**
  - Platform Router (Facebook output) → FB Post Router
  - FB Post Router (post) → Apify FB Posts
  - FB Post Router (fallback) → Apify (existing page scraper)

### Task 3.4: Multi-Platform Update Row ✅ VERIFIED
- **Node:** "Update a row" updated
- **Node ID:** `0b84b603-e8f4-49bd-883d-1d223978a846`
- **Multi-platform field mappings:**
  - **name:** `$json.title || $json.pageName || $json.authorMeta?.nickName || $json.authorMeta?.name || ...`
    - Handles TikTok: `authorMeta.nickName`, `authorMeta.name`
    - Handles Facebook: `title`, `pageName`, `text`, `message`
  - **platform:** `$('Normalize Input').item.json.platform`
    - Dynamically set to 'facebook' or 'tiktok'
  - **url:** `$json.pageUrl || $json.authorMeta?.profileUrl || $('Normalize Input').item.json.target`
    - Handles TikTok: `authorMeta.profileUrl`
    - Handles Facebook: `pageUrl`
  - **last_scraped_at:** `$now.toISO()`

## Current Workflow Flow

```
Execute Workflow Trigger → Normalize Input → Get Competitor → If1 →
  Code: Merge ID → Platform Router →

    [Output 0: TikTok]
      → Apify TikTok → Get Dataset → Update a row → Merge Data → ...

    [Output 1: Facebook]
      → FB Post Router →
          [Output 0: Post] → Apify FB Posts → Get Dataset → Update a row → ...
          [Fallback: Page] → Apify (page scraper) → Get Dataset → Update a row → ...
```

## Node Configuration Details

### Apify TikTok Configuration
```javascript
{
  "profiles": ["{{ extracted_username }}"],
  "postURLs": {{ is_post ? '["url"]' : '[]' }},
  "resultsPerPage": 5,
  "profileScrapeSections": ["videos"],
  "profileSorting": "latest",
  "shouldDownloadSubtitles": true,
  "shouldDownloadCovers": false,
  "shouldDownloadVideos": false
}
```

**Key Data Fields Retrieved:**
- `authorMeta.fans` (followers)
- `authorMeta.heart` (total likes)
- `playCount`, `diggCount`, `shareCount`, `commentCount`
- `videoMeta.duration`
- `subtitleLinks` (for viral analysis in Wave 4)
- `hashtags[]`

### Apify FB Posts Configuration
```javascript
{
  "startUrls": [{ "url": "{{ target }}" }],
  "resultsLimit": 1,
  "captionText": true
}
```

**Key Data Fields Retrieved:**
- `likes`, `comments`, `shares`
- `reactionLikeCount`
- `text`, `message`
- `media[]`

## Files Modified

None - all implementation was already complete from previous execution.

## Decisions Made

**1. Unified Get Dataset Node**
- All three scrapers (Apify TikTok, Apify FB Posts, Apify page scraper) route to the same "Get Dataset" node
- Rationale: Simplifies workflow and ensures consistent data retrieval pattern

**2. FB Post Router Fallback Pattern**
- Post URLs use primary output (0), page URLs use fallback output
- Rationale: Matches Switch node's standard fallback behavior for cleaner routing logic

**3. Multi-Platform Field Expressions**
- Update Row node uses conditional chaining (`||` operators) for platform-agnostic field mapping
- Rationale: Single node handles both platforms without duplicating update logic

## Deviations from Plan

None - all tasks were already implemented exactly as specified in the plan.

## Issues Encountered

None - verification completed without issues.

## User Setup Required

None - no external service configuration required. Apify credentials already configured.

## Next Phase Readiness

**Ready for Wave 4 (04-04: AI Analysis Updates)**
- TikTok scraper provides `subtitleLinks` for viral content analysis
- Facebook Posts scraper provides individual post metrics
- All scrapers feed into unified data flow for LLM processing

**Data Available for AI Analysis:**
- TikTok: follower count, video metrics, hashtags, subtitles
- Facebook: page info, post engagement metrics, content text
- Both platforms: normalized competitor records with platform field

**No Blockers**
- All scraper nodes operational
- Multi-platform routing working as designed
- Database update handles both data structures

---
*Phase: 04-social-scout-tiktok*
*Completed: 2026-01-30*
