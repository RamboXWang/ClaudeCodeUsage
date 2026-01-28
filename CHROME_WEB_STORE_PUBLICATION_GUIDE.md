# Chrome Web Store Publication Guide

## Package Ready! ✅

Your extension package is ready: `claude-usage-monitor-v1.2.0.zip` (17KB)

---

## Step-by-Step Publication Process

### Step 1: Chrome Web Store Developer Account

**Cost: $5 USD one-time registration fee**

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. If first time:
   - Click "Register"
   - Pay $5 USD one-time developer registration fee
   - Accept Developer Agreement

**⚠️ PRIVATE INFO REQUIRED:**
- **Google account email** (used for login)
- **Payment method** (for $5 registration fee)

---

### Step 2: Upload Your Extension

1. In the Developer Dashboard, click **"New Item"**
2. Click **"Choose file"** and select: `claude-usage-monitor-v1.2.0.zip`
3. Click **"Upload"**
4. Wait for upload to complete (should be quick, only 17KB)

---

### Step 3: Store Listing Information

You'll need to fill out the following sections. I've prepared the content for you:

#### **Product details**

**Extension name:**
```
Claude Usage Monitor
```

**Summary (132 characters max):**
```
Monitor Claude Code usage with badge display. Shows current session and weekly limits. Auto-refresh and manual refresh available.
```

**Description (16,000 characters max):**
```
A Chrome extension that monitors your Claude Code usage from claude.ai/settings/usage and displays it as a badge on the extension icon for quick visibility.

FEATURES:

• Badge Display: Shows current session usage percentage directly on the extension icon
• Color Coding: Badge color changes based on usage level (green < 50%, yellow 50-80%, red > 80%)
• Detailed Popup: Click the icon to see full usage details including:
  - Current session usage percentage (large display)
  - Weekly limit usage percentage (smaller display)
  - Reset time
  - Last updated timestamp
  - Status indicator (OK/Stale)
• Manual Refresh: Click the "Refresh" button in popup to fetch latest usage data anytime
• Auto-Refresh: Automatically refreshes usage data in the background at configurable intervals (5, 10, 15, 30, or 60 minutes)
• Weekly Limit Tracking: Displays weekly usage limits when available
• Stale Data Detection: Automatically marks data as stale after 30 minutes (configurable)
• Authentication Detection: Alerts when you need to log in to Claude
• Robust Parsing: Multiple fallback strategies to extract usage data from the page
• Options Page: Customize stale threshold, color preferences, and auto-refresh settings

HOW TO USE:

1. Log in to Claude at https://claude.ai
2. Visit https://claude.ai/settings/usage once to initialize data
3. The extension will automatically extract your current session usage percentage
4. The badge on the extension icon will update to show your usage
5. Click the icon to see detailed information
6. Use the "Refresh" button to fetch latest data anytime
7. Enable auto-refresh in Options to automatically refresh at regular intervals

BADGE STATES:

• Numeric percentage (e.g., "45"): Current session usage
• "⚠" or "AUTH" (orange): You need to log in to Claude
• "ERR" (red): Error parsing the usage page
• Gray badge: Data is stale (older than threshold)

PRIVACY & SECURITY:

• All data stored locally only - nothing transmitted externally
• No analytics, tracking, or telemetry
• No third-party services
• Minimal permissions (only what's necessary)
• Open source: https://github.com/RamboXWang/ClaudeCodeUsage

CONFIGURATION:

Right-click the extension icon and select "Options" to configure:
• Stale Data Threshold: How long before data is marked as stale (5-120 minutes)
• Color-Coded Badge: Enable/disable color coding based on usage level
• Auto-Refresh: Enable/disable automatic background refresh
• Refresh Interval: Choose how often to auto-refresh (5, 10, 15, 30, or 60 minutes)

This extension is perfect for Claude Code users who want to keep track of their usage without constantly visiting the usage page.
```

#### **Category:**
```
Productivity
```

#### **Language:**
```
English (United States)
```

---

### Step 4: Privacy

**Privacy practices:**

Select the following:
- [ ] This extension does NOT handle user data
- [x] This extension collects or uses user data

**Data usage disclosure:**

| Question | Answer |
|----------|--------|
| Does this extension collect or transmit user data? | **Yes** |
| What user data does it collect? | **Usage metrics from Claude.ai** |
| Is the data transmitted off the user's device? | **No** |
| Is the data being sold? | **No** |
| Is the data being used or transferred for purposes unrelated to the extension's core functionality? | **No** |

**Privacy policy URL:**
```
https://github.com/RamboXWang/ClaudeCodeUsage/blob/main/PRIVACY.md
```

**Justification for permissions:**

