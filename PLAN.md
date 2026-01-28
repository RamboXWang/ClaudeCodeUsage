Here is a Claude-Code-ready `PLAN.md` you can drop into your repo.

***

# PLAN.md – Claude Usage Chrome Extension

You are Claude Code working on a new Chrome Extension project.  
Follow this plan incrementally, step by step. Do not skip sections unless the user explicitly says so.

The goal is to build a Chrome Extension that shows the **Claude Code** “Current session” usage percentage and reset time from `https://claude.ai/settings/usage`, ideally directly on the extension icon badge so the user can see status without clicking. [code.claude](https://code.claude.com/docs/en/chrome)

Always use this workflow:

1. Plan: Restate which section and step you are implementing.
2. Code: Edit only the files needed for that step (1–3 files per iteration).
3. Test: Reload the extension in Chrome, test behavior, and report results.
4. Commit (conceptually): Keep changes cohesive and small.
5. Update docs: Adjust PLAN.md or comments when behavior or architecture changes.

***

## PROJECT STATUS: ✅ ALL PHASES COMPLETE

**Completed Implementation** (January 2026):

- ✅ **Phase 1** (Section 3): Minimal extension skeleton - manifest, service worker, icons, popup
- ✅ **Phase 2** (Section 4): Content script with robust parsing (3 fallback strategies)
- ✅ **Phase 3** (Section 5): Passive stale data detection with chrome.alarms
- ✅ **Phase 4** (Section 6): Full popup UI with detailed status and actions
- ✅ **Phase 5** (Section 7): Options page with configurable settings
- ✅ **Phase 6** (Section 8): Code quality and structure maintained throughout

**Ready to use**: Load the extension in Chrome and visit claude.ai/settings/usage to see your usage badge!

***

## 1. Project scope and constraints

1. Implement **Manifest V3** extension targeting Chrome. [developer.chrome](https://developer.chrome.com/docs/extensions/reference/api/action)
2. Primary features (to be built in phases):
   - Read Claude usage data (current session percentage, reset time) from `https://claude.ai/settings/usage` while the user is logged in. [github](https://github.com/anthropics/claude-code/issues/11917)
   - Display the usage percentage as badge text on the extension icon (e.g., `45` for 45%). [dev](https://dev.to/paulasantamaria/chrome-extensions-adding-a-badge-644)
   - Optionally encode reset time into badge color or short text (later phase).
   - Provide a simple popup UI with full details and status (later phase).
3. Respect constraints:
   - Do **not** attempt to bypass authentication; rely on the user being logged into Claude in Chrome. [code.claude](https://code.claude.com/docs/en/chrome)
   - Do not store Claude account data externally; keep all data in local extension storage.
   - Keep badge text short (max 3–4 characters) so it fits in the icon badge area. [developer.chrome](https://developer.chrome.com/docs/extensions/mv2/reference/browserAction)
4. Design must allow incremental feature additions (popup UI, settings, multi-account handling, etc.) without major rewrites.

***

## 2. High-level architecture

Implement a standard MV3 extension with:

1. **Service worker (background script)**  
   - Schedules periodic fetches of usage data.  
   - Manages badge text and badge background color using `chrome.action.setBadgeText` and `chrome.action.setBadgeBackgroundColor`. [developer.chrome](https://developer.chrome.com/docs/extensions/reference/api/action)
   - Handles messages from content scripts and popup.

2. **Content script**  
   - Runs only on `https://claude.ai/settings/usage`.  
   - Extracts usage info from the DOM (current session percentage, reset time string) and sends it to the service worker via `chrome.runtime.sendMessage`.

3. **Popup page (later phases)**  
   - Simple HTML/JS UI to show current usage metrics, last updated time, error state, and manual refresh button.

4. **Storage**  
   - Use `chrome.storage.local` to store:
     - Last known usage percentage.  
     - Last known reset time.  
     - Last updated timestamp.  
     - Last error state (if parsing or loading fails).

5. **Permissions**  
   - `host_permissions` for `https://claude.ai/*` so the content script can access the usage page.  
   - `tabs` permission if needed to open / focus the usage page and inject content scripts.  
   - `storage` for persisting usage metrics.  
   - `alarms` or `periodic background tasks` for polling.

***

## 3. Phase 1 – Minimal extension skeleton

Goal: Create a working MV3 extension that loads in Chrome, shows a static badge, and has basic structure for future steps. [developer.chrome](https://developer.chrome.com/docs/extensions/mv2/reference/browserAction)

### 3.1 Files to create

Create the following files:

- `manifest.json`
- `src/background.js` (service worker)
- `src/contentScript.js` (empty placeholder for now)
- `popup/popup.html`, `popup/popup.js` (simple placeholder popup)
- `assets/icon-16.png`, `assets/icon-48.png`, `assets/icon-128.png` (can use simple colored squares as placeholders or canvas-generated icons)

### 3.2 `manifest.json` initial contents

Implement a minimal MV3 manifest:

- `"manifest_version": 3`
- `"name"`, `"description"`, `"version"` (dummy values initially)
- `"action"`:
  - default icon, default title
  - default popup (optional even if empty)
- `"background"`:
  - `"service_worker": "src/background.js"`
- `"permissions"`:
  - `"storage"`
  - `"alarms"`
- `"host_permissions"`:
  - `"https://claude.ai/*"`
- `"content_scripts"`:
  - matches: `"https://claude.ai/settings/usage*"`
  - js: `["src/contentScript.js"]`
  - run_at: `"document_idle"`

### 3.3 Static badge behavior

In `src/background.js`:

1. On install (`chrome.runtime.onInstalled`), set:
   - Badge text to `"..."` to indicate initial state.
   - Badge background color to something neutral (e.g., gray).
2. On startup (`chrome.runtime.onStartup`), reload badge state from `chrome.storage.local`:
   - **Service worker lifecycle**: MV3 service workers can terminate unexpectedly, so always restore state from storage.
   - If no stored data, set badge to `"—"` (waiting state).

Use `chrome.action.setBadgeText` and `chrome.action.setBadgeBackgroundColor` as documented. [developer.chrome](https://developer.chrome.com/docs/extensions/reference/api/action)

### 3.4 Manual testing

**Phase 1 Success Checklist**:

- [ ] Extension loads without errors in `chrome://extensions`.
- [ ] Badge appears with placeholder text `"..."`.
- [ ] Badge has gray background color.
- [ ] Popup opens when icon is clicked (even if empty).
- [ ] Service worker appears in extensions page without errors.
- [ ] Console shows no permission errors.

If any items fail, fix them before moving to Phase 2.

***

## 4. Phase 2 – Extract Claude usage data via content script

Goal: When the user visits `https://claude.ai/settings/usage` while logged in, the content script parses the page and sends usage metrics to the background.

### 4.1 DOM inspection (manual step)

Before coding the parser:

1. Open `https://claude.ai/settings/usage` in Chrome, logged into Claude.  
2. Inspect the HTML structure and identify:
   - Element(s) containing “Current session” percentage value.  
   - Element containing reset time text (e.g., “Resets at 2:00 PM”). [github](https://github.com/anthropics/claude-code/issues/11917)
3. Note CSS selectors or attributes stable enough for parsing (e.g., `data-testid`, `aria-label`, or consistent class names).

Assume this structure can change over time; design the parser to fail gracefully if elements are missing.

### 4.2 Implement content script parsing

In `src/contentScript.js`:

1. On page load (use `DOMContentLoaded` or just run at `document_idle`):
   - Locate the "Current session" percentage element and extract the numeric percentage (e.g., `"45%"` → `45`).
   - Locate the reset time string (e.g., `"Resets at 2:00 PM"`).
   - **Robustness**: Use multiple fallback selector strategies since Claude.ai may use auto-generated class names.
   - **Authentication check**: Detect if user is logged in; if login wall is present, send appropriate error state.
   - **Dynamic updates**: Consider using `MutationObserver` to detect changes after initial load.
2. Build a message object like:

```js
{
  type: "CLAUDE_USAGE_UPDATE",
  data: {
    currentSessionPercent: 45,
    resetTimeText: "Resets at 2:00 PM",
    extractedAt: <timestamp>,
  }
}
```

3. Send this message via `chrome.runtime.sendMessage`.

4. Handle errors:
   - If parsing fails, send a `"CLAUDE_USAGE_ERROR"` message with error type and details.
   - If user is not logged in (detect login wall), send `"AUTH_REQUIRED"` error.
   - If page structure is unexpected, send `"PARSE_ERROR"` with context.
   - Do not spam messages; send only once per page load or when data changes.

### 4.3 Background message handler

In `src/background.js`:

1. Add a `chrome.runtime.onMessage.addListener` handler:
   - On `CLAUDE_USAGE_UPDATE`:
     - Store the data in `chrome.storage.local`.
     - Update badge text to the percentage (e.g., `"45"`, or `"MAX"` for 100%).
     - Set badge color based on usage level (e.g., green < 50, yellow 50–80, red > 80).
   - On `CLAUDE_USAGE_ERROR`:
     - Store error info with error type.
     - Set badge based on error type:
       - `AUTH_REQUIRED`: badge text `"⚠"` or `"AUTH"`, orange background.
       - `PARSE_ERROR`: badge text `"ERR"` or `"!"`, red background.
       - Network/load failures: badge text `"NET"`, red background.
2. Make updates idempotent and robust to malformed data.
3. Ensure badge state persists across service worker restarts.

### 4.4 Manual testing

**Phase 2 Success Checklist**:

- [ ] Visit `https://claude.ai/settings/usage` while logged in.
- [ ] DevTools console (content script context) shows successful extraction with `console.log`.
- [ ] Badge changes from `"..."` to numeric usage percentage (e.g., `"45"`).
- [ ] Badge color reflects usage level (green/orange/red).
- [ ] `chrome.storage.local` contains `currentSessionPercent`, `resetTimeText`, and `extractedAt`.
- [ ] Try when logged out: badge shows `"⚠"` or `"AUTH"` with orange background.
- [ ] Force parsing error (modify page HTML): badge shows `"ERR"` with red background.
- [ ] Message passing logged in service worker console shows received data.

If any items fail, fix them before moving to Phase 3.

***

## 5. Phase 3 – Automatic refresh without user interaction

Goal: Keep the badge up to date without the user needing to click anything, within reasonable limits and without aggressive polling.

### 5.1 Strategy options

Implement one of these strategies:

1. **Passive strategy (Phase 3A, simpler)**  
   - Badge updates only when the user visits the usage page.  
   - If data is older than a threshold (e.g., 30 minutes), show a “stale” indicator (e.g., badge color gray or text `"OLD"`).  
   - This requires no automatic loading of the usage page.

2. **Active strategy (Phase 3B, more advanced, optional)**  
   - Use `chrome.alarms` to periodically (e.g., every 15–30 minutes) open or reload the `https://claude.ai/settings/usage` page in a background tab, inject the content script if needed, and close the tab after data is extracted.  
   - Ensure:
     - This only runs when the user has explicitly enabled auto-refresh (future settings).  
     - Tabs are closed after use.  
     - Rate limits are respected.

Start with **Phase 3A** (passive), then optionally implement 3B.

### 5.2 Passive “stale data” implementation

1. In background script, add a periodic check via `chrome.alarms` every 5 minutes:
   - Load last `extractedAt` from `chrome.storage.local`.  
   - If older than threshold (e.g., 30 minutes),:
     - Keep the last percentage badge text but change badge color to gray, or  
     - Set badge text to `"S"` (for stale) if you prefer.  
2. If data becomes fresh again (new extraction), restore normal color.

### 5.3 Optional active polling (later)

If implementing active polling:

1. Create an alarm (e.g., `"claude-usage-poll"`) with minimum 15-minute interval.
2. Add `scripting` permission to manifest if programmatic injection is needed.
3. On alarm:
   - Check if a setting (e.g., `autoRefreshEnabled`) is true.
   - Use `chrome.tabs.create` with `active: false` to load `https://claude.ai/settings/usage` in background.
   - Ensure content script runs there and sends updated data.
   - Close the tab after data is received or 10-second timeout.
   - **Rate limiting**: Implement exponential backoff if requests fail repeatedly.
   - **Error handling**: Distinguish between network errors and parsing errors.
4. Respect user's focus:
   - Use background tab (not activating).
   - Track tab ID and ensure cleanup even if errors occur.

***

## 6. Phase 4 – Popup UI and status details

Goal: Provide a clickable popup UI that shows detailed usage information and status, while the badge still gives at-a-glance info.

### 6.1 Popup design

In `popup/popup.html` and `popup/popup.js`:

1. Show:

   - Current session percentage.  
   - Reset time text.  
   - Last updated timestamp.  
   - Status line (OK, stale, error).  
   - A “Refresh now” button (optional, depending on strategy).

2. Keep UI minimal and text-based; you can style it later.

### 6.2 Popup behavior

In `popup/popup.js`:

1. On load:
   - Read data from `chrome.storage.local`.  
   - Render fields.  
2. If “Refresh now” is implemented:
   - When clicked:
     - Option A: Open/focus `https://claude.ai/settings/usage` tab so the content script can update data.  
     - Option B: Send a message to background to trigger a one-time refresh logic (if active polling is implemented).  

3. Handle missing or error states gracefully:
   - If no data: show “No data yet. Visit Claude usage page while logged in.”  
   - If error: show error message and suggestion.

***

## 7. Phase 5 – Configuration and polish

Goal: Add basic configuration and refine UX.

### 7.1 Options page (optional)

Implement an options page:

- Allow user to configure:
  - Auto-refresh enabled/disabled.  
  - Auto-refresh interval range (e.g., 15–60 minutes).  
  - Threshold for “stale” data.  
  - Enable/disable color coding on badge.

Update `manifest.json` with `"options_page"` or `"options_ui"` as appropriate.

### 7.2 Badge text and color conventions

Define a simple mapping:

- Usage < 50%:
  - Badge text: integer percentage (e.g., `"30"`).
  - Color: green (#22c55e).
- 50–80%:
  - Badge text: integer percentage.
  - Color: orange (#f59e0b).
- > 80%:
  - Badge text: integer percentage (or `"MAX"` for 100%).
  - Color: red (#ef4444).
- Unknown data:
  - Text: `"..."`, color: gray (#6b7280).
- Stale data:
  - Same text but gray color, or text `"OLD"` if desired.
- Auth required:
  - Text: `"⚠"` or `"AUTH"`, color: orange.
- Error states:
  - Text: `"ERR"` or `"!"`, color: red.

**Accessibility**: Include text indicators beyond color for color-blind users (e.g., "AUTH", "ERR", "OLD").

Keep text length within 3–4 characters. [dev](https://dev.to/paulasantamaria/chrome-extensions-adding-a-badge-644)

### 7.3 Error handling

- If parsing fails due to DOM changes:
  - Log error in storage with timestamp.  
  - Show `"ERR"` on the badge with red background.  
  - Popup should show a helpful message: “Could not parse Claude usage page. Selectors may need updating.”  
- Avoid repeated error messages; treat errors as state, not as alerts.

***

## 8. Phase 6 – Code quality and Claude Code workflow

Goal: Keep the codebase clean and friendly for future iterations with Claude Code.

### 8.1 Structure and naming

- Keep code under `src/` with clear names:
  - `src/background.js`
  - `src/contentScript.js`
  - `src/popup.js`
  - `src/storage.js` (optional helper module)
  - `src/badge.js` (optional helper for badge logic)
- Use small, focused functions:
  - `updateBadgeFromUsage(usageData)`  
  - `parseUsageFromDocument(document)`  
  - `loadUsageFromStorage()`  

### 8.2 Working style with Claude Code

When you (Claude Code) implement tasks:

1. At the start of each iteration:
   - State which PLAN section and step you are working on (e.g., “Implementing 3.2 manifest.json initial contents”).  
2. Modify only necessary files.  
3. Run through testing steps described in this plan (manually where required).  
4. After successful changes:
   - Summarize what changed and which PLAN steps are now complete.  
   - If DOM structure changes or behavior changes, update this PLAN.md with new selectors or notes.

***

## 9. Future enhancements (nice-to-have)

These are optional and should only be implemented after core behavior is stable:

1. Support multiple Claude environments (if applicable) or additional usage metrics shown on the page.  
2. Sync settings and last known usage across devices using `chrome.storage.sync`.  
3. Add keyboard shortcuts to open the popup or usage page.  
4. Localize text for different languages.

***

You can now start by implementing **Section 3 (Phase 1 – Minimal extension skeleton)**, then proceed sequentially through Phases 2–4, asking the user when to enable more advanced features like active polling and options UI.