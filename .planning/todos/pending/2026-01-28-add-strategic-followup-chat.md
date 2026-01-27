---
created: 2026-01-28T03:55
title: Add conversational follow-up after viral analysis
area: integration
priority: low
depends_on:
  - 2026-01-28-add-viral-analysis-ai-prompt.md
files:
  - Social Scout workflow: HCV-51qLaCdcxHGx2yBcO
  - Node: Basic LLM Chain1 (f45eba75-bd6c-4d85-b8ca-16fddb312aca)
---

## Problem

After viral analysis, the AI should proactively offer to help the user recreate the strategy for their own business. This creates a more engaging, actionable experience.

## Solution

Update the `Basic LLM Chain1` (formatting node) to append a strategic follow-up question when viral analysis is performed.

### Updated System Message

Add to the existing message in `Basic LLM Chain1`:

```
## VIRAL ANALYSIS FOLLOW-UP

When the analysis includes viral content breakdown (hook_type, viral_factors, recreate_tips), always end your response with:

---

NEXT STEPS

I can help you apply these viral strategies to your business. Would you like me to:

1. Generate content ideas based on this viral pattern
2. Write a script following this structure for your product/service
3. Suggest trending audio that matches your brand

Just let me know what you'd like to explore!
```

### Alternative: Conditional Append

Use n8n expression to conditionally append:

```javascript
={{ $json.text + ($('Normalize Input').item.json.is_post && $('Normalize Input').item.json.platform === 'tiktok' ? 
'\n\n---\n\nNEXT STEPS\n\nWould you like me to help you recreate this viral strategy for your business? I can:\n\n1. Generate content ideas based on this pattern\n2. Write a script following this structure\n3. Suggest implementation steps\n\nJust let me know!' : '') }}
```

## Verification

- [ ] Follow-up question appears after viral analysis
- [ ] Only appears for TikTok video analysis (not page analysis)
- [ ] Follows ZERO MARKDOWN POLICY (no **, no ###)
- [ ] Actionable options provided
- [ ] Natural conversational tone
- [ ] Tested end-to-end with TikTok video URL
