import { GAP_X, GAP_Y } from './layout.js';

// 보드의 실제 픽셀 좌표계로 연결 선을 그린다
export default function PathLine({ path, rows, cols, cellW }) {
  const cellH = (cellW * 4) / 3;
  const width = cols * cellW + (cols - 1) * GAP_X;
  const height = rows * cellH + (rows - 1) * GAP_Y;
  const points = path
    .map((p) => `${p.c * (cellW + GAP_X) + cellW / 2},${p.r * (cellH + GAP_Y) + cellH / 2}`)
    .join(' ');
  return (
    <svg className="path-line" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        points={points}
        pathLength="1"
        style={{ strokeWidth: Math.max(3, cellW * 0.1) }}
      />
    </svg>
  );
}
