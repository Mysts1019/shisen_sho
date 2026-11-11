-- 사천성 플레이 기록 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  play_id text not null,                                    -- 한 판을 구분하는 id (시작·끝 기록을 잇는다)
  game text not null default 'shisen-sho',                  -- 게임 id (팀 통합 대비)
  event text not null check (event in ('game-start', 'game-end')),
  player text not null default '익명' check (char_length(player) between 1 and 20),
  level text,                                               -- easy / normal / hard
  score integer check (score between -1000 and 100000),     -- game-end 만
  cleared boolean,                                          -- game-end 만
  duration_sec integer check (duration_sec between 0 and 3600)  -- game-end 만
);

create index if not exists plays_created_at_idx on public.plays (created_at desc);

-- 누구나 기록을 추가하고 읽을 수 있다. 수정·삭제는 불가.
alter table public.plays enable row level security;

drop policy if exists "anyone can insert plays" on public.plays;
create policy "anyone can insert plays" on public.plays
  for insert to anon, authenticated with check (true);

drop policy if exists "anyone can read plays" on public.plays;
create policy "anyone can read plays" on public.plays
  for select to anon, authenticated using (true);

grant select, insert on public.plays to anon, authenticated;
