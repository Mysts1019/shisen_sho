// Supabase 플레이 기록 저장·조회
// .env.local 에 VITE_SUPABASE_URL, VITE_SUPABASE_KEY 가 없으면 아무것도 하지 않는다 (게임은 그대로 동작).
import { createClient } from '@supabase/supabase-js';

export const GAME_ID = 'shisen-sho';
const TABLE = 'plays';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

const supabase =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export const isConfigured = Boolean(supabase);

/** 플레이 기록 한 줄 저장. 실패해도 게임에는 영향을 주지 않는다 */
export async function logPlay(row) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from(TABLE).insert({ game: GAME_ID, ...row });
    if (error) console.warn('[plays] 저장 실패:', error.message);
  } catch (e) {
    console.warn('[plays] 저장 실패:', e);
  }
}

/** 이 게임의 기록 전체 (최근 순, 최대 10,000건) */
export async function fetchPlays() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('game', GAME_ID)
    .order('created_at', { ascending: false })
    .limit(10000);
  if (error) throw new Error(error.message);
  return data;
}
