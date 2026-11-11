// 대시보드 집계 (순수 함수)
import { DIFFICULTIES } from '../data/difficulty.js';

const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);
const HOUR = 60 * 60 * 1000;

/** rows: plays 테이블 행 (최근 순). level: 'all' | 'easy' | 'normal' | 'hard' */
export function summarize(rows, level = 'all', now = Date.now()) {
  const filtered = level === 'all' ? rows : rows.filter((r) => r.level === level);
  const starts = filtered.filter((r) => r.event === 'game-start');
  const ends = filtered.filter((r) => r.event === 'game-end');
  const endedIds = new Set(ends.map((r) => r.play_id));

  const kpi = {
    plays: starts.length,
    finished: ends.length,
    clearRate: ends.length ? ends.filter((r) => r.cleared).length / ends.length : null,
    avgScore: avg(ends.map((r) => r.score ?? 0)),
    avgDuration: avg(ends.map((r) => r.duration_sec ?? 0)),
    players: new Set(filtered.map((r) => r.player)).size,
    // 시작했지만 끝 기록이 없는 판 (중간에 나감 + 지금 진행 중)
    unfinishedRate: starts.length
      ? starts.filter((s) => !endedIds.has(s.play_id)).length / starts.length
      : null,
  };

  // 난이도별 표는 필터와 상관없이 전체 기준
  const byLevel = Object.values(DIFFICULTIES).map((d) => {
    const s = rows.filter((r) => r.level === d.id && r.event === 'game-start');
    const e = rows.filter((r) => r.level === d.id && r.event === 'game-end');
    return {
      id: d.id,
      label: d.label,
      plays: s.length,
      clearRate: e.length ? e.filter((r) => r.cleared).length / e.length : null,
      avgScore: avg(e.map((r) => r.score ?? 0)),
      best: e.length ? Math.max(...e.map((r) => r.score ?? 0)) : null,
    };
  });

  const ranking = [...ends].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 10);
  const recent = ends.slice(0, 15);

  // 최근 24시간, 1시간 단위 플레이 수 (시작 기록 기준)
  const lastHour = Math.floor(now / HOUR) * HOUR;
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const start = lastHour - (23 - i) * HOUR;
    return { start, count: 0 };
  });
  for (const s of starts) {
    const t = new Date(s.created_at).getTime();
    const idx = 23 - Math.floor((lastHour - Math.floor(t / HOUR) * HOUR) / HOUR);
    if (idx >= 0 && idx < 24) hourly[idx].count++;
  }

  return { kpi, byLevel, ranking, recent, hourly };
}

export const levelLabel = (id) => DIFFICULTIES[id]?.label ?? id ?? '-';

export const formatNumber = (n, digits = 0) =>
  n === null || n === undefined
    ? '-'
    : n.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const formatPercent = (r) => (r === null ? '-' : `${Math.round(r * 100)}%`);

export const formatDuration = (sec) => {
  if (sec === null || sec === undefined) return '-';
  const s = Math.round(sec);
  return s >= 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`;
};

export const formatTime = (iso) =>
  new Date(iso).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
