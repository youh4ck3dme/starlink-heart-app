# Task: Deployment & Optimization

## Objectives

- [X] Deploy updates to Vercel
- [X] Refactor Dashboard Header (Unify XPBar and User Stats)
- [X] Deploy Refactored Dashboard
- [X] Optimize bundle size (dynamic imports)
- [X] Fix CameraModal test warnings
- [X] Full Codex Audit
- [X] Gamification: Implement MissionService
- [X] Gamification: Create DailyMissionsCard
- [X] Gamification: Create LevelUpModal
- [X] Gamification: Integration & Debugging
- [X] Gamification: Verification & Tests
- [X] Final Testing & Project Commit

## Mobile UX Polish

- [X] Create `useHaptics` hook
- [X] Implement page transition animations
- [X] Apply to all interactive elements
- [X] Test and verify

## Final Cleanup & Merge

- [X] Clean unused imports and code
- [X] Run lint and type checks
- [x] Run full test suite
- [x] Fix build errors (missing assets)
- [x] Merge to main branch

## Visual Update - Welcome Screen
- [x] Implement animated space background
- [x] Add new 4K avatars (Star, Comet, Robot)
- [x] Replace with single background image (intro-bg.png)
- [x] Verify blending/transparency
- [x] Polish layout (hero section)
- [x] Replace Robot avatar with Roboto
- [x] Verify build
- [x] Verify build

## Space Architect: Galaxy Roadmap 🌌
- [x] Design Galaxy Roadmap component (Welcome Screen)
- [x] Fix test suite failures (212/212 passing)
    - [x] Mock `useEdupage` in `SchoolDashboard.test.tsx`
    - [x] Wrap tests in `GamificationProvider`
    - [x] Refactor progression tests for level-based system
    - [x] Fix background persistence and state initialization
    - [x] Repair file integrity (import statements)
- [x] Implement Service Worker Caching
- [x] Implement vertical progression (Robot -> Comet -> Starry)
- [x] Add animations (Framer Motion)
- [x] Integrate with Welcome Screen parallax

## School Dashboard (EduPage Style)
- [x] Create `/dashboard` route
- [x] Implement new Matrix/Space Layout
- [x] **Implement Theme Selector (Green/Pink)**
- [x] Create `TimetableCard` component
- [x] Create `GradesCard` component
- [x] Create `NoticesCard` component
- [x] Educational Particles Animation
- [x] Mock School Data Service (future)

## Optimizations
- [x] Add aria-labels to SchoolDashboard
- [x] Optimize large images (roboto.png, intro-bg.png)
- [x] Convert PNG to WebP format (83% savings!)

## Testing & PWA (Priority Backlog)
- [x] SchoolDashboard.test.tsx (19 tests)
- [x] E2E: Welcome → Home flow (6 passing)
- [x] E2E: Dashboard & Chat flows (created)
- [x] Service Worker for offline
- [x] Service Worker auto-update logic
- [x] manifest.json completion
- [x] Privacy Policy page (/privacy)
- [x] Expand test coverage to 216 tests (108% of 200 goal!)

## UI/UX Testing & Final Polish
- [x] Run full test suite and fix failures
- [x] Create `UIUXTests.test.tsx` (animations, a11y, responsive)
- [x] Fix `WelcomeScreen.test.tsx` (imports, fake timers)
- [x] Create `CosmicBackground.test.tsx` (layer order, animations)
- [x] Create `BadgeShowcase.test.tsx` (states, interactions)
- [x] Polish DailyMissionsCard animations
- [x] Polish BadgeShowcase tooltips
- [x] Final verification

## Avatar Progression System
- [x] Add `getAvatarForLevel()` utility
- [x] Change default avatar to Robot 🤖
- [x] Auto-select avatar based on level
- [x] Update intro text placement
- [x] Test new progression flow
- [x] Resolve test failures and unify leveling services
- [x] Implement EduPage Backend Proxy (Snapshot fetching)
- [x] Optimize Build Size (Vite manual chunks)
- [x] Update Firebase Security Rules (firestore.rules)
- [x] Update README.md (Documentation & Deployment)

## User Personalization
- [x] Name & Gender Settings (ProfileModal)
- [x] Dynamic Header Greeting
- [x] Visual styling based on gender (Hue-rotate)

## Cosmic Shop
- [x] Create `shopConfig.ts` (Avatar/Background variants)
- [x] Create `ShopScreen.tsx` with Tabs (Avatars, Backgrounds)
- [x] Integrate Shop into Main App (ViewMode: 'shop')
- [x] Implement Purchase & Equip logic

## Final Phase: Optimization & Cleanup 🚀
- [x] Performance Audit (Axes & Lighhouse)
- [x] Accessibility Audit (100/100 score, aria-labels)
- [x] Optimization: Gemini AI Lazy Loading
- [x] Optimization: Random Single Layer Backgrounds (Performance boost)
- [x] Cleanup: Removed unused background assets (Black/Glow/Comets)
- [x] Cleanup: Verified no broken paths
- [x] Final Production Build Verification

## Google Play Store Preparation 📱
- [x] Create Privacy Policy document (`docs/legal/privacy-policy.md`)
- [x] Create Terms of Service (`docs/legal/terms-of-service.md`)
- [x] Create Data Safety Audit (`docs/play-store/data-safety-audit.md`)
- [x] Verify Delete Account button exists in SettingsModal
- [x] Generate Feature Graphic (1024x500)
- [x] Generate Store Icon (512x512)
- [ ] Host Privacy Policy externally (GitHub Pages / domain)
- [ ] Create web delete-account endpoint
- [ ] Take app screenshots (min, 2)
- [x] Capacitor Android wrapper setup
