begin;

alter table public.patient_exercises
  add column if not exists completed boolean not null default false,
  add column if not exists completion_percentage integer not null default 0,
  add column if not exists accuracy_percentage integer,
  add column if not exists xp_earned integer not null default 0,
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_exercises'
      and policyname = 'patient_exercises_update_linked'
  ) then
    create policy patient_exercises_update_linked
    on public.patient_exercises for update
    to authenticated
    using (private.can_access_patient(patient_id))
    with check (private.can_access_patient(patient_id));
  end if;
end;
$$;

grant update (
  completed,
  completion_percentage,
  accuracy_percentage,
  xp_earned,
  completed_at
) on public.patient_exercises to authenticated;

notify pgrst, 'reload schema';

commit;
