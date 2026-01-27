---
created: 2026-01-28T03:55
title: Add Facebook Posts Scraper for individual post support
area: integration
priority: medium
depends_on:
  - 2026-01-28-add-switch-node-platform-routing.md
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
---

## Problem

Current workflow only supports Facebook page URLs. Users cannot analyze individual Facebook post or video URLs.

## Solution

Add Facebook Posts Scraper Apify node for individual posts:

### Detection in Normalize Input (already added in Todo 1)

```javascript
let isPost = targetUrl.includes('/posts/') || 
             targetUrl.includes('/videos/') || 
             targetUrl.includes('/reel/');
```

### New Apify Node Configuration

```json
{
  "parameters": {
    "actorSource": "store",
    "actorId": {
      "__rl": true,
      "value": "KoJrdxJCTtpon81KY",
      "mode": "list",
      "cachedResultName": "Facebook Posts Scraper (apify/facebook-posts-scraper)",
      "cachedResultUrl": "https://console.apify.com/actors/KoJrdxJCTtpon81KY/input"
    },
    "customBody": "={\n  \"startUrls\": [{ \"url\": \"{{ $('Normalize Input').item.json.target }}\" }],\n  \"resultsLimit\": 1,\n  \"captionText\": true\n}",
    "memory": 4096
  },
  "type": "@apify/n8n-nodes-apify.apify",
  "typeVersion": 1,
  "position": [656, -200],
  "id": "GENERATE_NEW_UUID",
  "name": "Apify FB Posts",
  "credentials": {
    "apifyApi": {
      "id": "nkDHhtz7koGci1VE",
      "name": "Apify account"
    }
  }
}
```

### Apify Actor Details

- **Actor ID:** `KoJrdxJCTtpon81KY`
- **Actor Name:** apify/facebook-posts-scraper
- **Rating:** 4.8 (114 reviews)
- **Key Fields:** `likes`, `comments`, `shares`, `reactionLikeCount`, `reactionLoveCount`, `text`, `media[]`

### Routing Logic

Add sub-switch after Platform Router for Facebook URLs:
- If `is_post = true` → `Apify FB Posts`
- If `is_post = false` → `Apify` (existing Facebook Pages Scraper)

## Verification

- [ ] Facebook Posts Scraper node added
- [ ] Correct actor ID: KoJrdxJCTtpon81KY
- [ ] Routes correctly for post URLs
- [ ] Routes to page scraper for page URLs
- [ ] Video transcripts enabled (captionText: true)
- [ ] Workflow validated in n8n
