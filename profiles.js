// profiles.js — manages active profile and profile list UI

const ProfileManager = (() => {
  let profiles = [];
  let activeProfile = null;
  let progressCache = {}; // profileId -> array of progress records

  async function init() {
    profiles = await dbGetProfiles();
  }

  async function loadProgress(profileId) {
    const prog = await dbGetProgress(profileId);
    progressCache[profileId] = prog;
    return prog;
  }

  function getProgress(profileId) {
    return progressCache[profileId] || [];
  }

  function getCompletedLevelIds(profileId) {
    return getProgress(profileId).filter(p => p.completed).map(p => p.level_id);
  }

  function getHighestUnlocked(profileId) {
    const completed = getCompletedLevelIds(profileId);
    // Next after the highest completed, or 1 if none
    if (completed.length === 0) return 1;
    return Math.min(Math.max(...completed) + 1, LEVELS.length);
  }

  async function createProfile(name, avatar) {
    const profile = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      avatar,
      created_at: new Date().toISOString(),
    };
    const saved = await dbSaveProfile(profile);
    profiles.push(saved);
    return saved;
  }

  async function deleteProfile(profileId) {
    await dbDeleteProfile(profileId);
    profiles = profiles.filter(p => p.id !== profileId);
    delete progressCache[profileId];
    if (activeProfile?.id === profileId) activeProfile = null;
  }

  function setActive(profile) {
    activeProfile = profile;
  }

  function getActive() { return activeProfile; }
  function getAll() { return profiles; }

  async function recordCompletion(levelId, movesUsed) {
    if (!activeProfile) return;
    await dbSaveProgress(activeProfile.id, levelId, movesUsed);
    // Update cache
    const prog = getProgress(activeProfile.id);
    const idx = prog.findIndex(p => p.level_id === levelId);
    const record = { profile_id: activeProfile.id, level_id: levelId, completed: true, moves_used: movesUsed };
    if (idx >= 0) prog[idx] = record; else prog.push(record);
  }

  return { init, loadProgress, getProgress, getCompletedLevelIds, getHighestUnlocked, createProfile, deleteProfile, setActive, getActive, getAll, recordCompletion };
})();
