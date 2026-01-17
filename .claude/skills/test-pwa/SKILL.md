---
name: test-pwa
description: Comprehensive PWA testing checklist for Our Kitchen app. Use when validating installability, offline support, and native-like experience on iOS, Android, or desktop. Triggers on requests to test PWA, check installation, verify offline mode, or audit progressive web app compliance.
---

# Test PWA

Validate PWA requirements before shipping.

## Requirements

- Installable on iPhone (primary)
- Offline-capable
- Real-time sync when online
- 44px minimum touch targets

### Manifest
- name: "Our Kitchen"
- theme_color: #C4755B (terracotta)
- background_color: #FDF8F3 (cream)
- display: "standalone"
- icons: 192x192, 512x512

## Universal Checks

- [ ] manifest.json exists in public/
- [ ] Linked in index.html
- [ ] Service worker registered
- [ ] Served over HTTPS
- [ ] Lighthouse PWA audit passes

## iOS (Safari)

1. Open in Safari, tap Share > Add to Home Screen
2. Verify icon and name correct
3. Open from home screen - no Safari UI

**Required meta tags:**
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
```

**Offline test:** Install, load data, Airplane Mode, close/reopen - app loads

## Android (Chrome)

1. Look for install banner or Menu > Install app
2. App appears in app drawer
3. Opens in standalone mode

## Desktop (Chrome/Edge)

1. Look for install icon in address bar
2. Click install - opens as separate window
3. DevTools > Network > Offline - app loads from cache

## Debugging

- **Install not appearing:** Check manifest valid, HTTPS, service worker
- **Not working offline:** Check service worker caching, Cache Storage
- **iOS issues:** Need apple-touch-icon meta tags, Safari-specific
