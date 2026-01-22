# Changelog

All notable changes to this project will be documented in this file.

## [1.0.12] - 2026-01-22

### Added
- **PWA Support**: Converted the application into a Progressive Web App (PWA).
  - Added `app/manifest.ts` for PWA metadata.
  - configured `next.config.mjs` with `@ducanh2912/next-pwa` for Next.js App Router compatibility.
  - Added Apple mobile web app meta tags in `layout.tsx`.

### Changed
- **Login Screen**: Updated greeting text to "Greetings from Nemo" and subtext to "Your Personal AI Assistant".
- **Deployment**: Switched package manager from `pnpm` to `npm` for Vercel deployment stability.
  - Removed `pnpm-lock.yaml` to resolve "frozen-lockfile" conflicts.
  - Generated `package-lock.json`.

### Fixed
- **UI Background**: Fixed "floating" app effect and white background leaks on mobile.
  - Added `overscroll-behavior-y: none` to global CSS.
  - Enforced `min-h-screen` and black background on `body` and `html`.
  - Set `viewport-fit=cover` and `theme-color: #000000` to handle safety areas and browser bars.
- **Layout**: Fixed Login screen height ensuring it covers the full mobile viewport.

### Removed
- **Unwanted Routes**: Removed `/calendar` route (`app/calendar/page.tsx`).

### Fixed (v1.0.12+)
- **Calendar Date Lag**: Fixed timezone offset issue where tasks were appearing one day late on the calendar grid.
- **iOS PWA Overlap**: Added Safe Area insets to top navigation bar and ALL modals to prevent overlap with iOS status bar.
- **Login Text**: Updated login greetings.
