---
created: 2026-01-28T03:55
title: Add TikTok Scraper Apify node to Social Scout workflow
area: integration
priority: high
depends_on:
  - 2026-01-28-add-switch-node-platform-routing.md
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
---

## Problem

No TikTok scraping capability exists in the Social Scout workflow. Users cannot analyze TikTok profiles or videos.

## Solution

Add new Apify node for TikTok Scraper (clockworks/tiktok-scraper):

### Node Configuration

```json
{
  "parameters": {
    "actorSource": "store",
    "actorId": {
      "__rl": true,
      "value": "GdWCkxBtKWOsKjdch",
      "mode": "list",
      "cachedResultName": "TikTok Scraper (clockworks/tiktok-scraper)",
      "cachedResultUrl": "https://console.apify.com/actors/GdWCkxBtKWOsKjdch/input"
    },
    "customBody": "={\n  \"profiles\": [\"{{ $('Normalize Input').item.json.target.replace('https://www.tiktok.com/@', '').replace('https://tiktok.com/@', '').split('/')[0].split('?')[0] }}\"],\n  \"postURLs\": {{ $('Normalize Input').item.json.is_post ? '[\"' + $('Normalize Input').item.json.target + '\"]' : '[]' }},\n  \"resultsPerPage\": 5,\n  \"profileScrapeSections\": [\"videos\"],\n  \"profileSorting\": \"latest\",\n  \"shouldDownloadSubtitles\": true,\n  \"shouldDownloadCovers\": false,\n  \"shouldDownloadVideos\": false\n}",
    "memory": 4096
  },
  "type": "@apify/n8n-nodes-apify.apify",
  "typeVersion": 1,
  "position": [656, 100],
  "id": "GENERATE_NEW_UUID",
  "name": "Apify TikTok",
  "credentials": {
    "apifyApi": {
      "id": "nkDHhtz7koGci1VE",
      "name": "Apify account"
    }
  }
}
```

### Apify Actor Details

- **Actor ID:** `GdWCkxBtKWOsKjdch`
- **Actor Name:** clockworks/tiktok-scraper
- **Rating:** 4.6 (188 reviews)
- **Pricing:** Pay per event

### Data Fields Returned

- `authorMeta.fans` (followers)
- `authorMeta.heart` (total likes)
- `playCount`, `diggCount`, `shareCount`, `commentCount`
- `videoMeta.duration`
- `subtitleLinks` (for viral analysis)
- `hashtags[]`

### Connection

- Connect from `Platform Router` (tiktok output) → `Apify TikTok`
- Connect `Apify TikTok` → `Get Dataset` (reuse existing node)

## Verification

- [ ] Apify TikTok node added with correct actor ID
- [ ] Credentials reference existing Apify account
- [ ] Profile username extracted correctly from URL
- [ ] Post URLs passed when is_post is true
- [ ] Subtitles enabled for viral analysis
- [ ] Connected to Get Dataset node
- [ ] Workflow validated in n8n
