# Phase 04 Research: TikTok & Viral Analysis for Social Scout

## Overview

Transform Social Scout from a Facebook-only tool into a multi-platform competitor intelligence system with viral content analysis and automated ad monitoring.

## Current State

### Existing Social Scout Workflow
- **ID:** `HCV-51qLaCdcxHGx2yBcO`
- **Name:** Nemo - Social Scout
- **Current Capability:** Facebook Pages only

### Current Workflow Structure
```
Execute Workflow Trigger → Normalize Input → Get Competitor → If Exists? →
  → Create Competitor (if new)
  → Code: Merge ID → Apify (Facebook Pages) → Get Dataset → 
    → Update Row → Merge Text → Basic LLM Chain → Parse JSON → Create Social Stats
```

### Current Node IDs (for reference)
| Node | ID |
|------|-----|
| Normalize Input | `47f3293c-a540-4168-b8eb-25ba492fd306` |
| Code: Merge ID | `f74e35ea-da4a-4987-92d6-fb02b831d0c9` |
| Apify (Facebook) | `be0d8c7f-cd42-48bd-8132-26e7f3447be5` |
| Get Dataset | `1ba72e97-5fd2-48af-a475-2556032c935b` |
| Update a row | `0b84b603-e8f4-49bd-883d-1d223978a846` |
| Basic LLM Chain | `cd8af0e1-4eae-4125-aaae-76c62d501152` |
| Parse JSON | `586ab771-8cd9-49db-bfc6-86de7aaabc79` |

---

## Feature Requirements

### 1. TikTok Support
- Detect TikTok URLs (tiktok.com)
- Route to TikTok-specific Apify actor
- Parse TikTok data structure (authorMeta, playCount, etc.)

### 2. Viral Content Analysis
- Analyze individual TikTok videos for viral patterns
- Extract: hook type, speech structure, caption style, engagement triggers
- Provide actionable "recreate tips" for users

### 3. Facebook Posts Support
- Support individual Facebook post/video URLs (not just pages)
- Use Facebook Posts Scraper for single posts

### 4. Ad Monitoring Automation
- Cron workflow to check competitors with monitor_ads = true
- Send push notification when ads_running changes false → true
- Track last_ads_status for comparison

---

## Apify Actors

### TikTok Scraper
- **Actor ID:** `GdWCkxBtKWOsKjdch`
- **Name:** clockworks/tiktok-scraper
- **Rating:** 4.6 (188 reviews)
- **Pricing:** Pay per event
- **Key Fields:** authorMeta.fans, authorMeta.heart, playCount, diggCount, shareCount, commentCount, subtitleLinks, hashtags

### Facebook Posts Scraper
- **Actor ID:** `KoJrdxJCTtpon81KY`
- **Name:** apify/facebook-posts-scraper
- **Rating:** 4.8 (114 reviews)
- **Key Fields:** likes, comments, shares, reactionLikeCount, text, media[]

### Existing: Facebook Pages Scraper
- **Actor ID:** `4Hv5RhChiaDk6iwad`
- **Name:** apify/facebook-pages-scraper

---

## Database Changes

### competitors Table Additions
```sql
ALTER TABLE competitors ADD COLUMN monitor_ads BOOLEAN DEFAULT false;
ALTER TABLE competitors ADD COLUMN last_ads_status BOOLEAN DEFAULT null;
CREATE INDEX idx_competitors_monitor_ads ON competitors(monitor_ads) WHERE monitor_ads = true;
```

### Platform Field Update
Currently stores Facebook category (e.g., "Software"). Should store platform name ('facebook' or 'tiktok').

---

## Todo Files (Source)

All 10 todos are documented in `.planning/todos/pending/`:

| Todo | File | Priority |
|------|------|----------|
| Platform detection | 2026-01-28-add-platform-detection-normalize-input.md | High |
| Switch node routing | 2026-01-28-add-switch-node-platform-routing.md | High |
| TikTok scraper | 2026-01-28-add-tiktok-scraper-apify-node.md | High |
| FB Posts scraper | 2026-01-28-add-facebook-posts-scraper.md | Medium |
| LLM prompt update | 2026-01-28-update-llm-prompt-tiktok-analysis.md | Medium |
| Viral analysis | 2026-01-28-add-viral-analysis-ai-prompt.md | Medium |
| Strategic followup | 2026-01-28-add-strategic-followup-chat.md | Low |
| monitor_ads column | 2026-01-28-add-monitor-ads-column.md | High |
| Platform field update | 2026-01-28-update-database-platform-field.md | Low |
| Ad monitoring cron | 2026-01-28-create-ad-monitoring-cron-workflow.md | High |

---

## Credentials (Existing)

| Service | Credential ID | Name |
|---------|--------------|------|
| Supabase | JbItbwVcQiGCLFAC | NemoAIDatabase |
| Apify | nkDHhtz7koGci1VE | Apify account |
| Google Gemini | qJ3tJlGTxwiZCORz | Google Gemini(PaLM) Api account |

---

## Related Workflows

| Workflow | ID | Purpose |
|----------|-----|---------|
| Social Scout | HCV-51qLaCdcxHGx2yBcO | Main workflow to modify |
| Push Notification Sender | OPqleYbWDbxnuHa6 | For ad monitoring alerts |
| Web API Router | o5t83JWF11dsSfyi | Calls Social Scout as tool |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing Facebook flow | High | Test Facebook URL before/after each wave |
| Apify rate limits | Medium | Monitor usage, add error handling |
| LLM prompt complexity | Medium | Test incrementally with real URLs |
| Cron workflow errors | Medium | Add error notifications, logging |

---

## Success Criteria

- [ ] Facebook page URLs work as before (regression test)
- [ ] TikTok profile URLs return follower count, engagement stats
- [ ] TikTok video URLs return viral analysis with hook/structure breakdown
- [ ] Facebook post URLs return individual post analysis
- [ ] Platform field correctly set to 'facebook' or 'tiktok' in database
- [ ] Ad monitoring cron runs every 30 minutes
- [ ] Push notification sent when competitor starts ads

---

*Research compiled: January 29, 2026*
