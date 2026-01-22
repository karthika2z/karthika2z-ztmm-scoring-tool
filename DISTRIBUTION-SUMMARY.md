# ZTMM Assessment Tool - Distribution Options Summary

## ✅ All Distribution Methods Ready

You now have **THREE** ways to distribute your app to non-technical users:

---

## Option 1: Single HTML File (Universal - Recommended)

**Best for:** Maximum compatibility, email distribution, USB drives

### What you have:
- **File:** `dist/index.html` (295KB)
- **Built with:** `npm run build:singlefile`

### How to distribute:
1. Share the single HTML file
2. Users double-click to open in any browser
3. Works on Windows, Mac, Linux
4. Works completely offline
5. No installation needed

### Advantages:
- ✅ Works on ALL platforms
- ✅ No installation
- ✅ Easy to email or put on USB
- ✅ Smallest file size (~300KB)
- ✅ Browser-based, familiar to users

### Limitations:
- Save/Load uses browser downloads folder
- Requires modern browser (Chrome, Firefox, Safari, Edge)

---

## Option 2: macOS Desktop App (Professional)

**Best for:** Mac users who want a native app experience

### What you have:
- **App:** `src-tauri/target/release/bundle/macos/ZTMM Assessment Tool.app`
- **DMG:** `src-tauri/target/release/bundle/dmg/ZTMM Assessment Tool_0.1.0_aarch64.dmg`
- **Built with:** `npm run tauri:build`

### How to distribute:
1. Share the `.dmg` file (12MB)
2. Users double-click to mount
3. Drag app to Applications folder
4. First launch: Right-click → Open (security)

### Advantages:
- ✅ Native macOS app
- ✅ Works offline
- ✅ Save/Load with native file dialogs
- ✅ Professional appearance
- ✅ Small size (~12MB)

### Limitations:
- Only works on Apple Silicon Macs (M1/M2/M3)
- Requires macOS security bypass on first launch

---

## Option 3: Regular Web App (Hosted)

**Best for:** Centralized access, automatic updates

### What you have:
- **Files:** `dist/` folder
- **Built with:** `npm run build`

### How to use:
1. **Local development:**
   ```bash
   npm run dev
   # Opens at http://localhost:5173
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   # Opens at http://localhost:4173
   ```

3. **Deploy to hosting:**
   - Upload `dist/` folder to any web server
   - Or use: Netlify, Vercel, GitHub Pages, AWS S3, etc.

### Advantages:
- ✅ Centralized updates
- ✅ Access from anywhere
- ✅ No distribution needed
- ✅ Works on all devices

### Limitations:
- Requires hosting (unless local)
- Users need internet (unless local network)

---

## What Got Fixed

### 1. Save Button Now Works! ✅

The "Save Summary" button in the top nav and summary page now properly saves your assessment:

**In Browser/Single HTML:**
- Downloads JSON file to your Downloads folder
- Format: `CustomerName_YYYYMMDD_v1.json`

**In Tauri Mac App:**
- Opens native macOS save dialog
- Choose where to save
- Full file system access

### 2. Load Button Works! ✅

The Load button now works in both environments:

**In Browser/Single HTML:**
- Opens file picker
- Loads JSON assessments

**In Tauri Mac App:**
- Opens native macOS file picker
- Full file system access

---

## Quick Commands Reference

```bash
# Single HTML file (universal)
npm run build:singlefile
# → dist/index.html

# macOS desktop app
npm run tauri:build
# → src-tauri/target/release/bundle/macos/ZTMM Assessment Tool.app
# → src-tauri/target/release/bundle/dmg/ZTMM Assessment Tool_0.1.0_aarch64.dmg

# Web version (for hosting or local dev)
npm run build
# → dist/ folder

# Development mode
npm run dev
# → http://localhost:5173
```

---

## Windows Distribution

Currently, you have these options for Windows users:

### Option A: Single HTML File (Works Now)
- Windows users can use the same `dist/index.html` file
- Opens in Edge, Chrome, or Firefox
- Zero setup

### Option B: Build on Windows PC
Requires a Windows machine:
```powershell
# On Windows:
npm install
npm run tauri:build
# Creates .msi installer
```

### Option C: GitHub Actions (Automated)
Set up CI/CD to automatically build Windows + Mac versions. See `DISTRIBUTION.md` for setup.

---

## File Locations

After building, find your distributables here:

```
ztmm-assessment-tool/
├── dist/
│   └── index.html                    # Single HTML file (295KB)
│
└── src-tauri/target/release/bundle/
    ├── macos/
    │   └── ZTMM Assessment Tool.app  # Mac app bundle
    └── dmg/
        └── ZTMM Assessment Tool_0.1.0_aarch64.dmg  # Mac installer (12MB)
```

---

## Distribution Recommendations

### For Non-Technical Users:

**1st Choice:** Single HTML File
-Send via email: "Download and double-click to open"
- Works on any computer
- No tech knowledge needed

**2nd Choice:** macOS DMG (for Mac users only)
- More professional
- Native file dialogs
- Better user experience

### For Organizations:

**1st Choice:** Host as web app
- Centralized access
- Automatic updates
- No distribution needed

**2nd Choice:** Provide both HTML file + Mac app
- Maximum compatibility
- Users choose what works best

---

## Testing

All three methods have been tested and work:

✅ Single HTML - Save/load works in browser
✅ Mac App - Native file dialogs work
✅ Web App - Browser downloads work

---

## Next Steps

1. **Immediate:** Share `dist/index.html` with Windows/Mac/Linux users
2. **Mac users:** Share the `.dmg` file for better experience
3. **Long term:** Consider hosting or GitHub Actions for Windows builds

---

Generated: 2026-01-21
Version: 0.1.0
