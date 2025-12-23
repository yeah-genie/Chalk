/**
 * 선수학습 연계 맵 (중등 수학)
 * 스펙 문서 기반 - 2022 개정 교육과정
 */

export interface TopicNode {
  code: string;
  name: string;
  grade: string;
  category: '수와연산' | '문자와식' | '함수' | '도형' | '확률통계';
  prerequisites: string[]; // 선수 단원 코드
  estimatedHours: number;
  difficulty: number; // 1-5
  commonGaps: string[]; // 흔한 결손 패턴
  tutorTips?: string[]; // 튜터 힌트
}

// 선수학습 맵 데이터
export const PREREQUISITE_MAP: Record<string, TopicNode> = {
  // ========== 수와 연산 ==========
  'E6-FRACTION': {
    code: 'E6-FRACTION',
    name: '분수/소수 계산',
    grade: '초6',
    category: '수와연산',
    prerequisites: [],
    estimatedHours: 8,
    difficulty: 2,
    commonGaps: ['약분/통분 개념 부족', '소수점 위치 혼동'],
    tutorTips: ['피자 비유로 설명하면 효과적'],
  },
  'M1-INTEGER': {
    code: 'M1-INTEGER',
    name: '정수와 유리수',
    grade: '중1',
    category: '수와연산',
    prerequisites: ['E6-FRACTION'],
    estimatedHours: 10,
    difficulty: 3,
    commonGaps: ['음수 개념 혼동', '부호 규칙 암기 부족'],
    tutorTips: ['수직선 활용', '돈/온도 비유'],
  },
  'M2-RATIONAL': {
    code: 'M2-RATIONAL',
    name: '유리수와 순환소수',
    grade: '중2',
    category: '수와연산',
    prerequisites: ['M1-INTEGER'],
    estimatedHours: 6,
    difficulty: 3,
    commonGaps: ['순환마디 찾기 어려움'],
  },
  'M3-SQRT': {
    code: 'M3-SQRT',
    name: '제곱근과 실수',
    grade: '중3',
    category: '수와연산',
    prerequisites: ['M2-RATIONAL'],
    estimatedHours: 10,
    difficulty: 4,
    commonGaps: ['무리수 개념 혼동', '근호 계산 실수'],
  },

  // ========== 문자와 식 ==========
  'E6-RATIO': {
    code: 'E6-RATIO',
    name: '비와 비율',
    grade: '초6',
    category: '문자와식',
    prerequisites: ['E6-FRACTION'],
    estimatedHours: 6,
    difficulty: 2,
    commonGaps: ['비와 비율 혼동'],
  },
  'M1-VARIABLE': {
    code: 'M1-VARIABLE',
    name: '문자와 식',
    grade: '중1',
    category: '문자와식',
    prerequisites: ['E6-RATIO', 'M1-INTEGER'],
    estimatedHours: 8,
    difficulty: 3,
    commonGaps: ['변수 개념 이해 부족', '동류항 구분 어려움'],
    tutorTips: ['박스(□) → 문자 전환 설명'],
  },
  'M1-LINEAR-EQ': {
    code: 'M1-LINEAR-EQ',
    name: '일차방정식',
    grade: '중1',
    category: '문자와식',
    prerequisites: ['M1-VARIABLE', 'M1-INTEGER'],
    estimatedHours: 10,
    difficulty: 3,
    commonGaps: ['이항 개념 혼동', '등식의 성질 암기 부족'],
    tutorTips: ['저울 비유 활용', '좌우 동시 연산 강조'],
  },
  'M2-POLYNOMIAL': {
    code: 'M2-POLYNOMIAL',
    name: '다항식의 계산',
    grade: '중2',
    category: '문자와식',
    prerequisites: ['M1-VARIABLE'],
    estimatedHours: 8,
    difficulty: 3,
    commonGaps: ['분배법칙 실수', '지수법칙 혼동'],
  },
  'M2-LINEAR-SYSTEM': {
    code: 'M2-LINEAR-SYSTEM',
    name: '연립방정식',
    grade: '중2',
    category: '문자와식',
    prerequisites: ['M1-LINEAR-EQ'],
    estimatedHours: 10,
    difficulty: 4,
    commonGaps: ['대입법/가감법 혼동', '문제 → 식 변환 어려움'],
  },
  'M2-INEQUALITY': {
    code: 'M2-INEQUALITY',
    name: '일차부등식',
    grade: '중2',
    category: '문자와식',
    prerequisites: ['M1-LINEAR-EQ'],
    estimatedHours: 8,
    difficulty: 3,
    commonGaps: ['부등호 방향 바꾸는 조건 혼동'],
  },
  'M3-FACTORIZATION': {
    code: 'M3-FACTORIZATION',
    name: '인수분해',
    grade: '중3',
    category: '문자와식',
    prerequisites: ['M2-POLYNOMIAL'],
    estimatedHours: 12,
    difficulty: 4,
    commonGaps: ['공식 암기 부족', '약수/배수 결손'],
    tutorTips: ['곱셈공식과 연결해서 역으로 설명'],
  },
  'M3-QUADRATIC-EQ': {
    code: 'M3-QUADRATIC-EQ',
    name: '이차방정식',
    grade: '중3',
    category: '문자와식',
    prerequisites: ['M3-FACTORIZATION', 'M2-LINEAR-SYSTEM'],
    estimatedHours: 12,
    difficulty: 4,
    commonGaps: ['인수분해 실수', '근의 공식 암기'],
  },

  // ========== 함수 ==========
  'E6-PROPORTION': {
    code: 'E6-PROPORTION',
    name: '비례식',
    grade: '초6',
    category: '함수',
    prerequisites: ['E6-RATIO'],
    estimatedHours: 4,
    difficulty: 2,
    commonGaps: ['내항/외항 혼동'],
  },
  'M1-COORDINATE': {
    code: 'M1-COORDINATE',
    name: '좌표평면과 그래프',
    grade: '중1',
    category: '함수',
    prerequisites: ['M1-INTEGER'],
    estimatedHours: 6,
    difficulty: 2,
    commonGaps: ['x좌표/y좌표 혼동', '사분면 개념'],
    tutorTips: ['지도 비유 활용'],
  },
  'M2-LINEAR-FUNC': {
    code: 'M2-LINEAR-FUNC',
    name: '일차함수',
    grade: '중2',
    category: '함수',
    prerequisites: ['M1-COORDINATE', 'M1-LINEAR-EQ'],
    estimatedHours: 12,
    difficulty: 4,
    commonGaps: ['기울기 개념 부족', '그래프 ↔ 식 변환 어려움'],
    tutorTips: ['기울기 = 변화율 강조', '실생활 예시 활용'],
  },
  'M3-QUADRATIC-FUNC': {
    code: 'M3-QUADRATIC-FUNC',
    name: '이차함수',
    grade: '중3',
    category: '함수',
    prerequisites: ['M2-LINEAR-FUNC', 'M3-QUADRATIC-EQ'],
    estimatedHours: 14,
    difficulty: 5,
    commonGaps: ['꼭짓점/축 개념', '그래프 이동'],
    tutorTips: ['포물선의 실생활 예시 (포물선 운동)'],
  },

  // ========== 도형 ==========
  'E6-AREA': {
    code: 'E6-AREA',
    name: '도형의 넓이',
    grade: '초6',
    category: '도형',
    prerequisites: [],
    estimatedHours: 6,
    difficulty: 2,
    commonGaps: ['공식 혼동', '단위 변환'],
  },
  'M1-BASIC-SHAPE': {
    code: 'M1-BASIC-SHAPE',
    name: '기본 도형',
    grade: '중1',
    category: '도형',
    prerequisites: ['E6-AREA'],
    estimatedHours: 8,
    difficulty: 2,
    commonGaps: ['점/선/면 구분', '각도 계산'],
  },
  'M2-TRIANGLE': {
    code: 'M2-TRIANGLE',
    name: '삼각형의 성질',
    grade: '중2',
    category: '도형',
    prerequisites: ['M1-BASIC-SHAPE'],
    estimatedHours: 10,
    difficulty: 3,
    commonGaps: ['합동 조건 혼동'],
  },
  'M2-QUADRILATERAL': {
    code: 'M2-QUADRILATERAL',
    name: '사각형의 성질',
    grade: '중2',
    category: '도형',
    prerequisites: ['M2-TRIANGLE'],
    estimatedHours: 8,
    difficulty: 3,
    commonGaps: ['평행사변형 vs 마름모'],
  },
  'M2-SIMILARITY': {
    code: 'M2-SIMILARITY',
    name: '도형의 닮음',
    grade: '중2',
    category: '도형',
    prerequisites: ['M2-QUADRILATERAL'],
    estimatedHours: 10,
    difficulty: 4,
    commonGaps: ['닮음비 계산', '닮음 조건'],
  },
  'M3-PYTHAGORAS': {
    code: 'M3-PYTHAGORAS',
    name: '피타고라스 정리',
    grade: '중3',
    category: '도형',
    prerequisites: ['M2-SIMILARITY', 'M3-SQRT'],
    estimatedHours: 8,
    difficulty: 4,
    commonGaps: ['직각삼각형 판별', '응용 문제'],
  },
  'M3-TRIGONOMETRY': {
    code: 'M3-TRIGONOMETRY',
    name: '삼각비',
    grade: '중3',
    category: '도형',
    prerequisites: ['M3-PYTHAGORAS'],
    estimatedHours: 10,
    difficulty: 5,
    commonGaps: ['sin/cos/tan 혼동', '특수각 값'],
  },
};

