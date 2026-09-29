// =========================================================
// call-cta-dashboard.js v1.0.0
// call-cta 라이브 편집 대시보드 (브라우저 콘솔에 붙여넣어 쓰는 페이지 안 패널)
// 의존성: core.js, call-cta.js(v1.0.0 이상)가 먼저 로드되어 있어야 한다.
// ---------------------------------------------------------
// [개요]
// - 페이지에 있는 call-cta 인스턴스를 목록에서 골라, 엔진의 모든 설정값을
//   화면에서 실시간으로 조정하는 도구이다.
// - 조정한 결과는 이 화면에서만 보이는 미리보기다. 노션에 영구 반영하려면
//   '최종 토큰'을 복사해 노션 콜아웃의 토큰 줄에 붙여넣어야 한다.
// - 대시보드는 엔진의 공개 API(window.CallCtaEngine)만 사용한다.
//
// ---------------------------------------------------------
// [사용법]
// 1) 새로고침 후 콘솔에 core.js -> button.js -> call-cta.js -> 이 파일 순서로 붙여넣는다.
// 2) 우측 상단에 패널이 뜬다. 인스턴스 목록에서 하나를 고르면 페이지에 빨간 테두리가 표시된다.
// 3) 항목을 조정하면 화면에 바로 반영된다.
// 4) 맨 아래 '최종 토큰'의 '토큰 복사'를 눌러 노션 콜아웃의 토큰 줄을 교체하고 새로고침한다.
// 5) '—' 버튼은 최소화(우측 상단 🎛️ 버튼으로 다시 열기), '대시보드 완전히 닫기'는 패널 제거이다.
//    다시 붙여넣으면 이전 패널을 자동으로 교체하고 새로 연다.
//
// ---------------------------------------------------------
// [화면 구성]
// ■ 상단 고정 영역
//  - 제목: 끌어서 패널 이동
//  - 테마 토글(라이트/다크) - 전체 초기화 - 최소화 (선택한 테마는 기억된다)
//  - 검색창: 항목 이름, 그룹 이름, 키워드(글자, 굵기, 여백, 색상, 높이 등)로 설정 항목을 걸러 낸다.
//  - 저장바: 임시저장 / 슬롯 목록 / 가져오기 / 전체 출력 / 기본값 보기(무효화) / 👁 / 저장본 자동 적용 스위치
//  - 상태 문구: 동작 결과를 잠시 보여 준다.
// ■ 본문
//  - 인스턴스 목록: 번호, 배치 아이콘(↕️ 위/아래 배치, ↔️ 좌/우 배치), 첫 제목 텍스트(2줄까지),
//    저장본 개수(💾n). '새로고침' 버튼으로 목록을 다시 읽는다.
//  - 전체 인스턴스에 일괄 적용 스위치
//  - 선택한 인스턴스의 설정 섹션
//     📐 크기 · 배치       최소 높이(PC/모바일), 너비, 정렬 기준 폭, 텍스트 정렬
//     📏 여백 · 모서리     상하 여백(PC/모바일)/좌우 여백을 한 줄로, 콜아웃 모서리/이미지 모서리
//     🎨 박스 배경         박스 배경(색 채우기/투명), 배경색
//     🖼️ 이미지 오버레이   오버레이 사용 스위치, 색상+투명도, 방향, 시작/끝 지점
//     🔤 텍스트 스타일     타이틀 1~4, 본문 각각의 글자 크기(PC/모바일)/굵기를 한 줄로, 글자 색상
//     📋 최종 토큰         선택한 인스턴스의 토큰과 복사 버튼
// ■ 패널 폭은 기본 520px이며, 우하단 핸들로 가로 크기를 조절할 수 있다.
//
// ---------------------------------------------------------
// [입력 컨트롤 규칙]
// - 숫자 항목: 슬라이더와 숫자 입력이 연동된다. (화면 조절 범위는 엔진 허용 범위보다 좁다)
// - 글자 굵기: 슬라이더와 오른쪽 드롭다운(100~900)이 서로 연동된다.
// - 색상: '컬러칩 - 투명도 슬라이더 - 컬러코드' 한 줄
//     칩을 고르면 불투명일 때 HEX, 투명도가 있으면 rgba로 코드 칸이 바뀐다.
//     투명도 슬라이더를 움직이면 코드 칸이 rgba()로 바뀐다.
//     코드를 직접 입력하면 검증한다: rgba/HEX(3,4,6,8자리)/hsl/색상 이름/transparent만 허용.
//     잘못된 값은 빨간 테두리로 표시하고 적용하지 않으며, 입력창을 벗어나면 마지막 유효값으로 되돌린다.
// - 원본유지 스위치: 켜면 그 속성은 아무 것도 적용하지 않고 노션 원본을 그대로 둔다(토큰에도 적히지 않음).
//     끄면 마지막에 쓰던 값에서 시작하고, 값이 없으면 시작값(fallback)에서 시작한다.
//     시작값: H1 34px/700, H2 28px/700, H3 22px/600, H4 18px/600, 본문 16px/400,
//             모바일 크기는 PC의 75%, 글자 색 #000000, 배경색 #004fc7
//     원본유지가 기본으로 켜져 있는 항목: 글자 크기/굵기/색상, 배경색, 모바일 최소 높이(PC와 동일)
// - 항목별 ↺ 버튼: 그 항목만 '처음 열었을 때의 값'으로 되돌린다.
//
// ---------------------------------------------------------
// [기능별 동작]
// ■ 기본값의 기준
//   기본값 = 페이지를 처음 열었을 때의 값, 즉 노션에 적힌 토큰 그대로의 값이다.
//   (저장본 자동 적용이 일어나기 전의 값)
// ■ 전체 초기화 (상단)
//   확인 후, 일괄 적용이 꺼져 있으면 선택한 인스턴스만, 켜져 있으면 모든 인스턴스를
//   각자의 기본값으로 되돌린다. 패널은 한 번만 다시 그린다.
// ■ 기본값 보기(무효화)
//   확인 후 저장본 자동 적용을 끄고 모든 인스턴스를 기본값으로 되돌린다. 저장 슬롯은 지우지 않는다.
//   자동 적용을 다시 쓰려면 '저장본 자동 적용' 스위치를 켠다.
// ■ 👁 아이콘 (기본값 보기 오른쪽)
//   누르고 있는 동안만 모든 인스턴스가 기본값으로 보이고, 손을 떼면 현재 설정으로 돌아온다.
//   마우스, 터치, 키보드(Space/Enter)로 동작하며 미리보기 중에는 패널 테두리가 노란색이다.
// ■ 일괄 적용
//   켤 때 확인 후, 선택한 인스턴스의 값 전체를 모든 인스턴스에 복사한다.
//   켜져 있는 동안의 변경도 모든 인스턴스에 그대로 복사된다.
//   이때 임시저장은 모든 인스턴스를 각자의 슬롯에 함께 저장하고, 전체 초기화도 전체를 대상으로 한다.
// ■ 임시저장 / 슬롯 목록
//   선택한 인스턴스의 현재 설정을 새 슬롯에 저장한다(일괄 적용 중에는 모든 인스턴스가 각자의 슬롯에).
//   인스턴스당 최대 10개이며 초과하면 가장 오래된 슬롯을 자동 삭제하고 알려 준다.
//   슬롯 목록에서 불러오기/삭제를 할 수 있다.
//   노션 블록이 삭제·재생성되어 연결이 끊긴 저장본은 '연결 안 된 저장본'으로 따로 보여 주고 삭제할 수 있다.
// ■ 저장본 자동 적용 스위치
//   켜져 있으면 다음에 페이지를 열 때 인스턴스별 가장 최근 저장본을 자동 적용한다(엔진이 수행).
//   꺼져 있으면 노션 토큰 값을 그대로 쓴다.
// ■ 가져오기
//   이전에 복사한 토큰 또는 '전체 출력' 결과를 붙여넣으면 선택한 인스턴스에만 값을 채운다.
//   전체 출력을 붙여넣었을 때의 매칭 규칙:
//     1) 선택한 인스턴스의 제목과 일치하는 토큰 후보를 찾는다.
//     2) 후보가 여러 개면 번호(인스턴스 순번, 1부터)가 같은 것을 우선하고,
//        없으면 같은 제목 인스턴스들 중의 순서로 짝을 맞춘다.
//     3) 일치하는 제목이 없으면 붙여넣은 첫 번째 토큰을 쓴다.
//   일괄 적용이 켜져 있으면 채운 값이 모든 인스턴스에 복사된다.
// ■ 전체 출력
//   모든 인스턴스의 토큰을 한 번에 출력한다. 각 토큰 앞 줄에 '번호. 제목 텍스트'가 붙어
//   어느 인스턴스의 토큰인지 알 수 있다. 인스턴스 사이는 빈 줄로 구분한다.
// ■ 검색
//   입력하면 일치하는 항목만 남기고 섹션은 자동으로 펼친다. 지우면 원래대로 돌아온다.
//
// ---------------------------------------------------------
// [사용하는 저장소 키] (브라우저 localStorage)
// - call_cta_dash_theme_Q2tq      테마('dark' 또는 'light')
// - 저장 슬롯과 자동 적용 관련 키는 엔진(call-cta.js)이 관리한다.
//     call_cta_slots_Q2tq_v1, call_cta_autoapply_off_Q2tq
//
// ---------------------------------------------------------
// [사용하는 엔진 API]
// - CallCtaEngine.getAllInstances / getBlockId / getLayoutMode / getPreviewText
// - CallCtaEngine.applyConfig / normalizeParams / serializeParams / parseToken / extractEntries
// - CallCtaEngine.ColorUtil / Slots / OL_DEFAULT / LEVEL_FALLBACK / MOBILE_SCALE
//
// ---------------------------------------------------------
// [알려진 제한]
// - 이 도구의 조정 결과는 그 브라우저 화면에서만 보인다. 방문자에게 보이게 하려면 토큰을 노션에 적어야 한다.
// - 임시저장과 자동 적용은 그 브라우저(localStorage)에서만 유효하며, 저장소를 쓸 수 없으면 저장이 실패한다.
// - 일괄 적용은 선택한 인스턴스의 값 전체를 다른 인스턴스에 덮어쓴다(인스턴스마다 다른 값은 사라진다).
//   원래대로 되돌리려면 전체 초기화를 쓴다.
// - 노션이 화면을 다시 그리면 인스턴스가 늘거나 줄 수 있다. 이때는 '새로고침' 버튼으로 목록을 다시 읽는다.
// - 모바일 값(모바일 최소 높이, 상하 여백 모바일, 글자 크기 모바일)은 브라우저 창 폭이
//   768px 미만일 때만 화면에서 확인할 수 있다.
// - 위/아래 배치에서는 박스 배경이 이미지 배경에 가려지고, 좌/우 배치에서는 오버레이가 적용되지 않는다.
//   해당 항목을 바꿔도 화면 변화가 없는 것은 오류가 아니다.
// - 색상 코드 검증은 브라우저 CSS.supports에 의존하며, 쉼표가 들어간 색상 토큰(rgba 등)은
//   core.js의 토큰 분리 방식에 의존한다. 오버레이 토큰으로 동작을 확인했고, 배경색과 글자색
//   토큰은 별도 확인이 필요하다.
// - 팝업창이 아니라 페이지 안 패널이므로 화면이 좁으면 콘텐츠를 가릴 수 있다. 헤더를 끌어 옮기거나
//   최소화해서 쓴다.
// =========================================================


