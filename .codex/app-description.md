# Starlink Heart - Application Description

## 🎯 What is Starlink Heart?

**Starlink Heart** is an AI-powered educational mobile web application designed specifically for Slovak children aged 8-9 years old. It combines the engagement of modern mobile games with the educational power of Google's Gemini AI to create a personalized tutoring experience.

---

## 🌟 Core Concept

The app presents learning as a **space adventure mission**. Children interact with "Starry" - an AI companion (mascot) who helps them with:
- **Mathematics** - problem solving, basic operations
- **Slovak language** - grammar, vocabulary, reading
- **English** - basic phrases, vocabulary building
- **General knowledge** - age-appropriate Q&A

The entire experience is gamified with:
- 💎 **Gems** - virtual currency earned by learning
- 🎨 **Avatars** - collectible emoji characters
- 🌌 **Backgrounds** - unlockable space themes
- 🏆 **Missions** - learning sessions framed as adventures

---

## 🎮 User Flow

```
1. WELCOME SCREEN
   └── "Začať misiu 🚀" button
   
2. INTRO SCREEN  
   └── First-time user sees mascot + START button
   
3. DASHBOARD
   ├── 🚀 New Mission → Start chat with AI
   ├── 🎒 My Profile → View stats and achievements
   ├── ⚙️ Settings → Customize avatar/background
   └── 🎓 Coach Mode → Toggle educational guidance level
   
4. CHAT VIEW (Main Interface)
   ├── Send text messages to AI
   ├── Take/upload photos for AI analysis
   ├── Receive hints and explanations
   └── Earn gems for correct answers
```

---

## 👨‍👩‍👧 Target Users

### Primary: Children (8-9 years old)
- Slovak-speaking
- Primary school students
- Need homework help
- Want fun learning experience

### Secondary: Parents
- Want to monitor child's learning
- Need parental consent for AI usage
- Can access "Parent Guide" for each AI response

---

## 🔧 Technical Features

### AI Integration
- **Google Gemini AI** for natural language tutoring
- Context-aware responses based on child's age
- Safety filters for child-appropriate content
- Multi-modal: accepts text + images

### Visual Customization
- 4 background themes (Sky, Space, Mars, Galaxy)
- 5 avatar characters with prices
- Gem economy for unlocking content

### Voice Features
- Speech-to-text input
- Text-to-speech for AI responses
- Voice mode toggle

### PWA Capabilities
- Installable on mobile devices
- Offline support with Service Worker
- Camera access for homework photos

---

## 🇸🇰 Slovak Language

The entire UI is in Slovak:
- "Starlink Heart" - brand name (English for international feel)
- "Tvoj osobný vesmírny sprievodca" - "Your personal space guide"
- "Nová Misia" - "New Mission"
- "Môj Profil" - "My Profile"
- "Centrum" - "Settings"
- "Začať misiu" - "Start mission"

---

## 🎨 Design Philosophy

### Game-like Aesthetics
- Bright, vibrant colors
- Rounded, playful UI elements
- Space/cosmic theme throughout
- Animated elements (stars, particles)

### Mobile-First
- Optimized for phone screens
- Touch-friendly large buttons
- Safe areas for notched devices
- Responsive up to tablet size

### Accessibility
- High contrast text
- Large tap targets
- Reduced motion support
- Clear visual hierarchy

---

## 📊 Success Metrics

The app is successful when:
1. Children engage with AI for 10+ minutes per session
2. Gem economy encourages return visits
3. Parents feel comfortable with AI interaction
4. Learning outcomes improve measurably

---

## ⚠️ Content Guidelines

All AI responses must:
- Be age-appropriate (8-9 year olds)
- Use simple Slovak language
- Encourage learning, not give direct answers
- Include positive reinforcement
- Never include inappropriate content

---

## 🔐 Privacy & Safety

- **Parental Consent** required before AI usage
- **No account required** - all data in localStorage
- **No personal data** collected server-side
- **Firebase** used only for session persistence (optional)

---

## 🚀 Technical Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Build | Vite |
| AI | Google Gemini API |
| Storage | localStorage + Firebase (optional) |
| Animations | Rive, CSS animations |
| 3D | Spline (optional) |
| Testing | Vitest + React Testing Library |
| PWA | Service Worker |

---

*Starlink Heart - Making learning an adventure! 🚀✨*
