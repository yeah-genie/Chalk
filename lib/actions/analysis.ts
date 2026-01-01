"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/services/whisper";
import { extractTopicsFromTranscript } from "@/lib/services/gemini";
import { calculateNewScore } from "@/lib/mastery-utils";
import { revalidatePath } from "next/cache";
import { createReportShare } from "@/lib/actions/parent-sharing";
import { sendReportEmail } from "@/lib/services/email";
import { savePredictionSnapshot } from "@/lib/services/prediction";

/**
 * 전체 세션 분석 파이프라인
 * 1. 오디오 저장
 * 2. AI 분석 (Gemini)
 * 3. DB 업데이트 (Mastery & Topics)
 */
export async function processSessionAudio(formData: FormData) {
    const blob = formData.get('audio') as Blob;
    const studentId = formData.get('studentId') as string;
    const subjectId = formData.get('subjectId') as string;

    if (!blob || !studentId) {
        return { success: false, error: "Missing audio or student ID" };
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        // 1. 세션 기본 정보 생성
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                tutor_id: user.id,
                student_id: studentId,
                subject_id: subjectId,
                scheduled_at: new Date().toISOString(),
                status: 'in_progress'
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // 2. 오디오 업로드 (Supabase Storage)
        const fileName = `${user.id}/${session.id}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recordings')
            .upload(fileName, blob, {
                contentType: 'audio/webm',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('recordings')
            .getPublicUrl(fileName);

        // Fetch Subject info for context
        const { fetchSubjectData } = await import('@/lib/knowledge-graph-server');
        const subject = await fetchSubjectData(subjectId);
        const existingTopics = subject?.topics || [];
        const subjectName = subject?.name || subjectId;

        // 3. Speech-to-Text via Whisper API
        console.log('[Analysis] Starting transcription...');
        const transcriptionResult = await transcribeAudio(blob);

        if (!transcriptionResult.success || !transcriptionResult.transcript) {
            throw new Error(transcriptionResult.error || 'Transcription failed');
        }

        const transcript = transcriptionResult.transcript;
        console.log(`[Analysis] Transcription complete: ${transcript.length} chars`);

        const analysis = await extractTopicsFromTranscript(
            transcript,
            subjectId,
            subjectName,
            existingTopics
        );

        if (!analysis.success) throw new Error(analysis.error);

        // 4. DB 업데이트 (Topics & Mastery)
        for (const topic of analysis.topics) {
            // A. 세션 토픽 기록
            await supabase.from('session_topics').insert({
                session_id: session.id,
                topic_id: topic.topicId,
                status_after: topic.status,
                evidence: topic.evidence,
                future_impact: topic.futureImpact
            });

            // B. 학생 숙련도 업데이트
            const { data: currentMastery } = await supabase
                .from('student_mastery')
                .select('score')
                .eq('student_id', studentId)
                .eq('topic_id', topic.topicId)
                .single();

            const oldScore = currentMastery?.score || 0;
            const newScore = calculateNewScore(oldScore, topic.status, topic.confidence);

            await supabase.from('student_mastery').upsert({
                student_id: studentId,
                topic_id: topic.topicId,
                score: newScore,
                status: topic.status,
                updated_at: new Date().toISOString()
            });
        }

        // 4.5. AI Taxonomy Ingestion: Save PROPOSED nodes
        if (analysis.suggestedNewNodes && analysis.suggestedNewNodes.length > 0) {
            const proposals = analysis.suggestedNewNodes.map(node => ({
                session_id: session.id,
                subject_id: subjectId,
                type: node.type,
                name: node.name,
                description: node.description,
                parent_id: node.parentId,
                status: 'pending'
            }));

            await supabase.from('kb_proposed_taxonomy').insert(proposals);
        }

        // 5. 세션 완료 처리
        await supabase.from('sessions').update({
            status: 'completed',
            recording_url: publicUrl,
            transcript: transcript,
            notes: analysis.summary
        }).eq('id', session.id);

        // 6. 학부모 공유 및 이메일 발송 (비동기)
        try {
            // 학생 정보 조회
            const { data: student } = await supabase
                .from('students')
                .select('name, parent_email, subject_id')
                .eq('id', studentId)
                .single();

            if (student?.parent_email) {
                // 공유 링크 생성
                const shareResult = await createReportShare(session.id, student.parent_email);

                if (shareResult.success && shareResult.share) {
                    // 이메일 발송
                    const emailResult = await sendReportEmail({
                        parentEmail: student.parent_email,
                        studentName: student.name,
                        subjectName: subjectName,
                        sessionDate: session.scheduled_at,
                        summary: analysis.summary || '',
                        topicsCount: analysis.topics.length,
                        shareToken: shareResult.share.token,
                    });

                    if (emailResult.success) {
                        // 이메일 발송 시간 기록
                        await supabase
                            .from('report_shares')
                            .update({ email_sent_at: new Date().toISOString() })
                            .eq('id', shareResult.share.id);

                        console.log(`[Analysis] Email sent to parent: ${student.parent_email}`);
                    }
                }
            }
        } catch (emailErr) {
            // 이메일 발송 실패는 전체 파이프라인을 중단시키지 않음
            console.error("[Analysis] Email sending failed (non-blocking):", emailErr);
        }

        // 7. 예측 스냅샷 저장 (Phase 2: 정확도 추적용)
        try {
            await savePredictionSnapshot(studentId);
        } catch (predErr) {
            console.error("[Analysis] Prediction snapshot failed (non-blocking):", predErr);
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/analysis');

        return {
            success: true,
            sessionId: session.id,
            topicsFound: analysis.topics.length,
            proposalsFound: analysis.suggestedNewNodes?.length || 0
        };

    } catch (err: any) {
        console.error("Analysis Pipeline Error:", err);
        return { success: false, error: err.message };
    }
}
