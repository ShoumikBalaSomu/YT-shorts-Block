#!/usr/bin/env bash
# ============================================================
# YT-Shorts-Block - Linux/macOS Installer
# Author: ShoumikBalaSomu
# License: MIT
# Usage: sudo ./install-linux.sh
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

BANNER() {
    echo -e "${RED}"
    echo "  ╔══════════════════════════════════════════╗"
    echo "  ║       🚫 YT-Shorts-Block Installer      ║"
    echo "  ║     Block YouTube Shorts on Linux/macOS  ║"
    echo "  ╚══════════════════════════════════════════╝"
    echo -e "${NC}"
}

CHECK_ROOT() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}[ERROR]${NC} This script must be run as root (use sudo)"
        exit 1
    fi
}

DETECT_OS() {
    if [[ "$(uname)" == "Darwin" ]]; then
        OS="macos"
        HOSTS_FILE="/etc/hosts"
    elif [[ "$(uname)" == "Linux" ]]; then
        OS="linux"
        HOSTS_FILE="/etc/hosts"
    else
        echo -e "${RED}[ERROR]${NC} Unsupported OS"
        exit 1
    fi
    echo -e "${BLUE}[INFO]${NC} Detected OS: ${CYAN}${OS}${NC}"
}

BACKUP_HOSTS() {
    local backup="${HOSTS_FILE}.backup.ytshorts.$(date +%Y%m%d%H%M%S)"
    cp "$HOSTS_FILE" "$backup"
    echo -e "${GREEN}[OK]${NC} Hosts file backed up to: ${backup}"
}

INSTALL_HOSTS() {
    echo -e "${YELLOW}[STEP]${NC} Adding YT-Shorts-Block entries to ${HOSTS_FILE}..."

    # Remove old entries if they exist
    sed -i.bak '/# YT-Shorts-Block/d' "$HOSTS_FILE" 2>/dev/null || true
    sed -i.bak '/youtube-shortslens/d' "$HOSTS_FILE" 2>/dev/null || true

    # Add new entries
    cat >> "$HOSTS_FILE" << 'HOSTS_EOF'

# YT-Shorts-Block - YouTube Shorts Blocker
# https://github.com/ShoumikBalaSomu/YT-shorts-Block
# Added: $(date)
0.0.0.0 youtube-shortslens.googleapis.com
# YT-Shorts-Block END

HOSTS_EOF

    echo -e "${GREEN}[OK]${NC} Hosts entries added"
}

FLUSH_DNS() {
    echo -e "${YELLOW}[STEP]${NC} Flushing DNS cache..."
    if [[ "$OS" == "macos" ]]; then
        dscacheutil -flushcache 2>/dev/null || true
        killall -HUP mDNSResponder 2>/dev/null || true
    else
        systemd-resolve --flush-caches 2>/dev/null || true
        systemctl restart systemd-resolved 2>/dev/null || true
    fi
    echo -e "${GREEN}[OK]${NC} DNS cache flushed"
}

INSTALL_UBLOCK_HINT() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  📋 FOR FULL PROTECTION, ALSO ADD THIS TO       ║${NC}"
    echo -e "${CYAN}║     uBlock Origin / Brave Shields:              ║${NC}"
    echo -e "${CYAN}║                                                 ║${NC}"
    echo -e "${CYAN}║  https://raw.githubusercontent.com/             ║${NC}"
    echo -e "${CYAN}║  ShoumikBalaSomu/YT-shorts-Block/main/          ║${NC}"
    echo -e "${CYAN}║  filter-lists/yt-shorts-ublock.txt              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
}

UNINSTALL() {
    echo -e "${YELLOW}[STEP]${NC} Removing YT-Shorts-Block entries..."
    sed -i.bak '/# YT-Shorts-Block/d' "$HOSTS_FILE" 2>/dev/null || true
    sed -i.bak '/youtube-shortslens/d' "$HOSTS_FILE" 2>/dev/null || true
    FLUSH_DNS
    echo -e "${GREEN}[OK]${NC} Uninstalled successfully"
    exit 0
}

# Main
BANNER
CHECK_ROOT
DETECT_OS

if [[ "${1:-}" == "--uninstall" ]]; then
    UNINSTALL
fi

BACKUP_HOSTS
INSTALL_HOSTS
FLUSH_DNS
INSTALL_UBLOCK_HINT

echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ YT-Shorts-Block installed!          ║${NC}"
echo -e "${GREEN}║  YouTube Shorts are now blocked.         ║${NC}"
echo -e "${GREEN}║  Run with --uninstall to remove.         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
