'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

interface Student {
    id: string;
    name: string;
    subject: string;
    grade: string;
    goal: string;
    parent_contact: string;
    created_at: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        grade: '',
        goal: '',
        parent_contact: '',
    });

    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setStudents(data);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingStudent) {
            // Update
            const { error } = await supabase
                .from('students')
                .update(formData)
                .eq('id', editingStudent.id);

            if (!error) {
                fetchStudents();
                closeModal();
            }
        } else {
            // Create
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) return;

            const { error } = await supabase
                .from('students')
                .insert({ ...formData, user_id: user.user.id });

            if (!error) {
                fetchStudents();
                closeModal();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 이 학생을 삭제하시겠습니까?')) return;

        const { error } = await supabase.from('students').delete().eq('id', id);
        if (!error) {
            fetchStudents();
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
        });
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingStudent(null);
        setFormData({ name: '', subject: '', grade: '', goal: '', parent_contact: '' });
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
                    <div className="text-center py-16 text-zinc-500">로딩 중...</div>
                ) : students.length === 0 ? (
                    <div className="text-center py-16">
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
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-emerald-500/30 transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">{student.name}</h2>
                                        <div className="flex gap-3 mt-2 text-sm text-zinc-400">
                                            {student.subject && <span>📚 {student.subject}</span>}
                                            {student.grade && <span>🎓 {student.grade}</span>}
                                        </div>
                                        {student.goal && (
                                            <p className="mt-2 text-sm text-zinc-500">🎯 {student.goal}</p>
                                        )}
                                        {student.parent_contact && (
                                            <p className="mt-1 text-sm text-zinc-600">📞 {student.parent_contact}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(student)}
                                            className="px-3 py-1.5 text-xs bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0a0a0b] rounded-2xl p-6 w-full max-w-md border border-white/[0.08]">
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
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none"
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
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none"
                                        placeholder="수학"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">학년</label>
                                    <input
                                        type="text"
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none"
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
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none"
                                    placeholder="수능 1등급"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">학부모 연락처</label>
                                <input
                                    type="text"
                                    value={formData.parent_contact}
                                    onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:border-emerald-500 outline-none"
                                    placeholder="010-1234-5678"
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
                    </div>
                </div>
            )}
        </div>
    );
}
