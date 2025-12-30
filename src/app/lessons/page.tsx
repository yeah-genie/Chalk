'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Lesson {
    id: string;
    lesson_date: string;
    created_at: string;
    ai_summary: string | null;
    problem_detail: string | null;
    problem_tags: string[] | null;
    student_id: string | null;
    students: { name: string } | null;
    duration_minutes: number | null;
}

export default function LessonsPage() {
    const t = useTranslations('lessons');
    const tNav = useTranslations('nav');
    const tCommon = useTranslations('common');

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function loadLessons() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('logs')
                .select('*, students(name)')
                .eq('user_id', user.id)
                .order('lesson_date', { ascending: false })
                .limit(50);

            setLessons(data || []);
            setIsLoading(false);
        }
        loadLessons();
    }, [supabase]);

    // Group lessons by date category
    const today = new Date().toDateString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const groupedLessons = {
        today: lessons.filter(l => new Date(l.lesson_date).toDateString() === today),
        thisWeek: lessons.filter(l => {
            const date = new Date(l.lesson_date);
            return date.toDateString() !== today && date >= oneWeekAgo;
        }),
        earlier: lessons.filter(l => new Date(l.lesson_date) < oneWeekAgo),
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const LessonCard = ({ lesson }: { lesson: Lesson }) => (
        <Link
            href={`/lessons/${lesson.id}`}
            className="block p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    {lesson.students?.name && (
                        <span className="text-sm font-medium text-white">{lesson.students.name}</span>
                    )}
                    {lesson.duration_minutes && (
                        <span className="text-xs text-zinc-600">{lesson.duration_minutes}min</span>
                    )}
                </div>
                <span className="text-xs text-zinc-500">{formatDate(lesson.lesson_date)}</span>
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2">
                {lesson.ai_summary || lesson.problem_detail || 'Lesson recorded'}
            </p>
        </Link>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-zinc-800/50">
                <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
                    <h1 className="text-[15px] font-semibold text-white">{t('title')}</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 py-6 pb-24">
                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : lessons.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-zinc-500 mb-4">{t('empty')}</p>
                        <Link
                            href="/dashboard"
                            className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition-colors"
                        >
                            {t('emptyAction')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Today */}
                        {groupedLessons.today.length > 0 && (
                            <div>
                                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                                    {t('today')}
                                </h2>
                                <div className="space-y-2">
                                    {groupedLessons.today.map(lesson => (
                                        <LessonCard key={lesson.id} lesson={lesson} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* This Week */}
                        {groupedLessons.thisWeek.length > 0 && (
                            <div>
                                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                                    {t('thisWeek')}
                                </h2>
                                <div className="space-y-2">
                                    {groupedLessons.thisWeek.map(lesson => (
                                        <LessonCard key={lesson.id} lesson={lesson} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Earlier */}
                        {groupedLessons.earlier.length > 0 && (
                            <div>
                                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                                    {t('earlier')}
                                </h2>
                                <div className="space-y-2">
                                    {groupedLessons.earlier.map(lesson => (
                                        <LessonCard key={lesson.id} lesson={lesson} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0b] border-t border-zinc-800/50 pb-safe">
                <div className="max-w-lg mx-auto px-8 py-4 flex items-center justify-around">
                    <Link href="/dashboard" className="flex flex-col items-center text-zinc-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs mt-1">{tNav('home')}</span>
                    </Link>
                    <Link href="/lessons" className="flex flex-col items-center text-emerald-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-xs mt-1">{tNav('lessons')}</span>
                    </Link>
                    <Link href="/dashboard/students" className="flex flex-col items-center text-zinc-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-xs mt-1">{tNav('students')}</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
