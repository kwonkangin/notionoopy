// =========================================================
// toggle-e4d.js
// 버전: 1.1.0
// 설명: 노션/우피의 토글(일반 토글, 제목 토글 H1~H4)의 기호·배치·색을 바꾸는 단독 모듈. CSS 파일 없이 이 파일 하나로 동작한다.
// 의존성: 없음 (core.js 불필요). 모드 4에서만 폰트어썸 CSS를 cdnjs에서 불러온다.
// ---------------------------------------------------------
// [변경]
//  1.1.0  icon-stroke 추가(모드 2·3 선 굵기 thin/normal/bold). 모드 2 기본 두께가 폰트어썸 plus/minus(bold)보다 얇은 normal이 된다.
//  1.0.0  최초 작성
//
// [개요]
//  - 설정은 노션에 붙여넣는 <style>의 :root CSS 변수 하나로 받는다.  --toggle-이름_e4d
//  - 이 파일이 변수를 읽어 필요한 CSS만 만들어 <style id="toggle-style_e4d">로 넣는다. (사용하지 않는 모드의 CSS는 만들지 않는다)
//  - 토큰([% %])은 쓰지 않는다. 토글별 개별 설정은 없다. 사이트 전체에 같은 설정이 적용된다.
//  - 실제 토글만 골라서 표시한다. 화살표(svg)가 있고 글자가 없는 div[role="button"]이 들어 있는 블록만 대상이다.
//    그래서 '문의하기' 같은 일반 버튼, 일반 텍스트 블록, 일반 제목에는 아무것도 적용되지 않는다.
//  - 우피가 바꿀 수 있는 해시 클래스(css-xxxx)와 콜아웃 전용 클래스는 쓰지 않는다. notion-*-block 클래스와 구조만 사용한다.
//
// [로드]  <script src=".../toggle-e4d.js" defer></script>  한 줄이면 된다. 옛 toggle-master 링크(CSS+JS)는 모두 제거한다.
//  - 이미 로드된 경우 두 번째 로드는 건너뛴다. 옛 toggle-master가 남아 있으면 콘솔에 경고한다.
//
// [CSS 변수]  :root { --toggle-이름_e4d: 값; }   값이 비어 있거나 변수가 없으면 기본값을 쓴다. 숫자만 쓰면 px(폰트 크기는 em)이다.
//   이름           기본값            값
//   mode           3                 1 노션 순정, 2 +/-, 3 꺾쇠 회전, 4 폰트어썸(fa-closed/fa-opened)
//   icon-auto      1                 1 글자 크기에 맞춤(1.2em), 0 icon-size로 고정
//   icon-size      20                수동 크기(icon-auto 0일 때)
//   icon-flip      none              none, x(좌우), y(상하), xy
//   icon-stroke    normal            선 굵기 thin, normal, bold. 모드 2·3에만 적용 (모드 4는 폰트어썸 글리프라 적용되지 않음)
//                                    모드 2: 32 / 48 / 64 (bold가 폰트어썸 plus·minus와 같은 두께), 모드 3: 7 / 10 / 13
//   icon-color     (비움)            비우면 글자색을 따른다. 색을 쓰면 그 색
//   fa-closed      fa-solid fa-chevron-right   모드 4 닫힘 기호(폰트어썸 클래스, 따옴표 불필요)
//   fa-opened      fa-solid fa-chevron-down    모드 4 열림 기호
//   icon-side      left              left, right
//   icon-valign    top               top, center, bottom
//   align          left              left, center, right (토글 제목과 내용의 글자 정렬)
//   padx / pady / gap   10 / 8 / 8   좌우·상하 여백, 기호와 글자 간격
//   theme          1                 1 노션 순정 색, 2 아래 색으로 덮어쓰기
//   text-color     #37352f           theme 2의 글자색
//   bg-color       #fdebec           theme 2의 배경색 (일반 토글만)
//   radius         8                 모서리 둥글기 (일반 토글만)
//   border-width   1                 테두리 굵기 (일반 토글만)
//   border-color   #d1d1d1cc         theme 2의 테두리색 (일반 토글만)
//   hover          0                 1 호버 효과 켜기, 0 끄기(노션 기본 회색 호버도 막는다)
//   speed          200               전환 속도(ms)
//   hover-bg / hover-border / hover-text / hover-icon   #f5d6d8 / #ff4500 / #ff4500 / #ff4500
//   font           0                 1 아래 폰트 서식 사용, 0 노션 기본 서식
//   h1-size h1-weight h1-color ... h4-*   제목1~4 (기본 1.85em/700, 1.5em/700, 1.25em/600, 1.15em/600)
//   title-size/weight/color   일반 토글 제목 (1.05em/500/#37352f)
//   bd-size/weight/color      일반 토글 본문 (0.95em/400/#666666)
//   색은 #rrggbbaa(투명도 포함), rgb(), 색 이름 모두 가능하다.
//
// [적용 범위]
//  - 일반 토글(.notion-toggle-block / .notion-text-block 안의 토글): 기호, 배치, 정렬, 여백, 박스(배경·테두리·둥글기), 호버, 폰트
//  - 제목 토글(H1~H4): 기호, 배치, 정렬, 여백, 글자색, 호버 기호색, 폰트. 박스는 만들지 않는다.
//    (카드 모양은 카드 엔진 등 바깥에서 그리는 경우가 많아 이중 박스를 막기 위함)
//
// [공개 API]  window.toggle_e4d
//  version, rescan(), refresh(), diagnose(), compare()
//  compare()      모드 2의 +/- 모양(bold)을 폰트어썸 글리프와 겹쳐 보여 주는 비교 패널을 열고 닫는다. (CDN에서 폰트어썸을 임시로 불러온다)
//  dashboard.apiVersion 1.0.0
//  dashboard.schema()                       설정 항목의 key, css, type, defaultValue, group, options
//  dashboard.common.read()                  지금 적용 중인 값(기본값 + 페이지 변수 + 임시 편집)
//  dashboard.common.explicit()              페이지 :root에 실제로 적힌 값
//  dashboard.common.edits()                 임시 편집만
//  dashboard.common.apply(patch)            임시 편집. 값이 null이면 그 항목의 임시 편집 해제. 잘못된 값이면 아무것도 바꾸지 않고 오류
//  dashboard.common.restore(keys)           임시 편집 해제(keys 생략하면 전체)
//  dashboard.common.css({full})             기본값과 다른 값만 :root 블록으로 출력. full이면 전체
//  임시 편집은 화면에만 반영된다. 새로고침하면 사라진다.
//
// [외부에 드러나는 이름]  접미사 e4d
//  data-toggle_e4d(토글 블록: t/h1~h4), data-toggle-row_e4d(행: t/h), data-toggle-btn_e4d(화살표 버튼), data-toggle-open_e4d(열림 1)
//  클래스 toggle-fa_e4d(모드 4 아이콘), <style id="toggle-style_e4d">, <link id="toggle-fa-css_e4d">
//
// [알려진 제한]
//  - 열림 상태는 aria-expanded, aria-label(접기/Collapse/Close), 화살표 svg의 180도 회전 순서로 판단한다. 노션이 다른 방식으로 바꾸면 모드 2·3·4의 열림 표시가 어긋날 수 있다.
//  - 행 구조는 기존 CSS가 쓰던 구조(일반 토글: 블록의 첫 div, 제목 토글: 블록의 첫 div 안의 첫 div)를 따른다. 구조가 다르면 버튼의 부모를 행으로 쓴다.
//  - 접힌 토글의 안쪽 블록은 노션이 그리지 않을 수 있어, 안쪽 토글은 펼친 뒤에 적용될 수 있다.
//  - 모드 2의 +/- 모양은 선(둥근 끝)으로 그린 SVG 마스크이며, bold는 폰트어썸 6 Solid plus/minus와 같은 크기·두께다. 폰트어썸 폰트와 같은지는 compare()로 직접 확인한다.
//  - 검증 범위: 가짜 노션 구조(토글, 제목 토글, 일반 문단, 일반 버튼)를 넣은 Chromium 테스트. 실제 노션·우피 화면에서의 동작은 직접 확인해야 한다.
//
// 모드 2의 크기·모양 기준: Font Awesome Free 6 by @fontawesome - https://fontawesome.com
//   License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
// =========================================================