```
- storage: Store usage data and user preferences locally
- alarms: Schedule periodic checks for stale data and auto-refresh functionality
- tabs: Open Claude usage page in background for manual/auto-refresh feature
- https://claude.ai/*: Access Claude's usage page to extract usage metrics
```

---

### Step 5: Graphics Assets

You'll need to provide screenshots and promotional images. Let me help you create these.

**Required:**

1. **Screenshots (1280x800 or 640x400 pixels)**
   - Minimum: 1 screenshot
   - Recommended: 3-5 screenshots

2. **Store icon (128x128 pixels)**
   - You already have this: `assets/icon-128.png`

**Optional but Recommended:**

3. **Small promotional tile (440x280 pixels)**
4. **Marquee promotional tile (1400x560 pixels)**

**⚠️ ACTION REQUIRED:**

You need to take screenshots of:
1. Extension badge showing usage percentage
2. Popup window with detailed usage information
3. Options page showing configuration settings
4. (Optional) Badge showing different states (green/yellow/red)

I can help you create promotional tiles, but first you need to:
- Take screenshots of the extension in action
- Decide if you want promotional tiles

---

### Step 6: Distribution

**Visibility:**
```
Public
```

**Regions:**
```
All regions (default)
```

**Pricing:**
```
Free
```

---

### Step 7: Single Purpose & Permission Justification

Chrome Web Store requires explicit justification for permissions.

**Single purpose description:**
```
This extension monitors Claude Code API usage by extracting usage metrics from claude.ai/settings/usage and displaying them in a badge icon for quick visibility.
```

**Permission justifications:**

```
storage: Required to store usage metrics (current session percentage, weekly limits, reset times) and user preferences (stale threshold, color coding settings, auto-refresh configuration) locally on the user's device.

alarms: Required to schedule periodic background tasks: (1) checking if stored data is stale (every 5 minutes), and (2) auto-refresh functionality to automatically fetch fresh usage data at user-configured intervals.

tabs: Required to programmatically open the Claude usage page (https://claude.ai/settings/usage) in a background tab for the manual refresh and auto-refresh features, allowing the extension to extract fresh usage data without requiring the user to manually visit the page.

Host permission https://claude.ai/*: Required to access the Claude usage page where the extension's content script extracts usage metrics (current session percentage, weekly limits, reset times) from the DOM.
```

---

## Pre-Submission Checklist

Before submitting, verify:

- [x] Extension package created (17KB ✅)
- [x] Privacy policy created and accessible
- [x] manifest.json version is 1.2.0
- [x] All code is production-ready
- [x] Security review completed (8.5/10 ✅)
- [ ] Screenshots taken
- [ ] Developer account created ($5 fee paid)
- [ ] Store listing information prepared

---

## What Happens After Submission?

1. **Review Process:**
   - Chrome Web Store team will review your extension
   - Typical review time: **1-3 business days**
   - Can take up to 7 days for new developers

2. **Review Checks:**
   - Code quality and security
   - Compliance with Chrome Web Store policies
   - Privacy practices disclosure
   - Permissions justification

3. **Possible Outcomes:**
   - ✅ **Approved:** Extension goes live immediately
   - ⚠️ **Rejected:** You'll receive feedback on what needs to be fixed

---

## Private Information Summary

**Here's what private information will be needed (I'll ask for confirmation before proceeding):**

### Required:
1. **Google account email** - for Developer Dashboard login
2. **Payment method** - for $5 one-time registration fee (if not already registered)

### Optional but Recommended:
3. **Support email** - for users to contact you (can use the same Google account or create a separate email)
4. **Publisher name** - how you want to be identified on the store (can be your name or a pseudonym)

---

## Next Steps

**I NEED YOUR CONFIRMATION FOR:**

Before I can help you submit, please confirm or provide:

1. **Do you already have a Chrome Web Store developer account?**
   - [ ] Yes (skip registration)
   - [ ] No (need to register)

2. **What email should be listed as support contact?**
   - Option A: Use GitHub for support (no email needed)
   - Option B: Provide an email address

3. **What name should be listed as publisher?**
   - Option A: Your real name
   - Option B: GitHub username (RamboXWang)
   - Option C: A pseudonym

4. **Screenshots:**
   - I cannot take screenshots for you (need your browser)
   - Can you take 3-5 screenshots showing:
     1. Badge with usage percentage
     2. Popup window with details
     3. Options page

---

## Alternative: Local Testing First

If you want to test more thoroughly before publishing:

1. **Load unpacked extension**
   - Go to `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the project folder

2. **Share with testers**
   - Pack extension to .crx file
   - Share with trusted testers
   - Collect feedback

3. **Publish when ready**

---

## Questions?

Let me know:
1. Your answers to the confirmation questions above
2. If you need help with screenshots or promotional graphics
3. If you want to test more before publishing
4. Any other questions about the process

I'm ready to help you through each step!
