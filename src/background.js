// Service worker for Claude Usage Monitor extension

// Initialize badge on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Claude Usage Monitor installed');
  setBadgeToInitialState();
  await setupAutoRefreshAlarm();
});

// Restore badge state on startup (service worker may restart)
chrome.runtime.onStartup.addListener(async () => {
  console.log('Claude Usage Monitor service worker starting');
  await restoreBadgeFromStorage();
  await setupAutoRefreshAlarm();
});

// Set initial badge state
function setBadgeToInitialState() {
  chrome.action.setBadgeText({ text: '...' });
  chrome.action.setBadgeBackgroundColor({ color: '#6b7280' }); // gray
  console.log('Badge set to initial state: "..."');
}

// Restore badge from stored data
async function restoreBadgeFromStorage() {
  try {
    const data = await chrome.storage.local.get(['currentSessionPercent', 'lastError', 'extractedAt']);

    if (data.lastError) {
      // Show error state
      const errorType = data.lastError.type || 'ERROR';
      if (errorType === 'AUTH_REQUIRED') {
        chrome.action.setBadgeText({ text: '⚠' });
        chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' }); // orange
      } else {
        chrome.action.setBadgeText({ text: 'ERR' });
        chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // red
      }
      console.log('Badge restored with error state:', errorType);
    } else if (data.currentSessionPercent !== undefined) {
      // Restore normal usage display
      updateBadgeFromUsage({ currentSessionPercent: data.currentSessionPercent });
      console.log('Badge restored with usage:', data.currentSessionPercent);
    } else {
      // No data yet
      setBadgeToInitialState();
    }
  } catch (error) {
    console.error('Error restoring badge from storage:', error);
    setBadgeToInitialState();
  }
}

// Update badge based on usage data
async function updateBadgeFromUsage(usageData, settings = null) {
  const percent = usageData.currentSessionPercent;

  // Get settings if not provided
  if (!settings) {
    const data = await chrome.storage.local.get(['settings']);
    settings = data.settings || { colorCodedBadge: true };
  }

  // Format badge text (max 4 characters)
  let badgeText = percent === 100 ? 'MAX' : String(Math.floor(percent));

  // Determine color based on usage level
  let color;
  if (settings.colorCodedBadge) {
    if (percent < 50) {
      color = '#22c55e'; // green
    } else if (percent < 80) {
      color = '#f59e0b'; // orange
    } else {
      color = '#ef4444'; // red
    }
  } else {
    // Use neutral color if color coding is disabled
    color = '#6b7280'; // gray
  }

  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: color });

  console.log(`Badge updated: ${badgeText}% (${color})`);
}

// Listen for messages from content script and options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);

  if (message.type === 'CLAUDE_USAGE_UPDATE') {
    handleUsageUpdate(message.data);
    sendResponse({ success: true });
  } else if (message.type === 'CLAUDE_USAGE_ERROR') {
    handleUsageError(message.error);
    sendResponse({ success: true });
  } else if (message.type === 'SETTINGS_UPDATED') {
    handleSettingsUpdate(message.settings);
    sendResponse({ success: true });
  } else if (message.type === 'MANUAL_REFRESH') {
    handleManualRefresh().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Manual refresh error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // async response
  }

  return false; // synchronous response
});

// Handle settings update from options page
async function handleSettingsUpdate(settings) {
  console.log('Settings updated:', settings);

  // Re-check stale data with new threshold
  await checkForStaleData();

  // Refresh badge display if color coding changed
  try {
    const data = await chrome.storage.local.get(['currentSessionPercent', 'lastError', 'isStale']);

    if (!data.lastError && data.currentSessionPercent !== undefined && !data.isStale) {
      updateBadgeFromUsage({ currentSessionPercent: data.currentSessionPercent }, settings);
    }
  } catch (error) {
    console.error('Error refreshing badge after settings update:', error);
  }

  // Setup auto-refresh alarm with new settings
  await setupAutoRefreshAlarm();
}

// Handle usage update from content script
async function handleUsageUpdate(data) {
  try {
    // Validate data
    if (typeof data.currentSessionPercent !== 'number' ||
        data.currentSessionPercent < 0 ||
        data.currentSessionPercent > 100) {
      console.error('Invalid usage data received:', data);
      return;
    }

    console.log('✅ Background received usage update:', {
      currentSessionPercent: data.currentSessionPercent,
      weeklyLimitPercent: data.weeklyLimitPercent,
      resetTimeText: data.resetTimeText,
      timestamp: new Date().toLocaleTimeString()
    });

    // Store data
    await chrome.storage.local.set({
      currentSessionPercent: data.currentSessionPercent,
      resetTimeText: data.resetTimeText,
      weeklyLimitPercent: data.weeklyLimitPercent,
      extractedAt: data.extractedAt,
      lastError: null, // clear any previous errors
      isStale: false // data is fresh
    });

    console.log('✓ Data stored to chrome.storage.local');

    // Update badge
    updateBadgeFromUsage(data);

    console.log('✓ Badge updated');
  } catch (error) {
    console.error('✗ Error handling usage update:', error);
  }
}

