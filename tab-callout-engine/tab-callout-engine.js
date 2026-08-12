/* 
    글로벌 상태 잠금 변수 및 콜아웃 저장소
    efc_clickLock_m9q: 통신 중 중복 연산(프리징)을 막기 위한 논리 잠금 변수
  */
  window.efc_clickLock_m9q = false;
  const efc_parsedCalloutList_p7z = {};

  /* 양끝 공백 정규화 헬퍼 함수 */
  function efc_normalizeString_c4f(rawString) {
    return rawString ? rawString.trim() : "";
  }

  /* 기호 구문 시각적 삭제 헬퍼 함수 */
  function efc_removeRegexText_r2b(targetDomElement, regexPattern) {
    const textWalker = document.createTreeWalker(targetDomElement, NodeFilter.SHOW_TEXT, null, false);
    let currentNode;
    while (currentNode = textWalker.nextNode()) {
      if (regexPattern.test(currentNode.nodeValue)) {
        currentNode.nodeValue = currentNode.nodeValue.replace(regexPattern, '');
      }
    }
  }

  /* 탭 텍스트 글자 수 제한 동적 제어 함수 */
  window.efc_updateTabLimits_w1v = function() {
    const rootStyles = getComputedStyle(document.documentElement);
    const isLimitEnabled = rootStyles.getPropertyValue('--textLimitToggle_b4v').trim() === 'true';
    const maxLength = parseInt(rootStyles.getPropertyValue('--textLimitLength_c5x').trim()) || 10;

    const allTabItems = document.querySelectorAll('.efc_tabItem_h2c');
    allTabItems.forEach(function(tabNode) {
      const textSpan = tabNode.querySelector('.css-ymcnjv');
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

  /* 
    핵심 로직: 탭 클릭 시 팽창 애니메이션 실행 및 콜아웃 교체 
  */
  function efc_handleTabSwitch_v8k(selectedTab, allTabsList, animWrapper) {
    /* 1. 모든 탭 비활성화 및 대상 탭 활성화 */
    allTabsList.forEach(function(tabNode) {
      tabNode.classList.remove('efc_activeTab_p9k');
      tabNode.setAttribute('aria-selected', 'false');
    });
    
    selectedTab.classList.add('efc_activeTab_p9k');
    selectedTab.setAttribute('aria-selected', 'true');

    /* 화면에 잘린 글자가 아닌 돔 속성의 원본 문자열을 참조 */
    const rawTabLabel = selectedTab.getAttribute('data-orig-txt_j8k');
    const normalizedTabLabel = efc_normalizeString_c4f(rawTabLabel);

    /* 현재 래퍼 내부에 있는 이전 텍스트 요소 페이드 아웃 */
    const currentTextNodes = animWrapper.querySelectorAll('.efc_textFade_z9m');
    currentTextNodes.forEach(node => node.classList.remove('efc_textActive_v2x'));

    const calloutDom = efc_parsedCalloutList_p7z[normalizedTabLabel];

    if (!calloutDom) {
      /* 대상 콜아웃이 없는 경우 래퍼 높이를 0으로 수축하여 갤러리 끌어올림 */
      animWrapper.style.maxHeight = '0px';
      
      /* 래퍼 비우기 (자연스러운 축소를 위해 0.4초 딜레이 후 DOM 제거) */
      setTimeout(function() {
         animWrapper.innerHTML = '';
      }, 400); 
    } else {
      /* 새로운 콜아웃을 래퍼 내부로 복제 배치 (기존 DOM 구조 보호) */
      animWrapper.innerHTML = '';
      const clonedCallout = calloutDom.cloneNode(true);
      clonedCallout.classList.add('efc_activeCallout_m5y');
      
      /* 텍스트 내용물에 페이드 클래스 부여 */
      const contentBox = clonedCallout.querySelector('.CalloutBlock_content__AigMk') || clonedCallout;
      contentBox.classList.add('efc_textFade_z9m');
      
      animWrapper.appendChild(clonedCallout);

      /* 요소가 화면에 렌더링된 직후 정확한 높이를 연산하여 팽창 애니메이션 트리거 */
      requestAnimationFrame(function() {
        const requiredHeight = clonedCallout.scrollHeight + 30; // 상하 여백 여유분 포함
        animWrapper.style.maxHeight = requiredHeight + 'px';
        
        /* 팽창이 시작된 직후 텍스트 페이드인 가동 */
        setTimeout(function() {
          const insertedText = animWrapper.querySelector('.efc_textFade_z9m');
          if (insertedText) insertedText.classList.add('efc_textActive_v2x');
        }, 50);
      });
    }
  }

  /* 더보기 단추 동적 생성기 */
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

  /* 엔진 메인 실행 함수 (DOM 변화 감지기 대응) */
  function efc_initUniversalEngine_b2n() {
    
    /* 1. 콜아웃 기호 파싱 및 글로벌 저장소 보관 */
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

        /* 추가 속성(정렬, 너비, 곡률) 처리 */
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
        const innerBox = callout.querySelector('.CalloutBlock_content__AigMk') || callout;
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

    /* 2. 갤러리 탐색 및 '이름' 기반 레이아웃 제어 */
    const galleries = document.querySelectorAll('.notion-collection_view-block');
    
    galleries.forEach(function(gallery) {
      const allTabs = gallery.querySelectorAll('div[role="menuitem"]');
      const tabRowWrapper = gallery.querySelector('.css-1x5f8m8');
      
      if (allTabs.length === 0 || !tabRowWrapper) return;

      /* 통제권을 벗어난 새 탭(비동기 렌더링)이 발견되었는지 검증 */
      const unstyledTabs = gallery.querySelectorAll('div[role="menuitem"]:not(.efc_tabItem_h2c)');
      
      if (unstyledTabs.length > 0) {
        /* 통신 성공: 이중 클릭 방지용 잠금 장치 해제 */
        window.efc_clickLock_m9q = false;
        
        /* 갤러리 이름(데이터베이스 명) 기반 배열 방식 확인 및 적용 */
        const titleSpan = gallery.querySelector('.css-11vqqno span');
        const galleryTitleText = titleSpan ? titleSpan.innerText.trim() : "";
        const config = window.efc_galleryConfig_v2 || { default: "scroll", exceptions: {} };
        const layoutMode = (galleryTitleText && config.exceptions[galleryTitleText]) ? config.exceptions[galleryTitleText] : config.default;
        
        gallery.classList.remove('efc_wrapMode_x3m', 'efc_moreMode_y7n');
        if (layoutMode === "wrap") gallery.classList.add("efc_wrapMode_x3m");
        else if (layoutMode === "more") {
          gallery.classList.add("efc_moreMode_y7n");
          efc_createMoreButton_t4z(gallery);
        }

        const navElem = gallery.querySelector('.css-11qk0aa');
        if (navElem) navElem.classList.add('efc_tabContainer_t7a');

        /* 팽창 애니메이션 래퍼 셋업 (없으면 생성하여 탭 컨테이너 바로 아래 삽입) */
        let animWrapper = gallery.querySelector('.efc_animWrapper_h4b');
        if (!animWrapper) {
           animWrapper = document.createElement('div');
           animWrapper.className = 'efc_animWrapper_h4b';
           tabRowWrapper.after(animWrapper);
        }

        /* 각 탭에 커스텀 클래스 부여 및 이벤트 리스너 연결 */
        allTabs.forEach(function(tab) {
          tab.classList.add('efc_tabItem_h2c');
          const textSpan = tab.querySelector('.css-ymcnjv');
          if (textSpan && !tab.hasAttribute('data-orig-txt_j8k')) {
              tab.setAttribute('data-orig-txt_j8k', textSpan.innerText);
          }

          /* 탭 클릭 이벤트 - 중복 클릭(프리징 방지) 및 잠금 논리 엄격 적용 */
          tab.addEventListener('click', function() {
            const isAlreadyActive = tab.classList.contains('efc_activeTab_p9k') || tab.getAttribute('aria-selected') === 'true';
            if (isAlreadyActive || window.efc_clickLock_m9q) return;

            window.efc_clickLock_m9q = true; // 비동기 로딩 통신 잠금 활성화
            
            /* 즉시 팽창 애니메이션 및 내용 교체 실행 */
            efc_handleTabSwitch_v8k(tab, allTabs, animWrapper);

            /* 안전 장치: 우피 서버 지연 시 1.5초 후 강제 잠금 해제하여 무한 프리징 방지 */
            setTimeout(function() {
                window.efc_clickLock_m9q = false;
            }, 1500);
          });
        });

        /* 설정된 글자수 제한 다시 복원 */
        window.efc_updateTabLimits_w1v();

        /* 비동기 렌더링 시점 복원: 현재 활성화된 탭을 찾아내어 콜아웃 연결 복구 */
        let activeTabToRestore = allTabs[0];
        allTabs.forEach(function(tab) {
           const btnInner = tab.querySelector('div[role="button"]');
           if (btnInner && btnInner.style.opacity === '1') {
               activeTabToRestore = tab;
           }
        });
        
        efc_handleTabSwitch_v8k(activeTabToRestore, allTabs, animWrapper);
      }
    });
  }

  /* 비동기 DOM 변화(우피 통신) 감지 옵저버 연결 */
  const domObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver(function() {
    efc_initUniversalEngine_b2n();
  }) : null;

  if (domObserver) {
    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", function() {
    efc_initUniversalEngine_b2n();
  });