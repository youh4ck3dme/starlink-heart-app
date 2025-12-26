# 📚 EduPage Integration Guide

Kompletná dokumentácia pre integráciu EduPage API do React/Vite projektu.

---

## 📁 Štruktúra projektu

```
src/
├── server.ts                    # Express backend server
├── routes/
│   └── edupageRoutes.ts         # API endpoints
├── edupage/
│   ├── edupageClient.ts         # Core EduPage scraper
│   ├── sessionStore.ts          # Session management
│   └── types.ts                 # TypeScript typy
├── lib/
│   └── edupageDashboardClient.ts # Frontend SDK
└── hooks/
    └── useEdupageSnapshot.ts    # React hook
```

---

## 1️⃣ Backend Server (src/server.ts)

```typescript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import edupageRoutes from './routes/edupageRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/edupage', edupageRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 EduPage Proxy Server running on http://localhost:${port}`);
});
```

---

## 2️⃣ API Routes (src/routes/edupageRoutes.ts)

```typescript
import { Router } from 'express';
import { sessionStore } from '../edupage/sessionStore';
import crypto from 'crypto';

const router = Router();

// POST /api/edupage/login
router.post('/login', async (req, res) => {
  const { username, password, ebuid } = req.body;
  
  if (!username || !password || !ebuid) {
    return res.status(400).json({ error: 'Missing credentials or EBUID' });
  }

  const sessionId = crypto.randomUUID();
  const client = sessionStore.createSession(sessionId);
  
  const success = await client.login(username, password, ebuid);
  
  if (success) {
    res.json({ sessionId });
  } else {
    sessionStore.deleteSession(sessionId);
    res.status(401).json({ error: 'EduPage login failed' });
  }
});

// GET /api/edupage/snapshot
router.get('/snapshot', async (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Missing session ID header' });
  }

  const client = sessionStore.getSession(sessionId);
  if (!client) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  try {
    const snapshot = await client.getDashboardSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch EduPage data' });
  }
});

export default router;
```

---

## 3️⃣ EduPage Client (src/edupage/edupageClient.ts)

```typescript
import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { DashboardSnapshot, GradeItem, TimelineItem } from './types';

export class EdupageClient {
  private jar: CookieJar;
  private client: AxiosInstance;
  private baseUrl: string = 'https://VASA_SKOLA.edupage.org'; // ⚠️ ZMENIŤ!
  private ebuid: string = '';

  constructor() {
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({ 
      jar: this.jar, 
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }));
  }

  async login(username: string, password: string, ebuid: string): Promise<boolean> {
    this.ebuid = ebuid;
    try {
      await this.client.get(`${this.baseUrl}/login/`);

      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
    
      const response = await this.client.post(`${this.baseUrl}/login/`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    
      return response.status === 200;
    } catch (error) {
      console.error('EduPage Login Error:', error);
      return false;
    }
  }

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    let timeline: TimelineItem[] = [];
    try {
      const html = await this.fetchPage(`/user/?barNoSkin=1&ebuid=${this.ebuid}`);
      timeline = this.parseUserHomeItems(html);
    } catch (e) {
      console.error("Failed to fetch timeline", e);
    }
  
    let grades: GradeItem[] = [];
    try {
      const rawData = await this.getGradesSnapshot('P1'); 
      grades = this.mapRawGrades(rawData.vsetkyZnamky || []);
    } catch (e) {
      console.error("Failed to fetch grades", e);
    }

    return {
      fetchedAt: new Date().toISOString(),
      homework: [],
      timetable: [],
      grades,
      timeline
    };
  }

  async getGradesSnapshot(term: "P1" | "P2") {
    const shellUrl = `${this.baseUrl}/znamky/?nadobdobie=${term}`;
    const shellRes = await this.client.get(shellUrl);
    const shellHtml = shellRes.data;

    const tokens = this.extractEqTokens(shellHtml);
    if (!tokens) {
      throw new Error(`Failed to extract tokens for term ${term}`);
    }

    const { eqap, eqacs, eqaz } = tokens;
    const postUrl = `${this.baseUrl}/znamky/?what=studentviewer&akcia=studentData&eqav=1&maxEqav=7`;
    const body = new URLSearchParams({ eqap, eqacs, eqaz });

    const dataRes = await this.client.post(postUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    return dataRes.data;
  }

  private extractEqTokens(html: string) {
    const eqap = html.match(/eqap\s*:\s*"([^"]+)"/)?.[1];
    const eqacs = html.match(/eqacs\s*:\s*"([^"]+)"/)?.[1];
    const eqaz = html.match(/eqaz\s*:\s*"([^"]+)"/)?.[1] ?? "1";
    if (!eqap || !eqacs) return null;
    return { eqap, eqacs, eqaz };
  }

  private async fetchPage(path: string): Promise<string> {
    const response = await this.client.get(`${this.baseUrl}${path}`);
    return response.data;
  }

  private parseUserHomeItems(html: string): TimelineItem[] {
    const regex = /userhome\(({\s*"items":\s*\[.*\]\s*})\)/s;
    const match = html.match(regex);
    if (!match) return [];

    try {
      const data = JSON.parse(match[1]);
      return data.items.map((item: any) => ({
        id: item.timelineid || String(Math.random()),
        type: this.mapTimelineType(item.typ || 'event'),
        title: item.user_meno || item.header || "EduPage Item",
        body: item.text || item.cleanText || "",
        createdAt: item.timestamp,
        relatedId: item.ineid
      }));
    } catch (e) {
      return [];
    }
  }

  private mapRawGrades(rawGrades: any[]): GradeItem[] {
    return rawGrades.map((g) => ({
      id: g.znamkaid || String(Math.random()),
      subject: g.predmet_meno || "Neznámy predmet",
      value: g.data || g.znamka || "?",
      date: g.datum,
      teacher: g.vlastnik_meno,
      note: g.poznamka
    }));
  }

  private mapTimelineType(typ: string): TimelineItem['type'] {
    switch (typ) {
      case 'sprava': return 'message';
      case 'homework': return 'homework';
      case 'znamka': return 'grade';
      default: return 'event';
    }
  }
}
```

---

## 4️⃣ Session Store (src/edupage/sessionStore.ts)

```typescript
import { EdupageClient } from './edupageClient';

