# Supabase Setup Notes

This project uses Supabase with the anon key on the frontend only. Never use `service_role` keys in the browser.

## Auth (Email/Password)
- Client usage is in `lib/static-api.js` via `supabase.auth.signInWithPassword` and `supabase.auth.signUp`.

## Storage: `media` bucket
- Uploads go to the `media` bucket via `lib/supabase-storage.js`.
- Only store public URLs in your database. `uploadMedia` returns `{ path, publicUrl }`.

## RLS Policies (Public read, authenticated write)
Enable RLS on the tables you need and add policies similar to:

```sql
-- Example: courses table
alter table public.courses enable row level security;

create policy "Public read courses"
on public.courses
for select
to anon, authenticated
using (true);

create policy "Authenticated write courses"
on public.courses
for insert, update, delete
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);
```

Storage policies for the `media` bucket:

```sql
-- Public read for storage objects
create policy "Public read media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'media');

-- Authenticated write for storage objects
create policy "Authenticated write media"
on storage.objects
for insert, update, delete
to authenticated
with check (bucket_id = 'media' and auth.uid() is not null);
```

Adjust table/bucket names to match your schema.

## Admin Access
The `/admin` route checks the `profiles` table for `role = 'admin'` (or `is_admin = true`).
If no profile exists for a logged-in user, the app will create one with admin access.
