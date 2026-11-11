import { useEffect, useState } from 'react';

/** endAt(종료 시각, ms)까지 남은 초. running일 때만 갱신된다 */
export function useTimer(endAt, running, maxSec) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [running, endAt]);

  if (!endAt) return maxSec;
  return Math.min(maxSec, Math.max(0, Math.ceil((endAt - now) / 1000)));
}
