
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IdeaStatus, Priority, Category, Idea, TriggerType, IdeaSource } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Plus, Search, Filter, ThumbsUp, ThumbsDown, Snowflake, X, Lightbulb, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

type FilterTab = 'all' | 'active' | 'frozen';

const IdeaList: React.FC = () => {
  const { ideas, addIdea, updateIdea, voteIdea, currentUser, currentWorkspace } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter tab from URL
  const filterParam = searchParams.get('filter') as FilterTab | null;
  const [activeFilter, setActiveFilter] = useState<FilterTab>(filterParam || 'all');

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
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Open modal when navigating with ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsAddModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [newIdeaPriority, setNewIdeaPriority] = useState<Priority>(Priority.Medium);
  const [newIdeaCategory, setNewIdeaCategory] = useState<Category>(Category.Feature);
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setNewIdeaTitle('');
    setNewIdeaDesc('');
    setNewIdeaPriority(Priority.Medium);
    setNewIdeaCategory(Category.Feature);
    setNewIdeaTags([]);
    setTagInput('');
    setDuplicateWarning(null);
  };

  // Open modal with fresh state
  const handleOpenModal = () => {
    setModalKey(prev => prev + 1);
    setNewIdeaTitle('');
    setNewIdeaDesc('');
    setNewIdeaPriority(Priority.Medium);
    setNewIdeaCategory(Category.Feature);
    setDuplicateWarning(null);
    setIsAddModalOpen(true);
  };

  const filteredIdeas = ideas.filter(idea => {
    // Tab filter
    if (activeFilter === 'frozen' && idea.status !== IdeaStatus.Frozen && !idea.is_zombie) return false;
    if (activeFilter === 'active' && (idea.status === IdeaStatus.Frozen || idea.is_zombie)) return false;

    const matchesPriority = priorityFilter === 'All' || idea.priority === priorityFilter;
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const checkDuplicates = (title: string) => {
    if (title.length < 3) { setDuplicateWarning(null); return; }
    const match = ideas.find(i => i.title.toLowerCase().includes(title.toLowerCase()));
    setDuplicateWarning(match ? `Similar to: "${match.title}"` : null);
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    const newIdea: Idea = {
      idea_id: uuidv4(),
      title: newIdeaTitle,
      description: newIdeaDesc,
      status: IdeaStatus.Active,
      priority: newIdeaPriority,
      category: newIdeaCategory,
      workspace_id: currentWorkspace?.workspace_id || '',
      created_by_user_id: currentUser?.user_id || 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trigger_type: TriggerType.None,
      trigger_date: null,
      trigger_metric: null,
      trigger_keyword: null,
      is_zombie: false,
      zombie_reason: null,
      archived_at: null,
      archive_reason: null,
      source: IdeaSource.Manual,
      source_url: null,
      related_wiki_ids: [],
      start_date: null,
      target_date: null,
      predicted_thaw_date: null,
      votes: 0,
      vote_records: [],
      lineage: [],
      tags: newIdeaTags
    };
    addIdea(newIdea);
    handleCloseModal();
    navigate(`/ideas/${newIdea.idea_id}`);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <PageHeader
        icon={Lightbulb}
        title="Ideas"
        description="Manage and track your ideas"
        action={
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-lg text-sm w-full sm:w-40 outline-none transition-all"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <button onClick={handleOpenModal}
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>
              <Plus className="w-4 h-4 mr-1.5" /> New
            </button>
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

      {/* Toolbar */}
      <div className="glass p-3 rounded-xl flex flex-wrap gap-4 justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: isFilterOpen ? 'var(--accent-glow)' : 'transparent',
              color: isFilterOpen ? 'var(--accent)' : 'var(--text-secondary)'
            }}>
            <Filter className="w-4 h-4" /> More Filters
          </button>

          {isFilterOpen && (
            <div className="flex gap-2">
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="text-sm rounded-lg py-1.5 pl-3 pr-8 outline-none"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="All">All Status</option>
                {Object.values(IdeaStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="text-sm rounded-lg py-1.5 pl-3 pr-8 outline-none"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="All">All Priority</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* List View */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="glass rounded-xl overflow-hidden">
          <ul>
            {filteredIdeas.length === 0 ? (
              <li className="p-12 text-center flex flex-col items-center justify-center">
                <Lightbulb className="w-12 h-12 mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No ideas yet</h3>
                <p className="text-sm mb-4 max-w-sm" style={{ color: 'var(--text-muted)' }}>
                  Capture your first idea! Great ideas deserve a home where they won't be forgotten.
                </p>
                <button onClick={handleOpenModal}
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>
                  <Plus className="w-4 h-4 mr-1.5" /> Create Your First Idea
                </button>
              </li>
            ) : filteredIdeas.map(idea => (
              <li key={idea.idea_id}
                className="p-4 cursor-pointer transition-all duration-200"
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: idea.is_zombie ? 'rgba(14, 165, 233, 0.05)' : 'transparent',
                  borderLeft: idea.is_zombie ? '3px solid #0ea5e9' : 'none'
                }}
                onClick={() => navigate(`/ideas/${idea.idea_id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {idea.is_zombie && <Snowflake className="w-4 h-4 flex-shrink-0" style={{ color: '#0ea5e9' }} />}
                      <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {idea.title}
                      </h3>
                      <PriorityBadge priority={idea.priority} />
                    </div>
                    <p className="text-sm line-clamp-1" style={{ color: 'var(--text-muted)' }}>{idea.description}</p>
                    {idea.is_zombie && idea.zombie_reason && (
                      <p className="text-xs mt-1" style={{ color: '#0ea5e9' }}>Trigger: {idea.zombie_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Freeze/Wake Button */}
                    {idea.is_zombie ? (
                      <button onClick={(e) => handleThaw(e, idea)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ background: '#22d3ee', color: 'var(--bg-primary)' }}>
                        <Snowflake className="w-3 h-3" /> Wake
                      </button>
                    ) : (
                      <button onClick={(e) => handleFreeze(e, idea)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                        <Snowflake className="w-3 h-3" /> Freeze
                      </button>
                    )}
                    {/* Vote Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); voteIdea(idea.idea_id, 'upvote' as any); }}
                        className="p-1.5 rounded-lg transition-all hover:scale-110 hover:bg-green-500/20"
                        style={{ color: '#22c55e' }}>
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold min-w-[24px] text-center" style={{ color: 'var(--text-primary)' }}>
                        {idea.votes || 0}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); voteIdea(idea.idea_id, 'downvote' as any); }}
                        className="p-1.5 rounded-lg transition-all hover:scale-110 hover:bg-red-500/20"
                        style={{ color: '#ef4444' }}>
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                    <StatusBadge status={idea.status} />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs gap-3" style={{ color: 'var(--text-muted)' }}>
                  <span>{idea.category}</span>
                  <span>Updated {new Date(idea.updated_at).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div key={modalKey} className="glass rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Idea</h2>
              <button onClick={handleCloseModal} style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddIdea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                <input required type="text" value={newIdeaTitle}
                  onChange={(e) => { setNewIdeaTitle(e.target.value); checkDuplicates(e.target.value); }}
                  className="w-full rounded-lg p-2.5 outline-none"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                {duplicateWarning && (
                  <div className="mt-2 text-xs p-2 rounded flex items-center"
                    style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                    <AlertTriangle className="w-3 h-3 mr-1.5" /> {duplicateWarning}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea rows={3} value={newIdeaDesc} onChange={e => setNewIdeaDesc(e.target.value)}
                  className="w-full rounded-lg p-2.5 outline-none resize-none"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                  <select value={newIdeaPriority} onChange={(e) => setNewIdeaPriority(e.target.value as Priority)}
                    className="w-full rounded-lg p-2.5 outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                  <select value={newIdeaCategory} onChange={(e) => setNewIdeaCategory(e.target.value as Category)}
                    className="w-full rounded-lg p-2.5 outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newIdeaTags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                      style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                      {tag}
                      <button type="button" onClick={() => setNewIdeaTags(newIdeaTags.filter(t => t !== tag))} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim() && !newIdeaTags.includes(tagInput.trim())) { setNewIdeaTags([...newIdeaTags, tagInput.trim()]); setTagInput(''); } } }}
                    placeholder="Type and press Enter..."
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <button type="button" onClick={() => { if (tagInput.trim() && !newIdeaTags.includes(tagInput.trim())) { setNewIdeaTags([...newIdeaTags, tagInput.trim()]); setTagInput(''); } }}
                    className="px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Add</button>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={handleCloseModal}
                  className="px-4 py-2 text-sm rounded-lg transition-all"
                  style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaList;
