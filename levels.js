// levels.js — all game levels as data
// Each level: { id, gridSize, colors (count), maxMoves, grid (optional — null = random seed) }
// grid is a 2D array of color indices (0-5)
// If grid is null, it's procedurally generated from seed

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f43'];
const COLOR_NAMES = ['Red', 'Yellow', 'Green', 'Blue', 'Purple', 'Orange'];

const LEVELS = [
  // ── TIER 1: Age 5+ ── tiny grid, few colors, generous moves
  { id: 1,  gridSize: 4, colors: 3, maxMoves: 6,  seed: 101 },
  { id: 2,  gridSize: 4, colors: 3, maxMoves: 7,  seed: 102 },
  { id: 3,  gridSize: 4, colors: 3, maxMoves: 6,  seed: 103 },
  { id: 4,  gridSize: 4, colors: 4, maxMoves: 8,  seed: 104 },
  { id: 5,  gridSize: 4, colors: 4, maxMoves: 7,  seed: 105 },

  // ── TIER 2: Age 6+ ── 5x5 grid
  { id: 6,  gridSize: 5, colors: 3, maxMoves: 8,  seed: 201 },
  { id: 7,  gridSize: 5, colors: 4, maxMoves: 10, seed: 202 },
  { id: 8,  gridSize: 5, colors: 4, maxMoves: 9,  seed: 203 },
  { id: 9,  gridSize: 5, colors: 4, maxMoves: 9,  seed: 204 },
  { id: 10, gridSize: 5, colors: 5, maxMoves: 11, seed: 205 },

  // ── TIER 3: Age 7+ ── 6x6 grid
  { id: 11, gridSize: 6, colors: 4, maxMoves: 12, seed: 301 },
  { id: 12, gridSize: 6, colors: 4, maxMoves: 11, seed: 302 },
  { id: 13, gridSize: 6, colors: 5, maxMoves: 13, seed: 303 },
  { id: 14, gridSize: 6, colors: 5, maxMoves: 12, seed: 304 },
  { id: 15, gridSize: 6, colors: 5, maxMoves: 12, seed: 305 },

  // ── TIER 4: Age 8+ ── 7x7
  { id: 16, gridSize: 7, colors: 5, maxMoves: 15, seed: 401 },
  { id: 17, gridSize: 7, colors: 5, maxMoves: 14, seed: 402 },
  { id: 18, gridSize: 7, colors: 5, maxMoves: 14, seed: 403 },
  { id: 19, gridSize: 7, colors: 6, maxMoves: 16, seed: 404 },
  { id: 20, gridSize: 7, colors: 6, maxMoves: 15, seed: 405 },

  // ── TIER 5: Age 9+ ── 8x8
  { id: 21, gridSize: 8, colors: 5, maxMoves: 18, seed: 501 },
  { id: 22, gridSize: 8, colors: 5, maxMoves: 17, seed: 502 },
  { id: 23, gridSize: 8, colors: 6, maxMoves: 19, seed: 503 },
  { id: 24, gridSize: 8, colors: 6, maxMoves: 18, seed: 504 },
  { id: 25, gridSize: 8, colors: 6, maxMoves: 18, seed: 505 },

  // ── TIER 6: Age 10+ ── 9x9
  { id: 26, gridSize: 9, colors: 5, maxMoves: 20, seed: 601 },
  { id: 27, gridSize: 9, colors: 6, maxMoves: 22, seed: 602 },
  { id: 28, gridSize: 9, colors: 6, maxMoves: 21, seed: 603 },
  { id: 29, gridSize: 9, colors: 6, maxMoves: 21, seed: 604 },
  { id: 30, gridSize: 9, colors: 6, maxMoves: 20, seed: 605 },
];

// Seeded pseudo-random number generator (Mulberry32)
function seededRand(seed) {
  let s = seed;
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generate a grid from seed
function generateGrid(gridSize, numColors, seed) {
  const rand = seededRand(seed);
  const grid = [];
  for (let r = 0; r < gridSize; r++) {
    grid[r] = [];
    for (let c = 0; c < gridSize; c++) {
      grid[r][c] = Math.floor(rand() * numColors);
    }
  }
  return grid;
}

// Get a fully built level with grid
function getLevel(levelId) {
  const def = LEVELS.find(l => l.id === levelId);
  if (!def) return null;
  const grid = generateGrid(def.gridSize, def.colors, def.seed);
  return { ...def, grid: grid.map(r => [...r]) };
}
