/**
 * ==========================================================
 * [Ga-Navi Core v2.6] 정밀 가로 스크롤 및 앵커 추적 엔진 JS
 * ==========================================================
 */
(function() {
    let TRACKING_BLOCKS = []; 

    function extractBlockId(str) {
        if (!str) return null;
        const cleanStr = str.trim();
        const match = cleanStr.match(/([a-f0-9]{8})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{12})$/i);
        return match ? `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`.toLowerCase() : null;
    }

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
            const isBlank = parts[1] && parts[ Part1.trim().toLowerCase().includes('blank') ];

            const blockId = extractBlockId(targetUrl);
            let navItem = document.createElement('a');
            navItem.className = `ga-navi-item ${idx === 0 && blockId ? 'active' : ''}`;
            navItem.innerHTML = `<span>${menuName}</span>`;

            if (blockId) {
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
                navItem.href = targetUrl; 
                if (isBlank) { navItem.target = '_blank'; navItem.rel = 'noopener noreferrer'; }
            }
            navInner.appendChild(navItem);
        });

        navContainer.appendChild(navInner);

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

    function initScrollSpy(navContainer) {
        const navInner = navContainer.querySelector('.ga-navi-inner');

        window.addEventListener('scroll', function() {
            let activeBlockId = null;
            const currentNavHeight = navContainer.offsetHeight || 54;

            TRACKING_BLOCKS.forEach(item => {
                if (!item.element) item.element = document.querySelector(`[data-block-id="${item.menuId}"]`);
                if (item.element) {
                    const rect = item.element.getBoundingClientRect();
                    if (rect.top <= currentNavHeight + 40 && rect.bottom > currentNavHeight) {
                        activeBlockId = item.menuId;
                    }
                }
            });

            if (activeBlockId) {
                const items = navContainer.querySelectorAll('.ga-navi-item');
                items.forEach(item => {
                    if (item.getAttribute('data-target-block') === activeBlockId) {
                        item.classList.add('active');
                        if (navInner) {
                            const containerWidth = navInner.clientWidth;
                            const itemLeft = item.offsetLeft;
                            const itemWidth = item.clientWidth;
                            const targetScrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);
                            navInner.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
                        }
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }

    setInterval(() => {
        document.querySelectorAll('[data-block-id]').forEach(b => { 
            if (b.innerText.includes('[$ nav')) createDynamicNav(b); 
        });
    }, 300);
})();
