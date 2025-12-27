# Starlink Heart — Workspace Index

> Last updated: 2024-12-25
> Status: Development (MVP Phase)

---

## Quick Links

| Document                                                                                                        | Purpose                       | Status         |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------- |
| [Implementation Plan](../../.gemini/antigravity/brain/aeaeba9d-2910-4d80-805e-692e035bbc3a/implementation_plan.md) | Architecture & execution plan | ✅ Approved    |
| [AI Prompts](./ai/prompts.md)                                                                                      | All AI prompts (SSOT)         | ✅ Active      |
| [Safety Rules](./ai/safety-rules.md)                                                                               | Content safety for kids       | ✅ Active      |
| [Store Checklist](./play-store/checklist.md)                                                                       | Play Store submission         | 🔲 Not started |
| [Release Checklist](../ops/release-checklist.md)                                                                   | Build & deploy process        | 🔲 Not started |

---

## Architecture Decisions

| ADR                                      | Title                              | Status      | Date       |
| ---------------------------------------- | ---------------------------------- | ----------- | ---------- |
| [ADR-001](./decisions/ADR-001-capacitor.md) | Use Capacitor for mobile packaging | ✅ Accepted | 2024-12-25 |

---

## Project Structure

```
starlink-heart/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── routes/             # Page components
│   ├── services/           # AI, storage services
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── docs/                   # Documentation (you are here)
│   ├── ai/                 # AI prompts & safety
│   ├── play-store/         # Store submission docs
│   ├── decisions/          # ADRs
│   └── _deprecated/        # Archive
├── ops/                    # Release scripts & checklists
└── android/                # Capacitor (auto-generated)
```

---

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npx cap sync android # Sync Capacitor
npx cap run android  # Run on Android device
```

---

## No-Duplicate Rules

1. **Prompts**: All AI prompts live in `/docs/ai/prompts.md` — code references this via constants
2. **Decisions**: One ADR per decision in `/docs/decisions/`
3. **Updates**: Edit existing docs, don't create new versions
4. **Deprecation**: Move to `/docs/_deprecated/` with header warning

---

## Team

| Role        | Contact |
| ----------- | ------- |
| Product     | TBD     |
| Engineering | TBD     |
| Design      | TBD     |
