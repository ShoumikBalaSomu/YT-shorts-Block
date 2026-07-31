/**
 * YT-Shorts-Block - Background Service Worker
 * Manages extension state and declarativeNetRequest rules
 * 
 * @author ShoumikBalaSomu
 * @license MIT
 */

const ENABLED_KEY = 'ytShortsBlockEnabled';
const BLOCK_COUNT_KEY = 'ytShortsBlockCount';
const RULE_IDS = [1, 2, 3, 4, 5, 6, 7];

// On install, set default state
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      [ENABLED_KEY]: true,
      [BLOCK_COUNT_KEY]: 0
    });
    enableRules();
  }
});

// Listen for storage changes (toggle from popup)
chrome.storage.onChanged.addListener(function (changes) {
  if (changes[ENABLED_KEY]) {
    const enabled = changes[ENABLED_KEY].newValue;
    if (enabled) {
      enableRules();
    } else {
      disableRules();
    }
  }
});

// Enable all blocking rules
async function enableRules() {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(r => r.id);
    
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds
      });
    }

    // Rules are in rules.json (static), just make sure they're enabled
    const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    if (!enabledRulesets.includes('shorts_block_rules')) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['shorts_block_rules']
      });
    }
    
    updateBadge(true);
  } catch (e) {
    console.warn('YT-Shorts-Block: Rule management error', e);
  }
}

// Disable all blocking rules
async function disableRules() {
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ['shorts_block_rules']
    });
    updateBadge(false);
  } catch (e) {
    console.warn('YT-Shorts-Block: Rule disable error', e);
  }
}

// Update extension badge
function updateBadge(enabled) {
  const text = enabled ? 'ON' : 'OFF';
  const color = enabled ? '#4CAF50' : '#F44336';
  
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(function () {
  chrome.storage.local.get([ENABLED_KEY], function (data) {
    updateBadge(data[ENABLED_KEY] !== false);
  });
});

// Initial badge
chrome.storage.local.get([ENABLED_KEY], function (data) {
  updateBadge(data[ENABLED_KEY] !== false);
});
