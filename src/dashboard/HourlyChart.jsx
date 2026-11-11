import { useState } from 'react';
import { useElementSize } from '../hooks/useElementSize.js';

const HEIGHT = 200;
const M = { top: 20, right: 8, bottom: 26, left: 32 };
const BAR_MAX = 24;

function niceMax(v) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow * 2 >= v) * pow;
  return step * 2;
}

/** 위쪽만 4px 둥근 막대 (아래는 기준선에 붙은 직각) */
function barPath(x, y, w, h, r = 4) {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

const hourLabel = (ms) => `${new Date(ms).getHours()}시`;

/** 최근 24시간 시간대별 플레이 수 (단일 계열 세로 막대) */
export default function HourlyChart({ data }) {
  const [ref, { width }] = useElementSize();
  const [active, setActive] = useState(null);

  const innerW = Math.max(0, width - M.left - M.right);
  const innerH = HEIGHT - M.top - M.bottom;
  const max = niceMax(Math.max(0, ...data.map((d) => d.count)));
  const slot = innerW / data.length;
  const barW = Math.max(2, Math.min(BAR_MAX, slot - 2));
  const y = (v) => M.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const peak = data.reduce((best, d, i) => (d.count > (data[best]?.count ?? -1) ? i : best), 0);

  return (
    <div className="chart" ref={ref}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label="최근 24시간 시간대별 플레이 수">
          {ticks.map((t) => (
            <g key={t}>
              <line className="grid" x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} />
              <text className="axis" x={M.left - 6} y={y(t) + 4} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = M.left + slot * i + slot / 2;
            const h = (d.count / max) * innerH;
            const isActive = active === i;
            return (
              <g
                key={d.start}
                tabIndex={0}
                className="bar-slot"
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${hourLabel(d.start)} ${d.count}판`}
              >
                {/* 막대보다 넓은 투명 영역을 마우스 대상으로 쓴다 */}
                <rect x={cx - slot / 2} y={M.top} width={slot} height={innerH} fill="transparent" />
                {d.count > 0 && (
                  <path
                    className={`bar${isActive ? ' active' : ''}`}
                    d={barPath(cx - barW / 2, y(d.count), barW, h)}
                  />
                )}
                {i % 3 === 0 && (
                  <text className="axis" x={cx} y={HEIGHT - 8} textAnchor="middle">
                    {hourLabel(d.start)}
                  </text>
                )}
                {i === peak && d.count > 0 && (
                  <text className="value" x={cx} y={y(d.count) - 6} textAnchor="middle">
                    {d.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {active !== null && (
        <div
          className="tooltip"
          style={{ left: M.left + slot * active + slot / 2, top: y(data[active].count) - 8 }}
        >
          <b>{hourLabel(data[active].start)}</b> · {data[active].count}판
        </div>
      )}
      <details className="table-view">
        <summary>표로 보기</summary>
        <table>
          <thead>
            <tr>
              <th>시간</th>
              <th>플레이 수</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.start}>
                <td>{hourLabel(d.start)}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
