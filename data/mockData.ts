import { 
  Student, 
  LearningGoal, 
  LessonRecord, 
  Badge, 
  PortfolioStats, 
  ScheduledLesson,
  AIBriefing,
  MonthlySummary,
  GradeLevel 
} from './types';

// ===================================
// MOCK STUDENTS (확장)
// ===================================
export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: '김민수',
    subject: '수학',
    grade: 'MIDDLE_2',
    currentTopic: 'M2-LINEAR-FUNC',
    targetTopic: 'M3-QUADRATIC-FUNC',
    lessonsCount: 12,
    phone: '010-1234-5678',
    parentName: '김영희',
    hourlyRate: 40000,
    notes: '시각적 설명에 반응 좋음',
    learningGoals: [
      { id: 'g1', title: '일차함수 그래프 해석', isActive: true, orderIndex: 0 },
      { id: 'g2', title: '기울기와 y절편 이해', isActive: true, orderIndex: 1 },
      { id: 'g3', title: '일차함수 활용 문제', isActive: true, orderIndex: 2 },
    ],
    diagnosis: {
      gaps: [
        {
          topicCode: 'M1-COORDINATE',
          topicName: '좌표평면과 그래프',
          grade: '중1',
          estimatedHours: 6,
          severity: 'CRITICAL',
        },
        {
          topicCode: 'M1-LINEAR-EQ',
          topicName: '일차방정식',
          grade: '중1',
          estimatedHours: 10,
          severity: 'MODERATE',
        },
      ],
      estimatedWeeks: 6,
      recommendedStart: '좌표평면 복습',
      warnings: ['일차함수가 어려운 학생의 78%가 좌표평면/변수 개념 결손을 가지고 있습니다.'],
      tutorTips: ['기울기 = 변화율 강조', '실생활 예시 활용', '지도 비유 활용'],
    },
  },
  {
    id: '2',
    name: '이서연',
    subject: '수학',
    grade: 'HIGH_1',
    currentTopic: 'H1-POLYNOMIAL',
    lessonsCount: 8,
    phone: '010-2345-6789',
    parentName: '이정민',
    hourlyRate: 50000,
    learningGoals: [
      { id: 'g4', title: '다항식의 나눗셈', isActive: true, orderIndex: 0 },
      { id: 'g5', title: '나머지 정리', isActive: true, orderIndex: 1 },
      { id: 'g6', title: '인수분해 고급', isActive: true, orderIndex: 2 },
    ],
  },
  {
    id: '3',
    name: '박준호',
    subject: '수학',
    grade: 'MIDDLE_1',
    currentTopic: 'M1-LINEAR-EQ',
    lessonsCount: 5,
    phone: '010-3456-7890',
    parentName: '박미영',
    hourlyRate: 35000,
    learningGoals: [
      { id: 'g7', title: '등식의 성질', isActive: true, orderIndex: 0 },
      { id: 'g8', title: '이항 연습', isActive: true, orderIndex: 1 },
      { id: 'g9', title: '방정식 응용', isActive: true, orderIndex: 2 },
    ],
    diagnosis: {
      gaps: [
        {
          topicCode: 'M1-INTEGER',
          topicName: '정수와 유리수',
          grade: '중1',
          estimatedHours: 10,
          severity: 'CRITICAL',
        },
      ],
      estimatedWeeks: 4,
      warnings: ['음수 계산과 이항 개념에서 어려움을 겪는 경우가 많습니다.'],
      tutorTips: ['저울 비유 활용', '좌우 동시 연산 강조'],
    },
  },
];

