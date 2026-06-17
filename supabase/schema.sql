-- Agent Ledger Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  timestamp text not null,
  type text not null check (type in ('deposit', 'withdrawal', 'bill-payment', 'airtime', 'float-topup')),
  amount bigint not null check (amount > 0),
  reference text default '',
  is_successful boolean default true,
  commission bigint default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional — disable for simple apps)
alter table transactions enable row level security;

-- Allow anonymous inserts
create policy "Allow anonymous inserts" on transactions
  for insert with check (true);

-- Allow anonymous reads
create policy "Allow anonymous reads" on transactions
  for select using (true);

-- Allow anonymous deletes (for clearing demo data)
create policy "Allow anonymous deletes" on transactions
  for delete using (true);

-- Seed data (optional — uncomment to pre-populate)
-- insert into transactions (id, timestamp, type, amount, reference, is_successful, commission) values
--   (gen_random_uuid(), '11:42 AM', 'deposit', 50000, '240615001', true, 1000),
--   (gen_random_uuid(), '11:27 AM', 'withdrawal', 15000, '240615002', true, 300),
--   (gen_random_uuid(), '11:10 AM', 'float-topup', 100000, '240615003', true, 2000);
