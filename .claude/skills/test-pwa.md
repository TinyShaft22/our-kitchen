---
name: test-pwa
description: Comprehensive PWA testing checklist for Our Kitchen app
argument-hint: "[device: ios, android, desktop] (optional)"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---

<objective>
Guide through PWA testing to ensure installability, offline support, and native-like experience.

Purpose: Validate PWA requirements before shipping.
Output: PWA compliance report with any issues.
</objective>

<context>
Target device: $ARGUMENTS (ios, android, desktop, or all if not specified)

@public/manifest.json (when it exists)
@.planning/SPEC.md
</context>

<pwa_requirements>
## Our Kitchen PWA Requirements

From PROJECT.md:
- Installable on iPhone (primary device)
- Offline-capable
- Real-time sync when online
- 44px minimum touch targets

### Manifest Requirements
- name: "Our Kitchen"
- short_name: "Kitchen"
- theme_color: #C4755B (terracotta)
- background_color: #FDF8F3 (cream)
- display: "standalone"
- icons: 192x192, 512x512 (maskable)
</pwa_requirements>

<checklists>

<checklist device="all">
## Universal PWA Checks

### Manifest Validation
- [ ] manifest.json exists in public/
- [ ] Linked in index.html: `<link rel="manifest" href="/manifest.json">`
- [ ] name and short_name set
- [ ] Icons provided (192x192 minimum)
- [ ] theme_color matches app theme
- [ ] display set to "standalone"

### Service Worker
- [ ] Service worker registered
- [ ] Caches app shell (HTML, CSS, JS)
- [ ] Caches API responses (Firestore)
- [ ] Updates on new version

### HTTPS
- [ ] Served over HTTPS (or localhost for dev)
- [ ] No mixed content warnings

### Lighthouse Audit
Run in Chrome DevTools > Lighthouse > PWA
- [ ] Installable: Yes
- [ ] PWA Optimized: All checks pass
</checklist>

<checklist device="ios">
## iOS-Specific Tests (Safari)

### Installation
1. Open app in Safari on iPhone
2. Tap Share button (square with arrow)
3. Scroll down, tap "Add to Home Screen"
4. Verify icon and name appear correctly
5. Tap "Add"
6. Find app on home screen
7. Open app from home screen
8. Verify: No Safari UI (standalone mode)

### iOS Meta Tags (check index.html)
- [ ] `<meta name="apple-mobile-web-app-capable" content="yes">`
- [ ] `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- [ ] `<meta name="apple-mobile-web-app-title" content="Our Kitchen">`
- [ ] `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`

### iOS Quirks
- [ ] Splash screen displays during load
- [ ] Status bar style correct (default or black-translucent)
- [ ] No rubber-banding issues on scroll
- [ ] Viewport prevents zoom: `user-scalable=no` or `maximum-scale=1`

### iOS Offline
1. Install app to home screen
2. Open app, load some data
3. Enable Airplane Mode
4. Close app completely (swipe up)
5. Reopen from home screen
6. Verify: App loads, cached data visible
</checklist>

<checklist device="android">
## Android-Specific Tests (Chrome)

### Installation
1. Open app in Chrome on Android
2. Look for "Add to Home Screen" banner or menu option
3. If no banner: Menu (3 dots) > "Install app" or "Add to Home Screen"
4. Tap "Install"
5. Find app in app drawer
6. Open app
7. Verify: No Chrome UI (standalone mode)

### Android Features
- [ ] Install banner appears (if criteria met)
- [ ] App appears in app drawer after install
- [ ] Splash screen shows during launch
- [ ] Theme color in recent apps switcher
- [ ] Badge/notification support (if implemented)

### Android Offline
1. Install app
2. Load data while online
3. Enable Airplane Mode
4. Force close app
5. Reopen
6. Verify: App loads from cache
</checklist>

<checklist device="desktop">
## Desktop Tests (Chrome/Edge)

### Installation
1. Open app in Chrome
2. Look for install icon in address bar (+ icon)
3. Click install icon
4. Click "Install" in dialog
5. App opens in separate window
6. Verify: No browser UI (standalone)

### Desktop Features
- [ ] Install prompt appears in address bar
- [ ] App opens as separate window after install
- [ ] Window has correct title
- [ ] App appears in system applications

### Desktop Offline
1. Install app
2. Open DevTools > Network > Offline
3. Refresh page
4. Verify: App loads from cache
5. Verify: Offline indicator (if implemented)
</checklist>

</checklists>

<debugging>
## Common Issues & Fixes

### "Add to Home Screen" not appearing
- Check manifest.json is valid (use Chrome DevTools > Application > Manifest)
- Ensure HTTPS (or localhost)
- Need service worker registered
- iOS: Must use Safari (not Chrome)

### App not working offline
- Service worker not caching correctly
- Check DevTools > Application > Service Workers
- Check Cache Storage for cached files

### iOS specific issues
- Safari doesn't support manifest.json fully
- Need apple-touch-icon meta tags
- PWA gets killed when low memory

### Manifest not loading
```bash
# Check manifest is accessible
curl -I https://your-app.com/manifest.json
# Should return 200 with correct Content-Type
```
</debugging>

<process>
1. Parse $ARGUMENTS for device type (ios, android, desktop, or all)
2. If device specified, show that checklist
3. If no device, show all checklists
4. Walk through each check with user via AskUserQuestion
5. Track pass/fail for each item
6. Generate report with:
   - Passed checks
   - Failed checks with remediation
   - Overall PWA readiness score
</process>

<success_criteria>
- [ ] Device type determined
- [ ] Relevant checklist(s) presented
- [ ] User guided through each test
- [ ] Results captured
- [ ] Issues documented with fixes
- [ ] PWA readiness assessment provided
</success_criteria>
