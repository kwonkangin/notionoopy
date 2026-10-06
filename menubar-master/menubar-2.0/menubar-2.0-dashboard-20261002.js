// =====================================================================================
// menubar-2.0-dashboard-20261005.js   |   메뉴바 대시보드 2.0 (PC 전용)
// 한 줄 설명 : 메뉴바의 모양(CSS 변수)과 내용(메뉴, 버튼, 검색, 옵션)을 팝업 창에서 조정하면 원래
//              페이지에 바로 반영해 보여주고, 결과를 option 코드로 출력하는 도구.
// 짝 파일    : menubar-2.0-20261005.js (엔진), menubar-2.0-20261005.css (스타일),
//              menubar-2.0-option-20261005.html (출력 결과를 붙여 넣는 파일)
// 접미사     : 팝업 안 요소의 클래스는 짧은 이름(item, row, box 등)을 쓴다. 원래 페이지에는 미리보기용
//              style 태그(id: efc_nav_dynamic_style_s1d) 하나만 추가한다.
// 의존성     :
//   - 메뉴바 엔진 2.0 (20261005 이상) : 같은 페이지에 로드되어 있어야 한다 (efc_rebuildNav_v2a 사용).
//     PC 햄버거 옵션은 이 버전 이상의 엔진에서만 동작하며, 이전 버전이면 상단에 경고가 뜬다.
//   - option 설정 : 현재 값을 읽어 시작한다 (window.efcMenubarConfig 와 :root 변수).
//   - 브라우저 팝업 허용 : 팝업이 막혀 있으면 안내 창이 뜨고 실행되지 않는다.
// =====================================================================================
//
// [개요]
// - 개발자 도구 콘솔(또는 Sources 의 Snippets)에서 실행하면 팝업 창이 열린다. 팝업에서 값을 바꾸면
//   원래 페이지의 메뉴바가 즉시 바뀐다.
// - 구역 순서(기능별 배치, 스위치와 그 값이 같은 구역에 모여 있다):
//   저장 · 가져오기 → 1 콘텐츠 → 2 헤더 → 3 로고 → 4 대메뉴 → 5 하위메뉴 → 6 CTA → 7 검색 → 8 모바일
//   - 저장 · 가져오기 : 저장 슬롯, 가져오기, 사이트 기본으로 되돌리기
//   - 콘텐츠 : 로고 주소, 대메뉴/하위메뉴 빌더, CTA 버튼 빌더 (텍스트로 직접 입력하는 부분을 한곳에 모음)
//   - 검색 : 기본 설정 → PC 검색 버튼 → 모바일 검색 → 열린 검색창(플레이스홀더, 위치/크기, 모서리,
//            결과 표시 항목, 결과 디자인) 순서. 각 스위치를 켜면 바로 아래에 값이 나타난다.
//   - 모바일 : 햄버거 전환 시점, 'PC에서도 햄버거 메뉴 사용' 스위치와 PC 햄버거 패널 값(폭 비율, 열 수,
//              위아래 여백, 열 사이 간격), 헤더 여백, 펼침 패널, 메뉴 항목, 모바일 CTA.
//
// [사용법]
// 1) 메뉴바가 적용된 Oopy 페이지를 PC 브라우저로 연다.
// 2) 개발자 도구(F12)에서 실행한다. 용량이 커서 Sources 탭의 Snippets 에 붙여 실행하면 콘솔 입력
//    기록에 쌓이지 않아 편하다. 팝업이 막히면 허용한다.
// 3) 팝업에서 조정한다. 원래 페이지에서 미리보기를 확인한다. 모바일 모양은 브라우저 창 폭을
//    mobileBreakpoint 이하로 줄여서 확인한다.
// 4) 맨 아래 '코드 출력하기'를 누르고 '기본 복사'(설명 주석 포함) 또는 '압축 복사'(한 줄)를 쓴다.
// 5) 복사한 코드로 option 파일 내용을 통째로 교체한다.
// 6) 팝업을 닫으면 미리보기는 처음 상태로 돌아간다. 자동 저장본은 남지만, 닫기 전에 코드를 복사해 둔다.
//
// [기능]
// - 상단 도구줄 : 전체 펼치기/접기(처음에는 모두 펼침), 눈 아이콘, 현재 상태 저장, 사이트 기본으로.
//   그 아래 바로가기 바(저장·가져오기 / 콘텐츠 / 헤더 / 로고 / 대메뉴 / 하위메뉴 / CTA / 검색 / 모바일)를
//   누르면 해당 구역이 펼쳐지며 이동한다. 위쪽 검색창에서 이름이나 변수명으로 항목을 찾을 수 있고,
//   다크/라이트 모드 전환도 있다.
// - 눈 아이콘 : 마우스(또는 터치)를 누르고 있는 동안만 원래 페이지에 "사이트 기본 상태"
//   (대시보드를 실행한 시점의 값)를 보여주고, 손을 떼거나 창이 포커스를 잃으면 작업 중인 값으로 돌아온다.
//   두 창을 나란히 놓고 누른 채로 비교한다.
// - 저장 슬롯 : 브라우저 localStorage 에 변수와 설정 전체를 저장한다. 사용자 슬롯 최대 10개(이름 지정,
//   덮어쓰기, 이름 변경, 삭제)와 자동 저장 1개(편집할 때마다 약 1초 뒤 갱신)가 있다. 슬롯마다
//   저장 시각과 "사이트 기본 대비 변경 개수"가 보인다. 다시 열면 자동 저장본이 있다는 안내가 뜬다.
//   저장 위치는 이 사이트(주소)의 브라우저뿐이다.
// - 사이트 기본으로(무효화) : 편집 중인 내용을 폐기하고 실행 시점의 사이트 설정으로 되돌린다.
//   저장 슬롯은 지우지 않으며, '직전 상태로 되돌리기'로 되살릴 수 있다.
// - 가져오기 : 이전에 내보낸 코드(style 블록 + script 블록, 압축 복사본 포함)를 붙여 넣고 '분석'을 누르면
//   인식한 변수/설정 키 개수와 무시한 항목이 보이고, '적용'을 누르면 화면 전체가 그 코드로 교체된다.
//   코드를 실행하지 않고 글자로만 읽는다. 코드에 없는 변수는 사이트 기본값, 선택 변수는 미설정이 된다.
// - 변경 표시 : 처음과 달라진 항목에 주황색 점이 붙는다. 항목 오른쪽 ↺ 는 그 항목만 처음 값으로 되돌린다.
// - 입력 방식 : 슬라이더 + 숫자, 색상(색상 칩 + 투명도 + 직접 입력), 굵기(슬라이더 + 선택), 상하/좌우
//   여백, 그림자(없음/약/보통/강/직접), 너비(꽉참/1024/1280/직접), 화살표 색(자동/직접).
//   색상 직접 입력은 올바른 색일 때만 적용되고, 잘못되면 빨간 테두리로 표시한다.
// - 하위메뉴 서식 방식 : '공통'이면 심플형 값을 바꿀 때 상세형(배경, 둥글기, 여백, 그림자)도 같이 바뀐다.
//   '개별'이면 따로 설정한다. 시작할 때 두 값이 다르면 '개별'로 시작한다.
// - 선택 사용 변수 : '사용' 체크를 해제하면 출력에서 빠지고 PC 값(또는 우피 기본)을 따른다.
//   미리보기에서도 즉시 반영된다.
// - 스위치에 따라 나타나는 항목 : 상세형 너비 방식(고정/내용에 맞춤), 검색창 위치/크기, 검색창 모서리,
//   검색 결과 디자인, PC 햄버거 패널 값(폭 비율, 열 수, 위아래 여백, 열 사이 간격), 하위메뉴 서식 방식.
//   검색 기능(useSearch)이 꺼져 있으면 검색 하위 항목은 숨긴다.
// - PC에서도 햄버거 메뉴 : 모바일 구역의 스위치(desktopHamburger)를 켜면 PC 폭에서도 햄버거 메뉴가 되고,
//   바로 아래에 패널 값 4개가 나타난다. 미리보기는 원래 페이지 폭 그대로 확인한다.
// - 메뉴 빌더 : 대메뉴/하위메뉴/CTA 추가, 삭제, 순서 변경(위/아래), 복제(바로 아래에 같은 내용으로 복제하고
//   이름 뒤에 " (복사)"를 붙임, 하위메뉴 포함), 하위메뉴 종류 선택, 메뉴별 화살표 설정.
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
// - 엔진 점검 : 엔진이 PC 햄버거 옵션(20261005 이상)을 지원하지 않는 버전이면 상단 상태줄에 경고를 보여준다.
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
// - 설정 : mobileBreakpoint 1024, desktopHamburger false, useSearch false, showMobileSearchBtn true,
//   showMobileSearchBar false, searchPosition right, oopyPlan standard, hideNotionTopbar true,
//   showMobileDesc true, mobileCtaLayout horizontal, mobileCtaGridCols 2, useHeaderShadow true,
//   showArrowDefault true, defaultDropdownStyle detailed, mobileAccordion false, arrowAnimation true,
//   detailedWidthMode fixed, searchPanelCustom/searchRadiusCustom/searchResultCustom false,
//   searchPlaceholder 빈 값, searchResultShow 모두 true, scrollEffect true, scrollThreshold 10,
//   offsetBody true, logo.alt 브랜드 로고, logo.link /
//
// [알려진 제한]
// - PC 전용이다. 휴대폰이나 태블릿 브라우저에서는 팝업 창 방식 때문에 사용하지 않는다.
// - 팝업을 닫으면 미리보기는 원래대로 돌아간다. 자동 저장본은 남지만 코드 복사는 먼저 해 둔다.
// - 저장 슬롯은 브라우저와 사이트(주소)별이다. 다른 사이트나 다른 브라우저에서 쓰려면 코드를 복사해서
//   가져오기를 쓴다. 브라우저 저장소가 막힌 환경에서는 저장 기능이 꺼지고 나머지는 동작한다.
// - 눈 아이콘은 누른 채로 다른 창을 봐야 하므로 두 창이 서로 가리지 않게 배치한다.
// - 일부 변수는 엔진에서 PC 상세형에만 적용된다. 대시보드에서 조절해도 모바일이나 심플형에서는 변화가
//   없을 수 있다(option 파일 상단 주석의 '적용' 참고).
// - 미리보기를 오래 쓰면 엔진이 메뉴바를 다시 만들 때마다 문서의 클릭/키 입력 감지가 쌓인다(엔진의
//   알려진 제한). 필요하면 페이지를 새로고침한다.
// - 주소 입력칸에는 주소 형식 검사가 없다. 잘못된 주소는 그대로 출력된다.
// - 가져오기는 이 대시보드가 내보낸 형식을 기준으로 읽는다. 손으로 크게 고친 코드는 오류 위치를 알려주고
//   적용하지 않는다.
// - PC 햄버거 모드에서는 PC 검색 버튼이 숨겨지므로, 검색 버튼이 필요하면 검색 구역의
//   '상단바 검색 아이콘' 스위치를 함께 켠다.
//
// [검증 상태]
// - 확인함 : PC 브라우저에서의 실행, 미리보기 반영, 코드 출력과 option 파일 적용, 구역 재배치,
//            바로가기 바와 전체 펼치기/접기, 저장 슬롯과 자동 저장, 가져오기, 사이트 기본으로 되돌리기,
//            눈 아이콘, 복제 버튼, 검색 관련 모든 항목
// - 미확인 : PC에서도 햄버거 메뉴 스위치와 PC 햄버거 패널 값 4개 (코드 문법과 가상 환경에서의 동작만
//            검증했고, 실제 우피 화면에서의 모양은 확인 전),
//            휴대폰/태블릿에서 대시보드 실행 (지원 대상 아님)
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
        '.ddAuto .fixedOnly{display:none}body:not(.ddAuto) .autoOnly{display:none}',
    'body:not(.panelOn) .panelOnly{display:none}',
    'body:not(.radiusOn) .radiusOnly{display:none}body:not(.resultOn) .resultOnly{display:none}',
    'body:not(.pcHamOn) .pchamOnly{display:none}',
    '.setrow{margin-bottom:2px}',
    '.subhead{font-weight:700;color:var(--ac);margin:14px 0 4px;padding-top:10px;border-top:1px solid var(--bdd)}',
    'body.searchOff .needSearch{display:none}body.filtering .subhead{display:none}',
    '.tbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}',
    '.btn.eye{display:inline-flex;align-items:center;gap:6px;user-select:none;-webkit-user-select:none;touch-action:none}',
    '.btn.eye.on{background:#f59e0b;color:#fff;border-color:#f59e0b}',
    'body.peek .top{box-shadow:inset 0 0 0 3px #f59e0b}',
    '.toc{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}',
    '.toc a{padding:3px 9px;border:1px solid var(--bd);border-radius:999px;color:var(--tx2);font-size:11px;cursor:pointer;text-decoration:none}',
    '.toc a:hover{color:var(--hl);border-color:var(--hl)}',
    '.sec{scroll-margin-top:calc(var(--topH,170px) + 8px)}',
    '.slot{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--bdd)}.slot .meta{flex:1;min-width:0}',
    '.notice{background:rgba(245,158,11,.12);border:1px solid #f59e0b;color:var(--tx);border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:12px}',
    '.imp{width:100%;height:140px;background:var(--input);color:var(--hl);border:1px solid var(--bd);border-radius:6px;padding:8px;font:11px monospace;resize:vertical}',
    '.sum{background:var(--sum);border-radius:6px;padding:8px 10px;margin-top:8px;font-size:12px;line-height:1.6;display:none}',
    '.btn:disabled{opacity:.4;cursor:default}'
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
  var PN = function (it) { it.panel = true; return it; };
  var RD = function (it) { it.radius = true; return it; };
  var RS = function (it) { it.result = true; return it; };
  var NS = function (it) { it.ns = true; return it; };
    var PH = function (it) { it.pcham = true; return it; };
  var SET = function (label, build, ns) { return { k: 'set', label: label, build: build, ns: !!ns }; };
  var HEAD = function (text, ns) { return { k: 'head', text: text, ns: !!ns }; };
  var MODE = { k: 'mode' };
  var PILL = [{ label: '알약(999)', value: 999 }];

  var SECTIONS = [
    { id: 'sec-content', toc: '콘텐츠', title: '1. 콘텐츠 (로고 주소 · 메뉴 · CTA 버튼)', content: true },
    { id: 'sec-header', toc: '헤더', title: '2. 헤더', blocks: [
      C('--headerBg_a1', '헤더 배경색', '#ffffff'),
      C('--headerBorderColor_a2', '헤더 하단 테두리색', 'transparent'),
      R('--headerHeight_a3', '헤더 전체 높이', 40, 120, 'px', '72px'),
      { v: '--headerMaxWidth_a4', label: '콘텐츠 최대 너비', type: 'width', def: '1280px' },
      R('--headerPaddingX_a5', '좌우 내부 여백', 0, 100, 'px', '59px'),
      R('--headerZIndex_a6', 'Z-Index (우선순위)', 10, 9999, '', '9999'),
      R('--headerTransitionSpeed_a7', '배경 전환 애니메이션 속도', 0, 2, 's', '0.3s', 0.1),
      R('--headerRowGap_a8', '로고-메뉴-버튼 간격', 0, 100, 'px', '0px'),
      HEAD('스크롤 · 노션 상단바'),
      SET('스크롤 그림자 효과 임계값 본문 여백 보정 노션 상단바 숨김 useHeaderShadow scrollEffect offsetBody hideNotionTopbar', function () {
        var d = state.nav;
        return [
          toggle('스크롤 시 헤더 하단 그림자 활성화 (useHeaderShadow)', d, 'useHeaderShadow'),
          toggle('스크롤 효과 사용 (scrollEffect)', d, 'scrollEffect'),
          numRange('스크롤 효과 임계값 (px)', d, 'scrollThreshold', 0, 300, 1),
          toggle('고정 헤더 높이만큼 본문 상단 여백 보정 (offsetBody)', d, 'offsetBody'),
          toggle('기존 노션 상단바 숨김 (겹침 방지, hideNotionTopbar)', d, 'hideNotionTopbar')
        ];
      })
    ] },
    { id: 'sec-logo', toc: '로고', title: '3. 로고 (크기)', blocks: [
      R('--logoHeight_b1', '로고 이미지 높이', 10, 100, 'px', '36px'),
      O(R('--logoHeightMobile_b2', '모바일 로고 높이', 10, 100, 'px', '24px'))
    ] },
    { id: 'sec-nav', toc: '대메뉴', title: '4. 대메뉴 (PC)', blocks: [
      S('--navAlign_c9', '메뉴 정렬 위치', { 'flex-start': '좌측 (로고 옆)', 'center': '중앙', 'flex-end': '우측 (버튼 옆)' }, 'center', { left: 'flex-start', right: 'flex-end' }),
      R('--navGap_c1', '메뉴 사이 간격', 10, 200, 'px', '32px'),
      R('--navMarginLeft_c10', '대메뉴 좌측(로고) 여백', 0, 200, 'px', '0px'),
      R('--navMarginRight_c11', '대메뉴 우측(CTA) 여백', 0, 200, 'px', '0px'),
      R('--navFontSize_c2', '글자 크기', 10, 24, 'px', '16px'),
      W('--navFontWeight_c3', '글자 굵기', '500'),
      C('--navColor_c4', '기본 글자색', 'rgba(51, 51, 51, 1.00)'),
      C('--navHoverColor_c5', '호버 글자색', '#00b0ec'),
      HEAD('화살표'),
      SET('화살표 기본 노출 회전 애니메이션 showArrowDefault arrowAnimation', function () {
        var d = state.nav;
        return [toggle('화살표 기본 노출 (showArrowDefault)', d, 'showArrowDefault'), toggle('화살표 회전 애니메이션 (arrowAnimation)', d, 'arrowAnimation')];
      }),
      S('--navArrowDisplay_c6', '화살표 노출', { 'inline-block': '노출', 'none': '숨김' }, 'inline-block'),
      R('--navArrowSize_c7', '화살표 크기', 5, 30, 'px', '12px'),
      { v: '--navArrowColor_c8', label: '화살표 색상', type: 'arrow', def: 'currentColor' }
    ] },
    { id: 'sec-dropdown', toc: '하위메뉴', title: '5. 하위메뉴', blocks: [
      SET('하위메뉴 기본 스타일 defaultDropdownStyle', function () {
        return [fld('하위메뉴 기본 스타일 (새 항목에 적용)', sel(state.nav, 'defaultDropdownStyle', { detailed: '상세형', simple: '심플형' }))];
      }),
      MODE,
      HEAD('박스 (심플형 / 상세형)'),
      C('--dropdownSimpleBg_d1', '배경색 (심플/공통)', '#ffffff'),
      R('--dropdownSimpleRadius_d2', '테두리 둥글기 (심플/공통)', 0, 40, 'px', '12px'),
      P('--dropdownSimplePad_d5', '내부 여백 (심플/공통)', '8px 8px'),
      SH('--dropdownSimpleShadow_d3', '박스 그림자 (심플/공통)', '0 10px 30px rgba(0, 0, 0, 0.08)'),
      R('--dropdownSimpleMinWidth_d4', '심플형 최소 너비', 100, 400, 'px', '200px'),
      D(C('--dropdownDetailedBg_e1', '상세형 배경색 (개별)', '#ffffff')),
      D(R('--dropdownDetailedRadius_e2', '상세형 둥글기 (개별)', 0, 40, 'px', '12px')),
      D(P('--dropdownDetailedPad_e5', '상세형 내부 여백 (개별)', '8px 8px')),
      D(SH('--dropdownDetailedShadow_e3', '상세형 박스 그림자 (개별)', '0 10px 30px rgba(0, 0, 0, 0.08)')),
      SET('상세형 하위메뉴 너비 방식 detailedWidthMode', function () {
        return [fld('상세형 하위메뉴 너비 방식 (detailedWidthMode)', sel(state.nav, 'detailedWidthMode', { fixed: '고정 너비', auto: '내용(텍스트 길이)에 맞춤' }))];
      }),
      M('fixed', R('--dropdownDetailedWidth_e4', '상세형 고정 너비 (고정 모드)', 200, 600, 'px', '320px')),
      M('auto', R('--dropdownDetailedMinWidth_e22', '상세형 최소 너비 (내용에 맞춤 모드)', 100, 600, 'px', '200px')),
      M('auto', R('--dropdownDetailedMaxWidth_e23', '상세형 최대 너비 (내용에 맞춤 모드)', 200, 800, 'px', '320px')),
      HEAD('항목'),
      R('--dropdownItemRadius_e6', '항목 호버 둥글기', 0, 30, 'px', '10px'),
      C('--dropdownItemHoverBg_e7', '항목 호버 배경색', 'rgba(0, 176, 236, 0.06)'),
      R('--dropdownGap_e21', '항목 사이 상하 간격', 0, 20, 'px', '4px'),
      HEAD('아이콘 / 텍스트'),
      C('--dropdownIconColor_e11', '글로벌 아이콘 기본색', 'rgba(51, 51, 51, 1.00)'),
      C('--dropdownIconHoverColor_e11h', '글로벌 아이콘 호버색', '#00b0ec'),
      R('--dropdownIconBoxSize_e8', '아이콘 박스 크기', 0, 80, 'px', '30px'),
      C('--dropdownIconBoxBg_e9', '아이콘 박스 배경색', 'rgba(0, 176, 236, 0.1)'),
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
    { id: 'sec-cta', toc: 'CTA', title: '6. CTA 버튼 (PC)', blocks: [
      R('--ctaGap_f1', '버튼 간격', 0, 40, 'px', '10px'),
      R('--ctaRadius_f2', '버튼 둥글기', 0, 100, 'px', '100px', 1, PILL),
      R('--ctaFontSize_f3', '글자 크기', 10, 24, 'px', '16px'),
      W('--ctaFontWeight_z7', '글자 굵기', '700'),
      R('--ctaPaddingY_f5', '상하 여백', 0, 30, 'px', '8px'),
      R('--ctaPaddingX_f4', '좌우 여백', 0, 50, 'px', '18px'),
      C('--ctaSolidBg_z1', 'Solid 배경색', '#00b0ec'),
      C('--ctaSolidText_z2', 'Solid 글자색', '#ffffff'),
      C('--ctaOutlineBg_z3', 'Outline 배경색', '#ffffff'),
      C('--ctaOutlineText_z4', 'Outline 글자색', '#00b0ec'),
      C('--ctaOutlineBorder_z5', 'Outline 선 색상', '#00b0ec'),
      R('--ctaBorderWidth_z6', '테두리 선 두께', 0, 10, 'px', '1.5px', 0.5)
    ] },
    { id: 'sec-search', toc: '검색', title: '7. 검색', blocks: [
      SET('검색 기능 활성화 useSearch', function () { return [toggle('PC/모바일 검색 기능 활성화 (useSearch)', state.nav, 'useSearch')]; }),
      SET('우피 검색 플랜 oopyPlan 검색 버튼 배치 searchPosition', function () {
        var d = state.nav;
        return [
          fld('우피 검색 플랜', sel(d, 'oopyPlan', { standard: '일반 플랜 (.search-button)', pro: '프로 플랜 (.xi-search)' })),
          fld('검색 버튼 배치 (CTA 기준)', sel(d, 'searchPosition', { right: '우측 (PC: CTA 오른쪽 · 모바일: CTA와 햄버거 사이 / 패널 CTA 아래)', left: '좌측 (PC: CTA 왼쪽 · 모바일: CTA 왼쪽 / 패널 CTA 위)' }))
        ];
      }, true),
      HEAD('PC 검색 버튼 디자인', true),
      NS(C('--searchBtnBg_j1', '(PC) 기본 배경색', 'transparent')),
      NS(C('--searchBtnText_j2', '(PC) 기본 아이콘색', '#333333')),
      NS(C('--searchBtnHoverBg_j3', '(PC) 호버 배경색', 'transparent')),
      NS(C('--searchBtnHoverText_j4', '(PC) 호버 아이콘색', '#00a6ab')),
      NS(R('--searchBtnSize_j5', '(PC) 아이콘 크기', 10, 40, 'px', '18px')),
      NS(P('--searchBtnPadding_j6', '(PC) 내부 여백', '4px 20px')),
      NS(R('--searchBtnRadius_j7', '(PC) 둥글기', 0, 30, 'px', '4px')),
      HEAD('모바일 검색', true),
      SET('모바일 패널 내 검색 버튼 노출 showMobileSearchBtn', function () { return [toggle('모바일 패널 하단에 검색 버튼 노출 (showMobileSearchBtn)', state.nav, 'showMobileSearchBtn')]; }, true),
      NS(C('--mobileSearchBg_m1', '(모바일 패널 버튼) 배경색', '#f4f4f5')),
      NS(C('--mobileSearchText_m2', '(모바일 패널 버튼) 글자/아이콘색', '#333333')),
      NS(C('--mobileSearchHoverBg_m3', '(모바일 패널 버튼) 호버 배경색', '#e4e4e7')),
      NS(C('--mobileSearchHoverText_m4', '(모바일 패널 버튼) 호버 글자색', '#00a6ab')),
      NS(R('--mobileSearchRadius_m5', '(모바일 패널 버튼) 둥글기', 0, 50, 'px', '8px')),
      SET('모바일 상단바 검색 아이콘 showMobileSearchBar', function () { return [toggle('모바일: 상단바에 검색 아이콘 (CTA와 햄버거 사이, showMobileSearchBar)', state.nav, 'showMobileSearchBar')]; }, true),
      NS(P('--searchBtnPaddingMobile_j8', '(모바일) 상단바 검색 아이콘 내부 여백', '4px 8px')),
      HEAD('열린 검색창', true),
      SET('검색창 플레이스홀더 searchPlaceholder', function () {
        var d = state.nav;
        return [
          fld('검색창 플레이스홀더 (PC, 비우면 우피 기본)', tin(d, 'searchPlaceholder', '예: 궁금한 내용을 검색해 보세요')),
          fld('검색창 플레이스홀더 (모바일, 비우면 PC와 동일)', tin(d, 'searchPlaceholderMobile', '비워 두면 PC 문구'))
        ];
      }, true),
      SET('검색창 위치 크기 직접 지정 searchPanelCustom', function () { return [toggle('검색창 위치/크기 직접 지정 (searchPanelCustom)', state.nav, 'searchPanelCustom')]; }, true),
      NS(PN(R('--searchPanelTop_s1', '검색창 위쪽 여백', 0, 400, 'px', '240px'))),
      NS(PN(R('--searchPanelWidth_s2', '검색창 너비 (PC)', 280, 1000, 'px', '656px'))),
      NS(PN(O(R('--searchPanelTopMobile_s3', '검색창 위쪽 여백 (모바일)', 0, 400, 'px', '90px')))),
      NS(PN(O(R('--searchPanelWidthMobile_s4', '검색창 너비 (모바일)', 50, 100, '%', '82%')))),
      SET('검색창 모서리 직접 지정 searchRadiusCustom', function () { return [toggle('검색창 모서리 직접 지정 (searchRadiusCustom)', state.nav, 'searchRadiusCustom')]; }, true),
      NS(RD(R('--searchPanelRadius_s5', '검색창 모서리 둥글기', 0, 30, 'px', '30px'))),
      SET('검색 결과 표시 항목 아이콘 위치 설명 타입 배지 하단 문구', function () {
        var d = state.nav;
        return [fld('검색 결과 표시 항목 (제목은 항상 표시)', h('div', { style: 'display:flex;flex-direction:column;gap:8px' }, [
          toggle('아이콘', d.searchResultShow, 'icon'), toggle('위치(경로)', d.searchResultShow, 'location'), toggle('설명', d.searchResultShow, 'desc'),
          toggle('타입 배지', d.searchResultShow, 'type'), toggle('하단 "검색 결과 n개" 문구', d.searchResultShow, 'footer')
        ]))];
      }, true),
      SET('검색 결과 디자인 직접 지정 searchResultCustom', function () { return [toggle('검색 결과 디자인 직접 지정 (searchResultCustom)', state.nav, 'searchResultCustom')]; }, true),
      NS(RS(R('--searchResultTitleSize_s6', '검색 결과 제목 크기', 10, 28, 'px', '14px'))),
      NS(RS(W('--searchResultTitleWeight_s7', '검색 결과 제목 굵기', '500'))),
      NS(RS(C('--searchResultTitleColor_s8', '검색 결과 제목 색', 'rgb(55, 53, 47)'))),
      NS(RS(R('--searchResultPathSize_s9', '검색 결과 위치(경로) 크기', 8, 24, 'px', '12px'))),
      NS(RS(W('--searchResultPathWeight_s10', '검색 결과 위치(경로) 굵기', '400'))),
      NS(RS(C('--searchResultPathColor_s11', '검색 결과 위치(경로) 색', 'rgba(55, 53, 47, 0.4)'))),
      NS(RS(R('--searchResultDescSize_s12', '검색 결과 설명 크기', 8, 24, 'px', '12px'))),
      NS(RS(W('--searchResultDescWeight_s13', '검색 결과 설명 굵기', '400'))),
      NS(RS(C('--searchResultDescColor_s14', '검색 결과 설명 색', 'rgba(55, 53, 47, 0.6)'))),
      NS(RS(R('--searchResultDescLines_s15', '검색 결과 설명 최대 줄 수', 1, 10, '', '2'))),
      NS(RS(R('--searchResultTypeSize_s16', '검색 결과 타입 배지 크기', 8, 20, 'px', '11px'))),
      NS(RS(W('--searchResultTypeWeight_s17', '검색 결과 타입 배지 굵기', '400'))),
      NS(RS(C('--searchResultTypeColor_s18', '검색 결과 타입 배지 글자색', 'rgba(55, 53, 47, 0.55)'))),
      NS(RS(C('--searchResultTypeBg_s19', '검색 결과 타입 배지 배경색', 'rgba(55, 53, 47, 0.06)'))),
      NS(RS(R('--searchResultFooterSize_s20', '검색 결과 하단 문구 크기', 8, 24, 'px', '12px'))),
      NS(RS(W('--searchResultFooterWeight_s21', '검색 결과 하단 문구 굵기', '400'))),
      NS(RS(C('--searchResultFooterColor_s22', '검색 결과 하단 문구 색', 'rgba(55, 53, 47, 0.4)')))
    ] },
        { id: 'sec-mobile', toc: '모바일', title: '8. 모바일', blocks: [
      SET('PC에서도 햄버거 메뉴 사용 desktopHamburger 폭 열 수 위아래 여백', function () { return [toggle('PC에서도 햄버거 메뉴 사용 (desktopHamburger)', state.nav, 'desktopHamburger')]; }),
      PH(R('--pcPanelWidth_k1', 'PC 햄버거 패널 폭 (헤더 콘텐츠 폭 대비)', 50, 100, '%', '100%')),
      PH(R('--pcPanelCols_k2', 'PC 햄버거 패널 열 수', 1, 3, '', '1')),
      PH(R('--pcPanelPadY_k3', 'PC 햄버거 패널 위아래 여백', 0, 80, 'px', '20px')),
      PH(R('--pcPanelColGap_k4', 'PC 햄버거 패널 열 사이 간격', 0, 80, 'px', '32px')),
      SET('모바일 햄버거 전환 시점 mobileBreakpoint', function () { return [numRange('모바일 햄버거 전환 시점 (px, mobileBreakpoint)', state.nav, 'mobileBreakpoint', 480, 1600, 1)]; }),
      R('--mobileHeaderPaddingX_a9', '모바일 헤더 좌우 여백', 0, 100, 'px', '16px'),
      R('--mobileHeaderGap_a10', '모바일 헤더 로고-버튼 간격', 0, 40, 'px', '8px'),
      HEAD('펼침 패널'),
      C('--mobilePanelBg_h1', '모바일 패널 배경색', '#ffffff'),
      R('--mobilePanelPaddingX_h5', '모바일 패널 좌우 추가 여백', 0, 60, 'px', '0px'),
      R('--mobileActionGap_o2', '상단 햄버거-버튼 간격', 0, 40, 'px', '12px'),
      C('--toggleColor_g1', '햄버거 아이콘 색상', '#1f2937'),
      HEAD('메뉴 항목'),
      R('--mobileItemFontSize_h2', '모바일 대메뉴 크기', 10, 24, 'px', '16px'),
      C('--mobileItemColor_h3', '모바일 메뉴 글자색', '#333333'),
      C('--mobileCaretColor_h4', '모바일 화살표 색상', '#9aa0a6'),
      SET('모바일 하위메뉴 설명글 노출 아코디언 showMobileDesc mobileAccordion', function () {
        var d = state.nav;
        return [toggle('모바일 하위메뉴 설명글 노출 (showMobileDesc)', d, 'showMobileDesc'), toggle('모바일: 대메뉴를 열면 다른 대메뉴 자동 닫기 (mobileAccordion)', d, 'mobileAccordion')];
      }),
      HEAD('CTA 버튼 (모바일)'),
      SET('모바일 CTA 버튼 배열 mobileCtaLayout mobileCtaGridCols', function (rr) {
        var d = state.nav;
        return [
          fld('모바일 패널 CTA 버튼 배열', sel(d, 'mobileCtaLayout', { vertical: '세로 배치 (위아래)', horizontal: '가로 배치 (그리드)' }, rr)),
          d.mobileCtaLayout === 'horizontal' ? numRange('가로 배치 분할 수 (1~10열)', d, 'mobileCtaGridCols', 1, 10, 1) : null
        ];
      }),
      R('--mobileBarCtaGap_i1', '상단바 CTA 간격', 0, 20, 'px', '8px'),
      R('--mobileBarCtaFontSize_i2', '상단바 CTA 글자크기', 8, 20, 'px', '12px'),
      R('--mobileBarCtaPaddingY_i4', '상단바 CTA 상하 여백', 0, 20, 'px', '7px'),
      R('--mobileBarCtaPaddingX_i3', '상단바 CTA 좌우 여백', 0, 40, 'px', '12px'),
      R('--mobileBarCtaRadius_i5', '상단바 CTA 둥글기', 0, 100, 'px', '999px', 1, PILL)
    ] }
  ];
  var VAR_ITEMS = [], VAR_BY_NAME = {};
  SECTIONS.forEach(function (s) { (s.blocks || []).forEach(function (b) { if (b.v) { VAR_ITEMS.push(b); VAR_BY_NAME[b.v] = b; } }); });
  var VAR_GROUPS = SECTIONS.map(function (s) { return { title: s.title, items: (s.blocks || []).filter(function (b) { return b.v; }) }; }).filter(function (g) { return g.items.length; });
  ['--searchPanelTop_s1', '--searchPanelWidth_s2', '--searchPanelTopMobile_s3', '--searchPanelWidthMobile_s4'].forEach(function (n) { if (VAR_BY_NAME[n]) VAR_BY_NAME[n].free = true; });
  VAR_ITEMS.forEach(function (it) { if (/obile/.test(it.v) && it.label.indexOf('📱') < 0) it.label = it.label + ' 📱'; });
  var SYNC = {
    '--dropdownSimpleBg_d1': '--dropdownDetailedBg_e1',
    '--dropdownSimpleRadius_d2': '--dropdownDetailedRadius_e2',
    '--dropdownSimplePad_d5': '--dropdownDetailedPad_e5',
    '--dropdownSimpleShadow_d3': '--dropdownDetailedShadow_e3'
  };
  var TARGETS = { _self: '현재창', _blank: '새창' };

  var NAV_DEFAULT = {
    mobileBreakpoint: 1024, desktopHamburger: false,
    useSearch: true, showMobileSearchBtn: false, showMobileSearchBar: true, searchPosition: 'right', oopyPlan: 'standard',
    hideNotionTopbar: true, useHeaderShadow: true, showMobileDesc: true, mobileCtaLayout: 'vertical', mobileCtaGridCols: 1,
    scrollEffect: true, scrollThreshold: 10, offsetBody: true,
    logo: { url: '', mobileUrl: '', alt: '로고', link: '/' },
    showArrowDefault: true, defaultDropdownStyle: 'detailed', mobileAccordion: true, arrowAnimation: false, detailedWidthMode: 'auto',
    searchPanelCustom: true, searchPlaceholder: '궁금한 내용을 검색해보세요.', searchPlaceholderMobile: '',
    searchRadiusCustom: true, searchResultCustom: false,
    searchResultShow: { icon: false, location: false, desc: true, type: false, footer: true },
    menuItems: [], ctaButtons: [], base: ''
  };
  var EMBEDDED_CSS_DEFAULTS = {"--headerBg_a1": "#ffffff", "--headerBorderColor_a2": "transparent", "--headerHeight_a3": "72px", "--headerMaxWidth_a4": "1280px", "--headerPaddingX_a5": "59px", "--headerZIndex_a6": "9999", "--headerTransitionSpeed_a7": "0.3s", "--headerRowGap_a8": "0px", "--logoHeight_b1": "36px", "--navAlign_c9": "flex-end", "--navGap_c1": "32px", "--navMarginLeft_c10": "0px", "--navMarginRight_c11": "0px", "--navFontSize_c2": "16px", "--navFontWeight_c3": "500", "--navColor_c4": "rgba(51, 51, 51, 1.00)", "--navHoverColor_c5": "#00b0ec", "--navArrowDisplay_c6": "inline-block", "--navArrowSize_c7": "12px", "--navArrowColor_c8": "currentColor", "--dropdownSimpleBg_d1": "#ffffff", "--dropdownSimpleRadius_d2": "12px", "--dropdownSimplePad_d5": "8px 8px", "--dropdownSimpleShadow_d3": "0 10px 30px rgba(0, 0, 0, 0.08)", "--dropdownSimpleMinWidth_d4": "200px", "--dropdownDetailedBg_e1": "#ffffff", "--dropdownDetailedRadius_e2": "12px", "--dropdownDetailedPad_e5": "8px 8px", "--dropdownDetailedShadow_e3": "0 10px 30px rgba(0, 0, 0, 0.08)", "--dropdownDetailedWidth_e4": "320px", "--dropdownDetailedMinWidth_e22": "200px", "--dropdownDetailedMaxWidth_e23": "320px", "--dropdownItemRadius_e6": "10px", "--dropdownItemHoverBg_e7": "rgba(0, 176, 236, 0.06)", "--dropdownGap_e21": "4px", "--dropdownIconColor_e11": "rgba(51, 51, 51, 1.00)", "--dropdownIconHoverColor_e11h": "#00b0ec", "--dropdownIconBoxSize_e8": "30px", "--dropdownIconBoxBg_e9": "rgba(0, 176, 236, 0.1)", "--dropdownIconBoxRadius_e10": "8px", "--dropdownIconImgScale_e11b": "0.8", "--dropdownIconFaSize_e11c": "17px", "--dropdownIconGap_e12": "10px", "--dropdownTitleColor_e13": "#1f2937", "--dropdownTitleSize_e14": "14px", "--dropdownTitleWeight_e15": "600", "--dropdownDescColor_e16": "#8a8f98", "--dropdownDescSize_e17": "12px", "--dropdownDescWeight_e18": "400", "--dropdownTitleDescGap_e19": "3px", "--dropdownNoIconAlign_e20": "left", "--ctaGap_f1": "10px", "--ctaRadius_f2": "100px", "--ctaFontSize_f3": "16px", "--ctaFontWeight_z7": "700", "--ctaPaddingY_f5": "8px", "--ctaPaddingX_f4": "18px", "--ctaSolidBg_z1": "#00b0ec", "--ctaSolidText_z2": "#ffffff", "--ctaOutlineBg_z3": "#ffffff", "--ctaOutlineText_z4": "#00b0ec", "--ctaOutlineBorder_z5": "#00b0ec", "--ctaBorderWidth_z6": "1.5px", "--searchBtnBg_j1": "transparent", "--searchBtnText_j2": "#333333", "--searchBtnHoverBg_j3": "transparent", "--searchBtnHoverText_j4": "#00a6ab", "--searchBtnSize_j5": "18px", "--searchBtnPadding_j6": "4px 20px", "--searchBtnRadius_j7": "4px", "--mobileSearchBg_m1": "#f4f4f5", "--mobileSearchText_m2": "#333333", "--mobileSearchHoverBg_m3": "#e4e4e7", "--mobileSearchHoverText_m4": "#00a6ab", "--mobileSearchRadius_m5": "8px", "--searchPanelTop_s1": "240px", "--searchPanelWidth_s2": "656px", "--searchPanelWidthMobile_s4": "82%", "--searchPanelRadius_s5": "30px", "--searchResultTitleSize_s6": "14px", "--searchResultTitleWeight_s7": "500", "--searchResultTitleColor_s8": "rgb(55, 53, 47)", "--searchResultPathSize_s9": "12px", "--searchResultPathWeight_s10": "400", "--searchResultPathColor_s11": "rgba(55, 53, 47, 0.4)", "--searchResultDescSize_s12": "12px", "--searchResultDescWeight_s13": "400", "--searchResultDescColor_s14": "rgba(55, 53, 47, 0.6)", "--searchResultDescLines_s15": "2", "--searchResultTypeSize_s16": "11px", "--searchResultTypeWeight_s17": "400", "--searchResultTypeColor_s18": "rgba(55, 53, 47, 0.55)", "--searchResultTypeBg_s19": "rgba(55, 53, 47, 0.06)", "--searchResultFooterSize_s20": "12px", "--searchResultFooterWeight_s21": "400", "--searchResultFooterColor_s22": "rgba(55, 53, 47, 0.4)", "--mobilePanelBg_h1": "#ffffff", "--mobilePanelPaddingX_h5": "0px", "--mobileActionGap_o2": "12px", "--toggleColor_g1": "#1f2937", "--mobileItemFontSize_h2": "16px", "--mobileItemColor_h3": "#333333", "--mobileCaretColor_h4": "#9aa0a6", "--mobileBarCtaGap_i1": "8px", "--mobileBarCtaFontSize_i2": "12px", "--mobileBarCtaPaddingY_i4": "7px", "--mobileBarCtaPaddingX_i3": "12px", "--mobileBarCtaRadius_i5": "999px", "--pcPanelWidth_k1": "100%", "--pcPanelCols_k2": "1", "--pcPanelPadY_k3": "20px", "--pcPanelColGap_k4": "32px", "--mobileHeaderPaddingX_a9": "16px", "--mobileHeaderGap_a10": "8px", "--searchBtnPaddingMobile_j8": "4px 8px"};


  /* ───────── 상태 초기화 ───────── */
  var state = { styles: {}, snap: {}, nav: null, navSnap: null, commonMode: true };
  var cs = oDoc.defaultView.getComputedStyle(oDoc.documentElement);
  VAR_ITEMS.forEach(function (it) {
    var val = cs.getPropertyValue(it.v).trim();
    if (!val && !it.optional) val = it.def;
    if (it.alias && it.alias[val]) val = it.alias[val];
    if (it.type === 'range' && val && isNaN(parseFloat(val))) console.warn('[NavDash] 숫자가 아닌 값이 슬라이더 항목에 있습니다:', it.v, val);
    state.styles[it.v] = val;
  });
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
    return { label: str(b.label), url: b.url || '#', target: b.target === '_blank' ? '_blank' : '_self', variant: b.variant === 'outline' ? 'outline' : 'solid', showOnMobileBar: toBool(b.showOnMobileBar, false) };
  }
  var BOOL_KEYS = ['useSearch', 'showMobileSearchBtn', 'hideNotionTopbar', 'showMobileDesc', 'useHeaderShadow', 'showArrowDefault', 'scrollEffect', 'offsetBody', 'mobileAccordion', 'arrowAnimation', 'showMobileSearchBar', 'searchPanelCustom', 'searchRadiusCustom', 'searchResultCustom', 'desktopHamburger'];
  function normalizeNav(src, base) {
    var nav = deepMerge(base || NAV_DEFAULT, isObj(src) ? src : {});
    BOOL_KEYS.forEach(function (k) { nav[k] = toBool(nav[k], NAV_DEFAULT[k]); });
    nav.mobileBreakpoint = toInt(nav.mobileBreakpoint, 1024);
    nav.mobileCtaGridCols = toInt(nav.mobileCtaGridCols, 2);
    nav.scrollThreshold = toInt(nav.scrollThreshold, 10);
    nav.searchPosition = nav.searchPosition === 'left' ? 'left' : 'right';
    nav.defaultDropdownStyle = nav.defaultDropdownStyle === 'simple' ? 'simple' : 'detailed';
    nav.detailedWidthMode = nav.detailedWidthMode === 'auto' ? 'auto' : 'fixed';
    nav.searchPlaceholder = str(nav.searchPlaceholder);
    nav.searchPlaceholderMobile = str(nav.searchPlaceholderMobile);
    if (!isObj(nav.logo)) nav.logo = clone(NAV_DEFAULT.logo);
    if (!isObj(nav.searchResultShow)) nav.searchResultShow = clone(NAV_DEFAULT.searchResultShow);
    ['icon', 'location', 'desc', 'type', 'footer'].forEach(function (k) { nav.searchResultShow[k] = toBool(nav.searchResultShow[k], true); });
    nav.menuItems = (Array.isArray(nav.menuItems) ? nav.menuItems : []).map(function (m) { return normMenu(m, nav.defaultDropdownStyle); });
    nav.ctaButtons = (Array.isArray(nav.ctaButtons) ? nav.ctaButtons : []).map(normCta);
    return nav;
  }
  var hasSrc = isObj(window.efcMenubarConfig);
  state.nav = normalizeNav(hasSrc ? window.efcMenubarConfig : {});
  state.navSnap = clone(state.nav);

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
      showMobileSearchBar: !!d.showMobileSearchBar, searchPanelCustom: !!d.searchPanelCustom,
      searchPlaceholder: str(d.searchPlaceholder).trim(), searchPlaceholderMobile: str(d.searchPlaceholderMobile).trim(),
            searchRadiusCustom: !!d.searchRadiusCustom, searchResultCustom: !!d.searchResultCustom, desktopHamburger: !!d.desktopHamburger,
      searchResultShow: { icon: d.searchResultShow.icon !== false, location: d.searchResultShow.location !== false, desc: d.searchResultShow.desc !== false, type: d.searchResultShow.type !== false, footer: d.searchResultShow.footer !== false },
      menuItems: d.menuItems.map(cleanItem),
      ctaButtons: d.ctaButtons.map(function (b) { return { label: str(b.label).trim(), url: str(b.url).trim() || '#', target: b.target, variant: b.variant, showOnMobileBar: !!b.showOnMobileBar }; }),
      scrollEffect: !!d.scrollEffect, scrollThreshold: Math.max(0, toInt(d.scrollThreshold, 10)), offsetBody: !!d.offsetBody
    };
    Object.keys(d).forEach(function (k) { if (!(k in out)) out[k] = clone(d[k]); });
    if (!out.base) delete out.base;
    return out;
  }

  /* ───────── 미리보기 반영 ───────── */
  var mobilePreview = false, previewOpen = false;
  var statusEl, engineWarn = '', peeking = false, suspendAuto = false, userEdited = false, undoState = null;
  function setStatus(msg, bad) { if (!statusEl) return; statusEl.textContent = msg; statusEl.className = 'status' + (bad ? ' bad' : ''); }
  function applyCss(stylesObj) {
    var src = stylesObj || state.styles;
    var el = oDoc.getElementById(STYLE_ID);
    if (!el) { el = oDoc.createElement('style'); el.id = STYLE_ID; oDoc.head.appendChild(el); }
    var lines = Object.keys(src).map(function (k) {
      return '  ' + k + ': ' + (src[k] === '' ? 'initial' : src[k]) + ' !important;';
    });
    el.textContent = ':root {\n' + lines.join('\n') + '\n}';
  }
  function rebuildNow(cfgObj) {
    if (typeof window.efc_rebuildNav_v2a !== 'function') { setStatus('엔진(efc_rebuildNav_v2a)을 찾을 수 없습니다. 메뉴바 코드가 이 페이지에 로드되어 있는지 확인하세요.', true); return; }
    try {
      var cfgUse = cfgObj || cleanNav();
      if (mobilePreview && !cfgObj) { cfgUse = clone(cfgUse); cfgUse.mobileBreakpoint = 99999; }
      window.efc_rebuildNav_v2a(cfgUse);
      if (mobilePreview && previewOpen) { var hd0 = oDoc.querySelector('.efc_header_h7k'); if (hd0) hd0.classList.add('is-open'); } setStatus('미리보기 연결됨 · 메뉴 ' + state.nav.menuItems.length + '개 / CTA ' + state.nav.ctaButtons.length + '개' + engineWarn, !!engineWarn); }
    catch (e) { console.error('[NavDash] 메뉴바 재빌드 오류', e); setStatus('재빌드 오류: ' + e.message, true); }
  }
  var rebuildDebounced = debounce(function () { if (peeking) return; rebuildNow(); }, 120);
  var autoSaveDebounced = debounce(function () { autoSaveNow(); }, 1000);
  function touched() { userEdited = true; autoSaveDebounced(); }
  function rebuild() { touched(); rebuildDebounced(); }

  var controls = {};
  function markDirty(v) { var c = controls[v]; if (c) c.wrap.classList.toggle('dirty', state.styles[v] !== state.snap[v]); }
  function setStyle(v, val, user) {
    state.styles[v] = val; markDirty(v); applyCss();
    if (user) touched();
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
    var ft = null;
    if (it.free) ft = h('input', { type: 'text', className: 'inp code', spellcheck: false, style: 'width:100%;margin-top:6px', placeholder: '직접 입력 (예: calc(100vw - 32px), 90vw, 320px)' });
    r.oninput = function () { n.value = r.value; if (ft) ft.value = ''; ctx.commit(r.value + unit); };
    n.oninput = function () { if (n.value === '' || isNaN(+n.value)) return; r.value = n.value; if (ft) ft.value = ''; ctx.commit(n.value + unit); };
    if (ft) ft.onchange = function () {
      var v = ft.value.trim(); if (!v) return;
      if (/^-?[\d.]+$/.test(v)) { r.value = v; n.value = v; ft.value = ''; ctx.commit(v + unit); return; }
      if (/^-?[\d.]+px$/.test(v) && unit === 'px') { var x0 = parseFloat(v); r.value = x0; n.value = x0; ft.value = ''; ctx.commit(v); return; }
      ctx.commit(v);
    };
    var kids = [r, n];
    (it.quick || []).forEach(function (q) {
      kids.push(h('button', { type: 'button', className: 'btn sm', text: q.label, onclick: function () { r.value = q.value; n.value = q.value; if (ft) ft.value = ''; ctx.commit(q.value + unit); } }));
    });
    var row = h('div', { className: 'row' }, kids);
    return {
      el: ft ? h('div', {}, [row, ft]) : row,
      set: function (v) {
        var s = String(v == null ? '' : v).trim(), plain = /^-?[\d.]+(px|%)?$/.test(s), x = parseFloat(s);
        if (!plain || isNaN(x)) { if (ft) ft.value = s; x = parseFloat(it.def); } else if (ft) ft.value = '';
        r.value = x; n.value = x;
      }
    };
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
    var makeInner = mk[it.type];
    var inner = makeInner(it, { commit: function (v) { last = v; ctx.commit(v); } });    var chk = h('input', { type: 'checkbox' });
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
    var makeCtl = mk[it.optional ? 'opt' : it.type];
    var c = makeCtl(it, ctx);
    var rb = h('button', { type: 'button', className: 'rbtn', title: '실행 시점 값으로 되돌리기', text: '↺' });
    var cls = 'item' + (it.det ? ' detOnly' : '') + (it.mode === 'auto' ? ' autoOnly' : '') + (it.mode === 'fixed' ? ' fixedOnly' : '') + (it.panel ? ' panelOnly' : '') + (it.radius ? ' radiusOnly' : '') + (it.result ? ' resultOnly' : '') + (it.pcham ? ' pchamOnly' : '') + (it.ns ? ' needSearch' : '');
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

  /* ───────── 폼 헬퍼 ───────── */
  function btn(text, fn, cls) { return h('button', { type: 'button', className: 'btn sm' + (cls ? ' ' + cls : ''), text: text, onclick: fn }); }
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
    s.onchange = function () { obj[key] = s.value; if (after) after(); refreshModes(); rebuild(); };
    return s;
  }
  function toggle(label, obj, key, after) {
    var i = h('input', { type: 'checkbox' }); i.checked = !!obj[key];
    i.onchange = function () { obj[key] = i.checked; if (after) after(); refreshModes(); rebuild(); };
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
  function dupItem(arr, i, key) { var c = clone(arr[i]); c[key] = str(c[key]) + ' (복사)'; arr.splice(i + 1, 0, c); }
  function ctrlBtns(arr, i, rerender, labelKey) {
    return h('span', { className: 'cbtns' }, [
      h('button', { type: 'button', className: 'rbtn', text: '↑', disabled: i === 0, onclick: function () { move(arr, i, -1); rerender(); rebuild(); } }),
      h('button', { type: 'button', className: 'rbtn', text: '↓', disabled: i === arr.length - 1, onclick: function () { move(arr, i, 1); rerender(); rebuild(); } }),
      h('button', { type: 'button', className: 'rbtn', text: '복제', title: '바로 아래에 같은 내용으로 복제', onclick: function () { dupItem(arr, i, labelKey); rerender(); rebuild(); } }),
      h('button', { type: 'button', className: 'rbtn danger', text: '삭제', onclick: function () { arr.splice(i, 1); rerender(); rebuild(); } })
    ]);
  }
  function parseFaClass(s) { var m = s.match(/class\s*=\s*(["'])(.*?)\1/); return (m ? m[2] : s).trim(); }
  function colorOverride(icon, key, label, gvar) {
    var chk = h('input', { type: 'checkbox' }); chk.checked = !!icon[key];
    var chip = h('input', { type: 'color', className: 'chip' });
    chip.value = icon[key] || (parseColor(state.styles[gvar]) || {}).hex || '#000000'; chip.disabled = !icon[key];
    chk.onchange = function () { if (chk.checked) { icon[key] = chip.value; chip.disabled = false; } else { delete icon[key]; chip.disabled = true; } rebuild(); };
    chip.oninput = function () { icon[key] = chip.value; rebuild(); };
    return h('label', { className: 'ck' }, [chk, h('span', { text: label + ' 개별 지정 (해제 시 글로벌 색 사용)' }), chip]);
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtTime(t) { var d = new Date(t); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()); }

  /* 스위치 상태에 따라 종속 항목 표시/숨김 */
  function refreshModes() {
    var b = pDoc.body, n = state.nav;
    b.classList.toggle('ddAuto', n.detailedWidthMode === 'auto');
    b.classList.toggle('panelOn', !!n.searchPanelCustom);
    b.classList.toggle('radiusOn', !!n.searchRadiusCustom);
    b.classList.toggle('resultOn', !!n.searchResultCustom);
    b.classList.toggle('searchOff', !n.useSearch);
  }

  /* ───────── 설정 행(스위치/입력) 생성 ───────── */
  var settingRows = [];
  function buildSettingRow(def) {
    var wrap = h('div', { className: 'setrow' + (def.ns ? ' needSearch' : ''), 'data-search': str(def.label).toLowerCase() });
    var rr = function () { wrap.textContent = ''; def.build(rr).forEach(function (e) { if (e) wrap.appendChild(e); }); };
    settingRows.push(rr); rr();
    return wrap;
  }
  function refreshSettings() { settingRows.forEach(function (rr) { rr(); }); refreshModes(); }

  /* ───────── 레이아웃 조립 ───────── */
  var app = pDoc.getElementById('app'), modeSel = null, secEls = {};
  statusEl = h('span', { className: 'status', text: '초기화 중…' });
  var filterIn = h('input', { type: 'search', className: 'inp', placeholder: '항목 검색 (이름 / 변수명)', style: 'width:200px' });
  var themeSel = h('select', { className: 'inp', style: 'width:100px' }, [h('option', { value: 'dark', text: '다크모드' }), h('option', { value: 'light', text: '라이트모드' })]);
  var EYE_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  var eyeBtn = h('button', { type: 'button', className: 'btn eye', title: '누르고 있는 동안 사이트 기본(대시보드 실행 시점) 상태를 보여 줍니다. 손을 떼면 작업 중인 값으로 돌아갑니다.', innerHTML: EYE_SVG + '<span>누르는 동안 사이트 기본값</span>' });
  var btnOpenAll = btn('전체 펼치기', function () { setAllOpen(true); });
  var btnCloseAll = btn('전체 접기', function () { setAllOpen(false); });
  var btnQuickSave = btn('현재 상태 저장', function () { saveNewSlot(''); });
  var btnSiteDefault = btn('사이트 기본으로', function () { resetToSite(); });
  /* ───────── 모바일 미리보기 / 적용 진단 ───────── */
  var DIAG = [
    ['--mobileHeaderPaddingX_a9', '.headerInner_i2m', 'padding-left', '37px', '37px'],
    ['--mobileHeaderGap_a10', '.headerRow_r3n', 'column-gap', '23px', '23px'],
    ['--mobileActionGap_o2', '.headerActions_o1a', 'column-gap', '21px', '21px'],
    ['--mobileBarCtaGap_i1', '.mobileBarCtaGroup_m1a', 'column-gap', '19px', '19px'],
    ['--mobileBarCtaFontSize_i2', '.mobileBarCtaBtn_n2b', 'font-size', '17px', '17px'],
    ['--mobilePanelPaddingX_h5', '.mobilePanel_q7m', 'padding-left', '27px', '27px'],
    ['--searchBtnPaddingMobile_j8', '.efc_mobileBarSearchBtn_s8m', 'padding-left', '7px 7px', '7px'],
    ['--logoHeightMobile_b2', '.logoImg_g5q', 'height', '31px', '31px'],
    ['--searchPanelTopMobile_s3', '@panel', 'top', '133px', '133px'],
    ['--searchPanelWidthMobile_s4', '@panel', 'width', '301px', '301px']
  ];
  function runDiagnose() {
    var L = [], hd = oDoc.querySelector('.efc_header_h7k');
    if (!hd) return '헤더가 없습니다. 메뉴바 엔진이 로드되었는지 확인하세요.';
    var win = oDoc.defaultView, mobile = hd.classList.contains('efc_mobileView_m8v');
    L.push('창 폭 ' + win.innerWidth + 'px · 모바일 기준 ' + state.nav.mobileBreakpoint + 'px · 헤더 모바일 모드: ' + (mobile ? '예' : '아니오') + (mobilePreview ? ' (모바일 미리보기 켜짐)' : ''));
    if (!mobile) L.push('→ 모바일 전용 변수는 모바일 모드에서만 화면에 나타납니다. "모바일 미리보기"를 켜세요.');
    if (engineCssState === 'ok') {
      L.push('엔진 CSS: :where 기본값 블록 확인됨');
      if (!/var\(\s*--mobileHeaderGap_a10/.test(engineCssText)) L.push('✗ 엔진 CSS에 --mobileHeaderGap_a10을 쓰는 규칙이 없습니다 → 엔진 CSS 수정안 미반영이거나, 우피의 엔진 주소(커밋 해시)가 옛 버전입니다.');
      if (/\.efc_header_h7k\s*\{[^}]*--mobileActionGap_o2\s*:/.test(engineCssText)) L.push('✗ 엔진 CSS에 예전 모바일 패치(헤더 요소에서 변수를 다시 선언)가 남아 있습니다 → 삭제하세요.');
    } else if (engineCssState === 'notfound') {
      L.push('✗ 엔진 CSS(:where 기본값 블록 포함)를 찾지 못했습니다 → 엔진 CSS가 구버전이거나 주소가 틀렸을 수 있습니다.');
    } else { L.push('엔진 CSS 확인 중…'); }
    var tmp = oDoc.createElement('style'); oDoc.head.appendChild(tmp);
    var root = oDoc.documentElement, ok = 0, bad = 0;
    DIAG.forEach(function (d) {
      var el = d[1] === '@panel' ? (function () { var q = oDoc.querySelector('.notion-quick-find-menu'); return q ? q.parentElement : null; })() : oDoc.querySelector(d[1]);
      if (!el) { L.push('· ' + d[0] + ': 대상 요소 없음' + (d[1] === '@panel' ? ' (검색창을 연 상태에서 다시 진단하세요)' : '')); return; }
      var before = win.getComputedStyle(el).getPropertyValue(d[2]).trim();
      tmp.textContent = ':root{' + d[0] + ':' + d[3] + ' !important}';
      var after = win.getComputedStyle(el).getPropertyValue(d[2]).trim();
      var hv = win.getComputedStyle(hd).getPropertyValue(d[0]).trim(), rv = win.getComputedStyle(root).getPropertyValue(d[0]).trim();
      if (after === d[4]) { ok++; L.push('✓ ' + d[0] + ' : 적용됨'); }
      else if (hv !== rv) { bad++; L.push('✗ ' + d[0] + ' : 헤더 요소가 이 변수를 따로 선언해 덮어씁니다 (예전 모바일 패치 잔존)'); }
      else if (!mobile) { L.push('· ' + d[0] + ' : 모바일 모드가 아니라 확인 불가'); }
      else { bad++; L.push('✗ ' + d[0] + ' : 모바일 모드인데 반영되지 않음 (' + d[1] + ' ' + d[2] + ': ' + before + ' → ' + after + '). 이 변수를 쓰는 규칙이 없거나 다른 규칙이 덮어씁니다'); }
    });
    tmp.remove();
    L.push('결과: 적용 ' + ok + '개 / 문제 ' + bad + '개');
    return L.join('\n');
  }
  var diagBox = h('pre', { style: 'display:none;white-space:pre-wrap;font:11px/1.5 monospace;background:var(--input);border:1px solid var(--bd);border-radius:6px;padding:8px;margin:8px 0 0;max-height:220px;overflow:auto' });
  var btnMobPrev = btn('📱 모바일 미리보기: 꺼짐', function () {
    mobilePreview = !mobilePreview; btnMobPrev.textContent = '📱 모바일 미리보기: ' + (mobilePreview ? '켜짐' : '꺼짐'); rebuildNow();
  });
  var btnMobOpen = btn('☰ 햄버거 열기: 꺼짐', function () {
    previewOpen = !previewOpen; btnMobOpen.textContent = '☰ 햄버거 열기: ' + (previewOpen ? '켜짐' : '꺼짐');
    var hd = oDoc.querySelector('.efc_header_h7k'); if (hd) hd.classList.toggle('is-open', previewOpen && hd.classList.contains('efc_mobileView_m8v'));
  });
  var btnDiag = btn('🔍 적용 진단', function () { diagBox.style.display = 'block'; diagBox.textContent = runDiagnose(); });

  var tocEl = h('div', { className: 'toc' });
  var topEl = h('header', { className: 'top' }, [
    h('div', { className: 'trow' }, [h('h3', { text: '메뉴바 대시보드 2.0' }), h('div', { className: 'row', style: 'width:auto' }, [filterIn, themeSel])]),
    statusEl,
    h('div', { className: 'tbar' }, [btnOpenAll, btnCloseAll, eyeBtn, btnQuickSave, btnSiteDefault, btnMobPrev, btnMobOpen, btnDiag]),
    diagBox, tocEl
  ]);
  app.appendChild(topEl);
  var main = h('main', { className: 'main' }); app.appendChild(main);
  main.appendChild(h('div', { className: 'mut', style: 'margin-bottom:8px', text: '📱 표시 항목은 헤더가 모바일 모드일 때만 보입니다. 상단의 "모바일 미리보기"를 켜거나 창 폭을 mobileBreakpoint 이하로 줄이세요. 맞지 않으면 "적용 진단"을 누르세요.' }));

  function section(id, title, bodyKids, extraClass) {
    var body = h('div', { className: 'sbody' }, bodyKids);
    var det = h('details', { open: true }, [h('summary', { text: title }), body]);
    var sec = h('section', { id: id, className: 'sec' + (extraClass ? ' ' + extraClass : '') }, [det]);
    secEls[id] = { sec: sec, det: det, body: body };
    return secEls[id];
  }
  function setAllOpen(on) { Object.keys(secEls).forEach(function (id) { secEls[id].det.open = on; }); }

  function buildModeRow() {
    modeSel = h('select', { className: 'inp' }, [
      h('option', { value: 'common', text: '공통 적용 (심플형 값을 상세형에도 동기화)' }),
      h('option', { value: 'custom', text: '개별 커스텀 (심플형/상세형 독립 설정)' })
    ]);
    return h('div', { className: 'item', 'data-search': '하위메뉴 서식 적용 방식 공통 개별' }, [h('div', { className: 'lbl', text: '하위메뉴 서식 적용 방식', style: 'margin-bottom:6px' }), modeSel]);
  }

  /* ── 대메뉴 / 하위메뉴 / CTA 빌더 ── */
  var menuAreaEl = h('div'), ctaAreaEl = h('div');
  var newChild = function () { return { title: '새메뉴', url: '#', target: '_self', desc: '', icon: { type: 'none', value: '' } }; };
  function childBox(item, c, ci) {
    var det = item.dropdownStyle === 'detailed';
    var parts = [
      h('div', { className: 'bhead' }, [h('span', { className: 'mut', text: '하위 ' + (ci + 1) }), ctrlBtns(item.children, ci, renderMenu, 'title')]),
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
      h('div', { className: 'bhead' }, [h('b', { className: 'c-y', text: '대메뉴 ' + (i + 1) }), ctrlBtns(state.nav.menuItems, i, renderMenu, 'label')]),
      h('div', { className: 'row2' }, [tin(item, 'label', '이름'), tin(item, 'url', 'URL (하위메뉴가 있으면 보통 #)')]),
      h('div', { className: 'row2' }, row2),
      kids.length ? h('div', { className: 'subs' }, kids) : null,
      kids.length ? h('button', { type: 'button', className: 'btn dash', text: '+ 하위 항목', onclick: function () { item.children.push(newChild()); renderMenu(); rebuild(); } }) : null
    ]);
  }
  function renderMenu() {
    menuAreaEl.textContent = '';
    if (!state.nav.menuItems.length) menuAreaEl.appendChild(h('div', { className: 'mut', text: '대메뉴가 없습니다.', style: 'margin-bottom:8px' }));
    state.nav.menuItems.forEach(function (item, i) { menuAreaEl.appendChild(menuBox(item, i)); });
  }
  function renderCta() {
    ctaAreaEl.textContent = '';
    if (!state.nav.ctaButtons.length) ctaAreaEl.appendChild(h('div', { className: 'mut', text: 'CTA 버튼이 없습니다.', style: 'margin-bottom:8px' }));
    state.nav.ctaButtons.forEach(function (b, i) {
      ctaAreaEl.appendChild(h('div', { className: 'box' }, [
        h('div', { className: 'bhead' }, [h('b', { className: 'c-p', text: 'CTA ' + (i + 1) }), ctrlBtns(state.nav.ctaButtons, i, renderCta, 'label')]),
        h('div', { className: 'row2' }, [tin(b, 'label', '이름'), tin(b, 'url', 'URL')]),
        h('div', { className: 'row2' }, [sel(b, 'variant', { solid: '채우기 (solid)', outline: '테두리 (outline)' }), sel(b, 'target', TARGETS), toggle('모바일 상단바 노출', b, 'showOnMobileBar')])
      ]));
    });
  }
  function buildContentSection(s) {
    var logoRow = buildSettingRow(SET('로고 주소 이미지 url mobileUrl alt 링크 link', function () {
      var d = state.nav;
      return [
        fld('로고 이미지 URL (PC 기본)', tin(d.logo, 'url', '로고 이미지 URL')),
        fld('모바일 로고 URL (비우면 PC 로고와 동일)', tin(d.logo, 'mobileUrl', '비워 두면 PC 로고 사용')),
        fld('로고 Alt (대체 텍스트)', tin(d.logo, 'alt', 'Alt')),
        fld('로고 클릭 링크', tin(d.logo, 'link', '/'))
      ];
    }));
    return section(s.id, s.title, [
      h('div', { className: 'subhead', text: '로고 주소' }), logoRow,
      h('div', { className: 'subhead', text: '대메뉴 / 하위메뉴 빌더' }), menuAreaEl,
      h('button', { type: 'button', className: 'btn dash', text: '+ 대메뉴 추가', onclick: function () { state.nav.menuItems.push({ label: '새메뉴', url: '#', target: '_self', children: [] }); renderMenu(); rebuild(); } }),
      h('div', { className: 'subhead', text: '우측 CTA 버튼 빌더' }), ctaAreaEl,
      h('button', { type: 'button', className: 'btn dash', text: '+ CTA 버튼 추가', onclick: function () { state.nav.ctaButtons.push({ label: '새버튼', url: '#', target: '_self', variant: 'solid', showOnMobileBar: false }); renderCta(); rebuild(); } })
    ], 'keep');
  }

  /* ───────── 저장 슬롯 (localStorage) ───────── */
  var STORE_KEY = 'efc_menubar_dashboard_v2', MAX_SLOTS = 10;
  var storageOk = (function () { try { var k = '__efc_t'; window.localStorage.setItem(k, '1'); window.localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  function loadStore() {
    var s = null;
    try { var raw = window.localStorage.getItem(STORE_KEY); s = raw ? JSON.parse(raw) : null; } catch (e) { s = null; }
    if (!isObj(s)) s = {};
    if (!Array.isArray(s.slots)) s.slots = [];
    return s;
  }
  function saveStore(s) { try { window.localStorage.setItem(STORE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }
  function snapshotNow() { return { styles: clone(state.styles), nav: cleanNav() }; }
  function countChanges(styles, nav) {
    var n = 0;
    VAR_ITEMS.forEach(function (it) {
      var a = (isObj(styles) && Object.prototype.hasOwnProperty.call(styles, it.v)) ? styles[it.v] : (it.optional ? '' : state.snap[it.v]);
      if (a !== state.snap[it.v]) n++;
    });
    var base = cleanNav(state.navSnap), cur = isObj(nav) ? nav : base;
    Object.keys(cur).forEach(function (k) { if (JSON.stringify(cur[k]) !== JSON.stringify(base[k])) n++; });
    return n;
  }
  function autoSaveNow() {
    if (!storageOk || suspendAuto || peeking || !userEdited) return;
    var st = loadStore(), snap = snapshotNow();
    st.auto = { t: Date.now(), styles: snap.styles, nav: snap.nav };
    if (saveStore(st)) renderSlots();
  }
  function saveNewSlot(name) {
    if (!storageOk) { setStatus('이 브라우저에서는 저장소를 사용할 수 없습니다.', true); return; }
    var st = loadStore();
    if (st.slots.length >= MAX_SLOTS) { setStatus('저장 슬롯이 가득 찼습니다(최대 ' + MAX_SLOTS + '개). 삭제하거나 덮어쓰기를 사용하세요.', true); return; }
    var snap = snapshotNow(), t = Date.now();
    st.slots.unshift({ id: 's' + t + '_' + Math.floor(Math.random() * 1000), t: t, name: str(name).trim() || fmtTime(t), styles: snap.styles, nav: snap.nav });
    if (!saveStore(st)) { setStatus('저장 실패: 브라우저 저장소 용량 또는 권한을 확인하세요.', true); return; }
    renderSlots(); setStatus('슬롯에 저장했습니다 · ' + fmtTime(t));
  }
  function overwriteSlot(id) {
    var st = loadStore(), snap = snapshotNow(), t = Date.now();
    for (var i = 0; i < st.slots.length; i++) if (st.slots[i].id === id) { st.slots[i].t = t; st.slots[i].styles = snap.styles; st.slots[i].nav = snap.nav; }
    if (saveStore(st)) { renderSlots(); setStatus('슬롯을 덮어썼습니다 · ' + fmtTime(t)); } else setStatus('저장 실패', true);
  }
  function renameSlot(id) {
    var st = loadStore(), sl = st.slots.filter(function (x) { return x.id === id; })[0];
    if (!sl) return;
    var nm = popup.prompt('슬롯 이름', sl.name);
    if (nm === null || nm === undefined) return;
    sl.name = str(nm).trim() || sl.name;
    if (saveStore(st)) renderSlots();
  }
  function deleteSlot(id, isAuto) {
    if (!popup.confirm(isAuto ? '자동 저장본을 삭제할까요?' : '이 슬롯을 삭제할까요?')) return;
    var st = loadStore();
    if (isAuto) delete st.auto; else st.slots = st.slots.filter(function (x) { return x.id !== id; });
    if (saveStore(st)) renderSlots();
  }
  function pushUndo() { undoState = snapshotNow(); btnUndo.style.display = ''; }
  function undoLast() {
    if (!undoState) return;
    var u = undoState; undoState = null; btnUndo.style.display = 'none';
    applyState(u.styles, u.nav); touched(); setStatus('직전 상태로 되돌렸습니다');
  }
  function loadSlot(sl) {
    pushUndo(); applyState(sl.styles, sl.nav); touched();
    setStatus('불러왔습니다 · ' + fmtTime(sl.t));
  }
  function resetToSite() {
    if (!popup.confirm('편집 중인 내용을 폐기하고 사이트 기본(대시보드 실행 시점) 상태로 되돌립니다.\n저장 슬롯은 그대로 남고, 직전 상태는 "직전 상태로 되돌리기"로 복구할 수 있습니다.')) return;
    pushUndo(); applyState(state.snap, state.navSnap); touched();
    setStatus('사이트 기본(실행 시점) 상태로 되돌렸습니다');
  }
  /* 저장본/가져온 값을 화면 전체에 반영 (없는 항목은 사이트 기본값, 선택 변수는 미설정) */
  function applyState(stylesIn, navIn) {
    VAR_ITEMS.forEach(function (it) {
      var has = isObj(stylesIn) && Object.prototype.hasOwnProperty.call(stylesIn, it.v);
      var v = has ? str(stylesIn[it.v]).trim() : (it.optional ? '' : state.snap[it.v]);
      if (!v && !it.optional) v = state.snap[it.v];
      if (it.alias && it.alias[v]) v = it.alias[v];
      state.styles[it.v] = v;
    });
    state.nav = normalizeNav(navIn, state.navSnap);
    applyCss();
    VAR_ITEMS.forEach(function (it) { controls[it.v].set(state.styles[it.v]); markDirty(it.v); });
    var differs = Object.keys(SYNC).some(function (k) { return state.styles[k] !== state.styles[SYNC[k]]; });
    setMode(!differs, false);
    refreshSettings(); renderMenu(); renderCta();
    rebuildNow();
  }
  function slotRow(isAuto, sl) {
    var info = h('div', { className: 'meta' }, [
      h('div', { className: 'lbl', text: isAuto ? '자동 저장' : sl.name }),
      h('div', { className: 'mut', text: fmtTime(sl.t) + ' · 사이트 기본 대비 변경 ' + countChanges(sl.styles, sl.nav) + '개' })
    ]);
    var bs = [btn('불러오기', function () { loadSlot(sl); })];
    if (!isAuto) { bs.push(btn('덮어쓰기', function () { overwriteSlot(sl.id); })); bs.push(btn('이름', function () { renameSlot(sl.id); })); }
    bs.push(btn('삭제', function () { deleteSlot(sl.id, isAuto); }, 'danger'));
    return h('div', { className: 'slot' }, [info, h('span', { className: 'cbtns' }, bs)]);
  }
  var slotArea = h('div');
  function renderSlots() {
    slotArea.textContent = '';
    if (!storageOk) { slotArea.appendChild(h('div', { className: 'warn', text: '이 브라우저에서는 저장소를 사용할 수 없어 저장 기능이 꺼져 있습니다. (가져오기와 코드 복사는 사용할 수 있습니다)' })); return; }
    var st = loadStore();
    if (st.auto) slotArea.appendChild(slotRow(true, st.auto));
    st.slots.forEach(function (sl) { slotArea.appendChild(slotRow(false, sl)); });
    if (!st.auto && !st.slots.length) slotArea.appendChild(h('div', { className: 'mut', text: '저장된 슬롯이 없습니다.', style: 'padding:6px 0' }));
  }

  /* ───────── 가져오기 ───────── */
  function extractConfigText(text) {
    var m = text.search(/window\.efcMenubarConfig\s*=/);
    if (m < 0) return null;
    var i = text.indexOf('{', m);
    if (i < 0) return { error: '설정 객체의 시작 중괄호를 찾지 못했습니다' };
    var depth = 0, inStr = null, esc = false, n = text.length;
    for (var j = i; j < n; j++) {
      var ch = text.charAt(j);
      if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === inStr) inStr = null; continue; }
      if (ch === '"' || ch === "'") { inStr = ch; continue; }
      if (ch === '/' && text.charAt(j + 1) === '/') { while (j < n && text.charAt(j) !== '\n') j++; continue; }
      if (ch === '/' && text.charAt(j + 1) === '*') { j += 2; while (j < n && !(text.charAt(j) === '*' && text.charAt(j + 1) === '/')) j++; j++; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) return { start: m, end: j + 1, body: text.slice(i, j + 1) }; }
    }
    return { error: '설정 객체의 중괄호가 닫히지 않았습니다 (코드가 중간에 잘렸는지 확인하세요)' };
  }
  function lenientJson(src) {
    var parts = [], buf = '', i = 0, n = src.length;
    function flush() { if (buf) { parts.push({ s: false, t: buf }); buf = ''; } }
    while (i < n) {
      var ch = src.charAt(i), nx = src.charAt(i + 1);
      if (ch === '"' || ch === "'") {
        flush();
        var q = ch, body = ''; i++;
        while (i < n && src.charAt(i) !== q) {
          if (src.charAt(i) === '\\') { body += src.charAt(i) + src.charAt(i + 1); i += 2; } else { body += src.charAt(i); i++; }
        }
        i++;
        if (q === "'") body = body.replace(/\\'/g, "'").replace(/"/g, '\\"');
        parts.push({ s: true, t: '"' + body + '"' });
        continue;
      }
      if (ch === '/' && nx === '/') { while (i < n && src.charAt(i) !== '\n') i++; continue; }
      if (ch === '/' && nx === '*') { i += 2; while (i < n && !(src.charAt(i) === '*' && src.charAt(i + 1) === '/')) i++; i += 2; continue; }
      buf += ch; i++;
    }
    flush();
    return parts.map(function (p) {
      if (p.s) return p.t;
      return p.t.replace(/,(\s*[}\]])/g, '$1').replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3');
    }).join('');
  }
  function stripMedia(css) {
    var out = '', i = 0, skipped = 0;
    while (i < css.length) {
      var k = css.indexOf('@media', i);
      if (k < 0) { out += css.slice(i); break; }
      out += css.slice(i, k);
      var b = css.indexOf('{', k); if (b < 0) break;
      var depth = 0, j = b;
      for (; j < css.length; j++) { var c = css.charAt(j); if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { j++; break; } } }
      skipped += (css.slice(b, j).match(/--[A-Za-z0-9_]+\s*:/g) || []).length;
      i = j;
    }
    return { css: out, skipped: skipped };
  }
  function parseImport(text) {
    var res = { vars: {}, unknown: [], cfg: null, unknownKeys: [], error: null };
    var info = extractConfigText(text), cssText = text;
    if (info && info.error) { res.error = info.error; return res; }
    if (info) {
      cssText = text.slice(0, info.start) + ' ' + text.slice(info.end);
      try { res.cfg = JSON.parse(lenientJson(info.body)); } catch (e) { res.error = '설정 객체를 읽지 못했습니다: ' + e.message; return res; }
      if (!isObj(res.cfg)) { res.error = '설정 객체 형식이 올바르지 않습니다'; res.cfg = null; return res; }
      Object.keys(res.cfg).forEach(function (k) { if (!(k in NAV_DEFAULT)) res.unknownKeys.push(k); });
    }
    cssText = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    var sm = stripMedia(cssText); cssText = sm.css;
    if (sm.skipped) res.unknown.push('(@media 블록 안의 변수 ' + sm.skipped + '개는 PC 값이 아니므로 읽지 않았습니다)');
    var re = /(--[A-Za-z0-9_]+)\s*:\s*([^;{}]+?)\s*(?:!important)?\s*(?:;|(?=\}))/g, m;
    while ((m = re.exec(cssText))) {
      var name = m[1], val = m[2].trim();
      if (VAR_BY_NAME[name]) res.vars[name] = val; else if (res.unknown.indexOf(name) < 0) res.unknown.push(name);
    }
    return res;
  }
  var importText = h('textarea', { className: 'imp', spellcheck: false, placeholder: '이전에 "코드 출력하기"로 복사한 코드(style 블록 + script 블록)를 붙여 넣으세요. 압축 복사본도 읽습니다.' });
  var importSum = h('div', { className: 'sum' });
  var parsedImport = null;
  var btnApplyImport = btn('적용', function () { applyImport(); });
  btnApplyImport.disabled = true;
  var btnUndo = btn('직전 상태로 되돌리기', function () { undoLast(); });
  btnUndo.style.display = 'none';
  function analyzeImport() {
    var text = importText.value || '';
    parsedImport = null; btnApplyImport.disabled = true;
    importSum.textContent = ''; importSum.style.display = 'block';
    if (!str(text).trim()) { importSum.appendChild(h('div', { text: '붙여 넣은 코드가 없습니다.' })); return; }
    var r = parseImport(text);
    if (r.error) { importSum.appendChild(h('div', { className: 'warn', text: r.error })); return; }
    var nv = Object.keys(r.vars).length;
    if (!nv && !r.cfg) { importSum.appendChild(h('div', { className: 'warn', text: '인식할 수 있는 변수나 설정 객체가 없습니다. 코드 출력 결과를 그대로 붙여 넣었는지 확인하세요.' })); return; }
    importSum.appendChild(h('div', { text: '변수 ' + nv + '개 인식' + (r.unknown.length ? ' · 알 수 없는 변수 ' + r.unknown.length + '개는 무시: ' + r.unknown.slice(0, 6).join(', ') + (r.unknown.length > 6 ? ' …' : '') : '') }));
    importSum.appendChild(h('div', { text: r.cfg ? '설정 키 ' + Object.keys(r.cfg).length + '개 인식' + (r.unknownKeys.length ? ' · 알 수 없는 키 ' + r.unknownKeys.length + '개는 무시: ' + r.unknownKeys.join(', ') : '') : '설정 객체가 없어 설정은 사이트 기본값으로 채웁니다' }));
    importSum.appendChild(h('div', { className: 'mut', text: '적용하면 화면 전체가 이 코드로 교체됩니다. 코드에 없는 변수는 사이트 기본값, 선택 변수는 미설정이 됩니다.' }));
    parsedImport = r; btnApplyImport.disabled = false;
  }
  function applyImport() {
    if (!parsedImport) return;
    var r = parsedImport;
    pushUndo(); applyState(r.vars, r.cfg); touched();
    setStatus('가져오기를 적용했습니다 · 변수 ' + Object.keys(r.vars).length + '개' + (r.cfg ? ' / 설정 키 ' + Object.keys(r.cfg).length + '개' : ''));
    importSum.style.display = 'none'; btnApplyImport.disabled = true; parsedImport = null;
  }

  /* ───────── 눈 아이콘: 누르는 동안 사이트 기본값 보기 ───────── */
  function peekStart() {
    if (peeking) return;
    peeking = true; suspendAuto = true;
    pDoc.body.classList.add('peek'); eyeBtn.classList.add('on');
    applyCss(state.snap); rebuildNow(cleanNav(state.navSnap));
    setStatus('👁 사이트 기본(대시보드 실행 시점) 상태를 보는 중입니다 · 손을 떼면 작업 중인 값으로 돌아갑니다');
  }
  function peekEnd() {
    if (!peeking) return;
    peeking = false; suspendAuto = false;
    pDoc.body.classList.remove('peek'); eyeBtn.classList.remove('on');
    applyCss(); rebuildNow();
  }
  eyeBtn.onpointerdown = function (e) { try { eyeBtn.setPointerCapture(e.pointerId); } catch (x) { /* 무시 */ } if (e.preventDefault) e.preventDefault(); peekStart(); };
  eyeBtn.onpointerup = peekEnd; eyeBtn.onpointercancel = peekEnd; eyeBtn.onlostpointercapture = peekEnd; eyeBtn.onblur = peekEnd;
  eyeBtn.onkeydown = function (e) { if (e.key === ' ' || e.key === 'Enter') { if (e.preventDefault) e.preventDefault(); if (!e.repeat) peekStart(); } };
  eyeBtn.onkeyup = function (e) { if (e.key === ' ' || e.key === 'Enter') peekEnd(); };
  popup.addEventListener('blur', peekEnd);

  /* ───────── 구역 조립 ───────── */
  var noticeEl = h('div');
  var slotNameIn = h('input', { type: 'text', className: 'inp', placeholder: '슬롯 이름 (비우면 날짜·시각)' });
  section('sec-tools', '저장 · 가져오기', [
    noticeEl,
    h('div', { className: 'subhead', text: '저장 슬롯 (사용자 최대 ' + MAX_SLOTS + '개 + 자동 저장 1개)' }),
    h('div', { className: 'row' }, [slotNameIn, btn('현재 상태 저장', function () { saveNewSlot(slotNameIn.value); slotNameIn.value = ''; })]),
    slotArea,
    h('div', { className: 'mut', text: '저장 슬롯은 이 사이트(주소)의 브라우저에만 저장됩니다. 편집할 때마다 자동 저장본이 갱신됩니다.' }),
    h('div', { className: 'subhead', text: '가져오기 (붙여 넣은 코드로 화면 전체 교체)' }),
    importText,
    h('div', { className: 'row', style: 'margin-top:8px' }, [btn('분석', function () { analyzeImport(); }), btnApplyImport, btn('지우기', function () { importText.value = ''; importSum.style.display = 'none'; btnApplyImport.disabled = true; parsedImport = null; })]),
    importSum,
    h('div', { className: 'subhead', text: '사이트 기본 상태' }),
    h('div', { className: 'row' }, [btn('사이트 기본으로 되돌리기 (무효화)', function () { resetToSite(); }), btnUndo])
  ], 'keep');
  main.appendChild(secEls['sec-tools'].sec);

  SECTIONS.forEach(function (s) {
    if (s.content) { main.appendChild(buildContentSection(s).sec); return; }
    var kids = [];
    s.blocks.forEach(function (b) {
      if (b.v) kids.push(buildItem(b));
      else if (b.k === 'head') kids.push(h('div', { className: 'subhead' + (b.ns ? ' needSearch' : ''), text: b.text }));
      else if (b.k === 'set') kids.push(buildSettingRow(b));
      else if (b.k === 'mode') kids.push(buildModeRow());
    });
    main.appendChild(section(s.id, s.title, kids, 'styleSec').sec);
  });

  [{ id: 'sec-tools', toc: '저장·가져오기' }].concat(SECTIONS).forEach(function (s) {
    var a = h('a', { text: s.toc, href: '#' + s.id });
    a.onclick = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var o = secEls[s.id]; if (!o) return;
      o.det.open = true;
      o.sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    tocEl.appendChild(a);
  });

  /* ───────── 내보내기 ───────── */
  var exportBox = h('textarea', { spellcheck: false });
  var warnBox = h('div');
  var sizeInfo = h('div', { className: 'mut', style: 'margin-top:6px;line-height:1.6' });
  var baseIn = h('input', { type: 'text', className: 'inp', placeholder: '예: https://example.com (비우면 주소를 줄이지 않음)', value: (state.nav && state.nav.base) || '' });
  var OOPY_LIMIT = 10425;
  function updateSizeInfo() {
    var slim = buildExport(true), full = buildExport(false);
    var src = engineCssDefaults ? '엔진 CSS 실시간' : '내장 기본값(엔진 CSS를 읽지 못함)';
    sizeInfo.textContent = '우피용(최소) ' + slim.length.toLocaleString() + '자' + (slim.length > OOPY_LIMIT ? ' ⚠ 한도 초과' : ' · 한도 ' + OOPY_LIMIT.toLocaleString() + '자 이내') + ' / 전체(백업용) ' + full.length.toLocaleString() + '자 · 기본값 기준: ' + src;
  }
  function showExport(min) {
    exportBox.value = buildExport(min);
    updateSizeInfo();
  }
  var exportArea = h('section', { className: 'xa' }, [
    h('div', { className: 'lbl', text: '우피에 붙여넣을 코드 (엔진 기본값과 같은 값은 빠져 있습니다)', style: 'margin-bottom:8px' }), warnBox, exportBox, sizeInfo,
    h('div', { className: 'row2', style: 'margin-top:10px' }, [h('span', { className: 'mut', text: '공통 주소(base)' }), baseIn]),
    h('div', { className: 'row', style: 'margin-top:10px' }, [
      h('button', { type: 'button', className: 'btn pri', text: '우피용 복사 (최소)', onclick: function () { showExport(true); copyText(exportBox.value, '우피용 코드가 복사되었습니다.'); } }),
      h('button', { type: 'button', className: 'btn sec2', text: '전체 복사 (백업용)', onclick: function () { showExport(false); copyText(exportBox.value, '전체 코드가 복사되었습니다.'); } })
    ])
  ]);
  var footer = h('footer', { className: 'foot' }, [h('button', { type: 'button', className: 'btn exp', text: '코드 출력하기 (우피용)', onclick: function () {
    showExport(true);
    var w = validate(); warnBox.textContent = '';
    if (w.length) warnBox.appendChild(h('div', { className: 'warn', text: '확인 필요: ' + w.join(' / ') }));
    exportArea.style.display = 'block'; exportArea.scrollIntoView({ behavior: 'smooth' });
  } })]);
  app.appendChild(exportArea); app.appendChild(footer);

  function eqVal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  var _cc = null;
  function canonColor(v) {
    try {
      if (!(popup.CSS || window.CSS).supports('color', v)) return null;
      if (!_cc) { _cc = oDoc.createElement('span'); _cc.style.display = 'none'; oDoc.body.appendChild(_cc); }
      _cc.style.color = ''; _cc.style.color = v;
      return oDoc.defaultView.getComputedStyle(_cc).color;
    } catch (e) { return null; }
  }
  function normCss(s) {
    var v = String(s).trim(), c = canonColor(v);
    if (c) return 'c:' + c;
    return v.replace(/\s+/g, '').toLowerCase().replace(/(\d)\.0+(?=\D|$)/g, '$1');
  }
  var engineCssDefaults = null, engineCssText = '', engineCssState = 'loading';
  function loadEngineCssDefaults() {
    var hrefs = [].slice.call(oDoc.querySelectorAll('link[rel="stylesheet"]')).map(function (l) { return l.href; }).filter(Boolean);
    (function next(i) {
      if (i >= hrefs.length) { if (!engineCssDefaults) engineCssState = 'notfound'; return; }
      fetch(hrefs[i]).then(function (r) { return r.text(); }).then(function (txt) {
        var m = txt.match(/:where\(\s*:root\s*\)\s*\{([^}]*)\}/);
        if (!m) return next(i + 1);
        var map = {}, re = /(--[\w-]+)\s*:\s*([^;]+);/g, x;
        while ((x = re.exec(m[1]))) map[x[1]] = x[2].trim();
        engineCssDefaults = map; engineCssText = txt; engineCssState = 'ok';
      }).catch(function () { next(i + 1); });
    })(0);
  }
  loadEngineCssDefaults();
  function activeDefaults() { return engineCssDefaults || EMBEDDED_CSS_DEFAULTS; }

  function slimNav(n, base) {
    var D = NAV_DEFAULT, o = {};
    Object.keys(n).forEach(function (k) {
      if (k === 'menuItems' || k === 'ctaButtons' || k === 'base') return;
      if ((k === 'logo' || k === 'searchResultShow') && n[k] && typeof n[k] === 'object') {
        var sub = {};
        Object.keys(n[k]).forEach(function (q) { if (!eqVal(n[k][q], D[k][q])) sub[q] = n[k][q]; });
        if (Object.keys(sub).length) o[k] = sub;
        return;
      }
      if (!(k in D) || !eqVal(n[k], D[k])) o[k] = n[k];
    });
    if (base) o.base = base;
    function rel(u) { return (base && typeof u === 'string' && u.indexOf(base + '/') === 0) ? u.slice(base.length) : u; }
    function put(r, u) { if (u && u !== '#') r.url = rel(u); }
    o.menuItems = (n.menuItems || []).map(function (m) {
      var r = { label: m.label }; put(r, m.url);
      if (m.target && m.target !== '_self') r.target = m.target;
      if (typeof m.showArrow === 'boolean') r.showArrow = m.showArrow;
      if (m.children && m.children.length) {
        if (m.dropdownStyle && m.dropdownStyle !== n.defaultDropdownStyle) r.dropdownStyle = m.dropdownStyle;
        r.children = m.children.map(function (c) {
          var x = { title: c.title }; put(x, c.url);
          if (c.target && c.target !== '_self') x.target = c.target;
          if (c.desc) x.desc = c.desc;
          if (c.icon && c.icon.type && c.icon.type !== 'none' && c.icon.value) x.icon = c.icon;
          return x;
        });
      }
      return r;
    });
    o.ctaButtons = (n.ctaButtons || []).map(function (b) {
      var r = { label: b.label }; put(r, b.url);
      if (b.target && b.target !== '_self') r.target = b.target;
      if (b.variant && b.variant !== 'solid') r.variant = b.variant;
      if (b.showOnMobileBar) r.showOnMobileBar = true;
      return r;
    });
    return o;
  }

  function buildExport(min) {
    var bv = baseIn.value.trim().replace(/\/+$/, '');
    if (!bv && state.nav && state.nav.base) { bv = String(state.nav.base).replace(/\/+$/, ''); baseIn.value = bv; }
    if (state.nav) state.nav.base = bv;
    var css;
    if (min) {
      var defs = activeDefaults();
      var keys = Object.keys(state.styles).filter(function (k) {
        if (state.styles[k] === '') return false;
        return !((k in defs) && normCss(defs[k]) === normCss(state.styles[k]));
      });
      css = '<style>:root{' + keys.map(function (k) { return k + ':' + state.styles[k] + ';'; }).join('') + '}</style>';
      var sj = JSON.stringify(slimNav(cleanNav(), bv)).replace(/<\//g, '<\\/');
      return css + '<script>window.efcMenubarConfig=' + sj + ';</scr' + 'ipt>';
    }
    var out = ['<style>', '  :root {'];
    VAR_GROUPS.forEach(function (g) {
      out.push('    /* ── ' + g.title + ' ── */');
      g.items.forEach(function (it) {
        if (state.styles[it.v] === '') return;
        out.push('    ' + it.v + ': ' + state.styles[it.v] + '; /* ' + it.label + ' */');
      });
    });
    out.push('  }', '</style>'); css = out.join('\n');
    var json = JSON.stringify(cleanNav(), null, 4).replace(/<\//g, '<\\/');
    return css + '\n\n<script>\n  window.efcMenubarConfig = ' + json + ';\n</scr' + 'ipt>';
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
    pDoc.body.classList.toggle('filtering', !!q);
    pDoc.querySelectorAll('[data-search]').forEach(function (el) { el.classList.toggle('fx', !!q && el.getAttribute('data-search').indexOf(q) < 0); });
    pDoc.querySelectorAll('.sec.styleSec').forEach(function (s) {
      var any = s.querySelector('[data-search]:not(.fx)'); s.style.display = (!q || any) ? '' : 'none';
      if (q && any) s.querySelector('details').open = true;
    });
  };
  function refreshTopH() { try { var hgt = topEl.offsetHeight; if (hgt) main.style.setProperty('--topH', hgt + 'px'); } catch (e) { /* 무시 */ } }
  popup.addEventListener('resize', refreshTopH);
  popup.addEventListener('pagehide', function () {
    var s = oDoc.getElementById(STYLE_ID); if (s) s.remove();
    try { if (typeof window.efc_rebuildNav_v2a === 'function') window.efc_rebuildNav_v2a(cleanNav(state.navSnap)); } catch (e) { /* 무시 */ }
  });

  /* ───────── 시작 ───────── */
  var differs0 = Object.keys(SYNC).some(function (k) { return state.styles[k] !== state.styles[SYNC[k]]; });
  setMode(!differs0, false);
  refreshSettings(); renderMenu(); renderCta(); renderSlots(); applyCss();
  if (typeof window.efc_rebuildNav_v2a === 'function' &&!/desktopHamburger/.test(String(window.efc_rebuildNav_v2a))) {
    engineWarn = ' · 주의: 현재 엔진이 신규 검색 옵션(검색창 모서리, 검색 결과 커스텀 등)을 지원하지 않는 버전입니다. 엔진을 20261004 버전으로 교체하세요';
  }
  if (storageOk) {
    var st0 = loadStore();
    if (st0.auto) {
      noticeEl.appendChild(h('div', { className: 'notice' }, [
        h('div', { text: '이전 자동 저장본이 있습니다 (' + fmtTime(st0.auto.t) + ', 사이트 기본 대비 변경 ' + countChanges(st0.auto.styles, st0.auto.nav) + '개). 수정을 시작하면 자동 저장본이 새 내용으로 바뀝니다.' }),
        h('div', { className: 'row', style: 'margin-top:6px' }, [
          btn('불러오기', function () { loadSlot(st0.auto); noticeEl.textContent = ''; }),
          btn('무시', function () { noticeEl.textContent = ''; })
        ])
      ]));
    }
  }
  if (!hasSrc) setStatus('window.efcMenubarConfig 가 없어 기본값으로 시작합니다. 메뉴바 코드가 먼저 로드되어야 합니다.', true);
  else setStatus('미리보기 연결 중…');
  rebuildDebounced();
  refreshTopH(); setTimeout(refreshTopH, 400);
}();