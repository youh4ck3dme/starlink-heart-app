Tu máš **runtime pravidlá (za behu)** tak, aby si to mal nepriestrelné a zároveň pohodlné pre teba

---

## 1) Policy Engine (runtime) – 3 režimy a hotovo

### Režimy

* **KID** (default): *Hint Ladder*, žiadne hotové riešenia hneď
* **PARENT/TEACHER**: môže odhaliť riešenie (napr. cez gate)
* **DEV**: môže všetko (tvoj warp drive mód)

Najlepšie: `mode` posielaš do AI *pri každom requeste* (server-side), nie len v UI (aby sa to nedalo obísť).

```ts
type Mode = 'kid' | 'parent' | 'teacher' | 'dev';
```

---

## 2) “Hint Ladder” ako stavový automat (FSM)

Udržiavaš si stav per task (napr. per message thread):

```ts
type LadderStep = 1 | 2 | 3 | 4;

type PolicyState = {
  mode: Mode;
  step: LadderStep;        // kde sme v ladderi
  attempts: number;        // koľko pokusov dieťa spravilo
  explicitRevealAsked: boolean; // dieťa vyslovene chce odpoveď?
};
```

### Pravidlá (jednoduché a účinné)

* V **kid** móde:

  * step 1–3 = nápovedy + vyžiadať pokus
  * step 4 (full answer) iba keď:

    * dieťa napíše **„ukáž odpoveď“** (alebo ekvivalent), **a**
    * buď prejde “Answer Gate” (PIN rodiča / teacher mode),
    * alebo má **2+ neúspešné pokusy** (a aj vtedy radšej „krátke riešenie + vysvetlenie“)
* V **dev** móde: môže rovno riešenie.

---

## 3) Detekcia “solve-for-me” intentu (bez AI magie)

Nepotrebuješ LLM na intent. Stačí lacný regex/keyword:

```ts
const SOLVE_INTENT = /(vyrieš|urob|napíš|daj odpoveď|hotové|sprav to za mňa|vypočítaj za mňa|pošli riešenie)/i;
const REVEAL_INTENT = /(ukáž odpoveď|odhal odpoveď|chcem výsledok|daj finále)/i;
```

* ak `SOLVE_INTENT` a mode==kid → spusti ladder step 1
* ak `REVEAL_INTENT` → nastav `explicitRevealAsked=true` a vyžiadaj gate

---

## 4) Answer Gate (aby Starry nevysypal “všetko”)

UI tlačidlo: **„Ukáž odpoveď“**

* v **kid** móde spustí parent gate (PIN / dlhé podržanie / jednoduchá rodičovská otázka)
* v **teacher/dev** móde odhalí rovno

Server-side musí kontrolovať:

* či user má `mode != kid` alebo má `parentGateVerified=true` v posledných X minútach

---

## 5) Prompt “hard guardrail” (Gemini to musí cítiť v kostiach)

Do **system/developer** promptu (stručné, aby to fungovalo stále):

```text
You are a kid-safe tutor for ages 8–9 (Slovak).
Mode: {MODE}

If Mode is "kid":
- Never give the full final answer immediately when asked to solve.
- Use Hint Ladder steps: (1) strategy, (2) one small example, (3) ask child for attempt + check, (4) reveal only if explicitly asked AND AnswerGate is verified OR after 2 failed attempts.
- Always end with one simple question asking for the child’s attempt.
If Mode is "dev" or "teacher" or "parent":
- You may provide direct solutions, but still keep explanations short and friendly.

Output must include a single field: response_type = hint|check|reveal
```

A ty si v kóde vynútiš správanie podľa `response_type`. Keď LLM “ušlo” a dalo reveal v kid mode → ty to zahodíš a preformuluješ do hintu (hard safety net).

---

## 6) “Hard Safety Net” v appke (najdôležitejšie!)

Aj keby Gemini ušlo (stáva sa), ty na výstupe spravíš kontrolu:

```ts
function enforcePolicy(mode: Mode, llmText: string) {
  if (mode === 'kid' && looksLikeFullAnswer(llmText)) {
    return makeHintInstead(llmText);
  }
  return llmText;
}
```

**looksLikeFullAnswer** môže byť:

* príliš veľa enumerovaných výsledkov
* “(1)… (2)… (3)…“ pattern
* “správne poradie je:” + zoznam

---

## 7) Minimal UI texty (aby to bolo prirodzené)

