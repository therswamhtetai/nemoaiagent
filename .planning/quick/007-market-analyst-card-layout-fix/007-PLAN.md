# Quick Task 007: Market Analyst Card Layout Fix

## Goal
Fix the competitor card layout in Market Analyst tab so page names display fully without truncation.

## Problem
The Monitor button, ADS badge, and Delete button are all cramped in the header row, causing competitor names to truncate with ellipsis.

## Solution
1. Keep only Delete icon in header Actions area (top right)
2. Move Monitor button and ADS badge to footer area (near "Updated" timestamp)

## Tasks

### Task 1: Restructure Card Layout
**File:** `app/page.tsx` (lines 4354-4387, 4448-4455)

**Changes:**
1. Remove Monitor button and ADS badge from header Actions div (keep only Delete)
2. Add Monitor button and ADS badge to footer div (left side, before "Updated" text)

**Acceptance Criteria:**
- [ ] Competitor names display fully without truncation
- [ ] Delete icon remains in top-right position
- [ ] Monitor button appears in footer area
- [ ] ADS badge appears in footer area next to Monitor
- [ ] Layout is responsive and clean

## Verification
- Visual inspection of card layout
- Names should be visible without ellipsis
