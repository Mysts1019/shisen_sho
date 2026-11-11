export default function ResultModal({
  status,
  score,
  bonus,
  remaining,
  best,
  isNewRecord,
  onRestart,
  onMenu,
}) {
  const cleared = status === 'cleared';
  return (
    <div className="overlay">
      <div className="modal">
        <div className="seal">{cleared ? '勝' : '終'}</div>
        <h2>{cleared ? '클리어!' : '시간 종료'}</h2>
        <dl className="score-table">
          {cleared ? (
            <>
              <dt>매칭 점수</dt>
              <dd>{score}</dd>
              <dt>시간 보너스</dt>
              <dd>+{bonus}</dd>
            </>
          ) : (
            <>
              <dt>남은 패</dt>
              <dd>{remaining}</dd>
            </>
          )}
          <dt>총점</dt>
          <dd className="total">{score + bonus}</dd>
          <dt>최고 기록</dt>
          <dd>{best ?? '-'}</dd>
        </dl>
        {isNewRecord && <p className="new-record">🎉 신기록!</p>}
        <div className="modal-buttons">
          <button type="button" className="btn" onClick={onRestart}>
            다시 하기
          </button>
          <button type="button" className="btn ghost" onClick={onMenu}>
            난이도 선택
          </button>
        </div>
      </div>
    </div>
  );
}
