/**
 * ======================================================================
 * [Notion Overlay Gallery Master - JS Core Engine]
 * 작성일: 2026-07-21
 * 기능: 키워드 타겟팅 스캔, CSS 속성 동기화, UI 트리거 숨김 처리
 * ======================================================================
 */

/*
   에픽션 노션 갤러리 제어 엔진 코어 스크립트
   파일명: epiction-gallery-engine.js
*/

/* 
  ========================================================================
  [자바스크립트 코어 엔진] DOM 파싱 및 렌더링 동기화 모듈
  ========================================================================
*/
(function() {
  'use strict';
  
  // 중복 실행 방지 플래그
  if (window.GA_OVERLAY_ENGINE_RUNNING) return;
  window.GA_OVERLAY_ENGINE_RUNNING = true;

  // 동적 조작을 위해 부여하는 캡슐화 클래스 목록
  const DYN_CLASSES = [
    'ga_selFam_r8j', 'ga_urlFam_d4q', 'ga_visLast_p8d',
    'ga_oppTag_l2x', 'ga_inlineRow_b5f', 'ga_lblTop_w4n',
    'ga_lblHide_s8c', 'ga_relRow_x2v', 'ga_hideTab_v9m', 'ga_hideMob_z3l',
    'ga_lblHidePc_q1r', 'ga_lblHideTab_m5k', 'ga_lblHideMob_t7j',
    'ga_chipSel_j3k', 'ga_chipRel_t9p', 'ga_chipBest_h6w', 'ga_chipUrl_f5d',
    'ga_avatar_y2b', 'ga_isTop_t1p', 'ga_isDown_d2n'
  ];

  // 문자열 토큰 파싱 유틸리티 함수
  const parseTokens = str => (str || "").split(/\s+/).filter(Boolean);
  const parseNumSet = str => new Set(parseTokens(str).filter(v => /^\d+$/.test(v)).map(v => parseInt(v, 10)));
  const hexToRgb = hex => {
    let c = hex.replace('#', '');
    if(c.length === 3) c = c.split('').map(x=>x+x).join('');
    const num = parseInt(c, 16);
    return isNaN(num) ? '0,0,0' : `${num >> 16}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  // 모의 폼 제출 및 콘솔 출력 로직 구축 (efc_ prefix)
  window.efc_mockSubmit_j8p = function(formData) {
    if (!formData) { console.warn("입력 데이터가 비어 있습니다."); return; }
    console.log("[모의 제출 성공] 서버 전송 생략, 폼 데이터:", formData);
  };

  // 스크롤 감지 페이드인 옵저버
  const efc_observer_b3x = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) { entry.target.classList.add('efc_visible_m4q'); }
    });
  }, { threshold: 0.1 });

  // 노션의 특정 블록 구조 감지 헬퍼 함수
  const hasRelation = el => !!el.querySelector('[class*="GalleryRelationProperty"]');
  const hasUrl = el => !!el.querySelector('a[href]');
  const hasPerson = el => !!el.querySelector('img'); 
  const hasChip = el => !!el.querySelector('.css-1hj95xj, div[role="button"]');
  const isBestTag = (el, bestName) => {
    const text = el.innerText.toUpperCase();
    return text.includes('BEST') || (bestName && text.includes(bestName.toUpperCase()));
  };

  // 기존 렌더링 상태 완전 초기화
  const clearDynamicState = el => {
    if (!el) return;
    DYN_CLASSES.forEach(cls => el.classList.remove(cls));
    el.className = el.className.replace(/ga_p_idx_\d+_y5t/g, '').trim();
    const labels = el.querySelectorAll('.ga_propName_m7a');
    if (labels.length > 1) { for (let i = 1; i < labels.length; i++) labels[i].remove(); }
  };

  // 노션 데이터 배열 구조와 사용자 설정 속성을 매핑하는 앵커 할당 로직
  function mapPropertiesWithAnchors(children, propNames) {
    let urlIdx = 0, personIdx = 0, relationIdx = 0, bestIdx = 0, cleanBestName = "";
    propNames.forEach((n, idx) => {
      const upper = n.toUpperCase();
      if (upper.includes('[URL]') || upper === 'URL' || upper.includes('링크')) urlIdx = idx + 1;
      else if (upper.includes('[IMG]') || upper.includes('생성자') || upper.includes('작성자')) personIdx = idx + 1;
      else if (upper.includes('[REL]') || upper.includes('관계된')) relationIdx = idx + 1;
      else if (upper.includes('[BEST]') || upper.includes('BEST 20') || upper === 'BEST') { bestIdx = idx + 1; cleanBestName = n.replace(/\[BEST\]/gi, '').trim(); }
    });

    let assigned = new Array(children.length).fill(0);
    let availableIndices = propNames.map((_, i) => i + 1);

    [urlIdx, personIdx, relationIdx, bestIdx].forEach(idx => { if (idx > 0) availableIndices = availableIndices.filter(i => i !== idx); });
    children.forEach((el, i) => {
      if (urlIdx > 0 && hasUrl(el)) assigned[i] = urlIdx;
      else if (personIdx > 0 && hasPerson(el)) assigned[i] = personIdx;
      else if (relationIdx > 0 && hasRelation(el)) assigned[i] = relationIdx;
      else if (bestIdx > 0 && isBestTag(el, cleanBestName)) assigned[i] = bestIdx;
    });
    children.forEach((el, i) => { if (assigned[i] === 0) assigned[i] = availableIndices.shift() || 0; });

    return children.map((el, domIdx) => ({ el, domIdx, propNum: assigned[domIdx], hasRelation: hasRelation(el), hasUrl: hasUrl(el), hasChip: hasChip(el) }));
  }

  // DOM 렌더링 최적화를 위한 상태 해시값(Hash) 생성 로직
  let lastStateHash = "";
  function getGalleryStateHash(rs) {
    const w = window.innerWidth;
    const items = document.querySelectorAll('.notion-collection-item');
    let textLen = 0; items.forEach(i => textLen += i.innerText.length);
    const cssVars = [ "--ga-text-width-scope", "--ga-chip-radius", "--ga-chip-height", "--ga-chip-pad-x", "--ga-chip-pad-y", "--ga-use-prop-all", "--ga-prop-all-size", "--ga-prop-all-weight", "--ga-prop-all-display", "--ga-prop-all-color-mode", "--ga-prop-all-custom-bg", "--ga-prop-all-custom-bg-op", "--ga-prop-all-color", "--ga-ratio", "--ga-cols-pc", "--ga-cols-tab", "--ga-cols-mob", "--ga-grid-gap", "--ga-card-radius", "--ga-card-padding", "--ga-dim-hex", "--ga-dim-opacity", "--ga-text-width-pc", "--ga-text-width-tab", "--ga-text-width-mob", "--ga-h-align", "--ga-t-align", "--ga-item-gap", "--ga-group-gap", "--ga-section-gap", "--ga-line-height", "--ga-absolute-position", "--ga-section-top", "--ga-section-center", "--ga-section-bottom", "--ga-show-label", "--ga-lbl-size", "--ga-lbl-weight", "--ga-lbl-color", "--ga-lbl-space", "--ga-label-top-props", "--ga-label-hide-pc", "--ga-label-hide-tab", "--ga-label-hide-mob", "--ga-hide-props-tab", "--ga-hide-props-mob", "--ga-use-title", "--ga-title-size", "--ga-title-weight", "--ga-title-color", "--ga-prop-profile-img", "--ga-url-format", "--ga-url-cut-length", "--ga-url-color-mode", "--ga-url-custom-bg", "--ga-url-custom-bg-op", "--ga-url-color", "--ga-url-underline", "--ga-relation-color-mode", "--ga-relation-custom-bg", "--ga-relation-custom-bg-op", "--ga-relation-icon", "--ga-relation-full-text", "--ga-next-tag-num", "--ga-best-bg", "--ga-best-bg-op", "--ga-best-color", "--ga-best-size", "--ga-best-weight", "--ga-best-use-global-shape", "--ga-best-height", "--ga-best-pad-x", "--ga-best-pad-y", "--ga-best-radius", "--ga-lbl-align", "--ga-val-align" ].map(v => rs.getPropertyValue(v).trim()).join('|');
    return `${w}-${items.length}-${textLen}-${cssVars}`;
  }

  // 메인 동기화 렌더링 엔진 호출
  function syncEngine() {
    const htmlRoot = document.documentElement;
    if (!htmlRoot) return;
    const rs = getComputedStyle(htmlRoot);
    const propNames = Array.isArray(window.GA_PROP_NAMES) ? window.GA_PROP_NAMES : [];
    if (propNames.length === 0 || !window.GA_GALLERY_TARGETS) return;

    const currentHash = getGalleryStateHash(rs);
    if (currentHash === lastStateHash) return; 

    // HTML 루트 객체에 data 속성 주입 (CSS 통신 구간)
    ["title", "prop-all"].forEach(k => { htmlRoot.setAttribute(`data-ga-use-${k}`, rs.getPropertyValue(`--ga-use-${k}`).trim() || "0"); });
    htmlRoot.setAttribute("data-ga-width-scope", rs.getPropertyValue("--ga-text-width-scope").trim() || "1");
    htmlRoot.setAttribute("data-ga-top", rs.getPropertyValue("--ga-section-top").trim());
    htmlRoot.setAttribute("data-ga-center", rs.getPropertyValue("--ga-section-center").trim());
    htmlRoot.setAttribute("data-ga-bottom", rs.getPropertyValue("--ga-section-bottom").trim());
    htmlRoot.setAttribute("data-ga-next", rs.getPropertyValue("--ga-next-tag-num").trim() || "0");
    htmlRoot.setAttribute("data-ga-color-mode", rs.getPropertyValue("--ga-prop-all-color-mode").trim() || "0");
    htmlRoot.setAttribute("data-ga-display", rs.getPropertyValue("--ga-prop-all-display").trim() || "inline-flex");
    htmlRoot.setAttribute("data-ga-absolute", rs.getPropertyValue("--ga-absolute-position").trim() || "1");
    htmlRoot.setAttribute("data-ga-h-align", rs.getPropertyValue("--ga-h-align").trim() || "flex-start");
    htmlRoot.setAttribute("data-ga-lbl-align", rs.getPropertyValue("--ga-lbl-align").trim() || "left");
    htmlRoot.setAttribute("data-ga-val-align", rs.getPropertyValue("--ga-val-align").trim() || "left");
    htmlRoot.setAttribute("data-ga-show-label", rs.getPropertyValue("--ga-show-label").trim() || "1");
    htmlRoot.setAttribute("data-ga-profile-img", rs.getPropertyValue("--ga-prop-profile-img").trim() || "block");
    htmlRoot.setAttribute("data-ga-relation-mode", rs.getPropertyValue("--ga-relation-color-mode").trim() || "0");
    htmlRoot.setAttribute("data-ga-relation-icon", rs.getPropertyValue("--ga-relation-icon").trim() || "block");
    htmlRoot.setAttribute("data-ga-relation-wrap", rs.getPropertyValue("--ga-relation-full-text").trim() || "1");
    htmlRoot.setAttribute("data-ga-url-mode", rs.getPropertyValue("--ga-url-color-mode").trim() || "0");
    htmlRoot.setAttribute("data-ga-url-format", rs.getPropertyValue("--ga-url-format").trim() || "0");
    htmlRoot.setAttribute("data-ga-url-cut", rs.getPropertyValue("--ga-url-cut-length").trim() || "10");
    htmlRoot.setAttribute("data-ga-best-shape", rs.getPropertyValue("--ga-best-use-global-shape").trim() || "1");

    const dimHexRaw = rs.getPropertyValue("--ga-dim-hex").trim() || "#000000";
    const dimOpacity = rs.getPropertyValue('--ga-dim-opacity').trim() || "0.2";
    const dimRgb = hexToRgb(dimHexRaw);

    // 사용자가 입력한 갤러리 탭/타이틀을 기반으로 타겟 추적
    document.querySelectorAll('.notion-collection_view-block:not(.ga-configured)').forEach(block => {
      const titleEl = block.querySelector('.css-11vqqno span') || block.querySelector('.css-fox54z span');
      const tabEls = block.querySelectorAll('.css-ymcnjv');
      if (!titleEl && tabEls.length === 0) return;
      const titleText = titleEl ? titleEl.textContent : "";
      const tabText = Array.from(tabEls).map(el => el.textContent.trim()).join(" ");
      let matched = false, targetCfg = null;
      for (let t of window.GA_GALLERY_TARGETS) {
        if (tabText.includes(t.keyword) || titleText.includes(t.keyword)) { matched = true; targetCfg = t; break; }
      }
      block.classList.add('ga-configured');
      if (matched) {
        block.classList.add('ga_overlay_u4b');
        if (targetCfg.hideTitle && block.querySelector('.css-1gp0upd')) block.querySelector('.css-1gp0upd').style.setProperty('display', 'none', 'important');
        if (targetCfg.hideTabs && block.querySelector('.css-1u47eky')) block.querySelector('.css-1u47eky').style.setProperty('display', 'none', 'important');
      }
    });

    const topSeq = parseTokens(rs.getPropertyValue("--ga-section-top").trim());
    const centerSeq = parseTokens(rs.getPropertyValue("--ga-section-center").trim());
    const bottomSeq = parseTokens(rs.getPropertyValue("--ga-section-bottom").trim());
    const labelTopSet = parseNumSet(rs.getPropertyValue("--ga-label-top-props").trim());
    const hideTabSet = parseNumSet(rs.getPropertyValue("--ga-hide-props-tab").trim());
    const hideMobSet = parseNumSet(rs.getPropertyValue("--ga-hide-props-mob").trim());
    const labelHidePcSet = parseNumSet(rs.getPropertyValue("--ga-label-hide-pc").trim());
    const labelHideTabSet = parseNumSet(rs.getPropertyValue("--ga-label-hide-tab").trim());
    const labelHideMobSet = parseNumSet(rs.getPropertyValue("--ga-label-hide-mob").trim());
    
    const nextTagNum = rs.getPropertyValue("--ga-next-tag-num").trim() || "0";
    const allUsedItems = [...topSeq, ...centerSeq, ...bottomSeq];
    if (nextTagNum !== "0" && !allUsedItems.includes(nextTagNum)) allUsedItems.push(nextTagNum);
    if (allUsedItems.length === 0) return;

    const items = document.querySelectorAll('.ga_overlay_u4b .notion-collection-item');
    const itemDataList = [];

    // 개별 갤러리 아이템 순회 및 렌더링
    items.forEach(item => {
      try {
        const container = item.querySelector('.css-1yjhumr');
        if (!container) return;
        const coreCard = container.parentElement;
        if (coreCard && !coreCard.classList.contains('ga_cardCore_k3z')) {
           coreCard.classList.add('ga_cardCore_k3z');
           efc_observer_b3x.observe(coreCard); 
        }

        let spTopCenter = container.querySelector('.ga_spacerTop_p9m');
        if (!spTopCenter) { spTopCenter = document.createElement('div'); spTopCenter.className = 'ga_spacerTop_p9m ga_structural_spacer'; container.appendChild(spTopCenter); }
        let spCenterBottom = container.querySelector('.ga_spacerBottom_c2w');
        if (!spCenterBottom) { spCenterBottom = document.createElement('div'); spCenterBottom.className = 'ga_spacerBottom_c2w ga_structural_spacer'; container.appendChild(spCenterBottom); }

        const bgImgEl = item.querySelector('img');
        if (bgImgEl && coreCard) {
          const updateBg = () => {
            const imgUrl = bgImgEl.currentSrc || bgImgEl.src;
            if (imgUrl && imgUrl.indexOf('data:') !== 0) {
              const bgStyle = `linear-gradient(rgba(${dimRgb},${dimOpacity}), rgba(${dimRgb},${dimOpacity})), url("${imgUrl}")`;
              if (coreCard.style.backgroundImage !== bgStyle) {
                coreCard.style.backgroundImage = bgStyle;
                coreCard.style.backgroundSize = 'cover';
                coreCard.style.backgroundPosition = 'center';
              }
            }
          };
          updateBg();
          if (!bgImgEl.dataset.gaBound) { bgImgEl.dataset.gaBound = "true"; bgImgEl.addEventListener('load', () => { updateBg(); triggerSync(); }); }
        }

        const titleBox = coreCard.querySelector('.css-0');
        let titleOrder = 220;
        if (titleBox) {
          clearDynamicState(titleBox);
          if (!allUsedItems.includes('title')) titleBox.style.setProperty('display', 'none', 'important');
          else {
            titleBox.style.removeProperty('display');
            if (topSeq.includes('title')) titleOrder = 100 + topSeq.indexOf('title');
            else if (centerSeq.includes('title')) titleOrder = 200 + centerSeq.indexOf('title');
            else if (bottomSeq.includes('title')) titleOrder = 300 + bottomSeq.indexOf('title');
            titleBox.style.setProperty('order', titleOrder, 'important');
          }
        }

        const rawChildren = Array.from(container.children).filter(c => !c.classList.contains('ga_structural_spacer'));
        rawChildren.forEach(clearDynamicState);
        const mappedMetas = mapPropertiesWithAnchors(rawChildren, propNames);

        let topEls = [], centerEls = [], bottomEls = [];
        let highestOrder = -1, visualLastChild = null;

        mappedMetas.forEach(meta => {
          const child = meta.el;
          const propNum = String(meta.propNum);
          if (meta.propNum === 0 || !allUsedItems.includes(propNum)) { child.style.setProperty('display', 'none', 'important'); return; }

          child.style.removeProperty('display');
          child.classList.add(`ga_p_idx_${propNum}_y5t`, 'ga_inlineRow_b5f');

          if (meta.hasRelation) child.classList.add('ga_relRow_x2v');
          else if (meta.hasUrl) child.classList.add('ga_urlFam_d4q');
          else if (meta.hasChip) child.classList.add('ga_selFam_r8j');

          let leaves = child.classList.contains('ga_relRow_x2v') 
            ? Array.from(child.querySelectorAll('[class*="GalleryRelationProperty_container"] > div'))
            : Array.from(child.querySelectorAll('div[role="button"]'));

          leaves.forEach(leaf => {
            leaf.classList.add('ga_chipLeaf_n1e');
            leaf.classList.remove('ga_chipSel_j3k', 'ga_chipRel_t9p', 'ga_chipBest_h6w', 'ga_chipUrl_f5d');
            if (propNum === nextTagNum) leaf.classList.add('ga_chipBest_h6w');
            else if (child.classList.contains('ga_relRow_x2v')) leaf.classList.add('ga_chipRel_t9p');
            else if (child.classList.contains('ga_urlFam_d4q')) leaf.classList.add('ga_chipUrl_f5d');
            else leaf.classList.add('ga_chipSel_j3k');
          });

          const avatarImg = child.querySelector('img');
          if (avatarImg) {
            let targetWrap = avatarImg.parentElement;
            while (targetWrap && targetWrap !== child && targetWrap.textContent.trim() === '') {
              targetWrap.classList.add('ga_avatar_y2b');
              targetWrap = targetWrap.parentElement;
            }
          }

          if (labelTopSet.has(meta.propNum)) child.classList.add('ga_lblTop_w4n');

          const rawPropName = propNames[meta.propNum - 1] || "";
          const cleanPropName = rawPropName.replace(/\[(URL|IMG|REL|BEST)\]/gi, '').trim();
          
          let currentLabel = child.querySelector('.ga_propName_m7a');
          if (cleanPropName) {
            if (!currentLabel) {
              currentLabel = document.createElement('span');
              currentLabel.className = 'ga_propName_m7a';
              child.insertBefore(currentLabel, child.firstChild);
            }
            currentLabel.innerText = cleanPropName;
          } else if (currentLabel) currentLabel.remove();

          const isGlobalHideLabel = (htmlRoot.getAttribute("data-ga-show-label") || "1") === "0";
          if (isGlobalHideLabel) child.classList.add('ga_lblHide_s8c');
          else {
            if (labelHidePcSet.has(meta.propNum)) child.classList.add('ga_lblHidePc_q1r');
            if (labelHideTabSet.has(meta.propNum)) child.classList.add('ga_lblHideTab_m5k');
            if (labelHideMobSet.has(meta.propNum)) child.classList.add('ga_lblHideMob_t7j');
          }

          if (hideTabSet.has(meta.propNum)) child.classList.add('ga_hideTab_v9m');
          if (hideMobSet.has(meta.propNum)) child.classList.add('ga_hideMob_z3l');
          if (propNum === nextTagNum) child.classList.add('ga_oppTag_l2x');

          const urlEl = child.querySelector('a[href]');
          if (urlEl) {
            const textSpan = urlEl.querySelector('span span') || urlEl.querySelector('span');
            if (textSpan) {
              if (!textSpan.hasAttribute('data-orig-text')) textSpan.setAttribute('data-orig-text', textSpan.innerText.trim());
              const fmt = htmlRoot.getAttribute("data-ga-url-format") || "0";
              const fullUrl = urlEl.getAttribute('href') || "";
              if (fmt === "1") textSpan.innerText = fullUrl;
              else if (fmt === "2") {
                const cutLen = parseInt(htmlRoot.getAttribute("data-ga-url-cut") || "10", 10);
                try {
                  const urlObj = new URL(fullUrl);
                  const path = urlObj.pathname + urlObj.search;
                  textSpan.innerText = urlObj.hostname + (path.length > 1 ? path.substring(0, cutLen) : "");
                } catch(e) { textSpan.innerText = fullUrl.substring(0, 30); }
              } else textSpan.innerText = textSpan.getAttribute('data-orig-text');
            }
          }

          let finalOrder = 350;
          if (topSeq.includes(propNum)) finalOrder = 100 + topSeq.indexOf(propNum);
          else if (centerSeq.includes(propNum)) finalOrder = 200 + centerSeq.indexOf(propNum);
          else if (bottomSeq.includes(propNum)) finalOrder = 300 + bottomSeq.indexOf(propNum);
          child.style.setProperty('order', finalOrder, 'important');

          // 너비 분할을 위한 상단/중하단 클래스 동적 주입
          if (!child.classList.contains('ga_oppTag_l2x')) {
            if (finalOrder > highestOrder) { highestOrder = finalOrder; visualLastChild = child; }
            if (finalOrder >= 100 && finalOrder < 199) {
                topEls.push(child);
                child.classList.add('ga_isTop_t1p');
                child.classList.remove('ga_isDown_d2n');
            } else if (finalOrder >= 200) {
                if (finalOrder < 299) centerEls.push(child); else bottomEls.push(child);
                child.classList.add('ga_isDown_d2n');
                child.classList.remove('ga_isTop_t1p');
            }
          }
        });

        if (titleBox && titleBox.style.display !== 'none') {
          if (titleOrder >= 100 && titleOrder < 199) { titleBox.classList.add('ga_isTop_t1p'); titleBox.classList.remove('ga_isDown_d2n'); topEls.push(titleBox); }
          else if (titleOrder >= 200) { 
              titleBox.classList.add('ga_isDown_d2n'); titleBox.classList.remove('ga_isTop_t1p');
              if(titleOrder < 299) centerEls.push(titleBox); else bottomEls.push(titleBox); 
          }
          if (titleOrder > highestOrder) { highestOrder = titleOrder; visualLastChild = titleBox; }
        }

        coreCard.querySelectorAll('.ga_visLast_p8d').forEach(el => el.classList.remove('ga_visLast_p8d'));
        if (visualLastChild) visualLastChild.classList.add('ga_visLast_p8d');

        itemDataList.push({ coreCard, spTopCenter, spCenterBottom, topEls, centerEls, bottomEls });
      } catch (e) { console.error("Card process error:", e); }
    });

    const isAbsolute = rs.getPropertyValue("--ga-absolute-position").trim() === "1";
    const itemGapPx = parseInt(rs.getPropertyValue('--ga-item-gap') || '8', 10);
    const padding = (parseInt(rs.getPropertyValue('--ga-card-padding') || '14', 10)) * 2;
    const secGap = rs.getPropertyValue('--ga-section-gap') || '24px';

    const getSectionHeight = (els) => {
      if (els.length === 0) return 0;
      let minTop = Infinity, maxBottom = -Infinity;
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0) {
          if (rect.top < minTop) minTop = rect.top;
          if (rect.bottom > maxBottom) maxBottom = rect.bottom;
        }
      });
      return (maxBottom > minTop) ? (maxBottom - minTop) : 0;
    };

    itemDataList.forEach(data => {
      if (isAbsolute) {
        let topH = getSectionHeight(data.topEls);
        let centerH = getSectionHeight(data.centerEls);
        let bottomH = getSectionHeight(data.bottomEls);
        if (topH > 0) topH += itemGapPx;
        if (centerH > 0) centerH += itemGapPx;
        const cardH = data.coreCard.clientHeight || 0;
        data.remainingSpace = cardH - (topH + centerH + bottomH) - padding;
      }
    });

    itemDataList.forEach(data => {
      if (isAbsolute) {
        if (data.remainingSpace > 0) {
          if (centerSeq.length === 0 && !centerSeq.includes('title')) {
            data.spTopCenter.style.setProperty('height', '0px', 'important');
            data.spCenterBottom.style.setProperty('height', `${data.remainingSpace}px`, 'important');
          } else {
            const halfSpace = data.remainingSpace / 2;
            data.spTopCenter.style.setProperty('height', `${halfSpace}px`, 'important');
            data.spCenterBottom.style.setProperty('height', `${halfSpace}px`, 'important');
          }
        } else {
          data.spTopCenter.style.setProperty('height', '0px', 'important');
          data.spCenterBottom.style.setProperty('height', '0px', 'important');
        }
      } else {
        data.spTopCenter.style.setProperty('height', secGap, 'important');
        data.spCenterBottom.style.setProperty('height', secGap, 'important');
      }
    });

    lastStateHash = currentHash;
  }

  // 렌더링 과부하 및 무한 루프 방지 로직 (requestAnimationFrame 활용)
  let isUpdating = false;
  let syncTimeout = null;
  const triggerSync = () => {
    if (isUpdating) return;
    isUpdating = true;
    requestAnimationFrame(() => {
      syncEngine();
      setTimeout(() => { isUpdating = false; }, 30);
    });
  };

  // 노션의 DOM 변화를 감지하여 엔진 재호출
  const observer = new MutationObserver((mutations) => {
    const hasRelevantChanges = mutations.some(m => 
      !m.target.classList?.contains('ga_structural_spacer') &&
      !m.target.classList?.contains('ga_propName_m7a')
    );
    if (hasRelevantChanges) {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(triggerSync, 20);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  
  // 브라우저 크기 변경 감지
  const resizeObserver = new ResizeObserver(() => triggerSync());
  resizeObserver.observe(document.body);
  
  // 강제 동기화 보험
  setInterval(triggerSync, 800);

})();