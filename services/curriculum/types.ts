/**
 * Curriculum Types for Mobile
 * Simplified version optimized for React Native
 */

export type GradeLevel =
  | 'ELEMENTARY_1' | 'ELEMENTARY_2' | 'ELEMENTARY_3'
  | 'ELEMENTARY_4' | 'ELEMENTARY_5' | 'ELEMENTARY_6'
  | 'MIDDLE_1' | 'MIDDLE_2' | 'MIDDLE_3'
  | 'HIGH_1' | 'HIGH_2' | 'HIGH_3';

export type Subject = 'MATH' | 'KOREAN' | 'ENGLISH' | 'SCIENCE';

export interface Topic {
  code: string;
  name: string;
  grade: GradeLevel;
  subject: Subject;
  prerequisites: string[]; // Topic codes
  estimatedHours: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface Struggle {
  topicCode: string;
  description: string;
  symptom: string;
  rootCause: string;
  remediation: string;
  frequency: 'VERY_COMMON' | 'COMMON' | 'OCCASIONAL';
}

export interface DiagnosisResult {
  studentId: string;
  targetTopic: Topic;
  gaps: {
    topic: Topic;
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    estimatedHoursToFix: number;
  }[];
  recommendedPath: Topic[];
  totalEstimatedHours: number;
}

// Grade display names
export const GRADE_NAMES: Record<GradeLevel, string> = {
  ELEMENTARY_1: '초1',
  ELEMENTARY_2: '초2',
  ELEMENTARY_3: '초3',
  ELEMENTARY_4: '초4',
  ELEMENTARY_5: '초5',
  ELEMENTARY_6: '초6',
  MIDDLE_1: '중1',
  MIDDLE_2: '중2',
  MIDDLE_3: '중3',
  HIGH_1: '고1',
  HIGH_2: '고2',
  HIGH_3: '고3',
};

export const SUBJECT_NAMES: Record<Subject, string> = {
  MATH: '수학',
  KOREAN: '국어',
  ENGLISH: '영어',
  SCIENCE: '과학',
};
