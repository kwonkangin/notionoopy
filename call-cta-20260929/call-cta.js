//  <!-- 콜아웃 CTA call-cta디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/call-cta-20260929/call-cta.js" defer></script>


// =========================================================
// call-cta.js v1.0.0
// 노션 콜아웃을 CTA(행동 유도) 영역으로 꾸미는 토큰 렌더링 엔진
// 변수 접미사: _Q2tq
// 의존성: core.js v1.2.0 (CoreEngine.register/init)
// ---------------------------------------------------------
// [개요]
// - 콜아웃 안에 [% call-cta %] 또는 [% call-cta :: KEY VALUE :: KEY VALUE ... %]
//   토큰을 적으면, 그 콜아웃 박스를 CTA 영역으로 변환한다.
// - 콜아웃 안의 제목(H1~H4), 본문, 버튼, 이미지는 그대로 사용하고
//   배치, 배경, 여백, 글자 스타일만 입힌다.
// - 변수 접미사(_Q2tq): CSS 클래스명/변수명 충돌을 막기 위한 식별자.
// - 콜아웃(.notion-callout-block) 안에서만 동작하며, 콜아웃 하나에 한 번만 적용된다.
// - 필요 환경: core.js(CoreEngine) / CSS.supports 및 :not(.클래스 *)를
//   지원하는 최신 브라우저(Chrome 88 이상 등).
// - 로드 순서: core.js -> button.js -> call-cta.js -> (선택) call-cta-dashboard.js
//
// ---------------------------------------------------------
// [토큰 문법]
// - 항목은 '::' 로 구분하고, 각 항목은 '키 값' 형태(키 뒤에 공백 후 값)이다.
// - 키는 대문자로 쓴다. 적지 않은 키는 기본값이 적용된다.
// - 값 자리에 NONE(또는 ORIG, ORIGINAL)을 쓰면 "원본유지"를 뜻한다.
// - 아무 것도 바꾸지 않으면 [% call-cta %] 한 줄이면 된다.
//   예) [% call-cta %]
//   예) [% call-cta :: SZ LG :: WIDTH BODY :: RADIUS 24 :: VP 60 :: H1C #ffffff :: BDW 500 %]
//   예) [% call-cta :: OL rgba(0,0,0,0.5) T 0 65 :: H1S 40 :: H1SM 28 %]
//
// ---------------------------------------------------------
// [파라미터 표]  (범위를 벗어난 숫자는 범위 안으로 보정된다)
//
// ■ 크기 / 배치
//  SZ     SM | MD | LG | FULL          기본 MD
//         최소 높이(PC): 240px / 360px / 480px / 100vh
//         최소 높이(모바일): 200px / 280px / 360px / 100svh
//  SZM    SM | MD | LG | FULL          기본 없음(SZ와 동일)  모바일 최소 높이를 따로 지정
//  WIDTH  FULL | BODY                  기본 FULL   FULL=화면 끝까지, BODY=본문 폭
//  AW     CONTENT | BOX                기본 CONTENT
//         CONTENT=내용을 본문 최대폭(--content-max-width, 없으면 720px) 안에 가운데 배치
//         BOX=박스 전체 폭을 쓰고 TA에 따라 좌/중/우 배치
//  TA     L | C | R                    기본 C      텍스트 정렬
//
// ■ 여백 / 모서리
//  VP     0~300 (px)                   기본 40     상하 내부 여백 (PC, 768px 이상)
//  VPM    0~300 (px)                   기본 24     상하 내부 여백 (모바일, 768px 미만)
//  HP     0~300 (px)                   기본 24     좌우 여백 (내용 요소의 좌우 padding)
//         SP는 HP의 예전 이름이다(읽기만 지원, OFF=0, ON=24 값도 허용).
//         박스 자체의 좌우 padding은 고정이다(모바일 24px, PC 48px).
//  RADIUS 0~200 (px)                   기본 0      콜아웃 박스 모서리(WIDTH BODY일 때 잘 보임)
//  IR     0~200 (px)                   기본 12     이미지 모서리(좌/우 배치 이미지에만 적용)
//
// ■ 박스 배경
//  BG     COLOR | NONE                 기본 COLOR  NONE=투명. 그 밖의 값(예: 구 IMG)은 COLOR로 처리
//  BGC    색상 | NONE                  기본 원본유지  노션에서 지정한 콜아웃 고유 배경색을 그대로 사용
//         BG가 COLOR일 때만 적용된다.
//
// ■ 이미지 오버레이
//  OL     OL <색상> <방향> <시작%> <끝%>    기본 사용 안 함
//         색상: 투명도를 포함한 색(기본 rgba(0,0,0,0.5))
//         방향: A=전체 균일 / T=아래가 진하고 위로 옅어짐 / B=위가 진하고 아래로 옅어짐
//               L=오른쪽이 진하고 왼쪽으로 옅어짐 / R=왼쪽이 진하고 오른쪽으로 옅어짐
//         시작%, 끝%: 0~100 (기본 0, 65). 진한 지점에서 시작해 끝 지점에서 투명해진다.
//         이미지가 배경으로 쓰이는 위/아래 배치에서만 화면에 보인다.
//         예전 형식(OL BLACK 0.5 A 0 65, 진하기 숫자 포함)도 읽는다.
//         숫자가 3개면 진하기/시작/끝, 2개면 시작/끝으로 해석한다.
//
// ■ 텍스트 스타일 (레벨: H1, H2, H3, H4, BD=본문)   기본 모두 원본유지
//  <레벨>S    글자 크기 PC (6~200 px)      예) H1S 40
//  <레벨>SM   글자 크기 모바일 (6~200 px)  생략하면 PC 크기의 75%(반올림)
//                                          PC가 원본유지면 모바일도 원본유지
//  <레벨>W    글자 굵기 (100~900)          예) H2W 600, BDW 500
//  <레벨>C    글자 색상                    예) H1C #ffffff
//  대상 요소: H1=.notion-header-block h2 / H2=.notion-sub_header-block h3
//             H3=.notion-sub_sub_header-block h4 / H4=.notion-header_4-block h5
//             BD=.notion-text-block span
//  ※ BD는 본문 안의 모든 span에 적용된다. BDW를 지정하면 부분 볼드도 같은 굵기로 통일된다.
//  ※ 버튼 등 제외 영역(아래 [제외 영역])은 텍스트 규칙을 받지 않는다.
//
// ---------------------------------------------------------
// [이미지 위치에 따른 자동 판단]  (BG 파라미터로 고르지 않는다)
// - 콜아웃 안에 컬럼이 있고 컬럼 중 이미지가 있으면  -> 좌/우 배치(SIDE)
//     이미지는 컬럼 자리에 그대로 보이고 IR(이미지 모서리)이 적용된다.
//     박스 색은 BG/BGC로 정하고, OL(오버레이)은 적용되지 않는다.
// - 컬럼이 없고 이미지가 있으면                      -> 위/아래 배치(STACK)
//     이미지가 박스 전체 배경(cover, 가운데)으로 쓰이고 원본 이미지 블록은 숨겨진다.
//     OL(오버레이)이 적용되고, BG/BGC는 이미지 배경에 가려진다.
// - 이미지가 없으면 BG/BGC로 박스 색만 정한다.
//
// ---------------------------------------------------------
// [색상 값 규칙]
// - 허용: #RGB #RGBA #RRGGBB #RRGGBBAA / rgb() rgba() / hsl() hsla() /
//         색상 이름(red 등) / transparent   (브라우저 CSS.supports('color')로 검증)
// - 거부: inherit, initial, unset, revert, currentcolor, var(...)
//         잘못된 색상은 무시(콘솔 경고)되어 원본유지로 처리된다.
// - 읽을 때 쉼표 주변 공백을 정리하고(rgba(0, 0, 0, 0.5) -> rgba(0,0,0,0.5)),
//   출력은 항상 공백 없는 형태를 쓴다.
// - brandcolor는 예전 토큰 호환용으로만 읽는다(var(--brandcolor, #333333)).
//
// ---------------------------------------------------------
// [원본유지 동작 원리]
// - 원본유지(NONE 또는 키 생략)인 속성은 CSS를 아예 만들지 않는다. 노션 원래 스타일이 그대로 남는다.
// - 값을 지정한 속성만 박스에 data-cta-h1-fs(PC 크기) / -fsm(모바일 크기) /
//   -fw(굵기) / -fc(색) 같은 플래그를 붙이고, CSS는 이 플래그가 있을 때만 적용된다.
// - PC 규칙은 min-width:768px, 모바일 규칙은 max-width:767px 에서 각각 적용된다.
//
// [기본값과 토큰 출력]
// - serializeParams는 기본값과 같은 항목을 토큰에 적지 않는다.
//   (원본유지, SZ MD, BG COLOR, TA C, AW CONTENT, WIDTH FULL, VP 40, VPM 24, HP 24, IR 12 등)
// - 기본값과 다른 항목만 토큰에 나타난다.
// - 예전 토큰 호환: SP(=HP), 구 OL 형식, BG IMG, brandcolor는 읽기만 지원한다.
//   GAP는 삭제된 파라미터라서 적혀 있어도 무시된다.
//
// ---------------------------------------------------------
// [제외 영역]
// - 코드 상단의 EXCLUDE_ANCESTORS 배열(기본 ['.ga-dynamic-btn'])에 적힌 클래스의
//   하위 요소에는 텍스트 스타일(크기/굵기/색)이 적용되지 않는다.
//   버튼 엔진이 만든 버튼 글자가 본문 설정에 덮이지 않게 하기 위한 것이다.
// - 제외할 영역이 늘어나면 이 배열에 클래스를 추가한다.
//
// ---------------------------------------------------------
// [저장 슬롯과 자동 적용]  (브라우저 localStorage 사용)
// - 저장 형식: 인스턴스(블록 id)별 슬롯 목록. 각 슬롯에는 시각 라벨과 토큰 문자열이 들어 있다.
// - 인스턴스당 최대 10개이며, 초과하면 가장 오래된 슬롯부터 자동 삭제한다.
// - 저장본은 토큰 문자열로 저장하고, 읽을 때 normalizeParams로 다시 검증한다.
// - 페이지를 열 때 해당 인스턴스의 가장 최근 슬롯을 자동 적용한다(끄기 스위치 있음).
// - 자동 적용 전의 값(노션에 적힌 토큰의 값)은 box._callCtaInitialConfig에 따로 보관한다.
// - 저장소 키
//     call_cta_slots_Q2tq_v1        슬롯 데이터 { 블록id: { title, slots: [{ id, ts, label, token }] } }
//     call_cta_autoapply_off_Q2tq   '1'이면 자동 적용 끔
// - 인스턴스 식별은 콜아웃의 data-block-id를 쓰고, 없으면 페이지 로드 순번(cta-auto-N)을 쓴다.
//
// ---------------------------------------------------------
// [박스에 붙는 내부 속성]
// - box._callCtaConfig          현재 적용 중인 설정
// - box._callCtaInitialConfig   처음 열었을 때의 설정(노션 토큰 값)
// - box._callCtaOuterContainer  바깥 콜아웃 요소
// - box._callCtaLayoutMode      'SIDE' 또는 'STACK'
// - box._callCtaAutoApplied     자동 적용된 저장본의 저장 시각(없으면 undefined)
//
// ---------------------------------------------------------
// [공개 API]  window.CallCtaEngine
// - 상수: VERSION, SUFFIX, SZ_PRESETS, TEXT_LEVELS, LEVEL_DEFAULT, LEVEL_FALLBACK,
//         MOBILE_SCALE, DEFAULT_VP, DEFAULT_VPM, DEFAULT_HP, DEFAULT_IMG_RADIUS, OL_DEFAULT
//         (LEVEL_FALLBACK은 대시보드에서 원본유지를 껐을 때의 시작값이며 엔진 기본값이 아니다)
// - ColorUtil: normalize, isValid, hexToRgb, toRgba, toHex, format
// - Slots: MAX, isAutoApply, setAutoApply, list, count, latest, add, remove, removeEntry, orphans
// - 설정 변환: normalizeParams(토큰 값 -> 설정), serializeParams(설정 -> 토큰 문자열),
//              parseToken(토큰 문자열 -> 값 목록), extractEntries(붙여넣은 텍스트에서 토큰과 제목 추출)
// - 적용: applyConfig, applyBackgroundMode, applyWidthMode, applyScalarStyles
// - 조회: getAllInstances, getBlockId, getLayoutMode, getPreviewText, detectSideLayout, findContentBox
//
// ---------------------------------------------------------
// [사용법]
// 1) 노션에서 콜아웃을 만들고 제목, 본문, 버튼, 이미지를 넣은 뒤,
//    콜아웃 안에 토큰 한 줄을 텍스트로 적는다.  예) [% call-cta :: SZ LG :: VP 60 %]
// 2) 이미지를 텍스트 위/아래에 두면 배경 이미지가 되고, 컬럼으로 나란히 두면 좌/우 배치가 된다.
// 3) 토큰 값은 call-cta-dashboard.js로 화면에서 조정한 뒤 복사해서 붙여넣으면 편하다.
//
// ---------------------------------------------------------
// [알려진 제한]
// - 저장 슬롯과 자동 적용은 그 브라우저(localStorage)에서만 유효하다. 다른 기기, 다른 방문자에게는
//   보이지 않으므로, 결과를 공개하려면 토큰을 노션에 직접 적어야 한다.
//   저장소를 쓸 수 없는 환경에서는 저장이 실패하고 자동 적용도 동작하지 않는다.
// - 노션 블록을 삭제하거나 다시 만들면 블록 id가 바뀌어 기존 저장본이 연결되지 않는다.
// - 노션 화면 구조(.notion-* 클래스명)에 의존한다. 노션이나 호스팅 도구의 구조가 바뀌면
//   선택자 수정이 필요하다.
// - 제외 영역 지정에 쓰는 :not(.클래스 *)와 색상 검증(CSS.supports)은 최신 브라우저가 필요하다.
// - 모바일 값(SZM, VPM, <레벨>SM)은 브라우저 창 폭이 768px 미만일 때만 화면에 보인다.
// - 쉼표가 들어간 색상 토큰(rgba 등)은 core.js의 토큰 분리 방식에 의존한다.
//   오버레이(OL) 토큰으로 동작을 확인했으며, 배경색(BGC)과 글자색(*C) 토큰은 별도 확인이 필요하다.
// - BD(본문) 글자 규칙은 본문 안의 모든 span에 걸리므로, 굵기/색을 지정하면 부분 볼드나
//   부분 색 지정도 함께 통일된다.
// - 실제 콘텐츠 박스([class*="__content"])를 찾지 못하면 바깥 컨테이너에 직접 스타일을
//   적용하고 콘솔에 경고를 남긴다.
// =========================================================


