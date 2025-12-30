'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface LessonDetail {
    id: string;
    lesson_date: string;
    ai_summary: string | null;
    problem_detail: string | null;
    diagnosis_detail: string | null;
    solution_detail: string | null;
    problem_tags: string[] | null;
    diagnosis_tags: string[] | null;
    solution_tags: string[] | null;
    duration_minutes: number | null;
    students: { id: string; name: string } | null;
    user_id: string;
}

interface Profile {
    name: string;
}

export default function LessonDetailPage() {
    const t = useTranslations('lessons');
    const tShare = useTranslations('share');
    const tCommon = useTranslations('common');

    const params = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        async function loadLesson() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: lessonData } = await supabase
                .from('logs')
                .select('*, students(id, name)')
                .eq('id', params.id)
                .eq('user_id', user.id)
                .single();

            if (!lessonData) {
                router.push('/lessons');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', user.id)
                .single();

            setLesson(lessonData);
            setProfile(profileData);
            setIsLoading(false);
        }
        loadLesson();
    }, [supabase, params.id, router]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleCopyLink = () => {
        const shareUrl = `${window.location.origin}/share/${lesson?.id}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!lesson) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-zinc-800/50">
                <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
                    <Link href="/lessons" className="text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <span className="text-sm text-zinc-500">
                        {lesson.students?.name || 'Lesson'}
                    </span>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 py-6">
                {/* Date */}
                <p className="text-xs text-zinc-500 mb-2">{formatDate(lesson.lesson_date)}</p>

                {/* Student name */}
                {lesson.students?.name && (
                    <h1 className="text-xl font-semibold text-white mb-6">{lesson.students.name}</h1>
                )}

                {/* AI Summary */}
                {lesson.ai_summary && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-600/10 border border-emerald-600/20">
                        <p className="text-xs text-emerald-400 font-medium mb-2">AI Summary</p>
                        <p className="text-sm text-white leading-relaxed">{lesson.ai_summary}</p>
                    </div>
                )}

                {/* Details */}
                <div className="space-y-4">
                    {lesson.problem_detail && (
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-1">What was covered</p>
                            <p className="text-sm text-zinc-300">{lesson.problem_detail}</p>
                            {lesson.problem_tags && lesson.problem_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {lesson.problem_tags.map(tag => (
                                        <span key={tag} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {lesson.diagnosis_detail && (
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-1">Observations</p>
                            <p className="text-sm text-zinc-300">{lesson.diagnosis_detail}</p>
                        </div>
                    )}

                    {lesson.solution_detail && (
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-1">Next steps</p>
                            <p className="text-sm text-zinc-300">{lesson.solution_detail}</p>
                        </div>
                    )}
                </div>

                {/* Duration */}
                {lesson.duration_minutes && (
                    <p className="text-xs text-zinc-600 mt-6">
                        Duration: {lesson.duration_minutes} minutes
                    </p>
                )}
            </main>

            {/* Share Modal */}
            {showShareModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
                    onClick={() => setShowShareModal(false)}
                >
                    <div
                        className="bg-[#0a0a0b] rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-lg border-t sm:border border-zinc-800"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-semibold text-white">{tShare('title')}</h2>
                                <p className="text-xs text-zinc-500">{tShare('subtitle')}</p>
                            </div>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 mb-4">
                            <p className="text-xs text-zinc-500 mb-2">{tShare('preview')}</p>
                            <div className="bg-zinc-950 rounded-lg p-3">
                                <p className="text-sm font-medium text-white mb-1">
                                    {tShare('parentView.title')}
                                </p>
                                <p className="text-xs text-zinc-500 mb-2">
                                    {profile?.name} • {formatDate(lesson.lesson_date)}
                                </p>
                                <p className="text-xs text-zinc-400 line-clamp-2">
                                    {lesson.ai_summary || lesson.problem_detail || 'Lesson completed'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={handleCopyLink}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {tShare('linkCopied')}
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    {tShare('copyLink')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
