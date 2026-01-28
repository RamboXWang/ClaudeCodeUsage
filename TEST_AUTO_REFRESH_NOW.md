# Auto-Refresh Test - Step by Step

## Prerequisites
✅ Manual refresh is working (confirmed)

## Test Plan

Since manual refresh works, auto-refresh should work too (same mechanism).
Let's test it!

---

## Step 1: Enable Auto-Refresh

1. **Keep service worker console open** (from manual refresh test)
2. **Right-click extension icon** → "Options"
3. **Scroll down** to "Auto-Refresh Settings" section
4. **Click the toggle** to enable "Enable Auto-Refresh"
   - Toggle should turn purple/active
5. **Select interval:** Keep "5 minutes" (default)
6. **Click "Save Settings"**
7. **Button should show "Saved!"** briefly

---

## Step 2: Verify Auto-Refresh is Enabled

**Check service worker console:**

You should see:
```
Settings updated: {autoRefreshEnabled: true, refreshIntervalMinutes: 5, ...}
Auto-refresh enabled: every 5 minutes
```

If you see this ✅ → Auto-refresh is active!

---

## Step 3: Wait 5 Minutes

Set a timer for 5 minutes. Watch the service worker console.

**What to expect after 5 minutes:**

Console messages (in order):
```
Performing auto-refresh...
Auto-refresh tab opened: [number]
```

Then (after a few seconds):
```
✅ Background received usage update: {
  currentSessionPercent: XX,
  weeklyLimitPercent: YY,
  timestamp: [time]
}
✓ Data stored to chrome.storage.local
✓ Badge updated
```

Then (after ~15 seconds total):
```
Auto-refresh tab closed: [number]
```

---

## Step 4: Verify Badge Updated

After the auto-refresh completes:

1. **Click extension icon** to open popup
2. **Check "Last Updated"** - should show "Just now" or recent time
3. **Check badge** - should reflect latest usage

---

## Step 5: Verify It Repeats

Wait another 5 minutes. Auto-refresh should fire again automatically.

**Check console** for the same sequence of messages.

---

## Alternative: Test with 10-Minute Interval

If you don't want to wait 5 minutes twice:

1. Open Options
2. Change interval to "10 minutes"
3. Save
4. Wait 10 minutes
5. Verify it fires

---

## Troubleshooting

### If you DON'T see "Auto-refresh enabled: every 5 minutes"

**Check:**
1. Did you save settings?
2. Is toggle ON (purple)?
3. Check console for errors

**Debug:**
In service worker console, run:
```javascript
chrome.storage.local.get(['settings'], d => console.log(d.settings))
```

Should show: `autoRefreshEnabled: true`

### If you DON'T see "Performing auto-refresh..." after 5 minutes

**Check alarms:**
In service worker console, run:
```javascript
chrome.alarms.getAll(alarms => console.log(alarms))
```

Should see an alarm named "auto-refresh" with `periodInMinutes: 5`

### If tab opens but no data update

Same as manual refresh - check:
1. Are you logged in to claude.ai?
2. Check content script logs on the usage page tab

---

## Quick Verification (Without Waiting)

If you don't want to wait 5 minutes, you can trigger it manually:

**In service worker console, run:**
```javascript
performAutoRefresh()
```

This will immediately trigger an auto-refresh cycle.
- Tab should open
- Data should be extracted
- Tab should close
- Badge should update

If this works, the scheduled auto-refresh will also work!

---

## Success Criteria

- ✅ Enable toggle works in Options
- ✅ Console shows "Auto-refresh enabled: every 5 minutes"
- ✅ After 5 minutes, auto-refresh fires automatically
- ✅ Console shows the full sequence (tab open → data received → tab closed)
- ✅ Badge and popup update with fresh data
- ✅ Process repeats every 5 minutes

---

## Report Results

After testing, please report:

**Auto-Refresh Test Results:**
```
Enable/Save:        ✅ / ❌
Console confirms:   ✅ / ❌
Fires after 5 min:  ✅ / ❌
Data updates:       ✅ / ❌
Repeats:            ✅ / ❌

Notes: _______________________
```

---

## Expected Timeline

- **0:00** - Enable auto-refresh, save settings
- **0:01** - Console shows "Auto-refresh enabled"
- **5:00** - First auto-refresh fires
- **5:01** - Badge updates
- **10:00** - Second auto-refresh fires
- **10:01** - Badge updates
- ...continues every 5 minutes

---

**Start the test! Enable auto-refresh in Options and let me know after 5 minutes.**

Or use the quick verification to test immediately:
```javascript
performAutoRefresh()
```
