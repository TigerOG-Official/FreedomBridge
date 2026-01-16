#!/bin/bash

# Freedom Bridge - Release Builder
# This script builds the macOS distribution package.
# For Linux/Windows, use goreleaser (builds Go binaries).
#
# Usage:
#   ./build-release.sh          - Build macOS package only
#   ./build-release.sh --all    - Build macOS + Linux/Windows (requires Go + goreleaser)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="${SCRIPT_DIR}/dist"
RELEASE_DIR="${SCRIPT_DIR}/release"

echo "============================================"
echo "Freedom Bridge - Release Builder"
echo "============================================"
echo ""

# Check if dist exists
if [ ! -d "${DIST_DIR}" ]; then
  echo "❌ Error: dist/ directory not found!"
  echo "Please run: npm run build"
  exit 1
fi

# Clean and create release directory
echo "📁 Setting up release directory..."
rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"

# ============================================
# macOS Distribution (AppleScript-based)
# ============================================
echo ""
echo "🍎 Building macOS distribution..."
MACOS_DIR="${RELEASE_DIR}/macos"
mkdir -p "${MACOS_DIR}"

# Copy dist files
echo "   Copying dist files..."
cp -R "${DIST_DIR}" "${MACOS_DIR}/dist"

# Create AppleScript source files
echo "   Creating AppleScript files..."

# Start script
cat > "${MACOS_DIR}/start.applescript" << 'EOF'
-- -- -- -- -- -- -- HOW TO RUN Freedom Bridge Server -- -- -- -- -- -- --
-- This script will run a simple local web server so that you can interact with the Freedom Bridge locally.
-- Step 1) Press the grey ▶ symbol (in between the square and hammer above this text)
-- Step 2) When you are done, you can double-click on the "Stop Freedom Bridge Server.scpt" script and run that
-- -- -- -- -- -- -- END OF INSTRUCTIONS -- -- -- -- -- -- --

on replace_chars(this_text, search_string, replacement_string)
	set AppleScript's text item delimiters to the search_string
	set the item_list to every text item of this_text
	set AppleScript's text item delimiters to the replacement_string
	set this_text to the item_list as string
	set AppleScript's text item delimiters to ""
	return this_text
end replace_chars

do shell script "ps auxww | grep httpd | grep freedombridge | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null || true"
do shell script "mkdir -p /tmp/freedombridge-server"

set myconfig to POSIX path of "/tmp/freedombridge-server/freedombridge-apache.conf"
do shell script "rm -f " & myconfig

set myFile to open for access myconfig with write permission
write "ServerRoot \"/usr\"

Listen 4173

ServerAdmin you@example.com

<IfDefine PREFORK>
LoadModule mpm_prefork_module libexec/apache2/mod_mpm_prefork.so
</IfDefine>

LoadModule authz_core_module libexec/apache2/mod_authz_core.so
LoadModule unixd_module libexec/apache2/mod_unixd.so
LoadModule dir_module libexec/apache2/mod_dir.so
LoadModule mime_module libexec/apache2/mod_mime.so

AddType image/svg+xml svg

StartServers 1
MinSpareServers 1
MaxSpareServers 1

DirectoryIndex index.html

ErrorLog  /tmp/freedombridge-server/freedombridge_error_log
PidFile /tmp/freedombridge-server/freedombridge_server.pid

DocumentRoot \"/tmp/freedombridge-server/freedombridge-dist\"" to myFile
close access myFile

set mypath to POSIX path of ((path to me as text) & "::")

-- Start http-server in the background
do shell script "rm -rf /tmp/freedombridge-server/freedombridge-dist && cp -r '" & mypath & "'/dist /tmp/freedombridge-server/freedombridge-dist && /usr/sbin/httpd \"$([ -f /usr/libexec/apache2/mod_mpm_prefork.so ] && echo '-DPREFORK' || echo '-DOK')\" -f /tmp/freedombridge-server/freedombridge-apache.conf"

set serverRunning to 0
set attempts to 0

repeat until (serverRunning = 1 or attempts > 15)
	try
		delay 2
		do shell script "curl http://localhost:4173"
		set serverRunning to 1
	on error
		set serverRunning to 0
		set attempts to attempts + 1
	end try
end repeat

if attempts > 15 then
	display dialog "Freedom Bridge Server couldn't load on your machine."
else
	-- Open the index.html file in the default web browser
	do shell script "open http://localhost:4173"
end if
EOF

# Stop script
cat > "${MACOS_DIR}/stop.applescript" << 'EOF'
-- -- -- -- -- -- -- HOW TO STOP Freedom Bridge Server -- -- -- -- -- -- --
-- This script will stop the local Freedom Bridge Server.
-- Step 1) Press the grey ▶ symbol (in between the square and hammer above this text)
-- -- -- -- -- -- -- END OF INSTRUCTIONS -- -- -- -- -- -- --

-- Close the server
do shell script "ps auxww | grep httpd | grep freedombridge | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null || true"

