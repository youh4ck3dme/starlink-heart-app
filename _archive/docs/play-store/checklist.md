# Play Store Submission Checklist

> Last updated: 2024-12-25  
> Target: Google Play Store (Android)  
> Status: 🔲 Not started

---

## Pre-Submission

### Developer Account
- [ ] Google Play Developer account created ($25)
- [ ] Organization details verified (if applicable)
- [ ] Contact email configured

### App Configuration
- [ ] Package name set: `com.starlinkheartapp`
- [ ] Version code: `1`
- [ ] Version name: `1.0.0`
- [ ] Target SDK: API 34 (Android 14)
- [ ] Minimum SDK: API 26 (Android 8.0)

---

## Store Listing

### Basic Info
- [ ] App title: "Starlink Heart - Domáce úlohy s AI" (max 30 chars)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Category: Education → Educational
- [ ] Default language: Slovak

### Graphics
| Asset | Spec | Status |
|-------|------|--------|
| App icon | 512x512 PNG, 32-bit, no alpha | [ ] |
| Feature graphic | 1024x500 PNG/JPG | [ ] |
| Phone screenshots | 16:9, min 320px, 2-8 images | [ ] |
| Tablet 7" screenshots | Optional | [ ] |
| Tablet 10" screenshots | Optional | [ ] |

### Contact
- [ ] Developer name
- [ ] Developer email (public)
- [ ] Privacy policy URL

---

## Content Rating

### IARC Questionnaire
- [ ] Violence: None
- [ ] Fear: None  
- [ ] Sexuality: None
- [ ] Language: None
- [ ] Controlled substances: None
- [ ] User interaction: No (local only)
- [ ] Location sharing: No
- [ ] Personal info: No
- [ ] Digital purchases: No

**Expected Rating:** ESRB: Everyone, PEGI: 3

---

## Data Safety Form

### Data Collection
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| App activity | Yes (local) | No | Core functionality |
| App info & performance | Yes | No (unless crash) | Analytics |
| Device identifiers | No | No | — |
| Personal info | No | No | — |
| Location | No | No | — |
| Photos/Videos | Yes (local) | Yes (AI processing) | Homework scanning |

### Security Practices
- [ ] Data encrypted in transit: Yes (HTTPS)
- [ ] Request data deletion: Yes (clear app data)
- [ ] Committed to Play Families Policy: Yes

---

## Families Policy (Required for Kids Apps)

### Enrollment
- [ ] Target audience includes children
- [ ] Families Policy acknowledged
- [ ] Teacher Approved program considered

### Requirements
- [ ] No behavioral advertising
- [ ] Privacy policy addresses children
- [ ] Consent mechanism for under-13
- [ ] Content appropriate for all ages
- [ ] No social features
- [ ] No unrated UGC

---

## Privacy Policy

- [ ] Hosted at public URL
- [ ] Covers children's privacy
- [ ] Lists data collected
- [ ] Explains third-party services (AI APIs)
- [ ] Includes contact information
- [ ] GDPR compliant (EU users)

**URL:** `https://[your-domain]/privacy-policy`

---

## Build & Signing

### App Signing
- [ ] Enrolled in Play App Signing
- [ ] Upload key created
- [ ] Signing key backed up securely

### Release Build
- [ ] AAB generated (not APK)
- [ ] ProGuard/R8 enabled
- [ ] Debug code removed
- [ ] Console logs removed
- [ ] API keys secured

### Testing
- [ ] Internal testing track deployed
- [ ] 5+ testers added
- [ ] No P0/P1 bugs
- [ ] Crash-free rate >99%

---

## Pre-Launch Checklist

### Final Verification
- [ ] App works offline (graceful degradation)
- [ ] All permissions explained
- [ ] Parent mode PIN works
- [ ] Camera permissions handled correctly
- [ ] Error messages user-friendly (Slovak)
- [ ] No placeholder content

### Legal
- [ ] Terms of service (if required)
- [ ] Third-party licenses disclosed
- [ ] Open source attributions

---

## Submission

- [ ] Production release created
- [ ] Countries selected (Slovakia, EU)
- [ ] Pricing set (Free)
- [ ] Release notes written (Slovak)
- [ ] Submit for review

---

## Post-Submission

- [ ] Monitor review status
- [ ] Respond to any rejections within 48h
- [ ] Set up Firebase Crashlytics monitoring
- [ ] Enable Play Console alerts

---

## Notes

```
Rejection reasons to watch for:
- Families Policy violations
- Privacy policy not accessible
- Data Safety form inconsistency
- Missing content ratings
- Broken functionality
```