* **KID**: „Pomôžem ti krok po kroku 💫 Napíš mi prvé 2 slová, ktoré si myslíš, že sú správne.“
* **Reveal button**: „Ukáž odpoveď (pre rodiča)“
* **After attempts**: „Skúsime to spolu: ty napíš 3, ja skontrolujem ✅“

---

## 8) Rýchly “Google-proof” argument

Toto nastavenie podporuje:

* učenie krokovaním (nie “do it for me”)
* rodičovský dohľad (answer gate)
* znižuje riziko “AI doing homework” (častý red flag)

---

Ak chceš, pošlem ti presne:

1. `policy.ts` (FSM + intent + enforce)
2. `buildPrompt.ts` (mode-aware prompt)
3. `AnswerGateModal.tsx` (PIN + timeout)

Len povedz: chceš gate cez **PIN** (najčistejšie), alebo cez **“parent question”** (ľahšie, ale menej secure)?

* `POST /api/parent/verify-pin` ✅
* `POST /api/tutor` (Gemini proxy + mode injection + rate limit + JSON output guard) ✅

> **Dôležité:** `mode` sa určuje **server-side** (nikdy never klientovi). Klient môže poslať “chcem dev”, ale server povie „nice try“.

---

# 1) Inštalácia balíkov

```bash
npm i express cors helmet zod express-rate-limit argon2
npm i -D tsx typescript @types/express @types/cors
```

---

# 2) `.env` (príklad)

```env
PORT=8787
CORS_ORIGIN=http://localhost:5173
PARENT_PIN_HASH=$argon2id$v=19$m=65536,t=3,p=1$...   # hash pin-u
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-1.5-flash
```

### Ako spravíš `PARENT_PIN_HASH`

Najľahšie v node repl / malý skript:

```js
// node
const argon2 = require('argon2');
argon2.hash("1234").then(console.log);
```

---

# 3) `server/index.ts` (hotové)

```ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import argon2 from "argon2";

type Mode = "kid" | "parent" | "teacher" | "dev";
type ResponseType = "hint" | "check" | "reveal";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);

// --- Simple auth stub (nahraď Firebase/JWT) ---
function getUserFromRequest(req: express.Request): { userId: string; role: Mode } {
  // TODO: over token, claims…
  // teraz len demo: default kid
  const role = (req.header("x-role") as Mode) || "kid";
  const userId = req.header("x-user") || "anon";
  // server môže ignorovať "dev" ak to nechceš povoliť:
  const allowed: Mode[] = ["kid", "parent", "teacher", "dev"];
  return { userId, role: allowed.includes(role) ? role : "kid" };
}

function isGateValid(until?: number) {
  return typeof until === "number" && until > Date.now();
}

// --- Rate limit: jemné, kid-safe ---
const tutorLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getUserFromRequest(req).userId,
});

// --- Schemas ---
const VerifyPinSchema = z.object({ pin: z.string().min(3).max(12) });

const TutorSchema = z.object({
  userText: z.string().min(1).max(2000),
  // klient môže poslať, ale server rozhodne:
  clientModeHint: z.enum(["kid", "parent", "teacher", "dev"]).optional(),
  policy: z
    .object({
      step: z.number().int().min(1).max(4).optional(),
      attempts: z.number().int().min(0).max(10).optional(),
      explicitRevealAsked: z.boolean().optional(),
      gateVerifiedUntil: z.number().optional(),
    })
    .optional(),
});

function looksLikeFullAnswer(text: string) {
  const enumList = /(^|\n)\s*(\d+[\)\.]|•|\-)\s+/g;
  const cues = /(správne\s+poradie|hotové\s+riešenie|výsledok\s+je|odpoveď\s+je|tu\s+to\s+máš)/i;
  const listHits = (text.match(enumList) || []).length;
  return cues.test(text) || listHits >= 4;
}

function makeHintInstead() {
  return [
    "Jasné! Pôjdeme krok po kroku 🙂",
    "Najprv mi napíš **prvé písmená** slov (napr. C, F, G...).",
    "Potom ich spolu zoradíme podľa abecedy.",
    "Aké sú prvé písmená tých slov?",
  ].join("\n");
}

// --- Policy decision (server-side minimal) ---
function decide(mode: Mode, policy: any, userText: string) {
  const solveIntent = /(vyrieš|urob|sprav|daj\s+odpoveď|hotové|vypočítaj|za\s+mňa)/i.test(userText);
  const revealIntent = /(ukáž\s+odpoveď|odhal\s+odpoveď|chcem\s+výsledok|daj\s+finále)/i.test(userText);

  const attempts = policy?.attempts ?? 0;
  const gateOk = isGateValid(policy?.gateVerifiedUntil);
  const explicit = !!policy?.explicitRevealAsked || revealIntent;

  // dev/teacher/parent: reveal allowed
  if (mode !== "kid") {
    return { allowReveal: true, responseTypeHint: (solveIntent || revealIntent) ? "reveal" : "hint" as ResponseType, requireGate: false };
  }

  // kid:
  if (explicit) {
    if (gateOk || attempts >= 2) {
      return { allowReveal: true, responseTypeHint: "reveal" as ResponseType, requireGate: !gateOk && attempts < 2 };
    }
    return { allowReveal: false, responseTypeHint: "hint" as ResponseType, requireGate: true };
  }

  if (solveIntent) {
    const step = Math.min(3, Math.max(1, policy?.step ?? 1));
    return { allowReveal: false, responseTypeHint: (step === 3 ? "check" : "hint") as ResponseType, requireGate: false };
  }

  return { allowReveal: false, responseTypeHint: "hint" as ResponseType, requireGate: false };
}

function buildSystemPrompt(mode: Mode, policy: any, desired: ResponseType) {
  const step = policy?.step ?? 1;
  const attempts = policy?.attempts ?? 0;

  return `
