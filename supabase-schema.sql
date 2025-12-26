-- Chalk App - Supabase Schema
-- Phase 1 MVP + 피드백 반영 스키마

-- 1. 학생 테이블
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_phone TEXT,
  subject TEXT, -- 예: 수학, 영어
  grade TEXT, -- 예: 중1, 고2
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 커리큘럼 템플릿 (선생님 입력 시간 단축용)
CREATE TABLE curriculum_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 예: "중1 수학 기초"
  subject TEXT,
  outcomes JSONB DEFAULT '[]', -- [{title: "인수분해", order: 1}, ...]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 학습 목표 (학생별 개인화된 목표)
CREATE TABLE learning_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- 예: "이차방정식 풀이"
  subject TEXT,
  template_id UUID REFERENCES curriculum_templates(id), -- 템플릿에서 가져온 경우
  sort_order INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 수업 기록
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  duration_minutes INT, -- 수업 시간 (분)
  feedback_raw TEXT, -- 선생님이 작성한 원본 피드백
  feedback_polished TEXT, -- AI가 다듬은 피드백
  sent_to_parent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 수업별 성취도 로그 (별도 테이블로 분리 - 통계 분석 용이)
CREATE TABLE outcome_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  outcome_id UUID REFERENCES learning_outcomes(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('상', '중', '하')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_logs ENABLE ROW LEVEL SECURITY;

-- Policies: 튜터는 자신의 데이터만 접근
CREATE POLICY "Tutors can manage own students" ON students
  FOR ALL USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can manage own templates" ON curriculum_templates
  FOR ALL USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can manage outcomes via students" ON learning_outcomes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = learning_outcomes.student_id AND students.tutor_id = auth.uid())
  );

CREATE POLICY "Tutors can manage own lessons" ON lessons
  FOR ALL USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can manage outcome_logs via lessons" ON outcome_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM lessons WHERE lessons.id = outcome_logs.lesson_id AND lessons.tutor_id = auth.uid())
  );

-- 7. Indexes
CREATE INDEX idx_students_tutor ON students(tutor_id);
CREATE INDEX idx_lessons_student ON lessons(student_id);
CREATE INDEX idx_lessons_date ON lessons(date);
CREATE INDEX idx_outcome_logs_lesson ON outcome_logs(lesson_id);
