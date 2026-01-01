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

function predictScoreAfterDays(
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
