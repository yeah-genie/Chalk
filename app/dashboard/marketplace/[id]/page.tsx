import React from 'react';
import { getCurriculumDetail } from "@/lib/actions/curriculum";
import { Download, Star, Users, BookOpen, ChevronLeft, ChevronDown, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import DownloadButton from './DownloadButton';
import RatingSection from './RatingSection';

export const dynamic = 'force-dynamic';

export default async function CurriculumDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getCurriculumDetail(id);

    if (!result.success || !result.curriculum) {
        return (
            <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Curriculum Not Found</h1>
                    <p className="text-white/40 mb-6">{result.error}</p>
                    <Link
                        href="/dashboard/marketplace"
                        className="inline-block bg-[#10b981] text-black font-bold py-2 px-6 rounded-xl"
                    >
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const { curriculum, userCount } = result;
    const data = curriculum.curriculum_data;

    // 통계 계산
    const moduleCount = data?.modules?.length || 0;
    const unitCount = data?.modules?.reduce((sum, m) => sum + (m.units?.length || 0), 0) || 0;
    const topicCount = data?.modules?.reduce(
        (sum, m) => sum + m.units?.reduce((s, u) => s + (u.topics?.length || 0), 0) || 0, 0
    ) || 0;

    return (
        <div className="min-h-screen bg-[#050510] text-white p-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/dashboard/marketplace"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white transition mb-8"
                >
                    <ChevronLeft size={20} />
                    Back to Marketplace
                </Link>

                {/* Header */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#10b981]/20 text-[#10b981]">
                                    {curriculum.subject_category || 'General'}
                                </span>
                                {curriculum.owner?.name && (
                                    <span className="text-xs text-white/40">
                                        by {curriculum.owner.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-black mb-4">{curriculum.name}</h1>

                            {curriculum.description && (
                                <p className="text-white/60 mb-6">{curriculum.description}</p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-[#10b981]">{moduleCount}</p>
                                    <p className="text-xs text-white/40">Modules</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-400">{unitCount}</p>
                                    <p className="text-xs text-white/40">Units</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-purple-400">{topicCount}</p>
                                    <p className="text-xs text-white/40">Topics</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-amber-400">{userCount || curriculum.download_count}</p>
                                    <p className="text-xs text-white/40">Tutors Using</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Card */}
                        <div className="md:w-72 bg-white/5 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-4 justify-center">
                                <div className="flex items-center gap-1">
                                    <Star size={20} className={curriculum.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                                    <span className="text-xl font-bold">
                                        {curriculum.rating > 0 ? curriculum.rating.toFixed(1) : '—'}
                                    </span>
                                </div>
                                <span className="text-white/30">•</span>
                                <div className="flex items-center gap-1 text-white/40">
                                    <Download size={16} />
                                    <span>{curriculum.download_count}</span>
                                </div>
                            </div>

                            <DownloadButton curriculumId={curriculum.id} curriculumName={curriculum.name} />

                            <p className="text-xs text-white/30 text-center">
                                Free to use and modify
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Structure */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 mb-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <BookOpen size={20} className="text-[#10b981]" />
                        Curriculum Structure
                    </h2>

                    <div className="space-y-4">
                        {data?.modules?.map((module, moduleIdx) => (
                            <details key={module.id} className="group" open={moduleIdx === 0}>
                                <summary className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl hover:bg-white/10 transition list-none">
                                    <ChevronDown size={20} className="text-white/40 group-open:rotate-180 transition-transform" />
                                    <span className="font-bold">{module.name}</span>
                                    <span className="text-xs text-white/30 ml-auto">
                                        {module.units?.length || 0} units
                                    </span>
                                </summary>

                                <div className="pl-8 pt-4 space-y-3">
                                    {module.units?.map(unit => (
                                        <div key={unit.id} className="border-l-2 border-white/10 pl-4">
                                            <p className="font-medium text-white/80">{unit.name}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {unit.topics?.map(topic => (
                                                    <span
                                                        key={topic.id}
                                                        className="text-xs px-2 py-1 bg-white/5 rounded-lg text-white/50"
                                                    >
                                                        {topic.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Rating Section */}
                <RatingSection curriculumId={curriculum.id} currentRating={curriculum.rating} ratingCount={curriculum.rating_count} />

                {/* Tags */}
                {curriculum.tags && curriculum.tags.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-bold text-white/40 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {curriculum.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/60">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
