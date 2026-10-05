// =====================================================================================
// menubar-2.0-20261004.js   |   메뉴바 엔진 2.0 (JS)
// 한 줄 설명 : Oopy/Notion 페이지 맨 위에 고정 메뉴바(로고, 대메뉴, 하위메뉴, CTA 버튼, 검색,
//              모바일 햄버거)를 만든다.
// 짝 파일    : menubar-2.0-20261004.css (스타일)
//              menubar-2.0-option-20261004.html (모양 변수 + 메뉴 내용 설정)
//              menubar-2.0-dashboard-20261004.js (설정을 눈으로 보며 조정하는 대시보드)
// 접미사     : 모든 클래스 이름은 efc_ 접두사 또는 난수 접미사(_h7k 등)를 붙여 Oopy/Notion 기본
//              스타일과 겹치지 않게 했다.
// 의존성     :
//   - menubar-2.0-20261004.css : 필수. 없으면 메뉴바 모양이 깨진다.
//   - menubar-2.0-option-20261004.html : 필수. 이 엔진보다 먼저 실행되어
//     window.efcMenubarConfig (메뉴 내용 설정)를 만들어 두어야 한다.
//   - Font Awesome 6.5.2 (cdnjs) : 하위메뉴에 폰트어썸 아이콘이 있는데 페이지에 Font Awesome 이
//     없으면 엔진이 자동으로 불러온다. 이미 있으면 다시 불러오지 않는다.
//     (검색 아이콘과 화살표는 직접 그리므로 폰트어썸이 필요 없다.)
//   - Oopy 검색 버튼 : 검색 기능(useSearch)을 켜면 Oopy 기본 검색 버튼(.search-button 또는
//     .xi-search)을 대신 눌러 준다. 검색창 자체는 노션이 그리는 것(notion-quick-find-menu)이다.
//   - core.js 등 다른 엔진 : 의존하지 않는다.
// =====================================================================================
//
// [개요]
// - 페이지가 열리면 window.efcMenubarConfig (내용)와 :root 변수(모양)를 읽어 헤더를 한 번 만든다.
//   헤더는 body 맨 앞에 들어가고 화면 위에 고정된다.
// - PC : 로고 | 대메뉴 | CTA 버튼(+검색 버튼) 3칸 구조. 대메뉴에 마우스를 올리면 하위메뉴가 열린다.
// - 모바일 : 화면 너비가 mobileBreakpoint 이하이면 대메뉴가 사라지고 햄버거 버튼이 나타난다.
//   햄버거를 누르면 패널이 열리고, 상단바에는 showOnMobileBar 가 true 인 CTA 버튼만 남는다.
//   상단바에는 검색 아이콘(showMobileSearchBar)도 둘 수 있다.
// - 하위메뉴는 두 종류다. 상세형(아이콘 + 제목 + 설명), 심플형(제목만).
// - 검색 버튼을 누르면 노션 검색창이 열리고, 위치/크기, 모서리, 플레이스홀더, 검색 결과 표시 항목과
//   글자 스타일을 설정으로 바꿀 수 있다 (기본은 모두 우피 그대로).
//
// [설정 내용 요약]  (키마다 자세한 설명, 기본값, 값 규칙은 option 파일 상단 주석 참고)
// - 화면/동작 : mobileBreakpoint, hideNotionTopbar, useHeaderShadow, scrollEffect, scrollThreshold, offsetBody
// - 로고      : logo { url, mobileUrl, alt, link }
// - 메뉴      : menuItems [ { label, url, target, showArrow, dropdownStyle,
//                             children [ { title, url, target, desc, icon { type, value, color, hoverColor } } ] } ]
// - 버튼      : ctaButtons [ { label, url, target, variant, showOnMobileBar } ]
// - 검색      : useSearch, oopyPlan, searchPosition, showMobileSearchBtn, showMobileSearchBar,
//               searchPlaceholder, searchPlaceholderMobile, searchPanelCustom, searchRadiusCustom,
//               searchResultCustom, searchResultShow { icon, location, desc, type, footer }
// - 모바일    : showMobileDesc, mobileCtaLayout, mobileCtaGridCols, mobileAccordion
// - 하위메뉴  : showArrowDefault, defaultDropdownStyle, detailedWidthMode, arrowAnimation
//
// [자동으로 처리하는 것]
// - 모바일 전환 : window.innerWidth <= mobileBreakpoint 이면 헤더에 모바일 상태를 켠다.
//   로고도 같은 기준으로 바뀐다(logo.mobileUrl 이 있을 때). 창 크기를 바꾸면 즉시 따라간다.
// - PC 하위메뉴 : 마우스를 올리거나 키보드 포커스가 오면 열린다. 다른 대메뉴를 올리면 이전 메뉴는
//   즉시 닫히고, 메뉴 밖으로 나가면 0.2초 뒤에 닫힌다. 대메뉴와 하위메뉴 사이 틈에서는 닫히지 않는다.
//   바깥을 클릭하거나 ESC 를 누르면 모두 닫힌다. 주소가 # 인 대메뉴는 클릭하면 열기/닫기만 한다.
// - 모바일 하위메뉴 : 대메뉴(또는 오른쪽 화살표)를 누르면 펼쳐진다. 주소가 # 이면 이동하지 않고
//   펼치기만 한다. mobileAccordion 이 true 이면 하나를 펼칠 때 다른 것은 접힌다. 항목 수 제한은 없다.
// - 화살표 : 이미지/폰트 없이 CSS 로 그린다. arrowAnimation 이 false 이면 회전하지 않는다.
// - 하위메뉴 너비(상세형) : detailedWidthMode 가 auto 이면 글자 길이에 맞춰 최소~최대 너비 안에서
//   늘어나고, fixed 이면 고정 너비를 쓴다.
// - 폰트어썸 : 설정에 폰트어썸 아이콘이 하나라도 있으면 필요할 때 자동으로 불러온다.
// - 로고 : 로고 이미지가 다 불러와진 뒤 대메뉴 중앙 정렬 폭을 다시 계산한다.
// - 스크롤 : scrollEffect 가 true 이면 scrollThreshold(px) 이상 내려갔을 때 그림자를 보여준다.
//   (useHeaderShadow 가 false 이면 그림자는 항상 없다.)
// - 노션 상단바 : hideNotionTopbar 가 true 이면 노션 기본 상단바(.notion-topbar)를 화면 밖으로 보낸다.
//   (투명하게 만들지 않는다. 상단바 안에 들어 있는 검색창이 함께 안 보이는 문제를 피하기 위해서다.)
// - 본문 여백 : offsetBody 가 true 이면 본문 위쪽에 헤더 높이만큼 여백을 넣어 가려지지 않게 한다.
// - 검색 버튼 찾기 : oopyPlan 이 standard 이면 .search-button 을, pro 이면 .xi-search 를 먼저 찾고
//   없으면 반대쪽도 찾는다. 둘 다 없으면 안내 창을 띄운다.
// - 검색 버튼 배치 : searchPosition 이 right 이면 PC 는 CTA 오른쪽, 모바일 상단바 아이콘은 CTA 와
//   햄버거 사이, 패널 검색 버튼은 CTA 아래에 놓인다. left 이면 각각 반대쪽(CTA 왼쪽 / CTA 위)이다.
// - 검색창 커스텀 : 해당 스위치(searchPanelCustom, searchRadiusCustom, searchResultCustom)가 켜진 경우에만
//   body 에 표시용 클래스를 붙이고, CSS 가 그 클래스가 있을 때만 값을 적용한다. 스위치를 끄면 우피 기본이다.
//   모서리 둥글기는 바깥 패널에만 주고 안쪽(입력줄, 결과, 하단 문구)은 패널에 맞춰 잘리게 해서 통일한다.
// - 검색 결과 표시 항목 : searchResultShow 에서 false 인 항목(아이콘, 위치, 설명, 타입 배지, 하단 문구)을
//   숨긴다. 아이콘은 자리를 그대로 두고 그림만 숨기며, 제목은 항상 보인다.
// - 플레이스홀더 : 검색창이 열릴 때마다 입력칸 문구를 바꾼다. PC/모바일 문구를 따로 줄 수 있고,
//   모바일 문구가 비어 있으면 PC 문구를 쓴다. 둘 다 비어 있으면 우피 기본 문구를 그대로 둔다.
// - 모바일 상단바 : showOnMobileBar 인 CTA 가 하나도 없으면 빈 묶음이 차지하던 간격을 없앤다.
//
// [값 규칙]
// - 주소(url) : # 는 이동 없음. target 은 _self(현재 창) 또는 _blank(새 창). 새 창이면 보안 속성이 붙는다.
// - 불리언 키는 true / false 로 쓴다. 숫자 키는 따옴표 없이 숫자로 쓴다.
// - CTA variant 는 solid(채우기) 또는 outline(테두리). 그 외 값은 outline 으로 처리한다.
// - 아이콘 type 은 fa(폰트어썸 클래스) / image(이미지 주소) / none(없음). 개별 색(color, hoverColor)은
//   fa 아이콘에만 적용된다.
// - 키를 생략하면 엔진 내부 기본값이 쓰이는데, 이 값은 대시보드 기본값과 다른 것이 있다
//   (예: useSearch, mobileCtaLayout, defaultDropdownStyle, scrollEffect). 키를 생략하지 말고
//   대시보드가 출력한 코드를 그대로 쓴다.
//
// [주요 클래스]  (스타일을 직접 고칠 때 참고)
// - 헤더 전체 : efc_header_h7k
//   상태 클래스 : efc_mobileView_m8v(모바일 모드), is-open(햄버거 열림 / 대메뉴 열림), is-scrolled(스크롤),
//                 no-shadow_n9x(그림자 없음), no-arrow-anim_a1n(화살표 회전 없음),
//                 dd-auto_w1x(상세형 너비 자동), is-instant_i1x(애니메이션 없이 즉시 닫힘)
// - 구조 : headerInner_i2m(폭 제한) > headerRow_r3n(3칸 그리드) > logoLink_l4p / navDesktop_n6r / headerActions_o1a
// - 로고 : logoPicture_p1c, logoImg_g5q
// - 대메뉴 한 칸 : efc_navItem_v7s (하위메뉴가 있으면 링크가 efc_navTrigger_c1x, 없으면 navLink_k8t)
// - 화살표 : navArrowIcon_a2y
// - 하위메뉴 : dropdownSimple_d3z(심플 박스), dropdownDetailed_e4a(상세 박스), dropdownItem_f5b(상세 항목)
// - CTA : ctaGroup_m3i, ctaBtn_n4j(is-solid / is-outline), mobileBarCtaGroup_m1a(모바일 상단바)
// - 검색 : efc_desktopSearchBtn_s5l(PC), efc_mobileBarSearchBtn_s8m(모바일 상단바), efc_mobileSearchBtn_k6m(모바일 패널)
// - 모바일 : efc_toggleBtn_o5k(햄버거), mobilePanel_q7m(패널), efc_mobileGroup_r8n(대메뉴 한 묶음,
//            펼치면 is-expanded), mobileSubmenuPanel_w4s / mobileSubmenuInner_w5t(하위메뉴 영역),
//            efc_mobileCaret_v3r(펼침 화살표)
// - body 에 붙는 클래스 : efc_headerOffset_c9y(본문 여백), efc_mobileMode_b3m(모바일 폭),
//            efc_searchCustom_c1(검색창 위치/크기), efc_searchRadius_c2(검색창 모서리),
//            efc_searchResult_c3(검색 결과 글자 스타일),
//            efc_srHideIcon_c4 / efc_srHideLocation_c5 / efc_srHideDesc_c6 / efc_srHideType_c7 / efc_srHideFooter_c8
//            (검색 결과 아이콘, 위치, 설명, 타입 배지, 하단 문구 숨김)
//
// [공개 함수 / 변수]
// - window.efcMenubarConfig : 메뉴 내용 설정 객체. option 파일이 만든다. 엔진보다 먼저 있어야 한다.
// - window.efc_rebuildNav_v2a(설정 객체 선택) : 헤더를 지우고 다시 만든다. 설정 객체를 생략하면
//   window.efcMenubarConfig 를 쓴다. 페이지가 열릴 때 엔진이 한 번 자동 실행한다.
//   (대시보드가 미리보기를 그릴 때 이 함수를 호출한다.)
//
// [사용법]
// 1) Oopy 코드 삽입에 아래 순서로 넣는다.
//    (1) option 파일 내용 : 대시보드가 만든 style 블록 + script 블록
//    (2) 스타일 연결 : link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/menubar-2.0-20261002/menubar-2.0-20261004.css"
//    (3) 엔진 연결 : script 태그에 src="https://cdn.jsdelivr.net/gh/kwonkangin/notionoopy@main/menubar-2.0-20261002/menubar-2.0-20261004.js" 와 defer 를 붙인다
//    (option 파일이 엔진보다 앞에 있어야 한다.)
// 2) 모양이나 메뉴를 바꾸려면 menubar-2.0-dashboard-20261004.js 를 쓴다. 결과로 나온 코드로
//    option 파일 내용을 통째로 교체한다.
// 3) 엔진과 option 은 같은 버전(2.0) 끼리 쓴다. 이전 버전 설정 이름(옛 전역 변수)은 인식하지 않는다.
//
// [알려진 제한]
// - 헤더를 다시 만들 때마다(efc_rebuildNav_v2a 반복 호출) 문서 전체의 클릭/키 입력 감지가 쌓인다.
//   페이지를 여는 일반 사용(한 번만 생성)에서는 영향이 없고, 대시보드 미리보기를 오래 쓸 때만 생긴다.
// - 하위메뉴는 대메뉴 왼쪽 기준으로 펼쳐진다. 오른쪽 끝 대메뉴의 하위메뉴가 화면 밖으로 넘칠 수 있다.
// - 노션 상단바 숨김은 헤더를 만드는 순간 한 번만 찾는다. Oopy 가 상단바를 늦게 그리면 숨겨지지 않을 수 있다.
// - 폰트어썸 자동 불러오기는 cdnjs 에 접속할 수 있을 때만 동작한다. 접속이 막힌 환경에서는 이미지 아이콘을 쓴다.
// - 일부 변수는 PC 상세형에만 적용된다(모바일/심플형에는 반영되지 않음). 목록은 option 파일의 '적용' 항목 참고.
// - PC 화면 폭(mobileBreakpoint 초과)의 터치 기기에서는 마우스 올리기가 없다. 주소가 # 인 대메뉴만 탭으로 열린다.
// - 이미지 아이콘에는 개별 색을 줄 수 없다.
// - 검색은 Oopy 검색 버튼을 대신 누르는 방식이다. Oopy 설정(검색 버튼 표시)이 꺼져 있으면 안내 창만 뜬다.
// - 검색창 위치/크기, 모서리, 검색 결과 숨김/스타일은 노션 검색창의 구조와 CSS 의 :has() 선택자에 의존한다.
//   :has() 는 크롬 105+, 사파리 15.4+, 파이어폭스 121+ 에서 동작한다. 노션 검색창 구조가 바뀌면 해당
//   커스텀이 적용되지 않고 우피 기본 모양으로 보일 뿐 오류는 나지 않는다.
// - 검색 결과의 설명 최대 줄 수는 노션이 돌려주는 글자 수를 넘겨서 늘어나지 않는다.
// - 검색어 강조(굵은 글자) 부분은 우피 기본 스타일을 그대로 쓴다.
//
// [검증 상태]
// - 확인함 : PC 대메뉴 호버 색, 하위메뉴 표시/전환 시 겹침 해소, 화살표 표시와 애니메이션 켜기/끄기,
//            폰트어썸 아이콘 자동 불러오기, 상세형 하위메뉴 내용 맞춤 너비, 모바일 좌우 여백,
//            PC/모바일 로고 분리와 모바일 로고 높이, 모바일 아코디언 켜기/끄기와 펼침 애니메이션,
//            검색 버튼 동작, 모바일 상단바 검색 아이콘과 배치, 검색창 위치/크기/모서리/플레이스홀더,
//            검색 결과 표시 항목 숨김과 글자 스타일, 설명 최대 줄 수, 헤더 범위 box-sizing
// =====================================================================================





 (function () {
    "use strict";

    var EFC_DEFAULT_CONFIG_q1 = {
      mobileBreakpoint: 1024, desktopHamburger: false,
      useSearch: true, showMobileSearchBtn: false, showMobileSearchBar: true, searchPosition: "right", oopyPlan: "standard",
      hideNotionTopbar: true, useHeaderShadow: true, showMobileDesc: true, mobileCtaLayout: "vertical", mobileCtaGridCols: 1,
      scrollEffect: true, scrollThreshold: 10, offsetBody: true,
      logo: { url: "", mobileUrl: "", alt: "로고", link: "/" },
      showArrowDefault: true, defaultDropdownStyle: "detailed", mobileAccordion: true, arrowAnimation: false, detailedWidthMode: "auto",
      searchPanelCustom: true, searchPlaceholder: "궁금한 내용을 검색해보세요.", searchPlaceholderMobile: "",
      searchRadiusCustom: true, searchResultCustom: false,
      searchResultShow: { icon: false, location: false, desc: true, type: false, footer: true },
      menuItems: [], ctaButtons: []
    };

    function mergeDeep_q2(base, extra) {
      var out = Object.assign({}, base);
      if (!extra || typeof extra !== "object" || Array.isArray(extra)) return out;
      Object.keys(extra).forEach(function (k) {
        var a = base[k], b = extra[k];
        if (a && typeof a === "object" && !Array.isArray(a) && b && typeof b === "object" && !Array.isArray(b)) out[k] = mergeDeep_q2(a, b);
        else out[k] = b;
      });
      return out;
    }

    function resolveUrl_q3(url, base) {
      if (typeof url !== "string" || !url || !base || url.charAt(0) !== "/" || url.indexOf("//") === 0) return url;
      return String(base).replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
    }

    function normalizeIcon_q4(icon) {
      if (!icon || typeof icon !== "object" || icon.type === "none" || !icon.value) return { type: "none", value: "" };
      var out = { type: icon.type === "img" ? "image" : icon.type, value: icon.value };
      if (icon.color) out.color = icon.color;
      if (icon.hoverColor) out.hoverColor = icon.hoverColor;
      return out;
    }

    function normalizeChild_q5(child, cfg) {
      child = (child && typeof child === "object") ? child : {};
      return {
        title: child.title || child.label || "",
        url: resolveUrl_q3(child.url || "#", cfg.base),
        target: child.target || "_self",
        desc: child.desc || "",
        icon: normalizeIcon_q4(child.icon)
      };
    }

    function normalizeMenu_q6(item, cfg) {
      item = (item && typeof item === "object") ? item : {};
      var hasShowArrow = typeof item.showArrow === "boolean";
      return {
        label: item.label || "",
        url: resolveUrl_q3(item.url || "#", cfg.base),
        target: item.target || "_self",
        showArrow: hasShowArrow ? item.showArrow : cfg.showArrowDefault,
        dropdownStyle: item.dropdownStyle || cfg.defaultDropdownStyle,
        children: Array.isArray(item.children) ? item.children.filter(function (c) { return c && typeof c === "object"; }).map(function (c) { return normalizeChild_q5(c, cfg); }) : []
      };
    }

    function normalizeCta_q7(cta, cfg) {
      cta = (cta && typeof cta === "object") ? cta : {};
      return {
        label: cta.label || "",
        url: resolveUrl_q3(cta.url || "#", cfg.base),
        target: cta.target || "_self",
        variant: cta.variant || "solid",
        showOnMobileBar: cta.showOnMobileBar === true
      };
    }

    function mergeConfig_c2x(userConfig) {
      var cfg = mergeDeep_q2(EFC_DEFAULT_CONFIG_q1, userConfig || {});
      cfg.base = typeof cfg.base === "string" ? cfg.base.trim() : "";
      cfg.menuItems = Array.isArray(cfg.menuItems) ? cfg.menuItems.filter(function (i) { return i && typeof i === "object"; }).map(function (i) { return normalizeMenu_q6(i, cfg); }) : [];
      cfg.ctaButtons = Array.isArray(cfg.ctaButtons) ? cfg.ctaButtons.filter(function (i) { return i && typeof i === "object"; }).map(function (i) { return normalizeCta_q7(i, cfg); }) : [];
      return cfg;
    }

    function createEl_d3y(tag, className, attrs) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
      return el;
    }

    function buildIconNode_e4z(icon, wrapClass, imgClass, faClass) {
      if (!icon || icon.type === "none") return null;
      var wrap = createEl_d3y("div", wrapClass);
      if (icon.type === "image" && icon.value) wrap.appendChild(createEl_d3y("img", imgClass, { src: icon.value, alt: "아이콘" }));
      else if (icon.type === "fa" && icon.value) wrap.appendChild(createEl_d3y("i", icon.value + " " + faClass, { "aria-hidden": "true" }));
      else return null;
      return wrap;
    }

    /* [수정 2, 3] 모든 a 태그에 target 속성 적용 지원 */
    function buildDropdownSimple_f5a(children) {
      var box = createEl_d3y("div", "dropdownSimple_d3z");
      children.forEach(function (child) {
        var a = createEl_d3y("a", "dropdownSimpleItem_s4a", { href: child.url || "#", target: child.target || "_self" });
        if(child.target === "_blank") a.setAttribute("rel", "noopener noreferrer");
        a.textContent = child.title || child.label || "";
        box.appendChild(a);
      });
      return box;
    }

    function buildDropdownDetailed_g6b(children) {
      var box = createEl_d3y("div", "dropdownDetailed_e4a");
      children.forEach(function (child) {
        var iconNode = buildIconNode_e4z(child.icon, "dropdownIconWrap_g6c", "dropdownIconImg_h7d", "dropdownIconFa_i8e");
        var a = createEl_d3y("a", "dropdownItem_f5b" + (iconNode ? "" : " is-no-icon"), { href: child.url || "#", target: child.target || "_self" });
        if(child.target === "_blank") a.setAttribute("rel", "noopener noreferrer");
        
        if (child.icon && child.icon.color) a.style.setProperty('--localIconColor', child.icon.color);
        if (child.icon && child.icon.hoverColor) a.style.setProperty('--localIconHoverColor', child.icon.hoverColor);
        if (iconNode) a.appendChild(iconNode);

        var textWrap = createEl_d3y("div", "dropdownTextWrap_j9f");
        var title = createEl_d3y("span", "dropdownTitle_k1g");
        title.textContent = child.title || "";
        textWrap.appendChild(title);
        if (child.desc) {
          var desc = createEl_d3y("p", "dropdownDesc_l2h");
          desc.textContent = child.desc;
          textWrap.appendChild(desc);
        }
        a.appendChild(textWrap);
        box.appendChild(a);
      });
      return box;
    }

    function buildDesktopNavItem_h7c(item, cfg) {
      var hasChildren = Array.isArray(item.children) && item.children.length > 0;
      var wrap = createEl_d3y("div", "efc_navItem_v7s");
      var showArrow = (typeof item.showArrow === "boolean") ? item.showArrow : cfg.showArrowDefault;
      var style = item.dropdownStyle || cfg.defaultDropdownStyle;

      var link = createEl_d3y("a", hasChildren ? "efc_navTrigger_c1x" : "navLink_k8t", { href: item.url || "#", target: item.target || "_self" });
      if(item.target === "_blank") link.setAttribute("rel", "noopener noreferrer");
      link.appendChild(document.createTextNode(item.label || ""));
      if (hasChildren && showArrow) link.appendChild(createEl_d3y("span", "navArrowIcon_a2y", { "aria-hidden": "true" }));
      wrap.appendChild(link);

      if (hasChildren) {
        var dropdown = (style === "detailed") ? buildDropdownDetailed_g6b(item.children) : buildDropdownSimple_f5a(item.children);
        wrap.appendChild(dropdown);
        var closeTimer = null;
        function open() {
  clearTimeout(closeTimer);
  var opened = wrap.parentNode ? wrap.parentNode.querySelectorAll(".efc_navItem_v7s.is-open") : [];
  Array.prototype.forEach.call(opened, function (el) {
    if (el !== wrap) { el.classList.add("is-instant_i1x"); el.classList.remove("is-open"); }
  });
  wrap.classList.remove("is-instant_i1x");
  wrap.classList.add("is-open");
}
function scheduleClose() { closeTimer = setTimeout(function () { wrap.classList.remove("is-open"); }, 200); }
        wrap.addEventListener("mouseenter", open); wrap.addEventListener("mouseleave", scheduleClose);
        link.addEventListener("focus", open);
        link.addEventListener("click", function (e) {
          if (!item.url || item.url === "#") { e.preventDefault(); if (wrap.classList.contains("is-open")) wrap.classList.remove("is-open"); else open(); }
        });
      }
      return wrap;
    }

    /* [수정 1] 모바일 서브 아이템 구조 보강 (설명글 DOM 추가 및 CSS 연동 래퍼 주입) */
    function buildMobileSubItem_i8d(child) {
      var a = createEl_d3y("a", "mobileSubItem_x5t", { href: child.url || "#", target: child.target || "_self" });
      if(child.target === "_blank") a.setAttribute("rel", "noopener noreferrer");
      
      var iconNode = buildIconNode_e4z(child.icon, "mobileSubIconWrap_y6u", "mobileSubIconImg_z7v", "mobileSubIconFa_a8w");
      if (child.icon && child.icon.color) a.style.setProperty('--localIconColor', child.icon.color);
      if (child.icon && child.icon.hoverColor) a.style.setProperty('--localIconHoverColor', child.icon.hoverColor);
      if (iconNode) a.appendChild(iconNode);

      var textWrap = createEl_d3y("div", "mobileSubTextWrap_t9z");
      var titleSpan = createEl_d3y("span", "mobileSubTitle_t1y");
      titleSpan.textContent = child.title || child.label || "";
      textWrap.appendChild(titleSpan);
      
      if (child.desc) {
          var descSpan = createEl_d3y("span", "mobileSubDesc_d8y");
          descSpan.textContent = child.desc;
          textWrap.appendChild(descSpan);
      }
      a.appendChild(textWrap);
      return a;
    }

    function buildMobileGroup_j9e(item, cfg) {
      var hasChildren = Array.isArray(item.children) && item.children.length > 0;
      var group = createEl_d3y("div", "efc_mobileGroup_r8n");
      var row = createEl_d3y("div", "mobileItemRow_s9o");

      var link = createEl_d3y("a", hasChildren ? "efc_mobileTrigger_u2q" : "mobileLink_t1p", { href: item.url || "#", target: item.target || "_self" });
      if(item.target === "_blank") link.setAttribute("rel", "noopener noreferrer");
      link.textContent = item.label || "";
      row.appendChild(link);

      if (hasChildren) {
        var caret = createEl_d3y("button", "efc_mobileCaret_v3r", { type: "button", "aria-label": "하위메뉴 토글" });
        caret.innerHTML = '<span class="mobileCaretIcon_c3a" aria-hidden="true"></span>';
        var toggleGroup = function () {
  var willOpen = !group.classList.contains("is-expanded");
  if (willOpen && cfg.mobileAccordion && group.parentNode) {
    Array.prototype.forEach.call(group.parentNode.querySelectorAll(".efc_mobileGroup_r8n.is-expanded"), function (g) { g.classList.remove("is-expanded"); });
  }
  group.classList.toggle("is-expanded", willOpen);
};
caret.addEventListener("click", toggleGroup);
row.appendChild(caret);
link.addEventListener("click", function (e) {
  if (!item.url || item.url === "#") { e.preventDefault(); toggleGroup(); }
});
      }
      group.appendChild(row);

      if (hasChildren) {
        var submenu = createEl_d3y("div", "mobileSubmenuPanel_w4s");
var submenuInner = createEl_d3y("div", "mobileSubmenuInner_w5t");
item.children.forEach(function (child) { submenuInner.appendChild(buildMobileSubItem_i8d(child)); });
submenu.appendChild(submenuInner);
group.appendChild(submenu);
      }
      return group;
    }

    function buildCtaBtn_k1f(cta, className) {
      var variantClass = cta.variant === "solid" ? "is-solid" : "is-outline";
      var a = createEl_d3y("a", className + " " + variantClass, { href: cta.url || "#", target: cta.target || "_self" });
      if (cta.target === "_blank") a.setAttribute("rel", "noopener noreferrer");
      a.textContent = cta.label || "";
      return a;
    }

var efcSearchIconSvg_i1 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';

var efcPlaceholder_p1 = { pc: "", mobile: "", bp: 1024 };
var efcPlaceholderObserver_p2 = null;
function efc_applySearchPlaceholder_p3() {
  var p = efcPlaceholder_p1;
  var text = (window.innerWidth <= p.bp && p.mobile) ? p.mobile : p.pc;
  if (!text) return;
  var inp = document.querySelector(".notion-quick-find-menu input");
  if (inp && inp.getAttribute("placeholder") !== text) inp.setAttribute("placeholder", text);
}
function efc_watchSearchPlaceholder_p4(cfg) {
  efcPlaceholder_p1.pc = cfg.searchPlaceholder || "";
  efcPlaceholder_p1.mobile = cfg.searchPlaceholderMobile || "";
  efcPlaceholder_p1.bp = cfg.mobileBreakpoint;
  if (efcPlaceholderObserver_p2 || !window.MutationObserver) return;
  if (!efcPlaceholder_p1.pc && !efcPlaceholder_p1.mobile) return;
  var pending = false;
  efcPlaceholderObserver_p2 = new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; efc_applySearchPlaceholder_p3(); });
  });
  efcPlaceholderObserver_p2.observe(document.body, { childList: true, subtree: true });
}


    function efc_triggerOopySearch_m4k(planMode) {
  var order = planMode === 'standard' ? ['.search-button', '.xi-search'] : ['.xi-search', '.search-button'];
  var btn = null;
  for (var i = 0; i < order.length && !btn; i++) btn = document.querySelector(order[i]);
  if (btn) btn.click();
  else alert('우피 검색 버튼을 찾지 못했습니다.\n우피 설정(app.oopy.io/styles)에서 검색 버튼 표시가 켜져 있는지 확인해 주세요.\n시도한 선택자: ' + order.join(', '));
}

    let globalScrollHandler_l2g = null; let globalResizeHandler_m3h = null;

    window.efc_rebuildNav_v2a = function(customConfig) {
      var cfg = mergeConfig_c2x(customConfig || window.efcMenubarConfig);
      
      function ensureFontAwesome_f1a(cfg) {
  var need = (cfg.menuItems || []).some(function (m) {
    return (m.children || []).some(function (c) { return c && c.icon && c.icon.type === "fa" && c.icon.value; });
  });
  if (!need) return;
  if (document.querySelector('link[data-efc-fa],link[href*="font-awesome"],link[href*="fontawesome"],script[src*="fontawesome"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet"; l.setAttribute("data-efc-fa", "1");
  l.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
    document.head.appendChild(l);
  }

  ensureFontAwesome_f1a(cfg);
efc_watchSearchPlaceholder_p4(cfg);
document.body.classList.toggle("efc_searchCustom_c1", !!cfg.searchPanelCustom);
document.body.classList.toggle("efc_searchRadius_c2", !!cfg.searchRadiusCustom);
document.body.classList.toggle("efc_searchResult_c3", !!cfg.searchResultCustom);
var srHideClass = { icon: "efc_srHideIcon_c4", location: "efc_srHideLocation_c5", desc: "efc_srHideDesc_c6", type: "efc_srHideType_c7", footer: "efc_srHideFooter_c8" };
Object.keys(srHideClass).forEach(function (k) { document.body.classList.toggle(srHideClass[k], !cfg.searchResultShow[k]); });

  var oldHeader = document.querySelector(".efc_header_h7k");
      if (oldHeader) {
          oldHeader.remove();
          if (globalScrollHandler_l2g) window.removeEventListener("scroll", globalScrollHandler_l2g);
          if (globalResizeHandler_m3h) window.removeEventListener("resize", globalResizeHandler_m3h);
      }

      var notionTopbar = document.querySelector('.notion-topbar');
if (notionTopbar) {
  if (cfg.hideNotionTopbar) { notionTopbar.style.position = 'absolute'; notionTopbar.style.top = '-9999px'; }
  else { notionTopbar.style.position = ''; notionTopbar.style.top = ''; }
  notionTopbar.style.opacity = '';
  notionTopbar.style.pointerEvents = '';
}

      var header = createEl_d3y("header", "efc_header_h7k");
      if (!cfg.useHeaderShadow) header.classList.add("no-shadow_n9x");
if (!cfg.arrowAnimation) header.classList.add("no-arrow-anim_a1n");
if (cfg.detailedWidthMode === "auto") header.classList.add("dd-auto_w1x");

      var inner = createEl_d3y("div", "headerInner_i2m");
      var row = createEl_d3y("div", "headerRow_r3n");

      var logoLink = createEl_d3y("a", "logoLink_l4p", { href: cfg.logo.link || "/", "aria-label": "홈으로 이동" });
      var logoPicture = createEl_d3y("picture", "logoPicture_p1c");
if (cfg.logo.mobileUrl) logoPicture.appendChild(createEl_d3y("source", "", { media: "(max-width: " + cfg.mobileBreakpoint + "px)", srcset: cfg.logo.mobileUrl }));
var logoImg = createEl_d3y("img", "logoImg_g5q", { src: cfg.logo.url || "", alt: cfg.logo.alt || "로고" });
logoImg.addEventListener("load", function () { applyActionsMinWidth_x1k(); });
logoPicture.appendChild(logoImg);
logoLink.appendChild(logoPicture);

      var nav = createEl_d3y("nav", "navDesktop_n6r", { "aria-label": "메인 메뉴" });
      cfg.menuItems.forEach(function (item) { nav.appendChild(buildDesktopNavItem_h7c(item, cfg)); });

      var actions = createEl_d3y("div", "headerActions_o1a");
      var mobileBarCta = createEl_d3y("div", "mobileBarCtaGroup_m1a");
      cfg.ctaButtons.forEach(function (cta) { if (cta.showOnMobileBar) mobileBarCta.appendChild(buildCtaBtn_k1f(cta, "mobileBarCtaBtn_n2b")); });
      var ctaGroup = createEl_d3y("div", "ctaGroup_m3i");
      cfg.ctaButtons.forEach(function (cta) { ctaGroup.appendChild(buildCtaBtn_k1f(cta, "ctaBtn_n4j")); });

      var searchDesktop = null;
      if (cfg.useSearch) {
        searchDesktop = createEl_d3y("button", "efc_desktopSearchBtn_s5l", { "aria-label": "검색 창 열기" });
        searchDesktop.innerHTML = efcSearchIconSvg_i1;
searchDesktop.addEventListener("click", function() { efc_triggerOopySearch_m4k(cfg.oopyPlan); });
}

var searchBar = null;
if (cfg.useSearch && cfg.showMobileSearchBar) {
  searchBar = createEl_d3y("button", "efc_mobileBarSearchBtn_s8m", { type: "button", "aria-label": "검색 창 열기" });
  searchBar.innerHTML = efcSearchIconSvg_i1;
  searchBar.addEventListener("click", function() { efc_triggerOopySearch_m4k(cfg.oopyPlan); });
}

      var toggle = createEl_d3y("button", "efc_toggleBtn_o5k", { type: "button", "aria-label": "모바일 메뉴 열기" });
      for (var i = 0; i < 3; i++) toggle.appendChild(createEl_d3y("span", "toggleBar_p6l"));

      if (searchBar && cfg.searchPosition === "left") actions.appendChild(searchBar);
      actions.appendChild(mobileBarCta); 
      if (cfg.useSearch && cfg.searchPosition === "left") { actions.appendChild(searchDesktop); actions.appendChild(ctaGroup); } 
      else if (cfg.useSearch && cfg.searchPosition === "right") { actions.appendChild(ctaGroup); actions.appendChild(searchDesktop); } 
      else { actions.appendChild(ctaGroup); }
      if (searchBar && cfg.searchPosition !== "left") actions.appendChild(searchBar);
actions.appendChild(toggle);

      row.appendChild(logoLink); row.appendChild(nav); row.appendChild(actions); inner.appendChild(row);

      var mobilePanel = createEl_d3y("nav", "mobilePanel_q7m", { "aria-label": "모바일 확장 메뉴" });
      if (!cfg.showMobileDesc) mobilePanel.classList.add("hide-desc_x9z");

      cfg.menuItems.forEach(function (item) { mobilePanel.appendChild(buildMobileGroup_j9e(item, cfg)); });
      
      var ctaMobileGroup = createEl_d3y("div", "mobileCtaWrap_w8k");
      if (cfg.mobileCtaLayout === 'horizontal') {
         ctaMobileGroup.style.display = 'grid'; ctaMobileGroup.style.gridTemplateColumns = 'repeat(' + (cfg.mobileCtaGridCols || 2) + ', 1fr)'; ctaMobileGroup.style.gap = '8px';
      } else { ctaMobileGroup.style.display = 'flex'; ctaMobileGroup.style.flexDirection = 'column'; ctaMobileGroup.style.gap = '6px'; }

      cfg.ctaButtons.forEach(function (cta) { ctaMobileGroup.appendChild(buildCtaBtn_k1f(cta, "mobileCtaBtn_b9x")); });
      
      var searchMobile = null;
      if (cfg.useSearch && cfg.showMobileSearchBtn) {
        searchMobile = createEl_d3y("button", "efc_mobileSearchBtn_k6m", { "aria-label": "검색 창 열기" });
        searchMobile.innerHTML = efcSearchIconSvg_i1 + " 검색";
        searchMobile.addEventListener("click", function() { efc_triggerOopySearch_m4k(cfg.oopyPlan); });
      }

      if (cfg.useSearch && cfg.showMobileSearchBtn && cfg.searchPosition === "left") { mobilePanel.appendChild(searchMobile); mobilePanel.appendChild(ctaMobileGroup); } 
      else if (cfg.useSearch && cfg.showMobileSearchBtn && cfg.searchPosition === "right") { mobilePanel.appendChild(ctaMobileGroup); mobilePanel.appendChild(searchMobile); } 
      else { mobilePanel.appendChild(ctaMobileGroup); }

      inner.appendChild(mobilePanel); header.appendChild(inner);

      toggle.addEventListener("click", function () { header.classList.toggle("is-open"); toggle.setAttribute("aria-expanded", header.classList.contains("is-open")); });

      function applyActionsMinWidth_x1k() {
  var isMobile = window.innerWidth <= cfg.mobileBreakpoint;
  if (isMobile) {
    actions.style.minWidth = "";
  } else {
    var lw = logoLink.offsetWidth;
    if (lw > 0) actions.style.minWidth = lw + "px";
  }
}

globalResizeHandler_m3h = function() {
  var isDeviceMobile = window.innerWidth <= cfg.mobileBreakpoint;
  var isHamburger = isDeviceMobile || cfg.desktopHamburger;
  document.body.classList.toggle("efc_mobileMode_b3m", isDeviceMobile);
  header.classList.toggle("efc_deviceMobile_d1v", isDeviceMobile);
  header.classList.toggle("efc_hamburgerPc_p1h", !!cfg.desktopHamburger && !isDeviceMobile);
  if (isHamburger) { header.classList.add("efc_mobileView_m8v"); } 
  else { header.classList.remove("efc_mobileView_m8v"); header.classList.remove("is-open"); }
  applyActionsMinWidth_x1k();
};
window.addEventListener("resize", globalResizeHandler_m3h); globalResizeHandler_m3h();

      document.addEventListener("click", function (e) { if (header.contains(e.target)) return; if (header.classList.contains("is-open")) { header.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); } header.querySelectorAll(".efc_navItem_v7s.is-open").forEach(function (item) { item.classList.remove("is-open"); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") { header.classList.remove("is-open"); header.querySelectorAll(".efc_navItem_v7s.is-open").forEach(function (item) { item.classList.remove("is-open"); }); } });

      if (cfg.scrollEffect) {
        var ticking = false;
        globalScrollHandler_l2g = function() {
          if (ticking) return; ticking = true;
          requestAnimationFrame(function () { header.classList.toggle("is-scrolled", window.scrollY > cfg.scrollThreshold); ticking = false; });
        };
        window.addEventListener("scroll", globalScrollHandler_l2g, { passive: true }); globalScrollHandler_l2g();
      }

      document.body.insertBefore(header, document.body.firstChild);
      if (cfg.offsetBody) document.body.classList.add("efc_headerOffset_c9y");

      requestAnimationFrame(applyActionsMinWidth_x1k);
    };

    if (document.readyState !== "loading") window.efc_rebuildNav_v2a();
    else document.addEventListener("DOMContentLoaded", function() { window.efc_rebuildNav_v2a(); });
  })(); 