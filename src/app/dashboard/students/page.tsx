'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student } from '@/lib/supabase/types';

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        grade: '',
        goal: '',
        parent_contact: '',
        notes: '',
    });

    const supabase = createClient();

    useEffect(() => {
        initializeUser();
    }, []);

    const initializeUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            fetchStudents(user.id);
        } else {
            setIsLoading(false);
        }
    };

    const fetchStudents = async (tutorId: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('tutor_id', tutorId)  // FIXED: Filter by tutor_id
            .order('created_at', { ascending: false });

        if (!error && data) {
            setStudents(data);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) return;

        if (editingStudent) {
            // Update
            const { error } = await supabase
                .from('students')
                .update({
                    name: formData.name,
                    subject: formData.subject || null,
                    grade: formData.grade || null,
                    goal: formData.goal || null,
                    parent_contact: formData.parent_contact || null,
                    notes: formData.notes || null,
                })
                .eq('id', editingStudent.id);

            if (!error) {
                fetchStudents(userId);
                closeModal();
            }
        } else {
            // Create - FIXED: Use tutor_id instead of user_id
            const { error } = await supabase
                .from('students')
                .insert({
                    tutor_id: userId,  // FIXED
                    name: formData.name,
                    subject: formData.subject || null,
                    grade: formData.grade || null,
                    goal: formData.goal || null,
                    parent_contact: formData.parent_contact || null,
                    notes: formData.notes || null,
                    status: 'active',
                });

            if (!error) {
                fetchStudents(userId);
                closeModal();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 이 학생을 삭제하시겠습니까?')) return;
        if (!userId) return;

        const { error } = await supabase.from('students').delete().eq('id', id);
        if (!error) {
            fetchStudents(userId);
        }
    };

    const toggleStatus = async (student: Student) => {
        if (!userId) return;
        const newStatus = student.status === 'active' ? 'paused' : 'active';

        const { error } = await supabase
            .from('students')
            .update({ status: newStatus })
            .eq('id', student.id);

        if (!error) {
            fetchStudents(userId);
        }
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            subject: student.subject || '',
            grade: student.grade || '',
            goal: student.goal || '',
            parent_contact: student.parent_contact || '',
            notes: student.notes || '',
        });
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingStudent(null);
        setFormData({ name: '', subject: '', grade: '', goal: '', parent_contact: '', notes: '' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-full">활성</span>;
            case 'paused':
                return <span className="px-2 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 rounded-full">일시정지</span>;
            case 'completed':
                return <span className="px-2 py-0.5 text-[10px] bg-zinc-500/20 text-zinc-400 rounded-full">완료</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#050506] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050506]/80 backdrop-blur-2xl border-b border-white/[0.04]">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-500 hover:text-white transition">
                            ← 대시보드
                        </Link>
                        <h1 className="text-lg font-semibold">학생 관리</h1>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition"
                    >
                        + 학생 추가
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="text-center py-16 text-zinc-500">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        로딩 중...
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-zinc-500 mb-4">아직 등록된 학생이 없습니다</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition"
                        >
                            첫 학생 추가하기
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {students.map((student, index) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-emerald-500/30 transition group"
                            >
                                <div className="flex items-start justify-between">
                                    <Link href={`/dashboard/students/${student.id}`} className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                                                student.status === 'active'
                                                    ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                                                    : 'bg-zinc-700'
                                            }`}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-lg font-semibold group-hover:text-emerald-400 transition">{student.name}</h2>
                                                    {getStatusBadge(student.status)}
                                                </div>
                                                <div className="flex gap-3 mt-1 text-sm text-zinc-400">
                                                    {student.subject && <span>{student.subject}</span>}
                                                    {student.grade && <span>· {student.grade}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {student.goal && (
                                            <p className="mt-3 text-sm text-zinc-500 ml-[52px]">목표: {student.goal}</p>
                                        )}
                                        {student.parent_contact && (
                                            <p className="mt-1 text-sm text-zinc-600 ml-[52px]">학부모: {student.parent_contact}</p>
                                        )}
                                    </Link>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleStatus(student); }}
                                            className={`px-3 py-1.5 text-xs rounded-lg transition ${
                                                student.status === 'active'
                                                    ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                            }`}
                                        >
                                            {student.status === 'active' ? '일시정지' : '활성화'}
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); openEditModal(student); }}
                                            className="px-3 py-1.5 text-xs bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleDelete(student.id); }}
                                            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0b] rounded-2xl p-6 w-full max-w-md border border-white/[0.08]"
                        >
                            <h2 className="text-xl font-semibold mb-6">
                                {editingStudent ? '학생 수정' : '새 학생 추가'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">이름 *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none transition"
                                        required
                                        placeholder="김지민"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">과목</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none transition"
                                            placeholder="수학"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">학년</label>
                                        <input
                                            type="text"
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none transition"
                                            placeholder="고1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">목표</label>
                                    <input
                                        type="text"
                                        value={formData.goal}
                                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none transition"
                                        placeholder="수능 1등급"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">학부모 연락처 (알림 발송용)</label>
                                    <input
                                        type="text"
                                        value={formData.parent_contact}
                                        onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none transition"
                                        placeholder="010-1234-5678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">메모</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none transition resize-none"
                                        rows={2}
                                        placeholder="학생에 대한 메모..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition"
                                    >
                                        {editingStudent ? '수정' : '추가'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
