---
created: 2026-01-28T03:55
title: Update Basic LLM Chain prompt for TikTok data
area: integration
priority: medium
depends_on:
  - 2026-01-28-add-tiktok-scraper-apify-node.md
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
  - Node: Basic LLM Chain (cd8af0e1-4eae-4125-aaae-76c62d501152)
---

## Problem

The current LLM prompt in `Basic LLM Chain` only references Facebook-specific metrics (page ads, follower count). It doesn't understand TikTok data structure (fans, hearts, playCount).

## Solution

Update the `Basic LLM Chain` prompt to handle both platforms:

### Updated Prompt

```
Analyze this {{ $('Normalize Input').item.json.platform }} social media data for the competitor: {{ $('Normalize Input').item.json.target }}

Here is the raw data:
{{ $json.merged_text }}

{% if $('Normalize Input').item.json.platform === 'tiktok' %}
Please extract and summarize:
1. Total Followers (from authorMeta.fans)
2. Total Hearts/Likes (from authorMeta.heart)
3. Engagement Rate (average of playCount, diggCount across videos)
4. Content Strategy: What kind of content? (Video duration, hashtags)
5. Top Performing Video: Highest playCount
6. Viral Score (1-10): Based on engagement ratio

Output strictly in JSON format:
{
  "platform": "tiktok",
  "followers": 12345,
  "total_hearts": 123456,
  "viral_score": 8,
  "summary": "They focus on short-form content about...",
  "top_post": "The video about...",
  "avg_engagement": 5.2
}
{% else %}
Please extract and summarize:
1. Total Follower Count
2. Engagement Rate (Estimate based on last 5 posts)
3. Content Strategy: What kind of posts? (Video/Photo?)
4. Top Performing Post: Which got most likes/shares?
5. Viral Score (1-10): How trendy is this page?
6. Is this page currently running ads?

Output strictly in JSON format:
{
  "platform": "facebook",
  "followers": 12345,
  "ads_running": true/false,
  "viral_score": 8,
  "summary": "They are focusing on...",
  "top_post": "The video about..."
}
{% endif %}
```

### Alternative: Conditional Logic in n8n

If Jinja-style conditionals don't work, use n8n expression:

```
={{ $('Normalize Input').item.json.platform === 'tiktok' ? 
'Analyze TikTok data... [TikTok prompt]' : 
'Analyze Facebook data... [Facebook prompt]' }}
```

## Verification

- [ ] Prompt updated to detect platform
- [ ] TikTok-specific fields referenced (fans, hearts, playCount)
- [ ] Facebook-specific fields retained (ads_running)
- [ ] JSON output includes platform field
- [ ] Tested with both Facebook and TikTok URLs
- [ ] Workflow validated in n8n
