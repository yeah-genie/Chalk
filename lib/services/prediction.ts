"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Prediction Engine for Chalk
 * 망각 곡선 기반 복습 알림 + 약점 예측 + 진도 예측
 */

// ===================================
// TYPES
// ===================================

export interface TopicPrediction {
    topicId: string;
    topicName: string;
    currentScore: number;
    predictedScore: number; // 현재 추세로 1주 후 예상 점수
    daysSinceReview: number;
    urgency: 'critical' | 'warning' | 'stable' | 'strong';
    recommendation: string;
    decayRate: number; // 개인화된 decay rate
    optimalReviewDate: Date;
}

export interface WeaknessAnalysis {
    topicId: string;
    topicName: string;
    score: number;
    pattern: 'stuck' | 'declining' | 'slow_progress' | 'normal';
    sessionCount: number;
    suggestedApproach: string;
}

export interface ProgressPrediction {
    currentMastery: number;
    targetMastery: number;
    targetDate: Date;
    predictedCompletionDate: Date;
    sessionsNeeded: number;
    onTrack: boolean;
    recommendation: string;
}

// ===================================
// FORGETTING CURVE (Ebbinghaus)
// ===================================

/**
 * Ebbinghaus Forgetting Curve
 * R = e^(-t/S) where:
 * - R = retention (0-1)
 * - t = time since learning
 * - S = stability (higher = slower forgetting)
 *
 * Modified with personal decay rate based on review history
 */
function calculateRetention(
    initialScore: number,
    daysSinceReview: number,
    personalDecayRate: number = 0.15 // 기본: 15% per day initially
): number {
    // Stability increases with higher mastery
    const stability = 1 + (initialScore / 100) * 6; // 1-7 days stability
    const retention = Math.exp(-daysSinceReview / stability);

    // Apply personal decay modification
    const adjustedRetention = retention * (1 - personalDecayRate * 0.1);

    return Math.max(0, Math.min(1, adjustedRetention));
}

/**
 * Calculate predicted score after time decay
 */
export function predictScoreAfterDays(
    currentScore: number,
    days: number,
    personalDecayRate: number = 0.15
): number {
    const retention = calculateRetention(currentScore, days, personalDecayRate);
    return Math.round(currentScore * retention);
}

/**
 * Calculate optimal review date (when score drops below threshold)
 */
