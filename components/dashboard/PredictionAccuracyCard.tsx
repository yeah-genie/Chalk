'use client';

import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
    studentId?: string;
}

export default function PredictionAccuracyCard({ studentId }: Props) {
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

    // For now, show placeholder - will connect to real data
    useEffect(() => {
        // Mock data - replace with actual API call
        setAccuracy(87);
        setTrend('up');
    }, [studentId]);

    return (
        <div className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain size={16} className="text-purple-400" />
                    <h2 className="font-semibold">AI Prediction Accuracy</h2>
                </div>
                <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                    Beta
                </span>
            </div>

            <div className="p-5">
                {accuracy !== null ? (
                    <div className="space-y-4">
                        {/* Main Accuracy */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-4xl font-black text-white">{accuracy}%</p>
                                <p className="text-xs text-white/40 mt-1">Overall Accuracy</p>
                            </div>
                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                                trend === 'up' ? 'bg-[#10b981]/20 text-[#10b981]' :
                                trend === 'down' ? 'bg-red-500/20 text-red-400' :
                                'bg-white/10 text-white/60'
                            }`}>
                                <TrendingUp size={14} className={trend === 'down' ? 'rotate-180' : ''} />
                                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                            </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/40">
                                <span>Prediction vs Reality</span>
                                <span>{accuracy}% match</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-[#10b981]"
                                    style={{ width: `${accuracy}%` }}
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <p className="text-xs text-white/30">
                            Based on 7-day forgetting curve predictions
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-6 text-white/30">
                        <Target size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Not enough data yet</p>
                        <p className="text-xs mt-1">Complete more sessions to see accuracy</p>
                    </div>
                )}
            </div>
        </div>
    );
}
