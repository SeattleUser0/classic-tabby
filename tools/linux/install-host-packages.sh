#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-only WITH GPL-3.0-linking-exception
#
# tools/linux/install-host-packages.sh — host packages for the Classic Tabby Linux build
#
# Purpose
#   Reproduce the Ubuntu host setup from a clean install (Task 01, Step 2). Run as root:
#       sudo bash tools/linux/install-host-packages.sh
#   It only adds two third-party apt repositories, both explicitly approved for this
#   project: Microsoft's (PowerShell 7) and Google's (Chrome). Everything else comes from
#   the Ubuntu archive. Snap Chromium is deliberately avoided: snap confinement can block
#   WebMIDI/SysEx, which the SMK37 workbench needs.
#
#   The JieLi toolchains and the WASI SDK are NOT installed here; see docs/BUILD.md
#   (they are downloaded, hash-checked and extracted into the project's toolchains folder).
#
# Version: 0.1
#
# Revision log
#   v0.1  2026-11-01  Initial version for Ubuntu 26.04 (resolute). Packages: git,
#                     build-essential, python3, python3-venv, nodejs (Node LTS; nodesource
#                     repo if already configured, otherwise the Ubuntu package), powershell
#                     (Microsoft repo), wine64 + wine32:i386 (the JieLi Windows tools are
#                     32-bit PE), innoextract, p7zip-full, alsa-utils, google-chrome-stable
#                     (Google repo).
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "Run as root: sudo bash $0" >&2
    exit 1
fi
export DEBIAN_FRONTEND=noninteractive
. /etc/os-release

echo "== Ubuntu archive packages"
apt-get update
apt-get install -y git build-essential python3 python3-venv curl ca-certificates gnupg \
    innoextract p7zip-full alsa-utils usbutils

echo "== Node LTS"
# Node 22 LTS. If the nodesource repo is already configured (it is on the NUC) apt picks
# it up; otherwise Ubuntu's own nodejs package is used. Homebrew's node, if present,
# shadows /usr/bin/node in PATH but is not required by the build.
apt-get install -y nodejs

echo "== PowerShell 7 (Microsoft apt repository)"
if ! command -v pwsh >/dev/null 2>&1; then
    tmp=$(mktemp -d)
    curl -fsSL -o "$tmp/packages-microsoft-prod.deb" \
        "https://packages.microsoft.com/config/ubuntu/${VERSION_ID}/packages-microsoft-prod.deb"
    dpkg -i "$tmp/packages-microsoft-prod.deb"
    rm -rf "$tmp"
    apt-get update
    apt-get install -y powershell
fi

echo "== Wine (64-bit host + 32-bit support for the PE32 JieLi tools)"
dpkg --add-architecture i386
apt-get update
apt-get install -y wine64 wine32:i386

echo "== Google Chrome (Google apt repository, not snap)"
if ! command -v google-chrome >/dev/null 2>&1; then
    install -d -m 0755 /etc/apt/keyrings
    curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg
    cat > /etc/apt/sources.list.d/google-chrome.sources <<'EOF'
Types: deb
URIs: https://dl.google.com/linux/chrome/deb/
Suites: stable
Components: main
Signed-By: /etc/apt/keyrings/google-chrome.gpg
EOF
    apt-get update
    apt-get install -y google-chrome-stable
fi

echo "== Installed versions"
for p in git build-essential python3 nodejs powershell wine64 wine32:i386 innoextract p7zip-full alsa-utils google-chrome-stable; do
    printf '%-22s %s\n' "$p" "$(dpkg-query -W -f='${Version}' "$p" 2>/dev/null || echo '(not installed)')"
done
