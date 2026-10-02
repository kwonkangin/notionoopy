// =====================================================================================
// menubar-2.0-dashboard-20261002.js   |   메뉴바 대시보드 2.0 (PC 전용)
// 한 줄 설명 : 메뉴바의 모양(CSS 변수)과 내용(메뉴, 버튼, 옵션)을 팝업 창에서 조정하면 원래 페이지에
//              바로 반영해 보여주고, 결과를 option 코드로 출력하는 도구.
// 짝 파일    : menubar-2.0-20261002.js (엔진), menubar-2.0-20261002.css (스타일),
//              menubar-2.0-option-20261002.html (출력 결과를 붙여 넣는 파일)
// 접미사     : 팝업 안 요소의 클래스는 짧은 이름(item, row, box 등)을 쓴다. 원래 페이지에는 미리보기용
//              style 태그(id: efc_nav_dynamic_style_s1d) 하나만 추가한다.
// 의존성     :
//   - 메뉴바 엔진 2.0 : 같은 페이지에 로드되어 있어야 한다 (efc_rebuildNav_v2a 사용).
//   - option 설정 : 현재 값을 읽어 시작한다 (window.efcMenubarConfig 와 :root 변수).
//   - 브라우저 팝업 허용 : 팝업이 막혀 있으면 안내 창이 뜨고 실행되지 않는다.
// =====================================================================================
//
// [개요]
// - 개발자 도구 콘솔에 붙여 넣어 실행하면 팝업 창이 열린다. 팝업에서 값을 바꾸면 원래 페이지의 메뉴바가
//   즉시 바뀐다.
// - 구성은 11개 구역이다.
//   1~7  CSS 변수 : 헤더, 대메뉴, 하위메뉴 박스, 하위메뉴 아이콘/텍스트, CTA, 검색 버튼, 모바일 패널
//   8    로고 / 헤더 / 스크롤
//   9    검색 / 모바일 / 전역 옵션 (아코디언, 화살표 애니메이션, 상세형 너비 방식 등)
//   10   대메뉴 / 하위메뉴 빌더
//   11   우측 CTA 버튼 빌더
//
// [사용법]
// 1) 메뉴바가 적용된 Oopy 페이지를 PC 브라우저로 연다.
// 2) 개발자 도구(F12) 콘솔에 이 파일 내용을 붙여 넣고 실행한다. 팝업이 막히면 허용한다.
// 3) 팝업에서 조정한다. 원래 페이지에서 미리보기를 확인한다. 모바일 모양은 브라우저 창 폭을
//    mobileBreakpoint 이하로 줄여서 확인한다.
// 4) 맨 아래 '코드 출력하기'를 누르고 '기본 복사'(설명 주석 포함) 또는 '압축 복사'(한 줄)를 쓴다.
// 5) 복사한 코드로 option 파일 내용을 통째로 교체한다.
// 6) 팝업을 닫으면 미리보기는 처음 상태로 돌아간다. 저장되지 않으므로 닫기 전에 반드시 복사한다.
//
// [기능]
// - 변경 표시 : 처음과 달라진 항목에 주황색 점이 붙는다. 항목 오른쪽 ↺ 는 그 항목만 처음 값으로 되돌린다.
// - 전체 복구 : 모든 변수와 메뉴/버튼 설정을 처음 상태로 되돌린다.
// - 항목 검색 : 위쪽 검색창에서 이름이나 변수명으로 항목을 찾는다. 다크/라이트 모드 전환도 있다.
// - 입력 방식 : 슬라이더 + 숫자, 색상(색상 칩 + 투명도 + 직접 입력), 굵기(슬라이더 + 선택), 상하/좌우
//   여백, 그림자(없음/약/보통/강/직접), 너비(꽉참/1024/1280/직접), 화살표 색(자동/직접).
//   색상 직접 입력은 올바른 색일 때만 적용되고, 잘못되면 빨간 테두리로 표시한다.
// - 하위메뉴 서식 방식 : '공통'이면 심플형 값을 바꿀 때 상세형(배경, 둥글기, 여백, 그림자)도 같이 바뀐다.
//   '개별'이면 따로 설정한다. 시작할 때 두 값이 다르면 '개별'로 시작한다.
// - 선택 사용 변수 : '모바일 헤더 좌우 여백', '모바일 로고 높이'는 '사용' 체크를 해제하면 출력에서
//   빠지고 PC 값을 따른다. 미리보기에서도 즉시 PC 값으로 돌아간다.
// - 상세형 너비 방식 : fixed 를 고르면 '고정 너비' 항목만, auto 를 고르면 '최소/최대 너비' 항목만 보인다.
// - 메뉴 빌더 : 대메뉴/하위메뉴/CTA 추가, 삭제, 순서 변경(위/아래), 하위메뉴 종류 선택(없음/상세/심플),
//   메뉴별 화살표 설정(전역/표시/숨김).
// - 아이콘 입력 : 폰트어썸 클래스 칸에 아이콘 태그 전체를 붙여 넣으면 class 값만 자동으로 뽑는다.
//   항목별 아이콘 색은 '개별 지정'을 체크했을 때만 저장되고, 해제하면 글로벌 색을 쓴다.
// - 코드 출력 점검 : 로고 주소 없음, 이름이 빈 메뉴, 하위메뉴도 링크도 없는 대메뉴, 최소 너비가
//   최대 너비보다 큼 같은 문제를 출력 화면에서 알려준다.
//
// [자동으로 처리하는 것]
// - 현재 값 읽기 : 시작할 때 페이지의 :root 변수와 설정 객체를 읽어 화면에 채운다. 설정 객체가 없으면
//   기본값으로 시작하고 상단에 경고를 보여준다.
// - 값 정리 : 예전 표기를 바로잡는다 (icon.type img 는 image, 정렬 left/right 는 flex-start/flex-end,
//   "true"/"false" 문자열은 불리언). 글자 앞뒤 공백은 출력할 때 지운다.
// - 출력 정리 : 하위메뉴가 없는 대메뉴에는 dropdownStyle 을 쓰지 않는다. 아이콘 값이 없으면 none 으로 쓴다.
//   모든 설정 키를 빠짐없이 명시해서 내보낸다(엔진 기본값에 의존하지 않는다).
// - 엔진 점검 : 엔진이 새 옵션(모바일 아코디언, 화살표 애니메이션, 내용 맞춤 너비, 모바일 로고)을
//   지원하지 않는 버전이면 상단 상태줄에 경고를 보여준다.
//
// [동작 원리]
// - 변수 미리보기 : 바꾼 값을 모아 원래 페이지에 style 태그(id: efc_nav_dynamic_style_s1d)로 넣는다.
//   모든 변수에 !important 가 붙어 페이지에 이미 있던 값보다 우선한다.
// - 내용 미리보기 : 설정을 바꾸면 0.12초 뒤에 efc_rebuildNav_v2a(설정)를 호출해 메뉴바를 다시 만든다.
// - 출력 형식 : style 블록(:root 변수 전체) + script 블록(window.efcMenubarConfig = { ... }).
//   기본 복사는 구역/항목 이름 주석이 붙고, 압축 복사는 주석 없이 한 줄이다.
//
// [기본값 (처음 보이는 값)]
// - 변수 : option 파일 상단 주석의 '기본값' 참고. 페이지에 이미 정의된 변수가 있으면 그 값으로 시작한다.
// - 설정 : mobileBreakpoint 1024, useSearch false, showMobileSearchBtn true, searchPosition right,
//   oopyPlan standard, hideNotionTopbar true, showMobileDesc true, mobileCtaLayout horizontal,
//   mobileCtaGridCols 2, useHeaderShadow true, showArrowDefault true, defaultDropdownStyle detailed,
//   mobileAccordion false, arrowAnimation true, detailedWidthMode fixed, scrollEffect true,
//   scrollThreshold 10, offsetBody true, logo.alt 브랜드 로고, logo.link /
//
// [알려진 제한]
// - PC 전용이다. 휴대폰이나 태블릿 브라우저에서는 팝업 창 방식 때문에 사용하지 않는다.
// - 팝업을 닫으면 저장되지 않은 변경은 사라진다. 코드 복사를 먼저 한다.
// - 일부 변수는 엔진에서 PC 상세형에만 적용된다. 대시보드에서 조절해도 모바일이나 심플형에서는 변화가
//   없을 수 있다(option 파일 상단 주석의 '적용' 참고).
// - 미리보기를 오래 쓰면 엔진이 메뉴바를 다시 만들 때마다 문서의 클릭/키 입력 감지가 쌓인다(엔진의
//   알려진 제한). 필요하면 페이지를 새로고침한다.
// - 대시보드 주소 입력칸에는 주소 형식 검사가 없다. 잘못된 주소는 그대로 출력된다.
//
// [검증 상태]
// - 확인함 : PC 브라우저에서의 실행, 미리보기 반영, 코드 출력과 option 파일 적용, 새 설정(모바일 로고,
//            모바일 아코디언, 화살표 애니메이션, 상세형 너비 방식, 모바일 여백)
// - 미확인 : 휴대폰/태블릿에서 대시보드 실행 (지원 대상 아님)
// =====================================================================================


