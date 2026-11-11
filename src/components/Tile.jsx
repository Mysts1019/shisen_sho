import { TILES } from '../data/tiles.js';

/**
 * type이 null이면 빈 칸. vanishing이면 방금 지워진 패의 사라지는 모습만 그린다.
 */
export default function Tile({ type, selected, hint, shake, vanishing, onClick }) {
  if (vanishing !== undefined) {
    const { char, color } = TILES[vanishing];
    return (
      <div className="cell tile vanish" style={{ color }} aria-hidden="true">
        {char}
      </div>
    );
  }
  if (type === null) return <div className="cell" />;

  const { char, color } = TILES[type];
  const cls = ['cell', 'tile', selected && 'selected', hint && 'hint', shake && 'shake']
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} style={{ color }} onClick={onClick}>
      {char}
    </button>
  );
}
