# Release Checklist

> Standard process for releasing Starlink Heart  
> Last updated: 2024-12-25

---

## Pre-Release

### Code Quality
- [ ] All linting passes: `npm run lint`
- [ ] TypeScript compiles: `npm run build`
- [ ] No console.log in production code
- [ ] No hardcoded API keys

### Testing
- [ ] Manual test on Android device
- [ ] Camera flow works
- [ ] Chat flow works
- [ ] Parent mode PIN works
- [ ] Offline behavior verified

### Version Bump
- [ ] Update `package.json` version
- [ ] Update `android/app/build.gradle` versionCode & versionName
- [ ] Update changelog (if maintained)

---

## Build

### Web Build
```bash
npm run build
```

### Capacitor Sync
```bash
npx cap sync android
```

### Android Build (Release)
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Deploy

### Internal Testing
1. Upload AAB to Play Console → Internal testing
2. Add testers
3. Wait for processing
4. Verify installation on test devices

### Production
1. Promote from Internal → Production
2. Set rollout percentage (recommend 10% → 50% → 100%)
3. Write release notes (Slovak)
4. Submit

---

## Post-Release

- [ ] Monitor Crashlytics for new issues
- [ ] Check Play Console for ANRs
- [ ] Respond to user reviews
- [ ] Tag release in git: `git tag v1.0.0 && git push --tags`

---

## Rollback

If critical issues discovered:

1. Play Console → Halt rollout
2. Fix issue in code
3. Increment versionCode
4. Rebuild and resubmit
5. Resume rollout

---

## Scripts

### Quick Release Script
```bash
#!/bin/bash
# scripts/release.sh

set -e

echo "🚀 Building web..."
npm run build

echo "📱 Syncing Capacitor..."
npx cap sync android

echo "📦 Building Android AAB..."
cd android && ./gradlew bundleRelease

echo "✅ Done! Upload: android/app/build/outputs/bundle/release/app-release.aab"
```

---

## Contacts

| Role | Contact |
|------|---------|
| Build issues | Engineering |
| Store issues | Ops |
| Review rejections | Product + Engineering |
