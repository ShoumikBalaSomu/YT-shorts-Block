/**
 * ============================================================
 * YT-Shorts-Block — Nuclear Content Script v2.0
 * ============================================================
 * Blocks YouTube Shorts at EVERY level:
 *   Layer 1: XHR/Fetch API response interception (strips shorts data BEFORE rendering)
 *   Layer 2: URL redirect (catches /shorts/ URLs)
 *   Layer 3: SPA navigation interception (pushState/replaceState)
 *   Layer 4: DOM removal (aggressive element cleaning)
 *   Layer 5: MutationObserver (catches dynamically injected elements)
 *   Layer 6: Periodic sweep (backup cleanup every 2s)
 *
 * @author  ShoumikBalaSomu
 * @license MIT
 * @version 2.0.0
 * ============================================================
 */

(function () {
  'use strict';

  /* ===================== CONFIG ===================== */
  const CFG = {
    ENABLED_KEY: 'ytShortsBlockEnabled',
    COUNT_KEY:   'ytShortsBlockCount',
    THROTTLE_MS: 80,
    SWEEP_MS:    2000,
    DEBUG:       false,
  };

  let enabled    = true;
  let blockCount = 0;
  let observer   = null;
  let lastSweep  = 0;

  const log = (...a) => CFG.DEBUG && console.log('[YT-Shorts-Block]', ...a);

  /* ===================== SHORTS DETECTION ===================== */

  /** Check if a URL is a Shorts URL */
  function isShortsURL(url) {
    try {
      const u = new URL(url, location.origin);
      const p = u.pathname.toLowerCase();
      return (
        p === '/shorts' ||
        p.startsWith('/shorts/') ||
        p.includes('/shorts/embed') ||
        p.includes('/reel/') ||
        u.searchParams.get('feature') === 'shorts'
      );
    } catch { return false; }
  }

  /** Check if a YouTube API response item is a Short */
  function isShortsItem(item) {
    if (!item) return false;
    const s = JSON.stringify(item).toLowerCase();
    return (
      s.includes('"reelwatchendpoint"') ||
      s.includes('"reelitemendpoint"') ||
      s.includes('"shortslockupviewmodel"') ||
      s.includes('"shortsvideoviewmodel"') ||
      s.includes('"reelplayerendpoint"') ||
      s.includes('"/shorts/') ||
      s.includes('"isshorts":true') ||
      s.includes('"shorts":true') ||
      (s.includes('"reel') && s.includes('endpoint'))
    );
  }

  /* ===================== LAYER 1: API INTERCEPTION ===================== */
  /**
   * Intercepts XMLHttpRequest and fetch() to strip Shorts data
   * from YouTube's API responses BEFORE the page renders them.
   * This is the most powerful layer — it prevents shorts from
   * ever entering the DOM.
   */
  function interceptAPI() {
    // --- XHR Interception ---
    const OrigXHR = XMLHttpRequest;
    const origOpen = OrigXHR.prototype.open;
    const origSend = OrigXHR.prototype.send;

    OrigXHR.prototype.open = function (method, url, ...rest) {
      this._ytShortsURL = url;
      return origOpen.call(this, method, url, ...rest);
    };

    OrigXHR.prototype.send = function (...args) {
      const self = this;
      const url = self._ytShortsURL || '';

      // Only intercept YouTube API calls
      if (url.includes('youtubei.googleapis.com') || url.includes('/youtubei/')) {
        const origOnReadyStateChange = self.onreadystatechange;

        self.onreadystatechange = function () {
          if (self.readyState === 4 && self.status === 200) {
            try {
              const ct = self.getResponseHeader('content-type') || '';
              if (ct.includes('json')) {
                const filtered = filterAPIResponse(self.responseText);
                if (filtered !== self.responseText) {
                  Object.defineProperty(self, 'responseText', { value: filtered, writable: false });
                  Object.defineProperty(self, 'response', { value: filtered, writable: false });
                  log('XHR: Stripped shorts from API response');
                }
              }
            } catch (e) { log('XHR filter error:', e); }
          }
          if (origOnReadyStateChange) origOnReadyStateChange.apply(this, arguments);
        };

        // Also handle onload
        const origOnLoad = self.onload;
        self.onload = function () {
          try {
            const ct = self.getResponseHeader('content-type') || '';
            if (ct.includes('json')) {
              const filtered = filterAPIResponse(self.responseText);
              if (filtered !== self.responseText) {
                Object.defineProperty(self, 'responseText', { value: filtered, writable: false });
                Object.defineProperty(self, 'response', { value: filtered, writable: false });
              }
            }
          } catch (e) { /* skip */ }
          if (origOnLoad) origOnLoad.apply(this, arguments);
        };
      }
      return origSend.apply(this, args);
    };

    // --- Fetch Interception ---
    const origFetch = window.fetch;
    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : (input.url || '');

      if (url.includes('youtubei.googleapis.com') || url.includes('/youtubei/')) {
        return origFetch.call(this, input, init).then(function (response) {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('json')) {
            return response.clone().text().then(function (body) {
              const filtered = filterAPIResponse(body);
              if (filtered !== body) {
                log('Fetch: Stripped shorts from API response');
                return new Response(filtered, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers,
                });
              }
              return response;
            }).catch(function () { return response; });
          }
          return response;
        });
      }
      return origFetch.call(this, input, init);
    };

    log('API interception active');
  }

  /**
   * Parse YouTube API JSON and recursively remove Shorts items
   */
  function filterAPIResponse(text) {
    if (!enabled) return text;
    try {
      const data = JSON.parse(text);
      let modified = false;

      function clean(obj) {
        if (!obj || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
          for (let i = obj.length - 1; i >= 0; i--) {
            if (isShortsItem(obj[i])) {
              obj.splice(i, 1);
              modified = true;
              blockCount++;
            } else {
              clean(obj[i]);
            }
          }
        } else {
          for (const key of Object.keys(obj)) {
            // Remove entire objects that are shorts-specific
            if (
              key === 'reelWatchEndpoint' ||
              key === 'reelItemEndpoint' ||
              key === 'reelPlayerEndpoint' ||
              key === 'shortsLockupViewModel' ||
              key === 'shortsVideoViewModel' ||
              key === 'reelShelfRenderer' ||
              key === 'reelItemRenderer' ||
              key === 'shortsEntryPoint'
            ) {
              delete obj[key];
              modified = true;
              blockCount++;
              continue;
            }
            clean(obj[key]);
          }
        }
        return obj;
      }

      clean(data);

      if (modified) {
        saveBlockCount();
        return JSON.stringify(data);
      }
    } catch (e) {
      // Not JSON or parse error — return original
    }
    return text;
  }

  /* ===================== LAYER 2: URL REDIRECT ===================== */
  function redirectIfShorts() {
    if (!enabled) return false;
    if (isShortsURL(location.href)) {
      blockCount++;
      saveBlockCount();
      log('Redirecting shorts URL:', location.href);
      location.replace('https://www.youtube.com/');
      return true;
    }
    return false;
  }

  /* ===================== LAYER 3: SPA NAVIGATION ===================== */
  function interceptNavigation() {
    // Override history.pushState
    const origPush = history.pushState;
    history.pushState = function (...args) {
      if (enabled && args[2]) {
        const target = new URL(args[2], location.origin).href;
        if (isShortsURL(target)) {
          blockCount++;
          saveBlockCount();
          log('Blocked pushState to shorts:', args[2]);
          args[2] = '/';
        }
      }
      return origPush.apply(this, args);
    };

    // Override history.replaceState
    const origReplace = history.replaceState;
    history.replaceState = function (...args) {
      if (enabled && args[2]) {
        const target = new URL(args[2], location.origin).href;
        if (isShortsURL(target)) {
          blockCount++;
          saveBlockCount();
          log('Blocked replaceState to shorts:', args[2]);
          args[2] = '/';
        }
      }
      return origReplace.apply(this, args);
    };

    // Intercept ALL clicks on shorts links (capture phase)
    document.addEventListener('click', function (e) {
      if (!enabled) return;
      const link = e.target.closest('a[href*="/shorts"], a[href*="/reel/"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        blockCount++;
        saveBlockCount();
        log('Blocked click on shorts link:', link.href);
        location.href = 'https://www.youtube.com/';
        return false;
      }
    }, true);

    // Intercept middle-click / ctrl+click
    document.addEventListener('auxclick', function (e) {
      if (!enabled) return;
      const link = e.target.closest('a[href*="/shorts"], a[href*="/reel/"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        blockCount++;
        saveBlockCount();
      }
    }, true);

    // Listen for YouTube's SPA navigation events
    document.addEventListener('yt-navigate-start', function (e) {
      if (!enabled) return;
      const url = e.detail && e.detail.url;
      if (url && isShortsURL(url)) {
        e.preventDefault();
        e.stopPropagation();
        blockCount++;
        saveBlockCount();
        log('Blocked yt-navigate-start to shorts');
        location.href = 'https://www.youtube.com/';
      }
    }, true);

    document.addEventListener('yt-navigate-finish', function () {
      if (redirectIfShorts()) return;
      scheduleSweep();
    });

    window.addEventListener('popstate', function () {
      setTimeout(function () {
        if (redirectIfShorts()) return;
        sweepDOM();
      }, 50);
    });

    // Intercept beforeunload for shorts navigation
    window.addEventListener('beforeunload', function (e) {
      // Can't really block, but log
    });

    log('SPA navigation interception active');
  }

  /* ===================== LAYER 4: DOM SWEEP ===================== */

  // All CSS selectors for shorts elements (2024-2026 YouTube DOM)
  const REMOVE_SELECTORS = [
    // --- Homepage / Feed ---
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-rich-section-renderer:has(ytd-reel-shelf-renderer)',
    'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
    'ytd-reel-item-renderer',
    'ytd-rich-item-renderer:has(ytd-reel-item-renderer)',

    // --- Search Results (CRITICAL FIX) ---
    'ytd-item-section-renderer ytd-reel-shelf-renderer',
    'ytd-search-renderer ytd-reel-item-renderer',
    'ytd-search-renderer ytd-reel-shelf-renderer',

    // --- Navigation / Sidebar ---
    'ytd-guide-entry-renderer:has(a[href="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
    'a[href="/shorts"]',
    'tp-yt-paper-item:has(a[href="/shorts"])',

    // --- Video Player ---
    '.ytp-short-button',
    'button[aria-label="Shorts"]',
    'ytd-reel-player-overlay-renderer',
    'ytd-reel-video-renderer',

    // --- Recommendations / Up Next ---
    'ytd-compact-reel-item-renderer',
    'ytd-compact-link-renderer:has(#endpoint[href^="/shorts"])',
    'ytd-compact-video-renderer:has(a[href^="/shorts"])',

    // --- Channel Pages ---
    'ytd-channel-tab-renderer:has-text(Shorts)',
    'tp-yt-paper-tab:has-text(Shorts)',

    // --- Notifications ---
    'ytd-notification-renderer:has(a[href^="/shorts"])',

    // --- Trending / Explore ---
    'ytd-explore-renderer ytd-reel-shelf-renderer',

    // --- Mobile Web ---
    'ytm-reel-shelf-renderer',
    'ytm-reel-item-renderer',
    'ytm-pivot-bar-item-renderer:has-text(Shorts)',
    'ytm-rich-shelf-renderer',
    'ytm-compact-reel-item-renderer',

    // --- Shorts Page (if loaded) ---
    'ytd-shorts-renderer',
    'ytd-reel-watch-renderer',
    'reel-watch-sequence-renderer',

    // --- 2025-2026 New YouTube Components ---
    'ytd-lockup-view-model:has(a[href^="/shorts"])',
    'ytd-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"])',
    'ytd-rich-item-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"])',
    'ytd-grid-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"])',
    'ytd-compact-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"])',
    'ytd-video-renderer:has(a[href^="/shorts"])',
    'ytd-grid-video-renderer:has(a[href^="/shorts"])',
    'ytd-rich-item-renderer:has(a[href^="/shorts"])',
  ];

  // Simple selectors (no :has()) for querySelectorAll compatibility
  const SIMPLE_SELECTORS = [
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-reel-item-renderer',
    '.ytp-short-button',
    'button[aria-label="Shorts"]',
    'ytd-reel-player-overlay-renderer',
    'ytd-reel-video-renderer',
    'ytd-compact-reel-item-renderer',
    'ytd-shorts-renderer',
    'ytd-reel-watch-renderer',
    'reel-watch-sequence-renderer',
    'ytm-reel-shelf-renderer',
    'ytm-reel-item-renderer',
    'ytm-rich-shelf-renderer',
    'ytm-compact-reel-item-renderer',
    'ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]',
  ];

  function sweepDOM() {
    if (!enabled) return;
    let removed = 0;

    // Pass 1: Simple selectors
    SIMPLE_SELECTORS.forEach(function (sel) {
      try {
        document.querySelectorAll(sel).forEach(function (el) {
          // For overlay badges, remove the parent card
          if (sel.includes('overlay-style')) {
            const card = el.closest(
              'ytd-video-renderer, ytd-rich-item-renderer, ' +
              'ytd-grid-video-renderer, ytd-compact-video-renderer, ' +
              'ytd-lockup-view-model'
            );
            if (card) { card.remove(); removed++; return; }
          }
          // For shelf renderers, remove parent section
          if (sel === 'ytd-reel-shelf-renderer' || sel === 'ytd-rich-shelf-renderer[is-shorts]') {
            const section = el.closest('ytd-rich-section-renderer, ytd-item-section-renderer');
            if (section) { section.remove(); removed++; return; }
          }
          el.remove();
          removed++;
        });
      } catch (e) { /* selector not supported */ }
    });

    // Pass 2: Remove any element linking to /shorts
    document.querySelectorAll('a[href*="/shorts"], a[href*="/reel/"]').forEach(function (el) {
      const container = el.closest(
        'ytd-rich-item-renderer, ytd-grid-video-renderer, ' +
        'ytd-video-renderer, ytd-compact-video-renderer, ' +
        'ytd-playlist-video-renderer, ytd-notification-renderer, ' +
        'ytd-reel-item-renderer, ytd-reel-shelf-renderer, ' +
        'ytd-lockup-view-model, ytd-item-section-renderer'
      );
      if (container) { container.remove(); } else { el.remove(); }
      removed++;
    });

    // Pass 3: Remove shelves/sections with "Shorts" title text
    document.querySelectorAll(
      'ytd-rich-section-renderer, ytd-shelf-renderer, ' +
      'ytd-item-section-renderer, ytd-reel-shelf-renderer'
    ).forEach(function (el) {
      const title = el.querySelector('#title, .title, h2, h3, #text');
      if (title && /shorts/i.test(title.textContent)) {
        el.remove();
        removed++;
      }
    });

    // Pass 4: Remove Shorts tabs
    document.querySelectorAll('tp-yt-paper-tab, ytd-tab-renderer, ytd-channel-tab-renderer').forEach(function (el) {
      if (/shorts/i.test(el.textContent.trim())) {
        el.remove();
        removed++;
      }
    });

    // Pass 5: Remove guide entries
    document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach(function (el) {
      if (el.querySelector('a[href="/shorts"]') || /shorts/i.test(el.textContent)) {
        el.remove();
        removed++;
      }
    });

    // Pass 6: Remove pivot bar items (mobile)
    document.querySelectorAll('ytm-pivot-bar-item-renderer').forEach(function (el) {
      if (/shorts/i.test(el.textContent)) {
        el.remove();
        removed++;
      }
    });

    // Pass 7: Scan for any remaining shorts thumbnails by overlay icon
    document.querySelectorAll('ytd-thumbnail-overlay-time-status-renderer').forEach(function (el) {
      const style = el.getAttribute('overlay-style');
      const text = el.textContent.trim();
      if (style === 'SHORTS' || text === 'Shorts' || /^0:\d{2}$/.test(text) === false && /shorts/i.test(el.closest('a')?.href || '')) {
        const card = el.closest(
          'ytd-video-renderer, ytd-rich-item-renderer, ' +
          'ytd-grid-video-renderer, ytd-compact-video-renderer, ' +
          'ytd-lockup-view-model'
        );
        if (card) { card.remove(); removed++; }
      }
    });

    if (removed > 0) {
      blockCount += removed;
      saveBlockCount();
      log('DOM sweep removed', removed, 'elements');
    }
  }

  let sweepTimer = null;
  function scheduleSweep() {
    if (sweepTimer) clearTimeout(sweepTimer);
    sweepTimer = setTimeout(sweepDOM, 100);
    setTimeout(sweepDOM, 500);
    setTimeout(sweepDOM, 1500);
    setTimeout(sweepDOM, 3000);
  }

  /* ===================== LAYER 5: MUTATION OBSERVER ===================== */
  function startObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(function (mutations) {
      if (!enabled) return;
      const now = Date.now();
      if (now - lastSweep < CFG.THROTTLE_MS) return;

      let needsClean = false;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          const tag = (node.tagName || '').toLowerCase();
          const cls = String(node.className || '').toLowerCase();
          const html = node.innerHTML ? node.innerHTML.substring(0, 500).toLowerCase() : '';
          if (
            tag.includes('reel') || tag.includes('shorts') ||
            cls.includes('reel') || cls.includes('shorts') ||
            html.includes('/shorts/') || html.includes('reelwatchendpoint') ||
            html.includes('reelitemendpoint') || html.includes('shortslockup') ||
            html.includes('overlay-style="shorts"') ||
            (node.querySelector && node.querySelector('a[href*="/shorts"]'))
          ) {
            needsClean = true;
            break;
          }
        }
        if (needsClean) break;
      }

      if (needsClean) {
        lastSweep = now;
        sweepDOM();
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    log('MutationObserver active');
  }

  /* ===================== LAYER 6: PERIODIC SWEEP ===================== */
  function startPeriodicSweep() {
    setInterval(function () {
      if (enabled) sweepDOM();
    }, CFG.SWEEP_MS);
  }

  /* ===================== STORAGE ===================== */
  function saveBlockCount() {
    try { chrome.storage.local.set({ [CFG.COUNT_KEY]: blockCount }); } catch (e) {}
  }

  function loadState() {
    try {
      chrome.storage.local.get([CFG.ENABLED_KEY, CFG.COUNT_KEY], function (data) {
        enabled = data[CFG.ENABLED_KEY] !== false;
        blockCount = data[CFG.COUNT_KEY] || 0;
        if (enabled) init();
      });
    } catch (e) {
      init();
    }
  }

  try {
    chrome.storage.onChanged.addListener(function (changes) {
      if (changes[CFG.ENABLED_KEY]) {
        enabled = changes[CFG.ENABLED_KEY].newValue !== false;
        if (enabled) { sweepDOM(); startObserver(); }
        else if (observer) observer.disconnect();
      }
    });
  } catch (e) {}

  /* ===================== INIT ===================== */
  function init() {
    if (redirectIfShorts()) return;
    interceptAPI();
    interceptNavigation();
    sweepDOM();
    startObserver();
    startPeriodicSweep();
    log('All 6 layers active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadState);
  } else {
    loadState();
  }

})();
