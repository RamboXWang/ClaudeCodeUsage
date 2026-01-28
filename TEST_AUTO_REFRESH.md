# Testing Guide: Auto-Refresh Feature

## Pre-Test Checklist

Before testing, ensure:
- [ ] Extension is loaded in Chrome
- [ ] You're logged in to claude.ai
- [ ] Current time noted (for timing verification)

## Test 1: Enable Auto-Refresh (5 minutes)

### Steps:
1. Right-click extension icon → "Options"
2. Scroll to "Auto-Refresh Settings" section
3. Click toggle to enable "Enable Auto-Refresh"
4. Verify dropdown shows "5 minutes" (default)
5. Click "Save Settings"
6. Verify button shows "Saved!" briefly

### Expected Results:
- ✅ Toggle turns purple (active state)
- ✅ Save button shows success feedback
- ✅ Settings saved without errors

### Console Verification:
1. Go to `chrome://extensions`
2. Find "Claude Usage Monitor"
3. Click "service worker" link
4. Look for: `Auto-refresh enabled: every 5 minutes`

**Expected:** ✅ Console shows auto-refresh is enabled

---

## Test 2: First Auto-Refresh (Wait 5 Minutes)

### Steps:
1. After saving settings, wait 5 minutes
2. Watch for background tab activity
3. Check extension badge

