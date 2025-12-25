# Bug Fixes - December 2024

## Issues Fixed

### 1. Full-Height Layout Issues
**Symptom:** Backgrounds appearing "cut" or showing white gaps, content floating in small area.

**Root Cause:** Using `min-h-[100svh]` and `h-screen` which don't account for dynamic viewport changes on mobile (browser chrome appearing/disappearing).

**Fix:** Changed all layout containers to use `min-h-dvh` (dynamic viewport height):
- `App.tsx` - LoadingFallback
- `WelcomeScreen.tsx` - Main container and content layer
- `Home.tsx` - Container div
- `StarlinkHeartApp.tsx` - Main layout container

### 2. Routing Behavior
**Symptom:** Refresh sometimes forces wrong screen, no persistence of "started" state.

**Root Cause:** No routing guards based on user state.

**Fix:** Added `hasStarted` flag in localStorage:
- When user clicks "Začať misiu", sets `hasStarted = true`
- Route guards redirect:
  - `/` → `/home` if hasStarted
  - `/home` → `/` if not started
- "Delete all data" clears the flag (already in consentService.ts)

### 3. XPBar Infinite Loop (Maximum update depth exceeded)
**Symptom:** React warning in console, performance issues.

**Root Cause:** State updates triggered during unmount phase in React StrictMode (double-mounting behavior).

**Fix:** Added `isMounted` guard in useEffect to prevent state updates after component unmounts.

---

## How to Verify

### Desktop
1. Open `/` - should show Welcome screen
2. Click "Začať misiu" - navigates to `/home`
3. Refresh `/home` - stays on `/home`
4. Open `/` - redirects to `/home`
5. Open Settings → Delete all data → Now `/` shows Welcome again

### Mobile
1. Check background fills entire screen (no white gaps)
2. Scroll up/down - background should remain full
3. Rotate device - layout adjusts properly
4. No visible "cut" in gradient backgrounds

### Console
- No "Maximum update depth exceeded" warnings
- No React state update warnings
