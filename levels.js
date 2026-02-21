// levels.js — all game levels as data
// Each level: { id, gridSize, colors (count), maxMoves, seed }
// Difficulty increases every 5 levels (10 tiers total, 50 levels)

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f43'];
const COLOR_NAMES = ['Red', 'Yellow', 'Green', 'Blue', 'Purple', 'Orange'];

const LEVELS = [
  // ── TIER 1: Beginner (4×4, 3 colors, generous moves) ──
  { id: 1,  gridSize: 4, colors: 3, maxMoves: 8,  seed: 1001 },
  { id: 2,  gridSize: 4, colors: 3, maxMoves: 8,  seed: 1002 },
  { id: 3,  gridSize: 4, colors: 3, maxMoves: 7,  seed: 1003 },
  { id: 4,  gridSize: 4, colors: 3, maxMoves: 7,  seed: 1004 },
  { id: 5,  gridSize: 4, colors: 3, maxMoves: 6,  seed: 1005 },

  // ── TIER 2: Easy (4×4, 4 colors) ──
  { id: 6,  gridSize: 4, colors: 4, maxMoves: 9,  seed: 2001 },
  { id: 7,  gridSize: 4, colors: 4, maxMoves: 8,  seed: 2002 },
  { id: 8,  gridSize: 4, colors: 4, maxMoves: 8,  seed: 2003 },
  { id: 9,  gridSize: 4, colors: 4, maxMoves: 7,  seed: 2004 },
  { id: 10, gridSize: 4, colors: 4, maxMoves: 7,  seed: 2005 },

  // ── TIER 3: Getting Warmer (5×5, 4 colors) ──
  { id: 11, gridSize: 5, colors: 4, maxMoves: 10, seed: 3001 },
  { id: 12, gridSize: 5, colors: 4, maxMoves: 10, seed: 3002 },
  { id: 13, gridSize: 5, colors: 4, maxMoves: 9,  seed: 3003 },
  { id: 14, gridSize: 5, colors: 4, maxMoves: 9,  seed: 3004 },
  { id: 15, gridSize: 5, colors: 4, maxMoves: 8,  seed: 3005 },

  // ── TIER 4: Heating Up (5×5, 5 colors) ──
  { id: 16, gridSize: 5, colors: 5, maxMoves: 12, seed: 4001 },
  { id: 17, gridSize: 5, colors: 5, maxMoves: 11, seed: 4002 },
  { id: 18, gridSize: 5, colors: 5, maxMoves: 11, seed: 4003 },
  { id: 19, gridSize: 5, colors: 5, maxMoves: 10, seed: 4004 },
  { id: 20, gridSize: 5, colors: 5, maxMoves: 10, seed: 4005 },

  // ── TIER 5: Challenge (6×6, 5 colors) ──
  { id: 21, gridSize: 6, colors: 5, maxMoves: 14, seed: 5001 },
  { id: 22, gridSize: 6, colors: 5, maxMoves: 13, seed: 5002 },
  { id: 23, gridSize: 6, colors: 5, maxMoves: 13, seed: 5003 },
  { id: 24, gridSize: 6, colors: 5, maxMoves: 12, seed: 5004 },
  { id: 25, gridSize: 6, colors: 5, maxMoves: 12, seed: 5005 },

  // ── TIER 6: Tricky (6×6, 6 colors) ──
  { id: 26, gridSize: 6, colors: 6, maxMoves: 16, seed: 6001 },
  { id: 27, gridSize: 6, colors: 6, maxMoves: 15, seed: 6002 },
  { id: 28, gridSize: 6, colors: 6, maxMoves: 15, seed: 6003 },
  { id: 29, gridSize: 6, colors: 6, maxMoves: 14, seed: 6004 },
  { id: 30, gridSize: 6, colors: 6, maxMoves: 14, seed: 6005 },

  // ── TIER 7: Expert (7×7, 5 colors) ──
  { id: 31, gridSize: 7, colors: 5, maxMoves: 17, seed: 7001 },
  { id: 32, gridSize: 7, colors: 5, maxMoves: 16, seed: 7002 },
  { id: 33, gridSize: 7, colors: 5, maxMoves: 16, seed: 7003 },
  { id: 34, gridSize: 7, colors: 5, maxMoves: 15, seed: 7004 },
  { id: 35, gridSize: 7, colors: 5, maxMoves: 15, seed: 7005 },

  // ── TIER 8: Master (7×7, 6 colors) ──
  { id: 36, gridSize: 7, colors: 6, maxMoves: 19, seed: 8001 },
  { id: 37, gridSize: 7, colors: 6, maxMoves: 18, seed: 8002 },
  { id: 38, gridSize: 7, colors: 6, maxMoves: 18, seed: 8003 },
  { id: 39, gridSize: 7, colors: 6, maxMoves: 17, seed: 8004 },
  { id: 40, gridSize: 7, colors: 6, maxMoves: 17, seed: 8005 },

  // ── TIER 9: Grandmaster (8×8, 6 colors) ──
  { id: 41, gridSize: 8, colors: 6, maxMoves: 21, seed: 9001 },
  { id: 42, gridSize: 8, colors: 6, maxMoves: 20, seed: 9002 },
  { id: 43, gridSize: 8, colors: 6, maxMoves: 20, seed: 9003 },
  { id: 44, gridSize: 8, colors: 6, maxMoves: 19, seed: 9004 },
  { id: 45, gridSize: 8, colors: 6, maxMoves: 19, seed: 9005 },

  // ── TIER 10: Legend (9×9, 6 colors, tight moves) ──
  { id: 46, gridSize: 9, colors: 6, maxMoves: 22, seed: 10001 },
  { id: 47, gridSize: 9, colors: 6, maxMoves: 21, seed: 10002 },
  { id: 48, gridSize: 9, colors: 6, maxMoves: 21, seed: 10003 },
  { id: 49, gridSize: 9, colors: 6, maxMoves: 20, seed: 10004 },
  { id: 50, gridSize: 9, colors: 6, maxMoves: 20, seed: 10005 },
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
