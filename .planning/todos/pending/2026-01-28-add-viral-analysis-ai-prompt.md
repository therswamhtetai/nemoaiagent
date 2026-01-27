---
created: 2026-01-28T03:55
title: Create viral content analysis prompt for TikTok videos
area: integration
priority: medium
depends_on:
  - 2026-01-28-add-tiktok-scraper-apify-node.md
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
---

## Problem

Users want to understand WHY a TikTok video went viral. They need analysis of hooks, speech structure, captions, and tone to learn and recreate successful content strategies.

## Solution

Add a new LLM Chain node specifically for viral content analysis when a single TikTok video is analyzed.

### Trigger Condition

Only run viral analysis when:
- `platform === 'tiktok'`
- `is_post === true` (single video URL)
- `playCount > 100000` (optional: only for actually viral content)

### New LLM Chain Node: "Viral Analysis"

```json
{
  "parameters": {
    "promptType": "define",
    "text": "=You are a viral content analyst specializing in TikTok. Analyze this video that achieved {{ $json.playCount }} views.\n\nVIDEO DATA:\n- Caption: {{ $json.text }}\n- Duration: {{ $json.videoMeta.duration }} seconds\n- Likes: {{ $json.diggCount }}\n- Shares: {{ $json.shareCount }}\n- Comments: {{ $json.commentCount }}\n- Hashtags: {{ $json.hashtags.map(h => '#' + h.name).join(' ') }}\n- Music: {{ $json.musicMeta.musicName }}\n{% if $json.subtitleLinks %}\n- Transcript/Subtitles Available: Yes\n{% endif %}\n\nANALYZE THE FOLLOWING:\n\n1. HOOK ANALYSIS (First 3 seconds)\n   - What hook technique was used? (Question, shock, curiosity gap, etc.)\n   - Why does it stop the scroll?\n\n2. SPEECH STRUCTURE\n   - How is the content organized?\n   - What's the pacing like?\n   - Is there a clear beginning/middle/end?\n\n3. CAPTION & WRITING STYLE\n   - Tone (casual, professional, humorous?)\n   - Use of emojis, hashtags\n   - Call-to-action presence\n\n4. ENGAGEMENT TRIGGERS\n   - What makes viewers like/share/comment?\n   - Is there controversy, relatability, or surprise?\n\n5. MUSIC/AUDIO CHOICE\n   - How does the audio complement the content?\n   - Is it trending audio?\n\n6. VIRAL FACTORS SUMMARY\n   - List the top 3 reasons this went viral\n\nOutput in JSON format:\n{\n  \"hook_type\": \"curiosity gap\",\n  \"hook_text\": \"The opening line that hooks viewers...\",\n  \"speech_structure\": \"Problem → Solution → CTA\",\n  \"pacing\": \"Fast-paced with quick cuts\",\n  \"caption_style\": {\n    \"tone\": \"casual and relatable\",\n    \"emoji_usage\": \"moderate\",\n    \"cta\": \"Follow for more\"\n  },\n  \"engagement_triggers\": [\"relatability\", \"surprise ending\"],\n  \"audio_analysis\": \"Trending sound that adds energy\",\n  \"viral_factors\": [\n    \"Strong hook in first 2 seconds\",\n    \"Relatable problem everyone faces\",\n    \"Unexpected twist at the end\"\n  ],\n  \"recreate_tips\": \"To recreate this success: 1) Start with a provocative question, 2) Keep under 30 seconds, 3) Use trending audio\"\n}",
    "messages": {
      "messageValues": [{
        "message": "You are a viral content strategist. Provide actionable insights that a business owner can use to create similar successful content. Be specific and practical."
      }]
    }
  },
  "type": "@n8n/n8n-nodes-langchain.chainLlm",
  "typeVersion": 1.9,
  "position": [1700, 100],
  "name": "Viral Analysis"
}
```

### Connection

- Add after TikTok data is processed
- Only trigger for single video URLs (`is_post === true`)
- Output merged with standard analysis

## Verification

- [ ] Viral Analysis node added
- [ ] Triggers only for TikTok video URLs
- [ ] Analyzes hook, structure, caption, engagement
- [ ] Outputs actionable recreate_tips
- [ ] Follows ZERO MARKDOWN POLICY
- [ ] JSON output properly formatted
- [ ] Tested with real viral TikTok video
