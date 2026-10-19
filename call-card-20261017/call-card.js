//  <!-- 콜카드 call-card 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/call-card-20261017/call-card.js" defer></script>



// =========================================================
// call-card.js
// 버전: 15.1.1
// 설명: 노션 콜아웃을 카드·카드 그룹으로 꾸미는 [% call-card %] 토큰 모듈 (통합판)
// 의존성: core.js v1.2.0 이상 (core.js는 수정하지 않는다)
// ---------------------------------------------------------
// [개요]
//  - 콜아웃 안에 [% call-card %] 토큰을 적으면 해당 콜아웃을 카드로 만든다.
//  - 콜아웃 안에 콜아웃이 있으면 카드 그룹(격자)으로 처리한다.
//  - 이미지는 캡션 문법으로 FULL / FIT / BG 배치, 오버레이(OL), 모바일 위치(MT/MB), 카드 링크(URL)를 지정한다.
//  - 대시보드(CallCardEngine.dashboard)로 설정을 미리보기·출력할 수 있다.
//
// [사용법]
//  1. core.js를 먼저 로드한 뒤 이 파일을 로드한다. call-slide.js를 함께 쓰면 core.js -> call-slide.js -> call-card.js 순서이다.
//  2. 이전의 card.js, stack-card-fix, column-card-mobile-fix는 모두 제거한다.
//  3. 콜아웃 안에 별도 줄로 토큰을 적는다.  예) [% call-card :: PAD 32 :: R 20 %]
//     ※ 맨 끝 %] 앞에 공백 한 칸을 둔다.  (예: RADIUS 50% %] )
//  4. 테두리·그림자를 없애려면 자식 콜아웃 안에 [% plain %] 또는 [% plain :: ALL %]을 별도 줄로 적는다.
//
// [토큰]  [% call-card :: 키 값 :: 키 값 %]
//   키는 정식 이름과 별칭을 모두 쓸 수 있다. 대소문자, 밑줄, 하이픈은 구분하지 않는다.
//
//   정식 이름         별칭   기능                              기본값
//   PADDING           PAD    안쪽 여백(전체) px                24
//   PADDINGX          PADX   안쪽 여백(좌우) px                PAD 값
//   PADDINGY          PADY   안쪽 여백(상하) px                PAD 값
//   RADIUS            R      모서리: 숫자(px), %, 단위 값       16 (999 = 알약)
//   BACKGROUND_COLOR  BC     카드 배경색                       노션 콜아웃 색, 없으면 흰색
//   ICON_SIZE         IS     아이콘 뱃지 크기 px                52
//   FIT_PAD           FITPAD FIT 이미지의 둘레 여백 px          16
//   GAP / GAPX / GAPY        그룹 카드 간격 px (GAP=가로·세로)   가로 46, 세로 24
//   IMAGE_MODE        IMG    캡션에 모드가 없는 이미지의 모드    FULL (FIT | FULL | BG)
//
// [이미지 캡션]  이미지 블록의 캡션에 쉼표로 구분해 적는다. 캡션 글자는 화면에서 숨겨진다.
//   FULL | FIT | BG   이미지 모드 (카드 하나에 BG 이미지는 한 개만 허용)
//   OL <색> <진하기 0~1> <방향 T/B/L/R/A> <시작%> <끝%>   BG 오버레이
//       기본값: 흰색, 0.4, A(전체), 0, 65. 방향이 A이면 시작·끝을 쓰지 않는다.
//       색: BLACK, WHITE, #hex, rgba(r,g,b,a)
//   MT | MB           모바일에서 이미지가 위(MT) / 아래(MB)
//   URL <주소>        카드 전체 링크. URL NEW <주소>는 새 탭.
//                     허용: http(s), mailto, tel, sms, / ./ ../ # ? 로 시작하는 상대 주소
//   예) BG, OL BLACK 0.4 B 0 75, MB
//
// [plain]
//   [% plain %]               BORDER(기본): 테두리와 그림자만 제거
//   [% plain :: ALL %]        테두리, 그림자, 여백, 배경 제거 (모서리는 유지)
//   [% plain :: NONE %]       제거하지 않음
//   [% plain :: SCOPE DESCENDANTS %]   부모 규칙을 모든 하위 카드에 적용 (기본은 바로 아래 자식만)
//   우선순위: 자기 자신의 plain > 가장 가까운 조건이 맞는 부모의 plain
//
// [자동 판단]
//  - 컬럼 안에 이미지가 있으면 2컬럼 카드, 없으면 세로 쌓기 카드로 처리한다.
//  - 맨 위·맨 아래 이미지는 카드 가장자리에 맞추고, 중간 이미지는 그대로 둔다.
//  - 컬럼 일부에만 콜아웃이 있어도 카드 그룹으로 처리한다.
//  - 모바일(640px 이하): PC 값에 비율을 곱한다. 문법에는 모바일 값을 따로 쓰지 않는다.
//
// [우피 클래스 이름 변경 대응]
//  우피가 콜아웃·캡션의 CSS 클래스 이름(해시가 붙는 이름)을 바꿔도 동작하도록, 이 파일은 그런 이름에 의존하지 않는다.
//  콜아웃의 내용 영역과 블록 영역은 DOM 구조로 찾고, 이미지 캡션은 "이미지 블록 안에서 이미지가 없고 글자가 있는
//  가장 바깥 요소"로 찾는다. (예전 방식인 figcaption, 클래스에 caption 포함은 있으면 우선 사용한다)
//  notion-*-block, data-block-id 같은 노션 고유 이름만 사용한다.
//
// [대시보드용 CSS 변수]  :root 에 적는다. 값에는 단위를 붙인다.
//   --ce-card-pad / -padx / -pady        안쪽 여백          24px
//   --ce-card-radius                     모서리             16px
//   --ce-card-bg                         기본 배경색        #ffffff
//   --ce-card-border / -shadow           테두리색 / 그림자
//   --ce-card-icon / -icon-radius / -icon-bg   아이콘 크기 / 모서리 / 배경
//   --ce-card-fitpad                     FIT 이미지 여백    16px
//   --ce-card-gap / -gapx / -gapy        그룹 간격          46px / 24px
//   --ce-card-img-mode                   기본 이미지 모드   FULL (FIT | FULL | BG)
//   --ce-card-img-gap                    위/아래 이미지와 글자 사이 간격   20px
//   --ce-card-img-radius / -img-radius-ratio   FIT 이미지 모서리 (기본: 카드 모서리 x 0.6)
//   모바일 비율 (640px 이하, PC 값에 곱한다):
//     --ce-card-ratio-pad (0.6) / -gap (0.75) / -size (0.75)           종류별
//     --ce-card-ratio-padx / -pady / -fitpad / -gapx / -gapy / -is     항목별 (종류별보다 우선)
//   우선순위: 토큰 값 > 대시보드 CSS 변수 > 엔진 기본값
//
// [공개 API]  window.CallCardEngine
//   version, refit(), diagnose()
//   dashboard.list() / read(id) / apply(id, patch) / restore(id) / token(id)
//   dashboard.plain.read / apply / restore / refresh / token
//   dashboard.images.list() / read(id) / apply(id, patch) / restore(id) / caption(id)
//   - apply, images.apply는 화면 미리보기이며 노션 원문은 수정하지 않는다.
//   - apply 항목: padX, padY, radius, bc, icon, fitPad, gapX, gapY, plain
//   - images.apply 항목: mode, mobile, overlay{enabled,color,opacity,direction,start,end}, link{enabled,url,newTab}
//
// [호환]
//  옛 call-counter(v3.10)가 카드 판정에 쓰는 클래스(engine-ready, card-engine-content-wrap,
//  stack-card-fixed)를 그대로 붙인다.
//
// [알려진 제한]
//  - 카드 하나에 BG 이미지는 한 개만 사용할 수 있다.
//  - 한 카드에 서로 다른 전체 링크는 허용하지 않는다. (URL·새 탭 설정 통일)
//  - 여러 컬럼 행이 섞인 개별 카드는 이미지 API의 실시간 모드 전환 대상이 아니다.
//  - call-slide 안쪽 콜아웃은 건드리지 않는다.
//  - 옛 [[N]] 문법은 더 이상 지원하지 않는다. [% plain %]을 사용한다.
//  - 이미지 블록 안에 캡션이 아닌 다른 글자가 있으면 캡션으로 잘못 볼 수 있다. (현재 우피 구조에서는 해당 없음)
//  - 검증 범위: 새로고침 후 비교 114개 대상(카드·그룹 82, 이미지 32) 통과(v15.1.0 기준).
//    v15.1.1의 캡션 구조 탐색은 가상 환경 단위 테스트로 확인했고, 실제 노션 화면에서의 동작은 직접 확인해야 한다.
//    픽셀 배치, 이미지 잘림, 실제 클릭, 미사용 설정값, 모든 반응형 상태는 검증하지 않았다.
//
// [v15.1.1 변경]
//  - 이미지 캡션(FIT, FULL, BG 등)이 화면에 그대로 보이던 문제 수정: 우피가 캡션 클래스 이름을 바꿔서
//    캡션 요소를 못 찾던 것을 구조 기반 탐색으로 바꿨다.
//  - 빈 제목 판정과 카드 박스 보조 탐색이 새 클래스 이름(밑줄 한 개)도 인식한다.
//
// [점검] 콘솔에서 CallCardEngine.diagnose()
// =========================================================

