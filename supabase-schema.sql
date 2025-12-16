-- SeedLab Database Schema for Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspaces
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspace members
create table public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (workspace_id, user_id)
);

-- Ideas
create table public.ideas (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  title text not null,
  description text,
  tags text[] default '{}',
  status text default 'inbox' check (status in ('inbox', 'evaluating', 'experiment', 'launched', 'killed')),
  avg_score integer,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  linked_issue_url text
);

-- Evaluations
create table public.evaluations (
  id uuid default uuid_generate_v4() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  evaluator_id uuid references public.profiles(id) on delete set null,
  market_score integer check (market_score >= 1 and market_score <= 5),
  revenue_score integer check (revenue_score >= 1 and revenue_score <= 5),
  effort_score integer check (effort_score >= 1 and effort_score <= 5),
  team_fit_score integer check (team_fit_score >= 1 and team_fit_score <= 5),
  learning_score integer check (learning_score >= 1 and learning_score <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Post mortems (kill log)
create table public.post_mortems (
  id uuid default uuid_generate_v4() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null unique,
  reason text not null,
  learnings text,
  would_reconsider_when text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Waitlist
create table public.waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index ideas_workspace_id_idx on public.ideas(workspace_id);
create index ideas_status_idx on public.ideas(status);
create index evaluations_idea_id_idx on public.evaluations(idea_id);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.ideas enable row level security;
alter table public.evaluations enable row level security;
alter table public.post_mortems enable row level security;
alter table public.waitlist enable row level security;

-- Policies

-- Profiles: users can read all profiles, update their own
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Workspaces: members can view their workspaces
create policy "Workspace members can view workspace" on public.workspaces
  for select using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = id and user_id = auth.uid()
    )
  );

create policy "Authenticated users can create workspaces" on public.workspaces
  for insert with check (auth.role() = 'authenticated');

-- Ideas: workspace members can CRUD ideas
create policy "Workspace members can view ideas" on public.ideas
  for select using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = ideas.workspace_id and user_id = auth.uid()
    )
  );

create policy "Workspace members can create ideas" on public.ideas
  for insert with check (
    exists (
      select 1 from public.workspace_members
      where workspace_id = ideas.workspace_id and user_id = auth.uid()
    )
  );

create policy "Workspace members can update ideas" on public.ideas
  for update using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = ideas.workspace_id and user_id = auth.uid()
    )
  );

create policy "Workspace members can delete ideas" on public.ideas
  for delete using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = ideas.workspace_id and user_id = auth.uid()
    )
  );

-- Evaluations: workspace members can CRUD evaluations
create policy "Workspace members can view evaluations" on public.evaluations
  for select using (
    exists (
      select 1 from public.ideas i
      join public.workspace_members wm on wm.workspace_id = i.workspace_id
      where i.id = evaluations.idea_id and wm.user_id = auth.uid()
    )
  );

create policy "Workspace members can create evaluations" on public.evaluations
  for insert with check (
    exists (
      select 1 from public.ideas i
      join public.workspace_members wm on wm.workspace_id = i.workspace_id
      where i.id = evaluations.idea_id and wm.user_id = auth.uid()
    )
  );

-- Post mortems: same as ideas
create policy "Workspace members can view post mortems" on public.post_mortems
  for select using (
    exists (
      select 1 from public.ideas i
      join public.workspace_members wm on wm.workspace_id = i.workspace_id
      where i.id = post_mortems.idea_id and wm.user_id = auth.uid()
    )
  );

create policy "Workspace members can create post mortems" on public.post_mortems
  for insert with check (
    exists (
      select 1 from public.ideas i
      join public.workspace_members wm on wm.workspace_id = i.workspace_id
      where i.id = post_mortems.idea_id and wm.user_id = auth.uid()
    )
  );

-- Waitlist: anyone can insert, no one can read
create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

-- Functions

-- Automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update avg_score when evaluation is added
create or replace function public.update_idea_avg_score()
returns trigger as $$
declare
  avg_total integer;
begin
  select round(avg(
    (market_score + revenue_score + (6 - effort_score) + team_fit_score + learning_score) * 100.0 / 25
  ))
  into avg_total
  from public.evaluations
  where idea_id = new.idea_id;
  
  update public.ideas
  set avg_score = avg_total, updated_at = now()
  where id = new.idea_id;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_evaluation_created
  after insert on public.evaluations
  for each row execute procedure public.update_idea_avg_score();

