/**
 * ============================================================
 * YT-Shorts-Block — Background Service Worker v2.0
 * ============================================================
 * Manages declarativeNetRequest rules, badge, and messaging.
 *
 * @author  ShoumikBalaSomu
 * @license MIT
 * ============================================================
 */

// Set badge on install
chrome.runtime.onInstalled.addListener(function (details) {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.action.setBadgeBackgroundColor({ color: '#e53935' });
  console.log('[YT-Shorts-Block] Installed/Updated:', details.reason);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === 'GET_STATE') {
    chrome.storage.local.get(['ytShortsBlockEnabled', 'ytShortsBlockCount'], function (data) {
      sendResponse({
        enabled: data.ytShortsBlockEnabled !== false,
        count: data.ytShortsBlockCount || 0,
      });
    });
    return true;
  }

  if (msg.type === 'SET_ENABLED') {
    chrome.storage.local.set({ ytShortsBlockEnabled: msg.enabled });
    chrome.action.setBadgeText({ text: msg.enabled ? 'ON' : 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: msg.enabled ? '#e53935' : '#757575' });

    // Enable/disable DNR rules
    if (msg.enabled) {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['yt_shorts_rules'],
      });
    } else {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['yt_shorts_rules'],
      });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === 'RESET_COUNT') {
    chrome.storage.local.set({ ytShortsBlockCount: 0 });
    sendResponse({ ok: true });
    return true;
  }
});

// Listen for tab updates to catch shorts URLs that bypass DNR
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url && /youtube\.com\/shorts/i.test(changeInfo.url)) {
    chrome.tabs.update(tabId, { url: 'https://www.youtube.com/' });
  }
});

// Also catch web navigation
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (details.frameId === 0 && /youtube\.com\/shorts/i.test(details.url)) {
    chrome.tabs.update(details.tabId, { url: 'https://www.youtube.com/' });
  }
}, { url: [{ hostSuffix: 'youtube.com' }] });
