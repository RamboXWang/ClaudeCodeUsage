# Claude Usage Monitor

A Chrome extension that monitors your Claude Code usage from `claude.ai/settings/usage` and displays it as a badge on the extension icon for quick visibility.

## Features

- **Badge Display**: Shows current session usage percentage directly on the extension icon
- **Color Coding**: Badge color changes based on usage level (green < 50%, yellow 50-80%, red > 80%)
- **Detailed Popup**: Click the icon to see full usage details including:
  - Current session usage percentage (large display)
  - Weekly limit usage percentage (smaller display)
  - Reset time
  - Last updated timestamp
  - Status indicator (OK/Stale)
- **Manual Refresh**: Click the "Refresh" button in popup to fetch latest usage data
- **Auto-Refresh**: Automatically refreshes usage data in the background at configurable intervals (5, 10, 15, 30, or 60 minutes)
- **Weekly Limit Tracking**: Displays weekly usage limits when available
- **Stale Data Detection**: Automatically marks data as stale after 30 minutes (configurable)
- **Authentication Detection**: Alerts when you need to log in to Claude
- **Robust Parsing**: Multiple fallback strategies to extract usage data from the page
- **Options Page**: Customize stale threshold, color preferences, and auto-refresh settings

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this directory
5. The extension icon should appear in your toolbar

## Usage

1. Log in to Claude at `https://claude.ai`
2. **Initial setup**: Visit `https://claude.ai/settings/usage` once to initialize data
3. The extension will automatically extract your current session usage percentage
4. The badge on the extension icon will update to show your usage
5. Click the icon to see detailed information
6. **Manual refresh**: Use the "Refresh" button in popup to fetch latest data anytime
7. **Auto-refresh** (optional): Enable in Options to automatically refresh at regular intervals

## Badge States

- **Numeric percentage** (e.g., "45"): Current session usage
- **"⚠" or "AUTH"** (orange): You need to log in to Claude
- **"ERR"** (red): Error parsing the usage page
- **Gray badge**: Data is stale (older than threshold)

## Configuration

Right-click the extension icon and select "Options" to configure:
- **Stale Data Threshold**: How long before data is marked as stale (5-120 minutes)
- **Color-Coded Badge**: Enable/disable color coding based on usage level
- **Auto-Refresh**: Enable/disable automatic background refresh
- **Refresh Interval**: Choose how often to auto-refresh (5, 10, 15, 30, or 60 minutes)

## Project Status

All core phases complete and tested:

- ✅ **Phase 1**: Minimal extension skeleton
- ✅ **Phase 2**: Content script parsing with robust extraction
- ✅ **Phase 3**: Automatic refresh with stale data detection
- ✅ **Phase 4**: Functional popup UI with detailed status
- ✅ **Phase 5**: Configuration options and polish
- ✅ **Phase 6**: Weekly limit feature added and verified

**Latest Update (2026-01-28 - v1.2.0):**
- ✅ Manual refresh fixed - now properly fetches new data instead of just reloading from storage
- ✅ Auto-refresh feature added - automatically refreshes usage data at configurable intervals
- ✅ Background tab mechanism - refreshes work by opening usage page in background tab
- ✅ Manual refresh confirmed working by user testing

**Previous Update (2026-01-28 - v1.1.0):**
- ✅ Weekly limit bug fixed - now correctly extracts and displays weekly usage
- ✅ Handles real Claude.ai page structure with text gaps
- ✅ Full test suite added for automated validation
- ✅ All manual tests passed

## Architecture

- **Service Worker** (`src/background.js`): Manages badge state, storage, and message handling
- **Content Script** (`src/contentScript.js`): Extracts usage data from claude.ai/settings/usage
- **Popup** (`popup/`): Displays detailed usage information and status
- **Options** (`options/`): Configuration interface for user preferences

## Development

See `PLAN.md` for the complete development plan and implementation details.

### File Structure

```
ClaudeCodeUsage/
├── manifest.json           # Extension manifest (MV3)
├── src/
│   ├── background.js       # Service worker
│   └── contentScript.js    # Content script for usage page
├── popup/
│   ├── popup.html          # Popup UI
│   └── popup.js            # Popup logic
├── options/
│   ├── options.html        # Options page UI
│   └── options.js          # Options logic
├── assets/
│   ├── icon-16.png         # Extension icon (16x16)
│   ├── icon-48.png         # Extension icon (48x48)
│   └── icon-128.png        # Extension icon (128x128)
├── PLAN.md                 # Development plan
└── README.md               # This file
```

## Known Limitations

- Extension relies on the current structure of claude.ai/settings/usage page
- If Claude changes the page structure, the content script may need updates
  - **Note:** As of 2026-01-28, handles the real page structure robustly with gap-tolerant parsing
- Auto-refresh opens a background tab briefly to fetch data (closes automatically after 10-15 seconds)
- Weekly limit may not be available for all account types (displays only if present on page)

## Future Enhancements

See Section 9 in `PLAN.md` for planned future enhancements:
- ~~Active polling option (optional, user-enabled)~~ ✅ Implemented in v1.2.0
- Multi-account support
- Settings sync across devices
- Keyboard shortcuts
- Usage history/trends
- Notifications for high usage

## License

This is a personal project for monitoring Claude Code usage.
