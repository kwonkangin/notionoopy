/* 
  에픽션 반응형 네비게이션 구동 엔진 
  파일명: epiction-navi-engine.js
*/

(function efc_navEngine_q8b() {
    if (window.EFC_NAVI_ENGINE_RUNNING) return;
    window.EFC_NAVI_ENGINE_RUNNING = true;

    let efc_trackBlocks_n2m = []; 

    function efc_updateViewport_x1p() {
        const htmlRoot = document.documentElement;
        const rs = getComputedStyle(htmlRoot);
        
        const posMode = rs.getPropertyValue('--ga-nav-position-mode').trim() || 'sticky';
        htmlRoot.setAttribute('data-ga-nav-pos', posMode);

        htmlRoot.setAttribute('data-ga-nav-line-switch', rs.getPropertyValue('--ga-nav-active-line-switch').trim() || '1');
        htmlRoot.setAttribute('data-ga-nav-bg-switch', rs.getPropertyValue('--ga-nav-active-bg-switch').trim() || '0');

        htmlRoot.style.setProperty('--ga-vw-px', htmlRoot.clientWidth + 'px');
        
        let contentEl = document.querySelector('.notion-page-content') || document.querySelector('.notion-page');
        let autoW = contentEl ? getComputedStyle(contentEl).width : '1200px';
        let manualW = rs.getPropertyValue('--ga-nav-content-width').trim();
        let finalW = (manualW && manualW !== 'auto' && manualW !== '') ? manualW : autoW;
        htmlRoot.style.setProperty('--ga-final-content-width', finalW);

        let navEl = document.querySelector('.ga-anchor-navi-container');
        if (navEl) {
            if (posMode !== 'fixed') {
                navEl.style.setProperty('margin-left', '0px', 'important');
                let rect = navEl.getBoundingClientRect();
                htmlRoot.style.setProperty('--ga-nav-exact-left', `-${rect.left}px`);
                navEl.style.setProperty('margin-left', 'var(--ga-nav-exact-left)', 'important');
            } else {
                navEl.style.removeProperty('margin-left');
            }
        }
    }
    
    window.addEventListener('resize', efc_updateViewport_x1p);
    setInterval(efc_updateViewport_x1p, 800);
    efc_updateViewport_x1p();

    function efc_extractBlockId_k3z(str) {
        if (!str) return null;
        const match = str.trim().match(/([a-f0-9]{8})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{12})$/i);
        return match ? `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`.toLowerCase() : null;
    }

    function efc_createDynamicNav_v9a(placeholderBlock) {
        if (document.querySelector('.ga-anchor-navi-container')) return;

        const cleanText = placeholderBlock.innerText.replace(/\[\$\s*nav\s*\|?/, '').replace(/\s*\$\s*\]/, '');
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
            const blockId = efc_extractBlockId_k3z(targetUrl);
            
            let navItem = document.createElement('a');
            navItem.className = `ga-navi-item ${idx === 0 && blockId ? 'active' : ''}`;
            navItem.innerHTML = `<span>${menuName}</span>`;

            if (blockId) {
                navItem.href = 'javascript:void(0);'; 
                navItem.setAttribute('data-target-block', blockId);
                efc_trackBlocks_n2m.push({ menuId: blockId, element: null });

                navItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetEl = document.querySelector(`[data-block-id="${blockId}"]`);
                    if (targetEl) {
                        const offsetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - (navContainer.offsetHeight || 54);
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
        if (isFixed) { document.body.insertBefore(navContainer, document.body.firstChild); } 
        else {
            const mainPage = document.querySelector('.notion-page') || placeholderBlock.parentElement;
            if (mainPage) mainPage.insertBefore(navContainer, placeholderBlock);
        }

        document.documentElement.setAttribute('data-ga-nav-layout', window.getComputedStyle(document.documentElement).getPropertyValue('--ga-nav-layout-mode').trim() || 'limit');
        placeholderBlock.remove();
        if (efc_trackBlocks_n2m.length > 0) efc_initScrollSpy_b7m(navContainer);
    }

    function efc_initScrollSpy_b7m(navContainer) {
        const navInner = navContainer.querySelector('.ga-navi-inner');
        window.addEventListener('scroll', function() {
            let activeBlockId = null;
            const navH = navContainer.offsetHeight || 54;

            efc_trackBlocks_n2m.forEach(item => {
                if (!item.element) item.element = document.querySelector(`[data-block-id="${item.menuId}"]`);
                if (item.element) {
                    const rect = item.element.getBoundingClientRect();
                    if (rect.top <= navH + 40 && rect.bottom > navH) activeBlockId = item.menuId;
                }
            });

            if (activeBlockId) {
                navContainer.querySelectorAll('.ga-navi-item').forEach(item => {
                    if (item.getAttribute('data-target-block') === activeBlockId) {
                        item.classList.add('active');
                        if (navInner) {
                            const targetLeft = item.offsetLeft - (navInner.clientWidth / 2) + (item.clientWidth / 2);
                            navInner.scrollTo({ left: targetLeft, behavior: 'smooth' });
                        }
                    } else { item.classList.remove('active'); }
                });
            }
        });
    }

    setInterval(() => {
        document.querySelectorAll('[data-block-id]').forEach(b => { 
            if (b.innerText.includes('[$ nav')) efc_createDynamicNav_v9a(b); 
        });
    }, 300);
})();
