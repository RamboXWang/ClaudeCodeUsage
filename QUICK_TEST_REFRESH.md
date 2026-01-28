# Quick Test Guide: Manual & Auto-Refresh

## Issue Fixed
Both manual refresh (popup button) and auto-refresh now properly fetch new data by opening the usage page in a background tab.

## How It Works Now

**Before (Broken):**
- Refresh button just reloaded from storage (no new data fetched)

**After (Fixed):**
- Refresh button → Sends message to background → Opens usage page in background tab → Content script extracts data → Tab closes → Popup updates

---

## Test 1: Manual Refresh (PRIORITY - Test This First)

### Setup:
1. Go to `chrome://extensions`
2. Find "Claude Usage Monitor"
3. Click **Reload** button (🔄)

### Test Steps:
1. **Open service worker console:**
   - Click "service worker" link
   - Keep this console open

2. **Click extension icon** to open popup

3. **Click "Refresh" button** in popup

4. **Watch the service worker console** for:
   ```
   Performing manual refresh...
   Manual refresh tab opened: [number]
   [After ~10 seconds]
   Manual refresh tab closed: [number]
   ```

5. **Also watch for data update:**
   ```
   ✅ Background received usage update: {
     currentSessionPercent: XX,
     weeklyLimitPercent: YY,
     ...
   }
   ```

6. **Check popup:**
   - Button should show "Refreshing..." then return to "Refresh"
   - "Last Updated" should show recent time
   - Badge should update with latest data

### Expected Results:
- ✅ Button text changes to "Refreshing..."
- ✅ Background tab opens (you might not see it)
- ✅ Console shows "Manual refresh tab opened"
- ✅ Console shows data received
- ✅ Tab closes after ~10 seconds
- ✅ Popup "Last Updated" updates
- ✅ Badge updates

### If It Fails:
Check console for errors. Common issues:
- "Manual refresh already in progress" - wait 10 seconds and try again
- No "tab opened" message - check tabs permission
- Tab doesn't close - check console for errors

---

## Test 2: Auto-Refresh (Test After Manual Works)

### Setup:
1. Make sure manual refresh works first!
2. Right-click extension icon → **Options**
3. Service worker console should still be open

### Test Steps:

1. **Enable auto-refresh:**
   - Toggle "Enable Auto-Refresh" ON
   - Select "5 minutes" interval
   - Click "Save Settings"

2. **Verify it's enabled:**
   - Check console for:
     ```
     Auto-refresh enabled: every 5 minutes
     ```

3. **Wait 5 minutes**
   - Watch the service worker console
   - Set a timer if needed

4. **After 5 minutes, watch for:**
   ```
   Performing auto-refresh...
   Auto-refresh tab opened: [number]
   [After ~15 seconds]
   Auto-refresh tab closed: [number]
   ✅ Background received usage update: {...}
   ```

5. **Verify badge updates**

### Expected Results:
- ✅ Console shows "Auto-refresh enabled: every 5 minutes"
- ✅ After 5 minutes, tab opens automatically
- ✅ Data is extracted
- ✅ Tab closes
- ✅ Badge updates
- ✅ Process repeats every 5 minutes

---

## Debugging

### If Manual Refresh Doesn't Work:

**Check 1: Permissions**
```
chrome://extensions → Claude Usage Monitor → Permissions
Should see: "tabs", "storage", "alarms", "https://claude.ai/*"
```

**Check 2: Content Script**
1. When background tab opens, quickly:
2. Go to chrome://extensions
3. Find the usage page tab
4. Click "Inspect" on that tab
5. Check console for content script logs:
   ```
   Claude Usage Monitor content script loaded
   ✓ Extracted usage data: {...}
   📤 Sending usage update to background
   ```

**Check 3: Message Handling**
Look for errors like:
- "Error sending message"
- "Manual refresh error"
- "Could not establish connection"

### If Auto-Refresh Doesn't Work:

**Check 1: Is it enabled?**
- Open Options
- Verify toggle is ON (purple)
- Verify interval is set

**Check 2: Console logs**
```
Should see: "Auto-refresh enabled: every X minutes"
Should NOT see: "Auto-refresh disabled"
```

**Check 3: Alarms**
In service worker console, run:
```javascript
chrome.alarms.getAll(alarms => console.log(alarms))
```
Should see an alarm named "auto-refresh"

**Check 4: Wait long enough**
- 5 minutes = 300 seconds
- Set a timer to be sure
- Watch console continuously

---

## Success Checklist

Manual Refresh:
- [ ] Button shows "Refreshing..."
- [ ] Background tab opens
- [ ] Data is extracted and sent
- [ ] Tab closes automatically
- [ ] Popup updates
- [ ] "Last Updated" shows recent time
- [ ] Badge reflects new data

Auto-Refresh:
- [ ] Can be enabled in Options
- [ ] Console shows it's enabled
- [ ] Fires after configured interval
- [ ] Opens tab automatically
- [ ] Extracts data
- [ ] Closes tab
- [ ] Badge updates
- [ ] Repeats at interval

---

## Quick Console Commands

**Check if auto-refresh is enabled:**
```javascript
chrome.storage.local.get(['settings'], d => console.log(d.settings))
```

**Check alarms:**
```javascript
chrome.alarms.getAll(alarms => console.log(alarms))
```

**Check last usage data:**
```javascript
chrome.storage.local.get(null, d => console.log(d))
```

---

## Report Format

Please test and report:

**Manual Refresh Test:**
```
✅ / ❌ - Button triggers refresh
✅ / ❌ - Tab opens
✅ / ❌ - Data extracted
✅ / ❌ - Tab closes
✅ / ❌ - Popup updates

Notes: ___________________
```

**Auto-Refresh Test:**
```
✅ / ❌ - Can be enabled
✅ / ❌ - Console shows enabled
✅ / ❌ - Fires after 5 minutes
✅ / ❌ - Tab opens/closes
✅ / ❌ - Data updates

Notes: ___________________
```

---

**Start with Test 1 (Manual Refresh) and let me know the results!**
