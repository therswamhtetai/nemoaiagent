---
created: 2026-01-30T19:29
title: Enforce theme colors for new components
area: ui
files:
  - src/styles/* (theme configuration)
  - Home screen components (reference for colors)
---

## Problem

When creating new components, there's no enforced standard for using the project's theme colors. The user wants strict adherence to:

1. **Main theme color** - must be used consistently
2. **Button colors** - use the current "makeup-like shade" style
3. **Reference: Home screen design** - follow existing color patterns

Additionally:
- Use **Radix UI Scale** for component implementation
- Maintain visual consistency across all new UI work

## Solution

- Document theme colors in a central location (if not already)
- Find and document the "makeup-like shade" button color values
- Create/update component guidelines
- Reference home screen for color palette
- Use Radix UI Scale for new component development
- Consider adding CSS variables or Tailwind theme config enforcement

TBD: Need to locate exact theme color values from existing codebase.
