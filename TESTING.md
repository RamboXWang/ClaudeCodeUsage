# Manual Testing Checklist for Weekly Limit Bug Fix

## Automated Tests Results ✅

**Test execution:** `node test-extraction.js`

All 5 test cases PASSED:
- ✅ Format 1: Standard with colons (Weekly limit: 78%)
- ✅ Format 2: No colons (Weekly 78%)
- ✅ Format 3: Multi-line (Week on one line, 78% on next)
- ✅ Format 4: Extra spaces (Weekly limit   :   78  %)
- ✅ Format 5: No weekly limit present (should show null)

**Code validation:**
- ✅ contentScript.js - No syntax errors
- ✅ background.js - No syntax errors
- ✅ popup.js - No syntax errors
- ✅ manifest.json - Valid JSON

## Manual Browser Testing Required

Since I cannot actually open Chrome and test the extension, please follow these steps to verify the fix works:

### Step 1: Reload Extension
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Find "Claude Usage Monitor"
4. Click the refresh icon (🔄) to reload the extension
5. ✅ Extension should reload without errors

### Step 2: Test on Usage Page
1. Go to `https://claude.ai/settings/usage`
2. Make sure you're logged in
3. Open DevTools (F12 or Right-click > Inspect)
4. Go to Console tab
5. Look for these messages:

**Expected console output:**
```
Claude Usage Monitor content script loaded
Initializing usage extraction...
Attempting to extract usage data...
Weekly limit found (pattern X): [number]
Strategy 1 extraction: { currentSessionPercent: XX, weeklyLimitPercent: YY }
✓ Extracted usage data: { currentSessionPercent: XX, weeklyLimitPercent: YY, resetTimeText: "..." }
✓ Usage data sent to background script
```

**Check these:**
- ✅ `weeklyLimitPercent` should be a number (not null)
- ✅ "Weekly limit found" message appears showing which pattern matched
- ✅ No errors in console

### Step 3: Check Background Script
1. Go to `chrome://extensions`
2. Find "Claude Usage Monitor"
3. Click "service worker" link (opens background script console)
4. Look for:

**Expected output:**
```
✓ Background received usage update: { currentSessionPercent: XX, weeklyLimitPercent: YY, ... }
✓ Data stored to chrome.storage.local
✓ Badge updated
```

**Check:**
- ✅ `weeklyLimitPercent` is present and has a number value
- ✅ All three success messages appear

### Step 4: Verify Storage
1. On any page, open DevTools (F12)
2. Go to: Application tab > Storage > Extension storage
3. Select "Chrome Extension" on the left
4. Find "Claude Usage Monitor"
5. Check stored data:

**Expected keys:**
- `currentSessionPercent`: (number)
- `weeklyLimitPercent`: (number) ← **This should now exist!**
- `resetTimeText`: (string)
- `extractedAt`: (timestamp)
- `isStale`: (boolean)
- `lastError`: (should be null if working)

**Check:**
- ✅ `weeklyLimitPercent` key exists
- ✅ Value is a number matching what you see on the page

### Step 5: Check Popup Display
1. Click the extension icon to open popup
2. Right-click in the popup window
3. Select "Inspect" (opens popup DevTools)
4. Go to Console tab

**Expected console output:**
```
Popup opened
Loaded data: { currentSessionPercent: XX, weeklyLimitPercent: YY, ... }
Popup displaying data: { currentSessionPercent: XX, weeklyLimitPercent: YY, ... }
✓ Showing weekly limit: YY
```

**Visual check:**
- ✅ Main usage percentage displays at top (large, color-coded)
- ✅ **Weekly limit section is visible** (smaller text, bordered separator)
- ✅ Weekly limit shows correct percentage matching the usage page
- ✅ Status, Reset time, Last updated all display correctly

### Step 6: Test Edge Cases

**Test A: Page with NO weekly limit**
If Claude's usage page doesn't show a weekly limit for your account:
- ✅ Console should show `weeklyLimitPercent: null`
- ✅ Popup should hide the weekly limit section (no visual element)
- ✅ No errors should occur

**Test B: Refresh button**
1. Click "Refresh" button in popup
2. ✅ Button should show "Refreshing..." briefly
3. ✅ Button should be disabled while refreshing
4. ✅ Data should reload from storage (console logs appear)
5. ✅ Button returns to "Refresh" after 500ms

**Test C: Stale data**
1. Wait 30+ minutes without visiting usage page
2. ✅ Badge should turn gray
3. ✅ Popup should show "Stale" status
4. ✅ Weekly limit should still display (if present)

## If Tests Fail

### Weekly limit shows null in logs but exists on page
1. Copy the exact text from the usage page weekly limit section
2. Check if it matches any of these patterns:
   - `Weekly limit: XX%`
   - `Weekly: XX%`
   - `Week` (on one line) then `XX%` (on next line)
3. If not, we need to add a new pattern to match your page structure

### Weekly limit in storage but not in popup
1. Check popup console for: `✗ Weekly limit not available (null or undefined)`
2. This means the data type is wrong - check if it's stored as string vs number
3. Verify the conditional logic in popup.js line 80-85

### No logs appear
1. Verify extension is reloaded
2. Check for JavaScript errors in console
3. Verify you're on `https://claude.ai/settings/usage` (not just /settings)
4. Check if content script is injected: run `console.log('test')` in page console

## Test Results

After completing manual testing, record results:

- [ ] Step 1: Extension reloaded without errors
- [ ] Step 2: Weekly limit extracted from page (check console logs)
- [ ] Step 3: Background script received weekly limit data
- [ ] Step 4: Storage contains weeklyLimitPercent with correct value
- [ ] Step 5: Popup displays weekly limit correctly
- [ ] Step 6A: Edge case - no weekly limit handled gracefully
- [ ] Step 6B: Edge case - refresh button works
- [ ] Step 6C: Edge case - stale data handled correctly

**Overall result:**
- [ ] ✅ Bug fix verified - weekly limit now displays
- [ ] ❌ Still broken - see error details below

**Error details (if any):**
```
[Paste console logs, screenshots, or error messages here]
```
