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
- **Weekly Limit Tracking**: Displays weekly usage limits when available
- **Stale Data Detection**: Automatically marks data as stale after 30 minutes (configurable)
- **Authentication Detection**: Alerts when you need to log in to Claude
- **Robust Parsing**: Multiple fallback strategies to extract usage data from the page
- **Options Page**: Customize stale threshold and color preferences

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this directory
5. The extension icon should appear in your toolbar

## Usage

1. Log in to Claude at `https://claude.ai`
2. Visit `https://claude.ai/settings/usage`
3. The extension will automatically extract your current session usage percentage
4. The badge on the extension icon will update to show your usage
5. Click the icon to see detailed information
6. Use the "Refresh" button to manually update usage data

## Badge States

- **Numeric percentage** (e.g., "45"): Current session usage
- **"⚠" or "AUTH"** (orange): You need to log in to Claude
- **"ERR"** (red): Error parsing the usage page
- **Gray badge**: Data is stale (older than threshold)

## Configuration

Right-click the extension icon and select "Options" to configure:
- **Stale Data Threshold**: How long before data is marked as stale (5-120 minutes)
- **Color-Coded Badge**: Enable/disable color coding based on usage level

## Project Status

All core phases complete and tested:

- ✅ **Phase 1**: Minimal extension skeleton
- ✅ **Phase 2**: Content script parsing with robust extraction
- ✅ **Phase 3**: Automatic refresh with stale data detection
- ✅ **Phase 4**: Functional popup UI with detailed status
- ✅ **Phase 5**: Configuration options and polish
- ✅ **Phase 6**: Weekly limit feature added and verified

**Latest Update (2026-01-28):**
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
- Passive refresh strategy: badge updates only when you visit the usage page
- No automatic polling (to respect rate limits and avoid aggressive background activity)
- Weekly limit may not be available for all account types (displays only if present on page)

## Future Enhancements

See Section 9 in `PLAN.md` for planned future enhancements:
- Active polling option (optional, user-enabled)
- Multi-account support
- Settings sync across devices
- Keyboard shortcuts

## License

This is a personal project for monitoring Claude Code usage.
