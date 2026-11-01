/* ============================================================
   main — инициализация игры
   ============================================================ */
'use strict';

(function () {

  function boot() {
    UI.build();
    YSDK.setAdMockHandler(UI.showAdMock);

    // Пауза при рекламе / сворачивании вкладки — критично для модерации
    YSDK.onPause(() => {
      Game.setPaused(true);
      Game.save(true);
    });
    YSDK.onResume(() => {
      Game.setPaused(false);
    });
    YSDK.bindVisibility();

    // Разблокировка аудио первым жестом (требование браузеров)
    const unlock = () => {
      Sfx.resumeCtx();
      if (!Game.S.muted) Sfx.startMusic();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('touchstart', unlock);

    // SDK + язык + загрузка сохранения
    YSDK.init().then(() => {
      UI.applyLang();
      document.body.classList.remove('boot'); // язык определён — показываем игру
      Game.load();
    });

    // Автосохранение каждые 10 секунд
    setInterval(() => { if (!Game.C.paused) Game.save(false); }, 10000);
    window.addEventListener('pagehide', () => Game.save(true));
    window.addEventListener('beforeunload', () => Game.save(true));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
