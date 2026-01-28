# Screenshot Guide for Chrome Web Store

## Requirements
- **Quantity**: Up to 5 screenshots (at least 1 required)
- **Size**: 1280x800 or 640x400 pixels
- **Format**: JPEG or 24-bit PNG (no alpha/transparency)

## Screenshots to Capture

### Screenshot 1: Badge Display (REQUIRED)
**What to show:** Extension badge on toolbar with usage percentage

**Steps:**
1. Make sure extension is loaded
2. Badge should show a number (e.g., "45" or "67")
3. Zoom your browser to 100%
4. Capture the browser toolbar area showing the extension icon with badge

**Focus:** The badge with the percentage clearly visible

---

### Screenshot 2: Popup Window (REQUIRED)
**What to show:** Detailed popup with usage information

**Steps:**
1. Click the extension icon to open popup
2. Make sure popup shows:
   - Current session percentage (large)
   - Weekly limit percentage (if available)
   - Reset time
   - Last updated time
   - Status indicator
   - Refresh button
3. Take screenshot of the popup window

**Focus:** The complete popup with all information visible

---

### Screenshot 3: Options Page (RECOMMENDED)
**What to show:** Configuration options

**Steps:**
1. Right-click extension icon → Options
2. Make sure visible:
   - Stale data threshold settings
   - Color-coded badge toggle
   - Auto-refresh settings
   - Refresh interval dropdown
3. Scroll to show all sections
4. Take screenshot of the options page

**Focus:** All configuration options visible

---

### Screenshot 4: Badge States (OPTIONAL)
**What to show:** Different badge colors/states

**Options:**
- Green badge (< 50% usage)
- Yellow badge (50-80% usage)
- Red badge (> 80% usage)
- Gray badge (stale data)

**Steps:**
1. Capture multiple states side-by-side (if possible)
2. Or create a composite image showing different states

---

### Screenshot 5: Usage Page + Extension (OPTIONAL)
**What to show:** Claude usage page with extension badge

**Steps:**
1. Navigate to https://claude.ai/settings/usage
2. Show the page with extension badge visible in toolbar
3. Demonstrates the extension reading from the official page

---

## How to Take Screenshots

### Method 1: macOS Native (Recommended)
1. **Full screen**: Press `Cmd + Shift + 3`
2. **Selection**: Press `Cmd + Shift + 4` (then drag to select area)
3. **Window**: Press `Cmd + Shift + 4`, then press `Space`, then click window

Screenshots saved to Desktop

### Method 2: Chrome DevTools
1. Open Chrome DevTools (`Cmd + Option + I`)
2. Press `Cmd + Shift + P` (Command Palette)
3. Type "screenshot"
4. Choose:
   - "Capture full size screenshot"
   - "Capture area screenshot"
   - "Capture screenshot"

### Method 3: Chrome Extension Screenshot
1. Use built-in Chrome screenshot:
2. Right-click on page → "Inspect"
3. Press `Cmd + Shift + P`
4. Type "Capture screenshot"

---

## After Taking Screenshots

Save your screenshots with descriptive names:
- `screenshot-1-badge.png`
- `screenshot-2-popup.png`
- `screenshot-3-options.png`
- `screenshot-4-states.png`
- `screenshot-5-usage-page.png`

Then run the processing script (see below) to resize and convert them.

---

## Important Tips

1. **Clean Browser**: Close unnecessary tabs and windows
2. **Zoom 100%**: Make sure browser zoom is at 100%
3. **Good Lighting**: Use light theme if possible for better visibility
4. **Hide Personal Info**: Make sure no personal information is visible
5. **Actual Data**: Show real usage data (if comfortable) for authenticity
6. **High Quality**: Take high-resolution screenshots (we'll resize them)

---

## Recommended Order

1. ✅ **Screenshot 1**: Badge display (REQUIRED)
2. ✅ **Screenshot 2**: Popup window (REQUIRED)
3. ✅ **Screenshot 3**: Options page (HIGHLY RECOMMENDED)
4. ⭐ **Screenshot 4**: Badge states (OPTIONAL)
5. ⭐ **Screenshot 5**: Usage page (OPTIONAL)

Minimum: 1-2 screenshots
Recommended: 3 screenshots
Optimal: 5 screenshots

---

## Next Steps

After taking screenshots:
1. Save them in the project directory
2. Run the processing script to resize/convert them
3. Upload to Chrome Web Store

Let me know when screenshots are ready!
