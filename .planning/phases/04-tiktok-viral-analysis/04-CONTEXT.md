# Phase 04: TikTok & Viral Analysis - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform Social Scout into multi-platform competitor intelligence with TikTok support and proper post-level metrics display. Fix the current Facebook post data issue and add a polished UI for viewing individual posts with thumbnails, captions, and engagement metrics.

</domain>

<decisions>
## Implementation Decisions

### Facebook Posts (Individual URLs)
- Display: Photo thumbnail + written caption
- Metrics: Likes, comments, shares for that specific post
- AI analysis displayed below the metrics
- "Visit Post" button to open actual Facebook link
- Must detect post URL vs page URL and route to correct scraper

### TikTok Posts
- Display: Video thumbnail + caption
- Metrics: View count, comments, shares
- AI analysis displayed below the metrics
- "Visit Post" button to open actual TikTok link
- Need to research Apify TikTok scraper capabilities

### Competitor Pages (Enhanced)
- Keep existing: Follower count, viral score, summary analysis
- Add: Recent 5 posts grid with thumbnails + short captions
- Grid layout (flexible, Instagram-inspired)
- Each post clickable → opens actual post link
- Works for both Facebook pages and TikTok profiles

### UI/Design Requirements
- Clean, classic aesthetic
- Color palette (STRICT - no deviations):
  - Background: `#0D0C0B` (deep), `#1A1918` (card), `#1C1917` (content)
  - Borders: `#2A2826`, `#3A3836`
  - Primary accent: `#C15F3C` (terracotta)
  - Text: `#E8E6E3` (primary), `#B1ADA1` (secondary)
  - Buttons: `#F4F3EE` (cream)
- Nude and solid colors only
- NO gradients
- NO bright or flashy colors
- Complementary colors only if absolutely necessary

### Data Flow
- URL type detection needed (page vs post, facebook vs tiktok)
- Scraper selection based on URL type
- Post-level data must include: thumbnail URL, caption, engagement metrics
- Frontend parses `recent_posts` JSON for individual post display

### Claude's Discretion
- Exact grid layout dimensions and spacing
- Thumbnail aspect ratio handling
- Caption truncation length
- Loading skeleton design
- Error state handling for failed scrapes

</decisions>

<specifics>
## Specific Ideas

- "I want to see the recent posts with photo thumbnails and short captions, like Instagram"
- "Clicking on them should take us to the actual links"
- "Use the app's makeup-tone palette - no deviations"
- "Clean and classic aesthetic"
- Posts grid should show ~5 posts

</specifics>

<deferred>
## Deferred Ideas

- Scheduled/automated competitor monitoring (ad monitoring cron was in original scope but may be deferred based on complexity)
- Post performance comparison over time
- Engagement rate calculations and benchmarks

</deferred>

---

*Phase: 04-tiktok-viral-analysis*
*Context gathered: 2026-01-30*
