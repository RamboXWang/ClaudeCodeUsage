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

// Extract usage data from the DOM - NEW IMPROVED VERSION
function extractUsageData() {
  const bodyText = document.body.innerText;
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);

  console.log('Parsing page with', lines.length, 'lines');

  // Find "Current session" and its percentage
  let currentSessionPercent = null;
  let currentSessionIndex = -1;
  let resetTimeText = 'Unknown';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('current session')) {
      currentSessionIndex = i;
      console.log('Found "Current session" at line', i);

      // Look for "XX% used" or just "XX%" in next few lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const match = lines[j].match(/(\d+)\s*%(\s*used)?/i);
        if (match) {
          currentSessionPercent = parseInt(match[1], 10);
          console.log('Found current session:', currentSessionPercent + '%', 'at line', j);
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
    console.log('Could not find current session percentage');
    return null;
  }

  // Find "Weekly limits" and its percentage
  let weeklyLimitPercent = null;
  let weeklyIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('weekly limit') || line.includes('weekly limits')) {
      weeklyIndex = i;
      console.log('Found "Weekly limits" at line', i, ':', lines[i]);

      // Look ahead up to 15 lines for "XX% used" or just "XX%"
      // This accounts for text between "Weekly limits" and the percentage
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const match = lines[j].match(/(\d+)\s*%(\s*used)?/i);
        if (match) {
          const potential = parseInt(match[1], 10);
          // Make sure it's different from current session
          if (potential !== currentSessionPercent) {
            weeklyLimitPercent = potential;
            console.log('Found weekly limit:', weeklyLimitPercent + '%', 'at line', j, ':', lines[j]);
            break;
          }
        }
      }

      break;
    }
  }

  if (weeklyLimitPercent === null) {
    console.log('Could not find weekly limit percentage (might not be available for this account)');
  }

  return {
    currentSessionPercent: currentSessionPercent,
    resetTimeText: resetTimeText,
    weeklyLimitPercent: weeklyLimitPercent,
    extractedAt: Date.now()
  };
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
  console.log('📤 Sending usage update to background:', data);
  chrome.runtime.sendMessage({
    type: 'CLAUDE_USAGE_UPDATE',
    data: data
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('✅ Usage update sent successfully:', response);
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
