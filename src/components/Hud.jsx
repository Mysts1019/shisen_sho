function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function Hud({
  difficulty,
  timeLeft,
  score,
  combo,
  remaining,
  hintsLeft,
  shufflesLeft,
  canHint,
  muted,
  onHint,
  onShuffle,
  onPause,
  onRestart,
  onMenu,
  onToggleMute,
}) {
  return (
    <header className="hud">
      <div className="hud-info">
        <span className="seal small">四川省</span>
        <span className="badge">{difficulty.label}</span>
        <span
          className={`timer${timeLeft <= 20 ? ' warn' : ''}${timeLeft <= 10 ? ' danger' : ''}`}
        >
          {formatTime(timeLeft)}
        </span>
        <span className="stat">
          점수 <b>{score}</b>
        </span>
        <span className="stat">
          남은 패 <b>{remaining}</b>
        </span>
        {combo > 1 && <span className="combo">콤보 ×{combo}</span>}
      </div>
      <div className="hud-buttons">
        <button type="button" className="btn" onClick={onHint} disabled={!canHint}>
          힌트 <b>{hintsLeft}</b>
        </button>
        <button type="button" className="btn" onClick={onShuffle} disabled={shufflesLeft <= 0}>
          섞기 <b>{shufflesLeft}</b>
        </button>
        <button type="button" className="btn ghost" onClick={onPause}>
          일시정지
        </button>
        <button type="button" className="btn ghost" onClick={onRestart}>
          다시 하기
        </button>
        <button type="button" className="btn ghost" onClick={onMenu}>
          난이도
        </button>
        <button
          type="button"
          className="btn ghost icon"
          onClick={onToggleMute}
          aria-label={muted ? '소리 켜기' : '소리 끄기'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
}
