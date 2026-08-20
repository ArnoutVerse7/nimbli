-- Run after 001_initial_schema.sql to configure the exercise media bucket.
begin;

insert into storage.buckets (id, name, public, file_size_limit)
values ('exercise-videos', 'exercise-videos', true, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists exercise_media_public_read on storage.objects;
drop policy if exists exercise_media_kinesist_upload on storage.objects;
drop policy if exists exercise_media_owner_update on storage.objects;
drop policy if exists exercise_media_owner_delete on storage.objects;

create policy exercise_media_public_read
on storage.objects
for select
to public
using (bucket_id = 'exercise-videos');

create policy exercise_media_kinesist_upload
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'exercise-videos'
  and owner_id = (select auth.uid()::text)
  and private.is_kinesist()
);

create policy exercise_media_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'exercise-videos'
  and owner_id = (select auth.uid()::text)
  and private.is_kinesist()
)
with check (
  bucket_id = 'exercise-videos'
  and owner_id = (select auth.uid()::text)
  and private.is_kinesist()
);

create policy exercise_media_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'exercise-videos'
  and owner_id = (select auth.uid()::text)
  and private.is_kinesist()
);

commit;
