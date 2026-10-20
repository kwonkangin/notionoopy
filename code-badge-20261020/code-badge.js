// =========================================================
// code-badge.js
// 버전: 1.7.0
// 설명: 노션(Oopy) 인라인 코드를 링크/비링크 구분 없이 같은 뱃지 모양으로 통일한다.
//       사이트 공통(일괄) 설정과 뱃지별(개별) 설정을 지원한다.
// 접미사: q4m (전역 이름, CSS 변수, 클래스, data 속성 모두 공통)
// ---------------------------------------------------------
// [설정 선언] 엔진보다 먼저 또는 나중에 선언해도 된다.
//   window.ecbConfig_q4m = { style_q4m:'fill', radius_q4m:'9999px', ... };   사이트 공통
//   window.ecbItems_q4m  = { "블록ID:순번": { style_q4m:'outline', ... } };  뱃지별 개별
//   엔진이 먼저 로드된 경우 선언 뒤에 아래 한 줄을 실행한다.
//   window.__ecbApi_q4m.declare(window.ecbConfig_q4m, window.ecbItems_q4m);
//
// [우선순위] 대시보드 임시 편집 > 개별(ecbItems) > 공통(ecbConfig) > 엔진 기본값
//
// [공개 API] window.__ecbApi_q4m
//   start / destroy / rescan / reset / declare
//   setConfig / replaceConfig / getConfig
//   setItems / setItem / clearItem / getItems
//   getBadges / getOrphanKeys / highlight / pick(on, {keep})
//   dashboard  : 대시보드용 API (schema, common, scopes, restoreAll)
//
// [식별키] 블록ID:순번 (같은 블록 안에서 문서 순서). 블록 ID가 없으면 nb:글자:순번.
//   블록을 복제하거나 지우면 키가 바뀌거나 사라질 수 있다.
//
// [제외 대상] pre, code, .notion-code-block 안, 그리고 [% 로 시작하는 텍스트
// =========================================================
(function () {
  var VERSION = '1.7.0';
  var DASH_API_VERSION = '1.0.0';
  var CLS = 'ecb-badge-q4m';
  var CLS_LINK = 'ecb-link-q4m';
  var CLS_PICK = 'ecb-pick-q4m';
  var STYLE_ID = 'ecb-style-q4m';
  var PICK_STYLE_ID = 'ecb-pickstyle-q4m';
  var ATTR_COLOR = 'data-ecb-color-q4m';
  var ATTR_BG = 'data-ecb-bg-q4m';
  var ATTR_STYLE = 'data-ecb-style-q4m';
  var ATTR_UL = 'data-ecb-ul-q4m';
  var ATTR_KEY = 'data-ecb-key-q4m';
  var ATTR_PICKING = 'data-ecb-picking-q4m';
  var EVENT_CONFIG = 'ecb-config-q4m';
  var EVENT_ITEMS = 'ecb-items-q4m';
  var EVENT_PICKED = 'ecb-picked-q4m';
  var SEL = 'span[data-token-index][style*="monospace" i], a.notion-link-token[style*="monospace" i]';
  var EXCLUDE = 'pre, code, .notion-code-block';
  var VARS = ['radius', 'pady', 'padx', 'fsize', 'bw', 'bc', 'shadow', 'lop', 'bg'];

  var DEFAULTS = {
    enabled_q4m: true,
    linkEnabled_q4m: true,
    debug_q4m: false,
    style_q4m: 'fill',
    radius_q4m: '9999px',
    padY_q4m: '0.16em',
    padX_q4m: '0.52em',
    fontSize_q4m: 'inherit',
    borderWidth_q4m: '1px',
    borderColor_q4m: 'currentColor',
    borderOpacity_q4m: 100,
    shadow_q4m: 'none',
    linkUnderline_q4m: false,
    linkOpacity_q4m: 1
  };

  var ITEM_FIELDS = ['style', 'radius', 'padY', 'padX', 'fontSize', 'borderWidth',
    'borderColor', 'borderOpacity', 'shadow', 'linkUnderline', 'linkOpacity'];
  var ITEM_PLAIN = ITEM_FIELDS.concat('enabled');
  var ITEM_ALLOWED = ITEM_PLAIN.map(function (f) { return f + '_q4m'; });

  var SCHEMA = [
    { key: 'style', type: 'style', group: 'style', options: ['fill', 'outline', 'fillBorder'], def: 'fill' },
    { key: 'radius', type: 'radius', group: 'shape', min: 0, max: 30, step: 1, css: '--ecb-radius-q4m', def: '9999px' },
    { key: 'padY', type: 'em', group: 'shape', min: 0, max: 0.8, step: 0.01, css: '--ecb-pady-q4m', def: '0.16em' },
    { key: 'padX', type: 'em', group: 'shape', min: 0, max: 1.5, step: 0.01, css: '--ecb-padx-q4m', def: '0.52em' },
    { key: 'fontSize', type: 'fontsize', group: 'shape', min: 60, max: 140, step: 1, css: '--ecb-fsize-q4m', def: 'inherit' },
    { key: 'borderWidth', type: 'px', group: 'border', min: 0.5, max: 6, step: 0.5, css: '--ecb-bw-q4m', def: '1px' },
    { key: 'borderColor', type: 'bcolor', group: 'border', css: '--ecb-bc-q4m', def: 'currentColor' },
    { key: 'borderOpacity', type: 'pct', group: 'border', min: 0, max: 100, step: 1, css: '--ecb-bc-q4m', def: 100 },
    { key: 'shadow', type: 'shadow', group: 'shadow', css: '--ecb-shadow-q4m', def: 'none' },
    { key: 'linkUnderline', type: 'bool', group: 'link', linkOnly: true, def: false },
    { key: 'linkOpacity', type: 'ratio', group: 'link', linkOnly: true, min: 0, max: 1, step: 0.01, css: '--ecb-lop-q4m', def: 1 },
    { key: 'linkEnabled', type: 'bool', group: 'link', commonOnly: true, def: true },
    { key: 'enabled', type: 'bool', group: 'behavior', def: true },
    { key: 'debug', type: 'bool', group: 'behavior', commonOnly: true, def: false }
  ].map(function (f) { f.cfgKey = f.key + '_q4m'; return f; });

  [window.__ecbApi_q4m, window.__engineCodeBadge].forEach(function (old) {
    if (old && typeof old.destroy === 'function') {
      try { old.destroy(); } catch (e) {}
    }
  });

  var raw = {};
  var items = Object.create(null);
  var declaredRaw = {};
  var declaredItems = {};
  var cfg = null;
  var pending = new Set();
  var scheduled = false;
  var syncTimer = null;
  var running = false;
  var observer = null;
  var picking = false;
  var pickKeep = false;
  var ric = window.requestIdleCallback || function (fn) {
    return setTimeout(function () { fn({ timeRemaining: function () { return 8; } }); }, 50);
  };

  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  function log() {
    if ((cfg && cfg.debug) || window.__ECB_DEBUG_q4m) {
      console.log.apply(console, ['[code-badge]'].concat([].slice.call(arguments)));
    }
  }

  function safeCss(v, fb) {
    if (v === undefined || v === null) return fb;
    v = String(v).trim();
    return (v && v.length < 80 && /^[#\w\s.,%()\-+\/]+$/.test(v)) ? v : fb;
  }

  function num(v, min, max, fb) {
    v = parseFloat(v);
    if (isNaN(v)) return fb;
    return Math.min(max, Math.max(min, v));
  }

  function normalize(r) {
    var c = {};
    for (var k in DEFAULTS) c[k] = (k in r) ? r[k] : DEFAULTS[k];
    return {
      enabled: c.enabled_q4m !== false,
      linkEnabled: c.linkEnabled_q4m !== false,
      debug: !!c.debug_q4m,
      style: ['fill', 'outline', 'fillBorder'].indexOf(c.style_q4m) > -1 ? c.style_q4m : 'fill',
      radius: safeCss(c.radius_q4m, DEFAULTS.radius_q4m),
      padY: safeCss(c.padY_q4m, DEFAULTS.padY_q4m),
      padX: safeCss(c.padX_q4m, DEFAULTS.padX_q4m),
      fontSize: safeCss(c.fontSize_q4m, DEFAULTS.fontSize_q4m),
      borderWidth: safeCss(c.borderWidth_q4m, DEFAULTS.borderWidth_q4m),
      borderColor: safeCss(c.borderColor_q4m, DEFAULTS.borderColor_q4m),
      borderOpacity: num(c.borderOpacity_q4m, 0, 100, 100),
      shadow: safeCss(c.shadow_q4m, DEFAULTS.shadow_q4m),
      linkUnderline: c.linkUnderline_q4m === true,
      linkOpacity: num(c.linkOpacity_q4m, 0, 1, 1)
    };
  }

  function rebuildCfg() { cfg = normalize(raw); }

  function varName(n) { return '--ecb-' + n + '-q4m'; }

  function computeVars(c) {
    return {
      radius: c.radius,
      pady: c.padY,
      padx: c.padX,
      fsize: c.fontSize,
      bw: c.style === 'fill' ? '0' : c.borderWidth,
      bc: c.borderOpacity >= 100
        ? c.borderColor
        : 'color-mix(in srgb, ' + c.borderColor + ' ' + c.borderOpacity + '%, transparent)',
      shadow: c.shadow,
      lop: String(c.linkOpacity)
    };
  }

  function applyVars() {
    var root = document.documentElement;
    var v = computeVars(cfg);
    for (var n in v) root.style.setProperty(varName(n), v[n]);
    if (cfg.style === 'outline') root.style.setProperty(varName('bg'), 'transparent');
    else root.style.removeProperty(varName('bg'));
    root.setAttribute(ATTR_STYLE, cfg.style);
    if (cfg.linkUnderline) root.setAttribute(ATTR_UL, '1');
    else root.removeAttribute(ATTR_UL);
  }

  function removeVars() {
    var root = document.documentElement;
    VARS.forEach(function (n) { root.style.removeProperty(varName(n)); });
    root.removeAttribute(ATTR_STYLE);
    root.removeAttribute(ATTR_UL);
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent =
      '.' + CLS + '{' +
        'display:inline-flex!important;align-items:center!important;vertical-align:baseline!important;' +
        'font-family:inherit!important;font-size:var(' + varName('fsize') + ',inherit)!important;' +
        'line-height:1.25!important;' +
        'padding:var(' + varName('pady') + ',0.16em) var(' + varName('padx') + ',0.52em)!important;' +
        'border-radius:var(' + varName('radius') + ',9999px)!important;' +
        'border:var(' + varName('bw') + ',0) solid var(' + varName('bc') + ',currentColor)!important;' +
        'box-shadow:var(' + varName('shadow') + ',none)!important;' +
        'text-decoration:none!important;white-space:nowrap!important}' +
      'html[' + ATTR_STYLE + '="outline"] .' + CLS + ':not([' + ATTR_STYLE + ']){background:var(' + varName('bg') + ',transparent)!important}' +
      '.' + CLS + '[' + ATTR_STYLE + '="outline"]{background:transparent!important}' +
      'a.' + CLS_LINK + '{overflow:hidden!important}' +
      'a.' + CLS_LINK + ' *{text-decoration:none!important;opacity:var(' + varName('lop') + ',1)!important}' +
      'html:not([' + ATTR_UL + '="1"]) a.' + CLS_LINK + ':not([' + ATTR_UL + ']) *{border-bottom:0!important}' +
      'a.' + CLS_LINK + '[' + ATTR_UL + '="0"] *{border-bottom:0!important}';
    document.head.appendChild(st);
  }

  function injectPickStyle() {
    if (document.getElementById(PICK_STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = PICK_STYLE_ID;
    st.textContent =
      '.' + CLS_PICK + '{outline:3px dashed #ff6b35!important;outline-offset:3px!important}' +
      'html[' + ATTR_PICKING + '] span[data-token-index][style*="monospace" i]:hover,' +
      'html[' + ATTR_PICKING + '] a.notion-link-token[style*="monospace" i]:hover' +
      '{outline:2px solid #ff6b35aa!important;outline-offset:2px!important;cursor:crosshair!important}';
    document.head.appendChild(st);
  }

  /* ---------- 식별키 ---------- */
  function trimText(el) { return (el.textContent || '').trim().slice(0, 40); }

  function keyOf(el) {
    var block = el.closest('[data-block-id]');
    var i, x, idx = 0, list;
    if (block) {
      list = block.querySelectorAll(SEL);
      for (i = 0; i < list.length; i++) {
        x = list[i];
        if (x === el) break;
        if (x.closest('[data-block-id]') === block) idx++;
      }
      return block.getAttribute('data-block-id') + ':' + idx;
    }
    var text = trimText(el);
    list = document.querySelectorAll(SEL);
    for (i = 0; i < list.length; i++) {
      x = list[i];
      if (x === el) break;
      if (!x.closest('[data-block-id]') && trimText(x) === text) idx++;
    }
    return 'nb:' + text + ':' + idx;
  }

  function findByKey(key) {
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) {
      if (keyOf(list[i]) === key) return list[i];
    }
    return null;
  }

  /* ---------- 개별 설정 저장소 ---------- */
  function validKey(k) {
    return typeof k === 'string' && k.length > 0 && k.length < 200 && k !== '__proto__';
  }

  function sanitizeItem(src) {
    var out = {};
    if (!src || typeof src !== 'object') return out;
    ITEM_ALLOWED.forEach(function (k) {
      if (hasOwn(src, k) && src[k] !== null && src[k] !== undefined) out[k] = src[k];
    });
    return out;
  }

  function sanitizeItemsObj(obj) {
    var out = {};
    if (!obj || typeof obj !== 'object') return out;
    Object.keys(obj).forEach(function (key) {
      if (!validKey(key)) return;
      var it = sanitizeItem(obj[key]);
      if (Object.keys(it).length) out[key] = it;
    });
    return out;
  }

  function loadItems(obj) {
    items = Object.create(null);
    var clean = sanitizeItemsObj(obj);
    Object.keys(clean).forEach(function (k) { items[k] = clean[k]; });
  }

  function itemsToPlain() {
    var out = {};
    Object.keys(items).forEach(function (k) { out[k] = copy(items[k]); });
    return out;
  }

  function getItem(key) { return hasOwn(items, key) ? items[key] : null; }

  function storeItem(key, obj) {
    if (Object.keys(obj).length) items[key] = obj;
    else delete items[key];
  }

  function effectiveCfg(item) {
    var m = {};
    for (var k in raw) m[k] = raw[k];
    for (var j in item) m[j] = item[j];
    return normalize(m);
  }

  /* ---------- 적용 ---------- */
  function startsWithMarker(el) {
    var t = (el.textContent || '').replace(/^[\s\u200B\uFEFF]+/, '');
    return t.indexOf('[%') === 0;
  }

  function isCandidate(el) {
    return !el.closest(EXCLUDE) && !startsWithMarker(el);
  }

  function wanted(el) {
    if (!el.isConnected || !isCandidate(el)) return null;
    var isLink = el.tagName === 'A' || !!el.closest('a');
    if (isLink && !cfg.linkEnabled) return null;
    var key = keyOf(el);
    var it = getItem(key);
    if (it && it.enabled_q4m === false) return null;
    return key;
  }

  function clearItemVars(el) {
    if (!el.hasAttribute(ATTR_STYLE) && !el.hasAttribute(ATTR_UL)) return;
    VARS.forEach(function (n) { el.style.removeProperty(varName(n)); });
    el.removeAttribute(ATTR_STYLE);
    el.removeAttribute(ATTR_UL);
  }

  function applyItemVars(el, key) {
    var it = getItem(key);
    if (!it) { clearItemVars(el); return; }
    var eff = effectiveCfg(it);
    var v = computeVars(eff);
    for (var n in v) el.style.setProperty(varName(n), v[n]);
    el.setAttribute(ATTR_STYLE, eff.style);
    el.setAttribute(ATTR_UL, eff.linkUnderline ? '1' : '0');
  }

  function applyTo(el, key) {
    try {
      var s = el.style;
      var color = s.color || '';
      var bg = s.backgroundColor || s.background || '';
      if (!el.hasAttribute(ATTR_COLOR)) {
        el.setAttribute(ATTR_COLOR, color);
        el.setAttribute(ATTR_BG, bg);
      }
      el.setAttribute(ATTR_KEY, key);
      el.classList.add(CLS);

      var link = el.tagName === 'A' ? el : el.closest('a');
      if (link) {
        link.classList.add(CLS_LINK);
        if (link === el && color) s.setProperty('color', color, 'important');
      }
      applyItemVars(el, key);
    } catch (e) {
      log('apply error', e);
    }
  }

  function unapplyOne(el) {
    el.classList.remove(CLS, CLS_LINK);
    if (el.tagName === 'A') {
      var c = el.getAttribute(ATTR_COLOR);
      if (c) el.style.color = c;
    } else {
      var a = el.closest('a');
      if (a) a.classList.remove(CLS_LINK);
    }
    clearItemVars(el);
    el.removeAttribute(ATTR_COLOR);
    el.removeAttribute(ATTR_BG);
    el.removeAttribute(ATTR_KEY);
  }

  function unapplyAll() {
    document.querySelectorAll('.' + CLS + ', .' + CLS_LINK).forEach(unapplyOne);
  }

  function applyIfWanted(el) {
    try {
      if (el.classList.contains(CLS)) return;
      var key = wanted(el);
      if (key) applyTo(el, key);
    } catch (e) {
      log('apply error', e);
    }
  }

  function sync() {
    syncTimer = null;
    if (!running) return;
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) {
      try {
        var el = list[i];
        var has = el.classList.contains(CLS);
        var key = wanted(el);
        if (key && !has) applyTo(el, key);
        else if (!key && has) unapplyOne(el);
        else if (key && has) {
          el.setAttribute(ATTR_KEY, key);
          applyItemVars(el, key);
        }
      } catch (e) {
        log('sync error', e);
      }
    }
  }

  function requestSync() {
    if (syncTimer || !running) return;
    syncTimer = setTimeout(sync, 16);
  }

  /* ---------- 스캔/감시 ---------- */
  function flush(deadline) {
    scheduled = false;
    if (!running) return;
    var it = pending.values();
    var n = it.next();
    while (!n.done) {
      pending.delete(n.value);
      applyIfWanted(n.value);
      if (deadline && deadline.timeRemaining && deadline.timeRemaining() < 2) break;
      n = it.next();
    }
    if (pending.size) schedule();
  }

  function schedule() {
    if (scheduled || !running) return;
    scheduled = true;
    ric(flush, { timeout: 300 });
  }

  function collect(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches(SEL)) pending.add(node);
    var list = node.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) pending.add(list[i]);
  }

  function start() {
    if (running) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', start, { once: true });
      return;
    }
    if (!cfg.enabled) return;
    running = true;
    applyVars();
    injectStyle();
    collect(document.body);
    schedule();
    observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) collect(added[j]);
      }
      if (pending.size) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    log('시작 v' + VERSION);
  }

  function stop() {
    running = false;
    if (observer) { observer.disconnect(); observer = null; }
    if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
    pending.clear();
  }

  function teardownVisual() {
    unapplyAll();
    removeVars();
    var st = document.getElementById(STYLE_ID);
    if (st) st.remove();
  }

  function refresh() {
    if (!cfg.enabled) { stop(); teardownVisual(); return; }
    if (!running) { start(); return; }
    applyVars();
    injectStyle();
    requestSync();
  }

  /* ---------- 선택/하이라이트 ---------- */
  function clearHighlight() {
    document.querySelectorAll('.' + CLS_PICK).forEach(function (e) { e.classList.remove(CLS_PICK); });
  }

  function highlight(key) {
    clearHighlight();
    if (!key) return false;
    var el = findByKey(key);
    if (!el) return false;
    injectPickStyle();
    el.classList.add(CLS_PICK);
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    return true;
  }

  function emitPicked(detail) {
    window.dispatchEvent(new CustomEvent(EVENT_PICKED, { detail: detail }));
  }

  function onPickClick(e) {
    var t = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!t || t.closest(EXCLUDE)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    var key = keyOf(t);
    if (!pickKeep) pick(false);
    highlight(key);
    emitPicked({ key: key, text: trimText(t), isLink: t.tagName === 'A' || !!t.closest('a') });
  }

  function onPickKey(e) {
    if (e.key === 'Escape') {
      pick(false);
      emitPicked({ key: null, cancelled: true });
    }
  }

  function pick(on, opts) {
    if (on) {
      pickKeep = !!(opts && opts.keep);
      if (!picking) {
        picking = true;
        injectPickStyle();
        document.documentElement.setAttribute(ATTR_PICKING, '1');
        document.addEventListener('click', onPickClick, true);
        document.addEventListener('keydown', onPickKey, true);
      }
    } else if (picking) {
      picking = false;
      pickKeep = false;
      document.documentElement.removeAttribute(ATTR_PICKING);
      document.removeEventListener('click', onPickClick, true);
      document.removeEventListener('keydown', onPickKey, true);
    }
    return picking;
  }

  /* ---------- 공개 API ---------- */
  function setConfig(partial) {
    if (partial && typeof partial === 'object') {
      for (var k in partial) raw[k] = partial[k];
    }
    rebuildCfg();
    refresh();
  }

  function replaceConfig(obj) {
    raw = {};
    if (obj && typeof obj === 'object') {
      for (var k in obj) raw[k] = obj[k];
    }
    rebuildCfg();
    refresh();
  }

  function setItems(obj) { loadItems(obj); requestSync(); }

  function setItem(key, partial) {
    if (!validKey(key) || !partial || typeof partial !== 'object') return;
    var cur = getItem(key) ? copy(getItem(key)) : {};
    ITEM_ALLOWED.forEach(function (k) {
      if (!hasOwn(partial, k)) return;
      var v = partial[k];
      if (v === null || v === undefined) delete cur[k];
      else cur[k] = v;
    });
    storeItem(key, cur);
    requestSync();
  }

  function clearItem(key) {
    if (hasOwn(items, key)) delete items[key];
    requestSync();
  }

  function getBadges() {
    var out = [];
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (!isCandidate(el)) continue;
      var key = keyOf(el);
      var it = getItem(key);
      out.push({
        key: key,
        text: (el.textContent || '').trim().slice(0, 60),
        isLink: el.tagName === 'A' || !!el.closest('a'),
        enabled: !(it && it.enabled_q4m === false),
        hasOverride: !!it,
        el: el
      });
    }
    return out;
  }

  function getOrphanKeys() {
    var present = {};
    getBadges().forEach(function (b) { present[b.key] = true; });
    return Object.keys(items).filter(function (k) { return !present[k]; });
  }

  function declare(cfgObj, itemsObj) {
    declaredRaw = {};
    raw = {};
    if (cfgObj && typeof cfgObj === 'object') {
      for (var k in cfgObj) { declaredRaw[k] = cfgObj[k]; raw[k] = cfgObj[k]; }
    }
    declaredItems = sanitizeItemsObj(itemsObj);
    loadItems(declaredItems);
    rebuildCfg();
    refresh();
    requestSync();
  }

  function reset() {
    raw = {};
    for (var k in declaredRaw) raw[k] = declaredRaw[k];
    loadItems(declaredItems);
    rebuildCfg();
    refresh();
    requestSync();
  }

  /* ---------- 대시보드 API ---------- */
  function plainOf(c) { return copy(c); }

  function commonRead() {
    var edit = {};
    SCHEMA.forEach(function (f) {
      var a = hasOwn(raw, f.cfgKey) ? raw[f.cfgKey] : undefined;
      var b = hasOwn(declaredRaw, f.cfgKey) ? declaredRaw[f.cfgKey] : undefined;
      if (!same(a, b)) edit[f.key] = a === undefined ? null : a;
    });
    return {
      values: plainOf(cfg),
      declared: plainOf(normalize(declaredRaw)),
      defaults: plainOf(normalize({})),
      edit: edit
    };
  }

  function commonApply(patch) {
    if (!patch || typeof patch !== 'object') return;
    SCHEMA.forEach(function (f) {
      if (!hasOwn(patch, f.key)) return;
      var v = patch[f.key];
      if (v === null) {
        if (hasOwn(declaredRaw, f.cfgKey)) raw[f.cfgKey] = declaredRaw[f.cfgKey];
        else delete raw[f.cfgKey];
      } else if (v !== undefined) {
        raw[f.cfgKey] = v;
      }
    });
    rebuildCfg();
    refresh();
  }

  function commonRestore(keys) {
    var patch = {};
    (keys || SCHEMA.map(function (f) { return f.key; })).forEach(function (k) { patch[k] = null; });
    commonApply(patch);
  }

  function itemDiff(id) {
    var cur = getItem(id) || {};
    var dec = hasOwn(declaredItems, id) ? declaredItems[id] : {};
    var edit = {}, released = [];
    ITEM_PLAIN.forEach(function (k) {
      var kk = k + '_q4m';
      var a = hasOwn(cur, kk) ? cur[kk] : undefined;
      var b = hasOwn(dec, kk) ? dec[kk] : undefined;
      if (same(a, b)) return;
      if (a !== undefined) edit[k] = a;
      else released.push(k);
    });
    return { edit: edit, released: released };
  }

  function scopeRead(id) {
    var it = getItem(id) ? copy(getItem(id)) : {};
    var dec = hasOwn(declaredItems, id) ? declaredItems[id] : {};
    var values = plainOf(effectiveCfg(it));
    values.enabled = it.enabled_q4m !== false;
    var own = [], source = {};
    SCHEMA.forEach(function (f) {
      if (f.commonOnly) return;
      var kk = f.cfgKey;
      if (hasOwn(it, kk)) {
        own.push(f.key);
        source[f.key] = (hasOwn(dec, kk) && same(dec[kk], it[kk])) ? 'item' : 'edit';
      } else {
        source[f.key] = hasOwn(raw, kk) ? 'common' : 'default';
      }
    });
    var d = itemDiff(id);
    return { values: values, own: own, source: source, edit: d.edit, released: d.released };
  }

  function scopeApply(id, patch) {
    if (!validKey(id) || !patch || typeof patch !== 'object') return;
    var o = {};
    ITEM_PLAIN.forEach(function (k) {
      if (hasOwn(patch, k)) o[k + '_q4m'] = patch[k];
    });
    setItem(id, o);
  }

  function scopeRestore(id, keys) {
    if (!validKey(id)) return;
    var dec = hasOwn(declaredItems, id) ? declaredItems[id] : {};
    var cur = getItem(id) ? copy(getItem(id)) : {};
    (keys || ITEM_PLAIN).forEach(function (k) {
      var kk = k + '_q4m';
      if (hasOwn(dec, kk)) cur[kk] = dec[kk];
      else delete cur[kk];
    });
    storeItem(id, cur);
    requestSync();
  }

  function scopeRelease(id, keys) {
    if (!validKey(id)) return;
    var cur = getItem(id) ? copy(getItem(id)) : {};
    (keys || ITEM_PLAIN).forEach(function (k) { delete cur[k + '_q4m']; });
    storeItem(id, cur);
    requestSync();
  }

  function scopeList() {
    var out = [], seen = {};
    getBadges().forEach(function (b) {
      seen[b.key] = true;
      var d = itemDiff(b.key);
      out.push({
        id: b.key, text: b.text, isLink: b.isLink, enabled: b.enabled, onPage: true,
        hasItem: b.hasOverride,
        edited: Object.keys(d.edit).length > 0 || d.released.length > 0
      });
    });
    var ids = {};
    Object.keys(items).forEach(function (k) { ids[k] = 1; });
    Object.keys(declaredItems).forEach(function (k) { ids[k] = 1; });
    Object.keys(ids).forEach(function (id) {
      if (seen[id]) return;
      var d = itemDiff(id), it = getItem(id);
      out.push({
        id: id, text: '', isLink: false, enabled: !(it && it.enabled_q4m === false), onPage: false,
        hasItem: !!it,
        edited: Object.keys(d.edit).length > 0 || d.released.length > 0
      });
    });
    return out;
  }

  var dashboard = {
    version: DASH_API_VERSION,
    schema: function () { return copy(SCHEMA); },
    common: { read: commonRead, apply: commonApply, restore: commonRestore },
    scopes: {
      list: scopeList,
      read: scopeRead,
      apply: scopeApply,
      restore: scopeRestore,
      release: scopeRelease,
      element: findByKey
    },
    restoreAll: reset
  };

  /* ---------- 이벤트/정리 ---------- */
  function onConfigEvent(e) { setConfig(e && e.detail); }
  function onItemsEvent(e) { setItems(e && e.detail); }

  function destroy() {
    stop();
    teardownVisual();
    pick(false);
    clearHighlight();
    var ps = document.getElementById(PICK_STYLE_ID);
    if (ps) ps.remove();
    window.removeEventListener(EVENT_CONFIG, onConfigEvent);
    window.removeEventListener(EVENT_ITEMS, onItemsEvent);
    log('destroy 완료');
  }

  function rescan() {
    if (!running) { refresh(); return; }
    collect(document.body);
    schedule();
    requestSync();
  }

  var initial = window.ecbConfig_q4m;
  if (initial && typeof initial === 'object') {
    for (var key in initial) { raw[key] = initial[key]; declaredRaw[key] = initial[key]; }
  }
  if (window.ecbItems_q4m && typeof window.ecbItems_q4m === 'object') {
    declaredItems = sanitizeItemsObj(window.ecbItems_q4m);
    loadItems(declaredItems);
  }
  rebuildCfg();
  window.addEventListener(EVENT_CONFIG, onConfigEvent);
  window.addEventListener(EVENT_ITEMS, onItemsEvent);

  window.__ecbApi_q4m = {
    version: VERSION,
    start: start,
    destroy: destroy,
    rescan: rescan,
    reset: reset,
    declare: declare,
    setConfig: setConfig,
    replaceConfig: replaceConfig,
    getConfig: function () { return copy(cfg); },
    setItems: setItems,
    setItem: setItem,
    clearItem: clearItem,
    getItems: itemsToPlain,
    getBadges: getBadges,
    getOrphanKeys: getOrphanKeys,
    highlight: highlight,
    pick: pick,
    dashboard: dashboard,
    debug: function (on) { raw.debug_q4m = !!on; rebuildCfg(); }
  };

  start();
})();