!function efc_launchMasterDashboard() {
  'use strict';
  var popup = window.open('', 'NavDashboardMasterFinal', 'width=800,height=960,scrollbars=yes,resizable=yes');
  if (!popup) { alert('팝업 차단을 해제해 주십시오.'); return; }
  var pDoc = popup.document, oDoc = document, STYLE_ID = 'efc_nav_dynamic_style_s1d';
  var prev = oDoc.getElementById(STYLE_ID); if (prev) prev.remove();

  /* ───────── 팝업 스켈레톤 ───────── */
  var POPUP_CSS = [
    ':root{--bg:#121212;--panel:#1a1a1a;--sum:#222;--input:#111;--sub:#222;--bd:#2a2a2a;--bdd:#333;--tx:#e5e5e5;--tx2:#aaa;--hl:#00a6ab;--ac:#67e8f9}',
    '[data-theme=light]{--bg:#f5f5f7;--panel:#fff;--sum:#ebecef;--input:#f9f9fb;--sub:#f0f1f4;--bd:#d1d5db;--bdd:#e5e7eb;--tx:#1f2937;--tx2:#6b7280;--hl:#00898d;--ac:#0284c7}',
    '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:13px system-ui,sans-serif}',
    '.top{position:sticky;top:0;z-index:10;background:var(--panel);padding:12px 18px;border-bottom:1px solid var(--bd)}',
    '.trow{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}',
    '.top h3{margin:0;color:#00a6ab;font-size:17px;font-weight:800}',
    '.status{display:block;margin-top:6px;font-size:11px;color:var(--tx2)}.status.bad{color:#ef4444}',
    '.main{padding:12px 18px}',
    '.sec{margin-bottom:12px;background:var(--panel);border:1px solid var(--bd);border-radius:8px;overflow:hidden}',
    '.sec summary{cursor:pointer;font-weight:700;font-size:14px;padding:12px;background:var(--sum);color:var(--ac)}',
    '.sbody{padding:12px;display:flex;flex-direction:column;gap:12px}',
    '.item{padding-bottom:12px;border-bottom:1px dashed var(--bdd)}',
    '.ihead{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}',
    '.lbl{font-weight:600}.vn{margin-left:6px;font:11px monospace;color:var(--tx2)}',
    '.dot{display:none;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-left:6px;vertical-align:middle}',
    '.item.dirty .dot{display:inline-block}',
    '.rbtn{background:none;border:1px solid var(--bd);color:var(--tx2);border-radius:4px;cursor:pointer;padding:2px 7px}',
    '.rbtn:disabled{opacity:.3;cursor:default}.rbtn.danger{color:#ef4444}',
    '.row{display:flex;gap:8px;align-items:center;width:100%}.row>*{flex-shrink:0}',
    '.row>.rng{flex:1 1 auto;min-width:70px;flex-shrink:1}',
    '.row2{display:flex;gap:8px;margin-bottom:8px;align-items:center}.row2>*{flex:1;min-width:0}',
    '.inp{width:100%;padding:6px 8px;background:var(--input);color:var(--hl);border:1px solid var(--bd);border-radius:4px;outline:none;font:inherit}',
    '.inp.num{width:62px;text-align:center}.inp.code{width:170px;font:11px monospace}.inp.bad{border-color:#ef4444}',
    '.rng{accent-color:#00a6ab;cursor:pointer}',
    '.chip{width:34px;height:28px;padding:0;border:1px solid var(--bd);border-radius:4px;background:transparent;cursor:pointer}',
    '.mut{font-size:11px;color:var(--tx2)}',
    '.btn{padding:8px 12px;background:var(--sum);color:var(--hl);border:1px solid var(--bdd);border-radius:6px;cursor:pointer;font-weight:700}',
    '.btn.dash{width:100%;border-style:dashed}.btn.sm{padding:4px 8px;font-size:11px}',
    '.btn.pri{background:#3b82f6;color:#fff;border:0;flex:1}.btn.sec2{background:#8b5cf6;color:#fff;border:0;flex:1}',
    '.btn.exp{width:100%;background:#00a6ab;color:#fff;border:0;font-size:15px;font-weight:800;padding:12px}',
    '.tog{display:flex;align-items:center;gap:10px;cursor:pointer;position:relative}',
    '.tog>input[type=checkbox]{position:absolute;opacity:0;width:0;height:0}',
    '.sw{position:relative;width:36px;height:20px;border-radius:20px;background:#555;flex-shrink:0;transition:.2s}',
    '.sw:before{content:"";position:absolute;width:14px;height:14px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s}',
    '.tog>input:checked+.sw{background:#00a6ab}.tog>input:checked+.sw:before{transform:translateX(16px)}',
    '.tl{font-weight:600}',
    '.ck{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--tx2)}',
    '.box{background:var(--input);padding:10px;border-radius:8px;border:1px solid var(--bdd);margin-bottom:10px}',
    '.bhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.cbtns{display:flex;gap:4px}',
    '.subs{margin:6px 0 8px;padding-left:12px;border-left:2px solid var(--bdd)}',
    '.sub{background:var(--sub);padding:8px;border-radius:6px;margin-bottom:6px}',
    '.sbox{display:none;flex-direction:column;gap:6px;background:var(--sum);padding:10px;border-radius:6px;margin-top:6px}',
    '.w45{width:45px}.num2{width:30px;text-align:right}',
    '.fld{margin-bottom:4px}.fld>.lbl{display:block;margin-bottom:6px}',
    '.warn{background:rgba(239,68,68,.1);border:1px solid #ef4444;color:#ef4444;border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:12px}',
    '.xa{display:none;padding:14px 18px;border-top:1px solid var(--bd);background:var(--panel)}',
    '.xa textarea{width:100%;height:220px;background:var(--input);color:var(--hl);border:1px solid var(--bd);border-radius:8px;padding:10px;font:12px monospace;resize:vertical}',
    '.foot{position:sticky;bottom:0;padding:12px 18px;border-top:1px solid var(--bd);background:var(--panel)}',
    '.fx{display:none!important}.commonMode .detOnly{display:none}.c-y{color:#eab308}.c-p{color:#8b5cf6}',
    '.ddAuto .fixedOnly{display:none}body:not(.ddAuto) .autoOnly{display:none}'
  ].join('\n');
  pDoc.open();
  pDoc.write('<!DOCTYPE html><html lang="ko" data-theme="dark"><head><meta charset="utf-8"><title>메뉴바 대시보드 2.0</title><style>' + POPUP_CSS + '</style></head><body><div id="app"></div></body></html>');
  pDoc.close();

  /* ───────── 유틸 ───────── */
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var isObj = function (v) { return !!v && typeof v === 'object' && !Array.isArray(v); };
  var str = function (v) { return v == null ? '' : String(v); };
  var toBool = function (v, d) { return (v === true || v === 'true') ? true : ((v === false || v === 'false') ? false : d); };
  var toInt = function (v, d) { var n = parseInt(v, 10); return isNaN(n) ? d : n; };
  var num = function (n) { return +(+n).toFixed(2); };
  var debounce = function (fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; };
  function deepMerge(base, extra) {
    var out = clone(base);
    if (!isObj(extra)) return out;
    Object.keys(extra).forEach(function (k) {
      var v = extra[k];
      if (v === undefined) return;
      if (isObj(v) && isObj(out[k])) out[k] = deepMerge(out[k], v); else out[k] = clone(v);
    });
    return out;
  }
  function h(tag, props) {
    var el = pDoc.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === undefined || v === null) return;
      if (k === 'className') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.slice(0, 5) === 'data-') el.setAttribute(k, v);
      else el[k] = v;
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      (Array.isArray(c) ? c : [c]).forEach(function (cc) {
        if (cc == null || cc === false) return;
        el.appendChild(typeof cc === 'string' ? pDoc.createTextNode(cc) : cc);
      });
    }
    return el;
  }
  function validColor(v) { try { return (popup.CSS || window.CSS).supports('color', v); } catch (e) { return true; } }

  /* ───────── 색/그림자 파서 ───────── */
  function toHex(r, g, b) {
    return '#' + [r, g, b].map(function (x) { x = Math.max(0, Math.min(255, Math.round(+x))); return (x < 16 ? '0' : '') + x.toString(16); }).join('');
  }
  function hexToRgb(hex) { var c = hex.replace('#', ''); return { r: parseInt(c.substr(0, 2), 16), g: parseInt(c.substr(2, 2), 16), b: parseInt(c.substr(4, 2), 16) }; }
  function parseColor(s) {
    s = str(s).trim().toLowerCase();
    if (!s || s === 'transparent') return { hex: null, a: 0 };
    var m = s.match(/^#([0-9a-f]{3})$/);
    if (m) { var c = m[1]; return { hex: '#' + c[0] + c[0] + c[1] + c[1] + c[2] + c[2], a: 100 }; }
    m = s.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/);
    if (m) return { hex: '#' + m[1], a: m[2] ? Math.round(parseInt(m[2], 16) / 255 * 100) : 100 };
    m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,\/]+([\d.]+)(%)?)?\s*\)$/);
    if (m) {
      var al = m[4] === undefined ? 1 : parseFloat(m[4]); if (m[5]) al = al / 100;
      return { hex: toHex(m[1], m[2], m[3]), a: Math.round(al * 100) };
    }
    return null;
  }
  function fmtRgba(hex, a) { if (a <= 0) return 'transparent'; var c = hexToRgb(hex); return 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + num(a / 100) + ')'; }
  function fmtColor(hex, a) { return a <= 0 ? 'transparent' : (a >= 100 ? hex : fmtRgba(hex, a)); }
  function parseShadow(v) {
    v = str(v).trim();
    if (!v || v === 'none') return null;
    var m = v.match(/^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?\s+(?:(-?[\d.]+)(?:px)?\s+)?(.+)$/);
    if (!m) return undefined;
    var c = parseColor(m[5]); if (!c) return undefined;
    return { x: +m[1], y: +m[2], b: +m[3], s: +(m[4] || 0), hex: c.hex || '#000000', a: c.a };
  }
  function fmtShadow(o) { return o ? (o.x + 'px ' + o.y + 'px ' + o.b + 'px ' + o.s + 'px ' + fmtRgba(o.hex, o.a)) : 'none'; }
  var SHADOW_PRESETS = {
    none: 'none',
    light: '0px 4px 16px 0px rgba(0, 0, 0, 0.04)',
    normal: '0px 10px 30px 0px rgba(0, 0, 0, 0.08)',
    strong: '0px 20px 40px 0px rgba(0, 0, 0, 0.16)'
  };
  function shadowCanon(v) { var p = parseShadow(v); return p === undefined ? 'raw:' + v : fmtShadow(p); }

  /* ───────── 설정 스키마 (변수명·기본값은 엔진 노션 코드 기준) ───────── */
  var R = function (v, l, min, max, unit, def, step, quick) { return { v: v, label: l, type: 'range', min: min, max: max, unit: unit, def: def, step: step || 1, quick: quick }; };
  var C = function (v, l, def) { return { v: v, label: l, type: 'color', def: def }; };
  var S = function (v, l, opts, def, alias) { return { v: v, label: l, type: 'select', opts: opts, def: def, alias: alias }; };
  var W = function (v, l, def) { return { v: v, label: l, type: 'weight', def: def }; };
  var P = function (v, l, def) { return { v: v, label: l, type: 'pad2', def: def }; };
  var SH = function (v, l, def) { return { v: v, label: l, type: 'shadow', def: def }; };
  var D = function (it) { it.det = true; return it; };
  var O = function (it) { it.optional = true; return it; };
  var M = function (mode, it) { it.mode = mode; return it; };
  var PILL = [{ label: '알약(999)', value: 999 }];

  var GROUPS = [
    { title: '1. 헤더 기본 레이아웃', items: [
      C('--headerBg_a1', '헤더 배경색', '#ffffff'),
      C('--headerBorderColor_a2', '헤더 하단 테두리색', 'transparent'),
      R('--headerHeight_a3', '헤더 전체 높이', 40, 120, 'px', '72px'),
      { v: '--headerMaxWidth_a4', label: '콘텐츠 최대 너비', type: 'width', def: '1280px' },
      R('--headerPaddingX_a5', '좌우 내부 여백', 0, 100, 'px', '24px'),
      O(R('--mobileHeaderPaddingX_a9', '모바일 헤더 좌우 여백', 0, 100, 'px', '16px')),
      R('--headerZIndex_a6', 'Z-Index (우선순위)', 10, 9999, '', '9999'),
      R('--headerTransitionSpeed_a7', '배경 전환 애니메이션 속도', 0, 2, 's', '0.3s', 0.1),
      R('--headerRowGap_a8', '로고-메뉴-버튼 간격', 0, 100, 'px', '24px'),
      R('--logoHeight_b1', '로고 이미지 높이', 10, 100, 'px', '28px'),
      O(R('--logoHeightMobile_b2', '모바일 로고 높이', 10, 100, 'px', '24px'))
    ] },
    { title: '2. 데스크톱 대메뉴', items: [
      S('--navAlign_c9', '메뉴 정렬 위치', { 'flex-start': '좌측 (로고 옆)', 'center': '중앙', 'flex-end': '우측 (버튼 옆)' }, 'center', { left: 'flex-start', right: 'flex-end' }),
      R('--navGap_c1', '메뉴 사이 간격', 10, 200, 'px', '28px'),
      R('--navMarginLeft_c10', '대메뉴 좌측(로고) 여백', 0, 200, 'px', '0px'),
      R('--navMarginRight_c11', '대메뉴 우측(CTA) 여백', 0, 200, 'px', '0px'),
      R('--navFontSize_c2', '글자 크기', 10, 24, 'px', '15px'),
      W('--navFontWeight_c3', '글자 굵기', '500'),
      C('--navColor_c4', '기본 글자색', '#333333'),
      C('--navHoverColor_c5', '호버 글자색', 'rgba(49, 130, 246, 1.00)'),
      S('--navArrowDisplay_c6', '화살표 노출', { 'inline-block': '노출', 'none': '숨김' }, 'inline-block'),
      R('--navArrowSize_c7', '화살표 크기', 5, 30, 'px', '10px'),
      { v: '--navArrowColor_c8', label: '화살표 색상', type: 'arrow', def: 'currentColor' }
    ] },
    { title: '3. 하위메뉴 공통/상세/심플', mode: true, items: [
      C('--dropdownSimpleBg_d1', '배경색 (심플/공통)', '#ffffff'),
      R('--dropdownSimpleRadius_d2', '테두리 둥글기 (심플/공통)', 0, 40, 'px', '12px'),
      P('--dropdownSimplePad_d5', '내부 여백 (심플/공통)', '8px 8px'),
      SH('--dropdownSimpleShadow_d3', '박스 그림자 (심플/공통)', '0 10px 30px rgba(0, 0, 0, 0.08)'),
      R('--dropdownSimpleMinWidth_d4', '심플형 최소 너비', 100, 400, 'px', '200px'),
      D(C('--dropdownDetailedBg_e1', '상세형 배경색 (개별)', '#ffffff')),
      D(R('--dropdownDetailedRadius_e2', '상세형 둥글기 (개별)', 0, 40, 'px', '16px')),
      D(P('--dropdownDetailedPad_e5', '상세형 내부 여백 (개별)', '10px 10px')),
      D(SH('--dropdownDetailedShadow_e3', '상세형 박스 그림자 (개별)', '0 20px 40px rgba(0, 0, 0, 0.12)')),
      M('fixed', R('--dropdownDetailedWidth_e4', '상세형 고정 너비 (고정 모드)', 200, 600, 'px', '320px')),
      M('auto', R('--dropdownDetailedMinWidth_e22', '상세형 최소 너비 (내용에 맞춤 모드)', 100, 600, 'px', '200px')),
      M('auto', R('--dropdownDetailedMaxWidth_e23', '상세형 최대 너비 (내용에 맞춤 모드)', 200, 800, 'px', '320px')),
      R('--dropdownItemRadius_e6', '항목 호버 둥글기', 0, 30, 'px', '10px'),
      C('--dropdownItemHoverBg_e7', '항목 호버 배경색', 'rgba(49, 130, 246, 0.06)'),
      R('--dropdownGap_e21', '항목 사이 상하 간격', 0, 20, 'px', '4px')
    ] },
    { title: '4. 하위메뉴 아이콘/텍스트', items: [
      C('--dropdownIconColor_e11', '글로벌 아이콘 기본색', 'rgba(51, 51, 51, 1.00)'),
      C('--dropdownIconHoverColor_e11h', '글로벌 아이콘 호버색', 'rgba(49, 130, 246, 1.00)'),
      R('--dropdownIconBoxSize_e8', '아이콘 박스 크기', 0, 80, 'px', '30px'),
      C('--dropdownIconBoxBg_e9', '아이콘 박스 배경색', 'transparent'),
      R('--dropdownIconBoxRadius_e10', '아이콘 박스 둥글기', 0, 40, 'px', '8px'),
      R('--dropdownIconImgScale_e11b', '이미지 비율 (박스 대비)', 0.1, 1.5, '', '0.8', 0.1),
      R('--dropdownIconFaSize_e11c', '폰트어썸 아이콘 크기', 10, 50, 'px', '17px'),
      R('--dropdownIconGap_e12', '아이콘-텍스트 간격', 0, 40, 'px', '10px'),
      C('--dropdownTitleColor_e13', '제목 글자색', '#1f2937'),
      R('--dropdownTitleSize_e14', '제목 크기', 10, 24, 'px', '14px'),
      W('--dropdownTitleWeight_e15', '제목 굵기', '600'),
      C('--dropdownDescColor_e16', '설명 글자색', '#8a8f98'),
      R('--dropdownDescSize_e17', '설명 크기', 8, 20, 'px', '12px'),
      W('--dropdownDescWeight_e18', '설명 굵기', '400'),
      R('--dropdownTitleDescGap_e19', '제목-설명 상하 간격', 0, 20, 'px', '3px'),
      S('--dropdownNoIconAlign_e20', '아이콘 없을 때 텍스트 정렬', { left: '좌측', center: '중앙', right: '우측' }, 'left')
    ] },
    { title: '5. CTA 버튼', items: [
      R('--ctaGap_f1', '버튼 간격', 0, 40, 'px', '10px'),
      R('--ctaRadius_f2', '버튼 둥글기', 0, 100, 'px', '999px', 1, PILL),
      R('--ctaFontSize_f3', '글자 크기', 10, 24, 'px', '14px'),
      W('--ctaFontWeight_z7', '글자 굵기', '700'),
      R('--ctaPaddingY_f5', '상하 여백', 0, 30, 'px', '10px'),
      R('--ctaPaddingX_f4', '좌우 여백', 0, 50, 'px', '18px'),
      C('--ctaSolidBg_z1', 'Solid 배경색', 'rgba(49, 130, 246, 1.00)'),
      C('--ctaSolidText_z2', 'Solid 글자색', '#ffffff'),
      C('--ctaOutlineBg_z3', 'Outline 배경색', '#ffffff'),
      C('--ctaOutlineText_z4', 'Outline 글자색', 'rgba(49, 130, 246, 1.00)'),
      C('--ctaOutlineBorder_z5', 'Outline 선 색상', 'rgba(49, 130, 246, 1.00)'),
      R('--ctaBorderWidth_z6', '테두리 선 두께', 0, 10, 'px', '1.5px', 0.5)
    ] },
    { title: '6. PC/모바일 검색버튼', items: [
      C('--searchBtnBg_j1', '(PC) 기본 배경색', 'transparent'),
      C('--searchBtnText_j2', '(PC) 기본 아이콘색', '#333333'),
      C('--searchBtnHoverBg_j3', '(PC) 호버 배경색', 'transparent'),
      C('--searchBtnHoverText_j4', '(PC) 호버 아이콘색', '#00a6ab'),
      R('--searchBtnSize_j5', '(PC) 아이콘 크기', 10, 40, 'px', '18px'),
      P('--searchBtnPadding_j6', '(PC) 내부 여백', '4px 4px'),
      R('--searchBtnRadius_j7', '(PC) 둥글기', 0, 30, 'px', '4px'),
      C('--mobileSearchBg_m1', '(모바일) 배경색', '#f4f4f5'),
      C('--mobileSearchText_m2', '(모바일) 글자/아이콘색', '#333333'),
      C('--mobileSearchHoverBg_m3', '(모바일) 호버 배경색', '#e4e4e7'),
      C('--mobileSearchHoverText_m4', '(모바일) 호버 글자색', '#00a6ab'),
      R('--mobileSearchRadius_m5', '(모바일) 둥글기', 0, 50, 'px', '8px')
    ] },
    { title: '7. 모바일 패널/상단바 CTA', items: [
      C('--mobilePanelBg_h1', '모바일 패널 배경색', '#ffffff'),
      R('--mobilePanelPaddingX_h5', '모바일 패널 좌우 추가 여백', 0, 60, 'px', '0px'),
      R('--mobileActionGap_o2', '상단 햄버거-버튼 간격', 0, 40, 'px', '12px'),
      C('--toggleColor_g1', '햄버거 아이콘 색상', '#1f2937'),
      R('--mobileItemFontSize_h2', '모바일 대메뉴 크기', 10, 24, 'px', '15px'),
      C('--mobileItemColor_h3', '모바일 메뉴 글자색', '#333333'),
      C('--mobileCaretColor_h4', '모바일 화살표 색상', '#9aa0a6'),
      R('--mobileBarCtaGap_i1', '상단 CTA 간격', 0, 20, 'px', '8px'),
      R('--mobileBarCtaFontSize_i2', '상단 CTA 글자크기', 8, 20, 'px', '12px'),
      R('--mobileBarCtaPaddingY_i4', '상단 CTA 상하 여백', 0, 20, 'px', '7px'),
      R('--mobileBarCtaPaddingX_i3', '상단 CTA 좌우 여백', 0, 40, 'px', '12px'),
      R('--mobileBarCtaRadius_i5', '상단 CTA 둥글기', 0, 100, 'px', '999px', 1, PILL)
    ] }
  ];
  var SYNC = {
    '--dropdownSimpleBg_d1': '--dropdownDetailedBg_e1',
    '--dropdownSimpleRadius_d2': '--dropdownDetailedRadius_e2',
    '--dropdownSimplePad_d5': '--dropdownDetailedPad_e5',
    '--dropdownSimpleShadow_d3': '--dropdownDetailedShadow_e3'
  };
  var TARGETS = { _self: '현재창', _blank: '새창' };

  var NAV_DEFAULT = {
    mobileBreakpoint: 1024, useSearch: false, showMobileSearchBtn: true, searchPosition: 'right', oopyPlan: 'standard',
    hideNotionTopbar: true, showMobileDesc: true, mobileCtaLayout: 'horizontal', mobileCtaGridCols: 2, useHeaderShadow: true,
    logo: { url: '', mobileUrl: '', alt: '브랜드 로고', link: '/' }, showArrowDefault: true, defaultDropdownStyle: 'detailed',
    mobileAccordion: false, arrowAnimation: true, detailedWidthMode: 'fixed',
    menuItems: [], ctaButtons: [], scrollEffect: true, scrollThreshold: 10, offsetBody: true
  };

  /* ───────── 상태 초기화 ───────── */
  var state = { styles: {}, snap: {}, nav: null, navSnap: null, commonMode: true };
  var cs = oDoc.defaultView.getComputedStyle(oDoc.documentElement);
  GROUPS.forEach(function (g) { g.items.forEach(function (it) {
    var val = cs.getPropertyValue(it.v).trim();
    if (!val && !it.optional) val = it.def;
    if (it.alias && it.alias[val]) val = it.alias[val];
    if (it.type === 'range' && val && isNaN(parseFloat(val))) console.warn('[NavDash] 숫자가 아닌 값이 슬라이더 항목에 있습니다:', it.v, val);
    state.styles[it.v] = val;
  }); });
  state.snap = clone(state.styles);

  function normChild(c) {
    c = isObj(c) ? c : {};
    var ic = isObj(c.icon) ? c.icon : {}, t = ic.type === 'img' ? 'image' : ic.type;
    if (['fa', 'image', 'none'].indexOf(t) < 0) t = 'none';
    var icon = { type: t, value: str(ic.value) };
    if (ic.color) icon.color = ic.color;
    if (ic.hoverColor) icon.hoverColor = ic.hoverColor;
    return { title: str(c.title || c.label), url: c.url || '#', target: c.target === '_blank' ? '_blank' : '_self', desc: str(c.desc), icon: icon };
  }
  function normMenu(it, defStyle) {
    it = isObj(it) ? it : {};
    var kids = Array.isArray(it.children) ? it.children.filter(isObj).map(normChild) : [];
    var o = { label: str(it.label), url: it.url || '#', target: it.target === '_blank' ? '_blank' : '_self', children: kids };
    if (typeof it.showArrow === 'boolean') o.showArrow = it.showArrow;
    if (kids.length) o.dropdownStyle = (it.dropdownStyle === 'simple' || it.dropdownStyle === 'detailed') ? it.dropdownStyle : defStyle;
    return o;
  }
  function normCta(b) {
    b = isObj(b) ? b : {};
    return { label: str(b.label), url: b.url || '#', target: b.target === '_blank' ? '_blank' : '_self', variant: b.variant === 'solid' ? 'solid' : 'outline', showOnMobileBar: toBool(b.showOnMobileBar, false) };
  }
  var hasSrc = isObj(window.efcMenubarConfig);
  var nav = deepMerge(NAV_DEFAULT, hasSrc ? window.efcMenubarConfig : {});
  ['useSearch', 'showMobileSearchBtn', 'hideNotionTopbar', 'showMobileDesc', 'useHeaderShadow', 'showArrowDefault', 'scrollEffect', 'offsetBody', 'mobileAccordion', 'arrowAnimation'].forEach(function (k) { nav[k] = toBool(nav[k], NAV_DEFAULT[k]); });
  nav.mobileBreakpoint = toInt(nav.mobileBreakpoint, 1024);
  nav.mobileCtaGridCols = toInt(nav.mobileCtaGridCols, 2);
  nav.scrollThreshold = toInt(nav.scrollThreshold, 10);
  nav.defaultDropdownStyle = nav.defaultDropdownStyle === 'simple' ? 'simple' : 'detailed';
  nav.detailedWidthMode = nav.detailedWidthMode === 'auto' ? 'auto' : 'fixed';
  nav.menuItems = (Array.isArray(nav.menuItems) ? nav.menuItems : []).map(function (m) { return normMenu(m, nav.defaultDropdownStyle); });
  nav.ctaButtons = (Array.isArray(nav.ctaButtons) ? nav.ctaButtons : []).map(normCta);
  state.nav = nav;
  state.navSnap = clone(nav);

  /* ───────── 출력용 정리 ───────── */
  function cleanChild(c) {
    var t = c.icon.type, v = str(c.icon.value).trim(), ic;
    if (t === 'none' || !v) ic = { type: 'none', value: '' };
    else { ic = { type: t, value: v }; if (t === 'fa') { if (c.icon.color) ic.color = c.icon.color; if (c.icon.hoverColor) ic.hoverColor = c.icon.hoverColor; } }
    return { title: str(c.title).trim(), url: str(c.url).trim() || '#', target: c.target, desc: str(c.desc).trim(), icon: ic };
  }
  function cleanItem(it) {
    var kids = it.children.map(cleanChild);
    var o = { label: str(it.label).trim(), url: str(it.url).trim() || '#', target: it.target };
    if (typeof it.showArrow === 'boolean') o.showArrow = it.showArrow;
    if (kids.length) o.dropdownStyle = it.dropdownStyle;
    o.children = kids;
    return o;
  }
  function cleanNav(d) {
    d = d || state.nav;
    var out = {
      mobileBreakpoint: toInt(d.mobileBreakpoint, 1024), useSearch: !!d.useSearch, showMobileSearchBtn: !!d.showMobileSearchBtn,
      searchPosition: d.searchPosition === 'left' ? 'left' : 'right', oopyPlan: d.oopyPlan === 'pro' ? 'pro' : 'standard',
      hideNotionTopbar: !!d.hideNotionTopbar, showMobileDesc: !!d.showMobileDesc,
      mobileCtaLayout: d.mobileCtaLayout === 'vertical' ? 'vertical' : 'horizontal',
      mobileCtaGridCols: Math.max(1, Math.min(10, toInt(d.mobileCtaGridCols, 2))), useHeaderShadow: !!d.useHeaderShadow,
      logo: { url: str(d.logo.url).trim(), mobileUrl: str(d.logo.mobileUrl).trim(), alt: str(d.logo.alt), link: str(d.logo.link).trim() || '/' },
      showArrowDefault: !!d.showArrowDefault, defaultDropdownStyle: d.defaultDropdownStyle === 'simple' ? 'simple' : 'detailed',
      mobileAccordion: !!d.mobileAccordion, arrowAnimation: d.arrowAnimation !== false, detailedWidthMode: d.detailedWidthMode === 'auto' ? 'auto' : 'fixed',
      menuItems: d.menuItems.map(cleanItem),
      ctaButtons: d.ctaButtons.map(function (b) { return { label: str(b.label).trim(), url: str(b.url).trim() || '#', target: b.target, variant: b.variant, showOnMobileBar: !!b.showOnMobileBar }; }),
      scrollEffect: !!d.scrollEffect, scrollThreshold: Math.max(0, toInt(d.scrollThreshold, 10)), offsetBody: !!d.offsetBody
    };
    Object.keys(d).forEach(function (k) { if (!(k in out)) out[k] = clone(d[k]); });
    return out;
  }

  /* ───────── 미리보기 반영 ───────── */
  var statusEl, engineWarn = '';
  function setStatus(msg, bad) { if (!statusEl) return; statusEl.textContent = msg; statusEl.className = 'status' + (bad ? ' bad' : ''); }
  function applyCss() {
    var el = oDoc.getElementById(STYLE_ID);
    if (!el) { el = oDoc.createElement('style'); el.id = STYLE_ID; oDoc.head.appendChild(el); }
    var lines = Object.keys(state.styles).map(function (k) {
      return '  ' + k + ': ' + (state.styles[k] === '' ? 'initial' : state.styles[k]) + ' !important;';
    });
    el.textContent = ':root {\n' + lines.join('\n') + '\n}';
  }
  var rebuild = debounce(function () {
    if (typeof window.efc_rebuildNav_v2a !== 'function') { setStatus('엔진(efc_rebuildNav_v2a)을 찾을 수 없습니다. 메뉴바 코드가 이 페이지에 로드되어 있는지 확인하세요.', true); return; }
    try { window.efc_rebuildNav_v2a(cleanNav()); setStatus('미리보기 연결됨 · 메뉴 ' + state.nav.menuItems.length + '개 / CTA ' + state.nav.ctaButtons.length + '개' + engineWarn, !!engineWarn); }
    catch (e) { console.error('[NavDash] 메뉴바 재빌드 오류', e); setStatus('재빌드 오류: ' + e.message, true); }
  }, 120);

  var controls = {};
  function markDirty(v) { var c = controls[v]; if (c) c.wrap.classList.toggle('dirty', state.styles[v] !== state.snap[v]); }
  function setStyle(v, val, user) {
    state.styles[v] = val; markDirty(v); applyCss();
    if (user && state.commonMode && SYNC[v]) {
      var t = SYNC[v]; state.styles[t] = val;
      if (controls[t]) controls[t].set(val);
      markDirty(t);
    }
  }

  /* ───────── 컨트롤 팩토리 ───────── */
  var mk = {};
  mk.range = function (it, ctx) {
    var unit = it.unit || '';
    var r = h('input', { type: 'range', className: 'rng' }); r.min = it.min; r.max = it.max; r.step = it.step || 1;
    var n = h('input', { type: 'number', className: 'inp num' }); n.step = it.step || 1;
    r.oninput = function () { n.value = r.value; ctx.commit(r.value + unit); };
    n.oninput = function () { if (n.value === '' || isNaN(+n.value)) return; r.value = n.value; ctx.commit(n.value + unit); };
    var kids = [r, n];
    (it.quick || []).forEach(function (q) {
      kids.push(h('button', { type: 'button', className: 'btn sm', text: q.label, onclick: function () { r.value = q.value; n.value = q.value; ctx.commit(q.value + unit); } }));
    });
    return { el: h('div', { className: 'row' }, kids), set: function (v) { var x = parseFloat(v); if (isNaN(x)) x = parseFloat(it.def); r.value = x; n.value = x; } };
  };
  mk.color = function (it, ctx) {
    var chip = h('input', { type: 'color', className: 'chip' });
    var al = h('input', { type: 'range', className: 'rng' }); al.min = 0; al.max = 100;
    var txt = h('input', { type: 'text', className: 'inp code', spellcheck: false });
    function syncParts(v) { var p = parseColor(v); if (p) { if (p.hex) chip.value = p.hex; al.value = p.a; } }
    function parts() { var v = fmtColor(chip.value, +al.value); txt.value = v; txt.classList.remove('bad'); ctx.commit(v); }
    chip.oninput = parts; al.oninput = parts;
    txt.oninput = function () {
      var v = txt.value.trim();
      if (!v || !validColor(v)) { txt.classList.add('bad'); return; }
      txt.classList.remove('bad'); syncParts(v); ctx.commit(v);
    };
    return {
      el: h('div', { className: 'row' }, [chip, h('span', { className: 'mut', text: '투명도' }), al, txt]),
      get: function () { return txt.value; },
      set: function (v) { txt.value = v; txt.classList.remove('bad'); syncParts(v); }
    };
  };
  mk.select = function (it, ctx) {
    var s = h('select', { className: 'inp' });
    Object.keys(it.opts).forEach(function (k) { s.appendChild(h('option', { value: k, text: it.opts[k] })); });
    s.onchange = function () { ctx.commit(s.value); };
    return { el: s, set: function (v) {
      var has = false; for (var i = 0; i < s.options.length; i++) if (s.options[i].value === v) has = true;
      if (!has) s.appendChild(h('option', { value: v, text: '(현재값) ' + v }));
      s.value = v;
    } };
  };
  mk.weight = function (it, ctx) {
    var r = h('input', { type: 'range', className: 'rng' }); r.min = 100; r.max = 900; r.step = 100;
    var s = h('select', { className: 'inp', style: 'width:140px' });
    [['100', 'Thin'], ['200', 'ExtraLight'], ['300', 'Light'], ['400', 'Regular'], ['500', 'Medium'], ['600', 'SemiBold'], ['700', 'Bold'], ['800', 'ExtraBold'], ['900', 'Black']]
      .forEach(function (o) { s.appendChild(h('option', { value: o[0], text: o[0] + ' ' + o[1] })); });
    r.oninput = function () { s.value = r.value; ctx.commit(r.value); };
    s.onchange = function () { r.value = s.value; ctx.commit(s.value); };
    return { el: h('div', { className: 'row' }, [r, s]), set: function (v) {
      var x = Math.round(parseInt(v, 10) / 100) * 100; if (isNaN(x)) x = parseInt(it.def, 10);
      x = String(Math.max(100, Math.min(900, x))); r.value = x; s.value = x;
    } };
  };
  mk.pad2 = function (it, ctx) {
    function pair() { var r = h('input', { type: 'range', className: 'rng' }); r.min = 0; r.max = 100; return { r: r, n: h('input', { type: 'number', className: 'inp num' }) }; }
    var y = pair(), x = pair();
    function emit() { ctx.commit(y.n.value + 'px ' + x.n.value + 'px'); }
    [y, x].forEach(function (p) {
      p.r.oninput = function () { p.n.value = p.r.value; emit(); };
      p.n.oninput = function () { if (p.n.value === '' || isNaN(+p.n.value)) return; p.r.value = p.n.value; emit(); };
    });
    return {
      el: h('div', { className: 'row' }, [h('span', { className: 'mut', text: '상하' }), y.r, y.n, h('span', { className: 'mut', text: '좌우' }), x.r, x.n]),
      set: function (v) {
        var m = str(v).match(/-?[\d.]+/g) || ['0'], a = m[0], b = m[1] !== undefined ? m[1] : m[0];
        y.r.value = y.n.value = a; x.r.value = x.n.value = b;
      }
    };
  };
  mk.shadow = function (it, ctx) {
    var sel = h('select', { className: 'inp' });
    [['none', '없음 (None)'], ['light', '약하게 (Light)'], ['normal', '보통 (Normal)'], ['strong', '강하게 (Strong)'], ['custom', '커스텀 (직접 조절)']]
      .forEach(function (o) { sel.appendChild(h('option', { value: o[0], text: o[1] })); });
    var box = h('div', { className: 'sbox' }), f = {}, nums = {};
    function sl(key, label, min, max) {
      var r = h('input', { type: 'range', className: 'rng' }); r.min = min; r.max = max;
      var n = h('span', { className: 'mut num2' });
      r.oninput = function () { n.textContent = r.value; emit(); };
      f[key] = r; nums[key] = n;
      box.appendChild(h('div', { className: 'row' }, [h('span', { className: 'mut w45', text: label }), r, n]));
    }
    sl('x', 'X축', -50, 50); sl('y', 'Y축', -50, 50); sl('b', '흐림', 0, 100); sl('s', '퍼짐', -50, 50);
    var chip = h('input', { type: 'color', className: 'chip' });
    var al = h('input', { type: 'range', className: 'rng' }); al.min = 0; al.max = 100;
    box.appendChild(h('div', { className: 'row' }, [chip, h('span', { className: 'mut', text: '투명도' }), al]));
    function read() { return { x: +f.x.value, y: +f.y.value, b: +f.b.value, s: +f.s.value, hex: chip.value, a: +al.value }; }
    function emit() { ctx.commit(fmtShadow(read())); }
    function fill(o) {
      o = o || { x: 0, y: 10, b: 30, s: 0, hex: '#000000', a: 8 };
      ['x', 'y', 'b', 's'].forEach(function (k) { f[k].value = o[k]; nums[k].textContent = o[k]; });
      chip.value = o.hex; al.value = o.a;
    }
    chip.oninput = emit; al.oninput = emit;
    sel.onchange = function () {
      var k = sel.value;
      if (k === 'custom') { box.style.display = 'flex'; emit(); return; }
      box.style.display = 'none';
      fill(parseShadow(SHADOW_PRESETS[k]) || undefined);
      ctx.commit(SHADOW_PRESETS[k]);
    };
    return {
      el: h('div', {}, [sel, box]),
      set: function (v) {
        var p = parseShadow(v), canon = shadowCanon(v), key = 'custom';
        Object.keys(SHADOW_PRESETS).forEach(function (k) { if (shadowCanon(SHADOW_PRESETS[k]) === canon) key = k; });
        sel.value = key; box.style.display = key === 'custom' ? 'flex' : 'none';
        fill(p || undefined);
      }
    };
  };
  mk.width = function (it, ctx) {
    var sel = h('select', { className: 'inp' });
    [['none', '가로 꽉참 (none)'], ['1024px', '1024px'], ['1280px', '1280px'], ['custom', '직접 입력']].forEach(function (o) { sel.appendChild(h('option', { value: o[0], text: o[1] })); });
    var r = h('input', { type: 'range', className: 'rng' }); r.min = 600; r.max = 2400; r.step = 10;
    var t = h('input', { type: 'text', className: 'inp', style: 'width:90px;text-align:center' });
    var box = h('div', { className: 'row', style: 'margin-top:8px;display:none' }, [r, t]);
    var norm = function (v) { v = v.trim(); return /^\d+(\.\d+)?$/.test(v) ? v + 'px' : v; };
    var OK = /^\d+(\.\d+)?(px|%|vw|rem|em)$/;
    sel.onchange = function () {
      if (sel.value === 'custom') { box.style.display = 'flex'; var v = norm(t.value) || '1280px'; t.value = v; if (OK.test(v)) ctx.commit(v); }
      else { box.style.display = 'none'; ctx.commit(sel.value); }
    };
    r.oninput = function () { t.value = r.value + 'px'; t.classList.remove('bad'); ctx.commit(t.value); };
    t.oninput = function () {
      var v = norm(t.value);
      if (!OK.test(v)) { t.classList.add('bad'); return; }
      t.classList.remove('bad'); if (/px$/.test(v)) r.value = parseFloat(v); ctx.commit(v);
    };
    t.onchange = function () { t.value = norm(t.value); };
    return {
      el: h('div', {}, [sel, box]),
      set: function (v) {
        var std = ['none', '1024px', '1280px'].indexOf(v) >= 0;
        sel.value = std ? v : 'custom'; box.style.display = std ? 'none' : 'flex';
        t.value = std ? '' : v; var p = parseFloat(v); r.value = isNaN(p) ? 1280 : p;
      }
    };
  };
  mk.arrow = function (it, ctx) {
    var sel = h('select', { className: 'inp' });
    sel.appendChild(h('option', { value: 'currentColor', text: '자동 (글자색과 동기화 - currentColor)' }));
    sel.appendChild(h('option', { value: 'custom', text: '커스텀 색상 지정' }));
    var sub = mk.color({ def: '#333333' }, { commit: function (v) { ctx.commit(v); } });
    var wrap = h('div', { style: 'margin-top:6px;display:none' }, [sub.el]);
    sel.onchange = function () {
      if (sel.value === 'currentColor') { wrap.style.display = 'none'; ctx.commit('currentColor'); }
      else {
        wrap.style.display = 'block';
        if (/^currentcolor$/i.test(sub.get()) || !sub.get()) sub.set('#333333');
        ctx.commit(sub.get());
      }
    };
    return { el: h('div', {}, [sel, wrap]), set: function (v) {
      var auto = /^currentcolor$/i.test(str(v).trim());
      sel.value = auto ? 'currentColor' : 'custom'; wrap.style.display = auto ? 'none' : 'block';
      if (!auto) sub.set(v);
    } };
  };
  /* 선택 사용 변수: 해제하면 변수를 출력하지 않아 PC 값(폴백)을 따름 */
  mk.opt = function (it, ctx) {
    var last = it.def;
    var inner = mk[it.type](it, { commit: function (v) { last = v; ctx.commit(v); } });
    var chk = h('input', { type: 'checkbox' });
    var box = h('div', { style: 'margin-top:6px' }, [inner.el]);
    function enable(on) { box.style.opacity = on ? '1' : '.4'; box.style.pointerEvents = on ? 'auto' : 'none'; }
    chk.onchange = function () {
      if (chk.checked) { inner.set(last); ctx.commit(last); enable(true); }
      else { ctx.commit(''); enable(false); }
    };
    return {
      el: h('div', {}, [h('label', { className: 'ck' }, [chk, h('span', { text: '사용 (해제하면 PC 값을 따름)' })]), box]),
      set: function (v) {
        if (v === '') { chk.checked = false; enable(false); inner.set(last); }
        else { chk.checked = true; last = v; enable(true); inner.set(v); }
      }
    };
  };

  function buildItem(it) {
    var ctx = { commit: function (v) { setStyle(it.v, v, true); } };
    var c = mk[it.optional ? 'opt' : it.type](it, ctx);
    var rb = h('button', { type: 'button', className: 'rbtn', title: '실행 시점 값으로 되돌리기', text: '↺' });
    var cls = 'item' + (it.det ? ' detOnly' : '') + (it.mode === 'auto' ? ' autoOnly' : '') + (it.mode === 'fixed' ? ' fixedOnly' : '');
    var wrap = h('div', { className: cls, 'data-search': (it.label + ' ' + it.v).toLowerCase() }, [
      h('div', { className: 'ihead' }, [
        h('div', {}, [h('span', { className: 'lbl', text: it.label }), h('span', { className: 'dot', title: '변경됨' }), h('span', { className: 'vn', text: it.v })]),
        rb
      ]),
      c.el
    ]);
    controls[it.v] = { set: c.set, wrap: wrap };
    c.set(state.styles[it.v]);
    rb.onclick = function () { var s = state.snap[it.v]; setStyle(it.v, s, true); c.set(s); };
    return wrap;
  }

  /* ───────── 레이아웃 조립 ───────── */
  var app = pDoc.getElementById('app'), modeSel = null;
  statusEl = h('span', { className: 'status', text: '초기화 중…' });
  var filterIn = h('input', { type: 'search', className: 'inp', placeholder: '항목 검색 (이름 / 변수명)', style: 'width:220px' });
  var themeSel = h('select', { className: 'inp', style: 'width:110px' }, [h('option', { value: 'dark', text: '다크모드' }), h('option', { value: 'light', text: '라이트모드' })]);
  var resetAllBtn = h('button', { type: 'button', className: 'btn', text: '전체 복구' });
  app.appendChild(h('header', { className: 'top' }, [
    h('div', { className: 'trow' }, [h('h3', { text: '메뉴바 대시보드 2.0' }), h('div', { className: 'row', style: 'width:auto' }, [filterIn, themeSel, resetAllBtn])]),
    statusEl
  ]));
  var main = h('main', { className: 'main' }); app.appendChild(main);

  function section(title, color, bodyKids, extraClass) {
    var body = h('div', { className: 'sbody' }, bodyKids);
    var sec = h('section', { className: 'sec' + (extraClass ? ' ' + extraClass : '') }, [h('details', { open: true }, [h('summary', { text: title, style: color ? 'color:' + color : '' }), body])]);
    return { sec: sec, body: body };
  }
  GROUPS.forEach(function (g) {
    var kids = [];
    if (g.mode) {
      modeSel = h('select', { className: 'inp' }, [
        h('option', { value: 'common', text: '공통 적용 (심플형 값을 상세형에도 동기화)' }),
        h('option', { value: 'custom', text: '개별 커스텀 (심플형/상세형 독립 설정)' })
      ]);
      kids.push(h('div', { className: 'item' }, [h('div', { className: 'lbl', text: '하위메뉴 서식 적용 방식', style: 'margin-bottom:6px' }), modeSel]));
    }
    g.items.forEach(function (it) { kids.push(buildItem(it)); });
    main.appendChild(section(g.title, '', kids, 'styleSec').sec);
  });

  /* ── 폼 헬퍼 ── */
  function fld(label, el) { return h('div', { className: 'fld' }, [h('div', { className: 'lbl', text: label }), el]); }
  function tin(obj, key, ph) {
    var e = h('input', { type: 'text', className: 'inp', placeholder: ph || '', value: str(obj[key]) });
    e.oninput = function () { obj[key] = e.value; rebuild(); };
    return e;
  }
  function sel(obj, key, opts, after) {
    var s = h('select', { className: 'inp' });
    Object.keys(opts).forEach(function (k) { s.appendChild(h('option', { value: k, text: opts[k] })); });
    s.value = obj[key];
    s.onchange = function () { obj[key] = s.value; if (after) after(); rebuild(); };
    return s;
  }
  function toggle(label, obj, key, after) {
    var i = h('input', { type: 'checkbox' }); i.checked = !!obj[key];
    i.onchange = function () { obj[key] = i.checked; if (after) after(); rebuild(); };
    return h('label', { className: 'tog' }, [i, h('span', { className: 'sw' }), h('span', { className: 'tl', text: label })]);
  }
  function numRange(label, obj, key, min, max, step) {
    var r = h('input', { type: 'range', className: 'rng' }); r.min = min; r.max = max; r.step = step || 1; r.value = obj[key];
    var n = h('input', { type: 'number', className: 'inp num' }); n.value = obj[key];
    r.oninput = function () { n.value = r.value; obj[key] = +r.value; rebuild(); };
    n.oninput = function () { if (n.value === '' || isNaN(+n.value)) return; r.value = n.value; obj[key] = +n.value; rebuild(); };
    return fld(label, h('div', { className: 'row' }, [r, n]));
  }
  function move(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function ctrlBtns(arr, i, rerender) {
    return h('span', { className: 'cbtns' }, [
      h('button', { type: 'button', className: 'rbtn', text: '↑', disabled: i === 0, onclick: function () { move(arr, i, -1); rerender(); rebuild(); } }),
      h('button', { type: 'button', className: 'rbtn', text: '↓', disabled: i === arr.length - 1, onclick: function () { move(arr, i, 1); rerender(); rebuild(); } }),
      h('button', { type: 'button', className: 'rbtn danger', text: '삭제', onclick: function () { arr.splice(i, 1); rerender(); rebuild(); } })
    ]);
  }
  function parseFaClass(s) { var m = s.match(/class\s*=\s*["']([^"']+)["']/); return (m ? m[1] : s).trim(); }
  function colorOverride(icon, key, label, gvar) {
    var chk = h('input', { type: 'checkbox' }); chk.checked = !!icon[key];
    var chip = h('input', { type: 'color', className: 'chip' });
    chip.value = icon[key] || (parseColor(state.styles[gvar]) || {}).hex || '#000000'; chip.disabled = !icon[key];
    chk.onchange = function () { if (chk.checked) { icon[key] = chip.value; chip.disabled = false; } else { delete icon[key]; chip.disabled = true; } rebuild(); };
    chip.oninput = function () { icon[key] = chip.value; rebuild(); };
    return h('label', { className: 'ck' }, [chk, h('span', { text: label + ' 개별 지정 (해제 시 글로벌 색 사용)' }), chip]);
  }
  function applyDdMode() { pDoc.body.classList.toggle('ddAuto', state.nav.detailedWidthMode === 'auto'); }

  /* ── 8·9 섹션 ── */
  var logoSec = section('8. 로고 / 헤더 / 스크롤', '#10b981', [h('div', { id: 'logoBody', style: 'display:flex;flex-direction:column;gap:10px' })]);
  var searchSec = section('9. 검색 / 모바일 / 전역 옵션', '#f43f5e', [h('div', { id: 'searchBody', style: 'display:flex;flex-direction:column;gap:10px' })]);
  var menuSec = section('10. 대메뉴 / 하위메뉴 빌더', '#eab308', [
    h('div', { id: 'menuArea' }),
    h('button', { type: 'button', className: 'btn dash', text: '+ 대메뉴 추가', onclick: function () {
      state.nav.menuItems.push({ label: '새메뉴', url: '#', target: '_self', children: [] }); renderMenu(); rebuild();
    } })
  ]);
  var ctaSec = section('11. 우측 CTA 버튼 빌더', '#8b5cf6', [
    h('div', { id: 'ctaArea' }),
    h('button', { type: 'button', className: 'btn dash', text: '+ CTA 버튼 추가', onclick: function () {
      state.nav.ctaButtons.push({ label: '새버튼', url: '#', target: '_self', variant: 'solid', showOnMobileBar: false }); renderCta(); rebuild();
    } })
  ]);
  [logoSec, searchSec, menuSec, ctaSec].forEach(function (s) { main.appendChild(s.sec); });

  function renderSettings() {
    var d = state.nav, L = pDoc.getElementById('logoBody'), S2 = pDoc.getElementById('searchBody');
    L.textContent = ''; S2.textContent = '';
    [
      toggle('스크롤 시 헤더 하단 그림자 활성화', d, 'useHeaderShadow'),
      toggle('스크롤 효과 사용 (scrollEffect)', d, 'scrollEffect'),
      numRange('스크롤 효과 임계값 (px)', d, 'scrollThreshold', 0, 300, 1),
      toggle('고정 헤더 높이만큼 본문 상단 여백 보정 (offsetBody)', d, 'offsetBody'),
      fld('로고 이미지 URL (PC 기본)', tin(d.logo, 'url', '로고 이미지 URL')),
      fld('모바일 로고 URL (비우면 PC 로고와 동일)', tin(d.logo, 'mobileUrl', '비워 두면 PC 로고 사용')),
      fld('로고 Alt (대체 텍스트)', tin(d.logo, 'alt', 'Alt')),
      fld('로고 클릭 링크', tin(d.logo, 'link', '/'))
    ].forEach(function (e) { L.appendChild(e); });
    [
      fld('우피 검색 플랜', sel(d, 'oopyPlan', { standard: '일반 플랜 (.search-button)', pro: '프로 플랜 (.xi-search)' })),
      toggle('PC/모바일 검색 기능 활성화', d, 'useSearch'),
      toggle('기존 노션 상단바 숨김 (겹침 방지)', d, 'hideNotionTopbar'),
      toggle('모바일 패널 내 검색 버튼 노출', d, 'showMobileSearchBtn'),
      fld('검색 버튼 배치 (CTA 기준)', sel(d, 'searchPosition', { right: '우측 (아래쪽)', left: '좌측 (위쪽)' })),
      numRange('모바일 햄버거 전환 시점 (px)', d, 'mobileBreakpoint', 480, 1600, 1),
      toggle('모바일 하위메뉴 설명글 노출', d, 'showMobileDesc'),
      toggle('모바일: 대메뉴를 열면 다른 대메뉴 자동 닫기 (mobileAccordion)', d, 'mobileAccordion'),
      toggle('화살표 회전 애니메이션 (arrowAnimation)', d, 'arrowAnimation'),
      toggle('화살표 기본 노출 (showArrowDefault)', d, 'showArrowDefault'),
      fld('하위메뉴 기본 스타일 (새 항목에 적용)', sel(d, 'defaultDropdownStyle', { detailed: '상세형', simple: '심플형' })),
      fld('상세형 하위메뉴 너비 방식 (detailedWidthMode)', sel(d, 'detailedWidthMode', { fixed: '고정 너비', auto: '내용(텍스트 길이)에 맞춤' }, applyDdMode)),
      fld('모바일 CTA 버튼 배열', sel(d, 'mobileCtaLayout', { vertical: '세로 배치 (위아래)', horizontal: '가로 배치 (그리드)' }, renderSettings)),
      d.mobileCtaLayout === 'horizontal' ? numRange('가로 배치 분할 수 (1~10열)', d, 'mobileCtaGridCols', 1, 10, 1) : null
    ].forEach(function (e) { if (e) S2.appendChild(e); });
    applyDdMode();
  }

  /* ── 대메뉴/하위메뉴 빌더 ── */
  var newChild = function () { return { title: '새메뉴', url: '#', target: '_self', desc: '', icon: { type: 'none', value: '' } }; };
  function childBox(item, c, ci) {
    var det = item.dropdownStyle === 'detailed';
    var parts = [
      h('div', { className: 'bhead' }, [h('span', { className: 'mut', text: '하위 ' + (ci + 1) }), ctrlBtns(item.children, ci, renderMenu)]),
      h('div', { className: 'row2' }, [tin(c, 'title', '제목'), tin(c, 'url', 'URL'), sel(c, 'target', TARGETS)])
    ];
    if (det) {
      parts.push(h('div', { style: 'margin-bottom:8px' }, [tin(c, 'desc', '설명 (비우면 미표시)')]));
      var typeSel = h('select', { className: 'inp', style: 'max-width:130px' }, [
        h('option', { value: 'none', text: '아이콘 없음' }), h('option', { value: 'fa', text: '폰트어썸' }), h('option', { value: 'image', text: '이미지 URL' })
      ]);
      typeSel.value = c.icon.type;
      typeSel.onchange = function () { c.icon.type = typeSel.value; renderMenu(); rebuild(); };
      var row = [typeSel];
      if (c.icon.type !== 'none') {
        var valIn = h('input', { type: 'text', className: 'inp', value: c.icon.value, placeholder: c.icon.type === 'fa' ? 'fa-solid fa-star (태그 전체 붙여넣기 시 자동 추출)' : '이미지 URL' });
        valIn.oninput = function () {
          var v = valIn.value;
          if (c.icon.type === 'fa' && /class\s*=/.test(v)) { v = parseFaClass(v); valIn.value = v; }
          c.icon.value = v; rebuild();
        };
        row.push(valIn);
      }
      parts.push(h('div', { className: 'row2' }, row));
      if (c.icon.type === 'fa') {
        parts.push(h('div', { className: 'row2' }, [
          colorOverride(c.icon, 'color', '기본색', '--dropdownIconColor_e11'),
          colorOverride(c.icon, 'hoverColor', '호버색', '--dropdownIconHoverColor_e11h')
        ]));
      }
    }
    return h('div', { className: 'sub' }, parts);
  }
  function menuBox(item, i) {
    var cur = item.children.length ? item.dropdownStyle : 'none';
    var styleSel = h('select', { className: 'inp' }, [
      h('option', { value: 'none', text: '하위메뉴 없음' }), h('option', { value: 'detailed', text: '상세 하위메뉴' }), h('option', { value: 'simple', text: '심플 하위메뉴' })
    ]);
    styleSel.value = cur;
    styleSel.onchange = function () {
      var v = styleSel.value;
      if (v === 'none') {
        if (item.children.length && !popup.confirm('하위메뉴 ' + item.children.length + '개가 삭제됩니다. 계속할까요?')) { styleSel.value = cur; return; }
        item.children = []; delete item.dropdownStyle;
      } else { item.dropdownStyle = v; if (!item.children.length) item.children.push(newChild()); }
      renderMenu(); rebuild();
    };
    var row2 = [styleSel, sel(item, 'target', TARGETS)];
    if (item.children.length) {
      var arrowSel = h('select', { className: 'inp' }, [h('option', { value: '', text: '화살표: 전역 설정' }), h('option', { value: 'true', text: '화살표: 표시' }), h('option', { value: 'false', text: '화살표: 숨김' })]);
      arrowSel.value = typeof item.showArrow === 'boolean' ? String(item.showArrow) : '';
      arrowSel.onchange = function () { if (arrowSel.value === '') delete item.showArrow; else item.showArrow = arrowSel.value === 'true'; rebuild(); };
      row2.push(arrowSel);
    }
    var kids = item.children.map(function (c, ci) { return childBox(item, c, ci); });
    return h('div', { className: 'box' }, [
      h('div', { className: 'bhead' }, [h('b', { className: 'c-y', text: '대메뉴 ' + (i + 1) }), ctrlBtns(state.nav.menuItems, i, renderMenu)]),
      h('div', { className: 'row2' }, [tin(item, 'label', '이름'), tin(item, 'url', 'URL (하위메뉴가 있으면 보통 #)')]),
      h('div', { className: 'row2' }, row2),
      kids.length ? h('div', { className: 'subs' }, kids) : null,
      kids.length ? h('button', { type: 'button', className: 'btn dash', text: '+ 하위 항목', onclick: function () { item.children.push(newChild()); renderMenu(); rebuild(); } }) : null
    ]);
  }
  function renderMenu() {
    var area = pDoc.getElementById('menuArea'); area.textContent = '';
    if (!state.nav.menuItems.length) area.appendChild(h('div', { className: 'mut', text: '대메뉴가 없습니다.', style: 'margin-bottom:8px' }));
    state.nav.menuItems.forEach(function (item, i) { area.appendChild(menuBox(item, i)); });
  }
  function renderCta() {
    var area = pDoc.getElementById('ctaArea'); area.textContent = '';
    if (!state.nav.ctaButtons.length) area.appendChild(h('div', { className: 'mut', text: 'CTA 버튼이 없습니다.', style: 'margin-bottom:8px' }));
    state.nav.ctaButtons.forEach(function (b, i) {
      area.appendChild(h('div', { className: 'box' }, [
        h('div', { className: 'bhead' }, [h('b', { className: 'c-p', text: 'CTA ' + (i + 1) }), ctrlBtns(state.nav.ctaButtons, i, renderCta)]),
        h('div', { className: 'row2' }, [tin(b, 'label', '이름'), tin(b, 'url', 'URL')]),
        h('div', { className: 'row2' }, [sel(b, 'variant', { solid: '채우기 (solid)', outline: '테두리 (outline)' }), sel(b, 'target', TARGETS), toggle('모바일 상단바 노출', b, 'showOnMobileBar')])
      ]));
    });
  }

  /* ───────── 내보내기 ───────── */
  var exportBox = h('textarea', { spellcheck: false });
  var warnBox = h('div');
  var exportArea = h('section', { className: 'xa' }, [
    h('div', { className: 'lbl', text: '최종 통합 코드', style: 'margin-bottom:8px' }), warnBox, exportBox,
    h('div', { className: 'row', style: 'margin-top:10px' }, [
      h('button', { type: 'button', className: 'btn pri', text: '기본 복사', onclick: function () { exportBox.value = buildExport(false); copyText(exportBox.value, '복사되었습니다.'); } }),
      h('button', { type: 'button', className: 'btn sec2', text: '압축 복사', onclick: function () { exportBox.value = buildExport(true); copyText(exportBox.value, '압축 코드가 복사되었습니다.'); } })
    ])
  ]);
  var footer = h('footer', { className: 'foot' }, [h('button', { type: 'button', className: 'btn exp', text: '코드 출력하기', onclick: function () {
    exportBox.value = buildExport(false);
    var w = validate(); warnBox.textContent = '';
    if (w.length) warnBox.appendChild(h('div', { className: 'warn', text: '확인 필요: ' + w.join(' / ') }));
    exportArea.style.display = 'block'; exportArea.scrollIntoView({ behavior: 'smooth' });
  } })]);
  app.appendChild(exportArea); app.appendChild(footer);

  function buildExport(min) {
    var css;
    if (min) {
      css = '<style>:root{' + Object.keys(state.styles).filter(function (k) { return state.styles[k] !== ''; }).map(function (k) { return k + ':' + state.styles[k] + ';'; }).join('') + '}</style>';
    } else {
      var out = ['<style>', '  :root {'];
      GROUPS.forEach(function (g) {
        out.push('    /* ── ' + g.title + ' ── */');
        g.items.forEach(function (it) {
          if (state.styles[it.v] === '') return;
          out.push('    ' + it.v + ': ' + state.styles[it.v] + '; /* ' + it.label + ' */');
        });
      });
      out.push('  }', '</style>'); css = out.join('\n');
    }
    var json = JSON.stringify(cleanNav(), null, min ? 0 : 4).replace(/<\//g, '<\\/');
    var js = min ? '<script>window.efcMenubarConfig=' + json + ';</scr' + 'ipt>' : '<script>\n  window.efcMenubarConfig = ' + json + ';\n</scr' + 'ipt>';
    return css + (min ? '' : '\n\n') + js;
  }
  function validate() {
    var w = [], n = cleanNav();
    if (!n.logo.url) w.push('로고 URL이 비어 있습니다');
    n.menuItems.forEach(function (m, i) {
      if (!m.label) w.push('대메뉴 ' + (i + 1) + ' 이름 없음');
      if (!m.children.length && m.url === '#') w.push('대메뉴 "' + m.label + '"는 하위메뉴도 링크도 없습니다');
      m.children.forEach(function (c, j) { if (!c.title) w.push('대메뉴 ' + (i + 1) + ' 하위 ' + (j + 1) + ' 제목 없음'); });
    });
    n.ctaButtons.forEach(function (b, i) { if (!b.label) w.push('CTA ' + (i + 1) + ' 이름 없음'); });
    var mn = parseFloat(state.styles['--dropdownDetailedMinWidth_e22']), mx = parseFloat(state.styles['--dropdownDetailedMaxWidth_e23']);
    if (n.detailedWidthMode === 'auto' && mn > mx) w.push('상세형 최소 너비가 최대 너비보다 큽니다');
    return w;
  }
  function copyText(text, okMsg) {
    function fallback() {
      var t = pDoc.createElement('textarea'); t.value = text; pDoc.body.appendChild(t); t.select();
      try { pDoc.execCommand('copy'); setStatus(okMsg); } catch (e) { setStatus('복사 실패: 텍스트 영역에서 직접 복사하세요.', true); }
      pDoc.body.removeChild(t);
    }
    var cb = popup.navigator && popup.navigator.clipboard;
    if (cb && cb.writeText) cb.writeText(text).then(function () { setStatus(okMsg); }, fallback); else fallback();
  }

  /* ───────── 상단 컨트롤 ───────── */
  function setMode(common, doSync) {
    state.commonMode = common; pDoc.body.classList.toggle('commonMode', common); modeSel.value = common ? 'common' : 'custom';
    if (common && doSync) Object.keys(SYNC).forEach(function (k) { var t = SYNC[k]; setStyle(t, state.styles[k], false); controls[t].set(state.styles[k]); });
  }
  modeSel.onchange = function () { setMode(modeSel.value === 'common', true); };
  themeSel.onchange = function () { pDoc.documentElement.setAttribute('data-theme', themeSel.value); };
  filterIn.oninput = function () {
    var q = filterIn.value.trim().toLowerCase();
    pDoc.querySelectorAll('.item[data-search]').forEach(function (el) { el.classList.toggle('fx', !!q && el.getAttribute('data-search').indexOf(q) < 0); });
    pDoc.querySelectorAll('.sec.styleSec').forEach(function (s) {
      var any = s.querySelector('.item[data-search]:not(.fx)'); s.style.display = any ? '' : 'none';
      if (q && any) s.querySelector('details').open = true;
    });
  };
  resetAllBtn.onclick = function () {
    if (!popup.confirm('모든 디자인 및 설정(메뉴/버튼)을 실행 시점 상태로 복구하시겠습니까?')) return;
    Object.keys(state.snap).forEach(function (k) { state.styles[k] = state.snap[k]; controls[k].set(state.snap[k]); markDirty(k); });
    applyCss();
    state.nav = clone(state.navSnap);
    renderSettings(); renderMenu(); renderCta(); rebuild();
  };
  popup.addEventListener('pagehide', function () {
    var s = oDoc.getElementById(STYLE_ID); if (s) s.remove();
    try { if (typeof window.efc_rebuildNav_v2a === 'function') window.efc_rebuildNav_v2a(cleanNav(state.navSnap)); } catch (e) { /* 무시 */ }
  });

  /* ───────── 시작 ───────── */
  var differs = Object.keys(SYNC).some(function (k) { return state.styles[k] !== state.styles[SYNC[k]]; });
  setMode(!differs, false);
  renderSettings(); renderMenu(); renderCta(); applyCss();
  if (typeof window.efc_rebuildNav_v2a === 'function' && !/arrowAnimation/.test(String(window.efc_rebuildNav_v2a))) {
    engineWarn = ' · 주의: 현재 엔진이 신규 옵션(모바일 아코디언, 화살표 애니메이션, 내용 맞춤 너비, 모바일 로고)을 지원하지 않는 버전입니다';
  }
  if (!hasSrc) setStatus('window.efcMenubarConfig 가 없어 기본값으로 시작합니다. 메뉴바 코드가 먼저 로드되어야 합니다.', true);
  else setStatus('미리보기 연결 중…');
  rebuild();
}();