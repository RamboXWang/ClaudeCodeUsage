// Content script for extracting Claude usage data
// Runs only on https://claude.ai/settings/usage*

console.log('Claude Usage Monitor content script loaded');

// State tracking
let lastSentData = null;
let observer = null;

// Initialize extraction
function init() {
  console.log('Initializing usage extraction...');

  // Check authentication first
  if (!isUserLoggedIn()) {
    sendError('AUTH_REQUIRED', 'User is not logged in to Claude');
    return;
  }

  // Try to extract data immediately
  attemptExtraction();

  // Set up MutationObserver to detect dynamic updates
  setupObserver();
}

// Check if user is logged in
function isUserLoggedIn() {
  // Look for common login wall indicators
  const loginIndicators = [
    'button[type="submit"]',
    'input[type="email"]',
    'input[type="password"]',
    '[data-testid="login-button"]'
  ];

  const hasLoginForm = loginIndicators.some(selector => {
    const elements = document.querySelectorAll(selector);
    return elements.length > 0 && Array.from(elements).some(el => {
      const text = el.textContent.toLowerCase();
      return text.includes('log in') || text.includes('sign in');
    });
  });

  // If we see the settings page structure, assume logged in
  const hasSettingsStructure = document.querySelector('[class*="settings"]') ||
                                 document.querySelector('h1, h2') !== null;

  return !hasLoginForm || hasSettingsStructure;
}

// Attempt to extract usage data
function attemptExtraction() {
  try {
    console.log('Attempting to extract usage data...');

    const usageData = extractUsageData();

    if (usageData) {
      console.log('✓ Extracted usage data:', {
        currentSessionPercent: usageData.currentSessionPercent,
        weeklyLimitPercent: usageData.weeklyLimitPercent,
        resetTimeText: usageData.resetTimeText
      });

      // Only send if data changed
      const dataString = JSON.stringify(usageData);
      if (dataString !== lastSentData) {
        lastSentData = dataString;
        sendUsageUpdate(usageData);
        console.log('✓ Usage data sent to background script');
      } else {
        console.log('→ Data unchanged, not sending update');
      }
    } else {
      console.log('✗ No usage data found yet, will retry on DOM changes');
      console.log('Page text sample:', document.body.innerText.substring(0, 500));
    }
  } catch (error) {
    console.error('✗ Error during extraction:', error);
    sendError('PARSE_ERROR', error.message);
  }
}

// Extract usage data from the DOM using multiple strategies
function extractUsageData() {
  // Strategy 1: Look for text patterns like "45%" or "45 %" near "Current session"
  const currentSessionData = extractByTextPattern();
  if (currentSessionData) return currentSessionData;

  // Strategy 2: Look for common data attributes
  const attributeData = extractByDataAttributes();
  if (attributeData) return attributeData;

  // Strategy 3: Look for semantic HTML structure
  const semanticData = extractBySemanticStructure();
  if (semanticData) return semanticData;

  return null;
}

// Strategy 1: Text pattern matching
function extractByTextPattern() {
  // Find all text nodes and elements
  const bodyText = document.body.innerText;

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
      console.log('Weekly limit found (pattern 1):', weeklyLimitPercent);
    } else {
      // Pattern 2: Look for "Week" followed by percentage
      weeklyMatch = bodyText.match(/Week[^0-9]*(\d+)\s*%/i);
      if (weeklyMatch) {
        weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
        console.log('Weekly limit found (pattern 2):', weeklyLimitPercent);
      }
    }

    console.log('Strategy 1 extraction:', { currentSessionPercent: percent, weeklyLimitPercent });

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
                console.log('Weekly limit found (alternative pattern 1, line):', lines[k], weeklyLimitPercent);
                break;
              }
              // Check next line too
              if (k + 1 < lines.length) {
                const nextMatch = lines[k + 1].match(/(\d+)\s*%/);
                if (nextMatch) {
                  weeklyLimitPercent = parseInt(nextMatch[1], 10);
                  console.log('Weekly limit found (alternative pattern 1, next line):', lines[k + 1], weeklyLimitPercent);
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

// Strategy 2: Data attribute matching
function extractByDataAttributes() {
  // Look for elements with data attributes that might contain usage info
  const candidates = document.querySelectorAll('[data-testid*="usage"], [data-testid*="session"], [aria-label*="usage"], [aria-label*="session"]');

  for (const elem of candidates) {
    const text = elem.textContent;
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1], 10);

      // Find reset time in nearby elements
      let resetTimeText = 'Unknown';
      let weeklyLimitPercent = null;
      const parent = elem.closest('[class*="usage"], [class*="session"], section, div[class*="container"]');
      if (parent) {
        const resetMatch = parent.textContent.match(/Resets?\s+(?:at|in|on)\s+([^\n]+)/i);
        if (resetMatch) {
          resetTimeText = resetMatch[0].trim();
        }

        // Look for weekly limit - try multiple patterns
        const parentText = parent.textContent;
        let weeklyMatch = parentText.match(/Weekly\s*(?:limit)?[:\s]*(\d+)\s*%/i);
        if (weeklyMatch) {
          weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
          console.log('Weekly limit found (strategy 2, pattern 1):', weeklyLimitPercent);
        } else {
          weeklyMatch = parentText.match(/Week[^0-9]*(\d+)\s*%/i);
          if (weeklyMatch) {
            weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
            console.log('Weekly limit found (strategy 2, pattern 2):', weeklyLimitPercent);
          }
        }
      }

      console.log('Strategy 2 extraction:', { currentSessionPercent: percent, weeklyLimitPercent });

      return {
        currentSessionPercent: percent,
        resetTimeText: resetTimeText,
        weeklyLimitPercent: weeklyLimitPercent,
        extractedAt: Date.now()
      };
    }
  }

  return null;
}

