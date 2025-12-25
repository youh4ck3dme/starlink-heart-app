# 🤖 Codex Prompt - Ready to Use

Copy this entire prompt and paste it into Codex:

---

## TASK: Full Repository Audit & Fix

Analyze the Starlink Heart React/TypeScript project and perform:

### STEP 1: Environment Setup
```bash
npm install
npm run build
npm run test
```
Report any errors.

### STEP 2: Anomaly Detection
Scan the entire codebase for:
- Components that render empty/invisible content
- Missing error handling or fallbacks
- Unused code, imports, or variables
- Console.log statements left in production code
- TypeScript `any` types that should be specific
- Missing or inadequate tests

### STEP 3: Visual Component Audit
Check these specific components:
- `MascotRenderer` - must have fallback when Rive/Spline fails
- `RiveMascot` - must show emoji when .riv file fails
- `DashboardScreen` - avatar must be visible, not canvas
- `IntroScreen` - content must be centered
- `WelcomeScreen` - backgrounds must be changeable

### STEP 4: Test Gap Analysis
- Run `npm run coverage`
- Identify files with <70% coverage
- Add tests for uncovered critical paths
- Ensure tests actually test behavior, not just rendering

### STEP 5: Fix Implementation
For each issue:
1. Create a fix
2. Add or update tests
3. Verify with `npm run test`

### STEP 6: Final Report
Provide:
- List of all issues found (with severity)
- Fixes implemented
- Tests added
- Final test count and coverage %
- Build status

---

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Vitest, Firebase, Gemini AI

**Current Status:** 132 tests passing, ~70% coverage

**Branch:** chore/workspace-cleanup