You are Starlink Heart, a kid-safe tutor for ages 8–9 in Slovak.
Mode: ${mode}
HintLadderStep: ${step}
Attempts: ${attempts}
DesiredResponseType: ${desired}

RULES:
- If Mode is "kid":
  - Never give full final answers immediately when asked to solve.
  - Use Hint Ladder: (1) strategy, (2) one small example, (3) ask child for attempt + check, (4) reveal only if explicitly asked AND AnswerGate verified OR after 2 failed attempts.
  - End with exactly ONE short question asking for the child's attempt.
- If Mode is "dev" or "teacher" or "parent": direct solutions allowed, keep it short.

OUTPUT FORMAT (MUST be valid JSON, no markdown):
{"response_type":"hint|check|reveal","text":"..."}
`.trim();
}

// --- Gemini call (REST; držíme genericky) ---
async function callGemini(system: string, userText: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  // Google GenAI REST endpoint sa môže líšiť podľa SDK/verzie,
  // preto to držíme ako placeholder a ty si to napojíš na svoj existujúci proxy/SDK.
  // Ak už máš vlastný backend wrapper, sem len zavolaj wrapper.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: userText }] }],
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini error: ${res.status} ${t}`);
  }

  const data: any = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  return text;
}

// --- 1) Parent PIN verify ---
app.post("/api/parent/verify-pin", async (req, res) => {
  const parsed = VerifyPinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false });

  const pin = parsed.data.pin;
  const hash = process.env.PARENT_PIN_HASH;
  if (!hash) return res.status(500).json({ ok: false });

  const ok = await argon2.verify(hash, pin).catch(() => false);
  // ak chceš, tu vráť aj gate TTL
  return res.json({ ok });
});

// --- 2) Tutor proxy ---
app.post("/api/tutor", tutorLimiter, async (req, res) => {
  const parsed = TutorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ response_type: "hint", text: "Skús to prosím ešte raz 🙂" });

  const { userId, role } = getUserFromRequest(req);
  const { userText, policy } = parsed.data;

  // rozhoduje server:
  const mode: Mode = role;

  const decision = decide(mode, policy, userText);
  if (decision.requireGate) {
    return res.json({
      response_type: "hint",
      text: "Ak chceš hotovú odpoveď, popros rodiča o PIN 🙂 Chceš zatiaľ nápovedu krok po kroku?",
    });
  }

  const system = buildSystemPrompt(mode, policy, decision.responseTypeHint);

  try {
    let llmRaw = await callGemini(system, userText);

    // očakávame JSON – ak nie, zabalíme
    let response_type: ResponseType = decision.responseTypeHint;
    let text = llmRaw;

    try {
      const obj = JSON.parse(llmRaw);
      if (obj?.text) text = String(obj.text);
      if (obj?.response_type) response_type = obj.response_type;
    } catch {
      // ok, llm neposlalo JSON, zoberieme text
    }

    // hard safety net:
    if (mode === "kid" && !decision.allowReveal && looksLikeFullAnswer(text)) {
      response_type = "hint";
      text = makeHintInstead();
    }

    return res.json({ response_type, text, meta: { userId } });
  } catch (e) {
    return res.json({ response_type: "hint", text: "Ups! Skúsme to znovu 🙂 Čo presne máš v úlohe spraviť?" });
  }
});

