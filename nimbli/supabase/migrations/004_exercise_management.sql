begin;

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

revoke all on function public.update_library_exercise(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public, anon;
revoke all on function public.delete_library_exercise(uuid) from public, anon;

grant execute on function public.update_library_exercise(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
grant execute on function public.delete_library_exercise(uuid) to authenticated;

commit;
