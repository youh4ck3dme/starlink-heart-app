# 🤖 CODEX FULL AUDIT PROMPT

## 📋 MISSION BRIEFING

You are auditing **Starlink Heart** - an AI-powered educational app for Slovak children (8-9 years old). 
This is a React/TypeScript PWA with game-like UI, Google Gemini AI integration, and multiple visual themes.

**Your mission:** Find ALL bugs, anomalies, and issues. Fix them. Add tests. Make it bulletproof.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                        APP STRUCTURE                         │
├─────────────────────────────────────────────────────────────┤
│  WelcomeScreen (/)                                          │
│       ↓                                                      │
│  StarlinkHeartApp (/home)                                   │
│       ├── IntroScreen (first visit)                         │
│       ├── DashboardScreen (after start)                     │
│       │      ├── New Mission → ChatView                     │
│       │      ├── Profile → ProfileModal                     │
│       │      ├── Settings → CustomizationModal              │
│       │      └── Coach Mode Toggle                          │
│       └── ChatView (main interface)                         │
│              ├── Header                                      │
│              ├── ChatMessage (list)                         │
│              ├── ChatInput                                  │
│              └── CameraModal                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ KNOWN CRITICAL ISSUES TO VERIFY

### Issue 1: Empty Canvas / Gray Square
- **Location:** MascotRenderer, RiveMascot, DashboardScreen
- **Symptom:** Gray canvas instead of avatar/mascot
- **Root cause:** Rive animation fails to load, no proper fallback
- **Status:** SUPPOSEDLY FIXED - verify it works!

### Issue 2: Hero Image Disabled
- **Location:** WelcomeScreen.tsx line 115-132
- **Status:** Commented out for testing
- **Action:** Verify backgrounds work, then re-enable

### Issue 3: Background Not Changing
- **Location:** BACKGROUND_OPTIONS in StarlinkHeartApp.tsx
- **Symptom:** Only one background visible
- **Action:** Verify all 4 backgrounds (sky, space, mars, galaxy) work

### Issue 4: Large Bundle Size
- **Files:** spline-vendor.js (2MB), physics.js (2MB)
- **Action:** Implement dynamic imports or remove unused code

---

## 🔍 AUDIT CHECKLIST

### Phase 1: Build Verification
```bash
npm install
npm run build
npm run test
npm run coverage
```

- [ ] No TypeScript errors
- [ ] No build warnings (except known chunk size)
- [ ] All 132+ tests pass
- [ ] Coverage report generated

### Phase 2: Code Quality Scan

#### A. Find Dead Code
```bash
# Search for unused imports
grep -r "import.*from" src/ | grep -v "node_modules"
# Search for unused variables
npx eslint src/ --report-unused-disable-directives
```

- [ ] No unused imports
- [ ] No unused variables
- [ ] No unused functions
- [ ] No console.log in production code

#### B. TypeScript Strictness
- [ ] No `any` types (search: `": any"`)
- [ ] No `// @ts-ignore` comments
- [ ] No implicit any in function parameters
- [ ] All promises properly handled

#### C. React Best Practices
- [ ] No missing keys in lists
- [ ] No memory leaks in useEffect (cleanup functions)
- [ ] No direct DOM manipulation
- [ ] Proper error boundaries

### Phase 3: Visual Component Audit

#### Test Each Component:

**MascotRenderer:**
```tsx
// Should NEVER return null or empty canvas
// Must always show visible content
<MascotRenderer mode="rive" />  // → Should show ✨ fallback if Rive fails
<MascotRenderer mode="image" /> // → Should show welcome-hero.png
<MascotRenderer mode="spline3d" /> // → Should show ✨ if not configured
```

**StarryAvatarDisplay:**
```tsx
// Must show the emoji avatar
<StarryAvatarDisplay avatar="🚀" />  // → Must show 🚀
```

**Background Themes:**
```tsx
// All 4 must apply different CSS classes
bg-sky-50        // Light blue
bg-deep-space    // Dark gradient
bg-mars-sunset   // Orange/red gradient
bg-galaxy-swirl  // Purple gradient
```

### Phase 4: Test Coverage Analysis

Current: ~70% coverage

✅ Well Covered:
- ChatMessage
- ChatInput
- ParentNotice

❌ Needs More Tests:
- StarlinkHeartApp.tsx (main component, complex state)
- geminiService.ts (AI responses)
- useVoiceMode.ts (speech recognition)
- WelcomeScreen.tsx (parallax, device orientation)

### Phase 5: Security Audit

- [ ] No API keys in source code
- [ ] No sensitive data in localStorage (except user preferences)
- [ ] Firebase rules properly configured
- [ ] No XSS vulnerabilities (dangerouslySetInnerHTML)
- [ ] Content sanitized before display

---

## 🛠️ FIX TEMPLATE

For each issue found, document like this:

```markdown
### 🐛 Issue #X: [Title]

**Severity:** Critical / High / Medium / Low
**Location:** `src/path/to/file.tsx:lineNumber`
**Description:** What's wrong
**Root Cause:** Why it happens
**Fix:** What you changed
**Test Added:** Yes/No - describe the test
```

---

## ✅ SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Build | ✅ No errors |
| Tests | ✅ All pass (132+) |
| Coverage | ≥75% |
| TypeScript | ✅ Strict mode pass |
| Visual bugs | 0 |
| Console errors | 0 |

---

## 📤 FINAL DELIVERABLES

1. **Issue Report:** List of all found issues with severity
2. **Fix Summary:** What was fixed and how
3. **Test Report:** New tests added, final coverage %
4. **Recommendations:** Future improvements

---

## 🚀 START COMMAND

```bash
cd /path/to/starlink-homework
npm install
npm run build && npm run test && npm run coverage
```

**BEGIN AUDIT NOW.**
