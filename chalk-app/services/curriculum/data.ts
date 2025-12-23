/**
 * Korean Middle School Math Curriculum Data
 * Optimized for mobile - key topics with prerequisites
 */

import { Topic, Struggle, GradeLevel } from './types';

export const MATH_TOPICS: Topic[] = [
  // 초6 (prerequisites)
  {
    code: 'FRACTION-OPS',
    name: '분수의 사칙연산',
    grade: 'ELEMENTARY_6',
    subject: 'MATH',
    prerequisites: [],
    estimatedHours: 12,
    difficulty: 3,
  },
  {
    code: 'RATIO-RATE',
    name: '비와 비율',
    grade: 'ELEMENTARY_6',
    subject: 'MATH',
    prerequisites: ['FRACTION-OPS'],
    estimatedHours: 8,
    difficulty: 3,
  },
  {
    code: 'DECIMAL-OPS',
    name: '소수의 사칙연산',
    grade: 'ELEMENTARY_6',
    subject: 'MATH',
    prerequisites: [],
    estimatedHours: 10,
    difficulty: 2,
  },

  // 중1
  {
    code: 'INTEGERS',
    name: '정수와 유리수',
    grade: 'MIDDLE_1',
    subject: 'MATH',
    prerequisites: ['FRACTION-OPS', 'DECIMAL-OPS'],
    estimatedHours: 14,
    difficulty: 3,
  },
  {
    code: 'LETTERS-EXPR',
    name: '문자와 식',
    grade: 'MIDDLE_1',
    subject: 'MATH',
    prerequisites: ['INTEGERS'],
    estimatedHours: 12,
    difficulty: 3,
  },
  {
    code: 'LINEAR-EQ-1',
    name: '일차방정식',
    grade: 'MIDDLE_1',
    subject: 'MATH',
    prerequisites: ['LETTERS-EXPR', 'INTEGERS'],
    estimatedHours: 10,
    difficulty: 3,
  },
  {
    code: 'COORDINATES',
    name: '좌표평면과 그래프',
    grade: 'MIDDLE_1',
    subject: 'MATH',
    prerequisites: ['INTEGERS'],
    estimatedHours: 8,
    difficulty: 2,
  },
  {
    code: 'BASIC-GEOMETRY',
    name: '기본 도형',
    grade: 'MIDDLE_1',
    subject: 'MATH',
    prerequisites: [],
    estimatedHours: 10,
    difficulty: 2,
  },

  // 중2
  {
    code: 'EXPONENTS',
    name: '지수법칙',
    grade: 'MIDDLE_2',
    subject: 'MATH',
    prerequisites: ['INTEGERS'],
    estimatedHours: 8,
    difficulty: 3,
  },
  {
    code: 'POLYNOMIALS',
    name: '다항식의 계산',
    grade: 'MIDDLE_2',
    subject: 'MATH',
    prerequisites: ['LETTERS-EXPR', 'EXPONENTS'],
    estimatedHours: 12,
    difficulty: 3,
  },
  {
    code: 'LINEAR-EQ-2',
    name: '연립방정식',
    grade: 'MIDDLE_2',
    subject: 'MATH',
    prerequisites: ['LINEAR-EQ-1', 'POLYNOMIALS'],
    estimatedHours: 14,
    difficulty: 4,
  },
  {
    code: 'INEQUALITIES',
    name: '부등식',
    grade: 'MIDDLE_2',
    subject: 'MATH',
    prerequisites: ['LINEAR-EQ-1', 'INTEGERS'],
    estimatedHours: 10,
    difficulty: 3,
  },
  {
    code: 'LINEAR-FUNC',
    name: '일차함수',
    grade: 'MIDDLE_2',
    subject: 'MATH',
    prerequisites: ['COORDINATES', 'LINEAR-EQ-1'],
    estimatedHours: 16,
    difficulty: 4,
  },
  {
    code: 'SIMILARITY',
    name: '도형의 닮음',
    grade: 'MIDDLE_2',
    subject: 'MATH',
    prerequisites: ['RATIO-RATE', 'BASIC-GEOMETRY'],
    estimatedHours: 12,
    difficulty: 4,
  },

  // 중3
  {
    code: 'SQUARE-ROOTS',
    name: '제곱근과 실수',
    grade: 'MIDDLE_3',
    subject: 'MATH',
    prerequisites: ['EXPONENTS', 'INTEGERS'],
    estimatedHours: 12,
    difficulty: 4,
  },
  {
    code: 'FACTORIZATION',
    name: '인수분해',
    grade: 'MIDDLE_3',
    subject: 'MATH',
    prerequisites: ['POLYNOMIALS', 'EXPONENTS'],
    estimatedHours: 16,
    difficulty: 4,
  },
  {
    code: 'QUADRATIC-EQ',
    name: '이차방정식',
    grade: 'MIDDLE_3',
    subject: 'MATH',
    prerequisites: ['FACTORIZATION', 'SQUARE-ROOTS'],
    estimatedHours: 14,
    difficulty: 4,
  },
  {
    code: 'QUADRATIC-FUNC',
    name: '이차함수',
    grade: 'MIDDLE_3',
    subject: 'MATH',
    prerequisites: ['LINEAR-FUNC', 'FACTORIZATION', 'QUADRATIC-EQ'],
    estimatedHours: 16,
    difficulty: 5,
  },
  {
    code: 'PYTHAGOREAN',
    name: '피타고라스 정리',
    grade: 'MIDDLE_3',
    subject: 'MATH',
    prerequisites: ['SQUARE-ROOTS', 'BASIC-GEOMETRY'],
    estimatedHours: 10,
    difficulty: 3,
  },
  {
    code: 'TRIGONOMETRY',
    name: '삼각비',
    grade: 'MIDDLE_3',
    subject: 'MATH',
    prerequisites: ['PYTHAGOREAN', 'SIMILARITY'],
    estimatedHours: 12,
    difficulty: 4,
  },
];

