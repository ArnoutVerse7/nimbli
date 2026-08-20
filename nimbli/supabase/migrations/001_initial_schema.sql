begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.user_role as enum ('kinesist', 'parent');
exception
  when duplicate_object then null;
end
$$;

create schema if not exists private;
revoke all on schema private from public, anon;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  email text not null,
  full_name text not null default '',
  practice_name text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  kinesist_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  age integer not null check (age between 1 and 17),
  goal text not null default 'Motorische ontwikkeling ondersteunen',
  activation_code_hash text,
  activation_code_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index patients_active_code_hash_key
  on public.patients (activation_code_hash)
  where activation_code_hash is not null;

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null default '',
  category text not null default 'Mobiliteit',
  level text not null default 'Makkelijk',
  duration text not null default '2 min',
  reps text not null default '10 herhalingen',
  tracking_type text not null default 'generic' check (
    tracking_type in (
      'generic',
      'jumping_jack',
      'squat',
      'heel_drop',
      'knee_bend',
      'single_leg_balance'
    )
  ),
  cover_image text,
  video_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patient_exercises (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  accuracy_percentage integer check (accuracy_percentage between 0 and 100),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  assigned_at timestamptz not null default now(),
  start_date date not null default current_date,
  end_date date not null default (current_date + 13),
  completed_at timestamptz,
  constraint patient_exercises_schedule_dates_check check (end_date >= start_date),
  unique (patient_id, exercise_id)
);

create index patient_exercises_schedule_idx
on public.patient_exercises (patient_id, start_date, end_date);

create table public.logbook_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Nieuwe notitie',
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  kinesist_id uuid not null unique references public.profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger patients_set_updated_at
before update on public.patients
for each row execute function private.set_updated_at();

create trigger exercises_set_updated_at
before update on public.exercises
for each row execute function private.set_updated_at();

create trigger logbook_entries_set_updated_at
before update on public.logbook_entries
for each row execute function private.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' = 'kinesist'
      then 'kinesist'::public.user_role
    else 'parent'::public.user_role
  end;

  insert into public.profiles (
    id,
    role,
    email,
    full_name,
    practice_name,
    location
  ) values (
    new.id,
    requested_role,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'practice_name', ''),
    nullif(new.raw_user_meta_data ->> 'location', '')
  );

  if requested_role = 'kinesist' then
    insert into public.subscriptions (kinesist_id)
    values (new.id)
    on conflict (kinesist_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = coalesce(new.email, '')
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_email_changed
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function private.handle_user_email_change();

create or replace function private.is_kinesist()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'kinesist'
  );
$$;

create or replace function private.can_access_patient(requested_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.patients
    where id = requested_patient_id
      and (
        kinesist_id = (select auth.uid())
        or parent_id = (select auth.uid())
      )
  );
$$;

create or replace function private.make_activation_code()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select substring(upper(encode(extensions.gen_random_bytes(6), 'hex')) from 1 for 6);
$$;

