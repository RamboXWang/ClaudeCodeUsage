// Popup script for Claude Usage Monitor

console.log('Popup opened');

// DOM elements
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const usageState = document.getElementById('usage-state');

const usagePercent = document.getElementById('usage-percent');
const weeklyLimitDiv = document.getElementById('weekly-limit');
const weeklyLimitValue = document.getElementById('weekly-limit-value');
const statusBadge = document.getElementById('status-badge');
const resetTime = document.getElementById('reset-time');
const lastUpdated = document.getElementById('last-updated');

const errorTitle = document.getElementById('error-title');
const errorMessage = document.getElementById('error-message');

const openUsagePageButton = document.getElementById('open-usage-page');
const refreshButton = document.getElementById('refresh-button');

// Initialize popup
async function init() {
  showState('loading');

  try {
    const data = await chrome.storage.local.get([
      'currentSessionPercent',
      'resetTimeText',
      'weeklyLimitPercent',
      'extractedAt',
      'lastError',
      'isStale'
    ]);

    console.log('Loaded data:', data);

    // Check for error state
    if (data.lastError) {
      showErrorState(data.lastError);
      return;
    }

    // Check if we have usage data
    if (data.currentSessionPercent === undefined || data.extractedAt === undefined) {
      showState('empty');
      return;
    }

    // Show usage data
    displayUsageData(data);
  } catch (error) {
    console.error('Error loading data:', error);
    showErrorState({
      type: 'INTERNAL_ERROR',
      message: 'Failed to load extension data: ' + error.message
    });
  }
}

// Display usage data
function displayUsageData(data) {
  console.log('Popup displaying data:', {
    currentSessionPercent: data.currentSessionPercent,
    weeklyLimitPercent: data.weeklyLimitPercent,
    resetTimeText: data.resetTimeText
  });

  // Update percentage
  const percent = data.currentSessionPercent;
  usagePercent.textContent = Math.floor(percent) + '%';

  // Set color class
  usagePercent.classList.remove('low', 'medium', 'high');
  if (percent < 50) {
    usagePercent.classList.add('low');
  } else if (percent < 80) {
    usagePercent.classList.add('medium');
  } else {
    usagePercent.classList.add('high');
  }

  // Update weekly limit display
  if (data.weeklyLimitPercent !== null && data.weeklyLimitPercent !== undefined) {
    console.log('✓ Showing weekly limit:', data.weeklyLimitPercent);
    weeklyLimitValue.textContent = Math.floor(data.weeklyLimitPercent) + '%';
    weeklyLimitDiv.style.display = 'block';
  } else {
    console.log('✗ Weekly limit not available (null or undefined)');
    weeklyLimitDiv.style.display = 'none';
  }

  // Update status badge
  const now = Date.now();
  const age = now - data.extractedAt;
  const staleThreshold = 30 * 60 * 1000; // 30 minutes

  if (data.isStale || age > staleThreshold) {
    statusBadge.textContent = 'Stale';
    statusBadge.className = 'status-badge stale';
  } else {
    statusBadge.textContent = 'OK';
    statusBadge.className = 'status-badge ok';
  }

  // Update reset time
  resetTime.textContent = data.resetTimeText || 'Unknown';

  // Update last updated time
  lastUpdated.textContent = formatTimeAgo(data.extractedAt);

  showState('usage');
}

// Show error state
function showErrorState(error) {
  if (error.type === 'AUTH_REQUIRED') {
    errorTitle.textContent = 'Authentication Required';
    errorMessage.textContent = 'Please log in to Claude at claude.ai, then visit the usage page.';
  } else if (error.type === 'PARSE_ERROR') {
    errorTitle.textContent = 'Parsing Error';
    errorMessage.textContent = 'Could not extract usage data from the page. The page structure may have changed. Error: ' + (error.message || 'Unknown');
  } else {
    errorTitle.textContent = 'Error';
    errorMessage.textContent = error.message || 'An unknown error occurred.';
  }

  showState('error');
}

// Show specific state
function showState(state) {
  loadingState.style.display = 'none';
  emptyState.style.display = 'none';
  errorState.style.display = 'none';
  usageState.style.display = 'none';

  switch (state) {
    case 'loading':
      loadingState.style.display = 'block';
      break;
    case 'empty':
      emptyState.style.display = 'block';
      break;
    case 'error':
      errorState.style.display = 'block';
      break;
    case 'usage':
      usageState.style.display = 'block';
      break;
  }
}

// Format time ago
function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
}

// Button handlers
openUsagePageButton.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://claude.ai/settings/usage' });
  window.close();
});

refreshButton.addEventListener('click', async () => {
  // Show loading state
  refreshButton.textContent = 'Refreshing...';
  refreshButton.disabled = true;

  try {
    // Request background script to perform a manual refresh
    const response = await chrome.runtime.sendMessage({ type: 'MANUAL_REFRESH' });

    if (response && response.success) {
      // Wait a bit for data to be extracted and stored
      setTimeout(async () => {
        await init();
        refreshButton.textContent = 'Refresh';
        refreshButton.disabled = false;
      }, 3000); // Wait 3 seconds for page load and extraction
    } else {
      throw new Error('Manual refresh failed');
    }
  } catch (error) {
    console.error('Error during manual refresh:', error);
    refreshButton.textContent = 'Error';
    setTimeout(() => {
      refreshButton.textContent = 'Refresh';
      refreshButton.disabled = false;
    }, 2000);
  }
});

// Initialize on load
init();
