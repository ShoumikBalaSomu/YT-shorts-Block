# 🚫 Ultimate YouTube Shorts Blocklist

> **The most advanced YouTube Shorts blocker ever made.** Blocks ALL Shorts access methods, UI elements, API calls, redirects, and bypass attempts. **No bypass possible.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-uBlock%20Origin%20%7C%20Brave%20%7C%20AdGuard-blue)]()
[![Rules](https://img.shields.io/badge/Rules-85%2B-red)]()
[![Last Updated](https://img.shields.io/badge/Updated-2026--07--31-green)]()

---

## 🎯 What This Blocks

| Category | Details |
|----------|--------|
| 🌐 **URL Blocking** | `/shorts/*`, mobile, channel tabs, `?feature=shorts`, redirects, embeds, YT Music, YT Kids |
| 🎨 **Element Hiding** | Homepage shelf, nav tab, search results, sidebar, player overlay, create button, mobile UI |
| 💉 **Script Injection** | JSON pruning for Shorts data in page payload (10+ scriptlet rules) |
| 🔒 **Bypass Prevention** | Redirect chains, embedded shorts, `@channel/shorts`, `youtu.be/shorts`, TV interface |
| 📡 **API Blocking** | `reel_item_watch`, `reel_watch_sequence`, `reelShelfRenderer`, `shortsLockupViewModel` |

## 📦 Installation

### uBlock Origin (Recommended)
1. Open uBlock Origin Dashboard → **Filter lists** tab
2. Scroll to bottom → Click **Import**
3. Paste this URL:
```
https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/yt-shorts-block.txt
```
4. Click **Apply changes** ✅

### Brave Browser
1. Go to `brave://settings/shields/filters`
2. Paste the URL above
3. Click **Apply** ✅

### AdGuard
1. Open AdGuard → **Filters** → **Custom**
2. Click **Add custom filter**
3. Paste the URL above ✅

### Pi-hole / Network Level
Add to your blocklist:
```
youtube.com/shorts
m.youtube.com/shorts
youtube.com/youtubei/v1/reel
```

## 🛡️ Bypass Prevention

This blocklist prevents ALL known bypass methods:

- ❌ Direct URL: `youtube.com/shorts/VIDEO_ID`
- ❌ Mobile URL: `m.youtube.com/shorts/VIDEO_ID`
- ❌ Channel tab: `youtube.com/@Channel/shorts`
- ❌ Search results containing Shorts
- ❌ Homepage Shorts shelf
- ❌ Sidebar recommendations
- ❌ Player overlay / end screen
- ❌ `?feature=shorts` parameter
- ❌ `youtu.be/shorts/` redirects
- ❌ Embedded Shorts
- ❌ YouTube TV interface
- ❌ YouTube Music Shorts
- ❌ YouTube Kids Shorts
- ❌ API-level Shorts data injection
- ❌ JSON payload Shorts rendering

## 📊 Stats

- **85+ filtering rules**
- **30 network/URL blocking rules**
- **36 element hiding rules**
- **14 scriptlet injection rules**
- **5 platform-specific overrides**
- **Updated: July 31, 2026**

## 🤝 Contributing

Found a bypass? Open an [Issue](https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues) or submit a [Pull Request](https://github.com/ShoumikBalaSomu/YT-shorts-Block/pulls).

## 📄 License

[MIT License](LICENSE) © 2026 ShoumikBalaSomu

---

⭐ **Star this repo if it helped you!**
