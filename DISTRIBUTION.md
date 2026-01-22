# ZTMM Assessment Tool - Distribution Guide

## Built Distributables

### macOS (✅ Built)

**Location:** `src-tauri/target/release/bundle/macos/ZTMM Assessment Tool.app`

**Distribution Options:**

1. **Direct .app Distribution** (Recommended)
   - Compress the `.app` file: Right-click → Compress
   - Share the resulting `.zip` file
   - Users: Download, unzip, and drag to Applications folder
   - Size: ~12MB compressed

2. **Manual DMG Creation** (Optional)
   - Open Disk Utility
   - File → New Image → Image from Folder
   - Select the `.app` folder
   - Save as `.dmg`
   - More polished installer experience

**Installation for Users:**
```bash
# Method 1: Direct install
unzip ZTMM-Assessment-Tool.zip
mv "ZTMM Assessment Tool.app" /Applications/

# Method 2: From DMG
# Double-click the .dmg
# Drag app to Applications folder
```

**Important Notes:**
- App is built for Apple Silicon (M1/M2/M3 Macs)
- First launch: Right-click → Open (to bypass Gatekeeper)
- Or: System Settings → Privacy & Security → Allow app

---

## Windows Build Instructions

### Prerequisites

You have two options for building Windows executables:

#### Option A: GitHub Actions (Recommended)

Set up automated builds that create Windows, macOS, and Linux distributables:

1. Create `.github/workflows/build.yml`:
```yaml
name: Build Apps

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, windows-latest]
    runs-on: ${{ matrix.platform }}

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Setup Rust
      uses: dtolnay/rust-toolchain@stable

    - name: Install dependencies
      run: npm install

    - name: Build Tauri app
      run: npm run tauri:build

    - name: Upload artifacts
      uses: actions/upload-artifact@v4
      with:
        name: app-${{ matrix.platform }}
        path: |
          src-tauri/target/release/bundle/
```

2. Push to GitHub and check the Actions tab for builds

#### Option B: Cross-Platform Build Tools

**Using cargo-cross (from Mac):**
```bash
# Install cargo-cross
cargo install cross

# Build for Windows
cd src-tauri
cross build --target x86_64-pc-windows-gnu --release

# The .exe will be in:
# target/x86_64-pc-windows-gnu/release/
```

#### Option C: Build on Windows Machine

**On a Windows PC:**

1. Install Rust:
```powershell
# PowerShell
irm https://sh.rustup.rs -UseBasicParsing | iex
```

2. Install Visual Studio Build Tools:
   - Download: https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++"

3. Install Node.js and build:
```powershell
# In PowerShell
npm install
npm run tauri:build
```

4. Find the installer:
   - `.msi`: `src-tauri/target/release/bundle/msi/`
   - `.exe`: `src-tauri/target/release/bundle/nsis/`

---

## Alternative Distribution Methods

### 1. Single HTML File (No Installation)

For the absolute simplest distribution:

```bash
# Install the plugin
npm install -D vite-plugin-singlefile

# Add to vite.config.ts
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  plugins: [react(), viteSingleFile()],
})

# Build
npm run build
# Result: dist/index.html (single file, ~2MB)
```

Users just open the HTML file in their browser. Works offline!

### 2. Static File Server

Host on any web server:
```bash
npm run build
# Upload dist/ folder to:
# - Netlify (drag & drop)
# - Vercel (connect GitHub)
# - GitHub Pages (free)
# - Any web server
```

### 3. Docker Container

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
EXPOSE 3000
```

```bash
docker build -t ztmm-assessment-tool .
docker run -p 3000:3000 ztmm-assessment-tool
```

---

## Distribution Recommendations

**For Non-Technical Users:**

1. **Best:** macOS `.app` in a `.zip` file
   - Double-click to open
   - No installation steps
   - Works offline immediately

2. **Good:** Single HTML file
   - Email as attachment
   - Works on any OS
   - No installation at all

3. **Okay:** Installer (.msi for Windows)
   - More steps but familiar to users
   - Professional appearance

**For Organizations:**

1. Host on internal web server (easiest)
2. Provide pre-installed USB drives
3. Add to internal app store/Jamf/SCCM

---

## Testing the App

### Local Testing:
```bash
# Development mode (with hot reload)
npm run tauri:dev

# Test production build
open "src-tauri/target/release/bundle/macos/ZTMM Assessment Tool.app"
```

### Known Issues:

1. **"App is damaged" error on macOS:**
   ```bash
   xattr -cr "/Applications/ZTMM Assessment Tool.app"
   ```

2. **Windows SmartScreen warning:**
   - Normal for unsigned apps
   - Click "More info" → "Run anyway"
   - Or: Code sign the app (requires certificate ~$200/year)

---

## Version Updates

To update version number:

1. Edit `src-tauri/tauri.conf.json`:
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. Edit `package.json`:
   ```json
   {
     "version": "0.2.0"
   }
   ```

3. Rebuild:
   ```bash
   npm run tauri:build
   ```

---

## App Signing (Optional - for Production)

### macOS:
- Requires Apple Developer Account ($99/year)
- Prevents security warnings
- App Store distribution

### Windows:
- Code signing certificate (~$200-500/year)
- Removes SmartScreen warnings
- Multiple certificate authorities available

---

## File Sizes

| Format | Size | Distribution Method |
|--------|------|-------------------|
| macOS .app | ~12MB | .zip file |
| Windows .msi | ~15MB | Direct download |
| Single HTML | ~2MB | Email, USB |
| Docker image | ~100MB | Container registry |

---

## Quick Command Reference

```bash
# Development
npm run tauri:dev

# Build for current platform
npm run tauri:build

# Build web version only
npm run build

# View built apps
ls -lh src-tauri/target/release/bundle/

# Test the app
open "src-tauri/target/release/bundle/macos/ZTMM Assessment Tool.app"
```

---

## Support & Troubleshooting

### Common Issues:

**Build fails with Rust errors:**
```bash
rustup update
cargo clean
npm run tauri:build
```

**App won't open on macOS:**
```bash
# Remove quarantine flag
xattr -cr "/path/to/app"

# Or right-click → Open
```

**Windows build needs Visual Studio:**
- Download VS Build Tools
- Select "Desktop development with C++"
- Restart terminal after install

---

## Next Steps

1. ✅ macOS app is ready at: `src-tauri/target/release/bundle/macos/`
2. ⚠️ Windows: Use GitHub Actions or build on Windows PC
3. 📦 Compress and share the .app file
4. 📝 Add to README for users

---

Generated: 2026-01-21
