/* ============================================================
   UI — рендер, ввод, частицы, вкладки, модалки
   ============================================================ */
'use strict';

const UI = (() => {
  const $ = (id) => document.getElementById(id);
  let appEl, shakeEl, bgEl, heroWrap, heroEl, heroWeaponEl, petsFlyEl, enemyWrap, enemyEl, enemyName, enemyHpFill;
  let hudGold, hudGems, hudStones, goldVal, gemVal, stoneVal, muteBtn, waveInfoEl, bossTimerEl, bossTimerFill, bossTimerText;
  let berserkBtn, anvilBtn, anvilFill, anvilLvl, anvilTimerText, boostBtn, gridEl, equipSlot, equipStats, equipLabel;
  let tabpanel, tabwrap, modalRoot, toastRoot, adOverlay, dragGhost, droneEl, fxCanvas, fxCtx;
  let cells = [];
  let activeTab = 'upgrades';
  let refreshers = [];
  let encyDirty = false;
  let shakeAmt = 0;
  let slowAcc = 0, tabAcc = 0;
  let wheelRot = 0, spinning = false;
  let lastTapIdx = -1, lastTapT = 0;
  let built = false;
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);

  // Запись в DOM только при реальном изменении (экономия layout/перерисовок)
  function setText(node, s) { if (node && node.__t !== s) { node.__t = s; node.textContent = s; } }
  function setHtml(node, s) { if (node && node.__h !== s) { node.__h = s; node.innerHTML = s; } }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const t = (k, v) => I18N.t(k, v);
  const S = () => Game.S;

  // ================= ПОЗИЦИИ =================
  function appPos(domEl) {
    if (!domEl) return { x: 0, y: 0 };
    const a = appEl.getBoundingClientRect();
    const r = domEl.getBoundingClientRect();
    return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
  }
  const enemyPos = () => appPos(enemyEl);
  const heroPos = () => appPos(heroEl);
  const anvilPos = () => appPos(anvilBtn);
  const goldPos = () => appPos(hudGold);
  const slotPos = (i) => appPos(cells[i]);

  // ================= FX (canvas-частицы) =================
  const FX = (() => {
    let W = 0, H = 0;
    const sparks = [], texts = [], coins = [], confetti = [];
    function resize() {
      const r = appEl.getBoundingClientRect();
      W = r.width; H = r.height;
      fxCanvas.width = Math.round(W * dpr);
      fxCanvas.height = Math.round(H * dpr);
      fxCanvas.style.width = W + 'px';
      fxCanvas.style.height = H + 'px';
      fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spark(x, y, n, colors) {
      const cols = colors || ['#ffd23f', '#ff8a3b', '#fff3b0'];
      for (let i = 0; i < n; i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 260,
          vy: -80 - Math.random() * 220,
          g: 620, life: 0.4 + Math.random() * 0.3, tl: 0,
          size: 2 + Math.random() * 3,
          c: cols[(Math.random() * cols.length) | 0]
        });
      }
    }
    function burst(x, y, color, n) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 160;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, g: 300, life: 0.5 + Math.random() * 0.3, tl: 0, size: 2 + Math.random() * 3, c: color });
      }
    }
    function dmg(v, crit, isPet) {
      const p = enemyPos();
      texts.push({
        x: p.x + (Math.random() - 0.5) * 30, y: p.y - 20,
        vy: -64, life: crit ? 1.1 : 0.85, tl: 0,
        txt: Game.fmt(v),
        crit: !!crit, pet: !!isPet
      });
    }
    function coinsFx(n) {
      const from = enemyPos(), to = goldPos();
      const count = Math.min(14, n);
      for (let i = 0; i < count; i++) {
        coins.push({
          x0: from.x + (Math.random() - 0.5) * 40, y0: from.y + (Math.random() - 0.5) * 20,
          cx: (from.x + to.x) / 2 + (Math.random() - 0.5) * 120, cy: Math.min(from.y, to.y) - 60 - Math.random() * 60,
          x2: to.x, y2: to.y,
          t: -i * 0.045, dur: 0.55, r: 5 + Math.random() * 3
        });
      }
    }
    function confettiFx() {
      const colors = ['#ff5a5a', '#ffd23f', '#7ed957', '#40c4ff', '#b45cff', '#ff9a3d'];
      for (let i = 0; i < 60; i++) {
        confetti.push({
          x: Math.random() * W, y: -10 - Math.random() * 40,
          vx: (Math.random() - 0.5) * 60, vy: 90 + Math.random() * 140,
          rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 8,
          life: 2.2 + Math.random(), tl: 0, size: 4 + Math.random() * 4,
          c: colors[(Math.random() * colors.length) | 0]
        });
      }
    }
    function step(dt) {
      const ctx = fxCtx;
      ctx.clearRect(0, 0, W, H);
      // искры
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.tl += dt;
        if (s.tl >= s.life) { sparks.splice(i, 1); continue; }
        s.vy += s.g * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        ctx.globalAlpha = 1 - s.tl / s.life;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // монеты
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.t += dt;
        if (c.t < 0) continue;
        const k = Math.min(1, c.t / c.dur);
        if (k >= 1) { coins.splice(i, 1); continue; }
        const u = 1 - k;
        const x = u * u * c.x0 + 2 * u * k * c.cx + k * k * c.x2;
        const y = u * u * c.y0 + 2 * u * k * c.cy + k * k * c.y2;
        ctx.fillStyle = '#ffd23f';
        ctx.strokeStyle = '#8a5a10';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, c.r * (0.7 + 0.3 * Math.sin(c.t * 20)), 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
      // конфетти
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.tl += dt;
        if (c.tl >= c.life || c.y > H + 20) { confetti.splice(i, 1); continue; }
        c.vy += 60 * dt;
        c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = Math.min(1, 2 - c.tl / c.life);
        ctx.fillStyle = c.c;
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      // цифры урона
      for (let i = texts.length - 1; i >= 0; i--) {
        const d = texts[i];
        d.tl += dt;
        if (d.tl >= d.life) { texts.splice(i, 1); continue; }
        d.y += d.vy * dt;
        d.vy *= (1 - 1.6 * dt);
        const a = 1 - Math.pow(d.tl / d.life, 2);
        const size = d.crit ? 26 : d.pet ? 13 : 15;
        ctx.globalAlpha = a;
        ctx.font = '900 ' + size + 'px "Segoe UI", "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3.4;
        ctx.strokeStyle = 'rgba(0,0,0,.85)';
        ctx.strokeText(d.txt, d.x, d.y);
        ctx.fillStyle = d.crit ? '#ffd23f' : d.pet ? '#c39bff' : '#ffffff';
        ctx.fillText(d.txt, d.x, d.y);
        if (d.crit) { // иконка молнии
          const bx = d.x - ctx.measureText(d.txt).width / 2 - 13, by = d.y - 10;
          ctx.fillStyle = '#ffd23f';
          ctx.strokeStyle = 'rgba(0,0,0,.85)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(bx + 4, by);
          ctx.lineTo(bx, by + 7);
          ctx.lineTo(bx + 2.6, by + 7);
          ctx.lineTo(bx + 1.4, by + 13);
          ctx.lineTo(bx + 6, by + 5.4);
          ctx.lineTo(bx + 3.2, by + 5.4);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    return { resize, spark, sparks: spark, burst, dmg, coins: coinsFx, confetti: confettiFx, step };
  })();

  function shake(n) { shakeAmt = Math.min(14, Math.max(shakeAmt, n)); }

  // ================= СБОРКА СТАТИКИ =================
  function build() {
    appEl = $('app'); shakeEl = $('arenaShake'); bgEl = $('bg');
    heroWrap = $('heroWrap'); heroEl = $('hero'); heroWeaponEl = $('heroWeapon'); petsFlyEl = $('petsFly');
    enemyWrap = $('enemyWrap'); enemyEl = $('enemy'); enemyName = $('enemyName'); enemyHpFill = $('enemyHpFill');
    hudGold = $('hudGold'); hudGems = $('hudGems'); hudStones = $('hudStones');
    goldVal = $('goldVal'); gemVal = $('gemVal'); stoneVal = $('stoneVal');
    muteBtn = $('muteBtn'); waveInfoEl = $('waveInfo'); bossTimerEl = $('bossTimer');
    bossTimerFill = $('bossTimerFill'); bossTimerText = $('bossTimerText');
    berserkBtn = $('berserkBtn'); anvilBtn = $('anvilBtn'); anvilFill = $('anvilFill');
    anvilLvl = $('anvilLvl'); anvilTimerText = $('anvilTimerText'); boostBtn = $('boostBtn');
    gridEl = $('grid'); equipSlot = $('equipSlot'); equipStats = $('equipStats'); equipLabel = $('equipLabel');
    tabpanel = $('tabpanel'); tabwrap = $('tabwrap');
    modalRoot = $('modalRoot'); toastRoot = $('toastRoot'); adOverlay = $('adOverlay'); dragGhost = $('dragGhost');
    droneEl = $('drone'); fxCanvas = $('fx'); fxCtx = fxCanvas.getContext('2d');

    heroEl.innerHTML = Art.hero(150);
    heroWrap.classList.add('breathe');
    droneEl.innerHTML = Art.drone(56);

    $('trashIco').innerHTML = Art.icon('trash', 18);

    $('hudGold').querySelector('.rIcon').innerHTML = Art.icon('coin', 18);
    $('hudGems').querySelector('.rIcon').innerHTML = Art.icon('gem', 18);
    $('hudStones').querySelector('.rIcon').innerHTML = Art.icon('stone', 18);
    $('anvilIcon').innerHTML = Art.icon('anvil', 44);

    // вкладки (forge = кузница, остальные — контент)
    const tabs = [
      ['forge', 'anvil', 'tabForge'],
      ['upgrades', 'hammer', 'tabUpgrades'],
      ['pets', 'paw', 'tabPets'],
      ['prestige', 'stone', 'tabPrestige'],
      ['ency', 'book', 'tabEncy'],
      ['quests', 'scroll', 'tabQuests']
    ];
    document.querySelectorAll('.tabBtn').forEach((btn, i) => {
      btn.querySelector('.tabIco').innerHTML = Art.icon(tabs[i][1], 22);
      btn.addEventListener('click', () => { Sfx.play('click'); switchTab(tabs[i][0]); });
    });

    muteBtn.addEventListener('click', () => Game.toggleMute());
    anvilBtn.addEventListener('click', () => Game.tapAnvil(false));
    berserkBtn.classList.remove('hidden');
    berserkBtn.addEventListener('click', () => Game.activateBerserk());
    boostBtn.addEventListener('click', () => Game.activateAutoMerge());
    droneEl.addEventListener('click', droneModal);

    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('dragstart', (e) => e.preventDefault());
    window.addEventListener('resize', () => FX.resize());
    bindGridInput();
    FX.resize();
    built = true;
  }

  // ================= ЯЗЫК =================
  function applyLang() {
    document.title = I18N.t('title');
    equipLabel.textContent = t('equipLabel');
    $('anvilLabel').textContent = t('anvilLabel');
    boostBtn.innerHTML = `<span class="adIco">${Art.icon('video', 16)}</span><span>${t('boost')}</span>`;
    berserkBtn.innerHTML = `<span class="adIco">${Art.icon('video', 16)}</span><span>${t('berserk')}</span>`;
    const labels = { forge: 'tabForge', upgrades: 'tabUpgrades', pets: 'tabPets', prestige: 'tabPrestige', ency: 'tabEncy', quests: 'tabQuests' };
    document.querySelectorAll('.tabBtn').forEach((btn) => {
      btn.querySelector('.tabLbl').textContent = t(labels[btn.dataset.tab]);
    });
    setText($('trashLbl'), t('trash'));
    setText($('trashHint'), t('trashHint'));
    muteUpdate();
    waveInfo();
    equipUpdate(false);
    switchTab(activeTab);
  }

  // ================= HUD =================
  function hud() {
    setText(goldVal, Game.fmt(S().gold));
    setText(gemVal, Game.fmt(S().gems));
    setText(stoneVal, Game.fmt(S().stones));
  }
  function muteUpdate() {
    muteBtn.innerHTML = Art.icon(S().muted ? 'mute' : 'sound', 20);
  }

  // ================= АРЕНА =================
  function waveInfo() {
    const g = Game;
    const b = I18N.biomeName(g.biomeIdx());
    const isBoss = g.S.wave % g.Bal.bossEvery === 0 && g.C.enemyHp > 0;
    const line = isBoss
      ? t('waveBoss', { w: g.S.wave })
      : t('wave', { w: g.S.wave, k: Math.min(g.S.kills, g.Bal.killsPerWave), n: g.Bal.killsPerWave });
    setHtml(waveInfoEl, `<span class="bio">${b}</span>${line}`);
  }
  function setBiome(idx, force) {
    if (!force && idx === Game.C.biomeIdx) return;
    Game.C.biomeIdx = idx;
    bgEl.style.opacity = '0';
    setTimeout(() => {
      bgEl.innerHTML = Art.biome(idx);
      bgEl.style.opacity = '1';
    }, 120);
  }
  function renderEnemy(idx, isBoss, name) {
    const mIdx = isBoss ? (Math.floor(S().wave / Game.Bal.bossEvery) - 1 + 15) % 15 : idx;
    enemyEl.innerHTML = Art.monster(mIdx, 110, isBoss);
    enemyEl.className = isBoss ? 'bossIdle' : 'idle';
    enemyName.textContent = name;
    enemyName.classList.toggle('bossName', isBoss);
    enemyHpFill.classList.toggle('boss', isBoss);
    enemyWrap.classList.toggle('boss', isBoss);
    enemyWrap.style.width = isBoss ? 'clamp(120px, 30vh, 215px)' : '';
  }
  function enemyHp(frac) { enemyHpFill.style.width = (Math.max(0, Math.min(1, frac)) * 100) + '%'; }
  function enemyHurt() {
    enemyEl.classList.remove('hurt');
    void enemyEl.offsetWidth;
    enemyEl.classList.add('hurt');
  }
  function enemyDie() {
    enemyEl.classList.remove('bossIdle', 'idle');
    enemyEl.classList.add('dying');
    FX.burst(enemyPos().x, enemyPos().y, '#ffffff', 8);
    waveInfo();
  }
  function heroSwing() {
    heroWrap.classList.remove('atk');
    void heroWrap.offsetWidth;
    heroWrap.classList.add('atk');
    setTimeout(() => heroWrap.classList.remove('atk'), 360);
  }
  function heroWeaponUpdate() {
    const e = S().equipped;
    heroWeaponEl.innerHTML = e ? Art.weapon(e, 90) : '';
  }
  function equipUpdate(glow) {
    const e = S().equipped;
    if (e) {
      equipSlot.innerHTML = Art.weapon(e, 80) + `<span class="lvBadge">${e}</span>`;
      equipStats.innerHTML = `<span class="nm">${I18N.weaponName(e)}</span>` +
        `<span class="dmg">${t('dmg')}: ${Game.fmt(Game.heroDamage())}</span>`;
    } else {
      equipSlot.innerHTML = '';
      equipStats.innerHTML = '';
    }
    if (glow) {
      equipSlot.classList.add('glow');
      setTimeout(() => equipSlot.classList.remove('glow'), 700);
    }
  }
  function petsFlyUpdate() {
    petsFlyEl.innerHTML = '';
    const pos = [
      { top: '-36%', left: '64%' }, { top: '-8%', left: '88%' }, { top: '26%', left: '97%' },
      { top: '-44%', left: '24%' }, { top: '44%', left: '12%' }, { top: '0%', left: '-4%' }
    ];
    let k = 0;
    Game.PETS.forEach((p, i) => {
      if (S().pets[p.id] > 0) {
        const d = el('div', 'petFly', Art.pet(i, 50));
        const st = pos[k % pos.length];
        d.style.top = st.top; d.style.left = st.left;
        petsFlyEl.appendChild(d);
        k++;
      }
    });
  }
  function pepeFx() {
    const p = heroPos();
    FX.burst(p.x + 30, p.y - 30, '#b45cff', 5);
  }
  function bossTimerShow() { bossTimerEl.classList.remove('hidden'); }
  function bossTimerHide() { bossTimerEl.classList.add('hidden'); }
  function spawnDrone() {
    droneEl.classList.remove('fly');
    void droneEl.offsetWidth;
    droneEl.classList.add('fly');
    Sfx.play('drone');
  }

  // ================= КУЗНИЦА =================
  function gridRender() {
    gridEl.innerHTML = '';
    cells = [];
    // 16 базовых слотов; после выкупа 16-го показываются ещё 8 (сетка 4x6)
    const vis = S().slotsUnlocked >= 16 ? 24 : 16;
    gridEl.style.gridTemplateRows = 'repeat(' + (vis > 16 ? 6 : 4) + ', 1fr)';
    for (let i = 0; i < vis; i++) {
      const c = el('div', 'slot');
      c.dataset.i = i;
      if (i >= S().slotsUnlocked) {
        c.classList.add('lockedSlot');
        c.innerHTML = Art.icon('lock', 22) +
          `<span class="lockPrice">${Art.icon('coin', 11)}${Game.fmt(Game.Bal.slotCost(i))}</span>`;
      } else {
        fillCell(c, i);
      }
      gridEl.appendChild(c);
      cells.push(c);
    }
  }
  function fillCell(c, i) {
    const lvl = S().grid[i];
    c.className = 'slot' + (lvl ? '' : ' empty');
    c.innerHTML = lvl ? Art.weapon(lvl, 64) + `<span class="lvBadge">${lvl}</span>` : '';
  }
  function gridSlot(i, isNew) {
    const c = cells[i];
    if (!c || i >= S().slotsUnlocked) { gridRender(); return; }
    fillCell(c, i);
    if (isNew) {
      c.classList.add('newItem');
      setTimeout(() => c.classList.remove('newItem'), 300);
    }
  }
  function mergeFx(i) {
    const p = slotPos(i);
    if (p) FX.burst(p.x, p.y, '#ffd23f', 12);
    const c = cells[i];
    if (c) {
      c.classList.remove('pulseMerge');
      void c.offsetWidth;
      c.classList.add('pulseMerge');
    }
  }
  function anvilUpdate() {
    const ct = Game.craftTime();
    const p = Math.min(1, Game.C.craftT / ct);
    anvilFill.style.width = (p * 100) + '%';
    setText(anvilTimerText, Math.max(0, ct - Game.C.craftT).toFixed(1));
    setText(anvilLvl, t('anvilLvl', { n: Game.baseCraftLevel() }));
  }
  function anvilSmash(fromPet) {
    anvilBtn.classList.remove('smash');
    void anvilBtn.offsetWidth;
    anvilBtn.classList.add('smash');
  }
  function anvilFull() {
    anvilBtn.classList.add('full');
    setTimeout(() => anvilBtn.classList.remove('full'), 500);
  }

  // ================= DRAG & DROP =================
  let dragSt = null;
  function bindGridInput() {
    gridEl.addEventListener('pointerdown', (e) => {
      const cell = e.target.closest('.slot');
      if (!cell || !gridEl.contains(cell)) return;
      const idx = +cell.dataset.i;
      if (cell.classList.contains('lockedSlot')) {
        // покупается только следующий по очереди слот
        if (idx === S().slotsUnlocked) Game.buySlot();
        else Sfx.play('err');
        return;
      }
      if (!S().grid[idx]) return;
      e.preventDefault();
      dragSt = {
        idx, x: e.clientX, y: e.clientY, cell,
        moved: false, dragging: false, sold: false,
        lp: setTimeout(() => {
          if (dragSt && !dragSt.dragging && !dragSt.moved) {
            dragSt.sold = true;
            const p = slotPos(idx);
            if (p) FX.burst(p.x, p.y, '#ffd23f', 6);
            Game.sellAt(idx);
            dragSt = null;
            clearDropHi();
          }
        }, 600)
      };
      window.addEventListener('pointermove', onDragMove);
      window.addEventListener('pointerup', onDragUp);
      window.addEventListener('pointercancel', onDragUp);
    });
    equipSlot.addEventListener('pointerdown', (e) => e.preventDefault());
  }
  function clearDropHi() {
    document.querySelectorAll('.slot.droptarget').forEach((n) => n.classList.remove('droptarget', 'bad'));
    equipSlot.classList.remove('droptarget');
    $('trashSlot').classList.remove('droptarget');
    dragGhost.classList.add('hidden');
    dragGhost.innerHTML = '';
  }
  function onDragMove(e) {
    if (!dragSt) return;
    const dx = e.clientX - dragSt.x, dy = e.clientY - dragSt.y;
    if (!dragSt.moved && Math.hypot(dx, dy) > 10) {
      dragSt.moved = true;
      clearTimeout(dragSt.lp);
    }
    if (!dragSt.moved) return;
    if (!dragSt.dragging) {
      dragSt.dragging = true;
      dragSt.cell.classList.add('dragSrc');
      dragGhost.innerHTML = Art.weapon(S().grid[dragSt.idx], 62);
      dragGhost.classList.remove('hidden');
    }
    dragGhost.style.left = e.clientX + 'px';
    dragGhost.style.top = e.clientY + 'px';
    // подсветка цели
    clearHi();
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const target = under && (under.closest('.slot') || under.closest('#equipSlot') || under.closest('#trashSlot'));
    if (target && target !== dragSt.cell) {
      if (target.id === 'equipSlot' || target.id === 'trashSlot') target.classList.add('droptarget');
      else {
        const j = +target.dataset.i;
        if (!target.classList.contains('lockedSlot')) {
          const ok = S().grid[j] === S().grid[dragSt.idx];
          target.classList.add('droptarget');
          if (!ok && S().grid[j]) target.classList.add('bad');
        }
      }
    }
  }
  function clearHi() {
    document.querySelectorAll('.slot.droptarget').forEach((n) => n.classList.remove('droptarget', 'bad'));
    equipSlot.classList.remove('droptarget');
    $('trashSlot').classList.remove('droptarget');
  }
  function onDragUp(e) {
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragUp);
    window.removeEventListener('pointercancel', onDragUp);
    if (!dragSt) return;
    const st = dragSt;
    dragSt = null;
    clearTimeout(st.lp);
    const srcLvl = S().grid[st.idx];
    if (st.dragging) {
      st.cell.classList.remove('dragSrc');
      clearDropHi();
      const under = document.elementFromPoint(e.clientX, e.clientY);
      if (under && under.closest('#trashSlot')) {
        // выброс меча в корзину
        const p = appPos($('trashSlot'));
        if (p) FX.burst(p.x, p.y, '#c86a5a', 10);
        Sfx.play('kill');
        Game.discardAt(st.idx);
        gridSlot(st.idx, false);
        return;
      }
      const target = under && (under.closest('.slot') || under.closest('#equipSlot'));
      if (target && target.id === 'equipSlot') {
        Game.equipSwap(st.idx);
        return;
      }
      if (target && target.classList && target.classList.contains('slot') && !target.classList.contains('lockedSlot')) {
        const j = +target.dataset.i;
        if (j !== st.idx) {
          if (srcLvl && S().grid[j] === srcLvl) {
            Game.mergeAt(j, st.idx);
          } else {
            const tmp = S().grid[j];
            S().grid[j] = S().grid[st.idx];
            S().grid[st.idx] = tmp;
            Sfx.play('click');
            gridSlot(j, false);
            gridSlot(st.idx, false);
            Game.saveSoon();
          }
        }
      }
      return;
    }
    if (st.sold) return;
    // тап / двойной тап = быстрое слияние
    const now = Date.now();
    if (lastTapIdx === st.idx && now - lastTapT < 350) {
      lastTapIdx = -1;
      if (!Game.tryAutoMergeAt(st.idx)) {
        st.cell.classList.add('bad');
        setTimeout(() => st.cell.classList.remove('bad'), 300);
        Sfx.play('err');
      }
    } else {
      lastTapIdx = st.idx;
      lastTapT = now;
      Sfx.play('tick');
    }
  }

  // ================= ВКЛАДКИ =================
  function switchTab(name) {
    activeTab = name;
    document.querySelectorAll('.tabBtn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
    const forgeEl = $('forge');
    if (name === 'forge') {
      forgeEl.classList.remove('hidden');
      tabwrap.classList.add('hidden');
      return;
    }
    forgeEl.classList.add('hidden');
    tabwrap.classList.remove('hidden');
    if (name === 'upgrades') renderUpgrades();
    else if (name === 'pets') renderPets();
    else if (name === 'prestige') renderPrestige();
    else if (name === 'ency') renderEncy();
    else if (name === 'quests') renderQuests();
  }
  function refreshTab() {
    refreshers.forEach((f) => { try { f(); } catch (e) {} });
  }
  function pips(container, max, lvl) {
    container.innerHTML = '';
    if (max > 12) return;
    for (let i = 0; i < max; i++) {
      const p = el('i');
      if (i < lvl) p.classList.add('on');
      container.appendChild(p);
    }
  }
  function upDesc(id) {
    switch (id) {
      case 'base': return t('up_base_d', { n: Game.baseCraftLevel() });
      case 'speed': return t('up_speed_d', { t: Game.craftTime().toFixed(1) });
      case 'double': return t('up_double_d', { p: Math.round(Game.doubleChance() * 100) });
      case 'critc': return t('up_critc_d', { p: (Game.critChance() * 100).toFixed(1) });
      case 'critp': return t('up_critp_d', { p: Game.critMult().toFixed(1) });
    }
    return '';
  }
  function renderUpgrades() {
    refreshers = [];
    tabpanel.innerHTML = '';
    tabpanel.appendChild(el('div', 'secTitle', t('upTitle')));
    const icons = { base: 'hammer', speed: 'anvil', double: 'sword', critc: 'bolt', critp: 'flame' };
    Game.UPS.forEach((u) => {
      const row = el('div', 'rowCard');
      row.appendChild(el('span', 'cardIco', Art.icon(icons[u.id], 40)));
      const body = el('div', 'cardBody');
      const nm = el('div', 'cardName');
      const ds = el('div', 'cardDesc');
      const pipsEl = el('div', 'pips');
      body.append(nm, ds, pipsEl);
      const btn = el('button', 'buyBtn');
      row.append(body, btn);
      tabpanel.appendChild(row);
      const refresh = () => {
        const lvl = S().up[u.id];
        nm.textContent = t('up_' + u.id) + ' · ' + lvl;
        ds.textContent = upDesc(u.id);
        pips(pipsEl, u.max, lvl);
        if (lvl >= u.max) {
          btn.innerHTML = t('maxLvl');
          btn.disabled = true;
        } else {
          const cost = u.cost(lvl);
          btn.innerHTML = `<span class="cost">${Art.icon('coin', 12)}${Game.fmt(cost)}</span>`;
          btn.disabled = S().gold < cost;
        }
      };
      btn.addEventListener('click', () => { if (Game.buyUpgrade(u.id)) refresh(); });
      refreshers.push(refresh);
      refresh();
    });
    // слот кузницы
    const row = el('div', 'rowCard');
    row.appendChild(el('span', 'cardIco', Art.icon('lock', 40)));
    const body = el('div', 'cardBody');
    const nm = el('div', 'cardName', t('up_slot'));
    const ds = el('div', 'cardDesc');
    body.append(nm, ds);
    const btn = el('button', 'buyBtn');
    row.append(body, btn);
    tabpanel.appendChild(row);
    const refresh = () => {
      ds.textContent = t('up_slot_d', { n: S().slotsUnlocked });
      if (S().slotsUnlocked >= 24) {
        btn.innerHTML = t('maxLvl');
        btn.disabled = true;
      } else {
        const cost = Game.Bal.slotCost(S().slotsUnlocked);
        btn.innerHTML = `<span class="cost">${Art.icon('coin', 12)}${Game.fmt(cost)}</span>`;
        btn.disabled = S().gold < cost;
      }
    };
    btn.addEventListener('click', () => { if (Game.buySlot()) { gridRender(); refresh(); } });
    refreshers.push(refresh);
    refresh();
  }
  function petDesc(id) {
    const l = S().pets[id];
    switch (id) {
      case 'banana': return t('pet_banana_d', { t: Game.autoClickInterval().toFixed(1) });
      case 'hamster': return t('pet_hamster_d', { p: 20 * l });
      case 'pepe': return t('pet_pepe_d', { p: 15 * l });
      case 'doge': return t('pet_doge_d', { p: 15 * l });
      case 'goose': return t('pet_goose_d', { p: Math.round((1 - Math.pow(0.94, l)) * 100) });
      case 'dragon': return t('pet_dragon_d', { p: 10 * l, p2: 30 * l });
    }
    return '';
  }
  function renderPets() {
    refreshers = [];
    tabpanel.innerHTML = '';
    tabpanel.appendChild(el('div', 'secTitle', t('petsTitle')));
    tabpanel.appendChild(el('div', 'cardDesc', t('petsSub'))).style.marginBottom = '8px';
    Game.PETS.forEach((p, i) => {
      const row = el('div', 'rowCard');
      row.appendChild(el('span', 'cardIco', Art.pet(i, 46)));
      const body = el('div', 'cardBody');
      const nm = el('div', 'cardName');
      const ds = el('div', 'cardDesc');
      const pipsEl = el('div', 'pips');
      body.append(nm, ds, pipsEl);
      const btn = el('button', 'buyBtn gem');
      row.append(body, btn);
      tabpanel.appendChild(row);
      const refresh = () => {
        const lvl = S().pets[p.id];
        nm.textContent = t('pet_' + p.id) + ' · ' + lvl;
        ds.textContent = petDesc(p.id);
        pips(pipsEl, p.max, lvl);
        if (lvl >= p.max) {
          btn.innerHTML = t('maxLvl');
          btn.disabled = true;
        } else {
          const cost = p.cost(lvl);
          btn.innerHTML = `<span class="cost">${Art.icon('gem', 12)}${Game.fmt(cost)}</span>`;
          btn.disabled = S().gems < cost;
        }
      };
      btn.addEventListener('click', () => { if (Game.buyPet(i)) { petsFlyUpdate(); refresh(); } });
      refreshers.push(refresh);
      refresh();
    });
  }
  function artDesc(id) {
    const l = S().arts[id];
    switch (id) {
      case 'wrath': return t('art_wrath_d', { p: 2, c: Math.pow(2, l) });
      case 'slots': return t('art_slots_d', { n: 6 + l });
      case 'echo': return t('art_echo_d', { n: 1 + 5 * l });
      case 'vein': return t('art_vein_d', { p: 50 * l });
      case 'reson': return t('art_reson_d', { n: l });
      case 'wisdom': return t('art_wisdom_d', { n: l });
    }
    return '';
  }
  function renderPrestige() {
    refreshers = [];
    tabpanel.innerHTML = '';
    tabpanel.appendChild(el('div', 'secTitle', t('prTitle')));
    tabpanel.appendChild(el('div', 'cardDesc', t('prDesc'))).style.marginBottom = '8px';
    const stonesRow = el('div', 'rowCard');
    stonesRow.appendChild(el('span', 'cardIco', Art.icon('stone', 40)));
    const sBody = el('div', 'cardBody');
    const sNm = el('div', 'cardName', t('prStones'));
    const sDs = el('div', 'cardDesc');
    sBody.append(sNm, sDs);
    stonesRow.appendChild(sBody);
    tabpanel.appendChild(stonesRow);
    const prBtn = el('button', 'buyBtn stoneB');
    prBtn.style.width = '100%';
    prBtn.style.marginBottom = '10px';
    tabpanel.appendChild(prBtn);
    const refreshPr = () => {
      sDs.textContent = Game.fmt(S().stones);
      const gain = Game.prestigeGain();
      if (gain > 0) {
        prBtn.innerHTML = t('prBtn') + ' · +' + gain;
        prBtn.disabled = false;
      } else {
        prBtn.innerHTML = t('prNeed', { w: S().maxWave });
        prBtn.disabled = true;
      }
    };
    prBtn.addEventListener('click', () => {
      const gain = Game.prestigeGain();
      if (gain <= 0) return;
      modal({
        icon: 'stone',
        title: t('prConfirm'),
        body: t('prConfirm_d', { n: gain }),
        buttons: [
          { label: t('prBtn'), cls: 'stoneB', cb: () => { Game.doPrestige(); refreshTab(); } },
          { label: t('q_claim'), plain: true, cb: () => {} }
        ]
      });
    });
    refreshers.push(refreshPr);
    tabpanel.appendChild(el('div', 'secTitle', t('artTitle')));
    const icons = { wrath: 'flame', slots: 'lock', echo: 'clock', vein: 'coin', reson: 'gem', wisdom: 'book' };
    Game.ARTS.forEach((a) => {
      const row = el('div', 'rowCard');
      row.appendChild(el('span', 'cardIco', Art.icon(icons[a.id], 40)));
      const body = el('div', 'cardBody');
      const nm = el('div', 'cardName');
      const ds = el('div', 'cardDesc');
      const pipsEl = el('div', 'pips');
      body.append(nm, ds, pipsEl);
      const btn = el('button', 'buyBtn stoneB');
      row.append(body, btn);
      tabpanel.appendChild(row);
      const refresh = () => {
        const lvl = S().arts[a.id];
        nm.textContent = t('art_' + a.id) + ' · ' + lvl;
        ds.textContent = artDesc(a.id);
        pips(pipsEl, a.max, lvl);
        if (lvl >= a.max) {
          btn.innerHTML = t('maxLvl');
          btn.disabled = true;
        } else {
          const cost = a.cost(lvl);
          btn.innerHTML = `<span class="cost">${Art.icon('stone', 12)}${Game.fmt(cost)}</span>`;
          btn.disabled = S().stones < cost;
        }
      };
      btn.addEventListener('click', () => { if (Game.buyArt(a.id)) refresh(); });
      refreshers.push(refresh);
      refresh();
    });
    // статистика
    const st = el('div', 'cardDesc');
    st.style.marginTop = '10px';
    tabpanel.appendChild(st);
    const refreshSt = () => {
      st.innerHTML = '<b>' + t('stats') + '</b><br>' +
        t('stMerges', { n: Game.fmt(S().stats.merges) }) + ' · ' +
        t('stBosses', { n: Game.fmt(S().stats.bosses) }) + '<br>' +
        t('stCrafts', { n: Game.fmt(S().stats.crafts) }) + ' · ' +
        t('stPrestiges', { n: Game.fmt(S().stats.prestiges) });
    };
    refreshSt();
    refreshers.push(refreshSt);
    refreshPr();
  }
  function renderEncy() {
    encyDirty = false;
    refreshers = [];
    tabpanel.innerHTML = '';
    tabpanel.appendChild(el('div', 'secTitle', t('encyTitle') + ' · ' + t('encyOpen', { n: S().disc.length })));
    tabpanel.appendChild(el('div', 'cardDesc', t('encySub'))).style.marginBottom = '8px';
    const grid = el('div');
    grid.id = 'encyGrid';
    for (let lvl = 1; lvl <= 50; lvl++) {
      const found = S().disc.indexOf(lvl) !== -1;
      const cell = el('div', 'encyCell' + (found ? '' : ' locked'));
      cell.innerHTML = Art.weapon(lvl, 42) +
        `<div class="eName">${found ? I18N.weaponName(lvl) : t('encyUnknown')}</div>` +
        (found ? `<div class="eDmg">${Game.fmt(Game.Bal.dmg(lvl))}</div>` : '') +
        (found ? '' : `<span class="eReward">${Art.icon('gem', 9)}${5 + lvl}</span>`);
      grid.appendChild(cell);
    }
    tabpanel.appendChild(grid);
  }
  const QUEST_ICONS = { merge: 'sword', boss: 'skull', click: 'anvil', craft: 'hammer', kill: 'flame' };
  function renderQuests() {
    refreshers = [];
    tabpanel.innerHTML = '';
    tabpanel.appendChild(el('div', 'secTitle', t('qTitle')));
    const head = el('div', 'rowCard');
    head.appendChild(el('span', 'cardIco', Art.icon('clock', 34)));
    head.appendChild(el('div', 'cardBody', `<div class="cardName">${t('qSub')}</div>`));
    const refBtn = el('button', 'buyBtn ad');
    refBtn.innerHTML = `<span class="cost">${Art.icon('video', 12)}${t('q_refresh')}</span>`;
    refBtn.addEventListener('click', () => Game.refreshQuestsAd());
    head.appendChild(refBtn);
    tabpanel.appendChild(head);
    S().quests.list.forEach((q, i) => {
      const row = el('div', 'rowCard questCard');
      row.appendChild(el('span', 'cardIco', Art.icon(QUEST_ICONS[q.id] || 'star', 36)));
      const body = el('div', 'cardBody');
      const ds = el('div', 'cardDesc');
      const bar = el('div', 'qBar');
      const fill = el('i');
      bar.appendChild(fill);
      body.append(ds, bar);
      const btn = el('button', 'buyBtn gem');
      row.append(body, btn);
      tabpanel.appendChild(row);
      const refresh = () => {
        ds.textContent = t('q_' + q.id, { n: q.n }) + ' · ' + t('q_progress', { a: Math.min(q.prog, q.n), n: q.n });
        fill.style.width = Math.min(100, (q.prog / q.n) * 100) + '%';
        if (q.claimed) {
          btn.innerHTML = t('q_done');
          btn.disabled = true;
        } else if (q.prog >= q.n) {
          btn.innerHTML = `<span class="cost">${Art.icon('gem', 12)}+${q.gems}</span>`;
          btn.disabled = false;
        } else {
          btn.innerHTML = t('q_claim');
          btn.disabled = true;
        }
      };
      btn.addEventListener('click', () => Game.claimQuest(i));
      refreshers.push(refresh);
      refresh();
    });
    // Колесо Фортуны
    tabpanel.appendChild(el('div', 'secTitle', t('whTitle')));
    const wrap = el('div');
    wrap.id = 'wheelWrap';
    const box = el('div');
    box.id = 'wheelBox';
    box.innerHTML = `<div id="wheelPin">${Art.icon('pin', 26)}</div>` + Art.wheelSvg();
    wrap.appendChild(box);
    const spinBtn = el('button', 'buyBtn');
    spinBtn.style.marginTop = '10px';
    const cd = el('div', 'cardDesc');
    cd.style.marginTop = '6px';
    wrap.append(spinBtn, cd);
    tabpanel.appendChild(wrap);
    const refresh = () => {
      const free = Game.canFreeSpin();
      if (spinning) {
        spinBtn.disabled = true;
        spinBtn.innerHTML = '...';
        cd.textContent = '';
      } else if (free) {
        spinBtn.disabled = false;
        spinBtn.innerHTML = t('whFree');
        cd.textContent = '';
      } else {
        spinBtn.disabled = false;
        spinBtn.innerHTML = `<span class="cost">${Art.icon('video', 12)}${t('whAd')}</span>`;
        const left = 4 * 3600 * 1000 - (Date.now() - S().wheelLast);
        const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000);
        cd.textContent = t('whWait', { t: h + 'ч ' + m + 'м' });
      }
    };
    spinBtn.addEventListener('click', () => {
      if (spinning) return;
      Game.spinWheel(!Game.canFreeSpin(), (idx) => {
        spinning = true;
        Sfx.play('spin');
        const svg = $('wheelSvg');
        const desired = 360 * 5 - (idx * 45 + 22.5);
        wheelRot += 1800 + (((desired - wheelRot) % 360) + 360) % 360;
        svg.style.transform = 'rotate(' + wheelRot + 'deg)';
        refresh();
        setTimeout(() => {
          Game.applyWheel(idx);
          spinning = false;
          refresh();
        }, 3500);
      });
    });
    refreshers.push(refresh);
    refresh();
  }
  function tabDots() {
    const dots = document.querySelectorAll('.tabBtn');
    const qClaimable = S().quests.list.some((q) => !q.claimed && q.prog >= q.n);
    const prReady = Game.prestigeGain() > 0;
    dots.forEach((b) => {
      const tab = b.dataset.tab;
      const show = (tab === 'quests' && qClaimable) || (tab === 'prestige' && prReady) || (tab === 'ency' && encyDirty);
      b.querySelector('.tabDot').classList.toggle('hidden', !show);
    });
  }

  // ================= МОДАЛКИ / TOAST =================
  function modal(o) {
    modalRoot.classList.remove('hidden');
    modalRoot.innerHTML = '';
    const m = el('div', 'modal');
    if (o.icon) m.appendChild(el('div', 'mIco', Art.icon(o.icon, 72)));
    else if (o.iconSvg) m.appendChild(el('div', 'mIco', o.iconSvg));
    m.appendChild(el('h2', '', o.title));
    m.appendChild(el('div', 'mBody', o.body));
    const btns = el('div', 'mBtns');
    (o.buttons || []).forEach((b) => {
      const btn = b.plain ? el('button', 'btnPlain') : el('button', 'buyBtn ' + (b.cls || ''));
      btn.innerHTML = (b.adIcon ? Art.icon('video', 15) : '') + b.label;
      btn.addEventListener('click', () => {
        const keep = b.cb && b.cb();
        if (!keep) closeModal();
      });
      btns.appendChild(btn);
    });
    m.appendChild(btns);
    modalRoot.appendChild(m);
    modalRoot.addEventListener('click', function onBack(e) {
      if (e.target === modalRoot && o.dismiss !== false) {
        closeModal();
        modalRoot.removeEventListener('click', onBack);
      }
    });
  }
  function closeModal() {
    modalRoot.classList.add('hidden');
    modalRoot.innerHTML = '';
  }
  function offlineModal(gold) {
    modal({
      icon: 'coin',
      title: t('offlineTitle'),
      body: t('offlineDesc') + `<br><b style="font-size:1.4em">${Game.fmt(gold)}</b>`,
      dismiss: false,
      buttons: [
        { label: t('offlineTake'), cb: () => Game.claimOffline(false) },
        {
          label: t('offlineX2'), cls: 'ad', adIcon: true,
          cb: () => { YSDK.showRewarded(() => Game.claimOffline(true)); return true; }
        }
      ]
    });
  }
  function droneModal() {
    if (!droneEl.classList.contains('fly')) return;
    modal({
      iconSvg: Art.drone(72),
      title: t('droneTitle'),
      body: t('droneDesc', { n: Math.min(50, Game.maxDisc() + 2) }),
      buttons: [
        { label: t('watchAd'), cls: 'ad', adIcon: true, cb: () => { Game.claimDrone(); } },
        { label: t('q_claim'), plain: true, cb: () => {} }
      ]
    });
  }
  function showAdMock(seconds, done) {
    adOverlay.classList.remove('hidden');
    let left = seconds;
    adOverlay.innerHTML = `<div class="adSpin"></div><div class="adTitle">${t('watchAd').toUpperCase()}</div><div class="adCount">${left.toFixed(1)}</div>`;
    const cnt = adOverlay.querySelector('.adCount');
    const iv = setInterval(() => {
      left -= 0.1;
      if (left <= 0) {
        clearInterval(iv);
        adOverlay.classList.add('hidden');
        adOverlay.innerHTML = '';
        if (done) done();
      } else {
        cnt.textContent = left.toFixed(1);
      }
    }, 100);
  }
  function toast(msg, iconName) {
    const d = el('div', 'toast', (iconName ? Art.icon(iconName, 16) : '') + `<span>${msg}</span>`);
    toastRoot.appendChild(d);
    while (toastRoot.children.length > 3) toastRoot.firstChild.remove();
    setTimeout(() => d.classList.add('out'), 2100);
    setTimeout(() => d.remove(), 2500);
  }

  // ================= КАДРОВЫЙ ЦИКЛ UI =================
  function frame(dt) {
    FX.step(dt);
    if (shakeAmt > 0.25) {
      shakeEl.style.transform = 'translate(' + ((Math.random() - 0.5) * shakeAmt).toFixed(1) + 'px,' + ((Math.random() - 0.5) * shakeAmt).toFixed(1) + 'px)';
      shakeAmt *= Math.pow(0.002, dt);
    } else if (shakeAmt !== 0) {
      shakeAmt = 0;
      shakeEl.style.transform = '';
    }
    slowAcc += dt;
    if (slowAcc >= 0.12) {
      slowAcc = 0;
      anvilUpdate();
      waveInfo();
      // босс-таймер
      if (Game.C.bossActive && Game.C.bossTimer > 0) {
        bossTimerFill.style.transform = 'scaleX(' + Math.max(0, Game.C.bossTimer / Game.Bal.bossTime) + ')';
        setText(bossTimerText, t('bossTimer', { s: Math.ceil(Game.C.bossTimer) }));
      }
      // берсерк
      const bz = S().boostBerserk - Date.now();
      if (bz > 0) {
        berserkBtn.classList.add('active');
        setHtml(berserkBtn, `<span class="adIco">${Art.icon('bolt', 16)}</span><span>${t('berserkActive', { s: Math.ceil(bz / 1000) })}</span>`);
        heroWrap.classList.add('berserk');
      } else if (berserkBtn.classList.contains('active')) {
        berserkBtn.classList.remove('active');
        heroWrap.classList.remove('berserk');
        setHtml(berserkBtn, `<span class="adIco">${Art.icon('video', 16)}</span><span>${t('berserk')}</span>`);
      }
      // авто-слияние буст
      const am = S().boostAuto - Date.now();
      if (am > 0) {
        setHtml(boostBtn, `<span class="adIco">${Art.icon('star', 16)}</span><span>${t('boostActive', { s: Math.ceil(am / 1000) })}</span>`);
      } else {
        setHtml(boostBtn, `<span class="adIco">${Art.icon('video', 16)}</span><span>${t('boost')}</span>`);
      }
    }
    tabAcc += dt;
    if (tabAcc >= 0.5) {
      tabAcc = 0;
      refreshTab();
      if (activeTab === 'ency' && encyDirty) renderEncy();
      tabDots();
      hud();
    }
  }

  function onLoaded() {
    hud();
    gridRender();
    equipUpdate(false);
    heroWeaponUpdate();
    petsFlyUpdate();
    setBiome(Game.biomeIdx(), true);
    waveInfo();
    anvilUpdate();
    muteUpdate();
    tabDots();
    switchTab('forge');
    Game.setPaused(false);
    Game.startLoop();
    setTimeout(() => toast(t('welcome'), 'anvil'), 800);
    requestAnimationFrame(() => YSDK.loadingReady());
  }

  return {
    build, applyLang, hud, muteUpdate, frame, onLoaded,
    toast, modal, closeModal, showAdMock, offlineModal,
    setBiome, waveInfo, renderEnemy, enemyHp, enemyHurt, enemyDie,
    heroSwing, heroWeaponUpdate, equipUpdate, petsFlyUpdate, pepeFx, spawnDrone,
    bossTimerShow, bossTimerHide,
    gridRender, gridSlot, mergeFx, anvilUpdate, anvilSmash, anvilFull, anvilPos,
    enemyPos, heroPos, shake,
    tabDots, refreshTab, switchTab,
    FX,
    get activeTab() { return activeTab; },
    set encyDirty(v) { encyDirty = v; },
    get encyDirty() { return encyDirty; }
  };
})();

// FX используется и из game.js — публикуем глобально
window.FX = UI.FX;
