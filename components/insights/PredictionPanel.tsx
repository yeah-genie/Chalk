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
    if (!data) return null;

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
                            />
                        </div>
                    </div>

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
                    {data.weaknessPatterns.length === 0 && (
                        <p className="text-[10px] text-[#71717a] italic tracking-widest uppercase">No critical weakness patterns detected.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
