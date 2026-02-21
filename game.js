// game.js — Canvas game engine, dark theme tiles

const Game = (() => {
  let canvas, ctx, level = null, grid = [], gridSize = 0;
  let maxMoves = 0, movesUsed = 0, cellSize = 0;
  let onWin = null, onFail = null, animating = false;
  const GAP = 3;

  function init(canvasEl, winCb, failCb) {
    canvas = canvasEl; ctx = canvas.getContext('2d');
    onWin = winCb; onFail = failCb;
  }

  function loadLevel(def) {
    level = { ...def, grid: def.grid.map(r => [...r]) };
    gridSize = def.gridSize; maxMoves = def.maxMoves; movesUsed = 0;
    grid = def.grid.map(r => [...r]);
    resize(); render();
  }

  function resize() {
    const p = canvas.parentElement;
    const size = Math.min(p.clientWidth - 24, p.clientHeight - 24, 520);
    canvas.width = canvas.height = size;
    cellSize = (size - GAP * (gridSize - 1)) / gridSize;
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark background fill
    ctx.fillStyle = '#0b0f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = c * (cellSize + GAP);
        const y = r * (cellSize + GAP);
        const color = COLORS[grid[r][c]];
        const rad = Math.max(3, cellSize * 0.12);

        // Cell fill
        ctx.beginPath(); rr(x, y, cellSize, cellSize, rad);
        ctx.fillStyle = color; ctx.fill();

        // Inner shadow (bottom)
        ctx.beginPath(); rr(x, y + cellSize * 0.6, cellSize, cellSize * 0.4, rad);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();

        // Gloss (top)
        ctx.beginPath(); rr(x + 2, y + 2, cellSize - 4, cellSize * 0.35, rad * 0.7);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();

        // Highlight dot
        ctx.beginPath();
        ctx.arc(x + cellSize * 0.25, y + cellSize * 0.25, cellSize * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
      }
    }
  }

  function rr(x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function floodFill(newColor) {
    const orig = grid[0][0];
    if (orig === newColor) return false;
    const vis = Array.from({ length: gridSize }, () => new Array(gridSize).fill(false));
    const q = [[0, 0]]; vis[0][0] = true;
    while (q.length) {
      const [r, c] = q.shift();
      if (grid[r][c] !== orig) continue;
      grid[r][c] = newColor;
      for (const [nr, nc] of [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]) {
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !vis[nr][nc] && grid[nr][nc] === orig) {
          vis[nr][nc] = true; q.push([nr, nc]);
        }
      }
    }
    return true;
  }

  function isWon() {
    const c = grid[0][0];
    for (let r = 0; r < gridSize; r++)
      for (let col = 0; col < gridSize; col++)
        if (grid[r][col] !== c) return false;
    return true;
  }

  async function makeMove(colorIdx) {
    if (animating) return;
    if (!floodFill(colorIdx)) return;
    movesUsed++;
    await animateFlood();
    render();
    if (isWon())           { setTimeout(() => onWin(movesUsed), 200); return; }
    if (movesUsed >= maxMoves) { setTimeout(() => onFail(), 300); }
  }

  async function animateFlood() {
    return new Promise(res => {
      let f = 0; animating = true;
      function step() { render(); if (++f < 5) requestAnimationFrame(step); else { animating = false; res(); } }
      requestAnimationFrame(step);
    });
  }

  function restart() {
    if (!level) return;
    grid = level.grid.map(r => [...r]); movesUsed = 0; resize(); render();
  }

  function getOriginColor() { return grid[0][0]; }
  function getMoves()    { return movesUsed; }
  function getMaxMoves() { return maxMoves; }

  window.addEventListener('resize', () => { if (level) { resize(); render(); } });
  return { init, loadLevel, makeMove, restart, getOriginColor, getMoves, getMaxMoves, resize, render };
})();
