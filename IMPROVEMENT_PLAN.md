# Project Improvement Plan — Claude Usage Monitor

**Date:** 2026-07-03
**Scope:** Everything in this repo (extension code, tooling, docs, release process)
**Current version:** 1.2.2

This plan is based on a full read of the codebase (`manifest.json`, `src/background.js`,
`src/contentScript.js`, `popup/`, `options/`) and the existing docs. It is organized as
five phases, ordered by impact-per-effort: fix what's broken first, then re-architect the
fragile core, then build the safety net (tests/CI), then clean the repo, then add features.

---

## Current state assessment

**What works well**

- Clean MV3 structure with minimal permissions (`storage`, `alarms`, one host permission).
- Sensible separation: service worker owns badge/storage, content script owns extraction,
  popup/options are thin views over `chrome.storage.local`.
- Stale-data detection and color-coded badge are genuinely useful UX.

**Core weaknesses**

1. **The refresh mechanism is invasive and unreliable.** Both auto- and manual refresh open
   a minimized Chrome *window* pointed at the usage page and close it on a fixed
   `setTimeout` (`src/background.js:291-371`). MV3 service workers can be terminated at any
   time; when that happens the timeout never fires and the minimized window is leaked
   forever. The in-memory guards (`autoRefreshWindowId`, `manualRefreshWindowId`,
   `src/background.js:263-264`) also reset on every worker restart, so the
   "already in progress" checks are unreliable.
2. **Extraction is text-scraping with brittle heuristics.** Parsing `document.body.innerText`
   line-by-line breaks whenever claude.ai changes copy, and it already models the usage page
   incorrectly (the page now shows multiple weekly meters — all models and Opus — but the
   parser captures only one).
3. **Zero automated verification.** The three `test-*` files at the repo root are paste-into-
   console scripts, not tests. There is no lint, no CI, no way to know a change is safe.

---

## Phase 1 — Bug fixes (highest priority, small effort)

Concrete defects found in the current code, each independently shippable:

