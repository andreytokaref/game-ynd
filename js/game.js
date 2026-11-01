/* ============================================================
   Game — состояние, баланс, игровой цикл
   ============================================================ */
'use strict';

const Game = (() => {

  // ================= БАЛАНС =================
  const MAX_SLOTS = 24; // 16 базовых + 8 расширенных (открываются после 16-го)
  const Bal = {
    dmg: (L) => Math.floor(12 * Math.pow(2.5, L - 1)),
    hp: (W) => Math.floor(35 * Math.pow(1.32, W - 1)),
    gold: (W) => Math.ceil(6 * Math.pow(1.26, W - 1)),
    bossHpMult: 6,
    killsPerWave: 5,
    bossEvery: 5,
    bossTime: 30,
    attackInterval: 1.0,
    sell: (L) => Math.ceil(10 * Math.pow(2.05, L - 1)),
    mergeGold: (L) => Math.ceil(2 * Math.pow(1.8, L - 1)),
    slotCost: (i) => i < 16
      ? Math.floor(500 * Math.pow(2.6, i - 6))
      : Math.floor(2710000 * Math.pow(4, i - 16))
  };

  function fmt(n) {
    if (!isFinite(n)) return '?';
    if (n < 0) return '-' + fmt(-n);
    if (n < 1000) return String(Math.floor(n));
    const tier = Math.floor(Math.log10(n) / 3);
    let suffix;
    if (tier < 5) suffix = ['', 'K', 'M', 'B', 'T'][tier];
    else {
      const idx = tier - 5;
      suffix = String.fromCharCode(97 + Math.floor(idx / 26)) + String.fromCharCode(97 + idx % 26);
    }
    const scaled = n / Math.pow(1000, tier);
    return (scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2)) + suffix;
  }

  // ================= КОНФИГИ =================
  const UPS = [
    { id: 'base',   max: 49, cost: (l) => Math.floor(50 * Math.pow(3.1, l)) },
    { id: 'speed',  max: 15, cost: (l) => Math.floor(150 * Math.pow(2.4, l)) },
    { id: 'double', max: 20, cost: (l) => Math.floor(300 * Math.pow(2.0, l)) },
    { id: 'critc',  max: 30, cost: (l) => Math.floor(200 * Math.pow(2.5, l)) },
    { id: 'critp',  max: 30, cost: (l) => Math.floor(250 * Math.pow(2.6, l)) }
  ];
  const PETS = [
    { id: 'banana',  max: 5, cost: (l) => Math.floor(30 * Math.pow(2.2, l)) },
    { id: 'hamster', max: 5, cost: (l) => Math.floor(50 * Math.pow(2.2, l)) },
    { id: 'pepe',    max: 5, cost: (l) => Math.floor(80 * Math.pow(2.2, l)) },
    { id: 'doge',    max: 5, cost: (l) => Math.floor(120 * Math.pow(2.2, l)) },
    { id: 'goose',   max: 5, cost: (l) => Math.floor(200 * Math.pow(2.2, l)) },
    { id: 'dragon',  max: 5, cost: (l) => Math.floor(500 * Math.pow(2.2, l)) }
  ];
  const ARTS = [
    { id: 'wrath',  max: 7,  cost: (l) => Math.floor(3 * Math.pow(2.1, l)) },
    { id: 'slots',  max: 10, cost: (l) => 5 + 5 * l },
    { id: 'echo',   max: 8,  cost: (l) => Math.floor(10 * Math.pow(2.2, l)) },
    { id: 'vein',   max: 10, cost: (l) => 4 + 4 * l },
    { id: 'reson',  max: 5,  cost: (l) => 8 + 8 * l },
    { id: 'wisdom', max: 10, cost: (l) => 6 + 6 * l }
  ];
  const QUEST_POOL = [
    { id: 'merge', ns: [15, 25, 40], gems: [15, 20, 30] },
    { id: 'boss',  ns: [2, 3, 5],   gems: [20, 25, 35] },
    { id: 'click', ns: [50, 100, 150], gems: [10, 15, 25] },
    { id: 'craft', ns: [30, 60, 100], gems: [10, 15, 25] },
    { id: 'kill',  ns: [40, 80, 150], gems: [10, 15, 25] }
  ];
  const WHEEL = [
    { id: 'gold1',   apply: () => addGold(Bal.gold(S.maxWave) * 10 * goldMult()) },
    { id: 'gems10',  apply: () => addGems(10) },
    { id: 'weapon',  apply: () => giveWeapon(Math.min(50, maxDisc() + 2)) },
    { id: 'gold2',   apply: () => { S.boostGold2 = Date.now() + 300000; } },
    { id: 'berserk', apply: () => { S.boostBerserk = Date.now() + 60000; } },
    { id: 'gems25',  apply: () => addGems(25) },
    { id: 'auto',    apply: () => { S.boostAuto = Date.now() + 180000; } },
    { id: 'gold50',  apply: () => addGold(Bal.gold(S.maxWave) * 50 * goldMult()) }
  ];

  function defaultState() {
    return {
      v: 1, lang: null, muted: false,
      gold: 0, gems: 0, stones: 0,
      wave: 1, kills: 0, maxWave: 1,
      equipped: null,
      grid: new Array(MAX_SLOTS).fill(null),
      slotsUnlocked: 6,
      up: { base: 0, speed: 0, double: 0, critc: 0, critp: 0 },
      pets: { banana: 0, hamster: 0, pepe: 0, doge: 0, goose: 0, dragon: 0 },
      arts: { wrath: 0, slots: 0, echo: 0, vein: 0, reson: 0, wisdom: 0 },
      disc: [],
      stats: { merges: 0, clicks: 0, crafts: 0, kills: 0, bosses: 0, prestiges: 0 },
      quests: { date: '', list: [] },
      wheelLast: 0,
      boostAuto: 0, boostBerserk: 0, boostGold2: 0,
      lastSeen: Date.now()
    };
  }

  let S = defaultState();

  // ================= ВРЕМЕННОЕ СОСТОЯНИЕ =================
  const C = {
    started: false, paused: true,
    enemyHp: 0, enemyMaxHp: 1, enemyIdx: 0, isBoss: false, bossTimer: 0, bossActive: false,
    dying: false, spawnT: 0.3,
    attackT: 0, craftT: 0, autoClickT: 0, autoMergeT: 0,
    petT: 0, petDpsAcc: 0,
    mergeCombo: 0, comboT: 0,
    droneT: 45,
    biomeIdx: -1,
    offlineGold: 0,
    fullWarnT: 0
  };
  let lastCloudSave = 0;
  let lastFullWarn = 0;

  // ================= ПРОИЗВОДНЫЕ ЗНАЧЕНИЯ =================
  function baseCraftLevel() { return Math.min(50, 1 + S.up.base + S.arts.wisdom); }
  function craftTime() {
    let t = 5.0 - S.up.speed * (4.0 / 15);
    t *= Math.pow(0.94, S.pets.goose);
    if (Date.now() < S.boostAuto) t *= 0.5;
    return Math.max(0.4, t);
  }
  function critChance() { return Math.min(0.5, 0.05 + S.up.critc * 0.015); }
  function critMult() { return 2 + S.up.critp * 0.1; }
  function doubleChance() { return Math.min(0.4, 0.02 * S.up.double); }
  function dmgMult() {
    let m = Math.pow(2, S.arts.wrath);
    m *= 1 + 0.15 * S.pets.doge;
    m *= 1 + 0.10 * S.pets.dragon;
    if (Date.now() < S.boostBerserk) m *= 3;
    return m;
  }
  function goldMult() {
    let m = 1;
    m += 0.20 * S.pets.hamster;
    m += 0.30 * S.pets.dragon;
    m += 0.50 * S.arts.vein;
    if (Date.now() < S.boostGold2) m *= 2;
    return m;
  }
  function heroDamage() { return Bal.dmg(S.equipped || 1) * dmgMult(); }
  function petDps() { return heroDamage() * 0.15 * S.pets.pepe; }
  function autoClickInterval() { return Math.max(0.6, 2.5 - 0.3 * S.pets.banana); }
  function maxDisc() { return S.disc.length ? Math.max.apply(null, S.disc) : 0; }
  function biomeIdx() { return Math.floor((S.wave - 1) / 10) % 10; }
  function canFreeSpin() { return Date.now() - S.wheelLast >= 4 * 3600 * 1000; }
  function prestigeGain() {
    if (S.maxWave < 30) return 0;
    return Math.max(1, Math.floor(2 * Math.pow((S.maxWave - 25) / 5, 1.5)));
  }

  // ================= РЕСУРСЫ =================
  function addGold(g) { S.gold += g; UI.hud(); }
  function addGems(g) { S.gems += g; UI.hud(); UI.tabDots(); }

  // ================= ЭНЦИКЛОПЕДИЯ =================
  function discover(level) {
    if (level > 50 || S.disc.indexOf(level) !== -1) return;
    S.disc.push(level);
    const reward = 5 + level;
    addGems(reward);
    Sfx.play('disc');
    UI.toast(I18N.t('newWeapon', { n: I18N.weaponName(level) }) + '  +' + reward, 'gem');
    UI.encyDirty = true;
  }

  // ================= КУЗНИЦА =================
  function hasEmptySlot() {
    for (let i = 0; i < S.slotsUnlocked; i++) if (!S.grid[i]) return true;
    return false;
  }
  function firstEmptySlot() {
    for (let i = 0; i < S.slotsUnlocked; i++) if (!S.grid[i]) return i;
    return -1;
  }
  function weakestSlot() {
    let wi = -1, wl = Infinity;
    for (let i = 0; i < S.slotsUnlocked; i++) {
      if (S.grid[i] && S.grid[i] < wl) { wl = S.grid[i]; wi = i; }
    }
    return wi;
  }
  function placeWeapon(level) {
    level = Math.min(50, level | 0);
    const i = firstEmptySlot();
    if (i < 0) return false;
    S.grid[i] = level;
    S.stats.crafts++;
    questProgress('craft', 1);
    discover(level);
    UI.gridSlot(i, true);
    autoEquip();
    return true;
  }
  function giveWeapon(level) {
    if (!placeWeapon(level)) {
      const wi = weakestSlot();
      if (wi >= 0 && S.grid[wi] < level) {
        sellAt(wi, true);
        placeWeapon(level);
      }
    }
  }
  function doCraft() {
    const lvl = baseCraftLevel();
    const dc = doubleChance();
    const r = Math.random();
    if (r < dc * 0.5) {
      placeWeapon(lvl);
      if (hasEmptySlot()) placeWeapon(lvl);
    } else if (r < dc) {
      placeWeapon(lvl + 1);
    } else {
      placeWeapon(lvl);
    }
    Sfx.play('anvil');
    UI.anvilUpdate();
    saveSoon();
  }
  function fullWarn() {
    const now = Date.now();
    if (now - lastFullWarn < 3000) return;
    lastFullWarn = now;
    UI.toast(I18N.t('gridFull'), 'lock');
    UI.anvilFull();
    Sfx.play('err');
  }
  function tapAnvil(fromPet) {
    if (!C.started || C.paused) return;
    S.stats.clicks++;
    questProgress('click', 1);
    C.craftT += 0.5;
    UI.anvilSmash(fromPet);
    if (!fromPet) {
      Sfx.play('tap');
      const p = UI.anvilPos();
      FX.sparks(p.x, p.y, 4);
    }
    checkCraft(true);
  }
  function checkCraft(manual) {
    const ct = craftTime();
    if (C.craftT >= ct) {
      if (hasEmptySlot()) {
        C.craftT = 0;
        doCraft();
      } else if (manual) {
        fullWarn();
        C.craftT = ct;
      } else {
        C.craftT = ct;
      }
    }
  }
  function mergeAt(i, j) {
    if (i === j) return false;
    const a = S.grid[i], b = S.grid[j];
    if (!a || !b || a !== b || a >= 50) return false;
    const newL = a + 1;
    S.grid[i] = newL;
    S.grid[j] = null;
    S.stats.merges++;
    questProgress('merge', 1);
    const now = Date.now();
    C.mergeCombo = (now - C.comboT < 3000) ? C.mergeCombo + 1 : 1;
    C.comboT = now;
    addGold(Bal.mergeGold(a));
    Sfx.play('merge', C.mergeCombo);
    UI.gridSlot(i, true);
    UI.gridSlot(j, false);
    UI.mergeFx(i);
    discover(newL);
    autoEquip();
    saveSoon();
    return true;
  }
  function tryAutoMergeAt(i) {
    const lvl = S.grid[i];
    if (!lvl || lvl >= 50) return false;
    for (let j = 0; j < S.slotsUnlocked; j++) {
      if (j !== i && S.grid[j] === lvl) return mergeAt(i, j);
    }
    return false;
  }
  function sellAt(i, silent) {
    const lvl = S.grid[i];
    if (!lvl) return;
    const g = Bal.sell(lvl);
    S.grid[i] = null;
    addGold(g);
    if (!silent) {
      Sfx.play('coin');
      UI.toast(I18N.t('goldTaken', { g: fmt(g) }), 'coin');
      UI.gridSlot(i, false);
    }
    saveSoon();
  }
  function autoEquip() {
    let mi = -1, ml = 0;
    for (let i = 0; i < S.slotsUnlocked; i++) {
      if (S.grid[i] && S.grid[i] > ml) { ml = S.grid[i]; mi = i; }
    }
    if (mi >= 0 && (S.equipped == null || ml > S.equipped)) {
      const prev = S.equipped;
      S.equipped = ml;
      S.grid[mi] = prev || null;
      UI.equipUpdate(true);
      UI.heroWeaponUpdate();
      if (prev != null) UI.gridSlot(mi, false);
      return true;
    }
    return false;
  }
  function equipSwap(i) {
    const w = S.grid[i];
    if (!w) return;
    S.grid[i] = S.equipped || null;
    S.equipped = w;
    Sfx.play('click');
    UI.equipUpdate(false);
    UI.heroWeaponUpdate();
    UI.gridSlot(i, false);
    saveSoon();
  }

  // ================= ПОКУПКИ =================
  function buyUpgrade(id) {
    const u = UPS.find((x) => x.id === id);
    if (!u) return false;
    const lvl = S.up[id];
    if (lvl >= u.max) return false;
    const cost = u.cost(lvl);
    if (S.gold < cost) { Sfx.play('err'); return false; }
    S.gold -= cost;
    S.up[id]++;
    Sfx.play('buy');
    UI.hud();
    saveSoon();
    return true;
  }
  function buySlot() {
    if (S.slotsUnlocked >= MAX_SLOTS) return false;
    const cost = Bal.slotCost(S.slotsUnlocked);
    if (S.gold < cost) { Sfx.play('err'); return false; }
    S.gold -= cost;
    S.slotsUnlocked++;
    Sfx.play('buy');
    UI.gridRender();
    UI.hud();
    saveSoon();
    return true;
  }
  // Выбросить меч без компенсации (корзина)
  function discardAt(i) {
    if (!S.grid[i]) return false;
    S.grid[i] = null;
    saveSoon();
    return true;
  }
  function buyPet(idx) {
    const p = PETS[idx];
    const lvl = S.pets[p.id];
    if (lvl >= p.max) return false;
    const cost = p.cost(lvl);
    if (S.gems < cost) { Sfx.play('err'); return false; }
    S.gems -= cost;
    S.pets[p.id]++;
    Sfx.play('reward');
    UI.hud();
    UI.petsFlyUpdate();
    saveSoon();
    return true;
  }
  function buyArt(id) {
    const a = ARTS.find((x) => x.id === id);
    if (!a) return false;
    const lvl = S.arts[id];
    if (lvl >= a.max) return false;
    const cost = a.cost(lvl);
    if (S.stones < cost) { Sfx.play('err'); return false; }
    S.stones -= cost;
    S.arts[id]++;
    Sfx.play('craftUp');
    if (id === 'slots') {
      S.slotsUnlocked = Math.min(16, Math.max(S.slotsUnlocked, 6 + S.arts.slots));
      UI.gridRender();
    }
    UI.hud();
    saveSoon();
    return true;
  }

  // ================= ПРЕСТИЖ =================
  function doPrestige() {
    const gain = prestigeGain();
    if (gain <= 0) return false;
    S.stones += gain;
    S.stats.prestiges++;
    S.gold = 0;
    S.up = { base: 0, speed: 0, double: 0, critc: 0, critp: 0 };
    S.wave = 1 + S.arts.echo * 5;
    S.maxWave = S.wave;
    S.kills = 0;
    S.grid = new Array(MAX_SLOTS).fill(null);
    S.slotsUnlocked = Math.min(16, 6 + S.arts.slots);
    S.equipped = null;
    C.biomeIdx = -1;
    placeWeapon(1 + S.arts.wisdom);
    autoEquip();
    UI.heroWeaponUpdate();
    UI.gridRender();
    UI.waveInfo();
    UI.setBiome(biomeIdx(), true);
    UI.toast(I18N.t('prDone', { n: gain }), 'stone');
    Sfx.play('fanfare');
    spawnEnemy();
    save(true);
    return true;
  }

  // ================= КВЕСТЫ =================
  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h) + 1;
  }
  function questTier() { return Math.min(2, Math.floor(S.maxWave / 40)); }
  function refreshQuests(force) {
    const today = new Date().toISOString().slice(0, 10);
    if (!force && S.quests.date === today && S.quests.list.length === 3) return;
    S.quests.date = today;
    const tier = questTier();
    const pool = QUEST_POOL.slice();
    let rng = hashCode(today + (force ? ':' + Date.now() : ''));
    const picks = [];
    while (picks.length < 3 && pool.length) {
      rng = (rng * 9301 + 49297) % 233280;
      const i = Math.floor(rng / 233280 * pool.length);
      const q = pool.splice(i, 1)[0];
      picks.push({ id: q.id, n: q.ns[tier], gems: q.gems[tier], prog: 0, claimed: false });
    }
    S.quests.list = picks;
    UI.tabDots();
  }
  function questProgress(type, n) {
    let hit = false;
    S.quests.list.forEach((q) => {
      if (q.id === type && !q.claimed && q.prog < q.n) { q.prog = Math.min(q.n, q.prog + n); hit = true; }
    });
    if (hit) { UI.tabDots(); if (UI.activeTab === 'quests') UI.refreshTab(); }
  }
  function claimQuest(i) {
    const q = S.quests.list[i];
    if (!q || q.claimed || q.prog < q.n) return;
    q.claimed = true;
    addGems(q.gems);
    Sfx.play('reward');
    UI.refreshTab();
    UI.tabDots();
    saveSoon();
  }
  function refreshQuestsAd() {
    YSDK.showRewarded(() => {
      refreshQuests(true);
      UI.toast(I18N.t('qSub'), 'scroll');
      UI.refreshTab();
      saveSoon();
    });
  }

  // ================= КОЛЕСО =================
  function spinWheel(viaAd, onResult) {
    if (canFreeSpin()) {
      S.wheelLast = Date.now();
      saveSoon();
      onResult(Math.floor(Math.random() * 8));
    } else if (viaAd) {
      YSDK.showRewarded(() => onResult(Math.floor(Math.random() * 8)));
    }
  }
  function applyWheel(idx) {
    const p = WHEEL[idx % 8];
    p.apply();
    if (p.id === 'weapon') UI.toast(I18N.t('rewardWeapon', { n: Math.min(50, maxDisc()) }), 'sword');
    else if (p.id === 'gems10' || p.id === 'gems25') UI.toast(I18N.t('rewardGems', { n: p.id === 'gems25' ? 25 : 10 }), 'gem');
    else UI.toast(I18N.t('whGot', { n: I18N.t('whPrize' + (idx % 8)) }), 'star');
    UI.hud();
    saveSoon();
  }

  // ================= БОЙ =================
  function spawnEnemy() {
    C.dying = false;
    C.attackT = 0;
    C.petDpsAcc = 0;
    C.petT = 0;
    C.isBoss = S.wave % Bal.bossEvery === 0;
    if (C.isBoss) {
      C.enemyMaxHp = Bal.hp(S.wave) * Bal.bossHpMult;
      C.enemyIdx = -1;
      C.bossTimer = Bal.bossTime;
      C.bossActive = true;
      UI.renderEnemy(-1, true, I18N.bossName(Math.floor(S.wave / Bal.bossEvery - 1) % 10));
      UI.bossTimerShow();
      Sfx.play('bossCome');
      UI.shake(8);
    } else {
      C.enemyMaxHp = Bal.hp(S.wave);
      C.enemyIdx = (S.wave + S.kills) % 15;
      C.bossActive = false;
      UI.renderEnemy(C.enemyIdx, false, I18N.monsterName(C.enemyIdx));
      UI.bossTimerHide();
    }
    C.enemyHp = C.enemyMaxHp;
    UI.enemyHp(1);
    UI.waveInfo();
  }
  function heroAttack() {
    if (C.enemyHp <= 0 || C.dying) return;
    UI.heroSwing();
    const crit = Math.random() < critChance();
    const dmg = heroDamage() * (crit ? critMult() : 1);
    applyDamage(dmg, crit, false);
  }
  function applyDamage(dmg, crit, isPet) {
    if (C.enemyHp <= 0 || C.dying) return;
    C.enemyHp -= dmg;
    UI.enemyHp(Math.max(0, C.enemyHp / C.enemyMaxHp));
    if (isPet) {
      FX.dmg(dmg, false, true);
    } else {
      Sfx.play(crit ? 'crit' : 'hit');
      if (crit) UI.shake(7);
      UI.enemyHurt();
      FX.dmg(dmg, crit, false);
    }
    if (C.enemyHp <= 0) enemyDeath();
  }
  function enemyDeath() {
    if (C.dying) return;
    C.dying = true;
    const isBoss = C.isBoss;
    const g = Bal.gold(S.wave) * goldMult() * (isBoss ? 10 : 1);
    addGold(g);
    S.stats.kills++;
    questProgress('kill', 1);
    UI.enemyDie();
    FX.coins(6 + (isBoss ? 10 : 0));
    if (isBoss) {
      S.stats.bosses++;
      questProgress('boss', 1);
      const gems = 2 + S.arts.reson;
      addGems(gems);
      Sfx.play('fanfare');
      FX.confetti();
      UI.bossTimerHide();
      UI.toast(I18N.t('bossKill', { g: fmt(g), c: gems }), 'crown');
    } else {
      Sfx.play('kill');
    }
    S.kills++;
    if (isBoss || S.kills >= Bal.killsPerWave) nextWave();
    C.spawnT = isBoss ? 0.9 : 0.5;
    saveSoon();
  }
  function nextWave() {
    S.wave++;
    S.kills = 0;
    const isNewMax = S.wave > S.maxWave;
    if (isNewMax) {
      S.maxWave = S.wave;
      if (S.maxWave === 30) UI.toast(I18N.t('prestigeWave'), 'stone');
      if (S.maxWave % 10 === 0 && S.maxWave > 1) YSDK.showFullscreen(false);
    }
    const nb = biomeIdx();
    if (nb !== C.biomeIdx) UI.setBiome(nb, false);
    UI.waveInfo();
  }
  function bossFail() {
    C.bossActive = false;
    UI.bossTimerHide();
    S.wave = Math.max(1, S.wave - 1);
    S.kills = 0;
    Sfx.play('bossFail');
    UI.toast(I18N.t('bossFail', { w: S.wave }), 'skull');
    UI.waveInfo();
    C.spawnT = 0.6;
  }

  // ================= БОНУСЫ / РЕКЛАМА =================
  function activateBerserk() {
    YSDK.showRewarded(() => {
      S.boostBerserk = Date.now() + 60000;
      Sfx.play('reward');
      UI.toast(I18N.t('berserkDesc'), 'bolt');
      saveSoon();
    });
  }
  function activateAutoMerge() {
    YSDK.showRewarded(() => {
      S.boostAuto = Date.now() + 180000;
      Sfx.play('reward');
      UI.toast(I18N.t('boost'), 'star');
      saveSoon();
    });
  }
  function claimDrone() {
    YSDK.showRewarded(() => {
      if (Math.random() < 0.5 && maxDisc() < 50) {
        const lvl = Math.min(50, maxDisc() + 2);
        giveWeapon(lvl);
        UI.toast(I18N.t('rewardWeapon', { n: lvl }), 'gift');
      } else {
        const g = Bal.gold(S.maxWave) * 30 * goldMult();
        addGold(g);
        UI.toast(I18N.t('rewardGold', { g: fmt(g) }), 'gift');
      }
      Sfx.play('reward');
      saveSoon();
    });
  }
  function claimOffline(x2) {
    const g = C.offlineGold * (x2 ? 2 : 1);
    if (g > 0) { addGold(g); Sfx.play('coin'); }
    C.offlineGold = 0;
    saveSoon();
  }
  function toggleMute() {
    S.muted = !S.muted;
    Sfx.setMuted(S.muted);
    if (!S.muted) Sfx.startMusic();
    UI.muteUpdate();
    saveSoon();
  }

  // ================= ОФФЛАЙН-ДОХОД =================
  function offlineIncome(seconds) {
    if (seconds < 90 || S.maxWave < 2) return 0;
    const capped = Math.min(seconds, 8 * 3600);
    const rate = Bal.gold(S.maxWave) * 0.35 * goldMult() * 0.6;
    return Math.floor(rate * capped);
  }

  // ================= ГЛАВНЫЙ ЦИКЛ =================
  function update(dt) {
    const now = Date.now();
    if (C.comboT && now - C.comboT > 3000) { C.mergeCombo = 0; C.comboT = 0; }

    // спавн врага
    if (C.spawnT > 0) {
      C.spawnT -= dt;
      if (C.spawnT <= 0) spawnEnemy();
    } else if (C.enemyHp > 0 && !C.dying) {
      // таймер босса
      if (C.isBoss) {
        C.bossTimer -= dt;
        if (C.bossTimer <= 0) { bossFail(); return; }
      }
      // атаки героя
      C.attackT += dt;
      if (C.attackT >= Bal.attackInterval) {
        C.attackT -= Bal.attackInterval;
        heroAttack();
      }
      // DPS Пепе
      if (S.pets.pepe > 0) {
        C.petDpsAcc += petDps() * dt;
        C.petT += dt;
        if (C.petT >= 0.6) {
          const d = C.petDpsAcc;
          C.petDpsAcc = 0; C.petT = 0;
          if (d >= 1) {
            UI.pepeFx();
            applyDamage(d, false, true);
          }
        }
      }
    }

    // ковка
    C.craftT += dt;
    checkCraft(false);

    // авто-клик Кота-Банана
    if (S.pets.banana > 0) {
      C.autoClickT += dt;
      if (C.autoClickT >= autoClickInterval()) {
        C.autoClickT = 0;
        tapAnvil(true);
      }
    }

    // авто-слияние (буст)
    if (now < S.boostAuto) {
      C.autoMergeT += dt;
      if (C.autoMergeT >= 0.8) {
        C.autoMergeT = 0;
        outer:
        for (let i = 0; i < S.slotsUnlocked; i++) {
          if (S.grid[i]) {
            for (let j = i + 1; j < S.slotsUnlocked; j++) {
              if (S.grid[j] === S.grid[i]) { mergeAt(i, j); break outer; }
            }
          }
        }
      }
    }

    // дрон с подарком
    C.droneT -= dt;
    if (C.droneT <= 0) {
      C.droneT = 60 + Math.random() * 30;
      UI.spawnDrone();
    }

    if (C.fullWarnT > 0) C.fullWarnT -= dt;
  }

  let lastTs = 0;
  let rafQueued = false;
  function scheduleRaf() {
    if (!rafQueued) {
      rafQueued = true;
      requestAnimationFrame(frame);
    }
  }
  function frame(ts) {
    rafQueued = false;
    C.lastRaf = performance.now();
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    if (!C.paused && C.started) update(dt);
    UI.frame(dt);
    scheduleRaf();
  }
  function startLoop() {
    C.started = true;
    scheduleRaf();
    // Страховка для сред с троттлингом requestAnimationFrame (фоновая вкладка, webview):
    // если rAF не тикает дольше 300мс — гоняем цикл таймером, пока rAF не оживает.
    setInterval(() => {
      if (C.started && performance.now() - (C.lastRaf || 0) > 300) {
        frame(performance.now());
      }
    }, 200);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && C.started) scheduleRaf();
    });
    window.addEventListener('focus', () => {
      if (C.started) scheduleRaf();
    });
  }
  function setPaused(p) {
    if (p === C.paused) return;
    C.paused = p;
    if (p) {
      Sfx.suspendCtx();
    } else {
      Sfx.resumeCtx();
      if (!S.muted) Sfx.startMusic();
    }
  }

  // ================= СОХРАНЕНИЯ =================
  function sanitize(d) {
    const def = defaultState();
    if (!d || typeof d !== 'object') return def;
    const out = def;
    ['gold', 'gems', 'stones', 'wave', 'kills', 'maxWave', 'equipped', 'slotsUnlocked', 'wheelLast', 'boostAuto', 'boostBerserk', 'boostGold2', 'lastSeen']
      .forEach((k) => { if (typeof d[k] === 'number' && isFinite(d[k])) out[k] = d[k]; });
    if (typeof d.muted === 'boolean') out.muted = d.muted;
    if (typeof d.lang === 'string') out.lang = d.lang;
    if (Array.isArray(d.grid)) {
      out.grid = new Array(MAX_SLOTS).fill(null);
      for (let i = 0; i < MAX_SLOTS; i++) {
        const v = d.grid[i];
        if (typeof v === 'number' && v >= 1 && v <= 50) out.grid[i] = Math.floor(v);
      }
    }
    ['up', 'pets', 'arts', 'stats'].forEach((grp) => {
      if (d[grp] && typeof d[grp] === 'object') {
        for (const k in out[grp]) {
          if (typeof d[grp][k] === 'number' && isFinite(d[grp][k])) out[grp][k] = Math.max(0, Math.floor(d[grp][k]));
        }
      }
    });
    if (Array.isArray(d.disc)) {
      out.disc = d.disc.filter((v) => typeof v === 'number' && v >= 1 && v <= 50).map((v) => Math.floor(v));
    }
    if (d.quests && typeof d.quests === 'object') {
      if (typeof d.quests.date === 'string') out.quests.date = d.quests.date;
      if (Array.isArray(d.quests.list)) {
        out.quests.list = d.quests.list.slice(0, 3).map((q) => ({
          id: String(q.id || 'kill'), n: Number(q.n) || 1, gems: Number(q.gems) || 10,
          prog: Number(q.prog) || 0, claimed: !!q.claimed
        }));
      }
    }
    out.slotsUnlocked = Math.max(1, Math.min(MAX_SLOTS, Math.floor(out.slotsUnlocked)));
    out.equipped = out.equipped ? Math.min(50, Math.max(1, Math.floor(out.equipped))) : null;
    return out;
  }

  function save(cloud) {
    S.lastSeen = Date.now();
    const data = JSON.parse(JSON.stringify(S));
    YSDK.saveLocal(data);
    const now = Date.now();
    if (cloud || now - lastCloudSave > 30000) {
      lastCloudSave = now;
      // cloud=true (закрытие игры, престиж) — setData с flush=true,
      // чтобы критичный прогресс гарантированно ушёл на сервер Яндекса.
      YSDK.saveCloud(data, !!cloud);
    }
  }
  let saveTimer = null;
  function saveSoon() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; save(false); }, 2000);
  }

  function afterLoad() {
    // Язык управляется только через YandexSDK (environment.i18n.lang, п. 2.14):
    // кэшированный язык НЕ перекрывает SDK — иначе SDK-mocks модерации не сработают.
    refreshQuests(false);
    if (S.equipped == null && !S.grid.some((v) => v)) placeWeapon(1);
    if (S.equipped == null) autoEquip();
    // оффлайн-доход
    const away = (Date.now() - (S.lastSeen || Date.now())) / 1000;
    const gold = offlineIncome(away);
    if (gold > 0) {
      C.offlineGold = gold;
      UI.offlineModal(gold);
    }
  }

  function load() {
    YSDK.loadCloud((cloud, local) => {
      let data = null;
      if (cloud && local) data = (local.lastSeen || 0) > (cloud.lastSeen || 0) ? local : cloud;
      else data = cloud || local;
      S = sanitize(data);
      afterLoad();
      UI.onLoaded();
    });
  }

  // старт новой игры
  function newGameDefaults() {
    placeWeapon(1);
    autoEquip();
  }

  return {
    get S() { return S; },
    get C() { return C; },
    Bal, UPS, PETS, ARTS, WHEEL, QUEST_POOL,
    fmt, baseCraftLevel, craftTime, critChance, critMult, doubleChance,
    dmgMult, goldMult, heroDamage, petDps, autoClickInterval, maxDisc,
    biomeIdx, canFreeSpin, prestigeGain,
    tapAnvil, doCraft, mergeAt, tryAutoMergeAt, sellAt, equipSwap, discardAt,
    buyUpgrade, buySlot, buyPet, buyArt, doPrestige,
    claimQuest, refreshQuestsAd, spinWheel, applyWheel,
    activateBerserk, activateAutoMerge, claimDrone, claimOffline,
    toggleMute, save, saveSoon, load, startLoop, setPaused, spawnEnemy,
    refreshQuests, questProgress, newGameDefaults,
    _tick: (n, dt) => { const d = dt || 0.05; for (let i = 0; i < (n || 1); i++) update(d); }
  };
})();