// ===================================
// MOCK LESSON HISTORY
// ===================================
export const MOCK_LESSONS: LessonRecord[] = [
  {
    id: 'l1',
    studentId: '1',
    date: '2024-12-23',
    startTime: '16:00',
    endTime: '18:00',
    durationMinutes: 120,
    topic: '일차함수 그래프',
    memo: '기울기 개념 이해 완료, 그래프 그리기 연습 필요',
    aiFeedback: '안녕하세요, 민수 어머님. 오늘 수학 수업에서는 일차함수 그래프를 다루었습니다. 민수 학생이 기울기 개념을 잘 이해했습니다. 다음 시간에는 그래프 그리기를 더 연습할 예정입니다. 감사합니다.',
    goalChecks: [
      { goalId: 'g1', level: 'high' },
      { goalId: 'g2', level: 'mid' },
      { goalId: 'g3', level: null },
    ],
    parentMessageSent: true,
    parentMessageSentAt: '2024-12-23T18:30:00',
    hourlyRate: 40000,
    totalFee: 80000,
    isPaid: true,
    createdAt: '2024-12-23T18:00:00',
  },
  {
    id: 'l2',
    studentId: '1',
    date: '2024-12-20',
    startTime: '16:00',
    endTime: '18:00',
    durationMinutes: 120,
    topic: '좌표평면 복습',
    memo: '좌표 찍기 연습, 사분면 개념 복습',
    aiFeedback: '안녕하세요, 민수 어머님. 오늘 수업에서는 좌표평면을 복습했습니다. 민수 학생이 좌표 찍기를 열심히 연습했습니다. 감사합니다.',
    goalChecks: [
      { goalId: 'g1', level: 'mid' },
      { goalId: 'g2', level: 'low' },
    ],
    parentMessageSent: true,
    parentMessageSentAt: '2024-12-20T18:30:00',
    hourlyRate: 40000,
    totalFee: 80000,
    isPaid: true,
    createdAt: '2024-12-20T18:00:00',
  },
  {
    id: 'l3',
    studentId: '2',
    date: '2024-12-22',
    startTime: '19:00',
    endTime: '21:00',
    durationMinutes: 120,
    topic: '다항식의 나눗셈',
    memo: '나눗셈 알고리즘 이해, 조립제법 소개',
    goalChecks: [
      { goalId: 'g4', level: 'high' },
      { goalId: 'g5', level: 'mid' },
    ],
    parentMessageSent: true,
    parentMessageSentAt: '2024-12-22T21:15:00',
    hourlyRate: 50000,
    totalFee: 100000,
    isPaid: false,
    createdAt: '2024-12-22T21:00:00',
  },
  {
    id: 'l4',
    studentId: '3',
    date: '2024-12-24',
    startTime: '14:00',
    endTime: '16:00',
    durationMinutes: 120,
    topic: '일차방정식 기초',
    memo: '등식의 성질 설명, 기초 문제 풀이',
    goalChecks: [
      { goalId: 'g7', level: 'mid' },
      { goalId: 'g8', level: 'low' },
    ],
    parentMessageSent: false,
    hourlyRate: 35000,
    totalFee: 70000,
    isPaid: false,
    createdAt: '2024-12-24T16:00:00',
  },
];

// ===================================
// MOCK SCHEDULED LESSONS
// ===================================
export const MOCK_SCHEDULES: ScheduledLesson[] = [
  {
    id: 's1',
    studentId: '1',
    studentName: '김민수',
    dayOfWeek: 1, // 월요일
    startTime: '16:00',
    endTime: '18:00',
    subject: '수학',
    isRecurring: true,
  },
  {
    id: 's2',
    studentId: '1',
    studentName: '김민수',
    dayOfWeek: 4, // 목요일
    startTime: '16:00',
    endTime: '18:00',
    subject: '수학',
    isRecurring: true,
  },
  {
    id: 's3',
    studentId: '2',
    studentName: '이서연',
    dayOfWeek: 0, // 일요일
    startTime: '19:00',
    endTime: '21:00',
    subject: '수학',
    isRecurring: true,
  },
  {
    id: 's4',
    studentId: '3',
    studentName: '박준호',
    dayOfWeek: 2, // 화요일
    startTime: '14:00',
    endTime: '16:00',
    subject: '수학',
    isRecurring: true,
  },
];

