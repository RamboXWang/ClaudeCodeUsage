# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-01-28

### Added
- **Auto-Refresh Feature**: Automatically refreshes usage data in the background at configurable intervals
  - Configurable intervals: 5, 10, 15, 30, or 60 minutes
  - Enable/disable toggle in Options page
  - Uses chrome.alarms API for efficient scheduling
  - Opens usage page in background tab (closes automatically)
- Background tab refresh mechanism for both manual and auto-refresh
- "tabs" permission added to manifest for background tab management
- Comprehensive documentation:
  - `AUTO_REFRESH_FEATURE.md` - Feature overview and technical details
  - `TEST_AUTO_REFRESH.md` - Comprehensive test suite
  - `QUICK_TEST_REFRESH.md` - Quick test guide for manual and auto-refresh
  - `TEST_AUTO_REFRESH_NOW.md` - Step-by-step auto-refresh testing
- Auto-refresh settings section in Options page
- Enhanced logging with emoji indicators for better visibility

### Fixed
- **Critical Bug Fix:** Manual refresh button now properly fetches new data
  - Previous behavior: Only reloaded data from chrome.storage (no new fetch)
  - New behavior: Opens usage page in background tab to fetch fresh data
  - Popup sends MANUAL_REFRESH message to background script
  - Background tab closes automatically after 10 seconds
  - User confirmation: "Manual refresh work!"

### Changed
- Refresh mechanism completely rewritten:
  - Manual refresh: popup → background → open tab → extract → close tab → update
  - Auto-refresh: alarm → background → open tab → extract → close tab → update
- Service worker tracks separate tab IDs for auto and manual refresh
- Added tab cleanup on removal event
- Improved message passing with async response handling
- Extended content script logging for debugging
- Version bumped from 1.1.0 to 1.2.0

### Technical Details
- Added `setupAutoRefreshAlarm()` function to manage chrome.alarms
- Added `performAutoRefresh()` function to execute scheduled refreshes
- Added `handleManualRefresh()` function to handle popup refresh requests
- Both refresh types share the same core mechanism (background tab)
- Duplicate refresh prevention with in-progress checks
- Tab timeout: 10s for manual, 15s for auto-refresh

### Testing
- ✅ Manual refresh tested and confirmed working by user
- ⏳ Auto-refresh implementation complete, awaiting user testing

## [1.1.0] - 2026-01-28

### Added
- Weekly limit usage display in popup (smaller font below current session)
- Comprehensive test suite for extraction patterns
- Automated testing with `test-extraction.js`
- Browser console test script (`test-in-browser-console.js`)
- Visual storage inspector (`test-storage.html`)
- Complete testing documentation (TESTING.md, TEST_RESULTS.md, DEBUG.md)

### Fixed
- **Major Bug Fix:** Weekly limit not displaying in popup
  - Root cause: Real Claude.ai page has 4-5 lines of text between "Weekly limits" and the percentage
  - Solution: Rewrote content script to search ahead up to 15 lines after finding "Weekly limits"
  - Result: Weekly limit now extracts and displays correctly
- Improved extraction logic to handle real page structure with text gaps
- Enhanced console logging for debugging extraction issues

### Changed
- Simplified content script with line-by-line parsing instead of complex regex
- Updated extraction algorithm to distinguish between current session and weekly limit percentages
- Improved pattern matching to handle both "XX% used" and "XX%" formats
- Refresh button now reloads extension data instead of opening new tab

### Testing
- ✅ All automated tests pass (5/5 extraction patterns)
- ✅ Manual verification complete - user confirmed working
- ✅ Real page structure test passes

## [1.0.0] - 2026-01-27

### Added
- Initial release
- Badge display with current session usage percentage
- Color-coded badge (green/yellow/red based on usage)
- Detailed popup UI with usage information
- Stale data detection (30-minute threshold)
- Authentication detection
- Options page for configuration
- Robust parsing with multiple fallback strategies

### Features
- Manifest V3 Chrome extension
- Service worker for badge management
- Content script for data extraction
- Passive refresh strategy
- Settings persistence

---

## Version History Summary

- **v1.1.0** (2026-01-28): Weekly limit feature + bug fixes
- **v1.0.0** (2026-01-27): Initial release with core functionality
