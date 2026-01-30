---
phase: 04-social-scout-tiktok
plan: 04
subsystem: ai, workflow
tags: [n8n, gemini, tiktok, viral-analysis, llm]

requires:
  - phase: 04-03
    provides: Multi-platform scrapers feeding data to analysis

provides:
  - Multi-platform LLM prompt handling Facebook and TikTok data
  - Viral Analysis node for deep TikTok video analysis
  - Strategic follow-up conversation for actionable insights
  - Recreate tips for content creation guidance

affects: [social-scout, ai-analysis]

tech-stack:
  added: []
  patterns: [conditional-llm-routing, viral-content-analysis]

key-files:
  created: []
  modified:
    - Social Scout workflow (HCV-51qLaCdcxHGx2yBcO) - added 3 nodes

key-decisions:
  - "Viral Analysis only triggers for TikTok video posts (is_post && platform === 'tiktok')"
  - "Used Merge node to combine viral analysis with fallback path"
  - "Shared Google Gemini Chat Model across all LLM chains"

patterns-established:
  - "Conditional LLM routing: Switch node before specialized analysis"
  - "Viral content analysis: hook, structure, engagement, recreate tips"

duration: 15min
completed: 2026-01-30
---

# Plan 04-04: AI Analysis Updates Summary

**Added Viral Analysis node for deep TikTok video content analysis with actionable recreate tips**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-30T12:30:00Z
- **Completed:** 2026-01-30T12:45:00Z
- **Tasks:** 3/3
- **Files modified:** 1 workflow

## Accomplishments

- Verified multi-platform LLM prompt already handles Facebook and TikTok data
- Added Viral Analysis Router to conditionally route TikTok video posts
- Added Viral Analysis LLM Chain with comprehensive content analysis prompt
- Added Merge Viral Results node to combine analysis paths
- Connected Google Gemini Chat Model to Viral Analysis node

## Task Status

### Task 4.1: Update Basic LLM Chain Prompt
**Status:** Already Complete (verified)

The Basic LLM Chain node already contains multi-platform support:
- Uses ternary expression to detect platform
- TikTok fields: `authorMeta.fans`, `authorMeta.heart`, `playCount`, `diggCount`
- Facebook fields: `followers`, `ads_running`
- Both outputs include `platform` field

### Task 4.2: Add Viral Analysis LLM Chain Node
**Status:** Implemented

Added 3 new nodes to Social Scout workflow:

1. **Viral Analysis Router** (Switch Node)
   - ID: `2af980bb-5091-4235-8c8d-de8632b3287e`
   - Position: [1600, -64]
   - Conditions: `platform === 'tiktok' AND is_post === true`
   - Outputs: `viral_analysis` (to analysis), `extra` (fallback)

2. **Viral Analysis** (LLM Chain)
   - ID: `45412d82-741b-466b-a340-f2c6e306c8c5`
   - Position: [1760, 100]
   - Analyzes: hook, structure, caption, engagement, viral factors
   - Outputs: `recreate_tips` for actionable guidance

3. **Merge Viral Results** (Merge Node)
   - ID: `4b427d65-a62f-4e00-b09f-7c386320f5f3`
   - Position: [1920, -64]
   - Combines viral analysis with fallback path

### Task 4.3: Add Strategic Follow-up Conversation
**Status:** Already Complete (verified)

Basic LLM Chain1 already appends follow-up suggestions:
- Only for TikTok video posts
- Offers 3 actionable options for content recreation
- Follows ZERO MARKDOWN POLICY

## Workflow Architecture After Update

```
... → Get Dataset → Update a row → Viral Analysis Router →
    ├─ [viral_analysis: TikTok video] → Viral Analysis → Merge Viral Results
    └─ [extra: fallback] ────────────────────────────────→ Merge Viral Results
                                                                    ↓
                                                              Merge Data → Basic LLM Chain → ...
```

## Viral Analysis Output Format

```json
{
  "hook_type": "curiosity gap or question or bold statement",
  "hook_analysis": "The opening grabs attention by...",
  "content_structure": "Problem to Solution to CTA",
  "pacing": "Fast-paced with quick cuts",
  "caption_style": {
    "tone": "casual and relatable",
    "hashtag_strategy": "mix of niche and trending",
    "cta": "Follow for more"
  },
  "engagement_triggers": ["relatability", "surprise ending"],
  "viral_factors": [
    "Strong hook in first 2 seconds",
    "Relatable problem everyone faces",
    "Clear value proposition"
  ],
  "recreate_tips": "To recreate this success: 1) Start with..."
}
```

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Viral Analysis only for TikTok videos | Profile analysis doesn't need deep hook/structure analysis |
| Shared Gemini model | Reduces credential complexity, consistent behavior |
| Merge before Merge Data | Maintains single data flow for downstream processing |

## Deviations from Plan

None - plan executed as specified.

## Issues Encountered

- Initial API deployment failed due to metadata fields in PUT payload
- Resolved by extracting only allowed fields (name, nodes, connections, settings)

## Next Phase Readiness

- Viral Analysis active and ready for TikTok video URLs
- All analysis flows converge at Merge Data for consistent output
- Wave 5 (Ad Monitoring Cron) is independent and can proceed

---
*Plan: 04-04-AI-Analysis-Updates*
*Completed: 2026-01-30*
