// 한자 패 목록 (40종). 같은 묶음은 같은 색을 쓴다.
const GROUPS = [
  { chars: '一二三四五六七八九', color: '#b3261e' }, // 숫자
  { chars: '東南西北中', color: '#1f3a93' },         // 방위
  { chars: '春夏秋冬', color: '#2e7d32' },           // 계절
  { chars: '梅蘭菊竹', color: '#6a1b9a' },           // 사군자
  { chars: '金木水火土', color: '#8d5524' },         // 오행
  { chars: '日月山風雲雪', color: '#00695c' },       // 자연
  { chars: '龍虎鳳龜鶴', color: '#c2185b' },         // 동물
  { chars: '福壽', color: '#212121' },               // 길상
];

export const TILES = GROUPS.flatMap((g) =>
  [...g.chars].map((char) => ({ char, color: g.color }))
);
