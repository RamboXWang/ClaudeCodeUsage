/**
 * Test Script for Claude Usage Monitor Extension
 *
 * HOW TO USE:
 * 1. Go to chrome://extensions
 * 2. Find "Claude Usage Monitor" and copy the Extension ID
 * 3. Visit https://claude.ai/settings/usage
 * 4. Open DevTools (F12)
 * 5. Go to Console tab
 * 6. Paste this entire script and press Enter
 * 7. Follow the instructions shown
 */

(async function testClaudeUsageMonitor() {
    console.log('%c🧪 Claude Usage Monitor - Extension Test', 'font-size: 20px; font-weight: bold; color: #8b5cf6');
    console.log('═'.repeat(60));

    // Test 1: Check if we're on the right page
    console.log('\n%c📍 Test 1: Page Check', 'font-weight: bold; color: #4ec9b0');
    const currentURL = window.location.href;
    if (currentURL.includes('claude.ai/settings/usage')) {
        console.log('✅ Correct page:', currentURL);
    } else {
        console.log('❌ Wrong page! Please navigate to: https://claude.ai/settings/usage');
        return;
    }

    // Test 2: Parse page content
    console.log('\n%c📊 Test 2: Parse Usage Data from Page', 'font-weight: bold; color: #4ec9b0');
    const bodyText = document.body.innerText;
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);

    let currentSession = null;
    let weeklyLimit = null;
    let resetTime = null;

    for (let i = 0; i < lines.length; i++) {
        // Look for "Current session" then "XX% used"
        if (lines[i].includes('Current session')) {
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const match = lines[j].match(/(\d+)%\s*used/);
                if (match) {
                    currentSession = parseInt(match[1]);
                    break;
                }
            }
            // Get reset time
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                if (lines[j].includes('Reset')) {
                    resetTime = lines[j];
                    break;
                }
            }
        }

        // Look for "Weekly" then "XX% used"
        if ((lines[i].includes('Weekly') || lines[i].includes('week')) && !weeklyLimit) {
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const match = lines[j].match(/(\d+)%\s*used/);
                if (match) {
                    weeklyLimit = parseInt(match[1]);
                    break;
                }
            }
        }
    }

    console.log('Current Session:', currentSession + '%');
    console.log('Weekly Limit:', weeklyLimit + '%');
    console.log('Reset Time:', resetTime);

    if (currentSession !== null) {
        console.log('✅ Current session data found on page');
    } else {
        console.log('❌ Could not find current session data');
    }

    if (weeklyLimit !== null) {
        console.log('✅ Weekly limit data found on page');
    } else {
        console.log('⚠️  Weekly limit not found on page (might not be available for your account)');
    }

    // Test 3: Check chrome.storage
    console.log('\n%c💾 Test 3: Check Extension Storage', 'font-weight: bold; color: #4ec9b0');

    if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
            const data = await new Promise((resolve) => {
                chrome.storage.local.get([
                    'currentSessionPercent',
                    'weeklyLimitPercent',
                    'resetTimeText',
                    'extractedAt',
                    'lastError',
                    'isStale'
                ], resolve);
            });

            console.log('Extension Storage Data:');
            console.table(data);

            // Verify each field
            if (data.currentSessionPercent !== undefined) {
                console.log('✅ Current session stored:', data.currentSessionPercent + '%');
                if (data.currentSessionPercent === currentSession) {
                    console.log('  ✅ Matches page data!');
                } else {
                    console.log('  ⚠️  Different from page (page: ' + currentSession + '%, stored: ' + data.currentSessionPercent + '%)');
                }
            } else {
                console.log('❌ Current session NOT stored');
            }

            if (data.weeklyLimitPercent !== undefined && data.weeklyLimitPercent !== null) {
                console.log('✅ Weekly limit stored:', data.weeklyLimitPercent + '%');
                if (data.weeklyLimitPercent === weeklyLimit) {
                    console.log('  ✅ Matches page data!');
                    console.log('  %c🎉 BUG FIX VERIFIED: Weekly limit is being extracted and stored!', 'font-size: 14px; font-weight: bold; color: #22c55e; background: #065f46; padding: 5px');
                } else {
                    console.log('  ⚠️  Different from page (page: ' + weeklyLimit + '%, stored: ' + data.weeklyLimitPercent + '%)');
                }
            } else {
                console.log('❌ Weekly limit NOT stored (Bug not fixed)');
                console.log('  This means the content script is not extracting the weekly limit');
            }

            if (data.resetTimeText) {
                console.log('✅ Reset time stored:', data.resetTimeText);
            }

            if (data.extractedAt) {
                const age = Date.now() - data.extractedAt;
                const ageMinutes = Math.floor(age / 60000);
                const ageSeconds = Math.floor(age / 1000);
                console.log('✅ Data age:', ageSeconds + ' seconds (' + ageMinutes + ' minutes) ago');
            }

            if (data.lastError) {
                console.log('⚠️  Last error:', data.lastError);
            }

            if (data.isStale) {
                console.log('⚠️  Data is marked as stale');
            }

        } catch (error) {
            console.log('❌ Error accessing storage:', error.message);
        }
    } else {
        console.log('⚠️  chrome.storage API not available in this context');
        console.log('This is normal for page context. The extension can still access it.');
    }

    // Test 4: Manual verification steps
    console.log('\n%c👆 Test 4: Manual Verification', 'font-weight: bold; color: #4ec9b0');
    console.log('Please check these manually:');
    console.log('1. Look at the extension icon badge in the toolbar');
    console.log('   ✓ Does it show a percentage? (e.g., "26")');
    console.log('   ✓ Is it color-coded? (green < 50%, yellow 50-80%, red > 80%)');
    console.log('');
    console.log('2. Click the extension icon to open the popup');
    console.log('   ✓ Does it show the current session percentage?');
    console.log('   ✓ Does it show "Weekly limit: XX%" in smaller text?');
    console.log('   ✓ Are the Status, Reset time, and Last updated fields populated?');
    console.log('');
    console.log('3. If weekly limit is NOT showing in popup:');
    console.log('   ✓ Right-click the popup > Inspect');
    console.log('   ✓ Check Console for any errors');
    console.log('   ✓ Run: chrome.storage.local.get(null, d => console.log(d))');
    console.log('');

    console.log('\n' + '═'.repeat(60));
    console.log('%c✅ Automated tests complete!', 'font-size: 16px; font-weight: bold; color: #22c55e');
    console.log('Review the results above and perform manual verification.');
})();
