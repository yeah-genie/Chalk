import React from 'react';
import { Eye, Mail, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { getShareAnalytics } from '@/lib/actions/parent-sharing';

export default async function ParentEngagementCard() {
    const result = await getShareAnalytics();

    if (!result.success) {
        return null;
    }

    const { stats, shares } = result;

    // 최근 열람 (최근 7일)
    const recentViews = shares?.filter(s => {
        if (!s.last_viewed_at) return false;
        const viewDate = new Date(s.last_viewed_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return viewDate > weekAgo;
    }).length || 0;

    return (
        <div className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#10b981]" />
                    <h2 className="font-semibold">Parent Engagement</h2>
                </div>
                <span className="text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">
                    Live
                </span>
            </div>

            <div className="p-5 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Mail size={14} className="text-blue-400" />
                            <span className="text-xl font-bold">{stats.emailsSent}</span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Reports Sent</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye size={14} className="text-purple-400" />
                            <span className="text-xl font-bold">{stats.totalViews}</span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Views</p>
                    </div>
                </div>

                {/* Engagement Rate */}
                {stats.emailsSent > 0 && (
                    <div className="bg-gradient-to-r from-[#10b981]/10 to-transparent rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">View Rate</span>
                            <span className="text-lg font-bold text-[#10b981]">
                                {Math.round((stats.totalViews / stats.emailsSent) * 100)}%
                            </span>
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#10b981]"
                                style={{ width: `${Math.min(100, (stats.totalViews / stats.emailsSent) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                {recentViews > 0 && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <TrendingUp size={14} className="text-[#10b981]" />
                        <span>{recentViews} reports viewed this week</span>
                    </div>
                )}

                {stats.totalShares === 0 && (
                    <div className="text-center py-4 text-white/30 text-sm">
                        <p>No reports shared yet</p>
                        <p className="text-xs mt-1">Complete a session to auto-share with parents</p>
                    </div>
                )}
            </div>
        </div>
    );
}
