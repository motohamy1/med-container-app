-- ============================================================
-- Migration: Push Notifications
-- Adds devices table (Expo push tokens) and
-- user_notifications table (notification log + read state)
-- Safe: no existing tables are touched.
-- ============================================================

-- Cancel any running statement if this file is edited mid-run.
-- Run once per project. Safe to re-run (idempotent upsert pattern in app layer).

create table if not exists devices (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade not null,
  token      text not null,
  platform   text check (platform in ('ios', 'android')) not null,
  active     boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, platform)
);

create table if not exists user_notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade not null,
  title      text,
  body       text,
  data       jsonb default '{}'::jsonb,
  read       boolean default false,
  created_at timestamptz default now()
);

-- Indexes for the two most common query patterns:
-- 1) "which devices belong to this user?"  (used on login to refresh tokens)
create index if not exists devices_user_id_idx on devices (user_id);
-- 2) "which notifications are unread for this user?" (notification center)
create index if not exists user_notifications_user_read_idx
  on user_notifications (user_id, read);

-- Row-level security (only if your project already uses RLS; harmless otherwise)
alter table devices enable row level security;
alter table user_notifications enable row level security;

-- Policies
create policy "Users can view their own devices"
  on devices for select
  using (auth.uid() = user_id);

create policy "Users can insert their own devices"
  on devices for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own devices"
  on devices for update
  using (auth.uid() = user_id);

create policy "Users can delete their own devices"
  on devices for delete
  using (auth.uid() = user_id);

create policy "Users can view their own notifications"
  on user_notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
  on user_notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update (e.g. mark read) their own notifications"
  on user_notifications for update
  using (auth.uid() = user_id);
