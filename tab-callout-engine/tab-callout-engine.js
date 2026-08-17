
  window.efc_clickLock_m9q = false;
  const efc_parsedCalloutList_p7z = {};

  function efc_normalizeString_c4f(rawString) {
    return rawString ? rawString.trim() : "";
  }

  function efc_removeRegexText_r2b(targetDomElement, regexPattern) {
    const textWalker = document.createTreeWalker(targetDomElement, NodeFilter.SHOW_TEXT, null, false);
    let currentNode;
    while (currentNode = textWalker.nextNode()) {
      if (regexPattern.test(currentNode.nodeValue)) {
        currentNode.nodeValue = currentNode.nodeValue.replace(regexPattern, '');
      }
    }
  }

  window.efc_updateTabLimits_w1v = function() {
    const rootStyles = getComputedStyle(document.documentElement);
    const isLimitEnabled = rootStyles.getPropertyValue('--textLimitToggle_b4v').trim() === 'true';
    const maxLength = parseInt(rootStyles.getPropertyValue('--textLimitLength_c5x').trim()) || 10;

    const allTabItems = document.querySelectorAll('.efc_tabItem_h2c');
    allTabItems.forEach(function(tabNode) {
      const textSpan = tabNode.querySelector('.css-152tfkv');
      if (!textSpan) return;
      const originalText = tabNode.getAttribute('data-orig-txt_j8k');
      if (!originalText) return;

      if (isLimitEnabled && originalText.length > maxLength) {
        textSpan.innerText = originalText.substring(0, maxLength) + '...';
      } else {
        textSpan.innerText = originalText;
      }
    });
  };

  function efc_handleTabSwitch_v8k(selectedTab, allTabsList, animWrapper) {
    allTabsList.forEach(function(tabNode) {
      tabNode.classList.remove('efc_activeTab_p9k');
      tabNode.setAttribute('aria-selected', 'false');
    });
    
    selectedTab.classList.add('efc_activeTab_p9k');
    selectedTab.setAttribute('aria-selected', 'true');

    const rawTabLabel = selectedTab.getAttribute('data-orig-txt_j8k');
    const normalizedTabLabel = efc_normalizeString_c4f(rawTabLabel);

    const currentTextNodes = animWrapper.querySelectorAll('.efc_textFade_z9m');
    currentTextNodes.forEach(node => node.classList.remove('efc_textActive_v2x'));

    const calloutDom = efc_parsedCalloutList_p7z[normalizedTabLabel];

    if (!calloutDom) {
      animWrapper.style.maxHeight = '0px';
      setTimeout(function() {
         animWrapper.innerHTML = '';
      }, 400); 
    } else {
      animWrapper.innerHTML = '';
      const clonedCallout = calloutDom.cloneNode(true);
      clonedCallout.classList.add('efc_activeCallout_m5y');
      
      const contentBox = clonedCallout.querySelector('.CalloutBlock-module__b-lIEa__content') || clonedCallout;
      contentBox.classList.add('efc_textFade_z9m');
      
      animWrapper.appendChild(clonedCallout);

      requestAnimationFrame(function() {
  const rootStyles = getComputedStyle(document.documentElement);
  const marginTop = parseFloat(rootStyles.getPropertyValue('--calloutMarginTop_v5x')) || 0;
  const marginBottom = parseFloat(rootStyles.getPropertyValue('--calloutMarginBottom_w6y')) || 0;
  const requiredHeight = clonedCallout.scrollHeight + marginTop + marginBottom;
  animWrapper.style.maxHeight = requiredHeight + 'px';
        
        setTimeout(function() {
          const insertedText = animWrapper.querySelector('.efc_textFade_z9m');
          if (insertedText) insertedText.classList.add('efc_textActive_v2x');
        }, 50);
      });
    }
  }

  function efc_createMoreButton_t4z(galleryBlockElement) {
    const navContainer = galleryBlockElement.querySelector('.css-11qk0aa');
    if(!navContainer || galleryBlockElement.querySelector('.efc_moreBtn_k2c')) return;
    
    const moreBtn = document.createElement('button');
    moreBtn.className = 'efc_moreBtn_k2c';
    moreBtn.innerText = '>';
    moreBtn.setAttribute('aria-label', '가려진 탭 넘겨보기');
    
    moreBtn.addEventListener('click', function() {
      navContainer.scrollBy({ left: 120, behavior: 'smooth' });
    });
    
    navContainer.parentElement.appendChild(moreBtn);
  }
  
  
  function efc_enableWheelDragScroll_t3n(navElem) {
  if (navElem.dataset.efcScrollBound_v5k) return;
  navElem.dataset.efcScrollBound_v5k = '1';

  navElem.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      navElem.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  let isDragging = false;
  let dragStartX = 0;
  let scrollStartLeft = 0;
  let dragMoved = false;

  navElem.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragMoved = false;
    navElem.classList.add('efc_grabbing_h5s');
    dragStartX = e.pageX;
    scrollStartLeft = navElem.scrollLeft;
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    const walk = e.pageX - dragStartX;
    if (Math.abs(walk) > 5) dragMoved = true;
    navElem.scrollLeft = scrollStartLeft - walk;
  });

  window.addEventListener('mouseup', function () {
    isDragging = false;
    navElem.classList.remove('efc_grabbing_h5s');
  });

  // 드래그가 실제로 있었다면, 뒤이어 발생하는 탭 클릭(전환)은 무시
  navElem.addEventListener('click', function (e) {
    if (dragMoved) {
      e.preventDefault();
      e.stopPropagation();
      dragMoved = false;
    }
  }, true);
}