(function (global) {
  'use strict';

  var VERSION = '15.1.1';

  if (!global.CoreEngine || typeof global.CoreEngine.register !== 'function') {
    console.error('[card] CoreEngine이 로드되지 않았습니다. core.js를 먼저 불러오세요.');
    return;
  }
  if (global.CallCardEngine) {
    console.warn('[card] call-card가 이미 로드되어 있어 건너뜁니다.');
    return;
  }

  var Core = global.CoreEngine;
  var MOBILE_BREAKPOINT = 640;
  var mql = global.matchMedia('(max-width: ' + MOBILE_BREAKPOINT + 'px)');
  var EDGE_OVERSCAN = 2;
  var MAX_RETRY = 8;
  var NAMED_COLORS = { BLACK: '#000000', WHITE: '#ffffff' };
  var KNOWN_KEYS = ['PAD', 'PADX', 'PADY', 'RADIUS', 'BC', 'IS', 'FITPAD', 'GAP', 'GAPX', 'GAPY', 'IMG'];
  var ALIAS = {
    PADDING: 'PAD', PADDINGX: 'PADX', PADDINGY: 'PADY', R: 'RADIUS',
    BACKGROUNDCOLOR: 'BC', ICONSIZE: 'IS', IMAGEMODE: 'IMG'
  };
  var FIT_RESET = ['width', 'min-width', 'max-width', 'height', 'margin', 'margin-top', 'margin-right',
    'margin-bottom', 'margin-left', 'box-sizing', 'flex', 'align-self'];

  var state = new WeakMap();
  var liveBoxes = [];
  var pending = new Set();
  var warnedOld = false;

  function rootVar(name, fallback) {
    try {
      var v = global.getComputedStyle(document.documentElement).getPropertyValue(name);
      v = (v || '').trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }
  function children(el) { return Array.prototype.slice.call(el.children); }
  function cssNumber(el, prop) { return parseFloat(global.getComputedStyle(el)[prop]) || 0; }
  function isOwnedBy(el, callout) {
    var p = el.parentElement;
    return !!p && p.closest('.notion-callout-block') === callout;
  }
  function inSlide(el) {
    return !!(el.closest && el.closest('.slide-shell_s4P, .slide-item_s4P'));
  }

  function readParams(raw) {
    var aliasHits = {}, canonHits = {}, out = {};
    Object.keys(raw || {}).forEach(function (k) {
      var n = String(k).toUpperCase().replace(/[_\-\s]/g, '');
      if (ALIAS[n]) aliasHits[ALIAS[n]] = raw[k];
      else canonHits[n] = raw[k];
    });
    Object.keys(aliasHits).forEach(function (k) { out[k] = aliasHits[k]; });
    Object.keys(canonHits).forEach(function (k) {
      if (KNOWN_KEYS.indexOf(k) === -1) console.warn('[card] 알 수 없는 파라미터를 무시합니다: ' + k);
      out[k] = canonHits[k];
    });
    return out;
  }
  function toNum(v) {
    if (v === undefined || v === null || v === '') return null;
    var n = parseFloat(v);
    return (isNaN(n) || n < 0) ? null : n;
  }
  function toLength(v) {
    if (v === undefined || v === null) return null;
    v = String(v).trim();
    if (/^\d+(\.\d+)?$/.test(v)) return v + 'px';
    if (/^\d+(\.\d+)?(px|%|em|rem|vw|vh)$/i.test(v)) return v;
    return null;
  }
  function toColor(v) {
    if (!v) return null;
    v = String(v).trim().replace(/\s*,\s*/g, ',');
    if (global.CSS && global.CSS.supports && global.CSS.supports('color', v)) return v;
    console.warn('[card] 인식할 수 없는 색상 값을 무시합니다: ' + v);
    return null;
  }
  function buildConfig(p) {
    var c = {};
    var pad = toNum(p.PAD);
    c.padX = toNum(p.PADX); c.padY = toNum(p.PADY);
    if (pad !== null) { if (c.padX === null) c.padX = pad; if (c.padY === null) c.padY = pad; }
    c.radius = toLength(p.RADIUS);
    c.bc = toColor(p.BC);
    c.icon = toNum(p.IS);
    c.fitPad = toNum(p.FITPAD);
    var gap = toNum(p.GAP);
    c.gapX = toNum(p.GAPX); c.gapY = toNum(p.GAPY);
    if (gap !== null) { if (c.gapX === null) c.gapX = gap; if (c.gapY === null) c.gapY = gap; }
    var im = String(p.IMG || '').toUpperCase();
    c.img = (im === 'FIT' || im === 'FULL' || im === 'BG') ? im.toLowerCase() : null;
    return c;
  }
  function defaultImageMode(cfg) {
    if (cfg && cfg.img) return cfg.img;
    var v = rootVar('--ce-card-img-mode', 'FULL').toUpperCase();
    return (v === 'FIT' || v === 'FULL' || v === 'BG') ? v.toLowerCase() : 'full';
  }
  function setCardVars(box, cfg) {
    var s = box.style;
    if (cfg.padX !== null) s.setProperty('--cc-pad-x', cfg.padX + 'px');
    if (cfg.padY !== null) s.setProperty('--cc-pad-y', cfg.padY + 'px');
    if (cfg.radius) s.setProperty('--cc-radius', cfg.radius);
    if (cfg.icon !== null) s.setProperty('--cc-icon', cfg.icon + 'px');
    if (cfg.fitPad !== null) s.setProperty('--cc-fitpad', cfg.fitPad + 'px');
    if (cfg.gapX !== null) s.setProperty('--cc-gap-x', cfg.gapX + 'px');
    if (cfg.gapY !== null) s.setProperty('--cc-gap-y', cfg.gapY + 'px');
  }

  // =====================================================
  // PLAIN rules v1.1 — own override > nearest matching ancestor
  // =====================================================
  var PLAIN_RE = /\[\[?%\s*plain\b([\s\S]*?)%\]\]?/i;

  function parsePlainRule(raw) {
    var match = PLAIN_RE.exec(String(raw || ''));
    var inner = match ? match[1] : String(raw || '');
    var parts = inner.split('::').map(function (v) {
      return v.trim().toUpperCase();
    }).filter(Boolean);
    var level = 'BORDER';
    var scope = 'CHILDREN';
    parts.forEach(function (part) {
      if (['NONE', 'BORDER', 'ALL'].indexOf(part) !== -1) level = part;
      if (part === 'SCOPE DESCENDANTS') scope = 'DESCENDANTS';
      if (part === 'SCOPE CHILDREN') scope = 'CHILDREN';
    });
    return { explicit: true, level: level, scope: scope };
  }

  function parsePlainLevel(raw) {
    return parsePlainRule(raw).level;
  }

  function readOwnPlainRule(callout) {
    var preview = callout.getAttribute('data-card-plain-preview');
    if (preview !== null) {
      try {
        var parsed = JSON.parse(preview);
        if (parsed.explicit === false) {
          return { explicit: false, level: 'NONE', scope: 'CHILDREN' };
        }
        if (['NONE', 'BORDER', 'ALL'].indexOf(parsed.level) !== -1 &&
            ['CHILDREN', 'DESCENDANTS'].indexOf(parsed.scope) !== -1) {
          return { explicit: true, level: parsed.level, scope: parsed.scope };
        }
      } catch (e) {}
    }

    var blocks = callout.querySelectorAll('[data-block-id]');
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block.querySelector('[data-block-id]')) continue;
      if (block.closest('.notion-callout-block') !== callout) continue;
      if (block.matches('.notion-code-block') ||
          block.closest('.notion-code-block,pre')) continue;
      var match = PLAIN_RE.exec(block.textContent || '');
      if (match) return parsePlainRule(match[0]);
    }

    // Fallback for token blocks changed by other renderers.
    var tokenRule = callout.getAttribute('data-card-plain-token-rule');
    if (tokenRule) {
      try { return JSON.parse(tokenRule); } catch (e) {}
    }
    return { explicit: false, level: 'NONE', scope: 'CHILDREN' };
  }

  function resolvePlainRule(callout) {
    var own = readOwnPlainRule(callout);
    if (own.explicit) {
      return {
        level: own.level, scope: own.scope, inherited: false,
        sourceId: callout.getAttribute('data-block-id') || '',
        distance: 0
      };
    }

    var parent = callout.parentElement
      ? callout.parentElement.closest('.notion-callout-block') : null;
    var distance = 1;
    while (parent) {
      var rule = readOwnPlainRule(parent);
      if (rule.explicit &&
          (distance === 1 || rule.scope === 'DESCENDANTS')) {
        return {
          level: rule.level, scope: rule.scope, inherited: true,
          sourceId: parent.getAttribute('data-block-id') || '',
          distance: distance
        };
      }
      parent = parent.parentElement
        ? parent.parentElement.closest('.notion-callout-block') : null;
      distance++;
    }
    return {
      level: 'NONE', scope: 'CHILDREN', inherited: false,
      sourceId: '', distance: -1
    };
  }

  function readPlainLevel(callout) {
    return resolvePlainRule(callout).level;
  }

  function refreshPlainRules() {
    liveBoxes = liveBoxes.filter(function (box) {
      return box.isConnected && state.has(box);
    });
    liveBoxes.forEach(function (box) {
      var st = state.get(box);
      var resolved = resolvePlainRule(st.callout);
      st.level = resolved.level;
      st.plainResolved = resolved;
      dashRefreshAppearance(box);
    });
  }


  function injectStyle() {
    if (document.getElementById('engine-card-base-style-v15')) return;
    var M = '@media (max-width: ' + MOBILE_BREAKPOINT + 'px)';
    var css = [
      '[data-card-engine-box]{' +
        '--p-x:var(--cc-pad-x,var(--ce-card-padx,var(--ce-card-pad,24px)));' +
        '--p-y:var(--cc-pad-y,var(--ce-card-pady,var(--ce-card-pad,24px)));' +
        '--f-pad:var(--cc-fitpad,var(--ce-card-fitpad,16px));' +
        '--i-size:var(--cc-icon,var(--ce-card-icon,52px));' +
        '--g-x:var(--cc-gap-x,var(--ce-card-gapx,var(--ce-card-gap,46px)));' +
        '--g-y:var(--cc-gap-y,var(--ce-card-gapy,var(--ce-card-gap,24px)));' +
        '--img-r:var(--ce-card-img-radius,calc(var(--cc-radius,var(--ce-card-radius,16px)) * var(--ce-card-img-radius-ratio,0.6)));}',
              M + '{[data-card-engine-box]{' +
        '--p-x:calc(var(--cc-pad-x,var(--ce-card-padx,var(--ce-card-pad,24px))) * var(--ce-card-ratio-padx,var(--ce-card-ratio-pad,0.6)));' +
        '--p-y:calc(var(--cc-pad-y,var(--ce-card-pady,var(--ce-card-pad,24px))) * var(--ce-card-ratio-pady,var(--ce-card-ratio-pad,0.6)));' +
        '--f-pad:calc(var(--cc-fitpad,var(--ce-card-fitpad,16px)) * var(--ce-card-ratio-fitpad,var(--ce-card-ratio-pad,0.6)));' +
        '--i-size:calc(var(--cc-icon,var(--ce-card-icon,52px)) * var(--ce-card-ratio-is,var(--ce-card-ratio-size,0.75)));' +
        '--g-x:calc(var(--cc-gap-x,var(--ce-card-gapx,var(--ce-card-gap,46px))) * var(--ce-card-ratio-gapx,var(--ce-card-ratio-gap,0.75)));' +
        '--g-y:calc(var(--cc-gap-y,var(--ce-card-gapy,var(--ce-card-gap,24px))) * var(--ce-card-ratio-gapy,var(--ce-card-ratio-gap,0.75)));}}',
      '[data-card-engine-box][data-card-plain="ALL"]{--p-x:0px;--p-y:0px;}',
      '.card-engine-content-wrap{padding:var(--p-y) var(--p-x);box-sizing:border-box;margin-left:0!important}',
      '.card-engine-group-wrap{padding:0!important}',
      '.card-engine-content-wrap.stack-card-fixed{overflow:visible!important}',
      '.card-engine-icon-wrap,.card-engine-icon-wrap div{display:flex!important;align-items:center!important;justify-content:center!important}',
      '.card-engine-icon-wrap{margin-bottom:12px;overflow:hidden;flex-shrink:0}',
      '.card-engine-icon-wrap img{width:72%!important;height:72%!important;object-fit:contain}',
      '.card-engine-image-col.is-fit img,.card-engine-image-stack.is-fit img{padding:0;box-sizing:border-box;width:100%;height:auto;display:block;border-radius:var(--img-r)}',
      '.card-engine-image-stack.is-fit{box-sizing:border-box}',
      '.card-engine-image-stack.is-fit[data-fit-pos="bottom"]{padding-top:var(--f-pad)}',
      '.card-engine-image-stack.is-fit[data-fit-pos="top"]{padding-bottom:var(--f-pad)}',
      '.card-engine-image-stack.is-fit[data-fit-pos="middle"]{padding-top:var(--f-pad);padding-bottom:var(--f-pad)}',
      '.card-engine-image-col.is-fit{box-sizing:border-box}',
      '.card-engine-image-col.is-fit[data-fit-side="first"]{padding-right:var(--f-pad)}',
      '.card-engine-image-col.is-fit[data-fit-side="last"]{padding-left:var(--f-pad)}',      
      '.card-engine-image-col.is-full img,.card-engine-image-stack.is-full img{padding:0;box-sizing:border-box;object-fit:cover;display:block}',
      '.card-engine-image-stack.stack-card-fixed{max-width:none!important;flex:0 0 auto!important;align-self:flex-start!important}',
      '.card-engine-image-stack.stack-card-fixed,.card-engine-image-stack.stack-card-fixed>div,.card-engine-image-stack.stack-card-fixed>div>div,.card-engine-image-stack.stack-card-fixed .notion-cursor-default{width:100%!important}',
      '.card-engine-image-stack.stack-card-fixed img{display:block!important;width:100%!important;height:auto!important;object-fit:initial!important}',
      '.notion-callout-block[data-ce-card-linked="true"]{' +
        'cursor:pointer!important;' +
      '}' +
      '.notion-callout-block[data-ce-card-linked="true"] .notion-image-block,' +
      '.notion-callout-block[data-ce-card-linked="true"] .notion-image-block *{' +
        'cursor:pointer!important;' +
      '}',
      '.card-engine-caption-hidden{display:none!important}',
      '.card-engine-group-grid{display:grid!important;grid-template-columns:repeat(var(--card-group-cols,1),minmax(0,1fr))!important;column-gap:var(--g-x)!important;row-gap:var(--g-y)!important;align-items:start!important}',
      '.card-engine-group-cell{min-width:0}',
      '.card-engine-bg-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;max-width:none!important;max-height:none!important;display:block!important;overflow:hidden!important;z-index:0!important;margin:0!important;padding:0!important;box-sizing:border-box!important}',
      '.card-engine-bg-image,.card-engine-bg-image>div,.card-engine-bg-image>div>div,.card-engine-bg-image .notion-cursor-default,.card-engine-bg-image .notion-cursor-default>div,.card-engine-bg-image .notion-cursor-default>div>div{width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important}',
      '.card-engine-bg-image img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;display:block!important;margin:0!important;padding:0!important}',
      '.card-engine-bg-overlay{position:absolute!important;inset:0!important;z-index:0;pointer-events:none}',
      '.card-engine-bg-content{position:relative;z-index:1}',
      '.card-engine-bg-collapsed-col{width:0!important;min-width:0!important;max-width:0!important;padding:0!important;margin:0!important;overflow:hidden!important;flex:0 0 0!important}',
      '.card-engine-bg-text-col{flex:1 1 auto!important}',
      M + '{.card-engine-content-wrap .card-engine-flexrow{display:flex!important;flex-direction:column!important}.card-engine-spacer{display:none!important}' +
        '.card-engine-content-wrap .card-engine-col-wrap{order:var(--mobile-order,0)!important;flex:0 0 auto!important;width:100%!important;margin-top:0!important;margin-bottom:16px!important}' +
        '.card-engine-group-grid{grid-template-columns:1fr!important}' +
        '.card-engine-image-col.is-fit[data-fit-side]{padding:0!important}' +
        '.card-engine-image-col.is-fit[data-fit-mpos="top"]{padding-bottom:var(--f-pad)!important}' +
        '.card-engine-image-col.is-fit[data-fit-mpos="bottom"]{padding-top:var(--f-pad)!important}}'
            ].join('\n');
    var style = document.createElement('style');
    style.id = 'engine-card-base-style-v15';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function warnOldFiles() {
    if (warnedOld) return;
    warnedOld = true;
    setTimeout(function () {
      var old = [];
      if (document.getElementById('engine-card-base-style')) old.push('card.js(옛 버전)');
      if (document.getElementById('engine-stack-card-fix-style-v14')) old.push('stack-card-fix');
      if (document.getElementById('engine-column-card-mobile-fix-v2')) old.push('column-card-mobile-fix');
      if (old.length) console.warn('[card] 옛 파일이 같이 로드되어 있습니다. 제거하세요: ' + old.join(', '));
    }, 1500);
  }

  function findCardBox(callout) {
    var flexWrap = callout.firstElementChild;
    if (!flexWrap) return null;
    var contentBox = flexWrap.firstElementChild;
    if (contentBox) return contentBox;
    return callout.querySelector('[class*="_content"]');
  }
  function findBlocksWrap(cardBox) {
    var list = children(cardBox);
    for (var i = 0; i < list.length; i++) {
      if (list[i].querySelector('.notion-column_list-block, .notion-text-block, .notion-image-block')) return list[i];
    }
    return list[list.length - 1] || null;
  }
  function findIconEl(cardBox, blocksWrap) {
    var list = children(cardBox);
    for (var i = 0; i < list.length; i++) {
      if (list[i] === blocksWrap) continue;
      var icon = list[i].querySelector('.notion-record-icon');
      if (icon) return { icon: icon, wrapEl: list[i] };
    }
    return null;
  }
  function getFlexRow(columnListEl) { return columnListEl.firstElementChild; }
  function classifyFlexRowChildren(flexRow) {
    var columnWraps = [], others = [];
    Array.prototype.forEach.call(flexRow.children, function (child) {
      var col = child.querySelector('.notion-column-block');
      if (col) columnWraps.push({ wrap: child, col: col });
      else others.push(child);
    });
    return { columnWraps: columnWraps, others: others };
  }
  function isEmptyTitle(el) {
    var cls = String(el.className || '');
    var looksLikeTitle = /_title(?:\s|$)/.test(cls) || !el.hasAttribute('data-block-id');
    return looksLikeTitle && !(el.textContent || '').trim() && !el.querySelector('img,video,iframe');
  }
  function isEmptySpacer(el) {
    return !el.classList.contains('notion-image-block') && !(el.textContent || '').trim() &&
      !el.querySelector('img,video,iframe,svg,canvas');
  }
  function isIcon(el) { return !!(el.classList && el.classList.contains('notion-record-icon')); }
  function isMeaningful(el) {
    return el.getAttribute('data-engine-hidden') !== 'true' &&
      global.getComputedStyle(el).display !== 'none' &&
      !isEmptyTitle(el) && !isEmptySpacer(el) && !isIcon(el);
  }


  // =====================================================
  // Image caption, reversible layout, and card links v1.0
  // =====================================================
  function splitCardCaption(text) {
    var parts = [], cur = '', quote = '', depth = 0;
    text = String(text || '').trim().replace(/^!\s*/, '');
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (quote) {
        cur += ch;
        if (ch === quote && text.charAt(i - 1) !== '\\') quote = '';
        continue;
      }
      if ((ch === '"' || ch === "'") &&
          (!cur.trim() || /\s$/.test(cur))) {
        quote = ch; cur += ch; continue;
      }
      if (ch === '(') depth++;
      if (ch === ')' && depth > 0) depth--;
      if (ch === ',' && depth === 0) {
        if (cur.trim()) parts.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }

  function cardCaptionColor(value) {
    value = String(value || '').trim();
    var upper = value.toUpperCase();
    if (upper === 'BLACK') value = '#000000';
    if (upper === 'WHITE') value = '#ffffff';
    var hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value);
    if (hex) {
      var h = hex[1];
      if (h.length <= 4) h = h.split('').map(function (x) { return x + x; }).join('');
      return { hex: '#' + h.slice(0, 6).toLowerCase(), alpha: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1 };
    }
    var rgba = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?|\.\d+)\s*\)$/i.exec(value);
    if (!rgba) return null;
    var rgb = rgba.slice(1, 4).map(Number), alpha = Number(rgba[4]);
    if (rgb.some(function (x) { return x > 255; }) || alpha < 0 || alpha > 1) return null;
    return {
      hex: '#' + rgb.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''),
      alpha: alpha
    };
  }

  function normalizeCardUrl(raw) {
    var value = String(raw || '').trim();
    if (/^["']/.test(value)) {
      if (value.charAt(value.length - 1) !== value.charAt(0)) throw new Error('URL 따옴표가 닫히지 않았습니다.');
      value = value.slice(1, -1);
    }
    if (!value || /^(NONE|없음)$/i.test(value)) return '';
    if (/[\u0000-\u0020\u007f\\]/.test(value)) throw new Error('URL의 공백·제어문자·역슬래시는 허용하지 않습니다.');
    if (/^\[.*\]\(/.test(value) || /^<.*>$/.test(value)) throw new Error('마크다운 링크가 아닌 순수 주소를 입력하세요.');
    if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(value)) value = 'https://' + value;
    var allowed = /^(https?:|mailto:|tel:|sms:|\/|\.\/|\.\.\/|#|\?)/i;
    if (!allowed.test(value)) throw new Error('지원하지 않는 주소입니다. 상대경로는 / 또는 ./ 로 시작하세요.');
    var url;
    try { url = new URL(value, document.baseURI || global.location.href); }
    catch (e) { throw new Error('주소 형식이 잘못됐습니다.'); }
    if (['http:', 'https:', 'mailto:', 'tel:', 'sms:'].indexOf(url.protocol.toLowerCase()) === -1) {
      throw new Error('허용되지 않는 URL 프로토콜입니다.');
    }
    return value;
  }

  function emptyCardCaption() {
    return {
      mobilePos: null, imgMode: null,
      overlayColor: null, overlayStrength: null, overlayDirection: null,
      overlayStartStop: null, overlayEndStop: null,
      url: '', linkEnabled: false, newTab: false, overlaySavedStrength: null, unknown: [], warnings: []
    };
  }

  function decodeCardCaption(text) {
    var out = emptyCardCaption();
    splitCardCaption(text).forEach(function (segment) {
      var upper = segment.toUpperCase();
      if (['FULL', 'FIT', 'BG'].indexOf(upper) !== -1) { out.imgMode = upper.toLowerCase(); return; }
      if (['MT', 'MB'].indexOf(upper) !== -1) { out.mobilePos = upper; return; }
      if (upper === 'BACK' || upper === 'FIT_PAD') {
        out.warnings.push('지원하지 않는 모드: ' + segment + '. BG/FIT/FULL을 사용하세요.');
        out.unknown.push(segment); return;
      }
      var urlMatch = /^URL\s+([\s\S]+)$/i.exec(segment);
      if (urlMatch) {
        var address = urlMatch[1].trim();
        out.newTab = /^NEW\s+/i.test(address);
        if (out.newTab) address = address.replace(/^NEW\s+/i, '');
        try { out.url = normalizeCardUrl(address); out.linkEnabled = !!out.url; }
        catch (e) { out.warnings.push(e.message); }
        return;
      }
      var olMatch = /^OL(?:\s+([\s\S]+))?$/i.exec(segment);
      if (olMatch) {
        if (!olMatch[1]) { out.warnings.push('OL 값이 없습니다.'); return; }
        var tokens = olMatch[1].match(/rgba\([^)]*\)|\S+/gi) || [];
        var color = { hex: '#ffffff', alpha: 1 }, nums = [], direction = 'A', invalid = false;
        tokens.forEach(function (token) {
          var u = token.toUpperCase();
          if (/^[TBLRA]$/.test(u)) { direction = u; return; }
          if (/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token)) { nums.push(Number(token)); return; }
          var parsed = cardCaptionColor(token);
          if (parsed) color = parsed;
          else { out.warnings.push('OL 값 확인: ' + token); invalid = true; }
        });
        var opacity = nums.length ? nums[0] : 0.4;
        var start = nums.length > 1 ? nums[1] : 0;
        var end = nums.length > 2 ? nums[2] : 65;
        if (invalid || nums.length > 3 || opacity > 1 || start > 100 || end > 100 || (direction !== 'A' && start >= end)) {
          out.warnings.push('OL 진하기(0~1)와 범위(시작<끝, 0~100)를 확인하세요.'); return;
        }
        out.overlayColor = color.hex;
        out.overlayStrength = opacity * color.alpha;
        out.overlaySavedStrength = out.overlayStrength;
        out.overlayDirection = direction;
        out.overlayStartStop = start;
        out.overlayEndStop = end;
        return;
      }
      out.unknown.push(segment);
      out.warnings.push('해석하지 않은 캡션 항목: ' + segment);
    });
    return out;
  }

  function serializeCardCaption(info) {
    var parts = [];
    if (info.imgMode) parts.push(info.imgMode.toUpperCase());
    if (info.overlayStrength !== null) {
      var ol = 'OL ' + info.overlayColor + ' ' + Number(info.overlayStrength.toFixed(4)) + ' ' + info.overlayDirection;
      if (info.overlayDirection !== 'A') ol += ' ' + info.overlayStartStop + ' ' + info.overlayEndStop;
      parts.push(ol);
    }
    if (info.mobilePos) parts.push(info.mobilePos);
    if (info.url && info.linkEnabled !== false) {
      var addr = /[,'"]/.test(info.url) ? '"' + info.url.replace(/"/g, '%22') + '"' : info.url;
      parts.push('URL ' + (info.newTab ? 'NEW ' : '') + addr);
    }
    (info.unknown || []).forEach(function (segment) { parts.push(segment); });
    return parts.join(', ');
  }

  function ownImageBlocks(callout, wrap) {
    return Array.prototype.slice.call(wrap.querySelectorAll('.notion-image-block')).filter(function (image) {
      return image.closest('.notion-callout-block') === callout;
    });
  }

  function captureCardImages(box, st) {
    var callout = st.callout, wrap = st.wrap;
    var nodes = [wrap].concat(Array.prototype.slice.call(wrap.querySelectorAll('div,img,figure,figcaption'))).filter(function (node) {
      return node.closest('.notion-callout-block') === callout &&
        !node.closest('.notion-record-icon');
    });
    st.imageLayoutNodes = nodes.map(function (node) {
      return { node: node, style: node.getAttribute('style'), cls: node.getAttribute('class'),
        side: node.getAttribute('data-fit-side'), pos: node.getAttribute('data-fit-pos'),
        mpos: node.getAttribute('data-fit-mpos') };
    });
    st.imageEntries = ownImageBlocks(callout, wrap).map(function (image, index) {
      var caption = findCaptionEl(image);
      var text = caption ? caption.textContent || '' : '';
      var info = decodeCardCaption(text);
      var marker = document.createComment('ce-card-image-origin');
      image.parentNode.insertBefore(marker, image);
      return {
        key: image.getAttribute('data-block-id') || (callout.getAttribute('data-block-id') || 'card') + ':image:' + index,
        node: image, captionNode: caption, marker: marker, parent: image.parentNode,
        originalText: text, original: dashClone(info), current: dashClone(info),
        changed: false, index: index
      };
    });
    st.imageOriginalColumns = Array.prototype.slice.call(wrap.querySelectorAll('.notion-column_list-block')).filter(function (node) { return isOwnedBy(node, callout); });
    st.imageLinkCleanup = null;
    st.imageLinkBase = {
      role: callout.getAttribute('role'), tab: callout.getAttribute('tabindex'),
      label: callout.getAttribute('aria-label')
    };
  }

  function restoreAttr(node, name, value) {
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  }

  function restoreCardImageLayout(box, st) {
    if (!st.wrap.isConnected) throw new Error('카드 DOM이 교체됐습니다. 새로고침 후 다시 선택하세요.');
    st.imageEntries.forEach(function (entry) {
      if (!entry.node.isConnected || !entry.parent.isConnected || !entry.marker.parentNode) {
        throw new Error('이미지 원본 위치가 사라졌습니다. 새로고침하세요.');
      }
    });
    Array.prototype.slice.call(box.querySelectorAll('.card-engine-bg-overlay')).filter(function (layer) {
      return layer.closest('[data-card-engine-box]') === box;
    }).forEach(function (layer) { layer.remove(); });
    st.imageEntries.forEach(function (entry) {
      entry.marker.parentNode.insertBefore(entry.node, entry.marker.nextSibling);
      if (entry.changed) entry.node._ccCaptionOverride = dashClone(entry.current);
      else delete entry.node._ccCaptionOverride;
    });
    st.imageLayoutNodes.forEach(function (saved) {
      if (!saved.node.isConnected) return;
      restoreAttr(saved.node, 'style', saved.style);
      restoreAttr(saved.node, 'class', saved.cls);
      restoreAttr(saved.node, 'data-fit-side', saved.side);
      restoreAttr(saved.node, 'data-fit-pos', saved.pos);
      restoreAttr(saved.node, 'data-fit-mpos', saved.mpos);
    });
  }

  function refreshCardImageLinks(box, st) {
    if (!st.imageEntries) return;
    if (st.imageLinkCleanup) { st.imageLinkCleanup(); st.imageLinkCleanup = null; }
    var root = st.callout, base = st.imageLinkBase;
    restoreAttr(root, 'role', base.role);
    restoreAttr(root, 'tabindex', base.tab);
    restoreAttr(root, 'aria-label', base.label);
    root.removeAttribute('data-ce-card-linked');
    root.removeAttribute('data-ce-card-link-scope');
    root.removeAttribute('data-ce-card-url');
    root.removeAttribute('data-ce-card-new-tab');
    var entries = st.imageEntries.filter(function (entry) { return !!entry.current.url && entry.current.linkEnabled !== false; });
    st.imageLinkWarning = '';
    if (!entries.length) return;
    var first = entries[0].current;
    if (entries.some(function (entry) {
      return entry.current.url !== first.url || entry.current.newTab !== first.newTab;
    })) {
      st.imageLinkWarning = '한 카드에 서로 다른 전체 링크가 있습니다. URL과 새 탭 설정을 하나로 통일하세요.';
      console.warn('[card link] ' + st.imageLinkWarning);
      return;
    }
    var address;
    try { address = normalizeCardUrl(first.url); }
    catch (e) { st.imageLinkWarning = e.message; return; }
    root.setAttribute('data-ce-card-linked', 'true');
    root.setAttribute('data-ce-card-link-scope', 'card');
    root.setAttribute('data-ce-card-url', address);
    root.setAttribute('data-ce-card-new-tab', first.newTab ? 'true' : 'false');
    root.setAttribute('role', 'link');
    root.setAttribute('tabindex', '0');
    if (!base.label) root.setAttribute('aria-label', '카드 링크 열기');
    var start = null, dragged = false, resetTimer = null;
    function down(event) { if (event.button !== 0) return; start = { x: event.clientX, y: event.clientY }; dragged = false; }
    function move(event) { if (start && (Math.abs(event.clientX - start.x) > 8 || Math.abs(event.clientY - start.y) > 8)) dragged = true; }
    function up() { start = null; clearTimeout(resetTimer); resetTimer = setTimeout(function () { dragged = false; }, 100); }
    function internal(event) {
      var target = event.target && event.target.nodeType === 1 ? event.target : event.target.parentElement;
      if (!target || target.closest('.notion-callout-block') !== root) return true;
      var interactive = target.closest('a,button,input,textarea,select,summary,[role="button"],[role="textbox"],[contenteditable="true"],.ga-dynamic-btn,[data-ce-interactive]');
      return !!interactive && interactive !== root;
    }
    function selectedText() {
      var selection = global.getSelection && global.getSelection();
      return !!(selection && !selection.isCollapsed && selection.toString().trim() && root.contains(selection.anchorNode));
    }
    function navigate(event) {
      if (event.defaultPrevented || dragged || internal(event) || selectedText()) return;
      if (event.type === 'click' && event.button !== 0) return;
      if (event.type === 'auxclick' && event.button !== 1) return;
      event.preventDefault();
      if (first.newTab || event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1) {
        global.open(address, '_blank', 'noopener,noreferrer');
      } else global.location.assign(address);
    }
    function key(event) {
      if (event.target !== root || event.key !== 'Enter') return;
      navigate(event);
    }
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
    root.addEventListener('click', navigate);
    root.addEventListener('auxclick', navigate);
    root.addEventListener('keydown', key);
    st.imageLinkCleanup = function () {
      clearTimeout(resetTimer);
      root.removeEventListener('pointerdown', down);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', up);
      root.removeEventListener('pointercancel', up);
      root.removeEventListener('click', navigate);
      root.removeEventListener('auxclick', navigate);
      root.removeEventListener('keydown', key);
    };
  }

  function refreshImageDecorations(box, st, entry) {
    entry.node._ccCaptionOverride = dashClone(entry.current);
    var info = entry.current;
    if ((info.imgMode || defaultImageMode(st.cfg)) === 'bg') {
      var overlays = Array.prototype.slice.call(box.querySelectorAll('.card-engine-bg-overlay')).filter(function (node) {
        return node.closest('[data-card-engine-box]') === box;
      });
      if (info.overlayStrength === null) {
        overlays.forEach(function (node) { node.remove(); });
      } else {
        if (entry.node.parentNode !== box) throw new Error('BG 이미지 위치를 확인할 수 없습니다. 새로고침하세요.');
        var overlay = overlays[0];
        if (!overlay) {
          insertOverlay(box, entry.node, info);
        } else {
          overlay.style.background = buildOverlayGradient(info.overlayColor, info.overlayStrength,
            info.overlayDirection, info.overlayStartStop, info.overlayEndStop);
          overlays.slice(1).forEach(function (node) { node.remove(); });
        }
      }
    }
    refreshCardImageLinks(box, st);
  }

  function rebuildCardImages(box) {
    var st = state.get(box);
    if (!st || st.kind === 'group') throw new Error('그룹 대신 개별 카드를 선택하세요.');
    var bgCount = st.imageEntries.filter(function (entry) {
      return (entry.current.imgMode || defaultImageMode(st.cfg)) === 'bg';
    }).length;
    if (bgCount > 1) throw new Error('카드 하나에는 BG 이미지 한 개만 사용할 수 있습니다.');
    if (st.imageOriginalColumns.length > 1) throw new Error('여러 컬럼 행이 섞인 개별 카드는 아직 실시간 모드 전환 대상이 아닙니다.');
    restoreCardImageLayout(box, st);
    st.stack = []; st.columns = []; st.fit = []; st.fitCols = [];
    st.kind = null;
    setCardVars(box, st.cfg);
    applyFrame(box, st.level, st.cfg);
    var columns = Array.prototype.slice.call(st.wrap.querySelectorAll('.notion-column_list-block')).filter(function (node) {
      return isOwnedBy(node, st.callout);
    });
    if (columns.length > 1) throw new Error('여러 컬럼 행이 섞인 개별 카드는 아직 실시간 모드 전환 대상이 아닙니다.');
    if (columns[0]) processColumnLayout(box, st, columns[0], st.wrap, st.cfg);
    else processStackLayout(box, st, st.wrap, st.callout, st.cfg);
    refreshCardImageLinks(box, st);
    box._ccRetry = 0; box._ccVer = 0;
    refit(box); scheduleRefit(box);
    setTimeout(function () { scheduleRefit(box); }, 150);
  }

  /* 캡션 요소 찾기. 클래스 이름은 우피가 바꿀 수 있어서 구조로 찾는다.
     1) 예전 방식(figcaption, 클래스에 caption 포함)이 있으면 그대로 쓴다.
     2) 없으면 이미지 블록 안에서 이미지·영상 등을 포함하지 않으면서 글자가 있는 요소 중
        가장 바깥(문서 순서상 가장 먼저 나오는) 요소를 캡션으로 본다. */
  function findCaptionEl(imageBlockEl) {
    var legacy = imageBlockEl.querySelector('figcaption, [class*="Caption"], [class*="caption"]');
    if (legacy) return legacy;
    var nodes = imageBlockEl.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (/^(IMG|VIDEO|IFRAME|SVG|CANVAS|PICTURE|SCRIPT|STYLE|NOSCRIPT)$/i.test(node.tagName)) continue;
      if (node.querySelector('img,video,iframe,svg,canvas,picture')) continue;
      if ((node.textContent || '').trim()) return node;
    }
    return null;
  }
  function hexToRgb(hex) {
    var clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(function (c) { return c + c; }).join('');
    var num = parseInt(clean, 16);
    if (isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function parseImageCaption(captionEl) {
    return decodeCardCaption(captionEl ? captionEl.textContent || '' : '');
  }
  function processImageCaption(imgBlock) {
    var captionEl = findCaptionEl(imgBlock);
    if (captionEl) captionEl.classList.add('card-engine-caption-hidden');
    return imgBlock._ccCaptionOverride
      ? dashClone(imgBlock._ccCaptionOverride) : parseImageCaption(captionEl);
  }
  function buildOverlayGradient(hexColor, strength, direction, startStop, endStop) {
    var rgb = hexToRgb(hexColor) || { r: 255, g: 255, b: 255 };
    var color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + strength + ')';
    if (direction === 'A') return color;
    var dirMap = { T: 'to bottom', B: 'to top', L: 'to right', R: 'to left' };
    var cssDirection = dirMap[direction] || 'to bottom';
    var start = (typeof startStop === 'number' ? startStop : 0);
    var end = (typeof endStop === 'number' ? endStop : 65);
    return 'linear-gradient(' + cssDirection + ', ' + color + ' ' + start + '%, rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0) ' + end + '%)';
  }
  function insertOverlay(cardBox, afterEl, caption) {
    if (caption.overlayStrength === null) return;
    var overlay = document.createElement('div');
    overlay.className = 'card-engine-bg-overlay';
    overlay.style.background = buildOverlayGradient(
      caption.overlayColor || NAMED_COLORS.WHITE, caption.overlayStrength,
      caption.overlayDirection || 'A', caption.overlayStartStop, caption.overlayEndStop
    );
    cardBox.insertBefore(overlay, afterEl.nextSibling);
  }

  function styleIcon(icon) {
    icon.classList.add('card-engine-icon-wrap');
    icon.style.width = 'var(--i-size)';
    icon.style.height = 'var(--i-size)';
    icon.style.borderRadius = 'var(--ce-card-icon-radius, 10px)';
    icon.style.background = 'var(--ce-card-icon-bg, #f2f3f5)';
    icon.style.flexShrink = '0';
    Array.prototype.forEach.call(icon.querySelectorAll('div'), function (d) {
      d.style.display = 'flex'; d.style.alignItems = 'center'; d.style.justifyContent = 'center';
      d.style.width = '100%'; d.style.height = '100%';
    });
    var innerImg = icon.querySelector('img');
    if (innerImg) { innerImg.style.width = '72%'; innerImg.style.height = '72%'; innerImg.style.objectFit = 'contain'; }
  }
  function relocateIconIntoTextColumn(st, cardBox, blocksWrap, textColumnEl) {
    var found = findIconEl(cardBox, blocksWrap);
    if (!found || found.icon.dataset.engineIconDone) return;
    var icon = found.icon;
    icon.dataset.engineIconDone = 'true';
    styleIcon(icon);
    if (textColumnEl.firstChild) textColumnEl.insertBefore(icon, textColumnEl.firstChild);
    else textColumnEl.appendChild(icon);
    if (found.wrapEl && found.wrapEl.children.length === 0) found.wrapEl.style.display = 'none';
    st.icon = icon;
  }
  function relocateIconIntoBlocksWrap(st, cardBox, blocksWrap) {
    var found = findIconEl(cardBox, blocksWrap);
    if (!found || found.icon.dataset.engineIconDone) return;
    var icon = found.icon;
    icon.dataset.engineIconDone = 'true';
    styleIcon(icon);
    var firstChild = blocksWrap.firstElementChild;
    var target = firstChild;
    if (firstChild && (firstChild.classList.contains('notion-image-block') || firstChild.querySelector('.notion-image-block'))) {
      target = firstChild.nextElementSibling;
    }
    if (target) blocksWrap.insertBefore(icon, target);
    else blocksWrap.appendChild(icon);
    if (found.wrapEl && found.wrapEl.children.length === 0) found.wrapEl.style.display = 'none';
    st.icon = icon;
  }
  function moveIconBelowImage(st, wrap, imageBlock) {
    var icon = st.icon;
    if (!icon) return;
    if (icon.parentElement === wrap && icon.previousElementSibling === imageBlock) return;
    var next = imageBlock.nextElementSibling;
    if (next) wrap.insertBefore(icon, next);
    else wrap.appendChild(icon);
  }

  function resetInline(el) {
    FIT_RESET.forEach(function (p) { el.style.removeProperty(p); });
  }
  function forceFillChain(root) {
    Array.prototype.forEach.call(root.querySelectorAll('div, img'), function (el) {
      el.style.height = '100%'; el.style.width = '100%'; el.style.margin = '0';
      if (el.tagName === 'IMG') el.style.objectFit = 'cover';
    });
  }
  function restoreNaturalImage(imageBlock) {
    resetInline(imageBlock);
    Array.prototype.forEach.call(imageBlock.querySelectorAll('div'), function (el) {
      el.style.height = 'auto'; el.style.width = '100%'; el.style.margin = '0';
    });
    var image = imageBlock.querySelector('img');
    if (image) {
      image.style.width = '100%'; image.style.height = 'auto'; image.style.display = 'block';
      image.style.objectFit = 'initial'; image.style.margin = '0';
    }
    return image;
  }
  function stackPosition(wrap, imageBlock) {
    var m = children(wrap).filter(isMeaningful);
    if (m[0] === imageBlock) return 'top';
    if (m[m.length - 1] === imageBlock) return 'bottom';
    return 'middle';
  }
  // 크기를 못 잰 경우(지연 로딩 이미지, 숨김 상태 등) 잠시 후 다시 시도한다.
  function retryLater(box) {
    var n = box._ccRetry || 0;
    if (n >= MAX_RETRY) return;
    box._ccRetry = n + 1;
    setTimeout(function () { scheduleRefit(box); }, 250);
  }
  function fitStackImage(box, st, imageBlock) {
    var wrap = st.wrap;
    var image = restoreNaturalImage(imageBlock);
    if (!image) return false;
    var pos = stackPosition(wrap, imageBlock);
    if (pos === 'middle') { imageBlock.classList.remove('stack-card-fixed'); return true; }
    imageBlock.classList.add('stack-card-fixed');
    if (pos === 'top') moveIconBelowImage(st, wrap, imageBlock);

    var imgRect = imageBlock.getBoundingClientRect();
    var cardRect = box.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height || !cardRect.width) return false;

    var currentMarginLeft = cssNumber(imageBlock, 'marginLeft');
    var leftCorrection = cardRect.left - imgRect.left;
    var topGap = pos === 'top' ? Math.max(0, imgRect.top - cardRect.top) : 0;
    var bottomGap = pos === 'bottom' ? Math.max(0, cardRect.bottom - imgRect.bottom) : 0;
var parsedGap = parseFloat(rootVar('--ce-card-img-gap', '20px'));
var gap = Number.isFinite(parsedGap) ? Math.max(0, parsedGap) : 20;
    var w = Math.ceil(cardRect.width + EDGE_OVERSCAN) + 'px';
    var s = imageBlock.style;
    s.setProperty('box-sizing', 'content-box', 'important');
    s.setProperty('width', w, 'important');
    s.setProperty('min-width', w, 'important');
    s.setProperty('max-width', 'none', 'important');
    s.setProperty('flex', '0 0 auto', 'important');
    s.setProperty('align-self', 'flex-start', 'important');
    s.setProperty('height', 'auto', 'important');
    s.setProperty('margin-left', (currentMarginLeft + leftCorrection - EDGE_OVERSCAN) + 'px', 'important');
    s.setProperty('margin-right', '-999px', 'important');
    if (pos === 'top') {
      s.setProperty('margin-top', '-' + topGap + 'px', 'important');
      s.setProperty('margin-bottom', gap + 'px', 'important');
    } else {
      s.setProperty('margin-top', gap + 'px', 'important');
      s.setProperty('margin-bottom', '-' + bottomGap + 'px', 'important');
    }
    return true;
  }
  function fitColumnDesktop(box, st, c) {
    c.wrap.style.margin = '0';
    resetInline(c.col);
    c.col.style.margin = '0';
    var rect = c.col.getBoundingClientRect();
    var wrapRect = st.wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    var leftGap = c.isFirst ? Math.max(0, rect.left - wrapRect.left) : 0;
    var rightGap = !c.isFirst ? Math.max(0, wrapRect.right - rect.right) : 0;
    var topGap = Math.max(0, rect.top - wrapRect.top);
    var bottomGap = Math.max(0, wrapRect.bottom - rect.bottom);
    var s = c.col.style;
    s.boxSizing = 'content-box';
    s.height = (rect.height + topGap + bottomGap) + 'px';
    s.width = (rect.width + leftGap + rightGap) + 'px';
    s.marginTop = '-' + topGap + 'px';
    s.marginBottom = '-' + bottomGap + 'px';
    s.marginLeft = '-' + leftGap + 'px';
    s.marginRight = '-' + rightGap + 'px';
    return true;
  }
  function columnMobilePos(c) {
    var io = parseFloat(global.getComputedStyle(c.wrap).order) || 0;
    var to = c.textWrap ? (parseFloat(global.getComputedStyle(c.textWrap).order) || 0) : io + 1;
    return io < to ? 'top' : 'bottom';
  }
  function fitColumnMobile(box, st, c) {
    resetInline(c.col);
    var pos = columnMobilePos(c);
    if (pos === 'bottom') c.wrap.style.setProperty('margin-bottom', '0', 'important');
    var cardRect = box.getBoundingClientRect();
    var r = c.col.getBoundingClientRect();
    if (!r.width || !cardRect.width) return false;
    var leftGap = Math.max(0, r.left - cardRect.left);
    var rightGap = Math.max(0, cardRect.right - r.right);
    var topGap = pos === 'top' ? Math.max(0, r.top - cardRect.top) : 0;
    var bottomGap = pos === 'bottom' ? Math.max(0, cardRect.bottom - r.bottom) : 0;
    var s = c.col.style;
    s.setProperty('box-sizing', 'content-box', 'important');
    s.setProperty('width', (r.width + leftGap + rightGap) + 'px', 'important');
    s.setProperty('max-width', 'none', 'important');
    s.setProperty('min-width', '0', 'important');
    s.setProperty('flex', '0 0 auto', 'important');
    s.setProperty('align-self', 'flex-start', 'important');
    s.setProperty('height', 'auto', 'important');
    s.setProperty('margin-left', '-' + leftGap + 'px', 'important');
    s.setProperty('margin-right', '-' + rightGap + 'px', 'important');
    s.setProperty('margin-top', pos === 'top' ? ('-' + topGap + 'px') : '0', 'important');
    s.setProperty('margin-bottom', pos === 'bottom' ? ('-' + bottomGap + 'px') : '0', 'important');
    return true;
  }
  function refit(box) {
    var st = state.get(box);
    if (!st || !box.isConnected) return;
    var mobile = mql.matches;
    var ok = true;
    st.fit.forEach(function (ib) { ib.setAttribute('data-fit-pos', stackPosition(st.wrap, ib)); });
    st.fitCols.forEach(function (c) { c.col.setAttribute('data-fit-mpos', columnMobilePos(c)); });
    st.stack.forEach(function (imageBlock) { if (!fitStackImage(box, st, imageBlock)) ok = false; });
    st.columns.forEach(function (c) {
      var done = mobile ? fitColumnMobile(box, st, c) : fitColumnDesktop(box, st, c);
      if (!done) ok = false;
    });
    if (ok) box._ccRetry = 0;
    else retryLater(box);
    verifyLater(box);
  }
  // 맞춤이 어긋난 채 남았는지 점검하고, 어긋났으면 다시 맞춘다. (레이아웃이 뒤늦게 바뀐 경우 대비)
  function isFlush(v, tol) { return Math.abs(v) <= (tol || 3); }
  function needsRefit(box) {
    var st = state.get(box);
    if (!st || !box.isConnected) return false;
    var mobile = mql.matches;
    var cr = box.getBoundingClientRect();
    if (!cr.width) return false;
    var bad = false;
    st.stack.forEach(function (ib) {
      if (!ib.classList.contains('stack-card-fixed')) return;
      var g = ib.getBoundingClientRect();
      if (!isFlush(g.left - cr.left, 4) || !isFlush(cr.right - g.right, 4)) bad = true;
    });
    st.columns.forEach(function (c) {
      var g = c.col.getBoundingClientRect();
      if (!g.width) return;
      var L = g.left - cr.left, R = cr.right - g.right, T = g.top - cr.top, B = cr.bottom - g.bottom;
      if (mobile) {
        var pos = columnMobilePos(c);
        if (!isFlush(L) || !isFlush(R) || !isFlush(pos === 'top' ? T : B)) bad = true;
      } else {
        if (!isFlush(T) || !isFlush(B) || !isFlush(c.isFirst ? L : R)) bad = true;
      }
    });
    return bad;
  }
  function verifyLater(box) {
    clearTimeout(box._ccVt);
    box._ccVt = setTimeout(function () {
      if ((box._ccVer || 0) >= 5) return;
      if (needsRefit(box)) { box._ccVer = (box._ccVer || 0) + 1; scheduleRefit(box); }
      else box._ccVer = 0;
    }, 250);
  }
  function scheduleRefit(box) {
    if (pending.has(box)) return;
    pending.add(box);
    requestAnimationFrame(function () {
      pending.delete(box);
      try { refit(box); } catch (e) { console.error('[card] 이미지 맞춤 오류', e); }
    });
  }
  function refitAll() {
    liveBoxes = liveBoxes.filter(function (b) { return b.isConnected; });
    liveBoxes.forEach(function (b) { b._ccRetry = 0; b._ccVer = 0; scheduleRefit(b); });
  }
  var ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(function (entries) {
    entries.forEach(function (en) {
      var b = en.target;
      var w = Math.round(en.contentRect.width);
      if (b._ccW === w) { verifyLater(b); return; }
      b._ccW = w;
      b._ccVer = 0;
      scheduleRefit(b);
    });
  }) : null;
  var io = (typeof IntersectionObserver !== 'undefined') ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) scheduleRefit(en.target); });
  }, { rootMargin: '200px' }) : null;
  if (mql.addEventListener) mql.addEventListener('change', refitAll);
  else if (mql.addListener) mql.addListener(refitAll);
  global.addEventListener('load', refitAll);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refitAll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refitAll);

  function applyFrame(box, level, cfg) {
    var s = box.style;
    if (box.getAttribute('data-cc-orig-bg') === null) {
      box.setAttribute('data-cc-orig-bg', s.background || s.backgroundColor || '');
    }
    var flat = (level === 'BORDER' || level === 'ALL');
    if (flat) {
      s.borderWidth = '0'; s.borderStyle = 'none'; s.borderColor = 'transparent'; s.boxShadow = 'none';
    } else {
      s.borderWidth = '1px'; s.borderStyle = 'solid';
      s.borderColor = 'var(--ce-card-border, rgba(55,53,47,0.09))';
      s.boxShadow = 'var(--ce-card-shadow, 0 1px 3px rgba(0,0,0,0.08))';
    }
    s.borderRadius = 'var(--cc-radius, var(--ce-card-radius, 16px))';
    s.padding = '0px';
    s.boxSizing = 'border-box';
    s.overflow = 'hidden';
    s.position = 'relative';

    s.removeProperty('background');
    if (level === 'NONE') box.removeAttribute('data-card-plain');
    else box.setAttribute('data-card-plain', level);

    if (level === 'ALL') {
      s.setProperty('background', 'transparent');
    } else if (cfg.bc) {
      s.setProperty('background', cfg.bc, 'important');
    } else {
      var orig = box.getAttribute('data-cc-orig-bg') || '';
      if (orig && orig !== 'transparent' && orig !== 'rgba(0, 0, 0, 0)') s.background = orig;
      else s.background = 'var(--ce-card-bg, #ffffff)';
    }
  }

  function cleanBgImage(imgBlock) {
    imgBlock.classList.add('card-engine-bg-image');
    imgBlock.classList.remove('card-engine-image-stack', 'card-engine-image-col', 'is-fit', 'is-full');
    ['width', 'height', 'margin', 'box-sizing'].forEach(function (p) { imgBlock.style.removeProperty(p); });
    Array.prototype.forEach.call(imgBlock.querySelectorAll('div'), function (el) {
      ['width', 'height', 'margin', 'padding'].forEach(function (p) { el.style.removeProperty(p); });
    });
    var image = imgBlock.querySelector('img');
    if (image) ['width', 'height', 'margin', 'padding', 'object-fit'].forEach(function (p) { image.style.removeProperty(p); });
  }
  function applyBgModeStack(cardBox, blocksWrap, imgBlock, caption) {
    cardBox.style.position = 'relative';
    cardBox.style.background = 'transparent';
    cleanBgImage(imgBlock);
    cardBox.insertBefore(imgBlock, cardBox.firstChild);
    insertOverlay(cardBox, imgBlock, caption);
    blocksWrap.classList.add('card-engine-bg-content');
  }
  function applyBgModeColumn(cardBox, blocksWrap, imageItem, textItem, caption) {
    cardBox.style.position = 'relative';
    cardBox.style.background = 'transparent';
    var imgBlock = imageItem.col.querySelector('.notion-image-block');
    if (!imgBlock) { console.warn('[card] BG 모드용 이미지 블록을 찾지 못했습니다.'); return; }
    cleanBgImage(imgBlock);
    cardBox.insertBefore(imgBlock, cardBox.firstChild);
    insertOverlay(cardBox, imgBlock, caption);
    imageItem.wrap.classList.add('card-engine-bg-collapsed-col');
    if (textItem) textItem.wrap.classList.add('card-engine-bg-text-col');
    blocksWrap.classList.add('card-engine-bg-content');
  }

  function processColumnLayout(box, st, columnListEl, blocksWrap, cfg) {
    var flexRow = getFlexRow(columnListEl);
    if (!flexRow) return;
    st.kind = st.kind || 'column';
    flexRow.classList.add('card-engine-flexrow');
    var classified = classifyFlexRowChildren(flexRow);
    classified.others.forEach(function (el) { el.classList.add('card-engine-spacer'); });

    var textColumnEl = null, textItem = null, imageItem = null;
    classified.columnWraps.forEach(function (item) {
      if (item.col.querySelector('.notion-image-block')) imageItem = item;
      else { textColumnEl = item.col; textItem = item; }
    });

    if (textColumnEl) relocateIconIntoTextColumn(st, box, blocksWrap, textColumnEl);
    else relocateIconIntoBlocksWrap(st, box, blocksWrap);

    if (imageItem) {
      var peekBlock = imageItem.col.querySelector('.notion-image-block');
      var peek = processImageCaption(peekBlock);
      var peekMode = peek.imgMode || defaultImageMode(cfg);
      if (peekMode === 'bg') {
        applyBgModeColumn(box, blocksWrap, imageItem, textItem, peek);
        return;
      }
    }

    classified.columnWraps.forEach(function (item, idx) {
      item.wrap.classList.add('card-engine-col-wrap');
      item.wrap.style.setProperty('--mobile-order', String(idx + 1));
      var imgBlock = item.col.querySelector('.notion-image-block');
      if (!imgBlock) return;

      item.col.classList.add('card-engine-image-col');
      var caption = processImageCaption(imgBlock);
      if (caption.mobilePos === 'MT') item.wrap.style.setProperty('--mobile-order', '-99');
      else if (caption.mobilePos === 'MB') item.wrap.style.setProperty('--mobile-order', '99');

      var mode = caption.imgMode || defaultImageMode(cfg);
      item.col.classList.remove('is-fit', 'is-full');
      item.col.classList.add(mode === 'full' ? 'is-full' : 'is-fit');

      if (mode === 'full') {
        item.wrap.style.padding = '0';
        item.wrap.style.margin = '0';
        forceFillChain(item.col);
        st.columns.push({ col: item.col, wrap: item.wrap, isFirst: idx === 0, textWrap: textItem ? textItem.wrap : null });
      } else {
        item.col.setAttribute('data-fit-side', idx === 0 ? 'first' : 'last');
        st.fitCols.push({ col: item.col, wrap: item.wrap, textWrap: textItem ? textItem.wrap : null });
      }
    });
  }

  function processStackLayout(box, st, blocksWrap, callout, cfg) {
    st.kind = st.kind || 'stack';
    relocateIconIntoBlocksWrap(st, box, blocksWrap);
    blocksWrap.classList.add('stack-card-fixed');

    var imgBlocks = Array.prototype.slice.call(blocksWrap.querySelectorAll('.notion-image-block')).filter(function (b) {
      return b.closest('.notion-callout-block') === callout;
    });
    var bgDone = false;
    imgBlocks.forEach(function (imgBlock) {
      var caption = processImageCaption(imgBlock);
      var mode = caption.imgMode || defaultImageMode(cfg);
      if (mode === 'bg') {
        if (!bgDone) { applyBgModeStack(box, blocksWrap, imgBlock, caption); bgDone = true; }
        return;
      }
      imgBlock.classList.add('card-engine-image-stack');
      imgBlock.classList.remove('is-fit', 'is-full');
      imgBlock.classList.add(mode === 'full' ? 'is-full' : 'is-fit');
      if (mode === 'full') st.stack.push(imgBlock);
      else st.fit.push(imgBlock);
    });
  }

    function processNestedCalloutGroup(box, st, blocksWrap, cfg) {
    var callout = st.callout;
    var columnLists = Array.prototype.slice.call(blocksWrap.querySelectorAll(':scope > .notion-column_list-block'));
    var gridCells = [], fallbackRows = [];
    columnLists.forEach(function (columnListEl) {
      var flexRow = getFlexRow(columnListEl);
      if (!flexRow) return;
      var classified = classifyFlexRowChildren(flexRow);
      // 컬럼 중 하나라도 콜아웃이 있으면 카드 그룹 행으로 본다. (콜아웃이 없는 칸은 빈 칸으로 유지)
      var hasCallout = classified.columnWraps.length > 0 && classified.columnWraps.some(function (item) {
        return !!item.col.querySelector('.notion-callout-block');
      });
      if (!hasCallout) { fallbackRows.push(columnListEl); return; }
      classified.columnWraps.forEach(function (item) { gridCells.push(item.col); });
      columnListEl.dataset.engineGroupRowConsumed = 'true';
    });

    // 컬럼 없이 바로 아래에 쌓인 하위 콜아웃(세로로 나열)도 카드 그룹으로 본다.
    var direct = Array.prototype.slice.call(blocksWrap.querySelectorAll('.notion-callout-block')).filter(function (c) {
      if (!isOwnedBy(c, callout)) return false;
      var cl = c.closest('.notion-column_list-block');
      return !(cl && blocksWrap.contains(cl));
    });
    if (gridCells.length === 0 && direct.length === 0) return false;

    if (gridCells.length > 0) {
      var firstGridRow = columnLists.filter(function (cl) { return cl.dataset.engineGroupRowConsumed === 'true'; })[0];
      var firstRowFlex = getFlexRow(firstGridRow);
      var colCount = firstRowFlex ? classifyFlexRowChildren(firstRowFlex).columnWraps.length : gridCells.length;

      var gridContainer = document.createElement('div');
      gridContainer.className = 'card-engine-group-grid';
      gridContainer.style.setProperty('--card-group-cols', String(colCount));
      blocksWrap.insertBefore(gridContainer, firstGridRow);

      columnLists.forEach(function (cl) {
        if (cl.dataset.engineGroupRowConsumed === 'true') cl.remove();
      });

      gridCells.forEach(function (col) {
        var cell = document.createElement('div');
        cell.className = 'card-engine-group-cell';
        cell.appendChild(col);
        gridContainer.appendChild(cell);
        var innerCallout = col.querySelector('.notion-callout-block');
        if (innerCallout) renderCard(innerCallout, cfg);
      });
    }

    if (direct.length > 0) {
      var stack = document.createElement('div');
      stack.className = 'card-engine-group-grid';
      stack.style.setProperty('--card-group-cols', '1');
      direct[0].parentNode.insertBefore(stack, direct[0]);
      direct.forEach(function (c) {
        var cell = document.createElement('div');
        cell.className = 'card-engine-group-cell';
        cell.appendChild(c);
        stack.appendChild(cell);
        renderCard(c, cfg);
      });
    }

    fallbackRows.forEach(function (cl) { processColumnLayout(box, st, cl, blocksWrap, cfg); });

    var s = box.style;
    s.border = 'none'; s.boxShadow = 'none'; s.background = 'transparent'; s.borderRadius = '0'; s.overflow = 'visible';
    box.setAttribute('data-card-group', 'true');
    blocksWrap.classList.add('card-engine-group-wrap');
    st.kind = 'group';
    return true;
  }

  function renderCard(callout, cfg) {
    if (callout.dataset.ceCardDone === '1') return;
    if (callout.dataset.ceOwner && callout.dataset.ceOwner !== 'card') return;
    if (inSlide(callout)) return;

    var box = findCardBox(callout);
    if (!box) { console.error('[card] 콜아웃 안에서 실제 카드 박스를 찾지 못했습니다.'); return; }

    callout.dataset.ceCardDone = '1';
    callout.dataset.ceOwner = 'card';
    callout._ccBox = box;
    box.setAttribute('data-card-engine-box', 'true');
    Core.markPending(box);

    try {
      var blocksWrap = findBlocksWrap(box);
      if (!blocksWrap) { console.error('[card] 콘텐츠 래퍼를 찾지 못했습니다.'); return; }

      var level = readPlainLevel(callout);
      var st = { cfg: cfg, level: level, wrap: blocksWrap, stack: [], columns: [], fit: [], fitCols: [], icon: null, kind: null, callout: callout };
      state.set(box, st);

      blocksWrap.classList.add('card-engine-content-wrap');
      setCardVars(box, cfg);
      applyFrame(box, level, cfg);

      captureCardImages(box, st);

      var handled = processNestedCalloutGroup(box, st, blocksWrap, cfg);
      if (!handled) {
        var columnListEl = Array.prototype.slice.call(blocksWrap.querySelectorAll('.notion-column_list-block'))
          .filter(function (cl) { return isOwnedBy(cl, callout); })[0];
        if (columnListEl) processColumnLayout(box, st, columnListEl, blocksWrap, cfg);
        else processStackLayout(box, st, blocksWrap, callout, cfg);
      }

      if (st.kind !== 'group') refreshCardImageLinks(box, st);

      liveBoxes.push(box);
      if (ro) ro.observe(box);
      if (io) io.observe(box);
      Array.prototype.forEach.call(box.querySelectorAll('img'), function (img) {
        if (img.closest('.notion-callout-block') !== callout) return;
        if (!img.complete) img.addEventListener('load', function () { scheduleRefit(box); }, { once: true });
      });

      refit(box);
      scheduleRefit(box);
      setTimeout(function () { scheduleRefit(box); }, 150);
      setTimeout(function () { scheduleRefit(box); }, 500);
    } catch (err) {
      console.error('[card] 렌더링 중 오류', err);
    } finally {
      Core.reveal(box);
    }
  }

  function render(payload) {
    injectStyle();
    warnOldFiles();
    var block = payload.block;
    var callout = block && block.closest ? block.closest('.notion-callout-block') : null;
    if (!callout) { console.error('[card] call-card 토큰을 감쌀 콜아웃을 찾지 못했습니다.'); return; }
    var cfg = buildConfig(readParams(payload.params || {}));
    renderCard(callout, cfg);
  }

    function renderPlain(payload) {
    var block = payload.block;
    var callout = block && block.closest
      ? block.closest('.notion-callout-block') : null;
    if (!callout) return;

    callout.setAttribute(
      'data-card-plain-token-rule',
      JSON.stringify(parsePlainRule(payload.raw))
    );

    // One registered handler: do not add a second plain module.
    refreshPlainRules();
  }


  Core.register('call-card', render);
  Core.register('plain', renderPlain);

  function diagnose() {
    liveBoxes = liveBoxes.filter(function (b) { return b.isConnected; });
    var rows = liveBoxes.map(function (b, i) {
      var st = state.get(b) || {};
      var r = b.getBoundingClientRect();
      var edge = '-';
      if (st.stack && st.stack.length) {
        edge = st.stack.map(function (ib) { return Math.round(ib.getBoundingClientRect().left - r.left); }).join(',');
      }
      return {
        i: i, size: Math.round(r.width) + 'x' + Math.round(r.height), layout: st.kind || '-',
        plain: b.getAttribute('data-card-plain') || '-', fullStack: (st.stack || []).length,
        stackPos: (st.stack || []).map(function (ib) { return stackPosition(st.wrap, ib); }).join(',') || '-',
        fullCols: (st.columns || []).length, stackLeftGap: edge, retry: b._ccRetry || 0,
        pending: b.classList.contains('engine-pending'), mobile: mql.matches
      };
    });
    console.table(rows);
    return rows;
  }

  // =====================================================
  // 대시보드 연결 API v1
  // 원본은 이 API에서 최초 편집하는 시점에 보관한다.
  // =====================================================

  var dashOriginals = new WeakMap();

  var DASH_VARS = [
    '--cc-pad-x',
    '--cc-pad-y',
    '--cc-radius',
    '--cc-icon',
    '--cc-fitpad',
    '--cc-gap-x',
    '--cc-gap-y'
  ];

  function dashClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function dashOwnWrap(box) {
    return Array.prototype.slice.call(
      box.querySelectorAll('.card-engine-content-wrap')
    ).filter(function (el) {
      return el.closest('[data-card-engine-box]') === box;
    })[0] || null;
  }

  function dashResolve(target) {
    var box = null;

    if (typeof target === 'string') {
      box = dashList().filter(function (item) {
        return item.id === target;
      }).map(function (item) {
        return item.element;
      })[0] || null;
    } else if (target && target.nodeType === 1) {
      box = target.matches('[data-card-engine-box]')
        ? target
        : target.closest('[data-card-engine-box]');
    }

    if (!box || !box.isConnected || !state.has(box)) {
      throw new Error('[card dashboard] 편집 가능한 카드를 찾지 못했습니다.');
    }

    return box;
  }

  function dashList() {
    return liveBoxes.filter(function (box) {
      return box.isConnected && state.has(box);
    }).map(function (box, index) {
      var st = state.get(box);
      var callout = st.callout;

      var titleBlock = Array.prototype.slice.call(
        st.wrap.querySelectorAll(
          '.notion-header-block,' +
          '.notion-sub_header-block,' +
          '.notion-sub_sub_header-block,' +
          '.notion-header_4-block,' +
          '.notion-text-block'
        )
       ).filter(function (el) {
        var text = (el.textContent || '').trim();

        return el.closest('[data-card-engine-box]') === box &&
          el.getAttribute('data-engine-hidden') !== 'true' &&
          text.length > 0 &&
          !/\[%[\s\S]*?%\]/.test(text);
      })[0];

      return {
        id: callout.getAttribute('data-block-id') || '',
        index: index,
        title: titleBlock
          ? titleBlock.textContent.trim().slice(0, 80)
          : (st.kind === 'group' ? '카드 그룹' : '제목 없는 카드'),
        kind: st.kind,
        element: box
      };
    });
  }

  function dashRead(target) {
    var box = dashResolve(target);
    var st = state.get(box);
    var wrap = dashOwnWrap(box);
    var cs = getComputedStyle(box);
    var ws = wrap ? getComputedStyle(wrap) : null;
    var item = dashList().filter(function (entry) {
      return entry.element === box;
    })[0];

    return {
      id: item.id,
      title: item.title,
      kind: st.kind,
      config: dashClone(st.cfg),
      plain: st.level,
      mobile: mql.matches,
      computed: {
        paddingX: ws ? ws.paddingLeft : '',
        paddingY: ws ? ws.paddingTop : '',
        radius: cs.borderTopLeftRadius,
        background: cs.backgroundColor,
        border: cs.borderTopWidth,
        shadow: cs.boxShadow
      },
      edited: dashOriginals.has(box)
    };
  }

  function dashRemember(box) {
    if (dashOriginals.has(box)) return;

    var st = state.get(box);

    dashOriginals.set(box, {
      config: dashClone(st.cfg),
      plain: st.level
    });
  }

  function dashHasBg(box) {
    return Array.prototype.slice.call(box.children).some(function (el) {
      return el.classList.contains('card-engine-bg-image');
    });
  }

  function dashRefreshAppearance(box) {
    var st = state.get(box);

    DASH_VARS.forEach(function (name) {
      box.style.removeProperty(name);
    });

    setCardVars(box, st.cfg);
    applyFrame(box, st.level, st.cfg);

// 그룹의 바깥 테두리는 계속 숨긴다.
    if (st.kind === 'group') {
      box.style.border = 'none';
      box.style.boxShadow = 'none';
      box.style.background = 'transparent';
      box.style.borderRadius = '0';
      box.style.overflow = 'visible';
    } else if (dashHasBg(box)) {
// BG 이미지·오버레이는 이동하거나 다시 생성하지 않는다.
      box.style.background = 'transparent';
    }

    box._ccRetry = 0;
    box._ccVer = 0;
    scheduleRefit(box);
  }

  function dashApply(target, patch) {
    var box = dashResolve(target);
    var st = state.get(box);
    var next = dashClone(st.cfg);
    var nextPlain = st.level;
    var p = patch || {};

    var numeric = [
      'padX', 'padY', 'icon',
      'fitPad', 'gapX', 'gapY'
    ];

    // 全項目を検証してから適用する。
    Object.keys(p).forEach(function (key) {
      var value = p[key];

      if (numeric.indexOf(key) !== -1) {
        if (value === null) {
          next[key] = null;
        } else {
          var n = Number(value);
          if (value === '' || !isFinite(n) || n < 0) {
            throw new Error('[card dashboard] 잘못된 숫자: ' + key);
          }
          next[key] = n;
        }
        return;
      }

      if (key === 'radius') {
        var length = value === null ? null : toLength(value);
        if (value !== null && !length) {
          throw new Error('[card dashboard] 잘못된 반경 값');
        }
        next.radius = length;
        return;
      }

      if (key === 'bc') {
        var color = value === null ? null : toColor(value);
        if (value !== null && !color) {
          throw new Error('[card dashboard] 잘못된 배경색');
        }
        next.bc = color;
        return;
      }

      if (key === 'plain') {
        var level = String(value).toUpperCase();
        if (['NONE', 'BORDER', 'ALL'].indexOf(level) === -1) {
          throw new Error('[card dashboard] 잘못된 plain 단계');
        }
        if (st.kind === 'group') {
          throw new Error('[card dashboard] plain은 개별 카드에서 변경하세요.');
        }
        nextPlain = level;
        return;
      }

      throw new Error('[card dashboard] 아직 지원하지 않는 항목: ' + key);
    });

    dashRemember(box);
    st.cfg = next;
    st.level = nextPlain;
    dashRefreshAppearance(box);

    return dashRead(box);
  }

  function dashRestore(target) {
    var box = dashResolve(target);
    var original = dashOriginals.get(box);

    if (!original) return dashRead(box);

    var st = state.get(box);
    st.cfg = dashClone(original.config);
    st.level = original.plain;

    dashRefreshAppearance(box);
    dashOriginals.delete(box);

    return dashRead(box);
  }

  function dashToken(target) {
    var box = dashResolve(target);
    var st = state.get(box);
    var cfg = st.cfg;
    var parts = ['call-card'];

    function add(name, value) {
      if (value !== null && value !== undefined) {
        parts.push(name + ' ' + value);
      }
    }

    if (cfg.padX !== null && cfg.padX === cfg.padY) {
      add('PAD', cfg.padX);
    } else {
      add('PADX', cfg.padX);
      add('PADY', cfg.padY);
    }

    add('R', cfg.radius);
    add('BC', cfg.bc);
    add('IS', cfg.icon);
    add('FITPAD', cfg.fitPad);
    add('GAPX', cfg.gapX);
    add('GAPY', cfg.gapY);

    if (cfg.img) add('IMG', cfg.img.toUpperCase());

    return {
      card: '[% ' + parts.join(' :: ') + ' %]',
      plain: st.level === 'NONE'
        ? ''
        : st.level === 'ALL'
          ? '[% plain :: ALL %]'
          : '[% plain %]',
      note: '현재 설정에 명시된 값의 출력입니다. 상속값 비교·최소화는 대시보드에서 처리합니다.'
    };
  }

  global.CallCardEngine = {
    version: VERSION,
    refit: refitAll,
    diagnose: diagnose,
    dashboard: {
      apiVersion: '1.0.0',
      list: dashList,
      read: dashRead,
      apply: dashApply,
      restore: dashRestore,
      token: dashToken
    }
  };

  // Place AFTER global.CallCardEngine = { ... } and BEFORE boot/scan.
  (function installPlainDashboardApi() {
    var originalPreview = new WeakMap();

    function getCallout(target) {
      var box = dashResolve(target);
      return { box: box, callout: state.get(box).callout };
    }

    function read(target) {
      var value = getCallout(target);
      var own = readOwnPlainRule(value.callout);
      var resolved = resolvePlainRule(value.callout);
      var isGroup = state.get(value.box).kind === 'group';
      return {
        own: own,
        effective: resolved,
        kind: state.get(value.box).kind,
        parentDefaultAppliesTo: isGroup ? own.scope : null,
        note: isGroup
          ? '그룹 컨테이너는 원래 외형이 숨겨집니다. PLAIN 규칙은 범위 내 자식 카드에 적용됩니다.'
          : ''
      };
    }

    function apply(target, input) {
      var value = getCallout(target);
      var current = readOwnPlainRule(value.callout);
      var next;
      if (input && input.inherit === true) {
        next = { explicit: false, level: 'NONE', scope: 'CHILDREN' };
      } else {
        var level = String(input && input.level || 'BORDER').toUpperCase();
        var scope = String(input && input.scope || current.scope || 'CHILDREN').toUpperCase();
        if (['NONE', 'BORDER', 'ALL'].indexOf(level) === -1) {
          throw new Error('[plain] level은 NONE/BORDER/ALL이어야 합니다.');
        }
        if (['CHILDREN', 'DESCENDANTS'].indexOf(scope) === -1) {
          throw new Error('[plain] scope는 CHILDREN/DESCENDANTS이어야 합니다.');
        }
        next = { explicit: true, level: level, scope: scope };
      }

      if (!originalPreview.has(value.callout)) {
        originalPreview.set(value.callout,
          value.callout.getAttribute('data-card-plain-preview'));
      }
      value.callout.setAttribute('data-card-plain-preview', JSON.stringify(next));
      refreshPlainRules();
      return read(value.box);
    }

    function restore(target) {
      var value = getCallout(target);
      if (originalPreview.has(value.callout)) {
        var saved = originalPreview.get(value.callout);
        if (saved === null) value.callout.removeAttribute('data-card-plain-preview');
        else value.callout.setAttribute('data-card-plain-preview', saved);
        originalPreview.delete(value.callout);
        refreshPlainRules();
      }
      return read(value.box);
    }

    function token(target) {
      var own = read(target).own;
      if (!own.explicit) return '';
      var parts = ['plain'];
      if (own.level !== 'BORDER') parts.push(own.level);
      if (own.scope !== 'CHILDREN') parts.push('SCOPE DESCENDANTS');
      return '[% ' + parts.join(' :: ') + ' %]';
    }

    global.CallCardEngine.dashboard.plain = {
      apiVersion: '1.1.0', read: read, apply: apply,
      restore: restore, refresh: refreshPlainRules, token: token
    };
  })();



  // Image API: no source caption text is overwritten during preview.
  (function installCardImageApi() {
    function allEntries(cardTarget) {
      var boxes = cardTarget ? [dashResolve(cardTarget)] : liveBoxes;
      var out = [];
      boxes.forEach(function (box) {
        var st = state.get(box);
        if (!box.isConnected || !st || st.kind === 'group') return;
        (st.imageEntries || []).forEach(function (entry) { out.push({ box: box, st: st, entry: entry }); });
      });
      return out;
    }
    function resolve(target) {
      var found = allEntries().filter(function (item) {
        return typeof target === 'string' ? item.entry.key === target
          : target && (item.entry.node === target || item.entry.node.contains(target));
      });
      if (found.length !== 1) throw new Error('이미지를 하나로 식별하지 못했습니다. images.list()의 id를 사용하세요.');
      return found[0];
    }
    function data(item) {
      var entry = item.entry, info = entry.current;
      var img = entry.node.querySelector('img');
      return {
        id: entry.key,
        cardId: item.st.callout.getAttribute('data-block-id') || '',
        index: entry.index,
        imageSrc: img ? img.currentSrc || img.src : '',
        mode: info.imgMode ? info.imgMode.toUpperCase() : null,
        effectiveMode: (info.imgMode || defaultImageMode(item.st.cfg)).toUpperCase(),
        renderedMode: entry.node.classList.contains('card-engine-bg-image') ? 'BG' : (entry.node.classList.contains('is-full') || (entry.node.closest('.card-engine-image-col') && entry.node.closest('.card-engine-image-col').classList.contains('is-full'))) ? 'FULL' : 'FIT',
        mobile: info.mobilePos || 'AUTO',
        overlay: {
          enabled: info.overlayStrength !== null,
          color: info.overlayColor || '#ffffff',
          opacity: info.overlayStrength === null ? (info.overlaySavedStrength === null ? 0.4 : info.overlaySavedStrength) : info.overlayStrength,
          direction: info.overlayDirection || 'A',
          start: info.overlayStartStop === null ? 0 : info.overlayStartStop,
          end: info.overlayEndStop === null ? 65 : info.overlayEndStop
        },
        link: { enabled: !!info.url && info.linkEnabled !== false, url: info.url, newTab: info.newTab, scope: 'CARD' },
        originalCaption: entry.originalText,
        caption: serializeCardCaption(info),
        changed: entry.changed,
        unknown: (info.unknown || []).slice(),
        warnings: (info.warnings || []).slice().concat(item.st.imageLinkWarning ? [item.st.imageLinkWarning] : []),
        overlayActive: (info.imgMode || defaultImageMode(item.st.cfg)) === 'bg' && info.overlayStrength !== null
      };
    }
    function list(cardTarget) { return allEntries(cardTarget).map(data); }
    function read(target) { return data(resolve(target)); }
    function finiteRange(value, min, max, label) {
      var n = Number(value);
      if (value === '' || value === null || !isFinite(n) || n < min || n > max) throw new Error(label + ' 범위는 ' + min + '~' + max + '입니다.');
      return n;
    }
    function apply(target, patch) {
      var item = resolve(target), entry = item.entry, next = dashClone(entry.current), p = patch || {};
      Object.keys(p).forEach(function (key) {
        if (['mode', 'mobile', 'overlay', 'link'].indexOf(key) === -1) throw new Error('지원하지 않는 이미지 설정: ' + key);
      });
      if (Object.prototype.hasOwnProperty.call(p, 'mode')) {
        var mode = p.mode === null ? null : String(p.mode).toUpperCase();
        if (mode !== null && ['FIT', 'FULL', 'BG'].indexOf(mode) === -1) throw new Error('모드는 FIT/FULL/BG 또는 null만 허용합니다.');
        next.imgMode = mode ? mode.toLowerCase() : null;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'mobile')) {
        var mobile = String(p.mobile).toUpperCase();
        if (['AUTO', 'MT', 'MB'].indexOf(mobile) === -1) throw new Error('모바일 위치는 AUTO/MT/MB입니다.');
        next.mobilePos = mobile === 'AUTO' ? null : mobile;
      }
      if (p.overlay) {
        var o = p.overlay;
        if (Object.prototype.hasOwnProperty.call(o, 'enabled') && typeof o.enabled !== 'boolean') throw new Error('OL enabled는 true/false입니다.');
        if (o.enabled === false) {
          if (next.overlayStrength !== null) next.overlaySavedStrength = next.overlayStrength;
          next.overlayStrength = null;
        } else {
          var color = cardCaptionColor(o.color || next.overlayColor || '#ffffff');
          if (!color) throw new Error('OL 색상은 BLACK/WHITE/#hex/rgba 형식으로 입력하세요.');
          var opacity = Object.prototype.hasOwnProperty.call(o, 'opacity')
            ? finiteRange(o.opacity, 0, 1, '진하기') : next.overlayStrength === null ? (next.overlaySavedStrength === null ? 0.4 : next.overlaySavedStrength) : next.overlayStrength;
          var direction = String(o.direction || next.overlayDirection || 'A').toUpperCase();
          if (!/^[TBLRA]$/.test(direction)) throw new Error('방향은 T/B/L/R/A입니다.');
          var start = Object.prototype.hasOwnProperty.call(o, 'start') ? finiteRange(o.start, 0, 100, '시작') : next.overlayStartStop === null ? 0 : next.overlayStartStop;
          var end = Object.prototype.hasOwnProperty.call(o, 'end') ? finiteRange(o.end, 0, 100, '끝') : next.overlayEndStop === null ? 65 : next.overlayEndStop;
          if (direction !== 'A' && start >= end) throw new Error('그라데이션 시작 지점은 끝 지점보다 작아야 합니다.');
          next.overlayColor = color.hex;
          next.overlayStrength = opacity * color.alpha;
          next.overlaySavedStrength = next.overlayStrength;
          next.overlayDirection = direction;
          next.overlayStartStop = start; next.overlayEndStop = end;
        }
      }
      if (p.link) {
        var link = p.link;
        if (Object.prototype.hasOwnProperty.call(link, 'enabled') && typeof link.enabled !== 'boolean') throw new Error('enabled는 true/false입니다.');
        if (Object.prototype.hasOwnProperty.call(link, 'url')) {
          next.url = normalizeCardUrl(link.url);
          if (link.enabled === undefined) next.linkEnabled = !!next.url;
        }
        if (link.enabled === false) next.linkEnabled = false;
        if (link.enabled === true) next.linkEnabled = true;
        if (Object.prototype.hasOwnProperty.call(link, 'newTab')) {
          if (typeof link.newTab !== 'boolean') throw new Error('newTab은 true/false입니다.');
          next.newTab = link.newTab;
        }
        if (link.enabled === true && !next.url) throw new Error('이동 주소를 입력하세요.');
      }
      // Validate conflicts BEFORE changing the DOM.
      var proposed = item.st.imageEntries.map(function (e) { return e === entry ? next : e.current; });
      var bgs = proposed.filter(function (x) { return (x.imgMode || defaultImageMode(item.st.cfg)) === 'bg'; });
      if (bgs.length > 1) throw new Error('카드 하나에 BG 이미지는 한 개만 허용합니다.');
      var links = proposed.filter(function (x) { return !!x.url && x.linkEnabled !== false; });
      if (links.length && links.some(function (x) { return x.url !== links[0].url || x.newTab !== links[0].newTab; })) {
        throw new Error('카드 전체 링크는 하나입니다. 다른 이미지의 URL·새 탭 설정과 통일하세요.');
      }
      var old = entry.current, oldChanged = entry.changed;
      entry.current = next; entry.changed = true;
      var layoutChanged = Object.prototype.hasOwnProperty.call(p, 'mode') || Object.prototype.hasOwnProperty.call(p, 'mobile');
      if (layoutChanged) Core.markPending(item.box);
      try {
        if (layoutChanged) rebuildCardImages(item.box);
        else refreshImageDecorations(item.box, item.st, entry);
      } catch (err) {
        entry.current = old; entry.changed = oldChanged;
        try {
          if (layoutChanged) rebuildCardImages(item.box);
          else refreshImageDecorations(item.box, item.st, entry);
        } catch (rollback) { console.error('[card images] 원상복구 실패', rollback); }
        throw err;
      } finally { if (layoutChanged) Core.reveal(item.box); }
      return data(item);
    }
    function restore(target) {
      var item = resolve(target), old = item.entry.current, changed = item.entry.changed;
      item.entry.current = dashClone(item.entry.original); item.entry.changed = false;
      try { rebuildCardImages(item.box); }
      catch (err) {
        item.entry.current = old; item.entry.changed = changed;
        try { rebuildCardImages(item.box); } catch (e) {}
        throw err;
      }
      return data(item);
    }
    global.CallCardEngine.dashboard.images = {
      apiVersion: '1.0.0', list: list, read: read, apply: apply, restore: restore,
      caption: function (target) { return serializeCardCaption(resolve(target).entry.current); }
    };
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { Core.scan(document); });
  } else {
    Core.scan(document);
  }

  console.log('%c[card] call-card v' + VERSION + ' 등록 완료', 'color:#2383e2;');
})(window);
