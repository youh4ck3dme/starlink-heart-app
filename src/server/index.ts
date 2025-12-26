/**
 * EduPage Backend Server
 * Proxy for ZŠ Kostoľany EduPage
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

const app = express();
const PORT = process.env.PORT || 3001;
const SCHOOL_URL = 'https://zskostolany.edupage.org';

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Session Store
const sessions = new Map<string, EdupageSession>();

interface EdupageSession {
  jar: CookieJar;
  client: AxiosInstance;
  ebuid: string;
  createdAt: Date;
}

function createSession(ebuid: string): { sessionId: string; session: EdupageSession } {
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  }));

  const sessionId = crypto.randomUUID();
  const session: EdupageSession = { jar, client, ebuid, createdAt: new Date() };
  sessions.set(sessionId, session);

  return { sessionId, session };
}

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    school: SCHOOL_URL,
    sessions: sessions.size,
    timestamp: new Date().toISOString() 
  });
});

app.post('/api/edupage/login', async (req, res) => {
  const { username, password, ebuid } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const schoolId = ebuid || 'zskostolany';
  const { sessionId, session } = createSession(schoolId);

  try {
    // Get login page first (for cookies)
    await session.client.get(`${SCHOOL_URL}/login/`);

    // Submit login
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await session.client.post(`${SCHOOL_URL}/login/`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 5,
    });

    // Check if login was successful (should redirect to dashboard)
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

app.get('/api/edupage/snapshot', async (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId) {
    return res.status(401).json({ error: 'Missing session ID' });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  try {
    // Fetch grades
    let grades: any[] = [];
    try {
      const gradesData = await fetchGrades(session);
      grades = gradesData;
    } catch (e) {
      console.error('Failed to fetch grades:', e);
    }

    // Fetch timeline
    let timeline: any[] = [];
    try {
      const html = await session.client.get(`${SCHOOL_URL}/user/?barNoSkin=1&ebuid=${session.ebuid}`);
      timeline = parseTimeline(html.data);
    } catch (e) {
      console.error('Failed to fetch timeline:', e);
    }

    res.json({
      fetchedAt: new Date().toISOString(),
      grades,
      timeline,
      timetable: [],
      homework: [],
    });
  } catch (error) {
    console.error('Snapshot error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/edupage/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ success: true });
});

// Helper functions
async function fetchGrades(session: EdupageSession): Promise<any[]> {
  const shellUrl = `${SCHOOL_URL}/znamky/?nadobdobie=P1`;
  const shellRes = await session.client.get(shellUrl);
  const html = shellRes.data;

  // Extract tokens
  const eqap = html.match(/eqap\s*:\s*"([^"]+)"/)?.[1];
  const eqacs = html.match(/eqacs\s*:\s*"([^"]+)"/)?.[1];
  const eqaz = html.match(/eqaz\s*:\s*"([^"]+)"/)?.[1] ?? '1';

  if (!eqap || !eqacs) {
    console.log('Could not extract grade tokens');
    return [];
  }

  const postUrl = `${SCHOOL_URL}/znamky/?what=studentviewer&akcia=studentData&eqav=1&maxEqav=7`;
  const body = new URLSearchParams({ eqap, eqacs, eqaz });

  const dataRes = await session.client.post(postUrl, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const rawGrades = dataRes.data?.vsetkyZnamky || [];
  return rawGrades.map((g: any) => ({
    id: g.znamkaid || String(Math.random()),
    subject: g.predmet_meno || 'Neznámy predmet',
    value: g.data || g.znamka || '?',
    date: g.datum,
    teacher: g.vlastnik_meno,
    note: g.poznamka,
  }));
}

function parseTimeline(html: string): any[] {
  const regex = /userhome\(({\s*"items":\s*\[.*\]\s*})\)/s;
  const match = html.match(regex);
  if (!match) return [];

  try {
    const data = JSON.parse(match[1]);
    return data.items.slice(0, 10).map((item: any) => ({
      id: item.timelineid || String(Math.random()),
      type: item.typ === 'sprava' ? 'message' : item.typ === 'znamka' ? 'grade' : 'event',
      title: item.user_meno || item.header || 'EduPage',
      body: item.text || item.cleanText || '',
      createdAt: item.timestamp,
    }));
  } catch {
    return [];
  }
}

// Cleanup old sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt.getTime() > 30 * 60 * 1000) {
      sessions.delete(id);
      console.log(`🧹 Cleaned up expired session: ${id}`);
    }
  }
}, 30 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`
  🚀 EduPage Proxy Server
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 School: ${SCHOOL_URL}
  🔗 API:    http://localhost:${PORT}/api
  ❤️  Health: http://localhost:${PORT}/api/health
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
