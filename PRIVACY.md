# Privacy Policy for Claude Usage Monitor

**Last Updated: 2026-01-28**

## Overview

Claude Usage Monitor is a Chrome extension designed to help you monitor your Claude Code usage. We are committed to protecting your privacy and being transparent about our data practices.

## Data Collection

### What We Collect

The extension collects and stores the following information **locally on your device only**:

- **Current session usage percentage** (0-100%)
- **Weekly limit usage percentage** (if available on your Claude account)
- **Reset time information** (e.g., "resets in 5 days")
- **Timestamp** of when data was last extracted
- **User preferences** (settings configured in the Options page)

### What We DON'T Collect

- ✅ No personal information (name, email, phone, etc.)
- ✅ No Claude account credentials or authentication tokens
- ✅ No chat history or conversation content
- ✅ No browsing history
- ✅ No user tracking or analytics
- ✅ No IP addresses
- ✅ No cookies

## Data Storage

All data is stored **locally** using Chrome's `chrome.storage.local` API:

- Data is encrypted by Chrome's storage backend
- Data is isolated to your browser profile
- Data is **never** transmitted to external servers
- Data is **never** shared with third parties
- Data stays on your device only

## Data Transmission

The extension makes **zero external network requests**. All communication happens internally within the extension:

- Content script → Background service worker (internal messaging)
- Options page → Background service worker (internal messaging)
- Background → Popup (local storage)

The extension only accesses `https://claude.ai/settings/usage` to read your usage information from the page you're already logged into.

## Permissions Explained

The extension requests minimal permissions:

| Permission | Purpose |
|-----------|---------|
| `storage` | Store usage data and settings locally on your device |
| `alarms` | Schedule periodic checks for stale data and auto-refresh |
| `tabs` | Open usage page in background tab for manual/auto-refresh |
| `https://claude.ai/*` | Access Claude's usage page to read your usage data |

## Data Retention

- Data is stored indefinitely until you uninstall the extension
- You can manually clear data by uninstalling the extension
- No automatic data cleanup currently implemented

## Third-Party Services

This extension does **not** use any third-party services:

- ❌ No analytics (Google Analytics, etc.)
- ❌ No error tracking (Sentry, etc.)
- ❌ No advertising networks
- ❌ No CDN services
- ❌ No external APIs

## Your Rights

You have complete control over your data:

- **View your data**: Open Chrome DevTools → Application → Storage → chrome.storage.local
- **Delete your data**: Uninstall the extension (removes all stored data)
- **Export your data**: Not currently supported, but data is visible in Chrome DevTools

## Security

We take security seriously:

- All permissions are minimal and justified
- No external data transmission
- Secure local storage using Chrome's encrypted storage API
- Input validation on all stored data
- No code injection vulnerabilities

For a detailed security analysis, see the security review in the project repository.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the extension's repository with an updated "Last Updated" date.

## Open Source

This extension is open source. You can review the complete source code at:
[https://github.com/RamboXWang/ClaudeCodeUsage](https://github.com/RamboXWang/ClaudeCodeUsage)

## Contact

For questions about this privacy policy or the extension's data practices, please:

- Open an issue on GitHub: [https://github.com/RamboXWang/ClaudeCodeUsage/issues](https://github.com/RamboXWang/ClaudeCodeUsage/issues)

## Summary

**In Plain English:**

This extension only reads your usage data from Claude's website and displays it in a badge. All data stays on your computer. We don't collect, track, or share anything. We don't send any data anywhere. Your privacy is fully protected.

---

**Key Points:**
- ✅ All data stored locally only
- ✅ Zero external network requests
- ✅ No personal information collected
- ✅ No third-party services
- ✅ Open source and transparent
- ✅ Minimal permissions
