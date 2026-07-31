<div align="center">

# 🚫 YT-Shorts-Block

### **Reclaim Your Time. Reclaim Your Focus. Block YouTube Shorts Forever.**

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&logo=opensourceinitiative)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS%20%7C%20Android-lightgrey?style=for-the-badge)
![Browser](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox%20%7C%20Brave%20%7C%20Edge-orange?style=for-the-badge)
![uBlock](https://img.shields.io/badge/Compatible-uBlock%20Origin%20%7C%20Brave%20Shields-green?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/ShoumikBalaSomu/YT-shorts-Block?style=for-the-badge&logo=github)
![Last Commit](https://img.shields.io/github/last-commit/ShoumikBalaSomu/YT-shorts-Block?style=for-the-badge&logo=github)

**The most comprehensive, multi-layered YouTube Shorts blocker ever created.**

[🚀 Quick Start](#-quick-start) • [📋 Filter Lists](#-filter-lists) • [🧩 Browser Extension](#-browser-extension) • [🖥️ Desktop Apps](#-desktop--mobile) • [📖 Full Docs](https://shoumikbalasomu.github.io/YT-shorts-Block/)

</div>

---

## 🎯 Why This Project?

YouTube Shorts are **engineered to be addictive**. They hijack your dopamine system, destroy your attention span, and steal **hours** of your life every single day. YouTube provides **no built-in way** to permanently disable them.

**YT-Shorts-Block** is your **nuclear option**. It blocks Shorts at **every possible layer**:

| Layer | Method | Bypass-Proof? |
|-------|--------|:---:|
| 🌐 **Network/DNS** | Hosts file + DNS blocking | ✅ |
| 🔀 **URL Routing** | Redirect all /shorts/ URLs | ✅ |
| 🎨 **DOM/Visual** | Hide every Shorts element via CSS | ✅ |
| 🧩 **Extension** | Manifest V3 browser extension | ✅ |
| 🛡️ **Filter List** | uBlock Origin / Brave compatible | ✅ |
| 📱 **Mobile** | Android DNS + browser config | ✅ |

> **Result:** Even if one layer fails, the others catch it. **Zero Shorts. Zero temptation.**

---

## 🚀 Quick Start

### Option A: uBlock Origin / Brave Shields (30 seconds)

1. Open **uBlock Origin** → Dashboard → **Filter lists** tab
2. Click **"Import"** at the bottom
3. Paste this URL:

    https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/filter-lists/yt-shorts-ublock.txt

4. Click **"Apply changes"** ✅
5. **Done.** Refresh YouTube. Shorts are gone.

### Option B: Browser Extension (Full Protection)

See [🧩 Browser Extension](#-browser-extension) below.

### Option C: Nuclear Option (All Layers)

Follow the [Full Installation Guide](https://shoumikbalasomu.github.io/YT-shorts-Block/) on our GitHub Pages site.

---

## 📋 Filter Lists

We provide **three filter lists** for maximum compatibility:

| File | Best For | URL |
|------|----------|-----|
| yt-shorts-ublock.txt | uBlock Origin (Chrome/Firefox/Edge) | [Raw Link](https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/filter-lists/yt-shorts-ublock.txt) |
| yt-shorts-brave.txt | Brave Browser Shields | [Raw Link](https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/filter-lists/yt-shorts-brave.txt) |
| yt-shorts-combined.txt | Universal / Pi-hole / AdGuard | [Raw Link](https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/filter-lists/yt-shorts-combined.txt) |

### What These Lists Block:

- ✅ youtube.com/shorts/* — All Shorts URLs
- ✅ Shorts shelf/carousel on homepage
- ✅ Shorts tab in navigation bar
- ✅ Shorts buttons in video player
- ✅ Shorts in search results
- ✅ Shorts in subscriptions feed
- ✅ Shorts in channel pages
- ✅ Shorts notifications
- ✅ Shorts in "Up Next" / recommendations
- ✅ youtubei.googleapis.com Shorts API calls
- ✅ Shorts-related tracking pixels
- ✅ ytshorts internal identifiers

---

## 🧩 Browser Extension

A **Manifest V3** extension for Chrome, Firefox, Edge, Brave, and Opera.

### Features:
- 🔴 Blocks all /shorts/ URL navigation (redirects to homepage)
- 🎨 Injects CSS to hide every Shorts DOM element
- 🔄 Runs on every YouTube page load + SPA navigation
- ⚡ Zero performance impact (< 1ms per page)
- 🔒 No data collection. No tracking. No external requests.
- 🎛️ Popup toggle to enable/disable instantly

### Install (Developer Mode):

    git clone https://github.com/ShoumikBalaSomu/YT-shorts-Block.git
    cd YT-shorts-Block

**Chrome/Edge/Brave:**
1. Go to chrome://extensions/
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the browser-extension/ folder

**Firefox:**
1. Go to about:debugging#/runtime/this-firefox
2. Click "Load Temporary Add-on"
3. Select browser-extension/manifest.json

---

## 🖥️ Desktop & Mobile

### 🪟 Windows
Run the automated installer (Admin PowerShell):

    .\scripts\install-windows.ps1

Adds Shorts domains to C:\Windows\System32\drivers\etc\hosts

### 🐧 Linux (All Distros)

    chmod +x scripts/install-linux.sh
    sudo ./scripts/install-linux.sh

Adds entries to /etc/hosts + optional dnsmasq config

### 🍎 macOS

    sudo ./scripts/install-linux.sh

### 📱 Android
1. Go to Settings → Network → Private DNS
2. Or use AdGuard / DNS66
3. Import filter-lists/yt-shorts-combined.txt as a custom filter

### 🍏 iOS
1. Install AdGuard from App Store
2. Settings → Content Blocking → Custom Filters
3. Add the combined filter list URL

---

## 🏗️ Project Structure

    YT-shorts-Block/
    ├── README.md
    ├── LICENSE
    ├── CONTRIBUTING.md
    ├── filter-lists/
    │   ├── yt-shorts-ublock.txt
    │   ├── yt-shorts-brave.txt
    │   └── yt-shorts-combined.txt
    ├── browser-extension/
    │   ├── manifest.json
    │   ├── content.js
    │   ├── background.js
    │   ├── popup.html
    │   ├── popup.css
    │   └── popup.js
    ├── hosts/
    │   └── yt-shorts-hosts.txt
    ├── scripts/
    │   ├── install-linux.sh
    │   └── install-windows.ps1
    ├── docs/
    │   └── index.html
    └── .github/
        └── ISSUE_TEMPLATE/
            ├── bug_report.md
            └── feature_request.md

---

## 🔒 Security & Privacy

- **Zero data collection.** This project does not phone home. Ever.
- **No external dependencies** in the browser extension.
- **No obfuscated code.** Every line is readable and auditable.
- **Filter lists are plaintext.** You can read exactly what is blocked.
- **MIT Licensed.** Fork it, audit it, modify it.

---

## ⚖️ Legal Disclaimer

This project is a **personal content-filtering tool**. It:
- Does **not** hack, crack, or modify YouTube's servers
- Does **not** circumvent DRM or access controls
- Does **not** violate the Computer Fraud and Abuse Act (CFAA)
- Operates **entirely client-side** on your own device
- Is analogous to ad-blockers, which are **legal worldwide**
- Falls under **user-agent customization** rights

> YouTube Shorts are a UI feature. Hiding UI elements on your own browser is your right.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. PRs welcome!

## 📄 License

[MIT License](LICENSE) — Free for personal and commercial use.

---

## 💬 Feedback

Found a bypass? Have an idea?

- 🐛 [Report a Bug](https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues/new?template=feature_request.md)

---

<div align="center">

**Made with ❤️ for everyone who wants their time back.**

⭐ **Star this repo if it helped you!** ⭐

</div>
