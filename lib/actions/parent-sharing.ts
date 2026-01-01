"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "crypto";

// ===================================
// PARENT SHARING ACTIONS
// ===================================

/**
 * 안전한 토큰 생성 (URL-safe)
 */
function generateShareToken(): string {
    return crypto.randomBytes(32).toString('base64url');
}

/**
 * 세션에 대한 공유 링크 생성
 */
export async function createReportShare(sessionId: string, parentEmail?: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // 세션 소유권 확인
        const { data: session } = await supabase
            .from('sessions')
            .select('id, tutor_id, student_id, students(parent_email)')
            .eq('id', sessionId)
            .single();

        if (!session || session.tutor_id !== user.id) {
            return { success: false, error: "Session not found or unauthorized" };
        }

        // 기존 공유 확인 (이미 있으면 반환)
        const { data: existingShare } = await supabase
            .from('report_shares')
            .select('*')
            .eq('session_id', sessionId)
            .single();

        if (existingShare) {
            return { success: true, share: existingShare };
        }

        // 새 공유 생성
        const token = generateShareToken();
        const email = parentEmail || (session.students as any)?.parent_email;

        const { data: share, error } = await supabase
            .from('report_shares')
            .insert({
                session_id: sessionId,
                token,
                parent_email: email,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, share };
    } catch (err: any) {
        console.error("[Parent Sharing] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 토큰으로 리포트 데이터 조회 (공개 접근)
 */
export async function getReportByToken(token: string) {
    try {
        const supabase = await createServerSupabaseClient();

        // 공유 정보 조회
        const { data: share, error: shareError } = await supabase
            .from('report_shares')
            .select('*')
            .eq('token', token)
            .single();

        if (shareError || !share) {
            return { success: false, error: "Report not found or expired" };
        }

        // 만료 확인
        if (share.expires_at && new Date(share.expires_at) < new Date()) {
            return { success: false, error: "This report link has expired" };
        }

        // 세션 및 관련 데이터 조회
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select(`
                *,
                students (name, subject_id),
                session_topics (*)
            `)
            .eq('id', share.session_id)
            .single();

        if (sessionError || !session) {
            return { success: false, error: "Session data not found" };
        }

        return {
            success: true,
            share,
            session,
        };
    } catch (err: any) {
        console.error("[Parent Sharing] Error fetching report:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 리포트 조회 기록 및 카운터 증가
 */
export async function recordReportView(token: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || undefined;
        // IP는 프라이버시를 위해 저장하지 않음

        // 공유 정보 조회
        const { data: share } = await supabase
            .from('report_shares')
            .select('id')
            .eq('token', token)
            .single();

        if (!share) return { success: false };

        // 조회 기록 저장
        await supabase.from('report_views').insert({
            share_id: share.id,
            user_agent: userAgent,
        });

        // 카운터 증가
        await supabase
            .from('report_shares')
            .update({
                view_count: (await supabase
                    .from('report_shares')
                    .select('view_count')
                    .eq('id', share.id)
                    .single()).data?.view_count + 1 || 1,
                last_viewed_at: new Date().toISOString(),
            })
            .eq('id', share.id);

        return { success: true };
    } catch (err) {
        console.error("[Parent Sharing] Error recording view:", err);
        return { success: false };
    }
}

/**
 * 튜터의 모든 공유 리포트 통계 조회
 */
export async function getShareAnalytics() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data: shares, error } = await supabase
            .from('report_shares')
            .select(`
                *,
                sessions!inner(
                    id,
                    scheduled_at,
                    tutor_id,
                    students(name)
                )
            `)
            .eq('sessions.tutor_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 총 통계 계산
        const totalShares = shares?.length || 0;
        const totalViews = shares?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;
        const emailsSent = shares?.filter(s => s.email_sent_at).length || 0;

        return {
            success: true,
            shares: shares || [],
            stats: {
                totalShares,
                totalViews,
                emailsSent,
                averageViews: totalShares > 0 ? Math.round(totalViews / totalShares * 10) / 10 : 0,
            }
        };
    } catch (err: any) {
        console.error("[Parent Sharing] Error fetching analytics:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 학생별 공유 통계 조회
 */
export async function getStudentShareStats(studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: shares, error } = await supabase
            .from('report_shares')
            .select(`
                *,
                sessions!inner(student_id)
            `)
            .eq('sessions.student_id', studentId);

        if (error) throw error;

        const totalShares = shares?.length || 0;
        const totalViews = shares?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;
        const recentView = shares?.reduce((latest, s) => {
            if (!s.last_viewed_at) return latest;
            return !latest || new Date(s.last_viewed_at) > new Date(latest)
                ? s.last_viewed_at
                : latest;
        }, null as string | null);

        return {
            success: true,
            totalShares,
            totalViews,
            recentView,
        };
    } catch (err: any) {
        console.error("[Parent Sharing] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 공유 링크 삭제
 */
export async function deleteReportShare(shareId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { error } = await supabase
            .from('report_shares')
            .delete()
            .eq('id', shareId);

        if (error) throw error;

        revalidatePath('/dashboard');
        return { success: true };
    } catch (err: any) {
        console.error("[Parent Sharing] Error deleting share:", err);
        return { success: false, error: err.message };
    }
}
