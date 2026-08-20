begin;

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

revoke update (
  completed,
  completion_percentage,
  accuracy_percentage,
  xp_earned,
  completed_at
) on public.patient_exercises from authenticated;

revoke all on function public.complete_patient_exercise(
  uuid,
  uuid,
  integer,
  integer
) from public, anon;

grant execute on function public.complete_patient_exercise(
  uuid,
  uuid,
  integer,
  integer
) to authenticated;

commit;
