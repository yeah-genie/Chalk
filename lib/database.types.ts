/**
 * Supabase Database Types
 * Chalk App Schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // 튜터 프로필
      tutors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          subjects: string[];
          bio: string | null;
          hourly_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          subjects?: string[];
          bio?: string | null;
          hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          subjects?: string[];
          bio?: string | null;
          hourly_rate?: number | null;
          updated_at?: string;
        };
      };

      // 학생
      students: {
        Row: {
          id: string;
          tutor_id: string;
          name: string;
          grade: string;
          subject: string;
          parent_phone: string | null;
          parent_name: string | null;
          current_topic: string | null;
          target_topic: string | null;
          notes: string | null;
          hourly_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          name: string;
          grade: string;
          subject: string;
          parent_phone?: string | null;
          parent_name?: string | null;
          current_topic?: string | null;
          target_topic?: string | null;
          notes?: string | null;
          hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          name?: string;
          grade?: string;
          subject?: string;
          parent_phone?: string | null;
          parent_name?: string | null;
          current_topic?: string | null;
          target_topic?: string | null;
          notes?: string | null;
          hourly_rate?: number | null;
          updated_at?: string;
        };
      };

      // 학습 목표 (학생별 커스텀)
      learning_goals: {
        Row: {
          id: string;
          student_id: string;
          title: string;
          description: string | null;
          topic_code: string | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          title: string;
          description?: string | null;
          topic_code?: string | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          title?: string;
          description?: string | null;
          topic_code?: string | null;
          order_index?: number;
          is_active?: boolean;
        };
      };

      // 수업 기록
      lessons: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          duration_minutes: number | null;
          topic: string | null;
          memo: string | null;
          ai_feedback: string | null;
          parent_message_sent: boolean;
          parent_message_sent_at: string | null;
          image_report_sent: boolean;
          image_report_sent_at: string | null;
          hourly_rate: number | null;
          total_fee: number | null;
          is_paid: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          duration_minutes?: number | null;
          topic?: string | null;
          memo?: string | null;
          ai_feedback?: string | null;
          parent_message_sent?: boolean;
          parent_message_sent_at?: string | null;
          image_report_sent?: boolean;
          image_report_sent_at?: string | null;
          hourly_rate?: number | null;
          total_fee?: number | null;
          is_paid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          student_id?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          duration_minutes?: number | null;
          topic?: string | null;
          memo?: string | null;
          ai_feedback?: string | null;
          parent_message_sent?: boolean;
          parent_message_sent_at?: string | null;
          image_report_sent?: boolean;
          image_report_sent_at?: string | null;
          hourly_rate?: number | null;
          total_fee?: number | null;
          is_paid?: boolean;
          updated_at?: string;
        };
      };

      // 학습 목표 체크
      goal_checks: {
        Row: {
          id: string;
          lesson_id: string;
          goal_id: string;
          level: 'high' | 'mid' | 'low';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          goal_id: string;
          level: 'high' | 'mid' | 'low';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          goal_id?: string;
          level?: 'high' | 'mid' | 'low';
          notes?: string | null;
        };
      };

      // AI 진단 결과
      diagnoses: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          current_level: string;
          estimated_gap: string | null;
          missing_prerequisites: string[];
          recommended_start: string | null;
          estimated_weeks: number | null;
          warnings: string[];
          curriculum: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          current_level: string;
          estimated_gap?: string | null;
          missing_prerequisites?: string[];
          recommended_start?: string | null;
          estimated_weeks?: number | null;
          warnings?: string[];
          curriculum?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          current_level?: string;
          estimated_gap?: string | null;
          missing_prerequisites?: string[];
          recommended_start?: string | null;
          estimated_weeks?: number | null;
          warnings?: string[];
          curriculum?: Json | null;
        };
      };

      // 학부모 메시지 로그
      parent_messages: {
        Row: {
          id: string;
          lesson_id: string;
          student_id: string;
          message_type: 'text' | 'image' | 'weekly';
          content: string;
          image_url: string | null;
          sent_at: string;
          delivered: boolean;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          student_id: string;
          message_type: 'text' | 'image' | 'weekly';
          content: string;
          image_url?: string | null;
          sent_at?: string;
          delivered?: boolean;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          student_id?: string;
          message_type?: 'text' | 'image' | 'weekly';
          content?: string;
          image_url?: string | null;
          sent_at?: string;
          delivered?: boolean;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// 편의 타입
export type Tutor = Database['public']['Tables']['tutors']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type LearningGoal = Database['public']['Tables']['learning_goals']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type GoalCheck = Database['public']['Tables']['goal_checks']['Row'];
export type Diagnosis = Database['public']['Tables']['diagnoses']['Row'];
export type ParentMessage = Database['public']['Tables']['parent_messages']['Row'];

