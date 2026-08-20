begin;

grant update (
  completed,
  completion_percentage,
  accuracy_percentage,
  xp_earned,
  completed_at
) on public.patient_exercises to authenticated;

notify pgrst, 'reload schema';

commit;
