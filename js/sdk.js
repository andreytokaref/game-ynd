/* ============================================================
   YandexSDKManager — интеграция Яндекс Игр с полным фоллбэком
   П. 2.14: язык игры определяется на СТАРТЕ из environment.i18n.lang,
   до первого рендера, с резервным набором языков (RU/EN).
   ============================================================ */
'use strict';

const YSDK = (() => {
  let ysdk = null;
  let player = null;
  let mock = false;
  let ready = false;
  let sdkLang = null;      // сырой код языка из environment.i18n.lang ('ru', 'en', 'tr'…)
  let lastInterstitial = 0;
  let adOpen = false;
  const INTERSTITIAL_CD = 180; // сек

  // Колбэки паузы (назначаются из game.js)
  const onPauseCbs = [];
  const onResumeCbs = [];

  function firePause() { onPauseCbs.forEach((f) => { try { f(); } catch (e) {} }); }
  function fireResume() { onResumeCbs.forEach((f) => { try { f(); } catch (e) {} }); }
  function onPause(fn) { onPauseCbs.push(fn); }
  function onResume(fn) { onResumeCbs.push(fn); }

  // ---------- UI заглушки (назначаются из ui.js) ----------
  let showAdMockFn = null; // (seconds, onDone)
  function setAdMockHandler(fn) { showAdMockFn = fn; }
  function mockAd(seconds, onDone) {
    adOpen = true;
    firePause();
    const done = () => {
      adOpen = false;
      fireResume();
      if (onDone) onDone(true);
    };
    if (showAdMockFn) showAdMockFn(seconds || 2, done);
    else setTimeout(done, (seconds || 2) * 1000);
  }

  // ---------- Язык (п. 2.14) ----------
  // Резервный набор: игра переведена на RU и EN. Группа «русских» локалей
  // платформы (ru/be/kk/uk/uz) получает RU, все остальные — EN.
  const RU_FAMILY = ['ru', 'be', 'kk', 'uk', 'uz'];
  function detectLang() {
    let raw = null;
    try {
      raw = ysdk && ysdk.environment && ysdk.environment.i18n && ysdk.environment.i18n.lang;
    } catch (e) {}
    if (!raw) {
      // Локальный запуск без SDK: параметр ?lang= для отладки, затем язык браузера.
      try {
        const q = new URLSearchParams(window.location.search).get('lang');
        if (q) raw = q.toLowerCase().split('-')[0];
      } catch (e) {}
    }
    if (!raw) {
      const nav = (navigator.language || 'ru').toLowerCase();
      raw = nav.split('-')[0];
    }
    sdkLang = raw;
    const lang = RU_FAMILY.indexOf(raw) !== -1 ? 'ru' : 'en';
    console.log('[Capiforge] i18n lang: ' + raw + ' -> ' + lang + (ysdk ? ' (SDK)' : ' (fallback)'));
    return lang;
  }

  // getPlayer с таймаутом — никогда не вешаем запуск игры
  function getPlayerWithTimeout(ms) {
    if (!ysdk || typeof ysdk.getPlayer !== 'function') return Promise.resolve(null);
    return Promise.race([
      ysdk.getPlayer({ scopes: false }).catch(() => null),
      new Promise((res) => setTimeout(() => res(null), ms))
    ]);
  }

  function init() {
    return new Promise((resolve) => {
      const finish = () => {
        if (!ysdk) mock = true;
        I18N.setLang(detectLang());
        resolve(mock);
      };
      if (window.YaGames && typeof window.YaGames.init === 'function') {
        window.YaGames.init()
          .then((sdk) => {
            ysdk = sdk;
            mock = false;
            try {
              sdk.on('game_api_pause', firePause);
            } catch (e) {}
            // Язык определяем НЕМЕДЛЕННО после init SDK, до игрока и до рендера
            I18N.setLang(detectLang());
            initSafeStorage();
            return getPlayerWithTimeout(4000).then((p) => { player = p; });
          })
          .then(() => { resolve(mock); })
          .catch(() => { if (!ysdk) mock = true; resolve(mock); });
      } else {
        // Локальный запуск без SDK — чистый mock-режим
        setTimeout(() => { mock = true; finish(); }, 50);
      }
    });
  }

  // Обязательный сигнал готовности для модерации
  function loadingReady() {
    if (ready) return;
    ready = true;
    try { if (ysdk && ysdk.features && ysdk.features.LoadingAPI) ysdk.features.LoadingAPI.ready(); } catch (e) {}
    try { if (ysdk && ysdk.features && ysdk.features.GameplayAPI) ysdk.features.GameplayAPI.start(); } catch (e) {}
  }
  function gameplayStop() {
    try { if (ysdk && ysdk.features && ysdk.features.GameplayAPI) ysdk.features.GameplayAPI.stop(); } catch (e) {}
  }
  function gameplayStart() {
    try { if (ysdk && ysdk.features && ysdk.features.GameplayAPI) ysdk.features.GameplayAPI.start(); } catch (e) {}
  }

  // ---------- Сохранения ----------
  // safeStorage Яндекса (рекомендация для iOS) с фоллбэком на localStorage
  let safeStorage = null;
  function initSafeStorage() {
    try {
      if (ysdk && typeof ysdk.getStorage === 'function') {
        Promise.resolve(ysdk.getStorage())
          .then((s) => { if (s && typeof s.setItem === 'function') safeStorage = s; })
          .catch(() => {});
      }
    } catch (e) {}
  }
  function store() {
    return safeStorage || (typeof localStorage !== 'undefined' ? localStorage : null);
  }
  function saveLocal(data) {
    const st = store();
    try { if (st) st.setItem('capiforge_save', JSON.stringify(data)); } catch (e) {}
  }
  function loadLocal() {
    const st = store();
    try {
      const raw = st ? st.getItem('capiforge_save') : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  // flush=true — немедленная отправка (закрытие игры, престиж и т.п.);
  // flush=false — постановка в очередь для периодических автосейвов.
  function saveCloud(data, flush) {
    saveLocal(data);
    if (player) {
      try {
        Promise.resolve(player.setData({ save: data }, !!flush)).catch(() => {});
      } catch (e) {}
    }
  }
  function loadCloud(cb) {
    const local = loadLocal();
    if (player) {
      // Защита от «зависшего» getData вне окружения Яндекса
      let settled = false;
      const to = setTimeout(() => { if (!settled) { settled = true; cb(null, local); } }, 4000);
      player.getData(['save'])
        .then((d) => {
          if (settled) return;
          settled = true;
          clearTimeout(to);
          cb(d && d.save ? d.save : null, local);
        })
        .catch(() => {
          if (settled) return;
          settled = true;
          clearTimeout(to);
          cb(null, local);
        });
    } else {
      cb(null, local);
    }
  }

  // ---------- Реклама ----------
  // Rewarded: onReward вызывается только после полного просмотра.
  function showRewarded(onReward, onFail) {
    if (adOpen) return;
    if (mock || !ysdk || !ysdk.adv) { mockAd(2, () => { if (onReward) onReward(); }); return; }
    let got = false;
    adOpen = true;
    firePause();
    try {
      ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => { adOpen = true; firePause(); },
          onRewarded: () => { got = true; },
          onClose: () => {
            adOpen = false;
            fireResume();
            if (got && onReward) onReward();
            else if (!got && onFail) onFail();
          },
          onError: () => {
            adOpen = false;
            fireResume();
            if (onFail) onFail();
          }
        }
      });
    } catch (e) {
      adOpen = false;
      fireResume();
      mockAd(2, () => { if (onReward) onReward(); });
    }
  }

  // Interstitial с защитным кулдауном 180 сек
  function showFullscreen(force) {
    const now = Date.now();
    if (!force && now - lastInterstitial < INTERSTITIAL_CD * 1000) return false;
    lastInterstitial = now;
    if (mock || !ysdk || !ysdk.adv) { mockAd(1.6, null); return true; }
    try {
      firePause();
      ysdk.adv.showFullscreenAdv({
        callbacks: {
          onClose: () => fireResume(),
          onError: () => fireResume()
        }
      });
      return true;
    } catch (e) {
      fireResume();
      return false;
    }
  }

  function canShowInterstitial() {
    return Date.now() - lastInterstitial >= INTERSTITIAL_CD * 1000;
  }

  // ---------- Сворачивание вкладки / видимость ----------
  function bindVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        firePause();
        gameplayStop();
      } else if (!adOpen) {
        fireResume();
        gameplayStart();
      }
    });
    window.addEventListener('blur', () => { if (!adOpen) firePause(); });
    window.addEventListener('focus', () => { if (!adOpen) fireResume(); });
  }

  return {
    init, loadingReady, gameplayStart, gameplayStop,
    saveLocal, saveCloud, loadCloud,
    showRewarded, showFullscreen, canShowInterstitial,
    onPause, onResume, bindVisibility, setAdMockHandler,
    get mock() { return mock; },
    get ysdk() { return ysdk; },
    get adOpen() { return adOpen; },
    get sdkLang() { return sdkLang; }
  };
})();