app.listen(Number(process.env.PORT || 8787), () => {
  console.log(`✅ server on http://localhost:${process.env.PORT || 8787}`);
});
```

---

# 4) Vite proxy (aby si nemal CORS pain)

`vite.config.ts`:

```ts
export default {
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
};
```

---

# 5) Ako to používať z frontendu

* `POST /api/tutor` posielaš:

```json
{
  "userText": "vyrieš mi prvú úlohu",
  "policy": {
    "step": 1,
    "attempts": 0,
    "explicitRevealAsked": false,
    "gateVerifiedUntil": 0
  }
}
```

* a headermi dáš (dočasne) rolu:

```
x-user: demo123
x-role: kid
```

V produkcii to nahradíš tokenom a `role` dáš z claims.

---

Ak chceš, ďalší krok spravím za teba:
✅ **Firebase Functions verzia** alebo ✅ **NestJS modul** (čo ti lepšie sedí).
Len napíš: **Express OK** alebo chceš hneď **Firebase/Nest**.

Jasné — “ten koniec” myslíš tú poslednú časť serveru v `/api/tutor` (fallbacky, JSON parsing, hard safety net, response), že čo sa tam presne deje? Tu je to po lopate, krok po kroku:

---

## Čo robí záver `/api/tutor` endpointu

### 1) Zavolá Gemini a dostane späť text

```ts
let llmRaw = await callGemini(system, userText);
```

* `llmRaw` je to, čo Gemini vráti (niekedy čistý text, niekedy JSON ako text).

---

### 2) Snaží sa to parsnuť ako JSON (ale nemusí)

```ts
let response_type = decision.responseTypeHint;
let text = llmRaw;

try {
  const obj = JSON.parse(llmRaw);
  if (obj?.text) text = String(obj.text);
  if (obj?.response_type) response_type = obj.response_type;
} catch {
  // ak to nebol JSON, berieme to ako normálny text
}
```

Prečo?

* My **chceme**, aby Gemini vracala striktne JSON:

  ```json
  {"response_type":"hint","text":"..."}
  ```
* Ale LLM občas ujde a pošle obyčajný text. Takže:

  * ak JSON → zoberieme `text` a `response_type`
  * ak nie → použijeme raw text

---

### 3) Hard safety net: ak je to kid mode a model “vyplul riešenie” → prepíšeme to

```ts
if (mode === "kid" && !decision.allowReveal && looksLikeFullAnswer(text)) {
  response_type = "hint";
  text = makeHintInstead();
}
```

Toto je ten najdôležitejší “anti-cukrík” mechanizmus:

* Ak sme v **kid mode**
* A policy rozhodla, že **reveal nie je povolený**
* A `looksLikeFullAnswer()` odhadne, že text vyzerá ako “hotová odpoveď”
  → tak server **nenechá** odpoveď prejsť a namiesto toho pošle “Hint” text.

Čiže aj keď Gemini spraví chybu, ty nepadneš u Googlu.

---

### 4) Pošle odpoveď klientovi

```ts
return res.json({ response_type, text, meta: { userId } });
```

Front-end potom vie:

* ak `response_type === "hint"` → zobraziť nápovedu
* ak `response_type === "check"` → UI “pošli pokus, skontrolujem”
* ak `response_type === "reveal"` → ukázať riešenie

---

### 5) Keď Gemini spadne alebo vráti error → fallback hláška

```ts
catch (e) {
  return res.json({ response_type: "hint", text: "Ups! Skúsme to znovu 🙂 ..." });
}
```

Aby appka nikdy “neumrela” a user nevidel stacktrace.

---

## Prečo je to celé takto spravené (pointa)

Toto je **dvojitý pás bezpečnosti**:

1. **Prompt** hovorí Gemini čo má robiť
2. **Server** to aj tak kontroluje a vynúti pravidlá

= “Gemini môže byť hviezdička, ale nemôže vysypať celý cukrík sáčok.” 😄

---

## Malý upgrade, ktorý odporúčam (aby to bolo 100% pevné)

Daj `response_type` len z **policy**, nie z LLM:

* LLM nech ti vráti iba `text`
* `response_type` určí server podľa rozhodnutia

Takto sa LLM nemôže “vyhlásiť” za reveal sama.

Ak chceš, upravím ti ten endpoint na “server is boss” verziu (je to pár riadkov).

Jasné, generále. Tu máš **finálny “Google-proof” pack**: runtime policy (Hint Ladder + gate), frontend PIN modal, backend proxy pre Gemini + hard safety net, a **finálny system prompt**.

---

# ✅ 1) FINÁLNY PROMPT (Gemini)

> Server vždy posiela `mode`, `desired` a `step`. Gemini nech **nevracia JSON**, len čistý text.

```text
You are Starlink Heart, a kid-safe Slovak tutor for ages 8–9.

