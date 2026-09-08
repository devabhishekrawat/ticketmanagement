-- IT Ticket Management System - Database Schema
-- Run this script first in your Supabase SQL Editor.

-- 1. Profiles Table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'USER' check (role in ('USER', 'ADMIN', 'MANAGER', 'SUPPORT_AGENT', 'SUPER_ADMIN')),
  department text default 'General',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Tickets Table
create sequence if not exists ticket_number_seq start 1001;

create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  ticket_number text unique not null default ('TIK-' || nextval('ticket_number_seq')::text),
  title text not null,
  description text not null,
  category text not null check (category in ('Hardware', 'Software', 'Network', 'Access & Security', 'Email & Accounts', 'Other')),
  impact text not null check (impact in ('Low', 'Medium', 'High', 'Critical')),
  user_priority text not null check (user_priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  admin_priority text not null check (admin_priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status text not null default 'NEW' check (status in ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED', 'REJECTED', 'CANCELLED')),
  approval_status text not null default 'PENDING' check (approval_status in ('PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason text,
  created_by uuid references public.profiles(id) on delete set null not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  reopen_count int not null default 0,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Comments Table
create table if not exists public.ticket_comments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null not null,
  content text not null,
  is_internal boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Attachments Table (metadata only; actual files stored in Supabase Storage)
create table if not exists public.ticket_attachments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. History / Audit Log Table
create table if not exists public.ticket_history (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  old_value text,
  new_value text,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. Reassignment Requests Table
create table if not exists public.ticket_reassignment_requests (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  requested_by uuid references public.profiles(id) on delete set null not null,
  reason text not null,
  suggested_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  admin_notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  resolved_at timestamptz
);

-- 7. Ticket Collaborators Table
create table if not exists public.ticket_collaborators (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(ticket_id, user_id)
);

-- 8. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  ticket_id uuid references public.tickets(id) on delete cascade,
  is_read boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indices for performance
create index if not exists idx_tickets_created_by on public.tickets(created_by);
create index if not exists idx_tickets_assigned_to on public.tickets(assigned_to);
create index if not exists idx_tickets_status on public.tickets(status);
create index if not exists idx_comments_ticket_id on public.ticket_comments(ticket_id);
create index if not exists idx_history_ticket_id on public.ticket_history(ticket_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- Auto create profile on auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'USER'),
    coalesce(new.raw_user_meta_data->>'department', 'General')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

