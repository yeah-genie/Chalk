export type IdeaStatus = 'inbox' | 'evaluating' | 'experiment' | 'launched' | 'killed';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Idea {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  tags: string[];
  status: IdeaStatus;
  avg_score: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  linked_issue_url: string | null;
}

export interface Evaluation {
  id: string;
  idea_id: string;
  evaluator_id: string | null;
  market_score: number;
  revenue_score: number;
  effort_score: number;
  team_fit_score: number;
  learning_score: number;
  comment: string | null;
  created_at: string;
}

export interface PostMortem {
  id: string;
  idea_id: string;
  reason: string;
  learnings: string | null;
  would_reconsider_when: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Waitlist {
  id: string;
  email: string;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      workspaces: {
        Row: Workspace;
        Insert: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workspace, 'id' | 'created_at'>>;
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: Omit<WorkspaceMember, 'joined_at'>;
        Update: Partial<Omit<WorkspaceMember, 'workspace_id' | 'user_id'>>;
      };
      ideas: {
        Row: Idea;
        Insert: Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'avg_score'>;
        Update: Partial<Omit<Idea, 'id' | 'workspace_id' | 'created_at'>>;
      };
      evaluations: {
        Row: Evaluation;
        Insert: Omit<Evaluation, 'id' | 'created_at'>;
        Update: Partial<Omit<Evaluation, 'id' | 'idea_id' | 'created_at'>>;
      };
      post_mortems: {
        Row: PostMortem;
        Insert: Omit<PostMortem, 'id' | 'created_at'>;
        Update: Partial<Omit<PostMortem, 'id' | 'idea_id' | 'created_at'>>;
      };
      waitlist: {
        Row: Waitlist;
        Insert: { email: string };
        Update: never;
      };
    };
  };
}