function calculateOptimalReviewDate(
    currentScore: number,
    lastReviewDate: Date,
    thresholdDrop: number = 10 // Review when score drops by 10%
): Date {
    const targetScore = currentScore - thresholdDrop;
    if (targetScore <= 0) return new Date(); // Review now

    // Binary search for optimal day
    let low = 1, high = 60, optimalDays = 7;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const predictedScore = predictScoreAfterDays(currentScore, mid);

        if (predictedScore <= targetScore) {
            optimalDays = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    const reviewDate = new Date(lastReviewDate);
    reviewDate.setDate(reviewDate.getDate() + optimalDays);
    return reviewDate;
}

// ===================================
// PREDICTION API
// ===================================

/**
 * Get topic predictions with forgetting curve analysis
 */
export async function getTopicPredictions(studentId: string): Promise<TopicPrediction[]> {
    try {
        const supabase = await createServerSupabaseClient();

        // Get student's mastery data with last update times
        const { data: masteryData, error } = await supabase
            .from('student_mastery')
            .select('topic_id, score, status, updated_at')
            .eq('student_id', studentId);

        if (error || !masteryData) {
            console.error('[Prediction] Error fetching mastery:', error);
            return [];
        }

        // Get topic names from knowledge base
        const { data: topics } = await supabase
            .from('kb_topics')
            .select('id, name');

        const topicMap = new Map(topics?.map(t => [t.id, t.name]) || []);

        const predictions: TopicPrediction[] = [];
        const now = new Date();

        for (const mastery of masteryData) {
            const lastReview = new Date(mastery.updated_at);
            const daysSinceReview = Math.floor(
                (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Calculate personal decay rate based on score trajectory
            const decayRate = mastery.score >= 80 ? 0.08 :
                             mastery.score >= 60 ? 0.12 :
                             mastery.score >= 40 ? 0.18 : 0.25;

            const predictedScore = predictScoreAfterDays(mastery.score, 7, decayRate);
            const scoreDrop = mastery.score - predictedScore;

            // Determine urgency
            let urgency: TopicPrediction['urgency'];
            let recommendation: string;

            if (daysSinceReview >= 14 && mastery.score < 60) {
                urgency = 'critical';
                recommendation = `Urgent: Review needed. ${scoreDrop}% projected loss in 7 days.`;
            } else if (daysSinceReview >= 7 || predictedScore < mastery.score - 15) {
                urgency = 'warning';
                recommendation = `Schedule review soon. Last practiced ${daysSinceReview} days ago.`;
            } else if (mastery.score >= 80) {
                urgency = 'strong';
                recommendation = `Well retained. Optional review for reinforcement.`;
            } else {
                urgency = 'stable';
                recommendation = `On track. Continue current pace.`;
            }

            predictions.push({
                topicId: mastery.topic_id,
                topicName: topicMap.get(mastery.topic_id) || mastery.topic_id,
                currentScore: mastery.score,
                predictedScore,
                daysSinceReview,
                urgency,
                recommendation,
                decayRate,
                optimalReviewDate: calculateOptimalReviewDate(mastery.score, lastReview),
            });
        }

        // Sort by urgency (critical first)
        const urgencyOrder = { critical: 0, warning: 1, stable: 2, strong: 3 };
        predictions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

        return predictions;
    } catch (e) {
        console.error('[Prediction] Error:', e);
        return [];
    }
}

/**
 * Analyze student weaknesses based on session history
 */
export async function analyzeWeaknesses(studentId: string): Promise<WeaknessAnalysis[]> {
    try {
        const supabase = await createServerSupabaseClient();

        // Get session topics history
        const { data: sessionTopics, error } = await supabase
            .from('session_topics')
            .select(`
                topic_id,
                status_after,
                created_at,
                sessions!inner(student_id)
            `)
            .eq('sessions.student_id', studentId)
            .order('created_at', { ascending: true });

        if (error || !sessionTopics) return [];

        // Get current mastery
        const { data: masteryData } = await supabase
            .from('student_mastery')
            .select('topic_id, score')
            .eq('student_id', studentId);

        const masteryMap = new Map(masteryData?.map(m => [m.topic_id, m.score]) || []);

        // Get topic names
        const { data: topics } = await supabase
            .from('kb_topics')
            .select('id, name');
        const topicMap = new Map(topics?.map(t => [t.id, t.name]) || []);

        // Analyze patterns per topic
        const topicHistory = new Map<string, { statuses: string[]; count: number }>();

        for (const st of sessionTopics) {
            const existing = topicHistory.get(st.topic_id) || { statuses: [], count: 0 };
            existing.statuses.push(st.status_after);
            existing.count++;
            topicHistory.set(st.topic_id, existing);
        }

        const weaknesses: WeaknessAnalysis[] = [];

        for (const [topicId, history] of topicHistory) {
            const currentScore = masteryMap.get(topicId) || 0;

            // Skip strong topics
            if (currentScore >= 75) continue;

            // Detect patterns
            let pattern: WeaknessAnalysis['pattern'] = 'normal';
            let suggestedApproach = '';

            const recentStatuses = history.statuses.slice(-3);
            const hasImprovement = recentStatuses.some((s, i) => {
                if (i === 0) return false;
                const statusOrder = { 'new': 0, 'learning': 1, 'reviewed': 2, 'mastered': 3 };
                return (statusOrder[s as keyof typeof statusOrder] || 0) >
                       (statusOrder[recentStatuses[i-1] as keyof typeof statusOrder] || 0);
            });

            if (history.count >= 3 && !hasImprovement && currentScore < 40) {
                pattern = 'stuck';
                suggestedApproach = 'Try a different teaching approach. Consider breaking down into smaller sub-topics or using visual aids.';
            } else if (recentStatuses.length >= 2 &&
                       recentStatuses[recentStatuses.length - 1] < recentStatuses[recentStatuses.length - 2]) {
                pattern = 'declining';
                suggestedApproach = 'Recent regression detected. Review fundamentals and increase practice frequency.';
            } else if (history.count >= 4 && currentScore < 50) {
                pattern = 'slow_progress';
                suggestedApproach = 'Progress is slower than expected. Consider more practice problems or real-world applications.';
            } else {
                suggestedApproach = 'Continue current approach with regular practice.';
            }

            weaknesses.push({
                topicId,
                topicName: topicMap.get(topicId) || topicId,
                score: currentScore,
                pattern,
                sessionCount: history.count,
                suggestedApproach,
            });
        }

        // Sort by severity (stuck first, then by score)
        const patternOrder = { stuck: 0, declining: 1, slow_progress: 2, normal: 3 };
        weaknesses.sort((a, b) => {
            const orderDiff = patternOrder[a.pattern] - patternOrder[b.pattern];
            if (orderDiff !== 0) return orderDiff;
            return a.score - b.score;
        });

        return weaknesses;
    } catch (e) {
        console.error('[Weakness Analysis] Error:', e);
        return [];
    }
}

/**
 * Predict overall progress and completion timeline
 */
export async function predictProgress(
    studentId: string,
    targetMastery: number = 80,
    targetDate?: Date
): Promise<ProgressPrediction | null> {
    try {
        const supabase = await createServerSupabaseClient();

        // Get current average mastery
        const { data: masteryData } = await supabase
            .from('student_mastery')
            .select('score')
            .eq('student_id', studentId);

        if (!masteryData || masteryData.length === 0) {
            return null;
        }

        const currentMastery = Math.round(
            masteryData.reduce((sum, m) => sum + m.score, 0) / masteryData.length
        );

        // Get session history to calculate learning rate
        const { data: sessions } = await supabase
            .from('sessions')
            .select('id, scheduled_at')
            .eq('student_id', studentId)
            .eq('status', 'completed')
            .order('scheduled_at', { ascending: true });

        const sessionCount = sessions?.length || 0;

        // Estimate learning rate (mastery points per session)
        const learningRate = sessionCount > 0 ? currentMastery / sessionCount : 5; // default 5% per session

        // Calculate sessions needed
        const masteryGap = targetMastery - currentMastery;
        const sessionsNeeded = Math.max(0, Math.ceil(masteryGap / learningRate));

        // Estimate completion (assuming 2 sessions per week)
        const weeksNeeded = Math.ceil(sessionsNeeded / 2);
        const predictedCompletionDate = new Date();
        predictedCompletionDate.setDate(predictedCompletionDate.getDate() + weeksNeeded * 7);

        // Check if on track
        const target = targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // default: 3 months
        const onTrack = predictedCompletionDate <= target;

        let recommendation: string;
        if (currentMastery >= targetMastery) {
            recommendation = 'Target mastery achieved! Focus on maintenance and advanced topics.';
        } else if (onTrack) {
            recommendation = `On track to reach ${targetMastery}% mastery. Maintain current session frequency.`;
        } else {
            const extraSessionsPerWeek = Math.ceil(sessionsNeeded /
                Math.max(1, Math.floor((target.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))));
            recommendation = `Behind schedule. Consider ${extraSessionsPerWeek} sessions per week to meet target.`;
        }

        return {
            currentMastery,
            targetMastery,
            targetDate: target,
            predictedCompletionDate,
            sessionsNeeded,
            onTrack,
            recommendation,
        };
    } catch (e) {
        console.error('[Progress Prediction] Error:', e);
        return null;
    }
}

/**
 * Get next session recommendations
 */
export async function getNextSessionRecommendations(studentId: string): Promise<{
    focusTopics: string[];
    suggestedDuration: number;
    priority: 'review' | 'new_material' | 'practice' | 'assessment';
    rationale: string;
}> {
    const predictions = await getTopicPredictions(studentId);
    const weaknesses = await analyzeWeaknesses(studentId);

    const criticalTopics = predictions.filter(p => p.urgency === 'critical');
    const warningTopics = predictions.filter(p => p.urgency === 'warning');
    const stuckTopics = weaknesses.filter(w => w.pattern === 'stuck');

    let focusTopics: string[] = [];
    let priority: 'review' | 'new_material' | 'practice' | 'assessment';
    let rationale: string;
    let suggestedDuration = 60; // default 60 minutes

    if (criticalTopics.length > 0) {
        focusTopics = criticalTopics.slice(0, 3).map(t => t.topicName);
        priority = 'review';
        rationale = `${criticalTopics.length} topic(s) at risk of significant forgetting. Prioritize review.`;
        suggestedDuration = 45;
    } else if (stuckTopics.length > 0) {
        focusTopics = stuckTopics.slice(0, 2).map(t => t.topicName);
        priority = 'practice';
        rationale = `Student stuck on ${stuckTopics.length} topic(s). Try alternative teaching approaches.`;
        suggestedDuration = 60;
    } else if (warningTopics.length > 0) {
        focusTopics = warningTopics.slice(0, 2).map(t => t.topicName);
        priority = 'review';
        rationale = 'Light review recommended to maintain retention.';
        suggestedDuration = 30;
    } else {
        priority = 'new_material';
        rationale = 'All topics stable. Ready to introduce new material.';
        suggestedDuration = 60;
    }

    return { focusTopics, suggestedDuration, priority, rationale };
}

// ===================================
// PHASE 2: PERSONALIZED PREDICTIONS
// ===================================

/**
 * 학생별 개인화된 decay rate 계산
 * 실제 복습 패턴을 분석하여 토픽별 망각률 학습
 */
export async function calculatePersonalizedDecayRate(
    studentId: string,
    topicId: string
): Promise<number> {
    try {
        const supabase = await createServerSupabaseClient();

        // 해당 학생의 해당 토픽 세션 히스토리 조회
        const { data: history } = await supabase
            .from('session_topics')
            .select(`
                status_after,
                created_at,
                sessions!inner(student_id)
            `)
            .eq('sessions.student_id', studentId)
            .eq('topic_id', topicId)
            .order('created_at', { ascending: true });

        if (!history || history.length < 2) {
            // 데이터 부족 시 기본값 반환
            return 0.15;
        }

        // 연속된 세션 간의 점수 변화 분석
        let totalDecay = 0;
        let decayCount = 0;

        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1];
            const curr = history[i];

            const prevDate = new Date(prev.created_at);
            const currDate = new Date(curr.created_at);
            const daysBetween = Math.floor(
                (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysBetween > 0) {
                const statusOrder = { 'new': 10, 'learning': 35, 'reviewed': 65, 'mastered': 90 };
                const prevScore = statusOrder[prev.status_after as keyof typeof statusOrder] || 50;
                const currScore = statusOrder[curr.status_after as keyof typeof statusOrder] || 50;

                // 점수가 떨어졌으면 decay 계산
                if (currScore < prevScore) {
                    const dailyDecay = (prevScore - currScore) / prevScore / daysBetween;
                    totalDecay += dailyDecay;
                    decayCount++;
                }
            }
        }

        const personalDecayRate = decayCount > 0 ? totalDecay / decayCount : 0.15;

        // 개인화된 decay rate 저장
        await supabase.from('student_decay_rates').upsert({
            student_id: studentId,
            topic_id: topicId,
            calculated_decay_rate: Math.min(0.5, Math.max(0.05, personalDecayRate)),
            sample_count: history.length,
            last_calculated_at: new Date().toISOString(),
        });

        return Math.min(0.5, Math.max(0.05, personalDecayRate));
    } catch (e) {
        console.error('[Personalized Decay] Error:', e);
        return 0.15;
    }
}

/**
 * 학생의 모든 토픽에 대한 개인화된 decay rate 일괄 계산
 */
export async function updateAllDecayRates(studentId: string): Promise<void> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: masteryData } = await supabase
            .from('student_mastery')
            .select('topic_id')
            .eq('student_id', studentId);

        if (!masteryData) return;

        for (const m of masteryData) {
            await calculatePersonalizedDecayRate(studentId, m.topic_id);
        }
    } catch (e) {
        console.error('[Update All Decay Rates] Error:', e);
    }
}