| # | Bug | Location | Fix |
|---|-----|----------|-----|
| 1.1 | **Auth detection never triggers.** `isUserLoggedIn()` returns `!hasLoginForm \|\| hasSettingsStructure`, and `hasSettingsStructure` includes `document.querySelector('h1, h2') !== null`, which is true on the login page too — so the function is effectively always `true` and the AUTH badge state is dead code. | `src/contentScript.js:28-50` | Detect login state positively (e.g. presence of the usage UI or a session indicator) and treat the login form as authoritative; add a "no data found within N seconds" timeout that reports `AUTH_REQUIRED`/`PARSE_ERROR` instead of failing silently. |
| 1.2 | **Weekly limit equal to session % is dropped.** The parser skips any percentage that equals `currentSessionPercent` (`if (potential !== currentSessionPercent)`), so if both are e.g. 40%, weekly shows as unavailable. | `src/contentScript.js:141-152` | Anchor extraction to section structure (or the API of Phase 2) instead of "first different number wins". |
| 1.3 | **Popup ignores the configured stale threshold.** The popup hardcodes 30 minutes while the options page lets users set 5–120. | `popup/popup.js:98` | Read `settings.staleThresholdMinutes` from storage. |
| 1.4 | **Settings defaults are not merged consistently.** `background.js` falls back to `{ colorCodedBadge: true }` in one place and `{ autoRefreshEnabled: false, refreshIntervalMinutes: 5 }` in another; adding a new setting silently loses its default for existing users. | `src/background.js:61,270`, `options/options.js:13-18` | Single shared `DEFAULT_SETTINGS` constant + `{...DEFAULT_SETTINGS, ...stored}` merge everywhere. |
| 1.5 | **Refresh windows can leak** (see weakness #1). Fixed `setTimeout` dies with the service worker. | `src/background.js:312-323,353-364` | Event-driven close: background closes the window as soon as `CLAUDE_USAGE_UPDATE` arrives, with a `chrome.alarms`-based fallback (alarms survive worker restarts) and window IDs persisted in `chrome.storage.session`. |
| 1.6 | **Manual refresh reports success before data exists.** The popup gets `{success:true}` when the window *opens*, then waits a fixed 3 s (`popup/popup.js:194-198`) — often less than page load + extraction, so users see stale data after "refreshing". | `src/background.js:332-371`, `popup/popup.js:183-210` | Resolve the refresh only when new data lands; have the popup listen for a `chrome.storage.onChanged` event instead of sleeping. |
| 1.7 | **Broken license pointer.** README links "LICENSE" to the gogs project on GitHub, and the repo contains no LICENSE file despite the "Update license to MIT" commit. | `README.md:132` | Add a real MIT `LICENSE` file, fix the link. |

**Acceptance criteria:** each fix verified by loading the unpacked extension against the live
usage page; 1.1–1.4 additionally covered by the unit tests introduced in Phase 3.

---

## Phase 2 — Re-architect data acquisition (biggest single improvement)

Replace "open a hidden window and scrape rendered text" with **direct authenticated fetch
from the service worker**.

The usage page is client-side rendered from an internal claude.ai JSON API. The extension
already holds `host_permissions: ["https://claude.ai/*"]`, so the background worker can call
that API with the user's session cookies (`fetch(..., { credentials: 'include' })`) — no
window, no tab, no flicker, works even when Chrome is idle.

Steps:

1. **Discovery:** open DevTools on `claude.ai/settings/usage` and record the request(s) that
   return session/weekly usage (org-scoped endpoint under `/api/organizations/{orgId}/...`).
   Capture request shape, response schema, and how `orgId` is obtained (bootstrap endpoint or
   cookie/localStorage).
2. **Implement `src/usageApi.js`:** fetch → normalize into the existing storage schema
   (`currentSessionPercent`, `weeklyLimitPercent`, `resetTimeText`, plus new per-model
   fields). Map HTTP 401/403 → `AUTH_REQUIRED`, other failures → typed errors.
3. **Fallback chain:** API fetch first; if it fails for anything other than auth, fall back
   to the current content-script scrape (kept as a safety net, since the internal API is
   unversioned and may change). The content script continues to update data opportunistically
   whenever the user visits the usage page organically.
4. **Simplify refresh paths:** manual and auto refresh both become "call `fetchUsage()`";
   delete the window-management code (~110 lines of `src/background.js`), the leak fixes from
   1.5 become moot for the primary path.
5. **Extend the data model** while we're here: capture *all* meters the page/API exposes
   (session, weekly all-models, weekly Opus), store them as an array of
   `{ label, percent, resetsAt }` so the UI never needs schema changes when Anthropic adds a
   meter.

**Risk:** internal API instability. Mitigated by the scrape fallback and by an `ERR` badge +
"page structure changed" popup message when both paths fail.

**Acceptance criteria:** manual refresh completes in <2 s with no window/tab created;
auto-refresh works with the browser minimized; logging out produces the AUTH badge.

---

## Phase 3 — Tests, lint, CI (the safety net)

1. **Make the parser testable.** Extract `extractUsageData()` (and the Phase 2 API
   normalizer) into pure functions in a shared module with no `chrome.*` or `document`
   references — input: text/JSON, output: usage object.
2. **Unit tests with Vitest** (`npm init` + `vitest`, jsdom where needed):
   - Fixture corpus: saved snapshots of the real usage page text (the repo's testing docs
     already contain captured page text to seed this), covering: both meters present, weekly
     missing, weekly == session (bug 1.2), logged-out page, empty page.
   - Badge logic: text formatting (`MAX` at 100), color thresholds, stale transitions.
   - Settings merge (bug 1.4).
   - Replace the three root-level `test-*.js/html` console scripts with these tests and
     delete them.
3. **ESLint + Prettier** with a browser/webextensions environment config; fix what it flags.
4. **GitHub Actions CI:** on every push/PR — install, lint, test, and validate the extension
   bundle (`web-ext lint` handles MV3 manifest validation).
5. **Packaging script:** `npm run package` producing a store-ready zip (excluding docs, tests,
   store assets), plus a version-bump script that keeps `manifest.json` and `CHANGELOG.md` in
   sync.
6. **Logging discipline:** wrap the pervasive `console.log` calls in a `debug` helper gated
   by a settings flag (the Web Store review process and users' consoles both benefit).

**Acceptance criteria:** `npm test` and `npm run lint` pass locally and in CI; a PR that
breaks the parser fails CI.

---

## Phase 4 — Repository hygiene & docs

1. **Consolidate the 12 root-level markdown files.** Keep `README.md`, `CHANGELOG.md`,
   `PRIVACY.md` at root; move the rest (`PLAN.md`, `DEBUG.md`, `TESTING*.md`,
   `TEST_*.md`, `QUICK_TEST_REFRESH.md`, `AUTO_REFRESH_FEATURE.md`, `SCREENSHOT_GUIDE.md`,
   `CHROME_WEB_STORE_PUBLICATION_GUIDE.md`) into `docs/` — or delete the one-off testing
   session logs, which are point-in-time artifacts, not documentation.
2. **Rewrite README** to match post-Phase-2 reality (no background-tab caveat), fix the
   license link (1.7), replace the "Project Status" phase checklist with a short feature list,
   and document the dev workflow (`npm install`, `npm test`, load unpacked).
3. **Move store-publishing assets** (`generate-store-assets.html`, `process-screenshots.sh`,
   marquee/promo PNGs) into `store/` so the extension source tree is only what ships.
4. **Naming consistency:** the extension monitors overall claude.ai usage, not just Claude
   Code; align the manifest `description` and README wording (repo rename is optional and
   out of scope).

---

## Phase 5 — Feature enhancements (post-stabilization)

Ordered by user value; each is independent:

1. **Threshold notifications** — `chrome.notifications` when usage crosses configurable
   thresholds (80 %, 95 %) and when a limit resets. Needs the `notifications` permission.
   This is the feature that turns the extension from "glanceable" into "proactive".
2. **Usage history & trend view** — persist a bounded ring buffer of snapshots
   (e.g. 7 days) in `chrome.storage.local`; render a small sparkline per meter in the popup.
3. **All-meters popup UI** — render the Phase 2 meter array as progress bars (session,
   weekly, Opus) instead of one big number + one small number; add dark-mode support via
   `prefers-color-scheme`.
4. **Settings sync** — move settings (not usage data) to `chrome.storage.sync`.
5. **Keyboard shortcut** (`commands` in manifest) to trigger refresh / open the popup.
6. **Multi-account awareness** — detect org switches; at minimum label which org the data
   belongs to. (Largest effort; do last.)

---

## Suggested sequencing & effort

| Phase | Effort | Ship as |
|-------|--------|---------|
| 1. Bug fixes | ~½ day | v1.2.3 |
| 2. API-based fetching | 1–2 days (incl. endpoint discovery) | v1.3.0 |
| 3. Tests, lint, CI | 1 day | (infra, no release) |
| 4. Repo hygiene | ~½ day | (docs) |
| 5. Features | 1–3 days each | v1.4.x+ |

Phases 1, 3 and 4 are risk-free and can start immediately. Phase 2 is the one change that
removes the extension's two worst traits (hidden windows and text scraping) at once, and
phases 5.1–5.3 all become easy once the Phase 2 data model exists.
