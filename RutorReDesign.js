// ==UserScript==
// @name         Rutor Dark Theme Enhanced
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  «Кинозал» для rutor: группировка по дням, типы раздач и фильтры, плашки качества, постер при наведении
// @author       You
// @match        *://*.rutor.info/*
// @match        *://*.rutor.is/*
// @match        *://rutor.info/*
// @match        *://rutor.is/*
// @match        *://*.cdnbunny.org/*
// @match        *://alt.rutor.info/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

/*
 * Настройки хранятся в том же ключе, что и в 1.5 (rutorSettings), плюс поле rx:
 *   rx.hiddenTypes — скрытые типы (movie, series, game, music, sport, soft, books, other)
 *   rx.foreignOnly — прятать отечественные фильмы и сериалы
 *   rx.posters     — постер при наведении на название
 * При первом запуске rx заполняется из старых hiddenCategories.
 */
(function () {
    'use strict';

    // ------------------------------------------------------------------ настройки
    const stored = GM_getValue('rutorSettings', {}) || {};
    const settings = Object.assign({ hiddenCategories: [], highlightCurrentYear: true, highlightPreviousYear: true }, stored);
    if (!settings.rx) {
        const hc = settings.hiddenCategories || [];
        const map = { music: 'music', soft: 'soft', sport: 'sport', books: 'books', other: 'other', tv: 'other', humor: 'other', household: 'other', games: 'game' };
        settings.rx = {
            hiddenTypes: [...new Set(hc.map(c => map[c]).filter(Boolean))],
            foreignOnly: hc.includes('russian_movies') && hc.includes('russian_series'),
            posters: true,
        };
    }
    const save = () => GM_setValue('rutorSettings', settings);

    const YEAR = new Date().getFullYear();
    const TYPES = [
        ['movie', 'Фильмы', '🎬'], ['series', 'Сериалы', '📺'], ['game', 'Игры', '🎮'], ['music', 'Музыка', '🎵'],
        ['sport', 'Спорт', '⚽'], ['soft', 'Софт', '💾'], ['books', 'Книги', '📚'], ['other', 'Другое', '✦'],
    ];
    const TYPE = Object.fromEntries(TYPES.map(([id, name, icon]) => [id, { name, icon }]));

    // ------------------------------------------------------------------ стили
    GM_addStyle(`
    :root {
        --bg: #0d0c0a; --s1: #15130f; --s2: #1c1914; --s3: #25211a;
        --line: rgba(255,236,200,.08); --line2: rgba(255,236,200,.14);
        --text: #ece6da; --muted: #9b9384; --faint: #6b6458;
        --amber: #f5b942; --amber2: #ff8a3d; --teal: #4fd1c5; --green: #74dc8c; --red: #ff6b6b;
        --display: "Bahnschrift", "Bahnschrift SemiCondensed", "Arial Narrow", "Segoe UI", sans-serif;
        --font: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;
        --mono: "Cascadia Mono", "Consolas", ui-monospace, monospace;
        color-scheme: dark;
    }
    html, body { background: var(--bg) !important; }
    body {
        color: var(--text) !important; font: 14px/1.5 var(--font) !important; margin: 0 !important;
        -webkit-font-smoothing: antialiased;
    }
    body::before {                      /* зерно плёнки + тёплый свет сверху */
        content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
        background:
            radial-gradient(1200px 380px at 50% -120px, rgba(245,185,66,.16), transparent 70%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .9 0 0 0 0 .75 0 0 0 .035 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
            var(--bg);
    }
    #all, #ws, #content, #index, #up, #menu, #down, center, table, tr, td, th, tbody { background: transparent !important; color: inherit; }
    #all, #ws { max-width: 1320px !important; width: auto !important; margin: 0 auto !important; padding: 0 28px !important; box-sizing: border-box; position: static !important; }
    #ws { display: block !important; padding-bottom: 80px !important; }
    #content { position: static !important; left: auto !important; top: auto !important; width: auto !important; margin: 0 !important; padding: 0 !important; float: none !important; }
    #sidebar, #news_table, #logo, #up > *:not(.rx-head), #movie_video:empty { display: none !important; }
    #up { height: auto !important; padding: 0 !important; }
    a, a:visited { color: var(--text) !important; text-decoration: none !important; }
    a:hover { color: var(--amber) !important; }
    ::selection { background: rgba(245,185,66,.35); }
    ::-webkit-scrollbar { width: 10px; } ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: #2c271f; border-radius: 10px; border: 2px solid var(--bg); }

    /* шапка */
    .rx-head {
        position: sticky; top: 0; z-index: 100; display: flex !important; align-items: center; gap: 26px;
        margin: 0 -28px 18px; padding: 14px 28px; background: rgba(13,12,10,.82); backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--line);
    }
    .rx-brand { font: 700 24px/1 var(--display); letter-spacing: .14em; color: var(--text) !important; display: flex; align-items: center; gap: 8px; }
    .rx-brand i { width: 9px; height: 9px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 14px var(--amber); }
    .rx-nav { display: flex; gap: 4px; flex-wrap: wrap; }
    .rx-nav a {
        font: 600 13px var(--display); letter-spacing: .08em; text-transform: uppercase; color: var(--muted) !important;
        padding: 7px 11px; border-radius: 8px; position: relative;
    }
    .rx-nav a:hover { color: var(--text) !important; background: var(--s2); }
    .rx-nav a.on { color: var(--amber) !important; }
    .rx-nav a.on::after { content: ""; position: absolute; left: 11px; right: 11px; bottom: 2px; height: 2px; background: var(--amber); border-radius: 2px; }
    .rx-search { margin-left: auto; display: flex; align-items: center; background: var(--s1); border: 1px solid var(--line2); border-radius: 999px; padding: 0 6px 0 14px; height: 38px; min-width: 300px; transition: border-color .15s, box-shadow .15s; }
    .rx-search:focus-within { border-color: var(--amber); box-shadow: 0 0 0 3px rgba(245,185,66,.15); }
    .rx-search input { flex: 1; background: transparent !important; border: 0 !important; outline: 0 !important; color: var(--text) !important; font: 14px var(--font) !important; padding: 0 !important; }
    .rx-search button { width: 28px; height: 28px; border-radius: 50%; border: 0; background: var(--amber); color: #1a1408; cursor: pointer; font-weight: 900; }
    #menu { display: none !important; }

    /* старые заголовки разделов */
    #index > h2, #content h2 { font: 700 13px var(--display) !important; letter-spacing: .16em; text-transform: uppercase; color: var(--muted) !important; margin: 26px 0 10px !important; background: none !important; border: 0 !important; padding: 0 !important; }
    #index > h2 a, #content h2 a { color: var(--muted) !important; }
    #index > h2 a:hover { color: var(--amber) !important; }

    /* ---------------- панель фильтров */
    .rx-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 6px 0 4px; }
    .rx-chip {
        display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 12px; border-radius: 999px;
        border: 1px solid var(--line2); background: var(--s1); color: var(--text); cursor: pointer;
        font: 600 13px var(--font); transition: all .15s; user-select: none;
    }
    .rx-chip b { font: 600 11px var(--mono); color: var(--muted); }
    .rx-chip:hover { border-color: rgba(245,185,66,.5); }
    .rx-chip.off { opacity: .45; background: transparent; text-decoration: line-through; text-decoration-color: rgba(255,255,255,.3); }
    .rx-chip.toggle.on { background: rgba(245,185,66,.14); border-color: rgba(245,185,66,.55); color: var(--amber); }
    .rx-sep { width: 1px; height: 22px; background: var(--line2); margin: 0 4px; }
    .rx-count { margin-left: auto; color: var(--faint); font: 12px var(--mono); }

    /* ---------------- список */
    .rx-list { margin: 6px 0 22px; }
    .rx-day {
        position: sticky; top: 67px; z-index: 5; display: flex; align-items: baseline; gap: 12px;
        padding: 16px 2px 8px; background: linear-gradient(var(--bg) 70%, transparent);
    }
    .rx-day h3 { margin: 0; font: 700 22px/1 var(--display); letter-spacing: .04em; color: var(--text); }
    .rx-day span { font: 12px var(--mono); color: var(--faint); }
    .rx-row {
        display: grid; grid-template-columns: 46px minmax(0,1fr) 96px 150px 84px; align-items: center; gap: 14px;
        padding: 10px 14px 10px 10px; border-radius: 12px; position: relative; transition: background .12s;
        border-left: 3px solid transparent;
    }
    .rx-row + .rx-row { margin-top: 2px; }
    .rx-row:hover { background: var(--s1); }
    .rx-row.y0 { border-left-color: var(--amber); background: linear-gradient(90deg, rgba(245,185,66,.07), transparent 40%); }
    .rx-row.y1 { border-left-color: rgba(79,209,197,.7); background: linear-gradient(90deg, rgba(79,209,197,.05), transparent 40%); }
    .rx-row.y0:hover, .rx-row.y1:hover { background-color: var(--s1); }
    .rx-row.hid { display: none; }
    .rx-type {
        width: 40px; height: 40px; border-radius: 11px; display: grid; place-items: center; font-size: 18px;
        background: var(--s2); border: 1px solid var(--line);
    }
    .rx-main { min-width: 0; }
    .rx-title { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
    .rx-title a { font: 600 15.5px/1.3 var(--font); color: var(--text) !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rx-title a:hover { color: var(--amber) !important; }
    .rx-year { font: 600 12px var(--mono); color: var(--muted); flex: none; }
    .rx-row.y0 .rx-year { color: var(--amber); } .rx-row.y1 .rx-year { color: var(--teal); }
    .rx-alt { color: var(--faint); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rx-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px; align-items: center; }
    .rx-tag { font: 700 10.5px/1 var(--mono); letter-spacing: .03em; padding: 4px 6px; border-radius: 5px; background: var(--s3); color: #cfc6b4; border: 1px solid var(--line); }
    .rx-tag.res { color: #1a1408; background: var(--amber); border-color: transparent; }
    .rx-tag.uhd { color: #1a1408; background: linear-gradient(135deg, var(--amber), var(--amber2)); border-color: transparent; }
    .rx-tag.hdr { color: #fff; background: linear-gradient(135deg, #7b5cff, #ff4fa0); border-color: transparent; }
    .rx-tag.src { color: var(--teal); background: rgba(79,209,197,.08); border-color: rgba(79,209,197,.25); }
    .rx-tag.cam { color: #fff; background: var(--red); border-color: transparent; }
    .rx-tag.vo  { color: var(--text); }
    .rx-by { font-size: 12px; color: var(--faint); margin-left: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rx-com { font: 12px var(--mono); color: var(--muted); margin-left: 4px; }
    .rx-size { font: 600 13px var(--mono); text-align: right; color: var(--text); white-space: nowrap; }
    .rx-peers { display: flex; flex-direction: column; gap: 5px; }
    .rx-peers .n { display: flex; justify-content: space-between; font: 600 12px var(--mono); }
    .rx-peers .s { color: var(--green); } .rx-peers .l { color: var(--red); }
    .rx-peers .bar { height: 4px; border-radius: 4px; background: rgba(255,107,107,.35); overflow: hidden; }
    .rx-peers .bar i { display: block; height: 100%; background: var(--green); border-radius: 4px; }
    .rx-peers.dead .n, .rx-peers.dead .s, .rx-peers.dead .l { color: var(--faint); } .rx-peers.dead .bar { background: var(--s3); }
    .rx-act { display: flex; gap: 6px; justify-content: flex-end; }
    .rx-act a {
        width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: var(--s2);
        border: 1px solid var(--line2); color: var(--muted) !important; transition: all .12s;
    }
    .rx-act a:hover { color: #1a1408 !important; background: var(--amber); border-color: transparent; }
    .rx-act svg { width: 16px; height: 16px; }
    .rx-empty { padding: 30px; text-align: center; color: var(--faint); border: 1px dashed var(--line2); border-radius: 14px; }
    table.rx-src { display: none !important; }

    /* постер при наведении */
    .rx-poster {
        position: fixed; z-index: 1000; width: 220px; pointer-events: none; opacity: 0; transform: translateY(6px) scale(.98);
        transition: opacity .15s, transform .15s; border-radius: 14px; overflow: hidden; background: var(--s2);
        box-shadow: 0 24px 60px rgba(0,0,0,.6), 0 0 0 1px var(--line2);
    }
    .rx-poster.show { opacity: 1; transform: none; }
    .rx-poster img { display: block; width: 100%; height: auto; max-height: 330px; object-fit: cover; }
    .rx-poster .ph { height: 120px; display: grid; place-items: center; color: var(--faint); font: 12px var(--mono); }

    /* ---------------- страница раздачи */
    #download { display: flex !important; align-items: center; gap: 10px; flex-wrap: wrap; margin: 8px 0 18px !important; background: transparent !important; border: 0 !important; padding: 0 !important; }
    #download a[href^="magnet"]::after { content: "Magnet"; }
    #download img { display: none !important; }
    #download a:not(.d_small) {
        display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 12px;
        font: 700 15px var(--display) !important; letter-spacing: .06em; text-transform: uppercase;
    }
    #download a[href^="magnet"] { background: var(--amber) !important; color: #1a1408 !important; box-shadow: 0 8px 24px rgba(245,185,66,.25); }
    #download a[href^="magnet"]::before { content: "🧲"; }
    #download a[href*="/download/"] { background: var(--s2) !important; border: 1px solid var(--line2); color: var(--text) !important; }
    #download a[href*="/download/"]::before { content: "⤓"; font-size: 18px; }
    #download a.d_small { color: var(--faint) !important; font-size: 12px; }
    #download br { display: none; }
    #content h1, #all h1 { font: 700 30px/1.2 var(--display) !important; letter-spacing: .01em; color: var(--text) !important; margin: 6px 0 10px !important; }
    table#details { width: 100% !important; border-collapse: separate !important; border-spacing: 0 !important; background: var(--s1) !important; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; }
    table#details > tbody > tr > td { padding: 10px 16px !important; border: 0 !important; border-bottom: 1px solid var(--line) !important; vertical-align: top; }
    table#details td.header { width: 170px; color: var(--muted) !important; font: 600 12px var(--display) !important; letter-spacing: .1em; text-transform: uppercase; }
    table#details > tbody > tr:first-child > td { padding: 22px !important; font-size: 15px; line-height: 1.65; }
    table#details img { max-width: 100%; height: auto; border-radius: 10px; }
    table#details .hidewrap, table#details .hidehead { background: var(--s2) !important; border-radius: 10px; }
    table#details .hidehead { padding: 9px 14px !important; cursor: pointer; font-weight: 600; color: var(--text) !important; }
    table#details .hidebody { padding: 12px 14px !important; }
    #files_list, #files_list td { font: 12.5px var(--mono) !important; }
    #comments, .c_t, .c_h { background: transparent !important; }
    .c_h { color: var(--muted) !important; font-size: 12px; border-bottom: 1px solid var(--line) !important; }

    /* страница поиска и прочие формы */
    input[type="text"], input[type="search"], select, textarea {
        background: var(--s1) !important; color: var(--text) !important; border: 1px solid var(--line2) !important;
        border-radius: 10px !important; padding: 7px 11px !important; font: 14px var(--font) !important; outline: none !important;
    }
    input[type="submit"], input[type="button"], button:not(.rx-chip):not([class^="rx"]) {
        background: var(--amber) !important; color: #1a1408 !important; border: 0 !important; border-radius: 10px !important;
        padding: 8px 16px !important; font: 700 13px var(--display) !important; letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
    }
    #down, #down * { color: var(--faint) !important; font-size: 12px; }
    `);

    // ------------------------------------------------------------------ утилиты
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const ICON = {
        magnet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 3v8a6 6 0 0 0 12 0V3"/><path d="M6 7h4M14 7h4"/></svg>',
        down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M6 11l6 6 6-6M4 21h16"/></svg>',
    };

    // ---------------- разбор заголовка раздачи
    const classify = t => {
        if (/\bPC\b|\(PC\)|\bRePack\b.*\sот\s|\bGOG\b|Steam-Rip|\[P\]\s*\[|Early Access|\bPS[345]\b|\bXbox\b|\bSwitch\b/.test(t)) return 'game';
        if (/(М[РP]|[МM]Р)3|аудиокниг/i.test(t)) return 'books';   // «МР3» русскими буквами — аудиокниги
        if (/\b(MP3|FLAC|AAC|ALAC|OGG|WavPack|APE|Hi-?Res|lossless)\b|Дискография|Discography|^VA\s*[-–]/i.test(t)) return 'music';
        if (/футбол|хоккей|баскетбол|теннис|бокс|\bUFC\b|\bWWE\b|\bAEW\b|\bNBA\b|\bNHL\b|КХЛ|\bMMA\b|Формула[- ]1|Formula 1|Чемпионат|Обзор тура|Лига чемпионов|Премьер-лига|\d+-й тур|Олимпи/i.test(t)) return 'sport';
        if (/аудиокниг|\b(FB2|EPUB|PDF|DJVU|MOBI)\b|читает\s|Читает|\[Журнал/i.test(t)) return 'books';
        if (/\[S\d+|\bS\d{1,2}E\d|сезон|\[\d+\s*(из|-)\s*\d+|серии?\s*\d|\(\d+-\d+ из \d+\)|\[\d+x\d+|эпизод/i.test(t)) return 'series';
        if (/\b(x64|x86|Win(dows)?\s?\d|macOS|Linux|Android|iOS)\b|\bPortable\b|\bRePack by\b|Multi\/Ru|\bv?\d+\.\d+\.\d+(\.\d+)?\b(?!.*(BDRip|WEB|HDRip))/i.test(t)) return 'soft';
        if (/(BD|HD|WEB|DVD|TV|SAT|CAM|TS)[-]?(Rip|DL|Remux|\b)|Remux|\b(1080|2160|720|480)[pрi](?![\wа-я])|\b4K\b|BDRemux|HDTV/i.test(t)) return 'movie';
        return 'other';
    };
    const parseTitle = full => {
        const ym = full.match(/\((\d{4})(?:[-–]\d{4})?\)/);
        const year = ym ? +ym[1] : null;
        let head = ym ? full.slice(0, ym.index).trim() : full.split('|')[0].trim();
        let tail = ym ? full.slice(ym.index + ym[0].length).trim() : full.slice(head.length).trim();
        let season = '';
        const sm = head.match(/\s*\[(S\d+[^\]]*|\d+\s*(?:из|-)\s*\d+[^\]]*)\]\s*/i);
        if (sm) { season = sm[1]; head = (head.slice(0, sm.index) + ' ' + head.slice(sm.index + sm[0].length)).trim(); }
        const parts = head.split(/\s+\/\s+/);
        const name = parts[0];
        const alt = parts.slice(1).join(' / ');
        const by = (tail.match(/(?:^|\s)от\s+([^|]+?)(?:\s*\||$)/) || [])[1] || '';
        const tags = [];
        const add = (txt, cls) => { if (!tags.some(t => t[0] === txt)) tags.push([txt, cls]); };
        if (season) add(season.replace(/\s+/g, ' '), '');
        if (/\b(2160[pр]|4K|UHD)(?![\wа-я])/i.test(full)) add('2160p', 'uhd');
        else if (/\b1080[pрi](?![\wа-я])/i.test(full)) add('1080p', 'res');
        else if (/\b720[pр](?![\wа-я])/i.test(full)) add('720p', 'res');
        if (/\bDV\b|Dolby Vision/i.test(full)) add('DV', 'hdr');
        if (/\bHDR(10\+?)?\b/i.test(full)) add('HDR', 'hdr');
        const src = full.match(/\b(BDRemux|Remux|BDRip|WEB-DLRip|WEB-DL|WEBRip|HDRip|HDTVRip|HDTV|DVDRip|SATRip|TVRip)\b/i);
        if (src) add(src[1], 'src');
        if (/\b(CAMRip|CAM|TS|TeleSync|HDTS|Звук с TS)\b/.test(full)) add('экранка', 'cam');
        if (/\b(HEVC|H\.?265|x265)\b/i.test(full)) add('HEVC', '');
        const vo = (full.match(/\|\s*([^|]+)$/) || [])[1];
        if (vo && vo.length < 40 && !/от\s/.test(vo)) vo.split(/[,\s]+/).filter(x => /^[A-ZА-Я]{1,4}$/.test(x)).slice(0, 4).forEach(x => add(x, 'vo'));
        return { name, alt, year, by, tags };
    };
    const isForeign = (p, type) => {
        if (type !== 'movie' && type !== 'series') return true;
        return !!p.alt && /[A-Za-z]/.test(p.alt) || (/^[^А-Яа-яЁё]+$/.test(p.name) && /[A-Za-z]/.test(p.name));
    };

    // ---------------- даты
    const MON = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const fmt = d => `${d.getDate()} ${MON[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    const dayLabel = s => {
        const now = new Date(), y = new Date(now); y.setDate(now.getDate() - 1);
        const norm = s.replace(/ /g, ' ').trim();
        if (norm === fmt(now)) return 'Сегодня';
        if (norm === fmt(y)) return 'Вчера';
        return norm;
    };

    // ---------------- постер при наведении
    const posterCache = new Map();
    let posterEl, posterTimer, posterFor;
    const getPoster = async href => {
        if (posterCache.has(href)) return posterCache.get(href);
        const p = (async () => {
            try {
                const r = await fetch(href, { credentials: 'include' });
                const buf = await r.arrayBuffer();
                const cs = ((r.headers.get('content-type') || '').match(/charset=([\w-]+)/i) || [])[1] || 'utf-8';
                const doc = new DOMParser().parseFromString(new TextDecoder(cs).decode(buf), 'text/html');
                const img = $$('#details tr:first-child img', doc).find(i => {
                    const s = i.getAttribute('src') || '';
                    return /^https?:/.test(s) && !/(smiles|\/s\/|icon|\.gif$)/i.test(s);
                });
                return img ? img.getAttribute('src') : null;
            } catch (e) { return null; }
        })();
        posterCache.set(href, p);
        return p;
    };
    const showPoster = async (a, ev) => {
        if (!settings.rx.posters) return;
        posterFor = a;
        if (!posterEl) { posterEl = el('div', 'rx-poster'); document.body.appendChild(posterEl); }
        const place = e => {
            const w = 220, x = Math.min(e.clientX + 24, innerWidth - w - 12), y = Math.min(Math.max(e.clientY - 120, 12), innerHeight - 340);
            posterEl.style.left = x + 'px'; posterEl.style.top = y + 'px';
        };
        place(ev);
        a.onmousemove = place;
        posterEl.innerHTML = '<div class="ph">загружаю постер…</div>';
        posterEl.classList.add('show');
        const src = await getPoster(a.href);
        if (posterFor !== a) return;
        posterEl.innerHTML = src ? `<img src="${esc(src)}" referrerpolicy="no-referrer">` : '<div class="ph">постера нет</div>';
    };
    const hidePoster = () => { clearTimeout(posterTimer); posterFor = null; if (posterEl) posterEl.classList.remove('show'); };

    // ---------------- сборка списков
    const allRows = [];
    const buildRow = tr => {
        const tds = tr.children;
        if (tds.length < 4) return null;
        const link = $('a[href^="/torrent/"]', tr);
        if (!link) return null;
        const full = link.textContent.trim();
        const date = tds[0].textContent.trim();
        const size = tds[tds.length - 2].textContent.trim();
        const seeds = +(($('span.green', tr) || {}).textContent || '0').trim() || 0;
        const leech = +(($('span.red', tr) || {}).textContent || '0').trim() || 0;
        const com = tds.length >= 5 ? tds[2].textContent.trim() : '';
        const magnet = $('a[href^="magnet:"]', tr);
        const dl = $('a.downgif, a[href*="/download/"]', tr);
        const type = classify(full);
        const p = parseTitle(full);
        const row = el('div', 'rx-row');
        if (p.year === YEAR && settings.highlightCurrentYear !== false) row.classList.add('y0');
        else if (p.year === YEAR - 1 && settings.highlightPreviousYear !== false) row.classList.add('y1');
        const total = seeds + leech;
        row.innerHTML = `
            <div class="rx-type" title="${TYPE[type].name}">${TYPE[type].icon}</div>
            <div class="rx-main">
              <div class="rx-title"><a href="${esc(link.getAttribute('href'))}" title="${esc(full)}">${esc(p.name)}</a>${p.year ? `<span class="rx-year">${p.year}</span>` : ''}</div>
              ${p.alt ? `<div class="rx-alt">${esc(p.alt)}</div>` : ''}
              <div class="rx-tags">${p.tags.map(([t, c]) => `<span class="rx-tag ${c}">${esc(t)}</span>`).join('')}${p.by ? `<span class="rx-by">от ${esc(p.by)}</span>` : ''}${com && com !== '0' ? `<span class="rx-com">💬 ${esc(com)}</span>` : ''}</div>
            </div>
            <div class="rx-size">${esc(size)}</div>
            <div class="rx-peers${seeds ? '' : ' dead'}"><div class="n"><span class="s">▲ ${seeds}</span><span class="l">${leech} ▼</span></div><div class="bar"><i style="width:${total ? Math.round(seeds / total * 100) : 0}%"></i></div></div>
            <div class="rx-act">${magnet ? `<a href="${esc(magnet.getAttribute('href'))}" title="Magnet">${ICON.magnet}</a>` : ''}${dl ? `<a href="${esc(dl.getAttribute('href'))}" title="Скачать .torrent">${ICON.down}</a>` : ''}</div>`;
        const a = $('.rx-title a', row);
        a.addEventListener('mouseenter', e => { clearTimeout(posterTimer); posterTimer = setTimeout(() => showPoster(a, e), 350); });
        a.addEventListener('mouseleave', hidePoster);
        const rec = { row, type, foreign: isForeign(p, type), date };
        allRows.push(rec);
        return rec;
    };

    const buildTable = table => {
        const trs = $$('tr', table).filter(tr => $('a[href^="/torrent/"]', tr));
        if (!trs.length) return;
        const list = el('div', 'rx-list');
        let curDay = null;
        for (const tr of trs) {
            const rec = buildRow(tr);
            if (!rec) continue;
            if (rec.date !== curDay) {
                curDay = rec.date;
                const label = dayLabel(rec.date);
                list.append(el('div', 'rx-day', `<h3>${esc(label)}</h3>${label !== rec.date ? `<span>${esc(rec.date)}</span>` : ''}`));
            }
            list.append(rec.row);
        }
        table.classList.add('rx-src');
        table.after(list);
    };

    // ---------------- фильтры
    let countEl;
    const applyFilters = () => {
        const hidden = new Set(settings.rx.hiddenTypes);
        let shown = 0;
        for (const r of allRows) {
            const hide = hidden.has(r.type) || (settings.rx.foreignOnly && !r.foreign);
            r.row.classList.toggle('hid', hide);
            if (!hide) shown++;
        }
        // пустые дни прячем
        for (const d of $$('.rx-day')) {
            let n = d.nextElementSibling, any = false;
            while (n && !n.classList.contains('rx-day')) { if (!n.classList.contains('hid')) { any = true; break; } n = n.nextElementSibling; }
            d.style.display = any ? '' : 'none';
        }
        if (countEl) countEl.textContent = `${shown} из ${allRows.length}`;
        $$('.rx-chip[data-type]').forEach(c => c.classList.toggle('off', hidden.has(c.dataset.type)));
    };
    const buildBar = anchor => {
        const counts = {};
        for (const r of allRows) counts[r.type] = (counts[r.type] || 0) + 1;
        const bar = el('div', 'rx-bar');
        for (const [id, name, icon] of TYPES) {
            if (!counts[id]) continue;
            const c = el('span', 'rx-chip', `${icon} ${name} <b>${counts[id]}</b>`);
            c.dataset.type = id;
            c.title = 'Показать / скрыть';
            c.addEventListener('click', () => {
                const h = new Set(settings.rx.hiddenTypes);
                h.has(id) ? h.delete(id) : h.add(id);
                settings.rx.hiddenTypes = [...h]; save(); applyFilters();
            });
            bar.append(c);
        }
        bar.append(el('span', 'rx-sep'));
        const mk = (label, get, set) => {
            const t = el('span', 'rx-chip toggle', label);
            const sync = () => t.classList.toggle('on', !!get());
            t.addEventListener('click', () => { set(!get()); save(); sync(); applyFilters(); });
            sync(); return t;
        };
        bar.append(mk('🌍 Только зарубежное', () => settings.rx.foreignOnly, v => settings.rx.foreignOnly = v));
        bar.append(mk('🖼 Постеры', () => settings.rx.posters, v => settings.rx.posters = v));
        countEl = el('span', 'rx-count');
        bar.append(countEl);
        anchor.before(bar);
    };

    // ---------------- шапка
    const buildHeader = () => {
        const up = $('#up');
        if (!up || $('.rx-head')) return;
        const head = el('div', 'rx-head');
        head.innerHTML = `<a class="rx-brand" href="/"><i></i>RUTOR</a><nav class="rx-nav"></nav>
            <form class="rx-search"><input type="search" placeholder="Поиск раздач…" autocomplete="off"><button type="submit">→</button></form>`;
        const nav = $('.rx-nav', head);
        for (const a of $$('#menu a.menu_b')) {
            const n = el('a', '', esc(a.textContent.trim()));
            n.href = a.getAttribute('href');
            const path = new URL(n.href, location.href).pathname;
            if ((path === '/' && location.pathname === '/') || (path !== '/' && location.pathname.startsWith(path))) n.classList.add('on');
            nav.append(n);
        }
        const form = $('form', head), inp = $('input', head);
        const m = decodeURIComponent(location.pathname).match(/^\/search\/(?:\d+\/\d+\/\d+\/\d+\/)?(.+)$/);
        if (m) inp.value = m[1];
        form.addEventListener('submit', e => { e.preventDefault(); const q = inp.value.trim(); if (q) location.href = '/search/' + encodeURIComponent(q); });
        up.prepend(head);
    };

    // ------------------------------------------------------------------ запуск
    const init = () => {
        if (document.documentElement.dataset.rxInit) return;
        document.documentElement.dataset.rxInit = '1';
        buildHeader();
        const tables = $$('#index table, #content > table').filter(t => $('tr.gai, tr.tum', t));
        tables.forEach(buildTable);
        if (allRows.length) {
            buildBar($('.rx-list'));
            applyFilters();
        }
        // вид «по категориям»: прячем целые разделы, как в 1.5
        const secMap = { 'Наши фильмы': 'russian_movies', 'Наши сериалы': 'russian_series', 'Научно-популярные фильмы': 'science_movies', 'Телевизор': 'tv', 'Мультипликация': 'cartoons', 'Аниме': 'anime', 'Иностранные релизы': 'foreign', 'Музыка': 'music', 'Софт': 'soft', 'Спорт и Здоровье': 'sport', 'Юмор': 'humor', 'Хозяйство и Быт': 'household', 'Книги': 'books', 'Другое': 'other' };
        for (const h of $$('#index > h2')) {
            const id = secMap[h.textContent.trim()];
            if (id && (settings.hiddenCategories || []).includes(id)) {
                h.style.display = 'none';
                let n = h.nextElementSibling;
                while (n && n.tagName !== 'H2') { n.style.display = 'none'; n = n.nextElementSibling; }
            }
        }
        // страница раздачи: короткая подпись вместо длинного имени .torrent-файла
        const dlBtn = $('#download a[href*="/download/"]');
        if (dlBtn) { dlBtn.title = dlBtn.textContent.trim(); dlBtn.textContent = '.torrent'; }
        document.addEventListener('scroll', hidePoster, { passive: true });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
