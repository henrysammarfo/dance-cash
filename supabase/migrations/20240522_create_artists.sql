-- Create Artists Table
create table public.artists (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  studio_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  bio text,
  instagram text,
  website text,
  image_url text,
  constraint artists_pkey primary key (id)
);

-- Add RLS policies for Artists
alter table public.artists enable row level security;

create policy "Artists are viewable by everyone"
  on public.artists for select
  using (true);

create policy "Studios can insert their own artists"
  on public.artists for insert
  with check (auth.uid() = studio_id);

create policy "Studios can update their own artists"
  on public.artists for update
  using (auth.uid() = studio_id);

create policy "Studios can delete their own artists"
  on public.artists for delete
  using (auth.uid() = studio_id);

-- Update Events Table to link to Artists
alter table public.events 
add column artist_id uuid references public.artists (id) on delete set null;
