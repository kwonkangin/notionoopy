/**
 * ======================================================================
 * [Notion Overlay Gallery Master - JS Core Engine]
 * 작성일: 2026-06-12
 * 기능: 키워드 타겟팅 스캔, CSS 속성 동기화, UI 트리거 숨김 처리
 * ======================================================================
 */
(function() {
    'use strict';
    
    function syncGallerySettings() {
        // 1. CSS 서식 변수 스위치 동기화
        const rootStyles = getComputedStyle(document.documentElement);
        const switches = ['title', 'prop1', 'prop2', 'prop3'];
        
        switches.forEach(key => {
            const isUsed = rootStyles.getPropertyValue(`--ga-use-${key}`).trim() || "0";
            document.documentElement.setAttribute(`data-ga-use-${key}`, isUsed);
        });

        // 2. 갤러리 타겟팅 및 방어막 주입
        if (!window.GA_GALLERY_TARGETS) return;
        
        // 아직 처리되지 않은 갤러리 블록들을 탐색
        const blocks = document.querySelectorAll('.notion-collection_view-block:not(.ga-processed)');
        
        blocks.forEach(block => {
            // 갤러리의 제목 텍스트와 탭 텍스트 추출
            const titleEl = block.querySelector(".css-zdxi3n");
            const titleText = titleEl ? titleEl.textContent : "";
            
            const tabEls = block.querySelectorAll(".css-ymcnjv");
            const tabText = Array.from(tabEls).map(el => el.textContent).join(" ");
            
            let isMatched = false;
            let hideTitle = false;
            let hideTabs = false;

            // 설정된 키워드와 일치하는지 검사
            for (let target of window.GA_GALLERY_TARGETS) {
                if (titleText.includes(target.keyword) || tabText.includes(target.keyword)) {
                    isMatched = true;
                    if (target.hideTitle) hideTitle = true;
                    if (target.hideTabs) hideTabs = true;
                    break;
                }
            }

            // 일치할 경우 모드 클래스 부여
            if (isMatched) {
                block.classList.add('ga-overlay-mode'); // 오버레이 디자인 활성화
                block.classList.add('ga-processed');    // 중복 처리 방지용 플래그
                
                if (hideTitle) block.classList.add('ga-hide-title'); // 제목 숨김
                if (hideTabs) block.classList.add('ga-hide-tabs');   // 탭 숨김
            } else if (block.querySelector('.notion-gallery-view')) {
                // 타겟이 아닌 일반 갤러리는 무시 처리
                block.classList.add('ga-processed');
            }
        });
    }
    
    // 우피의 비동기 렌더링 환경에 맞춰 주기적으로 실행
    setInterval(syncGallerySettings, 500);
})();