-- RealTrack — private file storage
-- A single private bucket for documents, receipts, and progress photos. Files
-- are pathed by project id: `<project_id>/<...>`. Never public — the app
-- serves them via short-lived signed URLs (HANDOFF §1, §5).

insert into storage.buckets (id, name, public)
values ('files', 'files', false)
on conflict (id) do nothing;

-- Access is granted only when the first path segment is a project the user
-- owns. storage.foldername(name)[1] is that leading `<project_id>` segment.
do $$
declare op text;
begin
  foreach op in array array['select','insert','update','delete']
  loop
    execute format('drop policy if exists "files_%s_own" on storage.objects;', op);
  end loop;
end $$;

create policy "files_select_own" on storage.objects
  for select using (
    bucket_id = 'files'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1] and p.owner_id = auth.uid()
    )
  );

create policy "files_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'files'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1] and p.owner_id = auth.uid()
    )
  );

create policy "files_update_own" on storage.objects
  for update using (
    bucket_id = 'files'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1] and p.owner_id = auth.uid()
    )
  );

create policy "files_delete_own" on storage.objects
  for delete using (
    bucket_id = 'files'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[1] and p.owner_id = auth.uid()
    )
  );
