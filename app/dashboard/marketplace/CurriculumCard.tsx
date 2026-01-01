'use client';

import React from 'react';
import { Download, Star, Users, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { SharedCurriculum } from '@/lib/types/database';

interface Props {
    curriculum: SharedCurriculum;
}

export default function CurriculumCard({ curriculum }: Props) {
    // 모듈, 유닛, 토픽 개수 계산
    const moduleCount = curriculum.curriculum_data?.modules?.length || 0;
    const unitCount = curriculum.curriculum_data?.modules?.reduce(
        (sum, m) => sum + (m.units?.length || 0), 0
    ) || 0;
    const topicCount = curriculum.curriculum_data?.modules?.reduce(
        (sum, m) => sum + m.units?.reduce(
            (s, u) => s + (u.topics?.length || 0), 0
        ) || 0, 0
    ) || 0;

    // 카테고리 배지 색상
    const categoryColors: Record<string, string> = {
        math: 'bg-blue-500/20 text-blue-400',
        physics: 'bg-purple-500/20 text-purple-400',
        sat: 'bg-amber-500/20 text-amber-400',
        chemistry: 'bg-green-500/20 text-green-400',
        biology: 'bg-pink-500/20 text-pink-400',
    };

    const categoryClass = categoryColors[curriculum.subject_category?.toLowerCase() || ''] || 'bg-white/10 text-white/60';

    return (
        <Link
            href={`/dashboard/marketplace/${curriculum.id}`}
            className="block bg-[#18181b] border border-[#27272a] rounded-2xl p-6 hover:border-[#10b981]/50 transition group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${categoryClass}`}>
                            {curriculum.subject_category || 'General'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-[#10b981] transition">
                        {curriculum.name}
                    </h3>
                </div>
                <ChevronRight size={20} className="text-white/20 group-hover:text-[#10b981] transition" />
            </div>

            {/* Description */}
            {curriculum.description && (
                <p className="text-sm text-white/50 mb-4 line-clamp-2">
                    {curriculum.description}
                </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {moduleCount} Modules
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    {unitCount} Units
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    {topicCount} Topics
                </span>
            </div>

            {/* Tags */}
            {curriculum.tags && curriculum.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {curriculum.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/40">
                            #{tag}
                        </span>
                    ))}
                    {curriculum.tags.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 text-white/30">
                            +{curriculum.tags.length - 3} more
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <Star size={14} className={curriculum.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                        <span className="text-sm font-bold">
                            {curriculum.rating > 0 ? curriculum.rating.toFixed(1) : '—'}
                        </span>
                        {curriculum.rating_count > 0 && (
                            <span className="text-xs text-white/30">({curriculum.rating_count})</span>
                        )}
                    </div>

                    {/* Downloads */}
                    <div className="flex items-center gap-1 text-white/40">
                        <Download size={14} />
                        <span className="text-sm">{curriculum.download_count || 0}</span>
                    </div>
                </div>

                {/* Users using */}
                <div className="flex items-center gap-1 text-[#10b981] text-xs font-medium">
                    <Users size={12} />
                    <span>{curriculum.download_count || 0} tutors</span>
                </div>
            </div>
        </Link>
    );
}
