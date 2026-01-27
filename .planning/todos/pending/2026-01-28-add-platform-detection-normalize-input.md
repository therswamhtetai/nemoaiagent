---
created: 2026-01-28T03:55
title: Add platform detection to Social Scout Normalize Input
area: integration
priority: high
depends_on: []
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
  - Node: Normalize Input (47f3293c-a540-4168-b8eb-25ba492fd306)
---

## Problem

The `Normalize Input` code node in Social Scout only extracts `target` and `user_id`. It doesn't detect which platform (Facebook or TikTok) the URL belongs to, which is needed for routing to the correct Apify actor.

## Solution

Modify the `Normalize Input` code node to detect platform from URL:

```javascript
const inputData = $input.first().json;

// 1. Target URL extraction (existing logic)
let targetUrl = 
  inputData.target || 
  inputData.link ||
  (inputData.body && inputData.body.target) || 
  (inputData.body && inputData.body.link) ||
  (inputData.query && inputData.query.target) || 
  (inputData.query && inputData.query.link) ||
  inputData['target ']; 

if (!targetUrl) {
  targetUrl = 'https://www.facebook.com/dalaestore.mm';
}

// 2. User ID extraction (existing logic)
let userId = 
  inputData.user_id || 
  (inputData.body && inputData.body.user_id) || 
  (inputData.query && inputData.query.user_id);

// 3. NEW: Platform detection
let platform = 'facebook'; // default
if (targetUrl.includes('tiktok.com')) {
  platform = 'tiktok';
}

// 4. NEW: Detect if URL is a post vs page/profile
let isPost = targetUrl.includes('/posts/') || 
             targetUrl.includes('/videos/') || 
             targetUrl.includes('/video/') ||
             targetUrl.includes('/reel/');

return {
  json: {
    target: targetUrl.trim(),
    user_id: userId,
    platform: platform,      // NEW
    is_post: isPost          // NEW
  }
};
```

## Verification

- [ ] Code node updated with platform detection
- [ ] Returns `platform: "facebook"` for facebook.com URLs
- [ ] Returns `platform: "tiktok"` for tiktok.com URLs
- [ ] Returns `is_post: true` for post/video URLs
- [ ] Workflow validated in n8n