// Handle error from content script
async function handleUsageError(error) {
  try {
    console.error('Content script error:', error);

    // Store error
    await chrome.storage.local.set({
      lastError: {
        type: error.type,
        message: error.message,
        timestamp: Date.now()
      }
    });

    // Update badge based on error type
    if (error.type === 'AUTH_REQUIRED') {
      chrome.action.setBadgeText({ text: '⚠' });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' }); // orange
    } else {
      chrome.action.setBadgeText({ text: 'ERR' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // red
    }
  } catch (storageError) {
    console.error('Error handling usage error:', storageError);
  }
}

// Set up alarm for checking stale data
chrome.alarms.create('stale-check', {
  periodInMinutes: 5 // Check every 5 minutes
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'stale-check') {
    checkForStaleData();
  } else if (alarm.name === 'auto-refresh') {
    performAutoRefresh();
  }
});

// Check if stored data is stale
async function checkForStaleData() {
  try {
    const data = await chrome.storage.local.get(['extractedAt', 'currentSessionPercent', 'lastError', 'settings']);

    // If there's an error state, don't override it
    if (data.lastError) {
      return;
    }

    // If no data yet, keep initial state
    if (!data.extractedAt || data.currentSessionPercent === undefined) {
      return;
    }

    // Get stale threshold from settings (default 30 minutes)
    const settings = data.settings || { staleThresholdMinutes: 30 };
    const staleThreshold = settings.staleThresholdMinutes * 60 * 1000; // convert to milliseconds

    const now = Date.now();
    const age = now - data.extractedAt;

    if (age > staleThreshold) {
      // Data is stale
      console.log('Data is stale (age:', Math.floor(age / 1000 / 60), 'minutes)');

      // Keep the percentage but change to gray color
      const percent = data.currentSessionPercent;
      const badgeText = percent === 100 ? 'MAX' : String(Math.floor(percent));

      chrome.action.setBadgeText({ text: badgeText });
      chrome.action.setBadgeBackgroundColor({ color: '#6b7280' }); // gray for stale

      // Store stale state
      await chrome.storage.local.set({ isStale: true });
    } else if (data.isStale) {
      // Data was stale but now fresh again (shouldn't happen in passive mode, but handle it)
      console.log('Data is fresh again');
      updateBadgeFromUsage({ currentSessionPercent: data.currentSessionPercent });
      await chrome.storage.local.set({ isStale: false });
    }
  } catch (error) {
    console.error('Error checking for stale data:', error);
  }
}

// Auto-refresh and manual refresh functionality
let autoRefreshTabId = null;
let manualRefreshTabId = null;

// Setup auto-refresh alarm based on settings
async function setupAutoRefreshAlarm() {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || { autoRefreshEnabled: false, refreshIntervalMinutes: 5 };

    // Clear existing alarm
    await chrome.alarms.clear('auto-refresh');

    if (settings.autoRefreshEnabled) {
      // Create new alarm with the configured interval
      chrome.alarms.create('auto-refresh', {
        delayInMinutes: settings.refreshIntervalMinutes,
        periodInMinutes: settings.refreshIntervalMinutes
      });
      console.log(`Auto-refresh enabled: every ${settings.refreshIntervalMinutes} minutes`);
    } else {
      console.log('Auto-refresh disabled');
    }
  } catch (error) {
    console.error('Error setting up auto-refresh alarm:', error);
  }
}

// Perform auto-refresh by opening usage page in background
async function performAutoRefresh() {
  try {
    console.log('Performing auto-refresh...');

    // Check if already refreshing
    if (autoRefreshTabId !== null) {
      console.log('Auto-refresh already in progress, skipping');
      return;
    }

    // Open usage page in background tab
    const tab = await chrome.tabs.create({
      url: 'https://claude.ai/settings/usage',
      active: false // Open in background
    });

    autoRefreshTabId = tab.id;
    console.log(`Auto-refresh tab opened: ${tab.id}`);

    // Set timeout to close tab after 15 seconds (enough time for data extraction)
    setTimeout(async () => {
      try {
        if (autoRefreshTabId !== null) {
          await chrome.tabs.remove(autoRefreshTabId);
          console.log(`Auto-refresh tab closed: ${autoRefreshTabId}`);
          autoRefreshTabId = null;
        }
      } catch (error) {
        console.error('Error closing auto-refresh tab:', error);
        autoRefreshTabId = null;
      }
    }, 15000);

  } catch (error) {
    console.error('Error performing auto-refresh:', error);
    autoRefreshTabId = null;
  }
}

// Handle manual refresh request from popup
async function handleManualRefresh() {
  try {
    console.log('Performing manual refresh...');

    // Check if already refreshing
    if (manualRefreshTabId !== null) {
      console.log('Manual refresh already in progress, skipping');
      return;
    }

    // Open usage page in background tab
    const tab = await chrome.tabs.create({
      url: 'https://claude.ai/settings/usage',
      active: false // Open in background
    });

    manualRefreshTabId = tab.id;
    console.log(`Manual refresh tab opened: ${tab.id}`);

    // Set timeout to close tab after 10 seconds (enough time for data extraction)
    setTimeout(async () => {
      try {
        if (manualRefreshTabId !== null) {
          await chrome.tabs.remove(manualRefreshTabId);
          console.log(`Manual refresh tab closed: ${manualRefreshTabId}`);
          manualRefreshTabId = null;
        }
      } catch (error) {
        console.error('Error closing manual refresh tab:', error);
        manualRefreshTabId = null;
      }
    }, 10000);

  } catch (error) {
    console.error('Error performing manual refresh:', error);
    manualRefreshTabId = null;
    throw error;
  }
}

// Listen for tab removal to clean up refresh tab IDs
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === autoRefreshTabId) {
    console.log('Auto-refresh tab was closed');
    autoRefreshTabId = null;
  } else if (tabId === manualRefreshTabId) {
    console.log('Manual refresh tab was closed');
    manualRefreshTabId = null;
  }
});

console.log('Background script loaded');