class SessionStore {
  private sessions: Map<string, EdupageClient> = new Map();

  createSession(id: string): EdupageClient {
    const client = new EdupageClient();
    this.sessions.set(id, client);
    return client;
  }

  getSession(id: string): EdupageClient | undefined {
    return this.sessions.get(id);
  }

  deleteSession(id: string): void {
    this.sessions.delete(id);
  }
}

export const sessionStore = new SessionStore();
```

---

## 5️⃣ TypeScript Types (src/edupage/types.ts)

```typescript
export type HomeworkItem = {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  dueAt?: string;
  createdAt?: string;
  teacher?: string;
  attachments?: { name: string; url: string }[];
};

export type TimetableLesson = {
  id: string;
  date: string;     // YYYY-MM-DD
  start: string;    // HH:MM
  end: string;
  subject: string;
  teacher?: string;
  room?: string;
  className?: string;
};

export type GradeItem = {
  id: string;
  subject: string;
  value: string;
  weight?: number;
  date?: string;
  teacher?: string;
  note?: string;
};

export type TimelineItem = {
  id: string;
  type: "message" | "homework" | "grade" | "event";
  title?: string;
  body?: string;
  createdAt?: string;
  relatedId?: string;
};

export type DashboardSnapshot = {
  fetchedAt: string;
  homework: HomeworkItem[];
  timetable: TimetableLesson[];
  grades: GradeItem[];
  timeline: TimelineItem[];
};
```

---

## 6️⃣ Frontend SDK (src/lib/edupageDashboardClient.ts)

```typescript
import axios from 'axios';
import { DashboardSnapshot } from '../edupage/types';

const API_BASE = '/api/edupage';
const SESSION_KEY = 'edupage_session_id';
const CACHE_KEY = 'edupage_snapshot_cache';

export class EdupageDashboardClient {
  
  async login(username: string, password: string, ebuid: string): Promise<boolean> {
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password, ebuid });
      if (res.data.sessionId) {
        localStorage.setItem(SESSION_KEY, res.data.sessionId);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login failed', e);
      return false;
    }
  }

  async getSnapshot(force = false): Promise<DashboardSnapshot | null> {
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - new Date(parsed.fetchedAt).getTime();
          if (age < 5 * 60 * 1000) {
            return parsed;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    }

    const sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) return null;

    try {
      const res = await axios.get<DashboardSnapshot>(`${API_BASE}/snapshot`, {
        headers: { 'x-session-id': sessionId }
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        localStorage.removeItem(SESSION_KEY);
      }
      throw e;
    }
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CACHE_KEY);
  }
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem(SESSION_KEY);
  }
}

export const edupageClient = new EdupageDashboardClient();
```

---

## 7️⃣ Inštalácia závislostí

```bash
# Backend
npm install express cors cookie-parser axios axios-cookiejar-support tough-cookie concurrently

# TypeScript types
npm install -D @types/express @types/cors @types/cookie-parser @types/tough-cookie tsx
```

---

## 8️⃣ package.json skripty

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"vite\"",
    "server": "tsx src/server.ts"
  }
}
```

---

## 9️⃣ Vite Proxy Config

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
```

---

## 🔑 Dôležité poznámky

| Položka | Popis |
|---------|-------|
| **EBUID** | Jedinečný ID študenta z URL EduPage |
| **Škola** | Zmeň `baseUrl` na tvoju školu |
| **Cookies** | Backend musí bežať na serveri |
| **Token Flow** | Známky vyžadujú extrakciu eqap/eqacs tokenov |

---

## ✅ Použitie v React komponente

```tsx
import { edupageClient } from '../lib/edupageDashboardClient';
import { useState, useEffect } from 'react';

function SchoolScreen() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    edupageClient.getSnapshot()
      .then(setSnapshot)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Načítavam...</p>;
  if (!snapshot) return <p>Nie si prihlásený</p>;

  return (
    <div>
      <h2>Známky</h2>
      {snapshot.grades.map(g => (
        <div key={g.id}>{g.subject}: {g.value}</div>
      ))}
    </div>
  );
}
```
