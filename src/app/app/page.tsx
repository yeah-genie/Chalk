"use client";

import Link from "next/link";
import { useIdeasStore } from "../store/ideas";
import { statusConfig } from "../types";

export default function Dashboard() {
  const ideas = useIdeasStore((state) => state.ideas);
  
  const stats = {
    inbox: ideas.filter((i) => i.status === "inbox").length,
    evaluating: ideas.filter((i) => i.status === "evaluating").length,
    experiment: ideas.filter((i) => i.status === "experiment").length,
    launched: ideas.filter((i) => i.status === "launched").length,
    killed: ideas.filter((i) => i.status === "killed").length,
  };
  
  const recentIdeas = ideas.slice(0, 5);
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">Overview of your idea pipeline</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                {statusConfig[status as keyof typeof statusConfig].label}
              </span>
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: statusConfig[status as keyof typeof statusConfig].color }}
              />
            </div>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">{count}</p>
          </div>
        ))}
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/app/ideas" className="card p-5 hover:border-[var(--accent)] transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              Add new idea
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">Capture a new idea before you forget</p>
        </Link>
        
        <Link href="/app/board" className="card p-5 hover:border-[var(--accent)] transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              View board
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">Manage your experiment pipeline</p>
        </Link>
      </div>
      
      {/* Recent ideas */}
      <div className="card">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Recent ideas</h2>
          <Link href="/app/ideas" className="text-xs text-[var(--accent)] hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recentIdeas.map((idea) => (
            <div key={idea.id} className="p-4 hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1 truncate">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{idea.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {idea.avgScore && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                      {idea.avgScore}%
                    </span>
                  )}
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      color: statusConfig[idea.status].color,
                      background: `${statusConfig[idea.status].color}15`
                    }}
                  >
                    {statusConfig[idea.status].label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

