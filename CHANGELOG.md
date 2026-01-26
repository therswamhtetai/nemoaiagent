# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-27

### Added
- **Delete Contact**: Added delete button to CRM Contact Edit modal.
- **PWA Support**: Converted the application into a Progressive Web App (PWA).

### Changed
- **What's New**: Updated version to 1.1.0.
- **Greeting Logic**: Fixed flickering issue by optimizing `useEffect` dependencies.
- **Upload Limits**: Clarified file size limits apply to both documents and images.
- **Calendar**: Fixed archived tasks appearing in upcoming lists and grid view.

### Removed
- **Sound Effects**: Removed all sound effects and valid audio feedback systems as requested.
- **Junk Code**: Cleaned up unused components (`Typewriter`) and commented-out legacy code.
- **Unwanted Routes**: Removed `/calendar` route (`app/calendar/page.tsx`).

## [1.0.12] - 2026-01-22

### Added
- **PWA Support**: Converted the application into a Progressive Web App (PWA).

### Changed
- **Login Screen**: Updated greeting text.
- **Deployment**: Switched to npm.

### Fixed
- **UI Background**: Fixed "floating" app effect on mobile.
- **Calendar Date Lag**: Fixed timezone offset issue.