(function () {
  'use strict';
  const E = window.CallCtaEngine;
  if (!E || !E.Slots || !E.ColorUtil || !E.applyConfig) {
    console.error('[call-cta-dashboard] call-cta.js v1.0.0 이상이 먼저 로드되어야 합니다.');
    return;
  }
  const CU = E.ColorUtil;
  const LEVELS = E.TEXT_LEVELS;
  const LEVEL_LABEL = { H1: '타이틀 1 (H1)', H2: '타이틀 2 (H2)', H3: '타이틀 3 (H3)', H4: '타이틀 4 (H4)', BD: '본문 텍스트' };
  const MODE_LABEL = { STACK: '위/아래 배치 (이미지=배경)', SIDE: '좌/우 배치 (컬럼)' };
  const THEME_KEY = 'call_cta_dash_theme_Q2tq';

  ['ccd-root', 'ccd-highlight', 'ccd-toggle', 'ccd-style',
   'call-cta-dashboard-root', 'call-cta-dashboard-highlight', 'call-cta-dashboard-toggle'].forEach(id => {
    const el = document.getElementById(id); if (el) el.remove();
  });

  // ---------- 유틸 ----------
  const clone = o => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
  const getPath = (o, p) => p.reduce((a, k) => (a == null ? a : a[k]), o);
  const setPath = (o, p, v) => { let t = o; for (let i = 0; i < p.length - 1; i++) t = t[p[i]]; t[p[p.length - 1]] = v; };
  const normTitle = s => String(s || '').replace(/\s+/g, ' ').trim();
  const h = (tag, attrs = {}, kids = []) => {
    const el = document.createElement(tag);
    for (const k in attrs) {
      const v = attrs[k];
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    (Array.isArray(kids) ? kids : [kids]).forEach(c => { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  };

  // ---------- 스타일 ----------
  const css = `
#ccd-root{--bg:#1e1e1e;--fg:#eee;--panel:#262626;--card:#2c2c2c;--border:#444;--muted:#9a9a9a;--accent:#2f6fed;--ok:#10b981;--danger:#ef4444;--input:#1a1a1a;
 position:fixed;top:16px;left:auto;width:520px;min-width:400px;max-width:96vw;max-height:90vh;display:none;flex-direction:column;
 background:var(--bg);color:var(--fg);font:12.5px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border-radius:10px;
 box-shadow:0 8px 30px rgba(0,0,0,.45);z-index:999999;resize:horizontal;overflow:hidden}
#ccd-root[data-theme=light]{--bg:#f6f6f7;--fg:#1f2937;--panel:#fff;--card:#fff;--border:#d1d5db;--muted:#6b7280;--input:#fff}
#ccd-root *{box-sizing:border-box}
#ccd-root.ccd-previewing{outline:3px solid #eab308}
.ccd-head{padding:10px 12px 8px;background:var(--panel);border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:8px;flex:0 0 auto}
.ccd-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ccd-title{font-weight:800;cursor:move;flex:1;user-select:none;color:var(--ok);font-size:14px}
.ccd-grp{display:flex;gap:6px;align-items:center}
.ccd-btn{background:var(--card);color:var(--fg);border:1px solid var(--border);border-radius:6px;padding:5px 9px;font-size:11.5px;cursor:pointer;white-space:nowrap}
.ccd-btn:hover{border-color:var(--accent)}
.ccd-btn.ccd-danger{color:var(--danger)}
.ccd-btn.ccd-primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
.ccd-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ccd-status{font-size:11px;color:var(--ok);min-height:14px}
.ccd-input{background:var(--input);color:var(--fg);border:1px solid var(--border);border-radius:6px;padding:5px 7px;font-size:12px;outline:none;min-width:0}
.ccd-search{width:100%}
.ccd-body{overflow-y:auto;padding:10px 12px;flex:1 1 auto;min-height:0}
.ccd-panel{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:8px}
.ccd-ta{width:100%;height:110px;background:#000;color:#10b981;border:1px solid var(--border);border-radius:6px;padding:6px;font-family:monospace;font-size:11px;resize:vertical}
.ccd-sec{border:1px solid var(--border);border-radius:8px;margin-bottom:10px;background:var(--panel)}
.ccd-sec>summary{cursor:pointer;font-weight:700;padding:9px 11px;color:#38bdf8;outline:none}
.ccd-secbody{padding:10px 11px;display:flex;flex-direction:column;gap:12px}
.ccd-row{display:flex;flex-wrap:wrap;gap:10px}
.ccd-row>.ccd-field{flex:1 1 140px;min-width:0}
.ccd-card{border:1px solid var(--border);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:10px;background:var(--card)}
.ccd-cardt{font-weight:700;color:var(--muted)}
.ccd-note{font-size:10.5px;color:var(--muted);line-height:1.4}
.ccd-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.ccd-fh{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:18px}
.ccd-fl{font-size:11px;color:var(--muted);font-weight:600}
.ccd-fr{display:flex;align-items:center;gap:6px}
.ccd-reset{background:none;border:none;color:var(--muted);cursor:pointer;padding:0 2px;font-size:13px}
.ccd-reset:hover{color:var(--ok)}
.ccd-ctl{display:flex;align-items:center;gap:6px}
.ccd-range{flex:1;min-width:40px;accent-color:var(--ok);cursor:pointer}
.ccd-num{width:54px;text-align:center}
.ccd-selw{width:64px}
.ccd-chip{width:34px;height:26px;padding:0;border:none;background:none;cursor:pointer;flex:0 0 auto}
.ccd-alab{width:36px;text-align:right;font-size:11px;color:var(--ok);flex:0 0 auto}
.ccd-code{width:150px;font-family:monospace;font-size:11px;flex:0 0 auto}
.ccd-err{border-color:var(--danger)!important;box-shadow:0 0 0 1px var(--danger)}
.ccd-off .ccd-ctl{opacity:.4}
.ccd-switch{display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:11px;color:var(--muted)}
.ccd-switch input{display:none}
.ccd-sl{width:30px;height:16px;background:#777;border-radius:16px;position:relative;transition:.15s;flex:0 0 auto}
.ccd-sl:after{content:'';position:absolute;left:2px;top:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:.15s}
.ccd-switch input:checked+.ccd-sl{background:var(--ok)}
.ccd-switch input:checked+.ccd-sl:after{left:16px}
.ccd-list{display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto;padding-right:2px}
.ccd-inst{flex:0 0 auto;display:flex;align-items:flex-start;gap:8px;text-align:left;padding:7px 9px;border-radius:6px;border:1px solid var(--border);min-height:36px;width:100%;background:var(--card);color:var(--fg);cursor:pointer}
.ccd-inst.on{background:var(--accent);border-color:var(--accent);color:#fff}
.ccd-inst .n{flex:0 0 auto;white-space:nowrap;opacity:.85;font-size:11.5px;padding-top:1px}
.ccd-inst .t{flex:1 1 auto;min-width:0;line-height:1.35;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ccd-inst .b{flex:0 0 auto;font-size:10.5px;opacity:.9}
.ccd-badge{padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;margin:10px 0;text-align:center;background:#88888833}
.ccd-eye{display:inline-flex;align-items:center;justify-content:center;width:30px;height:27px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--fg);cursor:pointer;user-select:none;touch-action:none}
.ccd-eye.on{background:#eab308;color:#000;border-color:#eab308}
.ccd-slot{display:flex;gap:6px;align-items:center;padding:6px 0;border-bottom:1px dashed var(--border)}
.ccd-slot span{flex:1;font-size:11.5px}
#ccd-highlight{position:fixed;pointer-events:none;z-index:999998;border:3px solid #ff3b3b;border-radius:4px;transition:all .12s ease;display:none}
#ccd-toggle{position:fixed;top:16px;right:16px;width:44px;height:44px;border-radius:50%;background:#2f6fed;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;z-index:999999;box-shadow:0 4px 14px rgba(0,0,0,.3)}
`;
  document.head.appendChild(h('style', { id: 'ccd-style', text: css }));

  // ---------- 상태 ----------
  const S = { box: null, bulk: false, preview: null };
  const cfg = () => S.box && S.box._callCtaConfig;
  const initCfg = () => S.box && S.box._callCtaInitialConfig;

  // ---------- 하이라이트 ----------
  const hl = h('div', { id: 'ccd-highlight' });
  document.body.appendChild(hl);
  const showHl = el => {
    if (!el || !el.isConnected) { hl.style.display = 'none'; return; }
    const r = el.getBoundingClientRect();
    Object.assign(hl.style, { display: 'block', top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' });
  };
  const hideHl = () => { hl.style.display = 'none'; };
  window.addEventListener('scroll', () => { if (S.box) showHl(S.box); }, true);
  window.addEventListener('resize', () => { if (S.box) showHl(S.box); });

  // ---------- 루트 / 토글 버튼 ----------
  const root = h('div', { id: 'ccd-root' });
  document.body.appendChild(root);
  const toggleBtn = h('div', { id: 'ccd-toggle', title: 'call-cta 대시보드 열기', text: '🎛️' });
  toggleBtn.style.display = 'none';
  document.body.appendChild(toggleBtn);

  const openDash = () => {
    root.style.display = 'flex'; toggleBtn.style.display = 'none';
    if (!root.style.left) root.style.left = Math.max(8, window.innerWidth - root.offsetWidth - 70) + 'px';
    if (S.box) showHl(S.box);
  };
  const closeDash = () => { root.style.display = 'none'; toggleBtn.style.display = 'flex'; hideHl(); };
  toggleBtn.addEventListener('click', openDash);

  // ---------- 상태 문구 ----------
  const statusEl = h('div', { class: 'ccd-status' });
  let statusTimer = null;
  const status = msg => {
    statusEl.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { if (statusEl.textContent === msg) statusEl.textContent = ''; }, 5000);
  };

  // ---------- 스위치 ----------
  const sw = (checked, onChange, text) => {
    const inp = h('input', { type: 'checkbox' });
    inp.checked = !!checked;
    inp.addEventListener('change', () => onChange(inp.checked));
    const lab = h('label', { class: 'ccd-switch' }, [inp, h('span', { class: 'ccd-sl' }), text ? h('span', { text }) : null]);
    return { el: lab, inp };
  };

  // ---------- 적용 / 커밋 ----------
  let tokenArea = null;
  const updateTokenOut = () => { if (tokenArea && cfg()) tokenArea.value = E.serializeParams(cfg()); };
  const syncBulk = () => {
    E.getAllInstances().forEach(b => { if (b !== S.box) E.applyConfig(b, clone(cfg())); });
  };
  const commit = () => {
    if (!S.box) return;
    E.applyConfig(S.box, cfg());
    if (S.bulk) syncBulk();
    showHl(S.box);
    updateTokenOut();
  };
  const set = (path, v) => { setPath(cfg(), path, v); commit(); };
  const resetPath = path => {
    let iv = getPath(initCfg(), path);
    if (iv === undefined) iv = getPath({ OL: E.OL_DEFAULT }, path);
    setPath(cfg(), path, clone(iv));
    commit(); buildEdit();
  };

  // ---------- 필드 컴포넌트 ----------
  const frame = (label, path, extra, kw) => {
    const el = h('div', { class: 'ccd-field', 'data-label': (label + ' ' + (kw || '')).toLowerCase() });
    const right = h('span', { class: 'ccd-fr' });
    if (extra) right.appendChild(extra);
    if (path) right.appendChild(h('button', { class: 'ccd-reset', title: '처음 값으로 되돌리기', text: '↺', onclick: () => resetPath(path) }));
    el.appendChild(h('div', { class: 'ccd-fh' }, [h('span', { class: 'ccd-fl', text: label }), right]));
    return el;
  };

  const numField = (label, path, o) => {
    const v = getPath(cfg(), path);
    const none = !!o.nullable && v === null;
    let last = none ? o.fallback : v;
    const range = h('input', { type: 'range', class: 'ccd-range', min: o.min, max: o.max, step: o.step });
    range.value = last;
    let side;
    if (o.weight) {
      side = h('select', { class: 'ccd-input ccd-selw' });
      for (let w = 100; w <= 900; w += 100) side.appendChild(h('option', { value: w, text: w }));
      side.value = String(Math.min(900, Math.max(100, Math.round(last / 100) * 100)));
    } else {
      side = h('input', { type: 'number', class: 'ccd-input ccd-num', min: o.min, max: o.max, step: o.step });
      side.value = last;
    }
    const push = n => { last = n; set(path, n); };
    range.addEventListener('input', () => {
      const n = parseFloat(range.value);
      side.value = o.weight ? String(Math.round(n / 100) * 100) : n;
      push(n);
    });
    if (o.weight) {
      side.addEventListener('change', () => { const n = parseInt(side.value, 10); range.value = n; push(n); });
    } else {
      side.addEventListener('input', () => {
        const n = parseFloat(side.value);
        if (!isNaN(n) && n >= o.min && n <= o.max) { range.value = n; push(n); }
      });
      side.addEventListener('change', () => {
        let n = parseFloat(side.value); if (isNaN(n)) n = last;
        n = Math.min(o.max, Math.max(o.min, n));
        side.value = n; range.value = n; push(n);
      });
    }
    let el;
    const setDisabled = d => { range.disabled = d; side.disabled = d; el.classList.toggle('ccd-off', d); };
    let swEl = null;
    if (o.nullable) {
      swEl = sw(none, checked => {
        if (checked) { set(path, null); setDisabled(true); }
        else { set(path, last); setDisabled(false); }
      }, '원본유지').el;
    }
    el = frame(label, path, swEl, o.kw);
    el.appendChild(h('div', { class: 'ccd-ctl' }, [range, side]));
    setDisabled(none);
    return el;
  };

  const selField = (label, path, opts, o = {}) => {
    let v = getPath(cfg(), path);
    if (v === null || v === undefined) v = '';
    const sel = h('select', { class: 'ccd-input' });
    opts.forEach(([val, txt]) => sel.appendChild(h('option', { value: val, text: txt })));
    sel.value = String(v);
    sel.addEventListener('change', () => set(path, (sel.value === '' && o.nullable) ? null : sel.value));
    const el = frame(label, path, null, o.kw);
    el.appendChild(sel);
    return el;
  };

  const colorField = (label, path, o) => {
    const v = getPath(cfg(), path);
    const none = !!o.nullable && (v === null || v === undefined);
    let last = none ? o.fallback : v;
    const chip = h('input', { type: 'color', class: 'ccd-chip', 'aria-label': '색상 선택' });
    const alpha = h('input', { type: 'range', class: 'ccd-range', min: 0, max: 100, step: 1, 'aria-label': '투명도' });
    const alab = h('span', { class: 'ccd-alab' });
    const code = h('input', { type: 'text', class: 'ccd-input ccd-code', spellcheck: 'false', placeholder: '원본유지', 'aria-label': '색상 코드' });
    const paint = str => {
      const c = CU.toRgba(str) || { r: 0, g: 0, b: 0, a: 1 };
      chip.value = CU.toHex(c);
      alpha.value = Math.round(c.a * 100);
      alab.textContent = Math.round(c.a * 100) + '%';
    };
    paint(last);
    code.value = none ? '' : last;
    const cur = () => Object.assign(CU.hexToRgb(chip.value), { a: alpha.value / 100 });
    chip.addEventListener('input', () => {
      const c = cur();
      const val = c.a >= 1 ? chip.value : CU.format(c);
      code.value = val; code.classList.remove('ccd-err'); last = val; set(path, val);
    });
    alpha.addEventListener('input', () => {
      alab.textContent = alpha.value + '%';
      const val = CU.format(cur());
      code.value = val; code.classList.remove('ccd-err'); last = val; set(path, val);
    });
    code.addEventListener('input', () => {
      const s = CU.normalize(code.value);
      if (CU.isValid(s)) { code.classList.remove('ccd-err'); paint(s); last = s; set(path, s); }
      else code.classList.add('ccd-err');
    });
    code.addEventListener('blur', () => {
      if (code.classList.contains('ccd-err')) { code.value = last; code.classList.remove('ccd-err'); }
    });
    let el;
    const setDisabled = d => {
      [chip, alpha, code].forEach(x => { x.disabled = d; });
      el.classList.toggle('ccd-off', d);
    };
    let swEl = null;
    if (o.nullable) {
      swEl = sw(none, checked => {
        if (checked) { set(path, null); code.value = ''; setDisabled(true); }
        else { paint(last); code.value = last; set(path, last); setDisabled(false); }
      }, o.noneLabel || '원본유지').el;
    }
    el = frame(label, path, swEl, o.kw);
    el.appendChild(h('div', { class: 'ccd-ctl' }, [chip, alpha, alab, code]));
    setDisabled(none);
    return el;
  };

  const row = (...fields) => h('div', { class: 'ccd-row' }, fields);
  const section = (title, color, kids) =>
    h('details', { class: 'ccd-sec', open: '', 'data-group': title.toLowerCase() }, [
      h('summary', { text: title, style: color ? 'color:' + color : '' }),
      h('div', { class: 'ccd-secbody' }, kids)
    ]);

  // ---------- 검색 ----------
  const searchInput = h('input', { type: 'text', class: 'ccd-input ccd-search', placeholder: '설정 검색 (예: 글자, 굵기, 여백, 색상)' });
  let editArea;
  const applySearch = () => {
    if (!editArea) return;
    const term = searchInput.value.trim().toLowerCase();
    editArea.querySelectorAll('.ccd-sec').forEach(sec => {
      const groupMatch = term && (sec.getAttribute('data-group') || '').includes(term);
      sec.querySelectorAll('.ccd-field').forEach(f => {
        const m = !term || groupMatch || (f.getAttribute('data-label') || '').includes(term);
        f.style.display = m ? '' : 'none';
      });
      sec.querySelectorAll('.ccd-note').forEach(n => { n.style.display = term ? 'none' : ''; });
      sec.querySelectorAll('.ccd-row, .ccd-card').forEach(g => {
        g.style.display = (!term || g.querySelector('.ccd-field:not([style*="display: none"])')) ? '' : 'none';
      });
      const any = !term || groupMatch || sec.querySelector('.ccd-field:not([style*="display: none"])');
      sec.style.display = any ? '' : 'none';
      if (term && any) sec.open = true;
    });
  };
  searchInput.addEventListener('input', applySearch);

  // ---------- 편집 패널 ----------
  const SZ_OPTS = [['SM', '작게 (SM)'], ['MD', '보통 (MD)'], ['LG', '크게 (LG)'], ['FULL', '전체 화면 (FULL)']];
  let modeBadge;

  function buildEdit() {
    const scroll = bodyEl.scrollTop;
    editArea.innerHTML = '';
    tokenArea = null;
    if (!S.box) { bodyEl.scrollTop = scroll; return; }
    const c = cfg();

    modeBadge = h('div', { class: 'ccd-badge', text: '현재 모드: ' + (MODE_LABEL[E.getLayoutMode(S.box)] || '') });
    editArea.appendChild(modeBadge);

    editArea.appendChild(section('📐 크기 · 배치', '', [
      row(
        selField('최소 높이 · PC (SZ)', ['SZ'], SZ_OPTS, { kw: '높이 크기' }),
        selField('최소 높이 · 모바일 (SZM)', ['SZM'], [['', 'PC와 동일']].concat(SZ_OPTS), { nullable: true, kw: '높이 모바일' })
      ),
      row(
        selField('너비 (WIDTH)', ['WIDTH'], [['FULL', '화면 끝까지'], ['BODY', '본문 폭']], { kw: '폭' }),
        selField('정렬 기준 폭 (AW)', ['AW'], [['CONTENT', '본문 폭 안'], ['BOX', '박스 전체 폭']], { kw: '정렬' }),
        selField('텍스트 정렬 (TA)', ['TA'], [['L', '왼쪽'], ['C', '가운데'], ['R', '오른쪽']], { kw: '정렬' })
      )
    ]));

    editArea.appendChild(section('📏 여백 · 모서리', '', [
      row(
        numField('상하 여백 · PC (VP)', ['VP'], { min: 0, max: 200, step: 2, kw: '내부여백 패딩 세로' }),
        numField('상하 여백 · 모바일 (VPM)', ['VPM'], { min: 0, max: 200, step: 2, kw: '내부여백 패딩 세로 모바일' }),
        numField('좌우 여백 (HP)', ['HP'], { min: 0, max: 200, step: 2, kw: '내부여백 패딩 가로' })
      ),
      row(
        numField('콜아웃 모서리 (RADIUS)', ['RADIUS'], { min: 0, max: 80, step: 2, kw: '둥글기' }),
        numField('이미지 모서리 (IR)', ['IR'], { min: 0, max: 80, step: 2, kw: '둥글기 좌우배치' })
      )
    ]));

    const boxKids = [
      h('div', { class: 'ccd-note', text: '이미지 배경 여부는 이미지 위치(위/아래=배경, 좌/우=컬럼)로 자동 결정됩니다. 여기서는 박스 자체의 색만 조정합니다.' }),
      selField('박스 배경 (BG)', ['BG'], [['COLOR', '색 채우기'], ['NONE', '투명']], { kw: '배경 투명' }),
      colorField('배경색 (BGC)', ['BGC'], { nullable: true, fallback: '#004fc7', noneLabel: '원본유지', kw: '배경 색상' })
    ];
    editArea.appendChild(section('🎨 박스 배경', '', boxKids));

    const olKids = [
      h('div', { class: 'ccd-note', text: '위/아래 배치에서 이미지가 배경일 때만 화면에 보입니다.' }),
      h('div', { class: 'ccd-field', 'data-label': '오버레이 사용 어둡게 그라디언트' }, [
        sw(!!c.OL, on => {
          c.OL = on ? clone(E.OL_DEFAULT) : null;
          commit(); buildEdit();
        }, '오버레이 사용').el
      ])
    ];
    if (c.OL) {
      olKids.push(colorField('오버레이 색상 · 투명도 (OL)', ['OL', 'color'], { nullable: false, fallback: E.OL_DEFAULT.color, kw: '오버레이 진하기 어둡게' }));
      olKids.push(row(
        selField('방향', ['OL', 'direction'], [['A', '전체 균일'], ['T', '아래가 진함'], ['B', '위가 진함'], ['L', '오른쪽이 진함'], ['R', '왼쪽이 진함']], { kw: '오버레이' }),
        numField('시작 지점 (%)', ['OL', 'start'], { min: 0, max: 100, step: 1, kw: '오버레이' }),
        numField('끝 지점 (%)', ['OL', 'end'], { min: 0, max: 100, step: 1, kw: '오버레이' })
      ));
    }
    editArea.appendChild(section('🖼️ 이미지 오버레이', '', olKids));

    const textCards = LEVELS.map(lv => {
      const fb = E.LEVEL_FALLBACK[lv];
      const fbSize = fb.size;
      return h('div', { class: 'ccd-card' }, [
        h('div', { class: 'ccd-cardt', text: LEVEL_LABEL[lv] }),
        row(
          numField('글자 크기 · PC', ['text', lv, 'sizePc'], { min: 10, max: 96, step: 1, nullable: true, fallback: fbSize, kw: '글자 크기 폰트 ' + LEVEL_LABEL[lv] }),
          numField('글자 크기 · 모바일', ['text', lv, 'sizeMobile'], { min: 8, max: 80, step: 1, nullable: true, fallback: Math.round(fbSize * E.MOBILE_SCALE), kw: '글자 크기 폰트 모바일 ' + LEVEL_LABEL[lv] }),
          numField('글자 굵기', ['text', lv, 'weight'], { min: 100, max: 900, step: 100, nullable: true, weight: true, fallback: fb.weight, kw: '글자 굵기 폰트 볼드 ' + LEVEL_LABEL[lv] })
        ),
        colorField('글자 색상', ['text', lv, 'color'], { nullable: true, fallback: '#000000', kw: '글자 색상 폰트 ' + LEVEL_LABEL[lv] })
      ]);
    });
    editArea.appendChild(section('🔤 텍스트 스타일', '', [h('div', { class: 'ccd-note', text: '원본유지를 켜면 해당 속성은 아무것도 적용하지 않고 노션 원본 그대로 둡니다.' })].concat(textCards)));

    tokenArea = h('textarea', { class: 'ccd-ta', readonly: '', style: 'height:80px' });
    const copyBtn = h('button', { class: 'ccd-btn ccd-primary', style: 'width:100%;margin-top:6px', text: '📋 토큰 복사' });
    copyBtn.addEventListener('click', () => copyText(tokenArea.value, copyBtn, '📋 토큰 복사'));
    editArea.appendChild(section('📋 최종 토큰 (선택한 인스턴스)', '', [tokenArea, copyBtn]));
    updateTokenOut();

    bodyEl.scrollTop = scroll;
    applySearch();
  }

  function copyText(text, btn, resetLabel) {
    const done = () => { if (btn) { btn.textContent = '✅ 복사됨!'; setTimeout(() => { btn.textContent = resetLabel; }, 1200); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const t = h('textarea', { style: 'position:fixed;opacity:0' }); t.value = text;
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch (e) { status('복사에 실패했습니다.'); }
    t.remove();
  }

  // ---------- 인스턴스 목록 ----------
  const listTitle = h('span', { style: 'font-weight:700' });
  const listEl = h('div', { class: 'ccd-list' });
  const bulkSw = sw(false, on => {
    if (on) {
      if (!S.box) { status('먼저 인스턴스를 선택하세요.'); bulkSw.inp.checked = false; return; }
      if (!confirm('선택한 인스턴스의 값 전체를 모든 인스턴스에 복사합니다.\n켜져 있는 동안 변경 내용도 모두에 반영됩니다. 계속할까요?')) { bulkSw.inp.checked = false; return; }
      S.bulk = true; syncBulk(); status('일괄 적용 ON: 모든 인스턴스에 복사했습니다.');
    } else { S.bulk = false; status('일괄 적용 OFF'); }
  }, '전체 인스턴스에 일괄 적용');

  function renderList() {
    listEl.innerHTML = '';
    const ins = E.getAllInstances();
    listTitle.textContent = '📍 인스턴스 (' + ins.length + '개)';
    if (!ins.length) { listEl.appendChild(h('div', { class: 'ccd-note', text: 'call-cta를 찾지 못했습니다. 새로고침 버튼을 눌러 보세요.' })); return; }
    ins.forEach((box, idx) => {
      const id = E.getBlockId(box);
      const n = E.Slots.count(id);
      const btn = h('button', {
        class: 'ccd-inst' + (S.box === box ? ' on' : ''), title: E.getPreviewText(box),
        onmouseenter: () => showHl(box),
        onmouseleave: () => { if (S.box) showHl(S.box); else hideHl(); },
        onclick: () => selectInstance(box)
      }, [
        h('span', { class: 'n', text: (idx + 1) + ' ' + (E.getLayoutMode(box) === 'SIDE' ? '↔️' : '↕️') }),
        h('span', { class: 't', text: E.getPreviewText(box) }),
        n ? h('span', { class: 'b', text: '💾' + n }) : null
      ]);
      listEl.appendChild(btn);
    });
  }

  function selectInstance(box) {
    S.box = box;
    showHl(box);
    renderList();
    buildEdit();
    if (slotsPanel.style.display !== 'none') renderSlots();
  }

  // ---------- 저장 슬롯 ----------
  const slotsPanel = h('div', { class: 'ccd-panel', style: 'display:none' });
  const importPanel = h('div', { class: 'ccd-panel', style: 'display:none' });
  const exportPanel = h('div', { class: 'ccd-panel', style: 'display:none' });
  const panels = { slots: slotsPanel, import: importPanel, export: exportPanel };
  const togglePanel = name => {
    Object.keys(panels).forEach(k => {
      panels[k].style.display = (k === name && panels[k].style.display === 'none') ? 'block' : 'none';
    });
    if (slotsPanel.style.display !== 'none') renderSlots();
    if (exportPanel.style.display !== 'none') buildExportAll();
  };

  function saveSlots() {
    if (!S.box) { status('먼저 인스턴스를 선택하세요.'); return; }
    const targets = S.bulk ? E.getAllInstances() : [S.box];
    const label = new Date().toLocaleString('ko-KR');
    let dropped = 0, fail = false;
    targets.forEach(b => {
      const r = E.Slots.add(E.getBlockId(b), E.getPreviewText(b), E.serializeParams(b._callCtaConfig), label);
      dropped += r.dropped; if (!r.ok) fail = true;
    });
    if (fail) { status('저장에 실패했습니다. (브라우저 저장소 사용 불가)'); return; }
    status((S.bulk ? '일괄 적용 중이라 인스턴스 ' + targets.length + '개를 각자의 슬롯에' : '새 슬롯에') + ' 저장했습니다 (' + label + ')' +
      (dropped ? ' · 오래된 슬롯 ' + dropped + '개를 자동 삭제했습니다.' : ''));
    renderList();
    if (slotsPanel.style.display !== 'none') renderSlots();
  }

  function renderSlots() {
    slotsPanel.innerHTML = '';
    slotsPanel.appendChild(h('div', { class: 'ccd-note', text: '선택한 인스턴스의 저장본 (최대 ' + E.Slots.MAX + '개, 초과 시 가장 오래된 것부터 자동 삭제)' }));
    if (!S.box) { slotsPanel.appendChild(h('div', { class: 'ccd-note', text: '인스턴스를 선택하세요.' })); }
    else {
      const id = E.getBlockId(S.box);
      const list = E.Slots.list(id).reverse();
      if (!list.length) slotsPanel.appendChild(h('div', { class: 'ccd-note', text: '저장된 슬롯이 없습니다.' }));
      list.forEach(sl => {
        slotsPanel.appendChild(h('div', { class: 'ccd-slot' }, [
          h('span', { text: sl.label }),
          h('button', { class: 'ccd-btn ccd-primary', text: '불러오기', onclick: () => loadSlot(sl) }),
          h('button', { class: 'ccd-btn ccd-danger', text: '삭제', onclick: () => { E.Slots.remove(id, sl.id); renderSlots(); renderList(); } })
        ]));
      });
    }
    const valid = E.getAllInstances().map(E.getBlockId);
    const orph = E.Slots.orphans(valid);
    if (orph.length) {
      slotsPanel.appendChild(h('div', { class: 'ccd-note', style: 'margin-top:8px', text: '연결 안 된 저장본 (블록이 삭제·재생성됨)' }));
      orph.forEach(o => {
        slotsPanel.appendChild(h('div', { class: 'ccd-slot' }, [
          h('span', { text: o.title + ' · ' + o.count + '개' }),
          h('button', { class: 'ccd-btn ccd-danger', text: '삭제', onclick: () => { E.Slots.removeEntry(o.id); renderSlots(); } })
        ]));
      });
    }
  }

  function loadSlot(sl) {
    const params = E.parseToken(sl.token);
    if (!params) { status('저장본을 읽을 수 없습니다.'); return; }
    E.applyConfig(S.box, E.normalizeParams(params));
    commit(); buildEdit();
    status('"' + sl.label + '" 저장본을 불러왔습니다.');
  }

  // ---------- 가져오기 ----------
  const importTa = h('textarea', { class: 'ccd-ta', placeholder: '이전에 복사한 토큰([% call-cta :: ... %])이나 "전체 출력" 결과를 붙여넣으세요' });
  importPanel.appendChild(h('div', { class: 'ccd-note', text: '선택한 인스턴스에만 채웁니다. 전체 출력을 붙여넣으면 제목이 일치하는 토큰을 찾고, 같은 제목이면 번호 순서로 짝을 맞춥니다. 일치하는 제목이 없으면 첫 번째 토큰을 사용합니다.' }));
  importPanel.appendChild(importTa);
  importPanel.appendChild(h('button', { class: 'ccd-btn ccd-primary', style: 'width:100%;margin-top:6px', text: '이 코드로 값 채우기', onclick: applyImport }));

  function applyImport() {
    if (!S.box) { status('먼저 인스턴스를 선택하세요.'); return; }
    const entries = E.extractEntries(importTa.value);
    if (!entries.length) { status('붙여넣은 내용에서 call-cta 토큰을 찾지 못했습니다.'); return; }
    const ins = E.getAllInstances();
    const idx = ins.indexOf(S.box);
    const title = normTitle(E.getPreviewText(S.box));
    const same = ins.filter(b => normTitle(E.getPreviewText(b)) === title);
    const rank = same.indexOf(S.box);
    const cand = entries.filter(e => e.title && normTitle(e.title) === title);
    let pick, how;
    if (cand.length) { pick = cand.find(e => e.num === idx + 1) || cand[rank] || cand[0]; how = '제목 일치'; }
    else { pick = entries[0]; how = '제목 일치 없음 → 첫 번째 토큰 사용'; }
    const params = E.parseToken(pick.token);
    if (!params) { status('토큰을 해석하지 못했습니다.'); return; }
    E.applyConfig(S.box, E.normalizeParams(params));
    commit(); buildEdit();
    importPanel.style.display = 'none';
    status('가져오기 완료 (' + how + ')');
  }

  // ---------- 전체 출력 ----------
  const exportTa = h('textarea', { class: 'ccd-ta', readonly: '', style: 'height:160px' });
  const exportCopy = h('button', { class: 'ccd-btn ccd-primary', style: 'width:100%;margin-top:6px', text: '📋 전체 복사' });
  exportCopy.addEventListener('click', () => copyText(exportTa.value, exportCopy, '📋 전체 복사'));
  exportPanel.appendChild(h('div', { class: 'ccd-note', text: '모든 인스턴스의 토큰을 한 번에 출력합니다. 각 토큰 앞 줄에 번호와 제목 텍스트가 붙습니다.' }));
  exportPanel.appendChild(exportTa);
  exportPanel.appendChild(exportCopy);
  function buildExportAll() {
    exportTa.value = E.getAllInstances().map((b, i) => (i + 1) + '. ' + E.getPreviewText(b) + '\n' + E.serializeParams(b._callCtaConfig)).join('\n\n');
  }

  // ---------- 초기화 / 무효화 / 기본값 미리보기 ----------
  function resetAll() {
    if (!S.box) { status('먼저 인스턴스를 선택하세요.'); return; }
    const msg = S.bulk ? '일괄 적용이 켜져 있어 모든 인스턴스를 처음 열었을 때의 값으로 초기화합니다. 계속할까요?'
                       : '선택한 인스턴스를 처음 열었을 때의 값으로 초기화합니다. 계속할까요?';
    if (!confirm(msg)) return;
    const targets = S.bulk ? E.getAllInstances() : [S.box];
    targets.forEach(b => E.applyConfig(b, clone(b._callCtaInitialConfig)));
    showHl(S.box); buildEdit();
    status(S.bulk ? '모든 인스턴스를 초기화했습니다.' : '선택한 인스턴스를 초기화했습니다.');
  }

  function invalidate() {
    if (!confirm('저장본 자동 적용을 끄고, 모든 인스턴스를 처음 열었을 때의 값(노션 토큰)으로 되돌립니다.\n저장 슬롯은 삭제되지 않습니다. 계속할까요?')) return;
    E.Slots.setAutoApply(false); autoSw.inp.checked = false;
    E.getAllInstances().forEach(b => E.applyConfig(b, clone(b._callCtaInitialConfig)));
    if (S.box) showHl(S.box);
    buildEdit();
    status('기본값 화면으로 복원했습니다. (저장본 자동 적용 OFF)');
  }

  const eyeBtn = h('button', { class: 'ccd-eye', title: '누르고 있는 동안만 기본값(처음 열었을 때의 값) 표시', 'aria-label': '기본값 미리보기(누르는 동안)' });
  eyeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-6a2 2 0 100 4 2 2 0 000-4z"/></svg>';
  const startPreview = () => {
    if (S.preview) return;
    S.preview = E.getAllInstances().map(b => [b, b._callCtaConfig]);
    S.preview.forEach(([b]) => E.applyConfig(b, clone(b._callCtaInitialConfig)));
    eyeBtn.classList.add('on'); root.classList.add('ccd-previewing');
    status('기본값 표시 중… (손을 떼면 현재 설정으로 돌아갑니다)');
  };
  const endPreview = () => {
    if (!S.preview) return;
    S.preview.forEach(([b, c]) => E.applyConfig(b, c));
    S.preview = null;
    eyeBtn.classList.remove('on'); root.classList.remove('ccd-previewing');
    if (S.box) showHl(S.box);
    statusEl.textContent = '';
  };
  eyeBtn.addEventListener('pointerdown', e => { e.preventDefault(); try { eyeBtn.setPointerCapture(e.pointerId); } catch (x) {} startPreview(); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => eyeBtn.addEventListener(ev, endPreview));
  eyeBtn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startPreview(); } });
  eyeBtn.addEventListener('keyup', endPreview);
  eyeBtn.addEventListener('blur', endPreview);
  window.addEventListener('blur', endPreview);

  // ---------- 헤더 ----------
  const themeBtn = h('button', { class: 'ccd-btn', 'aria-label': '라이트/다크 모드 전환' });
  const applyTheme = t => {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'light' ? '☀️ 라이트' : '🌙 다크';
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  };
  themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
  let savedTheme = 'dark';
  try { savedTheme = localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) {}
  applyTheme(savedTheme);

  const resetAllBtn = h('button', { class: 'ccd-btn ccd-danger', text: '전체 초기화', onclick: resetAll });
  const minBtn = h('button', { class: 'ccd-btn', text: '—', title: '최소화', onclick: closeDash });
  const titleEl = h('div', { class: 'ccd-title', text: '⠿ call-cta 대시보드' });
  const autoSw = sw(E.Slots.isAutoApply(), on => {
    E.Slots.setAutoApply(on);
    status(on ? '다음에 페이지를 열 때 마지막 저장본을 자동 적용합니다.' : '저장본 자동 적용을 껐습니다. (다음 새로고침부터 노션 토큰 값 사용)');
  }, '저장본 자동 적용');

  const head = h('div', { class: 'ccd-head' }, [
    h('div', { class: 'ccd-top' }, [titleEl, h('div', { class: 'ccd-grp' }, [themeBtn, resetAllBtn, minBtn])]),
    searchInput,
    h('div', { class: 'ccd-bar' }, [
      h('button', { class: 'ccd-btn', text: '💾 임시저장', onclick: saveSlots }),
      h('button', { class: 'ccd-btn', text: '📂 슬롯 목록', onclick: () => togglePanel('slots') }),
      h('button', { class: 'ccd-btn', text: '📥 가져오기', onclick: () => togglePanel('import') }),
      h('button', { class: 'ccd-btn', text: '📤 전체 출력', onclick: () => togglePanel('export') }),
      h('button', { class: 'ccd-btn ccd-danger', text: '↺ 기본값 보기(무효화)', onclick: invalidate }),
      eyeBtn,
      autoSw.el
    ]),
    statusEl
  ]);

  const bodyEl = h('div', { class: 'ccd-body' });
  editArea = h('div');
  const refreshBtn = h('button', { class: 'ccd-btn', text: '🔄 새로고침', onclick: () => {
    if (S.box && !S.box.isConnected) { S.box = null; hideHl(); }
    renderList(); buildEdit();
  } });
  bodyEl.appendChild(slotsPanel);
  bodyEl.appendChild(importPanel);
  bodyEl.appendChild(exportPanel);
  bodyEl.appendChild(h('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px' }, [listTitle, refreshBtn]));
  bodyEl.appendChild(h('div', { style: 'margin-bottom:8px' }, [bulkSw.el]));
  bodyEl.appendChild(listEl);
  bodyEl.appendChild(editArea);
  bodyEl.appendChild(h('button', {
    class: 'ccd-btn', style: 'width:100%;margin-top:6px', text: '✕ 대시보드 완전히 닫기',
    onclick: () => { endPreview(); root.remove(); hl.remove(); toggleBtn.remove(); document.getElementById('ccd-style')?.remove(); }
  }));

  root.appendChild(head);
  root.appendChild(bodyEl);

  // ---------- 헤더 드래그 이동 ----------
  (function enableDrag() {
    let drag = false, ox = 0, oy = 0;
    titleEl.addEventListener('mousedown', e => {
      drag = true;
      const r = root.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!drag) return;
      root.style.left = Math.max(0, e.clientX - ox) + 'px';
      root.style.top = Math.max(0, e.clientY - oy) + 'px';
    });
    document.addEventListener('mouseup', () => { drag = false; });
  })();

  renderList();
  openDash();
  console.log('%c[call-cta-dashboard] v1.0.0 로드 완료', 'color:#2f6fed;font-weight:bold;');
})();