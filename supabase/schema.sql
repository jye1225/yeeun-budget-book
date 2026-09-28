create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  auth_email text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Read own profile'
  ) then
    create policy "Read own profile"
    on public.profiles for select
    to authenticated
    using ((select auth.uid()) = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Create own profile'
  ) then
    create policy "Create own profile"
    on public.profiles for insert
    to authenticated
    with check ((select auth.uid()) = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Update own profile'
  ) then
    create policy "Update own profile"
    on public.profiles for update
    to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);
  end if;
end
$$;

create or replace function public.is_username_available(requested_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username = lower(trim(requested_username))
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

create table if not exists public.budget_books (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);

alter table public.budget_books enable row level security;
revoke all on table public.budget_books from anon;
grant select, insert, update on table public.budget_books to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'budget_books' and policyname = 'Read own budget book'
  ) then
    create policy "Read own budget book"
    on public.budget_books for select
    to authenticated
    using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'budget_books' and policyname = 'Create own budget book'
  ) then
    create policy "Create own budget book"
    on public.budget_books for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'budget_books' and policyname = 'Update own budget book'
  ) then
    create policy "Update own budget book"
    on public.budget_books for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
  end if;
end
$$;

create table if not exists public.budget_book_backups (
  user_id uuid not null references auth.users(id) on delete cascade,
  backup_date date not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, backup_date)
);

alter table public.budget_book_backups enable row level security;
revoke all on table public.budget_book_backups from anon;
grant select, insert, update on table public.budget_book_backups to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'budget_book_backups' and policyname = 'Read own backups'
  ) then
    create policy "Read own backups"
    on public.budget_book_backups for select
    to authenticated
    using ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'budget_book_backups' and policyname = 'Create own backups'
  ) then
    create policy "Create own backups"
    on public.budget_book_backups for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'budget_book_backups' and policyname = 'Update own backups'
  ) then
    create policy "Update own backups"
    on public.budget_book_backups for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'budget_books'
  ) then
    alter publication supabase_realtime add table public.budget_books;
  end if;
end
$$;
