'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecording } from '@/services/recording';
import type { Student } from '@/lib/supabase/types';

type Mode = 'select' | 'recording' | 'manual' | 'processing' | 'success';

// 프리셋 태그들
const PROBLEM_TAGS = [
    { label: '계산실수', icon: '🔢' },
    { label: '개념이해', icon: '💭' },
    { label: '문제해석', icon: '📖' },
    { label: '시간부족', icon: '⏱️' },
    { label: '공식암기', icon: '📝' },
    { label: '응용력', icon: '🧩' },
];

const DIAGNOSIS_TAGS = [
    { label: '기초부족', icon: '📚' },
    { label: '부주의', icon: '👀' },
    { label: '연습부족', icon: '✏️' },
    { label: '개념혼동', icon: '🔄' },
    { label: '자신감부족', icon: '💪' },
    { label: '집중력', icon: '🎯' },
];

const SOLUTION_TAGS = [
    { label: '반복연습', icon: '🔁' },
    { label: '개념정리', icon: '📋' },
    { label: '유사문제', icon: '📑' },
    { label: '시각화', icon: '📊' },
    { label: '오답노트', icon: '📓' },
    { label: '격려', icon: '🌟' },
];

export default function NewLogPage() {
    const [mode, setMode] = useState<Mode>('select');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);

    // Manual mode states
    const [problemTags, setProblemTags] = useState<string[]>([]);
    const [problemDetail, setProblemDetail] = useState('');
    const [diagnosisTags, setDiagnosisTags] = useState<string[]>([]);
    const [diagnosisDetail, setDiagnosisDetail] = useState('');
    const [solutionTags, setSolutionTags] = useState<string[]>([]);
    const [solutionDetail, setSolutionDetail] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    // Recording hook
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

    // Load students
    useEffect(() => {
        async function loadStudents() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('students')
                .select('*')
                .eq('tutor_id', user.id)
                .eq('status', 'active')
                .order('name');

            setStudents(data || []);
        }
        loadStudents();
    }, [supabase]);

    const toggleTag = (tag: string, tags: string[], setTags: (tags: string[]) => void) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    // Start recording for selected student
    const handleStartRecording = async () => {
        const sessionId = await startRecording(selectedStudent?.id || null);
        if (sessionId) {
            setMode('recording');
        }
    };

    // Stop recording and process
    const handleStopRecording = async () => {
        setMode('processing');
        const recording = await stopRecording();

        if (recording) {
            // Wait for analysis to complete (simplified - in production use webhooks)
            setTimeout(() => {
                setMode('success');
                setTimeout(() => router.push('/dashboard'), 2000);
            }, 3000);
        } else {
            setError('녹음 저장에 실패했습니다.');
            setMode('select');
        }
    };

    // Manual submit
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (problemTags.length === 0 && diagnosisTags.length === 0 && solutionTags.length === 0) {
            setError('최소 하나의 태그를 선택해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('logs').insert({
            user_id: user.id,
            student_id: selectedStudent?.id || null,
            lesson_date: lessonDate,
            problem_tags: problemTags,
            problem_detail: problemDetail || null,
            diagnosis_tags: diagnosisTags,
            diagnosis_detail: diagnosisDetail || null,
            solution_tags: solutionTags,
            solution_detail: solutionDetail || null,
            auto_generated: false,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setMode('success');
            setTimeout(() => router.push('/dashboard'), 1500);
        }
    };

    return (
        <div className="min-h-screen relative">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#08080a]" />
                <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-radial from-emerald-500/[0.06] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-radial from-cyan-500/[0.04] via-transparent to-transparent" />
            </div>

            {/* Success overlay */}
            <AnimatePresence>
                {mode === 'success' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#08080a]/90 backdrop-blur-sm flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold text-white">기록 완료!</p>
                            <p className="text-zinc-500 mt-2">대시보드로 이동합니다</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Processing overlay */}
            <AnimatePresence>
                {mode === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#08080a]/90 backdrop-blur-sm flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold text-white">AI 분석 중...</p>
                            <p className="text-zinc-500 mt-2">수업 내용을 자동으로 분석하고 있어요</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#08080a]/80 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-[14px] font-medium">돌아가기</span>
                    </Link>
                    <span className="text-[14px] text-zinc-500">수업 기록</span>
                    <div className="w-20" />
                </div>
            </header>

            <main className="max-w-xl mx-auto px-5 py-8">
                {/* Recording Mode */}
                {mode === 'recording' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        {/* Recording indicator */}
                        <div className="relative inline-block mb-8">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}>
                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                    </svg>
                                </div>
                            </div>
                            {isRecording && (
                                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 animate-ping" />
                            )}
                        </div>

                        <p className="text-4xl font-bold text-white mb-2 font-mono tracking-wider">
                            {formattedDuration}
                        </p>
                        <p className="text-zinc-500 mb-8">
                            {selectedStudent ? `${selectedStudent.name} 수업 녹음 중` : '수업 녹음 중'}
                        </p>

                        <div className="flex justify-center gap-4">
                            {isRecording ? (
                                <button
                                    onClick={pauseRecording}
                                    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                </button>
                            ) : isPaused ? (
                                <button
                                    onClick={resumeRecording}
                                    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            ) : null}

                            <button
                                onClick={handleStopRecording}
                                className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all"
                            >
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h12v12H6z" />
                                </svg>
                            </button>

                            <button
                                onClick={async () => {
                                    await cancelRecording();
                                    setMode('select');
                                }}
                                className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-zinc-600 text-sm mt-8">
                            녹음이 끝나면 AI가 자동으로 수업을 분석합니다
                        </p>
                    </motion.div>
                )}

                {/* Select Mode - Zero Action UX */}
                {mode === 'select' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-[28px] font-bold text-white tracking-tight">수업 기록</h1>
                            <p className="text-zinc-500 mt-1">녹음만 하면 AI가 자동으로 기록해요</p>
                        </motion.div>

                        {/* Student selection */}
                        {students.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-6"
                            >
                                <p className="text-[13px] text-zinc-500 mb-3">학생 선택 (선택사항)</p>
                                <div className="flex flex-wrap gap-2">
                                    {students.map((student) => (
                                        <button
                                            key={student.id}
                                            onClick={() => setSelectedStudent(
                                                selectedStudent?.id === student.id ? null : student
                                            )}
                                            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${selectedStudent?.id === student.id
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {student.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Main CTA - Record Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mb-8"
                        >
                            <button
                                onClick={handleStartRecording}
                                className="group w-full py-16 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl transition-all"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-semibold text-white">수업 녹음 시작</span>
                                    <span className="text-sm text-zinc-500 mt-1">탭 한 번으로 자동 기록</span>
                                </div>
                            </button>
                        </motion.div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 h-px bg-white/[0.06]" />
                            <span className="text-[12px] text-zinc-600">또는</span>
                            <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>

                        {/* Manual option */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setMode('manual')}
                            className="w-full py-4 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] rounded-xl text-[14px] text-zinc-400 hover:text-white transition-all"
                        >
                            직접 기록하기 (수동)
                        </motion.button>
                    </>
                )}

                {/* Manual Mode */}
                {mode === 'manual' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <button
                                onClick={() => setMode('select')}
                                className="text-[13px] text-zinc-500 hover:text-white mb-4 flex items-center gap-1 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                뒤로
                            </button>
                            <h1 className="text-[28px] font-bold text-white tracking-tight">직접 기록</h1>
                            <p className="text-zinc-500 mt-1">탭 3번 + 한 줄이면 끝</p>
                        </motion.div>

                        <form onSubmit={handleManualSubmit} className="space-y-6">
                            {/* Date */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <input
                                    type="date"
                                    value={lessonDate}
                                    onChange={(e) => setLessonDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[15px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                />
                            </motion.div>

                            {/* Problem */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-gradient-to-br from-red-500/[0.08] to-transparent border border-red-500/10 rounded-2xl p-5"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <span className="text-red-400 text-[13px] font-bold">P</span>
                                    </div>
                                    <div>
                                        <span className="text-[15px] font-semibold text-red-400">Problem</span>
                                        <span className="text-[13px] text-zinc-500 ml-2">어떤 부분이 어려웠나요?</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {PROBLEM_TAGS.map((tag) => (
                                        <motion.button
                                            key={tag.label}
                                            type="button"
                                            onClick={() => toggleTag(tag.label, problemTags, setProblemTags)}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${problemTags.includes(tag.label)
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-300'
                                                }`}
                                        >
                                            <span>{tag.icon}</span>
                                            {tag.label}
                                        </motion.button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={problemDetail}
                                    onChange={(e) => setProblemDetail(e.target.value)}
                                    placeholder="상세 내용 (선택)"
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/[0.06] rounded-xl text-[14px] text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/30 transition-colors"
                                />
                            </motion.div>

                            {/* Diagnosis */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/10 rounded-2xl p-5"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                        <span className="text-orange-400 text-[13px] font-bold">D</span>
                                    </div>
                                    <div>
                                        <span className="text-[15px] font-semibold text-orange-400">Diagnosis</span>
                                        <span className="text-[13px] text-zinc-500 ml-2">왜 어려워했나요?</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {DIAGNOSIS_TAGS.map((tag) => (
                                        <motion.button
                                            key={tag.label}
                                            type="button"
                                            onClick={() => toggleTag(tag.label, diagnosisTags, setDiagnosisTags)}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${diagnosisTags.includes(tag.label)
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                    : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-300'
                                                }`}
                                        >
                                            <span>{tag.icon}</span>
                                            {tag.label}
                                        </motion.button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={diagnosisDetail}
                                    onChange={(e) => setDiagnosisDetail(e.target.value)}
                                    placeholder="상세 내용 (선택)"
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/[0.06] rounded-xl text-[14px] text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/30 transition-colors"
                                />
                            </motion.div>

                            {/* Solution */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/10 rounded-2xl p-5"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <span className="text-emerald-400 text-[13px] font-bold">S</span>
                                    </div>
                                    <div>
                                        <span className="text-[15px] font-semibold text-emerald-400">Solution</span>
                                        <span className="text-[13px] text-zinc-500 ml-2">어떻게 해결했나요?</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {SOLUTION_TAGS.map((tag) => (
                                        <motion.button
                                            key={tag.label}
                                            type="button"
                                            onClick={() => toggleTag(tag.label, solutionTags, setSolutionTags)}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all ${solutionTags.includes(tag.label)
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                    : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-300'
                                                }`}
                                        >
                                            <span>{tag.icon}</span>
                                            {tag.label}
                                        </motion.button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={solutionDetail}
                                    onChange={(e) => setSolutionDetail(e.target.value)}
                                    placeholder="상세 내용 (선택)"
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/[0.06] rounded-xl text-[14px] text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 transition-colors"
                                />
                            </motion.div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-[13px] bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        저장 중...
                                    </span>
                                ) : '기록 저장'}
                            </motion.button>
                        </form>
                    </>
                )}
            </main>
        </div>
    );
}
