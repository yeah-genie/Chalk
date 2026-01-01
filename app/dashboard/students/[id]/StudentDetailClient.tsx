'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MasteryMatrix from '@/components/analysis/MasteryMatrix';
import PredictionPanel from '@/components/insights/PredictionPanel';
import { Topic, Subject } from '@/lib/knowledge-graph';
import { Student, Session } from '@/lib/types/database';
import {
    Zap,
    MessageSquare,
    Target,
    Award,
    Calendar,
    ArrowRight,
    Share2,
    TrendingUp,
    Brain
} from 'lucide-react';
import TopicInsightPanel from '@/components/analysis/TopicInsightPanel';
import { type PredictionData } from '@/lib/services/prediction';

interface StudentDetailClientProps {
    student: Student;
    initialMastery: any[];
    subject: Subject;
    sessions: Session[];
    predictions: PredictionData;
}

export default function StudentDetailClient({ student, initialMastery, subject, sessions, predictions }: StudentDetailClientProps) {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [activeTab, setActiveTab] = useState<'insights' | 'predictions'>('insights');

    // Placeholder insights (In real app, fetch from DB)
    const mockInsights = {
        text: "The student shows a strong conceptual grasp of the Chain Rule but struggles when combined with trigonometric functions. Precision in algebraic manipulation is the current bottleneck.",
        nextSteps: [
            "Review trigonometric identities before next differentiation session",
            "Drill multi-step chain rule problems with mixed functions",
            "Focus on formal notation to prevent sign errors"
        ],
        evidence: [
            "Student correctly identified the outer function in sin(3x² + 1)",
            "Lapsed in applying the constant multiple rule during the second step",
        ],
        futureImpact: "Difficulty with Implicit Differentiation is expected if the Chain Rule is not fully mastered this week."
    };

    const handleGenerateReport = () => {
        setIsGeneratingReport(true);
        setTimeout(() => {
            setIsGeneratingReport(false);
            alert("Parent Summary Report has been generated and copied to clipboard!");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64 overflow-y-auto">
                <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div>
                        <div className="flex items-center gap-3 text-[#10b981] mb-1">
                            <Zap size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Student Intelligence Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            {student.name}
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                {subject.name}
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                            className="px-6 py-3 bg-[#10b981] text-black font-black rounded-xl text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                        >
                            {isGeneratingReport ? (
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Share2 size={16} />
                                    Generate Parent Report
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <main className="p-8 grid grid-cols-12 gap-8">
                    {/* Left Column: Mastery & Analysis */}
                    <div className="col-span-8 space-y-8">
                        {/* Mastery Section */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Target size={18} className="text-[#10b981]" />
                                    Mastery Matrix
                                </h3>
                                <div className="h-[500px] relative">
                                    <MasteryMatrix
                                        subject={subject}
                                        mastery={initialMastery}
                                        onTopicClick={(topic) => setSelectedTopic(topic)}
                                        isCompact={false}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Proof of Lesson Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Award size={18} className="text-[#10b981]" />
                                Proof of Lesson
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {sessions.map((session) => (
                                    <div key={session.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-[#71717a] text-xs">
                                                <Calendar size={12} />
                                                {new Date(session.created_at).toLocaleDateString()}
                                            </div>
                                            <span className="px-2 py-0.5 bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold rounded uppercase">
                                                {session.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-2 group-hover:text-[#10b981] transition-colors">Session: {session.subject_id}</h4>
                                        <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed">
                                            Evidence of learning captured. Automatic transcript and mastery updates applied.
                                        </p>
                                    </div>
                                ))}
                                {sessions.length === 0 && (
                                    <div className="col-span-2 p-10 text-center border border-dashed border-white/10 rounded-2xl text-[#71717a] text-sm italic">
                                        No recorded sessions yet. Start a session to capture proof.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: AI Insights & Predictions */}
                    <div className="col-span-4 space-y-6">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'insights'
                                    ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Zap size={14} />
                                    AI Insights
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('predictions')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'predictions'
                                    ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <TrendingUp size={14} />
                                    Predictions
                                </span>
                            </button>
                        </div>

                        {activeTab === 'insights' ? (
                            <>
                                {/* AI Tipping */}
                                <section className="bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/20 rounded-3xl p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-black">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#10b981]">AI Tipping</h3>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mt-1">Next Session Co-pilot</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {mockInsights.nextSteps.map((step, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#10b981]/50" />
                                                <p className="text-sm text-white/70 leading-relaxed font-medium">{step}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                                            <Target size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Growth Forecast</span>
                                        </div>
                                        <p className="text-xs text-white/50 italic leading-relaxed">
                                            "{mockInsights.futureImpact}"
                                        </p>
                                    </div>
                                </section>

                                {/* Parent Summary Card */}
                                <section className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        Parental Summary
                                    </h3>
                                    <div className="bg-[#09090b] rounded-2xl p-5 border border-white/5">
                                        <p className="text-sm text-white/80 italic leading-relaxed font-serif">
                                            "{mockInsights.text}"
                                        </p>
                                    </div>
                                    <button className="w-full group flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[#71717a] hover:text-white transition-all">
                                        <span>Preview Generated Report</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </section>
                            </>
                        ) : (
                            <PredictionPanel data={predictions} />
                        )}

                        {/* Quick Stats */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-[#71717a] uppercase mb-1">Total Lessons</p>
                                <p className="text-2xl font-black text-[#10b981]">{sessions.length}</p>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                <p className="text-[10px] font-bold text-[#71717a] uppercase mb-1">Avg Score</p>
                                <p className="text-2xl font-black text-[#10b981]">
                                    {initialMastery.length > 0
                                        ? Math.round(initialMastery.reduce((acc, m) => acc + m.score, 0) / initialMastery.length)
                                        : 0}%
                                </p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Topic Insight Overlay (Reuse Existing) */}
            <TopicInsightPanel
                topic={selectedTopic}
                onClose={() => setSelectedTopic(null)}
                masteryLevel={initialMastery.find(m => m.topicId === selectedTopic?.id)?.level || 0}
                insights={mockInsights}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}
