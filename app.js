// app.js — screen routing, UI events, wires everything together

(async () => {
  await initSupabase();
  await ProfileManager.init();

  let currentLevelId = 1;
  let selectedAvatar = '🦁';

  // ── SCREENS ──
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // ── TOAST ──
  const toastEl = document.createElement('div');
  toastEl.id = 'toast';
  document.body.appendChild(toastEl);
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function escHtml(str) {
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ── SPLASH ──
  function renderProfileList() {
    const list = document.getElementById('profile-list');
    const profiles = ProfileManager.getAll();
    list.innerHTML = '';
    profiles.forEach((p, i) => {
      const completed = ProfileManager.getCompletedLevelIds(p.id).length;
      const card = document.createElement('div');
      card.className = 'profile-card';
      card.style.animationDelay = `${i * 0.07}s`;
      card.innerHTML = `
        <div class="profile-avatar">${p.avatar}</div>
        <div class="profile-info">
          <div class="pname">${escHtml(p.name)}</div>
          <div class="plevel">${completed} level${completed !== 1 ? 's' : ''} completed</div>
        </div>
        <span class="profile-chevron">›</span>
        <button class="profile-delete" data-id="${p.id}" title="Delete">✕</button>
      `;
      card.addEventListener('click', async (e) => {
        if (e.target.classList.contains('profile-delete')) return;
        await selectProfile(p);
      });
      card.querySelector('.profile-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Delete ${p.name}'s progress? This can't be undone.`)) {
          await ProfileManager.deleteProfile(p.id);
          renderProfileList();
        }
      });
      list.appendChild(card);
    });
  }

  async function selectProfile(profile) {
    ProfileManager.setActive(profile);
    await ProfileManager.loadProgress(profile.id);
    renderLevelSelect();
    showScreen('screen-levels');
    updateProfileBadge();
  }

  renderProfileList();
  showScreen('screen-splash');

  document.getElementById('btn-new-profile').addEventListener('click', () => {
    document.getElementById('profile-name-input').value = '';
    selectedAvatar = '🦁';
    document.querySelectorAll('.avatar-opt').forEach(o => o.classList.remove('selected'));
    document.querySelector('[data-avatar="🦁"]').classList.add('selected');
    showScreen('screen-new-profile');
    setTimeout(() => document.getElementById('profile-name-input').focus(), 300);
  });

  document.getElementById('btn-cancel-profile').addEventListener('click', () => showScreen('screen-splash'));

  document.getElementById('avatar-picker').addEventListener('click', e => {
    const opt = e.target.closest('.avatar-opt');
    if (!opt) return;
    document.querySelectorAll('.avatar-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedAvatar = opt.dataset.avatar;
  });

  document.getElementById('btn-save-profile').addEventListener('click', async () => {
    const name = document.getElementById('profile-name-input').value.trim();
    if (!name) { toast('Enter your name first! 👋'); return; }
    const profile = await ProfileManager.createProfile(name, selectedAvatar);
    renderProfileList();
    await selectProfile(profile);
  });

  // Enter key on name input
  document.getElementById('profile-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-save-profile').click();
  });

  // ── LEVEL SELECT ──
  // Tier boundaries (level IDs 1-5, 6-10, 11-15, 16-20, 21-25, 26-30)
  const TIERS = [[1,5],[6,10],[11,15],[16,20],[21,25],[26,30],[31,35],[36,40],[41,45],[46,50]];

  function renderLevelSelect() {
    const profile = ProfileManager.getActive();
    const completed = new Set(ProfileManager.getCompletedLevelIds(profile.id));
    const highest = ProfileManager.getHighestUnlocked(profile.id);

    TIERS.forEach(([start, end], tierIdx) => {
      const grid = document.getElementById(`level-grid-${tierIdx + 1}`);
      if (!grid) return;
      grid.innerHTML = '';
      for (let id = start; id <= end; id++) {
        const lvl = LEVELS.find(l => l.id === id);
        if (!lvl) continue;
        const isDone    = completed.has(id);
        const isLocked  = id > highest + 1;
        const isCurrent = id === highest;

        const btn = document.createElement('button');
        btn.className = 'level-btn' + (isDone ? ' completed' : '') + (isLocked ? ' locked' : '') + (isCurrent ? ' current' : '');
        btn.innerHTML = `<span class="lnum">${id}</span><span class="lbadge">${isDone ? '⭐' : isLocked ? '🔒' : isCurrent ? '▶' : ''}</span>`;
        if (!isLocked) btn.addEventListener('click', () => showLevelConfirm(id));
        grid.appendChild(btn);
      }
    });
  }

  function updateProfileBadge() {
    const p = ProfileManager.getActive();
    if (!p) return;
    document.getElementById('active-profile-display').innerHTML =
      `<div class="bavatar">${p.avatar}</div><span>${escHtml(p.name)}</span>`;
  }

  document.getElementById('btn-back-to-splash').addEventListener('click', () => {
    showScreen('screen-splash');
    renderProfileList();
  });

  // ── LEVEL CONFIRM POPUP ──
  let pendingLevelId = null;

  function showLevelConfirm(levelId) {
    pendingLevelId = levelId;
    const lvl = LEVELS.find(l => l.id === levelId);
    if (!lvl) return;
    document.getElementById('confirm-level-title').textContent = `Start Level ${levelId}?`;
    document.getElementById('confirm-level-detail').textContent =
      `${lvl.gridSize}×${lvl.gridSize} grid · ${lvl.colors} colors · ${lvl.maxMoves} moves`;
    document.getElementById('overlay-level-confirm').classList.remove('hidden');
  }

  function hideLevelConfirm() {
    document.getElementById('overlay-level-confirm').classList.add('hidden');
    pendingLevelId = null;
  }

  document.getElementById('btn-confirm-yes').addEventListener('click', () => {
    const levelId = pendingLevelId;
    hideLevelConfirm();
    if (levelId) startLevel(levelId);
  });

  document.getElementById('btn-confirm-no').addEventListener('click', () => {
    hideLevelConfirm();
  });

  // ── GAME ──
  const canvas = document.getElementById('game-canvas');
  Game.init(canvas, handleWin, handleFail);

  function startLevel(levelId) {
    currentLevelId = levelId;
    const levelDef = getLevel(levelId);
    if (!levelDef) return;

    document.getElementById('level-label').textContent = `Level ${levelId}`;
    hideOverlays();
    showScreen('screen-game');
    buildColorButtons(levelDef.colors);
    updateMovesUI(0, levelDef.maxMoves);
    requestAnimationFrame(() => {
      Game.loadLevel(levelDef);
    });
  }

  function updateMovesUI(used, max) {
    const label = document.getElementById('moves-label');
    const bar   = document.getElementById('moves-bar');
    if (!label || !bar) return;
    const remaining = max - used;
    label.textContent = `${used} / ${max} moves`;
    const pct = Math.max(0, (remaining / max) * 100);
    bar.style.width = pct + '%';
    const isLow = remaining <= 3 && remaining > 0;
    label.classList.toggle('danger', isLow);
    bar.classList.toggle('low', isLow);
  }

  function buildColorButtons(numColors) {
    const container = document.getElementById('color-buttons');
    container.innerHTML = '';
    for (let i = 0; i < numColors; i++) {
      const btn = document.createElement('button');
      btn.className = 'color-btn';
      btn.style.background = COLORS[i];
      btn.dataset.colorIdx = i;
      btn.setAttribute('aria-label', COLOR_NAMES[i]);
      btn.addEventListener('click', () => {
        Game.makeMove(i);
        updateColorButtonStates();
        updateMovesUI(Game.getMoves(), Game.getMaxMoves());
      });
      container.appendChild(btn);
    }
    updateColorButtonStates();
  }

  function updateColorButtonStates() {
    const origin = Game.getOriginColor();
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.colorIdx) === origin);
    });
  }

  document.getElementById('btn-back-to-levels').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('screen-levels');
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    hideOverlays();
    Game.restart();
    updateColorButtonStates();
    updateMovesUI(0, Game.getMaxMoves());
  });

  // ── WIN / FAIL ──
  async function handleWin(movesUsed) {
    await ProfileManager.recordCompletion(currentLevelId, movesUsed);
    const maxMoves = Game.getMaxMoves();
    const perfect  = movesUsed <= Math.floor(maxMoves * 0.6);
    document.getElementById('win-detail').textContent =
      perfect ? `⚡ Amazing! Only ${movesUsed} of ${maxMoves} moves!` : `${movesUsed} of ${maxMoves} moves used`;
    document.getElementById('overlay-win').classList.remove('hidden');
    document.getElementById('btn-next-level').style.display = currentLevelId < LEVELS.length ? '' : 'none';
  }

  function handleFail() {
    document.getElementById('overlay-fail').classList.remove('hidden');
  }

  function hideOverlays() {
    document.getElementById('overlay-win').classList.add('hidden');
    document.getElementById('overlay-fail').classList.add('hidden');
  }

  document.getElementById('btn-next-level').addEventListener('click', () => {
    hideOverlays(); startLevel(currentLevelId + 1);
  });
  document.getElementById('btn-win-levels').addEventListener('click', () => {
    hideOverlays(); renderLevelSelect(); showScreen('screen-levels');
  });
  document.getElementById('btn-retry').addEventListener('click', () => {
    hideOverlays(); Game.restart(); updateColorButtonStates(); updateMovesUI(0, Game.getMaxMoves());
  });
  document.getElementById('btn-fail-levels').addEventListener('click', () => {
    hideOverlays(); renderLevelSelect(); showScreen('screen-levels');
  });

})();