// ===================================
// MOCK AI BRIEFING
// ===================================
export function generateAIBriefing(studentId: string): AIBriefing | null {
  const student = MOCK_STUDENTS.find(s => s.id === studentId);
  if (!student) return null;
  
  const lastLesson = MOCK_LESSONS.filter(l => l.studentId === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  return {
    studentId,
    studentName: student.name,
    lastLessonSummary: lastLesson 
      ? `지난 수업: ${lastLesson.topic} - ${lastLesson.memo}`
      : '첫 수업입니다',
    todayGoals: student.learningGoals?.filter(g => g.isActive).map(g => g.title) || [],
    reviewPoints: student.diagnosis?.gaps.map(g => `${g.topicName} 복습 필요`) || [],
    tutorHints: student.diagnosis?.tutorTips || [student.notes || ''].filter(Boolean),
    upcomingTime: '오후 4시',
  };
}

// ===================================
// MOCK BADGES
// ===================================
export const MOCK_BADGES: Badge[] = [
  {
    id: '1',
    icon: 'fire',
    label: '10일 연속',
    description: '10일 연속으로 수업을 진행했어요',
    color: 'mint',
    earned: true,
    earnedAt: '2024-12-15',
  },
  {
    id: '2',
    icon: 'target',
    label: '첫 수업',
    description: '첫 수업을 완료했어요',
    color: 'mint',
    earned: true,
    earnedAt: '2024-11-01',
  },
  {
    id: '3',
    icon: 'crown',
    label: '성실왕',
    description: '한 달간 빠짐없이 기록했어요',
    color: 'mint',
    earned: true,
    earnedAt: '2024-12-01',
  },
  {
    id: '4',
    icon: 'trending',
    label: '목표 달성',
    description: '학생의 목표 단원을 완료했어요',
    color: 'mint',
    earned: false,
  },
  {
    id: '5',
    icon: 'diamond',
    label: '프리미엄',
    description: '50회 이상 수업을 기록했어요',
    color: 'mint',
    earned: false,
  },
];

// ===================================
// MOCK PORTFOLIO STATS
// ===================================
export const MOCK_STATS: PortfolioStats = {
  totalLessons: 42,
  totalStudents: 5,
  avgLevel: 78,
  streak: 12,
  totalHours: 84,
  totalEarnings: 3500000,
};

// ===================================
// MOCK MONTHLY SUMMARY
// ===================================
export function generateMonthlySummary(month: string): MonthlySummary {
  const lessons = MOCK_LESSONS.filter(l => l.date.startsWith(month));
  const totalHours = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0) / 60, 0);
  const totalEarnings = lessons.reduce((sum, l) => sum + (l.totalFee || 0), 0);
  const paidEarnings = lessons.filter(l => l.isPaid).reduce((sum, l) => sum + (l.totalFee || 0), 0);
  
  const studentBreakdown = MOCK_STUDENTS.map(student => {
    const studentLessons = lessons.filter(l => l.studentId === student.id);
    const studentHours = studentLessons.reduce((sum, l) => sum + (l.durationMinutes || 0) / 60, 0);
    const studentTotal = studentLessons.reduce((sum, l) => sum + (l.totalFee || 0), 0);
    const studentPaid = studentLessons.filter(l => l.isPaid).reduce((sum, l) => sum + (l.totalFee || 0), 0);
    
    return {
      studentId: student.id,
      studentName: student.name,
      lessonCount: studentLessons.length,
      totalHours: studentHours,
      hourlyRate: student.hourlyRate || 0,
      totalAmount: studentTotal,
      paidAmount: studentPaid,
      unpaidAmount: studentTotal - studentPaid,
    };
  }).filter(s => s.lessonCount > 0);
  
  return {
    month,
    totalLessons: lessons.length,
    totalHours,
    totalEarnings,
    paidEarnings,
    unpaidEarnings: totalEarnings - paidEarnings,
    studentBreakdown,
  };
}

// ===================================
// HELPER FUNCTIONS
// ===================================
export function getStudentById(id: string): Student | undefined {
  return MOCK_STUDENTS.find(s => s.id === id);
}

export function getLessonsByStudent(studentId: string): LessonRecord[] {
  return MOCK_LESSONS.filter(l => l.studentId === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentLessons(limit: number = 10): LessonRecord[] {
  return [...MOCK_LESSONS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getTodaySchedule(): ScheduledLesson[] {
  const today = new Date().getDay();
  return MOCK_SCHEDULES.filter(s => s.dayOfWeek === today);
}

export function getUpcomingLessonsToday(): (ScheduledLesson & { briefing?: AIBriefing })[] {
  const today = new Date().getDay();
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return MOCK_SCHEDULES
    .filter(s => s.dayOfWeek === today && s.startTime > currentTime)
    .map(schedule => ({
      ...schedule,
      briefing: generateAIBriefing(schedule.studentId) || undefined,
    }));
}