/**
 * 예측 스냅샷 저장 (정확도 추적용)
 */
export async function savePredictionSnapshot(studentId: string): Promise<void> {
    try {
        const supabase = await createServerSupabaseClient();
        const predictions = await getTopicPredictions(studentId);

        // 7일 후 예측 스냅샷 저장
        const predictionDate = new Date();
        predictionDate.setDate(predictionDate.getDate() + 7);

        const snapshots = predictions.map(p => ({
            student_id: studentId,
            topic_id: p.topicId,
            predicted_score: p.predictedScore,
            prediction_date: predictionDate.toISOString(),
        }));

        if (snapshots.length > 0) {
            await supabase.from('prediction_snapshots').insert(snapshots);
        }

        console.log(`[Prediction] Saved ${snapshots.length} snapshots for student ${studentId}`);
    } catch (e) {
        console.error('[Prediction Snapshot] Error:', e);
    }
}

/**
 * 예측 정확도 측정 및 업데이트
 * 예측 날짜가 지난 스냅샷에 대해 실제 점수와 비교
 */
export async function measurePredictionAccuracy(studentId: string): Promise<{
    totalPredictions: number;
    measuredPredictions: number;
    averageAccuracy: number;
    topicAccuracies: Array<{ topicId: string; topicName: string; accuracy: number }>;
}> {
    try {
        const supabase = await createServerSupabaseClient();
        const now = new Date();

        // 예측 날짜가 지난 미측정 스냅샷 조회
        const { data: snapshots } = await supabase
            .from('prediction_snapshots')
            .select('*')
            .eq('student_id', studentId)
            .lte('prediction_date', now.toISOString())
            .is('actual_score', null);

        if (!snapshots || snapshots.length === 0) {
            return {
                totalPredictions: 0,
                measuredPredictions: 0,
                averageAccuracy: 0,
                topicAccuracies: [],
            };
        }

        // 현재 mastery 점수 조회
        const { data: masteryData } = await supabase
            .from('student_mastery')
            .select('topic_id, score')
            .eq('student_id', studentId);

        const masteryMap = new Map(masteryData?.map(m => [m.topic_id, m.score]) || []);

        // 각 스냅샷의 정확도 계산 및 업데이트
        const topicAccuracies: Array<{ topicId: string; topicName: string; accuracy: number }> = [];
        let totalAccuracy = 0;

        for (const snapshot of snapshots) {
            const actualScore = masteryMap.get(snapshot.topic_id) || 0;
            const error = Math.abs(snapshot.predicted_score - actualScore);
            const accuracy = Math.max(0, 100 - error);

            await supabase
                .from('prediction_snapshots')
                .update({
                    actual_score: actualScore,
                    accuracy: accuracy,
                    measured_at: now.toISOString(),
                })
                .eq('id', snapshot.id);

            topicAccuracies.push({
                topicId: snapshot.topic_id,
                topicName: snapshot.topic_id, // TODO: topic name lookup
                accuracy,
            });

            totalAccuracy += accuracy;
        }

        // 개인화된 decay rate 재계산
        await updateAllDecayRates(studentId);

        return {
            totalPredictions: snapshots.length,
            measuredPredictions: snapshots.length,
            averageAccuracy: snapshots.length > 0 ? Math.round(totalAccuracy / snapshots.length) : 0,
            topicAccuracies,
        };
    } catch (e) {
        console.error('[Measure Accuracy] Error:', e);
        return {
            totalPredictions: 0,
            measuredPredictions: 0,
            averageAccuracy: 0,
            topicAccuracies: [],
        };
    }
}