// 흔한 결손 패턴 (스펙 문서 기반)
export const COMMON_GAP_PATTERNS: Record<string, { realGap: string[]; source: string }> = {
  'M1-LINEAR-EQ': {
    realGap: ['M1-INTEGER', 'M1-VARIABLE'],
    source: '오르비, 김과외 커뮤니티',
  },
  'M2-LINEAR-FUNC': {
    realGap: ['M1-COORDINATE', 'M1-VARIABLE'],
    source: '튜터 인터뷰',
  },
  'M3-QUADRATIC-EQ': {
    realGap: ['M3-FACTORIZATION', 'E6-FRACTION'],
    source: '교육과정 연계표',
  },
  'M3-QUADRATIC-FUNC': {
    realGap: ['M3-QUADRATIC-EQ', 'M1-COORDINATE'],
    source: '교육과정 연계표',
  },
};

/**
 * AI 진단 로직 - 결손 단원 파악
 */
export interface DiagnosticInput {
  grade: string;
  subject: string;
  currentTopic: string;
  currentLevel: 'high' | 'mid' | 'low';
  targetTopic?: string;
}

export interface DiagnosticOutput {
  estimatedGap: string;
  missingPrerequisites: TopicNode[];
  recommendedStartPoint: string;
  estimatedWeeks: number;
  curriculum: CurriculumWeek[];
  warnings: string[];
  tutorTips: string[];
}

