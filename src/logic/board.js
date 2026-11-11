// 보드 로직 (UI와 분리된 순수 함수)
// grid는 (rows+2) x (cols+2) 크기. 바깥 1칸은 항상 비어 있는 테두리(경로용).
// 칸 값: 패 종류 번호(number) 또는 null(빈 칸)

import { TILES } from '../data/tiles.js';

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 새 보드 생성. 종류마다 4장씩, 완전 랜덤 배치. 막힌 판이면 섞어서 반환 */
export function createBoard(rows, cols, typeCount) {
  const total = rows * cols;
  if (total !== typeCount * 4) {
    throw new Error(`보드 칸 수(${total})는 패 종류 수(${typeCount}) x 4 와 같아야 합니다.`);
  }
  const types = shuffleArray([...TILES.keys()]).slice(0, typeCount);
  const values = shuffleArray(types.flatMap((t) => [t, t, t, t]));

  const grid = Array.from({ length: rows + 2 }, () => Array(cols + 2).fill(null));
  let i = 0;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) grid[r][c] = values[i++];
  }
  return hasMove(grid) ? grid : shuffleBoard(grid);
}

/**
 * 두 패를 꺾임 2회 이하로 연결하는 경로를 찾는다.
 * 성공 시 꺾이는 지점을 포함한 좌표 배열 [a, ...corners, b], 실패 시 null.
 */
export function findPath(grid, a, b) {
  if (a.r === b.r && a.c === b.c) return null;
  const v = grid[a.r][a.c];
  if (v === null || v !== grid[b.r][b.c]) return null;

  const H = grid.length;
  const W = grid[0].length;
  const segs = Array.from({ length: H }, () => Array(W).fill(Infinity));
  const parent = Array.from({ length: H }, () => Array(W).fill(null));
  segs[a.r][a.c] = 0;

  // 직선 구간 수(1~3) 기준으로 넓혀가는 BFS
  let frontier = [a];
  for (let s = 1; s <= 3; s++) {
    const next = [];
    for (const p of frontier) {
      for (const [dr, dc] of DIRS) {
        let r = p.r + dr;
        let c = p.c + dc;
        while (r >= 0 && r < H && c >= 0 && c < W) {
          if (r === b.r && c === b.c) {
            parent[r][c] = p;
            return buildPath(parent, b);
          }
          if (grid[r][c] !== null) break;
          if (segs[r][c] > s) {
            segs[r][c] = s;
            parent[r][c] = p;
            next.push({ r, c });
          }
          r += dr;
          c += dc;
        }
      }
    }
    frontier = next;
  }
  return null;
}

function buildPath(parent, end) {
  const path = [end];
  let cur = parent[end.r][end.c];
  while (cur) {
    path.unshift(cur);
    cur = parent[cur.r][cur.c];
  }
  return path;
}

/** 연결 가능한 한 쌍을 찾는다. 없으면 null */
export function findAnyMove(grid) {
  const byType = new Map();
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const v = grid[r][c];
      if (v === null) continue;
      if (!byType.has(v)) byType.set(v, []);
      byType.get(v).push({ r, c });
    }
  }
  for (const cells of byType.values()) {
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        if (findPath(grid, cells[i], cells[j])) return [cells[i], cells[j]];
      }
    }
  }
  return null;
}

export function hasMove(grid) {
  return findAnyMove(grid) !== null;
}

export function countTiles(grid) {
  return grid.reduce((n, row) => n + row.filter((v) => v !== null).length, 0);
}

/** 남은 패를 같은 자리들 안에서 재배치. 연결 가능한 쌍이 생길 때까지 반복 */
export function shuffleBoard(grid) {
  const cells = [];
  const values = [];
  grid.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v !== null) {
        cells.push({ r, c });
        values.push(v);
      }
    })
  );

  let next = grid;
  for (let attempt = 0; attempt < 200; attempt++) {
    shuffleArray(values);
    next = grid.map((row) => [...row]);
    cells.forEach(({ r, c }, i) => (next[r][c] = values[i]));
    if (values.length === 0 || hasMove(next)) break;
  }
  return next;
}
