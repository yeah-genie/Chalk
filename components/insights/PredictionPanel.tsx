'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, Clock, Target, Brain, Calendar, Zap } from 'lucide-react';
import type { TopicPrediction, WeaknessAnalysis, ProgressPrediction } from '@/lib/services/prediction';

interface PredictionPanelProps {
    predictions: TopicPrediction[];
    weaknesses: WeaknessAnalysis[];
    progress: ProgressPrediction | null;
    nextSession: {
        focusTopics: string[];
        suggestedDuration: number;
        priority: string;
        rationale: string;
    } | null;
}

function UrgencyBadge({ urgency }: { urgency: TopicPrediction['urgency'] }) {
    const styles = {
        critical: 'bg-red-500/20 text-red-400 border-red-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        stable: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        strong: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };

    const labels = {
        critical: 'Critical',
        warning: 'Review Soon',
        stable: 'Stable',
        strong: 'Strong',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${styles[urgency]}`}>
            {labels[urgency]}
        </span>
    );
}

function PatternBadge({ pattern }: { pattern: WeaknessAnalysis['pattern'] }) {
    const styles = {
        stuck: 'bg-red-500/20 text-red-400',
        declining: 'bg-orange-500/20 text-orange-400',
        slow_progress: 'bg-yellow-500/20 text-yellow-400',
        normal: 'bg-gray-500/20 text-gray-400',
    };

    const labels = {
        stuck: 'Stuck',
        declining: 'Declining',
        slow_progress: 'Slow Progress',
        normal: 'Normal',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${styles[pattern]}`}>
            {labels[pattern]}
        </span>
    );
}

export default function PredictionPanel({
    predictions,
    weaknesses,
    progress,
    nextSession,
}: PredictionPanelProps) {
    const criticalCount = predictions.filter(p => p.urgency === 'critical').length;
    const warningCount = predictions.filter(p => p.urgency === 'warning').length;

    return (
        <div className="space-y-6">
            {/* Next Session Recommendation */}
            {nextSession && (
                <div className="rounded-xl bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 border border-[#10b981]/20 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-[#10b981]" />
                        <h3 className="font-semibold text-[#10b981]">Next Session Recommendation</h3>
                    </div>
                    <p className="text-sm text-white/80 mb-3">{nextSession.rationale}</p>

                    {nextSession.focusTopics.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs text-white/50 mb-1.5">Focus on:</p>
                            <div className="flex flex-wrap gap-2">
                                {nextSession.focusTopics.map((topic, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/80">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {nextSession.suggestedDuration} min
                        </span>
                        <span className="capitalize">{nextSession.priority.replace('_', ' ')}</span>
                    </div>
                </div>
            )}

            {/* Progress Prediction */}
            {progress && (
                <div className="rounded-xl bg-[#18181b] border border-[#27272a] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#71717a]" />
                            <h3 className="font-semibold">Progress Prediction</h3>
                        </div>
                        <span className={`text-xs font-bold ${progress.onTrack ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {progress.onTrack ? 'On Track' : 'Behind Schedule'}
                        </span>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-[#71717a] mb-1">
                            <span>Current: {progress.currentMastery}%</span>
                            <span>Target: {progress.targetMastery}%</span>
                        </div>
                        <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#10b981] to-emerald-400 transition-all"
                                style={{ width: `${(progress.currentMastery / progress.targetMastery) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-[#71717a]">Sessions Needed</p>
                            <p className="text-lg font-bold">{progress.sessionsNeeded}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-[#71717a]">Est. Completion</p>
                            <p className="text-lg font-bold">
                                {progress.predictedCompletionDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-[#71717a]">{progress.recommendation}</p>
                </div>
            )}

            {/* Forgetting Curve Alerts */}
            {(criticalCount > 0 || warningCount > 0) && (
                <div className="rounded-xl bg-[#18181b] border border-[#27272a] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-4 h-4 text-[#71717a]" />
                        <h3 className="font-semibold">Memory Retention</h3>
                        {criticalCount > 0 && (
                            <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                                {criticalCount} at risk
                            </span>
                        )}
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {predictions
                            .filter(p => p.urgency === 'critical' || p.urgency === 'warning')
                            .slice(0, 5)
                            .map((pred) => (
                                <div
                                    key={pred.topicId}
                                    className="p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium truncate pr-2">{pred.topicName}</span>
                                        <UrgencyBadge urgency={pred.urgency} />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-[#71717a]">
                                        <span>Now: {pred.currentScore}%</span>
                                        <span className="flex items-center gap-1">
                                            <TrendingDown className="w-3 h-3 text-red-400" />
                                            7d: {pred.predictedScore}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {pred.daysSinceReview}d ago
                                        </span>
                                    </div>

                                    <p className="text-xs text-[#71717a] mt-2">{pred.recommendation}</p>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Weakness Analysis */}
            {weaknesses.length > 0 && (
                <div className="rounded-xl bg-[#18181b] border border-[#27272a] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <h3 className="font-semibold">Weakness Analysis</h3>
                    </div>

                    <div className="space-y-3">
                        {weaknesses.slice(0, 4).map((w) => (
                            <div key={w.topicId} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium truncate pr-2">{w.topicName}</span>
                                    <PatternBadge pattern={w.pattern} />
                                </div>

                                <div className="flex items-center gap-3 text-xs text-[#71717a] mb-2">
                                    <span>Score: {w.score}%</span>
                                    <span>{w.sessionCount} sessions</span>
                                </div>

                                <p className="text-xs text-[#71717a]">{w.suggestedApproach}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Good State */}
            {predictions.length > 0 && criticalCount === 0 && warningCount === 0 && weaknesses.length === 0 && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-emerald-400 mb-1">Excellent Retention</h3>
                    <p className="text-sm text-white/60">All topics are well-maintained. Ready for new material!</p>
                </div>
            )}
        </div>
    );
}
