/**
 * ==========================================================
 * [Ga-Navi Core v2.5] 정밀 가로 스크롤 및 앵커 추적 엔진 JS
 * ==========================================================
 */
(function() {
    let TRACKING_BLOCKS = []; 

    // 노션 블록 ID 포맷 정규화 및 추출 함수
    function extractBlockId(str) {
        if (!str) return null;
        const cleanStr = str.trim();
        const match = cleanStr.match(/([a-f0-9]{8})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{12})$/i);
        return match ? `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`.toLowerCase() : null;
    }

    // [$ nav ...] 숏코드를 분석하여 실제 네비게이션 바 HTML 구조를 동적 생성하는 함수
    function createDynamicNav(placeholderBlock) {
        if (document.querySelector('.ga-anchor-navi-container')) return;

        const rawText = placeholderBlock.innerText;
        const cleanText = rawText.replace(/\[\$\s*nav\s*\|?/, '').replace(/\s*\$\s*\]/, '');
        const items = cleanText.split('|').map(i => i.trim()).filter(Boolean);
        if (items.length === 0) return;

        const navContainer = document.createElement('section'); 
        navContainer.className = 'ga-anchor-navi-container';
        
        const navInner = document.createElement('div'); 
        navInner.className = 'ga-navi-inner';

        items.forEach((item, idx) => {
            const match = item.match(/^(.*?)\(([^)]+)\)$/);
            if (!match) return;

            const menuName = match[1].trim();
            const parts = match[2].split(',');
            const targetUrl = parts[0].trim();
            const isBlank = parts[1] && parts[1].trim().toLowerCase().includes('blank');

            const blockId = extractBlockId(targetUrl);
            let navItem = document.createElement('a');
            navItem.className = `ga-navi-item ${idx === 0 && blockId ? 'active' : ''}`;
            navItem.innerHTML = `<span>${menuName}</span>`;

            if (blockId) {
                // 내부 블록 링크일 경우: 해시 클릭 이벤트 바인딩
                navItem.href = 'javascript:void(0);'; 
                navItem.setAttribute('data-target-block', blockId);
                TRACKING_BLOCKS.push({ menuId: blockId, element: null });

                navItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetEl = document.querySelector(`[data-block-id="${blockId}"]`);
                    if (targetEl) {
                        const currentNavHeight = navContainer.offsetHeight || 54;
                        const elementPosition = targetEl.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - currentNavHeight;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                });
            } else {
                // 외부 일반 아웃링크일 경우 처리
                navItem.href = targetUrl; 
                if (isBlank) { 
                    navItem.target = '_blank'; 
                    navItem.rel = 'noopener noreferrer'; 
                }
            }
            navInner.appendChild(navItem);
        });

        navContainer.appendChild(navInner);

        // CSS 대시보드 변수 배치모드(--ga-nav-position-mode) 감지 후 DOM 배치 분기
        const isFixed = window.getComputedStyle(navContainer).getPropertyValue('--ga-nav-position-mode').trim() === 'fixed';
        if (isFixed) {
            document.body.insertBefore(navContainer, document.body.firstChild);
        } else {
            const mainPage = document.querySelector('.notion-page') || placeholderBlock.parentElement;
            if (mainPage) mainPage.insertBefore(navContainer, placeholderBlock);
        }

        placeholderBlock.remove();
        if (TRACKING_BLOCKS.length > 0) initScrollSpy(navContainer);
    }

    // 🎯 [버벅임 오차 완벽 해결 버전] 실시간 스크롤 스파이 및 메뉴판 정중앙 정렬 센서
    function initScrollSpy(navContainer) {
        const navInner = navContainer.querySelector('.ga-navi-inner');

        window.addEventListener('scroll', function() {
            let activeBlockId = null;
            const currentNavHeight = navContainer.offsetHeight || 54;

            // 1. 현재 화면 상단에 걸쳐있는 활성화 블록ID 역추적
            TRACKING_BLOCKS.forEach(item => {
                if (!item.element) item.element = document.querySelector(`[data-block-id="${item.menuId}"]`);
                if (item.element) {
                    const rect = item.element.getBoundingClientRect();
                    if (rect.top <= currentNavHeight + 40 && rect.bottom > currentNavHeight) {
                        activeBlockId = item.menuId;
                    }
                }
            });

            // 2. 활성화된 블록에 매칭되는 메뉴 아이템에 불빛(active) 인입 및 가로 정렬 처리
            if (activeBlockId) {
                const items = navContainer.querySelectorAll('.ga-navi-item');
                items.forEach(item => {
                    if (item.getAttribute('data-target-block') === activeBlockId) {
                        item.classList.add('active');
                        
                        // 🚀 [원천 차단 패치] 브라우저 세로축을 뒤흔들던 scrollIntoView를 완전히 폐기하고
                        // 오직 네비바 가로 축 상자 안에서만 정중앙 좌표값을 도출하여 안전하게 미끄러뜨립니다.
                        if (navInner) {
                            const containerWidth = navInner.clientWidth;
                            const itemLeft = item.offsetLeft;
                            const itemWidth = item.clientWidth;
                            const targetScrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);
                            
                            navInner.scrollTo({
                                left: targetScrollLeft,
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }

    // 주기적으로 화면을 스캔하여 숏코드 블록 발견 즉시 구조 변환 동작 실행
    setInterval(() => {
        document.querySelectorAll('[data-block-id]').forEach(b => { 
            if (b.innerText.includes('[$ nav')) createDynamicNav(b); 
        });
    }, 300);
})();
