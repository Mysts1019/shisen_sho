import Board from './Board.jsx';
import { GAP_X, GAP_Y } from './layout.js';
import { useElementSize } from '../hooks/useElementSize.js';

/** 주어진 영역에 rows x cols 보드를 넣을 때 가능한 패 너비 (패 비율 3:4) */
function fitCellWidth(width, height, rows, cols) {
  const byWidth = (width - GAP_X * (cols - 1)) / cols;
  const byHeight = ((height - GAP_Y * (rows - 1)) / rows) * 0.75;
  return Math.floor(Math.min(byWidth, byHeight, 64));
}

/** 남은 화면 공간을 재서 보드 크기를 정한다. 세로 화면이면 보드를 돌려서 더 크게 그린다 */
export default function BoardArea({ game, onSelect, hidden = false }) {
  const [ref, { width, height }] = useElementSize();
  const rows = game.grid.length;
  const cols = game.grid[0].length;

  const normal = fitCellWidth(width, height, rows, cols);
  const rotated = fitCellWidth(width, height, cols, rows);
  const transposed = rotated > normal;
  const cellW = Math.max(transposed ? rotated : normal, 0);

  return (
    // 일시정지 중에는 패를 가려서 멈춘 채로 수를 찾지 못하게 한다
    <div className={`board-area${hidden ? ' hidden' : ''}`} ref={ref}>
      {cellW > 0 && (
        <Board
          key={game.shuffleId}
          grid={game.grid}
          selected={game.selected}
          hint={game.hint}
          fx={game.fx}
          onSelect={onSelect}
          cellW={cellW}
          transposed={transposed}
        />
      )}
    </div>
  );
}
