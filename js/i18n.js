/* ============================================================
   I18N — полная локализация RU / EN
   ============================================================ */
'use strict';

const I18N = (() => {

  // ---------- 50 имён оружия ----------
  const WEAPONS_RU = [
    'Дубовая Щепка', 'Берёзовый Прут', 'Тесак Лесника', 'Сосновая Секира', 'Древний Боевой Сук',
    'Булыжный Клинок', 'Гранитный Резак', 'Кремниевый Дробитель', 'Мраморная Катана', 'Скала Тысячелетий',
    'Ржавый Меч', 'Кованый Гладиус', 'Стальной Мясник', 'Железный Бастард', 'Легионский Клинок',
    'Позолоченная Шпага', 'Скифская Сабля', 'Королевский Эсток', 'Солнечный Резак', 'Клинок Мидаса',
    'Огранка Новичка', 'Ледяное Жало', 'Кристальная Секира', 'Алмазный Вихрь', 'Сверкающий Приговор',
    'Изумрудный Шип', 'Ядовитая Грань', 'Клык Джунглей', 'Мистический Скимитар', 'Сердце Леса',
    'Рубиновый Росчерк', 'Пламенный Взор', 'Кровавая Гильотина', 'Магмовый Резонатор', 'Ярость Феникса',
    'Вулканическое Лезвие', 'Тёмный Аспид', 'Полуночный Жнец', 'Клинок Бездны', 'Теневой Пожиратель',
    'Плазменный Резак', 'Неоновый Расчленитель', 'Квантовый Протокол',
    'Звёздный Жгут', 'Галактический Клинок', 'Сверхновая',
    'Дамоклов Банан', 'Молот Доге', 'Клинок Гигачада',
    'Свет Капибоги'
  ];
  const WEAPONS_EN = [
    'Oak Splinter', 'Birch Twig', 'Woodsman Cleaver', 'Pine Chopper', 'Ancient War Bough',
    'Cobble Blade', 'Granite Cutter', 'Flint Crusher', 'Marble Katana', 'Millennial Rock',
    'Rusty Sword', 'Forged Gladius', 'Steel Butcher', 'Iron Bastard', 'Legion Blade',
    'Gilded Epee', 'Scythian Saber', 'Royal Estoc', 'Sun Cutter', 'Midas Blade',
    'Novice Cut', 'Icy Sting', 'Crystal Axe', 'Diamond Vortex', 'Radiant Verdict',
    'Emerald Thorn', 'Venom Edge', 'Jungle Fang', 'Mystic Scimitar', 'Heart of the Forest',
    'Ruby Stroke', 'Fiery Glare', 'Blood Guillotine', 'Magma Resonator', 'Phoenix Fury',
    'Volcanic Edge', 'Dark Asp', 'Midnight Reaper', 'Abyss Blade', 'Shadow Devourer',
    'Plasma Cutter', 'Neon Dismemberer', 'Quantum Protocol',
    'Star Lash', 'Galactic Blade', 'Supernova',
    'Damocles Banana', 'Hammer of Doge', 'Gigachad Blade',
    'Light of Capigod'
  ];

  // ---------- 15 монстров ----------
  const MONSTERS_RU = [
    'Слайм-Нуб', 'Гриб-Пыхтелка', 'Летучий Нубарь', 'Зомби-Двоечник', 'Скелет-Прогульщик',
    'Паук-Трейдер', 'Крипер-Шахтёр', 'Робо-Гусь', 'Каменный Големчик', 'Гигачад-Голем',
    'Лавовая Слизнюга', 'Демон-Хулиган', 'Космо-Кот', 'Ледяной Йети', 'Ангел-Бухгалтер'
  ];
  const MONSTERS_EN = [
    'Slime Noob', 'Puffshroom', 'Noobat', 'Zombie Dropout', 'Truant Skeleton',
    'Trader Spider', 'Miner Creeper', 'Robo-Goose', 'Pebble Golem', 'Gigachad Golem',
    'Lava Slug', 'Demon Bully', 'Space Cat', 'Frost Yeti', 'Accountant Angel'
  ];

  // ---------- 10 имён боссов ----------
  const BOSSES_RU = [
    'Скибиди-Босс', 'Королева Слаймов', 'Мега-Крипер', 'Гига-Гусь', 'Титан Бэкрумс',
    'Демон-Лорд Базука', 'Кибер-Дракон 3000', 'Космо-Кракен', 'Ледяной Тиран', 'Аудитор Судного Дня'
  ];
  const BOSSES_EN = [
    'Skibidi Boss', 'Slime Queen', 'Mega Creeper', 'Giga Goose', 'Backrooms Titan',
    'Demon Lord Bazooka', 'Cyber Dragon 3000', 'Space Kraken', 'Frost Tyrant', 'Doomsday Auditor'
  ];

  // ---------- 10 биомов ----------
  const BIOMES_RU = [
    'Деревня Нубов', 'Тёмный Лес', 'Шахта Криперов', 'Кибер-Сити', 'Лавовый Ад',
    'Бэкрумс', 'Космос', 'Ледяные Пики', 'Тропический Остров', 'Небесный Город'
  ];
  const BIOMES_EN = [
    'Noob Village', 'Dark Forest', 'Creeper Mine', 'Cyber City', 'Lava Hell',
    'Backrooms', 'Outer Space', 'Frost Peaks', 'Tropical Island', 'Sky City'
  ];

  // ---------- Редкости ----------
  const RARITY_RU = ['Обычное', 'Необычное', 'Редкое', 'Эпическое', 'Легендарное', 'Мифическое', 'Божественное'];
  const RARITY_EN = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Divine'];

  // ---------- Словари интерфейса ----------
  const DICT = {
    ru: {
      title: 'Кузница Героя: Капибара-Кузнец',
      equipLabel: 'В лапах капибары',
      anvilLabel: 'СКОВАТЬ',
      anvilLvl: 'Меч Ур. {n}',
      anvilFull: 'Кузница полна!',
      boost: 'Авто-Слияние + Скорость x2',
      boostActive: 'Буст: {s}с',
      wave: 'Волна {w} [{k}/{n}]',
      waveBoss: 'БОСС: {w}',
      biome: '{b}',
      bossTimer: 'БОСС! {s}с',
      tabForge: 'Кузница',
      tabUpgrades: 'Улучшения', tabPets: 'Питомцы', tabPrestige: 'Престиж',
      tabEncy: 'Энциклопедия', tabQuests: 'Квесты',
      trash: 'Корзина',
      trashHint: 'Перетащи сюда ненужный меч, чтобы выбросить. Удержание на мече — продать за золото.',
      dmg: 'Урон',
      dps: 'Урон/сек',
      lvlShort: 'Ур.',
      lvl: 'Уровень {n}',
      maxLvl: 'МАКС',
      close: 'Закрыть',
      buy: 'Купить',
      locked: 'Закрыто',
      unlockSlot: 'Открыть слот',
      sellFor: 'Продать',
      sellHint: 'Удерживай меч, чтобы продать',
      mergeHint: 'Перетащи одинаковые мечи друг на друга — получишь меч уровнем выше!',
      craftHint: 'Жми на наковальню, чтобы ковать быстрее!',
      newWeapon: 'Новый меч: {n}!',
      rarity: '{r} меч',
      gridFull: 'Кузница полна! Слей мечи или продай лишние.',
      goldTaken: '+{g} золота',
      // Улучшения
      upTitle: 'Улучшения кузницы',
      up_base: 'Базовый уровень ковки',
      up_base_d: 'Наковальня куёт мечи сразу Ур. {n}',
      up_speed: 'Скорость наковальни',
      up_speed_d: 'Ковка за {t} сек',
      up_double: 'Шанс двойного крафта',
      up_double_d: '{p}% шанс двух мечей или меча Ур.+1',
      up_critc: 'Шанс крита капибары',
      up_critc_d: '{p}% шанс критического удара',
      up_critp: 'Сила крита',
      up_critp_d: 'Крит наносит x{p} урона',
      up_slot: 'Расширение кузницы',
      up_slot_d: 'Открыть ещё один слот ({n}/24)',
      // Питомцы
      petsTitle: 'Питомцы-помощники',
      petsSub: 'Летают рядом с Капибарой и дают пассивные бонусы. Прокачиваются за кристаллы.',
      pet_banana: 'Кот-Банан',
      pet_banana_d: 'Сам кликает наковальню каждые {t} сек',
      pet_hamster: 'Хомяк-Криптоинвестор',
      pet_hamster_d: '+{p}% золота с врагов',
      pet_pepe: 'Пепе-Маг',
      pet_pepe_d: 'Магия: +{p}% урона в секунду',
      pet_doge: 'Доге-Танк',
      pet_doge_d: '+{p}% к урону капибары',
      pet_goose: 'Гусь-Кузнец',
      pet_goose_d: 'Ковка быстрее на {p}%',
      pet_dragon: 'Золотой Дракон',
      pet_dragon_d: '+{p}% урона и +{p2}% золота',
      // Престиж
      prTitle: 'Перерождение',
      prDesc: 'Сбрось волны и мечи в обмен на Древние Капи-Камни. Артефакты вечны и усиливают все будущие забеги.',
      prStones: 'Капи-Камни',
      prGain: 'Награда: {n} Капи-Камней',
      prBtn: 'ПЕРЕРОДИТЬСЯ',
      prNeed: 'Доступно с волны 30 (сейчас: {w})',
      prConfirm: 'Переродиться?',
      prConfirm_d: 'Ты получишь {n} Капи-Камней. Волны, мечи и улучшения обнулятся. Кристаллы, питомцы, энциклопедия и артефакты останутся.',
      prDone: 'Перерождение! Получено {n} Капи-Камней.',
      artTitle: 'Вечные артефакты',
      art_wrath: 'Ярость Предков',
      art_wrath_d: 'Урон x{p} (сейчас: x{c})',
      art_slots: 'Вечные Слоты',
      art_slots_d: '{n} слотов кузницы открыты навсегда',
      art_echo: 'Древнее Эхо',
      art_echo_d: 'Старт с волны {n}',
      art_vein: 'Золотая Жила',
      art_vein_d: '+{p}% золота навсегда',
      art_reson: 'Кристальный Резонанс',
      art_reson_d: '+{n} кристалла за каждого босса',
      art_wisdom: 'Мудрость Капибары',
      art_wisdom_d: 'Базовый уровень ковки +{n}',
      // Энциклопедия
      encyTitle: 'Энциклопедия оружия',
      encySub: 'Открой все 50 мечей! За каждое новое открытие — кристаллы.',
      encyOpen: '{n}/50 открыто',
      encyReward: '+{n}',
      encyUnknown: '???',
      // Квесты
      qTitle: 'Ежедневные квесты',
      qSub: 'Обновляются каждый день',
      q_claim: 'Забрать',
      q_done: 'Готово!',
      q_progress: '{a}/{n}',
      q_merge: 'Слей {n} мечей',
      q_boss: 'Победи {n} боссов',
      q_click: 'Сделай {n} кликов по наковальне',
      q_craft: 'Скуй {n} мечей',
      q_kill: 'Убей {n} врагов',
      q_refresh: 'Обновить квесты',
      q_allDone: 'Все квесты выполнены!',
      // Колесо
      whTitle: 'Колесо Фортуны',
      whFree: 'Крутить бесплатно',
      whAd: 'Крутить за рекламу',
      whWait: 'Бесплатно через {t}',
      whAgain: 'Ещё раз!',
      whPrize0: 'Золото x10',
      whPrize1: '10 кристаллов',
      whPrize2: 'Меч Ур.+2',
      whPrize3: 'Золото x2 на 5 мин',
      whPrize4: 'Берсерк 60 сек',
      whPrize5: '25 кристаллов',
      whPrize6: 'Авто-Слияние 3 мин',
      whPrize7: 'Мегазолото x50',
      whGot: 'Приз: {n}!',
      // Реклама / бонусы
      watchAd: 'Смотреть рекламу',
      berserk: 'БЕРСЕРК x3',
      berserkDesc: 'Урон x3 на 60 секунд',
      berserkActive: 'Берсерк: {s}с',
      droneGift: 'Подарок!',
      droneTitle: 'Подарочный дрон',
      droneDesc: 'Дрон привёз меч Ур. {n} или кучу золота! Просмотри рекламу, чтобы забрать.',
      droneGold: 'Мешок золота: {g}',
      offlineTitle: 'С возвращением!',
      offlineDesc: 'Пока тебя не было, Капибара нафармила:',
      offlineTake: 'Забрать',
      offlineX2: 'Забрать x2',
      adFail: 'Реклама недоступна. Попробуй позже.',
      rewardGold: '+{g} золота!',
      rewardGems: '+{n} кристаллов!',
      rewardWeapon: 'Меч Ур. {n} отправлен в кузницу!',
      // Босс
      bossCome: 'БОСС: {n}! Убей за 30 секунд!',
      bossKill: 'Босс повержен! +{g} золота, +{c} кристаллов!',
      bossFail: 'Босс оказался слишком сильным! Откат на волну {w}. Фарми золото и возвращайся!',
      prestigeWave: 'Доступен Престиж! Вкладка «Престиж» — получи Капи-Камни.',
      // Оффлайн-подсказки
      tapToStart: 'Кликай по наковальне и сливай мечи!',
      saved: 'Сохранено',
      welcome: 'Кузница открыта! Помоги Капибаре стать богом!',
      muteOn: 'Звук выключен',
      muteOff: 'Звук включён',
      speedSec: '{t} сек',
      perSec: '/сек',
      stats: 'Статистика',
      stMerges: 'Слияний: {n}',
      stBosses: 'Боссов убито: {n}',
      stPrestiges: 'Перерождений: {n}',
      stCrafts: 'Мечей выковано: {n}'
    },
    en: {
      title: 'Hero Forge: Capybara Blacksmith',
      equipLabel: "IN THE CAPYBARA'S PAWS",
      anvilLabel: 'FORGE',
      anvilLvl: 'Sword Lv. {n}',
      anvilFull: 'Forge is full!',
      boost: 'Auto-Merge + Speed x2',
      boostActive: 'Boost: {s}s',
      wave: 'Wave {w} [{k}/{n}]',
      waveBoss: 'BOSS: {w}',
      biome: '{b}',
      bossTimer: 'BOSS! {s}s',
      tabForge: 'Forge',
      tabUpgrades: 'Upgrades', tabPets: 'Pets', tabPrestige: 'Prestige',
      tabEncy: 'Collection', tabQuests: 'Quests',
      trash: 'Trash',
      trashHint: 'Drag an unneeded sword here to discard it. Hold a sword to sell it for gold.',
      dmg: 'Damage',
      dps: 'DPS',
      lvlShort: 'Lv.',
      lvl: 'Level {n}',
      maxLvl: 'MAX',
      close: 'Close',
      buy: 'Buy',
      locked: 'Locked',
      unlockSlot: 'Unlock slot',
      sellFor: 'Sell',
      sellHint: 'Hold a sword to sell it',
      mergeHint: 'Drag identical swords together to merge them!',
      craftHint: 'Tap the anvil to forge faster!',
      newWeapon: 'New sword: {n}!',
      rarity: '{r} sword',
      gridFull: 'Forge is full! Merge or sell swords.',
      goldTaken: '+{g} gold',
      upTitle: 'Forge upgrades',
      up_base: 'Base forge level',
      up_base_d: 'Anvil forges Lv. {n} swords',
      up_speed: 'Anvil speed',
      up_speed_d: 'Forge every {t} sec',
      up_double: 'Double craft chance',
      up_double_d: '{p}% chance of 2 swords or Lv.+1',
      up_critc: 'Capybara crit chance',
      up_critc_d: '{p}% chance of critical hit',
      up_critp: 'Crit power',
      up_critp_d: 'Crits deal x{p} damage',
      up_slot: 'Forge expansion',
      up_slot_d: 'Unlock one more slot ({n}/24)',
      petsTitle: 'Helper pets',
      petsSub: 'They fly next to the Capybara and grant passive bonuses. Upgraded with gems.',
      pet_banana: 'Banana Cat',
      pet_banana_d: 'Taps the anvil every {t} sec',
      pet_hamster: 'Crypto Hamster',
      pet_hamster_d: '+{p}% gold from enemies',
      pet_pepe: 'Pepe Mage',
      pet_pepe_d: 'Magic: +{p}% DPS',
      pet_doge: 'Doge Tank',
      pet_doge_d: '+{p}% capybara damage',
      pet_goose: 'Smith Goose',
      pet_goose_d: 'Forging is {p}% faster',
      pet_dragon: 'Golden Dragon',
      pet_dragon_d: '+{p}% damage and +{p2}% gold',
      prTitle: 'Rebirth',
      prDesc: 'Reset waves and swords in exchange for Ancient Capy-Stones. Artifacts are permanent.',
      prStones: 'Capy-Stones',
      prGain: 'Reward: {n} Capy-Stones',
      prBtn: 'REBIRTH',
      prNeed: 'Available from wave 30 (now: {w})',
      prConfirm: 'Rebirth?',
      prConfirm_d: 'You will get {n} Capy-Stones. Waves, swords and upgrades reset. Gems, pets, collection and artifacts stay.',
      prDone: 'Rebirth! You got {n} Capy-Stones.',
      artTitle: 'Eternal artifacts',
      art_wrath: 'Ancestors’ Wrath',
      art_wrath_d: 'Damage x{p} (now: x{c})',
      art_slots: 'Eternal Slots',
      art_slots_d: '{n} forge slots unlocked forever',
      art_echo: 'Ancient Echo',
      art_echo_d: 'Start at wave {n}',
      art_vein: 'Golden Vein',
      art_vein_d: '+{p}% gold forever',
      art_reson: 'Crystal Resonance',
      art_reson_d: '+{n} gems per boss',
      art_wisdom: 'Capybara Wisdom',
      art_wisdom_d: 'Base forge level +{n}',
      encyTitle: 'Weapon collection',
      encySub: 'Discover all 50 swords! Gems for every new discovery.',
      encyOpen: '{n}/50 discovered',
      encyReward: '+{n}',
      encyUnknown: '???',
      qTitle: 'Daily quests',
      qSub: 'Refresh every day',
      q_claim: 'Claim',
      q_done: 'Done!',
      q_progress: '{a}/{n}',
      q_merge: 'Merge {n} swords',
      q_boss: 'Defeat {n} bosses',
      q_click: 'Make {n} anvil taps',
      q_craft: 'Forge {n} swords',
      q_kill: 'Slay {n} enemies',
      q_refresh: 'Refresh quests',
      q_allDone: 'All quests complete!',
      whTitle: 'Wheel of Fortune',
      whFree: 'Spin for free',
      whAd: 'Spin for ad',
      whWait: 'Free in {t}',
      whAgain: 'Again!',
      whPrize0: 'Gold x10',
      whPrize1: '10 gems',
      whPrize2: 'Sword Lv.+2',
      whPrize3: 'Gold x2 for 5 min',
      whPrize4: 'Berserk 60 sec',
      whPrize5: '25 gems',
      whPrize6: 'Auto-Merge 3 min',
      whPrize7: 'Mega-gold x50',
      whGot: 'Prize: {n}!',
      watchAd: 'Watch ad',
      berserk: 'BERSERK x3',
      berserkDesc: 'Damage x3 for 60 seconds',
      berserkActive: 'Berserk: {s}s',
      droneGift: 'Gift!',
      droneTitle: 'Gift drone',
      droneDesc: 'The drone brought a Lv. {n} sword or a pile of gold! Watch an ad to claim.',
      droneGold: 'Gold bag: {g}',
      offlineTitle: 'Welcome back!',
      offlineDesc: 'While you were away, the Capybara farmed:',
      offlineTake: 'Claim',
      offlineX2: 'Claim x2',
      adFail: 'Ad unavailable. Try later.',
      rewardGold: '+{g} gold!',
      rewardGems: '+{n} gems!',
      rewardWeapon: 'Lv. {n} sword sent to the forge!',
      bossCome: 'BOSS: {n}! Kill it in 30 seconds!',
      bossKill: 'Boss defeated! +{g} gold, +{c} gems!',
      bossFail: 'The boss is too strong! Fell back to wave {w}. Farm gold and return!',
      prestigeWave: 'Prestige unlocked! Check the "Prestige" tab for Capy-Stones.',
      tapToStart: 'Tap the anvil and merge swords!',
      saved: 'Saved',
      welcome: 'The forge is open! Help the Capybara become a god!',
      muteOn: 'Sound off',
      muteOff: 'Sound on',
      speedSec: '{t} sec',
      perSec: '/sec',
      stats: 'Statistics',
      stMerges: 'Merges: {n}',
      stBosses: 'Bosses slain: {n}',
      stPrestiges: 'Rebirths: {n}',
      stCrafts: 'Swords forged: {n}'
    }
  };

  let lang = 'ru';

  function setLang(l) { lang = (l && DICT[l]) ? l : 'ru'; }

  function t(key, vars) {
    let s = (DICT[lang] && DICT[lang][key]) || DICT.ru[key] || key;
    if (vars) {
      for (const k in vars) {
        s = s.split('{' + k + '}').join(String(vars[k]));
      }
    }
    return s;
  }

  function weaponName(level) {
    const i = Math.max(0, Math.min(49, level - 1));
    return (lang === 'en' ? WEAPONS_EN : WEAPONS_RU)[i];
  }
  function monsterName(i) {
    return (lang === 'en' ? MONSTERS_EN : MONSTERS_RU)[i % 15];
  }
  function bossName(i) {
    return (lang === 'en' ? BOSSES_EN : BOSSES_RU)[i % 10];
  }
  function biomeName(i) {
    return (lang === 'en' ? BIOMES_EN : BIOMES_RU)[i % 10];
  }
  function rarityName(i) {
    return (lang === 'en' ? RARITY_EN : RARITY_RU)[Math.max(0, Math.min(6, i))];
  }

  return { setLang, t, weaponName, monsterName, bossName, biomeName, rarityName, get lang() { return lang; } };
})();
