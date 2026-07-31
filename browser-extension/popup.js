/**
 * YT-Shorts-Block - Popup Logic
 * Handles toggle, stats display, and user interactions
 * 
 * @author ShoumikBalaSomu
 * @license MIT
 */

(function () {
  'use strict';

  const ENABLED_KEY = 'ytShortsBlockEnabled';
  const BLOCK_COUNT_KEY = 'ytShortsBlockCount';
  const AVG_SHORTS_SECONDS = 45; // Average time wasted per Short

  const mainToggle = document.getElementById('mainToggle');
  const statusCard = document.getElementById('statusCard');
  const statusText = document.getElementById('statusText');
  const blockCountEl = document.getElementById('blockCount');
  const timeSavedEl = document.getElementById('timeSaved');
  const resetBtn = document.getElementById('resetBtn');

  // Load current state
  function loadState() {
    chrome.storage.local.get([ENABLED_KEY, BLOCK_COUNT_KEY], function (data) {
      const enabled = data[ENABLED_KEY] !== false;
      const count = data[BLOCK_COUNT_KEY] || 0;

      mainToggle.checked = enabled;
      updateUI(enabled, count);
    });
  }

  // Update the UI based on state
  function updateUI(enabled, count) {
    statusCard.className = 'status-card ' + (enabled ? 'active' : 'inactive');
    statusText.textContent = enabled ? 'Active - Protecting You' : 'Disabled - Shorts Visible';
    blockCountEl.textContent = formatNumber(count);
    timeSavedEl.textContent = calculateTimeSaved(count);

    // Update layer statuses
    document.querySelectorAll('.layer-status').forEach(function (el) {
      el.textContent = enabled ? '\u2713' : '\u2717';
      el.className = 'layer-status ' + (enabled ? 'active' : 'inactive');
    });
  }

  // Format large numbers
  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  // Calculate time saved from blocked shorts
  function calculateTimeSaved(count) {
    const totalSeconds = count * AVG_SHORTS_SECONDS;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) return hours + 'h ' + minutes + 'm';
    if (minutes > 0) return minutes + 'm';
    return totalSeconds + 's';
  }

  // Toggle handler
  mainToggle.addEventListener('change', function () {
    const enabled = mainToggle.checked;
    chrome.storage.local.set({ [ENABLED_KEY]: enabled });

    // Also update declarativeNetRequest rules
    if (enabled) {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['shorts_block_rules']
      });
    } else {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['shorts_block_rules']
      });
    }

    chrome.storage.local.get([BLOCK_COUNT_KEY], function (data) {
      updateUI(enabled, data[BLOCK_COUNT_KEY] || 0);
    });
  });

  // Reset counter
  resetBtn.addEventListener('click', function () {
    chrome.storage.local.set({ [BLOCK_COUNT_KEY]: 0 });
    blockCountEl.textContent = '0';
    timeSavedEl.textContent = '0s';

    // Button feedback animation
    resetBtn.textContent = 'Reset!';
    resetBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    setTimeout(function () {
      resetBtn.textContent = 'Reset Counter';
      resetBtn.style.background = '';
    }, 1500);
  });

  // Listen for real-time count updates
  chrome.storage.onChanged.addListener(function (changes) {
    if (changes[BLOCK_COUNT_KEY]) {
      const count = changes[BLOCK_COUNT_KEY].newValue || 0;
      blockCountEl.textContent = formatNumber(count);
      timeSavedEl.textContent = calculateTimeSaved(count);
    }
  });

  // Initialize
  loadState();
})();
