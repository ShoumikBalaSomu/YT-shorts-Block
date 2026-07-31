# 🚫 Ultimate YouTube Shorts Blocker (v3.0)

The most advanced, comprehensive filter list designed to completely block YouTube Shorts across all platforms. This list prevents bypasses, blocks background API calls, hides all Shorts-related UI elements, and removes Shorts from search results.

## ✨ Features
- **Blocks Direct URLs**: Prevents access to `youtube.com/shorts/*` at the network level.
- **Search Result Protection**: Removes Shorts from search results using advanced CSS selectors and API pruning.
- **Hides UI Elements**: Removes Shorts tabs, shelves, badges, and search results on both Desktop and Mobile.
- **API Blocking**: Stops YouTube from loading Shorts data in the background, saving bandwidth and preventing algorithmic recommendations.
- **Anti-Bypass Scriptlets**: Uses uBlock Origin scriptlets (`##+js`) to disable YouTube's internal experiment flags that force Shorts player.
- **Cross-Platform**: Compatible with uBlock Origin, AdGuard, and Brave Shields.

## 📦 Installation

### uBlock Origin (Recommended)
1. Open uBlock Origin Dashboard (click the extension icon, then the gears ⚙️ icon).
2. Go to the **Filter lists** tab.
3. Scroll down to **Custom** and click **Import**.
4. Paste the following URL:  
   `https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/blocklist.txt`
5. Click **Apply changes**.

### Brave Browser
1. Open Brave Settings and navigate to `brave://settings/shields/filters`.
2. Scroll down to **Custom filters**.
3. Click **Add custom filter list**.
4. Enter a name (e.g., "YT Shorts Blocker") and the URL:  
   `https://raw.githubusercontent.com/ShoumikBalaSomu/YT-shorts-Block/main/blocklist.txt`
5. Click **Save**.

### AdGuard
1. Open AdGuard Settings.
2. Go to **Content Blocking** > **Custom filtering rules**.
3. Add the raw URL above, or paste the contents of `blocklist.txt` directly.

## 🌐 GitHub Pages
A simple landing page is available at: [https://shoumikbalasomu.github.io/YT-shorts-Block/](https://shoumikbalasomu.github.io/YT-shorts-Block/)

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
