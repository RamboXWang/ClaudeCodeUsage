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

// Strategy 1: Text pattern matching (extracted from contentScript.js)
function extractByTextPattern(bodyText) {
  // Look for "Current session" section
  const currentSessionMatch = bodyText.match(/Current\s+session[:\s]*(\d+)%?/i);
  if (currentSessionMatch) {
    const percent = parseInt(currentSessionMatch[1], 10);

    // Look for reset time pattern
    const resetMatch = bodyText.match(/Resets?\s+(?:at|in|on)\s+([^\n]+)/i);
    const resetTimeText = resetMatch ? resetMatch[0].trim() : 'Unknown';

    // Look for weekly limit pattern - try multiple patterns
    let weeklyLimitPercent = null;

    // Pattern 1: "Weekly limit: 45%" or "Weekly: 45%"
    let weeklyMatch = bodyText.match(/Weekly\s*(?:limit)?[:\s]*(\d+)\s*%/i);
    if (weeklyMatch) {
      weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
      console.log('  Weekly limit found (pattern 1):', weeklyLimitPercent);
    } else {
      // Pattern 2: Look for "Week" followed by percentage
      weeklyMatch = bodyText.match(/Week[^0-9]*(\d+)\s*%/i);
      if (weeklyMatch) {
        weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
        console.log('  Weekly limit found (pattern 2):', weeklyLimitPercent);
      }
    }

    return {
      currentSessionPercent: percent,
      resetTimeText: resetTimeText,
      weeklyLimitPercent: weeklyLimitPercent,
      extractedAt: Date.now()
    };
  }

  // Alternative pattern: standalone percentage with context
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('current session')) {
      // Check next few lines for percentage
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const percentMatch = lines[j].match(/(\d+)%/);
        if (percentMatch) {
          const percent = parseInt(percentMatch[1], 10);

          // Look for reset time nearby
          let resetTimeText = 'Unknown';
          for (let k = i; k < Math.min(i + 10, lines.length); k++) {
            if (lines[k].toLowerCase().includes('reset')) {
              resetTimeText = lines[k];
              break;
            }
          }

          // Look for weekly limit nearby - try multiple patterns
          let weeklyLimitPercent = null;
          for (let k = 0; k < lines.length; k++) {
            const line = lines[k].toLowerCase();
            if (line.includes('week')) {
              // Try to find percentage in this line or next few lines
              const weeklyMatch = lines[k].match(/(\d+)\s*%/);
              if (weeklyMatch) {
                weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
                console.log('  Weekly limit found (alternative pattern 1, line):', lines[k], weeklyLimitPercent);
                break;
              }
              // Check next line too
              if (k + 1 < lines.length) {
                const nextMatch = lines[k + 1].match(/(\d+)\s*%/);
                if (nextMatch) {
                  weeklyLimitPercent = parseInt(nextMatch[1], 10);
                  console.log('  Weekly limit found (alternative pattern 1, next line):', lines[k + 1], weeklyLimitPercent);
                  break;
                }
              }
            }
          }

          return {
            currentSessionPercent: percent,
            resetTimeText: resetTimeText,
            weeklyLimitPercent: weeklyLimitPercent,
            extractedAt: Date.now()
          };
        }
      }
    }
  }

  return null;
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
