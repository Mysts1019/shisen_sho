import { HINT_COUNT, SHUFFLE_COUNT, TIME_LIMIT_SEC } from '../data/difficulty.js';
import { HINT_PENALTY, MAX_COMBO, SHUFFLE_PENALTY } from '../logic/score.js';

// 예시 그림용 미니 보드. 칸 하나 = 가로 3 x 세로 4 단위
const CW = 3;
const CH = 4;

function MiniBoard({ rows, cols, tiles, path, borderRow }) {
  const center = (r, c) => `${c * CW + CW / 2},${r * CH + CH / 2}`;
  return (
    <svg
      className="mini-board"
      viewBox={`-0.5 -0.5 ${cols * CW + 1} ${rows * CH + 1}`}
      role="img"
      aria-hidden="true"
    >
      <rect x="-0.5" y="-0.5" width={cols * CW + 1} height={rows * CH + 1} rx="1" fill="var(--felt)" />
      {borderRow !== undefined && (
        <rect
          x="0.1"
          y={borderRow * CH + 0.3}
          width={cols * CW - 0.2}
          height={CH - 0.6}
          rx="0.6"
          fill="none"
          stroke="var(--paper)"
          strokeOpacity="0.5"
          strokeWidth="0.12"
          strokeDasharray="0.5 0.4"
        />
      )}
      {tiles.map(({ r, c, ch, on }) => (
        <g key={`${r}-${c}`}>
          <rect
            x={c * CW + 0.15}
            y={r * CH + 0.2}
            width={CW - 0.3}
            height={CH - 0.4}
            rx="0.4"
            fill={on ? '#ffe28a' : 'var(--ivory)'}
            stroke={on ? 'var(--gold)' : 'var(--ivory-edge)'}
            strokeWidth="0.12"
          />
          <text
            x={c * CW + CW / 2}
            y={r * CH + CH / 2 + 0.75}
            textAnchor="middle"
            fontSize="2.1"
            fontWeight="900"
            fill={on ? 'var(--lacquer)' : '#7a6a55'}
          >
            {ch}
          </text>
        </g>
      ))}
      <polyline
        points={path.map(([r, c]) => center(r, c)).join(' ')}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const EXAMPLES = [
  {
    title: '직선',
    rows: 1,
    cols: 4,
    tiles: [
      { r: 0, c: 0, ch: '春', on: true },
      { r: 0, c: 3, ch: '春', on: true },
    ],
    path: [
      [0, 0],
      [0, 3],
    ],
  },
  {
    title: '한 번 꺾임',
    rows: 3,
    cols: 3,
    tiles: [
      { r: 0, c: 0, ch: '梅', on: true },
      { r: 0, c: 1, ch: '竹' },
      { r: 0, c: 2, ch: '菊' },
      { r: 1, c: 1, ch: '蘭' },
      { r: 2, c: 2, ch: '梅', on: true },
    ],
    path: [
      [0, 0],
      [2, 0],
      [2, 2],
    ],
  },
  {
    title: '두 번 꺾임 (테두리 이용)',
    rows: 3,
    cols: 4,
    borderRow: 0,
    tiles: [
      { r: 1, c: 0, ch: '龍', on: true },
      { r: 1, c: 1, ch: '虎' },
      { r: 1, c: 2, ch: '鳳' },
      { r: 1, c: 3, ch: '龍', on: true },
      { r: 2, c: 0, ch: '雲' },
      { r: 2, c: 1, ch: '山' },
      { r: 2, c: 2, ch: '月' },
      { r: 2, c: 3, ch: '日' },
    ],
    path: [
      [1, 0],
      [0, 0],
      [0, 3],
      [1, 3],
    ],
  },
];

export default function HelpModal({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal help-modal"
        role="dialog"
        aria-label="게임 방법"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>게임 방법</h2>
        <p>
          같은 글자 패 두 개를 차례로 누르세요. 두 패 사이를 <b>두 번 이하로 꺾이는 선</b>으로
          이을 수 있고, 그 길에 다른 패가 없으면 지워집니다.
        </p>

        <div className="examples">
          {EXAMPLES.map((ex) => (
            <figure key={ex.title}>
              <MiniBoard {...ex} />
              <figcaption>{ex.title}</figcaption>
            </figure>
          ))}
        </div>

        <ul className="help-list">
          <li>선은 보드 바깥 테두리(점선)로도 지나갈 수 있어요.</li>
          <li>{TIME_LIMIT_SEC / 60}분 안에 모두 지우면 승리. 남은 시간은 보너스 점수가 돼요.</li>
          <li>3초 안에 연달아 지우면 콤보 (최대 ×{MAX_COMBO}).</li>
          <li>
            힌트 {HINT_COUNT}회 (-{HINT_PENALTY}점), 섞기 {SHUFFLE_COUNT}회 (-{SHUFFLE_PENALTY}점).
            더 지울 패가 없으면 자동으로 섞여요.
          </li>
        </ul>

        <div className="modal-buttons">
          <button type="button" className="btn" onClick={onClose}>
            알겠어요
          </button>
        </div>
      </div>
    </div>
  );
}
