# Component Visual Requirements

This document describes what each component should look like when rendered correctly.

## MascotRenderer

### Mode: `image`

- Shows `welcome-hero.png` image
- Full width/height container
- Object-fit: contain

### Mode: `rive`

- Shows animated Rive mascot from `/animations/starry.riv`
- If Rive fails: Shows ✨ emoji centered
- NEVER shows empty/gray canvas

### Mode: `spline3d`

- Only renders if splineScene URL is valid
- If not configured: Falls back to Rive mode
- If Rive also fails: Shows ✨ emoji

## StarryAvatarDisplay

- Shows the provided emoji avatar
- Animated on `isExcited` (rotate 360°, scale 1.25)
- Bouncing on `isThinking`
- Size controlled by `size` prop (Tailwind class)

## Background Themes

### `sky` (ID: 'sky')

- Light blue: `bg-sky-50`
- Text: Dark (`text-gray-800`)
- Glass effect: `bg-white/70`

### `space` (ID: 'space')

- Dark gradient: `bg-deep-space`
- Linear gradient from #0b1226 to #060819
- Text: Light (`text-gray-100`)

### `mars` (ID: 'mars')

- Orange/red gradient: `bg-mars-sunset`
- Sunset colors from dark top to orange bottom
- Text: White

### `galaxy` (ID: 'galaxy')

- Purple cosmic gradient: `bg-galaxy-swirl`
- Deep purple to pink tones
- Text: White

## DashboardScreen Top Bar

Left: Avatar badge (emoji + "Kadet" text)
Center: Compact avatar in circle (should show emoji, NOT canvas)
Right: Gems badge (💎 + count)

## IntroScreen

- Content vertically AND horizontally centered
- Large avatar emoji (8rem)
- "Starlink Heart" gradient text title
- "Tvoj osobný vesmírny sprievodca." subtitle
- Yellow START button with rocket emoji

## WelcomeScreen

5 layers:

1. Stars background (twinkling dots)
2. Floating particles (A, B, 2+2, ?)
3. Hero image (CURRENTLY DISABLED)
4. Gradient overlay (fade from bottom)
5. CTA button ("Začať misiu 🚀")
