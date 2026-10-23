create type public.app_role as enum ('admin','lawyer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "admin update profiles" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null default auth.uid(),
  full_name text not null,
  mother_name text, birth_date date, national_id text, phone text, email text,
  address text, occupation text, notes text, photo_path text,
  created_at timestamptz not null default now()
);
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null default auth.uid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null, case_number text, court text, case_type text, opponent text,
  client_role text, status text not null default 'جارية', description text,
  next_session timestamptz, ai_analysis text, ai_analyzed_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null default auth.uid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  section text not null default 'general',
  name text not null, path text not null, mime text, size bigint, description text,
  created_at timestamptz not null default now()
);
create table public.fees (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null default auth.uid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null default 'payment',
  amount numeric not null default 0, note text, entry_date date not null default current_date,
  created_at timestamptz not null default now()
);
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null default auth.uid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  content text not null, done boolean not null default false, is_task boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.hearings (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null default auth.uid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  hearing_date timestamptz not null, note text, outcome text,
  created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['clients','cases','documents','fees','notes','hearings'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "owner all" on public.%I for all to authenticated using (lawyer_id = auth.uid()) with check (lawyer_id = auth.uid())', t);
  end loop; end $$;

create table public.law_articles (
  id uuid primary key default gen_random_uuid(),
  law_key text not null, article_number text not null, content text not null,
  created_at timestamptz not null default now()
);
grant select on public.law_articles to authenticated;
grant insert, update, delete on public.law_articles to authenticated;
grant all on public.law_articles to service_role;
alter table public.law_articles enable row level security;
create policy "read laws" on public.law_articles for select to authenticated using (true);
create policy "admin write laws" on public.law_articles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "lawyer files read" on storage.objects for select to authenticated using (bucket_id='client-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "lawyer files insert" on storage.objects for insert to authenticated with check (bucket_id='client-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "lawyer files delete" on storage.objects for delete to authenticated using (bucket_id='client-files' and (storage.foldername(name))[1] = auth.uid()::text);