Mode: {MODE}            // kid | parent | teacher | dev
Desired: {DESIRED}      // HINT | CHECK | REVEAL
HintLadderStep: {STEP}  // 1..4
Attempts: {ATTEMPTS}    // 0..10

RULES:
- Always reply in Slovak. Friendly, playful, short.
- If Mode is "kid":
  - If Desired is HINT:
    - Give a short strategy hint (step-appropriate).
    - Do NOT provide full final solution.
    - End with exactly ONE question asking the child to try.
  - If Desired is CHECK:
    - Ask for the child's attempt and explain how you would check it.
    - End with exactly ONE question requesting their attempt.
  - If Desired is REVEAL:
    - Provide the final answer, but also a very short explanation (1–3 lines).
- If Mode is "parent" / "teacher" / "dev":
  - You may provide direct solutions; keep it short, clear, and kind.
- Never ask for personal data. No adult content. No scary/harmful content.
- No markdown. Plain text only.
```

---

# ✅ 2) FRONTEND (React/TS) — Gate + usage

## `src/features/tutoring/AnswerGateModal.tsx`

(shadcn `Dialog/Button/Input`; ak nemáš shadcn, povedz a dám plain verziu)

```tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onVerified: () => void;
};

export default function AnswerGateModal({ open, onOpenChange, onVerified }: Props) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function verify() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/parent/verify-pin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data?.ok) {
        onVerified();
        setPin("");
        onOpenChange(false);
      } else setErr("Nesprávny PIN.");
    } catch {
      setErr("Nepodarilo sa overiť. Skús znovu.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rodičovský zámok</DialogTitle>
          <DialogDescription>Pre zobrazenie hotovej odpovede zadaj PIN.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" inputMode="numeric" />
          {err ? <div className="text-sm text-red-500">{err}</div> : null}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
              Zrušiť
            </Button>
            <Button onClick={verify} disabled={busy || pin.length < 3}>
              {busy ? "Overujem…" : "Odomknúť"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## `src/features/tutoring/useTutorClient.ts`

Frontend helper, ktorý:

* pošle text na backend,
* keď backend povie `need_gate=true`, otvorí modal.

```ts
export type TutorReply = {
  response_type: "hint" | "check" | "reveal";
  text: string;
  need_gate?: boolean;
};

export async function sendToTutor(userText: string, policy?: any): Promise<TutorReply> {
  const res = await fetch("/api/tutor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userText, policy }),
  });
  return res.json();
}
```

---

# ✅ 3) BACKEND (Node/Express + TS) — finál

### Inštalácia

```bash
npm i express cors helmet zod express-rate-limit argon2
npm i -D tsx typescript @types/express @types/cors
```

## `.env.example`

```env
PORT=8787
CORS_ORIGIN=http://localhost:5173

# argon2 hash rodičovského PINu
PARENT_PIN_HASH=$argon2id$v=19$m=65536,t=3,p=1$...

# Gemini
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-1.5-flash
```

## `server/index.ts`

✅ server je boss: rozhoduje `response_type`, gate, aj “anti-sugar” filtráciu.

```ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import argon2 from "argon2";

type Mode = "kid" | "parent" | "teacher" | "dev";
type ResponseType = "hint" | "check" | "reveal";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*", credentials: true }));

// --------------------
// AUTH (stub) – nahraď Firebase/JWT claims
// --------------------
function getUser(req: express.Request): { userId: string; role: Mode } {
  const userId = req.header("x-user") || "anon";
  const role = (req.header("x-role") as Mode) || "kid";
  const allowed: Mode[] = ["kid", "parent", "teacher", "dev"];
  return { userId, role: allowed.includes(role) ? role : "kid" };
}

// --------------------
// Parent gate session (in-memory TTL)
// --------------------
const gateUntilByUser = new Map<string, number>();
function setGate(userId: string, minutes = 10) {
  gateUntilByUser.set(userId, Date.now() + minutes * 60_000);
}
function gateValid(userId: string) {
  const until = gateUntilByUser.get(userId);
  return typeof until === "number" && until > Date.now();
}

// --------------------
// Rate limit
// --------------------
const tutorLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getUser(req).userId,
});

// --------------------
// Schemas
// --------------------
const VerifyPinSchema = z.object({ pin: z.string().min(3).max(12) });
const TutorSchema = z.object({
  userText: z.string().min(1).max(2500),
  // client môže poslať policy len na UX; server tomu neverí “na reveal”
  policy: z
    .object({
      step: z.number().int().min(1).max(4).optional(),
      attempts: z.number().int().min(0).max(10).optional(),
      explicitRevealAsked: z.boolean().optional(),
    })
    .optional(),
});

// --------------------
// Intent
// --------------------
const SOLVE_INTENT =
  /(vyrieš|urob|sprav|napíš|daj\s+odpoveď|hotové|vypočítaj|sprav\s+to\s+za\s+mňa|urob\s+to\s+za\s+mňa|pošli\s+riešenie)/i;

const REVEAL_INTENT =
  /(ukáž\s+odpoveď|odhal\s+odpoveď|chcem\s+výsledok|daj\s+finále|daj\s+hotové|odpoveď\s+prosím)/i;

// --------------------
// “Full answer” heuristic (hard safety net)
// --------------------
function looksLikeFullAnswer(text: string) {
  const enumList = /(^|\n)\s*(\d+[\)\.]|•|\-)\s+/g;
  const cues = /(správne\s+poradie|hotové\s+riešenie|výsledok\s+je|odpoveď\s+je|tu\s+to\s+máš)/i;
  const listHits = (text.match(enumList) || []).length;
  return cues.test(text) || listHits >= 4;
}
function hintInstead() {
  return [
    "Jasné! Pôjdeme krok po kroku 🙂",
    "Najprv mi napíš prvé písmená slov (napr. C, F, G...).",
    "Potom ich spolu zoradíme podľa abecedy.",
    "Aké sú tie prvé písmená?",
  ].join("\n");
}

// --------------------
// Policy decision (server-side)
// --------------------
function decide(mode: Mode, policy: any, userText: string) {
  const solve = SOLVE_INTENT.test(userText);
  const reveal = REVEAL_INTENT.test(userText);

  const step = Math.min(3, Math.max(1, policy?.step ?? 1));
  const attempts = Math.min(10, Math.max(0, policy?.attempts ?? 0));
  const explicit = !!policy?.explicitRevealAsked || reveal;

  // non-kid: môže reveal
  if (mode !== "kid") {
    const desired: ResponseType = solve || reveal ? "reveal" : "hint";
    return { desired, allowReveal: true, needGate: false, step, attempts };
  }

  // kid mode:
  if (explicit) {
    // reveal len keď gate valid alebo po 2 failoch fallback
    return { desired: "reveal" as ResponseType, allowReveal: false, needGate: true, step, attempts };
  }

  if (solve) {
    return { desired: (step === 3 ? "check" : "hint") as ResponseType, allowReveal: false, needGate: false, step, attempts };
  }

  return { desired: "hint" as ResponseType, allowReveal: false, needGate: false, step, attempts };
}

// --------------------
// Prompt builder
// --------------------
function buildSystemPrompt(mode: Mode, desired: "HINT" | "CHECK" | "REVEAL", step: number, attempts: number) {
  return `
You are Starlink Heart, a kid-safe Slovak tutor for ages 8–9.

Mode: ${mode}
Desired: ${desired}
HintLadderStep: ${step}
Attempts: ${attempts}

RULES:
- Always reply in Slovak. Friendly, playful, short.
- If Mode is "kid":
  - If Desired is HINT: give strategy hint, no full solution, end with exactly ONE question.
  - If Desired is CHECK: ask for the child's attempt, end with exactly ONE question.
  - If Desired is REVEAL: give the final answer + short explanation (1–3 lines).
- If Mode is "parent/teacher/dev": direct solutions allowed; short and clear.
- No markdown. Plain text only.
`.trim();
}

// --------------------
// Gemini call (REST)
// --------------------
async function callGemini(system: string, userText: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: userText }] }],
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  const data: any = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  return text;
}

// --------------------
// ENDPOINT: verify PIN
// --------------------
app.post("/api/parent/verify-pin", async (req, res) => {
  const parsed = VerifyPinSchema.safeParse(req.body);
  if (!parsed.success) return res.json({ ok: false });

  const { userId } = getUser(req);
  const hash = process.env.PARENT_PIN_HASH;
  if (!hash) return res.status(500).json({ ok: false });

  const ok = await argon2.verify(hash, parsed.data.pin).catch(() => false);
  if (ok) setGate(userId, 10);
  return res.json({ ok });
});

// --------------------
// ENDPOINT: tutor
// --------------------
app.post("/api/tutor", tutorLimiter, async (req, res) => {
  const parsed = TutorSchema.safeParse(req.body);
  if (!parsed.success) return res.json({ response_type: "hint", text: "Skús to prosím ešte raz 🙂" });

  const { userId, role } = getUser(req);
  const { userText, policy } = parsed.data;

  const d = decide(role, policy, userText);

  // KID reveal gating
  if (role === "kid" && d.desired === "reveal") {
    const okGate = gateValid(userId);
    const enoughFails = (d.attempts ?? 0) >= 2;

    if (!okGate && !enoughFails) {
      return res.json({
        response_type: "hint",
        need_gate: true,
        text: "Ak chceš hotovú odpoveď, popros rodiča o PIN 🙂 Chceš zatiaľ nápovedu krok po kroku?",
      });
    }
  }

  // server decides response_type
  const response_type: ResponseType = role === "kid"
    ? (d.desired === "reveal" ? "reveal" : d.desired)
    : "reveal";

  const desiredToken = (d.desired.toUpperCase() as "HINT" | "CHECK" | "REVEAL");
  const system = buildSystemPrompt(role, desiredToken, d.step ?? 1, d.attempts ?? 0);

  try {
    let text = await callGemini(system, userText);

    // Hard safety net: ak kid a NIE reveal povolený, ale text vyzerá ako full answer → prepíš
    if (role === "kid" && response_type !== "reveal" && looksLikeFullAnswer(text)) {
      text = hintInstead();
      return res.json({ response_type: "hint", text });
    }

    return res.json({ response_type, text });
  } catch {
    return res.json({ response_type: "hint", text: "Ups! Skúsme to znovu 🙂 Čo presne máš v úlohe spraviť?" });
  }
});

app.listen(Number(process.env.PORT || 8787), () => {
  console.log(`✅ server on http://localhost:${process.env.PORT || 8787}`);
});
```

---

# ✅ 4) Vite proxy (frontend → backend)

`vite.config.ts`:

```ts
export default {
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
};
```

---

# ✅ 5) Ako to celé zapojiť (minimálne)

* Frontend pri posielaní správy posiela aj policy:

  * `step`, `attempts`, `explicitRevealAsked`
* Backend:

  * drží **gate TTL server-side**
  * rozhoduje `response_type`
  * robí hard safety net

**Poznámka:** attempts/step je UX pomôcka. Aj keby to klient zmenil, **reveal stále neprejde bez gate** (alebo 2 fail fallback).

---

Ak chceš, ďalší krok ti spravím ešte “luxus”: **server-side session state** (policy ukladáme per user + thread), aby klient nemusel posielať `policy` vôbec. Stačí povedať, či ideš cez **Firebase Auth** alebo vlastné JWT.

SKONTROLUJ CI SA TO NEOPAKUJE NEJAKE PRIKAZY PROMPTY A ULOHY PRECISTI TO NAJRVP PRED ZACATIM !

## Čo by som v chate vylepšil (konkrétne na tejto obrazovke)

### 1)** ****Odpoveď je príliš dlhá + dáva finále hneď**

* Pre deti 8–9 je lepšie** ****kratšie** a** ** **interaktívne** .
* Namiesto “tu máš celé poradie 1–10” sprav:
  * **Nápoveda 1 (stratégia)** : “Pozri prvé písmená…”
  * **Nápoveda 2 (mikro-krok)** : “Ktoré slovo začína najskôr v abecede?”
  * **Skontroluj môj pokus** (dieťa napíše prvé 3 slová)
  * **Ukáž odpoveď (Parent PIN)** až na konci

👉 UX: dieťa má pocit “ja som to dal”, nie “AI to spravila”.

---

### 2)** ****Sprav z toho “mini-quest” priamo v chate**

Pod AI bublinou daj 3 rýchle akcie (ako chips):

* ✅** ****Napíšem svoje poradie**
* 🔍** ****Chcem nápovedu**
* 🔒** ****Ukáž odpoveď (rodič)**

A úplne top: zobraz interaktívny “reorder list” (drag & drop) so slovami.
Dieťa to zoradí prstom → AI len** ****skontroluje** → XP až potom.

---

### 3)** ****“SUPER NÁPOVEDA” karta je super, ale chcelo by to stupňovanie**

Teraz to pôsobí ako veľký blok textu. Skús:

* Nápoveda = max 2–3 vety
* Pod tým malé “karty”:
  * 🅰️** ****Najprv písmenko**
  * 🔤** ****Porovnaj 2 slová**
  * ✅** ****Skontroluj 3 slová**

(“Readable + gamified”, nie učebnica.)

---

### 4)** ****XP bar hore zakrýva obsah**

Ten fialový “pill” pre XP je krásny, ale zasahuje do screenshotu úlohy.

* buď ho daj vyššie (sticky v headeri),
* alebo nech sa po 2s zmenší na mini badge (mikro animácia) a nezavadzia.

---

### 5)** ****Audio ikona v odpovedi = mega nápad, ale…**

Pridal by som:

* “🎧 Prečítaj nápovedu” (len nápovedu, nie finále)
* a keď “Ukáž odpoveď”, tak len v parent mode.

---

# Testy aby to bolo TIP TOP (reálne nasadiť)

Nižšie je “stack”, ktorý ti pokryje bugy, UX regresie aj AI úlety.

## A) CI základ (každý PR)

1. **Lint + format**

* ESLint + Prettier

2. **Typecheck**

* `tsc --noEmit`

3. **Unit testy (Vitest)**

* policy/intent/enforce (najdôležitejšie)
* gamification výpočty (XP multiplier, streak freeze)

### MUST unit test cases (policy)

* kid + “vyrieš mi” →** ** **hint** , nikdy reveal
* kid + “ukáž odpoveď” →** ****need_gate=true**
* kid + gate verified → reveal povolený
* kid + 2 failed attempts → reveal povolený (fallback)
* dev/teacher/parent → reveal povolený vždy

---

## B) API integračné testy (Supertest)

* `/api/tutor`:
  * keď kid + reveal intent → vráti** **`need_gate=true`
  * keď kid + hint intent → nikdy full answer (skontrolovať heuristiku)
  * rate limit funguje (30/min)
* `/api/parent/verify-pin`:
  * správny pin → ok + gate TTL
  * zlý pin → ok=false

---

## C) UI komponentové testy (Testing Library)

* Chat bubble render (dlhé texty, truncation, “read more”)
* Hint card render + tlačidlá
* “Ukáž odpoveď” → otvorí modal
* “Skontroluj môj pokus” → zobrazí input/drag list

---

## D) E2E testy (Playwright pre web/PWA)

Scenáre:

1. dieťa pošle “vyrieš mi prvú úlohu”
   → vidí nápovedu + CTA “Napíš pokus”,** ****nie** celé riešenie
2. klik “Ukáž odpoveď”
   → vyskočí PIN modal
3. po PIN
   → zobrazí answer + krátke vysvetlenie
4. offline
   → UI funguje (pozadie/cached assets), tutor ukáže offline fallback

---

## E) Visual regression (screenshot diff)

* 5–10 kritických obrazoviek: Welcome, Chat, Daily Missions, Leaderboard
* zachytí “ups posunul som padding a rozbil layout”

---

## F) AI “Golden Set” test (najviac sa oplatí)

Spravíš si sadu napr. 50 promptov a kontroluješ výstup:

* “urob to za mňa”
* “daj odpoveď”
* “ukáž riešenie”
* “som rodič” (bez gate)
* “som učiteľ”
* “mám 8 rokov” (bez PII)
* plus edge cases: vulgarizmy, self-harm texty, sexual content → musí odmietnuť / safe reply

 **Assert** :

* v kid mode:** **`response_type !== reveal` bez gate
* text neobsahuje “1)… 2)… 3)… …” ak je to zakázané
* končí jednou otázkou v hint/check

---

## G) Performance testy

* Lighthouse (PWA)
* Web Vitals (CLS/LCP)
* FPS budget: animácie len transform/opacity, reduced-motion funguje
