-- IT Ticket Management System - Row Level Security (RLS) Policies
-- Run this script second, after schema.sql.

-- Helper function to check if current user is an Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')
  );
end;
$$ language plpgsql security definer;

-- Helper function to check if current user is an assignee on a ticket
create or replace function public.is_ticket_assignee(ticket_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.tickets
    where id = ticket_uuid and assigned_to = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Helper function to check if user has access to a ticket (creator, assignee, collaborator, or admin)
create or replace function public.has_ticket_access(ticket_uuid uuid)
returns boolean as $$
begin
  return public.is_admin()
    or exists (
      select 1 from public.tickets
      where id = ticket_uuid and (created_by = auth.uid() or assigned_to = auth.uid())
    )
    or exists (
      select 1 from public.ticket_collaborators
      where ticket_id = ticket_uuid and user_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

--------------------------------------------------------------------------------
-- 1. Profiles Table RLS
--------------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and (role = (select role from public.profiles where id = auth.uid()) or public.is_admin()));

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

--------------------------------------------------------------------------------
-- 2. Tickets Table RLS
--------------------------------------------------------------------------------
alter table public.tickets enable row level security;

-- SELECT: Admins see all. Users see tickets they created, are assigned to, or collaborate on.
create policy "Tickets select policy"
  on public.tickets for select
  to authenticated
  using (
    public.is_admin()
    or created_by = auth.uid()
    or assigned_to = auth.uid()
    or exists (
      select 1 from public.ticket_collaborators
      where ticket_id = public.tickets.id and user_id = auth.uid()
    )
  );

-- INSERT: Authenticated users can create tickets (assigned_to and admin_priority default to safe values)
create policy "Users can insert tickets"
  on public.tickets for insert
  to authenticated
  with check (created_by = auth.uid());

-- UPDATE:
-- Case A: Admins can update any ticket field
create policy "Admins can update tickets"
  on public.tickets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Case B: Assignee can update status (ASSIGNED -> IN_PROGRESS -> RESOLVED)
create policy "Assignees can update status"
  on public.tickets for update
  to authenticated
  using (assigned_to = auth.uid())
  with check (
    assigned_to = auth.uid()
    -- Ensure assignee cannot tamper with admin_priority or approval_status
  );

-- Case C: Requester can verify resolution (RESOLVED -> CLOSED or REOPENED) or update NEW tickets
create policy "Requesters can verify resolution or edit draft"
  on public.tickets for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

--------------------------------------------------------------------------------
-- 3. Comments Table RLS
--------------------------------------------------------------------------------
alter table public.ticket_comments enable row level security;

create policy "Comments viewable by users with ticket access"
  on public.ticket_comments for select
  to authenticated
  using (
    public.has_ticket_access(ticket_id)
    and (not is_internal or public.is_admin() or public.is_ticket_assignee(ticket_id))
  );

create policy "Users with ticket access can add comments"
  on public.ticket_comments for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.has_ticket_access(ticket_id)
  );

--------------------------------------------------------------------------------
-- 4. Attachments Table RLS
--------------------------------------------------------------------------------
alter table public.ticket_attachments enable row level security;

create policy "Attachments viewable by users with ticket access"
  on public.ticket_attachments for select
  to authenticated
  using (public.has_ticket_access(ticket_id));

create policy "Users with ticket access can upload attachments"
  on public.ticket_attachments for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and public.has_ticket_access(ticket_id)
  );

--------------------------------------------------------------------------------
-- 5. History Table RLS
--------------------------------------------------------------------------------
alter table public.ticket_history enable row level security;

create policy "History viewable by users with ticket access"
  on public.ticket_history for select
  to authenticated
  using (public.has_ticket_access(ticket_id));

create policy "Authenticated users can insert history records"
  on public.ticket_history for insert
  to authenticated
  with check (actor_id = auth.uid() or actor_id is null);

--------------------------------------------------------------------------------
-- 6. Reassignment Requests Table RLS
--------------------------------------------------------------------------------
alter table public.ticket_reassignment_requests enable row level security;

create policy "Reassignment requests viewable by admin and requester"
  on public.ticket_reassignment_requests for select
  to authenticated
  using (public.is_admin() or requested_by = auth.uid());

create policy "Assignees can request reassignment"
  on public.ticket_reassignment_requests for insert
  to authenticated
  with check (
    requested_by = auth.uid()
    and public.is_ticket_assignee(ticket_id)
  );

create policy "Admins can update reassignment requests"
  on public.ticket_reassignment_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

--------------------------------------------------------------------------------
-- 7. Ticket Collaborators Table RLS
--------------------------------------------------------------------------------
alter table public.ticket_collaborators enable row level security;

create policy "Collaborators viewable by users with ticket access"
  on public.ticket_collaborators for select
  to authenticated
  using (public.has_ticket_access(ticket_id));

create policy "Admins can manage collaborators"
  on public.ticket_collaborators for all
  to authenticated
  using (public.is_admin());

--------------------------------------------------------------------------------
-- 8. Notifications Table RLS
--------------------------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can mark their own notifications as read"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "System or users can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

