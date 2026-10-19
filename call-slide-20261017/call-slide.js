//  <!-- 콜슬라이드 call-slide 디자인 -->
// <script src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/call-slide-20261017/call-slide.js" defer></script>




// =========================================================
// call-slide.js · v1.6.0 · 대시보드 연결 API / 비율·BLEED 실시간 / 미리보기 창
// 목적: 노션/우피 상위 콜아웃의 직속 하위 콜아웃을 가로 슬라이더로 표시한다.
// 필수: core.js v1.2.0 이상. 로드 순서: core.js → call-slide.js → call-card.js
// 기존 변수명·클래스명·CSS 변수 접미사는 유지한다. 새 기능에 필요한 이름만 추가했다.
// ---------------------------------------------------------
// [빠른 사용법]
//  1. 상위 콜아웃에 [% call-slide :: W 400px :: IMG BG :: RT 4:5 %]를 별도 줄로 적는다.
//  2. 그 안에 하위 콜아웃을 만든다. 직속 하위 콜아웃만 슬라이드로 수집한다.
//     노션 컬럼 안에 배치된 직속 하위 콜아웃도 포함하며, 손자는 수집하지 않는다.
//  3. 슬라이드의 첫 이미지 캡션에 OL·URL을 적는다. 예: OL BLACK 0.4 B 0 75, URL NEW /about
//  4. 이 파일은 태그 없는 JS이다. 노션 코드 삽입에는 script 태그로 감싸고 외부 JS 로드에는 그대로 쓴다.
//  5. 이전 call-slide 코드는 제거한 뒤 새로고침한다. 콘솔에 새 코드를 덧붙여 교체하지 않는다.
//
// [토큰 파라미터: 짧은 이름 / 긴 이름 / 기본값 / 설명]
//  GAP / GAP               20px        슬라이드 간격
//  W / WIDTH               400px       PC 카드 폭
//  MW / MOBILE_WIDTH       280px       모바일 카드 폭 (기존 모바일 CSS 정책 유지)
//  RT / RATIO              AUTO        비율. AUTO 또는 4:5, 16/9. 고정 비율은 BG에서 사용
//  AUTO / AUTOPLAY         1           자동 재생: 1/0, ON/OFF, TRUE/FALSE, YES/NO, Y/N
//  ITV / INTERVAL          3s          재생 간격. 단위 없는 숫자는 초. 최소 1초
//  HP / HOVER_PAUSE        1           마우스가 위에 있으면 자동 재생 중지
//  TC / TEXT_COLOR         AUTO        글자색: AUTO, WHITE, BLACK, #hex
//  TA / TEXT_ALIGN         BL          세로 T/C/B + 가로 L/C/R (예: TL, CC, BR)
//  IMG / IMAGE_MODE        FIT         FIT / FULL / BG
//  LI / LEFT_ICON          fa-solid fa-angle-left   왼쪽 화살표 클래스
//  RI / RIGHT_ICON         비움        오른쪽 화살표 클래스. 비우면 왼쪽 반전
//  IP / ICON_POSITION      BL          BL, BC, BR, CL, CR, CC, CB
//  BLEED / BLEED           NONE        NONE / LEFT / RIGHT / BOTH
//  BX / RADIUS             16px        슬라이드 외곽 모서리
//  SH / SHADOW             none        CSS box-shadow
//  FR / FIT_RADIUS         비움        기존 호환용으로 읽기만 함. 화면 반영 없음
//  길이 값에는 px, %, em, rem, vw, vh 같은 단위를 적는다. 예: W 360px
//  짧은 이름이 긴 이름보다 우선한다. v1.5.0은 키의 소문자를 대문자로 정규화한다.
//
// [이미지 캡션]
//  OL 색 진하기 방향 시작 끝: 예) OL BLACK 0.4 B 0 75
//  색: BLACK, WHITE, #RGB/#RGBA/#RRGGBB/#RRGGBBAA, rgba(r,g,b,a)
//  진하기 기본 0.4. 방향 A=전체 균일, T/B/L/R=해당 방향이 진하고 반대 방향으로 옅어짐.
//  범위 기본 0~65%. 기존 호환을 위해 범위 밖 숫자는 제한 범위로 보정한다.
//  URL 주소 / URL NEW 주소: 기본 현재 창, NEW는 새 탭. SELF/BLANK도 기존 호환.
//  허용 주소: http(s), mailto, tel, sms, / ./ ../ # ? 상대경로. 한글 주소 지원.
//  주소에 쉼표가 있으면 따옴표로 감싼다. javascript: 등 위험한 프로토콜은 거부한다.
//  캡션의 FIT/FULL/BG는 무시한다. 이미지 모드는 상위 슬라이더 IMG로 결정한다.
//  콜아웃마다 첫 이미지만 모드 처리 대상으로 삼는다. 캡션은 숨긴다.
//
// [카드 아이콘 / 이동 화살표 구분]
//  콜아웃 아이콘은 call-card처럼 제목 위의 박스로 표시한다. 상단 이미지가 있으면 그 아래에 둔다.
//  공통 변수: --ce-card-icon 52px / --ce-card-icon-radius 10px / --ce-card-icon-bg #f2f3f5
//  모바일 크기 비율: --ce-card-ratio-is → --ce-card-ratio-size → 0.75
//  카드 아이콘은 call-card 공통 변수를 함께 쓴다. 아래 --slide-icon-*는 이동 화살표 버튼이다.
//
// [공통 CSS 변수: :root에 지정]
//  --slide-gap_k7M:20px              --slide-width_p4R:400px
//  --slide-mobile-width_v2Q:280px    --slide-ratio_t8A:AUTO
//  --slide-autoplay_n3F:1            --slide-interval_h9L:3s
//  --slide-hover-pause_r1C:1         --slide-text-color_b5J:AUTO
//  --slide-text-align_q2E:BL         --slide-image-mode_h3W:FIT
//  --slide-left-icon_m4V:fa-solid fa-angle-left   --slide-right-icon_x7K:NONE
//  --slide-icon-position_a9D:BL      --slide-icon-size_s3N:40px
//  --slide-icon-gap_g6H:10px         --slide-transition_d6W:320ms
//  --slide-overlay-hover_f8P:300ms   --slide-swipe-threshold_z1T:36px
//  신규: --slide-radius_r4C:16px / --slide-shadow_s8H:none / --slide-bleed_b7E:NONE
//  우선순위: 슬라이더 토큰 > 공통 CSS > 엔진 기본값
//
// [드래그·클릭·재생]
//  기존 v1.3.1~v1.4.0 수정 유지: 클릭은 카드로 전달하고, 8px 초과 드래그 후에만 포인터 캡처.
//  이동 임계값 기본 36px. 이동 가능한 슬라이더는 글자 선택·브라우저 기본 드래그를 막는다.
//  카드 내부의 링크·버튼·입력 요소는 카드 전체 링크보다 우선한다.
//  카드 자체에 포커스가 있을 때 Enter/Space로 카드 링크를 연다.
//  모든 카드가 화면에 들어가면 이동·자동 재생 중지. 크기 변경 시 이동 여부를 다시 계산한다.
//  v1.5.0: 자동 재생·HP를 실시간 변경할 수 있도록 마우스·화면 진입 상태를 계속 추적한다.
//  숨겨진 탭에서는 재생을 멈춘다. 수동 일시정지와 시스템 동작 줄이기 설정을 존중한다.
//
// [공존]
//  슬라이더 상위 콜아웃의 소유자는 slide이다. call-card는 이를 건너뛴다.
//  슬라이드 안의 call-card·plain 토큰으로 카드 외형을 바꾸지 않는다.
//  core.js와 call-card.js를 수정할 필요는 없다. 순서는 반드시 core → slide → card로 둔다.
//
// [대시보드 API v1.1.0: window.CallSlideEngine.dashboard]  (v1.0.0에 preview 추가)
//  list()                  슬라이더 목록: id, index, title, element
//  schema()                21개 설정의 key, internal, token, longToken, css, defaultValue, type, requiresReload
//  read(id)                config(편집값), applied(실제 적용값), overrides, pending, runtime, edited
//  apply(id, patch)        토큰 대응 항목만 임시 편집. 모든 인자를 먼저 검증. null=개별 지정 해제
//  restore(id)             엔진 시작 때의 토큰 설정 복원. 공통 임시 편집은 유지
//  token(id, {longNames})   현재 토큰 출력. 기존 명시값을 보존하며 공통값을 무작정 복제하지 않는다.
//  diagnose()              목록·카드 수·이동 가능 여부·새로고침 대기 항목을 콘솔 표로 출력
//  common.read()           공통 values/explicit/edited 읽기
//  common.apply(patch)     공통 CSS 임시 편집. null=해당 임시 변경만 해제
//  common.restore()        이 API가 추가한 공통 임시 변경 전체 해제 (기존 사이트 CSS는 보존)
//  common.css({full})      공통 CSS 출력. 기본은 엔진 기본값과 다른 값만, full=true이면 전체
//  API 인자 key:
//    gap,width,mobileWidth,ratio,autoplay,interval,hoverPause,textColor,textAlign,imageMode,
//    leftIcon,rightIcon,iconPosition,iconSize,iconGap,transition,overlayHover,swipeThreshold,bleed,radius,shadow
//  iconSize/iconGap/transition/overlayHover/swipeThreshold는 common에서만 변경한다. 기존 토큰은 없다.
//  API 숫자 길이=px. interval 숫자=초, transition/overlayHover 숫자=ms. 문자열 단위 지정도 가능.
//  read()의 interval은 '3000ms', swipeThreshold는 '36px', autoplay/hoverPause는 true/false이다.
//  LI/RI의 빈 값은 출력 시 NONE으로 적는다. 토큰·CSS 재적용 때 빈 값 의도를 보존한다.
//
// [실시간 변경 / 새로고침 후 적용]
//  실시간: 폭·간격·비율(BG)·BLEED·재생·HP·글자색/정렬·화살표 위치/크기/간격·전환 시간·모서리·그림자
//  출력만: imageMode(IMG). apply/read/token/css에는 저장되지만 현재 DOM은 재구성하지 않는다.
//  read().pending에 대기 항목이 표시된다. 화면에서는 read().applied 값이 기준이다.
//  새로고침만 하면 임시 편집은 사라진다. 출력 CSS와 토큰을 노션에 먼저 반영해야 영구 적용된다.
//
// [미리보기 창 v1.6.0: dashboard.preview]
//  dashboard.preview = { windowName: 'CallSlidePreview', storageKey: 'ce-slide-preview-v1', active }
//  대시보드가 localStorage[storageKey]에 {common:{키:값}, sliders:{블록ID:{키:값|null}}}를 저장하고
//  같은 페이지를 이름이 windowName인 창으로 열면, 그 창에서만 로드할 때 저장된 설정을 적용한다.
//  일반 창에는 영향이 없다. 이미지 모드처럼 DOM을 다시 만들어야 하는 설정을 실제 로드 결과로 확인하는 용도이다.
//  미리보기 창 왼쪽 아래에 "미리보기" 표시가 나온다.
//
// [API 사용 예]
//  var A = CallSlideEngine.dashboard;
//  var id = A.list()[0].id;
//  A.apply(id, {width:'440px', radius:'20px'});
//  A.apply(id, {imageMode:'BG'}); // 화면은 유지. pending에 imageMode 기록
//  A.token(id);                 // 노션 상위 콜아웃에 붙일 토큰
//  A.restore(id);               // 개별 임시 변경 복원
//  A.common.apply({radius:'18px', shadow:'0 4px 12px rgba(0,0,0,0.12)'});
//  A.common.css();              // 기존 공통 설정 블록을 교체할 CSS
//  A.common.restore();          // 공통 임시 변경 복원
//
// [제한과 검증]
//  대시보드 UI·저장 슬롯·프리셋은 call-slide-dashboard.js가 제공한다. 이 파일은 연결 API와 미리보기 창 지원을 제공한다.
//  슬라이드별 OL/URL 실시간 편집 API는 이번 범위에서 제외했다. 노션 이미지 캡션으로 지정한다.
//  FR은 미사용. destroy API는 없다. 모바일 폭과 BLEED 레이아웃은 기존 CSS 동작을 유지한다.
//  LI/RI는 사이트에 해당 Font Awesome CSS와 웹폰트가 준비되어 있으면 실제 아이콘으로 표시한다.
//  글리프/폰트를 확인할 수 없거나 LI가 비어 있으면 기본 화살표 기호로 대체한다.
//  RI를 비우면 LI를 좌우 반전한다. 웹폰트형 Font Awesome 대상이며 SVG 치환 방식은 보장하지 않는다.
//  엔진이 외부 Font Awesome CSS나 스크립트를 자동으로 삽입하지는 않는다.
//  기존 v1.4.0 아이콘, PC 링크/드래그, 모바일 터치는 사용자 확인 완료.
//  v1.5.0 API는 모의 환경 33건, 캡션 파서 8건 통과. 실제 노션 화면의 API 미리보기는 별도 확인 필요.
// =========================================================

// [v1.6.0 변경 및 검증]
//  - 비율(RT)을 실시간으로 바꾼다. BG 슬라이드의 고정 비율 속성만 갱신한다.
//  - BLEED를 실시간으로 바꾼다. 왼쪽 확장 계산을 함수로 분리하고, 부모 요소의 원래 인라인 값을 저장해
//    BLEED를 NONE으로 되돌리면 복원한다.
//  - 미리보기 창(CallSlidePreview)과 dashboard.preview를 추가했다. dashboard API는 1.1.0(추가만 있음).
//  - schema()의 requiresReload는 imageMode만 true이다.
//  - 가상 환경에서 문법·로드·미리보기 설정 읽기를 확인했다. 실제 노션 화면의 BLEED·비율 전환은 확인 필요.
//
// [v1.5.1 변경 및 검증]
//  - list() 제목에서 숨겨진 캡션·이미지·토큰 글자를 빼고 첫 슬라이드 제목을 우선 사용한다.
//  - LI/RI의 실제 FA 웹폰트 표시, 로딩 확인 전 기본 기호 유지, 명시한 RI의 기본 대체 화살표 방향 보정.
//  - API는 v1.0.0 그대로 유지. 모바일 미리보기·저장 슬롯·프리셋은 대시보드에서 구현할 기능이다.
//  - 실제 사이트의 FA 폰트 로드와 아이콘 모양은 확인 필요.
// =========================================================

