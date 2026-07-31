<div align="center">

# 🤝 Contributing to YT-Shorts-Block

**Thank you for wanting to make the internet a less distracting place!**

</div>

---

## 🌟 Ways to Contribute

| Type | How |
|------|-----|
| 🐛 **Bug Report** | [Open an issue](https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues/new?template=bug_report.md) |
| 💡 **Feature Request** | [Open an issue](https://github.com/ShoumikBalaSomu/YT-shorts-Block/issues/new?template=feature_request.md) |
| 🔧 **Code Fix** | Fork → Branch → PR |
| 📋 **Filter Update** | Found a new Shorts element? Tell us! |
| 📖 **Docs** | Improve README, guides, translations |
| 🌍 **Translations** | Help us reach more languages |

---

## 🔧 Development Setup

### Prerequisites
- Git
- A modern browser (Chrome, Firefox, Edge, Brave)
- Text editor (VS Code recommended)

### Getting Started

    git clone https://github.com/ShoumikBalaSomu/YT-shorts-Block.git
    cd YT-shorts-Block

### Branch Naming Convention

    git checkout -b fix/shorts-shelf-bypass
    git checkout -b feature/firefox-support
    git checkout -b docs/readme-update

### Commit Message Format

    <type>: <description>

    Types: fix, feat, docs, style, refactor, test, chore

    Examples:
    fix: block shorts tab in new YouTube layout
    feat: add Safari extension support
    docs: update installation guide for Android 15

---

## 📋 Pull Request Process

1. **Fork** the repository
2. **Create** a feature/fix branch
3. **Make** your changes
4. **Test** thoroughly:
   - Load the extension in Chrome AND Firefox
   - Visit youtube.com homepage, search, subscriptions, channel pages
   - Try direct URL: youtube.com/shorts/VIDEO_ID
   - Check mobile YouTube (m.youtube.com)
5. **Commit** with clear messages
6. **Push** and open a Pull Request
7. **Describe** what you changed and why

---

## 🧪 Testing Checklist

Before submitting a PR, verify:

- [ ] Shorts shelf is hidden on homepage
- [ ] Shorts tab is removed from navigation
- [ ] youtube.com/shorts/* redirects to homepage
- [ ] Shorts don't appear in search results
- [ ] Shorts don't appear in subscription feed
- [ ] Extension popup toggle works
- [ ] No console errors
- [ ] No performance degradation
- [ ] Filter list syntax is valid (test in uBlock Origin)

---

## 📐 Code Style

- **JavaScript:** ES6+, no external dependencies
- **CSS:** BEM-like naming, no !important unless necessary
- **Filter lists:** One rule per line, group by category with comments
- **Shell scripts:** POSIX-compatible where possible
- **Comments:** Explain WHY, not WHAT

---

## ⚖️ Code of Conduct

- Be respectful and constructive
- No harassment, trolling, or personal attacks
- Focus on the project, not the person
- Assume good intent
- Report issues to the maintainer

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

<div align="center">

**Every contribution matters. Thank you! 🙏**

</div>
