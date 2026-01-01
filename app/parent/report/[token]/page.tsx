import React from 'react';
import { getReportByToken, recordReportView } from "@/lib/actions/parent-sharing";
import { CheckCircle2, AlertCircle, Target, TrendingUp, Brain, Eye, Clock, Heart } from 'lucide-react';
import { AP_SUBJECTS } from "@/lib/knowledge-graph";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ParentReportPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const result = await getReportByToken(token);

    // 조회 기록 (비동기로 처리)
    recordReportView(token);

    if (!result.success || !result.session) {
        return (
            <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-10">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 p-4 rounded-full inline-block mb-6">
                        <AlertCircle size={48} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black mb-4">Report Not Available</h1>
                    <p className="text-white/40 mb-8">
                        {result.error || "This report may have expired or been removed."}
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-[#10b981] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#10b981]/90 transition"
                    >
                        Go to Chalk
                    </Link>
                </div>
            </div>
        );
    }

    const { session, share } = result;
    const { students, session_topics } = session;
    const subject = AP_SUBJECTS.find(s => s.id === students.subject_id);

    return (
        <div className="min-h-screen bg-[#050510] text-white font-sans selection:bg-[#10b981]/30">
            {/* Parent-Specific Header Banner */}
            <div className="bg-gradient-to-r from-[#10b981]/20 to-transparent border-b border-[#10b981]/20">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heart size={18} className="text-[#10b981]" />
                        <span className="text-sm text-white/60">
                            Report shared with you by {students.name}'s tutor
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {share.view_count || 1} views
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(session.scheduled_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Header / Branding */}
            <div className="max-w-4xl mx-auto pt-16 pb-12 px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-[#10b981] p-1.5 rounded-lg">
                                <TrendingUp size={20} className="text-black" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10b981]">
                                Learning Report
                            </span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-none">
                            {students.name}'s <br />
                            <span className="text-[#10b981]">Progress</span>
                        </h1>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">
                            {subject?.name || students.subject_id} •{' '}
                            {new Date(session.scheduled_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto pb-32 px-6 space-y-6">
                {/* AI Summary Section */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-[#10b981]/10 transition-colors">
                        <Brain size={120} />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                        <Target size={14} /> Today's Summary
                    </h2>
                    <p className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white mb-8 relative z-10">
                        {session.notes || "Your child had a productive learning session today."}
                    </p>
                    <div className="flex items-center gap-2 text-[#10b981] font-bold text-sm">
                        <CheckCircle2 size={16} />
                        AI-Powered Analysis by Chalk
                    </div>
                </div>

                {/* Quick Stats for Parents */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 text-center">
                        <p className="text-3xl font-black text-[#10b981]">{session_topics?.length || 0}</p>
                        <p className="text-xs text-white/40 mt-1">Topics Covered</p>
                    </div>
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 text-center">
                        <p className="text-3xl font-black text-blue-400">
                            {session_topics?.filter((t: any) => t.status_after === 'mastered').length || 0}
                        </p>
                        <p className="text-xs text-white/40 mt-1">Mastered</p>
                    </div>
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 text-center">
                        <p className="text-3xl font-black text-amber-400">
                            {session_topics?.filter((t: any) => t.status_after === 'learning').length || 0}
                        </p>
                        <p className="text-xs text-white/40 mt-1">In Progress</p>
                    </div>
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 text-center">
                        <p className="text-3xl font-black text-purple-400">
                            {session.duration_minutes || '—'}
                        </p>
                        <p className="text-xs text-white/40 mt-1">Minutes</p>
                    </div>
                </div>

                {/* Topics Covered Grid */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                        Topics Covered Today
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {session_topics?.map((st: any) => {
                            const topicInfo = subject?.topics.find(t => t.id === st.topic_id);
                            const statusColors: Record<string, string> = {
                                mastered: 'bg-[#10b981]/20 text-[#10b981]',
                                reviewed: 'bg-blue-500/20 text-blue-400',
                                learning: 'bg-amber-500/20 text-amber-400',
                                new: 'bg-purple-500/20 text-purple-400',
                            };

                            return (
                                <div key={st.id} className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusColors[st.status_after] || statusColors.new}`}>
                                            {st.status_after}
                                        </span>
                                        <Target size={20} className="text-white/10" />
                                    </div>
                                    <h3 className="text-xl font-bold leading-snug">
                                        {topicInfo?.name || st.topic_id}
                                    </h3>
                                    {st.evidence && (
                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 italic text-sm text-white/60 leading-relaxed">
                                            "{st.evidence}"
                                        </div>
                                    )}
                                    {st.future_impact && (
                                        <div className="flex gap-3 text-amber-500/80 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                                            <AlertCircle size={18} className="shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest">
                                                    What This Means
                                                </p>
                                                <p className="text-xs leading-relaxed font-semibold">
                                                    {st.future_impact}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Encouragement for Parents */}
                <div className="bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 border border-[#10b981]/20 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-3 text-[#10b981]">
                        💡 How You Can Help
                    </h3>
                    <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Ask your child to explain what they learned today</li>
                        <li>• Encourage them to practice topics marked as "Learning"</li>
                        <li>• Celebrate progress on "Mastered" topics!</li>
                    </ul>
                </div>

                {/* Footnote */}
                <div className="pt-12 text-center">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
                        Chalk Intelligence System • Parent Report
                    </p>
                    <p className="text-white/10 text-[10px] mt-2">
                        This link is private. Please don't share it publicly.
                    </p>
                </div>
            </main>
        </div>
    );
}
