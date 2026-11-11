import { useCallback, useEffect, useState } from 'react';
import {
  countTiles,
  createBoard,
  findAnyMove,
  findPath,
  hasMove,
  shuffleBoard,
} from '../logic/board.js';
import {
  HINT_PENALTY,
  SHUFFLE_PENALTY,
  applyPenalty,
  nextCombo,
  pairScore,
  timeBonus,
} from '../logic/score.js';
import { DIFFICULTIES, HINT_COUNT, SHUFFLE_COUNT, TIME_LIMIT_SEC } from '../data/difficulty.js';
import { useTimer } from './useTimer.js';

const FX_DURATION_MS = 600; // 경로 선·제거·흔들림·점수 팝업 표시 시간

function newPlayId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createGame(difficultyId) {
  const d = DIFFICULTIES[difficultyId];
  const now = Date.now();
  return {
    id: newPlayId(), // 한 판을 구분하는 id (기록용)
    startedAt: now,
    pausedTotalMs: 0, // 일시정지로 멈춰 있던 시간 합계 (플레이 시간 계산용)
    difficultyId,
    grid: createBoard(d.rows, d.cols, d.types),
    selected: null, // { r, c }
    status: 'playing', // 'playing' | 'paused' | 'cleared' | 'gameover'
    message: '',
    score: 0, // 매칭 점수 합계 (감점 반영)
    bonus: 0, // 클리어 시 남은 시간 보너스
    combo: 0,
    lastMatchAt: 0,
    endAt: now + TIME_LIMIT_SEC * 1000,
    pausedAt: 0,
    pausedLeftMs: 0, // 일시정지 때 남아 있던 시간
    hintsLeft: HINT_COUNT,
    shufflesLeft: SHUFFLE_COUNT,
    hint: null, // 힌트로 표시 중인 두 칸 [{r,c},{r,c}]
    shuffleId: 0, // 섞일 때마다 증가 (배치 애니메이션용)
    fxSeq: 0,
    fx: null, // { id, path?, removed?, shake?, gain? } 잠깐 보여줄 효과
  };
}

function withFx(g, fx) {
  const fxSeq = g.fxSeq + 1;
  return { ...g, fxSeq, fx: { id: fxSeq, ...fx } };
}

const same = (a, b) => a.r === b.r && a.c === b.c;