export interface CurriculumWeek {
  week: number;
  topics: string[];
  goals: string[];
  estimatedHours: number;
}

/**
 * 선수학습 맵 기반 진단 실행
 */
export function diagnoseStudent(input: DiagnosticInput): DiagnosticOutput {
  const currentNode = PREREQUISITE_MAP[input.currentTopic];
  if (!currentNode) {
    return {
      estimatedGap: '알 수 없음',
      missingPrerequisites: [],
      recommendedStartPoint: input.currentTopic,
      estimatedWeeks: 0,
      curriculum: [],
      warnings: ['선수학습 맵에 없는 단원입니다'],
      tutorTips: [],
    };
  }

  // 결손 레벨에 따른 깊이
  const depth = input.currentLevel === 'low' ? 3 : input.currentLevel === 'mid' ? 2 : 1;
  
  // 선수 단원 탐색 (DFS)
  const missingPrereqs: TopicNode[] = [];
  const visited = new Set<string>();
  
  function findPrerequisites(code: string, currentDepth: number) {
    if (currentDepth > depth || visited.has(code)) return;
    visited.add(code);
    
    const node = PREREQUISITE_MAP[code];
    if (!node) return;
    
    for (const prereqCode of node.prerequisites) {
      const prereqNode = PREREQUISITE_MAP[prereqCode];
      if (prereqNode && !visited.has(prereqCode)) {
        missingPrereqs.push(prereqNode);
        findPrerequisites(prereqCode, currentDepth + 1);
      }
    }
  }
  
  findPrerequisites(input.currentTopic, 0);
  
  // 예상 결손 계산
  const gradeGap = calculateGradeGap(currentNode.grade, missingPrereqs);
  
  // 총 예상 시간 계산
  const totalHours = missingPrereqs.reduce((sum, node) => sum + node.estimatedHours, 0);
  const estimatedWeeks = Math.ceil(totalHours / 3); // 주 3시간 기준
  
  // 시작점 추천
  const recommendedStart = missingPrereqs.length > 0 
    ? missingPrereqs[missingPrereqs.length - 1].name 
    : currentNode.name;
  
  // 경고 메시지
  const warnings: string[] = [];
  const commonGap = COMMON_GAP_PATTERNS[input.currentTopic];
  if (commonGap) {
    warnings.push(`이 단원이 어려운 학생의 대부분이 ${commonGap.realGap.map(c => PREREQUISITE_MAP[c]?.name).join(', ')} 결손을 가지고 있습니다.`);
  }
  
  // 튜터 힌트
  const tutorTips: string[] = currentNode.tutorTips || [];
  missingPrereqs.forEach(node => {
    if (node.tutorTips) tutorTips.push(...node.tutorTips);
  });
  
  // 커리큘럼 생성
  const curriculum = generateCurriculum(missingPrereqs, currentNode);
  
  return {
    estimatedGap: gradeGap,
    missingPrerequisites: missingPrereqs,
    recommendedStartPoint: recommendedStart,
    estimatedWeeks,
    curriculum,
    warnings,
    tutorTips: [...new Set(tutorTips)], // 중복 제거
  };
}