function efc_findGalleryTitleElement_p3z(galleryElement) {
  let topBlock = galleryElement;
  while (topBlock.parentElement && !topBlock.parentElement.classList.contains('notion-page-content')) {
    topBlock = topBlock.parentElement;
  }

  let titleEl = topBlock.querySelector('.css-1b3theg');
  if (titleEl) return titleEl;

  let prev = topBlock.previousElementSibling;
  let next = topBlock.nextElementSibling;
  for (let hops = 0; hops < 5 && (prev || next); hops++) {
    if (prev) {
      titleEl = prev.querySelector('.css-1b3theg');
      if (titleEl) return titleEl;
      prev = prev.previousElementSibling;
    }
    if (next) {
      titleEl = next.querySelector('.css-1b3theg');
      if (titleEl) return titleEl;
      next = next.nextElementSibling;
    }
  }
  return null;
}

function efc_findGalleryTitle_q6r(galleryElement) {
  const titleEl = efc_findGalleryTitleElement_p3z(galleryElement);
  return titleEl ? efc_normalizeString_c4f(titleEl.innerText) : "";
}


  function efc_initUniversalEngine_b2n() {
    
    const rawCallouts = document.querySelectorAll('.notion-callout-block:not(.efc_processed_j3x)');
    rawCallouts.forEach(function(callout) {
      callout.classList.add('efc_processed_j3x');
      const plainText = callout.innerText;
      
      const configRegex = /\[%\s*tab\s*::([\s\S]*?)%\]/;
      const match = plainText.match(configRegex);
      
      if (match) {
        const configParts = match[1].split('::');
        const tabKey = efc_normalizeString_c4f(configParts[0]);
        let textAlign = 'left', boxWidth = '100%', boxRadius = '';

        for (let i = 1; i < configParts.length; i++) {
            const prop = configParts[i].trim().toUpperCase();
            if (prop.startsWith('A ')) {
                const val = prop.replace('A', '').trim();
                textAlign = (val === 'L') ? 'left' : (val === 'C') ? 'center' : 'right';
            } else if (prop.startsWith('W ')) {
                const val = prop.replace('W', '').trim();
                boxWidth = (val === 'W') ? '100%' : 'fit-content';
            } else if (prop.startsWith('R ')) {
                boxRadius = prop.replace('R', '').trim() + 'px';
            }
        }

        efc_removeRegexText_r2b(callout, configRegex);
        const innerBox = callout.querySelector('.CalloutBlock-module__b-lIEa__content') || callout;
        const flexCont = callout.firstElementChild;
        
        innerBox.style.textAlign = textAlign;
        if (boxRadius) innerBox.style.borderRadius = boxRadius;
        
        callout.style.width = boxWidth;
        if (boxWidth === '100%') {
            if (flexCont) flexCont.style.width = '100%';
            innerBox.style.width = '100%';
        } else if (boxWidth === 'fit-content') {
            callout.style.margin = (textAlign === 'center') ? '0 auto' : (textAlign === 'right') ? '0 0 0 auto' : '0 auto 0 0';
        }

        if (tabKey) {
            callout.classList.add('efc_dynamicCallout_q1w');
            efc_parsedCalloutList_p7z[tabKey] = callout;
        }
      }
    });

    const galleries = document.querySelectorAll('.notion-collection_view-block');
    
    galleries.forEach(function(gallery) {
      const allTabs = gallery.querySelectorAll('div[role="menuitem"]');
      const tabRowWrapper = gallery.querySelector('.css-ey93bd');
      
      if (allTabs.length === 0 || !tabRowWrapper) return;

      const unstyledTabs = gallery.querySelectorAll('div[role="menuitem"]:not(.efc_tabItem_h2c)');
      
      if (unstyledTabs.length > 0) {
        window.efc_clickLock_m9q = false;
        
        /* 최상위 블록 자기 자신 + 형제 블록에서 제목(css-1b3theg) 탐색.
   8개 데이터베이스 전체에서 정확히 구분됨을 콘솔로 검증 완료 (2026-08-17). */
        const galleryTitleText = efc_findGalleryTitle_q6r(gallery);
        const config = window.efc_galleryConfig_v2 || { default: "scroll", exceptions: {} };
        const layoutMode = (galleryTitleText && config.exceptions[galleryTitleText]) ? config.exceptions[galleryTitleText] : config.default;
        
        gallery.classList.remove('efc_wrapMode_x3m', 'efc_moreMode_y7n');
        if (layoutMode === "wrap") gallery.classList.add("efc_wrapMode_x3m");
        else if (layoutMode === "more") {
          gallery.classList.add("efc_moreMode_y7n");
          efc_createMoreButton_t4z(gallery);
        }



const titleConfig = window.efc_titleVisibilityConfig_h8q || { default: true, exceptions: {} };
const shouldShowTitle = (galleryTitleText && Object.prototype.hasOwnProperty.call(titleConfig.exceptions, galleryTitleText))
  ? titleConfig.exceptions[galleryTitleText]
  : titleConfig.default;
const titleEl = efc_findGalleryTitleElement_p3z(gallery);
if (titleEl) titleEl.classList.toggle('efc_hideTitle_q2m', !shouldShowTitle);

const tabVisConfig = window.efc_tabVisibilityConfig_r4w || { default: true, exceptions: {} };
const shouldShowTabs = (galleryTitleText && Object.prototype.hasOwnProperty.call(tabVisConfig.exceptions, galleryTitleText))
  ? tabVisConfig.exceptions[galleryTitleText]
  : tabVisConfig.default;
tabRowWrapper.classList.toggle('efc_hideTabs_w3n', !shouldShowTabs);

        const navElem = gallery.querySelector('.css-11qk0aa');
if (navElem) {
  navElem.classList.add('efc_tabContainer_t7a');
  efc_enableWheelDragScroll_t3n(navElem);
}

        let animWrapper = gallery.querySelector('.efc_animWrapper_h4b');
        if (!animWrapper) {
           animWrapper = document.createElement('div');
           animWrapper.className = 'efc_animWrapper_h4b';
           tabRowWrapper.after(animWrapper);
        }

        allTabs.forEach(function(tab) {
  tab.classList.add('efc_tabItem_h2c');
  const textSpan = tab.querySelector('.css-152tfkv');
  if (textSpan && !tab.hasAttribute('data-orig-txt_j8k')) {
      tab.setAttribute('data-orig-txt_j8k', textSpan.innerText);
  }

  if (tab.dataset.efcBound_r3k) return;      // ← 추가
  tab.dataset.efcBound_r3k = '1';             // ← 추가

  tab.addEventListener('click', function() {
    const isAlreadyActive = tab.classList.contains('efc_activeTab_p9k') || tab.getAttribute('aria-selected') === 'true';
    if (isAlreadyActive || window.efc_clickLock_m9q) return;
    window.efc_clickLock_m9q = true;
    efc_handleTabSwitch_v8k(tab, allTabs, animWrapper);
    setTimeout(function() { window.efc_clickLock_m9q = false; }, 1500);
  });
});

        window.efc_updateTabLimits_w1v();

        let activeTabToRestore = allTabs[0];
allTabs.forEach(function(tab) {
   const btnInner = tab.querySelector('div[role="button"]');
   if (btnInner && btnInner.style.opacity === '1') {
       activeTabToRestore = tab;
   }
});

if (!gallery.dataset.efcInitialized_x7p) {
  gallery.dataset.efcInitialized_x7p = '1';
  efc_handleTabSwitch_v8k(activeTabToRestore, allTabs, animWrapper);
} else {
  // 이미 세팅된 갤러리라면, 콜아웃 애니메이션 재생 없이 활성 표시만 조용히 복구
  allTabs.forEach(function(tabNode) {
    tabNode.classList.remove('efc_activeTab_p9k');
    tabNode.setAttribute('aria-selected', tabNode === activeTabToRestore ? 'true' : 'false');
  });
  activeTabToRestore.classList.add('efc_activeTab_p9k');
}
      }
    });
  }

  let efc_updateScheduled_q8p = false;
const domObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver(function() {
  if (efc_updateScheduled_q8p) return;
  efc_updateScheduled_q8p = true;
  queueMicrotask(function() {
    efc_updateScheduled_q8p = false;
    efc_initUniversalEngine_b2n();
  });
}) : null;

if (domObserver) {
  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

  document.addEventListener("DOMContentLoaded", function() {
    efc_initUniversalEngine_b2n();
  });