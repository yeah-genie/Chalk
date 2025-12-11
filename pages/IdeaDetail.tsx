
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { IdeaStatus, TriggerType, DecisionType, DecisionOutcome, Decision, Idea, IdeaSource, VoteTag } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import { ArrowLeft, Archive, Skull, Clock, CheckCircle2, Plus, Snowflake, ThumbsUp, GitMerge, CalendarClock, History, Search, Network, X, Book, ExternalLink, BarChart3, TrendingUp, TrendingDown, Minus, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Comments from '../components/Comments';

const IdeaDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ideas, updateIdea, addDecision, getIdeaDecisions, getUserName, currentUser, currentWorkspace, wiki, linkIdeaToWiki, voteIdea, mergeIdeas, getKnowledgeGraph, metrics } = useAppContext();
    const [activeTab, setActiveTab] = useState<'details' | 'history' | 'graph'>('details');

    const idea = ideas.find(i => i.idea_id === id);
    const graphData = id ? getKnowledgeGraph(id) : { nodes: [], edges: [] };

    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isKillModalOpen, setIsKillModalOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isVotePopoverOpen, setIsVotePopoverOpen] = useState(false);
    const [isLinkWikiOpen, setIsLinkWikiOpen] = useState(false);
    const [isLinkMetricOpen, setIsLinkMetricOpen] = useState(false);
    const [linkedMetricIds, setLinkedMetricIds] = useState<string[]>(idea?.related_metric_ids || []);

    const [archiveReason, setArchiveReason] = useState('');
    const [triggerType, setTriggerType] = useState<TriggerType>(TriggerType.None);
    const [triggerDate, setTriggerDate] = useState('');
    const [triggerMetric, setTriggerMetric] = useState('');
    const [mergeSearchTerm, setMergeSearchTerm] = useState('');
    const [selectedMergeId, setSelectedMergeId] = useState<string | null>(null);

    if (!idea) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Idea not found</div>;

    const decisions = getIdeaDecisions(idea.idea_id);
    const linkedWikiDocs = wiki.filter(doc => idea.related_wiki_ids?.includes(doc.wiki_id));

    const handleArchiveOrReschedule = (e: React.FormEvent) => {
        e.preventDefault();
        const isSnooze = idea.status === IdeaStatus.Active || idea.status === IdeaStatus.Frozen;
        const updated: Idea = { ...idea, status: isSnooze ? idea.status : IdeaStatus.Archived, archived_at: !isSnooze ? new Date().toISOString() : idea.archived_at, archive_reason: archiveReason, trigger_type: triggerType, trigger_date: triggerType === TriggerType.Time ? triggerDate : undefined, trigger_metric: triggerType === TriggerType.Metric ? triggerMetric : undefined, updated_at: new Date().toISOString(), is_zombie: false };
        updateIdea(updated);
        addDecision({ decision_id: uuidv4(), idea_id: idea.idea_id, type: isSnooze ? DecisionType.Snooze : DecisionType.Review, title: isSnooze ? 'Trigger Updated' : 'Archived', content: archiveReason || 'Trigger updated', outcome: DecisionOutcome.Deferred, decided_by_user_id: currentUser.user_id, decided_at: new Date().toISOString(), workspace_id: currentWorkspace?.workspace_id });
        setIsArchiveModalOpen(false);
    };

    const handleKill = (e: React.FormEvent) => {
        e.preventDefault();
        updateIdea({ ...idea, status: IdeaStatus.Killed, updated_at: new Date().toISOString(), is_zombie: false });
        addDecision({ decision_id: uuidv4(), idea_id: idea.idea_id, type: DecisionType.Kill, title: 'Killed', content: archiveReason, outcome: DecisionOutcome.Rejected, decided_by_user_id: currentUser.user_id, decided_at: new Date().toISOString(), workspace_id: currentWorkspace?.workspace_id });
        setIsKillModalOpen(false);
    };

    const handleWake = () => {
        updateIdea({ ...idea, status: IdeaStatus.Active, is_zombie: false, zombie_reason: undefined, updated_at: new Date().toISOString() });
        addDecision({ decision_id: uuidv4(), idea_id: idea.idea_id, type: DecisionType.Resurrect, title: 'Woken from Icebox', content: `Trigger: ${idea.zombie_reason}`, outcome: DecisionOutcome.Approved, decided_by_user_id: currentUser.user_id, decided_at: new Date().toISOString(), workspace_id: currentWorkspace?.workspace_id });
    };

    const handleVote = (tag: VoteTag) => { voteIdea(idea.idea_id, tag); setIsVotePopoverOpen(false); };
    const handleMerge = () => { if (!selectedMergeId) return; mergeIdeas(idea.idea_id, [selectedMergeId]); setIsMergeModalOpen(false); };

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-full overflow-auto">
            <div className="flex-1 space-y-4">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>

                <div className="glass p-6 rounded-xl">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold mr-4" style={{ color: 'var(--text-primary)' }}>{idea.title}</h1>
                            <div className="flex flex-wrap gap-2 text-sm items-center" style={{ color: 'var(--text-muted)' }}>
                                <span>Created by {getUserName(idea.created_by_user_id)}</span>
                                <span>•</span>
                                <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <StatusBadge status={idea.status} />
                                <PriorityBadge priority={idea.priority} />
                                <CategoryBadge category={idea.category} />
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <button onClick={() => setIsVotePopoverOpen(!isVotePopoverOpen)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium glass" style={{ color: 'var(--text-primary)' }}>
                                    <ThumbsUp className="w-4 h-4" /> <span>{idea.votes || 0}</span>
                                </button>
                                {isVotePopoverOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg z-10 p-2">
                                        <div className="text-xs font-semibold px-2 py-1 uppercase" style={{ color: 'var(--text-muted)' }}>Why?</div>
                                        {Object.values(VoteTag).map(tag => (
                                            <button key={tag} onClick={() => handleVote(tag)}
                                                className="w-full text-left px-2 py-1.5 text-sm rounded" style={{ color: 'var(--text-primary)' }}>
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setIsMergeModalOpen(true)} className="p-2 rounded-lg glass" style={{ color: 'var(--text-secondary)' }} title="Merge"><GitMerge className="w-5 h-5" /></button>
                            {idea.status !== IdeaStatus.Archived && idea.status !== IdeaStatus.Killed && !idea.is_zombie && (
                                <button onClick={() => setIsArchiveModalOpen(true)} className="p-2 rounded-lg glass" style={{ color: 'var(--text-secondary)' }} title="Reschedule"><CalendarClock className="w-5 h-5" /></button>
                            )}
                            {idea.status !== IdeaStatus.Killed && (
                                <button onClick={() => setIsKillModalOpen(true)} className="p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }} title="Kill"><Skull className="w-5 h-5" /></button>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <h2 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Description</h2>
                        <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{idea.description}</p>
                    </div>

                    {idea.lineage && idea.lineage.length > 0 && (
                        <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                            <h3 className="text-sm font-bold flex items-center mb-2" style={{ color: 'var(--text-primary)' }}><History className="w-4 h-4 mr-2" /> History</h3>
                            <ul className="space-y-2">
                                {idea.lineage.map((item, idx) => (
                                    <li key={idx} className="text-sm flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${item.type === 'child' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                                        <span style={{ color: 'var(--text-muted)' }}>{item.type === 'child' ? 'Merged from:' : 'Merged into:'}</span>
                                        <a href={`/#/ideas/${item.idea_id}`} className="font-medium" style={{ color: 'var(--accent)' }}>{item.idea_title}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {idea.is_zombie && (
                        <div className="mt-6 rounded-lg p-4" style={{ background: 'var(--accent-glow)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <Snowflake className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Frozen - Ready to wake!</h3>
                            </div>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Reason: {idea.zombie_reason}</p>
                            <div className="flex gap-3">
                                <button onClick={handleWake} className="flex items-center px-4 py-2 text-sm font-medium rounded-lg" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Wake Idea
                                </button>
                                <button onClick={() => setIsArchiveModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium rounded-lg glass" style={{ color: 'var(--text-primary)' }}>
                                    <Clock className="w-4 h-4 mr-2" /> Snooze
                                </button>
                            </div>
                        </div>
                    )}

                    {idea.status === IdeaStatus.Archived && (
                        <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Archive className="w-4 h-4" /> Archived {new Date(idea.archived_at!).toLocaleDateString()}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Reason: {idea.archive_reason}</p>
                        </div>
                    )}
                </div>

                <div style={{ borderBottom: '1px solid var(--border)' }}>
                    <nav className="-mb-px flex space-x-6">
                        {[{ id: 'details', label: 'Overview' }, { id: 'history', label: `History (${decisions.length})` }, { id: 'graph', label: 'Graph', icon: Network }].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                className="py-3 px-1 text-sm font-medium flex items-center gap-1 transition-all"
                                style={{ borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)' }}>
                                {tab.icon && <tab.icon className="w-4 h-4" />} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Default Overview Tab - Tags and Comments */}
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        {/* Tags Section */}
                        <div className="glass p-5 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold uppercase tracking-wide flex items-center" style={{ color: 'var(--text-primary)' }}>
                                    <Tag className="w-4 h-4 mr-2" style={{ color: 'var(--accent)' }} /> Tags
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(idea.tags && idea.tags.length > 0) ? idea.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                                        style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                                        {tag}
                                    </span>
                                )) : (
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No tags yet</span>
                                )}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <Comments ideaId={idea.idea_id} userId={currentUser.user_id} userName={currentUser.name} />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="glass rounded-xl">
                        {decisions.length === 0 ? (
                            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No decisions yet.</div>
                        ) : decisions.map(decision => (
                            <div key={decision.decision_id} className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                <div className="flex justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{decision.title}</h4>
                                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{decision.content}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(decision.decided_at).toLocaleDateString()}</span>
                                        <div className="mt-1">
                                            <span className={`text-xs font-bold ${decision.outcome === DecisionOutcome.Approved ? 'text-emerald-400' : decision.outcome === DecisionOutcome.Rejected ? 'text-red-400' : 'text-amber-400'}`}>
                                                {decision.outcome}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'graph' && (
                    <div className="glass p-6 rounded-xl min-h-[300px] flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="px-6 py-3 rounded-full font-bold inline-block" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
                                {idea.title} (Idea)
                            </div>
                            {graphData.nodes.length <= 1 && <div style={{ color: 'var(--text-muted)' }}>No connected entities found.</div>}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full lg:w-72 space-y-4">
                <div className="glass p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wide flex items-center" style={{ color: 'var(--text-primary)' }}>
                            <Book className="w-4 h-4 mr-2" /> Knowledge Base
                        </h3>
                        <button onClick={() => setIsLinkWikiOpen(true)} className="text-xs font-medium flex items-center" style={{ color: 'var(--accent)' }}>
                            <Plus className="w-3 h-3 mr-1" /> Link
                        </button>
                    </div>
                    {linkedWikiDocs.length === 0 ? (
                        <div className="text-center py-4 text-sm rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>No docs linked.</div>
                    ) : (
                        <ul className="space-y-2">
                            {linkedWikiDocs.map(doc => (
                                <li key={doc.wiki_id} className="text-sm">
                                    <a href={`/#/wiki`} className="font-medium flex items-center gap-1 group" style={{ color: 'var(--text-primary)' }}>
                                        {doc.title} <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" style={{ color: 'var(--accent)' }} />
                                    </a>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.category}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Related Metrics */}
                <div className="glass p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wide flex items-center" style={{ color: 'var(--text-primary)' }}>
                            <BarChart3 className="w-4 h-4 mr-2" /> Related Metrics
                        </h3>
                        <button onClick={() => setIsLinkMetricOpen(true)} className="text-xs font-medium flex items-center" style={{ color: 'var(--accent)' }}>
                            <Plus className="w-3 h-3 mr-1" /> Link
                        </button>
                    </div>
                    {(() => {
                        const linkedMetrics = metrics.filter(m => linkedMetricIds.includes(m.metric_id));
                        if (linkedMetrics.length === 0) {
                            return (
                                <div className="text-center py-4 text-sm rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                                    No metrics linked. Click "Link" to add.
                                </div>
                            );
                        }
                        return (
                            <ul className="space-y-3">
                                {linkedMetrics.map(metric => {
                                    const progress = Math.min(100, Math.round((metric.current_value / metric.target_value) * 100));
                                    const isAchieved = progress >= 100;
                                    return (
                                        <li key={metric.metric_id} className="p-3 rounded-lg relative group" style={{ background: 'var(--bg-tertiary)' }}>
                                            <button onClick={() => setLinkedMetricIds(prev => prev.filter(id => id !== metric.metric_id))}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ color: 'var(--text-muted)' }}>
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{metric.name}</span>
                                                <div className="flex items-center gap-1 text-xs">
                                                    {metric.trend === 'Up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                                                    {metric.trend === 'Down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                                                    {metric.trend === 'Flat' && <Minus className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                                                    <div className="h-full rounded-full" style={{ width: `${progress}%`, background: isAchieved ? '#10b981' : 'var(--accent)' }}></div>
                                                </div>
                                                <span className={`text-xs font-bold ${isAchieved ? 'text-emerald-400' : ''}`} style={{ color: isAchieved ? undefined : 'var(--text-muted)' }}>
                                                    {progress}%
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    })()}
                    <button onClick={() => navigate('/metrics')} className="w-full mt-3 text-xs font-medium py-2 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)' }}>
                        View All Metrics →
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isLinkMetricOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Link Metrics</h2>
                            <button onClick={() => setIsLinkMetricOpen(false)} style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Select metrics to track alongside this idea</p>
                        <div className="space-y-2 max-h-64 overflow-auto">
                            {metrics.map(metric => (
                                <label key={metric.metric_id} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                                    style={{ background: linkedMetricIds.includes(metric.metric_id) ? 'var(--accent-glow)' : 'var(--bg-tertiary)' }}>
                                    <input type="checkbox"
                                        checked={linkedMetricIds.includes(metric.metric_id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setLinkedMetricIds(prev => [...prev, metric.metric_id]);
                                            } else {
                                                setLinkedMetricIds(prev => prev.filter(id => id !== metric.metric_id));
                                            }
                                        }}
                                        style={{ accentColor: 'var(--accent)' }} />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{metric.name}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {metric.current_value} / {metric.target_value} {metric.unit}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <button onClick={() => setIsLinkMetricOpen(false)}
                            className="w-full mt-4 py-2.5 rounded-lg font-medium"
                            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
                            Done
                        </button>
                    </div>
                </div>
            )}

            {(isArchiveModalOpen || isKillModalOpen || isMergeModalOpen || isLinkWikiOpen) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold" style={{ color: isKillModalOpen ? '#f87171' : 'var(--text-primary)' }}>
                                {isArchiveModalOpen ? 'Configure Trigger' : isKillModalOpen ? 'Kill Idea' : isMergeModalOpen ? 'Merge Ideas' : 'Link Doc'}
                            </h2>
                            <button onClick={() => { setIsArchiveModalOpen(false); setIsKillModalOpen(false); setIsMergeModalOpen(false); setIsLinkWikiOpen(false); }} style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
                        </div>

                        {isArchiveModalOpen && (
                            <form onSubmit={handleArchiveOrReschedule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Trigger Type</label>
                                    <select className="w-full rounded-lg p-2.5 outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        value={triggerType} onChange={(e) => setTriggerType(e.target.value as TriggerType)}>
                                        {Object.values(TriggerType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                {triggerType === TriggerType.Time && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
                                        <input required type="date" className="w-full rounded-lg p-2.5 outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                            value={triggerDate} onChange={e => setTriggerDate(e.target.value)} />
                                    </div>
                                )}
                                {triggerType === TriggerType.Metric && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Condition</label>
                                        <input required type="text" placeholder="e.g. MAU > 1000" className="w-full rounded-lg p-2.5 outline-none"
                                            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                            value={triggerMetric} onChange={e => setTriggerMetric(e.target.value)} />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Note</label>
                                    <textarea className="w-full rounded-lg p-2.5 outline-none resize-none" rows={2}
                                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        value={archiveReason} onChange={e => setArchiveReason(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsArchiveModalOpen(false)} className="px-4 py-2 text-sm rounded-lg" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm rounded-lg font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Save</button>
                                </div>
                            </form>
                        )}

                        {isKillModalOpen && (
                            <form onSubmit={handleKill} className="space-y-4">
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This will mark the idea as rejected.</p>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Reason</label>
                                    <textarea required className="w-full rounded-lg p-2.5 outline-none resize-none" rows={2}
                                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        value={archiveReason} onChange={e => setArchiveReason(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsKillModalOpen(false)} className="px-4 py-2 text-sm rounded-lg" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm rounded-lg font-medium" style={{ background: '#ef4444', color: 'white' }}>Kill</button>
                                </div>
                            </form>
                        )}

                        {isMergeModalOpen && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <input type="text" placeholder="Search ideas..." className="w-full pl-9 pr-4 py-2 rounded-lg outline-none"
                                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        value={mergeSearchTerm} onChange={(e) => setMergeSearchTerm(e.target.value)} />
                                    <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {ideas.filter(i => i.idea_id !== idea.idea_id && i.title.toLowerCase().includes(mergeSearchTerm.toLowerCase())).map(i => (
                                        <div key={i.idea_id} onClick={() => setSelectedMergeId(i.idea_id)}
                                            className="p-3 rounded-lg cursor-pointer flex justify-between items-center glass"
                                            style={{ border: selectedMergeId === i.idea_id ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{i.title}</span>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{i.status}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setIsMergeModalOpen(false)} className="px-4 py-2 text-sm rounded-lg" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                                    <button onClick={handleMerge} disabled={!selectedMergeId} className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50"
                                        style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Merge</button>
                                </div>
                            </div>
                        )}

                        {isLinkWikiOpen && (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {wiki.map(doc => (
                                    <button key={doc.wiki_id} onClick={() => { linkIdeaToWiki(idea.idea_id, doc.wiki_id); setIsLinkWikiOpen(false); }}
                                        className="w-full text-left p-3 rounded-lg glass flex justify-between items-center text-sm"
                                        disabled={idea.related_wiki_ids?.includes(doc.wiki_id)}>
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{doc.title}</span>
                                        {idea.related_wiki_ids?.includes(doc.wiki_id) && <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdeaDetail;

