// 점수 규칙
export const PAIR_POINTS = 10; // 한 쌍 기본 점수
export const COMBO_WINDOW_MS = 3000; // 이 시간 안에 다음 매칭 시 콤보 +1
export const MAX_COMBO = 5;
export const TIME_BONUS_PER_SEC = 10; // 클리어 시 남은 시간 1초당

/** 이번 매칭 후의 콤보 배율 (1 ~ MAX_COMBO) */
export function nextCombo(combo, lastMatchAt, now) {
  const chained = lastMatchAt > 0 && now - lastMatchAt <= COMBO_WINDOW_MS;
  return chained ? Math.min(combo + 1, MAX_COMBO) : 1;
}

export const pairScore = (combo) => PAIR_POINTS * combo;

export const timeBonus = (secondsLeft) => secondsLeft * TIME_BONUS_PER_SEC;

// 힌트·섞기 감점 (언제 쓰든 그대로 빠지도록 0 아래로도 내려갈 수 있다)
export const HINT_PENALTY = 20;
export const SHUFFLE_PENALTY = 30;

export const applyPenalty = (score, penalty) => score - penalty;
