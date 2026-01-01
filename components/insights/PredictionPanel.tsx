<<<<<<< HEAD
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
=======
"use client";

import React from 'react';
import {
    TrendingUp,
    AlertCircle,
    Zap,
    Target,
    Clock,
    ShieldAlert,
    Brain
} from 'lucide-react';
import { type PredictionData } from '@/lib/services/prediction';

interface PredictionPanelProps {
    data: PredictionData;
}

export default function PredictionPanel({ data }: PredictionPanelProps) {
    return (
        <div className="space-y-6">
            {/* 1. Next Session Recommendation */}
            <div className="p-6 bg-[#10b981]/5 border border-[#10b981]/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center text-black">
                        <Zap size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#10b981]">Recommended Focus</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Lesson Plan Co-pilot</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-lg font-bold text-white tracking-tight">{data.nextSessionRecommendation.topicName}</p>
                    <p className="text-xs text-white/60 leading-relaxed italic">
                        "{data.nextSessionRecommendation.reason}"
                    </p>
                </div>
            </div>

            {/* 2. Progress Forecast */}
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717a] mb-6 flex items-center gap-2">
                    <Target size={14} />
                    Mastery Progress Forecast
                </h4>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                            <span className="text-white/40">Current Path</span>
                            <span className="text-[#10b981]">{data.progressForecast.currentMastery}% / {data.progressForecast.targetMastery}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#10b981] transition-all duration-1000"
                                style={{ width: `${data.progressForecast.currentMastery}%` }}
>>>>>>> 336c457 (Feature: Implement Whisper STT and Prediction Analysis Engine with UI integration)
                            />
                        </div>
                    </div>

<<<<<<< HEAD
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
=======
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-white/40 mb-1">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Est. Sessions</span>
                            </div>
                            <p className="text-xl font-black text-[#10b981]">{data.progressForecast.estimatedSessionsNeeded}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-white/40 mb-1">
                                <TrendingUp size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Velocity</span>
                            </div>
                            <p className="text-xl font-black text-[#10b981] uppercase text-[14px]">{data.progressForecast.velocity}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Retention Alerts (Forgetting Curve) */}
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717a] mb-4 flex items-center gap-2">
                    <Brain size={14} />
                    Memory Retention Risk
                </h4>
                <div className="space-y-3">
                    {data.retentionAlerts.map((alert, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={14} className={alert.status === 'critical' ? 'text-rose-500' : 'text-amber-500'} />
                                <span className="text-xs font-medium text-white/80">{alert.topicName}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white/40">{alert.predictedScore}% Score</span>
                        </div>
                    ))}
                    {data.retentionAlerts.length === 0 && (
                        <p className="text-[10px] text-[#71717a] italic">All topics stable. No immediate review needed.</p>
                    )}
                </div>
            </div>

            {/* 4. Weakness Analysis */}
            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} />
                    Weakness Analysis
                </h4>
                <div className="space-y-4">
                    {data.weaknessPatterns.map((p, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-500 text-[8px] font-black uppercase rounded tracking-tighter">
                                    {p.pattern.replace('_', ' ')}
                                </span>
                                <span className="text-xs font-bold text-white/90">{p.topicName}</span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed">{p.details}</p>
                        </div>
                    ))}
                </div>
            </div>
>>>>>>> 336c457 (Feature: Implement Whisper STT and Prediction Analysis Engine with UI integration)
        </div>
    );
}
