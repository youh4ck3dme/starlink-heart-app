# Starlink Heart - AI Tutor App

## 🚀 Quick Start

```bash
npm install
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build
npm run test     # Run tests
npm run coverage # Test coverage report
```

## 📁 Project Structure

```
src/
├── components/
│   ├── screens/           # IntroScreen, DashboardScreen
│   ├── chat/              # ChatView, ChatInput, ChatMessage
│   ├── common/            # StarryAvatarDisplay, ErrorBoundary
│   ├── mascot/            # MascotRenderer, RiveMascot, Starry3D
│   ├── layout/            # Header, LiveStarryBackground
│   └── StarlinkHeartApp.tsx  # Main app component
├── services/
│   ├── geminiService.ts   # Google Gemini AI integration
│   ├── localService.ts    # Firebase mock for local dev
│   └── consentService.ts  # Parent consent handling
├── hooks/
│   └── useVoiceMode.ts    # Speech recognition hook
├── routes/
│   └── WelcomeScreen.tsx  # Landing page
├── __tests__/             # Unit tests (Vitest)
└── types.ts               # TypeScript types
```

## 🧪 Testing

- **Framework:** Vitest + React Testing Library
- **Coverage:** ~70%
- **Test files:** 15 (132 tests)

### Key Test Files:
- `BackgroundModes.test.tsx` - Background/avatar switching
- `VisualFallbacks.test.tsx` - Empty canvas/fallback detection
- `CoolFeatures.test.tsx` - Gem shop, voice mode, PWA

## ⚠️ Known Issues to Check

1. **MascotRenderer** - May show empty canvas if Rive/Spline fails
2. **WelcomeScreen** - Hero image currently disabled for testing
3. **Large chunks** - physics.js and spline-vendor.js exceed 600kB

## 🔧 Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Firebase (Firestore, Storage)
- Google Gemini AI
- Rive animations
- Spline 3D (optional)
