
import { Database } from './database.types';

export type Json = Database['public']['Tables']['idea']['Row']['lineage']; // Helper if needed

// Enums (Keep strict runtime values)
export enum Role {
    Admin = 'Admin',
    Editor = 'Editor',
    Viewer = 'Viewer'
}

export enum Plan {
    Free = 'Free',
    Pro = 'Pro',
    Team = 'Team'
}

export enum IdeaStatus {
    Active = 'Active',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Archived = 'Archived',
    Killed = 'Killed',
    Frozen = 'Frozen'
}

export enum Priority {
    High = 'High',
    Medium = 'Medium',
    Low = 'Low'
}

export enum Category {
    Feature = 'Feature',
    Growth = 'Growth',
    Operations = 'Operations',
    Technical = 'Technical',
    Other = 'Other'
}

export enum TriggerType {
    None = 'None',
    Time = 'Time',
    Metric = 'Metric',
    External = 'External'
}

export enum DecisionType {
    Meeting = 'Meeting',
    Review = 'Review',
    Pivot = 'Pivot',
    Kill = 'Kill',
    Resurrect = 'Resurrect',
    Snooze = 'Snooze',
    Merge = 'Merge'
}

export enum DecisionOutcome {
    Approved = 'Approved',
    Rejected = 'Rejected',
    Deferred = 'Deferred',
    Modified = 'Modified'
}

export enum MetricTrend {
    Up = 'Up',
    Down = 'Down',
    Flat = 'Flat'
}

export enum MetricStatus {
    Achieved = 'Achieved',
    OnTrack = 'On Track',
    Behind = 'Behind'
}

export enum IdeaSource {
    Manual = 'Manual',
    Slack = 'Slack',
    Notion = 'Notion',
    Linear = 'Linear',
    Zapier = 'Zapier',
    External = 'External'
}

export enum WikiStatus {
    Verified = 'Verified',
    Stale = 'Stale',
    Draft = 'Draft'
}

export enum ActivityType {
    Create = 'Create',
    Update = 'Update',
    Archive = 'Archive',
    Kill = 'Kill',
    Wake = 'Wake',
    Merge = 'Merge',
    Vote = 'Vote'
}

export enum VoteTag {
    Revenue = 'Revenue',
    Efficiency = 'Efficiency',
    Customer = 'Customer Love',
    Strategy = 'Strategic Fit'
}

// Interfaces extending DB Row Types

// Users
export type UserRow = Database['public']['Tables']['users']['Row'];
export interface User extends Omit<UserRow, 'role'> {
    role: Role;
}

// Workspaces
export type WorkspaceRow = Database['public']['Tables']['workspaces']['Row'];
export interface Workspace extends Omit<WorkspaceRow, 'plan'> {
    plan: Plan;
}

// Ideas
export type IdeaRow = Database['public']['Tables']['ideas']['Row'];
export interface VoteRecord {
    user_id: string;
    tag: VoteTag;
    timestamp: string;
}
export interface IdeaLineage {
    type: 'parent' | 'child';
    idea_id: string;
    idea_title: string;
    timestamp: string;
}

export interface Idea extends Omit<IdeaRow, 'status' | 'priority' | 'trigger_type' | 'votes' | 'vote_records' | 'lineage' | 'source'> {
    status: IdeaStatus;
    priority: Priority;
    category: Category; // Cast string to Enum if needed, or keep string. DB is string. 
    // For strictness, let's say:
    // category: Category; 
    trigger_type: TriggerType;
    source: IdeaSource;
    votes: number;
    vote_records?: VoteRecord[];
    lineage?: IdeaLineage[];
    tags?: string[]; // New: 태그/라벨 시스템
}

// Comments (New)
export interface Comment {
    comment_id: string;
    idea_id: string;
    user_id: string;
    user_name: string;
    content: string;
    created_at: string;
    updated_at: string;
}

// Decisions
export type DecisionRow = Database['public']['Tables']['decisions']['Row'];
export interface Decision extends Omit<DecisionRow, 'type' | 'outcome'> {
    type: DecisionType;
    outcome: DecisionOutcome;
}

// Metrics
export type MetricRow = Database['public']['Tables']['metrics']['Row'];
export interface Metric extends Omit<MetricRow, 'trend'> {
    trend: MetricTrend;
    // MetricStatus is not in DB schema yet, maybe computed?
}

// Wiki
export type WikiDocRow = Database['public']['Tables']['wiki_docs']['Row'];
export interface WikiDoc extends Omit<WikiDocRow, 'status'> {
    status?: WikiStatus;
}

// Activity Logs
export type ActivityLogRow = Database['public']['Tables']['activity_logs']['Row'];
export interface ActivityLog extends Omit<ActivityLogRow, 'action' | 'entity_type'> {
    action: ActivityType;
    entity_type: 'Idea' | 'Wiki' | 'Decision';
}

// Market Pulse
export type MarketPulseRow = Database['public']['Tables']['market_pulses']['Row'];
export interface MarketPulse extends Omit<MarketPulseRow, 'type' | 'severity'> {
    type: 'Funding' | 'Trend' | 'Competitor' | 'Regulatory';
    severity: 'High' | 'Medium' | 'Low';
}

// Synthesis
export type SynthesisSuggestionRow = Database['public']['Tables']['synthesis_suggestions']['Row'];
export interface SynthesisSuggestion extends SynthesisSuggestionRow { }

// Helper Interfaces (Not in DB)
export interface PostMortemReport {
    total_killed: number;
    top_reasons: { reason: string; count: number }[];
    avg_lifespan_days: number;
    opportunity_cost_estimate: number;
}


export interface KnowledgeNode {
    id: string;
    label: string;
    type: 'Idea' | 'Wiki' | 'Decision' | 'User' | 'Metric';
    status?: string;
}

export interface KnowledgeEdge {
    source: string;
    target: string;
    label?: string;
}

export interface KnowledgeGraphData {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
}
