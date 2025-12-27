/**
 * Starlink Heart Backend Server
 * Combined: EduPage Proxy + AI Tutor Policy Engine
 * 
 * Run with: npx tsx src/server/index.ts
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import argon2 from "argon2";
import * as cheerio from 'cheerio';

// --- TYPES ---
type Mode = "kid" | "parent" | "teacher" | "dev";
type ResponseType = "hint" | "check" | "reveal";

interface EdupageSession {
  jar: CookieJar;
  client: AxiosInstance;
  ebuid: string;
  createdAt: Date;
}

// --- SETUP ---
const app = express();
const PORT = process.env.PORT || 3001;
function getSchoolUrl(ebuid: string): string {
  if (ebuid.includes('.')) return ebuid.startsWith('http') ? ebuid : `https://${ebuid}`;
  return `https://${ebuid}.edupage.org`;
}

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

// Logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --------------------
// AI TUTOR LOGIC
// --------------------

// Auth Stub
function getUser(req: express.Request): { userId: string; role: Mode } {
  const userId = req.header("x-user") || "anon";
  const role = (req.header("x-role") as Mode) || "kid";
  const allowed: Mode[] = ["kid", "parent", "teacher", "dev"];
  return { userId, role: allowed.includes(role) ? role : "kid" };
}

// Parent Gate Session
const gateUntilByUser = new Map<string, number>();
function setGate(userId: string, minutes = 10) {
  gateUntilByUser.set(userId, Date.now() + minutes * 60_000);
}
function gateValid(userId: string) {
  const until = gateUntilByUser.get(userId);
  return typeof until === "number" && until > Date.now();
}

// Rate Limit
const tutorLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getUser(req).userId,
});

// Schemas
const VerifyPinSchema = z.object({ pin: z.string().min(3).max(12) });
const TutorSchema = z.object({
  userText: z.string().min(1).max(2500),
  policy: z
    .object({
      step: z.number().int().min(1).max(4).optional(),
      attempts: z.number().int().min(0).max(10).optional(),
      explicitRevealAsked: z.boolean().optional(),
    })
    .optional(),
});

// Intent & Safety
const SOLVE_INTENT = /(vyrieš|urob|sprav|napíš|daj\s+odpoveď|hotové|vypočítaj|sprav\s+to\s+za\s+mňa|urob\s+to\s+za\s+mňa|pošli\s+riešenie)/i;
const REVEAL_INTENT = /(ukáž\s+odpoveď|odhal\s+odpoveď|chcem\s+výsledok|daj\s+finále|daj\s+hotové|odpoveď\s+prosím)/i;

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

function decide(mode: Mode, policy: any, userText: string) {
  const solve = SOLVE_INTENT.test(userText);
  const reveal = REVEAL_INTENT.test(userText);

  const step = Math.min(3, Math.max(1, policy?.step ?? 1));
  const attempts = Math.min(10, Math.max(0, policy?.attempts ?? 0));
  const explicit = !!policy?.explicitRevealAsked || reveal;

  if (mode !== "kid") {
    const desired: ResponseType = solve || reveal ? "reveal" : "hint";
    return { desired, allowReveal: true, needGate: false, step, attempts };
  }

  if (explicit) {
    return { desired: "reveal" as ResponseType, allowReveal: false, needGate: true, step, attempts };
  }

  if (solve) {
    return { desired: (step === 3 ? "check" : "hint") as ResponseType, allowReveal: false, needGate: false, step, attempts };
  }

  return { desired: "hint" as ResponseType, allowReveal: false, needGate: false, step, attempts };
}

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

async function callGemini(system: string, userText: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  
  // Mock response if no API key (for development)
  if (!apiKey) {
    console.warn("⚠️ Missing GEMINI_API_KEY, returning mock response");
    return "Toto je simulovaná odpoveď servera (chýba API kľúč). Ahoj!";
  }

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

// --- EDUPAGE PROXY LOGIC ---

const sessions = new Map<string, EdupageSession>();

function createSession(ebuid: string): { sessionId: string; session: EdupageSession } {
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  }));

  const sessionId = crypto.randomUUID();
  const session: EdupageSession = { jar, client, ebuid, createdAt: new Date() };
  
  // Tag as demo if ebuid is demo
  if (ebuid === 'demo') {
      (session as any).isDemo = true;
  }
  
  sessions.set(sessionId, session);
  return { sessionId, session };
}

async function fetchEdupageSnapshot(session: EdupageSession): Promise<any> {
  // Demo Mode branch
  if ((session as any).isDemo) {
      return {
          fetchedAt: new Date().toISOString(),
          grades: [
              { id: '1', subject: 'Matematika', value: '1', date: new Date().toISOString(), teacher: 'Mgr. Vesmírna' },
              { id: '2', subject: 'Slovenský jazyk', value: '2', date: new Date().toISOString(), teacher: 'Mgr. Hviezdičková' },
              { id: '3', subject: 'Prvouka', value: '1', date: new Date().toISOString(), teacher: 'Mgr. Kozmická' },
              { id: '4', subject: 'Angličtina', value: '1', date: new Date().toISOString(), teacher: 'Teacher John' },
              { id: '5', subject: 'Telesná výchova', value: '1', date: new Date().toISOString(), teacher: 'Tréner Marťan' }
          ],
          timeline: [
              { id: 't1', type: 'notice', title: 'Školský výlet do Planetária 🚀', content: 'Nezabudnite si desiatu!', createdAt: new Date().toISOString(), author: 'Riaditeľstvo' },
              { id: 't2', type: 'notice', title: 'Zber papiera ♻️', content: 'Súťažíme o najlepšiu triedu.', createdAt: new Date().toISOString(), author: 'Eko-tím' },
              { id: 't3', type: 'homework', title: 'Matematika: Strana 42, Príklad 5', createdAt: new Date().toISOString() }
          ],
          timetable: [
              { id: 'l1', subject: 'Matematika', start: '08:00', end: '08:45', room: 'Učebňa 1', teacher: 'Mgr. Vesmírna' },
              { id: 'l2', subject: 'Slovenský jazyk', start: '08:55', end: '09:40', room: 'Učebňa 4', teacher: 'Mgr. Hviezdičková' },
              { id: 'l3', subject: 'Prvouka', start: '10:00', end: '10:45', room: 'Laboratórium', teacher: 'Mgr. Kozmická' },
              { id: 'l4', subject: 'Angličtina', start: '11:05', end: '11:50', room: 'Jazyková učebňa', teacher: 'Teacher John' },
              { id: 'l5', subject: 'Telesná výchova', start: '12:00', end: '12:45', room: 'Telocvičňa', teacher: 'Tréner Marťan' }
          ],
          homework: [
              { id: 'hw1', subject: 'Matematika', title: 'Príklady na sčítanie', deadline: 'Zajtra', isCompleted: false },
              { id: 'hw2', subject: 'Slovenský jazyk', title: 'Pravopisné cvičenie', deadline: 'Piatok', isCompleted: true }
          ]
      };
  }

  const ebuid = session.ebuid || 'zskostolany';
  const url = `https://${ebuid}.edupage.org/rtrn/main.php?g_beid=1`;
  
  // EduPage JSON API payload for "everything"
  const payload = {
    "__init": {
      "data": {
        "v": 2,
        "widgets": [
          { "w": "Timeline" },
          { "w": "Grades" },
          { "w": "Timetable" },
          { "w": "Homework" }
        ]
      }
    }
  };

  const response = await session.client.post(url, payload);
  const data = response.data;

  // Transform EduPage's weird JSON into our SchoolSnapshot format
  const grades: any[] = [];
  const timeline: any[] = [];
  const timetable: any[] = [];
  const homework: any[] = [];

  if (data?.r?.[0]?.data?.widgets) {
    const widgets = data.r[0].data.widgets;
    
    // Parse Grades
    const gradesWidget = widgets.find((w: any) => w.w === "Grades");
    if (gradesWidget?.data?.grades) {
        gradesWidget.data.grades.forEach((g: any) => {
            grades.push({
                id: g.id || Math.random().toString(),
                subject: g.subject || 'Neznámy predmet',
                value: g.value || '-',
                weight: g.weight || 1,
                date: g.date || new Date().toISOString(),
                teacher: g.teacher || '',
                comment: g.comment || ''
            });
        });
    }

    // Parse Timeline (Notices)
    const timelineWidget = widgets.find((w: any) => w.w === "Timeline");
    if (timelineWidget?.data?.items) {
        timelineWidget.data.items.forEach((item: any) => {
            timeline.push({
                id: item.id || Math.random().toString(),
                type: item.type === 'notice' ? 'notice' : 'homework',
                title: item.title || 'Oznámenie',
                content: item.text || '',
                createdAt: item.date || new Date().toISOString(),
                author: item.author || 'Škola'
            });
        });
    }

    // Parse Timetable
    const ttWidget = widgets.find((w: any) => w.w === "Timetable");
    if (ttWidget?.data?.lessons) {
        ttWidget.data.lessons.forEach((l: any) => {
            timetable.push({
                id: l.id || Math.random().toString(),
                subject: l.subject || '',
                room: l.room || '',
                teacher: l.teacher || '',
                startTime: l.start || '08:00',
                endTime: l.end || '08:45',
                isCancelled: !!l.cancelled
            });
        });
    }

    // Parse Homework
    const hwWidget = widgets.find((w: any) => w.w === "Homework");
    if (hwWidget?.data?.items) {
        hwWidget.data.items.forEach((hw: any) => {
            homework.push({
                id: hw.id || Math.random().toString(),
                subject: hw.subject || '',
                title: hw.title || '',
                deadline: hw.deadline || '',
                isCompleted: !!hw.done
            });
        });
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    grades: grades.slice(0, 5), // Only last 5 for summary
    timeline: timeline.slice(0, 10),
    timetable,
    homework
  };
}

// --------------------
// ENDPOINTS
// --------------------

// HEALTH
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', sessions: sessions.size, timestamp: new Date().toISOString() });
});

// TUTOR: Verify PIN
app.post("/api/parent/verify-pin", async (req, res) => {
  const parsed = VerifyPinSchema.safeParse(req.body);
  if (!parsed.success) return res.json({ ok: false });

  const { userId } = getUser(req);
  const hash = process.env.PARENT_PIN_HASH;
  
  // Dev backdoor for now if hash missing
  if (!hash) {
      if (parsed.data.pin === "1234") {
          setGate(userId, 10);
          return res.json({ ok: true });
      }
      return res.status(500).json({ ok: false, error: "No HASH configured" });
  }

  const ok = await argon2.verify(hash, parsed.data.pin).catch(() => false);
  if (ok) setGate(userId, 10);
  return res.json({ ok });
});

// TUTOR: Chat
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

  const response_type: ResponseType = role === "kid"
    ? (d.desired === "reveal" ? "reveal" : d.desired)
    : "reveal";

  const desiredToken = (d.desired.toUpperCase() as "HINT" | "CHECK" | "REVEAL");
  const system = buildSystemPrompt(role, desiredToken, d.step ?? 1, d.attempts ?? 0);

  try {
    let text = await callGemini(system, userText);

    if (role === "kid" && response_type !== "reveal" && looksLikeFullAnswer(text)) {
      text = hintInstead();
      return res.json({ response_type: "hint", text });
    }

    return res.json({ response_type, text });
  } catch (e) {
    console.error("Gemini Error:", e);
    return res.json({ response_type: "hint", text: "Ups! Skúsme to znovu 🙂 Čo presne máš v úlohe spraviť?" });
  }
});

// EDUPAGE: Login
app.post('/api/edupage/login', async (req, res) => {
  const { username, password, ebuid } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  const schoolId = ebuid || 'zskostolany';
  
  // DEMO MODE BYPASS
  if (username === 'demo' || username === 'admin' || password === 'demo') {
      const { sessionId } = createSession('demo');
      return res.json({ sessionId });
  }

  const { sessionId, session } = createSession(schoolId);

  const schoolUrl = getSchoolUrl(schoolId);

  try {
    await session.client.get(`${schoolUrl}/login/`);
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await session.client.post(`${schoolUrl}/login/`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 5,
    });

    if (response.status === 200 && !response.data.includes('error')) {
      console.log(`✅ Login successful for user: ${username}`);
      res.json({ sessionId });
    } else {
      sessions.delete(sessionId);
      res.status(401).json({ error: 'Nesprávne prihlasovacie údaje' });
    }
  } catch (error) {
    console.error('Login error:', error);
    sessions.delete(sessionId);
    res.status(500).json({ error: 'Prihlásenie zlyhalo' });
  }
});

// EDUPAGE: Snapshot
app.get('/api/edupage/snapshot', async (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;
  if (!sessionId) return res.status(401).json({ error: 'Missing session ID' });

  const session = sessions.get(sessionId);
  if (!session) return res.status(401).json({ error: 'Session expired' });

  try {
    const snapshot = await fetchEdupageSnapshot(session);
    res.json(snapshot);
  } catch (error: any) {
    console.error('Snapshot error:', error.message);
    res.status(500).json({ error: 'Nepodarilo sa načítať dáta z EduPage' });
  }
});

// Cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt.getTime() > 30 * 60 * 1000) sessions.delete(id);
  }
}, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`
  🚀 Hybrid Server (EduPage + AI Tutor)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔗 API:    http://localhost:${PORT}/api
  🧠 Tutor:  POST /api/tutor
  🛡️ Gate:   POST /api/parent/verify-pin
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
