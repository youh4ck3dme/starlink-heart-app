import { 
  ISchoolSystemClient, 
  Credentials, 
  SchoolSnapshot, 
  Grade, 
  TimelineItem, 
  TimetableLesson, 
  HomeworkItem 
} from '../../../core/types/schoolSystem';

const SESSION_KEY = 'edupage_session';
const CACHE_KEY = 'edupage_snapshot';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * EduPage Client Implementation
 * 
 * Note: In production, this should communicate with a backend proxy
 * because EduPage requires server-side cookie handling.
 * 
 * This frontend client caches data and manages session state.
 */
export class EdupageClient implements ISchoolSystemClient {
  readonly name = 'EduPage';
  
  private sessionId: string | null = null;
  private baseUrl = '/api/edupage'; // Proxy to backend
  
  constructor() {
    this.sessionId = localStorage.getItem(SESSION_KEY);
  }
  
  async login(credentials: Credentials): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          ebuid: credentials.schoolId,
        }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      if (data.sessionId) {
        this.sessionId = data.sessionId;
        localStorage.setItem(SESSION_KEY, data.sessionId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('EduPage login error:', error);
      return false;
    }
  }
  
  async getSnapshot(): Promise<SchoolSnapshot> {
    // Check cache first
    const cached = this.getCachedSnapshot();
    if (cached) {
      return cached;
    }
    
    if (!this.sessionId) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/snapshot`, {
        headers: { 'x-session-id': this.sessionId },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        throw new Error('Failed to fetch snapshot');
      }
      
      const snapshot: SchoolSnapshot = await response.json();
      this.setCachedSnapshot(snapshot);
      return snapshot;
    } catch (error) {
      console.error('EduPage snapshot error:', error);
      throw error;
    }
  }
  
  async getGrades(): Promise<Grade[]> {
    const snapshot = await this.getSnapshot();
    return snapshot.grades;
  }
  
  async getTimeline(): Promise<TimelineItem[]> {
    const snapshot = await this.getSnapshot();
    return snapshot.timeline;
  }
  
  async getTimetable(_from?: Date, _to?: Date): Promise<TimetableLesson[]> {
    const snapshot = await this.getSnapshot();
    return snapshot.timetable;
  }
  
  async getHomework(): Promise<HomeworkItem[]> {
    const snapshot = await this.getSnapshot();
    return snapshot.homework;
  }
  
  logout(): void {
    this.sessionId = null;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CACHE_KEY);
  }
  
  isAuthenticated(): boolean {
    return !!this.sessionId;
  }
  
  // Cache management
  private getCachedSnapshot(): SchoolSnapshot | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      const age = Date.now() - new Date(parsed.fetchedAt).getTime();
      
      if (age < CACHE_TTL) {
        return parsed;
      }
      
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }
  
  private setCachedSnapshot(snapshot: SchoolSnapshot): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  }
}
