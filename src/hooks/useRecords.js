import { useEffect, useState } from 'react';
import { loadRecords, saveRecord } from '../logic/records.js';

/** 판이 끝나면 최고 기록을 저장하고, 신기록 여부를 알려준다 */
export function useRecords(game) {
  const [records, setRecords] = useState(loadRecords);
  const [result, setResult] = useState({ gameKey: null, isNew: false });

  const ended = game?.status === 'cleared' || game?.status === 'gameover';
  const gameKey = ended ? game.endAt : null;

  useEffect(() => {
    if (!ended) return;
    const total = game.score + game.bonus;
    const prevBest = records[game.difficultyId] ?? 0;
    setResult({ gameKey, isNew: total > prevBest });
    setRecords((r) => saveRecord(r, game.difficultyId, total));
    // 판이 끝나는 순간 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey]);

  return { records, isNewRecord: ended && result.gameKey === gameKey && result.isNew };
}
