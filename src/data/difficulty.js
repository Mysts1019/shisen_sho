// 난이도 설정. 칸 수 = 종류 수 x 4
export const TIME_LIMIT_SEC = 120; // 난이도 상관없이 2분

export const DIFFICULTIES = {
  easy: { id: 'easy', label: '쉬움', rows: 4, cols: 6, types: 6 },
  normal: { id: 'normal', label: '보통', rows: 6, cols: 8, types: 12 },
  hard: { id: 'hard', label: '어려움', rows: 6, cols: 12, types: 18 },
};

// 한 판당 사용 가능 횟수
export const HINT_COUNT = 3;
export const SHUFFLE_COUNT = 2;