// Strategy 3: Semantic structure
function extractBySemanticStructure() {
  // Look for headings that indicate usage section
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

  for (const heading of headings) {
    if (heading.textContent.toLowerCase().includes('current session')) {
      // Look for percentage in following siblings
      let elem = heading.nextElementSibling;
      let attempts = 0;

      while (elem && attempts < 10) {
        const percentMatch = elem.textContent.match(/(\d+)%/);
        if (percentMatch) {
          const percent = parseInt(percentMatch[1], 10);

          // Look for reset time and weekly limit
          let resetTimeText = 'Unknown';
          let weeklyLimitPercent = null;
          let sibling = heading.nextElementSibling;
          let siblingAttempts = 0;

          while (sibling && siblingAttempts < 15) {
            const siblingText = sibling.textContent;
            const siblingTextLower = siblingText.toLowerCase();

            if (siblingTextLower.includes('reset')) {
              const resetMatch = siblingText.match(/Resets?\s+(?:at|in|on)\s+[^\n]+/i);
              if (resetMatch) {
                resetTimeText = resetMatch[0].trim();
              }
            }
            if (siblingTextLower.includes('week')) {
              // Try multiple patterns
              let weeklyMatch = siblingText.match(/Weekly\s*(?:limit)?[:\s]*(\d+)\s*%/i);
              if (weeklyMatch) {
                weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
                console.log('Weekly limit found (strategy 3, pattern 1):', weeklyLimitPercent);
              } else {
                weeklyMatch = siblingText.match(/Week[^0-9]*(\d+)\s*%/i);
                if (weeklyMatch) {
                  weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
                  console.log('Weekly limit found (strategy 3, pattern 2):', weeklyLimitPercent);
                } else {
                  // Just look for any percentage if week is mentioned
                  weeklyMatch = siblingText.match(/(\d+)\s*%/);
                  if (weeklyMatch) {
                    weeklyLimitPercent = parseInt(weeklyMatch[1], 10);
                    console.log('Weekly limit found (strategy 3, pattern 3):', weeklyLimitPercent);
                  }
                }
              }
            }
            sibling = sibling.nextElementSibling;
            siblingAttempts++;
          }

          console.log('Strategy 3 extraction:', { currentSessionPercent: percent, weeklyLimitPercent });

          return {
            currentSessionPercent: percent,
            resetTimeText: resetTimeText,
            weeklyLimitPercent: weeklyLimitPercent,
            extractedAt: Date.now()
          };
        }

        elem = elem.nextElementSibling;
        attempts++;
      }
    }
  }

  return null;
}

// Set up MutationObserver to detect dynamic updates
function setupObserver() {
  if (observer) return; // Already set up

  observer = new MutationObserver((mutations) => {
    // Debounce: only check after mutations settle
    clearTimeout(window.usageExtractionTimeout);
    window.usageExtractionTimeout = setTimeout(() => {
      attemptExtraction();
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  console.log('MutationObserver set up for dynamic updates');
}

// Send usage update to background script
function sendUsageUpdate(data) {
  chrome.runtime.sendMessage({
    type: 'CLAUDE_USAGE_UPDATE',
    data: data
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('Usage update sent successfully:', response);
    }
  });
}

// Send error to background script
function sendError(type, message) {
  chrome.runtime.sendMessage({
    type: 'CLAUDE_USAGE_ERROR',
    error: {
      type: type,
      message: message,
      timestamp: Date.now()
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending error message:', chrome.runtime.lastError);
    } else {
      console.log('Error sent successfully:', response);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already loaded
  init();
}
