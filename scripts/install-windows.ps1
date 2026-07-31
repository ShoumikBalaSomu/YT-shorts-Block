# ============================================================
# YT-Shorts-Block - Windows Installer
# Author: ShoumikBalaSomu
# License: MIT
# Usage: Run as Administrator in PowerShell
#        .\install-windows.ps1
# ============================================================

#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

function Write-Banner {
    Write-Host ""
    Write-Host "  ======================================" -ForegroundColor Red
    Write-Host "    YT-Shorts-Block Windows Installer" -ForegroundColor Red
    Write-Host "    Block YouTube Shorts on Windows" -ForegroundColor Red
    Write-Host "  ======================================" -ForegroundColor Red
    Write-Host ""
}

function Install-ShortsBlock {
    Write-Banner

    $hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    $backupPath = "$hostsPath.backup.ytshorts.$(Get-Date -Format 'yyyyMMddHHmmss')"

    # Backup
    Write-Host "[STEP] Backing up hosts file..." -ForegroundColor Yellow
    Copy-Item -Path $hostsPath -Destination $backupPath -Force
    Write-Host "[OK] Backup saved to: $backupPath" -ForegroundColor Green

    # Remove old entries
    Write-Host "[STEP] Cleaning old entries..." -ForegroundColor Yellow
    $content = Get-Content $hostsPath -Raw
    $content = $content -replace '(?m)^.*YT-Shorts-Block.*\r?\n?', ''
    $content = $content -replace '(?m)^.*youtube-shortslens.*\r?\n?', ''

    # Add new entries
    Write-Host "[STEP] Adding YT-Shorts-Block entries..." -ForegroundColor Yellow
    $newEntries = @"

# YT-Shorts-Block - YouTube Shorts Blocker
# https://github.com/ShoumikBalaSomu/YT-shorts-Block
0.0.0.0 youtube-shortslens.googleapis.com
# YT-Shorts-Block END

"@

    $content += $newEntries
    Set-Content -Path $hostsPath -Value $content -Force

    Write-Host "[OK] Hosts entries added" -ForegroundColor Green

    # Flush DNS
    Write-Host "[STEP] Flushing DNS cache..." -ForegroundColor Yellow
    ipconfig /flushdns | Out-Null
    Write-Host "[OK] DNS cache flushed" -ForegroundColor Green

    # Instructions
    Write-Host ""
    Write-Host "  ==============================================" -ForegroundColor Cyan
    Write-Host "  FOR FULL PROTECTION, add this URL to" -ForegroundColor Cyan
    Write-Host "  uBlock Origin or Brave Shields:" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor Cyan
    Write-Host "  https://raw.githubusercontent.com/" -ForegroundColor White
    Write-Host "  ShoumikBalaSomu/YT-shorts-Block/main/" -ForegroundColor White
    Write-Host "  filter-lists/yt-shorts-ublock.txt" -ForegroundColor White
    Write-Host "  ==============================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "  YT-Shorts-Block installed successfully!" -ForegroundColor Green
    Write-Host "  Run .\install-windows.ps1 -Uninstall to remove." -ForegroundColor Gray
    Write-Host ""
}

function Uninstall-ShortsBlock {
    Write-Host "[STEP] Removing YT-Shorts-Block entries..." -ForegroundColor Yellow
    $hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    $content = Get-Content $hostsPath -Raw
    $content = $content -replace '(?m)^.*YT-Shorts-Block.*\r?\n?', ''
    $content = $content -replace '(?m)^.*youtube-shortslens.*\r?\n?', ''
    Set-Content -Path $hostsPath -Value $content -Force
    ipconfig /flushdns | Out-Null
    Write-Host "[OK] Uninstalled successfully" -ForegroundColor Green
}

# Main
param(
    [switch]$Uninstall
)

if ($Uninstall) {
    Uninstall-ShortsBlock
} else {
    Install-ShortsBlock
}