create or replace function public.create_patient(
  p_first_name text,
  p_last_name text,
  p_age integer,
  p_goal text default 'Motorische ontwikkeling ondersteunen'
)
returns table (patient_id uuid, activation_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_patient_id uuid;
  new_activation_code text;
begin
  if not private.is_kinesist() then
    raise exception 'Alleen een kinesist kan een patiënt aanmaken.'
      using errcode = '42501';
  end if;

  if nullif(trim(p_first_name), '') is null
     or nullif(trim(p_last_name), '') is null
     or p_age not between 1 and 17 then
    raise exception 'Ongeldige patiëntgegevens.' using errcode = '22023';
  end if;

  new_activation_code := private.make_activation_code();

  insert into public.patients (
    kinesist_id,
    first_name,
    last_name,
    age,
    goal,
    activation_code_hash,
    activation_code_expires_at
  ) values (
    (select auth.uid()),
    trim(p_first_name),
    trim(p_last_name),
    p_age,
    coalesce(nullif(trim(p_goal), ''), 'Motorische ontwikkeling ondersteunen'),
    encode(extensions.digest(new_activation_code, 'sha256'), 'hex'),
    now() + interval '7 days'
  )
  returning id into new_patient_id;

  return query select new_patient_id, new_activation_code;
end;
$$;

create or replace function public.regenerate_activation_code(p_patient_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_activation_code text;
begin
  if not exists (
    select 1
    from public.patients
    where id = p_patient_id
      and kinesist_id = (select auth.uid())
      and parent_id is null
  ) then
    raise exception 'Patiënt niet gevonden of al gekoppeld.' using errcode = '42501';
  end if;

  new_activation_code := private.make_activation_code();

  update public.patients
  set activation_code_hash = encode(extensions.digest(new_activation_code, 'sha256'), 'hex'),
      activation_code_expires_at = now() + interval '7 days'
  where id = p_patient_id;

  return new_activation_code;
end;
$$;

create or replace function public.claim_patient(p_activation_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_patient_id uuid;
begin
  if not exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'parent'
  ) then
    raise exception 'Log in met een ouderaccount.' using errcode = '42501';
  end if;

  select id
  into claimed_patient_id
  from public.patients
  where parent_id is null
    and activation_code_hash = encode(
      extensions.digest(upper(trim(p_activation_code)), 'sha256'),
      'hex'
    )
    and activation_code_expires_at > now()
  for update skip locked
  limit 1;

  if claimed_patient_id is null then
    raise exception 'Activatiecode is ongeldig of verlopen.' using errcode = '22023';
  end if;

  update public.patients
  set parent_id = (select auth.uid()),
      activation_code_hash = null,
      activation_code_expires_at = null
  where id = claimed_patient_id;

  return claimed_patient_id;
end;
$$;

create or replace function public.update_exercise_schedule(
  p_assignment_id uuid,
  p_start_date date,
  p_end_date date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_start_date is null
     or p_end_date is null
     or p_end_date < p_start_date then
    raise exception 'Ongeldige planningsperiode.' using errcode = '22023';
  end if;

  update public.patient_exercises as assignment
  set start_date = p_start_date,
      end_date = p_end_date
  where assignment.id = p_assignment_id
    and exists (
      select 1
      from public.patients
      where id = assignment.patient_id
        and kinesist_id = (select auth.uid())
    );

  if not found then
    raise exception 'Toewijzing niet gevonden of geen toegang.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.complete_patient_exercise(
  p_patient_id uuid,
  p_exercise_id uuid,
  p_accuracy_percentage integer,
  p_xp_earned integer
)
returns public.patient_exercises
language plpgsql
security definer
set search_path = ''
as $$
declare
  completed_assignment public.patient_exercises;
begin
  if not private.can_access_patient(p_patient_id) then
    raise exception 'Geen toegang tot deze patiënt.' using errcode = '42501';
  end if;

  if p_accuracy_percentage is null
     or p_accuracy_percentage not between 0 and 100 then
    raise exception 'Ongeldig juistheidspercentage.' using errcode = '22023';
  end if;

  if p_xp_earned is null or p_xp_earned not between 0 and 50 then
    raise exception 'Ongeldige XP-waarde.' using errcode = '22023';
  end if;

  update public.patient_exercises as assignment
  set completed = true,
      completion_percentage = 100,
      accuracy_percentage = p_accuracy_percentage,
      xp_earned = p_xp_earned,
      completed_at = now()
  where assignment.patient_id = p_patient_id
    and assignment.exercise_id = p_exercise_id
  returning assignment.* into completed_assignment;

  if completed_assignment.id is null then
    raise exception 'Oefentoewijzing niet gevonden.' using errcode = '22023';
  end if;

  return completed_assignment;
end;
$$;

create or replace function public.update_library_exercise(
  p_exercise_id uuid,
  p_title text,
  p_description text,
  p_category text,
  p_level text,
  p_duration text,
  p_reps text,
  p_tracking_type text,
  p_cover_image text,
  p_video_url text
)
returns public.exercises
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_exercise public.exercises;
begin
  if not private.is_kinesist() then
    raise exception 'Alleen een kinesist kan een oefening aanpassen.'
      using errcode = '42501';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'De oefening heeft een naam nodig.'
      using errcode = '22023';
  end if;

  if coalesce(nullif(trim(p_tracking_type), ''), 'generic') not in (
    'generic',
    'jumping_jack',
    'squat',
    'heel_drop',
    'knee_bend',
    'single_leg_balance'
  ) then
    raise exception 'Ongeldig type bewegingscontrole.'
      using errcode = '22023';
  end if;

  update public.exercises as exercise
  set title = trim(p_title),
      description = coalesce(trim(p_description), ''),
      category = coalesce(nullif(trim(p_category), ''), 'Mobiliteit'),
      level = coalesce(nullif(trim(p_level), ''), 'Makkelijk'),
      duration = coalesce(nullif(trim(p_duration), ''), '2 min'),
      reps = coalesce(nullif(trim(p_reps), ''), '10 herhalingen'),
      tracking_type = coalesce(nullif(trim(p_tracking_type), ''), 'generic'),
      cover_image = nullif(trim(p_cover_image), ''),
      video_url = nullif(trim(p_video_url), '')
  where exercise.id = p_exercise_id
    and (
      exercise.created_by is null
      or exercise.created_by = (select auth.uid())
    )
  returning exercise.* into updated_exercise;

  if updated_exercise.id is null then
    raise exception 'Oefening niet gevonden of geen toegang.'
      using errcode = '42501';
  end if;

  return updated_exercise;
end;
$$;

create or replace function public.delete_library_exercise(p_exercise_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_kinesist() then
    raise exception 'Alleen een kinesist kan een oefening verwijderen.'
      using errcode = '42501';
  end if;

  delete from public.exercises as exercise
  where exercise.id = p_exercise_id
    and (
      exercise.created_by is null
      or exercise.created_by = (select auth.uid())
    );

  if not found then
    raise exception 'Oefening niet gevonden of geen toegang.'
      using errcode = '42501';
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.exercises enable row level security;
alter table public.patient_exercises enable row level security;
alter table public.logbook_entries enable row level security;
alter table public.subscriptions enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy patients_select_linked
on public.patients for select
to authenticated
using (
  kinesist_id = (select auth.uid())
  or parent_id = (select auth.uid())
);

create policy patients_update_kinesist
on public.patients for update
to authenticated
using (kinesist_id = (select auth.uid()) and private.is_kinesist())
with check (kinesist_id = (select auth.uid()) and private.is_kinesist());

create policy patients_delete_kinesist
on public.patients for delete
to authenticated
using (kinesist_id = (select auth.uid()) and private.is_kinesist());

create policy exercises_select_authenticated
on public.exercises for select
to authenticated
using (true);

create policy exercises_insert_kinesist
on public.exercises for insert
to authenticated
with check (created_by = (select auth.uid()) and private.is_kinesist());

create policy exercises_update_owner
on public.exercises for update
to authenticated
using (created_by = (select auth.uid()) and private.is_kinesist())
with check (created_by = (select auth.uid()) and private.is_kinesist());

create policy exercises_delete_owner
on public.exercises for delete
to authenticated
using (created_by = (select auth.uid()) and private.is_kinesist());

create policy patient_exercises_select_linked
on public.patient_exercises for select
to authenticated
using (private.can_access_patient(patient_id));

create policy patient_exercises_insert_kinesist
on public.patient_exercises for insert
to authenticated
with check (
  assigned_by = (select auth.uid())
  and private.is_kinesist()
  and exists (
    select 1
    from public.patients
    where id = patient_id
      and kinesist_id = (select auth.uid())
  )
);

create policy patient_exercises_update_linked
on public.patient_exercises for update
to authenticated
using (private.can_access_patient(patient_id))
with check (private.can_access_patient(patient_id));

create policy patient_exercises_delete_kinesist
on public.patient_exercises for delete
to authenticated
using (
  private.is_kinesist()
  and exists (
    select 1
    from public.patients
    where id = patient_id
      and kinesist_id = (select auth.uid())
  )
);

create policy logbook_select_linked
on public.logbook_entries for select
to authenticated
using (private.can_access_patient(patient_id));

create policy logbook_insert_kinesist
on public.logbook_entries for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and private.is_kinesist()
  and exists (
    select 1
    from public.patients
    where id = patient_id
      and kinesist_id = (select auth.uid())
  )
);

create policy logbook_update_author
on public.logbook_entries for update
to authenticated
using (author_id = (select auth.uid()) and private.is_kinesist())
with check (author_id = (select auth.uid()) and private.is_kinesist());

create policy logbook_delete_author
on public.logbook_entries for delete
to authenticated
using (author_id = (select auth.uid()) and private.is_kinesist());

create policy subscriptions_select_own
on public.subscriptions for select
to authenticated
using (kinesist_id = (select auth.uid()));

create policy subscriptions_insert_own
on public.subscriptions for insert
to authenticated
with check (kinesist_id = (select auth.uid()) and private.is_kinesist());

create policy subscriptions_update_own
on public.subscriptions for update
to authenticated
using (kinesist_id = (select auth.uid()) and private.is_kinesist())
with check (kinesist_id = (select auth.uid()) and private.is_kinesist());

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, practice_name, location) on public.profiles to authenticated;

grant select, update, delete on public.patients to authenticated;
grant select, insert, update, delete on public.exercises to authenticated;
grant select, insert, delete on public.patient_exercises to authenticated;
grant update (
  completed,
  completion_percentage,
  accuracy_percentage,
  xp_earned,
  completed_at
) on public.patient_exercises to authenticated;
grant select, insert, update, delete on public.logbook_entries to authenticated;
grant select, insert, update on public.subscriptions to authenticated;

revoke all on function public.create_patient(text, text, integer, text) from public, anon;
revoke all on function public.regenerate_activation_code(uuid) from public, anon;
revoke all on function public.claim_patient(text) from public, anon;
revoke all on function public.update_exercise_schedule(uuid, date, date) from public, anon;
revoke all on function public.complete_patient_exercise(uuid, uuid, integer, integer) from public, anon;
revoke all on function public.update_library_exercise(uuid, text, text, text, text, text, text, text, text, text) from public, anon;
revoke all on function public.delete_library_exercise(uuid) from public, anon;
grant execute on function public.create_patient(text, text, integer, text) to authenticated;
grant execute on function public.regenerate_activation_code(uuid) to authenticated;
grant execute on function public.claim_patient(text) to authenticated;
grant execute on function public.update_exercise_schedule(uuid, date, date) to authenticated;
grant execute on function public.complete_patient_exercise(uuid, uuid, integer, integer) to authenticated;
grant execute on function public.update_library_exercise(uuid, text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.delete_library_exercise(uuid) to authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_kinesist() to authenticated;
grant execute on function private.can_access_patient(uuid) to authenticated;

insert into public.exercises (title, description, category, level, duration, reps, tracking_type)
values
  (
    'Op Eén Been Staan',
    'Blijf zo stabiel mogelijk op één been staan.',
    'Evenwicht',
    'Makkelijk',
    '2 min',
    '3 rondes',
    'single_leg_balance'
  ),
  (
    'Jumping Jacks',
    'Spring met armen en benen open en keer gecontroleerd terug.',
    'Conditie',
    'Makkelijk',
    '2 min',
    '10 herhalingen',
    'jumping_jack'
  ),
  (
    'Heel Drop',
    'Laat de hiel gecontroleerd zakken om de mobiliteit te trainen.',
    'Mobiliteit',
    'Makkelijk',
    '2 min',
    '10 herhalingen',
    'heel_drop'
  ),
  (
    'Squats',
    'Buig door de knieën en houd de rug recht.',
    'Kracht',
    'Gemiddeld',
    '3 min',
    '10 herhalingen',
    'squat'
  ),
  (
    'Knie Buigen',
    'Buig en strek de knie langzaam en gecontroleerd.',
    'Mobiliteit',
    'Makkelijk',
    '2 min',
    '10 herhalingen',
    'knee_bend'
  )
on conflict (title) do nothing;

commit;
