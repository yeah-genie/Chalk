// ===================================
// DATABASE TYPES
// Supabase 테이블 타입 정의
// ===================================

export interface Student {
    id: string;
    tutor_id: string;
    name: string;
    subject_id: string;
    parent_email?: string;
    parent_phone?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Session {
    id: string;
    tutor_id: string;
    student_id: string;
    subject_id: string;
    scheduled_at: string;
    duration_minutes?: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    transcript?: string;
    notes?: string;
    recording_url?: string;
    created_at: string;
    updated_at: string;
}

export interface SessionTopic {
    id: string;
    session_id: string;
    topic_id: string;
    status_before?: 'new' | 'learning' | 'reviewed' | 'mastered';
    status_after?: 'new' | 'learning' | 'reviewed' | 'mastered';
    score_delta?: number;
    evidence?: string;
    created_at: string;
}

export interface StudentMastery {
    id: string;
    student_id: string;
    topic_id: string;
    score: number; // 0-100
    status: 'new' | 'learning' | 'reviewed' | 'mastered';
    last_reviewed_at?: string;
    review_count: number;
    created_at: string;
    updated_at: string;
}

export interface Profile {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    created_at: string;
}

// ===================================
// INSERT TYPES (without auto-generated fields)
// ===================================

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>;
export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'updated_at'>;
export type StudentMasteryInsert = Omit<StudentMastery, 'id' | 'created_at' | 'updated_at'>;

// ===================================
// WITH RELATIONS
// ===================================

export interface StudentWithMastery extends Student {
    mastery?: StudentMastery[];
    sessions?: Session[];
}

export interface SessionWithTopics extends Session {
    topics?: SessionTopic[];
    student?: Student;
}

// ===================================
// PARENT SHARING TYPES (Phase 1)
// ===================================

export interface ReportShare {
    id: string;
    session_id: string;
    token: string;
    parent_email?: string;
    expires_at?: string;
    view_count: number;
    last_viewed_at?: string;
    email_sent_at?: string;
    created_at: string;
}

export interface ReportView {
    id: string;
    share_id: string;
    viewer_ip?: string;
    user_agent?: string;
    viewed_at: string;
}

// ===================================
// PERSONALIZED PREDICTION TYPES (Phase 2)
// ===================================

export interface StudentDecayRate {
    id: string;
    student_id: string;
    topic_id: string;
    calculated_decay_rate: number;
    sample_count: number;
    last_calculated_at: string;
    created_at: string;
}

export interface PredictionSnapshot {
    id: string;
    student_id: string;
    topic_id: string;
    predicted_score: number;
    prediction_date: string;
    actual_score?: number;
    accuracy?: number;
    created_at: string;
    measured_at?: string;
}

export interface PredictionFeedback {
    id: string;
    student_id: string;
    topic_id: string;
    predicted_urgency?: string;
    actual_performance: 'better' | 'expected' | 'worse';
    notes?: string;
    created_at: string;
}

// ===================================
// CURRICULUM MARKETPLACE TYPES (Phase 3)
// ===================================

export interface SharedCurriculum {
    id: string;
    owner_id?: string;
    name: string;
    description?: string;
    subject_category?: string;
    curriculum_data: CurriculumData;
    is_public: boolean;
    download_count: number;
    rating: number;
    rating_count: number;
    tags?: string[];
    created_at: string;
    updated_at: string;
}

export interface CurriculumData {
    modules: CurriculumModule[];
    metadata?: {
        version?: string;
        author?: string;
        source?: string;
    };
}

export interface CurriculumModule {
    id: string;
    name: string;
    order_index: number;
    units: CurriculumUnit[];
}

export interface CurriculumUnit {
    id: string;
    name: string;
    order_index: number;
    weight?: number;
    topics: CurriculumTopic[];
}

export interface CurriculumTopic {
    id: string;
    name: string;
    description?: string;
    order_index: number;
    dependencies?: string[];
}

export interface CurriculumUsage {
    id: string;
    curriculum_id: string;
    user_id: string;
    imported_at: string;
    is_active: boolean;
}

export interface CurriculumRating {
    id: string;
    curriculum_id: string;
    user_id: string;
    rating: number;
    review?: string;
    created_at: string;
}
