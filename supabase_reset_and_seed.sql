-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ============================================================
-- 2. WIPE ALL TABLE DATA (CLEAN SLATE)
-- ============================================================
TRUNCATE TABLE 
  public.ticket_comments,
  public.ticket_history,
  public.ticket_attachments,
  public.ticket_collaborators,
  public.ticket_reassignment_requests,
  public.tickets,
  public.profiles
RESTART IDENTITY CASCADE;

-- Delete old auth identities & users so all credentials refresh cleanly
DELETE FROM auth.identities WHERE provider = 'email';
DELETE FROM auth.users WHERE email IN (
  'admin@company.com',
  'employee@company.com',
  'agent@company.com',
  'sarah.net@company.com',
  'marcus.hw@company.com',
  'priya.sec@company.com',
  'david.mgr@company.com',
  'jessica.hd@company.com',
  'daniel.eng@company.com',
  'rachel.design@company.com',
  'abhishek@company.com',
  'ankit@company.com',
  'anshuman@company.com'
);

-- ============================================================
-- 3. INSERT AUTH USERS (ALL PASSWORDS: user123)
-- ============================================================
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES
  -- 1. Rahul Sharma (ADMIN)
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rahul Sharma"}',
    now(), now(), '', '', '', ''
  ),
  -- 2. Priya Verma (USER)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'employee@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Priya Verma"}',
    now(), now(), '', '', '', ''
  ),
  -- 3. Rohit Kumar (SUPPORT_AGENT)
  (
    '00000000-0000-0000-0000-000000000000',
    'c0000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'agent@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rohit Kumar"}',
    now(), now(), '', '', '', ''
  ),
  -- 4. Sneha Patel (SUPPORT_AGENT)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000010',
    'authenticated',
    'authenticated',
    'sarah.net@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sneha Patel"}',
    now(), now(), '', '', '', ''
  ),
  -- 5. Manav Joshi (SUPPORT_AGENT)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000011',
    'authenticated',
    'authenticated',
    'marcus.hw@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Manav Joshi"}',
    now(), now(), '', '', '', ''
  ),
  -- 6. Pooja Gupta (SUPPORT_AGENT)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000012',
    'authenticated',
    'authenticated',
    'priya.sec@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Pooja Gupta"}',
    now(), now(), '', '', '', ''
  ),
  -- 7. Deepak Mehta (MANAGER)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000013',
    'authenticated',
    'authenticated',
    'david.mgr@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Deepak Mehta"}',
    now(), now(), '', '', '', ''
  ),
  -- 8. Jyoti Singh (SUPPORT_AGENT)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000014',
    'authenticated',
    'authenticated',
    'jessica.hd@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jyoti Singh"}',
    now(), now(), '', '', '', ''
  ),
  -- 9. Devendra Rao (USER)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000015',
    'authenticated',
    'authenticated',
    'daniel.eng@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Devendra Rao"}',
    now(), now(), '', '', '', ''
  ),
  -- 10. Riya Sen (USER)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000016',
    'authenticated',
    'authenticated',
    'rachel.design@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Riya Sen"}',
    now(), now(), '', '', '', ''
  ),
  -- 11. Abhishek Rawat (USER)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000020',
    'authenticated',
    'authenticated',
    'abhishek@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Abhishek Rawat"}',
    now(), now(), '', '', '', ''
  ),
  -- 12. Ankit Raj (USER)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000021',
    'authenticated',
    'authenticated',
    'ankit@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ankit Raj"}',
    now(), now(), '', '', '', ''
  ),
  -- 13. Anshuman Dixit (USER)
  (
    '00000000-0000-0000-0000-000000000000',
    'b0000000-0000-0000-0000-000000000022',
    'authenticated',
    'authenticated',
    'anshuman@company.com',
    extensions.crypt('user123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Anshuman Dixit"}',
    now(), now(), '', '', '', ''
  );

-- ============================================================
-- 4. INSERT AUTH IDENTITIES (ENABLES LOGIN FOR ALL USERS)
-- ============================================================
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'email', 'admin@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000002', 'email', 'employee@company.com'), 'email', now(), now(), now()),
  ('c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', jsonb_build_object('sub', 'c0000000-0000-0000-0000-000000000003', 'email', 'agent@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000010', 'email', 'sarah.net@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000011', 'email', 'marcus.hw@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000012', 'email', 'priya.sec@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000013', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000013', 'email', 'david.mgr@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000014', 'email', 'jessica.hd@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000015', 'email', 'daniel.eng@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000016', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000016', 'email', 'rachel.design@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000020', 'email', 'abhishek@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000021', 'email', 'ankit@company.com'), 'email', now(), now(), now()),
  ('b0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000022', jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000022', 'email', 'anshuman@company.com'), 'email', now(), now(), now());

-- ============================================================
-- 5. INSERT PROFILES (INDIAN NAMES & ROLES)
-- ============================================================
INSERT INTO public.profiles (id, email, full_name, role, department)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@company.com', 'Rahul Sharma', 'ADMIN', 'IT Infrastructure'),
  ('b0000000-0000-0000-0000-000000000002', 'employee@company.com', 'Priya Verma', 'USER', 'Marketing'),
  ('c0000000-0000-0000-0000-000000000003', 'agent@company.com', 'Rohit Kumar', 'SUPPORT_AGENT', 'IT Helpdesk'),
  ('b0000000-0000-0000-0000-000000000010', 'sarah.net@company.com', 'Sneha Patel', 'SUPPORT_AGENT', 'Network Infrastructure'),
  ('b0000000-0000-0000-0000-000000000011', 'marcus.hw@company.com', 'Manav Joshi', 'SUPPORT_AGENT', 'Workplace Support'),
  ('b0000000-0000-0000-0000-000000000012', 'priya.sec@company.com', 'Pooja Gupta', 'SUPPORT_AGENT', 'Access & Security'),
  ('b0000000-0000-0000-0000-000000000013', 'david.mgr@company.com', 'Deepak Mehta', 'MANAGER', 'IT Operations'),
  ('b0000000-0000-0000-0000-000000000014', 'jessica.hd@company.com', 'Jyoti Singh', 'SUPPORT_AGENT', 'IT Helpdesk'),
  ('b0000000-0000-0000-0000-000000000015', 'daniel.eng@company.com', 'Devendra Rao', 'USER', 'Engineering'),
  ('b0000000-0000-0000-0000-000000000016', 'rachel.design@company.com', 'Riya Sen', 'USER', 'Product & Design'),
  ('b0000000-0000-0000-0000-000000000020', 'abhishek@company.com', 'Abhishek Rawat', 'USER', 'Engineering'),
  ('b0000000-0000-0000-0000-000000000021', 'ankit@company.com', 'Ankit Raj', 'USER', 'Product'),
  ('b0000000-0000-0000-0000-000000000022', 'anshuman@company.com', 'Anshuman Dixit', 'USER', 'Finance')
ON CONFLICT (id) DO UPDATE SET
  email = excluded.email,
  role = excluded.role,
  full_name = excluded.full_name,
  department = excluded.department;

-- ============================================================
-- 6. INSERT TICKETS (TIK-1001 TO TIK-1006)
-- ============================================================
INSERT INTO public.tickets (
  id,
  ticket_number,
  title,
  description,
  category,
  impact,
  user_priority,
  admin_priority,
  status,
  approval_status,
  created_by,
  assigned_to,
  created_at
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'TIK-1001',
    'Office 4th Floor Wi-Fi Dropping Constantly',
    'The Wi-Fi in meeting room 4B disconnects every 10 minutes during video calls.',
    'Network',
    'High',
    'HIGH',
    'HIGH',
    'IN_PROGRESS',
    'APPROVED',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    now() - interval '2 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'TIK-1002',
    'MacBook Pro Battery Swelling & Trackpad Stuck',
    'The battery is swelling on my laptop and pushing against the trackpad. Urgent replacement needed.',
    'Hardware',
    'Critical',
    'URGENT',
    'URGENT',
    'ASSIGNED',
    'APPROVED',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    now() - interval '1 day'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'TIK-1003',
    'Need Access to Production PostgreSQL Analytics',
    'Need read-only access to the BI reporting schema for Q3 performance audits.',
    'Access & Security',
    'Medium',
    'MEDIUM',
    'MEDIUM',
    'NEW',
    'PENDING',
    'b0000000-0000-0000-0000-000000000020',
    null,
    now() - interval '4 hours'
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'TIK-1004',
    'Figma Organization License Assignment',
    'New UI designer joined the marketing team and needs a Figma seat assigned.',
    'Software',
    'Low',
    'LOW',
    'LOW',
    'RESOLVED',
    'APPROVED',
    'b0000000-0000-0000-0000-000000000021',
    'c0000000-0000-0000-0000-000000000003',
    now() - interval '3 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'TIK-1005',
    'Outlook 365 Stuck on Loading Profile',
    'Outlook desktop client will not open since this morning Windows update.',
    'Email & Accounts',
    'Medium',
    'HIGH',
    'MEDIUM',
    'IN_PROGRESS',
    'APPROVED',
    'b0000000-0000-0000-0000-000000000022',
    'c0000000-0000-0000-0000-000000000003',
    now() - interval '6 hours'
  ),
  (
    'd0000000-0000-0000-0000-000000000006',
    'TIK-1006',
    'Replacement USB-C Docking Station',
    'Current Dell dock power adapter stopped delivering charge to dual monitors.',
    'Hardware',
    'Low',
    'LOW',
    'LOW',
    'CLOSED',
    'APPROVED',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    now() - interval '5 days'
  );

-- ============================================================
-- 7. INSERT TICKET COMMENTS
-- ============================================================
INSERT INTO public.ticket_comments (
  ticket_id,
  user_id,
  content,
  is_internal,
  created_at
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'Investigating the Cisco AP on floor 4. Channel interference detected.',
    false,
    now() - interval '1 day'
  ),
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'AP firmware needs an upgrade during off-hours maintenance.',
    true,
    now() - interval '20 hours'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Please stop charging the device immediately and bring it to the IT desk for safety.',
    false,
    now() - interval '18 hours'
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    'License provisioned and invitation email sent to designer.',
    false,
    now() - interval '2 days'
  );

-- ============================================================
-- 8. INSERT TICKET HISTORY
-- ============================================================
INSERT INTO public.ticket_history (
  ticket_id,
  actor_id,
  action,
  old_value,
  new_value,
  notes,
  created_at
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'STATUS_CHANGE',
    'NEW',
    'IN_PROGRESS',
    'Assigned and escalated to Network team',
    now() - interval '1 day'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'ASSIGNMENT',
    null,
    'Rahul Sharma',
    'Hardware team dispatched spare laptop',
    now() - interval '18 hours'
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    'STATUS_CHANGE',
    'IN_PROGRESS',
    'RESOLVED',
    'Figma invite accepted by user',
    now() - interval '2 days'
  );
