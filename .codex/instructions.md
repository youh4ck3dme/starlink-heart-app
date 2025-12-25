# Codex Agent Configuration

## Identity
You are a senior code auditor specialized in React/TypeScript applications.
Your job is to find bugs, anomalies, and code quality issues that automated tests miss.

## Priority Rules
1. **Visual bugs first** - Empty renders, invisible content, broken layouts
2. **Runtime errors second** - Crashes, unhandled promises, null references
3. **Code quality third** - Dead code, type safety, performance

## Testing Philosophy
- Tests should test BEHAVIOR, not implementation
- Mock only external services, not internal components
- Every fix needs a test that would have caught it

## Known Gotchas in This Codebase

### 1. MascotRenderer Returns Empty Canvas
The MascotRenderer component uses Rive animations. When Rive fails to load,
it previously returned null or an empty canvas. Always verify visible content.

### 2. Mocked Components in Tests
Most tests mock MascotRenderer like this:
```tsx
vi.mock('../components/mascot/MascotRenderer', () => ({
    default: () => <div>Mascot</div>,
}));
```
This hides real rendering issues. Create integration tests without mocks.

### 3. Background CSS Classes
The app has 4 background themes. Each applies a different CSS class:
- `bg-sky-50` (light)
- `bg-deep-space` (dark gradient)
- `bg-mars-sunset` (orange gradient)
- `bg-galaxy-swirl` (purple gradient)

Verify these actually render visually different backgrounds.

### 4. LocalStorage Dependencies
The app stores state in localStorage:
- `starryAvatar` - selected avatar emoji
- `starryBackground` - selected background ID
- `starryGems` - gem count
- `unlockedAvatars` - array of unlocked avatar IDs
- `unlockedBackgrounds` - array of unlocked background IDs
- `hasParentConsent` - boolean

Tests must clear localStorage in beforeEach.

### 5. Voice Mode
useVoiceMode hook uses Web Speech API. Mock properly:
```tsx
window.SpeechRecognition = vi.fn()
window.speechSynthesis = { speak: vi.fn(), cancel: vi.fn() }
```

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run test` - Run all tests
- `npm run test -- --run src/__tests__/SpecificFile.test.tsx` - Run specific test
- `npm run coverage` - Coverage report

## File Importance (Audit Priority)

### Critical (Audit Thoroughly)
- `src/components/StarlinkHeartApp.tsx` - Main app, complex state
- `src/components/mascot/MascotRenderer.tsx` - Visual fallbacks
- `src/components/mascot/RiveMascot.tsx` - Canvas rendering
- `src/services/geminiService.ts` - AI integration

### High Priority
- `src/components/screens/*.tsx` - Screen components
- `src/components/chat/*.tsx` - Chat UI
- `src/routes/WelcomeScreen.tsx` - Landing page

### Medium Priority
- `src/hooks/*.ts` - Custom hooks
- `src/services/*.ts` - All services
- `src/components/layout/*.tsx` - Layout components

### Lower Priority
- `src/components/common/*.tsx` - Simple shared components
- `src/__tests__/*.tsx` - Tests (review for gaps, not bugs)

## Output Format
For each issue, output:
```
ISSUE: [One line description]
FILE: [path:line]
SEVERITY: [CRITICAL|HIGH|MEDIUM|LOW]
FIX: [What you changed]
TEST: [Test added? Y/N]
```

## Anti-Patterns to Flag
- `// TODO` comments without issue links
- `console.log` statements
- `any` TypeScript type
- `// @ts-ignore` or `// @ts-nocheck`
- `dangerouslySetInnerHTML` without sanitization
- Missing cleanup in useEffect
- Missing deps in useEffect/useCallback/useMemo
- Inline styles that should be Tailwind classes