display dialog "Freedom Bridge Server has been stopped."
EOF

# Compile AppleScripts
echo "   Compiling AppleScript files..."
osacompile -o "${MACOS_DIR}/Start Freedom Bridge Server.scpt" "${MACOS_DIR}/start.applescript"
osacompile -o "${MACOS_DIR}/Stop Freedom Bridge Server.scpt" "${MACOS_DIR}/stop.applescript"

# Create README.rtfd
echo "   Creating README..."
mkdir -p "${MACOS_DIR}/README.rtfd"
cat > "${MACOS_DIR}/README.rtfd/TXT.rtf" << 'EOF'
{\rtf1\ansi\ansicpg1252\cocoartf2759
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Verdana;\f1\fnil\fcharset0 LucidaGrande;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;\csgenericrgb\c0\c0\c0;}
\margl1440\margr1440\vieww18300\viewh18900\viewkind0
\pard\tx577\tx1155\tx1733\tx2311\tx2889\tx3467\tx4045\tx4623\tx5201\tx5779\tx6357\tx6935\tx7513\tx8091\tx8669\tx9247\tx9825\tx10403\tx10981\tx11559\tx12137\tx12715\tx13293\tx13871\tx14449\tx15027\tx15605\tx16183\tx16761\tx17339\tx17917\tx18495\tx19072\tx19650\tx20228\tx20806\tx21384\tx21962\tx22540\tx23118\tx23696\tx24274\tx24852\tx25430\tx26008\tx26586\tx27164\tx27742\tx28320\tx28898\tx29476\tx30054\tx30632\tx31210\tx31788\tx32366\tx32944\tx33522\tx34100\tx34678\tx35256\tx35834\tx36412\tx36990\tx37567\tx38145\tx38723\tx39301\tx39879\tx40457\tx41035\tx41613\tx42191\tx42769\tx43347\tx43925\tx44503\tx45081\tx45659\tx46237\tx46815\tx47393\tx47971\tx48549\tx49127\tx49705\tx50283\tx50861\tx51439\tx52017\tx52595\tx53173\tx53751\tx54329\tx54907\tx55485\tx56062\tx56640\tx57218\tx57796\li785\fi-786\pardirnatural\partightenfactor0

\f0\fs24 \cf2 \CocoaLigature0 -- -- -- -- -- -- -- HOW TO USE Freedom Bridge -- -- -- -- -- -- -- \
\
This script (Start Freedom Bridge Server) will run a simple local web server so that you can interact with the Freedom Bridge locally.\
\
1. Double-click \'93Start Freedom Bridge Server".\
\
2. Press the grey
\f1 \uc0\u9654
\f0  symbol (in between the square and hammer at the top of the window)\
\
3. Your browser will open to http://localhost:\cf3 4173\cf2  for the Freedom Bridge.\
\
4. To stop, Double-click \'93Stop Freedom Bridge Server".\
\
\cf3 \
\cf2 \
\
}
EOF

# Clean up source files
rm -f "${MACOS_DIR}/start.applescript" "${MACOS_DIR}/stop.applescript"

# Create macOS zip
echo "   Creating MacOS.zip..."
cd "${RELEASE_DIR}"
zip -q -r MacOS.zip macos/
cd "${SCRIPT_DIR}"

MACOS_SIZE=$(du -h "${RELEASE_DIR}/MacOS.zip" | cut -f1)
echo "   ✅ macOS distribution complete (${MACOS_SIZE})"

# ============================================
# Linux/Windows via goreleaser (optional)
# ============================================
if [ "${1:-}" = "--all" ]; then
  echo ""
  echo "🔧 Building Linux/Windows binaries with goreleaser..."

  # Check for Go
  if ! command -v go &> /dev/null; then
    echo "   ❌ Error: Go is not installed"
    echo "   Install from: https://go.dev/doc/install"
    exit 1
  fi

  # Check for goreleaser
  if ! command -v goreleaser &> /dev/null; then
    echo "   ❌ Error: goreleaser is not installed"
    echo "   Install from: https://goreleaser.com/install/"
    exit 1
  fi

  # Copy dist to pkg/app for embedding
  echo "   Copying dist for embedding..."
  rm -rf "${SCRIPT_DIR}/pkg/app/dist"
  cp -r "${DIST_DIR}" "${SCRIPT_DIR}/pkg/app/dist"

  # Run goreleaser
  echo "   Running goreleaser..."
  goreleaser release --snapshot --clean

  echo "   ✅ Linux/Windows binaries complete"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "============================================"
echo "✅ BUILD COMPLETE"
echo "============================================"
echo ""
echo "📦 Packages created in: ${RELEASE_DIR}"
echo ""
echo "  🍎 MacOS.zip      (${MACOS_SIZE})"

if [ "${1:-}" = "--all" ]; then
  echo ""
  echo "  🐧 Linux binaries in: dist/"
  echo "  🪟 Windows binaries in: dist/"
fi

echo ""
echo "============================================"
