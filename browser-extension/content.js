// YT-SHORTS-BLOCK v3.0 - Content Script (ISOLATED world)
(function () {
  'use strict';
  if (window.__ytShortsBlockLoaded) return;
  window.__ytShortsBlockLoaded = true;
  var stats = {removed:0, redirects:0};

  var CSS_SELECTORS = [
    'ytd-video-renderer:has(a[href^="/shorts/"])',
    'ytd-video-renderer:has(a[href^="/shorts"])',
    'ytd-compact-video-renderer:has(a[href^="/shorts/"])',
    'ytd-compact-video-renderer:has(a[href^="/shorts"])',
    'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
    'ytd-rich-item-renderer:has(a[href^="/shorts"])',
    'ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]',
    'ytm-shorts-lockup-view-model-v2',
    'ytm-shorts-lockup-view-model',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-reel-shelf-renderer',
    'ytd-guide-entry-renderer:has(a[title="Shorts"])',
    'ytd-guide-entry-renderer:has(a[href^="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[href^="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[title="Shorts"])',
    'yt-tab-shape[tab-title="Shorts"]',
    'ytd-reel-video-renderer',
    'ytd-shorts',
    'ytd-reel-player-overlay-renderer',
    'ytd-reel-player-header-renderer',
    'ytd-compact-link-renderer:has(a[href^="/shorts/"])',
    'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
    'ytd-notification-renderer:has(a[href^="/shorts/"])',
    'ytm-thumbnail-overlay-time-status-renderer[data-style="SHORTS"]',
    'ytm-video-with-context-renderer:has(a[href^="/shorts/"])',
    'ytm-compact-video-renderer:has(a[href^="/shorts/"])',
    'ytm-reel-shelf-renderer',
    'ytm-pivot-bar-item-renderer:has(.pivot-shorts)',
    'ytm-pivot-bar-item-renderer:has(a[href^="/shorts"])',
    'ytm-reel-video-renderer',
    'ytm-shorts-player',
    'ytm-reel-player-overlay-renderer'
  ];

  var XPATHS = [
    "//ytd-rich-section-renderer[.//*[@id='title' and text()='Shorts']]",
    "//ytd-rich-section-renderer[.//ytd-rich-shelf-renderer[@is-shorts]]",
    "//grid-shelf-view-model[.//h2[contains(@class,'yt-shelf-header-layout__title')]//span[text()='Shorts']]",
    "//grid-shelf-view-model[.//h2[contains(@class,'yt-shelf-header-layout__title')]//span[text()='Recently uploaded Shorts']]",
    "//ytd-reel-shelf-renderer",
    "//ytd-item-section-renderer[.//ytd-reel-shelf-renderer]"
  ];

  function removeByCSS() {
    var count = 0;
    for (var i = 0; i < CSS_SELECTORS.length; i++) {
      var sel = CSS_SELECTORS[i];
      try {
        var els = document.querySelectorAll(sel);
        for (var j = 0; j < els.length; j++) {
          var el = els[j];
          if (sel.indexOf('overlay-time-status') !== -1) {
            var card = el.closest('ytd-video-renderer') || el.closest('ytd-compact-video-renderer') || el.closest('ytd-rich-item-renderer') || el.closest('ytd-grid-video-renderer') || el.closest('ytm-video-with-context-renderer');
            if (card && card.parentNode) { card.parentNode.removeChild(card); count++; }
          } else if (sel.indexOf('shelf-renderer') !== -1) {
            var sec = el.closest('ytd-rich-section-renderer') || el.closest('ytd-item-section-renderer') || el.closest('ytm-rich-section-renderer');
            var t = sec || el;
            if (t && t.parentNode) { t.parentNode.removeChild(t); count++; }
          } else if (sel.indexOf('lockup-view-model') !== -1) {
            var gi = el.closest('ytd-rich-item-renderer') || el.closest('grid-shelf-view-model') || el.closest('ytm-rich-section-renderer');
            var t2 = gi || el;
            if (t2 && t2.parentNode) { t2.parentNode.removeChild(t2); count++; }
          } else {
            if (el.parentNode) { el.parentNode.removeChild(el); count++; }
          }
        }
      } catch(e) {}
    }
    if (count > 0) { stats.removed += count; try{chrome.storage.local.set({removed:stats.removed});}catch(e){} }
    return count;
  }

  function removeByXPath() {
    var count = 0;
    for (var i = 0; i < XPATHS.length; i++) {
      try {
        var snap = document.evaluate(XPATHS[i], document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var j = 0; j < snap.snapshotLength; j++) {
          var n = snap.snapshotItem(j);
          if (n && n.parentNode) { n.parentNode.removeChild(n); count++; }
        }
      } catch(e) {}
    }
    if (count > 0) { stats.removed += count; try{chrome.storage.local.set({removed:stats.removed});}catch(e){} }
  }

  function rewriteLinks() {
    var links = document.querySelectorAll('a[href*="/shorts/"]');
    for (var i = 0; i < links.length; i++) {
      var m = links[i].href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (m) links[i].href = 'https://www.youtube.com/watch?v=' + m[1];
    }
  }

  function fullCleanup() { removeByCSS(); removeByXPath(); rewriteLinks(); }

  function checkURL() {
    var p = window.location.pathname;
    if (/^\/shorts\/?/.test(p) || /^\/reel\/?/.test(p)) {
      var m = p.match(/\/(?:shorts|reel)\/([a-zA-Z0-9_-]+)/);
      window.location.replace(m ? 'https://www.youtube.com/watch?v='+m[1] : 'https://www.youtube.com/');
      stats.redirects++;
      try{chrome.storage.local.set({redirects:stats.redirects});}catch(e){}
      return true;
    }
    return false;
  }

  var lastUrl = location.href;
  function onUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (!checkURL()) { setTimeout(fullCleanup,300); setTimeout(fullCleanup,1000); setTimeout(fullCleanup,2500); }
    }
  }

  var oP = history.pushState, oR = history.replaceState;
  history.pushState = function(){oP.apply(this,arguments);onUrlChange();};
  history.replaceState = function(){oR.apply(this,arguments);onUrlChange();};
  window.addEventListener('popstate', onUrlChange);

  document.addEventListener('yt-navigate-start', function(e) {
    var d = e.detail||{}, url = d.url||'';
    if (!url && d.endpoint && d.endpoint.commandMetadata && d.endpoint.commandMetadata.webCommandMetadata) url = d.endpoint.commandMetadata.webCommandMetadata.url||'';
    if (/\/shorts\//.test(url)||/\/reel\//.test(url)) {
      e.preventDefault(); e.stopImmediatePropagation();
      var m = url.match(/\/(?:shorts|reel)\/([a-zA-Z0-9_-]+)/);
      window.location.replace(m ? 'https://www.youtube.com/watch?v='+m[1] : 'https://www.youtube.com/');
    }
  }, true);

  document.addEventListener('yt-navigate-finish', function(){setTimeout(fullCleanup,200);setTimeout(fullCleanup,1500);});

  var obs = new MutationObserver(function(muts) {
    var need = false;
    for (var i=0;i<muts.length&&!need;i++) {
      var added = muts[i].addedNodes;
      for (var j=0;j<added.length;j++) {
        var n = added[j];
        if (n.nodeType!==1) continue;
        var tag = (n.tagName||'').toLowerCase();
        if (tag.indexOf('shorts')!==-1||tag.indexOf('reel')!==-1||tag.indexOf('lockup')!==-1||tag==='ytd-rich-shelf-renderer'||tag==='grid-shelf-view-model') {need=true;break;}
        if (n.querySelector&&(n.querySelector('[href^="/shorts/"]')||n.querySelector('[overlay-style="SHORTS"]')||n.querySelector('ytm-shorts-lockup-view-model')||n.querySelector('ytd-reel-shelf-renderer'))) {need=true;break;}
      }
    }
    if (need) requestAnimationFrame(fullCleanup);
  });

  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href*="/shorts/"]');
    if (link) {
      e.preventDefault(); e.stopPropagation();
      var m = link.href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      window.location.href = m ? 'https://www.youtube.com/watch?v='+m[1] : 'https://www.youtube.com/';
      stats.redirects++;
      try{chrome.storage.local.set({redirects:stats.redirects});}catch(e){}
    }
  }, true);

  document.addEventListener('auxclick', function(e) {
    var link = e.target.closest('a[href*="/shorts/"]');
    if (link) {e.preventDefault();e.stopPropagation();}
  }, true);

  function init() {
    if (checkURL()) return;
    fullCleanup();
    if (document.body) obs.observe(document.body,{childList:true,subtree:true});
    else document.addEventListener('DOMContentLoaded',function(){obs.observe(document.body,{childList:true,subtree:true});});
    setInterval(fullCleanup, 2000);
    setInterval(onUrlChange, 1000);
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  fullCleanup();
})();
