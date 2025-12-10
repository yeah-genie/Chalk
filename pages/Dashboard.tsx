import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import { Snowflake, ArrowRight, Activity, Lightbulb, Clock, BarChart2, Globe, Zap, Sparkles, Plus, TrendingUp } from 'lucide-react';
import { TriggerType, IdeaStatus } from '../types';
import { analyzeSmartWake } from '../services/geminiService';

interface SmartWakeRecommendation {
  ideaId: string;
  score: number;
  reason: string;
  suggestedAction: string;
}

const Dashboard: React.FC = () => {
  const { currentUser, ideas, metrics, activities, markActivityAsRead } = useAppContext();
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState<SmartWakeRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const frozenIdeas = ideas.filter(i => i.status === IdeaStatus.Frozen || i.is_zombie);
  const activeIdeas = ideas.filter(i => !i.is_zombie && i.status !== IdeaStatus.Frozen);
  const recentIdeas = [...activeIdeas].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const topVoted = [...ideas].sort((a, b) => (b.votes || 0) - (a.votes || 0)).filter(i => (i.votes || 0) > 0).slice(0, 3);

  useEffect(() => {
    const loadAI = async () => {
      if (frozenIdeas.length === 0) return;
      setIsLoadingAI(true);
      try {
        const recs = await analyzeSmartWake(frozenIdeas, metrics);
        setAiRecommendations(recs);
      } catch (e) {
        console.error('AI failed:', e);
      } finally {
        setIsLoadingAI(false);
      }
    };
    loadAI();
  }, [frozenIdeas.length, metrics.length]);

  const triggerCounts = {
    time: frozenIdeas.filter(i => i.trigger_type === TriggerType.Time).length,
    metric: frozenIdeas.filter(i => i.trigger_type === TriggerType.Metric).length,
    external: frozenIdeas.filter(i => i.trigger_type === TriggerType.External).length,
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (ideas.length === 0) {
    return <EmptyState type="dashboard" />;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6 pb-8">

        {/* Hero Header */}
        <div className="relative rounded-2xl p-8 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(34, 211, 238, 0.08) 100%)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10"
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {greeting()}, {currentUser?.name?.split(' ')[0] || 'there'} ❄️
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {ideas.length} ideas • {frozenIdeas.length} frozen • {activeIdeas.length} active
              </p>
            </div>
            <button onClick={() => navigate('/ideas?new=true')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 self-start"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
              <Plus className="w-4 h-4" /> New Idea
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
                <Lightbulb className="w-5 h-5" style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{ideas.length}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Ideas</div>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.2)' }}>
                <Snowflake className="w-5 h-5" style={{ color: '#0ea5e9' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{frozenIdeas.length}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Frozen</div>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#22c55e' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeIdeas.length}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Active</div>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)' }}>
                <Zap className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{triggerCounts.time + triggerCounts.metric + triggerCounts.external}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Triggers Set</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Smart Wake */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Smart Wake */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>AI Smart Wake</h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ideas ready to wake up</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {isLoadingAI ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 animate-pulse" style={{ color: 'var(--accent)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Analyzing...</p>
                  </div>
                ) : aiRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recommendations yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiRecommendations.slice(0, 3).map((rec, index) => {
                      const idea = ideas.find(i => i.idea_id === rec.ideaId);
                      if (!idea) return null;
                      return (
                        <div key={rec.ideaId} onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                          style={{ background: 'var(--bg-tertiary)', border: index === 0 ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                            style={{ background: rec.score >= 70 ? 'rgba(34,197,94,0.2)' : rec.score >= 50 ? 'rgba(234,179,8,0.2)' : 'var(--bg-secondary)', color: rec.score >= 70 ? '#22c55e' : rec.score >= 50 ? '#eab308' : 'var(--text-muted)' }}>
                            {rec.score}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {index === 0 && <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Top</span>}
                              <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</h3>
                            </div>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{rec.reason}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Ideas */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Ideas</h2>
                </div>
                <button onClick={() => navigate('/ideas')} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {recentIdeas.length === 0 ? (
                  <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>No active ideas</p>
                ) : (
                  recentIdeas.map(idea => (
                    <div key={idea.idea_id} onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                      className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-white/5 transition-all">
                      <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>{idea.title}</span>
                      <StatusBadge status={idea.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Triggers */}
            <div className="glass rounded-2xl p-5">
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Wake Triggers</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4" style={{ color: '#0ea5e9' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time-based</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{triggerCounts.time}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <BarChart2 className="w-4 h-4" style={{ color: '#22c55e' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Metric-based</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{triggerCounts.metric}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4" style={{ color: '#a855f7' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>External signal</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{triggerCounts.external}</span>
                </div>
              </div>
            </div>

            {/* Top Voted */}
            {topVoted.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  🔥 Top Voted
                </h2>
                <div className="space-y-2">
                  {topVoted.map((idea, i) => (
                    <div key={idea.idea_id} onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
                      style={{ background: 'var(--bg-tertiary)' }}>
                      <span className="text-lg font-bold w-6" style={{ color: i === 0 ? '#ef4444' : 'var(--text-muted)' }}>{i + 1}</span>
                      <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>{idea.title}</span>
                      <span className="text-sm font-bold" style={{ color: '#22c55e' }}>+{idea.votes}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="glass rounded-2xl p-5">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Activity
              </h2>
              <div className="space-y-2">
                {activities?.slice(0, 4).map(activity => (
                  <div key={activity.activity_id} className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                    <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{activity.entity_title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activity.action}</p>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
