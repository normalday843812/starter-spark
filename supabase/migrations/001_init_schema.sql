-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('admin', 'staff', 'user');

-- TABLE: profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role user_role default 'user'::user_role,
  created_at timestamptz default now()
);

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TABLE: products
create table products (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  description text,
  price_cents integer not null,
  stripe_price_id text,
  specs jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- TABLE: licenses
create table licenses (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  product_id uuid references products(id) not null,
  owner_id uuid references profiles(id), -- Nullable: NULL means unclaimed
  source text check (source in ('online_purchase', 'physical_card')),
  stripe_session_id text unique, -- Idempotency Key
  created_at timestamptz default now()
);

-- INDEX for fast license lookup
create index licenses_code_idx on licenses (code);
create index licenses_owner_idx on licenses (owner_id);

-- TABLE: posts (The Lab)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  author_id uuid references profiles(id) not null,
  tags text[] default array[]::text[],
  upvotes integer default 0,
  created_at timestamptz default now()
);

-- TABLE: comments (The Lab)
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  content text not null,
  author_id uuid references profiles(id) not null,
  is_staff_reply boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table products enable row level security;
alter table licenses enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

-- POLICIES

-- Profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Products
create policy "Products are viewable by everyone"
  on products for select using (true);

-- Licenses
-- Critical Security: Only Service Role can INSERT/UPDATE licenses
-- Users can only VIEW their own licenses
create policy "Users can view own licenses"
  on licenses for select using (auth.uid() = owner_id);

-- Posts
create policy "Posts are viewable by everyone"
  on posts for select using (true);

create policy "Authenticated users can create posts"
  on posts for insert with check (auth.role() = 'authenticated');

create policy "Users can update own posts"
  on posts for update using (auth.uid() = author_id);

-- Comments
create policy "Comments are viewable by everyone"
  on comments for select using (true);

create policy "Authenticated users can create comments"
  on comments for insert with check (auth.role() = 'authenticated');