/**
 * 선생님 피드백 저장
 */
export async function savePredictionFeedback(params: {
    studentId: string;
    topicId: string;
    predictedUrgency: string;
    actualPerformance: 'better' | 'expected' | 'worse';
    notes?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabaseClient();

        await supabase.from('prediction_feedback').insert({
            student_id: params.studentId,
            topic_id: params.topicId,
            predicted_urgency: params.predictedUrgency,
            actual_performance: params.actualPerformance,
            notes: params.notes,
        });

        // 피드백 기반으로 decay rate 조정
        const adjustment = params.actualPerformance === 'better' ? -0.02 :
                          params.actualPerformance === 'worse' ? 0.02 : 0;

        if (adjustment !== 0) {
            const { data: currentRate } = await supabase
                .from('student_decay_rates')
                .select('calculated_decay_rate')
                .eq('student_id', params.studentId)
                .eq('topic_id', params.topicId)
                .single();

            if (currentRate) {
                const newRate = Math.min(0.5, Math.max(0.05,
                    currentRate.calculated_decay_rate + adjustment
                ));

                await supabase
                    .from('student_decay_rates')
                    .update({ calculated_decay_rate: newRate })
                    .eq('student_id', params.studentId)
                    .eq('topic_id', params.topicId);
            }
        }

        return { success: true };
    } catch (e: any) {
        console.error('[Prediction Feedback] Error:', e);
        return { success: false, error: e.message };
    }
}

