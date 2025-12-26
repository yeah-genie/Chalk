// ===================================
// STUDENT TYPES
// ===================================
export type GradeLevel =
  | 'ELEMENTARY_5'
  | 'ELEMENTARY_6'
  | 'MIDDLE_1'
  | 'MIDDLE_2'
  | 'MIDDLE_3'
  | 'HIGH_1'
  | 'HIGH_2'
  | 'HIGH_3';

export const GRADE_NAMES: Record<GradeLevel, string> = {
  ELEMENTARY_5: '초5',
  ELEMENTARY_6: '초6',
  MIDDLE_1: '중1',
  MIDDLE_2: '중2',
  MIDDLE_3: '중3',
  HIGH_1: '고1',
  HIGH_2: '고2',
  HIGH_3: '고3',
};

export const GRADE_TO_MAP: Record<GradeLevel, string> = {
  ELEMENTARY_5: '초5',
  ELEMENTARY_6: '초6',
  MIDDLE_1: '중1',
  MIDDLE_2: '중2',
  MIDDLE_3: '중3',
  HIGH_1: '고1',
  HIGH_2: '고2',
  HIGH_3: '고3',
};

export const GRADE_OPTIONS: GradeLevel[] = [
  'ELEMENTARY_5',
  'ELEMENTARY_6',
  'MIDDLE_1',
  'MIDDLE_2',
  'MIDDLE_3',
  'HIGH_1',
  'HIGH_2',
  'HIGH_3',
];

export interface Student {
  id: string;
  name: string;
  subject: string;
  grade: GradeLevel;
  currentTopic?: string;
  targetTopic?: string;
  lessonsCount: number;
  phone?: string;
  parentName?: string;
  hourlyRate?: number;
  notes?: string;
  diagnosis?: DiagnosisResult;
  learningGoals?: LearningGoal[];
}

export interface DiagnosisResult {
  gaps: DiagnosisGap[];
  estimatedWeeks: number;
  recommendedStart?: string;
  warnings?: string[];
  tutorTips?: string[];
}

export interface DiagnosisGap {
  topicCode: string;
  topicName: string;
  grade: string;
  estimatedHours: number;
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
}

// ===================================
// LEARNING GOAL TYPES (학생별 커스텀)
// ===================================
export interface LearningGoal {
  id: string;
  title: string;
  description?: string;
  topicCode?: string;
  isActive: boolean;
  orderIndex: number;
}

// ===================================
// LESSON TYPES
// ===================================
export type LevelType = 'high' | 'mid' | 'low';

export interface GoalCheck {
  goalId: string;
  level: LevelType | null;
  notes?: string;
}

export interface LessonRecord {
  id: string;
  studentId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  topic?: string;
  memo?: string;
  aiFeedback?: string;
  goalChecks: GoalCheck[];
  parentMessageSent: boolean;
  parentMessageSentAt?: string;
  imageReportSent?: boolean;
  hourlyRate?: number;
  totalFee?: number;
  isPaid?: boolean;
  createdAt: string;
}

// ===================================
// PARENT MESSAGE TYPES
// ===================================
export type MessageType = 'text' | 'image' | 'weekly';

export interface ParentMessage {
  id: string;
  lessonId: string;
  studentId: string;
  messageType: MessageType;
  content: string;
  imageUrl?: string;
  sentAt: string;
  delivered: boolean;
}

// ===================================
// AI BRIEFING (수업 전 브리핑)
// ===================================
export interface AIBriefing {
  studentId: string;
  studentName: string;
  lastLessonSummary: string;
  todayGoals: string[];
  reviewPoints: string[];
  tutorHints: string[];
  upcomingTime: string;
}

// ===================================
// PORTFOLIO TYPES
// ===================================
export interface Badge {
  id: string;
  icon: 'fire' | 'target' | 'crown' | 'trending' | 'diamond' | 'star' | 'award';
  label: string;
  description: string;
  color: 'mint' | 'light' | 'dark';
  earned: boolean;
  earnedAt?: string;
}

export interface PortfolioStats {
  totalLessons: number;
  totalStudents: number;
  avgLevel: number;
  streak: number;
  totalHours: number;
  totalEarnings: number;
}

// ===================================
// INCOME TRACKING (급여 계산)
// ===================================
export interface IncomeRecord {
  studentId: string;
  studentName: string;
  lessonCount: number;
  totalHours: number;
  hourlyRate: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalLessons: number;
  totalHours: number;
  totalEarnings: number;
  paidEarnings: number;
  unpaidEarnings: number;
  studentBreakdown: IncomeRecord[];
}

// ===================================
// UI TYPES
// ===================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ===================================
// SCHEDULE TYPES
// ===================================
export interface ScheduledLesson {
  id: string;
  studentId: string;
  studentName: string;
  dayOfWeek: number; // 0-6 (일-토)
  startTime: string; // HH:mm
  endTime: string;
  subject: string;
  isRecurring: boolean;
  notes?: string;
}

export interface UpcomingLesson extends ScheduledLesson {
  date: string;
  minutesUntil: number;
  briefing?: AIBriefing;
}
