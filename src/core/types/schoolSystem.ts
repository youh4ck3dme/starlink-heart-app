/**
 * Abstract interface for school system clients
 * Allows easy extension for Bakalári, iŽiak, etc.
 */

export interface Credentials {
  username: string;
  password: string;
  schoolId?: string; // EBUID for EduPage
}

export interface Grade {
  id: string;
  subject: string;
  value: string;
  weight?: number;
  date?: string;
  teacher?: string;
  note?: string;
}

export interface TimelineItem {
  id: string;
  type: 'message' | 'homework' | 'grade' | 'event';
  title?: string;
  body?: string;
  createdAt?: string;
  relatedId?: string;
}

export interface TimetableLesson {
  id: string;
  date: string;     // YYYY-MM-DD
  start: string;    // HH:MM
  end: string;
  subject: string;
  teacher?: string;
  room?: string;
}

export interface HomeworkItem {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  dueAt?: string;
  createdAt?: string;
  teacher?: string;
}

export interface SchoolSnapshot {
  fetchedAt: string;
  grades: Grade[];
  timeline: TimelineItem[];
  timetable: TimetableLesson[];
  homework: HomeworkItem[];
}

/**
 * Abstract interface that all school system clients must implement
 */
export interface ISchoolSystemClient {
  /** Human-readable name of the school system */
  readonly name: string;
  
  /** Login to the school system */
  login(credentials: Credentials): Promise<boolean>;
  
  /** Get full dashboard snapshot */
  getSnapshot(): Promise<SchoolSnapshot>;
  
  /** Get grades only */
  getGrades(): Promise<Grade[]>;
  
  /** Get timeline/notifications */
  getTimeline(): Promise<TimelineItem[]>;
  
  /** Get timetable for date range */
  getTimetable(from?: Date, to?: Date): Promise<TimetableLesson[]>;
  
  /** Get homework */
  getHomework(): Promise<HomeworkItem[]>;
  
  /** Logout and clear session */
  logout(): void;
  
  /** Check if currently authenticated */
  isAuthenticated(): boolean;
}

/** Supported school system types */
export type SchoolSystemType = 'edupage' | 'bakalari' | 'iziak';
