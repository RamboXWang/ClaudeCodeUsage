# Auto-Refresh Feature

## Overview

The auto-refresh feature automatically refreshes Claude usage data in the background at regular intervals without requiring you to manually visit the usage page.

## How It Works

1. **Background Tab**: Opens claude.ai/settings/usage in a background tab (won't interrupt your browsing)
2. **Data Extraction**: Content script extracts current session and weekly limit data
3. **Auto-Close**: Tab automatically closes after 15 seconds
4. **Configurable Interval**: Refresh every 5, 10, 15, 30, or 60 minutes

## Configuration

### Enable/Disable Auto-Refresh

1. Right-click the extension icon → "Options"
2. Find "Auto-Refresh Settings" section
3. Toggle "Enable Auto-Refresh" on/off
4. Click "Save Settings"

### Change Refresh Interval

1. Open Options page
2. Select interval from dropdown (5/10/15/30/60 minutes)
3. Click "Save Settings"

**Note:** Changes take effect immediately after saving.

## Default Settings

- **Auto-Refresh**: Disabled by default
- **Interval**: 5 minutes (when enabled)

## Technical Details

### Implementation

- Uses `chrome.alarms` API for scheduling
- Opens tab with `active: false` (background)
- Timeout of 15 seconds for data extraction
- Automatic cleanup if tab is manually closed
- Respects existing manual refresh workflows

### Code Changes

#### manifest.json
- Added "tabs" permission for tab management
- Updated version to 1.2.0

#### options/options.html
- Added "Auto-Refresh Settings" section
- Enable/disable toggle
- Interval selection dropdown (5-60 minutes)
- Information box explaining how it works

#### options/options.js
- Added `autoRefreshEnabled` setting (default: false)
- Added `refreshIntervalMinutes` setting (default: 5)
- Save/load auto-refresh preferences
- Notify background script on settings change

#### src/background.js
- `setupAutoRefreshAlarm()`: Creates/clears alarms based on settings
- `performAutoRefresh()`: Opens usage page in background tab
- `autoRefreshTabId` tracking to prevent duplicate refreshes
- Tab cleanup on timeout (15 seconds)
- Tab removal listener for cleanup
- Integration with existing `onStartup` and `onInstalled` handlers

## Usage Scenarios

### Scenario 1: Always Up-to-Date
- Enable auto-refresh with 5-minute interval
- Badge always shows current usage
- No need to visit usage page manually
- Useful for active development sessions

### Scenario 2: Periodic Checks
- Enable auto-refresh with 30-minute interval
- Less frequent background activity
- Good balance between freshness and resource usage
- Suitable for regular monitoring

### Scenario 3: Manual Only (Default)
- Keep auto-refresh disabled
- Visit usage page manually when needed
- No background tab activity
- Most privacy-conscious option

## Resource Considerations

### What Happens During Auto-Refresh

1. Background tab opens (not visible)
2. Page loads (~2-5 seconds)
3. Content script extracts data (~1 second)
4. Tab closes automatically (after 15 seconds max)
5. Badge updates with new data

### Resource Usage

- **Network**: One page load per interval
- **Memory**: Temporary tab (closed after 15 seconds)
- **Battery**: Minimal impact (similar to checking a website)

### Best Practices

- Use longer intervals (30-60 minutes) for battery-powered devices
- Disable auto-refresh when not actively monitoring
- 5-minute interval is best for active development

## Comparison with Manual Refresh

| Feature | Manual (Default) | Auto-Refresh |
|---------|-----------------|--------------|
| Up-to-date data | Only when you visit | Always fresh |
| Background activity | None | Minimal |
| User action required | Yes | No |
| Resource usage | Zero | Low |
| Privacy | Highest | Lower (automated visits) |

## Testing Checklist

- [ ] Enable auto-refresh in options
- [ ] Set interval to 5 minutes
- [ ] Save settings
- [ ] Wait 5 minutes
- [ ] Verify badge updates automatically
- [ ] Check console logs for "Auto-refresh tab opened"
- [ ] Verify tab closes automatically
- [ ] Change interval to 10 minutes
- [ ] Verify new interval works
- [ ] Disable auto-refresh
- [ ] Verify no more automatic refreshes
- [ ] Re-enable and verify it works again

## Troubleshooting

### Auto-refresh not working

1. **Check if enabled**: Open Options → verify toggle is ON
2. **Check interval**: Make sure enough time has passed
3. **Check console**: Open background service worker console
   - Look for "Auto-refresh enabled: every X minutes"
   - Look for "Performing auto-refresh..."
4. **Check permissions**: Verify "tabs" permission is granted

### Tab opens but doesn't close

- Normal if you manually interact with the tab
- Will close after 15-second timeout
- Check background console for errors

### Data not updating

- Verify you're logged in to Claude
- Check content script logs on usage page
- Look for extraction errors in console

## Future Enhancements

- [ ] Smart refresh (only when Chrome is active)
- [ ] Exponential backoff on errors
- [ ] Notification on significant usage changes
- [ ] Custom refresh schedules (e.g., only during work hours)
- [ ] Pause auto-refresh manually without disabling

## Related Files

- `/manifest.json` - Permissions configuration
- `/options/options.html` - UI for auto-refresh settings
- `/options/options.js` - Settings management
- `/src/background.js` - Auto-refresh implementation
- `/src/contentScript.js` - Data extraction (unchanged)

## API References

- [chrome.alarms](https://developer.chrome.com/docs/extensions/reference/alarms/)
- [chrome.tabs](https://developer.chrome.com/docs/extensions/reference/tabs/)
- [chrome.storage](https://developer.chrome.com/docs/extensions/reference/storage/)
