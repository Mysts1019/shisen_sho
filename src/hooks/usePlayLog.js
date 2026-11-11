import { useEffect, useRef } from 'react';
import { logPlay } from '../lib/plays.js';

const isEnded = (status) => status === 'cleared' || status === 'gameover';

/** 판이 시작될 때와 끝날 때 플레이 기록을 보낸다 */
export function usePlayLog(game, player) {
  const prevRef = useRef(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = game;
    if (!game) return;

    const samePlay = prev?.id === game.id;

    if (!samePlay) {
      logPlay({ event: 'game-start', play_id: game.id, player, level: game.difficultyId });
    }

    if (isEnded(game.status) && !(samePlay && isEnded(prev.status))) {
      const playedMs = Date.now() - game.startedAt - game.pausedTotalMs;
      logPlay({
        event: 'game-end',
        play_id: game.id,
        player,
        level: game.difficultyId,
        score: game.score + game.bonus,
        cleared: game.status === 'cleared',
        duration_sec: Math.max(0, Math.round(playedMs / 1000)),
      });
    }
    // player는 판 도중에 바뀌지 않으므로 game 변화만 본다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);
}
