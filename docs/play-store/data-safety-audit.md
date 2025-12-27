# Data Safety Audit - Starlink Heart
**Pre vyplnenie sekcie "Data Safety" v Google Play Console**

*Dátum auditu: 27. decembra 2024*

---

## 1. Prehľad zberu dát

### ✅ Zbierame dáta?
**ÁNO** - Niektoré dáta sú zbierané alebo spracovávané.

### ✅ Zdieľame dáta s tretími stranami?
**ÁNO** - Text otázok je odosielaný do Google Gemini AI.

---

## 2. Typy zbieraných dát

### 2.1 Personal info (Osobné údaje)
| Typ | Zbierame? | Účel | Zdieľané? | Voliteľné? |
|-----|-----------|------|-----------|------------|
| Name (Meno) | ✅ Áno | User-provided nickname | ❌ Nie | ✅ Áno |
| Email | ❌ Nie | - | - | - |
| User IDs | ❌ Nie | - | - | - |
| Address | ❌ Nie | - | - | - |
| Phone number | ❌ Nie | - | - | - |

### 2.2 Photos and videos
| Typ | Zbierame? | Účel | Zdieľané? | Voliteľné? |
|-----|-----------|------|-----------|------------|
| Photos | ✅ Áno | AI homework analysis | ⚠️ Google Gemini | ✅ Áno (opt-in) |
| Videos | ❌ Nie | - | - | - |

### 2.3 App activity
| Typ | Zbierame? | Účel | Zdieľané? | Voliteľné? |
|-----|-----------|------|-----------|------------|
| App interactions | ⚠️ Firebase | Analytics | Google | ❌ Nie |
| In-app search history | ❌ Nie | - | - | - |
| Other user-generated content | ✅ Áno | AI tutoring (chat) | Google Gemini | ❌ Nie |

### 2.4 Device or other identifiers
| Typ | Zbierame? | Účel | Zdieľané? | Voliteľné? |
|-----|-----------|------|-----------|------------|
| Device ID | ⚠️ Firebase | Analytics, Crashlytics | Google | ❌ Nie |

---

## 3. Účel zberu dát

Pre Play Console formulár označte tieto účely:

| Účel | Áno/Nie | Detail |
|------|---------|--------|
| App functionality | ✅ Áno | AI tutoring, personalization |
| Analytics | ⚠️ Ak Firebase | Firebase Analytics |
| Developer communications | ❌ Nie | - |
| Advertising or marketing | ❌ Nie | Žiadne reklamy |
| Fraud prevention, security | ❌ Nie | - |
| Personalization | ✅ Áno | Avatar, theme, name |
| Account management | ❌ Nie | Bez accounts |

---

## 4. Bezpečnostné praktiky

### 4.1 Je prenos dát šifrovaný?
**✅ ÁNO** - Všetka komunikácia cez HTTPS.

### 4.2 Môžu používatelia požiadať o vymazanie dát?
**✅ ÁNO** - V aplikácii: Nastavenia → "Vymazať všetky dáta"

### 4.3 Webový odkaz na vymazanie účtu (Required since Dec 2023)
**⚠️ TREBA VYTVORIŤ** - URL pre Play Console: `https://starlinkheart.com/delete-account`

---

## 5. Tretie strany (SDK)

### 5.1 Google Gemini AI (@google/genai)
- **Dáta:** User-generated content (chat messages, photos)
- **Účel:** App functionality (AI tutoring)
- **Deklarovať:** "Other user-generated content" → "App functionality"

### 5.2 Firebase (Ak je aktívne)
- **Dáta:** Device ID, App interactions
- **Účel:** Analytics
- **Deklarovať:** "Device or other identifiers" → "Analytics"

### 5.3 Capacitor Haptics (@capacitor/haptics)
- **Dáta:** Žiadne
- **Deklarovať:** Nič

---

## 6. Compliance Checklist

| Požiadavka | Status | Akcia |
|------------|--------|-------|
| Privacy Policy URL | ⚠️ Potrebné | Hostovať na starlinkheart.com/privacy |
| In-app delete button | ✅ Hotové | SettingsModal.tsx |
| Web delete URL | ⚠️ Potrebné | Vytvoriť starlinkheart.com/delete-account |
| HTTPS encryption | ✅ Hotové | Vite/Vercel default |
| COPPA compliance | ✅ Hotové | No personal data from kids without consent |

---

## 7. Odpovede pre Play Console formulár

**Copy-paste odpovede:**

### Does your app collect or share any of the required user data types?
> **Yes**

### Is all of the user data collected by your app encrypted in transit?
> **Yes**

### Do you provide a way for users to request that their data is deleted?
> **Yes**
> 
> In-app: Settings → "Vymazať všetky dáta"
> Web: https://starlinkheart.com/delete-account

### Data types collected:
1. **Name** - Collected, Not shared, Optional, Purpose: App functionality
2. **Photos** - Collected, Shared with Google, Optional, Purpose: App functionality
3. **Other user-generated content** - Collected, Shared with Google, Required, Purpose: App functionality
4. **Device or other IDs** - Collected (if Firebase), Shared with Google, Required, Purpose: Analytics

---

*Tento dokument slúži ako referencia pre vyplnenie Data Safety v Google Play Console.*
