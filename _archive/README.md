# Starlink Heart 🌟💙

> Vzdelávacia AI aplikácia pre deti (8-9 rokov) s gamifikáciou, prémiovým UI a integráciou EduPage.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Tests](https://img.shields.io/badge/tests-216%20passing-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

---

## 🚀 Funkcie

### ✅ Hotové (MVP)

- **AI Chat** – Gemini AI asistent pre domáce úlohy
- **Gamifikácia** – XP, levely, denné misie, odznaky
- **Prispôsobenie** – Avatary (Starry, Comet, Robot), pozadia
- **School Dashboard** – Demo rozvrh, známky, oznamy (Matrix téma)
- **EduPage Integrácia** – Reálne známky a oznamy zo ZŠ Kostoľany
- **Témy** – Zelená (chlapci) / Ružová (dievčatá)
- **Accessibility** – Aria-labels, reduced motion support
- **PWA Ready** – Manifest, ikony, offline-first design, Service Worker

### 🎨 UI/UX

- Premium glassmorphism dizajn
- Parallax efekty na Welcome Screen
- Animované "educational particles" (2+2, A, B, C...)
- Haptic feedback (mobil)
- Smooth page transitions

---

## 🛠️ Tech Stack

| Kategória          | Technológia                      |
| ------------------ | -------------------------------- |
| **Framework**      | React 18 + TypeScript            |
| **Build**          | Vite 5                           |
| **Styling**        | Tailwind CSS                     |
| **Animácie**       | Framer Motion                    |
| **AI**             | Google Gemini AI (@google/genai) |
| **3D**             | Spline + Rive                    |
| **Routing**        | React Router v7                  |
| **Testing**        | Vitest + React Testing Library + Playwright |
| **Icons**          | Lucide React                     |
| **Backend**        | Express (EduPage proxy)          |
| **Vybavenie**      | Firebase (Auth, Firestore, Storage) |

---

## 📊 Stav Projektu

| Metrika                | Hodnota                   |
| ---------------------- | ------------------------- |
| **Hotovosť**           | ~95%                      |
| **Unit testy**         | 216 passing (24 súborov)  |
| **E2E testy**          | 7 (Playwright)            |
| **Build**              | ✅ Úspešný                |
| **Bundle size**        | ~8.5 MB (images + libs)   |
| **Image optimization** | WebP (83% úspora)         |

---

## 🏃 Spustenie

### Základný dev server (frontend only)
```bash
npm install
npm run dev
```

### S EduPage backendom (full stack)
```bash
npm install
npm run dev:full
```

### Jednotlivé príkazy
```bash
npm run dev          # Frontend dev server
npm run server       # Backend EduPage proxy
npm run build        # Production build
npm run test         # Unit testy
npm run test:e2e     # E2E testy (Playwright)
npm run preview      # Preview produkcie
```

---

## 📁 Štruktúra Projektu

```
src/
├── routes/               # Stránky
│   ├── WelcomeScreen.tsx # Úvodná obrazovka
│   ├── Home.tsx          # Hlavný dashboard
│   ├── SchoolDashboard.tsx # Demo školský dashboard
│   ├── SchoolPage.tsx    # EduPage integrácia (/school)
│   ├── AuthPage.tsx      # Prihlásenie
│   ├── PrivacyPolicy.tsx # Zásady súkromia
│   └── NotFound.tsx      # 404 stránka
├── components/           # UI komponenty
│   ├── chat/             # Chat komponenty
│   ├── common/           # Zdieľané komponenty
│   ├── gamification/     # XP, misie, levely
│   ├── layout/           # Header, Footer
│   ├── mascot/           # 3D/Rive maskot
│   └── ui/               # Primitívne UI elementy
├── core/                 # Abstraktné typy a factory
│   ├── types/
│   │   └── schoolSystem.ts  # ISchoolSystemClient interface
│   └── services/
│       └── schoolSystemFactory.ts
├── features/             # Feature-based moduly
│   └── edupage/
│       ├── services/
│       │   └── edupageClient.ts
│       └── hooks/
│           └── useEdupage.ts
├── hooks/                # Custom hooks (haptics, voice, toast)
├── services/             # API služby (Gemini, localStorage)
├── server/               # Express backend
│   └── index.ts          # EduPage proxy server
└── assets/               # Obrázky (WebP optimalizované)
```

---

## 🏫 EduPage Integrácia

### Podporovaná škola
**ZŠ Kostoľany** – https://zskostolany.edupage.org

### Ako používať
1. Spusti backend: `npm run server`
2. Spusti frontend: `npm run dev`
3. Otvor `/school` route
4. Prihlás sa EduPage údajmi
5. Zobrazí sa dashboard so známkami a oznamami

### Rozšíriteľnosť
Architektúra podporuje pridanie ďalších systémov:
- Bakalári
- iŽiak
- Ďalšie...

Viď `minedu.md` pre kompletnú dokumentáciu.

---

## 🔐 Zabezpečenie (Firebase)

Aplikácia využíva Firebase pre ukladanie dát. Bezpečnosť je vynútená pomocou **Firestore Security Rules**:
- **Hearts**: Deti vidia a upravujú len svoju históriu četov.
- **Users**: Osobné štatistiky (XP, level) sú prístupné len prihlásenému používateľovi.
- **Global**: Verejné dáta sú prístupné len na čítanie.

Pravidlá nájdete v súbore [firestore.rules](file:///Users/youh4ck3dme/Downloads/starlink-homework(1)/firestore.rules).

---

## 🎯 Play Store Checklist

### Hotové ✅
- [x] HTTPS hosting (Vercel)
- [x] manifest.json kompletný
- [x] Service Worker pre offline
- [x] Privacy Policy stránka
- [x] App ikony (všetky veľkosti)

### Potrebné ⏳
- [ ] TWA/Capacitor setup
- [ ] Store listing (screenshots, popis)
- [ ] Age rating (PEGI/ESRB)
- [ ] Podpísanie APK

---

## 🚀 Nasadenie (Deployment)

### Frontend (Vercel)
Aplikácia je optimalizovaná pre Vercel. Pri prepojení repozitára sa automaticky spustí build a nasadenie.

### Backend (Proxy Server)
EduPage proxy beží ako samostatná Node.js služba. Odporúčame nasadiť na:
- Render.com
- Railway.app
- Vlastný VPS (pomocou PM2)

### Firebase Security Rules
Pravidlá nasadíte pomocou Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 📋 Testy

### Unit testy (216)
```bash
npm run test
```

### E2E testy (Playwright)
```bash
npm run test:e2e
```

### Pokryté oblasti
- ✅ All routes (WelcomeScreen, Home, SchoolDashboard, etc.)
- ✅ Components (Chat, Header, Modals)
- ✅ Hooks (useHaptics, useToast, useEdupage)
- ✅ Gamification (XP, Missions, Levels)
- ✅ Accessibility (aria-labels, keyboard nav)

---

## 📄 Licencia

Proprietárny software. Všetky práva vyhradené.

---

## 👥 Autori

- **Starlink Heart Team**

---

*Posledná aktualizácia: 27.12.2024 (v0.1.1)*
