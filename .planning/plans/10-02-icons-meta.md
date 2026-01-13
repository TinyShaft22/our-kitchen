# Plan 10-02: Icons & iOS Optimization

## Goal
Create app icons in all required sizes and add iOS-specific meta tags for a polished mobile experience.

## Why This Matters
Proper icons make the app look professional when installed. iOS requires specific meta tags and icon sizes for home screen appearance.

## Tasks

### 1. Create App Icon Set
Generate icons from a base design in these sizes:
- `icon-192.png` - Android/Chrome
- `icon-512.png` - Android/Chrome (maskable)
- `apple-touch-icon.png` (180x180) - iOS home screen
- `favicon.ico` - Browser tab

Icon design:
- Kitchen/home themed (simple pot, house, or utensils)
- Terracotta (#C4755B) primary color
- Cream (#FDF8F3) background
- Simple, recognizable at small sizes

### 2. Update vite.config.ts Icons Array
Add all icon paths to PWA manifest config with proper sizes and purposes.

### 3. Add iOS Meta Tags to index.html
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Our Kitchen">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### 4. Add iOS Splash Screens (Optional)
If time permits, add splash screens for common iOS devices.

### 5. Update Favicon
Replace vite.svg with our app icon.

## Files to Create/Modify
- `public/icon-192.png` - 192x192 icon
- `public/icon-512.png` - 512x512 maskable icon
- `public/apple-touch-icon.png` - 180x180 iOS icon
- `public/favicon.ico` - Browser favicon
- `vite.config.ts` - Update icons array
- `index.html` - Add iOS meta tags, update favicon link

## Verification
- [ ] All icon files exist in public/
- [ ] Icons display correctly in browser tab
- [ ] iOS simulator shows correct home screen icon
- [ ] Android Chrome shows correct install icon
- [ ] No 404 errors for icon requests

## Notes
- Can use simple SVG-to-PNG conversion or online PWA icon generators
- Maskable icons need safe zone padding (center 80%)
- iOS is picky about exact sizes
