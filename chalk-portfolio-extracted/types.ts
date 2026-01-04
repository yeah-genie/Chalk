
export interface Student {
  id: string;
  name: string;
  subject: string;
  status: 'active' | 'completed';
  lastSession: string;
}

export interface Session {
  id: string;
  studentName: string;
  date: string;
  duration: number; // in minutes
  topic: string;
  platform: 'Zoom' | 'Google Meet';
}

export interface StatCardData {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface TutorProfile {
  name: string;
  slug: string;
  title: string;
  bio: string;
  subjects: string[];
  stats: {
    totalSessions: number;
    longTermRate: string;
    avgResponseTime: string;
  };
}
