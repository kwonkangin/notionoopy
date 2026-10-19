//  <!-- 콜카운터 call-counter 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/call-counter-20261020/call-counter.js" defer></script>




// =========================================================
// call-counter.js
// 버전: 4.0.1
// 설명: 노션/우피 페이지 어디서나 [# 숫자 #] 마커를 카운트업 숫자로 바꾸는 모듈 (call-card와 독립)
// 의존성: core.js v1.2.0 이상 ([% call-counter %] 토큰 등록에 사용)
// ---------------------------------------------------------
// [개요]
//  - 숫자만 세고 애니메이션한다. 카드의 테두리·여백·모서리·배경·간격은 call-card가 맡는다.
//  - 콜아웃 안뿐 아니라 페이지의 아무 글 블록에서나 쓸 수 있다.
//  - 우피가 바꿀 수 있는 CSS 클래스 이름(해시가 붙는 이름)에 의존하지 않는다.
//    notion-*-block, data-block-id, DOM 구조와 글자(text)만 사용한다.
//
// [로드 순서]  core.js -> call-slide.js -> call-card.js -> call-counter.js
//  옛 call-counter.js(v3.x)는 제거한다. 남아 있으면 이 파일이 콘솔에 경고를 남기고 로드를 건너뛴다.
//
// [마커 문법]  [# 항목 :: 항목 :: 항목 #]
//  - 항목은 ::로 구분한다. 숫자 형식인 첫 항목이 숫자이고, 그 앞은 접두, 그 뒤는 접미이다.
//  - 접두·접미는 글자든 기호든 구분하지 않고 같은 스타일을 받는다. (접두: PS/PW, 접미: SS/SW)
//  - @로 시작하는 항목은 이 마커만의 개별 설정이다.  @키 값
//  - 글자에 ::나 앞뒤 공백이 필요하면 따옴표로 감싼다.  "a :: b"
//  - 숫자 항목이 없으면 마커로 보지 않고 글자 그대로 둔다.
//  - 마커 바깥의 글자는 일반 텍스트로 그대로 둔다.
//
//   [# 1000 #]                                숫자만
//   [# ₩ :: 1,250,000 :: 만 :: + #]           접두 ₩, 숫자 1,250,000, 접미 만, 접미 +
//   [# 99.9 :: % #]                           숫자 뒤 %
//   [# 100 :: 명 :: @NS 96px :: @DURATION 2500 #]   이 마커만 숫자 크기 96px, 2.5초
//
// [숫자 형식]
//  - 입력한 형식이 기본이다. 1,000이면 콤마를 넣고, 1000이면 넣지 않고, 3.50이면 소수 둘째 자리까지 유지한다.
//  - +를 붙여 입력하면 부호를 유지하고, 음수는 -를 표시한다.
//  - COMMA, DECIMAL, ABBR로 강제할 수 있다.
//  - 카운트업 중에도 최종 숫자와 같은 형식으로 보이고, 최종 숫자 폭만큼 자리를 예약해 줄이 흔들리지 않는다.
//
// [라벨·텍스트]
//  숫자가 있는 블록의 같은 카드(콜아웃 또는 컬럼) 안에서, 그 다음 첫 번째 글 블록은 라벨(LS/LW),
//  그 뒤 글 블록은 텍스트(TS/TW)로 본다. 비어 있거나 화면에서 숨겨진 블록은 건너뛴다.
//
// [토큰]  [% call-counter :: 키 값 :: 키 값 %]   (선택 사항)
//  토큰이 든 가장 가까운 콜아웃(또는 컬럼) 안의 모든 마커에 설정을 적용한다. 중첩되면 안쪽 토큰이 이긴다.
//  카드 밖(페이지)에 적은 토큰은 페이지 전체 마커에 적용된다.
//  우선순위: 마커 개별(@) > 가까운 토큰 > 바깥 토큰 > :root CSS 변수 > 엔진 기본값
//
// [파라미터]  토큰·마커(@)·CSS 변수로 모두 지정할 수 있다. 값이 비어 있으면 노션 기본 모양을 따른다.
//   키          CSS 변수                          기본값    설명
//   NS          --counter-number-size_q7X         (비움)    숫자 크기: 숫자(px), 단위 값, H1~H4, TEXT
//   NW          --counter-number-weight_q7X       (비움)    숫자 굵기: 100~900, NORMAL, BOLD
//   PS          --counter-prefix-size_q7X         (비움)    접두 크기
//   PW          --counter-prefix-weight_q7X       (비움)    접두 굵기
//   SS          --counter-suffix-size_q7X         (비움)    접미 크기
//   SW          --counter-suffix-weight_q7X       (비움)    접미 굵기
//   LS          --counter-label-size_q7X          (비움)    라벨 크기
//   LW          --counter-label-weight_q7X        (비움)    라벨 굵기
//   TS          --counter-text-size_q7X           (비움)    텍스트 크기
//   TW          --counter-text-weight_q7X         (비움)    텍스트 굵기
//   TA          --counter-align_q7X               L         정렬: L, C, R (숫자와 라벨·텍스트 모두)
//   NTC         --counter-number-color_q7X        (비움)    숫자 색
//   SIGN_COLOR  --counter-sign-color_q7X          FALSE     양수 파랑, 음수 빨강으로 숫자 색 구분
//   COMMA       --counter-comma_q7X               AUTO      AUTO(입력 따름), TRUE, FALSE
//   DECIMAL     --counter-decimal_q7X             AUTO      AUTO(입력 따름), 0~8
//   ABBR        --counter-abbr_q7X                FALSE     FALSE, KR(만·억), EN(K·M·B). 큰 수일 때만 줄임
//   DURATION    --counter-duration_q7X            1500      카운트업 시간(ms). 1.5s 형식도 가능
//   EASE        --counter-ease_q7X                OUT       OUT, LINEAR, INOUT
//   REPLAY      --counter-replay_q7X              TRUE      화면을 벗어났다 다시 들어오면 다시 재생
//   SP          --counter-gap_q7X                 0.15em    접두·숫자·접미 사이 간격
//   크기에 H1~H4, TEXT를 쓰면 같은 페이지의 노션 제목·본문 글자 크기를 읽어서 쓴다. 못 읽으면 기본 비율을 쓴다.
//   CSS 변수는 :root에 적는다. 값이 NONE이면 비움으로 본다.
//   예) :root { --counter-number-size_q7X: H1; --counter-align_q7X: C; }
//
// [재생]
//  같은 카드(콜아웃·컬럼) 안의 마커는 카드가 화면에 40% 이상 보일 때 함께 시작한다.
//  카드가 없는 마커는 각자 시작한다. REPLAY가 TRUE이면 화면을 벗어날 때 0으로 되돌렸다가 다시 들어오면 재생한다.
//  시스템의 "동작 줄이기" 설정이면 애니메이션 없이 바로 최종 숫자를 보여 준다.
//  최종 숫자와 접두·접미는 aria-label로 제공한다.
//
// [공개 API]  window.CallCounterEngine
//  version, rescan(), diagnose()
//  dashboard.apiVersion  1.0.0
//  dashboard.schema()                        20개 설정의 key, css, type, defaultValue
//  dashboard.common.read / apply(patch) / restore / css({full})        사이트 공통(:root) 임시 편집과 CSS 출력
//  dashboard.counters.list / read(id) / apply(id, patch) / restore(id) / token(id)   마커별 임시 편집, token은 [# #] 출력
//  dashboard.scopes.list / read(id) / apply(id, patch) / restore(id) / token(id)     카드(토큰) 단위 임시 편집, token은 [% %] 출력
//  임시 편집은 화면에만 반영되고 노션 원문은 수정하지 않는다. 새로고침하면 사라진다.
//  id 규칙: 마커는 블록ID#순번(예: 3f90...#0), 범위는 콜아웃·컬럼 블록ID 또는 page.
//
// [알려진 제한]
//  - 옛 [[100]] 문법과 [[N]]은 지원하지 않는다. 옛 페이지의 해당 글자는 그대로 보이므로 노션에서 고쳐야 한다.
//  - 마커는 한 덩어리의 글자 안에 있어야 한다. 마커 안에서 굵게·색 등 서식을 바꿔 글이 쪼개지면 인식하지 못한다.
//  - 접두·접미 사이의 공백은 SP 간격으로 대신하므로, 글자 안의 앞뒤 공백은 무시된다.
//  - 정렬(TA)은 숫자가 있는 블록과 라벨·텍스트 블록에 적용한다. 카드 안의 다른 블록(이미지 등)은 건드리지 않는다.
//  - H1~H4, TEXT 크기는 페이지에 해당 블록이 있어야 정확히 읽는다. 없으면 본문 글자 크기에 곱한 기본 비율(H1 1.875배 등)을 쓴다.
//  - 토큰 줄 자체를 화면에서 숨기는 것은 core.js의 처리를 따른다.
//  - 검증 범위: 가상 환경(가짜 DOM)에서 45개 시나리오를 확인했다. 실제 노션·우피 화면에서의 동작은 직접 확인해야 한다.
//    (마커 변환, 형식 유지, 접두·접미, 개별 설정, 토큰 적용 범위, 재생·재진입, 공통 CSS, API)
// =========================================================

