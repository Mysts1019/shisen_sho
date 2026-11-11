// 난이도별 최고 점수 (localStorage). 저장소를 못 쓰는 환경에서도 게임은 동작한다.
const KEY = 'shisen-sho:best';

export function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

/** 기존 기록보다 높으면 저장하고, 갱신된 기록 객체를 돌려준다 */
export function saveRecord(records, difficultyId, score) {
  if (score <= (records[difficultyId] ?? 0)) return records;
  const next = { ...records, [difficultyId]: score };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장 실패는 무시 (이번 세션 동안만 기록 유지)
  }
  return next;
}
