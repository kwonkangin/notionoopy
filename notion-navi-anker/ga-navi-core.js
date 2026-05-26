
/* [JS 엔진 코드] - 동일하게 깃허브에 저장 */
(function() {
    // (위에서 작성한 앵커 분기 및 스크롤 추적 엔진 코드 전체를 여기에 넣으세요)
  // ga-navi.js
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
        const items = placeholderBlock.innerText.replace(/\[\$\s*nav\s*\|?/, '').replace(/\s*\$\s*\]/, '').split('|').map(i => i.trim()).filter(Boolean);
        if (items.length === 0) return;
        const navContainer = document.createElement('section'); navContainer.className = 'ga-anchor-navi-container';
        const navInner = document.createElement('div'); navInner.className = 'ga-navi-inner';
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
                navItem.href = 'javascript:void(0);'; navItem.setAttribute('data-target-block', blockId);
                TRACKING_BLOCKS.push({ menuId: blockId, element: null });
                navItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetEl = document.querySelector(`[data-block-id="${blockId}"]`);
                    if (targetEl) window.scrollTo({ top: targetEl.getBoundingClientRect().top + window.pageYOffset - (navContainer.offsetHeight || 54), behavior: 'smooth' });
                });
            } else {
                navItem.href = targetUrl; if (isBlank) { navItem.target = '_blank'; navItem.rel = 'noopener noreferrer'; }
            }
            navInner.appendChild(navItem);
        });
        navContainer.appendChild(navInner);
        const isFixed = window.getComputedStyle(navContainer).getPropertyValue('--ga-nav-position-mode').trim() === 'fixed';
        isFixed ? document.body.insertBefore(navContainer, document.body.firstChild) : (document.querySelector('.notion-page') || placeholderBlock.parentElement).insertBefore(navContainer, placeholderBlock);
        placeholderBlock.remove();
        if (TRACKING_BLOCKS.length > 0) initScrollSpy(navContainer);
    }
    function initScrollSpy(navContainer) {
        window.addEventListener('scroll', function() {
            let activeBlockId = null;
            TRACKING_BLOCKS.forEach(item => {
                if (!item.element) item.element = document.querySelector(`[data-block-id="${item.menuId}"]`);
                if (item.element) {
                    const rect = item.element.getBoundingClientRect();
                    if (rect.top <= (navContainer.offsetHeight || 54) + 40 && rect.bottom > (navContainer.offsetHeight || 54)) activeBlockId = item.menuId;
                }
            });
            if (activeBlockId) {
                navContainer.querySelectorAll('.ga-navi-item').forEach(item => {
                    if (item.getAttribute('data-target-block') === activeBlockId) {
                        item.classList.add('active');
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } else { item.classList.remove('active'); }
                });
            }
        });
    }
    setInterval(() => document.querySelectorAll('[data-block-id]').forEach(b => { if (b.innerText.includes('[$ nav')) createDynamicNav(b); }), 300);
})();
})();