(function (global) {
  'use strict';

  var VERSION = '1.1.0';
  var SFX = '_e4d';
  var doc = global.document;
  var root = doc.documentElement;

  if (global.toggle_e4d) {
    console.warn('[toggle] 이미 로드된 toggle(v' + (global.toggle_e4d.version || '?') + ')가 있어 건너뜁니다.');
    return;
  }

  var BLK = 'data-toggle' + SFX;
  var ROW = 'data-toggle-row' + SFX;
  var BTN = 'data-toggle-btn' + SFX;
  var OPEN = 'data-toggle-open' + SFX;
  var FA_CLASS = 'toggle-fa' + SFX;
  var STYLE_ID = 'toggle-style' + SFX;
  var FA_LINK_ID = 'toggle-fa-css' + SFX;
  var CMP_ID = 'toggle-compare' + SFX;
  var FA_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

  var BLOCKS = {
    'notion-toggle-block': 't', 'notion-text-block': 't',
    'notion-header-block': 'h1', 'notion-sub_header-block': 'h2',
    'notion-sub_sub_header-block': 'h3', 'notion-header_4-block': 'h4'
  };
  var BLOCK_SEL = Object.keys(BLOCKS).map(function (c) { return '.' + c; }).join(',');
  var BTN_SEL = Object.keys(BLOCKS).map(function (c) { return '.' + c + ' div[role="button"]'; }).join(',');
  var OPEN_LABELS = ['접기', 'collapse', 'close'];
  var CLOSED_LABELS = ['펼치기', 'expand', 'open'];
  var FLIP = { none: '', x: 'scaleX(-1)', y: 'scaleY(-1)', xy: 'scale(-1,-1)' };

  /* 모드 2 +/- (폰트어썸 6 Solid plus/minus와 같은 크기, viewBox 448x512, 둥근 끝 선)와 모드 3 꺾쇠 */
  var STROKE = { pm: { thin: 32, normal: 48, bold: 64 }, chev: { thin: 7, normal: 10, bold: 13 } };
  function pmSvg(kind, w) {
    var a = 16 + w / 2, b = 432 - w / 2;
    var d = kind === 'plus' ? 'M' + a + ' 256H' + b + 'M224 ' + (48 + w / 2) + 'V' + (464 - w / 2) : 'M' + a + ' 256H' + b;
    return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path d='" + d + "' fill='none' stroke='black' stroke-width='" + w + "' stroke-linecap='round'/></svg>";
  }
  function chevSvg(w) {
    return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polyline points='20,35 50,65 80,35' fill='none' stroke='black' stroke-width='" + w + "' stroke-linecap='round' stroke-linejoin='round'/></svg>";
  }
  function uri(s) { return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) + '")'; }

  /* ---------- 설정 항목 ---------- */
  var FIELDS = [];
  function def(key, type, dv, group, options) {
    FIELDS.push({ key: key, css: '--toggle-' + key + SFX, type: type, defaultValue: dv, group: group, options: options || null });
  }
  def('mode', 'enum', '3', 'icon', ['1', '2', '3', '4']);
  def('icon-auto', 'bool', '1', 'icon');
  def('icon-size', 'len', '20px', 'icon');
  def('icon-flip', 'enum', 'none', 'icon', ['none', 'x', 'y', 'xy']);
  def('icon-stroke', 'enum', 'normal', 'icon', ['thin', 'normal', 'bold']);
  def('icon-color', 'color', '', 'icon');
  def('fa-closed', 'fa', 'fa-solid fa-chevron-right', 'icon');
  def('fa-opened', 'fa', 'fa-solid fa-chevron-down', 'icon');
  def('icon-side', 'enum', 'left', 'layout', ['left', 'right']);
  def('icon-valign', 'enum', 'top', 'layout', ['top', 'center', 'bottom']);
  def('align', 'enum', 'left', 'layout', ['left', 'center', 'right']);
  def('padx', 'len', '10px', 'space');
  def('pady', 'len', '8px', 'space');
  def('gap', 'len', '8px', 'space');
  def('theme', 'enum', '1', 'theme', ['1', '2']);
  def('text-color', 'color', '#37352f', 'theme');
  def('bg-color', 'color', '#fdebec', 'theme');
  def('radius', 'len', '8px', 'theme');
  def('border-width', 'len', '1px', 'theme');
  def('border-color', 'color', '#d1d1d1cc', 'theme');
  def('hover', 'bool', '0', 'hover');
  def('speed', 'ms', '200ms', 'hover');
  def('hover-bg', 'color', '#f5d6d8', 'hover');
  def('hover-border', 'color', '#ff4500', 'hover');
  def('hover-text', 'color', '#ff4500', 'hover');
  def('hover-icon', 'color', '#ff4500', 'hover');
  def('font', 'bool', '0', 'font');
  [['h1', '1.85em', '700', '#111111'], ['h2', '1.5em', '700', '#222222'], ['h3', '1.25em', '600', '#333333'],
   ['h4', '1.15em', '600', '#444444'], ['title', '1.05em', '500', '#37352f'], ['bd', '0.95em', '400', '#666666']
  ].forEach(function (r) {
    def(r[0] + '-size', 'size', r[1], 'font');
    def(r[0] + '-weight', 'weight', r[2], 'font');
    def(r[0] + '-color', 'color', r[3], 'font');
  });
  var BY_KEY = {};
  FIELDS.forEach(function (f) { BY_KEY[f.key] = f; });

  var warned = {};
  function warnOnce(msg) { if (warned[msg]) return; warned[msg] = true; console.warn('[toggle] ' + msg); }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  /* ---------- 값 검사·정규화 ---------- */
  function validColor(s) {
    try { if (global.CSS && global.CSS.supports) return global.CSS.supports('color', s); } catch (e) {}
    return /^(#[0-9a-f]{3,8}|rgba?\(.*\)|hsla?\(.*\)|[a-z]+)$/i.test(s);
  }
  function normalizeValue(f, raw) {
    var s = String(raw == null ? '' : raw).trim(), u = s.toUpperCase(), low = s.toLowerCase(), n;
    if (s === '' || u === 'NONE' || u === 'INHERIT') return f.defaultValue;
    switch (f.type) {
      case 'enum':
        if (f.options.indexOf(low) !== -1) return low;
        throw new Error(f.key + ': ' + f.options.join(', ') + ' 중 하나여야 합니다.');
      case 'bool':
        if (/^(1|on|true|yes|y)$/.test(low)) return '1';
        if (/^(0|off|false|no|n)$/.test(low)) return '0';
        throw new Error(f.key + ': 1/0 (true/false)만 쓸 수 있습니다.');
      case 'len':
        if (/^\d+(\.\d+)?$/.test(s)) return s + 'px';
        if (/^\d+(\.\d+)?(px|em|rem)$/.test(low)) return low;
        throw new Error(f.key + ': 숫자(px) 또는 px/em/rem 값이어야 합니다.');
      case 'ms':
        if (/^\d+(\.\d+)?s$/.test(low)) return Math.round(parseFloat(low) * 1000) + 'ms';
        if (/^\d+(\.\d+)?(ms)?$/.test(low)) return Math.round(parseFloat(low)) + 'ms';
        throw new Error(f.key + ': 시간은 ms 숫자(예: 200)여야 합니다.');
      case 'color':
        if (validColor(s)) return s;
        throw new Error(f.key + ': 색 형식이 잘못되었습니다.');
      case 'fa':
        s = s.replace(/['"]/g, '').replace(/\s+/g, ' ').trim();
        if (/^[a-z0-9\- ]+$/i.test(s) && s) return s;
        throw new Error(f.key + ': 폰트어썸 클래스(예: fa-solid fa-plus)만 쓸 수 있습니다.');
      case 'size':
        if (/^\d+(\.\d+)?$/.test(s)) return s + 'em';
        if (/^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/.test(low)) return low;
        throw new Error(f.key + ': 숫자(em) 또는 px/em/rem/%/vw/vh 값이어야 합니다.');
      case 'weight':
        if (low === 'normal') return '400';
        if (low === 'bold') return '700';
        n = Number(s);
        if (isFinite(n) && n >= 100 && n <= 900) return String(Math.round(n));
        throw new Error(f.key + ': 굵기는 100~900, normal, bold만 쓸 수 있습니다.');
    }
    return s;
  }
  function normalizePatch(patch) {
    var out = {};
    Object.keys(patch || {}).forEach(function (k) {
      var key = String(k).toLowerCase().trim(), f = BY_KEY[key];
      if (!f) throw new Error('지원하지 않는 설정: ' + k);
      out[key] = patch[k] === null ? null : normalizeValue(f, patch[k]);
    });
    return out;
  }

  var pageVals = {};
  var edits = {};
  var cfg = {};

  function readPage() {
    var cs, out = {};
    try { cs = global.getComputedStyle(root); } catch (e) { cs = null; }
    FIELDS.forEach(function (f) {
      var raw = cs ? String(cs.getPropertyValue(f.css) || '').trim() : '';
      if (!raw) return;
      try { out[f.key] = normalizeValue(f, raw); }
      catch (e) { warnOnce('CSS 변수 ' + f.css + ' 값을 무시합니다: ' + e.message); }
    });
    pageVals = out;
  }
  function explicitRaw() {
    var cs, out = {};
    try { cs = global.getComputedStyle(root); } catch (e) { cs = null; }
    FIELDS.forEach(function (f) { out[f.key] = cs ? String(cs.getPropertyValue(f.css) || '').trim() : ''; });
    return out;
  }
  function resolve() {
    var c = {};
    FIELDS.forEach(function (f) {
      var v = f.defaultValue;
      if (has(pageVals, f.key)) v = pageVals[f.key];
      if (has(edits, f.key) && edits[f.key] !== null) v = edits[f.key];
      c[f.key] = v;
    });
    cfg = c;
  }

  /* ---------- CSS 만들기 ---------- */
  function fontDecl(c, p) {
    var d = '';
    if (c[p + '-size']) d += 'font-size:' + c[p + '-size'] + '!important;';
    if (c[p + '-weight']) d += 'font-weight:' + c[p + '-weight'] + '!important;';
    if (c[p + '-color']) d += 'color:' + c[p + '-color'] + '!important;';
    return d;
  }
  function buildCss(c) {
    var o = [], sp = c.speed, mode = c.mode, hov = c.hover === '1', th2 = c.theme === '2';
    var B = '[' + BTN + ']', R = '[' + ROW + ']', RT = '[' + ROW + '="t"]', RH = '[' + ROW + '="h"]', K = '[' + BLK + ']';
    var va = { top: 'flex-start', center: 'center', bottom: 'flex-end' }[c['icon-valign']];
    var flip = FLIP[c['icon-flip']] || '';
    var col = c['icon-color'] || 'currentColor';
    var size = c['icon-auto'] === '1' ? '1.2em' : c['icon-size'];

    o.push(R + '{flex-direction:' + (c['icon-side'] === 'right' ? 'row-reverse' : 'row') + '!important;align-items:' + va +
      '!important;gap:' + c.gap + '!important;padding:' + c.pady + ' ' + c.padx + '!important;transition:background-color ' + sp +
      ' ease,border-color ' + sp + ' ease,color ' + sp + ' ease!important}');
    o.push(K + '{text-align:' + c.align + '!important}');
    o.push(K + ' [contenteditable],' + K + ' [data-root="true"]{width:100%!important;display:block!important;text-align:' + c.align + '!important}');

    o.push(B + '{background-color:transparent!important;transition:none!important}');
    o.push(B + ':hover{background-color:transparent!important}');
    if (mode !== '1') {
      o.push(B + '{position:relative!important;width:' + size + '!important;height:' + size + '!important;margin-top:.18em!important}');
      o.push(B + ' svg{display:none!important}');
    }
    if (mode === '2' || mode === '3') {
      var st = c['icon-stroke'];
      var m0 = mode === '2' ? uri(pmSvg('plus', STROKE.pm[st])) : uri(chevSvg(STROKE.chev[st]));
      o.push(B + '::after{content:"";position:absolute;left:0;top:0;width:100%;height:100%;background-color:' + col +
        ';-webkit-mask:' + m0 + ' center/contain no-repeat;mask:' + m0 + ' center/contain no-repeat;transform:' + (flip || 'none') +
        ';transition:transform ' + sp + ' ease,background-color ' + sp + ' ease}');
      var OP = '[' + OPEN + '="1"]';
      if (mode === '2') {
        var m1 = uri(pmSvg('minus', STROKE.pm[st]));
        o.push(B + OP + '::after{-webkit-mask-image:' + m1 + ';mask-image:' + m1 + '}');
      } else {
        o.push(B + OP + '::after{transform:' + (flip ? flip + ' ' : '') + 'rotate(180deg)}');
      }
    }
    if (mode === '4') {
      o.push(B + ' .' + FA_CLASS + '{display:flex!important;align-items:center;justify-content:center;width:100%;height:100%;font-size:' + size +
        '!important;color:' + col + '!important;transform:' + (flip || 'none') + '!important;transition:color ' + sp + ' ease}');
    }

    o.push(RT + '{border:' + c['border-width'] + ' solid transparent!important;box-sizing:border-box!important;border-radius:' + c.radius + '!important}');
    if (th2) {
      o.push(R + '{color:' + c['text-color'] + '!important;fill:' + c['text-color'] + '!important}');
      o.push(R + ' span[data-token-index]{color:inherit!important;fill:inherit!important}');
      o.push(RT + '{background-color:' + c['bg-color'] + '!important;border-color:' + c['border-color'] + '!important}');
    }
    if (hov) {
      o.push(RT + ':hover{background-color:' + c['hover-bg'] + '!important;border-color:' + c['hover-border'] + '!important}');
      if (th2) o.push(R + ':hover{color:' + c['hover-text'] + '!important}');
      if (mode === '2' || mode === '3') o.push(R + ':hover ' + B + '::after{background-color:' + c['hover-icon'] + '!important}');
      if (mode === '4') o.push(R + ':hover ' + B + ' .' + FA_CLASS + '{color:' + c['hover-icon'] + '!important}');
    } else {
      o.push(RT + ':hover{background-color:' + (th2 ? c['bg-color'] : 'transparent') + '!important;border-color:' + (th2 ? c['border-color'] : 'transparent') + '!important}');
      o.push(RH + ':hover{background-color:transparent!important}');
    }

    if (c.font === '1') {
      [['h1', 'h2'], ['h2', 'h3'], ['h3', 'h4'], ['h4', 'h5']].forEach(function (p) {
        o.push(K.slice(0, -1) + '="' + p[0] + '"] ' + p[1] + '{' + fontDecl(c, p[0]) + '}');
      });
      o.push(RT + '>:nth-child(2)>:first-child [contenteditable]{' + fontDecl(c, 'title') + '}');
      o.push(RT + '>:nth-child(2)>:nth-child(2){' + fontDecl(c, 'bd') + '}');
    }
    o.push('@media (prefers-reduced-motion:reduce){' + B + '::after,' + B + ' .' + FA_CLASS + '{transition:none!important}}');
    return o.join('\n');
  }

  /* ---------- 스타일·폰트어썸 ---------- */
  var styleEl = null;
  function ensureStyle() {
    if (styleEl && styleEl.isConnected) return styleEl;
    styleEl = doc.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = STYLE_ID;
      (doc.head || root).appendChild(styleEl);
    }
    return styleEl;
  }
  var lastCss = null;
  function applyStyle() {
    var text = buildCss(cfg), el = ensureStyle();
    if (text !== lastCss || el.textContent !== text) { el.textContent = text; lastCss = text; }
  }
  function syncFaLink() {
    var link = doc.getElementById(FA_LINK_ID);
    if (cfg.mode === '4') {
      if (!link) {
        link = doc.createElement('link');
        link.id = FA_LINK_ID; link.rel = 'stylesheet'; link.href = FA_URL;
        (doc.head || root).appendChild(link);
      }
    } else if (link) {
      link.parentNode.removeChild(link);
    }
  }

  /* ---------- 토글 찾기·표시 ---------- */
  var stats = { candidates: 0, marked: 0, skippedNoSvg: 0, skippedText: 0 };

  function isOpen(btn) {
    var a = btn.getAttribute('aria-expanded');
    if (a === 'true') return true;
    if (a === 'false') return false;
    var l = (btn.getAttribute('aria-label') || '').trim().toLowerCase();
    if (l && OPEN_LABELS.indexOf(l) !== -1) return true;
    if (l && CLOSED_LABELS.indexOf(l) !== -1) return false;
    var svg = btn.querySelector('svg'), t = svg && svg.style ? String(svg.style.transform || '') : '';
    return t.indexOf('180deg') !== -1;
  }
  function removeFa(btn) {
    var i = btn.querySelector('.' + FA_CLASS);
    if (i) i.parentNode.removeChild(i);
  }
  function ensureFa(btn, open) {
    var cls = (open ? cfg['fa-opened'] : cfg['fa-closed']) + ' ' + FA_CLASS, i = btn.querySelector('.' + FA_CLASS);
    if (!i) {
      i = doc.createElement('i');
      i.className = cls;
      i.setAttribute('aria-hidden', 'true');
      btn.appendChild(i);
    } else if (i.className !== cls) {
      i.className = cls;
    }
  }
  function syncBtn(btn) {
    var open = isOpen(btn);
    if (open) { if (btn.getAttribute(OPEN) !== '1') btn.setAttribute(OPEN, '1'); }
    else if (btn.hasAttribute(OPEN)) btn.removeAttribute(OPEN);
    if (cfg.mode === '4') ensureFa(btn, open); else removeFa(btn);
  }
  function rowOf(blk, btn, kind) {
    var c = blk.firstElementChild, row = kind === 't' ? c : (c && c.firstElementChild);
    if (row && row !== btn && row.contains(btn)) return row;
    return btn.parentElement;
  }
  function kindOf(blk) {
    var names = Object.keys(BLOCKS);
    for (var i = 0; i < names.length; i++) if (blk.classList.contains(names[i])) return BLOCKS[names[i]];
    return null;
  }
  function scan() {
    var btns = doc.querySelectorAll(BTN_SEL), s = { candidates: btns.length, marked: 0, skippedNoSvg: 0, skippedText: 0 };
    Array.prototype.forEach.call(btns, function (b) {
      if (!b.hasAttribute(BTN)) {
        if (!b.querySelector(':scope > svg')) { s.skippedNoSvg++; return; }
        if ((b.textContent || '').trim()) { s.skippedText++; return; }
        var blk = b.closest(BLOCK_SEL), kind = blk && kindOf(blk);
        if (!kind) return;
        var row = rowOf(blk, b, kind);
        if (!row) return;
        blk.setAttribute(BLK, kind);
        row.setAttribute(ROW, kind === 't' ? 't' : 'h');
        b.setAttribute(BTN, '1');
      }
      s.marked++;
      syncBtn(b);
    });
    stats = s;
  }
  function syncAll() {
    Array.prototype.forEach.call(doc.querySelectorAll('[' + BTN + ']'), function (b) { syncBtn(b); });
  }
  function rebuild() {
    resolve();
    applyStyle();
    syncFaLink();
    syncAll();
  }

  /* ---------- 변화 감지 ---------- */
  var raf = 0, refreshTimer = 0, observer = null;
  function schedule() {
    if (raf) return;
    raf = global.requestAnimationFrame(function () { raf = 0; scan(); });
  }
  function scheduleRefresh() {
    if (refreshTimer) return;
    refreshTimer = global.setTimeout(function () { refreshTimer = 0; refresh(); }, 80);
  }
  function isOwnNode(n) {
    if (n.nodeType !== 1) return true;
    if (n.classList && n.classList.contains(FA_CLASS)) return true;
    return n.id === STYLE_ID || n.id === FA_LINK_ID || n.id === CMP_ID;
  }
  function onMutations(list) {
    var needScan = false, needRefresh = false, head = doc.head;
    list.forEach(function (m) {
      var t = m.target;
      if (m.type === 'attributes') {
        var b = t.closest ? t.closest('[' + BTN + ']') : null;
        if (b) syncBtn(b);
        return;
      }
      if (styleEl && (t === styleEl || styleEl.contains(t))) return;
      var added = Array.prototype.some.call(m.addedNodes, function (n) { return !isOwnNode(n); });
      var removed = Array.prototype.some.call(m.removedNodes, function (n) { return !isOwnNode(n); });
      if (!added && !removed) return;
      if (head && (t === head || head.contains(t))) needRefresh = true;
      else if (added) needScan = true;
    });
    if (needRefresh) scheduleRefresh();
    if (needScan) schedule();
  }
  function observe() {
    if (observer || typeof global.MutationObserver === 'undefined') return;
    observer = new global.MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'aria-label', 'aria-expanded'] });
  }
  function onActivate(e) {
    var t = e.target, b = t && t.closest ? t.closest('[' + BTN + ']') : null;
    if (!b) return;
    [30, 120, 320].forEach(function (ms) { global.setTimeout(function () { if (b.isConnected) syncBtn(b); }, ms); });
  }

  /* ---------- 공개 함수 ---------- */
  function refresh() { readPage(); rebuild(); scan(); }
  function legacyReport() {
    var out = { attr: root.hasAttribute('data-tg-mode'), links: [], vars: [] };
    Array.prototype.forEach.call(doc.querySelectorAll('link[href*="/toggle-master/"],script[src*="/toggle-master/"]'), function (e) { out.links.push(e.href || e.src); });
    try {
      var cs = global.getComputedStyle(root);
      ['--tg-mode', '--tg-position', '--tg-use-hover', '--tg-color-theme', '--tg-use-custom-font'].forEach(function (n) { if (String(cs.getPropertyValue(n) || '').trim()) out.vars.push(n); });
    } catch (e) {}
    return out;
  }
  function diagnose() {
    var non = {};
    FIELDS.forEach(function (f) { if (cfg[f.key] !== f.defaultValue) non[f.key] = cfg[f.key]; });
    var kinds = {};
    Array.prototype.forEach.call(doc.querySelectorAll('[' + BLK + ']'), function (e) { var k = e.getAttribute(BLK); kinds[k] = (kinds[k] || 0) + 1; });
    return {
      version: VERSION, mode: cfg.mode, candidates: stats.candidates, marked: stats.marked,
      skippedNoSvg: stats.skippedNoSvg, skippedText: stats.skippedText, kinds: kinds,
      open: doc.querySelectorAll('[' + OPEN + '="1"]').length, fa: doc.querySelectorAll('.' + FA_CLASS).length,
      styleChars: lastCss ? lastCss.length : 0, nonDefault: non, edits: JSON.parse(JSON.stringify(edits)),
      explicit: (function () { var e = explicitRaw(), o = {}; Object.keys(e).forEach(function (k) { if (e[k]) o[k] = e[k]; }); return o; })(),
      legacy: legacyReport()
    };
  }
  function outVal(f, v) {
    if (f.type === 'len') return v.replace(/px$/, '');
    if (f.type === 'ms') return v.replace(/ms$/, '');
    if (f.type === 'size') return v.replace(/em$/, '');
    return v;
  }
  function cssOut(opts) {
    var full = !!(opts && opts.full), lines = [];
    FIELDS.forEach(function (f) {
      if (!full && cfg[f.key] === f.defaultValue) return;
      lines.push('  ' + f.css + ': ' + outVal(f, cfg[f.key]) + ';');
    });
    if (!lines.length) return ':root {\n}';
    return ':root {\n' + lines.join('\n') + '\n}';
  }
  var dashboard = {
    apiVersion: '1.0.0',
    schema: function () { return JSON.parse(JSON.stringify(FIELDS)); },
    common: {
      read: function () { return JSON.parse(JSON.stringify(cfg)); },
      explicit: explicitRaw,
      edits: function () { return JSON.parse(JSON.stringify(edits)); },
      apply: function (patch) {
        var p = normalizePatch(patch);
        Object.keys(p).forEach(function (k) { if (p[k] === null) delete edits[k]; else edits[k] = p[k]; });
        rebuild();
        return JSON.parse(JSON.stringify(cfg));
      },
      restore: function (keys) {
        if (!keys) edits = {};
        else (Array.isArray(keys) ? keys : [keys]).forEach(function (k) { delete edits[String(k).toLowerCase()]; });
        rebuild();
        return JSON.parse(JSON.stringify(cfg));
      },
      css: cssOut
    }
  };

  /* 모드 2의 +/- 모양(bold)을 폰트어썸 글리프와 겹쳐 보는 비교 패널 */
  function compare() {
    var ex = doc.getElementById(CMP_ID);
    if (ex) { ex.parentNode.removeChild(ex); return 'closed'; }
    var link = doc.createElement('link');
    link.rel = 'stylesheet'; link.href = FA_URL; link.setAttribute('data-compare', '1');
    (doc.head || root).appendChild(link);
    var p = doc.createElement('div');
    p.id = CMP_ID;
    p.style.cssText = 'position:fixed;right:12px;top:12px;z-index:2147483647;background:#fff;border:1px solid #888;padding:10px;font:12px/1.4 sans-serif;color:#222;box-shadow:0 4px 16px rgba(0,0,0,.25)';
    function cell(inner) { return '<div style="width:60px;height:60px;font-size:50px;position:relative;margin:0 6px">' + inner + '</div>'; }
    function fa(name, color, op) { return '<i class="fa-solid ' + name + '" style="position:absolute;left:0;top:0;display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.2em;color:' + color + ';opacity:' + op + '"></i>'; }
    function mk(svg, color, op) { var m = uri(svg); return '<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:' + color + ';opacity:' + op + ';-webkit-mask:' + m + ' center/contain no-repeat;mask:' + m + ' center/contain no-repeat"></div>'; }
    function row(name, svg, label) {
      return '<div style="display:flex;align-items:center;margin:6px 0"><span style="width:44px">' + label + '</span>' +
        cell(fa(name, '#000', 1)) + cell(mk(svg, '#000', 1)) + cell(fa(name, '#f00', 0.6) + mk(svg, '#00f', 0.6)) + '</div>';
    }
    p.innerHTML = '<div style="font-weight:700;margin-bottom:4px">toggle 모드 2 비교 (bold 기준)</div>' +
      '<div style="display:flex;margin-left:44px;color:#666"><span style="width:72px">폰트어썸</span><span style="width:72px">마스크</span><span>겹침(빨강+파랑)</span></div>' +
      row('fa-plus', pmSvg('plus', STROKE.pm.bold), '닫힘') + row('fa-minus', pmSvg('minus', STROKE.pm.bold), '열림') +
      '<div style="color:#666">겹침이 모두 보라색이면 같은 모양입니다. 다시 호출하면 닫힙니다.</div>';
    doc.body.appendChild(p);
    return 'opened';
  }

  global.toggle_e4d = { version: VERSION, rescan: function () { scan(); }, refresh: refresh, diagnose: diagnose, compare: compare, dashboard: dashboard };
  dashboard.rescan = global.toggle_e4d.rescan;

  /* ---------- 시작 ---------- */
  readPage();
  rebuild();
  function start() {
    scan();
    observe();
    doc.addEventListener('click', onActivate, true);
    doc.addEventListener('keydown', onActivate, true);
    var lg = legacyReport();
    if (lg.attr || lg.links.length) console.warn('[toggle] 옛 toggle-master(CSS/JS) 링크가 남아 있습니다. 새 파일만 남기고 제거하세요.', lg.links);
    if (lg.vars.length) console.warn('[toggle] 옛 --tg-* 변수는 지원하지 않습니다. --toggle-이름_e4d 변수로 바꾸세요.', lg.vars);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
})(window);