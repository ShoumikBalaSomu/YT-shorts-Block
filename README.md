<div align="center">

# YT-Shorts-Block

### The Nuclear-Grade YouTube Shorts Eliminator

*Reclaim your focus. Destroy the doom-scroll. Take back your time.*

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.0.0-orange?style=for-the-badge)](https://github.com/ShoumikBalaSomu/YT-shorts-Block/releases)
[![uBlock](https://img.shields.io/badge/uBlock-Origin-8000FF?style=for-the-badge&logo=ublock-origin)](https://github.com/gorhill/uBlock)
[![Brave](https://img.shields.io/badge/Brave-Shields-FB542B?style=for-the-badge&logo=brave)](https://brave.com)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=google-chrome)](https://www.google.com/chrome/)
[![Firefox](https://img.shields.io/badge/Firefox-Compatible-FF7139?style=for-the-badge&logo=firefox)](https://www.mozilla.org/firefox/)

**[Quick Install](#quick-install)** | **[Browser Extension](#browser-extension-features)** | **[Filter Lists](#filter-lists)** | **[Report Issue](https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues)**

</div>

---

## What Is This?

**YT-Shorts-Block** completely eliminates YouTube Shorts from your browsing experience.
Not just hiding them -- **annihilating** them at 6 different layers of protection.

### What Gets Blocked

| Location | Status |
|----------|--------|
| Search Results -- Shorts disguised as regular videos | BLOCKED |
| Homepage Feed -- Shorts shelf and recommendations | BLOCKED |
| Video Sidebar -- Up Next shorts suggestions | BLOCKED |
| Sidebar Navigation -- Shorts button | BLOCKED |
| Channel Pages -- Shorts tab | BLOCKED |
| Notifications -- Shorts notifications | BLOCKED |
| Direct URLs -- youtube.com/shorts/* | REDIRECTED |
| API Calls -- Shorts data from YouTube servers | BLOCKED |
| Mobile Web -- All mobile shorts elements | BLOCKED |

---

## 6-Layer Protection System

Layer 1: URL REDIRECT (declarativeNetRequest) - Catches youtube.com/shorts/* at network level  
Layer 2: SPA NAVIGATION BLOCK (MAIN world script) - Intercepts pushState, click events, yt-navigate  
Layer 3: DOM REMOVAL (content.js) - 40+ CSS selectors + XPath section removal  
Layer 4: CSS SHIELD (content.css) - Instant hiding at document_start (zero flash)  
Layer 5: MUTATION OBSERVER - Watches for dynamically injected shorts  
Layer 6: API BLOCK (network rules) - Blocks youtubei.googleapis.com/reel/* and /shorts  

---

## Quick Install

### Option 1: uBlock Origin / Brave (30 seconds)

1. Install uBlock Origin
2. Open uBlock -> Dashboard -> Filter Lists -> Scroll to bottom
3. Under Import, paste this URL:

`https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/filter-lists/yt-shorts-ublock.txt`

4. Click Apply Changes

For Brave: Settings -> Shields -> Content Filtering -> Add custom list -> Paste URL above

### Option 2: Browser Extension (Maximum Protection)

1. Download/clone this repo
2. Open chrome://extensions/
3. Enable Developer Mode
4. Click Load Unpacked -> Select the browser-extension/ folder
5. All 6 protection layers activate automatically

---

## Browser Extension Features

- Beautiful dark-theme popup with live stats
- Shorts removed counter + time saved estimator
- One-click toggle to enable/disable protection
- Zero data collection
- Manifest V3

---

## Filter Lists

| List | File | Best For |
|------|------|----------|
| uBlock Origin | filter-lists/yt-shorts-ublock.txt | uBlock Origin, AdGuard |
| Brave Shields | filter-lists/yt-shorts-brave.txt | Brave browser |
| Universal | filter-lists/yt-shorts-combined.txt | Pi-hole, NextDNS |

---

## Security and Privacy

- Zero data collection -- no analytics, no tracking
- No obfuscated code -- fully auditable
- No dependencies -- self-contained
- Client-side only -- nothing touches YouTube servers
- MIT License -- fork, audit, modify freely

---

## Legal

Content filtering tool operating on the user own device.
Analogous to ad-blockers. Does NOT circumvent DRM or access controls.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Found a bypass? [Open an issue!](https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues)

---

## License

[MIT License](LICENSE)

---

<div align="center">

**Made by [ShoumikBalaSomu](https://github.com/ShoumikBalaSomu)**

*If this saved your sanity, drop a star on the repo!*

</div>