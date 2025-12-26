# Starlink Heart 🌟💙

> Vzdelávacia AI aplikácia pre deti (8-9 rokov) s gamifikáciou a prémiovým UI.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Tests](https://img.shields.io/badge/tests-142%20passing-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

---

## 🚀 Funkcie

### ✅ Hotové (MVP)

- **AI Chat** – Gemini AI asistent pre domáce úlohy
- **Gamifikácia** – XP, levely, denné misie, odznaky
- **Prispôsobenie** – Avatary (Starry, Comet, Robot), pozadia
- **School Dashboard** – Rozvrh, známky, oznamy (Matrix téma)
- **Témy** – Zelená (chlapci) / Ružová (dievčatá)
- **Accessibility** – Aria-labels, reduced motion support
- **PWA Ready** – Manifest, ikony, offline-first design

### 🎨 UI/UX

- Premium glassmorphism dizajn
- Parallax efekty na Welcome Screen
- Animované "educational particles" (2+2, A, B, C...)
- Haptic feedback (mobil)
- Smooth page transitions

---

## 🛠️ Tech Stack

| Kategória          | Technológia                     |
| ------------------- | -------------------------------- |
| **Framework** | React 18 + TypeScript            |
| **Build**     | Vite 5                           |
| **Styling**   | Tailwind CSS                     |
| **Animácie** | Framer Motion                    |
| **AI**        | Google Gemini AI (@google/genai) |
| **3D**        | Spline + Rive                    |
| **Routing**   | React Router v7                  |
| **Testing**   | Vitest + React Testing Library   |
| **Icons**     | Lucide React                     |

---

## 📊 Stav Projektu

| Metrika                      | Hodnota                   |
| ---------------------------- | ------------------------- |
| **Hotovosť**          | ~85%                      |
| **Testy**              | 142 passing (18 súborov) |
| **Build**              | ✅ Úspešný             |
| **Bundle size**        | ~8.5 MB (images + libs)   |
| **Image optimization** | WebP (83% úspora)        |

---

## 🏃 Spustenie

```bash
# Inštalácia
npm install

# Development
npm run dev

# Build
npm run build

# Testy
npm test

# Preview produkcie
npm run preview
```

---

## 📁 Štruktúra

```
src/
├── routes/           # Stránky (Welcome, Home, Auth, Dashboard)
├── components/       # UI komponenty
│   ├── chat/         # Chat komponenty
│   ├── common/       # Zdieľané komponenty
│   ├── gamification/ # XP, misie, levely
│   ├── layout/       # Header, Footer
│   ├── mascot/       # 3D/Rive maskot
│   └── ui/           # Primitívne UI elementy
├── hooks/            # Custom hooks (haptics, voice, toast)
├── services/         # API služby (Gemini, localStorage)
└── assets/           # Obrázky (WebP optimalizované)
```

---

## 🎯 Play Store Release

Viď [TODO.md](./TODO.md) pre kompletný checklist čo treba pred vydaním na Google Play.

---

## 👥 Autori

- **Starlink Heart Team**

---

## 📄 Licencia

Proprietárny software. Všetky práva vyhradené.