function calculateGradeGap(currentGrade: string, prereqs: TopicNode[]): string {
  if (prereqs.length === 0) return '결손 없음';
  
  const grades = ['초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];
  const currentIdx = grades.indexOf(currentGrade);
  const lowestGrade = prereqs.reduce((lowest, node) => {
    const idx = grades.indexOf(node.grade);
    return idx < grades.indexOf(lowest) ? node.grade : lowest;
  }, currentGrade);
  const lowestIdx = grades.indexOf(lowestGrade);
  
  const gap = currentIdx - lowestIdx;
  if (gap <= 0) return '결손 없음';
  if (gap === 1) return `${lowestGrade} 수준 (-1년)`;
  return `${lowestGrade} 수준 (-${gap}년)`;
}

function generateCurriculum(prereqs: TopicNode[], target: TopicNode): CurriculumWeek[] {
  const curriculum: CurriculumWeek[] = [];
  let weekNum = 1;
  
  // 선수 단원 먼저
  const sortedPrereqs = [...prereqs].reverse(); // 가장 기초부터
  let currentHours = 0;
  let currentTopics: string[] = [];
  let currentGoals: string[] = [];
  
  for (const node of sortedPrereqs) {
    if (currentHours + node.estimatedHours > 6) {
      // 새 주차
      if (currentTopics.length > 0) {
        curriculum.push({
          week: weekNum++,
          topics: currentTopics,
          goals: currentGoals,
          estimatedHours: currentHours,
        });
      }
      currentTopics = [node.name];
      currentGoals = [`${node.name} 복습 완료`];
      currentHours = node.estimatedHours;
    } else {
      currentTopics.push(node.name);
      currentGoals.push(`${node.name} 복습 완료`);
      currentHours += node.estimatedHours;
    }
  }
  
  // 남은 것 + 목표 단원
  currentTopics.push(target.name);
  currentGoals.push(`${target.name} 학습 시작`);
  curriculum.push({
    week: weekNum,
    topics: currentTopics,
    goals: currentGoals,
    estimatedHours: currentHours + target.estimatedHours,
  });
  
  return curriculum;
}

/**
 * 학년별 단원 목록 조회
 */
export function getTopicsByGrade(grade: string): TopicNode[] {
  return Object.values(PREREQUISITE_MAP).filter(node => node.grade === grade);
}

/**
 * 카테고리별 단원 목록 조회
 */
export function getTopicsByCategory(category: TopicNode['category']): TopicNode[] {
  return Object.values(PREREQUISITE_MAP).filter(node => node.category === category);
}

