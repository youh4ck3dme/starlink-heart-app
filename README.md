# Starlink Heart

A cosmic homework project featuring a gamified AI chat interface, educational tools for children, and a premium space-themed UI.

## Features

- **Welcome Screen**: Engaging animated entry point with a floating hero image and vignette effects.
- **Mission Control (Home)**: The core `StarlinkHeartApp` providing:
    - AI Chat with "Starry" the avatar.
    - Gamified gem system.
    - Camera integration ("Scan Text").
    - Parent Guide translation mode.
- **Tech Stack**: React, TypeScript, Tailwind CSS, Vite.

## Project Structure

```bash
src/
├── routes/
│   ├── WelcomeScreen.tsx  # Animated landing page
│   └── Home.tsx           # Wrapper for the main app
├── components/
│   └── StarlinkHeartApp.tsx # Core logic and UI
├── assets/
│   └── welcome.jpeg       # Hero image
└── ...
```

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## Customization

- **Animations**: Configured in `tailwind.config.js` (`fade-in-up`, `float`, `pulse-glow`).
- **Styles**: Global resets in `src/index.css`.
