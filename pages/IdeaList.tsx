import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IdeaStatus, Idea, Priority } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Search, Snowflake, Lightbulb, Slack, ThumbsUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

type FilterTab = 'all' | 'active' | 'frozen';

const IdeaList: React.FC = () => {
  const { ideas, updateIdea } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const filterParam = searchParams.get('filter') as FilterTab | null;
  const [activeFilter, setActiveFilter] = useState<FilterTab>(filterParam || 'all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (filterParam && ['all', 'active', 'frozen'].includes(filterParam)) {
      setActiveFilter(filterParam as FilterTab);
    }
  }, [filterParam]);

  const handleFilterChange = (filter: FilterTab) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', filter);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleFreeze = (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    updateIdea({ ...idea, is_zombie: true, status: IdeaStatus.Frozen, zombie_reason: 'Manual freeze', updated_at: new Date().toISOString() });
  };

  const handleThaw = (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    updateIdea({ ...idea, is_zombie: false, status: IdeaStatus.Active, zombie_reason: undefined, updated_at: new Date().toISOString() });
  };

  const filteredIdeas = ideas.filter(idea => {
    if (activeFilter === 'frozen' && idea.status !== IdeaStatus.Frozen && !idea.is_zombie) return false;
    if (activeFilter === 'active' && (idea.status === IdeaStatus.Frozen || idea.is_zombie)) return false;
    const matchesPriority = priorityFilter === 'All' || idea.priority === priorityFilter;
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <PageHeader
        icon={Lightbulb}
        title="Ideas"
        description="Manage your frozen ideas"
        action={
          <div className="flex gap-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-lg text-sm w-40 outline-none"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <Slack className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Add via Slack ❄️</span>
            </div>
          </div>
        }
      />

      {/* Tab Filters */}
      <div className="flex gap-1 px-1 py-1 rounded-xl glass flex-shrink-0" style={{ width: 'fit-content' }}>
        {[
          { key: 'all' as FilterTab, label: 'All', count: ideas.length },
          { key: 'active' as FilterTab, label: 'Active', count: ideas.filter(i => i.status !== IdeaStatus.Frozen && !i.is_zombie).length },
          { key: 'frozen' as FilterTab, label: '❄️ Frozen', count: ideas.filter(i => i.status === IdeaStatus.Frozen || i.is_zombie).length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeFilter === tab.key ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
              color: activeFilter === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              border: activeFilter === tab.key ? '1px solid rgba(34, 211, 238, 0.3)' : '1px solid transparent'
            }}>
            {tab.label} <span className="ml-1 opacity-70">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      <div className="glass p-3 rounded-xl flex gap-2 items-center flex-shrink-0">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Priority:</span>
        {(['All', 'High', 'Medium', 'Low'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: priorityFilter === p ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: priorityFilter === p ? 'var(--bg-primary)' : 'var(--text-secondary)'
            }}>
            {p}
          </button>
        ))}
      </div>

      {/* Ideas List */}
      <div className="flex-1 overflow-auto space-y-2">
        {filteredIdeas.length === 0 ? (
          <EmptyState page="ideas" />
        ) : (
          filteredIdeas.map(idea => (
            <div
              key={idea.idea_id}
              onClick={() => navigate(`/ideas/${idea.idea_id}`)}
              className="glass p-4 rounded-xl cursor-pointer hover:border-cyan-500/30 transition-all"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {idea.is_zombie && <Snowflake className="w-4 h-4 text-cyan-400" />}
                    <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{idea.title}</h3>
                  </div>
                  <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{idea.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <PriorityBadge priority={idea.priority} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{idea.category}</span>
                    {(idea.votes || 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#f97316' }}>
                        <ThumbsUp className="w-3 h-3" /> {idea.votes}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={idea.status} />
                  {idea.is_zombie ? (
                    <button
                      onClick={(e) => handleThaw(e, idea)}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent)', border: '1px solid rgba(34, 211, 238, 0.3)' }}
                    >
                      Thaw
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleFreeze(e, idea)}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      Freeze
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IdeaList;
