# Codex Instructions - Starlink Heart

## 🎯 PROJECT CONTEXT

This is a **children's AI tutor app** called "Starlink Heart" for Slovak kids (age 8-9).
The app uses Google Gemini AI for tutoring with a space/game-like UI.

## 📋 YOUR TASKS

### 1. VERIFY BUILD & TESTS
```bash
npm install
npm run build   # Must complete without errors
npm run test    # All 132+ tests must pass
```

### 2. FIND ANOMALIES
Look for these specific issues:
- [ ] Components returning empty/invisible content (like empty canvas)
- [ ] Missing fallbacks when external resources fail (Rive, Spline, images)
- [ ] Unused imports or dead code
- [ ] Console errors or warnings
- [ ] TypeScript errors or unsafe any types
- [ ] Missing test coverage for critical paths

### 3. CHECK VISUAL CONSISTENCY
- [ ] All backgrounds (sky, space, mars, galaxy) apply correctly
- [ ] Avatars display properly (emoji, not empty canvas)
- [ ] MascotRenderer has proper fallback when Rive fails
- [ ] IntroScreen/DashboardScreen centered properly

### 4. SECURITY & PERFORMANCE
- [ ] No API keys exposed in code
- [ ] Firebase rules properly configured
- [ ] Bundle size reasonable (check vite build output)
- [ ] No memory leaks in useEffect hooks

### 5. FIX & REPORT
For each issue found:
1. Describe what's wrong
2. Explain why it's a problem
3. Implement the fix
4. Add test if missing

## ⚙️ COMMANDS

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run all tests |
| `npm run coverage` | Test coverage report |
| `npm run lint` | ESLint check |

## 📁 KEY FILES

- `src/components/StarlinkHeartApp.tsx` - Main app (900 lines)
- `src/components/screens/` - Extracted screen components
- `src/services/geminiService.ts` - AI integration
- `src/__tests__/` - All test files

## ✅ SUCCESS CRITERIA

1. `npm run build` - ✅ No errors
2. `npm run test` - ✅ All tests pass
3. No visual anomalies (empty components, broken layouts)
4. All identified issues fixed with tests

## 🚫 DO NOT

- Remove existing functionality
- Change the Slovak language content
- Modify .env files
- Push directly to main branch
