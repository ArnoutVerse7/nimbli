begin;

alter table public.patient_exercises
  add column if not exists start_date date,
  add column if not exists end_date date;

update public.patient_exercises
set start_date = coalesce(start_date, assigned_at::date, current_date),
    end_date = coalesce(
      end_date,
      coalesce(start_date, assigned_at::date, current_date) + 13
    )
where start_date is null
   or end_date is null;

alter table public.patient_exercises
  alter column start_date set default current_date,
  alter column start_date set not null,
  alter column end_date set default (current_date + 13),
  alter column end_date set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'patient_exercises_schedule_dates_check'
      and conrelid = 'public.patient_exercises'::regclass
  ) then
    alter table public.patient_exercises
      add constraint patient_exercises_schedule_dates_check
      check (end_date >= start_date);
  end if;
end;
$$;

create index if not exists patient_exercises_schedule_idx
on public.patient_exercises (patient_id, start_date, end_date);

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

revoke all on function public.update_exercise_schedule(uuid, date, date)
from public, anon;

grant execute on function public.update_exercise_schedule(uuid, date, date)
to authenticated;

commit;
