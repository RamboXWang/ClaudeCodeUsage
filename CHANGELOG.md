# Changelog

All notable changes to this project will be documented in this file.

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
