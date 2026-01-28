// Test script to verify extraction patterns work correctly
// Run with: node test-extraction.js

// Simulate different page text formats that might appear on claude.ai/settings/usage
const testCases = [
  {
    name: "Format 1: Standard with colons",
    pageText: `
      Claude Usage
      Current session: 45%
      Resets at 5:00 PM PST
      Weekly limit: 78%
    `,
    expected: { currentSessionPercent: 45, weeklyLimitPercent: 78 }
  },
  {
    name: "Format 2: No colons",
    pageText: `
      Usage Information
      Current session 45%
      Resets in 2 hours
      Weekly 78%
    `,
    expected: { currentSessionPercent: 45, weeklyLimitPercent: 78 }
  },
  {
    name: "Format 3: Multi-line",
    pageText: `
      Current session
      45%
      Reset time
      5:00 PM PST
      Week
      78%
    `,
    expected: { currentSessionPercent: 45, weeklyLimitPercent: 78 }
  },
  {
    name: "Format 6: Real Claude.ai structure (Weekly limits with gap)",
    pageText: `
      Current session
      Resets in 3 hr 49 min
      43% used
      Weekly limits
      Learn more about usage limits
      All models
      Resets Sat 7:59 PM
      66% used
    `,
    expected: { currentSessionPercent: 43, weeklyLimitPercent: 66 }
  },
  {
    name: "Format 4: With extra spaces",
    pageText: `
      Current session   :   45  %
      Resets at 5:00 PM
      Weekly limit   :   78  %
    `,
    expected: { currentSessionPercent: 45, weeklyLimitPercent: 78 }
  },
  {
    name: "Format 5: No weekly limit",
    pageText: `
      Current session: 45%
      Resets at 5:00 PM PST
    `,
    expected: { currentSessionPercent: 45, weeklyLimitPercent: null }
  }
];

// Extraction function matching the new contentScript.js logic
function extractByTextPattern(bodyText) {
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);

  // Find "Current session" and its percentage
  let currentSessionPercent = null;
  let resetTimeText = 'Unknown';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('current session')) {
      // Look for "XX% used" in next few lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const match = lines[j].match(/(\d+)\s*%\s*used/i);
        if (match) {
          currentSessionPercent = parseInt(match[1], 10);
          break;
        }
      }

      // Look for reset time
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].toLowerCase().includes('reset')) {
          resetTimeText = lines[j];
          break;
        }
      }

      break;
    }
  }

  if (currentSessionPercent === null) {
    return null;
  }

  // Find "Weekly limits" and its percentage
  let weeklyLimitPercent = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('weekly limit') || line.includes('weekly limits')) {
      // Look ahead up to 15 lines for "XX% used"
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const match = lines[j].match(/(\d+)\s*%\s*used/i);
        if (match) {
          const potential = parseInt(match[1], 10);
          // Make sure it's different from current session
          if (potential !== currentSessionPercent) {
            weeklyLimitPercent = potential;
            console.log('  Weekly limit found:', weeklyLimitPercent);
            break;
          }
        }
      }

      break;
    }
  }

  return {
    currentSessionPercent: currentSessionPercent,
    resetTimeText: resetTimeText,
    weeklyLimitPercent: weeklyLimitPercent,
    extractedAt: Date.now()
  };
}

// Run tests
console.log('===== Testing Weekly Limit Extraction Patterns =====\n');

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('Input text:', testCase.pageText.trim().substring(0, 100) + '...');

  const result = extractByTextPattern(testCase.pageText);

  if (!result) {
    console.log('❌ FAILED: No data extracted');
    failedTests++;
    console.log('');
    return;
  }

  const currentSessionMatch = result.currentSessionPercent === testCase.expected.currentSessionPercent;
  const weeklyLimitMatch = result.weeklyLimitPercent === testCase.expected.weeklyLimitPercent;

  console.log(`  Extracted:`, {
    currentSessionPercent: result.currentSessionPercent,
    weeklyLimitPercent: result.weeklyLimitPercent
  });
  console.log(`  Expected:`, testCase.expected);

  if (currentSessionMatch && weeklyLimitMatch) {
    console.log('✅ PASSED');
    passedTests++;
  } else {
    console.log('❌ FAILED');
    if (!currentSessionMatch) {
      console.log(`  Current session mismatch: got ${result.currentSessionPercent}, expected ${testCase.expected.currentSessionPercent}`);
    }
    if (!weeklyLimitMatch) {
      console.log(`  Weekly limit mismatch: got ${result.weeklyLimitPercent}, expected ${testCase.expected.weeklyLimitPercent}`);
    }
    failedTests++;
  }

  console.log('');
});

console.log('===== Test Summary =====');
console.log(`Total: ${testCases.length}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! The extraction patterns should work correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. The patterns may need adjustment.');
  process.exit(1);
}