(function (global) {
  'use strict';

  var ENGINE_NAME = 'call-cta';
  var SUFFIX = '_Q2tq';

  if (!global.CoreEngine || typeof global.CoreEngine.register !== 'function') {
    console.error('[call-cta] core.js가 먼저 로드되어야 합니다. (CoreEngine 미탐지)');
    return;
  }

  // -----------------------------------------------------
  // 1. 기본값
  // -----------------------------------------------------
  var TEXT_LEVELS = ['H1', 'H2', 'H3', 'H4', 'BD'];

  var LEVEL_SELECTOR = {
    H1: '.notion-header-block h2',
    H2: '.notion-sub_header-block h3',
    H3: '.notion-sub_sub_header-block h4',
    H4: '.notion-header_4-block h5',
    BD: '.notion-text-block span'
  };

  var LEVEL_DEFAULT = {
    H1: { size: null, weight: null },
    H2: { size: null, weight: null },
    H3: { size: null, weight: null },
    H4: { size: null, weight: null },
    BD: { size: null, weight: null }
  };

  // 대시보드에서 원본유지를 껐을 때 시작값으로만 사용 (엔진 기본값 아님)
  var LEVEL_FALLBACK = {
    H1: { size: 34, weight: 700 },
    H2: { size: 28, weight: 700 },
    H3: { size: 22, weight: 600 },
    H4: { size: 18, weight: 600 },
    BD: { size: 16, weight: 400 }
  };

  // 텍스트 스타일 규칙을 적용하지 않을 영역 (버튼 등 다른 엔진이 만든 요소)
  var EXCLUDE_ANCESTORS = ['.ga-dynamic-btn'];
  var EXCLUDE = EXCLUDE_ANCESTORS.map(function (c) { return ':not(' + c + ' *)'; }).join('');

  var MOBILE_SCALE = 0.75;

  var SZ_PRESETS = {
    SM:   { pc: '240px', mobile: '200px' },
    MD:   { pc: '360px', mobile: '280px' },
    LG:   { pc: '480px', mobile: '360px' },
    FULL: { pc: '100vh', mobile: '100svh' }
  };

  var DEFAULT_VP = 40;
  var DEFAULT_VPM = 24;
  var DEFAULT_HP = 24;
  var DEFAULT_IMG_RADIUS = 12;
  var OL_DEFAULT = { color: 'rgba(0,0,0,0.5)', direction: 'A', start: 0, end: 65 };
  var DEFAULTS = { BG: 'COLOR', TA: 'C', AW: 'CONTENT', WIDTH: 'FULL' };
  var MAX_SLOTS = 10;
  var autoIdSeq = 0;

  function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  function num(v, def, min, max) {
    var n = parseFloat(v);
    if (isNaN(n)) return def;
    return Math.min(max, Math.max(min, n));
  }

  // -----------------------------------------------------
  // 2. 색상 유틸 (rgba / HEX / hsl / 이름 모두 지원)
  // -----------------------------------------------------
  var ColorUtil = (function () {
    var ctx = null;
    var GLOBALS = ['inherit', 'initial', 'unset', 'revert', 'revert-layer', 'currentcolor'];

    function normalize(s) {
      if (s === undefined || s === null) return '';
      return String(s).trim().replace(/\s*,\s*/g, ',').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
    }
    function isValid(s) {
      s = normalize(s);
      if (!s) return false;
      if (GLOBALS.indexOf(s.toLowerCase()) > -1) return false;
      if (/var\(/i.test(s)) return false;
      try { return !!(global.CSS && global.CSS.supports && global.CSS.supports('color', s)); }
      catch (e) { return false; }
    }
    function hexToRgb(hex) {
      var h = String(hex).replace('#', '');
      if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
      return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16) };
    }
    function toRgba(s) {
      s = normalize(s);
      if (!isValid(s)) return null;
      if (!ctx) ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillStyle = s;
      var v = ctx.fillStyle;
      if (v.charAt(0) === '#') {
        var c = hexToRgb(v); c.a = 1; return c;
      }
      var m = /^rgba?\(([^)]+)\)$/.exec(v);
      if (!m) return null;
      var p = m[1].split(',').map(function (x) { return parseFloat(x); });
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    function toHex(c) {
      return '#' + [c.r, c.g, c.b].map(function (x) {
        return ('0' + Math.round(x).toString(16)).slice(-2);
      }).join('');
    }
    function format(c) {
      return 'rgba(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ',' + String(+Number(c.a).toFixed(2)) + ')';
    }
    return { normalize: normalize, isValid: isValid, hexToRgb: hexToRgb, toRgba: toRgba, toHex: toHex, format: format };
  })();

  // -----------------------------------------------------
  // 3. 파라미터 파서
  // -----------------------------------------------------
  function isNoneToken(v) {
    if (v === undefined || v === null) return false;
    var u = String(v).trim().toUpperCase();
    return u === 'NONE' || u === 'ORIG' || u === 'ORIGINAL';
  }

  function parseNumOrNone(v) {
    if (v === undefined || v === null || v === '') return undefined;
    if (isNoneToken(v)) return null;
    var n = parseInt(v, 10);
    return isNaN(n) ? undefined : n;
  }

  function normColorParam(v) {
    if (v === undefined || v === null || v === '') return null;
    if (isNoneToken(v)) return null;
    if (String(v).toLowerCase() === 'brandcolor') return 'brandcolor';
    var n = ColorUtil.normalize(v);
    if (ColorUtil.isValid(n)) return n;
    console.warn('[call-cta] 인식할 수 없는 색상 값을 무시합니다: ' + v);
    return null;
  }

  function parseHP(raw) {
    if (raw === undefined || raw === null || raw === '') return DEFAULT_HP;
    var u = String(raw).toUpperCase();
    if (u === 'OFF') return 0;
    if (u === 'ON') return DEFAULT_HP;
    return Math.round(num(raw, DEFAULT_HP, 0, 300));
  }

  function parseOL(raw) {
    if (!raw) return null;
    var toks = String(raw).match(/[a-zA-Z-]+\([^)]*\)|\S+/g) || [];
    var color = null, dir = 'A', nums = [];
    toks.forEach(function (tok) {
      var u = tok.toUpperCase();
      if (/^[ATBLR]$/.test(u)) dir = u;
      else if (/^-?\d+(\.\d+)?$/.test(tok)) nums.push(parseFloat(tok));
      else color = tok;
    });

    var strength = null, start = OL_DEFAULT.start, end = OL_DEFAULT.end;
    if (nums.length >= 3) { strength = nums[0]; start = nums[1]; end = nums[2]; }
    else if (nums.length === 2) { start = nums[0]; end = nums[1]; }
    else if (nums.length === 1) { if (nums[0] <= 1) strength = nums[0]; else start = nums[0]; }

    var parsedColor = normColorParam(color);
    var finalColor;
    if (strength !== null) {
      var c = ColorUtil.toRgba(parsedColor || '#000000') || { r: 0, g: 0, b: 0, a: 1 };
      c.a = c.a * Math.min(1, Math.max(0, strength));
      finalColor = ColorUtil.format(c);
    } else {
      finalColor = parsedColor || OL_DEFAULT.color;
    }

    return {
      color: finalColor,
      direction: dir,
      start: num(start, 0, 0, 100),
      end: num(end, 65, 0, 100)
    };
  }

  function normalizeParams(rawParams) {
    var p = rawParams || {};
    var out = {};

    out.SZ = (p.SZ || 'MD').toUpperCase();
    if (!SZ_PRESETS[out.SZ]) out.SZ = 'MD';
    out.SZM = p.SZM ? String(p.SZM).toUpperCase() : null;
    if (out.SZM && !SZ_PRESETS[out.SZM]) out.SZM = null;

    out.BG = (p.BG || DEFAULTS.BG).toUpperCase();
    if (out.BG !== 'COLOR' && out.BG !== 'NONE') out.BG = 'COLOR';
    out.BGC = normColorParam(p.BGC);

    out.OL = parseOL(p.OL);

    out.TA = (p.TA || DEFAULTS.TA).toUpperCase();
    if (['L', 'C', 'R'].indexOf(out.TA) === -1) out.TA = 'C';
    out.AW = (p.AW || DEFAULTS.AW).toUpperCase();
    if (out.AW !== 'CONTENT' && out.AW !== 'BOX') out.AW = 'CONTENT';
    out.WIDTH = (p.WIDTH || DEFAULTS.WIDTH).toUpperCase();
    if (out.WIDTH !== 'FULL' && out.WIDTH !== 'BODY') out.WIDTH = 'FULL';

    out.RADIUS = Math.round(num(p.RADIUS, 0, 0, 200));
    out.IR = Math.round(num(p.IR, DEFAULT_IMG_RADIUS, 0, 200));
    out.HP = parseHP((p.HP !== undefined && p.HP !== '') ? p.HP : p.SP);
    out.VP = Math.round(num(p.VP, DEFAULT_VP, 0, 300));
    out.VPM = Math.round(num(p.VPM, DEFAULT_VPM, 0, 300));

    out.text = {};
    TEXT_LEVELS.forEach(function (lv) {
      var def = LEVEL_DEFAULT[lv];
      var sPc = parseNumOrNone(p[lv + 'S']);
      var sMo = parseNumOrNone(p[lv + 'SM']);
      var wt = parseNumOrNone(p[lv + 'W']);

      var sizePc = (sPc === undefined) ? def.size : sPc;
      if (sizePc !== null) sizePc = Math.round(num(sizePc, def.size, 6, 200));

      var sizeMobile;
      if (sMo !== undefined) sizeMobile = sMo;
      else if (sizePc === null) sizeMobile = null;
      else sizeMobile = Math.round(sizePc * MOBILE_SCALE);
      if (sizeMobile !== null) sizeMobile = Math.round(num(sizeMobile, Math.round(def.size * MOBILE_SCALE), 6, 200));

      var weight = (wt === undefined) ? def.weight : wt;
      if (weight !== null) weight = Math.round(num(weight, 400, 100, 900));

      out.text[lv] = { sizePc: sizePc, sizeMobile: sizeMobile, weight: weight, color: normColorParam(p[lv + 'C']) };
    });

    return out;
  }

  // -----------------------------------------------------
  // 4. 토큰 문자열 <-> 파라미터
  // -----------------------------------------------------
  function parseToken(str) {
    if (!str) return null;
    var m = /\[%([\s\S]*?)%\]/.exec(str);
    var inner = m ? m[1] : String(str);
    var parts = inner.split('::');
    if (!/^\s*call-cta\b/i.test(parts[0])) return null;
    var params = {};
    for (var i = 1; i < parts.length; i++) {
      var seg = parts[i].trim();
      if (!seg) continue;
      var sp = seg.search(/\s/);
      var key = sp < 0 ? seg : seg.slice(0, sp);
      var val = sp < 0 ? '' : seg.slice(sp + 1).trim();
      params[key.toUpperCase()] = val;
    }
    return params;
  }

  // 붙여넣은 텍스트에서 토큰과, 토큰 바로 앞 줄("1. 제목")을 함께 추출
  function extractEntries(text) {
    var re = /\[%\s*call-cta[\s\S]*?%\]/gi;
    var out = [], last = 0, m;
    text = String(text || '');
    while ((m = re.exec(text))) {
      var between = text.slice(last, m.index);
      var lines = between.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
      var pre = lines.length ? lines[lines.length - 1] : '';
      var pm = /^(\d+)\s*[.)]\s*(.*)$/.exec(pre);
      out.push({ token: m[0], num: pm ? parseInt(pm[1], 10) : null, title: pm ? pm[2].trim() : pre });
      last = re.lastIndex;
    }
    return out;
  }

  function serializeParams(cfg) {
    var parts = ['call-cta'];
    if (cfg.SZ !== 'MD') parts.push('SZ ' + cfg.SZ);
    if (cfg.SZM) parts.push('SZM ' + cfg.SZM);
    if (cfg.BG !== DEFAULTS.BG) parts.push('BG ' + cfg.BG);
    if (cfg.BG === 'COLOR' && cfg.BGC) parts.push('BGC ' + ColorUtil.normalize(cfg.BGC));
    if (cfg.OL) {
      parts.push('OL ' + [ColorUtil.normalize(cfg.OL.color), cfg.OL.direction, cfg.OL.start, cfg.OL.end].join(' '));
    }
    if (cfg.TA !== DEFAULTS.TA) parts.push('TA ' + cfg.TA);
    if (cfg.AW !== DEFAULTS.AW) parts.push('AW ' + cfg.AW);
    if (cfg.RADIUS) parts.push('RADIUS ' + cfg.RADIUS);
    if (cfg.VP !== DEFAULT_VP) parts.push('VP ' + cfg.VP);
    if (cfg.VPM !== DEFAULT_VPM) parts.push('VPM ' + cfg.VPM);
    if (cfg.HP !== DEFAULT_HP) parts.push('HP ' + cfg.HP);
    if (cfg.IR !== DEFAULT_IMG_RADIUS) parts.push('IR ' + cfg.IR);
    if (cfg.WIDTH !== DEFAULTS.WIDTH) parts.push('WIDTH ' + cfg.WIDTH);

    TEXT_LEVELS.forEach(function (lv) {
      var t = cfg.text[lv];
      var def = LEVEL_DEFAULT[lv];

      if (t.sizePc === null) { if (def.size !== null) parts.push(lv + 'S NONE'); }
      else if (t.sizePc !== def.size) parts.push(lv + 'S ' + t.sizePc);

      var autoMobile = (t.sizePc === null) ? null : Math.round(t.sizePc * MOBILE_SCALE);
      if (t.sizeMobile !== autoMobile) parts.push(lv + 'SM ' + (t.sizeMobile === null ? 'NONE' : t.sizeMobile));

      if (t.weight === null) { if (def.weight !== null) parts.push(lv + 'W NONE'); }
      else if (t.weight !== def.weight) parts.push(lv + 'W ' + t.weight);

      if (t.color) parts.push(lv + 'C ' + ColorUtil.normalize(t.color));
    });

    return '[% ' + parts.join(' :: ') + ' %]';
  }

  // -----------------------------------------------------
  // 5. 색상/오버레이
  // -----------------------------------------------------
  function resolveColorVar(value) {
    if (!value) return null;
    if (String(value).toLowerCase() === 'brandcolor') return 'var(--brandcolor, #333333)';
    return value;
  }

  function buildOverlayBackground(ol) {
    if (!ol) return 'none';
    var color = resolveColorVar(ol.color) || 'rgba(0,0,0,0.5)';
    if (ol.direction === 'A') return color;
    var dirMap = { T: 'to top', B: 'to bottom', L: 'to left', R: 'to right' };
    return 'linear-gradient(' + (dirMap[ol.direction] || 'to bottom') + ', ' + color + ' ' + ol.start + '%, transparent ' + ol.end + '%)';
  }

  // -----------------------------------------------------
  // 6. 구조 탐색
  // -----------------------------------------------------
  function findContentBox(outerContainer) {
    var box = outerContainer.querySelector('[class*="__content"]');
    if (!box) box = outerContainer.querySelector('[class*="content"]');
    return box || outerContainer;
  }

  function detectSideLayout(outerContainer) {
    var colList = outerContainer.querySelector('.notion-column_list-block');
    if (!colList) return null;
    var columns = colList.querySelectorAll('.notion-column-block');
    if (columns.length < 2) return null;

    var imgColIndex = -1, imgEl = null, imgWrapperEl = null;
    columns.forEach(function (col, i) {
      if (imgColIndex !== -1) return;
      var img = col.querySelector('img');
      if (img) {
        imgColIndex = i;
        imgEl = img;
        imgWrapperEl = img.closest('.notion-image-block') || img.closest('figure') || img;
      }
    });
    if (imgColIndex === -1) return null;

    return {
      colList: colList, columns: columns, imgColumnEl: columns[imgColIndex],
      imgColIndex: imgColIndex, imgEl: imgEl, imgWrapperEl: imgWrapperEl, imgFirst: imgColIndex === 0
    };
  }

  // -----------------------------------------------------
  // 7. 배경 적용
  // -----------------------------------------------------
  function applyBoxFill(box, cfg) {
    box.classList.remove('call-cta-bg-color' + SUFFIX, 'call-cta-bg-none' + SUFFIX);
    if (cfg.BG === 'NONE') {
      box.classList.add('call-cta-bg-none' + SUFFIX);
      box.style.removeProperty('--cta-bgcolor' + SUFFIX);
      return;
    }
    var colorVar = resolveColorVar(cfg.BGC);
    if (colorVar) {
      box.classList.add('call-cta-bg-color' + SUFFIX);
      box.style.setProperty('--cta-bgcolor' + SUFFIX, colorVar);
    } else {
      box.style.removeProperty('--cta-bgcolor' + SUFFIX);
    }
  }

  function applyBackgroundMode(box, outerContainer, cfg, blockId) {
    box.classList.remove('call-cta-bg-img' + SUFFIX);
    var existingBgLayer = box.querySelector('.call-cta-bg-layer' + SUFFIX);
    var existingOverlay = box.querySelector('.call-cta-overlay-layer' + SUFFIX);
    var sideInfo = detectSideLayout(outerContainer);

    if (sideInfo) {
      box.classList.add('call-cta-layout-side' + SUFFIX);
      box._callCtaLayoutMode = 'SIDE';
      if (existingBgLayer) existingBgLayer.remove();
      if (existingOverlay) existingOverlay.remove();
      sideInfo.imgWrapperEl.classList.remove('call-cta-source-hidden' + SUFFIX);
      sideInfo.imgWrapperEl.classList.add('call-cta-side-image' + SUFFIX);
      applyBoxFill(box, cfg);
      return;
    }

    box.classList.remove('call-cta-layout-side' + SUFFIX);
    box._callCtaLayoutMode = 'STACK';
    var imgEl = outerContainer.querySelector('.notion-image-block img, figure img, img');

    if (imgEl) {
      var wrapper = imgEl.closest('.notion-image-block') || imgEl.closest('figure') || imgEl;
      wrapper.classList.remove('call-cta-side-image' + SUFFIX);
      wrapper.classList.add('call-cta-source-hidden' + SUFFIX);

      box.classList.add('call-cta-bg-img' + SUFFIX);
      box.classList.remove('call-cta-bg-color' + SUFFIX, 'call-cta-bg-none' + SUFFIX);
      box.style.removeProperty('--cta-bgcolor' + SUFFIX);

      var bgLayer = existingBgLayer;
      if (!bgLayer) {
        bgLayer = document.createElement('div');
        bgLayer.className = 'call-cta-bg-layer' + SUFFIX;
        box.insertBefore(bgLayer, box.firstChild);
      }
      bgLayer.style.backgroundImage = 'url("' + imgEl.src + '")';

      var overlayLayer = existingOverlay;
      if (cfg.OL) {
        if (!overlayLayer) {
          overlayLayer = document.createElement('div');
          overlayLayer.className = 'call-cta-overlay-layer' + SUFFIX;
          bgLayer.insertAdjacentElement('afterend', overlayLayer);
        }
        overlayLayer.style.background = buildOverlayBackground(cfg.OL);
      } else if (overlayLayer) {
        overlayLayer.remove();
      }
      return;
    }

    if (existingBgLayer) existingBgLayer.remove();
    if (existingOverlay) existingOverlay.remove();
    applyBoxFill(box, cfg);
  }

  function applyWidthMode(box, cfg) {
    box.classList.remove('call-cta-bleed' + SUFFIX, 'call-cta-body' + SUFFIX);
    box.classList.add(cfg.WIDTH === 'FULL' ? ('call-cta-bleed' + SUFFIX) : ('call-cta-body' + SUFFIX));
  }

  // -----------------------------------------------------
  // 8. 스칼라 스타일 (원본유지 = 변수 제거 + 플래그 제거)
  // -----------------------------------------------------
  function setOrRemove(box, name, value) {
    if (value === null || value === undefined) box.style.removeProperty(name);
    else box.style.setProperty(name, value);
  }
  function setFlag(box, name, on) {
    if (on) box.setAttribute(name, ''); else box.removeAttribute(name);
  }

  function applyScalarStyles(box, cfg) {
    box.style.setProperty('--cta-pd-pc' + SUFFIX, cfg.VP + 'px');
    box.style.setProperty('--cta-pd-mobile' + SUFFIX, cfg.VPM + 'px');
    box.style.setProperty('--cta-radius' + SUFFIX, cfg.RADIUS + 'px');
    box.style.setProperty('--cta-side-pad' + SUFFIX, cfg.HP + 'px');
    box.style.setProperty('--cta-img-radius' + SUFFIX, cfg.IR + 'px');
    box.style.setProperty('--cta-minh-pc' + SUFFIX, SZ_PRESETS[cfg.SZ].pc);
    box.style.setProperty('--cta-minh-mobile' + SUFFIX, SZ_PRESETS[cfg.SZM || cfg.SZ].mobile);

    var alignMap = { L: 'flex-start', C: 'center', R: 'flex-end' };
    var alignH = (cfg.AW === 'BOX') ? (alignMap[cfg.TA] || 'center') : 'center';
    box.style.setProperty('--cta-align-h' + SUFFIX, alignH);
    box.style.setProperty('--cta-text-align' + SUFFIX,
      cfg.TA === 'L' ? 'left' : (cfg.TA === 'R' ? 'right' : 'center'));

    box.classList.remove('call-cta-aw-content' + SUFFIX, 'call-cta-aw-box' + SUFFIX);
    box.classList.add(cfg.AW === 'BOX' ? ('call-cta-aw-box' + SUFFIX) : ('call-cta-aw-content' + SUFFIX));

    TEXT_LEVELS.forEach(function (lv) {
      var t = cfg.text[lv];
      var l = lv.toLowerCase();
      var colorVar = resolveColorVar(t.color);
      setOrRemove(box, '--cta-' + l + '-size-pc' + SUFFIX, t.sizePc === null ? null : t.sizePc + 'px');
      setOrRemove(box, '--cta-' + l + '-size-mobile' + SUFFIX, t.sizeMobile === null ? null : t.sizeMobile + 'px');
      setOrRemove(box, '--cta-' + l + '-weight' + SUFFIX, t.weight === null ? null : String(t.weight));
      setOrRemove(box, '--cta-' + l + '-color' + SUFFIX, colorVar);
      setFlag(box, 'data-cta-' + l + '-fs', t.sizePc !== null);
      setFlag(box, 'data-cta-' + l + '-fsm', t.sizeMobile !== null);
      setFlag(box, 'data-cta-' + l + '-fw', t.weight !== null);
      setFlag(box, 'data-cta-' + l + '-fc', !!colorVar);
    });
  }

  function applyConfig(box, cfg) {
    box._callCtaConfig = cfg;
    applyScalarStyles(box, cfg);
    applyWidthMode(box, cfg);
    applyBackgroundMode(box, box._callCtaOuterContainer, cfg, getBlockId(box));
  }

  function getBlockId(box) {
    return box ? box.getAttribute('data-call-cta-block-id') : null;
  }

  // -----------------------------------------------------
  // 9. 저장 슬롯 (localStorage) : 인스턴스별 최대 10개
  // -----------------------------------------------------
  var LS_SLOTS = 'call_cta_slots_Q2tq_v1';
  var LS_AUTO_OFF = 'call_cta_autoapply_off_Q2tq';

  function readAll() {
    try { return JSON.parse(global.localStorage.getItem(LS_SLOTS)) || {}; } catch (e) { return {}; }
  }
  function writeAll(o) {
    try { global.localStorage.setItem(LS_SLOTS, JSON.stringify(o)); return true; } catch (e) { return false; }
  }

  var Slots = {
    MAX: MAX_SLOTS,
    isAutoApply: function () {
      try { return global.localStorage.getItem(LS_AUTO_OFF) !== '1'; } catch (e) { return true; }
    },
    setAutoApply: function (on) {
      try {
        if (on) global.localStorage.removeItem(LS_AUTO_OFF);
        else global.localStorage.setItem(LS_AUTO_OFF, '1');
      } catch (e) {}
    },
    list: function (blockId) {
      var e = readAll()[blockId];
      return e && e.slots ? e.slots.slice() : [];
    },
    count: function (blockId) { return Slots.list(blockId).length; },
    latest: function (blockId) {
      var l = Slots.list(blockId);
      return l.length ? l[l.length - 1] : null;
    },
    add: function (blockId, title, token, label) {
      var all = readAll();
      var e = all[blockId] || { title: '', slots: [] };
      e.title = title;
      e.slots.push({ id: Date.now() + '-' + Math.floor(Math.random() * 10000), ts: Date.now(), label: label, token: token });
      var dropped = 0;
      while (e.slots.length > MAX_SLOTS) { e.slots.shift(); dropped++; }
      all[blockId] = e;
      return { ok: writeAll(all), dropped: dropped };
    },
    remove: function (blockId, slotId) {
      var all = readAll();
      if (!all[blockId]) return;
      all[blockId].slots = all[blockId].slots.filter(function (s) { return s.id !== slotId; });
      if (!all[blockId].slots.length) delete all[blockId];
      writeAll(all);
    },
    removeEntry: function (blockId) {
      var all = readAll();
      delete all[blockId];
      writeAll(all);
    },
    orphans: function (validIds) {
      var all = readAll();
      return Object.keys(all).filter(function (id) { return validIds.indexOf(id) === -1; })
        .map(function (id) { return { id: id, title: all[id].title || '(제목 없음)', count: all[id].slots.length }; });
    }
  };

  // -----------------------------------------------------
  // 10. 렌더링
  // -----------------------------------------------------
  function render(ctx) {
    var leafBlock = ctx && ctx.block;
    if (!leafBlock) { console.error('[call-cta] ctx.block이 없습니다.'); return; }

    var initialCfg = normalizeParams(ctx.params);

    var outerContainer = leafBlock.closest('.notion-callout-block');
    if (!outerContainer) { console.error('[call-cta] 콜아웃 컨테이너(.notion-callout-block)를 찾지 못했습니다.'); return; }
    if (outerContainer.dataset.callCtaApplied === '1') return;
    outerContainer.dataset.callCtaApplied = '1';

    var blockId = outerContainer.getAttribute('data-block-id') || ('cta-auto-' + (++autoIdSeq));

    var box = findContentBox(outerContainer);
    box.setAttribute('data-call-cta-box', 'true');
    box.setAttribute('data-call-cta-block-id', blockId);
    box.classList.add('call-cta' + SUFFIX);
    if (box === outerContainer) {
      console.warn('[call-cta] 실제 콘텐츠 박스([class*="__content"])를 찾지 못해 바깥 컨테이너에 직접 스타일링합니다. (block-id: ' + blockId + ')');
    }

    var cfg = clone(initialCfg);
    if (Slots.isAutoApply()) {
      var saved = Slots.latest(blockId);
      if (saved) {
        var pp = parseToken(saved.token);
        if (pp) { cfg = normalizeParams(pp); box._callCtaAutoApplied = saved.ts; }
      }
    }

    box._callCtaOuterContainer = outerContainer;
    box._callCtaInitialConfig = initialCfg;
    box._callCtaConfig = cfg;

    applyScalarStyles(box, cfg);
    applyWidthMode(box, cfg);
    applyBackgroundMode(box, outerContainer, cfg, blockId);

    injectBaseStyleOnce();
  }

  // -----------------------------------------------------
  // 11. 기본 CSS (원본유지 속성은 플래그가 없으면 규칙 자체가 적용되지 않음)
  // -----------------------------------------------------
  var baseStyleInjected = false;
  function injectBaseStyleOnce() {
    if (baseStyleInjected) return;
    baseStyleInjected = true;

    var SEL = '[data-call-cta-box="true"]';
    var levelCss = '';

    TEXT_LEVELS.forEach(function (lv) {
      var sel = LEVEL_SELECTOR[lv] + EXCLUDE;
      var l = lv.toLowerCase();
      levelCss +=
        '@media (max-width: 767px) {' + SEL + '[data-cta-' + l + '-fsm] ' + sel +
        ' { font-size: var(--cta-' + l + '-size-mobile' + SUFFIX + ') !important; } }' +
        '@media (min-width: 768px) {' + SEL + '[data-cta-' + l + '-fs] ' + sel +
        ' { font-size: var(--cta-' + l + '-size-pc' + SUFFIX + ') !important; } }' +
        SEL + '[data-cta-' + l + '-fw] ' + sel +
        ' { font-weight: var(--cta-' + l + '-weight' + SUFFIX + ') !important; }' +
        SEL + '[data-cta-' + l + '-fc] ' + sel +
        ' { color: var(--cta-' + l + '-color' + SUFFIX + ') !important; }';
    });

    var style = document.createElement('style');
    style.setAttribute('data-engine', 'call-cta');
    style.textContent =
      SEL + ' {' +
      '  position: relative !important;' +
      '  display: flex !important;' +
      '  flex-direction: column !important;' +
      '  justify-content: center !important;' +
      '  align-items: var(--cta-align-h' + SUFFIX + ', center) !important;' +
      '  text-align: var(--cta-text-align' + SUFFIX + ', center) !important;' +
      '  min-height: var(--cta-minh-mobile' + SUFFIX + ', 280px) !important;' +
      '  padding: var(--cta-pd-mobile' + SUFFIX + ', 24px) 24px !important;' +
      '  border-radius: var(--cta-radius' + SUFFIX + ', 0px) !important;' +
      '  overflow: hidden !important;' +
      '  box-sizing: border-box !important;' +
      '}' +
      '.call-cta-bleed' + SUFFIX + ' {' +
      '  width: 100vw !important; max-width: 100vw !important;' +
      '  margin-left: calc(50% - 50vw) !important; margin-right: calc(50% - 50vw) !important;' +
      '}' +
      '.call-cta-body' + SUFFIX + ' { width: 100% !important; }' +
      SEL + '.call-cta-bg-color' + SUFFIX + ' {' +
      '  background-color: var(--cta-bgcolor' + SUFFIX + ') !important;' +
      '  background-image: none !important;' +
      '}' +
      SEL + '.call-cta-bg-none' + SUFFIX + ' {' +
      '  background: transparent !important; background-image: none !important;' +
      '}' +
      '.call-cta-bg-layer' + SUFFIX + ' {' +
      '  position: absolute !important; inset: 0 !important;' +
      '  background-size: cover !important; background-position: center !important; z-index: 0 !important;' +
      '}' +
      '.call-cta-overlay-layer' + SUFFIX + ' {' +
      '  position: absolute !important; inset: 0 !important; z-index: 1 !important;' +
      '}' +
      '.call-cta-source-hidden' + SUFFIX + ' {' +
      '  position: absolute !important; width: 1px !important; height: 1px !important;' +
      '  overflow: hidden !important; opacity: 0 !important; pointer-events: none !important;' +
      '}' +
      '.call-cta-side-image' + SUFFIX + ' {' +
      '  border-radius: var(--cta-img-radius' + SUFFIX + ', 12px) !important;' +
      '  overflow: hidden !important; max-width: 100% !important;' +
      '}' +
      '.call-cta-side-image' + SUFFIX + ' img {' +
      '  max-width: 100% !important; height: auto !important;' +
      '  border-radius: inherit !important; display: block !important;' +
      '}' +
      SEL + ' > *:not(.call-cta-bg-layer' + SUFFIX + '):not(.call-cta-overlay-layer' + SUFFIX + ') {' +
      '  position: relative !important; z-index: 2 !important; box-sizing: border-box !important;' +
      '}' +
      '.call-cta-aw-content' + SUFFIX + ' > *:not(.call-cta-bg-layer' + SUFFIX + '):not(.call-cta-overlay-layer' + SUFFIX + ') {' +
      '  max-width: var(--content-max-width, 720px) !important;' +
      '  padding-left: var(--cta-side-pad' + SUFFIX + ', 24px) !important;' +
      '  padding-right: var(--cta-side-pad' + SUFFIX + ', 24px) !important;' +
      '}' +
      '.call-cta-aw-box' + SUFFIX + ' > *:not(.call-cta-bg-layer' + SUFFIX + '):not(.call-cta-overlay-layer' + SUFFIX + ') {' +
      '  max-width: 100% !important; width: 100% !important;' +
      '  padding-left: var(--cta-side-pad' + SUFFIX + ', 24px) !important;' +
      '  padding-right: var(--cta-side-pad' + SUFFIX + ', 24px) !important;' +
      '}' +
      levelCss +
      '@media (min-width: 768px) {' +
      '  ' + SEL + ' {' +
      '    min-height: var(--cta-minh-pc' + SUFFIX + ', 360px) !important;' +
      '    padding: var(--cta-pd-pc' + SUFFIX + ', 40px) 48px !important;' +
      '  }' +
      '}';
    document.head.appendChild(style);
  }

  // -----------------------------------------------------
  // 12. 인스턴스 미리보기 텍스트
  // -----------------------------------------------------
  function getPreviewText(box) {
    if (!box) return '';
    var el = box.querySelector(LEVEL_SELECTOR.H1) ||
             box.querySelector(LEVEL_SELECTOR.H2) ||
             box.querySelector(LEVEL_SELECTOR.BD);
    var text = el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
    return text || '(제목 없음)';
  }

  // -----------------------------------------------------
  // 13. 공개 API
  // -----------------------------------------------------
  global.CallCtaEngine = {
    VERSION: '1.0.0',
    SUFFIX: SUFFIX,
    SZ_PRESETS: SZ_PRESETS,
    TEXT_LEVELS: TEXT_LEVELS,
    LEVEL_DEFAULT: LEVEL_DEFAULT,
    LEVEL_FALLBACK: LEVEL_FALLBACK,
    MOBILE_SCALE: MOBILE_SCALE,
    DEFAULT_VP: DEFAULT_VP,
    DEFAULT_VPM: DEFAULT_VPM,
    DEFAULT_HP: DEFAULT_HP,
    DEFAULT_IMG_RADIUS: DEFAULT_IMG_RADIUS,
    OL_DEFAULT: OL_DEFAULT,
    ColorUtil: ColorUtil,
    Slots: Slots,
    normalizeParams: normalizeParams,
    serializeParams: serializeParams,
    parseToken: parseToken,
    extractEntries: extractEntries,
    applyConfig: applyConfig,
    applyBackgroundMode: applyBackgroundMode,
    applyWidthMode: applyWidthMode,
    applyScalarStyles: applyScalarStyles,
    detectSideLayout: detectSideLayout,
    findContentBox: findContentBox,
    getBlockId: getBlockId,
    getLayoutMode: function (box) { return box && box._callCtaLayoutMode ? box._callCtaLayoutMode : 'STACK'; },
    getPreviewText: getPreviewText,
    getAllInstances: function () {
      return Array.prototype.slice.call(document.querySelectorAll('[data-call-cta-box="true"]'));
    }
  };

  global.CoreEngine.register(ENGINE_NAME, render);
  console.log('[call-cta] call-cta 토큰 핸들러 등록 완료 (v1.0.0, suffix=' + SUFFIX + ')');

})(window);