export function useGame() {
  const [game, setGame] = useState(null); // null = 난이도 선택 화면

  const playing = game?.status === 'playing';
  const timeLeft = useTimer(game?.endAt ?? 0, playing, TIME_LIMIT_SEC);

  // 시간 종료 → 게임 오버
  useEffect(() => {
    if (playing && timeLeft === 0) {
      setGame((g) =>
        g?.status === 'playing' ? { ...g, status: 'gameover', selected: null, message: '' } : g
      );
    }
  }, [playing, timeLeft]);

  // 효과는 잠깐 보여주고 지운다
  const fxId = game?.fx?.id;
  useEffect(() => {
    if (!fxId) return undefined;
    const t = setTimeout(
      () => setGame((g) => (g?.fx?.id === fxId ? { ...g, fx: null } : g)),
      FX_DURATION_MS
    );
    return () => clearTimeout(t);
  }, [fxId]);

  const selectTile = useCallback((r, c) => {
    setGame((g) => {
      if (!g || g.status !== 'playing' || g.grid[r][c] === null) return g;
      const now = Date.now();
      if (now >= g.endAt) return g;

      const cell = { r, c };
      const first = g.selected;
      if (!first) return { ...g, selected: cell, message: '' };
      if (same(first, cell)) return { ...g, selected: null };

      // 다른 글자를 누르면 그 패로 선택을 옮긴다
      const type = g.grid[r][c];
      if (g.grid[first.r][first.c] !== type) return { ...g, selected: cell, message: '' };

      // 같은 글자인데 연결이 안 되면 흔들림
      const path = findPath(g.grid, first, cell);
      if (!path) {
        return withFx(
          { ...g, selected: null, message: '연결할 수 없습니다' },
          { shake: [first, cell] }
        );
      }

      // 매칭 성공
      let grid = g.grid.map((row) => [...row]);
      grid[first.r][first.c] = null;
      grid[r][c] = null;

      // 패가 사라지면 경로는 막히지 않으므로, 힌트 칸이 남아 있으면 힌트 유지
      const hint = g.hint && g.hint.every((p) => grid[p.r][p.c] !== null) ? g.hint : null;
      const combo = nextCombo(g.combo, g.lastMatchAt, now);
      const points = pairScore(combo);
      let next = withFx(
        {
          ...g,
          grid,
          selected: null,
          hint,
          message: '',
          combo,
          lastMatchAt: now,
          score: g.score + points,
        },
        {
          path,
          removed: [
            { ...first, type },
            { ...cell, type },
          ],
          gain: { ...cell, points },
        }
      );

      if (countTiles(grid) === 0) {
        const secondsLeft = Math.ceil((g.endAt - now) / 1000);
        return { ...next, status: 'cleared', bonus: timeBonus(secondsLeft) };
      }
      if (!hasMove(grid)) {
        next = {
          ...next,
          grid: shuffleBoard(grid),
          hint: null,
          shuffleId: g.shuffleId + 1,
          message: '연결할 패가 없어 자동으로 섞었습니다',
        };
      }
      return next;
    });
  }, []);

  const showHint = useCallback(() => {
    setGame((g) => {
      if (!g || g.status !== 'playing' || g.hintsLeft <= 0 || g.hint) return g;
      const move = findAnyMove(g.grid);
      if (!move) return { ...g, message: '연결할 수 있는 패가 없습니다' };
      return {
        ...g,
        hint: move,
        hintsLeft: g.hintsLeft - 1,
        score: applyPenalty(g.score, HINT_PENALTY),
        message: `힌트 사용 -${HINT_PENALTY}점`,
      };
    });
  }, []);

  const shuffle = useCallback(() => {
    setGame((g) => {
      if (!g || g.status !== 'playing' || g.shufflesLeft <= 0) return g;
      return {
        ...g,
        grid: shuffleBoard(g.grid),
        selected: null,
        hint: null,
        fx: null,
        shuffleId: g.shuffleId + 1,
        shufflesLeft: g.shufflesLeft - 1,
        score: applyPenalty(g.score, SHUFFLE_PENALTY),
        message: `섞기 사용 -${SHUFFLE_PENALTY}점`,
      };
    });
  }, []);

  const pause = useCallback(() => {
    setGame((g) => {
      if (!g || g.status !== 'playing') return g;
      const now = Date.now();
      return { ...g, status: 'paused', pausedAt: now, pausedLeftMs: Math.max(0, g.endAt - now) };
    });
  }, []);

  const resume = useCallback(() => {
    setGame((g) => {
      if (!g || g.status !== 'paused') return g;
      const now = Date.now();
      const shift = now - g.pausedAt; // 멈춰 있던 시간만큼 콤보 기준 시각도 미룬다
      return {
        ...g,
        status: 'playing',
        endAt: now + g.pausedLeftMs,
        pausedTotalMs: g.pausedTotalMs + shift,
        lastMatchAt: g.lastMatchAt ? g.lastMatchAt + shift : 0,
      };
    });
  }, []);

  // 다른 탭·앱으로 나가면 자동 일시정지
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause]);

  const startGame = useCallback((difficultyId) => setGame(createGame(difficultyId)), []);
  const restart = useCallback(() => setGame((g) => createGame(g.difficultyId)), []);
  const toMenu = useCallback(() => setGame(null), []);

  return {
    game,
    difficulty: game ? DIFFICULTIES[game.difficultyId] : null,
    remaining: game ? countTiles(game.grid) : 0,
    timeLeft,
    selectTile,
    showHint,
    shuffle,
    pause,
    resume,
    startGame,
    restart,
    toMenu,
  };
}
