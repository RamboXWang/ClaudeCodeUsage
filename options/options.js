// Options page script for Claude Usage Monitor

console.log('Options page loaded');

// DOM elements
const staleThresholdInput = document.getElementById('stale-threshold');
const colorBadgeToggle = document.getElementById('color-badge-toggle');
const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
const refreshIntervalSelect = document.getElementById('refresh-interval');
const saveButton = document.getElementById('save-button');

// Default settings
const DEFAULT_SETTINGS = {
  staleThresholdMinutes: 30,
  colorCodedBadge: true,
  autoRefreshEnabled: false,
  refreshIntervalMinutes: 5
};

// Load settings on init
async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get(['settings']);
    const currentSettings = settings.settings || DEFAULT_SETTINGS;

    // Update UI
    staleThresholdInput.value = currentSettings.staleThresholdMinutes;
    colorBadgeToggle.classList.toggle('active', currentSettings.colorCodedBadge);
    autoRefreshToggle.classList.toggle('active', currentSettings.autoRefreshEnabled);
    refreshIntervalSelect.value = currentSettings.refreshIntervalMinutes;

    console.log('Settings loaded:', currentSettings);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      staleThresholdMinutes: parseInt(staleThresholdInput.value, 10),
      colorCodedBadge: colorBadgeToggle.classList.contains('active'),
      autoRefreshEnabled: autoRefreshToggle.classList.contains('active'),
      refreshIntervalMinutes: parseInt(refreshIntervalSelect.value, 10)
    };

    await chrome.storage.local.set({ settings });

    console.log('Settings saved:', settings);

    // Show success feedback
    saveButton.textContent = 'Saved!';
    saveButton.classList.add('saved');

    setTimeout(() => {
      saveButton.textContent = 'Save Settings';
      saveButton.classList.remove('saved');
    }, 2000);

    // Notify background script to update badge if needed
    chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED', settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    saveButton.textContent = 'Error saving settings';
    setTimeout(() => {
      saveButton.textContent = 'Save Settings';
    }, 2000);
  }
}

// Toggle handlers
colorBadgeToggle.addEventListener('click', () => {
  colorBadgeToggle.classList.toggle('active');
});

autoRefreshToggle.addEventListener('click', () => {
  autoRefreshToggle.classList.toggle('active');
});

// Save button handler
saveButton.addEventListener('click', saveSettings);

// Validate stale threshold input
staleThresholdInput.addEventListener('input', () => {
  let value = parseInt(staleThresholdInput.value, 10);
  if (value < 5) {
    staleThresholdInput.value = 5;
  } else if (value > 120) {
    staleThresholdInput.value = 120;
  }
});

// Load settings on page load
loadSettings();
