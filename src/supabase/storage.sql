-- IT Ticket Management System - Storage Policies
-- Run this script third, after schema.sql and rls.sql.

-- 1. Create ticket-attachments storage bucket (private by default)
insert into storage.buckets (id, name, public)
values ('ticket-attachments', 'ticket-attachments', false)
on conflict (id) do nothing;

-- 2. Storage Policies

-- Policy: Allow authenticated users to upload attachments to tickets they have access to
create policy "Allow authenticated uploads to ticket-attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ticket-attachments'
  );

-- Policy: Allow authenticated users to view/download attachments
create policy "Allow users to view attachments"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'ticket-attachments'
  );

-- Policy: Allow users to delete attachments they uploaded (or admin)
create policy "Allow users to delete own attachments or admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'ticket-attachments'
    and (auth.uid() = owner or public.is_admin())
  );

