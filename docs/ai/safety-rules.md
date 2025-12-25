# Starlink Heart — AI Safety Rules

> **Source of Truth** for content safety  
> Last updated: 2024-12-25  
> Target: Kids age 6-11, EU/COPPA compliant

---

## Safety Principles

1. **Privacy First** — Never ask for or store personal information
2. **Age Appropriate** — All content safe for ages 6-11
3. **Parental Trust** — Transparent, predictable AI behavior
4. **Fail Safe** — When in doubt, refuse and suggest parent help

---

## Input Filtering (Pre-Send)

Block messages containing:

| Category | Examples | Action |
|----------|----------|--------|
| **PII Patterns** | Email, phone, address, full name | Block + warn |
| **Profanity** | Slovak/English curse words | Block + warn |
| **Violence** | Weapons, harm, death | Block + warn |
| **Self-harm** | Suicide, cutting, eating disorders | Block + parent alert |
| **Adult Content** | Sexual terms | Block + warn |

### Blocklist (Partial)

```
# Slovak profanity
kurva, do piče, jebať, hovno, kokot, piča, debil, idiot

# English profanity  
fuck, shit, bitch, ass, damn, crap

# Violence
zabiť, zastreliť, útok, zbran̆, nôž, kill, gun, knife, attack

# Self-harm indicators
nechcem žiť, chcem zomrieť, ublížiť si, suicide, cut myself
```

> [!IMPORTANT]
> Full blocklist in `src/constants/blocklist.ts` (not public)

---

## System Prompt Safety Rules

All AI prompts MUST include:

```text
BEZPEČNOSTNÉ PRAVIDLÁ:
1. Nikdy nežiadaj osobné údaje (meno, adresa, telefón, email, fotka tváre).
2. Nikdy nediskutuj násilie, sebapoškodzovanie, sexuálny obsah.
3. Ak si neistý, povedz: "Toto je otázka pre rodiča! 👨‍👩‍👧"
4. Ak dieťa vyjadrí smútok alebo strach, ponúkni podporu a navrhni rodiča.
5. Nikdy nevykonávaj kód, neposkytuj technické hacky, nevysvetľuj heslá.
```

---

## Output Filtering (Post-Receive)

Check AI responses for:

| Check | Action |
|-------|--------|
| Contains blocklist terms | Replace with fallback response |
| Asks for PII | Replace with fallback response |
| Contains URLs | Strip URLs (except approved domains) |
| Excessive length | Truncate to 2000 chars |
| Missing JSON structure | Return error response |

### Fallback Response

```json
{
  "textResponse": "Ups! Starry sa trochu zamotal. Skús to povedať inak, alebo sa opýtaj rodiča! 🌟",
  "visualAids": ["🛸", "💫"]
}
```

---

## Rate Limiting

| Limit | Value | Reason |
|-------|-------|--------|
| Messages per minute | 10 | Prevent spam |
| Messages per hour | 50 | Cost control |
| Image uploads per hour | 20 | Cost control |
| Hint requests per message | 3 | Encourage thinking |

### Rate Limit Response

```json
{
  "textResponse": "Starry potrebuje chvíľku oddych! 🚀 Skús to znova o minútku.",
  "visualAids": ["⏳", "🌙"]
}
```

---

## Parent Mode Flags

AI can flag responses needing parent review:

```typescript
interface SafetyFlag {
  needsParent: boolean;    // Show in parent log
  reason?: string;         // Why flagged
  severity: 'info' | 'warning' | 'critical';
}
```

### Auto-flag Triggers

- Child mentions being sad/scared/hurt
- Homework involves sensitive topics
- AI confidence below 0.7
- Repeated same question (possible confusion)

---

## Compliance Checklist

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **COPPA** (US) | No PII collection, no tracking | ✅ |
| **GDPR Article 8** (EU) | Parental consent via PIN | ✅ |
| **Google Families Policy** | No behavioral ads, safe content | ✅ |
| **Age verification** | PIN-locked parent mode | ✅ |
| **Data minimization** | Local storage only | ✅ |

---

## Incident Response

If a child reports distress or danger:

1. **Immediate**: Show supportive message + suggest parent
2. **Log**: Record in parent activity log (if enabled)
3. **No escalation**: We do not collect data to report externally

### Distress Response Template

```text
Znie to, že sa ti niečo stalo alebo máš ťažký deň. 💙
Starry je tu pre teba, ale najlepšie ti pomôže niekto dospelý.
Ukáž toto svojmu rodičovi alebo učiteľovi, dobre? 🌟
```

---

## Testing Safety

Before each release:

1. Run blocklist against sample inputs
2. Test edge cases (mixed languages, unicode tricks)
3. Verify rate limits work
4. Check parent mode flags trigger correctly
5. Confirm fallback responses appear

---

## Maintenance

- **Adding to blocklist**: Update `src/constants/blocklist.ts`
- **Updating safety prompts**: Edit system prompt section above
- **Reviewing incidents**: Check parent activity logs monthly
