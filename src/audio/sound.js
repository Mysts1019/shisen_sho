// Web Audio API로 효과음을 직접 만든다 (음원 파일 없음)
// 5음 음계(궁상각치우)를 써서 동양풍 느낌을 낸다.

const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];

let ctx = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** 첫 터치/클릭 때 오디오를 깨운다 (모바일 자동재생 정책 대응) */
export function unlockAudio() {
  audio();
}

/** 뜯는 소리 느낌의 짧은 음 하나 */
function pluck(freq, { delay = 0, dur = 0.25, type = 'triangle', gain = 0.18 } = {}) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sounds = {
  select() {
    pluck(1318.51, { dur: 0.07, type: 'sine', gain: 0.12 });
  },
  match(combo = 1) {
    const i = Math.min(combo - 1, PENTA.length - 3);
    pluck(PENTA[i]);
    pluck(PENTA[i + 2], { delay: 0.07 });
  },
  fail() {
    pluck(196, { dur: 0.18, type: 'square', gain: 0.06 });
    pluck(185, { delay: 0.08, dur: 0.18, type: 'square', gain: 0.06 });
  },
  hint() {
    pluck(1046.5, { dur: 0.2, type: 'sine' });
    pluck(1318.51, { delay: 0.1, dur: 0.3, type: 'sine' });
  },
  shuffle() {
    [0, 1, 2, 3, 4].forEach((n) =>
      pluck(PENTA[(n * 3) % 5] / 2, { delay: n * 0.045, dur: 0.12, gain: 0.1 })
    );
  },
  clear() {
    [0, 1, 2, 3, 4, 5, 7].forEach((n, k) => pluck(PENTA[n], { delay: k * 0.09, dur: 0.5 }));
  },
  tick() {
    pluck(1760, { dur: 0.05, type: 'square', gain: 0.05 });
  },
  gameover() {
    [392, 329.63, 261.63].forEach((f, k) => pluck(f, { delay: k * 0.22, dur: 0.6, gain: 0.15 }));
  },
};
