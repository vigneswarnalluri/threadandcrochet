-- ================================================================
-- Thread & Love — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with additional user data
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  date_of_birth date,
  address text,
  gender text,
  phone_number text,
  about_you text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policies: users can only read/write their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

-- Trigger fires on every new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------

-- 2. ORDERS TABLE
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  number text unique not null,
  date text,
  status text,
  invoice_href text default '#',
  total_quantity int default 0,
  subtotal numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  items jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table orders enable row level security;

create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------

-- 3. PRODUCTS TABLE (optional — for Supabase-backed products)
create table if not exists products (
  id text primary key,
  title text not null,
  handle text unique not null,
  collection_handles text[] default '{}',
  vendor text,
  price numeric(10,2),
  featured_image jsonb,
  images jsonb default '[]'::jsonb,
  rating numeric(3,2),
  review_number int default 0,
  status text,
  description text,
  features text[] default '{}',
  care_instruction text,
  shipping_and_return text,
  options jsonb default '[]'::jsonb,
  selected_options jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table products enable row level security;
create policy "Anyone can view products" on products for select using (true);

-- ----------------------------------------------------------------

-- 4. COLLECTIONS TABLE (optional — for Supabase-backed collections)
create table if not exists collections (
  id text primary key,
  title text not null,
  handle text unique not null,
  description text,
  sort_description text,
  color text,
  count int default 0,
  image jsonb,
  created_at timestamptz default now()
);

alter table collections enable row level security;
create policy "Anyone can view collections" on collections for select using (true);

-- ----------------------------------------------------------------

-- 5. WISHLISTS TABLE
create table if not exists wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id text not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table wishlists enable row level security;

create policy "Users can view own wishlists"
  on wishlists for select
  using (auth.uid() = user_id);

create policy "Users can insert own wishlists"
  on wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own wishlists"
  on wishlists for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------

-- 6. CART_ITEMS TABLE
create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id text not null,
  quantity int default 1 check (quantity > 0),
  size text,
  color text,
  created_at timestamptz default now(),
  unique(user_id, product_id, size, color)
);

alter table cart_items enable row level security;

create policy "Users can view own cart items"
  on cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own cart items"
  on cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cart items"
  on cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cart items"
  on cart_items for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------

-- 7. REVIEWS TABLE
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id text not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  title text,
  content text not null,
  author_name text not null,
  created_at timestamptz default now()
);

alter table reviews enable row level security;

create policy "Anyone can view reviews"
  on reviews for select
  using (true);

create policy "Authenticated users can insert reviews"
  on reviews for insert
  with check (auth.uid() = user_id);


