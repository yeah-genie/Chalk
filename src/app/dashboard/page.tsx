'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRecording } from '@/services/recording';
import type { Student } from '@/lib/supabase/types';

type AppState = 'ready' | 'recording' | 'processing' | 'success';

export default function HomePage() {
    const t = useTranslations('home');
    const tRecord = useTranslations('record');
    const tNav = useTranslations('nav');

    const [appState, setAppState] = useState<AppState>('ready');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showStudentPicker, setShowStudentPicker] = useState(false);
    const [lastLesson, setLastLesson] = useState<{ student_name?: string; summary?: string; date: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const supabase = createClient();

    const {
        formattedDuration,
        isRecording,
        isPaused,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        cancelRecording,
    } = useRecording();

    // Load data
    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Check profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', user.id)
                .single();

            if (!profile?.name) {
                router.push('/onboarding');
                return;
            }

            // Load students
            const { data: studentsData } = await supabase
                .from('students')
                .select('*')
                .eq('tutor_id', user.id)
                .eq('status', 'active')
                .order('updated_at', { ascending: false });

            setStudents(studentsData || []);

            // Load last lesson
            const { data: logs } = await supabase
                .from('logs')
                .select('*, students(name)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (logs && logs.length > 0) {
                const log = logs[0];
                setLastLesson({
                    student_name: log.students?.name,
                    summary: log.ai_summary || log.problem_detail,
                    date: log.lesson_date,
                });
            }

            setIsLoading(false);
        }
        loadData();
    }, [supabase, router]);

    // Handle recording start
    const handleStartRecording = useCallback(async () => {
        const sessionId = await startRecording(selectedStudent?.id || null);
        if (sessionId) {
            setAppState('recording');
        }
    }, [selectedStudent, startRecording]);

    // Poll for analysis completion
    const pollAnalysisStatus = useCallback(async (recordingId: string) => {
        const maxAttempts = 60;
        let attempts = 0;

        const poll = async (): Promise<boolean> => {
            try {
                const res = await fetch(`/api/analyze-recording?recordingId=${recordingId}`);
                const data = await res.json();

                if (data.status === 'completed' && data.hasLog) {
                    return true;
                }

                attempts++;
                if (attempts >= maxAttempts) return false;

                await new Promise(resolve => setTimeout(resolve, 2000));
                return poll();
            } catch {
                attempts++;
                if (attempts >= maxAttempts) return false;
                await new Promise(resolve => setTimeout(resolve, 2000));
                return poll();
            }
        };

        return poll();
    }, []);

    // Handle recording stop
    const handleStopRecording = useCallback(async () => {
        setAppState('processing');
        const recording = await stopRecording();

        if (recording) {
            await pollAnalysisStatus(recording.id);
            setAppState('success');
            setTimeout(() => {
                setAppState('ready');
                router.refresh();
            }, 2000);
        } else {
            setAppState('ready');
        }
    }, [stopRecording, pollAnalysisStatus, router]);

    // Handle cancel
    const handleCancelRecording = useCallback(async () => {
        await cancelRecording();
        setAppState('ready');
    }, [cancelRecording]);

    // Handle logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
            {/* Header */}
            <header className="px-5 pt-12 pb-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-white">{t('title')}</span>
                <button
                    onClick={handleLogout}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                    {tNav('logout')}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-5 pb-32">
                {/* Success State */}
                {appState === 'success' && (
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-xl font-medium text-white">{tRecord('success')}</p>
                    </div>
                )}

                {/* Processing State */}
                {appState === 'processing' && (
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <p className="text-xl font-medium text-white mb-2">{t('processing')}</p>
                        <p className="text-sm text-zinc-500">{tRecord('analyzing')}</p>
                    </div>
                )}

                {/* Recording State */}
                {appState === 'recording' && (
                    <div className="text-center">
                        {/* Recording indicator */}
                        <div className="relative mb-6">
                            <div className={`w-32 h-32 rounded-full bg-red-600 flex items-center justify-center ${isRecording && !isPaused ? 'animate-pulse' : ''}`}>
                                <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            </div>
                            {isRecording && !isPaused && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 animate-ping" />
                            )}
                        </div>

                        {/* Timer */}
                        <p className="text-4xl font-mono text-white mb-2">{formattedDuration}</p>
                        <p className="text-sm text-zinc-500 mb-8">
                            {selectedStudent ? selectedStudent.name : t('recording')}
                        </p>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            {/* Pause/Resume */}
                            <button
                                onClick={isPaused ? resumeRecording : pauseRecording}
                                className="w-14 h-14 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                            >
                                {isPaused ? (
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                )}
                            </button>

                            {/* Stop (Complete) */}
                            <button
                                onClick={handleStopRecording}
                                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h12v12H6z" />
                                </svg>
                            </button>

                            {/* Cancel */}
                            <button
                                onClick={handleCancelRecording}
                                className="w-14 h-14 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Ready State - Main Recording Button */}
                {appState === 'ready' && (
                    <div className="text-center w-full max-w-sm">
                        {/* Student selector */}
                        <button
                            onClick={() => setShowStudentPicker(!showStudentPicker)}
                            className="mb-8 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                        >
                            {selectedStudent ? selectedStudent.name : t('selectStudent')}
                            <svg className="w-4 h-4 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Student picker dropdown */}
                        {showStudentPicker && students.length > 0 && (
                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-10 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        setShowStudentPicker(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
                                >
                                    {t('noStudent')}
                                </button>
                                {students.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => {
                                            setSelectedStudent(student);
                                            setShowStudentPicker(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                                            selectedStudent?.id === student.id
                                                ? 'bg-emerald-600/20 text-emerald-400'
                                                : 'text-white hover:bg-zinc-800'
                                        }`}
                                    >
                                        {student.name}
                                        {student.subject && (
                                            <span className="text-zinc-500 ml-2">{student.subject}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Big record button */}
                        <button
                            onClick={handleStartRecording}
                            className="w-40 h-40 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center mx-auto transition-all hover:scale-105 shadow-lg shadow-emerald-600/20"
                        >
                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        </button>

                        <p className="text-zinc-500 text-sm mt-6">{t('tapToStart')}</p>

                        {/* Last lesson preview */}
                        {lastLesson && (
                            <Link
                                href="/lessons"
                                className="block mt-10 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left hover:border-zinc-700 transition-colors"
                            >
                                <p className="text-xs text-zinc-500 mb-1">{t('lastLesson')}</p>
                                <p className="text-sm text-white line-clamp-2">
                                    {lastLesson.summary || 'Lesson recorded'}
                                </p>
                                {lastLesson.student_name && (
                                    <p className="text-xs text-zinc-600 mt-2">{lastLesson.student_name}</p>
                                )}
                            </Link>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            {appState === 'ready' && (
                <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0b] border-t border-zinc-800/50 pb-safe">
                    <div className="max-w-lg mx-auto px-8 py-4 flex items-center justify-around">
                        <Link href="/dashboard" className="flex flex-col items-center text-emerald-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-xs mt-1">{tNav('home')}</span>
                        </Link>
                        <Link href="/lessons" className="flex flex-col items-center text-zinc-500 hover:text-white transition-colors">
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
            )}
        </div>
    );
}
