import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import { Snowflake, ArrowRight, Activity, Lightbulb, Clock, BarChart2, Globe, Zap, Sparkles } from 'lucide-react';
import { TriggerType, IdeaStatus } from '../types';
import { analyzeSmartWake } from '../services/geminiService';

interface SmartWakeRecommendation {
  ideaId: string;
  score: number;
  reason: string;
  suggestedAction: string;
}

const Dashboard: React.FC = () => {
  const { currentUser, ideas, metrics, activities, markActivityAsRead, getSmartThawRecommendations } = useAppContext();
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState<SmartWakeRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Data
  const frozenIdeas = ideas.filter(i => i.status === IdeaStatus.Frozen || i.is_zombie);
  const recentFrozen = [...frozenIdeas].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3);
  const recentIdeas = [...ideas].filter(i => !i.is_zombie && i.status !== IdeaStatus.Frozen).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);
  const hotIdeas = [...ideas].sort((a, b) => (b.votes || 0) - (a.votes || 0)).filter(i => (i.votes || 0) > 0).slice(0, 3);

  // Load AI recommendations
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

  const handleActivityClick = (activityId: string, type: string, entityId: string) => {
    markActivityAsRead(activityId);
    if (type === 'Idea') navigate(`/ideas/${entityId}`);
  };

  // Show EmptyState if no ideas at all
  if (ideas.length === 0) {
    return <EmptyState type="dashboard" />;
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-auto">
      {/* Header - Landing 스타일 연결 */}
      <div className="flex-shrink-0 rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Snowflake className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {greeting()}, {currentUser?.name || 'there'}
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} • {frozenIdeas.length} ideas frozen
            </p>
          </div>
          <button onClick={() => navigate('/ideas')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
            <Lightbulb className="w-4 h-4" /> View Ideas
          </button>
        </div>
      </div>

      {/* 🔥 Hot Ideas */}
      {hotIdeas.length > 0 && (
        <div className="flex-shrink-0 rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" style={{ color: '#ef4444' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>🔥 Hot Ideas</h2>
          </div>
          <div className="space-y-2">
            {hotIdeas.map((idea, index) => (
              <div key={idea.idea_id}
                onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                className="glass rounded-xl p-3 cursor-pointer hover:scale-[1.01] transition-all flex items-center gap-3">
                <span className="text-lg font-bold" style={{ color: index === 0 ? '#ef4444' : 'var(--text-muted)' }}>{index + 1}</span>
                <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</span>
                <span className="text-sm font-bold" style={{ color: '#22c55e' }}>▲ {idea.votes || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🧊 Cryo Chamber */}
      <div className="flex-shrink-0 rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Snowflake className="w-6 h-6" style={{ color: '#0ea5e9' }} />
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Cryo Chamber</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{frozenIdeas.length} ideas frozen</p>
            </div>
          </div>
          <button onClick={() => navigate('/ideas?filter=frozen')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: '#0ea5e9', color: 'white' }}>
            View <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {recentFrozen.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {recentFrozen.map(idea => (
              <div key={idea.idea_id}
                onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                className="glass p-3 rounded-xl cursor-pointer hover:scale-[1.02] transition-all"
                style={{ borderLeft: '3px solid #0ea5e9' }}>
                <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Wake + Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
        {/* AI Smart Wake */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Smart Wake</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34, 211, 238, 0.2)', color: 'var(--accent)' }}>AI</span>
            </div>
            {frozenIdeas.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{frozenIdeas.length} frozen</span>
            )}
          </div>
          {isLoadingAI ? (
            <div className="text-center py-8">
              <div className="relative w-12 h-12 mx-auto mb-3">
                <Sparkles className="w-12 h-12 animate-pulse" style={{ color: 'var(--accent)' }} />
                <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: 'var(--accent)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Analyzing your frozen ideas...</p>
            </div>
          ) : aiRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>No wake recommendations</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Freeze some ideas to get AI suggestions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiRecommendations.slice(0, 3).map((rec, index) => {
                const idea = ideas.find(i => i.idea_id === rec.ideaId);
                if (!idea) return null;
                return (
                  <div key={rec.ideaId} onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                    className="group p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: index === 0
                        ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)'
                        : 'rgba(14, 165, 233, 0.08)',
                      border: index === 0 ? '1px solid rgba(34, 211, 238, 0.3)' : '1px solid rgba(14, 165, 233, 0.2)'
                    }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {index === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Top Pick</span>}
                          <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</h3>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--accent)' }}>{rec.reason}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-lg font-bold" style={{ color: rec.score >= 70 ? '#22c55e' : rec.score >= 50 ? '#eab308' : 'var(--text-muted)' }}>
                          {rec.score}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>score</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rec.suggestedAction}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Triggers */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Smart Triggers</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: '#0ea5e9' }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{triggerCounts.time}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Time</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <BarChart2 className="w-5 h-5 mx-auto mb-2" style={{ color: '#0ea5e9' }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{triggerCounts.metric}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Metric</div>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <Globe className="w-5 h-5 mx-auto mb-2" style={{ color: '#0ea5e9' }} />
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{triggerCounts.external}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>External</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ideas + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-shrink-0">
        <div className="lg:col-span-2 glass rounded-2xl">
          <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Ideas</h2>
            </div>
            <button onClick={() => navigate('/ideas')} className="text-sm" style={{ color: 'var(--accent)' }}>
              View All <ArrowRight className="w-4 h-4 inline" />
            </button>
          </div>
          <div className="p-4">
            {recentIdeas.length === 0 ? (
              <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No active ideas yet</p>
            ) : (
              <ul>
                {recentIdeas.map(idea => (
                  <li key={idea.idea_id}
                    className="p-3 mb-2 rounded-lg cursor-pointer hover:bg-white/5 flex items-center justify-between"
                    onClick={() => navigate(`/ideas/${idea.idea_id}`)}>
                    <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</span>
                    <StatusBadge status={idea.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl">
          <div className="flex items-center gap-2 p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <Activity className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Activity</h2>
          </div>
          <div className="p-4">
            {activities?.slice(0, 5).map(activity => (
              <div key={activity.activity_id}
                className="p-3 mb-2 rounded-lg cursor-pointer hover:bg-white/5"
                style={{ background: 'var(--bg-tertiary)' }}
                onClick={() => handleActivityClick(activity.activity_id, activity.entity_type, activity.entity_id)}>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{activity.entity_title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activity.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
