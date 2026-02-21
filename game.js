// game.js — Canvas-based Color Flood game engine

const Game = (() => {
  let canvas, ctx;
  let level = null;
  let grid = [];
  let gridSize = 0;
  let maxMoves = 0;
  let movesUsed = 0;
  let cellSize = 0;
  let onWin = null;
  let onFail = null;
  let animating = false;
  const GAP = 3;

  function init(canvasEl, winCb, failCb) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    onWin = winCb;
    onFail = failCb;
  }

  function loadLevel(levelDef) {
    level = { ...levelDef, grid: levelDef.grid.map(r => [...r]) };
    gridSize = levelDef.gridSize;
    maxMoves = levelDef.maxMoves;
    movesUsed = 0;
    grid = levelDef.grid.map(r => [...r]);
    resize();
    render();
  }

  function resize() {
    const parent = canvas.parentElement;
    const maxW = parent.clientWidth  - 24;
    const maxH = parent.clientHeight - 24;
    const size = Math.min(maxW, maxH, 500);
    canvas.width  = size;
    canvas.height = size;
    cellSize = (size - GAP * (gridSize - 1)) / gridSize;
  }

  function cellPos(r, c) {
    return { x: c * (cellSize + GAP), y: r * (cellSize + GAP) };
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const { x, y } = cellPos(r, c);
        const color = COLORS[grid[r][c]];
        const radius = Math.max(3, cellSize * 0.14);

        // Cell background
        ctx.beginPath();
        roundRect(ctx, x, y, cellSize, cellSize, radius);
        ctx.fillStyle = color;
        ctx.fill();

        // Glossy shine
        ctx.beginPath();
        roundRect(ctx, x + cellSize * 0.1, y + cellSize * 0.07, cellSize * 0.8, cellSize * 0.32, radius * 0.8);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fill();

        // Bottom shadow tint
        ctx.beginPath();
        roundRect(ctx, x, y + cellSize * 0.65, cellSize, cellSize * 0.35, radius);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();
      }
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
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
    const originColor = grid[0][0];
    if (originColor === newColor) return false;

    const visited = Array.from({ length: gridSize }, () => new Array(gridSize).fill(false));
    const queue = [[0, 0]];
    visited[0][0] = true;

    while (queue.length) {
      const [r, c] = queue.shift();
      if (grid[r][c] === originColor) {
        grid[r][c] = newColor;
        const neighbors = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !visited[nr][nc]) {
            visited[nr][nc] = true;
            if (grid[nr][nc] === originColor) queue.push([nr, nc]);
          }
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
    const moved = floodFill(colorIdx);
    if (!moved) return;
    movesUsed++;

    await animateFlood();
    render();

    if (isWon()) { setTimeout(() => onWin(movesUsed), 200); return; }
    if (movesUsed >= maxMoves) { setTimeout(() => onFail(), 300); }
  }

  async function animateFlood() {
    return new Promise(resolve => {
      let f = 0;
      animating = true;
      function step() {
        render();
        if (++f < 5) requestAnimationFrame(step);
        else { animating = false; resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  function restart() {
    if (!level) return;
    grid = level.grid.map(r => [...r]);
    movesUsed = 0;
    resize();
    render();
  }

  function getOriginColor() { return grid[0][0]; }
  function getMoves()    { return movesUsed; }
  function getMaxMoves() { return maxMoves; }

  window.addEventListener('resize', () => { if (level) { resize(); render(); } });

  return { init, loadLevel, makeMove, restart, getOriginColor, getMoves, getMaxMoves, resize, render };
})();
