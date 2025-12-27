# ADR-001: Use Capacitor for Mobile Packaging

## Status

**Accepted** — 2024-12-25

## Context

We need to ship Starlink Heart to Google Play Store as an Android app. Our codebase is React + TypeScript + Vite. We evaluated four options:

| Option | Code Reuse | Native Access | Play Store | Team Skills |
|--------|------------|---------------|------------|-------------|
| PWA | 100% | Limited | ❌ No ratings | ✅ Known |
| Capacitor | 100% | ✅ Full | ✅ Yes | ✅ Known |
| React Native | 0% (rewrite) | ✅ Full | ✅ Yes | ❌ New |
| Flutter | 0% (rewrite) | ✅ Full | ✅ Yes | ❌ New |

## Decision

Use **Capacitor** to wrap our existing React app in a native Android shell.

## Rationale

1. **No rewrite required** — entire codebase ports directly
2. **Native camera access** — required for homework photo scanning
3. **Play Store distribution** — full APK/AAB support
4. **Fast timeline** — days to integrate, not weeks
5. **Future iOS** — same wrapper works for iOS later

## Consequences

### Positive
- Ship to Play Store within 2 weeks
- Maintain single codebase
- Native plugins for camera, storage, push

### Negative
- WebView performance slightly lower than native
- ~5MB overhead for Capacitor runtime
- Some UI animations may need optimization

### Risks
- WebView-specific bugs on older devices
- Plugin compatibility issues (mitigate: test on Android 10+)

## Alternatives Considered

### PWA (Rejected)
- No Play Store ratings/reviews
- No reliable push notifications
- Camera permissions less stable

### React Native (Rejected)
- Complete rewrite required
- Team would need to learn new framework
- Timeline incompatible with MVP goals

### Flutter (Rejected)
- Same issues as React Native
- Dart is unfamiliar to team

## Implementation

1. Install Capacitor: `npm install @capacitor/core @capacitor/cli`
2. Initialize: `npx cap init`
3. Add Android: `npx cap add android`
4. Build: `npm run build && npx cap sync android`
5. Run: `npx cap run android`

## References

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Implementation Plan](../../.gemini/antigravity/brain/aeaeba9d-2910-4d80-805e-692e035bbc3a/implementation_plan.md)
