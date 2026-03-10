# Maintenance Log System - Troubleshooting Guide

## Issue: Blank/Empty Page Not Loading

If you encounter a blank page when opening the app, follow these steps:

### Quick Fix
1. Visit: https://maint-report-gen.preview.emergentagent.com/clear-cache.html
2. Click "Clear Cache & Reload"
3. The app will reload automatically

### Manual Fix (If Quick Fix Doesn't Work)

#### For Chrome/Edge on Windows:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Go back to the app and press `Ctrl + F5` (hard refresh)

#### For Chrome/Edge on Mac:
1. Press `Cmd + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Go back to the app and press `Cmd + Shift + R` (hard refresh)

#### For Firefox:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cache"
3. Click "Clear Now"
4. Hard refresh with `Ctrl + F5` or `Cmd + Shift + R`

### Why Does This Happen?

The app uses Progressive Web App (PWA) technology which caches files for offline use. Sometimes old cached files can cause issues when the app is updated. Clearing the cache resolves this.

### Prevention

After clearing cache once, the app should work smoothly. The new service worker is configured to always fetch fresh content from the server.

## Additional Support

If issues persist after clearing cache:
1. Try using an incognito/private browsing window
2. Check your internet connection
3. Ensure JavaScript is enabled in your browser
4. Try a different browser
