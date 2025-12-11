import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { Snowflake, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { IdeaStatus } from '../types';
import { analyzeSmartWake } from '../services/geminiService';

interface SmartWakeRecommendation {
  ideaId: string;
  score: number;
  reason: string;
  suggestedAction: string;
}

const Dashboard: React.FC = () => {
  const { currentUser, ideas, metrics } = useAppContext();
  const navigate = useNavigate();
  const [aiRecommendations, setAiRecommendations] = useState<SmartWakeRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const frozenIdeas = ideas.filter(i => i.status === IdeaStatus.Frozen || i.is_zombie);
  const activeIdeas = ideas.filter(i => !i.is_zombie && i.status !== IdeaStatus.Frozen);
  const recentIdeas = [...ideas].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);

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
      <div className="max-w-3xl mx-auto space-y-6 pb-8">

        {/* Simple Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {greeting()}, {currentUser?.name?.split(' ')[0] || 'there'} ❄️
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {activeIdeas.length} active · {frozenIdeas.length} frozen
            </p>
          </div>
          <button onClick={() => navigate('/ideas?new=true')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
            <Plus className="w-4 h-4" /> New Idea
          </button>
        </div>

        {/* Weekly Review Prompt */}
        {frozenIdeas.length >= 3 && (
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'var(--accent-glow)', border: '1px solid rgba(34, 211, 238, 0.3)' }}>
            <div className="flex items-center gap-3">
              <Snowflake className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Review frozen ideas?
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {frozenIdeas.length} ideas waiting - consider thawing one
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/ideas?filter=frozen')}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
              Review
            </button>
          </div>
        )}

        {/* AI Smart Wake */}
        {frozenIdeas.length > 0 && (
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Ready to Wake</h2>
            </div>
            {isLoadingAI ? (
              <div className="text-center py-6">
                <Sparkles className="w-6 h-6 mx-auto animate-pulse" style={{ color: 'var(--accent)' }} />
              </div>
            ) : aiRecommendations.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No wake recommendations</p>
            ) : (
              <div className="space-y-2">
                {aiRecommendations.slice(0, 3).map((rec) => {
                  const idea = ideas.find(i => i.idea_id === rec.ideaId);
                  if (!idea) return null;
                  return (
                    <div key={rec.ideaId} onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
                      style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                        {rec.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{rec.reason}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Recent Ideas */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent</h2>
            <button onClick={() => navigate('/ideas')} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              View All →
            </button>
          </div>
          <div>
            {recentIdeas.map(idea => (
              <div key={idea.idea_id} onClick={() => navigate(`/ideas/${idea.idea_id}`)}
                className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-white/5 transition-all"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {idea.is_zombie && <Snowflake className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0ea5e9' }} />}
                  <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(idea.updated_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
