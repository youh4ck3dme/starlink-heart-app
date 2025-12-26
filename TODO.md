# TODO – Starlink Heart 🎯

> Kompletný prehľad čo je hotové, čo chýba, a čo treba pre Play Store.

---

## 📊 Celková Hotovosť: ~95%

---

## ✅ HOTOVÉ

### Core Funkcie
- [x] Welcome Screen s parallax efektom
- [x] AI Chat s Gemini AI
- [x] Gamifikácia (XP, levely, denné misie)
- [x] Prispôsobenie avatarov (Starry, Comet, Robot)
- [x] Prispôsobenie pozadí (4 možnosti)
- [x] School Dashboard (rozvrh, známky, oznamy)
- [x] Témy – Zelená/Ružová (Matrix štýl)
- [x] Educational Particles animácie
- [x] Settings modal
- [x] Profile modal
- [x] Error boundary

### UI/UX
- [x] Premium glassmorphism dizajn
- [x] Responsive layout (mobile-first)
- [x] Haptic feedback hook
- [x] Page transitions (Framer Motion)
- [x] Reduced motion support
- [x] Safe area handling (notch, home bar)

### Accessibility
- [x] Aria-labels na interaktívnych prvkoch
- [x] Semantic HTML
- [x] Keyboard navigation (čiastočne)

### Optimalizácie
- [x] Lazy loading routes
- [x] WebP obrázky (83% úspora)
- [x] Code splitting (manual chunks)
- [x] Image resizing (512px avatary)

### Testing
- [x] 142 unit testov
- [x] 18 test súborov
- [x] Component testy
- [x] Integration testy

---

## ⏳ V PRÍPRAVE (15%)

### Pre MVP Release
- [x] Offline mode (Service Worker) ✅
- [ ] Push notifikácie (Firebase Cloud Messaging)
- [ ] Lazy-load Gemini AI (ďalšia ~253KB úspora)
- [ ] Skutočné EduPage API prepojenie
- [ ] User authentication (Firebase Auth)
- [ ] Data persistence (Firebase Firestore)

### Pre Play Store
- [ ] Android manifest (TWA/Capacitor)
- [x] App icons (všetky veľkosti) ✅
- [ ] Splash screen
- [x] Privacy Policy stránka ✅
- [ ] Terms of Service stránka
- [ ] Age rating (PEGI/ESRB)
- [ ] Store listing (screenshots, popis)

---

## 🎯 PLAY STORE CHECKLIST

### Možnosť A: TWA (Trusted Web Activity) – Odporúčané
**Čas: ~2-4 hodiny**

| Požiadavka | Stav | Poznámka |
|------------|------|----------|
| HTTPS hosting | ✅ | Vercel |
| manifest.json | ✅ | Kompletný |
| Service Worker | ✅ | Funguje |
| assetlinks.json | ❌ | Treba vytvoriť |
| Bubblewrap CLI | ❌ | Treba nainštalovať |
| Signing key | ❌ | Treba vygenerovať |

### Možnosť B: Capacitor – Plná kontrola
**Čas: ~1-2 dni**

| Požiadavka | Stav | Poznámka |
|------------|------|----------|
| Capacitor init | ❌ | `npx cap init` |
| Android project | ❌ | `npx cap add android` |
| Android Studio | ❌ | Potrebné pre build |
| Firebase setup | ❌ | Pre push notifikácie |
| Native plugins | ❌ | Camera, haptics, atď. |

---

## 📋 TESTY POTREBNÉ PRE RELEASE

### Aktuálne: 161 testov ✅
### Odporúčané minimum: 150-200 testov ✅ SPLNENÉ

| Oblasť | Aktuálne | Cieľ | Priorita |
|--------|----------|------|----------|
| Unit testy | 161 | 160 | ⭐⭐⭐ ✅ |
| E2E testy | 7 | 10-15 | ⭐⭐⭐ |
| Accessibility testy | ~ | 5-10 | ⭐⭐ |
| Performance testy | 0 | 3-5 | ⭐ |

### Chýbajúce testy (priorita):
1. [x] SchoolDashboard.test.tsx (nový komponent) ✅
2. [x] E2E: Welcome → Home flow ✅
3. [x] E2E: Chat conversation ✅
4. [x] E2E: Settings changes persist ✅
5. [ ] Accessibility: Screen reader compatibility

---

## 🔥 PRIORITNÝ BACKLOG

### Tento týždeň ✅ HOTOVÉ
1. [x] Service Worker pre offline
2. [x] manifest.json kompletný
3. [x] SchoolDashboard testy (19 testov)
4. [x] Privacy Policy stránka (/privacy)

### Budúci týždeň
1. [ ] TWA/Capacitor setup
2. [ ] Firebase Auth integrácia
3. [ ] E2E testy
4. [ ] Store listing príprava

---

## 📈 METRIKY PRED RELEASEOM

| Metrika | Aktuálne | Cieľ | Status |
|---------|----------|------|--------|
| Lighthouse Performance | ? | 90+ | ❓ |
| Lighthouse Accessibility | ? | 95+ | ❓ |
| Lighthouse PWA | ? | 100 | ❓ |
| Bundle size (gzip) | ~2.6MB | <2MB | ⚠️ |
| First Contentful Paint | ? | <1.5s | ❓ |
| Time to Interactive | ? | <3s | ❓ |

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
