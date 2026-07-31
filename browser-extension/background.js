// YT-SHORTS-BLOCK v3.0 - Background Service Worker
chrome.runtime.onInstalled.addListener(async function() {
  var scripts = [{id:'yt-shorts-page-script',world:'MAIN',matches:['*://www.youtube.com/*','*://m.youtube.com/*','*://youtube.com/*'],runAt:'document_start',js:['page-script.js']}];
  try { await chrome.scripting.unregisterContentScripts({ids:['yt-shorts-page-script']}); } catch(e) {}
  try { await chrome.scripting.registerContentScripts(scripts); } catch(e) {}
  try {
    var tabs = await chrome.tabs.query({url:['*://www.youtube.com/*','*://m.youtube.com/*']});
    for (var i=0;i<tabs.length;i++) {
      try { await chrome.scripting.executeScript({target:{tabId:tabs[i].id},files:['page-script.js'],injectImmediately:true,world:'MAIN'}); } catch(e) {}
    }
  } catch(e) {}
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url && /\/shorts\//.test(changeInfo.url)) {
    var m = changeInfo.url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    chrome.tabs.update(tabId, {url: m ? 'https://www.youtube.com/watch?v='+m[1] : 'https://www.youtube.com/'});
  }
});
chrome.webNavigation.onHistoryStateUpdated.addListener(function(d) {
  if (d.url && /\/shorts\//.test(d.url)) {
    var m = d.url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    chrome.tabs.update(d.tabId, {url: m ? 'https://www.youtube.com/watch?v='+m[1] : 'https://www.youtube.com/'});
  }
}, {url:[{hostSuffix:'youtube.com'},{hostSuffix:'www.youtube.com'},{hostSuffix:'m.youtube.com'}]});
chrome.webNavigation.onBeforeNavigate.addListener(function(d) {
  if (d.url && /\/shorts\//.test(d.url) && d.frameId===0) {
    var m = d.url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    chrome.tabs.update(d.tabId, {url: m ? 'https://www.youtube.com/watch?v='+m[1] : 'https://www.youtube.com/'});
  }
}, {url:[{hostSuffix:'youtube.com'},{hostSuffix:'www.youtube.com'},{hostSuffix:'m.youtube.com'}]});
