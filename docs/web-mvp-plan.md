# Web MVP Diagnosis & 6-Step Plan

> Date: 2024-12-25
> Goal: Finish usable web MVP for kids (age 8-9), Slovak, AI homework helper

---

## A) Repo Diagnosis Summary

| Area                               | Findings                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Routing**                  | 2 routes:`/` (WelcomeScreen), `/home` (Home→StarlinkHeartApp)                                |
| **Monolith**                 | `StarlinkHeartApp.tsx` = 1005 lines, 30+ state vars, 5 modals inline                            |
| **Top 3 extraction targets** | 1) ChatView (~300 lines), 2) CameraModal (~100 lines), 3) SettingsModal (~150 lines)              |
| **Welcome screen**           | `src/routes/WelcomeScreen.tsx` (98 lines), loads `src/assets/image.png`, has parallax - works |
| **AI integration**           | `geminiService.ts` (302 lines), 4 functions, prompts embedded inline, no safety filter layer    |
| **Local storage**            | `localService.ts` (188 lines) mocks Firestore API over localStorage key `starlink_hearts_db`  |
| **Persists**                 | Chat history, gems (`starryGems`), avatar, background, API key                                  |
| **Parent Mode**              | ❌ No PIN lock exists                                                                             |
| **Delete data**              | ❌ No "clear data" button exists                                                                  |
| **Parent Notice**            | ❌ No COPPA/GDPR notice exists                                                                    |

---

## B) 6-Step MVP Plan

| # | Step                                      | Outcome                                          | Files Changed                                                                                                 |
| - | ----------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 1 | ✅**Add input safety filter**       | Block profanity/PII before AI call               | `src/services/safetyFilter.ts` (new), `geminiService.ts`                                                  |
| 2 | ✅**Add Parent Notice modal**       | First-launch consent for kids compliance         | `src/services/consentService.ts` (new), `src/components/ParentNotice.tsx` (new), `StarlinkHeartApp.tsx` |
| 3 | ✅**Add Delete Data button**        | Settings → "Vymazať dáta" clears localStorage | `StarlinkHeartApp.tsx` (Settings section)                                                                   |
| 4 | ✅**Extract ChatView component**    | Created components, ready for integration        | `src/components/chat/ChatView.tsx` (new), `ChatMessage.tsx` (new), `ChatInput.tsx` (new)                |
| 5 | ✅**Extract CameraModal component** | Reduce monolith by ~100 lines                    | `src/components/camera/CameraModal.tsx` (new)                                                               |
| 6 | ✅**Add basic error boundary**      | Graceful crash handling for kids                 | `src/components/common/ErrorBoundary.tsx` (new), `main.tsx` (wraps App)                                   |

---

## C) Step #1: Add Input Safety Filter

**Goal:** Block profanity and PII patterns client-side before sending to AI.

**Files:**

- `src/services/safetyFilter.ts` (NEW, ~60 lines)
- `src/services/geminiService.ts` (MODIFY, add import + filter call)

**Rationale:** Cheapest compliance win - prevents kids from accidentally sending PII to AI.

---

## D) Features (Beta)

- **Hlasový režim:** Implementované diktovanie (STT) a čítanie (TTS) pomocou Web Speech API. Dostupné v nastaveniach ako "Beta".