export const COMMON_STRUGGLES: Struggle[] = [
  {
    topicCode: 'INTEGERS',
    description: '음수 × 음수 = 양수 이해 불가',
    symptom: '(-3) × (-2) = -6 으로 계산',
    rootCause: '마이너스가 "빼기"라는 초등 개념에서 벗어나지 못함',
    remediation: '빚 × 빚 = 이득 비유, 방향 반전 개념',
    frequency: 'VERY_COMMON',
  },
  {
    topicCode: 'LINEAR-EQ-1',
    description: '이항 시 부호 바꾸기 오류',
    symptom: 'x + 3 = 5 → x = 5 + 3 으로 이항',
    rootCause: '등식의 성질 이해 부족',
    remediation: '저울 비유: 양쪽에 똑같이 빼야 균형',
    frequency: 'VERY_COMMON',
  },
  {
    topicCode: 'LINEAR-FUNC',
    description: '기울기 개념 혼동',
    symptom: '기울기를 y좌표 변화량으로만 이해',
    rootCause: '기울기 = y변화/x변화 비율 이해 부족',
    remediation: '"가로 1칸 갈 때 세로 몇 칸?"',
    frequency: 'VERY_COMMON',
  },
  {
    topicCode: 'FACTORIZATION',
    description: '어떤 공식 적용할지 판단 못함',
    symptom: 'x² + 5x + 6 에서 무작정 공식 대입',
    rootCause: '식의 형태 분석 능력 부족',
    remediation: '패턴 인식: 항 개수, 부호, 계수 체크',
    frequency: 'VERY_COMMON',
  },
  {
    topicCode: 'QUADRATIC-FUNC',
    description: '꼭짓점 좌표 부호 혼동',
    symptom: 'y = (x-3)² + 2 꼭짓점을 (-3, 2)로',
    rootCause: '표준형에서 p 부호 반대 이해 못함',
    remediation: '"괄호 안이 0 되는 x 값"으로 접근',
    frequency: 'VERY_COMMON',
  },
  {
    topicCode: 'LINEAR-EQ-2',
    description: '가감법에서 부호 처리 오류',
    symptom: '빼기할 때 뒷 식 전체 부호 안 바꿈',
    rootCause: '분배법칙 적용 범위 이해 부족',
    remediation: '빼기 = 뒤집어서 더하기, 괄호로 묶기',
    frequency: 'VERY_COMMON',
  },
];

// Helper functions
export function getTopicByCode(code: string): Topic | undefined {
  return MATH_TOPICS.find(t => t.code === code);
}

export function getTopicsByGrade(grade: GradeLevel): Topic[] {
  return MATH_TOPICS.filter(t => t.grade === grade);
}

export function getAllPrerequisites(topicCode: string, visited = new Set<string>()): Topic[] {
  if (visited.has(topicCode)) return [];
  visited.add(topicCode);

  const topic = getTopicByCode(topicCode);
  if (!topic) return [];

  const result: Topic[] = [];
  for (const prereqCode of topic.prerequisites) {
    const prereq = getTopicByCode(prereqCode);
    if (prereq) {
      result.push(prereq);
      result.push(...getAllPrerequisites(prereqCode, visited));
    }
  }
  return result;
}

export function getStrugglesForTopic(topicCode: string): Struggle[] {
  return COMMON_STRUGGLES.filter(s => s.topicCode === topicCode);
}

export function diagnoseGaps(
  targetTopicCode: string,
  knownTopicCodes: string[]
): { topic: Topic; severity: 'CRITICAL' | 'MODERATE' | 'MINOR' }[] {
  const allPrereqs = getAllPrerequisites(targetTopicCode);
  const knownSet = new Set(knownTopicCodes);

  return allPrereqs
    .filter(t => !knownSet.has(t.code))
    .map(topic => ({
      topic,
      severity: topic.difficulty >= 4 ? 'CRITICAL' :
                topic.difficulty >= 3 ? 'MODERATE' : 'MINOR',
    }));
}
