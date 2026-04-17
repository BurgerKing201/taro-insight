-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  birth_date date,
  subscribed boolean default false,
  subscribed_until timestamptz,
  created_at timestamptz default now()
);

-- Module usage tracking
create table public.module_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  module text not null,
  used_at date default current_date not null,
  unique(user_id, module, used_at)
);

-- History of readings
create table public.readings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  module text not null,           -- 'tarot' | 'numerology' | 'compatibility' | 'horoscope'
  title text,                     -- short label, e.g. card name or sign
  input jsonb,                    -- what user entered
  result text,                    -- AI response text
  created_at timestamptz default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.module_usage enable row level security;
alter table public.readings enable row level security;

-- Profiles: user can only read/update their own
create policy "Own profile" on public.profiles
  for all using (auth.uid() = id);

-- Module usage: user can only read/insert their own
create policy "Own usage" on public.module_usage
  for all using (auth.uid() = user_id);

-- Readings: user can only read/insert their own
create policy "Own readings" on public.readings
  for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
