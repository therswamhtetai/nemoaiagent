---
created: 2026-01-30T19:29
title: Add Social Watch tool for saved competitor data
area: integration
files:
  - n8n workflow: Social Scout (HCV-51qLaCdcxHGx2yBcO)
  - Database tables: competitors, social_stats
---

## Problem

Currently, to get competitor information, the agent must run the full "Social Scout" scraping process even when data already exists in the database. There's no way to query previously saved competitor data and posts.

User needs:
- A new tool (distinct from Social Scout) to access saved data
- Agent can query this tool when user asks about a competitor
- Avoids re-running expensive scraping operations
- Quick retrieval of stored social_stats and recent_posts

## Solution

Create new n8n workflow "Social Watch" that:
1. Accepts competitor name or ID as input
2. Queries `competitors` and `social_stats` tables
3. Returns stored data: follower_count, viral_score, summary_analysis, recent_posts, is_running_ads
4. Add as tool to Web API Router
5. Agent uses Social Watch for queries, Social Scout only for fresh scraping

Tool description should clarify: "Use this to retrieve saved competitor data. Use Social Scout only when user explicitly requests fresh/new data."
