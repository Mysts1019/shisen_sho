export default function PauseModal({ onResume, onRestart, onMenu }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="seal">休</div>
        <h2>일시정지</h2>
        <p>시간이 멈춰 있어요.</p>
        <div className="modal-buttons">
          <button type="button" className="btn" onClick={onResume}>
            계속하기
          </button>
          <button type="button" className="btn ghost" onClick={onRestart}>
            다시 하기
          </button>
          <button type="button" className="btn ghost" onClick={onMenu}>
            난이도
          </button>
        </div>
      </div>
    </div>
  );
}
