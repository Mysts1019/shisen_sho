import PathLine from './PathLine.jsx';
import Tile from './Tile.jsx';
import { GAP_X, GAP_Y } from './layout.js';

const at = (list, r, c) => list?.find((p) => p.r === r && p.c === c);

/**
 * 테두리 칸까지 포함해 그린다 (경로 선과 같은 좌표계).
 * transposed면 화면에만 90도 돌려 그린다. 게임 좌표(r, c)는 그대로.
 */
export default function Board({ grid, selected, hint, fx, onSelect, cellW, transposed }) {
  const rows = transposed ? grid[0].length : grid.length; // 화면에 보이는 행·열 수
  const cols = transposed ? grid.length : grid[0].length;
  const toGame = (vr, vc) => (transposed ? { r: vc, c: vr } : { r: vr, c: vc });

  const cells = [];
  for (let vr = 0; vr < rows; vr++) {
    for (let vc = 0; vc < cols; vc++) {
      const { r, c } = toGame(vr, vc);
      cells.push(
        <Tile
          key={`${r}-${c}`}
          type={grid[r][c]}
          selected={selected?.r === r && selected?.c === c}
          hint={Boolean(at(hint, r, c))}
          shake={Boolean(at(fx?.shake, r, c))}
          vanishing={at(fx?.removed, r, c)?.type}
          onClick={() => onSelect(r, c)}
        />
      );
    }
  }

  const toView = (p) => (transposed ? { r: p.c, c: p.r } : p);
  const path = fx?.path?.map(toView);

  // 점수 팝업 위치: 마지막으로 누른 패 자리
  const gain = fx?.gain && { ...toView(fx.gain), points: fx.gain.points };
  const cellH = (cellW * 4) / 3;

  return (
    <div
      className="board"
      style={{
        '--cell-w': `${cellW}px`,
        gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
        gap: `${GAP_Y}px ${GAP_X}px`,
      }}
    >
      {cells}
      {path && <PathLine key={fx.id} path={path} rows={rows} cols={cols} cellW={cellW} />}
      {gain && (
        <span
          key={`gain-${fx.id}`}
          className="float-score"
          style={{
            left: gain.c * (cellW + GAP_X) + cellW / 2,
            top: gain.r * (cellH + GAP_Y) + cellH / 3,
          }}
        >
          +{gain.points}
        </span>
      )}
    </div>
  );
}
