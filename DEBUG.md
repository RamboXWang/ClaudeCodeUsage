# Debugging Weekly Limit Display Issue

## What Changed
- Improved regex patterns for weekly limit extraction with multiple fallback strategies
- Added comprehensive console logging throughout the data flow
- Made parsing more flexible to handle various text formats

## How to Debug

### Step 1: Reload the Extension
1. Go to `chrome://extensions`
2. Find "Claude Usage Monitor"
3. Click the refresh icon to reload the extension

### Step 2: Check Content Script Logs
1. Visit `https://claude.ai/settings/usage` (make sure you're logged in)
2. Open DevTools (F12 or Right-click > Inspect)
3. Go to the Console tab
4. Look for messages starting with:
   - `✓ Extracted usage data:` - Shows what was parsed
   - `Weekly limit found` - Shows which pattern matched
   - `✓ Usage data sent to background script` - Confirms data was sent

**What to check:**
- Is `weeklyLimitPercent` shown with a number or `null`?
- Which strategy (1, 2, or 3) successfully extracted the data?
- If it's `null`, look at the "Page text sample" to see the actual text

### Step 3: Check Background Script Logs
1. Go to `chrome://extensions`
2. Find "Claude Usage Monitor"
3. Click "service worker" link to open background script console
4. Look for messages:
   - `✓ Background received usage update:` - Shows what background received
   - `✓ Data stored to chrome.storage.local` - Confirms storage
   - Check if `weeklyLimitPercent` is present

### Step 4: Check Popup Logs
1. Click the extension icon to open the popup
2. Right-click in the popup and select "Inspect"
3. Go to the Console tab
4. Look for messages:
   - `Popup displaying data:` - Shows what popup loaded from storage
   - `✓ Showing weekly limit:` or `✗ Weekly limit not available`

### Step 5: Check Storage Directly
1. Open DevTools on any page
2. Go to Application tab > Storage > Extension storage
3. Find "Claude Usage Monitor"
4. Check if `weeklyLimitPercent` key exists and has a value

## Common Issues

### Issue 1: Page structure doesn't match patterns
**Symptom:** Content script logs show `weeklyLimitPercent: null`

**Solution:** Look at the "Page text sample" in console and identify how the weekly limit text appears. Update the regex patterns in `src/contentScript.js` accordingly.

### Issue 2: Data extracted but not displayed
**Symptom:** Content script and background logs show the number, but popup shows "not available"

**Solution:** Check popup console for the display logic. Verify the data type is correct (should be a number, not a string).

### Issue 3: No logs appear
**Symptom:** No console messages at all

**Solution:**
- Make sure the extension is reloaded after code changes
- Check if the content script is running on the right page
- Verify no JavaScript errors are preventing execution

## What the Regex Patterns Look For

The content script now tries these patterns in order:

1. `Weekly\s*(?:limit)?[:\s]*(\d+)\s*%` - Matches "Weekly limit: 45%" or "Weekly: 45%"
2. `Week[^0-9]*(\d+)\s*%` - Matches "Week" followed by any non-digit chars and then a number with %
3. In semantic parsing, also tries just `(\d+)\s*%` if "week" is mentioned nearby

## Next Steps

If weekly limit still doesn't show after debugging:
1. Copy the relevant console logs
2. Copy a screenshot or text sample of the usage page showing the weekly limit section
3. We'll create a custom pattern to match your specific page structure
