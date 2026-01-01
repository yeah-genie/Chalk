-- ===================================
-- PARENT SHARING & ENGAGEMENT TRACKING
-- Phase 1: 학부모 공유 시스템
-- ===================================

-- ===================================
-- REPORT SHARES (토큰 기반 공유)
-- ===================================
CREATE TABLE IF NOT EXISTS public.report_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL UNIQUE, -- 고유 공유 토큰 (URL-safe)
    parent_email TEXT, -- 공유 대상 이메일
    expires_at TIMESTAMPTZ, -- 만료 시간 (null = 무제한)
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    email_sent_at TIMESTAMPTZ, -- 이메일 발송 시간
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for report_shares
ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;

-- 튜터는 자신의 세션 공유를 관리할 수 있음
CREATE POLICY "Tutors can manage their report shares"
    ON public.report_shares FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions s
            WHERE s.id = report_shares.session_id
            AND s.tutor_id = auth.uid()
        )
    );

-- 공개 접근: 토큰으로 조회 가능 (select만)
CREATE POLICY "Anyone can view reports by token"
    ON public.report_shares FOR SELECT
    USING (true);

-- ===================================
-- REPORT VIEWS (열람 기록)
-- ===================================
CREATE TABLE IF NOT EXISTS public.report_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    share_id UUID REFERENCES public.report_shares(id) ON DELETE CASCADE NOT NULL,
    viewer_ip TEXT, -- 익명화된 IP (선택적)
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for report_views
ALTER TABLE public.report_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view their report analytics"
    ON public.report_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.report_shares rs
            JOIN public.sessions s ON s.id = rs.session_id
            WHERE rs.id = report_views.share_id
            AND s.tutor_id = auth.uid()
        )
    );

-- Insert는 누구나 가능 (조회 기록)
CREATE POLICY "Anyone can log views"
    ON public.report_views FOR INSERT
    WITH CHECK (true);

-- ===================================
-- PERSONALIZED DECAY RATES (Phase 2)
-- 학생별 토픽 망각률 기록
-- ===================================
CREATE TABLE IF NOT EXISTS public.student_decay_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL,
    calculated_decay_rate DECIMAL(5,4) DEFAULT 0.15, -- 0.0000 ~ 9.9999
    sample_count INTEGER DEFAULT 0, -- 계산에 사용된 샘플 수
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, topic_id)
);

ALTER TABLE public.student_decay_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage student decay rates"
    ON public.student_decay_rates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = student_decay_rates.student_id
            AND s.tutor_id = auth.uid()
        )
    );

-- ===================================
-- PREDICTION SNAPSHOTS (예측 기록)
-- 예측 정확도 측정을 위한 스냅샷
-- ===================================
CREATE TABLE IF NOT EXISTS public.prediction_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL,
    predicted_score INTEGER NOT NULL, -- 예측 점수
    prediction_date TIMESTAMPTZ NOT NULL, -- 예측 대상 날짜
    actual_score INTEGER, -- 실제 점수 (나중에 업데이트)
    accuracy DECIMAL(5,2), -- 정확도 (%) - 자동 계산
    created_at TIMESTAMPTZ DEFAULT NOW(),
    measured_at TIMESTAMPTZ -- 실제 측정 시점
);

ALTER TABLE public.prediction_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage prediction snapshots"
    ON public.prediction_snapshots FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = prediction_snapshots.student_id
            AND s.tutor_id = auth.uid()
        )
    );

-- ===================================
-- PREDICTION FEEDBACK (선생님 피드백)
-- ===================================
CREATE TABLE IF NOT EXISTS public.prediction_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL,
    predicted_urgency TEXT, -- 예측된 urgency
    actual_performance TEXT CHECK (actual_performance IN ('better', 'expected', 'worse')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prediction_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage prediction feedback"
    ON public.prediction_feedback FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = prediction_feedback.student_id
            AND s.tutor_id = auth.uid()
        )
    );

