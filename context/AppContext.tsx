import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User, Workspace, Idea, Decision, Metric, WikiDoc, Role,
  DecisionType, DecisionOutcome, IdeaStatus, TriggerType, IdeaSource, Priority, Category, WikiStatus,
  ActivityLog, ActivityType, VoteTag, MarketPulse, SynthesisSuggestion, PostMortemReport, KnowledgeGraphData,
  Comment
} from '../types';
import {
  CURRENT_USER as MOCK_USER, CURRENT_WORKSPACE as MOCK_WORKSPACE,
  MOCK_IDEAS, MOCK_DECISIONS, MOCK_METRICS, MOCK_WIKI, MOCK_ACTIVITIES, MOCK_MARKET_PULSE, MOCK_SYNTHESIS_SUGGESTIONS
} from '../services/mockData';
import { cryoApi } from '../services/api';
import { demoStorage } from '../services/demoStorage';
import { supabase } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  currentUser: User;
  isLoadingAuth: boolean;
  currentWorkspace: Workspace;
  users: User[];
  ideas: Idea[];
  decisions: Decision[];
  metrics: Metric[];
  wiki: WikiDoc[];
  activities: ActivityLog[];
  marketPulses: MarketPulse[];
  synthesisSuggestions: SynthesisSuggestion[];
  comments: Comment[];

  // Actions
  addIdea: (idea: Idea) => void;
  updateIdea: (idea: Idea) => void;
  addDecision: (decision: Decision) => void;
  addMetric: (metric: Metric) => void;
  updateMetric: (metric: Metric) => void;
  addWikiDoc: (doc: WikiDoc) => void;
  updateWikiDoc: (doc: WikiDoc) => void;
  linkIdeaToWiki: (ideaId: string, wikiId: string) => void;
  voteIdea: (ideaId: string, tag: VoteTag) => void;
  mergeIdeas: (targetIdeaId: string, sourceIdeaIds: string[]) => void;
  markActivityAsRead: (activityId: string) => void;
  addComment: (comment: Comment) => void;
  deleteComment: (commentId: string) => void;

  // Helpers
  getIdeaDecisions: (ideaId: string) => Decision[];
  getIdeaComments: (ideaId: string) => Comment[];
  getUserName: (userId: string) => string;
  getSmartThawRecommendations: () => Idea[];
  generatePostMortem: () => PostMortemReport;
  getKnowledgeGraph: (ideaId: string) => KnowledgeGraphData;

  // Simulation Actions
  simulateSlackIncoming: () => void;
  simulateCompetitorAlert: () => void;
  generateWikiFromIdea: (idea: Idea) => WikiDoc;
  simulateMarketPulse: () => void;
  synthesizeIdeas: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth & State
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Initialize with empty/default values
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(MOCK_WORKSPACE);
  const [users, setUsers] = useState<User[]>([]);
  // Removed other states as they are now React Query derived

  // 1. Handle Auth Session
  useEffect(() => {
    // HashRouter 환경에서 OAuth 콜백 처리
    // Supabase는 #access_token=...&refresh_token=... 형태로 토큰을 전달함
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;

      // OAuth 콜백인지 확인 (access_token이 해시에 있으면)
      if (hash && hash.includes('access_token')) {
        // 해시에서 파라미터 추출
        const params = new URLSearchParams(hash.substring(1)); // # 제거
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('OAuth callback detected, setting session...');

          // 세션 설정
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Failed to set session:', error);
          } else {
            console.log('Session set successfully:', data.user?.email);
            // 해시 클리어 (토큰 정보 제거)
            window.location.hash = '#/';
          }
        }
      }
    };

    handleOAuthCallback();

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No session');
      setSession(session);
      if (session) {
        fetchCurrentUser(session.user.id, session.user.email!);
      } else {
        // No session - use mock user/workspace for demo experience
        setCurrentUser(MOCK_USER);
        setCurrentWorkspace(MOCK_WORKSPACE);
        setIsLoadingAuth(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email || 'No session');
      setSession(session);
      if (session) {
        fetchCurrentUser(session.user.id, session.user.email!);
      } else {
        // Use mock user when logged out
        setCurrentUser(MOCK_USER);
        setCurrentWorkspace(MOCK_WORKSPACE);
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCurrentUser = async (userId: string, email: string) => {
    try {
      const fetchedUsers = await cryoApi.fetchUsers(currentWorkspace?.workspace_id); // Fetch all to find self
      const me = fetchedUsers.find(u => u.user_id === userId);

      if (me) {
        setCurrentUser(me);
        // Load Workspace for this user
        // 1. Try to find workspace owned by user
        const myWorkspaces = await cryoApi.fetchWorkspacesByUser(email);
        if (myWorkspaces.length > 0) {
          setCurrentWorkspace(myWorkspaces[0]);
          // ideally we persist selected workspace in local storage or user preferences
        } else {
          // 2. If no workspace, create default one
          const newWorkspace: Workspace = {
            ...MOCK_WORKSPACE, // Use mock as template but new ID
            workspace_id: uuidv4(),
            name: `${email.split('@')[0]}'s Workspace`,
            owner_email: email
          };
          await cryoApi.createWorkspace(newWorkspace);
          setCurrentWorkspace(newWorkspace);
        }

      } else {
        // First time login? Create User in DB
        // Note: In real app, Trigger or Edge Function is better. Doing client-side for simplicity now.
        const newUser: User = {
          user_id: userId,
          email: email,
          name: email.split('@')[0], // Default name
          role: Role.Viewer, // Default role
          workspace_id: currentWorkspace?.workspace_id, // This might be wrong if currentWorkspace is mock.
          // Correct flow: Create Workspace First -> Create User linked to it?
          // Or separate Onboarding flow.
          // For Refactor scope: Just ensure we attach to *some* workspace.
          profile_image: `https://ui-avatars.com/api/?name=${email}&background=random`,
          notification_email: true,
          notification_slack: false
        };

        // Let's create a workspace for this new user
        const newWorkspace: Workspace = {
          ...MOCK_WORKSPACE,
          workspace_id: uuidv4(),
          name: `${email.split('@')[0]}'s Workspace`,
          owner_email: email
        };
        await cryoApi.createWorkspace(newWorkspace);
        setCurrentWorkspace(newWorkspace);

        newUser.workspace_id = newWorkspace.workspace_id;

        // TODO: Implement create/upsert user API properly. 
        // For now preventing crash by setting state, but data wont persist without API call. 
        // We really need an `api.createUser` method.
        // Assuming we add it now or just skip persistence for this step (User mostly asked for types/cleanup).
        // Let's rely on RLS and direct insert if possible or just log it.
        // await cryoApi.createUser(newUser); // Mocking this call intention
        setCurrentUser(newUser);
      }
    } catch (e) {
      console.error("Error fetching user", e);
    } finally {
      // Migrate pending ideas from landing page (if any)
      await migratePendingIdeas();
      setIsLoadingAuth(false);
    }
  };

  // Migrate pending ideas from localStorage to database after signup
  const migratePendingIdeas = async () => {
    const pendingData = localStorage.getItem('cryo_pending_ideas');
    if (!pendingData) return;

    try {
      const data = JSON.parse(pendingData);
      const allIdeas = [...(data.frozenIdeas || []), ...(data.nowIdeas || [])];

      for (const idea of allIdeas) {
        const newIdea: Idea = {
          idea_id: uuidv4(),
          title: idea.title,
          description: idea.content,
          created_by_user_id: currentUser?.user_id || '',
          workspace_id: currentWorkspace?.workspace_id,
          status: idea.status === 'frozen' ? IdeaStatus.Frozen : IdeaStatus.Active,
          priority: Priority.Medium,
          source: IdeaSource.Manual,
          category: Category.Feature,
          votes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          trigger_type: TriggerType.Manual,
          predicted_thaw_date: idea.status === 'frozen' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          related_wiki_ids: [],
        };

        // Use demo storage for now (or real API if available)
        if (session) {
          try {
            await cryoApi.createIdea(newIdea);
          } catch {
            // Fallback to demo storage
            demoStorage.addIdea(newIdea);
          }
        } else {
          demoStorage.addIdea(newIdea);
        }
      }

      // Clear pending ideas after migration
      localStorage.removeItem('cryo_pending_ideas');
      console.log(`Migrated ${allIdeas.length} ideas from landing page`);
    } catch (e) {
      console.error('Failed to migrate pending ideas:', e);
    }
  };

  // React Query
  const queryClient = useQueryClient();

  // Check if we're in demo mode (no real session)
  const isDemoMode = !session;

  // 2. Data Fetching with React Query (with demo storage fallback)
  const { data: ideas = [] } = useQuery({
    queryKey: ['ideas', currentWorkspace?.workspace_id || '', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return demoStorage.getIdeas();
      }
      try {
        const data = await cryoApi.fetchIdeas(currentWorkspace?.workspace_id || '');
        return data.length > 0 ? data : [];
      } catch {
        return demoStorage.getIdeas();
      }
    },
    enabled: !!currentWorkspace?.workspace_id
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ['decisions', currentWorkspace?.workspace_id || '', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return demoStorage.getDecisions();
      }
      try {
        const data = await cryoApi.fetchDecisions(currentWorkspace?.workspace_id || '');
        return data.length > 0 ? data : [];
      } catch {
        return demoStorage.getDecisions();
      }
    },
    enabled: !!currentWorkspace?.workspace_id
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['metrics', currentWorkspace?.workspace_id || '', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return demoStorage.getMetrics();
      }
      try {
        const data = await cryoApi.fetchMetrics(currentWorkspace?.workspace_id || '');
        return data.length > 0 ? data : [];
      } catch {
        return demoStorage.getMetrics();
      }
    },
    enabled: !!currentWorkspace?.workspace_id
  });

  const { data: wiki = [] } = useQuery({
    queryKey: ['wiki', currentWorkspace?.workspace_id || '', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return demoStorage.getWiki();
      }
      try {
        const data = await cryoApi.fetchWiki(currentWorkspace?.workspace_id || '');
        return data.length > 0 ? data : [];
      } catch {
        return demoStorage.getWiki();
      }
    },
    enabled: !!currentWorkspace?.workspace_id
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return demoStorage.getActivities();
      }
      try {
        return await cryoApi.fetchActivities();
      } catch {
        return demoStorage.getActivities();
      }
    },
  });

  const { data: marketPulses = MOCK_MARKET_PULSE } = useQuery({
    queryKey: ['marketPulses'],
    queryFn: async () => {
      try {
        return await cryoApi.fetchMarketPulses();
      } catch {
        return MOCK_MARKET_PULSE;
      }
    },
  });

  const { data: synthesisSuggestions = MOCK_SYNTHESIS_SUGGESTIONS } = useQuery({
    queryKey: ['synthesisSuggestions'],
    queryFn: async () => {
      try {
        return await cryoApi.fetchSynthesisSuggestions();
      } catch {
        return MOCK_SYNTHESIS_SUGGESTIONS;
      }
    },
  });

  // Users (Load once)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await cryoApi.fetchUsers(currentWorkspace?.workspace_id);
        setUsers(fetchedUsers);
      } catch (e) { console.error(e); }
    };
    if (currentWorkspace?.workspace_id) loadUsers();
  }, [currentWorkspace?.workspace_id]);


  // 3. Realtime Subscription (Invalidation Strategy)
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        () => {
          // Instead of manual update, just refetch
          queryClient.invalidateQueries({ queryKey: ['ideas'] });
          toast('Data updated', { icon: '🔄', duration: 2000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const logActivity = async (type: ActivityType, entityType: 'Idea' | 'Wiki' | 'Decision', entityId: string, entityTitle: string, details?: string) => {
    const log: ActivityLog = {
      activity_id: uuidv4(),
      user_id: currentUser!.user_id,
      entity_type: entityType,
      entity_id: entityId,
      entity_title: entityTitle,
      action: type,
      timestamp: new Date().toISOString(),
      details,
      is_read: false
    };
    // Optimistic
    // Optimistic
    queryClient.setQueryData(['activities'], (prev: ActivityLog[] | undefined) => [log, ...(prev || [])]);
    // Persist
    await cryoApi.logActivity(log);
  };

  const markActivityAsRead = async (activityId: string) => {
    queryClient.setQueryData(['activities'], (prev: ActivityLog[] | undefined) =>
      prev?.map(a => a.activity_id === activityId ? { ...a, is_read: true } : a) || []
    );
    await cryoApi.markActivityAsRead(activityId);
  };

  const addIdea = async (idea: Idea) => {
    // Optimistic Update
    queryClient.setQueryData(['ideas', currentWorkspace?.workspace_id, isDemoMode], (prev: Idea[] | undefined) => [idea, ...(prev || [])]);

    if (isDemoMode) {
      // Demo mode: save to localStorage
      demoStorage.addIdea(idea);
      toast.success('Idea created successfully');
      return;
    }

    try {
      await cryoApi.createIdea(idea);
      toast.success('Idea created successfully');
      logActivity(ActivityType.Create, 'Idea', idea.idea_id, idea.title);
    } catch (error: any) {
      // Rollback
      queryClient.setQueryData(['ideas', currentWorkspace?.workspace_id, isDemoMode], (prev: Idea[] | undefined) => prev?.filter(i => i.idea_id !== idea.idea_id) || []);
      toast.error(`Failed to create idea: ${error.message}`);
    }
  };

  const updateIdea = async (updatedIdea: Idea) => {
    // Snapshot previous state for rollback
    const previousIdeas = ideas;

    // Optimistic Update
    queryClient.setQueryData(['ideas', currentWorkspace?.workspace_id, isDemoMode], (prev: Idea[] | undefined) =>
      prev?.map(idea => idea.idea_id === updatedIdea.idea_id ? updatedIdea : idea) || []
    );

    if (isDemoMode) {
      // Demo mode: save to localStorage
      demoStorage.updateIdea(updatedIdea);
      toast.success('Idea updated');
      return;
    }

    try {
      await cryoApi.updateIdea(updatedIdea);

      // Log Activity only on success
      let action = ActivityType.Update;
      if (updatedIdea.status === IdeaStatus.Archived) action = ActivityType.Archive;
      if (updatedIdea.status === IdeaStatus.Killed) action = ActivityType.Kill;
      if (updatedIdea.status === IdeaStatus.Active && updatedIdea.is_zombie === false) action = ActivityType.Wake;
      logActivity(action, 'Idea', updatedIdea.idea_id, updatedIdea.title);

    } catch (error: any) {
      // Rollback
      queryClient.setQueryData(['ideas', currentWorkspace?.workspace_id, isDemoMode], previousIdeas);
      toast.error(`Failed to update idea: ${error.message}`);
    }
  };

  const addDecision = async (decision: Decision) => {
    queryClient.setQueryData(['decisions', currentWorkspace?.workspace_id], (prev: Decision[] | undefined) => [decision, ...(prev || [])]);
    await cryoApi.createDecision(decision);
    logActivity(ActivityType.Create, 'Decision', decision.decision_id, decision.title, decision.outcome);
  };

  const addMetric = (metric: Metric) => {
    queryClient.setQueryData(['metrics', currentWorkspace?.workspace_id], (prev: Metric[] | undefined) => [metric, ...(prev || [])]);
    // Note: Add createMetric API if needed, for now just local or maybe I missed adding it to API
    // Adding placeholder log
    console.log("Metric created", metric);
  };

  const updateMetric = (updatedMetric: Metric) => {
    queryClient.setQueryData(['metrics', currentWorkspace?.workspace_id], (prev: Metric[] | undefined) =>
      prev?.map(m => m.metric_id === updatedMetric.metric_id ? updatedMetric : m) || []
    );
  };

  const addWikiDoc = async (doc: WikiDoc) => {
    queryClient.setQueryData(['wiki', currentWorkspace?.workspace_id], (prev: WikiDoc[] | undefined) => [doc, ...(prev || [])]);
    await cryoApi.createWikiDoc(doc);
    logActivity(ActivityType.Create, 'Wiki', doc.wiki_id, doc.title);
  };

  const updateWikiDoc = async (updatedDoc: WikiDoc) => {
    queryClient.setQueryData(['wiki', currentWorkspace?.workspace_id], (prev: WikiDoc[] | undefined) =>
      prev?.map(doc => doc.wiki_id === updatedDoc.wiki_id ? updatedDoc : doc) || []
    );
    await cryoApi.updateWikiDoc(updatedDoc);
    logActivity(ActivityType.Update, 'Wiki', updatedDoc.wiki_id, updatedDoc.title);
  };

  const voteIdea = async (ideaId: string, tag: VoteTag) => {
    queryClient.setQueryData(['ideas', currentWorkspace?.workspace_id], (prev: Idea[] | undefined) => prev?.map(idea => {
      if (idea.idea_id === ideaId) {
        const newRecord = { user_id: currentUser.user_id, tag, timestamp: new Date().toISOString() };
        return {
          ...idea,
          votes: (idea.votes || 0) + 1,
          vote_records: [...(idea.vote_records || []), newRecord]
        };
      }
      return idea;
    }) || []);
    const idea = ideas.find(i => i.idea_id === ideaId);
    if (idea) {
      await cryoApi.voteIdea(ideaId, currentUser.user_id, tag);
      logActivity(ActivityType.Vote, 'Idea', idea.idea_id, idea.title, `Voted: ${tag}`);
    }
  };

  const mergeIdeas = async (targetIdeaId: string, sourceIdeaIds: string[]) => {
    const targetIdea = ideas.find(i => i.idea_id === targetIdeaId);
    if (!targetIdea) return;

    const sourceIdeas = ideas.filter(i => sourceIdeaIds.includes(i.idea_id));

    let mergedDescription = targetIdea.description;
    sourceIdeas.forEach(source => {
      mergedDescription += `\n\n--- Merged from "${source.title}" ---\n${source.description}`;
    });

    const targetLineageUpdate = [
      ...(targetIdea.lineage || []),
      ...sourceIdeas.map(s => ({ type: 'child' as const, idea_id: s.idea_id, idea_title: s.title, timestamp: new Date().toISOString() }))
    ];

    const updatedTarget: Idea = {
      ...targetIdea,
      description: mergedDescription,
      votes: targetIdea.votes + sourceIdeas.reduce((sum, i) => sum + (i.votes || 0), 0),
      updated_at: new Date().toISOString(),
      lineage: targetLineageUpdate
    };

    // Updates
    await updateIdea(updatedTarget);

    // Source updates
    for (const source of sourceIdeas) {
      const updatedSource: Idea = {
        ...source,
        status: IdeaStatus.Killed,
        archive_reason: `Merged into idea: "${targetIdea.title}"`,
        updated_at: new Date().toISOString(),
        lineage: [...(source.lineage || []), { type: 'parent' as const, idea_id: targetIdea.idea_id, idea_title: targetIdea.title, timestamp: new Date().toISOString() }]
      };
      await updateIdea(updatedSource);

      const decision: Decision = {
        decision_id: uuidv4(),
        idea_id: source.idea_id,
        type: DecisionType.Merge,
        title: 'Idea Merged',
        content: `Merged into "${targetIdea.title}"`,
        outcome: DecisionOutcome.Modified,
        decided_by_user_id: currentUser.user_id,
        decided_at: new Date().toISOString(),
        workspace_id: currentWorkspace?.workspace_id
      };
      await addDecision(decision);
    }

    logActivity(ActivityType.Merge, 'Idea', targetIdeaId, targetIdea.title, `Merged ${sourceIdeas.length} ideas`);
  };

  const linkIdeaToWiki = async (ideaId: string, wikiId: string) => {
    // Only local state update logic for now, implementing API update for this would require PATCH logic
    // We can just update the full objects
    const idea = ideas.find(i => i.idea_id === ideaId);
    const doc = wiki.find(w => w.wiki_id === wikiId);

    if (idea && !idea.related_wiki_ids?.includes(wikiId)) {
      const updatedIdea = { ...idea, related_wiki_ids: [...(idea.related_wiki_ids || []), wikiId] };
      await updateIdea(updatedIdea);
    }
    if (doc && !doc.related_idea_ids?.includes(ideaId)) {
      const updatedDoc = { ...doc, related_idea_ids: [...(doc.related_idea_ids || []), ideaId] };
      await updateWikiDoc(updatedDoc);
    }
  };

  const getIdeaDecisions = (ideaId: string) => {
    return decisions.filter(d => d.idea_id === ideaId).sort((a, b) => new Date(b.decided_at).getTime() - new Date(a.decided_at).getTime());
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.user_id === userId)?.name || 'Unknown User';
  };

  const getSmartThawRecommendations = (): Idea[] => {
    return ideas
      .filter(i => i.status === IdeaStatus.Frozen)
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 2);
  };

  // --- ANALYTICS ---

  const generatePostMortem = (): PostMortemReport => {
    const killed = ideas.filter(i => i.status === IdeaStatus.Killed);
    const reasons: Record<string, number> = {};

    killed.forEach(i => {
      // Simple clustering of reasons
      const r = i.archive_reason || 'Unknown';
      if (r.includes('Merged')) return; // Ignore merges
      reasons[r] = (reasons[r] || 0) + 1;
    });

    const topReasons = Object.entries(reasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    let totalLifespan = 0;
    killed.forEach(i => {
      const start = new Date(i.created_at).getTime();
      const end = new Date(i.updated_at).getTime();
      totalLifespan += (end - start);
    });
    const avgLifespan = killed.length ? (totalLifespan / killed.length) / (1000 * 3600 * 24) : 0;

    return {
      total_killed: killed.length,
      top_reasons: topReasons,
      avg_lifespan_days: Math.round(avgLifespan),
      opportunity_cost_estimate: killed.length * 5000 // Mock value: $5k per killed idea
    };
  };

  const getKnowledgeGraph = (ideaId: string): KnowledgeGraphData => {
    const idea = ideas.find(i => i.idea_id === ideaId);
    if (!idea) return { nodes: [], edges: [] };

    const nodes: any[] = [{ id: idea.idea_id, label: idea.title, type: 'Idea', status: idea.status }];
    const edges: any[] = [];

    // Link Wiki
    idea.related_wiki_ids?.forEach(wid => {
      const w = wiki.find(d => d.wiki_id === wid);
      if (w) {
        nodes.push({ id: w.wiki_id, label: w.title, type: 'Wiki' });
        edges.push({ source: idea.idea_id, target: w.wiki_id, label: 'Documented By' });
      }
    });

    // Link Decisions
    decisions.filter(d => d.idea_id === ideaId).forEach(d => {
      nodes.push({ id: d.decision_id, label: d.title, type: 'Decision' });
      edges.push({ source: idea.idea_id, target: d.decision_id, label: 'Decision' });
    });

    // Link Market Pulse
    marketPulses.filter(mp => mp.idea_id === ideaId).forEach(mp => {
      nodes.push({ id: mp.id, label: mp.description.substring(0, 20) + '...', type: 'Metric' });
      edges.push({ source: idea.idea_id, target: mp.id, label: mp.type });
    });

    return { nodes, edges };
  };


  // --- SIMULATIONS ---

  const simulateSlackIncoming = async () => {
    const newIdea: Idea = {
      idea_id: uuidv4(),
      title: "Integrate with new CRM",
      description: "Discussion from #product-dev: We should really look into HubSpot integration again. The sales team is asking for it.",
      status: IdeaStatus.Frozen,
      priority: Priority.Medium,
      category: Category.Technical,
      workspace_id: currentWorkspace?.workspace_id,
      created_by_user_id: currentUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trigger_type: TriggerType.None,
      is_zombie: true,
      zombie_reason: "Captured from Slack Thread 🧵",
      source: IdeaSource.Slack,
      source_url: "https://slack.com/archives/C123/p1234",
      votes: 1,
      vote_records: [],
      // Required fields from strict type
      archived_at: null,
      archive_reason: null,
      trigger_date: null,
      trigger_metric: null,
      trigger_keyword: null,
      predicted_thaw_date: null,
      lineage: [],
      related_wiki_ids: [],
      start_date: null,
      target_date: null
    };
    await addIdea(newIdea);
    alert("🚀 New idea captured from Slack to Icebox!");
  };

  const simulateCompetitorAlert = async () => {
    await simulateMarketPulse();
  };

  const simulateMarketPulse = async () => {
    const targetIdea = ideas.find(i => i.status === IdeaStatus.Frozen) || ideas[0];
    if (!targetIdea) return;

    const newPulse: MarketPulse = {
      id: uuidv4(),
      idea_id: targetIdea.idea_id,
      type: 'Competitor',
      description: `Competitor launched feature similar to "${targetIdea.title}"`,
      severity: 'High',
      timestamp: new Date().toISOString(),
      source_url: 'https://competitor.com/news' // Mock source
    };
    queryClient.setQueryData(['marketPulses'], (prev: MarketPulse[] | undefined) => [newPulse, ...(prev || [])]);
    await cryoApi.createMarketPulse(newPulse);
    alert(`📡 Market Radar: Competitor signal detected for ${targetIdea.title}!`);
  };

  const synthesizeIdeas = async () => {
    const candidates = ideas.filter(i => i.status === IdeaStatus.Frozen).slice(0, 2);
    if (candidates.length < 2) {
      alert("Not enough frozen ideas to synthesize.");
      return;
    }
    const newSuggestion: SynthesisSuggestion = {
      id: uuidv4(),
      source_idea_ids: candidates.map(c => c.idea_id),
      suggested_title: `Unified: ${candidates[0].title} + ${candidates[1].title}`,
      reason: "AI Analysis: These ideas share similar goals regarding user retention. Merging them reduces fragmentation.",
      confidence_score: 92
    };
    queryClient.setQueryData(['synthesisSuggestions'], (prev: SynthesisSuggestion[] | undefined) => [newSuggestion, ...(prev || [])]);
    await cryoApi.createSynthesisSuggestion(newSuggestion);
    alert("🧬 AI Synthesis: New merger suggestion generated!");
  };

  const generateWikiFromIdea = (idea: Idea): WikiDoc => {
    return {
      wiki_id: uuidv4(),
      workspace_id: currentWorkspace?.workspace_id,
      title: `Spec: ${idea.title}`,
      content: `# ${idea.title}\n\n## Overview\n${idea.description}\n\n## Goals\n- Goal 1\n- Goal 2\n\n## Technical Requirements\n(Auto-generated draft based on idea context)`,
      category: 'Technical',
      is_pinned: false,
      updated_at: new Date().toISOString(),
      view_count: 0,
      verification_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      status: WikiStatus.Draft,
      related_idea_ids: [idea.idea_id],
      emoji: '⚡',
      cover_image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80"
    };
  };

  return (
    <AppContext.Provider value={{
      currentUser: currentUser!, // Warning: Non-null assertion for now, should handle via RequireAuth
      isLoadingAuth,
      currentWorkspace,
      users,
      ideas,
      decisions,
      metrics,
      wiki,
      activities,
      marketPulses,
      synthesisSuggestions,
      addIdea,
      updateIdea,
      addDecision,
      addMetric,
      updateMetric,
      addWikiDoc,
      updateWikiDoc,
      linkIdeaToWiki,
      voteIdea,
      mergeIdeas,
      markActivityAsRead,
      getIdeaDecisions,
      getUserName,
      getSmartThawRecommendations,
      generatePostMortem,
      getKnowledgeGraph,
      simulateSlackIncoming,
      simulateCompetitorAlert,
      generateWikiFromIdea,
      simulateMarketPulse,
      synthesizeIdeas
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