(function (global) {
  'use strict';
  if (!global.CoreEngine || typeof global.CoreEngine.register !== 'function') {
    console.error('[call-slide] CoreEngine이 없습니다. core.js v1.2.0 이상을 먼저 로드하세요.');
    return;
  }

  if (global.CallSlideEngine) { console.warn('[call-slide] 중복 로드를 건너뜁니다.'); return; }
  var VERSION_r1Z = '1.6.0';
  var liveSliders_d1A = [];
  var STYLE_ID_s4P = 'engine-call-slide-style-v12';
  var MOBILE_BREAKPOINT_h2V = 640;
  var REDUCED_MOTION_m8K = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sliderCount_d5R = 0;
  var NO_IMAGE_BG_COLOR_q7T = '#4a4a4a';
  var EDGE_OVERSCAN_h9L = 2;


  function injectStyle_a7F() {
    if (document.getElementById(STYLE_ID_s4P)) return;
    var style_q3L = document.getElementById(STYLE_ID_s4P);
    if (!style_q3L) {
      style_q3L = document.createElement('style');
      style_q3L.id = STYLE_ID_s4P;
      document.head.appendChild(style_q3L);
    }

    style_q3L.textContent =
      '.slide-shell_s4P{' +
        'position:relative;' +
        'width:100%;' +
        'box-sizing:border-box;' +
        'padding-bottom:56px;' +
      '}' +

      '.slide-item_s4P[data-image-mode="full"] [class*="__content"]{' +
        'overflow:visible!important;' +
      '}' +

      /*
        BG, FIT, FULL 공통: 카드 외곽 프레임(폭, 둥글기, 그림자)은
        항상 W / RT / BX / SH 값으로 동일하다.
      */
      '.slide-item_s4P{' +
        'position:relative!important;' +
        'display:flex!important;' +
        'flex-direction:column!important;' +
        'overflow:hidden!important;' +
        'border-radius:var(--slide-live-radius_s4P)!important;' +
        'box-shadow:var(--slide-live-shadow_s4P)!important;' +
        'background:#ffffff!important;' +
        'isolation:isolate!important;' +
      '}' +

      '.slide-item_s4P .slide-card_s4P{' +
        'width:100%!important;' +
        'min-height:0!important;' +
        'overflow:visible!important;' +
        'border-radius:0!important;' +
        'box-sizing:border-box!important;' +
      '}' +
      '.slide-item_s4P .slide-card_s4P .notion-callout-block{' +
        'min-height:0!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      '.slide-item_s4P .slide-card_s4P > div,' +
      '.slide-item_s4P .slide-card_s4P .CalloutBlock-module__b-lIEa__content{' +
        'min-height:0!important;' +
        'box-sizing:border-box!important;' +
        'border:0!important;' +
        'border-width:0!important;' +
        'border-style:none!important;' +
        'border-color:transparent!important;' +
      '}' +

      '.slide-arrow-icon-wrap_s4P{' +
        'position:relative!important;' +
        'display:inline-flex!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'width:18px!important;' +
        'height:18px!important;' +
      '}' +

      '.slide-arrow-icon-wrap_s4P>i{' +
        'display:none!important;' +
        'color:#8A8F98!important;' +
        'font-size:16px!important;' +
        'line-height:1!important;' +
      '}' +

      '.slide-arrow-fallback_s4P{' +
        'display:block!important;' +
        'color:#8A8F98!important;' +
        'font-family:Arial,sans-serif!important;' +
        'font-size:28px!important;' +
        'font-weight:400!important;' +
        'line-height:1!important;' +
        'transform:translateY(-2px)!important;' +
      '}' +

      '.slide-arrow-icon-wrap_s4P[data-fa-ready="true"]>i{' +
        'display:inline-block!important;' +
      '}' +
      '.slide-arrow-icon-wrap_s4P[data-fa-ready="true"]>.slide-arrow-fallback_s4P{' +
        'display:none!important;' +
      '}' +

      '.slide-viewport_s4P{' +
        'width:100%;' +
        'overflow-x:hidden;' +
        'overflow-y:visible;' +
        'padding-top:16px;' +
        'padding-bottom:24px;' +
        'box-sizing:border-box;' +
        'touch-action:pan-y;' +
      '}' +

      '.slide-track_s4P{' +
        'display:flex;' +
        'align-items:flex-start;' +
        'gap:var(--slide-live-gap_s4P);' +
        'will-change:transform;' +
        'transition:transform var(--slide-live-transition_s4P) ease;' +
      '}' +

      '.slide-item_s4P{' +
        'position:relative!important;' +
        'flex:0 0 var(--slide-live-width_s4P)!important;' +
        'width:var(--slide-live-width_s4P)!important;' +
        'min-width:0!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      '.slide-item_s4P[data-image-mode="bg"][data-fixed-ratio="true"]{' +
        'aspect-ratio:var(--slide-live-ratio_s4P)!important;' +
      '}' +

      '.slide-card_s4P{' +
        'position:relative;' +
        'width:100%;' +
        'min-width:0;' +
        'box-sizing:border-box;' +
        'overflow:hidden;' +
        'border-radius:inherit;' +
      '}' +

      '.slide-item_s4P[data-image-mode="bg"][data-fixed-ratio="true"] .slide-card_s4P{' +
        'height:100%;' +
      '}' +

      '.slide-card_s4P>.CalloutBlock-module__b-lIEa__content{' +
        'width:100%!important;' +
        'box-sizing:border-box;' +
      '}' +

'.slide-item_s4P[data-image-mode="bg"]{' +
  'overflow:hidden!important;' +
  'background:#fff!important;' +
'}' +

/*
  BG 모드에서 텍스트 세로 정렬(TA의 T/C/B)이 동작하려면, wrap
  (slide-bg-content_s4P)의 min-height:100%가 실제로 카드 전체
  높이를 상속받아야 한다. 그런데 slide-card_s4P와 content에
  height가 명시되어 있지 않아 %가 "auto 기준 100%"로 무의미해지고,
  wrap이 텍스트 콘텐츠 높이로만 줄어들어 있었다(실측: 카드 533px인데
  content가 221px로 줄어듦). height:100%를 체인으로 이어준다.
*/
'.slide-item_s4P[data-image-mode="bg"] .slide-card_s4P,' +
'.slide-item_s4P[data-image-mode="bg"] .slide-card_s4P > div,' +
'.slide-item_s4P[data-image-mode="bg"] .CalloutBlock-module__b-lIEa__content{' +
  'height:100%!important;' +
'}' +

      /*
        FIT: 텍스트+이미지 래퍼는 일반 블록 흐름. 카드 padding 안에서
        이미지가 원본 비율 그대로 표시된다.
      */
      '.slide-item_s4P[data-image-mode="fit"] .slide-flex-content_s4P,' +
      '.slide-item_s4P[data-image-mode="full"] .slide-flex-content_s4P{' +
        'display:block!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      '.slide-item_s4P[data-image-mode="fit"] .slide-flex-content_s4P{' +
        'margin-left:8px!important;' +
        'margin-right:8px!important;' +
        'padding-bottom:8px!important;' +
      '}' +

      '.slide-item_s4P[data-image-mode="full"] .slide-flex-content_s4P{' +
        'margin-left:0!important;' +
        'margin-right:0!important;' +
        'padding-bottom:0!important;' +
      '}' +

      '.slide-item_s4P[data-image-mode="fit"] .notion-image-block,' +
      '.slide-item_s4P[data-image-mode="full"] .notion-image-block{' +
        'position:relative!important;' +
        'display:block!important;' +
        'width:100%!important;' +
        'max-width:none!important;' +
        'padding:0!important;' +
        'border:0!important;' +
        'outline:0!important;' +
        'box-shadow:none!important;' +
        'overflow:hidden!important;' +
        'line-height:0!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      '.slide-item_s4P[data-image-mode="fit"] .notion-image-block *,' +
      '.slide-item_s4P[data-image-mode="full"] .notion-image-block *{' +
        'margin:0!important;' +
        'padding:0!important;' +
        'border:0!important;' +
        'outline:0!important;' +
        'box-shadow:none!important;' +
        'width:100%!important;' +
        'height:auto!important;' +
        'max-width:none!important;' +
      '}' +

      '.slide-item_s4P[data-image-mode="fit"] .notion-image-block,' +
      '.slide-item_s4P[data-image-mode="fit"] .notion-image-block figure,' +
      '.slide-item_s4P[data-image-mode="fit"] .notion-image-block div{' +
        'border-radius:calc(var(--slide-live-radius_s4P) - var(--slide-live-padding_s4P,16px))!important;' +
      '}' +

      '.slide-item_s4P[data-image-mode="fit"] .notion-image-block img,' +
      '.slide-item_s4P[data-image-mode="full"] .notion-image-block img{' +
        'display:block!important;' +
        'width:100%!important;' +
        'height:auto!important;' +
        'max-width:none!important;' +
        'object-fit:initial!important;' +
        'vertical-align:top!important;' +
        'border-radius:inherit!important;' +
      '}' +

      '.slide-bg_s4P{' +
        'position:absolute!important;' +
        'inset:0!important;' +
        'width:100%!important;' +
        'height:100%!important;' +
        'margin:0!important;' +
        'padding:0!important;' +
        'border:0!important;' +
        'outline:0!important;' +
        'z-index:0!important;' +
        'overflow:hidden!important;' +
        'background:transparent!important;' +
        'transform:translateZ(0)!important;' +
        'backface-visibility:hidden!important;' +
      '}' +

      '.slide-bg_s4P,' +
      '.slide-bg_s4P *{' +
        'display:block!important;' +
        'width:100%!important;' +
        'height:100%!important;' +
        'min-height:0!important;' +
        'max-width:none!important;' +
        'max-height:none!important;' +
        'margin:0!important;' +
        'padding:0!important;' +
        'padding-top:0!important;' +
        'padding-bottom:0!important;' +
        'border:0!important;' +
        'outline:0!important;' +
        'box-shadow:none!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      '.slide-bg_s4P img{' +
        'object-fit:cover!important;' +
        'object-position:center!important;' +
        'transform:translateZ(0)!important;' +
        'backface-visibility:hidden!important;' +
      '}' +

      '.slide-bg-fallback_s4P{' +
        'position:absolute!important;' +
        'inset:0!important;' +
        'z-index:0!important;' +
        'background:' + NO_IMAGE_BG_COLOR_q7T + '!important;' +
      '}' +

      '.slide-overlay_s4P{' +
        'position:absolute;' +
        'inset:0;' +
        'z-index:1;' +
        'pointer-events:none;' +
        'transition:opacity var(--slide-live-overlay_s4P) ease;' +
      '}' +

      '.slide-item_s4P:hover .slide-overlay_s4P{' +
        'opacity:0;' +
      '}' +

      '.slide-bg-content_s4P{' +
        'position:relative!important;' +
        'z-index:2!important;' +
        'min-height:100%!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      '.slide-item_s4P[data-slide-text-color] .CalloutBlock-module__b-lIEa__blocks *:not(code):not(code *){' +
        'color:inherit!important;' +
      '}' +

      '.slide-item_s4P[data-slide-text-color] .CalloutBlock-module__b-lIEa__blocks code,' +
      '.slide-item_s4P[data-slide-text-color] .CalloutBlock-module__b-lIEa__blocks code *{' +
        'color:revert!important;' +
      '}' +

      '.slide-bg-content_s4P .CalloutBlock-module__b-lIEa__blocks{' +
        'min-height:100%;' +
        'box-sizing:border-box;' +
      '}' +

      '.slide-icon_s4P,.slide-icon_s4P div{display:flex!important;align-items:center!important;justify-content:center!important;}' +
      '.slide-icon_s4P{width:var(--ce-card-icon,52px)!important;height:var(--ce-card-icon,52px)!important;flex:0 0 auto!important;margin:0 0 12px 0!important;overflow:hidden!important;border-radius:var(--ce-card-icon-radius,10px)!important;background:var(--ce-card-icon-bg,#f2f3f5)!important;}' +
      '.slide-icon_s4P div{width:100%!important;height:100%!important;}' +
      '.slide-icon_s4P img{width:72%!important;height:72%!important;object-fit:contain!important;}' +
      '.slide-controls_s4P{' +
        'display:flex;' +
        'gap:var(--slide-live-icon-gap_s4P);' +
        'z-index:5;' +
      '}' +

      '.slide-controls_s4P[data-pos="BL"],' +
      '.slide-controls_s4P[data-pos="BC"],' +
      '.slide-controls_s4P[data-pos="BR"]{' +
        'position:absolute;' +
        'bottom:0;' +
      '}' +

      '.slide-controls_s4P[data-pos="BL"]{left:0;}' +
      '.slide-controls_s4P[data-pos="BC"]{left:50%;transform:translateX(-50%);}' +
      '.slide-controls_s4P[data-pos="BR"]{right:0;}' +

      '.slide-controls_s4P[data-pos="CL"],' +
      '.slide-controls_s4P[data-pos="CR"],' +
      '.slide-controls_s4P[data-pos="CC"],' +
      '.slide-controls_s4P[data-pos="CB"]{' +
        'position:absolute;' +
        'inset:0;' +
        'pointer-events:none;' +
        'display:flex;' +
        'align-items:center;' +
        'justify-content:space-between;' +
      '}' +

      '.slide-controls_s4P[data-pos="CL"]{justify-content:flex-start;}' +
      '.slide-controls_s4P[data-pos="CR"]{justify-content:flex-end;}' +

      '.slide-arrow_s4P{' +
        'width:var(--slide-live-icon-size_s4P)!important;' +
        'height:var(--slide-live-icon-size_s4P)!important;' +
        'min-width:var(--slide-live-icon-size_s4P)!important;' +
        'min-height:var(--slide-live-icon-size_s4P)!important;' +
        'border:0!important;' +
        'border-radius:0!important;' +
        'background:transparent!important;' +
        'color:#8A8F98!important;' +
        'cursor:pointer!important;' +
        'display:inline-flex!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'padding:0!important;' +
        'font-size:18px!important;' +
        'line-height:1!important;' +
        'transition:background-color .2s ease,opacity .2s ease!important;' +
        'pointer-events:auto!important;' +
      '}' +

      '.slide-arrow_s4P:hover{' +
        'background:#f2f2f2;' +
      '}' +

      '.slide-arrow_s4P:disabled{' +
        'opacity:.45;' +
        'cursor:default;' +
      '}' +

      '.slide-arrow_s4P .slide-arrow-svg_s4P{' +
        'display:block!important;' +
        'width:16px!important;' +
        'height:16px!important;' +
        'fill:#8A8F98!important;' +
        'flex:0 0 auto!important;' +
        'transform-origin:center!important;' +
      '}' +

      '.slide-pause-svg_s4P{' +
        'display:block!important;' +
        'width:16px!important;' +
        'height:16px!important;' +
        'fill:#8A8F98!important;' +
        'flex:0 0 auto!important;' +
      '}' +

      '.slide-shell_s4P[data-no-move="true"]{' +
        'padding-bottom:0px;' +
      '}' +

      '.slide-item_s4P[data-linked="true"]{' +
        'cursor:pointer;' +
      '}' +

      '.slide-shell_s4P[data-bleed="LEFT"]{' +
  'max-width:none!important;' +
  'margin-right:0!important;' +
'}' +

'.slide-shell_s4P[data-bleed="LEFT"] .slide-track_s4P{' +
  'padding-left:var(--slide-live-content-offset_s4P,0px)!important;' +
  'box-sizing:border-box!important;' +
'}' +

      '.slide-shell_s4P[data-bleed="RIGHT"]{' +
        'width:calc(100% + ((100vw - 100%) / 2));' +
      '}' +

      '.slide-shell_s4P[data-bleed="BOTH"]{' +
        'width:100vw;' +
        'margin-left:calc(50% - 50vw);' +
      '}' +

      '@media(max-width:' + MOBILE_BREAKPOINT_h2V + 'px){' +
        '.slide-icon_s4P{width:calc(var(--ce-card-icon,52px) * var(--ce-card-ratio-is,var(--ce-card-ratio-size,0.75)))!important;height:calc(var(--ce-card-icon,52px) * var(--ce-card-ratio-is,var(--ce-card-ratio-size,0.75)))!important;}' +
        '.slide-shell_s4P{' +
          'padding-bottom:52px;' +
        '}' +

        '.slide-item_s4P{' +
          'flex-basis:min(var(--slide-live-mobile-width_s4P),calc(100vw - 32px));' +
          'width:min(var(--slide-live-mobile-width_s4P),calc(100vw - 32px));' +
        '}' +

        '.slide-item_s4P:hover .slide-overlay_s4P{' +
          'opacity:1;' +
        '}' +

        '.slide-shell_s4P[data-bleed="LEFT"],' +
        '.slide-shell_s4P[data-bleed="RIGHT"],' +
        '.slide-shell_s4P[data-bleed="BOTH"]{' +
          'width:100%;' +
          'margin-left:0;' +
        '}' +
      '}';

    document.head.appendChild(style_q3L);
  }

  function cssValue_b6N(name_x9J, fallback_t4C) {
    var value_f3E = getComputedStyle(document.documentElement).getPropertyValue(name_x9J).trim();
    return value_f3E || fallback_t4C;
  }

  function cssTimeMs_c2W(value_m5R, fallback_j7A) {
    var text_k1D = String(value_m5R || fallback_j7A).trim();
    if (text_k1D.toLowerCase().slice(-2) === 'ms') return parseFloat(text_k1D) || 0;
    if (text_k1D.toLowerCase().slice(-1) === 's') return (parseFloat(text_k1D) || 0) * 1000;
    return parseFloat(text_k1D) || 0;
  }

  function parseBool_d8H(value_r2M, fallback_b4Q) {
    if (value_r2M === undefined || value_r2M === null || value_r2M === '') return fallback_b4Q;
    var text_y6L = String(value_r2M).trim().toUpperCase();
    if (['1', 'ON', 'TRUE', 'YES', 'Y'].indexOf(text_y6L) !== -1) return true;
    if (['0', 'OFF', 'FALSE', 'NO', 'N'].indexOf(text_y6L) !== -1) return false;
    return fallback_b4Q;
  }

  function normalizeRatio_e1T(value_w8P) {
    var text_z5F = String(value_w8P || 'AUTO').trim().toUpperCase();
    if (!text_z5F || text_z5F === 'AUTO') return null;
    var parts_n3K = text_z5F.split(/[:\/]/);
    if (parts_n3K.length !== 2) return null;
    var width_v7B = parseFloat(parts_n3K[0]);
    var height_a9D = parseFloat(parts_n3K[1]);
    if (!width_v7B || !height_a9D || width_v7B < 0 || height_a9D < 0) return null;
    return width_v7B + ' / ' + height_a9D;
  }

  function normalizeAlign_f4X(value_l9S, fallback_n2C) {
    var text_h6G = String(value_l9S || fallback_n2C).trim().toUpperCase();
    return /^[TCB][LCR]$/.test(text_h6G) ? text_h6G : fallback_n2C;
  }

  function normalizeIconPos_g5Q(value_p3V) {
    var text_x7N = String(value_p3V || 'BL').trim().toUpperCase();
    return ['BL', 'BC', 'BR', 'CL', 'CR', 'CC', 'CB'].indexOf(text_x7N) !== -1 ? text_x7N : 'BL';
  }

  function normalizeColor_h8A(value_t6F) {
    var text_m1K = String(value_t6F || 'AUTO').trim();
    var upper_j4B = text_m1K.toUpperCase();
    if (upper_j4B === 'WHITE') return '#ffffff';
    if (upper_j4B === 'BLACK') return '#000000';
    if (upper_j4B === 'AUTO') return 'AUTO';
    return /^#[0-9a-f]{3,8}$/i.test(text_m1K) ? text_m1K : 'AUTO';
  }

  function normalizeImageMode_t3Q(value_h9K) {
    var text_p4L = String(value_h9K || 'FIT').trim().toUpperCase();
    return ['FIT', 'FULL', 'BG'].indexOf(text_p4L) !== -1 ? text_p4L.toLowerCase() : 'fit';
  }

  function paramsForSlider_i3C(raw_v8E) {
    var params_q4N = raw_v8E || {};
    function pick_b7R(short_f2D, long_y5L, fallback_h3K) {
      if (params_q4N[short_f2D] !== undefined && params_q4N[short_f2D] !== null && params_q4N[short_f2D] !== '') return params_q4N[short_f2D];
      if (params_q4N[long_y5L] !== undefined && params_q4N[long_y5L] !== null && params_q4N[long_y5L] !== '') return params_q4N[long_y5L];
      return fallback_h3K;
    }

    var intervalRaw_s9W = pick_b7R('ITV', 'INTERVAL', cssValue_b6N('--slide-interval_h9L', '3s'));
    var intervalMs_v1P = /^\d+(\.\d+)?$/.test(String(intervalRaw_s9W).trim()) ? parseFloat(intervalRaw_s9W) * 1000 : cssTimeMs_c2W(intervalRaw_s9W, '3s');

    return {
      gap_z2L: pick_b7R('GAP', 'GAP', cssValue_b6N('--slide-gap_k7M', '20px')),
      width_f8D: pick_b7R('W', 'WIDTH', cssValue_b6N('--slide-width_p4R', '400px')),
      mobileWidth_r6A: pick_b7R('MW', 'MOBILE_WIDTH', cssValue_b6N('--slide-mobile-width_v2Q', '280px')),
      ratio_c4J: normalizeRatio_e1T(pick_b7R('RT', 'RATIO', cssValue_b6N('--slide-ratio_t8A', 'AUTO'))),
      autoplay_e5M: parseBool_d8H(pick_b7R('AUTO', 'AUTOPLAY', cssValue_b6N('--slide-autoplay_n3F', '1')), true),
      intervalMs_v1P: Math.max(1000, intervalMs_v1P || 3000),
      hoverPause_y7Q: parseBool_d8H(pick_b7R('HP', 'HOVER_PAUSE', cssValue_b6N('--slide-hover-pause_r1C', '1')), true),
      textColor_j8C: normalizeColor_h8A(pick_b7R('TC', 'TEXT_COLOR', cssValue_b6N('--slide-text-color_b5J', 'AUTO'))),
      textAlign_u6H: normalizeAlign_f4X(pick_b7R('TA', 'TEXT_ALIGN', cssValue_b6N('--slide-text-align_q2E', 'BL')), 'BL'),
      imageMode_r8L: normalizeImageMode_t3Q(pick_b7R('IMG', 'IMAGE_MODE', cssValue_b6N('--slide-image-mode_h3W', 'FIT'))),
      leftIcon_a3S: String(pick_b7R('LI', 'LEFT_ICON', cssValue_b6N('--slide-left-icon_m4V', 'fa-solid fa-angle-left'))).replace(/^NONE$/i, ''),
      rightIcon_d9T: String(pick_b7R('RI', 'RIGHT_ICON', cssValue_b6N('--slide-right-icon_x7K', ''))).replace(/^NONE$/i, ''),
      iconPos_n5B: normalizeIconPos_g5Q(pick_b7R('IP', 'ICON_POSITION', cssValue_b6N('--slide-icon-position_a9D', 'BL'))),
      iconSize_v4E: cssValue_b6N('--slide-icon-size_s3N', '40px'),
      iconGap_x2F: cssValue_b6N('--slide-icon-gap_g6H', '10px'),
      transition_g7K: cssValue_b6N('--slide-transition_d6W', '320ms'),
      overlayHover_s8R: cssValue_b6N('--slide-overlay-hover_f8P', '300ms'),
      swipeThreshold_w3P: parseFloat(cssValue_b6N('--slide-swipe-threshold_z1T', '36px')) || 36,
      bleed_q2R: String(pick_b7R('BLEED', 'BLEED', cssValue_b6N('--slide-bleed_b7E', 'NONE'))).trim().toUpperCase(),
      radius_j5K: pick_b7R('BX', 'RADIUS', cssValue_b6N('--slide-radius_r4C', '16px')),
      shadow_m7P: pick_b7R('SH', 'SHADOW', cssValue_b6N('--slide-shadow_s8H', 'none')),
      fitRadius_y3M: pick_b7R('FR', 'FIT_RADIUS', '')
    };
  }

  function findCallout_j1Q(block_f5D) {
    var node_a8V = block_f5D;
    while (node_a8V) {
      if (node_a8V.classList && node_a8V.classList.contains('notion-callout-block')) return node_a8V;
      node_a8V = node_a8V.parentElement;
    }
    return null;
  }

  function findCardBox_k9M(callout_e2H) {
    var firstWrap_p4A = callout_e2H && callout_e2H.firstElementChild;
    return firstWrap_p4A && firstWrap_p4A.firstElementChild ? firstWrap_p4A.firstElementChild : null;
  }

  function findBlocksWrap_l3F(cardBox_z1N) {
    if (!cardBox_z1N) return null;
    var children_v2R = Array.prototype.slice.call(cardBox_z1N.children);
    for (var i_c6K = 0; i_c6K < children_v2R.length; i_c6K++) {
      if (children_v2R[i_c6K].querySelector('.notion-column_list-block,.notion-callout-block,.notion-text-block,.notion-image-block')) return children_v2R[i_c6K];
    }
    return children_v2R[children_v2R.length - 1] || null;
  }

  function collectSlides_m4B(parentCallout_j7C) {
    return Array.prototype.slice.call(parentCallout_j7C.querySelectorAll('.notion-callout-block')).filter(function (candidate_v6X) {
      if (candidate_v6X === parentCallout_j7C) return false;
      var closestParent_t9D = candidate_v6X.parentElement ? candidate_v6X.parentElement.closest('.notion-callout-block') : null;
      return closestParent_t9D === parentCallout_j7C;
    });
  }

  function splitCaption_k1A(text_a1) {
    var parts_b1 = [], cur_c1 = '', quote_d1 = '', depth_e1 = 0;
    text_a1 = String(text_a1 || '').trim();
    for (var i_f1 = 0; i_f1 < text_a1.length; i_f1++) {
      var ch_g1 = text_a1.charAt(i_f1);
      if (quote_d1) { cur_c1 += ch_g1; if (ch_g1 === quote_d1 && text_a1.charAt(i_f1 - 1) !== '\\') quote_d1 = ''; continue; }
      if ((ch_g1 === '"' || ch_g1 === "'") && (!cur_c1.trim() || /\s$/.test(cur_c1))) { quote_d1 = ch_g1; cur_c1 += ch_g1; continue; }
      if (ch_g1 === '(') depth_e1++;
      if (ch_g1 === ')' && depth_e1 > 0) depth_e1--;
      if ((ch_g1 === ',' || ch_g1 === '\n') && depth_e1 === 0) { if (cur_c1.trim()) parts_b1.push(cur_c1.trim()); cur_c1 = ''; } else cur_c1 += ch_g1;
    }
    if (cur_c1.trim()) parts_b1.push(cur_c1.trim()); return parts_b1;
  }
  function captionColor_k2B(value_a2) {
    value_a2 = String(value_a2 || '').trim();
    if (value_a2.toUpperCase() === 'BLACK') value_a2 = '#000000';
    if (value_a2.toUpperCase() === 'WHITE') value_a2 = '#ffffff';
    var hex_c2 = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value_a2);
    if (hex_c2) { var h_d2 = hex_c2[1]; if (h_d2.length <= 4) h_d2 = h_d2.split('').map(function(x_e2){return x_e2+x_e2;}).join(''); return {hex:'#'+h_d2.slice(0,6).toLowerCase(),alpha:h_d2.length===8?parseInt(h_d2.slice(6),16)/255:1}; }
    var rgba_f2 = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?|\.\d+)\s*\)$/i.exec(value_a2);
    if (!rgba_f2) return null;
    var rgb_g2 = rgba_f2.slice(1,4).map(Number), alpha_h2 = Number(rgba_f2[4]);
    if(rgb_g2.some(function(x_i2){return x_i2>255;})||alpha_h2<0||alpha_h2>1)return null;
    return {hex:'#'+rgb_g2.map(function(x_j2){return ('0'+x_j2.toString(16)).slice(-2);}).join(''),alpha:alpha_h2};
  }
  function normalizeUrl_k3C(raw_a3) {
    var value_b3 = String(raw_a3 || '').trim();
    if (/^["']/.test(value_b3)) { if(value_b3.charAt(value_b3.length-1)!==value_b3.charAt(0))throw new Error('URL 따옴표가 닫히지 않았습니다.');value_b3=value_b3.slice(1,-1); }
    if (!value_b3 || /^(NONE|없음)$/i.test(value_b3)) return '';
    if (/[\u0000-\u0020\u007f\\]/.test(value_b3)) throw new Error('URL 공백·제어문자·역슬래시는 허용하지 않습니다.');
    if (/^\[.*\]\(/.test(value_b3)||/^<.*>$/.test(value_b3))throw new Error('순수 주소를 입력하세요.');
    if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(value_b3))value_b3='https://'+value_b3;
    if (!/^(https?:|mailto:|tel:|sms:|\/|\.\/|\.\.\/|#|\?)/i.test(value_b3))throw new Error('지원하지 않는 주소입니다.');
    var url_c3=new URL(value_b3,document.baseURI||global.location.href);
    if(['http:','https:','mailto:','tel:','sms:'].indexOf(url_c3.protocol.toLowerCase())===-1)throw new Error('허용되지 않는 URL 프로토콜입니다.');
    return value_b3;
  }
  function captionInfo_n7H(imageBlock_q5J) {
    var caption_s2K=imageBlock_q5J&&imageBlock_q5J.querySelector('figcaption,[class*="Caption"],[class*="caption"]');
    var text_w4V=caption_s2K?(caption_s2K.textContent||''):'';
    var segments_j6A=splitCaption_k1A(text_w4V);
    var result_x5C={overlay_s1R:null,url_v3P:'',newTab_a7D:false};
    segments_j6A.forEach(function(segment_c8L){
      var upper_g3T=segment_c8L.toUpperCase();
      if(['BG','FULL','FIT'].indexOf(upper_g3T)!==-1)return;
      var urlMatch_k2B=segment_c8L.match(/^URL\s+(?:(NEW|BLANK|SELF)\s+)?([\s\S]+)$/i);
      if(urlMatch_k2B){try{result_x5C.url_v3P=normalizeUrl_k3C(urlMatch_k2B[2]);result_x5C.newTab_a7D=!!result_x5C.url_v3P&&/^(NEW|BLANK)$/i.test(urlMatch_k2B[1]||'');}catch(urlError_a4){console.warn('[call-slide] URL 무시: '+urlError_a4.message);}return;}
      if(/^https?:\/\/\S+$/i.test(segment_c8L)){try{result_x5C.url_v3P=normalizeUrl_k3C(segment_c8L);}catch(e_a4){}return;}
      var olMatch_v1K=segment_c8L.match(/^OL(?:\s+([\s\S]+))?$/i);
      if(olMatch_v1K){
        if(!olMatch_v1K[1]){console.warn('[call-slide] OL 값이 없습니다.');return;}
        var tokens_d4Q=olMatch_v1K[1].match(/rgba\([^)]*\)|\S+/gi)||[];
        var color_b3Y={hex:'#ffffff',alpha:1},nums_a4=[],direction_e6V='A',invalid_b4=false;
        tokens_d4Q.forEach(function(token_f9A){var upper_d2M=token_f9A.toUpperCase();if(/^[TBLRA]$/.test(upper_d2M)){direction_e6V=upper_d2M;return;}if(/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token_f9A)){nums_a4.push(Number(token_f9A));return;}var parsed_c4=captionColor_k2B(token_f9A);if(parsed_c4)color_b3Y=parsed_c4;else invalid_b4=true;});
        if(invalid_b4||nums_a4.length>3){console.warn('[call-slide] OL 형식이 잘못되어 무시합니다.');return;}
        var strength_q8H=Math.max(0,Math.min(1,nums_a4.length?nums_a4[0]:0.4));
        var start_h1T=Math.max(0,Math.min(100,nums_a4.length>1?nums_a4[1]:0));
        var end_z7C=Math.max(0,Math.min(100,nums_a4.length>2?nums_a4[2]:65));
        result_x5C.overlay_s1R={color_b3Y:color_b3Y.hex,strength_q8H:strength_q8H*color_b3Y.alpha,direction_e6V:direction_e6V,start_h1T:start_h1T,end_z7C:end_z7C};
      }
    });
    if(caption_s2K)caption_s2K.style.setProperty('display','none','important');return result_x5C;
  }
  function relocateSlideIcon_x1(cardBox_a,blocksWrap_b){
    var kids_c=Array.prototype.slice.call(cardBox_a.children);
    for(var i_d=0;i_d<kids_c.length;i_d++){
      if(kids_c[i_d]===blocksWrap_b)continue;
      var icon_e=kids_c[i_d].querySelector('.notion-record-icon');if(!icon_e)continue;
      if(icon_e.classList.contains('slide-icon_s4P'))return icon_e;
      icon_e.classList.add('slide-icon_s4P');var first_f=blocksWrap_b.firstElementChild,target_g=first_f;
      if(first_f&&(first_f.classList.contains('notion-image-block')||first_f.querySelector('.notion-image-block')))target_g=first_f.nextElementSibling;
      if(target_g)blocksWrap_b.insertBefore(icon_e,target_g);else blocksWrap_b.appendChild(icon_e);
      if(kids_c[i_d].children.length===0)kids_c[i_d].style.setProperty('display','none','important');return icon_e;
    }return null;
  }

  function hexRgb_o2E(hex_b7A) {
    var clean_x8Q = String(hex_b7A || '#ffffff').replace('#', '');
    if (clean_x8Q.length === 3) clean_x8Q = clean_x8Q.split('').map(function (char_m5L) { return char_m5L + char_m5L; }).join('');
    var value_d9F = parseInt(clean_x8Q, 16);
    return isNaN(value_d9F) ? { r_q1S: 255, g_e8D: 255, b_v4H: 255 } : { r_q1S: (value_d9F >> 16) & 255, g_e8D: (value_d9F >> 8) & 255, b_v4H: value_d9F & 255 };
  }

  function overlayCss_p6W(overlay_f3P) {
    var rgb_t1C = hexRgb_o2E(overlay_f3P.color_b3Y);
    var solid_v7K = 'rgba(' + rgb_t1C.r_q1S + ',' + rgb_t1C.g_e8D + ',' + rgb_t1C.b_v4H + ',' + overlay_f3P.strength_q8H + ')';
    if (overlay_f3P.direction_e6V === 'A') return solid_v7K;
    var map_h4N = { T: 'to bottom', B: 'to top', L: 'to right', R: 'to left' };
    var empty_p8A = 'rgba(' + rgb_t1C.r_q1S + ',' + rgb_t1C.g_e8D + ',' + rgb_t1C.b_v4H + ',0)';
    return 'linear-gradient(' + (map_h4N[overlay_f3P.direction_e6V] || 'to bottom') + ',' + solid_v7K + ' ' + overlay_f3P.start_h1T + '%,' + empty_p8A + ' ' + overlay_f3P.end_z7C + '%)';
  }

 function applyTextStyle_v4H(slideItem_q1P, blocksWrap_b1K, settings_a7H) {
  var align_m6F = settings_a7H.textAlign_u6H;
    var vertical_v9E = align_m6F.charAt(0);
    var horizontal_n2P = align_m6F.charAt(1);

    blocksWrap_b1K.style.setProperty('display', 'flex', 'important');
    blocksWrap_b1K.style.setProperty('flex-direction', 'column', 'important');
    blocksWrap_b1K.style.setProperty('justify-content', vertical_v9E === 'T' ? 'flex-start' : vertical_v9E === 'C' ? 'center' : 'flex-end', 'important');
    blocksWrap_b1K.style.setProperty('align-items', horizontal_n2P === 'L' ? 'flex-start' : horizontal_n2P === 'C' ? 'center' : 'flex-end', 'important');
    blocksWrap_b1K.style.setProperty('text-align', horizontal_n2P === 'L' ? 'left' : horizontal_n2P === 'C' ? 'center' : 'right', 'important');

    var color_c7D = settings_a7H.textColor_j8C;

    if (color_c7D !== 'AUTO') {
      slideItem_q1P.style.setProperty('color', color_c7D, 'important');
      slideItem_q1P.setAttribute('data-slide-text-color', color_c7D);
    } else {
      slideItem_q1P.removeAttribute('data-slide-text-color');
    }
  }

  function applyBg_q3J(slide_t4M, cardBox_h8A, blocksWrap_b1K, imageBlock_w9R, info_y5F, settings_a7H) {
    var calloutRoot_q8F = cardBox_h8A.closest('.notion-callout-block');

    if (!calloutRoot_q8F) {
      console.error('[call-slide] BG 카드의 callout 루트를 찾지 못했습니다.');
      return;
    }

    if (imageBlock_w9R) {
      imageBlock_w9R.classList.add('slide-bg_s4P');
      slide_t4M.insertBefore(imageBlock_w9R, calloutRoot_q8F);
    } else {
      var fallback_r2N = document.createElement('div');
      fallback_r2N.className = 'slide-bg-fallback_s4P';
      slide_t4M.insertBefore(fallback_r2N, calloutRoot_q8F);
    }

    if (info_y5F.overlay_s1R) {
      var overlay_c5X = document.createElement('div');
      overlay_c5X.className = 'slide-overlay_s4P';
      overlay_c5X.style.background = overlayCss_p6W(info_y5F.overlay_s1R);

      slide_t4M.insertBefore(overlay_c5X, calloutRoot_q8F);
    }

    blocksWrap_b1K.classList.add('slide-bg-content_s4P');
    blocksWrap_b1K.style.setProperty('min-height', '100%', 'important');

    applyTextStyle_v4H(slide_t4M, blocksWrap_b1K, settings_a7H);
  }

  /*
    ===== 아래부터 call-card의 fitToCardEdges 이식 =====
    핵심 원리: CSS 수식으로 padding을 미리 계산해 margin에 박아넣지
    않는다. 대신 매 프레임 getBoundingClientRect()로 카드와 이미지의
    실제 좌표 차이를 재고, 그 차이를 그대로 margin에 넣는다. 좌우
    padding이 다르든, 렌더링 타이밍이 어긋나든 항상 결과가 정확하다.
  */

  function isEmptyTitle_q8W(el_p3K) {
    return el_p3K.classList &&
      String(el_p3K.className).indexOf('CalloutBlock-module__b-lIEa__title') !== -1 &&
      !(el_p3K.textContent || '').trim();
  }

  function isIcon_v2M(el_p3K) {
    return el_p3K.classList && el_p3K.classList.contains('notion-record-icon');
  }

  function isMeaningful_h6T(el_p3K) {
    return el_p3K.getAttribute('data-engine-hidden') !== 'true' &&
      getComputedStyle(el_p3K).display !== 'none' &&
      !isEmptyTitle_q8W(el_p3K) &&
      !isIcon_v2M(el_p3K);
  }

  function restoreNaturalImage_r7L(imageBlock_c3R) {
    imageBlock_c3R.style.removeProperty('width');
    imageBlock_c3R.style.removeProperty('height');
    imageBlock_c3R.style.removeProperty('margin');
    imageBlock_c3R.style.removeProperty('margin-top');
    imageBlock_c3R.style.removeProperty('margin-right');
    imageBlock_c3R.style.removeProperty('margin-bottom');
    imageBlock_c3R.style.removeProperty('margin-left');
    imageBlock_c3R.style.removeProperty('box-sizing');

    Array.prototype.forEach.call(imageBlock_c3R.querySelectorAll('div'), function (el_v8Q) {
      el_v8Q.style.height = 'auto';
      el_v8Q.style.width = '100%';
      el_v8Q.style.margin = '0';
    });

    var image_y2T = imageBlock_c3R.querySelector('img');
    if (image_y2T) {
      image_y2T.style.width = '100%';
      image_y2T.style.height = 'auto';
      image_y2T.style.display = 'block';
      image_y2T.style.objectFit = 'initial';
      image_y2T.style.margin = '0';
    }
    return image_y2T;
  }

  function cssNumber_f3E(el_p3K, property_x9J) {
    return parseFloat(getComputedStyle(el_p3K)[property_x9J]) || 0;
  }

  /*
    slideItem_q1P을 call-card의 cardBox처럼 취급한다. 카드 경계는
    slideItem_q1P의 실제 렌더링 좌표(getBoundingClientRect)이고,
    이미지 블록을 그 경계까지 실측 기반으로 정확히 붙인다.
  */
  function fitToCardEdges_w5V(slideItem_q1P, imageBlock_c3R, position_x5W) {
    var image_y2T = restoreNaturalImage_r7L(imageBlock_c3R);
    if (!image_y2T) return;

    function apply_h2R() {
      restoreNaturalImage_r7L(imageBlock_c3R);

      var imgRect_q9F = imageBlock_c3R.getBoundingClientRect();
      var cardRect_z1N = slideItem_q1P.getBoundingClientRect();
      if (!imgRect_q9F.width || !imgRect_q9F.height || !cardRect_z1N.width) return;

      var currentMarginLeft_p2K = cssNumber_f3E(imageBlock_c3R, 'marginLeft');
      var leftCorrection_t4C = cardRect_z1N.left - imgRect_q9F.left;
      var topGap_m6R = position_x5W === 'top' ? Math.max(0, imgRect_q9F.top - cardRect_z1N.top) : 0;
      var bottomGap_r4T = position_x5W === 'bottom' ? Math.max(0, cardRect_z1N.bottom - imgRect_q9F.bottom) : 0;

      imageBlock_c3R.style.setProperty('box-sizing', 'content-box', 'important');
      imageBlock_c3R.style.setProperty('width', Math.ceil(cardRect_z1N.width + EDGE_OVERSCAN_h9L) + 'px', 'important');
      imageBlock_c3R.style.setProperty('max-width', 'none', 'important');
      imageBlock_c3R.style.setProperty('min-width', Math.ceil(cardRect_z1N.width + EDGE_OVERSCAN_h9L) + 'px', 'important');
      imageBlock_c3R.style.setProperty('height', 'auto', 'important');

      imageBlock_c3R.style.setProperty('margin-left', (currentMarginLeft_p2K + leftCorrection_t4C - EDGE_OVERSCAN_h9L) + 'px', 'important');
      imageBlock_c3R.style.setProperty('margin-right', '-999px', 'important');

      /*
        VERTICAL_OVERSCAN_p3M(4px):
        topGap/bottomGap을 그대로 margin에 반영하면 실측상 이미지가
        카드 상/하단 경계에서 4px씩 안쪽으로 들어가 보이는 현상이
        재현됐다(2026-09-13 디버깅, 6개 카드 전수 확인). 원인은
        서브픽셀 렌더링과 콜아웃 컨테이너 쪽 기본 margin-top 등이
        겹친 것으로 추정되며, 실측으로 정확히 4px 오차임을 확인해
        아래처럼 상쇄한다. 카드 프레임/레이아웃 구조가 바뀌면 이
        값도 재실측이 필요할 수 있다.
      */
      var VERTICAL_OVERSCAN_p3M = 4;

      if (position_x5W === 'top') {
        imageBlock_c3R.style.setProperty('margin-top', '-' + (topGap_m6R - VERTICAL_OVERSCAN_p3M) + 'px', 'important');
        imageBlock_c3R.style.setProperty('margin-bottom', '0', 'important');
      } else {
        imageBlock_c3R.style.setProperty('margin-top', '0', 'important');
        imageBlock_c3R.style.setProperty('margin-bottom', '-' + (bottomGap_r4T - VERTICAL_OVERSCAN_p3M) + 'px', 'important');
      }
    }

    if (image_y2T.complete) apply_h2R();
    else image_y2T.addEventListener('load', apply_h2R, { once: true });

    apply_h2R();
    requestAnimationFrame(apply_h2R);
    requestAnimationFrame(function () { requestAnimationFrame(apply_h2R); });
    /*
      슬라이드 카드가 생성 시점에 아직 실제 문서에 붙지 않은 상태
      (detached DOM)일 수 있어, getBoundingClientRect가 부정확한
      값을 반환할 수 있다. 카드가 완전히 붙고 레이아웃이 안정된
      뒤 다시 보정하기 위해 지연 재실행을 둔다.
    */
    setTimeout(apply_h2R, 50);
    setTimeout(apply_h2R, 300);
  }

  /*
    FIT은 기존 방식 그대로 유지: 콜아웃 padding 안에서 이미지
    원본 비율(자연 높이) 그대로 표시한다.
  */
  function applyFit_r5D(slideItem_q1P, blocksWrap_n3D, imageBlock_c3R) {
    var image_y2T = imageBlock_c3R.querySelector('img');
    if (!image_y2T) return;

    blocksWrap_n3D.classList.add('slide-flex-content_s4P');
    slideItem_q1P.dataset.imageMode = 'fit';

    imageBlock_c3R.style.setProperty('width', '100%', 'important');
    imageBlock_c3R.style.setProperty('max-width', '100%', 'important');
    imageBlock_c3R.style.setProperty('margin', '0', 'important');
    imageBlock_c3R.style.setProperty('padding', '0', 'important');
    imageBlock_c3R.style.setProperty('box-sizing', 'border-box', 'important');
    imageBlock_c3R.style.setProperty('border', '0', 'important');
    imageBlock_c3R.style.setProperty('line-height', '0', 'important');
    imageBlock_c3R.style.setProperty('overflow', 'hidden', 'important');
    imageBlock_c3R.style.setProperty(
      'border-radius',
      'calc(var(--slide-live-radius_s4P) - var(--slide-live-padding_s4P, 16px))',
      'important'
    );

    image_y2T.style.setProperty('display', 'block', 'important');
    image_y2T.style.setProperty('width', '100%', 'important');
    image_y2T.style.setProperty('height', 'auto', 'important');
    image_y2T.style.setProperty('max-width', '100%', 'important');
    image_y2T.style.setProperty('margin', '0', 'important');
    image_y2T.style.setProperty('padding', '0', 'important');
    image_y2T.style.setProperty('object-fit', 'initial', 'important');
  }

  /*
    FULL은 call-card의 fitToCardEdges를 그대로 사용한다. 이미지
    위치(top/bottom) 판정도 call-card와 동일하게, blocksWrap의
    "의미 있는(빈 title/아이콘 제외)" 자식들 중 첫/마지막인지로
    판정한다.
  */
  function applyFull_r5D(slideItem_q1P, blocksWrap_n3D, imageBlock_c3R, settings_f8K) {
    var image_y2T = imageBlock_c3R.querySelector('img');
    if (!image_y2T) return;

    blocksWrap_n3D.classList.add('slide-flex-content_s4P');
    slideItem_q1P.dataset.imageMode = 'full';

    /*
      Oopy/Notion이 .CalloutBlock-module__b-lIEa__content에 기본으로
      padding(16 16 16 12)과 display:flex를 깔아둔다. 이 padding이
      바로 이미지 여백의 실체였다. content의 padding은 0으로 없애고,
      대신 텍스트 블록들(이미지가 아닌 형제)에 그 padding 값을
      그대로 옮겨서, 텍스트만 원래처럼 안쪽 여백을 유지하게 한다.
      이미지는 padding이 없는 content 경계까지 그대로 채운다.

      기본값을 20px로 통일 고정했다(원래 Oopy 기본값은 16/16/16/12로
      좌우가 서로 달랐음). getComputedStyle로 실측이 가능하면 그
      값을 우선 사용하지만, 카드가 아직 DOM에 붙지 않은 시점
      (detached)에는 getComputedStyle이 빈 문자열을 반환하므로 그
      경우엔 이 20px 기본값이 그대로 유지된다.
    */
    var contentNode_w8L = imageBlock_c3R.closest('.CalloutBlock-module__b-lIEa__content');
    var originalPadding_q9F = { top: '20px', right: '20px', bottom: '20px', left: '20px' };

    if (contentNode_w8L) {
      var beforeStyle_r3T = getComputedStyle(contentNode_w8L);
      var readTop_x1 = beforeStyle_r3T.paddingTop;
      var readRight_x2 = beforeStyle_r3T.paddingRight;
      var readBottom_x3 = beforeStyle_r3T.paddingBottom;
      var readLeft_x4 = beforeStyle_r3T.paddingLeft;

      if (readTop_x1) originalPadding_q9F.top = readTop_x1;
      if (readRight_x2) originalPadding_q9F.right = readRight_x2;
      if (readBottom_x3) originalPadding_q9F.bottom = readBottom_x3;
      if (readLeft_x4) originalPadding_q9F.left = readLeft_x4;

      contentNode_w8L.style.setProperty('display', 'block', 'important');
      contentNode_w8L.style.setProperty('padding', '0', 'important');

      /*
        Notion 콜아웃은 아이콘 슬롯용 빈 div를 content의 첫 자식으로
        둔다. 아이콘을 쓰지 않아도 이 빈 div가 레이아웃 공간을 차지해
        이미지 위쪽에 미세한 여백을 만들 수 있어, 실제로 비어 있는
        첫 자식이면 display:none으로 제거한다. 클래스명이 빌드마다
        바뀔 수 있어 클래스명 대신 "비어 있는 첫 자식" 구조로 탐지한다.
      */
      var firstChild_x9Q = contentNode_w8L.firstElementChild;
      if (firstChild_x9Q && firstChild_x9Q !== blocksWrap_n3D && !firstChild_x9Q.textContent.trim() && firstChild_x9Q.children.length === 0) {
        firstChild_x9Q.style.setProperty('display', 'none', 'important');
      }
    }

    /*
      Oopy 기본 CSS(.CalloutBlock-module__b-lIEa__container:first-child)가
      margin-top:2px를 부여한다. 실측 결과 이 값 자체가 최종 4px
      오차의 주 원인은 아니었지만(원인은 VERTICAL_OVERSCAN 쪽 서브
      픽셀 오차), 이 마진이 있으면 카드마다 레이아웃 기준선이
      미세하게 달라질 수 있어 0으로 고정해 둔다. 부작용 없음을
      확인했다.
    */
    var containerNode_m4Y = imageBlock_c3R.closest('.CalloutBlock-module__b-lIEa__container');
    if (containerNode_m4Y) {
      containerNode_m4Y.style.setProperty('margin-top', '0', 'important');
    }

    Array.prototype.forEach.call(blocksWrap_n3D.children, function (childNode_v8Q) {
      if (childNode_v8Q === imageBlock_c3R) return;
      if (!isMeaningful_h6T(childNode_v8Q)) return;

      childNode_v8Q.style.setProperty('padding-left', originalPadding_q9F.left, 'important');
      childNode_v8Q.style.setProperty('padding-right', originalPadding_q9F.right, 'important');
      childNode_v8Q.style.setProperty('box-sizing', 'border-box', 'important');
    });

    var meaningful_j6A = Array.prototype.slice.call(blocksWrap_n3D.children).filter(isMeaningful_h6T);
    var position_x5W = meaningful_j6A[0] === imageBlock_c3R
      ? 'top'
      : (meaningful_j6A[meaningful_j6A.length - 1] === imageBlock_c3R ? 'bottom' : 'middle');

    var slideIcon_i1 = blocksWrap_n3D.querySelector(':scope > .slide-icon_s4P');
    if (slideIcon_i1) {
      slideIcon_i1.style.setProperty('margin-left', originalPadding_q9F.left, 'important');
      if (position_x5W === 'top') slideIcon_i1.style.setProperty('margin-top', originalPadding_q9F.top, 'important');
    }

    /* 텍스트 쪽 상/하 여백도 이미지가 없는 쪽에만 원래 padding을 되살린다. */
    if (position_x5W === 'top') {
      blocksWrap_n3D.style.setProperty('padding-bottom', originalPadding_q9F.bottom, 'important');
      blocksWrap_n3D.style.setProperty('padding-top', '0', 'important');
    } else if (position_x5W === 'bottom') {
      blocksWrap_n3D.style.setProperty('padding-top', originalPadding_q9F.top, 'important');
      blocksWrap_n3D.style.setProperty('padding-bottom', '0', 'important');
    }

    var fullRadius_k2S = settings_f8K.radius_j5K || '16px';
    imageBlock_c3R.style.setProperty(
      'border-radius',
      position_x5W === 'top'
        ? (fullRadius_k2S + ' ' + fullRadius_k2S + ' 0 0')
        : ('0 0 ' + fullRadius_k2S + ' ' + fullRadius_k2S),
      'important'
    );
    imageBlock_c3R.style.setProperty('overflow', 'hidden', 'important');
    imageBlock_c3R.style.setProperty('line-height', '0', 'important');
    imageBlock_c3R.style.setProperty('border', '0', 'important');

    if (position_x5W === 'middle') return;

    fitToCardEdges_w5V(slideItem_q1P, imageBlock_c3R, position_x5W);
  }

  function prepareSlide_s7G(callout_g4N, settings_u9M, sliderId_t2P) {
    var item_z1F = document.createElement('article');
    item_z1F.className = 'slide-item_s4P';
    item_z1F.id = 'slide-item-s4P-' + sliderId_t2P;
    var mode_h6Y = settings_u9M.imageMode_r8L;
    item_z1F.dataset.imageMode = mode_h6Y;

    if (mode_h6Y === 'bg' && settings_u9M.ratio_c4J) {
      item_z1F.dataset.fixedRatio = 'true';
      item_z1F.style.setProperty('--slide-live-ratio_s4P', settings_u9M.ratio_c4J);
    }

    callout_g4N.classList.add('slide-card_s4P');
    item_z1F.appendChild(callout_g4N);

    var cardBox_b5W = findCardBox_k9M(callout_g4N);
    var blocksWrap_e3P = findBlocksWrap_l3F(cardBox_b5W);
    if (!cardBox_b5W || !blocksWrap_e3P) return { item_z1F: item_z1F, url_b2C: '', newTab_z8A: false };

    cardBox_b5W.style.setProperty('border-radius', 'inherit', 'important');
    cardBox_b5W.style.setProperty('overflow', 'hidden', 'important');
    cardBox_b5W.style.setProperty('width', '100%', 'important');

    relocateSlideIcon_x1(cardBox_b5W, blocksWrap_e3P);

    var images_g6F = Array.prototype.slice.call(blocksWrap_e3P.querySelectorAll('.notion-image-block')).filter(function (image_h3C) {
      return image_h3C.closest('.notion-callout-block') === callout_g4N;
    });
    var image_x9K = images_g6F[0];
    var info_s4D = image_x9K ? captionInfo_n7H(image_x9K) : { overlay_s1R: null, url_v3P: '', newTab_a7D: false };

    if (mode_h6Y === 'bg') {
      applyBg_q3J(
        item_z1F,
        cardBox_b5W,
        blocksWrap_e3P,
        image_x9K || null,
        info_s4D,
        settings_u9M
      );
    } else if (image_x9K && mode_h6Y === 'full') {
      applyFull_r5D(item_z1F, blocksWrap_e3P, image_x9K, settings_u9M);
      applyTextStyle_v4H(item_z1F, blocksWrap_e3P, settings_u9M);
    } else if (image_x9K) {
      applyFit_r5D(item_z1F, blocksWrap_e3P, image_x9K);
      applyTextStyle_v4H(item_z1F, blocksWrap_e3P, settings_u9M);
    } else {
      applyTextStyle_v4H(item_z1F, blocksWrap_e3P, settings_u9M);
    }

    return {
      item_z1F: item_z1F,
      url_b2C: info_s4D.url_v3P,
      newTab_z8A: info_s4D.newTab_a7D
    };
  }

  function iconElement_t8V(classText_f2R, mirror_p5Q, right_u1A) {
    var wrap_z4R = document.createElement('span');
    wrap_z4R.className = 'slide-arrow-icon-wrap_s4P';

    var iconClass_y8J = String(classText_f2R || '').trim();

    if (iconClass_y8J) {
      var icon_p6T = document.createElement('i');

      iconClass_y8J.split(/\s+/).forEach(function (className_g2V) {
        if (className_g2V) icon_p6T.classList.add(className_g2V);
      });

      if (mirror_p5Q) {
        icon_p6T.style.transform = 'scaleX(-1)';
      }

      wrap_z4R.appendChild(icon_p6T);
    }

    var fallback_h7N = document.createElement('span');
    fallback_h7N.className = 'slide-arrow-fallback_s4P';
    fallback_h7N.textContent = (right_u1A || mirror_p5Q) ? '\u203a' : '\u2039';

    wrap_z4R.appendChild(fallback_h7N);
    wrap_z4R.setAttribute('aria-hidden', 'true');
    if (iconClass_y8J) {
      // 외부 CSS/폰트는 자동으로 내려받지 않는다. 사이트에 준비된 FA 글리프를 확인한 뒤에만 표시한다.
      var attempts_u2B = 0;
      function checkIcon_u3C() {
        if (!wrap_z4R.isConnected) return;
        var glyph_u4D = wrap_z4R.querySelector('i');
        if (!glyph_u4D) return;
        var pseudo_u5E = global.getComputedStyle(glyph_u4D, '::before');
        var content_u6F = pseudo_u5E.content || '';
        if (!content_u6F || content_u6F === 'none' || content_u6F === 'normal' || content_u6F === '""' || content_u6F === "''") return;
        var family_u7G = pseudo_u5E.fontFamily || global.getComputedStyle(glyph_u4D).fontFamily || '';
        if (!/Font\s*Awesome|FontAwesome/i.test(family_u7G) || !document.fonts) return;
        var text_u8H = content_u6F.replace(/^["']|["']$/g, '');
        var descriptor_u9I = (pseudo_u5E.fontStyle || 'normal') + ' ' + (pseudo_u5E.fontWeight || '400') + ' 16px ' + family_u7G;
        try {
          document.fonts.load(descriptor_u9I, text_u8H).then(function (faces_v1A) {
            if (!wrap_z4R.isConnected || !faces_v1A.length) return;
            if (document.fonts.check(descriptor_u9I, text_u8H)) wrap_z4R.setAttribute('data-fa-ready', 'true');
          }).catch(function () {});
        } catch (fontError_v2B) {}
      }
      function retryIcon_v3C() {
        if (!wrap_z4R.isConnected) return;
        checkIcon_u3C();
        attempts_u2B++;
        if (attempts_u2B < 6 && wrap_z4R.getAttribute('data-fa-ready') !== 'true') setTimeout(retryIcon_v3C, 400);
      }
      requestAnimationFrame(retryIcon_v3C);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(checkIcon_u3C);
    }

    return wrap_z4R;
  }

  function createSlider_u2Y(parentCallout_x5J, params_t7K) {
    if (parentCallout_x5J.dataset.engineCallSlideDone === 'true') return;
    if (parentCallout_x5J.dataset.ceOwner && parentCallout_x5J.dataset.ceOwner !== 'slide') {
      console.error('[call-slide] 다른 엔진이 먼저 처리했습니다. core → call-slide → call-card 순서로 바꾸고 새로고침하세요.'); return;
    }
    parentCallout_x5J.dataset.ceOwner = 'slide';
    parentCallout_x5J.dataset.engineCallSlideDone = 'true';

    var sourceCards_m3A = collectSlides_m4B(parentCallout_x5J);
    if (!sourceCards_m3A.length) {
      console.warn('[call-slide] 상위 콜아웃 안에서 첫 단계 하위 콜아웃을 찾지 못했습니다.');
      return;
    }

    sliderCount_d5R += 1;
    var normalizedParams_z1 = {};
    Object.keys(params_t7K || {}).forEach(function (key_z2) { normalizedParams_z1[String(key_z2).toUpperCase()] = params_t7K[key_z2]; });
    params_t7K = normalizedParams_z1;
    params_t7K = applyPreviewParams_p5(parentCallout_x5J, params_t7K);
    var settings_b8C = paramsForSlider_i3C(params_t7K);
    var parentBox_h7N = findCardBox_k9M(parentCallout_x5J);
    var parentBlocks_p6T = findBlocksWrap_l3F(parentBox_h7N);
    if (!parentBox_h7N || !parentBlocks_p6T) return;

    var shell_z9A = document.createElement('section');
    shell_z9A.className = 'slide-shell_s4P';
    shell_z9A.setAttribute('aria-label', '콘텐츠 슬라이드');
    shell_z9A.style.setProperty('--slide-live-gap_s4P', settings_b8C.gap_z2L);
    shell_z9A.style.setProperty('--slide-live-width_s4P', settings_b8C.width_f8D);
    shell_z9A.style.setProperty('--slide-live-mobile-width_s4P', settings_b8C.mobileWidth_r6A);
    shell_z9A.style.setProperty('--slide-live-transition_s4P', settings_b8C.transition_g7K);
    shell_z9A.style.setProperty('--slide-live-overlay_s4P', settings_b8C.overlayHover_s8R);
    shell_z9A.style.setProperty('--slide-live-icon-size_s4P', settings_b8C.iconSize_v4E);
    shell_z9A.style.setProperty('--slide-live-icon-gap_s4P', settings_b8C.iconGap_x2F);

    shell_z9A.style.setProperty('--slide-live-radius_s4P', settings_b8C.radius_j5K || '16px');
    shell_z9A.style.setProperty('--slide-live-shadow_s4P', settings_b8C.shadow_m7P || 'none');

    var measuredPadding_h4W = '16px';

    if (sourceCards_m3A[0]) {
      var sampleContent_r7L = sourceCards_m3A[0].querySelector('.CalloutBlock-module__b-lIEa__content');
      if (sampleContent_r7L) {
        var sampleStyle_v2Q = getComputedStyle(sampleContent_r7L);
        if (sampleStyle_v2Q.paddingLeft && sampleStyle_v2Q.paddingLeft !== '0px') {
          measuredPadding_h4W = sampleStyle_v2Q.paddingLeft;
        }
      }
    }

    shell_z9A.style.setProperty('--slide-live-padding_s4P', measuredPadding_h4W);

    var bleedMode_n8R = String(settings_b8C.bleed_q2R || 'NONE').trim().toUpperCase();

    if (['LEFT', 'RIGHT', 'BOTH'].indexOf(bleedMode_n8R) !== -1) {
      shell_z9A.dataset.bleed = bleedMode_n8R;
    } else {
      shell_z9A.dataset.bleed = 'NONE';
    }

    var viewport_s6W = document.createElement('div');
    viewport_s6W.className = 'slide-viewport_s4P';
    var track_c2E = document.createElement('div');
    track_c2E.className = 'slide-track_s4P';
    viewport_s6W.appendChild(track_c2E);
    shell_z9A.appendChild(viewport_s6W);

    /*
      BLEED LEFT: shell을 "부모가 실제로 차지하는 위치의 왼쪽 경계"에서 화면 왼쪽 끝(0)까지 실측으로 확장한다.
      width는 뷰포트 전체 너비로 잡아 오른쪽 끝도 화면 끝까지 닿게 한다.
      v1.6.0: 함수를 항상 정의하고, 현재 BLEED가 LEFT일 때만 동작하게 하여 대시보드에서 실시간으로 바꿀 수 있게 했다.
    */
    function setBleedLeftGeometry_p8N() {
      if (shell_z9A.dataset.bleed !== 'LEFT') return;
      var parentRect_k3D = parentBlocks_p6T.getBoundingClientRect();
      var pullLeft_r5W = Math.max(0, parentRect_k3D.left);
      var viewportWidth_t6M = document.documentElement.clientWidth;

      shell_z9A.style.setProperty('margin-left', '-' + pullLeft_r5W + 'px', 'important');
      shell_z9A.style.setProperty('width', viewportWidth_t6M + 'px', 'important');

      var shellRect_r2W = shell_z9A.getBoundingClientRect();
      var offset_x3N = Math.max(0, parentRect_k3D.left - shellRect_r2W.left);

      shell_z9A.style.setProperty('--slide-live-content-offset_s4P', offset_x3N + 'px', 'important');
    }
    var bleedListening_b7 = false;
    function listenBleedResize_b8() {
      if (bleedListening_b7) return;
      bleedListening_b7 = true;
      global.addEventListener('resize', setBleedLeftGeometry_p8N);
    }
    if (shell_z9A.dataset.bleed === 'LEFT') {
      setBleedLeftGeometry_p8N();
      listenBleedResize_b8();
    }

    var slideLinks_q5H = [];
    sourceCards_m3A.forEach(function (sourceCard_v4P, index_j6R) {
      var sourceList_w7T = sourceCard_v4P.closest('.notion-column_list-block');
      if (sourceList_w7T) sourceList_w7T.style.setProperty('display', 'none', 'important');

      var prepared_x8K = prepareSlide_s7G(sourceCard_v4P, settings_b8C, sliderCount_d5R + '-' + (index_j6R + 1));
      prepared_x8K.item_z1F.dataset.slideIndex = String(index_j6R);
      if (prepared_x8K.url_b2C) prepared_x8K.item_z1F.dataset.linked = 'true';
      track_c2E.appendChild(prepared_x8K.item_z1F);
      slideLinks_q5H.push(prepared_x8K);
    });

    parentBox_h7N.style.setProperty('border', 'none', 'important');
    parentBox_h7N.style.setProperty('box-shadow', 'none', 'important');
    parentBox_h7N.style.setProperty('background', 'transparent', 'important');
    parentBox_h7N.style.setProperty('padding', '0', 'important');
    parentBox_h7N.style.setProperty('overflow', 'visible', 'important');
    parentBlocks_p6T.style.setProperty('padding', '0', 'important');
    parentBlocks_p6T.insertBefore(shell_z9A, parentBlocks_p6T.firstChild);

    var bleedSaved_b9 = [];
    function escapeBleedParents_b6() {
      var escapeParent_d8Y = shell_z9A.parentElement;
      var BLEED_STOP_CLASSES_n4R = ['notion-scroller', 'notion-page-content', 'notion-frame'];
      var names_c1 = ['overflow', 'max-width', 'contain'];

      for (
        var escapeCount_x4H = 0;
        escapeParent_d8Y && escapeCount_x4H < 10;
        escapeCount_x4H += 1
      ) {
        var isPageLevelContainer_q8W = BLEED_STOP_CLASSES_n4R.some(function (stopClass_h3L) {
          return escapeParent_d8Y.classList && escapeParent_d8Y.classList.contains(stopClass_h3L);
        });

        if (isPageLevelContainer_q8W) break;

        /* 되돌릴 수 있도록 원래 인라인 값을 한 번만 저장한다. */
        var target_c2 = escapeParent_d8Y;
        if (bleedSaved_b9.every(function (s_c3) { return s_c3.el !== target_c2; })) {
          bleedSaved_b9.push({
            el: target_c2,
            props: names_c1.map(function (n_c4) { return [n_c4, target_c2.style.getPropertyValue(n_c4), target_c2.style.getPropertyPriority(n_c4)]; })
          });
        }

        escapeParent_d8Y.style.setProperty('overflow', 'visible', 'important');
        escapeParent_d8Y.style.setProperty('max-width', 'none', 'important');
        escapeParent_d8Y.style.setProperty('contain', 'none', 'important');

        escapeParent_d8Y = escapeParent_d8Y.parentElement;
      }
    }
    function restoreBleedParents_b10() {
      bleedSaved_b9.forEach(function (s_c5) {
        s_c5.props.forEach(function (p_c6) {
          if (p_c6[1]) s_c5.el.style.setProperty(p_c6[0], p_c6[1], p_c6[2]);
          else s_c5.el.style.removeProperty(p_c6[0]);
        });
      });
      bleedSaved_b9 = [];
    }
    if (shell_z9A.dataset.bleed !== 'NONE') escapeBleedParents_b6();
    /* v1.6.0: 대시보드에서 BLEED를 바꾸면 refresh 훅이 이 함수를 호출한다. */
    function applyBleedLive_b4() {
      var next_c7 = String(settings_b8C.bleed_q2R || 'NONE').trim().toUpperCase();
      if (['LEFT', 'RIGHT', 'BOTH'].indexOf(next_c7) === -1) next_c7 = 'NONE';
      if (shell_z9A.dataset.bleed === next_c7) {
        if (next_c7 === 'LEFT') setBleedLeftGeometry_p8N();
        return;
      }
      shell_z9A.dataset.bleed = next_c7;
      shell_z9A.style.removeProperty('margin-left');
      shell_z9A.style.removeProperty('width');
      shell_z9A.style.removeProperty('--slide-live-content-offset_s4P');
      if (next_c7 === 'NONE') { restoreBleedParents_b10(); return; }
      escapeBleedParents_b6();
      if (next_c7 === 'LEFT') { setBleedLeftGeometry_p8N(); listenBleedResize_b8(); }
    }

    var controls_m1F = document.createElement('div');
    controls_m1F.className = 'slide-controls_s4P';
    controls_m1F.dataset.pos = settings_b8C.iconPos_n5B;

    var previous_z3P = document.createElement('button');
    previous_z3P.type = 'button';
    previous_z3P.className = 'slide-arrow_s4P';
    previous_z3P.setAttribute('aria-label', '이전 슬라이드');
    previous_z3P.appendChild(iconElement_t8V(settings_b8C.leftIcon_a3S, false));

    var next_r6D = document.createElement('button');
    next_r6D.type = 'button';
    next_r6D.className = 'slide-arrow_s4P';
    next_r6D.setAttribute('aria-label', '다음 슬라이드');
    var mirror_b9T = !String(settings_b8C.rightIcon_d9T || '').trim();
    next_r6D.dataset.mirror = mirror_b9T ? 'true' : 'false';
    next_r6D.appendChild(iconElement_t8V(mirror_b9T ? settings_b8C.leftIcon_a3S : settings_b8C.rightIcon_d9T, mirror_b9T, true));

    var pauseToggle_v8N = document.createElement('button');
    pauseToggle_v8N.type = 'button';
    pauseToggle_v8N.className = 'slide-arrow_s4P slide-pause_s4P';
    pauseToggle_v8N.setAttribute('aria-label', '슬라이드 일시정지');
    pauseToggle_v8N.dataset.paused = 'false';

    function createPauseSvg_r4T() {
      var svg_k9L = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg_k9L.setAttribute('viewBox', '0 0 640 640');
      svg_k9L.setAttribute('class', 'slide-pause-svg_s4P');

      var bar1_x3F = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar1_x3F.setAttribute('x', '176');
      bar1_x3F.setAttribute('y', '112');
      bar1_x3F.setAttribute('width', '112');
      bar1_x3F.setAttribute('height', '416');
      bar1_x3F.setAttribute('rx', '32');

      var bar2_y7Q = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar2_y7Q.setAttribute('x', '352');
      bar2_y7Q.setAttribute('y', '112');
      bar2_y7Q.setAttribute('width', '112');
      bar2_y7Q.setAttribute('height', '416');
      bar2_y7Q.setAttribute('rx', '32');

      svg_k9L.appendChild(bar1_x3F);
      svg_k9L.appendChild(bar2_y7Q);

      return svg_k9L;
    }

    function createPlaySvg_m8D() {
      var svg_p2W = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg_p2W.setAttribute('viewBox', '0 0 640 640');
      svg_p2W.setAttribute('class', 'slide-pause-svg_s4P');

      var path_n6H = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path_n6H.setAttribute(
        'd',
        'M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z'
      );

      svg_p2W.appendChild(path_n6H);
      return svg_p2W;
    }

    function renderPauseIcon_h2R() {
      pauseToggle_v8N.innerHTML = '';
      var svg_j5K = pauseToggle_v8N.dataset.paused === 'true' ? createPlaySvg_m8D() : createPauseSvg_r4T();
      pauseToggle_v8N.appendChild(svg_j5K);
    }

    renderPauseIcon_h2R();

    var userPaused_m4K = false;
    var hovering_h1 = false;

    pauseToggle_v8N.addEventListener('click', function () {
      userPaused_m4K = !userPaused_m4K;
      pauseToggle_v8N.dataset.paused = userPaused_m4K ? 'true' : 'false';
      renderPauseIcon_h2R();

      if (userPaused_m4K) {
        stopAuto_d7H();
      } else {
        startAuto_y4B();
      }
    });

    controls_m1F.appendChild(previous_z3P);
    controls_m1F.appendChild(pauseToggle_v8N);
    controls_m1F.appendChild(next_r6D);
    shell_z9A.appendChild(controls_m1F);

    function placeControlsInContent_g6P() {
      if (shell_z9A.dataset.bleed !== 'LEFT' || settings_b8C.iconPos_n5B !== 'BL') { controls_m1F.style.removeProperty('left'); return; }
      var contentRect_z9A = parentBlocks_p6T.getBoundingClientRect();
      var shellRect_k2M = shell_z9A.getBoundingClientRect();

      controls_m1F.style.setProperty(
        'left',
        Math.max(0, contentRect_z9A.left - shellRect_k2M.left) + 'px',
        'important'
      );
    }

    placeControlsInContent_g6P();

    global.addEventListener('resize', placeControlsInContent_g6P);

    if (settings_b8C.iconPos_n5B === 'CL') next_r6D.style.display = 'none';
    if (settings_b8C.iconPos_n5B === 'CR') previous_z3P.style.display = 'none';

    var currentIndex_e4C = 0;
    var autoTimer_t6X = null;
    var pauseUntil_h8M = 0;
    var canMove_j2K = false;
    var dragged_n7R = false;
    var pointerStart_x3A = null;

    function cardStepWidth_q9L() {
      var firstItem_g5P = track_c2E.firstElementChild;
      if (!firstItem_g5P) return 0;
      var gap_w2C = parseFloat(getComputedStyle(track_c2E).gap) || 0;
      return firstItem_g5P.getBoundingClientRect().width + gap_w2C;
    }

    function updateMoveState_v5D() {
      var totalWidth_z8T = 0;
      Array.prototype.forEach.call(track_c2E.children, function (item_a4M, index_j1Q) {
        totalWidth_z8T += item_a4M.getBoundingClientRect().width;
        if (index_j1Q) totalWidth_z8T += parseFloat(getComputedStyle(track_c2E).gap) || 0;
      });
      canMove_j2K = totalWidth_z8T > viewport_s6W.getBoundingClientRect().width + 1;
      shell_z9A.dataset.noMove = canMove_j2K ? 'false' : 'true';
      if (!canMove_j2K) {
        currentIndex_e4C = 0;
        track_c2E.style.transform = 'translateX(0px)';
        stopAuto_d7H();
      } else if (
        settings_b8C.autoplay_e5M &&
        !REDUCED_MOTION_m8K.matches &&
        shell_z9A.dataset.inView === 'true'
      ) {
        startAuto_y4B();
      }
    }

    function renderPosition_f6N() {
      if (!canMove_j2K) return;
      track_c2E.style.transform = 'translateX(' + (-currentIndex_e4C * cardStepWidth_q9L()) + 'px)';
    }

    function moveTo_h3A(nextIndex_m4K, userAction_x5D) {
      if (!canMove_j2K) return;
      var count_z2Q = slideLinks_q5H.length;
      currentIndex_e4C = ((nextIndex_m4K % count_z2Q) + count_z2Q) % count_z2Q;
      renderPosition_f6N();
      if (userAction_x5D) {
        pauseUntil_h8M = Date.now() + settings_b8C.intervalMs_v1P;
        restartAuto_p7C();
      }
    }

    function stopAuto_d7H() {
      if (autoTimer_t6X) clearInterval(autoTimer_t6X);
      autoTimer_t6X = null;
    }

    function startAuto_y4B() {
      stopAuto_d7H();
      if (
        !canMove_j2K ||
        !settings_b8C.autoplay_e5M ||
        REDUCED_MOTION_m8K.matches ||
        userPaused_m4K || document.hidden || shell_z9A.dataset.inView !== 'true' || (hovering_h1 && settings_b8C.hoverPause_y7Q)
      ) return;
      autoTimer_t6X = setInterval(function () {
        if (Date.now() < pauseUntil_h8M) return;
        moveTo_h3A(currentIndex_e4C + 1, false);
      }, settings_b8C.intervalMs_v1P);
    }

    function restartAuto_p7C() {
      startAuto_y4B();
    }

    previous_z3P.addEventListener('click', function () { moveTo_h3A(currentIndex_e4C - 1, true); });
    next_r6D.addEventListener('click', function () { moveTo_h3A(currentIndex_e4C + 1, true); });

    shell_z9A.addEventListener('mouseenter', function () { hovering_h1 = true; if (settings_b8C.hoverPause_y7Q) stopAuto_d7H(); });
    shell_z9A.addEventListener('mouseleave', function () { hovering_h1 = false; startAuto_y4B(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stopAuto_d7H(); else startAuto_y4B(); });

    viewport_s6W.addEventListener('pointerdown', function (event_n3W) {
      if (!canMove_j2K) return;
      pointerStart_x3A = { x_u1B: event_n3W.clientX, y_d4P: event_n3W.clientY };
      dragged_n7R = false;
      var selection_a7 = global.getSelection && global.getSelection();
      if (selection_a7 && !selection_a7.isCollapsed && viewport_s6W.contains(selection_a7.anchorNode)) selection_a7.removeAllRanges();
    });

    viewport_s6W.addEventListener('pointermove', function (event_h7J) {
      if (!pointerStart_x3A) return;
      var delta_u4A = event_h7J.clientX - pointerStart_x3A.x_u1B;
      if (Math.abs(delta_u4A) > 8) {
        if (!dragged_n7R) { try { viewport_s6W.setPointerCapture(event_h7J.pointerId); } catch (captureError_a6) {} }
        dragged_n7R = true;
      }
    });

    viewport_s6W.addEventListener('pointerup', function (event_m8B) {
      if (!pointerStart_x3A) return;
      var delta_c5Q = event_m8B.clientX - pointerStart_x3A.x_u1B;
      pointerStart_x3A = null;
      if (Math.abs(delta_c5Q) >= settings_b8C.swipeThreshold_w3P) {
        moveTo_h3A(currentIndex_e4C + (delta_c5Q < 0 ? 1 : -1), true);
      }
      setTimeout(function () { dragged_n7R = false; }, 0);
    });

    viewport_s6W.addEventListener('pointercancel', function () { pointerStart_x3A = null; dragged_n7R = false; });
    viewport_s6W.addEventListener('selectstart', function (event_b7) { if (pointerStart_x3A) event_b7.preventDefault(); });
    viewport_s6W.addEventListener('dragstart', function (event_c7) { if (canMove_j2K) event_c7.preventDefault(); });

    slideLinks_q5H.forEach(function (entry_v6F) {
      if (!entry_v6F.url_b2C) return;

      entry_v6F.item_z1F.dataset.linked = 'true';
      entry_v6F.item_z1F.setAttribute('role', 'link');
      entry_v6F.item_z1F.setAttribute('tabindex', '0');

      function goSlideLink_a5(event_b5) {
        if(entry_v6F.newTab_z8A || event_b5.ctrlKey || event_b5.metaKey || event_b5.shiftKey)global.open(entry_v6F.url_b2C,'_blank','noopener,noreferrer');
        else global.location.assign(entry_v6F.url_b2C);
      }
      function openSlideLink_q3P(event_b5D) {
        if(dragged_n7R || event_b5D.defaultPrevented)return;
        var target_f5=event_b5D.target.nodeType===1?event_b5D.target:event_b5D.target.parentElement;
        var inner_g5=target_f5.closest('a,button,input,textarea,select,summary,[role="button"],[role="textbox"],[contenteditable="true"],.ga-dynamic-btn,[data-ce-interactive]');
        if(inner_g5 && inner_g5!==entry_v6F.item_z1F && entry_v6F.item_z1F.contains(inner_g5))return;
        var selection_i5=global.getSelection && global.getSelection();
        if(selection_i5 && !selection_i5.isCollapsed && selection_i5.toString().trim() && entry_v6F.item_z1F.contains(selection_i5.anchorNode))return;
        event_b5D.preventDefault();event_b5D.stopPropagation();goSlideLink_a5(event_b5D);
      }
      entry_v6F.item_z1F.addEventListener('click',openSlideLink_q3P);
      entry_v6F.item_z1F.addEventListener('keydown',function(event_n5X){
        if(event_n5X.target!==entry_v6F.item_z1F || (event_n5X.key!=='Enter' && event_n5X.key!==' '))return;
        event_n5X.preventDefault();goSlideLink_a5(event_n5X);
      });
    });

    if (typeof IntersectionObserver !== 'undefined') {
      var visibilityObserver_b4P = new IntersectionObserver(
        function (entries_z8D) {
          entries_z8D.forEach(function (entry_a6C) {
            if (entry_a6C.target !== shell_z9A) return;

            if (entry_a6C.isIntersecting) {
              shell_z9A.dataset.inView = 'true';
              startAuto_y4B();
            } else {
              shell_z9A.dataset.inView = 'false';
              stopAuto_d7H();
            }
          });
        },
        {
          threshold: 0.2
        }
      );

      shell_z9A.dataset.inView = 'false';
      visibilityObserver_b4P.observe(shell_z9A);
    } else {
      shell_z9A.dataset.inView = 'true';
    }

    updateMoveState_v5D();
    renderPosition_f6N();
    var resizeFrame_r2 = 0;
    function handleResize_r3() {
      if (resizeFrame_r2) return;
      resizeFrame_r2 = requestAnimationFrame(function () {
        resizeFrame_r2 = 0;
        if (!shell_z9A.isConnected) return;
        updateMoveState_v5D(); renderPosition_f6N();
        if (shell_z9A.dataset.bleed === 'LEFT' && settings_b8C.iconPos_n5B === 'BL') {
          controls_m1F.style.setProperty('left', Math.max(0, parentBlocks_p6T.getBoundingClientRect().left - shell_z9A.getBoundingClientRect().left) + 'px', 'important');
        }
      });
    }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(handleResize_r3).observe(viewport_s6W);
    else global.addEventListener('resize', handleResize_r3);
    installSliderRecord_d2B(parentCallout_x5J, shell_z9A, params_t7K, settings_b8C, {
      refresh: function () {
        applyBleedLive_b4();
        shell_z9A.style.setProperty('--slide-live-gap_s4P', settings_b8C.gap_z2L);
        shell_z9A.style.setProperty('--slide-live-width_s4P', settings_b8C.width_f8D);
        shell_z9A.style.setProperty('--slide-live-mobile-width_s4P', settings_b8C.mobileWidth_r6A);
        shell_z9A.style.setProperty('--slide-live-transition_s4P', settings_b8C.transition_g7K);
        shell_z9A.style.setProperty('--slide-live-overlay_s4P', settings_b8C.overlayHover_s8R);
        shell_z9A.style.setProperty('--slide-live-icon-size_s4P', settings_b8C.iconSize_v4E);
        shell_z9A.style.setProperty('--slide-live-icon-gap_s4P', settings_b8C.iconGap_x2F);
        shell_z9A.style.setProperty('--slide-live-radius_s4P', settings_b8C.radius_j5K);
        shell_z9A.style.setProperty('--slide-live-shadow_s4P', settings_b8C.shadow_m7P);
        /* v1.6.0: 비율(RT)은 BG 슬라이드의 속성만 바꾸면 되므로 실시간으로 반영한다. */
        slideLinks_q5H.forEach(function (entry_r1) {
          var item_r2 = entry_r1.item_z1F;
          if (item_r2.dataset.imageMode === 'bg' && settings_b8C.ratio_c4J) {
            item_r2.dataset.fixedRatio = 'true';
            item_r2.style.setProperty('--slide-live-ratio_s4P', settings_b8C.ratio_c4J);
          } else {
            delete item_r2.dataset.fixedRatio;
            item_r2.style.removeProperty('--slide-live-ratio_s4P');
          }
        });
        controls_m1F.dataset.pos = settings_b8C.iconPos_n5B;
        controls_m1F.style.removeProperty('left');
        if (shell_z9A.dataset.bleed === 'LEFT' && settings_b8C.iconPos_n5B === 'BL') {
          controls_m1F.style.setProperty('left', Math.max(0, parentBlocks_p6T.getBoundingClientRect().left - shell_z9A.getBoundingClientRect().left) + 'px', 'important');
        }
        previous_z3P.style.setProperty('display', settings_b8C.iconPos_n5B === 'CR' ? 'none' : 'inline-flex', 'important');
        next_r6D.style.setProperty('display', settings_b8C.iconPos_n5B === 'CL' ? 'none' : 'inline-flex', 'important');
        previous_z3P.textContent = ''; next_r6D.textContent = '';
        previous_z3P.appendChild(iconElement_t8V(settings_b8C.leftIcon_a3S, false));
        var mirror_n1 = !String(settings_b8C.rightIcon_d9T || '').trim();
        next_r6D.appendChild(iconElement_t8V(mirror_n1 ? settings_b8C.leftIcon_a3S : settings_b8C.rightIcon_d9T, mirror_n1, true));
        slideLinks_q5H.forEach(function (entry_t1) {
          var co_t2 = entry_t1.item_z1F.querySelector('.slide-card_s4P');
          var wr_t3 = co_t2 && findBlocksWrap_l3F(findCardBox_k9M(co_t2));
          if (!wr_t3) return;
          if (settings_b8C.textColor_j8C === 'AUTO') entry_t1.item_z1F.style.removeProperty('color');
          applyTextStyle_v4H(entry_t1.item_z1F, wr_t3, settings_b8C);
        });
        stopAuto_d7H(); updateMoveState_v5D(); renderPosition_f6N(); startAuto_y4B();
        handleResize_r3();
      },
      read: function () { return { index: currentIndex_e4C, canMove: canMove_j2K, paused: userPaused_m4K, count: slideLinks_q5H.length }; }
    });
  }

  function render_v9X(payload_c3M) {
    injectStyle_a7F();
    var parentCallout_a2P = findCallout_j1Q(payload_c3M.block);
    if (!parentCallout_a2P) {
      console.error('[call-slide] call-slide 토큰을 감싼 상위 콜아웃을 찾지 못했습니다.');
      return;
    }
    createSlider_u2Y(parentCallout_a2P, payload_c3M.params || {});
  }


  // 대시보드 연결 API. 노션 원문을 수정하지 않는다.
  var FIELD_d3C = [
    ['gap','gap_z2L','GAP','GAP','--slide-gap_k7M','20px','length',false],
    ['width','width_f8D','W','WIDTH','--slide-width_p4R','400px','positiveLength',false],
    ['mobileWidth','mobileWidth_r6A','MW','MOBILE_WIDTH','--slide-mobile-width_v2Q','280px','positiveLength',false],
    ['ratio','ratio_c4J','RT','RATIO','--slide-ratio_t8A','AUTO','ratio',false],
    ['autoplay','autoplay_e5M','AUTO','AUTOPLAY','--slide-autoplay_n3F','1','bool',false],
    ['interval','intervalMs_v1P','ITV','INTERVAL','--slide-interval_h9L','3s','interval',false],
    ['hoverPause','hoverPause_y7Q','HP','HOVER_PAUSE','--slide-hover-pause_r1C','1','bool',false],
    ['textColor','textColor_j8C','TC','TEXT_COLOR','--slide-text-color_b5J','AUTO','color',false],
    ['textAlign','textAlign_u6H','TA','TEXT_ALIGN','--slide-text-align_q2E','BL','align',false],
    ['imageMode','imageMode_r8L','IMG','IMAGE_MODE','--slide-image-mode_h3W','FIT','mode',true],
    ['leftIcon','leftIcon_a3S','LI','LEFT_ICON','--slide-left-icon_m4V','fa-solid fa-angle-left','icon',false],
    ['rightIcon','rightIcon_d9T','RI','RIGHT_ICON','--slide-right-icon_x7K','','icon',false],
    ['iconPosition','iconPos_n5B','IP','ICON_POSITION','--slide-icon-position_a9D','BL','position',false],
    ['iconSize','iconSize_v4E',null,null,'--slide-icon-size_s3N','40px','positiveLength',false],
    ['iconGap','iconGap_x2F',null,null,'--slide-icon-gap_g6H','10px','length',false],
    ['transition','transition_g7K',null,null,'--slide-transition_d6W','320ms','time',false],
    ['overlayHover','overlayHover_s8R',null,null,'--slide-overlay-hover_f8P','300ms','time',false],
    ['swipeThreshold','swipeThreshold_w3P',null,null,'--slide-swipe-threshold_z1T','36px','threshold',false],
    ['bleed','bleed_q2R','BLEED','BLEED','--slide-bleed_b7E','NONE','bleed',false],
    ['radius','radius_j5K','BX','RADIUS','--slide-radius_r4C','16px','length',false],
    ['shadow','shadow_m7P','SH','SHADOW','--slide-shadow_s8H','none','shadow',false]
  ].map(function(f_a){return {key:f_a[0],internal:f_a[1],token:f_a[2],longToken:f_a[3],css:f_a[4],defaultValue:f_a[5],type:f_a[6],requiresReload:f_a[7]};});
  var commonOriginal_d4D = {};
  var commonEdited_d5E = {};
  var commonStyle_d6F = null;
  function clone_d7G(v_a){return JSON.parse(JSON.stringify(v_a));}
  function field_d8H(key_a){return FIELD_d3C.filter(function(f_a){return f_a.key===key_a;})[0];}
  function normalize_d9I(f_a,v_a){
    if(v_a===null)return null;
    if(f_a.type==='bool'){
      if(v_a===true||v_a===false)return v_a?'1':'0';
      if(/^(1|ON|TRUE|YES|Y)$/i.test(String(v_a)))return '1';
      if(/^(0|OFF|FALSE|NO|N)$/i.test(String(v_a)))return '0';
      throw new Error(f_a.key+': true/false 또는 ON/OFF를 입력하세요.');
    }
    var s_a=String(v_a).trim(),n_a;
    if(f_a.type==='length'||f_a.type==='positiveLength'){
      if(/^\d+(\.\d+)?$/.test(s_a))s_a+='px';
      if(!/^\d+(\.\d+)?(px|%|em|rem|vw|vh)$/i.test(s_a)||(f_a.type==='positiveLength'&&parseFloat(s_a)<=0))throw new Error(f_a.key+': 길이 값이 잘못되었습니다.');
    }else if(f_a.type==='time'||f_a.type==='interval'){
      if(/^\d+(\.\d+)?$/.test(s_a))s_a+=f_a.type==='interval'?'s':'ms';
      if(!/^\d+(\.\d+)?(ms|s)$/i.test(s_a))throw new Error(f_a.key+': 시간 형식이 잘못되었습니다.');
      n_a=cssTimeMs_c2W(s_a,'0ms');
      if(f_a.type==='interval'&&n_a<1000)throw new Error('재생 간격은 1초 이상이어야 합니다.');
    }else if(f_a.type==='threshold'){
      n_a=Number(s_a.replace(/px$/i,''));if(!isFinite(n_a)||n_a<1||!/^[\d.]+(?:px)?$/i.test(s_a))throw new Error('스와이프 거리는 1px 이상이어야 합니다.');s_a=n_a+'px';
    }else if(f_a.type==='ratio'){
      if(s_a.toUpperCase()==='AUTO')s_a='AUTO';
      else{if(!/^\d+(?:\.\d+)?\s*[:/]\s*\d+(?:\.\d+)?$/.test(s_a)||!normalizeRatio_e1T(s_a))throw new Error('비율은 AUTO 또는 4:5 형식이어야 합니다.');s_a=normalizeRatio_e1T(s_a);}
    }else if(f_a.type==='color'){
      if(!/^(AUTO|WHITE|BLACK)$/i.test(s_a)&&!/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(s_a))throw new Error('글자색은 AUTO/WHITE/BLACK/#hex만 지원합니다.');
      s_a=/^(AUTO|WHITE|BLACK)$/i.test(s_a)?s_a.toUpperCase():s_a;
    }else if(f_a.type==='align'){s_a=s_a.toUpperCase();if(!/^[TCB][LCR]$/.test(s_a))throw new Error('정렬 형식 오류');
    }else if(f_a.type==='mode'){s_a=s_a.toUpperCase();if(['FIT','FULL','BG'].indexOf(s_a)<0)throw new Error('이미지 모드 오류');
    }else if(f_a.type==='position'){s_a=s_a.toUpperCase();if(['BL','BC','BR','CL','CR','CC','CB'].indexOf(s_a)<0)throw new Error('화살표 위치 오류');
    }else if(f_a.type==='bleed'){s_a=s_a.toUpperCase();if(['NONE','LEFT','RIGHT','BOTH'].indexOf(s_a)<0)throw new Error('BLEED 오류');
    }else if(f_a.type==='shadow'){if(!global.CSS||!global.CSS.supports('box-shadow',s_a))throw new Error('그림자 형식 오류');
    }else if(f_a.type==='icon'){if(s_a&&!/^[a-zA-Z0-9_\- ]+$/.test(s_a))throw new Error('아이콘 클래스 형식 오류');}
    return s_a;
  }
  function validatePatch_e1J(p_a,common_a){
    if(!p_a||typeof p_a!=='object'||Array.isArray(p_a))throw new Error('설정 객체를 입력하세요.');
    var out_a={};Object.keys(p_a).forEach(function(k_a){
      var f_a=field_d8H(k_a);if(!f_a)throw new Error('지원하지 않는 설정: '+k_a);
      if(!common_a&&!f_a.token)throw new Error(k_a+'는 사이트 공통 설정에서만 변경하세요.');
      out_a[k_a]=normalize_d9I(f_a,p_a[k_a]);
    });return out_a;
  }
  function effective_e2K(rec_a){
    var raw_a=clone_d7G(rec_a.params),out_a=paramsForSlider_i3C(raw_a);
    // 빈 아이콘 클래스는 기존 pick의 빈 값 처리와 별개로 명시적으로 허용한다.
    FIELD_d3C.forEach(function(f_a){
      if(f_a.type==='icon'&&f_a.token&&Object.prototype.hasOwnProperty.call(raw_a,f_a.token)&&raw_a[f_a.token]==='')out_a[f_a.internal]='';
    });return out_a;
  }
  function installSliderRecord_d2B(callout_a,shell_a,params_a,settings_a,hooks_a){
    var normalized_a={};Object.keys(params_a||{}).forEach(function(k_a){normalized_a[String(k_a).toUpperCase()]=params_a[k_a];});
    liveSliders_d1A.push({id:callout_a.getAttribute('data-block-id')||shell_a.id||('slider-'+liveSliders_d1A.length),callout:callout_a,element:shell_a,params:normalized_a,originalParams:clone_d7G(normalized_a),settings:settings_a,hooks:hooks_a,originalSettings:clone_d7G(settings_a)});
    FIELD_d3C.forEach(function(f_a){if(!Object.prototype.hasOwnProperty.call(commonOriginal_d4D,f_a.key))commonOriginal_d4D[f_a.key]=cssValue_b6N(f_a.css,'');});
  }
  function resolve_e3L(target_a){
    var rec_a=liveSliders_d1A.filter(function(r_a){return r_a.element.isConnected&&(typeof target_a==='string'?r_a.id===target_a:r_a.element===target_a||r_a.callout===target_a);})[0];
    if(!rec_a)throw new Error('슬라이더를 찾을 수 없습니다. dashboard.list()의 id를 사용하세요.');return rec_a;
  }
  // 목록 제목: 실제 표시되는 첫 슬라이드의 제목을 우선하고 캡션·토큰·숨겨진 글자는 제외한다.
  function sliderTitle_t1A(first_a) {
    if (!first_a) return '슬라이더';
    function visible_t2B(node_a) {
      for (var p_a = node_a; p_a && p_a !== first_a.parentElement; p_a = p_a.parentElement) {
        if (p_a.hidden || p_a.getAttribute('data-engine-hidden') === 'true' ||
            p_a.matches('figcaption,[class*="Caption"],[class*="caption"],.notion-image-block,.notion-record-icon,script,style,pre,code')) return false;
        var cs_a = global.getComputedStyle(p_a);
        if (cs_a.display === 'none' || cs_a.visibility === 'hidden' || cs_a.visibility === 'collapse') return false;
      }
      return true;
    }
    function clean_t3C(text_a) {
      return String(text_a || '').replace(/\[\[?%[\s\S]*?%\]\]?/g, '').replace(/\s+/g, ' ').trim();
    }
    function text_t4D(root_a) {
      var walker_a = document.createTreeWalker(root_a, 4), parts_a = [], node_a;
      while ((node_a = walker_a.nextNode())) {
        if (node_a.parentElement && visible_t2B(node_a.parentElement)) parts_a.push(node_a.nodeValue || '');
      }
      return clean_t3C(parts_a.join(''));
    }
    var headings_a = first_a.querySelectorAll('h1,h2,h3,h4,h5,h6,.notion-header-block,.notion-sub_header-block,.notion-sub_sub_header-block,.notion-header_4-block');
    for (var i_a = 0; i_a < headings_a.length; i_a++) {
      if (!visible_t2B(headings_a[i_a])) continue;
      var title_a = text_t4D(headings_a[i_a]);
      if (title_a) return title_a.slice(0, 60);
    }
    var blocks_a = first_a.querySelectorAll('.notion-text-block');
    for (var j_a = 0; j_a < blocks_a.length; j_a++) {
      if (!visible_t2B(blocks_a[j_a])) continue;
      var text_a = text_t4D(blocks_a[j_a]);
      if (text_a) return text_a.slice(0, 60);
    }
    return text_t4D(first_a).slice(0, 60) || '제목 없는 슬라이더';
  }
  function list_e4M(){return liveSliders_d1A.filter(function(r_a){return r_a.element.isConnected;}).map(function(r_a,i_a){
    var first_a=r_a.element.querySelector('.slide-item_s4P');
    return {id:r_a.id,index:i_a,title:sliderTitle_t1A(first_a),element:r_a.element};
  });}
  function publicValue_f6X(f_a,value_a){
    if(f_a.key==='interval')return value_a+'ms';
    if(f_a.key==='swipeThreshold')return value_a+'px';
    if(f_a.key==='ratio')return value_a||'AUTO';
    if(f_a.key==='imageMode')return String(value_a).toUpperCase();
    return value_a;
  }
  function read_e5N(target_a){
    var r_a=resolve_e3L(target_a),next_a=effective_e2K(r_a),config_a={},applied_a={},overrides_a={},pending_a=[];
    FIELD_d3C.forEach(function(f_a){
      config_a[f_a.key]=publicValue_f6X(f_a,next_a[f_a.internal]);applied_a[f_a.key]=publicValue_f6X(f_a,r_a.settings[f_a.internal]);
      overrides_a[f_a.key]=f_a.token&&(Object.prototype.hasOwnProperty.call(r_a.params,f_a.token)||Object.prototype.hasOwnProperty.call(r_a.params,f_a.longToken))? (Object.prototype.hasOwnProperty.call(r_a.params,f_a.token)?r_a.params[f_a.token]:r_a.params[f_a.longToken]):null;
      if(f_a.requiresReload&&JSON.stringify(config_a[f_a.key])!==JSON.stringify(applied_a[f_a.key]))pending_a.push(f_a.key);
    });return {id:r_a.id,config:config_a,applied:applied_a,overrides:overrides_a,pending:pending_a,requiresReload:pending_a.length>0,runtime:r_a.hooks.read(),edited:JSON.stringify(r_a.params)!==JSON.stringify(r_a.originalParams)};
  }
  function refresh_e6O(r_a){
    var next_a=effective_e2K(r_a);
    FIELD_d3C.forEach(function(f_a){if(!f_a.requiresReload)r_a.settings[f_a.internal]=next_a[f_a.internal];});r_a.hooks.refresh();
  }
  function apply_e7P(target_a,patch_a){
    var r_a=resolve_e3L(target_a),v_a=validatePatch_e1J(patch_a,false),old_a=clone_d7G(r_a.params);
    Object.keys(v_a).forEach(function(k_a){var f_a=field_d8H(k_a);delete r_a.params[f_a.token];delete r_a.params[f_a.longToken];if(v_a[k_a]!==null)r_a.params[f_a.token]=v_a[k_a];});
    try{refresh_e6O(r_a);}catch(e_a){r_a.params=old_a;try{refresh_e6O(r_a);}catch(e_b){}throw e_a;}return read_e5N(r_a.id);
  }
  function restore_e8Q(target_a){var r_a=resolve_e3L(target_a);r_a.params=clone_d7G(r_a.originalParams);refresh_e6O(r_a);return read_e5N(r_a.id);}
  function token_e9R(target_a,options_a){
    var r_a=resolve_e3L(target_a),parts_a=['call-slide'],raw_a=r_a.params,known_a={};
    FIELD_d3C.forEach(function(f_a){
      if(!f_a.token)return;known_a[f_a.token]=true;known_a[f_a.longToken]=true;
      var v_a=Object.prototype.hasOwnProperty.call(raw_a,f_a.token)?raw_a[f_a.token]:raw_a[f_a.longToken];
      if(v_a==='')v_a='NONE';
      if(v_a!==undefined&&v_a!==null)parts_a.push((options_a&&options_a.longNames?f_a.longToken:f_a.token)+' '+v_a);
    });
    Object.keys(raw_a).forEach(function(k_a){if(!known_a[k_a])parts_a.push(k_a+' '+raw_a[k_a]);});
    return '[% '+parts_a.join(' :: ')+' %]';
  }
  function commonRead_f1S(){
    var values_a={},explicit_a={};FIELD_d3C.forEach(function(f_a){explicit_a[f_a.key]=cssValue_b6N(f_a.css,'');values_a[f_a.key]=f_a.type==='icon'&&/^NONE$/i.test(explicit_a[f_a.key])?'':(explicit_a[f_a.key]||f_a.defaultValue);});
    return {values:values_a,explicit:explicit_a,edited:clone_d7G(commonEdited_d5E),note:'CSS 공통값보다 토큰이 우선합니다. IMG/BLEED/RT 변경은 새로고침 후 적용됩니다.'};
  }
  function commonApply_f2T(patch_a){
    var values_a=validatePatch_e1J(patch_a,true),old_a=clone_d7G(commonEdited_d5E);
    Object.keys(values_a).forEach(function(k_a){if(values_a[k_a]===null)delete commonEdited_d5E[k_a];else commonEdited_d5E[k_a]=values_a[k_a];});
    try{writeCommon_f3U();}catch(e_a){commonEdited_d5E=old_a;writeCommon_f3U();throw e_a;}return commonRead_f1S();
  }
  function writeCommon_f3U(){
    if(!commonStyle_d6F){commonStyle_d6F=document.createElement('style');commonStyle_d6F.id='call-slide-dashboard-preview-v1';document.head.appendChild(commonStyle_d6F);}
    commonStyle_d6F.textContent=':root{'+Object.keys(commonEdited_d5E).map(function(k_a){return field_d8H(k_a).css+':'+(commonEdited_d5E[k_a]===''?'NONE':commonEdited_d5E[k_a])+'!important;';}).join('')+'}';
    liveSliders_d1A.forEach(function(r_a){if(r_a.element.isConnected)refresh_e6O(r_a);});
  }
  function commonRestore_f4V(){commonEdited_d5E={};writeCommon_f3U();return commonRead_f1S();}
  function css_f5W(options_a){
    var lines_a=[],all_a=options_a&&options_a.full,now_a=commonRead_f1S();
    FIELD_d3C.forEach(function(f_a){var value_a=now_a.values[f_a.key];if(all_a||String(value_a)!==String(f_a.defaultValue))lines_a.push('  '+f_a.css+': '+(value_a===''?'NONE':value_a)+';');});
    return lines_a.length?':root {\n'+lines_a.join('\n')+'\n}':'/* 엔진 기본값 사용: 이전 call-slide 공통 설정 블록은 제거하세요. */';
  }
  /* v1.6.0: 미리보기 창. 대시보드가 저장한 임시 설정을 이름이 CallSlidePreview인 창에서만 적용한다. */
  var PREVIEW_NAME_p1 = 'CallSlidePreview';
  var PREVIEW_KEY_p2 = 'ce-slide-preview-v1';
  var previewData_p3 = null;
  function applyPreviewParams_p5(callout_a, params_a) {
    if (!previewData_p3 || !previewData_p3.sliders) return params_a;
    var id_b = callout_a.getAttribute('data-block-id') || '';
    var patch_c = previewData_p3.sliders[id_b];
    if (!patch_c || typeof patch_c !== 'object') return params_a;
    var out_d = {};
    Object.keys(params_a || {}).forEach(function (k_e) { out_d[String(k_e).toUpperCase()] = params_a[k_e]; });
    Object.keys(patch_c).forEach(function (k_f) {
      var f_g = field_d8H(k_f), v_h;
      if (!f_g || !f_g.token) return;
      try { v_h = normalize_d9I(f_g, patch_c[k_f]); }
      catch (e_i) { console.warn('[call-slide] 미리보기 설정 무시: ' + k_f + ' - ' + e_i.message); return; }
      delete out_d[f_g.token]; delete out_d[f_g.longToken];
      if (v_h !== null) out_d[f_g.token] = v_h;
    });
    return out_d;
  }
  function showPreviewBadge_p6() {
    function add_a() {
      var b_b = document.createElement('div');
      b_b.textContent = '미리보기 · 대시보드 임시 설정 적용 중';
      b_b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;padding:6px 10px;border-radius:14px;background:#ff6b35;color:#fff;font:12px/1.4 system-ui,sans-serif;pointer-events:none';
      (document.body || document.documentElement).appendChild(b_b);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add_a);
    else add_a();
  }
  function loadPreview_p4() {
    if (global.name !== PREVIEW_NAME_p1) return;
    try {
      var raw_a = global.localStorage.getItem(PREVIEW_KEY_p2);
      if (!raw_a) return;
      var data_b = JSON.parse(raw_a), values_c = {};
      if (!data_b || typeof data_b !== 'object') return;
      previewData_p3 = { common: data_b.common || {}, sliders: data_b.sliders || {} };
      Object.keys(previewData_p3.common).forEach(function (k_d) {
        var f_e = field_d8H(k_d);
        if (!f_e || previewData_p3.common[k_d] === null) return;
        try { values_c[k_d] = normalize_d9I(f_e, previewData_p3.common[k_d]); }
        catch (e_f) { console.warn('[call-slide] 미리보기 공통값 무시: ' + k_d + ' - ' + e_f.message); }
      });
      commonEdited_d5E = values_c;
      writeCommon_f3U();
      showPreviewBadge_p6();
      console.log('[call-slide] 미리보기 창: 대시보드 임시 설정을 적용했습니다.');
    } catch (e_g) {
      console.warn('[call-slide] 미리보기 설정을 읽지 못했습니다: ' + e_g.message);
    }
  }
  loadPreview_p4();

  global.CallSlideEngine = {
    version:VERSION_r1Z,
    dashboard:{apiVersion:'1.1.0',preview:{windowName:PREVIEW_NAME_p1,storageKey:PREVIEW_KEY_p2,active:!!previewData_p3},list:list_e4M,read:read_e5N,apply:apply_e7P,restore:restore_e8Q,token:token_e9R,
      schema:function(){return clone_d7G(FIELD_d3C);},
      common:{read:commonRead_f1S,apply:commonApply_f2T,restore:commonRestore_f4V,css:css_f5W},
      diagnose:function(){var rows_a=list_e4M().map(function(x_a){var r_a=read_e5N(x_a.id);return {id:x_a.id,count:r_a.runtime.count,canMove:r_a.runtime.canMove,pending:r_a.pending.join(','),owner:resolve_e3L(x_a.id).callout.dataset.ceOwner};});console.table(rows_a);return rows_a;}
    }
  };

  global.CoreEngine.register('call-slide', render_v9X);

  /* 이미 존재하는 [% call-slide %] 토큰도 즉시 다시 처리 */
  global.CoreEngine.scan(document);

  console.log('[call-slide] 콜아웃 슬라이더 엔진 로드 완료 (v' + VERSION_r1Z + ')');
})(window);