/**
 * 예측 정확도 대시보드 데이터 조회
 */
export async function getPredictionAccuracyDashboard(studentId: string): Promise<{
    overallAccuracy: number;
    totalMeasured: number;
    weeklyTrend: Array<{ week: string; accuracy: number }>;
    topicBreakdown: Array<{ topicId: string; topicName: string; accuracy: number; sampleCount: number }>;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        // 측정된 스냅샷 조회
        const { data: snapshots } = await supabase
            .from('prediction_snapshots')
            .select('*')
            .eq('student_id', studentId)
            .not('accuracy', 'is', null)
            .order('measured_at', { ascending: false });

        if (!snapshots || snapshots.length === 0) {
            return {
                overallAccuracy: 0,
                totalMeasured: 0,
                weeklyTrend: [],
                topicBreakdown: [],
            };
        }

        // 전체 정확도
        const overallAccuracy = Math.round(
            snapshots.reduce((sum, s) => sum + (s.accuracy || 0), 0) / snapshots.length
        );

        // 주간 트렌드 (최근 8주)
        const weeklyMap = new Map<string, number[]>();
        for (const s of snapshots) {
            if (!s.measured_at) continue;
            const date = new Date(s.measured_at);
            const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate()) / 7)}`;
            const existing = weeklyMap.get(weekKey) || [];
            existing.push(s.accuracy || 0);
            weeklyMap.set(weekKey, existing);
        }

        const weeklyTrend = Array.from(weeklyMap.entries())
            .slice(0, 8)
            .map(([week, accuracies]) => ({
                week,
                accuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length),
            }))
            .reverse();

        // 토픽별 분석
        const topicMap = new Map<string, number[]>();
        for (const s of snapshots) {
            const existing = topicMap.get(s.topic_id) || [];
            existing.push(s.accuracy || 0);
            topicMap.set(s.topic_id, existing);
        }

        const topicBreakdown = Array.from(topicMap.entries()).map(([topicId, accuracies]) => ({
            topicId,
            topicName: topicId, // TODO: lookup
            accuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length),
            sampleCount: accuracies.length,
        }));

        return {
            overallAccuracy,
            totalMeasured: snapshots.length,
            weeklyTrend,
            topicBreakdown,
        };
    } catch (e) {
        console.error('[Accuracy Dashboard] Error:', e);
        return {
            overallAccuracy: 0,
            totalMeasured: 0,
            weeklyTrend: [],
            topicBreakdown: [],
        };
    }
}
