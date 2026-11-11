import { useEffect, useRef, useState } from 'react';
import { sounds, unlockAudio } from '../audio/sound.js';

const MUTE_KEY = 'shisen-sho:muted';

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

/** 게임 상태 변화를 보고 알맞은 효과음을 낸다 */
export function useGameSounds(game, timeLeft) {
  const [muted, setMuted] = useState(loadMuted);
  const prevRef = useRef(game);

  // 모바일은 사용자 터치가 있어야 소리가 나므로 첫 입력 때 오디오를 깨운다
  useEffect(() => {
    const wake = () => unlockAudio();
    window.addEventListener('pointerdown', wake, { once: true });
    return () => window.removeEventListener('pointerdown', wake);
  }, []);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = game;
    if (muted || !game || !prev || prev.endAt !== game.endAt) return; // 새 판 시작은 무음

    if (prev.status === 'playing' && game.status === 'cleared') return sounds.clear();
    if (prev.status === 'playing' && game.status === 'gameover') return sounds.gameover();

    if (game.fx && game.fx.id !== prev.fx?.id) {
      if (game.fx.removed) sounds.match(game.combo);
      if (game.fx.shake) sounds.fail();
    }
    if (game.shuffleId !== prev.shuffleId) sounds.shuffle();
    if (game.hint && game.hint !== prev.hint) sounds.hint();
    if (game.selected && game.selected !== prev.selected) sounds.select();
  }, [game, muted]);

  // 마지막 10초 초침 소리
  const playing = game?.status === 'playing';
  useEffect(() => {
    if (!muted && playing && timeLeft > 0 && timeLeft <= 10) sounds.tick();
  }, [timeLeft, playing, muted]);

  const toggleMute = () =>
    setMuted((m) => {
      try {
        localStorage.setItem(MUTE_KEY, m ? '0' : '1');
      } catch {
        // 무시
      }
      return !m;
    });

  return { muted, toggleMute };
}
