  (function () {
    "use strict";

    function mergeConfig_c2x(userConfig) {
      var defaults = {
        mobileBreakpoint: 1024, useSearch: true, showMobileSearchBtn: true, searchPosition: "right", oopyPlan: "standard",
        hideNotionTopbar: true, useHeaderShadow: true, showMobileDesc: true, mobileCtaLayout: "vertical", mobileCtaGridCols: 2,
        logo: { url: "", alt: "로고", link: "/" }, showArrowDefault: true, defaultDropdownStyle: "simple",
        menuItems: [], ctaButtons: [], scrollEffect: false, scrollThreshold: 10, offsetBody: true
      };
      var cfg = Object.assign({}, defaults, userConfig || {});
      cfg.logo = Object.assign({}, defaults.logo, (userConfig && userConfig.logo) || {});
      if (!Array.isArray(cfg.menuItems)) cfg.menuItems = [];
      if (!Array.isArray(cfg.ctaButtons)) cfg.ctaButtons = [];
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
      if (hasChildren && showArrow) link.appendChild(createEl_d3y("i", "navArrowIcon_a2y fa-solid fa-chevron-down", { "aria-hidden": "true" }));
      wrap.appendChild(link);

      if (hasChildren) {
        var dropdown = (style === "detailed") ? buildDropdownDetailed_g6b(item.children) : buildDropdownSimple_f5a(item.children);
        wrap.appendChild(dropdown);
        var closeTimer = null;
        function open() { clearTimeout(closeTimer); wrap.classList.add("is-open"); }
        function scheduleClose() { closeTimer = setTimeout(function () { wrap.classList.remove("is-open"); }, 150); }
        wrap.addEventListener("mouseenter", open); wrap.addEventListener("mouseleave", scheduleClose);
        link.addEventListener("focus", open);
        link.addEventListener("click", function (e) {
          if (!item.url || item.url === "#") { e.preventDefault(); wrap.classList.toggle("is-open"); }
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

    function buildMobileGroup_j9e(item) {
      var hasChildren = Array.isArray(item.children) && item.children.length > 0;
      var group = createEl_d3y("div", "efc_mobileGroup_r8n");
      var row = createEl_d3y("div", "mobileItemRow_s9o");

      var link = createEl_d3y("a", hasChildren ? "efc_mobileTrigger_u2q" : "mobileLink_t1p", { href: item.url || "#", target: item.target || "_self" });
      if(item.target === "_blank") link.setAttribute("rel", "noopener noreferrer");
      link.textContent = item.label || "";
      row.appendChild(link);

      if (hasChildren) {
        var caret = createEl_d3y("button", "efc_mobileCaret_v3r", { type: "button", "aria-label": "하위메뉴 토글" });
        caret.innerHTML = '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
        caret.addEventListener("click", function () { group.classList.toggle("is-expanded"); });
        row.appendChild(caret);
        link.addEventListener("click", function (e) {
          if (!item.url || item.url === "#") { e.preventDefault(); group.classList.toggle("is-expanded"); }
        });
      }
      group.appendChild(row);

      if (hasChildren) {
        var submenu = createEl_d3y("div", "mobileSubmenuPanel_w4s");
        item.children.forEach(function (child) { submenu.appendChild(buildMobileSubItem_i8d(child)); });
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

    function efc_triggerOopySearch_m4k(planMode) {
      var selector = planMode === 'pro' ? '.xi-search' : '.search-button';
      var targetSearchBtn = document.querySelector(selector);
      if (targetSearchBtn) targetSearchBtn.click();
      else alert('우피 설정에서 검색 기능을 켜주십시오.');
    }

    let globalScrollHandler_l2g = null; let globalResizeHandler_m3h = null;

    window.efc_rebuildNav_v2a = function(customConfig) {
      var cfg = mergeConfig_c2x(customConfig || window.hwahaeNavConfig_v1);
      
      var oldHeader = document.querySelector(".efc_header_h7k");
      if (oldHeader) {
          oldHeader.remove();
          if (globalScrollHandler_l2g) window.removeEventListener("scroll", globalScrollHandler_l2g);
          if (globalResizeHandler_m3h) window.removeEventListener("resize", globalResizeHandler_m3h);
      }

      if (cfg.hideNotionTopbar) {
        var notionTopbar = document.querySelector('.notion-topbar');
        if (notionTopbar) { notionTopbar.style.opacity = '0'; notionTopbar.style.pointerEvents = 'none'; notionTopbar.style.position = 'absolute'; notionTopbar.style.top = '-9999px'; }
      }

      var header = createEl_d3y("header", "efc_header_h7k");
      if (!cfg.useHeaderShadow) header.classList.add("no-shadow_n9x");

      var inner = createEl_d3y("div", "headerInner_i2m");
      var row = createEl_d3y("div", "headerRow_r3n");

      var logoLink = createEl_d3y("a", "logoLink_l4p", { href: cfg.logo.link || "/", "aria-label": "홈으로 이동" });
      logoLink.appendChild(createEl_d3y("img", "logoImg_g5q", { src: cfg.logo.url || "", alt: cfg.logo.alt || "로고" }));

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
        searchDesktop.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
        searchDesktop.addEventListener("click", function() { efc_triggerOopySearch_m4k(cfg.oopyPlan); });
      }

      var toggle = createEl_d3y("button", "efc_toggleBtn_o5k", { type: "button", "aria-label": "모바일 메뉴 열기" });
      for (var i = 0; i < 3; i++) toggle.appendChild(createEl_d3y("span", "toggleBar_p6l"));

      actions.appendChild(mobileBarCta); 
      if (cfg.useSearch && cfg.searchPosition === "left") { actions.appendChild(searchDesktop); actions.appendChild(ctaGroup); } 
      else if (cfg.useSearch && cfg.searchPosition === "right") { actions.appendChild(ctaGroup); actions.appendChild(searchDesktop); } 
      else { actions.appendChild(ctaGroup); }
      actions.appendChild(toggle);

      row.appendChild(logoLink); row.appendChild(nav); row.appendChild(actions); inner.appendChild(row);

      var mobilePanel = createEl_d3y("nav", "mobilePanel_q7m", { "aria-label": "모바일 확장 메뉴" });
      if (!cfg.showMobileDesc) mobilePanel.classList.add("hide-desc_x9z");

      cfg.menuItems.forEach(function (item) { mobilePanel.appendChild(buildMobileGroup_j9e(item)); });
      
      var ctaMobileGroup = createEl_d3y("div", "mobileCtaWrap_w8k");
      if (cfg.mobileCtaLayout === 'horizontal') {
         ctaMobileGroup.style.display = 'grid'; ctaMobileGroup.style.gridTemplateColumns = 'repeat(' + (cfg.mobileCtaGridCols || 2) + ', 1fr)'; ctaMobileGroup.style.gap = '8px';
      } else { ctaMobileGroup.style.display = 'flex'; ctaMobileGroup.style.flexDirection = 'column'; ctaMobileGroup.style.gap = '6px'; }

      cfg.ctaButtons.forEach(function (cta) { ctaMobileGroup.appendChild(buildCtaBtn_k1f(cta, "mobileCtaBtn_b9x")); });
      
      var searchMobile = null;
      if (cfg.useSearch && cfg.showMobileSearchBtn) {
        searchMobile = createEl_d3y("button", "efc_mobileSearchBtn_k6m", { "aria-label": "검색 창 열기" });
        searchMobile.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> 검색';
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
  if (window.innerWidth <= cfg.mobileBreakpoint) { header.classList.add("efc_mobileView_m8v"); } 
  else { header.classList.remove("efc_mobileView_m8v"); header.classList.remove("is-open"); }
  applyActionsMinWidth_x1k();
};
window.addEventListener("resize", globalResizeHandler_m3h); globalResizeHandler_m3h();

      document.addEventListener("click", function (e) { if (header.contains(e.target)) return; header.querySelectorAll(".efc_navItem_v7s.is-open").forEach(function (item) { item.classList.remove("is-open"); }); });
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
  