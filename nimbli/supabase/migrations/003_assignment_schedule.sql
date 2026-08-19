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

commit;
