/**
 * Parent Messaging Types for Mobile
 * 3-stage message flow: Text → Image Card → Weekly Report
 */

export type MessageStage = 'TEXT' | 'IMAGE_CARD' | 'WEEKLY_REPORT';

export type MessageStatus = 'SCHEDULED' | 'SENT' | 'FAILED';

export interface LessonRecord {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  topics: {
    name: string;
    level: 'HIGH' | 'MID' | 'LOW';
  }[];
  feedback: string;
  polishedFeedback?: string;
}

export interface ScheduledMessage {
  id: string;
  lessonId: string;
  stage: MessageStage;
  scheduledFor: string;
  status: MessageStatus;
  content?: string;
  sentAt?: string;
}

// Stage 1: 수업 직후 텍스트
export interface PostLessonText {
  studentName: string;
  parentTitle: string; // 어머님, 아버님
  tutorName: string;
  subject: string;
  topicsCovered: string[];
  feedback: string;
  nextPreview?: string;
}

// Stage 2: 3일 후 이미지 카드
export interface ProgressCard {
  studentName: string;
  lessonDate: string;
  subject: string;
  topics: {
    name: string;
    progress: number; // 0-100
    status: 'MASTERED' | 'PROGRESSING' | 'NEEDS_REVIEW';
  }[];
  highlight: string;
  focusArea: string;
  tutorName: string;
}

// Stage 3: 주간 종합 리포트
export interface WeeklyReport {
  studentName: string;
  weekRange: string; // "12/16 - 12/22"
  totalLessons: number;
  totalHours: number;
  achievements: string[];
  progressSummary: {
    topic: string;
    startLevel: number;
    endLevel: number;
  }[];
  tutorComment: string;
  upcomingFocus: string[];
}

// Generate text message content
export function generatePostLessonText(data: PostLessonText): string {
  const topicsStr = data.topicsCovered.join(', ');

  let message = `안녕하세요, ${data.studentName} ${data.parentTitle}.\n`;
  message += `${data.tutorName} 선생님입니다.\n\n`;
  message += `📚 오늘 ${data.subject} 수업에서는 ${topicsStr}을(를) 다루었습니다.\n\n`;
  message += `${data.feedback}\n`;

  if (data.nextPreview) {
    message += `\n다음 시간에는 ${data.nextPreview}을(를) 배울 예정입니다.\n`;
  }

  message += `\n감사합니다.\n${data.tutorName}`;

  return message;
}

// Calculate next message dates
export function getMessageSchedule(lessonDate: Date): {
  text: Date;
  imageCard: Date;
  nextSunday: Date;
} {
  const text = new Date(lessonDate);
  text.setMinutes(text.getMinutes() + 10); // 10분 후

  const imageCard = new Date(lessonDate);
  imageCard.setDate(imageCard.getDate() + 3); // 3일 후
  imageCard.setHours(10, 0, 0, 0); // 오전 10시

  // 다음 일요일
  const nextSunday = new Date(lessonDate);
  const dayOfWeek = nextSunday.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  nextSunday.setHours(10, 0, 0, 0); // 오전 10시

  return { text, imageCard, nextSunday };
}