(function (global) {
  'use strict';

  var VERSION = '4.0.1';
  var SUFFIX = '_q7X';

  if (!global.CoreEngine || typeof global.CoreEngine.register !== 'function') {
    console.error('[call-counter] CoreEngine이 없습니다. core.js를 먼저 로드하세요.');
    return;
  }
  if (global.CallCounterEngine) {
    var oldVer = String(global.CallCounterEngine.version || '');
    console.warn('[call-counter] 이미 로드된 call-counter(v' + oldVer + ')가 있어 건너뜁니다.' +
      (/^3\./.test(oldVer) ? ' 옛 call-counter.js(v3.x)를 제거하고 새 파일만 남기세요.' : ''));
    return;
  }

  var Core = global.CoreEngine;
  var MARKER_RE = /\[#([\s\S]*?)#\]/g;
  var NUMBER_RE = /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, NOSCRIPT: 1 };
  var BLOCK_CLASSES = ['notion-text-block', 'notion-header-block', 'notion-sub_header-block', 'notion-sub_sub_header-block',
    'notion-header_4-block', 'notion-quote-block', 'notion-bulleted_list-block', 'notion-numbered_list-block'];
  var REF_CLASS = { H1: 'notion-header-block', H2: 'notion-sub_header-block', H3: 'notion-sub_sub_header-block',
    H4: 'notion-header_4-block', TEXT: 'notion-text-block' };
  var REF_FALLBACK = { H1: 1.875, H2: 1.5, H3: 1.25, H4: 1.125, TEXT: 1 };

  /* 설정 항목: 키, CSS 변수 이름(접미사 통일), 종류, 기본값 */
  var FIELDS = [
    ['NS', 'number-size', 'size', ''], ['NW', 'number-weight', 'weight', ''],
    ['PS', 'prefix-size', 'size', ''], ['PW', 'prefix-weight', 'weight', ''],
    ['SS', 'suffix-size', 'size', ''], ['SW', 'suffix-weight', 'weight', ''],
    ['LS', 'label-size', 'size', ''], ['LW', 'label-weight', 'weight', ''],
    ['TS', 'text-size', 'size', ''], ['TW', 'text-weight', 'weight', ''],
    ['TA', 'align', 'align', 'L'],
    ['NTC', 'number-color', 'color', ''], ['SIGN_COLOR', 'sign-color', 'bool', 'FALSE'],
    ['COMMA', 'comma', 'comma', 'AUTO'], ['DECIMAL', 'decimal', 'decimal', 'AUTO'], ['ABBR', 'abbr', 'abbr', 'FALSE'],
    ['DURATION', 'duration', 'duration', '1500'], ['EASE', 'ease', 'ease', 'OUT'], ['REPLAY', 'replay', 'bool', 'TRUE'],
    ['SP', 'gap', 'space', '0.15em']
  ].map(function (f) { return { key: f[0], css: '--counter-' + f[1] + SUFFIX, type: f[2], defaultValue: f[3] }; });
  var FIELD_BY_KEY = {};
  FIELDS.forEach(function (f) { FIELD_BY_KEY[f.key] = f; });

  var EASE_FN = {
    LINEAR: function (t) { return t; },
    OUT: function (t) { return 1 - Math.pow(1 - t, 3); },
    INOUT: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  };

  var records = [];
  var scopes = new Map();          // 컨테이너 요소 -> 토큰 설정
  var scopeEdits = new Map();      // 컨테이너 요소 -> 대시보드 임시 편집
  var pageScope = null;            // 컨테이너 밖 토큰 설정
  var pageEdit = {};
  var groups = new Map();          // 재생 그룹 요소 -> { recs, io }
  var commonEdited = {};
  var commonStyle = null;
  var refCache = {};
  var warned = {};
  var idSeq = 0;

  function warnOnce(msg) { if (warned[msg]) return; warned[msg] = true; console.warn('[call-counter] ' + msg); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  /* ---------- DOM 도우미 (클래스 이름은 노션 고유 이름만 사용) ---------- */
  function hasClass(el, c) { return !!(el && el.classList && el.classList.contains(c)); }
  function isContainer(el) { return hasClass(el, 'notion-callout-block') || hasClass(el, 'notion-column-block'); }
  function nearestContainer(el) {
    while (el && el.nodeType === 1) { if (isContainer(el)) return el; el = el.parentNode; }
    return null;
  }
  function blockOf(node) {
    var el = node && node.nodeType === 1 ? node : (node ? node.parentNode : null);
    while (el && el.nodeType === 1) { if (el.hasAttribute && el.hasAttribute('data-block-id')) return el; el = el.parentNode; }
    return null;
  }
  function isBlockEl(el) { return BLOCK_CLASSES.some(function (c) { return hasClass(el, c); }); }
  function elementChildren(el) { return Array.prototype.filter.call(el.childNodes || [], function (n) { return n.nodeType === 1; }); }
  function textOf(node) {
    if (node.nodeType === 3) return node.nodeValue || '';
    return Array.prototype.map.call(node.childNodes || [], textOf).join('');
  }
  function insideCounter(node) {
    for (var el = node.nodeType === 1 ? node : node.parentNode; el && el.nodeType === 1; el = el.parentNode) {
      if (hasClass(el, 'cc-counter')) return true;
      if (SKIP_TAGS[el.tagName] || hasClass(el, 'notion-code-block')) return true;
    }
    return false;
  }
  function collectTextNodes(root, out) {
    Array.prototype.forEach.call(root.childNodes || [], function (n) {
      if (n.nodeType === 3) {
        if ((n.nodeValue || '').indexOf('[#') !== -1) out.push(n);
      } else if (n.nodeType === 1) {
        if (SKIP_TAGS[n.tagName] || hasClass(n, 'cc-counter') || hasClass(n, 'notion-code-block')) return;
        collectTextNodes(n, out);
      }
    });
    return out;
  }
  function ownBlocks(container) {
    var out = [];
    (function walk(el) {
      elementChildren(el).forEach(function (c) {
        if (isContainer(c)) return;
        if (isBlockEl(c)) { out.push(c); return; }
        walk(c);
      });
    })(container);
    return out;
  }

  /* ---------- 값 검사·정규화 ---------- */
  function normalizeValue(f, raw) {
    var s = String(raw == null ? '' : raw).trim(), u = s.toUpperCase(), n;
    if (s === '' || u === 'NONE' || u === 'INHERIT') return f.type === 'align' || f.type === 'comma' || f.type === 'decimal' ||
      f.type === 'abbr' || f.type === 'duration' || f.type === 'ease' || f.type === 'bool' || f.type === 'space' ? f.defaultValue : '';
    switch (f.type) {
      case 'size':
        if (REF_CLASS[u]) return u;
        if (/^\d+(\.\d+)?$/.test(s)) return s + 'px';
        if (/^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/i.test(s)) return s;
        throw new Error(f.key + ': 크기는 숫자, 단위 값, H1~H4, TEXT만 쓸 수 있습니다.');
      case 'weight':
        if (u === 'NORMAL') return '400';
        if (u === 'BOLD') return '700';
        n = Number(s);
        if (isFinite(n) && n >= 100 && n <= 900) return String(Math.round(n));
        throw new Error(f.key + ': 굵기는 100~900, NORMAL, BOLD만 쓸 수 있습니다.');
      case 'align':
        if (u === 'L' || u === 'C' || u === 'R') return u;
        throw new Error(f.key + ': L, C, R 중 하나여야 합니다.');
      case 'color':
        if (global.CSS && global.CSS.supports && global.CSS.supports('color', s)) return s;
        throw new Error(f.key + ': 색 형식이 잘못되었습니다.');
      case 'bool':
        if (/^(1|ON|TRUE|YES|Y)$/.test(u)) return 'TRUE';
        if (/^(0|OFF|FALSE|NO|N)$/.test(u)) return 'FALSE';
        throw new Error(f.key + ': true/false를 입력하세요.');
      case 'comma':
        if (u === 'AUTO') return 'AUTO';
        if (/^(1|ON|TRUE|YES|Y)$/.test(u)) return 'TRUE';
        if (/^(0|OFF|FALSE|NO|N)$/.test(u)) return 'FALSE';
        throw new Error(f.key + ': AUTO, true, false 중 하나여야 합니다.');
      case 'decimal':
        if (u === 'AUTO') return 'AUTO';
        n = Number(s);
        if (isFinite(n) && n >= 0 && n <= 8 && Math.floor(n) === n) return String(n);
        throw new Error(f.key + ': AUTO 또는 0~8 정수여야 합니다.');
      case 'abbr':
        if (u === 'FALSE' || u === '0' || u === 'OFF') return 'FALSE';
        if (u === 'KR' || u === 'EN') return u;
        throw new Error(f.key + ': false, KR, EN 중 하나여야 합니다.');
      case 'duration':
        if (/^\d+(\.\d+)?s$/i.test(s)) return String(Math.round(parseFloat(s) * 1000));
        if (/^\d+(\.\d+)?(ms)?$/i.test(s)) return String(Math.round(parseFloat(s)));
        throw new Error(f.key + ': 시간은 ms 숫자(예: 1500) 또는 1.5s 형식이어야 합니다.');
      case 'ease':
        if (EASE_FN[u]) return u;
        throw new Error(f.key + ': OUT, LINEAR, INOUT 중 하나여야 합니다.');
      case 'space':
        if (/^\d+(\.\d+)?$/.test(s)) return s + 'px';
        if (/^\d+(\.\d+)?(px|em|rem)$/i.test(s)) return s;
        throw new Error(f.key + ': 간격은 숫자 또는 px/em/rem 값이어야 합니다.');
    }
    return s;
  }
  function normalizePatch(patch, label) {
    var out = {};
    Object.keys(patch || {}).forEach(function (k) {
      var key = String(k).toUpperCase().replace(/[-\s]/g, '_'), f = FIELD_BY_KEY[key];
      if (!f) throw new Error('지원하지 않는 설정: ' + k);
      out[key] = patch[k] === null ? null : normalizeValue(f, patch[k]);
    });
    return out;
  }
  function softNormalize(raw, where) {
    var out = {};
    Object.keys(raw || {}).forEach(function (k) {
      var key = String(k).toUpperCase().replace(/[-\s]/g, '_'), f = FIELD_BY_KEY[key];
      if (!f) { warnOnce(where + ': 알 수 없는 설정을 무시합니다: ' + k); return; }
      try { out[key] = normalizeValue(f, raw[k]); }
      catch (e) { warnOnce(where + ': ' + e.message); }
    });
    return out;
  }

  /* ---------- CSS 변수 기본값 ---------- */
  function cssDefaults() {
    var cs, out = {};
    try { cs = global.getComputedStyle(document.documentElement); } catch (e) { cs = null; }
    FIELDS.forEach(function (f) {
      var raw = cs ? String(cs.getPropertyValue(f.css) || '').trim() : '', v = f.defaultValue;
      if (raw) { try { v = normalizeValue(f, raw); } catch (e) { warnOnce('CSS 변수 ' + f.css + ' 값을 무시합니다: ' + e.message); } }
      out[f.key] = v;
    });
    return out;
  }
  function cssExplicit() {
    var cs, out = {};
    try { cs = global.getComputedStyle(document.documentElement); } catch (e) { cs = null; }
    FIELDS.forEach(function (f) { out[f.key] = cs ? String(cs.getPropertyValue(f.css) || '').trim() : ''; });
    return out;
  }

  /* ---------- 마커 해석 ---------- */
  function splitItems(text) {
    var items = [], cur = '', quote = '', i, ch;
    for (i = 0; i < text.length; i++) {
      ch = text.charAt(i);
      if (quote) {
        cur += ch;
        if (ch === quote) quote = '';
        continue;
      }
      if ((ch === '"' || ch === "'") && !cur.trim()) { quote = ch; cur += ch; continue; }
      if (ch === ':' && text.charAt(i + 1) === ':') { items.push(cur); cur = ''; i++; continue; }
      cur += ch;
    }
    items.push(cur);
    return items.map(function (s) { return s.trim(); });
  }
  function unquote(s) {
    var m = /^(["'])([\s\S]*)\1$/.exec(s);
    return m ? m[2] : s;
  }
  function parseNumber(str) {
    var plus = str.charAt(0) === '+', s = str.replace(/^\+/, ''), clean = s.replace(/,/g, ''), parts = clean.split('.');
    return { text: str, value: parseFloat(clean), hasComma: s.indexOf(',') !== -1, decimals: (parts[1] || '').length, plus: plus };
  }
  function parseMarker(inner) {
    var items = splitItems(inner), display = [], settings = {}, numIdx = -1, i;
    for (i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it) continue;
      var sm = /^@\s*([A-Za-z_\-]+)\s*([\s\S]*)$/.exec(it);
      if (sm) { settings[sm[1]] = sm[2].trim(); continue; }
      display.push(unquote(it));
    }
    for (i = 0; i < display.length; i++) { if (NUMBER_RE.test(display[i])) { numIdx = i; break; } }
    if (numIdx < 0) return null;
    return {
      prefix: display.slice(0, numIdx), number: parseNumber(display[numIdx]), suffix: display.slice(numIdx + 1),
      settings: settings
    };
  }

  /* ---------- 숫자 표시 ---------- */
  function trimZero(n) { return (Math.round(n * 10) / 10).toString(); }
  function abbreviate(abs, mode) {
    if (mode === 'EN') {
      if (abs >= 1e9) return trimZero(abs / 1e9) + 'B';
      if (abs >= 1e6) return trimZero(abs / 1e6) + 'M';
      if (abs >= 1e3) return trimZero(abs / 1e3) + 'K';
      return trimZero(abs);
    }
    if (abs >= 1e8) return trimZero(abs / 1e8) + '억';
    if (abs >= 1e4) return trimZero(abs / 1e4) + '만';
    return trimZero(abs);
  }
  function formatNumber(current, spec, params) {
    var target = spec.value, abbr = params.ABBR, sign;
    if (abbr !== 'FALSE' && Math.abs(target) >= (abbr === 'EN' ? 1000 : 10000)) {
      sign = current < 0 ? '-' : (spec.plus && current > 0 ? '+' : '');
      return sign + abbreviate(Math.abs(current), abbr);
    }
    var decimals = params.DECIMAL === 'AUTO' ? spec.decimals : parseInt(params.DECIMAL, 10);
    var useComma = params.COMMA === 'AUTO' ? spec.hasComma : params.COMMA === 'TRUE';
    var fixed = Math.abs(current).toFixed(decimals), parts = fixed.split('.'), intPart = parts[0];
    if (useComma) intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var body = intPart + (parts[1] ? '.' + parts[1] : '');
    var allZero = /^[0.,]*$/.test(body);
    sign = (target < 0 && !allZero) ? '-' : ((spec.plus && !allZero) ? '+' : '');
    return sign + body;
  }

  /* ---------- 크기 키워드(H1~H4, TEXT) ---------- */
  function textHost(el) {
    var cur = el;
    for (;;) {
      var kids = elementChildren(cur).filter(function (c) { return textOf(c).trim(); });
      if (kids.length !== 1 || hasClass(kids[0], 'cc-counter')) break;      cur = kids[0];
    }
    return cur;
  }
  function findRefBlock(cls, root) {
    var found = null;
    (function walk(el) {
      if (found) return;
      elementChildren(el).forEach(function (c) {
        if (found) return;
        if (hasClass(c, cls) && textOf(c).trim() && !hasClass(c, 'cc-has-counter') && textOf(c).indexOf('[#') === -1 && !c.querySelector('.cc-counter')) { found = c; return; }
        walk(c);
      });
    })(root);
    return found;
  }
  function baseFontPx() {
    var tb = document.body ? findRefBlock('notion-text-block', document.body) : null, px = 0;
    try { px = parseFloat(global.getComputedStyle(tb ? textHost(tb) : document.body).fontSize); } catch (e) {}
    return px > 0 ? px : 16;
  }
  function resolveSize(v) {
    if (!v) return '';
    if (!REF_CLASS[v]) return v;
    if (refCache[v]) return refCache[v];
    var block = document.body ? findRefBlock(REF_CLASS[v], document.body) : null, size = '';
    if (block) {
      try {
        var px = global.getComputedStyle(textHost(block)).fontSize;
        if (px && /px$/.test(px)) size = px;
      } catch (e) {}
    }
    if (!size) size = Math.round(baseFontPx() * REF_FALLBACK[v] * 100) / 100 + 'px';
    refCache[v] = size;
    return size;
  }

  /* ---------- 설정 합치기 ---------- */
  function mergeInto(target, src) {
    Object.keys(src || {}).forEach(function (k) {
      if (src[k] === null || src[k] === undefined) return;
      target[k] = src[k];
    });
  }
  function containerChain(rec) {
    var chain = [], c = nearestContainer(rec.span.parentNode);
    while (c) { chain.unshift(c); c = nearestContainer(c.parentNode); }
    return chain;
  }
  function scopeParams(container) {
    var p = {};
    mergeInto(p, scopes.get(container));
    var e = scopeEdits.get(container) || {};
    Object.keys(e).forEach(function (k) { if (e[k] === null) delete p[k]; else p[k] = e[k]; });
    return p;
  }
  function resolveParams(rec) {
    var p = cssDefaults();
    var pg = {};
    mergeInto(pg, pageScope);
    Object.keys(pageEdit).forEach(function (k) { if (pageEdit[k] === null) delete pg[k]; else pg[k] = pageEdit[k]; });
    mergeInto(p, pg);
    containerChain(rec).forEach(function (c) { mergeInto(p, scopeParams(c)); });
    var mk = {};
    mergeInto(mk, rec.markerParams);
    Object.keys(rec.edit).forEach(function (k) { if (rec.edit[k] === null) delete mk[k]; else mk[k] = rec.edit[k]; });
    mergeInto(p, mk);
    return p;
  }

  /* ---------- 카운터 DOM ---------- */
  function makeSpan(cls, text) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    return s;
  }
  function buildCounter(parsed, blockEl, index) {
    var span = document.createElement('span');
    span.className = 'cc-counter';
    span.setAttribute('data-cc', '1');
    span.setAttribute('role', 'img');
    var prefixEls = parsed.prefix.map(function (t) { var e = makeSpan('cc-prefix', t); span.appendChild(e); return e; });
    var numEl = makeSpan('cc-number', '');
    span.appendChild(numEl);
    var suffixEls = parsed.suffix.map(function (t) { var e = makeSpan('cc-suffix', t); span.appendChild(e); return e; });
    var id = (blockEl && blockEl.getAttribute('data-block-id') ? blockEl.getAttribute('data-block-id') : 'page') + '#' + index;
    return {
      id: id, span: span, numEl: numEl, prefixEls: prefixEls, suffixEls: suffixEls, spec: parsed.number,
      prefix: parsed.prefix, suffix: parsed.suffix, markerParams: softNormalize(parsed.settings, '마커 ' + id),
      rawSettings: parsed.settings, edit: {}, raf: null, played: false, blockEl: blockEl, style: null
    };
  }
  function setStyle(el, prop, val) {
    if (val) el.style[prop] = val; else el.style[prop] = '';
  }
  function finalText(rec, params) {
    return rec.prefix.join(' ') + (rec.prefix.length ? ' ' : '') + formatNumber(rec.spec.value, rec.spec, params) +
      (rec.suffix.length ? ' ' : '') + rec.suffix.join(' ');
  }
  function reserveWidth(rec, params, showing) {
    try {
      rec.numEl.style.minWidth = '';
      rec.numEl.textContent = formatNumber(rec.spec.value, rec.spec, params);
      var w = rec.numEl.getBoundingClientRect().width;
      if (w) rec.numEl.style.minWidth = Math.ceil(w) + 'px';
    } catch (e) {}
    rec.numEl.textContent = formatNumber(showing, rec.spec, params);
  }
  function currentValue(rec) { return rec.shown === undefined ? 0 : rec.shown; }
  function styleRecord(rec) {
    var p = resolveParams(rec), pos = rec.spec.value > 0, neg = rec.spec.value < 0;
    rec.span.style.gap = p.SP;
    rec.span.setAttribute('aria-label', finalText(rec, p));
    rec.numEl.style.display = 'inline-block';
    rec.numEl.style.fontVariantNumeric = 'tabular-nums';
    setStyle(rec.numEl, 'fontSize', resolveSize(p.NS));
    setStyle(rec.numEl, 'fontWeight', p.NW);
    var color = '';
    if (p.SIGN_COLOR === 'TRUE' && pos) color = '#1a56db';
    else if (p.SIGN_COLOR === 'TRUE' && neg) color = '#e02424';
    else if (p.NTC) color = p.NTC;
    setStyle(rec.numEl, 'color', color);
    rec.prefixEls.forEach(function (e) { setStyle(e, 'fontSize', resolveSize(p.PS)); setStyle(e, 'fontWeight', p.PW); });
    rec.suffixEls.forEach(function (e) { setStyle(e, 'fontSize', resolveSize(p.SS)); setStyle(e, 'fontWeight', p.SW); });
    reserveWidth(rec, p, currentValue(rec));
    return p;
  }
  var ALIGN = { L: 'left', C: 'center', R: 'right' };
  var JUSTIFY = { L: 'flex-start', C: 'center', R: 'flex-end' };
  /* 노션 텍스트 블록은 글자 줄이 display:flex 래퍼 안에 있어서 text-align만으로는 정렬되지 않을 수 있다. 둘 다 지정한다. */
  function alignBlock(block, ta) {
    block.style.textAlign = ALIGN[ta] || 'left';
    elementChildren(block).forEach(function (c) {
      if (c.style && c.style.display === 'flex') c.style.justifyContent = JUSTIFY[ta] || 'flex-start';
    });
  }
  function setRole(block, role, p) {
    var size = role === 'lbl' ? resolveSize(p.LS) : resolveSize(p.TS), weight = role === 'lbl' ? p.LW : p.TW;
    block.classList.add('cc-role');
    alignBlock(block, p.TA);
    if (size) { block.classList.add('cc-sz'); block.style.setProperty('--cc-fs', size); }
    else { block.classList.remove('cc-sz'); block.style.removeProperty('--cc-fs'); }
    if (weight) { block.classList.add('cc-wt'); block.style.setProperty('--cc-fw', weight); }
    else { block.classList.remove('cc-wt'); block.style.removeProperty('--cc-fw'); }
  }
  function styleCard(container) {
    var blocks = ownBlocks(container), current = null, labelDone = false, params = null;
    blocks.forEach(function (b) {
      var rec = records.filter(function (r) { return r.blockEl === b && r.span.isConnected !== false; })[0];
      if (rec) {
        current = rec; labelDone = false; params = resolveParams(rec);
        alignBlock(b, params.TA);
        b.classList.add('cc-has-counter');
        return;
      }
      if (!current) return;
      var hidden = false;
      try { hidden = global.getComputedStyle(b).display === 'none'; } catch (e) {}
      if (hidden || !textOf(b).trim()) return;
      setRole(b, labelDone ? 'txt' : 'lbl', params);
      labelDone = true;
    });
  }
  function restyleAll() {
    var cards = [];
    records.forEach(function (rec) {
      styleRecord(rec);
      var c = nearestContainer(rec.span.parentNode);
      if (c && cards.indexOf(c) === -1) cards.push(c);
      if (!c && rec.blockEl) {
        var p = resolveParams(rec);
        alignBlock(rec.blockEl, p.TA);
      }
    });
    cards.forEach(styleCard);
  }

  /* ---------- 카운트업 ---------- */
  var reduceMotion = false;
  try { reduceMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
  function showValue(rec, value, params) {
    rec.shown = value;
    rec.numEl.textContent = formatNumber(value, rec.spec, params);
  }
  function play(rec) {
    var p = resolveParams(rec), duration = parseInt(p.DURATION, 10) || 1500, ease = EASE_FN[p.EASE] || EASE_FN.OUT;
    var target = rec.spec.value, start = global.performance.now();
    if (rec.raf) global.cancelAnimationFrame(rec.raf);
    rec.played = true;
    if (reduceMotion || target === 0 || duration <= 0) { showValue(rec, target, p); return; }
    function frame(now) {
      var t = Math.min((now - start) / duration, 1);
      showValue(rec, target * ease(t), p);
      if (t < 1) rec.raf = global.requestAnimationFrame(frame);
      else { rec.raf = null; showValue(rec, target, p); }
    }
    rec.raf = global.requestAnimationFrame(frame);
  }
  function reset(rec) {
    if (rec.raf) global.cancelAnimationFrame(rec.raf);
    rec.raf = null;
    rec.played = false;
    showValue(rec, 0, resolveParams(rec));
  }
  function groupElementOf(rec) { return nearestContainer(rec.span.parentNode) || rec.span; }
  function attachGroup(rec) {
    var el = groupElementOf(rec), g = groups.get(el);
    if (!g) {
      g = { el: el, recs: [], active: false, io: null };
      if (typeof global.IntersectionObserver !== 'undefined' && !reduceMotion) {
        g.io = new global.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              g.active = true;
              g.recs.forEach(play);
            } else if (g.active) {
              g.active = false;
              g.recs.forEach(function (r) { if (r.played && resolveParams(r).REPLAY === 'TRUE') reset(r); });
            }
          });
        }, { threshold: 0.4 });
        g.io.observe(el);
      }
      groups.set(el, g);
    }
    g.recs.push(rec);
    rec.group = g;
    if (reduceMotion) showValue(rec, rec.spec.value, resolveParams(rec));
    else if (g.active) play(rec);
  }

  /* ---------- 마커 찾기·바꾸기 ---------- */
  var perBlockCount = new Map();
  function processTextNode(node) {
    var text = node.nodeValue || '', parent = node.parentNode;
    if (!parent || insideCounter(node)) return false;
    var matches = [], m;
    MARKER_RE.lastIndex = 0;
    while ((m = MARKER_RE.exec(text))) matches.push({ index: m.index, end: m.index + m[0].length, inner: m[1], raw: m[0] });
    if (!matches.length) return false;
    var blockEl = blockOf(node), pieces = [], last = 0, created = [], changed = false;
    matches.forEach(function (mt) {
      var parsed = parseMarker(mt.inner);
      if (!parsed) return;
      var key = blockEl || 'page', idx = perBlockCount.get(key) || 0;
      perBlockCount.set(key, idx + 1);
      var rec = buildCounter(parsed, blockEl, idx);
      if (mt.index > last) pieces.push(document.createTextNode(text.slice(last, mt.index)));
      pieces.push(rec.span);
      created.push(rec);
      last = mt.end;
      changed = true;
    });
    if (!changed) return false;
    if (last < text.length) pieces.push(document.createTextNode(text.slice(last)));
    pieces.forEach(function (p) { parent.insertBefore(p, node); });
    parent.removeChild(node);
    created.forEach(function (rec) {
      records.push(rec);
      rec.shown = 0;
      styleRecord(rec);
      attachGroup(rec);
    });
    return true;
  }
  function scanMarkers(root) {
    if (!root) return;
    var nodes = collectTextNodes(root, []), any = false;
    nodes.forEach(function (n) { if (processTextNode(n)) any = true; });
    if (any) restyleAll();
  }

  /* ---------- 토큰 [% call-counter %] ---------- */
  function renderToken(payload) {
    var block = payload && payload.block, container = nearestContainer(block);
    var parsed = softNormalize(payload && payload.params, '토큰');
    if (container) scopes.set(container, parsed); else pageScope = parsed;
    restyleAll();
  }

  /* ---------- 스타일 ---------- */
  function injectStyle() {
    if (document.getElementById('engine-call-counter-style-v4')) return;
    var st = document.createElement('style');
    st.id = 'engine-call-counter-style-v4';
    st.textContent =
      '.cc-counter{display:inline-flex;align-items:baseline;white-space:nowrap}' +
      '.cc-number{font-variant-numeric:tabular-nums}' +
      '.cc-sz,.cc-sz *{font-size:var(--cc-fs)!important}' +
      '.cc-wt,.cc-wt *{font-weight:var(--cc-fw)!important}';
    document.head.appendChild(st);
  }

  /* ---------- 대시보드 API ---------- */
  function writeCommon() {
    if (!commonStyle) {
      commonStyle = document.createElement('style');
      commonStyle.id = 'call-counter-dashboard-preview-v1';
      document.head.appendChild(commonStyle);
    }
    commonStyle.textContent = ':root{' + Object.keys(commonEdited).map(function (k) {
      return FIELD_BY_KEY[k].css + ':' + (commonEdited[k] === '' ? 'NONE' : commonEdited[k]) + '!important;';
    }).join('') + '}';
    refCache = {};
    restyleAll();
  }
  function commonRead() {
    var values = cssDefaults(), explicit = cssExplicit();
    return { values: values, explicit: explicit, edited: clone(commonEdited), note: '토큰·마커 설정이 공통 CSS보다 우선합니다.' };
  }
  function commonApply(patch) {
    var v = normalizePatch(patch), old = clone(commonEdited);
    Object.keys(v).forEach(function (k) { if (v[k] === null) delete commonEdited[k]; else commonEdited[k] = v[k]; });
    try { writeCommon(); } catch (e) { commonEdited = old; writeCommon(); throw e; }
    return commonRead();
  }
  function commonRestore() { commonEdited = {}; writeCommon(); return commonRead(); }
  function commonCss(options) {
    var lines = [], all = options && options.full, now = commonRead().values;
    FIELDS.forEach(function (f) {
      var v = now[f.key];
      if (all || String(v) !== String(f.defaultValue)) lines.push('  ' + f.css + ': ' + (v === '' ? 'NONE' : v) + ';');
    });
    return lines.length ? ':root {\n' + lines.join('\n') + '\n}' : '/* 엔진 기본값 사용: 이전 call-counter 공통 설정 블록은 제거하세요. */';
  }

  function recById(id) {
    var r = records.filter(function (x) { return x.id === id && x.span.isConnected !== false; })[0];
    if (!r) throw new Error('카운터를 찾을 수 없습니다. dashboard.counters.list()의 id를 사용하세요.');
    return r;
  }
  function settingsText(map) {
    return Object.keys(map).map(function (k) { return k + ' ' + map[k]; });
  }
  function mergedMarker(rec) {
    var m = {};
    mergeInto(m, rec.markerParams);
    Object.keys(rec.edit).forEach(function (k) { if (rec.edit[k] === null) delete m[k]; else m[k] = rec.edit[k]; });
    return m;
  }
  function counterRead(id) {
    var rec = recById(id), p = resolveParams(rec);
    return {
      id: rec.id, config: p, marker: clone(rec.markerParams), edit: clone(rec.edit), edited: Object.keys(rec.edit).length > 0,
      number: rec.spec.text, prefix: rec.prefix.slice(), suffix: rec.suffix.slice(), text: finalText(rec, p),
      runtime: { played: rec.played, shown: rec.shown }
    };
  }
  function counterApply(id, patch) {
    var rec = recById(id), v = normalizePatch(patch), old = clone(rec.edit);
    Object.keys(v).forEach(function (k) { rec.edit[k] = v[k]; });
    try { restyleAll(); } catch (e) { rec.edit = old; restyleAll(); throw e; }
    return counterRead(id);
  }
  function counterRestore(id) { var rec = recById(id); rec.edit = {}; restyleAll(); return counterRead(id); }
  function counterToken(id) {
    var rec = recById(id), parts = rec.prefix.map(function (t) { return /::|^\s|\s$|^@/.test(t) ? '"' + t + '"' : t; });
    parts.push(rec.spec.text);
    rec.suffix.forEach(function (t) { parts.push(/::|^\s|\s$|^@/.test(t) ? '"' + t + '"' : t); });
    var m = mergedMarker(rec);
    Object.keys(m).forEach(function (k) { parts.push('@' + k + ' ' + m[k]); });
    return '[# ' + parts.join(' :: ') + ' #]';
  }
  function counterList() {
    return records.filter(function (r) { return r.span.isConnected !== false; }).map(function (r, i) {
      return { id: r.id, index: i, title: finalText(r, resolveParams(r)), element: r.span };
    });
  }

  function scopeList() {
    var out = [], seen = [];
    records.forEach(function (rec) {
      if (rec.span.isConnected === false) return;
      var c = nearestContainer(rec.span.parentNode);
      var key = c || 'page';
      if (seen.indexOf(key) !== -1) return;
      seen.push(key);
      var bid = c && c.getAttribute && c.getAttribute('data-block-id');
      out.push({ id: bid || (c ? 'scope-' + out.length : 'page'), index: out.length, title: finalText(rec, resolveParams(rec)), element: c || document.body, container: c });
    });
    return out;
  }
  function scopeById(id) {
    var s = scopeList().filter(function (x) { return x.id === id; })[0];
    if (!s) throw new Error('범위를 찾을 수 없습니다. dashboard.scopes.list()의 id를 사용하세요.');
    return s;
  }
  function scopeRead(id) {
    var s = scopeById(id), base = s.container ? (scopes.get(s.container) || {}) : (pageScope || {}), edit = s.container ? (scopeEdits.get(s.container) || {}) : pageEdit;
    return { id: id, token: clone(base), edit: clone(edit), edited: Object.keys(edit).length > 0, effective: s.container ? scopeParams(s.container) : (function () { var p = {}; mergeInto(p, pageScope); return p; })() };
  }
  function scopeApply(id, patch) {
    var s = scopeById(id), v = normalizePatch(patch);
    var edit = s.container ? (scopeEdits.get(s.container) || {}) : pageEdit;
    Object.keys(v).forEach(function (k) { edit[k] = v[k]; });
    if (s.container) scopeEdits.set(s.container, edit);
    restyleAll();
    return scopeRead(id);
  }
  function scopeRestore(id) {
    var s = scopeById(id);
    if (s.container) scopeEdits.delete(s.container); else pageEdit = {};
    restyleAll();
    return scopeRead(id);
  }
  function scopeToken(id) {
    var r = scopeRead(id), m = {};
    mergeInto(m, r.token);
    Object.keys(r.edit).forEach(function (k) { if (r.edit[k] === null) delete m[k]; else m[k] = r.edit[k]; });
    var parts = settingsText(m);
    return '[% call-counter' + (parts.length ? ' :: ' + parts.join(' :: ') : '') + ' %]';
  }

  function diagnose() {
    var rows = counterList().map(function (c) {
      var r = recById(c.id);
      return { id: c.id, text: c.title, group: !!r.group, played: r.played, edited: Object.keys(r.edit).length > 0 };
    });
    console.table(rows);
    return rows;
  }

  global.CallCounterEngine = {
    version: VERSION,
    rescan: function () { scanMarkers(document.body); },
    diagnose: diagnose,
    dashboard: {
      apiVersion: '1.0.0',
      schema: function () { return clone(FIELDS); },
      common: { read: commonRead, apply: commonApply, restore: commonRestore, css: commonCss },
      counters: { list: counterList, read: counterRead, apply: counterApply, restore: counterRestore, token: counterToken },
      scopes: { list: scopeList, read: scopeRead, apply: scopeApply, restore: scopeRestore, token: scopeToken }
    }
  };

  injectStyle();
  Core.register('call-counter', renderToken);
  Core.scan(document);

  function start() {
    scanMarkers(document.body);
    if (typeof global.MutationObserver !== 'undefined' && document.body) {
      var timer = 0;
      new global.MutationObserver(function (list) {
        var added = list.some(function (m) { return m.addedNodes && m.addedNodes.length && !insideCounter(m.target); });
        if (!added || timer) return;
        timer = global.requestAnimationFrame(function () { timer = 0; scanMarkers(document.body); });
      }).observe(document.body, { childList: true, subtree: true });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { refCache = {}; restyleAll(); });
    global.addEventListener('resize', function () { records.forEach(function (r) { if (r.span.isConnected !== false) styleRecord(r); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  console.log('[call-counter] 카운트업 엔진 로드 완료 (v' + VERSION + ')');
})(window);
