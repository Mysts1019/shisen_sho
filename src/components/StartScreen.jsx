import { DIFFICULTIES, TIME_LIMIT_SEC } from '../data/difficulty.js';

export default function StartScreen({
  records,
  muted,
  playerName,
  onPlayerNameChange,
  onStart,
  onHelp,
  onToggleMute,
}) {
  return (
    <section className="start">
      <div className="seal large">
        四川
        <br />省
      </div>
      <h1>사천성</h1>
      <p className="rule">
        같은 패 두 개를 <b>두 번 이하로 꺾이는 선</b>으로 이어서 지우세요.
        <br />
        제한 시간 {TIME_LIMIT_SEC / 60}분 안에 모두 지우면 승리!
      </p>
      <label className="player-name">
        <span>닉네임</span>
        <input
          type="text"
          value={playerName}
          maxLength={20}
          placeholder="익명"
          onChange={(e) => onPlayerNameChange(e.target.value)}
        />
      </label>
      <div className="difficulty-list">
        {Object.values(DIFFICULTIES).map((d) => (
          <button key={d.id} type="button" className="difficulty" onClick={() => onStart(d.id)}>
            <strong>{d.label}</strong>
            <span>
              {d.rows}×{d.cols} · {d.types}종
            </span>
            <span className="best">최고 {records[d.id] ?? '-'}</span>
          </button>
        ))}
      </div>
      <div className="start-buttons">
        <button type="button" className="btn ghost" onClick={onHelp}>
          게임 방법
        </button>
        <a className="btn ghost" href="./dashboard.html">
          기록 대시보드
        </a>
        <button type="button" className="btn ghost" onClick={onToggleMute}>
          {muted ? '🔇 소리 꺼짐' : '🔊 소리 켜짐'}
        </button>
      </div>
    </section>
  );
}