-- ===================================
-- CURRICULUM MARKETPLACE (Phase 3)
-- ===================================
CREATE TABLE IF NOT EXISTS public.shared_curricula (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    subject_category TEXT, -- 'math', 'physics', 'sat', etc.
    curriculum_data JSONB NOT NULL, -- 전체 커리큘럼 JSON
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0, -- 평균 평점 (1-5)
    rating_count INTEGER DEFAULT 0,
    tags TEXT[], -- 검색용 태그
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shared_curricula ENABLE ROW LEVEL SECURITY;

-- 공개된 커리큘럼은 누구나 볼 수 있음
CREATE POLICY "Anyone can view public curricula"
    ON public.shared_curricula FOR SELECT
    USING (is_public = true OR owner_id = auth.uid());

-- 소유자만 수정/삭제 가능
CREATE POLICY "Owners can manage their curricula"
    ON public.shared_curricula FOR ALL
    USING (owner_id = auth.uid());

-- 로그인 사용자는 커리큘럼 생성 가능
CREATE POLICY "Authenticated users can create curricula"
    ON public.shared_curricula FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ===================================
-- CURRICULUM USAGE TRACKING
-- ===================================
CREATE TABLE IF NOT EXISTS public.curriculum_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    curriculum_id UUID REFERENCES public.shared_curricula(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true, -- 현재 사용 중 여부
    UNIQUE(curriculum_id, user_id)
);

ALTER TABLE public.curriculum_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their curriculum usage"
    ON public.curriculum_usage FOR ALL
    USING (user_id = auth.uid());

-- ===================================
-- CURRICULUM RATINGS
-- ===================================
CREATE TABLE IF NOT EXISTS public.curriculum_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    curriculum_id UUID REFERENCES public.shared_curricula(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curriculum_id, user_id)
);

ALTER TABLE public.curriculum_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
    ON public.curriculum_ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their ratings"
    ON public.curriculum_ratings FOR ALL
    USING (user_id = auth.uid());

-- ===================================
-- INDEXES
-- ===================================
CREATE INDEX IF NOT EXISTS idx_report_shares_token ON public.report_shares(token);
CREATE INDEX IF NOT EXISTS idx_report_shares_session ON public.report_shares(session_id);
CREATE INDEX IF NOT EXISTS idx_report_views_share ON public.report_views(share_id);
CREATE INDEX IF NOT EXISTS idx_decay_rates_student ON public.student_decay_rates(student_id);
CREATE INDEX IF NOT EXISTS idx_prediction_snapshots_student ON public.prediction_snapshots(student_id);
CREATE INDEX IF NOT EXISTS idx_shared_curricula_public ON public.shared_curricula(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shared_curricula_category ON public.shared_curricula(subject_category);
CREATE INDEX IF NOT EXISTS idx_curriculum_usage_curriculum ON public.curriculum_usage(curriculum_id);

-- ===================================
-- FUNCTIONS
-- ===================================

-- 커리큘럼 다운로드 카운트 증가
CREATE OR REPLACE FUNCTION increment_curriculum_download()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shared_curricula
    SET download_count = download_count + 1
    WHERE id = NEW.curriculum_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_curriculum_import
    AFTER INSERT ON public.curriculum_usage
    FOR EACH ROW EXECUTE FUNCTION increment_curriculum_download();

-- 평점 업데이트 함수
CREATE OR REPLACE FUNCTION update_curriculum_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shared_curricula
    SET
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.curriculum_ratings
            WHERE curriculum_id = NEW.curriculum_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM public.curriculum_ratings
            WHERE curriculum_id = NEW.curriculum_id
        )
    WHERE id = NEW.curriculum_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_curriculum_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.curriculum_ratings
    FOR EACH ROW EXECUTE FUNCTION update_curriculum_rating();

-- session_topics에 future_impact 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'session_topics' AND column_name = 'future_impact'
    ) THEN
        ALTER TABLE public.session_topics ADD COLUMN future_impact TEXT;
    END IF;
END $$;
