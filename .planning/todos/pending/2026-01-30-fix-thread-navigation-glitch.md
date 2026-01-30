---
created: 2026-01-30T19:29
title: Fix thread navigation glitch with loading state
area: ui
files:
  - src/components/chat/* (thread-related components)
  - src/components/sidebar/* (thread list)
---

## Problem

Thread navigation in the sidebar feels unstable and glitchy. When users click on a thread to enter the chat view, the transition is not smooth - it feels jarring and unprofessional.

The user wants:
1. Smooth, fluent transitions when entering thread chat view
2. A ~2 second loading state on **first enter only** to ensure content is ready
3. Eliminate the current glitchy behavior entirely

## Solution

- Add loading state management for thread entry (first visit detection)
- Implement ~2 second loading transition on initial thread enter
- Use Radix UI Scale for animations/transitions
- Investigate current render timing issues causing glitch
- Consider skeleton loading or fade-in patterns

TBD: Need to identify specific components causing the glitch through debugging.
