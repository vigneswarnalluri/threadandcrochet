-- ================================================================
-- Thread & Crochet — Supabase Database Schema
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
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
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

drop policy if exists "Users can view own orders" on orders;
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own orders" on orders;
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
drop policy if exists "Anyone can view products" on products;
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
drop policy if exists "Anyone can view collections" on collections;
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

drop policy if exists "Users can view own wishlists" on wishlists;
create policy "Users can view own wishlists"
  on wishlists for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own wishlists" on wishlists;
create policy "Users can insert own wishlists"
  on wishlists for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlists" on wishlists;
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

drop policy if exists "Users can view own cart items" on cart_items;
create policy "Users can view own cart items"
  on cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own cart items" on cart_items;
create policy "Users can insert own cart items"
  on cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cart items" on cart_items;
create policy "Users can update own cart items"
  on cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cart items" on cart_items;
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

drop policy if exists "Anyone can view reviews" on reviews;
create policy "Anyone can view reviews"
  on reviews for select
  using (true);

drop policy if exists "Authenticated users can insert reviews" on reviews;
create policy "Authenticated users can insert reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------

-- 8. DISCOUNT CODES TABLE
create table if not exists discount_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount numeric(10,2) not null,
  type text check (type in ('percent', 'fixed')) not null,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);

alter table discount_codes enable row level security;
drop policy if exists "Anyone can view active discount codes" on discount_codes;
create policy "Anyone can view active discount codes" on discount_codes for select using (active = true);
drop policy if exists "Admins can manage discount codes" on discount_codes;
create policy "Admins can manage discount codes" on discount_codes for all using (true);

-- ----------------------------------------------------------------

-- 9. SCHEMA MODIFICATIONS FOR ADVANCED DASHBOARD

-- Add stock level to products catalog
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 10;

-- Add blocked status to customer profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;

-- Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and Policies for settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
drop policy if exists "Anyone can view store settings" on public.store_settings;
CREATE POLICY "Anyone can view store settings" ON public.store_settings FOR SELECT USING (true);
drop policy if exists "Admins can manage store settings" on public.store_settings;
CREATE POLICY "Admins can manage store settings" ON public.store_settings FOR ALL USING (true);

-- Seed initial settings
INSERT INTO public.store_settings (key, value) VALUES
  ('announcement', '"Free shipping on all prepaid orders over ₹999!"'::jsonb),
  ('contact', '{"phone": "+91 98765 43210", "email": "support@threadandcrochet.com"}'::jsonb),
  ('rates', '{"tax": 5, "shipping": 99}'::jsonb),
  ('banners', '[
    {
      "title": "Artisanal Crochet Masterpieces",
      "subtitle": "Lovingly hand-knitted baby wearables & cushions",
      "image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1000",
      "link": "/collection/jackets"
    },
    {
      "title": "Cute Accessories & Gifts",
      "subtitle": "Perfect little amigurumi keychains & bags",
      "image": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000",
      "link": "/collection/accessories"
    }
  ]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------
-- 10. ADDITIONAL COLUMN MIGRATIONS (run if not yet applied)

-- Add updated_at tracking to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add role column to profiles (used for admin access control)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add courier tracking columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- 11. ENTERPRISE FEATURE MIGRATIONS (Phase 2)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'New',
  reply_body text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert support tickets" ON public.support_tickets;
CREATE POLICY "Anyone can insert support tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.support_tickets FOR ALL USING (true);

-- 12. STOCK LOGS TABLE
CREATE TABLE IF NOT EXISTS public.stock_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  change integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage stock logs" ON public.stock_logs;
CREATE POLICY "Admins can manage stock logs" ON public.stock_logs FOR ALL USING (true);
DROP POLICY IF EXISTS "Anyone can view stock logs" ON public.stock_logs;
CREATE POLICY "Anyone can view stock logs" ON public.stock_logs FOR SELECT USING (true);

-- 13. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can manage audit logs" ON public.admin_audit_logs FOR ALL USING (true);


-- 14. PHASES 7 SCHEMA EXPANSION

-- Store Credit column in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_credit numeric(10,2) DEFAULT 0.00;

-- Gift Cards table
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  balance numeric(10,2) NOT NULL,
  initial_balance numeric(10,2) NOT NULL,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active gift cards" ON public.gift_cards;
CREATE POLICY "Anyone can view active gift cards" ON public.gift_cards FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins can manage gift cards" ON public.gift_cards;
CREATE POLICY "Admins can manage gift cards" ON public.gift_cards FOR ALL USING (true);

-- Storefront Visitors tracking table
CREATE TABLE IF NOT EXISTS public.storefront_visitors (
  session_id text PRIMARY KEY,
  user_email text,
  current_page text NOT NULL,
  cart_items_count integer DEFAULT 0,
  last_active_at timestamptz DEFAULT now()
);

ALTER TABLE public.storefront_visitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage storefront visitors" ON public.storefront_visitors;
CREATE POLICY "Anyone can manage storefront visitors" ON public.storefront_visitors FOR ALL USING (true);

-- Product SEO Fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_image text;



