import React from 'react';
import { getPublicCurricula, getCurriculumCategories } from "@/lib/actions/curriculum";
import { Store, Download, Star, Users, Search, Filter, BookOpen, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import CurriculumCard from './CurriculumCard';
import SearchBar from './SearchBar';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const category = params.category;
    const search = params.search;
    const sortBy = (params.sort as 'downloads' | 'rating' | 'recent') || 'recent';

    const [curriculaResult, categoriesResult] = await Promise.all([
        getPublicCurricula({ category, search, sortBy, limit: 20 }),
        getCurriculumCategories(),
    ]);

    const curricula = curriculaResult.curricula || [];
    const categories = categoriesResult.categories || [];
    const totalCount = curriculaResult.total || 0;

    return (
        <div className="min-h-screen bg-[#050510] text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#10b981] p-2 rounded-xl">
                        <Store size={24} className="text-black" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Curriculum Marketplace</h1>
                </div>
                <p className="text-white/50 text-lg max-w-2xl">
                    Discover and share curricula created by tutors worldwide.
                    Import ready-made lesson plans or share your own.
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Search */}
                    <SearchBar />

                    {/* Categories */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Filter size={16} className="text-[#10b981]" />
                            Categories
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href="/dashboard/marketplace"
                                className={`block px-3 py-2 rounded-xl text-sm transition ${!category ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-white/60 hover:bg-white/5'}`}
                            >
                                All Categories
                                <span className="float-right text-white/30">{totalCount}</span>
                            </Link>
                            {categories.map(cat => (
                                <Link
                                    key={cat.category}
                                    href={`/dashboard/marketplace?category=${encodeURIComponent(cat.category)}`}
                                    className={`block px-3 py-2 rounded-xl text-sm transition ${category === cat.category ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-white/60 hover:bg-white/5'}`}
                                >
                                    {cat.category}
                                    <span className="float-right text-white/30">{cat.count}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#10b981]" />
                            Sort By
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href={`/dashboard/marketplace?${category ? `category=${category}&` : ''}sort=recent`}
                                className={`block px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition ${sortBy === 'recent' ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-white/60 hover:bg-white/5'}`}
                            >
                                <Clock size={14} /> Most Recent
                            </Link>
                            <Link
                                href={`/dashboard/marketplace?${category ? `category=${category}&` : ''}sort=downloads`}
                                className={`block px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition ${sortBy === 'downloads' ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-white/60 hover:bg-white/5'}`}
                            >
                                <Download size={14} /> Most Downloads
                            </Link>
                            <Link
                                href={`/dashboard/marketplace?${category ? `category=${category}&` : ''}sort=rating`}
                                className={`block px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition ${sortBy === 'rating' ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-white/60 hover:bg-white/5'}`}
                            >
                                <Star size={14} /> Highest Rated
                            </Link>
                        </div>
                    </div>

                    {/* Share CTA */}
                    <div className="bg-gradient-to-br from-[#10b981]/20 to-transparent border border-[#10b981]/30 rounded-2xl p-6">
                        <h3 className="font-bold mb-2">Share Your Curriculum</h3>
                        <p className="text-sm text-white/50 mb-4">
                            Created a great lesson plan? Share it with the community!
                        </p>
                        <Link
                            href="/dashboard/marketplace/share"
                            className="block text-center bg-[#10b981] text-black font-bold py-2 px-4 rounded-xl hover:bg-[#10b981]/90 transition"
                        >
                            Share Now
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">
                            {search ? (
                                <>Search results for "{search}"</>
                            ) : category ? (
                                <>{category} Curricula</>
                            ) : (
                                <>All Curricula</>
                            )}
                            <span className="text-white/40 font-normal ml-2">({curricula.length})</span>
                        </h2>
                    </div>

                    {/* Grid */}
                    {curricula.length === 0 ? (
                        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-16 text-center">
                            <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Curricula Found</h3>
                            <p className="text-white/40 mb-6">
                                {search ? "Try a different search term" : "Be the first to share a curriculum!"}
                            </p>
                            <Link
                                href="/dashboard/marketplace/share"
                                className="inline-block bg-[#10b981] text-black font-bold py-2 px-6 rounded-xl hover:bg-[#10b981]/90 transition"
                            >
                                Share Your Curriculum
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {curricula.map(curriculum => (
                                <CurriculumCard key={curriculum.id} curriculum={curriculum} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
