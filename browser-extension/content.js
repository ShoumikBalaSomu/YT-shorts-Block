/**
 * YT-Shorts-Block - Content Script
 * Blocks YouTube Shorts at the DOM level
 * Handles SPA navigation, MutationObserver, and URL interception
 * 
 * @author ShoumikBalaSomu
 * @license MIT
 */

(function () {
  'use strict';

  // ==================== CONFIG ====================
  const CONFIG = {
    ENABLED_KEY: 'ytShortsBlockEnabled',
    BLOCK_COUNT_KEY: 'ytShortsBlockCount',
    OBSERVER_THROTTLE_MS: 100,
    MAX_RETRIES: 50,
  };

  let isEnabled = true;
  let blockCount = 0;
  let observer = null;
  let lastProcessTime = 0;

  // ==================== CSS SELECTORS ====================
  // Every known Shorts element selector
  const SHORTS_SELECTORS = [
    // Homepage shelf
    'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer',
    // Navigation
    'ytd-guide-entry-renderer:has(a[href="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
    'a[href="/shorts"]',
    'tp-yt-paper-item:has(a[href="/shorts"])',
    // Search
    'ytd-reel-item-renderer',
    // Player
    '.ytp-short-button',
    'button[aria-label="Shorts"]',
    'ytd-reel-player-overlay-renderer',
    'ytd-reel-video-renderer',
    // Recommendations
    'ytd-compact-reel-item-renderer',
    // Channel tabs
    'ytd-channel-tab-renderer:has-text(Shorts)',
    // Mobile
    'ytm-reel-shelf-renderer',
    'ytm-reel-item-renderer',
    'ytm-pivot-bar-item-renderer:has-text(Shorts)',
    'ytm-rich-shelf-renderer',
    'ytm-compact-reel-item-renderer',
  ];

  // Simple selectors that don't use :has() (for querySelectorAll)
  const SIMPLE_SELECTORS = [
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer',
    'ytd-reel-item-renderer',
    '.ytp-short-button',
    'ytd-reel-player-overlay-renderer',
    'ytd-reel-video-renderer',
    'ytd-compact-reel-item-renderer',
    'ytm-reel-shelf-renderer',
    'ytm-reel-item-renderer',
    'ytm-rich-shelf-renderer',
    'ytm-compact-reel-item-renderer',
  ];

  // ==================== URL BLOCKING ====================
  function isShortsURL(url) {
    try {
      const u = new URL(url);
      const path = u.pathname.toLowerCase();
      return (
        path === '/shorts' ||
        path.startsWith('/shorts/') ||
        path.includes('/shorts/embed')
      );
    } catch {
      return false;
    }
  }

  function redirectIfShorts() {
    if (!isEnabled) return;
    if (isShortsURL(window.location.href)) {
      blockCount++;
      saveBlockCount();
      // Redirect to YouTube homepage
      window.location.replace('https://www.youtube.com/');
      return true;
    }
    return false;
  }

  // Intercept navigation before it happens
  function interceptNavigation() {
    // Override history.pushState and replaceState
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function (...args) {
      if (isEnabled && args[2] && isShortsURL(new URL(args[2], window.location.origin).href)) {
        blockCount++;
        saveBlockCount();
        args[2] = '/';
      }
      return origPush.apply(this, args);
    };

    history.replaceState = function (...args) {
      if (isEnabled && args[2] && isShortsURL(new URL(args[2], window.location.origin).href)) {
        blockCount++;
        saveBlockCount();
        args[2] = '/';
      }
      return origReplace.apply(this, args);
    };

    // Intercept clicks on Shorts links
    document.addEventListener('click', function (e) {
      if (!isEnabled) return;
      const link = e.target.closest('a[href*="/shorts"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        blockCount++;
        saveBlockCount();
        window.location.href = 'https://www.youtube.com/';
      }
    }, true);
  }

  // ==================== DOM CLEANING ====================
  function removeShortsElements() {
    if (!isEnabled) return;

    let removed = 0;

    // Method 1: Remove by simple selectors
    SIMPLE_SELECTORS.forEach(function (selector) {
      try {
        document.querySelectorAll(selector).forEach(function (el) {
          el.remove();
          removed++;
        });
      } catch (e) { /* selector not supported, skip */ }
    });

    // Method 2: Remove any element with href containing /shorts
    document.querySelectorAll('a[href*="/shorts"]').forEach(function (el) {
      // Walk up to the container
      let container = el.closest(
        'ytd-rich-item-renderer, ytd-grid-video-renderer, ' +
        'ytd-video-renderer, ytd-compact-video-renderer, ' +
        'ytd-playlist-video-renderer, ytd-notification-renderer, ' +
        'ytd-reel-item-renderer, ytd-reel-shelf-renderer'
      );
      if (container) {
        container.remove();
      } else {
        el.remove();
      }
      removed++;
    });

    // Method 3: Remove Shorts shelf by checking text content
    document.querySelectorAll('ytd-rich-section-renderer, ytd-shelf-renderer').forEach(function (el) {
      const title = el.querySelector('#title, .title, h2, h3');
      if (title && /shorts/i.test(title.textContent)) {
        el.remove();
        removed++;
      }
    });

    // Method 4: Remove Shorts tab from channel pages
    document.querySelectorAll('tp-yt-paper-tab, ytd-tab-renderer').forEach(function (el) {
      if (/shorts/i.test(el.textContent.trim())) {
        el.remove();
        removed++;
      }
    });

    // Method 5: Remove guide entries with Shorts
    document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach(function (el) {
      const link = el.querySelector('a[href="/shorts"]');
      const text = el.textContent;
      if (link || /shorts/i.test(text)) {
        el.remove();
        removed++;
      }
    });

    if (removed > 0) {
      blockCount += removed;
      saveBlockCount();
    }
  }

  // ==================== MUTATION OBSERVER ====================
  function startObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(function (mutations) {
      const now = Date.now();
      if (now - lastProcessTime < CONFIG.OBSERVER_THROTTLE_MS) return;
      lastProcessTime = now;

      // Check if any mutation added Shorts-related nodes
      let needsClean = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const tag = node.tagName ? node.tagName.toLowerCase() : '';
            const cls = node.className ? String(node.className).toLowerCase() : '';
            if (
              tag.includes('reel') || tag.includes('shorts') ||
              cls.includes('reel') || cls.includes('shorts') ||
              (node.querySelector && node.querySelector('a[href*="/shorts"]'))
            ) {
              needsClean = true;
              break;
            }
          }
        }
        if (needsClean) break;
      }

      if (needsClean) {
        removeShortsElements();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // ==================== SPA NAVIGATION MONITOR ====================
  function monitorSPANavigation() {
    // YouTube uses yt-navigate-finish event for SPA navigation
    document.addEventListener('yt-navigate-finish', function () {
      if (redirectIfShorts()) return;
      setTimeout(removeShortsElements, 100);
      setTimeout(removeShortsElements, 500);
      setTimeout(removeShortsElements, 1500);
    });

    // Also listen for popstate (back/forward)
    window.addEventListener('popstate', function () {
      setTimeout(function () {
        if (redirectIfShorts()) return;
        removeShortsElements();
      }, 100);
    });
  }

  // ==================== STORAGE ====================
  function saveBlockCount() {
    try {
      chrome.storage.local.set({ [CONFIG.BLOCK_COUNT_KEY]: blockCount });
    } catch (e) { /* storage not available */ }
  }

  function loadState() {
    try {
      chrome.storage.local.get([CONFIG.ENABLED_KEY, CONFIG.BLOCK_COUNT_KEY], function (data) {
        isEnabled = data[CONFIG.ENABLED_KEY] !== false;
        blockCount = data[CONFIG.BLOCK_COUNT_KEY] || 0;
        if (isEnabled) {
          init();
        }
      });
    } catch (e) {
      // If storage API not available, just enable
      init();
    }
  }

  // Listen for toggle changes from popup
  try {
    chrome.storage.onChanged.addListener(function (changes) {
      if (changes[CONFIG.ENABLED_KEY]) {
        isEnabled = changes[CONFIG.ENABLED_KEY].newValue !== false;
        if (isEnabled) {
          removeShortsElements();
          startObserver();
        } else if (observer) {
          observer.disconnect();
        }
      }
    });
  } catch (e) { /* not in extension context */ }

  // ==================== INIT ====================
  function init() {
    if (redirectIfShorts()) return;
    interceptNavigation();
    removeShortsElements();
    startObserver();
    monitorSPANavigation();

    // Periodic cleanup as backup
    setInterval(function () {
      if (isEnabled) removeShortsElements();
    }, 3000);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadState);
  } else {
    loadState();
  }

})();
