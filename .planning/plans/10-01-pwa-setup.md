# Plan 10-01: PWA Setup

## Goal
Install and configure vite-plugin-pwa with manifest and service worker for offline-capable, installable PWA.

## Why This Matters
PWA capabilities let Nick and Bella install the app on their phones like a native app, with offline support for when they're in stores with spotty signal.

## Tasks

### 1. Install vite-plugin-pwa
```bash
npm install vite-plugin-pwa -D
```

### 2. Configure vite.config.ts
Add PWA plugin with:
- App name: "Our Kitchen"
- Short name: "Our Kitchen"
- Theme color: #C4755B (terracotta)
- Background color: #FDF8F3 (cream)
- Display: standalone
- Start URL: /
- Icons array (will be generated in 10-02)
- Service worker strategy: generateSW (auto-generated)
- Runtime caching for Firebase/Firestore requests

### 3. Update index.html
- Title: "Our Kitchen"
- Meta description
- Theme-color meta tag
- Apple-mobile-web-app-capable meta tags

### 4. Create placeholder icon
- Create a simple SVG icon for development
- Will be replaced with proper icons in 10-02

## Files to Create/Modify
- `vite.config.ts` - Add PWA plugin configuration
- `index.html` - Update title and add PWA meta tags
- `public/icon.svg` - Placeholder icon

## Verification
- [ ] `npm run build` succeeds
- [ ] Build output includes manifest.webmanifest
- [ ] Build output includes service worker (sw.js)
- [ ] Dev server shows no PWA-related errors

## Notes
- vite-plugin-pwa auto-generates manifest.webmanifest from config
- Service worker will cache static assets automatically
- Firebase requests need special runtime caching rules
