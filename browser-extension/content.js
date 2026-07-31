/**
 * YT Shorts Block — Content Script (Manifest V3)
 * Blocks every YouTube Shorts element: search, feed, sidebar,
 * channel pages, notifications, and direct URL access.
 * Runs at document_start for zero-flash blocking.
 */

(function () {
  'use strict';

  /* ───────── state ───────── */
  let isEnabled = true;
  let blockCount = 0;

  try {
    const stored = localStorage.getItem('ytsb_enabled');
    if (stored !== null) isEnabled = stored === 'true';
    blockCount = parseInt(localStorage.getItem('ytsb_count') || '0', 10);
  } catch (_) { /* private mode */ }

  function save() {
    try {
      localStorage.setItem('ytsb_enabled', String(isEnabled));
      localStorage.setItem('ytsb_count', String(blockCount));
    } catch (_) {}
  }

  /* listen for toggle from popup */
  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.type === 'TOGGLE') {
      isEnabled = msg.enabled;
      save();
      if (isEnabled) nukeAll();
      else restoreAll();
    }
    if (msg.type === 'GET_STATE') {
      chrome.runtime.sendMessage({ enabled: isEnabled, count: blockCount });
    }
  });

  /* ───────── URL helpers ───────── */
  function isShortsURL(url) {
    try {
      const u = new URL(url, window.location.origin);
      const p = u.pathname.toLowerCase();
      return (
        p === '/shorts' ||
        p.startsWith('/shorts/') ||
        p.includes('/shorts/embed') ||
        p.startsWith('/embed/shorts')
      );
    } catch (_) { return false; }
  }

  /* ───────── 1. DIRECT-URL REDIRECT ───────── */
  function redirectIfShorts() {
    if (!isEnabled) return false;
    if (isShortsURL(window.location.href)) {
      blockCount++;
      save();
      window.location.replace('https://www.youtube.com/');
      return true;
    }
    return false;
  }

  /* ───────── 2. SPA NAVIGATION INTERCEPT ───────── */
  function interceptNavigation() {
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function () {
      if (isEnabled && arguments[2] && isShortsURL(String(arguments[2]))) {
        blockCount++; save();
        arguments[2] = '/';
      }
      return origPush.apply(this, arguments);
    };
    history.replaceState = function () {
      if (isEnabled && arguments[2] && isShortsURL(String(arguments[2]))) {
        blockCount++; save();
        arguments[2] = '/';
      }
      return origReplace.apply(this, arguments);
    };

    /* click intercept — capture phase */
    document.addEventListener('click', function (e) {
      if (!isEnabled) return;
      const a = e.target.closest('a[href*="/shorts"]');
      if (a) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        blockCount++; save();
        window.location.href = 'https://www.youtube.com/';
      }
    }, true);

    /* YouTube SPA events */
    document.addEventListener('yt-navigate-start', function (e) {
      if (!isEnabled) return;
      const url = (e.detail && e.detail.url) || '';
      if (isShortsURL(url)) {
        e.preventDefault();
        e.stopPropagation();
        blockCount++; save();
        window.location.href = 'https://www.youtube.com/';
      }
    }, true);

    document.addEventListener('yt-navigate-finish', function () {
      if (isEnabled) nukeAll();
    });

    window.addEventListener('popstate', function () {
      if (isEnabled) {
        if (redirectIfShorts()) return;
        nukeAll();
      }
    });
  }

  /* ───────── 3. COMPREHENSIVE SELECTOR LIST ───────── */

  /* Selectors safe for querySelectorAll (no :has) */
  const SIMPLE_SELECTORS = [
    /* --- Shorts shelf / carousel (search + home) --- */
    'ytd-reel-shelf-renderer',
    'ytd-reel-item-renderer',
    'ytd-reel-video-renderer',
    'ytd-reel-player-overlay-renderer',
    'ytd-reel-player-header-renderer',

    /* --- Shorts button / tab in navigation --- */
    'ytd-guide-entry-renderer a[href="/shorts"]',
    'ytd-mini-guide-entry-renderer a[href="/shorts"]',
    'tp-yt-paper-item a[href="/shorts"]',

    /* --- Shorts player overlay --- */
    '#shorts-player',
    'ytd-shorts',
    'ytd-short-form-video-renderer',

    /* --- Shorts in engagement panels --- */
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-shorts"]',

    /* --- Newer 2024-2026 UI components --- */
    'ytd-lockup-view-model[overlay-style="SHORTS"]',
    'ytd-rich-section-renderer ytd-reel-shelf-renderer',
    'ytd-statement-banner-renderer:has(a[href*="/shorts"])',

    /* --- Shorts in notifications --- */
    'ytd-notification-renderer a[href*="/shorts"]',

    /* --- Shorts badge / icon overlays --- */
    'ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]',
    'ytd-badge-supported-renderer .ytd-badge-supported-renderer:has-text("Shorts")',

    /* --- Mobile web --- */
    'ytm-reel-shelf-renderer',
    'ytm-reel-item-renderer',
    'ytm-short-form-video-renderer',
    'ytm-pivot-bar-item-renderer a[href="/shorts"]',
  ];

  /* Parent containers to remove when a child <a> points to /shorts */
  const CONTAINER_SELECTOR = [
    'ytd-rich-item-renderer',
    'ytd-grid-video-renderer',
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-playlist-video-renderer',
    'ytd-notification-renderer',
    'ytd-reel-item-renderer',
    'ytd-reel-shelf-renderer',
    'ytd-rich-section-renderer',
    'ytd-item-section-renderer',
    'ytd-lockup-view-model',
    'ytd-structured-description-content-renderer',
    'ytd-engagement-panel-section-list-renderer',
  ].join(', ');

  /* ───────── 4. DOM NUKER ───────── */
  function nukeAll() {
    if (!isEnabled) return;
    let removed = 0;

    /* 4a — simple selectors */
    SIMPLE_SELECTORS.forEach(function (sel) {
      try {
        document.querySelectorAll(sel).forEach(function (el) {
          el.remove();
          removed++;
        });
      } catch (_) {}
    });

    /* 4b — any <a href*="/shorts"> → kill its container */
    document.querySelectorAll('a[href*="/shorts"]').forEach(function (a) {
      const container = a.closest(CONTAINER_SELECTOR);
      if (container) {
        container.remove();
      } else {
        a.remove();
      }
      removed++;
    });

    /* 4c — search results: remove entire shelf if it contains shorts */
    document.querySelectorAll('ytd-item-section-renderer, ytd-rich-section-renderer').forEach(function (section) {
      if (section.querySelector('ytd-reel-shelf-renderer, ytd-reel-item-renderer, a[href*="/shorts"]')) {
        section.remove();
        removed++;
      }
    });

    /* 4d — remove "Shorts" text badges in search filters */
    document.querySelectorAll('yt-chip-cloud-chip-renderer, ytd-search-filter-renderer, tp-yt-paper-item').forEach(function (el) {
      if (el.textContent && el.textContent.trim().toLowerCase() === 'shorts') {
        el.remove();
        removed++;
      }
    });

    /* 4e — kill shorts player page entirely */
    if (document.querySelector('ytd-reel-video-renderer, ytd-short-form-video-renderer, #shorts-player')) {
      if (isShortsURL(window.location.href)) {
        window.location.replace('https://www.youtube.com/');
        return;
      }
    }

    /* 4f — remove shorts from channel pages */
    document.querySelectorAll('ytd-channel-tab-renderer, tp-yt-paper-tab').forEach(function (tab) {
      if (tab.textContent && tab.textContent.trim().toLowerCase() === 'shorts') {
        tab.remove();
        removed++;
      }
    });

    /* 4g — remove shorts shelf header / title */
    document.querySelectorAll('ytd-rich-section-renderer').forEach(function (sec) {
      const title = sec.querySelector('#title, h2, .ytd-rich-section-renderer');
      if (title && title.textContent && title.textContent.trim().toLowerCase().includes('shorts')) {
        sec.remove();
        removed++;
      }
    });

    if (removed > 0) {
      blockCount += removed;
      save();
    }
  }

  function restoreAll() {
    /* On disable, just reload the page */
    window.location.reload();
  }

  /* ───────── 5. MUTATION OBSERVER ───────── */
  const observer = new MutationObserver(function (mutations) {
    if (!isEnabled) return;
    let shouldNuke = false;
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const tag = node.tagName ? node.tagName.toLowerCase() : '';
        if (
          tag.includes('reel') ||
          tag.includes('short') ||
          tag.includes('ytd-rich-item') ||
          tag.includes('ytd-video-renderer') ||
          tag.includes('ytd-lockup') ||
          tag.includes('ytd-grid-video') ||
          tag.includes('ytd-compact-video') ||
          (node.querySelector && node.querySelector('a[href*="/shorts"]'))
        ) {
          shouldNuke = true;
          break;
        }
      }
      if (shouldNuke) break;
    }
    if (shouldNuke) nukeAll();
  });

  /* ───────── 6. XHR / FETCH INTERCEPT ───────── */
  function interceptNetwork() {
    /* Block fetch to shorts API */
    const origFetch = window.fetch;
    window.fetch = function () {
      const url = String(arguments[0] && arguments[0].url ? arguments[0].url : arguments[0]);
      if (isEnabled && (
        url.includes('/youtubei/v1/reel') ||
        url.includes('/youtubei/v1/shorts') ||
        url.includes('/shorts/')
      )) {
        blockCount++; save();
        return Promise.resolve(new Response('{}', { status: 200 }));
      }
      return origFetch.apply(this, arguments);
    };

    /* Block XHR to shorts API */
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (isEnabled && typeof url === 'string' && (
        url.includes('/youtubei/v1/reel') ||
        url.includes('/youtubei/v1/shorts')
      )) {
        blockCount++; save();
        this._blocked = true;
      }
      return origOpen.apply(this, arguments);
    };
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
      if (this._blocked) return;
      return origSend.apply(this, arguments);
    };
  }

  /* ───────── 7. BOOT ───────── */
  function boot() {
    if (redirectIfShorts()) return;
    interceptNavigation();
    interceptNetwork();
    nukeAll();

    /* Start observer once DOM exists */
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        observer.observe(document.body, { childList: true, subtree: true });
        nukeAll();
      });
    }

    /* Periodic sweep (catches anything the observer misses) */
    setInterval(function () {
      if (isEnabled) nukeAll();
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Also run immediately for document_start */
  redirectIfShorts();
})();
