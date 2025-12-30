import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import LogoutButton from './LogoutButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function DashboardPage() {
    const t = await getTranslations('dashboard');
    const locale = await getLocale();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Redirect to onboarding if profile not complete
    if (!profile?.name) {
        redirect('/onboarding');
    }

    // Get logs
    const { data: logs } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const { count: totalLogs } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Calculate same-day rate
    const { data: allLogs } = await supabase
        .from('logs')
        .select('lesson_date, created_at')
        .eq('user_id', user.id);

    let sameDayRate = 0;
    if (allLogs && allLogs.length > 0) {
        const sameDayCount = allLogs.filter(log => {
            const lessonDate = new Date(log.lesson_date).toDateString();
            const createdDate = new Date(log.created_at).toDateString();
            return lessonDate === createdDate;
        }).length;
        sameDayRate = Math.round((sameDayCount / allLogs.length) * 100);
    }

    const hasInstantFeedbackBadge = sameDayRate >= 80 && (totalLogs || 0) >= 5;

    // Get active students with their analytics
    const { data: students } = await supabase
        .from('students')
        .select('id, name, subject, grade, status')
        .eq('tutor_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(4);

    // Get analytics for these students
    const studentIds = students?.map(s => s.id) || [];
    const { data: studentAnalytics } = studentIds.length > 0
        ? await supabase
            .from('student_analytics')
            .select('student_id, understanding_trend, improvement_rate')
            .in('student_id', studentIds)
        : { data: [] };

    // Map analytics to students
    const analyticsMap = new Map(studentAnalytics?.map(a => [a.student_id, a]) || []);
    const studentsWithAnalytics = students?.map(student => ({
        ...student,
        analytics: analyticsMap.get(student.id),
    })) || [];

    return (
        <div className="min-h-screen relative">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#050506]" />
                <div className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.02] blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.015] blur-[100px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050506]/80 backdrop-blur-2xl border-b border-white/[0.04]">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">C</span>
                        </div>
                        <span className="text-[15px] font-semibold text-white/90">Chalk</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10">
                {/* Profile header */}
                <div className="flex items-start justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                <span className="text-white text-2xl font-bold">{profile.name?.charAt(0)}</span>
                            </div>
                            {hasInstantFeedbackBadge && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#050506] flex items-center justify-center">
                                    <span className="text-sm">🚀</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-[22px] font-bold text-white">{t('greeting', { name: profile.name })}</h1>
                            <p className="text-[14px] text-zinc-500 mt-0.5">{profile.school}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[12px] font-medium text-emerald-400">
                                    {profile.subject}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/tutor/${user.id}`}
                        className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-zinc-400 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
                    >
                        {t('quickActions.publicProfile')} →
                    </Link>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[13px] text-zinc-500 mb-2">{t('totalLogs')}</p>
                        <p className="text-[36px] font-bold text-white tracking-tight">
                            {totalLogs || 0}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[13px] text-zinc-500 mb-2">{t('sameDayRate')}</p>
                        <p className="text-[36px] font-bold text-emerald-400 tracking-tight">
                            {sameDayRate}
                            <span className="text-[16px] text-emerald-400/60 font-normal ml-0.5">%</span>
                        </p>
                        {hasInstantFeedbackBadge && (
                            <span className="inline-block mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                🚀 {t('instantFeedbackBadge')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 mb-10">
                    <Link
                        href="/dashboard/students"
                        className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center text-[13px] text-zinc-400 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
                    >
                        👩‍🎓 {t('quickActions.students')}
                    </Link>
                    <Link
                        href="/dashboard/analytics"
                        className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center text-[13px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/30 transition-all"
                    >
                        📊 {t('quickActions.analytics')}
                    </Link>
                    <Link
                        href={`/tutor/${user.id}`}
                        className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center text-[13px] text-zinc-400 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
                    >
                        🌐 {t('quickActions.publicProfile')}
                    </Link>
                </div>

                {/* CTA Button */}
                <Link
                    href="/log/new"
                    className="group block w-full py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl text-center relative overflow-hidden mb-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative text-[16px] font-semibold text-white flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('recordLesson')}
                    </span>
                </Link>

                {/* Student Cards */}
                {studentsWithAnalytics.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[15px] font-semibold text-zinc-400">{t('myStudents')}</h2>
                            <Link
                                href="/dashboard/students"
                                className="text-[13px] text-zinc-500 hover:text-white transition"
                            >
                                {t.raw('common.viewAll') || 'View all →'}
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {studentsWithAnalytics.map((student) => {
                                const latestScore = student.analytics?.understanding_trend?.slice(-1)[0];
                                const improvementRate = student.analytics?.improvement_rate || 0;
                                const trend = improvementRate > 0 ? 'up' : improvementRate < 0 ? 'down' : 'stable';

                                return (
                                    <Link
                                        key={student.id}
                                        href={`/dashboard/students/${student.id}`}
                                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white group-hover:text-emerald-400 transition truncate">
                                                    {student.name}
                                                </p>
                                                <p className="text-[12px] text-zinc-500 truncate">
                                                    {student.subject} {student.grade && `· ${student.grade}`}
                                                </p>
                                            </div>
                                        </div>
                                        {student.analytics ? (
                                            <div className="flex items-center justify-between text-[12px]">
                                                <span className="text-zinc-500">
                                                    {t('studentCard.understanding')} {latestScore || '-'}{t('studentCard.points')}
                                                </span>
                                                <span className={`flex items-center gap-1 ${
                                                    trend === 'up' ? 'text-emerald-400' :
                                                    trend === 'down' ? 'text-red-400' : 'text-zinc-500'
                                                }`}>
                                                    {trend === 'up' && '↑'}
                                                    {trend === 'down' && '↓'}
                                                    {trend === 'stable' && '→'}
                                                    {Math.abs(improvementRate)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-[12px] text-zinc-600">{t('studentCard.noAnalytics')}</p>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent logs */}
                <div>
                    <h2 className="text-[15px] font-semibold text-zinc-400 mb-5">{t('recentLogs')}</h2>

                    {logs && logs.length > 0 ? (
                        <div className="space-y-3">
                            {logs.map((log, i) => (
                                <div
                                    key={log.id}
                                    className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.06] transition-all"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[13px] text-zinc-500">
                                            {new Date(log.lesson_date).toLocaleDateString(locale, {
                                                month: 'long',
                                                day: 'numeric',
                                                weekday: 'short'
                                            })}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Problem */}
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-red-400 text-[10px] font-bold">P</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {log.problem_tags?.map((tag: string) => (
                                                        <span key={tag} className="text-[12px] text-red-400/80">#{tag}</span>
                                                    ))}
                                                </div>
                                                {log.problem_detail && (
                                                    <p className="text-[13px] text-zinc-400 mt-1 line-clamp-1">{log.problem_detail}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Diagnosis */}
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-orange-400 text-[10px] font-bold">D</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {log.diagnosis_tags?.map((tag: string) => (
                                                        <span key={tag} className="text-[12px] text-orange-400/80">#{tag}</span>
                                                    ))}
                                                </div>
                                                {log.diagnosis_detail && (
                                                    <p className="text-[13px] text-zinc-400 mt-1 line-clamp-1">{log.diagnosis_detail}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Solution */}
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-emerald-400 text-[10px] font-bold">S</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {log.solution_tags?.map((tag: string) => (
                                                        <span key={tag} className="text-[12px] text-emerald-400/80">#{tag}</span>
                                                    ))}
                                                </div>
                                                {log.solution_detail && (
                                                    <p className="text-[13px] text-zinc-400 mt-1 line-clamp-1">{log.solution_detail}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-[17px] font-semibold text-white mb-2">{t('noLogs.title')}</h3>
                            <p className="text-[14px] text-zinc-500 mb-8 max-w-[260px] mx-auto leading-relaxed">
                                {t('noLogs.description')}
                            </p>
                            <Link
                                href="/log/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-[14px] font-medium text-white hover:bg-white/[0.08] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {t('startRecording')}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
