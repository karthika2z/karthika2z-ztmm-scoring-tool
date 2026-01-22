#!/bin/bash

# Package ZTMM Assessment Tool for Distribution
# This script creates a compressed .zip file ready to share with users

set -e

echo "📦 Packaging ZTMM Assessment Tool for Distribution..."
echo ""

# Check if app exists
APP_PATH="src-tauri/target/release/bundle/macos/ZTMM Assessment Tool.app"
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: App not found at $APP_PATH"
    echo "Please run: npm run tauri:build first"
    exit 1
fi

# Get version from tauri.conf.json
VERSION=$(grep '"version"' src-tauri/tauri.conf.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
OUTPUT_NAME="ZTMM-Assessment-Tool-v${VERSION}-macOS-AppleSilicon.zip"
OUTPUT_DIR="$(pwd)/dist-packages"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Create zip file
echo "Creating $OUTPUT_NAME..."
cd "src-tauri/target/release/bundle/macos"
zip -r -q "$OUTPUT_DIR/$OUTPUT_NAME" "ZTMM Assessment Tool.app"
cd - > /dev/null

# Calculate size
SIZE=$(du -h "$OUTPUT_DIR/$OUTPUT_NAME" | cut -f1)

echo ""
echo "✅ Package created successfully!"
echo ""
echo "📍 Location: $OUTPUT_DIR/$OUTPUT_NAME"
echo "📏 Size: $SIZE"
echo ""
echo "📤 Distribution Instructions:"
echo "   1. Share this .zip file with users"
echo "   2. Users should unzip and drag to Applications folder"
echo "   3. First launch: Right-click → Open (to bypass security)"
echo ""
echo "📝 See DISTRIBUTION.md for more distribution options"
