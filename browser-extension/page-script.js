// YT-SHORTS-BLOCK v3.0 - Page Script (MAIN world)
(function () {
  'use strict';
  if (window.__ytShortsBlockPageScript) return;
  window.__ytShortsBlockPageScript = true;

  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('ytd-thumbnail') || e.target.closest('ytm-thumbnail') || e.target.closest('a[href*="/shorts/"]');
    if (!thumb) return;
    var isShorts = false;
    var link = thumb.closest('a') || thumb.querySelector('a');
    if (link && link.href && link.href.indexOf('/shorts/') !== -1) isShorts = true;
    if (!isShorts && thumb.__data) {
      var data = thumb.__data.data || thumb.__data;
      var nav = data.navigationEndpoint || data.onTap;
      if (nav) {
        var cmd = nav.commandMetadata && nav.commandMetadata.webCommandMetadata;
        if (cmd && cmd.webPageType === 'WEB_PAGE_TYPE_SHORTS') isShorts = true;
        if (cmd && cmd.url && cmd.url.indexOf('/shorts/') !== -1) isShorts = true;
        if (nav.reelWatchEndpoint) isShorts = true;
      }
    }
    if (!isShorts) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var videoId = null;
    var href = (link && link.href) || '';
    var um = href.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (um) videoId = um[1];
    if (!videoId && thumb.__data) {
      var d2 = thumb.__data.data || thumb.__data;
      var n2 = d2.navigationEndpoint || d2.onTap;
      if (n2) {
        if (n2.reelWatchEndpoint && n2.reelWatchEndpoint.videoId) videoId = n2.reelWatchEndpoint.videoId;
        var c2 = n2.commandMetadata && n2.commandMetadata.webCommandMetadata;
        if (!videoId && c2 && c2.url) { var m2 = c2.url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/); if (m2) videoId = m2[1]; }
      }
    }
    window.location.href = videoId ? '/watch?v=' + videoId : '/';
  }, true);

  document.addEventListener('yt-navigate-start', function (e) {
    var d = e.detail || {}, url = '';
    if (d.url) url = d.url;
    if (!url && d.endpoint) {
      var cmd = d.endpoint.commandMetadata && d.endpoint.commandMetadata.webCommandMetadata;
      if (cmd && cmd.url) url = cmd.url;
      if (d.endpoint.reelWatchEndpoint) {
        e.preventDefault(); e.stopImmediatePropagation();
        var vid = d.endpoint.reelWatchEndpoint.videoId;
        window.location.href = vid ? '/watch?v=' + vid : '/';
        return;
      }
    }
    if (/\/shorts\//.test(url) || /\/reel\//.test(url)) {
      e.preventDefault(); e.stopImmediatePropagation();
      var m = url.match(/\/(?:shorts|reel)\/([a-zA-Z0-9_-]{11})/);
      window.location.href = m ? '/watch?v=' + m[1] : '/';
    }
  }, true);

  var _pS = History.prototype.pushState, _rS = History.prototype.replaceState;
  History.prototype.pushState = function (s, t, u) {
    if (u && typeof u === 'string' && /\/shorts\//.test(u)) { var m = u.match(/\/shorts\/([a-zA-Z0-9_-]{11})/); u = m ? '/watch?v=' + m[1] : '/'; }
    return _pS.call(this, s, t, u);
  };
  History.prototype.replaceState = function (s, t, u) {
    if (u && typeof u === 'string' && /\/shorts\//.test(u)) { var m = u.match(/\/shorts\/([a-zA-Z0-9_-]{11})/); u = m ? '/watch?v=' + m[1] : '/'; }
    return _rS.call(this, s, t, u);
  };

  (function () {
    var p = window.location.pathname;
    if (/^\/shorts\//.test(p) || /^\/reel\//.test(p)) {
      var m = p.match(/\/(?:shorts|reel)\/([a-zA-Z0-9_-]{11})/);
      window.location.replace(m ? '/watch?v=' + m[1] : '/');
    }
  })();
})();
