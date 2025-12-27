# TODO – Starlink Heart 🎯

> Kompletný prehľad čo je hotové, čo chýba, a čo treba pre Play Store.

---

## 📊 Celková Hotovosť: ~95%

---

## ✅ HOTOVÉ

### Core Funkcie

- [X] Welcome Screen s parallax efektom
- [X] AI Chat s Gemini AI
- [X] Gamifikácia (XP, levely, denné misie)
- [X] Prispôsobenie avatarov (Starry, Comet, Robot)
- [X] Prispôsobenie pozadí (4 možnosti)
- [X] School Dashboard (rozvrh, známky, oznamy)
- [X] Témy – Zelená/Ružová (Matrix štýl)
- [X] Educational Particles animácie
- [X] Settings modal
- [X] Profile modal
- [X] Error boundary

### UI/UX

- [X] Premium glassmorphism dizajn
- [X] Responsive layout (mobile-first)
- [X] Haptic feedback hook
- [X] Page transitions (Framer Motion)
- [X] Reduced motion support
- [X] Safe area handling (notch, home bar)

### Accessibility

- [X] Aria-labels na interaktívnych prvkoch
- [X] Semantic HTML
- [X] Keyboard navigation (čiastočne)

### Optimalizácie

- [X] Lazy loading routes
- [X] WebP obrázky (83% úspora)
- [X] Code splitting (manual chunks)
- [X] Image resizing (512px avatary)

### Testing

- [X] 142 unit testov
- [X] 18 test súborov
- [X] Component testy
- [X] Integration testy

---

## ⏳ V PRÍPRAVE (15%)

### Pre MVP Release

- [X] Offline mode (Service Worker) ✅
- [ ] Push notifikácie (Firebase Cloud Messaging)
- [ ] Lazy-load Gemini AI (ďalšia ~253KB úspora)
- [X] Skutočné EduPage API prepojenie ✅
- [ ] User authentication (Firebase Auth)
- [ ] Data persistence (Firebase Firestore)
- [X] Firestore Security Rules (Starry-safe) ✅

### Pre Play Store

- [ ] Android manifest (TWA/Capacitor)
- [X] App icons (všetky veľkosti) ✅
- [ ] Splash screen
- [X] Privacy Policy stránka ✅
- [ ] Terms of Service stránka
- [ ] Age rating (PEGI/ESRB)
- [ ] Store listing (screenshots, popis)

---

## 🎯 PLAY STORE CHECKLIST

### Možnosť A: TWA (Trusted Web Activity) – Odporúčané

**Čas: ~2-4 hodiny**

| Požiadavka     | Stav | Poznámka            |
| --------------- | ---- | -------------------- |
| HTTPS hosting   | ✅   | Vercel               |
| manifest.json   | ✅   | Kompletný           |
| Service Worker  | ✅   | Funguje              |
| assetlinks.json | ❌   | Treba vytvoriť      |
| Bubblewrap CLI  | ❌   | Treba nainštalovať |
| Signing key     | ❌   | Treba vygenerovať   |

### Možnosť B: Capacitor – Plná kontrola

**Čas: ~1-2 dni**

| Požiadavka     | Stav | Poznámka               |
| --------------- | ---- | ----------------------- |
| Capacitor init  | ❌   | `npx cap init`        |
| Android project | ❌   | `npx cap add android` |
| Android Studio  | ❌   | Potrebné pre build     |
| Firebase setup  | ❌   | Pre push notifikácie   |
| Native plugins  | ❌   | Camera, haptics, atď.  |

---

## 📋 TESTY POTREBNÉ PRE RELEASE

### Aktuálne: 216 testov ✅ (108% cieľa!)

### Odporúčané minimum: 150-200 testov ✅ PREKROČENÉ

| Oblasť             | Aktuálne | Cieľ | Priorita  |
| ------------------- | --------- | ----- | --------- |
| Unit testy          | 216       | 160   | ⭐⭐⭐ ✅ |
| E2E testy           | 7         | 10-15 | ⭐⭐⭐    |
| Accessibility testy | ✅        | 5-10  | ⭐⭐ ✅   |
| Performance testy   | 0         | 3-5   | ⭐        |

### Chýbajúce testy (priorita):

1. [X] SchoolDashboard.test.tsx (nový komponent) ✅
2. [X] E2E: Welcome → Home flow ✅
3. [X] E2E: Chat conversation ✅
4. [X] E2E: Settings changes persist ✅
5. [ ] Accessibility: Screen reader compatibility

---

## 🔥 PRIORITNÝ BACKLOG

### Tento týždeň ✅ HOTOVÉ

1. [X] Service Worker pre offline
2. [X] manifest.json kompletný
3. [X] SchoolDashboard testy (19 testov)
4. [X] Privacy Policy stránka (/privacy)

### Budúci týždeň

1. [ ] TWA/Capacitor setup
2. [ ] Firebase Auth integrácia
3. [ ] E2E testy
4. [ ] Store listing príprava

---

## 📈 METRIKY PRED RELEASEOM

| Metrika                  | Aktuálne | Cieľ | Status |
| ------------------------ | --------- | ----- | ------ |
| Lighthouse Performance   | 100       | 90+   | ✅     |
| Lighthouse Accessibility | 95+       | 95+   | ✅     |
| Lighthouse PWA           | N/A       | 100   | ⏳     |
| Bundle size (gzip)       | ~1.5MB    | <2MB  | ✅     |
| First Contentful Paint   | 256ms     | <1.5s | ✅     |
| Time to Interactive      | 808ms     | <3s   | ✅     |

---

## 💡 NICE TO HAVE (Po release)

- [ ] Dark/Light mode toggle
- [ ] Viac avatarov
- [ ] Achievements systém
- [ ] Leaderboard
- [ ] Rodičovský panel
- [ ] Multi-language support (EN, CZ)
- [ ] Voice chat s AI
- [ ] AR funkcie

---

*Posledná aktualizácia: 26.12.2024*
