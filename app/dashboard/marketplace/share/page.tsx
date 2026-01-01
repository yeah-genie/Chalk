'use client';

import React, { useState, useEffect } from 'react';
import { Share2, ChevronLeft, BookOpen, Tag, Globe, Lock, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSubjects } from '@/lib/actions/crud';
import { shareCurriculum } from '@/lib/actions/curriculum';

const CATEGORIES = [
    { id: 'math', name: 'Mathematics', icon: '📐' },
    { id: 'physics', name: 'Physics', icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
    { id: 'biology', name: 'Biology', icon: '🧬' },
    { id: 'sat', name: 'SAT Prep', icon: '📝' },
    { id: 'act', name: 'ACT Prep', icon: '📋' },
    { id: 'language', name: 'Languages', icon: '🌐' },
    { id: 'other', name: 'Other', icon: '📚' },
];

export default function ShareCurriculumPage() {
    const router = useRouter();
    const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [selectedSubject, setSelectedSubject] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    useEffect(() => {
        getSubjects().then(data => {
            setSubjects(data || []);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSubject || !name.trim()) {
            setError('Please select a subject and enter a name');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await shareCurriculum({
                subjectId: selectedSubject,
                name: name.trim(),
                description: description.trim() || undefined,
                category: category || undefined,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                isPublic,
            });

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard/marketplace');
                }, 2000);
            } else {
                setError(result.error || 'Failed to share curriculum');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-[#10b981]/20 p-6 rounded-full inline-block mb-6">
                        <Check size={48} className="text-[#10b981]" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Curriculum Shared!</h1>
                    <p className="text-white/40">Redirecting to marketplace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050510] text-white p-8">
            <div className="max-w-2xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/dashboard/marketplace"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white transition mb-8"
                >
                    <ChevronLeft size={20} />
                    Back to Marketplace
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-[#10b981] p-2 rounded-xl">
                        <Share2 size={24} className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Share Your Curriculum</h1>
                        <p className="text-white/40 text-sm">Help other tutors with your lesson plans</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject Selection */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
                        <label className="block mb-4">
                            <span className="text-sm font-bold flex items-center gap-2 mb-2">
                                <BookOpen size={16} className="text-[#10b981]" />
                                Select Subject to Share
                            </span>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]/50"
                                required
                            >
                                <option value="">Choose a subject...</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Details */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-4">
                        <label className="block">
                            <span className="text-sm font-bold mb-2 block">Curriculum Name</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., AP Calculus Complete Guide"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50"
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold mb-2 block">Description</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your curriculum and what makes it special..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50 resize-none h-24"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold mb-2 block">Category</span>
                            <div className="grid grid-cols-4 gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`p-3 rounded-xl text-center transition ${
                                            category === cat.id
                                                ? 'bg-[#10b981]/20 border-[#10b981] border'
                                                : 'bg-white/5 border border-transparent hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="text-xl">{cat.icon}</span>
                                        <p className="text-xs mt-1 text-white/60">{cat.name}</p>
                                    </button>
                                ))}
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold flex items-center gap-2 mb-2">
                                <Tag size={14} className="text-[#10b981]" />
                                Tags (comma separated)
                            </span>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., calculus, derivatives, integrals"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50"
                            />
                        </label>
                    </div>

                    {/* Visibility */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
                        <span className="text-sm font-bold mb-4 block">Visibility</span>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                className={`flex-1 p-4 rounded-xl flex items-center gap-3 transition ${
                                    isPublic
                                        ? 'bg-[#10b981]/20 border-[#10b981] border'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                }`}
                            >
                                <Globe size={20} className="text-[#10b981]" />
                                <div className="text-left">
                                    <p className="font-bold">Public</p>
                                    <p className="text-xs text-white/40">Anyone can find and use</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                className={`flex-1 p-4 rounded-xl flex items-center gap-3 transition ${
                                    !isPublic
                                        ? 'bg-amber-500/20 border-amber-500 border'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                }`}
                            >
                                <Lock size={20} className="text-amber-400" />
                                <div className="text-left">
                                    <p className="font-bold">Private</p>
                                    <p className="text-xs text-white/40">Only you can see</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#10b981] hover:bg-[#10b981]/90 disabled:bg-[#10b981]/50 text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Sharing...
                            </>
                        ) : (
                            <>
                                <Share2 size={20} />
                                Share Curriculum
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