### Expected Results During Refresh:
- ✅ New tab opens briefly (you may not see it if it's background)
- ✅ Tab closes automatically within 15 seconds
- ✅ Badge updates with latest usage data

### Console Verification:
In service worker console, look for:
```
Performing auto-refresh...
Auto-refresh tab opened: [tab-id]
Auto-refresh tab closed: [tab-id]
```

**Expected:** ✅ All three messages appear in sequence

---

## Test 3: Verify Data Update

### Steps:
1. After auto-refresh completes
2. Click extension icon to open popup
3. Check "Last Updated" timestamp

### Expected Results:
- ✅ "Last Updated" shows "Just now" or recent time
- ✅ Current session percentage displays
- ✅ Weekly limit displays (if available)
- ✅ Status shows "OK" (not stale)

---

## Test 4: Change Interval to 10 Minutes

### Steps:
1. Open Options page again
2. Change "Refresh Interval" dropdown to "10 minutes"
3. Click "Save Settings"
4. Check service worker console

### Expected Results:
- ✅ Console shows: `Auto-refresh enabled: every 10 minutes`
- ✅ Old alarm cleared
- ✅ New alarm created with 10-minute interval

### Verification:
Wait 10 minutes and verify another auto-refresh occurs (repeat Test 2 steps)

---

## Test 5: Disable Auto-Refresh

### Steps:
1. Open Options page
2. Click toggle to disable "Enable Auto-Refresh"
3. Click "Save Settings"
4. Check service worker console

### Expected Results:
- ✅ Toggle turns gray (inactive state)
- ✅ Console shows: `Auto-refresh disabled`
- ✅ No more automatic refreshes occur

### Verification:
Wait 10-15 minutes and verify NO auto-refresh happens

---

## Test 6: Re-Enable and Verify

### Steps:
1. Re-enable auto-refresh with 5-minute interval
2. Save settings
3. Wait 5 minutes

### Expected Results:
- ✅ Auto-refresh resumes working
- ✅ Tab opens and closes automatically
- ✅ Badge updates

---

## Test 7: Extension Reload (Persistence Test)

### Steps:
1. With auto-refresh enabled
2. Go to `chrome://extensions`
3. Click reload button for "Claude Usage Monitor"
4. Check service worker console after reload

### Expected Results:
- ✅ Console shows: `Claude Usage Monitor service worker starting`
- ✅ Console shows: `Auto-refresh enabled: every X minutes`
- ✅ Auto-refresh continues working after reload

---

## Test 8: Tab Cleanup (Edge Case)

### Steps:
1. Enable auto-refresh with 5-minute interval
2. Wait for auto-refresh to start (tab opens)
3. **Manually find and close the background tab** before 15 seconds
4. Check service worker console

### Expected Results:
- ✅ Console shows: `Auto-refresh tab was closed`
- ✅ `autoRefreshTabId` is cleaned up (null)
- ✅ Next auto-refresh works normally (no duplicate)

---

## Test 9: Multiple Intervals

### Steps:
Test each interval option:
- [ ] 5 minutes
- [ ] 10 minutes
- [ ] 15 minutes
- [ ] 30 minutes
- [ ] 60 minutes

For each:
1. Set interval in options
2. Save
3. Verify console shows correct interval
4. (Optional) Wait and verify it fires at correct time

---

## Test 10: Error Handling

### Steps:
1. Enable auto-refresh
2. **Log out of claude.ai**
3. Wait for auto-refresh to occur

### Expected Results:
- ✅ Tab opens
- ✅ Content script detects no auth
- ✅ Error stored: `AUTH_REQUIRED`
- ✅ Badge shows "⚠" (orange)
- ✅ Tab closes after timeout

### Recovery Test:
1. Log back in to claude.ai
2. Wait for next auto-refresh

**Expected:** ✅ Badge returns to normal usage display

---

## Quick Smoke Test (5 Minutes)

If you want a fast verification:

1. ✅ Enable auto-refresh (5 min)
2. ✅ Save settings
3. ✅ Wait 5 minutes
4. ✅ Verify tab opens and closes automatically
5. ✅ Check badge updates
6. ✅ Done!

---

## Troubleshooting

### Issue: Auto-refresh doesn't start

**Check:**
- Is toggle enabled in options?
- Did you save settings?
- Check service worker console for errors
- Verify "tabs" permission is granted

### Issue: Tab doesn't close

**Possible causes:**
- You clicked on the tab (makes it active)
- Browser is preventing background tab closure
- Check console for errors

**Solution:**
- Let tab timeout naturally (15 seconds)
- Don't interact with auto-refresh tabs

### Issue: Data doesn't update

**Check:**
- Are you logged in to claude.ai?
- Does manual refresh work?
- Check content script console logs
- Verify page structure hasn't changed

---

## Test Results Template

```
Auto-Refresh Feature Test Results
Date: ___________
Tester: ___________

Test 1 - Enable Auto-Refresh:        [ ] PASS  [ ] FAIL
Test 2 - First Auto-Refresh:         [ ] PASS  [ ] FAIL
Test 3 - Verify Data Update:         [ ] PASS  [ ] FAIL
Test 4 - Change Interval:            [ ] PASS  [ ] FAIL
Test 5 - Disable Auto-Refresh:       [ ] PASS  [ ] FAIL
Test 6 - Re-Enable and Verify:       [ ] PASS  [ ] FAIL
Test 7 - Extension Reload:           [ ] PASS  [ ] FAIL
Test 8 - Tab Cleanup:                [ ] PASS  [ ] FAIL
Test 9 - Multiple Intervals:         [ ] PASS  [ ] FAIL  [ ] SKIP
Test 10 - Error Handling:            [ ] PASS  [ ] FAIL

Overall Result:  [ ] ✅ ALL TESTS PASSED  [ ] ❌ SOME TESTS FAILED

Notes:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## Success Criteria

For feature to be considered working:
- ✅ Auto-refresh can be enabled/disabled
- ✅ Interval can be configured (5-60 minutes)
- ✅ Settings persist across browser restarts
- ✅ Tab opens in background (not disruptive)
- ✅ Tab closes automatically within 15 seconds
- ✅ Badge updates with fresh data
- ✅ No duplicate refreshes
- ✅ Handles errors gracefully (auth, parsing)
- ✅ Manual refresh still works
- ✅ No console errors

---

**Ready to test!** Follow the tests in order, or run the Quick Smoke Test for fast verification.
