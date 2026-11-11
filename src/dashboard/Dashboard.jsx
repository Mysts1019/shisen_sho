import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchPlays, isConfigured } from '../lib/plays.js';
import { DIFFICULTIES } from '../data/difficulty.js';
import HourlyChart from './HourlyChart.jsx';
import {
  formatDuration,
  formatNumber,
  formatPercent,
  formatTime,
  levelLabel,
  summarize,
} from './stats.js';

const REFRESH_MS = 30_000;
const LEVELS = [{ id: 'all', label: '전체' }, ...Object.values(DIFFICULTIES)];

function StatTile({ label, value }) {
  return (
    <div className="tile-stat">
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
    </div>
  );
}

function SetupGuide() {
  return (
    <section className="panel setup">
      <h2>데이터베이스 연결이 필요해요</h2>
      <ol>
        <li>
          <a href="https://supabase.com" target="_blank" rel="noreferrer">
            supabase.com
          </a>
          에서 무료 프로젝트를 만듭니다.
        </li>
        <li>
          SQL Editor에 <code>supabase/schema.sql</code> 내용을 붙여넣고 실행합니다.
        </li>
        <li>
          프로젝트 폴더에 <code>.env.local</code> 파일을 만들고 URL과 공개 키를 넣습니다 (
          <code>.env.example</code> 참고).
        </li>
        <li>개발 서버를 다시 시작합니다.</li>
      </ol>
    </section>
  );
}

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [level, setLevel] = useState('all');
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    if (!isConfigured) return;
    setLoading(true);
    try {
      setRows(await fetchPlays());
      setError('');
      setUpdatedAt(new Date());
    } catch (e) {
      setError(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const s = useMemo(() => summarize(rows, level), [rows, level]);

  return (
    <main className="dash">
      <header className="dash-header">
        <div>
          <h1>사천성 플레이 대시보드</h1>
          <p className="muted">
            모든 플레이어의 기록 · 30초마다 자동 새로고침
            {updatedAt && ` · 마지막 갱신 ${updatedAt.toLocaleTimeString('ko-KR')}`}
          </p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={load} disabled={!isConfigured || loading}>
            {loading ? '불러오는 중…' : '새로고침'}
          </button>
          <a href="./">게임으로</a>
        </div>
      </header>

      {!isConfigured ? (
        <SetupGuide />
      ) : (
        <>
          {error && <p className="error">데이터를 불러오지 못했어요: {error}</p>}

          <div className="filters" role="group" aria-label="난이도 필터">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={level === l.id ? 'chip on' : 'chip'}
                aria-pressed={level === l.id}
                onClick={() => setLevel(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <section className="tiles">
            <StatTile label="플레이 수" value={formatNumber(s.kpi.plays)} />
            <StatTile label="플레이어 수" value={formatNumber(s.kpi.players)} />
            <StatTile label="클리어율" value={formatPercent(s.kpi.clearRate)} />
            <StatTile label="평균 점수" value={formatNumber(s.kpi.avgScore)} />
            <StatTile label="평균 플레이 시간" value={formatDuration(s.kpi.avgDuration)} />
            <StatTile label="끝까지 안 한 판" value={formatPercent(s.kpi.unfinishedRate)} />
          </section>

          <section className="panel">
            <h2>최근 24시간 플레이 수</h2>
            <HourlyChart data={s.hourly} />
          </section>

          <div className="two-col">
            <section className="panel">
              <h2>난이도별</h2>
              <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>난이도</th>
                    <th className="num">플레이</th>
                    <th className="num">클리어율</th>
                    <th className="num">평균 점수</th>
                    <th className="num">최고 점수</th>
                  </tr>
                </thead>
                <tbody>
                  {s.byLevel.map((d) => (
                    <tr key={d.id}>
                      <td>{d.label}</td>
                      <td className="num">{formatNumber(d.plays)}</td>
                      <td className="num">{formatPercent(d.clearRate)}</td>
                      <td className="num">{formatNumber(d.avgScore)}</td>
                      <td className="num">{formatNumber(d.best)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </section>

            <section className="panel">
              <h2>랭킹 TOP 10</h2>
              {s.ranking.length === 0 ? (
                <p className="muted">아직 기록이 없어요.</p>
              ) : (
                <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th className="num">#</th>
                      <th>닉네임</th>
                      <th>난이도</th>
                      <th className="num">점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.ranking.map((r, i) => (
                      <tr key={r.id}>
                        <td className="num">{i + 1}</td>
                        <td>{r.player}</td>
                        <td>{levelLabel(r.level)}</td>
                        <td className="num strong">{formatNumber(r.score)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </section>
          </div>

          <section className="panel">
            <h2>최근 끝난 판</h2>
            {s.recent.length === 0 ? (
              <p className="muted">아직 기록이 없어요.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>시각</th>
                      <th>닉네임</th>
                      <th>난이도</th>
                      <th>결과</th>
                      <th className="num">점수</th>
                      <th className="num">플레이 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.recent.map((r) => (
                      <tr key={r.id}>
                        <td>{formatTime(r.created_at)}</td>
                        <td>{r.player}</td>
                        <td>{levelLabel(r.level)}</td>
                        <td>{r.cleared ? '✔ 클리어' : '⏱ 시간 종료'}</td>
                        <td className="num">{formatNumber(r.score)}</td>
                        <td className="num">{formatDuration(r.duration_sec)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
