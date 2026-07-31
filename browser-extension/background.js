/**
 * YT Shorts Block -- Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.storage.local.set({
      enabled: true,
      blockCount: 0,
      installDate: Date.now(),
      version: chrome.runtime.getManifest().version
    });
  }
  if (details.reason === "update") {
    chrome.storage.local.set({ version: chrome.runtime.getManifest().version });
  }
  chrome.contextMenus.create({
    id: "ytsb-toggle",
    title: "Toggle YT Shorts Block",
    contexts: ["action"]
  });
});

chrome.storage.onChanged.addListener(function (changes) {
  if (changes.enabled) {
    var isEnabled = changes.enabled.newValue;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: isEnabled ? ["yt_shorts_rules"] : [],
      disableRulesetIds: isEnabled ? [] : ["yt_shorts_rules"]
    });
  }
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === "GET_STATE") {
    chrome.storage.local.get(["enabled", "blockCount"], function (data) {
      sendResponse({ enabled: data.enabled !== false, count: data.blockCount || 0 });
    });
    return true;
  }
  if (msg.type === "TOGGLE") {
    chrome.storage.local.set({ enabled: msg.enabled });
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE", enabled: msg.enabled }).catch(function () {});
      });
    });
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === "BLOCK_COUNT") {
    chrome.storage.local.get(["blockCount"], function (data) {
      var newCount = (data.blockCount || 0) + (msg.count || 0);
      chrome.storage.local.set({ blockCount: newCount });
      sendResponse({ count: newCount });
    });
    return true;
  }
});

chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId === "ytsb-toggle") {
    chrome.storage.local.get(["enabled"], function (data) {
      chrome.storage.local.set({ enabled: !(data.enabled !== false) });
    });
  }
});