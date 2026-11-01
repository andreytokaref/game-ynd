/* ============================================================
   ArtGenerator — процедурная SVG-графика в стиле Casual Cartoon
   (толстая тёмная обводка, градиенты, блики, свечение редкости)
   ============================================================ */
'use strict';

const Art = (() => {
  let uidc = 0;
  const uid = () => 'a' + (uidc++).toString(36) + 'x';
  const OUT = '#26180c'; // единая тёмная обводка

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const cl = (v) => Math.max(0, Math.min(255, v));
    const r = cl((n >> 16) + amt), g = cl(((n >> 8) & 255) + amt), b = cl((n & 255) + amt);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // ================= МАТЕРИАЛЫ И РЕДКОСТИ =================
  const MATS = [
    { shape: 'wood',    a: '#b0793f', b: '#6d4520', edge: '#e0b071', h: '#7a4a22', g: '#8bc34a' },
    { shape: 'stone',   a: '#a8b0b8', b: '#5f666d', edge: '#dbe3ea', h: '#6d5a44', g: '#90a4ae' },
    { shape: 'iron',    a: '#d3dce4', b: '#7b8794', edge: '#ffffff', h: '#5d4037', g: '#ffca28' },
    { shape: 'gold',    a: '#ffe082', b: '#f0930f', edge: '#fff8e1', h: '#8d6e63', g: '#ef6c00' },
    { shape: 'diamond', a: '#c0f4ff', b: '#3fb3e8', edge: '#ffffff', h: '#78909c', g: '#00e5ff' },
    { shape: 'emerald', a: '#69f0ae', b: '#00913c', edge: '#d0ffe8', h: '#4e342e', g: '#00e676' },
    { shape: 'ruby',    a: '#ff8a80', b: '#d32f2f', edge: '#ffd6d0', h: '#4e342e', g: '#ff5252' },
    { shape: 'obsidian',a: '#545170', b: '#1d1833', edge: '#9a8c98', h: '#35284b', g: '#b388ff' },
    { shape: 'cyber',   a: '#18ffff', b: '#0077ff', edge: '#e0ffff', h: '#263238', g: '#ff00e5' },
    { shape: 'cosmic',  a: '#c39bff', b: '#4b2bb5', mid: '#7c4dff', edge: '#e8daff', h: '#311b92', g: '#ffd740' },
    { shape: 'meme',    a: '#ffe14d', b: '#f4900c', edge: '#fff3b0', h: '#5d4037', g: '#ff4081' },
    { shape: 'divine',  a: '#fffde7', b: '#ffc93d', edge: '#ffffff', h: '#d4af37', g: '#fff9c4' }
  ];
  const MAT_MAX = [5, 10, 15, 20, 25, 30, 35, 40, 43, 46, 49, 50];
  const RARS = [null, '#7ed957', '#40c4ff', '#b45cff', '#ffa726', '#ff4d6d', '#ffe14d'];
  const RAR_MAX = [8, 16, 24, 32, 40, 46, 50];
  function matOf(level) { for (let i = 0; i < 12; i++) if (level <= MAT_MAX[i]) return i; return 11; }
  function rarOf(level) { for (let i = 0; i < 7; i++) if (level <= RAR_MAX[i]) return i; return 6; }

  // ================= ОРУЖИЕ =================
  const STAR = 'M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z';

  function bladeArt(level, mi, u, m) {
    switch (m.shape) {
      case 'wood': return `
        <path d="M45 13 L55 10 L58 28 L55 58 L45 58 L42 30 Z" fill="url(#${u}b)" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M47 17 L46 51 M52 15 L53 48" stroke="${m.edge}" stroke-width="1.7" opacity=".75" fill="none"/>
        <path d="M44 26 L42 31 L45 35 Z M56 41 L58 46 L54 50 Z" fill="${OUT}" opacity=".5"/>`;
      case 'stone': return `
        <path d="M41 18 L48 8 L57 15 L59 34 L55 58 L45 58 L41 34 Z" fill="url(#${u}b)" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M45 24 L50 19 L55 28" stroke="${m.edge}" stroke-width="1.7" fill="none" opacity=".65"/>
        <path d="M48 12 L46 24 L50 33 M53 40 L51 50" stroke="${OUT}" stroke-width="1.6" fill="none" opacity=".45"/>`;
      case 'iron': return `
        <path d="M50 7 L57 21 L56 58 L44 58 L43 21 Z" fill="url(#${u}b)" stroke="#20242b" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M50 11 L50 55" stroke="${m.edge}" stroke-width="1.8" opacity=".8"/>
        <path d="M45.5 23 L44.7 55" stroke="#ffffff" stroke-width="2" opacity=".9"/>`;
      case 'gold': return `
        <path d="M49 7 C63 15 66 36 59 58 L45 58 C47 38 45 20 49 7 Z" fill="url(#${u}b)" stroke="#5c4300" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M51 13 C59 21 62 36 58 52" stroke="${m.edge}" stroke-width="2.2" fill="none" opacity=".9"/>
        <circle cx="53" cy="30" r="1.8" fill="#fff" opacity=".9"/>`;
      case 'diamond': return `
        <path d="M50 5 L61 24 L57 58 L43 58 L39 24 Z" fill="url(#${u}b)" stroke="#0e4c63" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M50 6 L50 57 M39.5 25 L50 31 L60.5 25 M44 57 L50 31 L56 57" stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".6"/>`;
      case 'emerald': return `
        <path d="M50 5 L60 18 L58 44 L53 58 L47 58 L42 44 L40 18 Z" fill="url(#${u}b)" stroke="#063e22" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M50 10 L50 52" stroke="${m.edge}" stroke-width="1.8" opacity=".85"/>
        <path d="M42 22 C46 30 46 40 46 50 M58 22 C54 30 54 40 54 50" stroke="${m.edge}" stroke-width="1.4" fill="none" opacity=".5"/>`;
      case 'ruby': return `
        <path d="M50 5 C59 12 53 21 60 29 C66 37 56 44 59 58 L41 58 C44 44 34 38 40 28 C45 20 45 13 50 5 Z" fill="url(#${u}b)" stroke="#5c0f0f" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M50 14 C55 20 51 26 56 33 C59 38 53 44 54 52" stroke="${m.edge}" stroke-width="2" fill="none" opacity=".85"/>
        <circle cx="53" cy="25" r="1.6" fill="#fff" opacity=".9"/>`;
      case 'obsidian': return `
        <path d="M50 5 L57 16 L52 24 L59 33 L52 41 L58 51 L54 58 L46 58 L42 51 L48 41 L41 33 L48 24 L43 16 Z" fill="url(#${u}b)" stroke="#0b0b14" stroke-width="3" stroke-linejoin="round"/>
        <path d="M50 9 L50 54" stroke="${m.edge}" stroke-width="1.5" opacity=".6"/>
        <circle cx="46" cy="46" r="1.6" fill="#c9a7ff" opacity=".9"/>`;
      case 'cyber': return `
        <filter id="${u}bl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>
        <path d="M50 6 L58 22 L56 58 L44 58 L42 22 Z" fill="${m.a}" opacity=".3" stroke="${m.a}" stroke-width="2"/>
        <path d="M50 6 L58 22 L56 58 L44 58 L42 22 Z" fill="none" stroke="#ffffff" stroke-width="1" opacity=".8"/>
        <path d="M50 10 L50 55" stroke="#ffffff" stroke-width="4" opacity=".9" filter="url(#${u}bl)"/>
        <path d="M50 10 L50 55" stroke="#ffffff" stroke-width="1.6"/>
        <path d="M45.5 27 L50 27 M54.5 37 L50 37 M45.5 47 L50 47" stroke="${m.a}" stroke-width="2" opacity=".95"/>`;
      case 'cosmic': return `
        <path d="M50 6 L58 20 L56 58 L44 58 L42 20 Z" fill="url(#${u}b)" stroke="#241356" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M45.5 22 L44.7 55" stroke="${m.edge}" stroke-width="1.8" opacity=".85"/>
        <circle cx="52" cy="26" r="1.5" fill="#fff"/><circle cx="47" cy="38" r="1.2" fill="#fff" opacity=".9"/><circle cx="53" cy="48" r="1.6" fill="#ffe14d"/>
        <path d="M42 30 L42 34 M40 32 L44 32" stroke="#fff" stroke-width="1" opacity=".8"/>`;
      case 'divine': return `
        <ellipse cx="50" cy="30" rx="26" ry="9" fill="none" stroke="#ffe082" stroke-width="3.4" opacity=".9"/>
        <path d="M50 12 L50 5 M28 22 L22 18 M72 22 L78 18 M36 14 L32 8 M64 14 L68 8" stroke="#ffe082" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
        <path d="M50 14 L57 26 L56 58 L44 58 L43 26 Z" fill="url(#${u}b)" stroke="#b8860b" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M50 18 L50 55" stroke="#ffffff" stroke-width="2.4" opacity=".95"/>
        <circle cx="50" cy="34" r="2.2" fill="#fff"/>`;
      default: return '';
    }
  }

  function memeBlade(level, u, m) {
    if (level === 47) { // Дамоклов Банан
      return `
        <path d="M46 6 C64 20 68 46 56 68 L46 62 C55 44 52 26 42 14 Z" fill="url(#${u}b)" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M50 16 C58 28 59 44 53 58" stroke="${m.edge}" stroke-width="2" fill="none" opacity=".85"/>
        <path d="M44 6 L49 10 L42 15 Z M56 68 L52 61 L45 65 Z" fill="#6d4520" stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="48" cy="32" r="1.8" fill="#1c1c1c"/><circle cx="54" cy="30" r="1.8" fill="#1c1c1c"/>
        <path d="M47 38 Q51 41 55 37" stroke="#1c1c1c" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    }
    if (level === 48) { // Молот Доге
      return `
        <rect x="26" y="8" width="48" height="30" rx="7" fill="url(#${u}b)" stroke="${OUT}" stroke-width="3.2"/>
        <path d="M33 11 L38 2 L44 11 Z M56 11 L61 2 L66 11 Z" fill="#e0b070" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/>
        <ellipse cx="41" cy="21" rx="3" ry="3.6" fill="#1c1c1c"/><ellipse cx="59" cy="21" rx="3" ry="3.6" fill="#1c1c1c"/>
        <circle cx="42" cy="20" r="1" fill="#fff"/><circle cx="60" cy="20" r="1" fill="#fff"/>
        <ellipse cx="50" cy="28" rx="8" ry="5.4" fill="#f5dfb8" stroke="${OUT}" stroke-width="2"/>
        <ellipse cx="50" cy="25.5" rx="2.6" ry="2" fill="#1c1c1c"/>
        <rect x="45" y="38" width="10" height="20" rx="4" fill="url(#${u}h)" stroke="${OUT}" stroke-width="3"/>
        <path d="M30 12 L33 20 M70 12 L67 20" stroke="${m.edge}" stroke-width="2" opacity=".7"/>`;
    }
    // 49 — Клинок Гигачада
    return `
      <path d="M50 3 L64 18 L62 58 L38 58 L36 18 Z" fill="url(#${u}b)" stroke="#141414" stroke-width="3.4" stroke-linejoin="round"/>
      <rect x="40" y="25" width="20" height="7" rx="2.5" fill="#141414"/>
      <path d="M45 28.5 L55 28.5" stroke="#141414" stroke-width="2.4"/>
      <path d="M43 37 Q50 43 57 37" stroke="#141414" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M42 15 L41 52" stroke="${m.edge}" stroke-width="2" opacity=".85"/>`;
  }

  function hiltArt(u, m, v) {
    let s = `
      <path d="M33 57 L67 57 L62 67 L38 67 Z" fill="url(#${u}h)" stroke="${OUT}" stroke-width="3.2" stroke-linejoin="round"/>
      <rect x="44" y="66" width="12" height="25" rx="5" fill="url(#${u}h)" stroke="${OUT}" stroke-width="3"/>
      <path d="M44 73 L56 75 M44 80 L56 82 M45 87 L55 89" stroke="${OUT}" stroke-width="2" opacity=".45"/>
      <circle cx="50" cy="94" r="5.2" fill="${m.g}" stroke="${OUT}" stroke-width="3"/>
      <circle cx="48.4" cy="92.4" r="1.4" fill="#fff" opacity=".9"/>`;
    if (v >= 1) s += `
      <circle cx="36" cy="62" r="3.2" fill="${m.g}" stroke="${OUT}" stroke-width="2.2"/>
      <circle cx="64" cy="62" r="3.2" fill="${m.g}" stroke="${OUT}" stroke-width="2.2"/>`;
    if (v >= 2) s += `<circle cx="50" cy="62" r="3.6" fill="${m.g}" stroke="${OUT}" stroke-width="2.4"/><circle cx="49" cy="60.8" r="1.1" fill="#fff" opacity=".9"/>`;
    if (v >= 3) s += `
      <path d="M33 57 L27 49 L37 54 Z M67 57 L73 49 L63 54 Z" fill="url(#${u}h)" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/>`;
    return s;
  }

  function weapon(level, size) {
    level = Math.max(1, Math.min(50, level | 0));
    const mi = matOf(level), m = MATS[mi], v = (level - 1) % 4, r = rarOf(level);
    const u = uid();
    const rc = RARS[r];
    let defs = '';
    if (rc) defs += `<radialGradient id="${u}g"><stop offset="52%" stop-color="${rc}" stop-opacity="0"/><stop offset="80%" stop-color="${rc}" stop-opacity=".5"/><stop offset="100%" stop-color="${rc}" stop-opacity="0"/></radialGradient>`;
    defs += `<linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="1">` +
      (m.mid ? `<stop offset="0" stop-color="${m.a}"/><stop offset=".55" stop-color="${m.mid}"/><stop offset="1" stop-color="${m.b}"/>`
             : `<stop offset="0" stop-color="${m.a}"/><stop offset="1" stop-color="${m.b}"/>`) + `</linearGradient>`;
    defs += `<linearGradient id="${u}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(m.h, -32)}"/><stop offset=".5" stop-color="${shade(m.h, 14)}"/><stop offset="1" stop-color="${shade(m.h, -32)}"/></linearGradient>`;

    const wide = (1 + v * 0.07).toFixed(3);
    const t = `transform="translate(50 0) scale(${wide} 1) translate(-50 0)"`;
    let core = (m.shape === 'meme') ? memeBlade(level, u, m) : `<g ${t}>${bladeArt(level, mi, u, m)}</g>`;
    core += hiltArt(u, m, v);

    const glow = rc ? `<circle cx="50" cy="52" r="47" fill="url(#${u}g)"/>` : '';
    let spark = '';
    if (r >= 2) {
      const pos = [[24, 24], [77, 30], [27, 74], [74, 70]];
      for (let i = 0; i < Math.min(r, 4); i++) {
        spark += `<path d="${STAR}" transform="translate(${pos[i][0]} ${pos[i][1]}) scale(${0.8 + (i % 2) * 0.35})" fill="${rc}" opacity=".95"/>`;
      }
    }
    return `<svg class="weaponIcon" viewBox="0 0 100 100" width="${size || 64}" height="${size || 64}"><defs>${defs}</defs>${glow}<g transform="rotate(36 50 53)">${spark}${core}</g></svg>`;
  }

  // ================= МОНСТРЫ =================
  const eye = (x, y, r, dx) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#1c1c1c" stroke-width="1.6"/><circle cx="${x + (dx || 0)}" cy="${y + 0.6}" r="${(r * 0.45).toFixed(2)}" fill="#1c1c1c"/></g>`;

  const MONS = [
    // 0 Слайм-Нуб
    (u) => `
      <defs><radialGradient id="${u}s" cx=".35" cy=".3" r="1"><stop offset="0" stop-color="#c8ff8a"/><stop offset="1" stop-color="#3fae3f"/></radialGradient></defs>
      <path d="M22 102 C14 66 30 34 60 32 C92 34 106 68 98 102 Z" fill="url(#${u}s)" stroke="#1d4d1d" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M34 50 C37 41 43 37 50 36" stroke="#eaffd0" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/>
      ${eye(48, 64, 6)} ${eye(74, 64, 6, 1)}
      <path d="M54 80 Q61 87 68 80" stroke="#1d4d1d" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    // 1 Гриб-Пыхтелка
    (u) => `
      <defs><linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a70"/><stop offset="1" stop-color="#d83a2e"/></linearGradient></defs>
      <path d="M48 66 L44 102 Q60 108 76 102 L72 66 Z" fill="#f5ead2" stroke="#8a6d4a" stroke-width="3.2"/>
      <path d="M22 68 C22 38 42 24 60 24 C78 24 98 38 98 68 Q60 80 22 68 Z" fill="url(#${u}c)" stroke="#7a2418" stroke-width="3.4"/>
      <circle cx="44" cy="44" r="6" fill="#ffe3d6" opacity=".95"/><circle cx="70" cy="38" r="4.4" fill="#ffe3d6" opacity=".95"/><circle cx="84" cy="54" r="3.4" fill="#ffe3d6" opacity=".95"/>
      <path d="M46 84 Q51 89 56 84 M64 84 Q69 89 74 84" stroke="#5c4432" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="94" rx="4" ry="2.6" fill="#8a6d4a" opacity=".7"/>`,
    // 2 Летучий Нубарь
    (u) => `
      <defs><radialGradient id="${u}b" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#8a74c8"/><stop offset="1" stop-color="#4e3d80"/></radialGradient></defs>
      <path d="M52 62 C38 40 20 42 10 56 C20 58 22 68 17 78 C32 80 44 74 52 66 Z" fill="#5b4a8a" stroke="#241a44" stroke-width="3" stroke-linejoin="round"/>
      <path d="M68 62 C82 40 100 42 110 56 C100 58 98 68 103 78 C88 80 76 74 68 66 Z" fill="#5b4a8a" stroke="#241a44" stroke-width="3" stroke-linejoin="round"/>
      <path d="M48 44 L44 26 L58 38 Z M72 44 L76 26 L62 38 Z" fill="#4e3d80" stroke="#241a44" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="60" cy="70" rx="20" ry="22" fill="url(#${u}b)" stroke="#241a44" stroke-width="3.2"/>
      ${eye(52, 64, 5)} ${eye(68, 64, 5)}
      <path d="M54 78 L57 84 L60 78 L63 84 L66 78" stroke="#241a44" stroke-width="2.2" fill="none"/>
      <path d="M56 84 L57 90 L59 85 M63 84 L64 90 L66 85" fill="#fff" stroke="#241a44" stroke-width="1"/>`,
    // 3 Зомби-Двоечник
    (u) => `
      <defs><linearGradient id="${u}z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ccf72"/><stop offset="1" stop-color="#639a44"/></linearGradient></defs>
      <rect x="16" y="62" width="26" height="10" rx="5" transform="rotate(-14 16 62)" fill="url(#${u}z)" stroke="#3f6a2a" stroke-width="3"/>
      <rect x="78" y="58" width="26" height="10" rx="5" transform="rotate(10 78 58)" fill="url(#${u}z)" stroke="#3f6a2a" stroke-width="3"/>
      <path d="M40 62 L80 62 L84 96 L74 90 L66 98 L58 90 L50 98 L42 90 L36 96 Z" fill="#7a8f5a" stroke="#3f5a2a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="40" y="24" width="40" height="38" rx="12" fill="url(#${u}z)" stroke="#3f6a2a" stroke-width="3.2"/>
      <path d="M44 22 Q60 12 76 22 L76 28 Q60 22 44 28 Z" fill="#4a6a30" stroke="#3f6a2a" stroke-width="2"/>
      ${eye(52, 42, 5)} <path d="M64 40 L72 48 M72 40 L64 48" stroke="#1c1c1c" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M52 40 L62 40 M57 36 L57 48 M57 44 L52 48 M57 44 L62 48" stroke="#1c1c1c" stroke-width="1.4"/>
      <path d="M52 54 L56 58 L60 54 L64 58 L68 54" stroke="#1c1c1c" stroke-width="2" fill="none"/>`,
    // 4 Скелет-Прогульщик
    (u) => `
      <path d="M42 24 Q60 16 78 24 L80 50 Q74 60 66 60 L64 70 L56 70 L54 60 Q46 60 40 50 Z" fill="#f4f2e8" stroke="#5c5850" stroke-width="3.2" stroke-linejoin="round"/>
      <circle cx="52" cy="42" r="5.5" fill="#26242a"/><circle cx="68" cy="42" r="5.5" fill="#26242a"/>
      <circle cx="53.5" cy="40.5" r="1.6" fill="#8fd8ff"/><circle cx="69.5" cy="40.5" r="1.6" fill="#8fd8ff"/>
      <path d="M58 52 L62 56 L58 58 L54 56 Z" fill="#26242a"/>
      <path d="M52 62 L56 66 M64 62 L60 66 M56 66 L64 66" stroke="#5c5850" stroke-width="2"/>
      <path d="M60 70 L60 104" stroke="#e8e6da" stroke-width="5" stroke-linecap="round"/>
      <path d="M44 76 Q60 84 76 76 M44 84 Q60 92 76 84 M46 92 Q60 99 74 92" stroke="#e8e6da" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M60 74 L34 64 M60 74 L88 66" stroke="#e8e6da" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="33" cy="63" r="3.4" fill="#f4f2e8" stroke="#5c5850" stroke-width="2"/><circle cx="89" cy="65" r="3.4" fill="#f4f2e8" stroke="#5c5850" stroke-width="2"/>`,
    // 5 Паук-Трейдер
    (u) => `
      <defs><radialGradient id="${u}p" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#8a5fb8"/><stop offset="1" stop-color="#4a2a6a"/></radialGradient></defs>
      <path d="M48 66 C30 58 22 66 14 78 M48 72 C32 72 24 84 20 96 M72 66 C90 58 98 66 106 78 M72 72 C88 72 96 84 100 96 M50 62 C36 48 26 48 18 42 M70 62 C84 48 94 48 102 42" stroke="#2a1a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="82" rx="24" ry="20" fill="url(#${u}p)" stroke="#2a1a3a" stroke-width="3.2"/>
      <circle cx="60" cy="56" r="14" fill="#6a4a92" stroke="#2a1a3a" stroke-width="3"/>
      <path d="M48 88 Q60 96 72 88" stroke="#ffd23f" stroke-width="2.4" fill="none" opacity=".9"/>
      ${eye(54, 52, 4.4)} ${eye(67, 52, 4.4, 1)}
      <circle cx="48" cy="60" r="2.2" fill="#ff5a5a"/><circle cx="60" cy="62" r="2.2" fill="#ff5a5a"/><circle cx="72" cy="60" r="2.2" fill="#ff5a5a"/>
      <path d="M55 68 L53 73 M65 68 L67 73" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
    // 6 Крипер-Шахтёр
    (u) => `
      <defs><linearGradient id="${u}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbf5f"/><stop offset="1" stop-color="#2f8a2f"/></linearGradient></defs>
      <rect x="36" y="34" width="48" height="66" rx="6" fill="url(#${u}k)" stroke="#1d4d1d" stroke-width="3.4"/>
      <rect x="44" y="48" width="10" height="10" fill="#123312"/><rect x="66" y="48" width="10" height="10" fill="#123312"/>
      <path d="M54 58 L66 58 L66 70 L72 70 L72 80 L60 80 L60 70 L54 70 Z" fill="#123312"/>
      <path d="M30 36 Q60 8 90 36 L90 44 L30 44 Z" fill="#ffd23f" stroke="#8a6a10" stroke-width="3.2" stroke-linejoin="round"/>
      <circle cx="60" cy="26" r="5" fill="#fff8dc" stroke="#8a6a10" stroke-width="2"/>
      <path d="M42 86 L42 100 M78 86 L78 100" stroke="#1d4d1d" stroke-width="8" stroke-linecap="round"/>`,
    // 7 Робо-Гусь
    (u) => `
      <defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c8d4e0"/></linearGradient></defs>
      <path d="M46 58 C42 38 50 30 60 32" stroke="url(#${u}w)" stroke-width="13" fill="none" stroke-linecap="round"/>
      <circle cx="63" cy="32" r="11" fill="url(#${u}w)" stroke="#5a6a7a" stroke-width="3"/>
      <path d="M72 28 L92 33 L72 40 Z" fill="#ff9a3d" stroke="#8a4a10" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="64" cy="30" r="3.4" fill="#18ffff" stroke="#0a4a5a" stroke-width="1.6"/>
      <path d="M60 20 L58 10 M58 10 L54 12 M58 10 L62 12" stroke="#5a6a7a" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="56" cy="80" rx="27" ry="23" fill="url(#${u}w)" stroke="#5a6a7a" stroke-width="3.2"/>
      <rect x="38" y="72" width="36" height="18" rx="4" fill="#9fb2c8" stroke="#3a4a5a" stroke-width="2.4"/>
      <circle cx="46" cy="81" r="2" fill="#3a4a5a"/><circle cx="56" cy="81" r="2" fill="#3a4a5a"/><circle cx="66" cy="81" r="2" fill="#3a4a5a"/>
      <path d="M48 102 L48 112 M64 102 L64 112 M42 112 L54 112 M58 112 L70 112" stroke="#ff9a3d" stroke-width="4" stroke-linecap="round"/>`,
    // 8 Каменный Големчик
    (u) => `
      <defs><linearGradient id="${u}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa2ac"/><stop offset="1" stop-color="#5f666d"/></linearGradient></defs>
      <rect x="14" y="66" width="22" height="34" rx="9" transform="rotate(12 14 66)" fill="url(#${u}r)" stroke="#3a4046" stroke-width="3"/>
      <rect x="84" y="62" width="22" height="34" rx="9" transform="rotate(-10 84 62)" fill="url(#${u}r)" stroke="#3a4046" stroke-width="3"/>
      <rect x="34" y="52" width="52" height="52" rx="14" fill="url(#${u}r)" stroke="#3a4046" stroke-width="3.4"/>
      <rect x="42" y="24" width="36" height="30" rx="10" fill="url(#${u}r)" stroke="#3a4046" stroke-width="3.2"/>
      <circle cx="54" cy="39" r="4.4" fill="#ffb347"/><circle cx="66" cy="39" r="4.4" fill="#ffb347"/>
      <circle cx="54" cy="39" r="1.8" fill="#fff8dc"/><circle cx="66" cy="39" r="1.8" fill="#fff8dc"/>
      <path d="M54 46 Q60 50 66 46" stroke="#3a4046" stroke-width="2.4" fill="none"/>
      <ellipse cx="48" cy="66" rx="7" ry="4" fill="#7ed957" opacity=".55"/><ellipse cx="76" cy="90" rx="8" ry="4.4" fill="#7ed957" opacity=".45"/>
      <path d="M46 78 L52 84 M64 70 L70 76" stroke="#3a4046" stroke-width="2" opacity=".7"/>`,
    // 9 Гигачад-Голем
    (u) => `
      <defs><linearGradient id="${u}g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8ced6"/><stop offset="1" stop-color="#7b828c"/></linearGradient></defs>
      <path d="M24 62 C14 66 12 84 20 94 C28 100 40 96 44 88 Z" fill="url(#${u}g2)" stroke="#3a4046" stroke-width="3.2"/>
      <path d="M96 62 C106 66 108 84 100 94 C92 100 80 96 76 88 Z" fill="url(#${u}g2)" stroke="#3a4046" stroke-width="3.2"/>
      <path d="M28 56 L92 56 L86 104 L34 104 Z" fill="url(#${u}g2)" stroke="#3a4046" stroke-width="3.4" stroke-linejoin="round"/>
      <rect x="44" y="22" width="32" height="26" rx="9" fill="url(#${u}g2)" stroke="#3a4046" stroke-width="3.2"/>
      <path d="M40 42 L80 42 L76 52 Q60 58 44 52 Z" fill="url(#${u}g2)" stroke="#3a4046" stroke-width="3"/>
      <circle cx="54" cy="34" r="3.6" fill="#26242a"/><circle cx="66" cy="34" r="3.6" fill="#26242a"/>
      <path d="M48 28 L58 30 M72 28 L62 30" stroke="#26242a" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M46 46 Q60 52 74 46" stroke="#26242a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M40 70 L52 78 M68 66 L80 74" stroke="#3a4046" stroke-width="2" opacity=".6"/>`,
    // 10 Лавовая Слизнюга
    (u) => `
      <defs><linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2a30"/><stop offset="1" stop-color="#241014"/></linearGradient></defs>
      <path d="M16 100 C12 76 26 56 48 52 C60 44 82 50 92 64 C104 78 100 94 92 100 Z" fill="url(#${u}l)" stroke="#120608" stroke-width="3.4"/>
      <path d="M30 88 C40 80 38 70 46 66 M56 90 C64 82 62 74 70 70 M76 88 C82 82 82 76 88 74" stroke="#ff6a2b" stroke-width="3" fill="none" stroke-linecap="round" opacity=".95"/>
      <path d="M24 100 C30 106 36 106 40 100 M52 100 C58 106 64 106 68 100 M80 100 C86 106 92 106 96 100" stroke="#241014" stroke-width="3" fill="none"/>
      <circle cx="48" cy="64" r="6" fill="#fff"/><circle cx="48" cy="64" r="2.6" fill="#ff6a2b"/>
      <circle cx="68" cy="60" r="6" fill="#fff"/><circle cx="68" cy="60" r="2.6" fill="#ff6a2b"/>
      <path d="M52 76 Q60 82 68 76" stroke="#ff6a2b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="34" cy="44" r="5" fill="#3a2a30" opacity=".8"/><circle cx="44" cy="36" r="3.4" fill="#3a2a30" opacity=".7"/>`,
    // 11 Демон-Хулиган
    (u) => `
      <defs><radialGradient id="${u}d" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#ff7a5c"/><stop offset="1" stop-color="#c22a2a"/></radialGradient></defs>
      <path d="M92 84 C104 78 106 66 98 58 C104 70 96 76 88 78 Z" fill="#8a1a1a" stroke="#4a0a0a" stroke-width="2.6"/>
      <path d="M46 30 L36 12 L52 24 Z M74 30 L84 12 L68 24 Z" fill="#8a1a1a" stroke="#4a0a0a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M36 52 C22 56 20 70 26 80 C36 88 46 84 50 76 Z" fill="#6a1414" stroke="#4a0a0a" stroke-width="2.8"/>
      <circle cx="60" cy="62" r="32" fill="url(#${u}d)" stroke="#4a0a0a" stroke-width="3.4"/>
      <path d="M46 54 Q52 50 58 54 M62 54 Q68 50 74 54" stroke="#4a0a0a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M46 52 L58 58 M62 58 L74 52" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 70 Q60 82 74 70 Q68 80 60 80 Q52 80 46 70 Z" fill="#3a0808" stroke="#4a0a0a" stroke-width="2"/>
      <path d="M52 72 L54 78 M60 74 L60 80 M68 72 L66 78" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`,
    // 12 Космо-Кот
    (u) => `
      <defs><radialGradient id="${u}h3" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#c8d4e8"/><stop offset="1" stop-color="#8a97b5"/></radialGradient></defs>
      <circle cx="60" cy="52" r="30" fill="#bfe8ff" opacity=".28" stroke="#9adcff" stroke-width="2.6"/>
      <path d="M40 36 L36 16 L54 28 Z M80 36 L84 16 L66 28 Z" fill="#8a97b5" stroke="#4a5470" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="60" cy="52" r="26" fill="url(#${u}h3)" stroke="#4a5470" stroke-width="3.2"/>
      ${eye(50, 48, 5)} ${eye(70, 48, 5)}
      <path d="M56 58 Q60 62 64 58" stroke="#4a5470" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M36 52 L22 48 M36 58 L22 60 M84 52 L98 48 M84 58 L98 60" stroke="#4a5470" stroke-width="2"/>
      <ellipse cx="60" cy="92" rx="22" ry="16" fill="#8a97b5" stroke="#4a5470" stroke-width="3"/>
      <rect x="50" y="84" width="20" height="14" rx="3" fill="#c8d4e8" stroke="#4a5470" stroke-width="2"/>
      <circle cx="97" cy="24" r="2" fill="#fff" opacity=".9"/><circle cx="20" cy="34" r="1.6" fill="#fff" opacity=".8"/>`,
    // 13 Ледяной Йети
    (u) => `
      <defs><radialGradient id="${u}y" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b8d8ea"/></radialGradient></defs>
      <path d="M42 32 L34 14 L52 26 Z M78 32 L86 14 L68 26 Z" fill="#d8ecf5" stroke="#7aa8c2" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="38" cy="60" r="17" fill="url(#${u}y)" stroke="#7aa8c2" stroke-width="3"/>
      <circle cx="82" cy="60" r="17" fill="url(#${u}y)" stroke="#7aa8c2" stroke-width="3"/>
      <circle cx="60" cy="64" r="34" fill="url(#${u}y)" stroke="#7aa8c2" stroke-width="3.4"/>
      <ellipse cx="60" cy="72" rx="20" ry="16" fill="#a8d4ea" stroke="#7aa8c2" stroke-width="2.4"/>
      ${eye(50, 66, 4.4)} ${eye(70, 66, 4.4)}
      <path d="M44 60 L54 62 M76 60 L66 62" stroke="#4a6a80" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="60" cy="76" rx="5" ry="3.6" fill="#4a6a80"/>
      <path d="M50 84 L54 88 L58 84 L62 88 L66 84 L70 88" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <circle cx="42" cy="42" r="5" fill="#fff" opacity=".9"/><circle cx="80" cy="40" r="4" fill="#fff" opacity=".85"/><circle cx="60" cy="32" r="5.4" fill="#fff" opacity=".9"/>`,
    // 14 Ангел-Бухгалтер
    (u) => `
      <defs><linearGradient id="${u}a2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d8d0ea"/></linearGradient></defs>
      <ellipse cx="60" cy="16" rx="14" ry="4.6" fill="none" stroke="#ffd23f" stroke-width="3.4"/>
      <path d="M28 74 C12 68 8 52 18 44 C16 58 24 66 34 70 Z" fill="#f0ecf8" stroke="#a89ac2" stroke-width="2.8"/>
      <path d="M92 74 C108 68 112 52 102 44 C104 58 96 66 86 70 Z" fill="#f0ecf8" stroke="#a89ac2" stroke-width="2.8"/>
      <path d="M40 60 L80 60 L86 104 L34 104 Z" fill="url(#${u}a2)" stroke="#a89ac2" stroke-width="3.2" stroke-linejoin="round"/>
      <rect x="52" y="78" width="16" height="5" fill="#ffd23f" stroke="#a8860f" stroke-width="1.6"/>
      <circle cx="60" cy="42" r="18" fill="#f5e8dc" stroke="#a08a72" stroke-width="3"/>
      <circle cx="53" cy="40" r="5" fill="none" stroke="#3a3a4a" stroke-width="2.2"/><circle cx="67" cy="40" r="5" fill="none" stroke="#3a3a4a" stroke-width="2.2"/>
      <path d="M58 40 L62 40" stroke="#3a3a4a" stroke-width="2"/>
      <circle cx="53" cy="40" r="1.6" fill="#3a3a4a"/><circle cx="67" cy="40" r="1.6" fill="#3a3a4a"/>
      <path d="M56 50 Q60 53 64 50" stroke="#a08a72" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="80" y="78" width="16" height="12" rx="2" fill="#fff" stroke="#a08a72" stroke-width="2"/>
      <path d="M83 81 L93 81 M83 84 L91 84 M83 87 L90 87" stroke="#a08a72" stroke-width="1.2"/>`
  ];

  function monster(idx, size, boss) {
    const u = uid();
    const inner = (MONS[idx % MONS.length])(u);
    let aura = '';
    if (boss) {
      aura = `<defs><radialGradient id="${u}au"><stop offset="0" stop-color="#ff4d2a" stop-opacity=".45"/><stop offset="70%" stop-color="#ff4d2a" stop-opacity=".18"/><stop offset="100%" stop-color="#ff4d2a" stop-opacity="0"/></radialGradient></defs>
        <ellipse cx="60" cy="72" rx="56" ry="48" fill="url(#${u}au)"/>`;
    }
    const crown = boss ? `
      <path d="M38 22 L42 4 L52 16 L60 2 L68 16 L78 4 L82 22 Z" fill="#ffd23f" stroke="#8a5a10" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="60" cy="16" r="2.6" fill="#ff4d6d" stroke="#8a5a10" stroke-width="1.6"/>
      <circle cx="48" cy="18" r="2.2" fill="#40c4ff" stroke="#8a5a10" stroke-width="1.6"/>
      <circle cx="72" cy="18" r="2.2" fill="#7ed957" stroke="#8a5a10" stroke-width="1.6"/>` : '';
    return `<svg viewBox="0 0 120 120" width="${size || 110}" height="${size || 110}">${aura}${crown}${inner}</svg>`;
  }

  // ================= ГЕРОЙ-КАПИБАРА =================
  function hero(size) {
    const u = uid();
    return `<svg viewBox="0 0 140 140" width="${size || 140}" height="${size || 140}">
      <defs>
        <radialGradient id="${u}f" cx=".38" cy=".3" r="1.1"><stop offset="0" stop-color="#c08a4f"/><stop offset="1" stop-color="#7d5227"/></radialGradient>
        <linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b078"/><stop offset="1" stop-color="#c09858"/></linearGradient>
      </defs>
      <ellipse cx="72" cy="127" rx="46" ry="8" fill="rgba(0,0,0,.28)"/>
      <rect x="42" y="102" width="24" height="22" rx="9" fill="#8a5c30" stroke="#4a2f14" stroke-width="3.4"/>
      <rect x="86" y="102" width="24" height="22" rx="9" fill="#8a5c30" stroke="#4a2f14" stroke-width="3.4"/>
      <rect x="30" y="56" width="86" height="64" rx="30" fill="url(#${u}f)" stroke="#4a2f14" stroke-width="3.6"/>
      <ellipse cx="52" cy="102" rx="16" ry="9" fill="#d9b078" opacity=".8"/>
      <rect x="32" y="28" width="82" height="52" rx="26" fill="url(#${u}f)" stroke="#4a2f14" stroke-width="3.6"/>
      <circle cx="46" cy="30" r="7.5" fill="#8a5c30" stroke="#4a2f14" stroke-width="3"/>
      <circle cx="79" cy="27" r="8" fill="#8a5c30" stroke="#4a2f14" stroke-width="3"/>
      <circle cx="46" cy="30" r="3" fill="#6a4420"/><circle cx="79" cy="27" r="3.4" fill="#6a4420"/>
      <rect x="84" y="46" width="32" height="26" rx="11" fill="url(#${u}m)" stroke="#4a2f14" stroke-width="3"/>
      <rect x="101" y="50" width="13" height="10" rx="4.5" fill="#3a2312" stroke="#2a1808" stroke-width="2"/>
      <circle cx="104.5" cy="54" r="1.4" fill="#c8a06a"/><circle cx="110" cy="54" r="1.4" fill="#c8a06a"/>
      <path d="M96 66 Q102 71 108 66" stroke="#4a2f14" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="56" cy="48" r="5" fill="#fff" stroke="#2a1808" stroke-width="1.8"/><circle cx="57.5" cy="48.5" r="2.4" fill="#1c1c1c"/><circle cx="56.6" cy="47.4" r=".9" fill="#fff"/>
      <circle cx="76" cy="46" r="5" fill="#fff" stroke="#2a1808" stroke-width="1.8"/><circle cx="77.5" cy="46.5" r="2.4" fill="#1c1c1c"/><circle cx="76.6" cy="45.4" r=".9" fill="#fff"/>
      <ellipse cx="66" cy="60" rx="5.4" ry="3" fill="#e88a7a" opacity=".45"/>
      <path d="M60 24 Q64 20 68 24" stroke="#4a2f14" stroke-width="2" fill="none" opacity=".6"/>
    </svg>`;
  }

  // ================= ПИТОМЦЫ =================
  const PETS = [
    // 0 Кот-Банан
    (u) => `
      <defs><linearGradient id="${u}bn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe95c"/><stop offset="1" stop-color="#f4a80c"/></linearGradient></defs>
      <path d="M20 58 C14 34 30 16 52 16 C74 16 88 32 86 56 L72 56 C74 38 64 28 52 28 C40 28 32 38 34 56 Z" fill="url(#${u}bn)" stroke="#8a5a10" stroke-width="3.4" stroke-linejoin="round"/>
      <circle cx="52" cy="52" r="17" fill="#b8c4d8" stroke="#5a6a8a" stroke-width="3"/>
      <path d="M40 42 L36 28 L48 36 Z M64 42 L68 28 L56 36 Z" fill="#b8c4d8" stroke="#5a6a8a" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="46" cy="50" r="2" fill="#1c2a4a"/><circle cx="58" cy="50" r="2" fill="#1c2a4a"/>
      <path d="M49 57 Q52 60 55 57" stroke="#5a6a8a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M43 54 Q39 57 40 60 M61 54 Q65 57 64 60" stroke="#5a6a8a" stroke-width="1.6" fill="none"/>
      <path d="M50 62 Q52 66 54 62 Q53 69 52 69 Q51 69 50 62 Z" fill="#6ac8ff" stroke="#3a8ac8" stroke-width="1.2"/>
      <circle cx="20" cy="70" r="4.4" fill="#ffe95c" stroke="#8a5a10" stroke-width="2.4"/><circle cx="84" cy="70" r="4.4" fill="#ffe95c" stroke="#8a5a10" stroke-width="2.4"/>`,
    // 1 Хомяк-Криптоинвестор
    (u) => `
      <defs><radialGradient id="${u}hm" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#f5c87a"/><stop offset="1" stop-color="#d88a2a"/></radialGradient></defs>
      <circle cx="50" cy="54" r="28" fill="url(#${u}hm)" stroke="#8a5a10" stroke-width="3.4"/>
      <circle cx="30" cy="34" r="9" fill="url(#${u}hm)" stroke="#8a5a10" stroke-width="3"/><circle cx="70" cy="34" r="9" fill="url(#${u}hm)" stroke="#8a5a10" stroke-width="3"/>
      <rect x="30" y="44" width="40" height="11" rx="5" fill="#1c1c24" stroke="#000" stroke-width="1.6"/>
      <path d="M44 48 L56 48" stroke="#1c1c24" stroke-width="4"/>
      <circle cx="37" cy="49" r="2" fill="#7ed957"/><circle cx="63" cy="49" r="2" fill="#7ed957"/>
      <ellipse cx="50" cy="64" rx="12" ry="9" fill="#f5e0bc" stroke="#c89a5a" stroke-width="2"/>
      <ellipse cx="50" cy="61" rx="3" ry="2.2" fill="#c88a5a"/>
      <path d="M44 68 Q50 72 56 68" stroke="#8a5a10" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="68" cy="74" r="9" fill="#ffd23f" stroke="#8a6a10" stroke-width="2.6"/><circle cx="68" cy="74" r="5" fill="none" stroke="#8a6a10" stroke-width="1.6"/>
      <path d="M68 70 L69.6 73 L73 73.4 L70.4 75.8 L71 79 L68 77.4 L65 79 L65.6 75.8 L63 73.4 L66.4 73 Z" fill="#8a6a10"/>`,
    // 2 Пепе-Маг
    (u) => `
      <defs><linearGradient id="${u}pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ac85a"/><stop offset="1" stop-color="#4a8a2a"/></linearGradient></defs>
      <circle cx="38" cy="34" r="8" fill="url(#${u}pp)" stroke="#2a5a14" stroke-width="3"/><circle cx="62" cy="34" r="8" fill="url(#${u}pp)" stroke="#2a5a14" stroke-width="3"/>
      <circle cx="38" cy="34" r="3.4" fill="#ffcf4d" stroke="#2a5a14" stroke-width="1.4"/><circle cx="62" cy="34" r="3.4" fill="#ffcf4d" stroke="#2a5a14" stroke-width="1.4"/>
      <ellipse cx="50" cy="56" rx="24" ry="20" fill="url(#${u}pp)" stroke="#2a5a14" stroke-width="3.4"/>
      <path d="M40 58 Q45 66 50 58 Q55 66 60 58" stroke="#2a5a14" stroke-width="2.4" fill="none"/>
      <path d="M50 36 L26 14 L74 20 Z" fill="#7a4ac8" stroke="#3a1a70" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="34" cy="18" r="2.2" fill="#ffe14d"/><circle cx="58" cy="20" r="1.8" fill="#ffe14d"/>
      <path d="M74 20 L86 6" stroke="#8a6a3a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="88" cy="5" r="5" fill="#7ed957" stroke="#2a5a14" stroke-width="2"/>
      <path d="M86 5 L88 7 L91 4" stroke="#1c5a1c" stroke-width="1.6" fill="none"/>`,
    // 3 Доге-Танк
    (u) => `
      <defs><radialGradient id="${u}dg" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#f0c88a"/><stop offset="1" stop-color="#c8955a"/></radialGradient></defs>
      <path d="M30 38 L26 20 L42 30 Z M70 38 L74 20 L58 30 Z" fill="#c8955a" stroke="#7a5a2a" stroke-width="2.8" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="26" fill="url(#${u}dg)" stroke="#7a5a2a" stroke-width="3.4"/>
      <path d="M26 42 Q50 16 74 42 L74 50 Q50 38 26 50 Z" fill="#5a7a3a" stroke="#3a5222" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 24 L52.4 30 L58 30 L54 34 L55.4 40 L50 37 L44.6 40 L46 34 L42 30 L47.6 30 Z" fill="#ffe95c" stroke="#3a5222" stroke-width="1.6"/>
      <ellipse cx="50" cy="60" rx="13" ry="10" fill="#f0e0c0" stroke="#a8865a" stroke-width="2"/>
      <ellipse cx="50" cy="56" rx="3.4" ry="2.6" fill="#7a5a2a"/>
      <circle cx="39" cy="46" r="2.8" fill="#3a2a1a"/><circle cx="61" cy="46" r="2.8" fill="#3a2a1a"/>
      <path d="M43 64 Q50 69 57 64" stroke="#7a5a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    // 4 Гусь-Кузнец
    (u) => `
      <defs><linearGradient id="${u}gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d0d8e2"/></linearGradient></defs>
      <ellipse cx="46" cy="66" rx="22" ry="19" fill="url(#${u}gs)" stroke="#5a6a7a" stroke-width="3.2"/>
      <path d="M38 52 C36 34 44 28 52 30" stroke="url(#${u}gs)" stroke-width="11" fill="none" stroke-linecap="round"/>
      <circle cx="54" cy="30" r="10" fill="url(#${u}gs)" stroke="#5a6a7a" stroke-width="3"/>
      <path d="M62 26 L78 30 L62 36 Z" fill="#ff9a3d" stroke="#8a4a10" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="55" cy="28" r="2.6" fill="#1c2a4a"/>
      <path d="M36 48 Q46 56 42 66 L32 62 Q30 54 36 48 Z" fill="#c83a3a" stroke="#7a1a1a" stroke-width="2.6"/>
      <g transform="rotate(-24 78 58)"><rect x="72" y="54" width="18" height="9" rx="2" fill="#8a94a2" stroke="#3a4450" stroke-width="2.4"/><rect x="79" y="62" width="4" height="10" rx="2" fill="#8a6a3a" stroke="#3a4450" stroke-width="2"/></g>
      <path d="M38 84 L38 92 M54 84 L54 92 M32 92 L44 92 M48 92 L60 92" stroke="#ff9a3d" stroke-width="3.4" stroke-linecap="round"/>`,
    // 5 Золотой Дракон
    (u) => `
      <defs><radialGradient id="${u}dr" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#ffe95c"/><stop offset="1" stop-color="#e8a00a"/></radialGradient></defs>
      <path d="M24 52 C12 46 10 34 18 28 C16 40 24 44 30 46 Z" fill="#f4b83a" stroke="#8a5a10" stroke-width="2.8"/>
      <path d="M76 52 C88 46 90 34 82 28 C84 40 76 44 70 46 Z" fill="#f4b83a" stroke="#8a5a10" stroke-width="2.8"/>
      <circle cx="50" cy="54" r="26" fill="url(#${u}dr)" stroke="#8a5a10" stroke-width="3.4"/>
      <path d="M40 32 L36 18 L48 26 Z M60 32 L64 18 L52 26 Z" fill="#f4d23a" stroke="#8a5a10" stroke-width="2.6" stroke-linejoin="round"/>
      <ellipse cx="50" cy="64" rx="14" ry="11" fill="#fff3b0" stroke="#c89a2a" stroke-width="2"/>
      <circle cx="41" cy="50" r="3" fill="#1c1c1c"/><circle cx="59" cy="50" r="3" fill="#1c1c1c"/>
      <circle cx="42" cy="49" r="1" fill="#fff"/><circle cx="60" cy="49" r="1" fill="#fff"/>
      <ellipse cx="50" cy="59" rx="6" ry="4.4" fill="#f4d23a" stroke="#8a5a10" stroke-width="2"/>
      <path d="M45 65 Q50 68 55 65" stroke="#8a5a10" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M64 62 L74 56 M76 54 L80 58 L74 60" stroke="#8a5a10" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M20 70 L23 74 L27 70 L23 66 Z" fill="#ffd23f"/>`
  ];

  function pet(idx, size) {
    const u = uid();
    return `<svg viewBox="0 0 100 100" width="${size || 48}" height="${size || 48}">${(PETS[idx % PETS.length])(u)}</svg>`;
  }

  // ================= ИКОНКИ =================
  function icon(name, size) {
    size = size || 24;
    const I = {
      coin: () => `
        <defs><radialGradient id="icA" cx=".35" cy=".3" r="1"><stop offset="0" stop-color="#ffe95c"/><stop offset="1" stop-color="#e8950a"/></radialGradient></defs>
        <circle cx="12" cy="12" r="10" fill="url(#icA)" stroke="#8a5a10" stroke-width="1.8"/>
        <circle cx="12" cy="12" r="6.6" fill="none" stroke="#b87a10" stroke-width="1.4"/>
        <path d="M12 7.6 L13.2 10.6 L16.4 10.9 L14 13 L14.8 16.2 L12 14.4 L9.2 16.2 L10 13 L7.6 10.9 L10.8 10.6 Z" fill="#8a5a10"/>`,
      gem: () => `
        <defs><linearGradient id="icB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8affea"/><stop offset="1" stop-color="#0e9c82"/></linearGradient></defs>
        <path d="M6 8 L12 3 L18 8 L20 12 L12 21 L4 12 Z" fill="url(#icB)" stroke="#0a5a4a" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M6 8 L12 11 L18 8 M12 11 L12 21" stroke="#d8fff4" stroke-width="1.2" fill="none" opacity=".8"/>`,
      stone: () => `
        <defs><radialGradient id="icC" cx=".35" cy=".3" r="1"><stop offset="0" stop-color="#d0b8ff"/><stop offset="1" stop-color="#6a44b8"/></radialGradient></defs>
        <path d="M4 16 C3 9 8 4 13 4 C19 4 21 9 20 15 C20 19 17 21 12 21 C7 21 4.6 20 4 16 Z" fill="url(#icC)" stroke="#3a2068" stroke-width="1.8"/>
        <path d="M12 8 L15 13 L9 13 Z" fill="#ffe14d" stroke="#3a2068" stroke-width="1.2"/>`,
      anvil: () => `
        <defs><linearGradient id="icD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa4b0"/><stop offset="1" stop-color="#4a545e"/></linearGradient></defs>
        <path d="M2 8 C6 12 12 13 18 12 L18 15 L13 16 L13 19 L18 21 L6 21 L11 19 L11 16 C6 15 2 13 2 8 Z" fill="url(#icD)" stroke="#232a32" stroke-width="1.6" stroke-linejoin="round"/>`,
      lock: () => `
        <path d="M8 10 L8 8 C8 5 9.6 3.4 12 3.4 C14.4 3.4 16 5 16 8 L16 10" fill="none" stroke="#c9a67e" stroke-width="2.2"/>
        <rect x="5" y="10" width="14" height="10.4" rx="2.4" fill="#8a6a3a" stroke="#4a3416" stroke-width="1.8"/>
        <circle cx="12" cy="14.6" r="1.9" fill="#2a1c08"/><rect x="11.2" y="15.4" width="1.6" height="2.8" rx=".8" fill="#2a1c08"/>`,
      trash: () => `
        <path d="M4.6 6.6 L19.4 6.6" stroke="#ffb3a1" stroke-width="2" stroke-linecap="round"/>
        <path d="M9.4 3 L14.6 3 L15.4 6.6 L8.6 6.6 Z" fill="#ff9a8a" stroke="#7a2a1a" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M6.6 6.6 L7.6 20 L16.4 20 L17.4 6.6 Z" fill="#c86a5a" stroke="#7a2a1a" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M10.3 9.6 L10.7 17 M13.7 9.6 L13.3 17" stroke="#7a2a1a" stroke-width="1.6" stroke-linecap="round"/>`,
      bolt: () => `
        <path d="M13.5 2 L5.5 13.5 L10.5 13.5 L9 22 L18.5 9.5 L13 9.5 Z" fill="#ffd23f" stroke="#8a6a10" stroke-width="1.6" stroke-linejoin="round"/>`,
      video: () => `
        <rect x="2" y="5" width="20" height="14" rx="4" fill="#3a2416" stroke="#8a6134" stroke-width="1.8"/>
        <path d="M10 9 L16 12 L10 15 Z" fill="#ffd23f"/>`,
      book: () => `
        <path d="M12 6 C9 3.6 5 3.4 2.6 4.4 L2.6 18.6 C5 17.6 9 17.8 12 20 C15 17.8 19 17.6 21.4 18.6 L21.4 4.4 C19 3.4 15 3.6 12 6 Z" fill="#f0e2c8" stroke="#6a4a26" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M12 6 L12 20" stroke="#6a4a26" stroke-width="1.8"/>
        <path d="M5 8 L9.4 8.4 M5 11 L9.4 11.4 M14.6 8.4 L19 8 M14.6 11.4 L19 11" stroke="#a8865a" stroke-width="1.2"/>`,
      paw: () => `
        <ellipse cx="12" cy="15" rx="5.6" ry="4.6" fill="#c08a4f" stroke="#4a2f14" stroke-width="1.6"/>
        <circle cx="5.6" cy="10.4" r="2.5" fill="#c08a4f" stroke="#4a2f14" stroke-width="1.6"/>
        <circle cx="9.8" cy="7.4" r="2.5" fill="#c08a4f" stroke="#4a2f14" stroke-width="1.6"/>
        <circle cx="14.2" cy="7.4" r="2.5" fill="#c08a4f" stroke="#4a2f14" stroke-width="1.6"/>
        <circle cx="18.4" cy="10.4" r="2.5" fill="#c08a4f" stroke="#4a2f14" stroke-width="1.6"/>`,
      up: () => `
        <circle cx="12" cy="12" r="10" fill="#63a032" stroke="#2a5216" stroke-width="1.8"/>
        <path d="M12 6 L18 13 L14.4 13 L14.4 18 L9.6 18 L9.6 13 L6 13 Z" fill="#fff"/>`,
      clock: () => `
        <circle cx="12" cy="12" r="9.4" fill="#3a2416" stroke="#8a6134" stroke-width="1.8"/>
        <path d="M12 6.6 L12 12 L16 14.4" stroke="#ffd23f" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      x: () => `
        <path d="M6 6 L18 18 M18 6 L6 18" stroke="#ff8a7a" stroke-width="3" stroke-linecap="round"/>`,
      sound: () => `
        <path d="M4 9 L8 9 L13 4.6 L13 19.4 L8 15 L4 15 Z" fill="#ffd23f" stroke="#8a6a10" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M16 9 C17.6 10.6 17.6 13.4 16 15 M18.6 6.6 C21.4 9.6 21.4 14.4 18.6 17.4" stroke="#ffd23f" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      mute: () => `
        <path d="M4 9 L8 9 L13 4.6 L13 19.4 L8 15 L4 15 Z" fill="#9a8a72" stroke="#5a4a34" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M16 9 L21 15 M21 9 L16 15" stroke="#ff8a7a" stroke-width="2.2" stroke-linecap="round"/>`,
      gift: () => `
        <rect x="4" y="10" width="16" height="10.4" rx="2" fill="#c83a3a" stroke="#7a1a1a" stroke-width="1.8"/>
        <rect x="2.8" y="6.6" width="18.4" height="4.4" rx="1.6" fill="#e05a5a" stroke="#7a1a1a" stroke-width="1.8"/>
        <rect x="10.8" y="6.6" width="2.4" height="13.8" fill="#ffd23f" stroke="#8a6a10" stroke-width="1.4"/>
        <path d="M12 6.4 C9 6.4 7.4 4.6 8.4 3.2 C9.4 1.8 11.4 3 12 6.4 C12.6 3 14.6 1.8 15.6 3.2 C16.6 4.6 15 6.4 12 6.4 Z" fill="#ffd23f" stroke="#8a6a10" stroke-width="1.4"/>`,
      crown: () => `
        <path d="M4 17 L3 7 L8 11 L12 4 L16 11 L21 7 L20 17 Z" fill="#ffd23f" stroke="#8a5a10" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="4" y="17" width="16" height="2.6" rx="1.2" fill="#e8a80a" stroke="#8a5a10" stroke-width="1.6"/>`,
      hammer: () => `
        <g transform="rotate(-38 12 12)">
          <rect x="5" y="4.6" width="14" height="7" rx="2" fill="#9aa4b0" stroke="#3a4450" stroke-width="1.8"/>
          <rect x="10.6" y="11.6" width="2.8" height="9" rx="1.4" fill="#8a6a3a" stroke="#4a3416" stroke-width="1.6"/>
        </g>`,
      flame: () => `
        <path d="M12 2.6 C14 6.4 18 8 18 13 C18 17.4 15.4 20.4 12 20.4 C8.6 20.4 6 17.4 6 13 C6 10.4 7.4 9 8.4 7.4 C8.8 9.4 9.8 10.4 11 10.6 C10.4 7.6 10.8 4.6 12 2.6 Z" fill="#ff8a3b" stroke="#b34a10" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M12 11.4 C13 13 14.4 13.8 14.4 15.6 C14.4 17.4 13.2 18.4 12 18.4 C10.8 18.4 9.6 17.4 9.6 15.6 C9.6 13.8 11 13 12 11.4 Z" fill="#ffe14d"/>`,
      skull: () => `
        <path d="M12 3 C17 3 20 6.4 20 11 C20 14 18.4 16 16.6 17 L17 19 L14.4 19 L14.4 21 L9.6 21 L9.6 19 L7 19 L7.4 17 C5.6 16 4 14 4 11 C4 6.4 7 3 12 3 Z" fill="#f0ecdf" stroke="#5c5850" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="9" cy="11" r="2.2" fill="#26242a"/><circle cx="15" cy="11" r="2.2" fill="#26242a"/>
        <path d="M11 15.6 L13 15.6 L12 17.4 Z" fill="#26242a"/>`,
      scroll: () => `
        <rect x="4.6" y="3.4" width="14.8" height="17.2" rx="2.6" fill="#f0e2c8" stroke="#6a4a26" stroke-width="1.8"/>
        <path d="M8 8 L16 8 M8 11.4 L16 11.4 M8 14.8 L13 14.8" stroke="#a8865a" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="16.4" cy="17" r="2.6" fill="#7ed957" stroke="#2a5216" stroke-width="1.4"/>
        <path d="M15.4 17 L16.2 17.8 L17.6 16.2" stroke="#fff" stroke-width="1.2" fill="none"/>`,
      star: () => `
        <path d="M12 2.6 L14.8 8.8 L21.4 9.6 L16.6 14.2 L17.8 20.8 L12 17.4 L6.2 20.8 L7.4 14.2 L2.6 9.6 L9.2 8.8 Z" fill="#ffd23f" stroke="#8a5a10" stroke-width="1.6" stroke-linejoin="round"/>`,
      sword: () => `
        <g transform="rotate(0 12 12)">
          <path d="M12 2 L15 7 L14.6 15 L9.4 15 L9 7 Z" fill="#c8d4e0" stroke="#3a4450" stroke-width="1.6" stroke-linejoin="round"/>
          <rect x="7" y="15" width="10" height="2.4" rx="1.2" fill="#8a6a3a" stroke="#4a3416" stroke-width="1.4"/>
          <rect x="10.8" y="17.4" width="2.4" height="3.6" fill="#8a6a3a" stroke="#4a3416" stroke-width="1.2"/>
        </g>`,
      pin: () => `
        <path d="M4 4 L20 4 L12 20 Z" fill="#ff5a3b" stroke="#7a1a08" stroke-width="1.8" stroke-linejoin="round"/>`,
      drone: () => `
        <rect x="7" y="8" width="10" height="7" rx="3" fill="#9aa4b0" stroke="#3a4450" stroke-width="1.8"/>
        <circle cx="12" cy="11" r="1.6" fill="#40c4ff"/>
        <path d="M7 9 L3.4 6.6 M17 9 L20.6 6.6" stroke="#3a4450" stroke-width="1.8"/>
        <ellipse cx="3.4" cy="6" rx="3" ry="1.1" fill="#c8d4e0" stroke="#3a4450" stroke-width="1"/>
        <ellipse cx="20.6" cy="6" rx="3" ry="1.1" fill="#c8d4e0" stroke="#3a4450" stroke-width="1"/>`
    };
    const f = I[name] || I.star;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}">${f()}</svg>`;
  }

  // ================= БИОМЫ (фоны арены) =================
  function biomeSvg(i) {
    const u = uid();
    const B = [];
    const sky = (c1, c2) => `<defs><linearGradient id="${u}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="240" fill="url(#${u}sky)"/>`;
    const rndStars = (n, color, op) => {
      let s = '';
      for (let k = 0; k < n; k++) {
        s += `<circle cx="${(k * 73 + 31) % 397}" cy="${(k * 47 + 13) % 200}" r="${1 + (k % 3) * 0.6}" fill="${color}" opacity="${op}"/>`;
      }
      return s;
    };
    switch (i % 10) {
      case 0: B.push(sky('#8fd8ff', '#eaf7c8'));
        B.push(`<circle cx="340" cy="42" r="22" fill="#ffe95c" stroke="#f4c80a" stroke-width="4" opacity=".95"/><g class="f2" fill="#ffffff" opacity=".9"><ellipse cx="80" cy="46" rx="34" ry="12"/><ellipse cx="110" cy="40" rx="24" ry="10"/><ellipse cx="250" cy="66" rx="40" ry="12"/></g>`);
        B.push(`<path d="M0 150 Q100 96 200 140 T400 130 L400 240 L0 240 Z" fill="#7cc25e"/>`);
        B.push(`<g class="f1"><rect x="60" y="120" width="70" height="52" fill="#b0793f" stroke="#5a3a18" stroke-width="3"/><path d="M50 124 L95 92 L140 124 Z" fill="#d8a94e" stroke="#8a6a20" stroke-width="3"/><rect x="86" y="142" width="18" height="30" fill="#5a3a18"/><rect x="66" y="132" width="14" height="14" fill="#ffe9b0" stroke="#5a3a18" stroke-width="2.4"/></g>`);
        B.push(`<g><rect x="216" y="132" width="54" height="40" fill="#b0793f" stroke="#5a3a18" stroke-width="3"/><path d="M208 136 L243 108 L278 136 Z" fill="#c88a3a" stroke="#8a6a20" stroke-width="3"/><rect x="234" y="150" width="15" height="22" fill="#5a3a18"/></g>`);
        B.push(`<path d="M0 176 Q200 158 400 172 L400 240 L0 240 Z" fill="#58a844"/>`);
        B.push(`<g fill="#8a6a3a"><rect x="10" y="168" width="6" height="26"/><rect x="30" y="168" width="6" height="26"/><rect x="0" y="172" width="400" height="5" opacity=".5"/></g>`);
        break;
      case 1: B.push(sky('#0e2431', '#1d4036'));
        B.push(`<circle cx="330" cy="46" r="20" fill="#e8f0d8" opacity=".9"/><circle cx="322" cy="40" r="18" fill="#0e2431"/>`);
        B.push(`<g class="f2" fill="#16322a"><path d="M40 170 L60 96 L80 170 Z M110 170 L128 110 L146 170 Z M180 170 L198 90 L216 170 Z M260 170 L280 104 L300 170 Z M340 170 L356 116 L372 170 Z"/></g>`);
        B.push(`<g fill="#0c1f1a"><path d="M10 200 L38 104 L66 200 Z M90 200 L120 92 L150 200 Z M170 200 L196 108 L222 200 Z M250 200 L282 96 L314 200 Z M330 200 L356 112 L382 200 Z"/></g>`);
        B.push(`<path d="M0 196 Q200 184 400 194 L400 240 L0 240 Z" fill="#12281f"/>`);
        B.push(`<ellipse cx="200" cy="188" rx="180" ry="14" fill="#2a4a3a" opacity=".35" class="f3"/>`);
        break;
      case 2: B.push(sky('#3a2a1c', '#241708'));
        B.push(`<path d="M0 0 L60 0 Q30 120 60 240 L0 240 Z" fill="#1c1108"/><path d="M400 0 L340 0 Q370 120 340 240 L400 240 Z" fill="#1c1108"/>`);
        B.push(`<g class="f1"><circle cx="90" cy="120" r="10" fill="#7dff5e" opacity=".25"/><circle cx="90" cy="120" r="5" fill="#7dff5e"/><circle cx="150" cy="150" r="8" fill="#7dff5e" opacity=".2"/><circle cx="150" cy="150" r="4" fill="#8aff6e"/><circle cx="250" cy="110" r="9" fill="#7dff5e" opacity=".22"/><circle cx="250" cy="110" r="4.4" fill="#7dff5e"/></g>`);
        B.push(`<rect x="120" y="60" width="12" height="180" fill="#6a4a26" stroke="#3a2408" stroke-width="2.4"/><rect x="280" y="60" width="12" height="180" fill="#6a4a26" stroke="#3a2408" stroke-width="2.4"/><rect x="108" y="48" width="196" height="14" fill="#7a5630" stroke="#3a2408" stroke-width="2.4"/>`);
        B.push(`<g><path d="M196 150 L204 150 L204 176 L196 176 Z" fill="#8a6a3a"/><circle cx="200" cy="144" r="7" fill="#ffcf4d" stroke="#e8950a" stroke-width="2" opacity=".95"/></g>`);
        B.push(`<path d="M0 210 Q100 198 200 208 T400 204 L400 240 L0 240 Z" fill="#2e1d0e"/>`);
        break;
      case 3: B.push(sky('#0d0621', '#26124d'));
        B.push(`<circle cx="330" cy="50" r="24" fill="#ff6ac8" opacity=".8"/><circle cx="330" cy="50" r="17" fill="#ffb3e8" opacity=".9"/>`);
        B.push(`<g class="f2"><rect x="30" y="90" width="46" height="150" fill="#1a0f38" stroke="#00e5ff" stroke-width="2"/><rect x="40" y="104" width="8" height="8" fill="#00e5ff"/><rect x="56" y="104" width="8" height="8" fill="#ff00e5"/><rect x="40" y="124" width="8" height="8" fill="#ff00e5"/><rect x="56" y="144" width="8" height="8" fill="#00e5ff"/><rect x="40" y="164" width="8" height="8" fill="#00e5ff"/><rect x="98" y="120" width="38" height="120" fill="#241246" stroke="#b45cff" stroke-width="2"/><rect x="106" y="132" width="7" height="7" fill="#b45cff"/><rect x="120" y="152" width="7" height="7" fill="#00e5ff"/><rect x="106" y="172" width="7" height="7" fill="#ff6ac8"/></g>`);
        B.push(`<g class="f3"><rect x="290" y="70" width="52" height="170" fill="#16092e" stroke="#ffd23f" stroke-width="2"/><rect x="300" y="86" width="9" height="9" fill="#ffd23f"/><rect x="318" y="106" width="9" height="9" fill="#00e5ff"/><rect x="300" y="126" width="9" height="9" fill="#ff00e5"/><rect x="318" y="146" width="9" height="9" fill="#ffd23f"/></g>`);
        B.push(`<path d="M0 240 L0 210 L400 210 L400 240 Z" fill="#12081f"/>`);
        B.push(`<g stroke="#00e5ff" opacity=".4"><path d="M0 216 L400 216 M0 226 L400 226 M60 210 L20 240 M160 210 L130 240 M260 210 L230 240 M360 210 L330 240"/></g>`);
        break;
      case 4: B.push(sky('#2a0a08', '#120404'));
        B.push(`<g fill="#1c0606"><path d="M60 240 L110 90 L160 240 Z M240 240 L290 70 L340 240 Z"/></g>`);
        B.push(`<path d="M96 100 L110 90 L124 100 Q110 112 96 100 Z" fill="#ff6a2b"/><path d="M276 82 L290 70 L304 82 Q290 94 276 82 Z" fill="#ff8a3b" class="f2"/>`);
        B.push(`<path d="M0 200 Q60 186 120 198 T240 196 T360 200 L400 198 L400 240 L0 240 Z" fill="#b3300a"/>`);
        B.push(`<path d="M0 208 Q80 196 160 206 T320 204 T400 208 L400 240 L0 240 Z" fill="#ff6a2b" opacity=".9" class="f1"/>`);
        B.push(`<path d="M0 218 Q100 208 200 216 T400 214 L400 240 L0 240 Z" fill="#ffb347" opacity=".8" class="f2"/>`);
        B.push(`<g class="f3" fill="#ff8a3b"><circle cx="80" cy="120" r="2.4"/><circle cx="180" cy="90" r="1.8"/><circle cx="300" cy="130" r="2.2"/><circle cx="240" cy="60" r="1.6"/></g>`);
        break;
      case 5: B.push(`<rect width="400" height="240" fill="#c8b45a"/><rect width="400" height="150" fill="#d8c872"/>`);
        B.push(`<g stroke="#b8a850" stroke-width="3"><path d="M0 40 L400 40 M0 80 L400 80 M0 120 L400 120 M66 0 L66 150 M198 0 L198 150 M330 0 L330 150"/></g>`);
        B.push(`<g class="f3"><rect x="40" y="8" width="110" height="10" rx="4" fill="#fffbe0" opacity=".95"/><rect x="250" y="8" width="110" height="10" rx="4" fill="#fffbe0" opacity=".95"/><rect x="146" y="46" width="110" height="10" rx="4" fill="#fffbe0" opacity=".85"/></g>`);
        B.push(`<rect x="160" y="92" width="80" height="58" fill="#6a5a2a" stroke="#4a3c16" stroke-width="3"/><circle cx="200" cy="122" r="5" fill="#4a3c16"/>`);
        B.push(`<path d="M0 150 L400 150 L400 240 L0 240 Z" fill="#8a7a3a"/>`);
        B.push(`<g fill="#7a6a2e">${rndStars(26, '#7a6a2e', .8)}</g>`);
        break;
      case 6: B.push(sky('#050514', '#14082e'));
        B.push(rndStars(40, '#ffffff', .9));
        B.push(`<g class="f2"><ellipse cx="90" cy="60" rx="70" ry="24" fill="#b45cff" opacity=".18"/><ellipse cx="300" cy="160" rx="80" ry="26" fill="#ff6ac8" opacity=".14"/></g>`);
        B.push(`<g><circle cx="320" cy="60" r="30" fill="#3a86c8" stroke="#1a4a80" stroke-width="3"/><path d="M290 60 C300 52 340 52 350 60 C340 68 300 68 290 60 Z" fill="#d8b45a" opacity=".9" transform="rotate(-14 320 60)"/><circle cx="310" cy="52" r="6" fill="#7ac8ff" opacity=".6"/></g>`);
        B.push(`<g class="f1"><circle cx="70" cy="180" r="16" fill="#c86a8a" stroke="#8a3a5a" stroke-width="2.6"/></g>`);
        B.push(`<path d="M120 40 L150 56 L144 58 L156 72" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>`);
        break;
      case 7: B.push(sky('#a8d8f0', '#e8f7ff'));
        B.push(`<g fill="#ffffff"><path d="M0 180 L70 70 L140 180 Z" stroke="#c8e4f2" stroke-width="3"/><path d="M100 180 L180 40 L260 180 Z" stroke="#c8e4f2" stroke-width="3"/><path d="M220 180 L290 80 L360 180 Z" stroke="#c8e4f2" stroke-width="3"/></g>`);
        B.push(`<g fill="#f8fdff"><path d="M46 84 L70 70 L94 84 Q70 96 46 84 Z"/><path d="M156 54 L180 40 L204 54 Q180 68 156 54 Z"/><path d="M266 94 L290 80 L314 94 Q290 106 266 94 Z"/></g>`);
        B.push(`<path d="M0 180 L400 180 L400 240 L0 240 Z" fill="#dceefc"/>`);
        B.push(`<g class="f1" fill="#ffffff" opacity=".95"><circle cx="60" cy="52" r="3"/><circle cx="150" cy="30" r="2.4"/><circle cx="250" cy="58" r="3"/><circle cx="340" cy="34" r="2.4"/><circle cx="200" cy="90" r="2"/><circle cx="320" cy="100" r="2.6"/></g>`);
        break;
      case 8: B.push(sky('#7ae0ff', '#d0fff0'));
        B.push(`<circle cx="60" cy="44" r="20" fill="#ffe95c" stroke="#f4c80a" stroke-width="3.4"/>`);
        B.push(`<path d="M0 150 Q200 130 400 150 L400 240 L0 240 Z" fill="#2ab5c8"/>`);
        B.push(`<g class="f1" stroke="#bfeff5" stroke-width="2.4" fill="none" opacity=".8"><path d="M40 168 Q60 162 80 168 M140 180 Q160 174 180 180 M260 166 Q280 160 300 166 M330 186 Q350 180 370 186"/></g>`);
        B.push(`<path d="M0 200 Q200 180 400 200 L400 240 L0 240 Z" fill="#eeda9a"/>`);
        B.push(`<g class="f2"><path d="M310 200 C308 160 316 130 330 116" stroke="#8a5a2a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M330 116 C310 108 296 112 288 124 C304 118 318 120 330 116 C348 106 364 110 372 122 C356 114 342 116 330 116 C334 132 330 146 320 154 Z" fill="#3fae3f" stroke="#1d6a1d" stroke-width="2.6"/></g>`);
        break;
      default: B.push(sky('#ffd9ec', '#bfe8ff'));
        B.push(`<g class="f2" fill="#ffffff" opacity=".95"><ellipse cx="70" cy="60" rx="44" ry="16"/><ellipse cx="104" cy="52" rx="30" ry="13"/><ellipse cx="300" cy="90" rx="52" ry="17"/><ellipse cx="336" cy="82" rx="32" ry="13"/></g>`);
        B.push(`<g class="f1"><ellipse cx="120" cy="170" rx="52" ry="16" fill="#8a6a4a"/><path d="M70 168 Q120 128 170 168 Z" fill="#58a844" stroke="#3a7a2a" stroke-width="3"/><rect x="108" y="104" width="24" height="40" fill="#d8c8a8" stroke="#8a7a5a" stroke-width="3"/><path d="M104 106 L120 84 L136 106 Z" fill="#c85a5a" stroke="#8a3a3a" stroke-width="3"/></g>`);
        B.push(`<g class="f3"><ellipse cx="300" cy="180" rx="40" ry="12" fill="#8a6a4a"/><path d="M262 178 Q300 148 338 178 Z" fill="#7cc25e" stroke="#3a7a2a" stroke-width="3"/></g>`);
        B.push(`<g stroke="#f0a86a" stroke-width="3" fill="none" opacity=".8"><path d="M40 130 Q120 70 200 130"/></g>`);
        break;
    }
    return `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">${B.join('')}</svg>`;
  }
  function biome(i) { return biomeSvg(i); }

  // ================= ДРОН =================
  function drone(size) {
    const u = uid();
    return `<svg viewBox="0 0 100 80" width="${size || 58}" height="${(size || 58) * 0.8}">
      <defs><linearGradient id="${u}db" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8d4e0"/><stop offset="1" stop-color="#7a8a9a"/></linearGradient></defs>
      <rect x="30" y="18" width="40" height="18" rx="9" fill="url(#${u}db)" stroke="#3a4450" stroke-width="3"/>
      <circle cx="50" cy="27" r="4" fill="#40c4ff" stroke="#0a4a5a" stroke-width="2"/>
      <path d="M32 22 L14 12 M68 22 L86 12" stroke="#3a4450" stroke-width="4" stroke-linecap="round"/>
      <g class="droneHelix"><ellipse cx="14" cy="10" rx="14" ry="3.4" fill="#9adcff" stroke="#3a4450" stroke-width="2"/></g>
      <g class="droneHelix"><ellipse cx="86" cy="10" rx="14" ry="3.4" fill="#9adcff" stroke="#3a4450" stroke-width="2"/></g>
      <path d="M44 36 L44 46 M56 36 L56 46" stroke="#3a4450" stroke-width="3"/>
      <rect x="36" y="46" width="28" height="22" rx="4" fill="#e05a5a" stroke="#7a1a1a" stroke-width="3"/>
      <rect x="33" y="42" width="34" height="8" rx="3" fill="#ffd23f" stroke="#8a6a10" stroke-width="2.6"/>
      <rect x="47" y="42" width="6" height="26" fill="#ffd23f" stroke="#8a6a10" stroke-width="2"/>
      <path d="M50 42 C44 42 41 38 43 35.6 C45 33.6 48.6 36 50 42 C51.4 36 55 33.6 57 35.6 C59 38 56 42 50 42 Z" fill="#ffd23f" stroke="#8a6a10" stroke-width="2"/>
    </svg>`;
  }

  // ================= КОЛЕСО ФОРТУНЫ =================
  function wheelSvg() {
    const cx = 100, cy = 100, R = 92;
    const colors = ['#c83a3a', '#2f9c8a', '#7c5fc2', '#b3822e', '#c85a2a', '#2a7ac8', '#63a032', '#a83a8a'];
    let s = '';
    for (let k = 0; k < 8; k++) {
      const a1 = (k * 45 - 90) * Math.PI / 180, a2 = ((k + 1) * 45 - 90) * Math.PI / 180;
      const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
      const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
      const am = (k * 45 + 22.5 - 90) * Math.PI / 180;
      const ix = cx + 62 * Math.cos(am), iy = cy + 62 * Math.sin(am);
      let glyph = '';
      const g = (inner) => `<g transform="translate(${ix} ${iy})">${inner}</g>`;
      switch (k) {
        case 0: glyph = g(`<circle r="11" fill="#ffd23f" stroke="#8a5a10" stroke-width="2.4"/><circle r="6" fill="none" stroke="#b87a10" stroke-width="1.8"/>`); break;
        case 1: glyph = g(`<path d="M0 -10 L8 -3 L5 9 L-5 9 L-8 -3 Z" fill="#4de1c1" stroke="#0a5a4a" stroke-width="2.2" transform="scale(.9)"/>`); break;
        case 2: glyph = g(`<path d="M0 -12 L4 -6 L3.4 6 L-3.4 6 L-4 -6 Z" fill="#c8d4e0" stroke="#3a4450" stroke-width="2"/><rect x="-5.4" y="6" width="10.8" height="3" rx="1.4" fill="#8a6a3a"/>`); break;
        case 3: glyph = g(`<circle cx="-4" cy="0" r="7" fill="#ffd23f" stroke="#8a5a10" stroke-width="2"/><circle cx="5" cy="0" r="7" fill="#ffb347" stroke="#8a5a10" stroke-width="2"/>`); break;
        case 4: glyph = g(`<path d="M2 -11 L-6 2 L-1 2 L-2 11 L6 -2 L1 -2 Z" fill="#ffd23f" stroke="#8a6a10" stroke-width="1.8"/>`); break;
        case 5: glyph = g(`<path d="M0 -10 L8 -3 L5 9 L-5 9 L-8 -3 Z" fill="#4de1c1" stroke="#0a5a4a" stroke-width="2.2" transform="scale(1.1)"/>`); break;
        case 6: glyph = g(`<circle cx="-4.4" cy="0" r="6.4" fill="#7ed957" stroke="#2a5216" stroke-width="2"/><circle cx="4.4" cy="0" r="6.4" fill="#7ed957" stroke="#2a5216" stroke-width="2"/>`); break;
        default: glyph = g(`<circle r="12" fill="#ffd23f" stroke="#8a5a10" stroke-width="2.6"/><path d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z" fill="#8a5a10"/>`);
      }
      s += `<path d="M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${colors[k]}" stroke="#3a2416" stroke-width="3"/>${glyph}`;
    }
    return `<svg id="wheelSvg" viewBox="0 0 200 200">
      <circle cx="${cx}" cy="${cy}" r="${R + 7}" fill="#3a2416" stroke="#8a6134" stroke-width="5"/>
      ${s}
      <circle cx="${cx}" cy="${cy}" r="17" fill="#ffd23f" stroke="#8a5a10" stroke-width="4"/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="#8a5a10"/>
    </svg>`;
  }

  return {
    weapon, matOf, rarOf,
    monster, hero, pet,
    icon, biome, drone, wheelSvg,
    MATS, RARS
  };
})();
